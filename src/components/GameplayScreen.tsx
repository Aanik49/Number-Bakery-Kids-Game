import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  Flame,
  Music,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BakeryItemId, StackLayer } from '../types/game';
import { WORLD_BY_ID } from '../data/bakeryWorlds';
import {
  BakeryTreatSVG,
  CUSTOMER_NAMES,
  CustomerAvatarSVG,
} from './BakeryArtwork';
import { soundEngine } from '../utils/soundEngine';

interface GameplayScreenProps {
  worldId: BakeryItemId;
  levelNumber: number;
  coins: number;
  mathHelperEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  onToggleMathHelper: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  onExitToWorldMap: () => void;
  onLevelComplete: (stars: number, coinsEarned: number) => void;
}

interface FloatingFx {
  id: number;
  text: string;
  color: string;
}

export const GameplayScreen: React.FC<GameplayScreenProps> = ({
  worldId,
  levelNumber,
  coins,
  mathHelperEnabled,
  musicEnabled,
  sfxEnabled,
  onToggleMathHelper,
  onToggleMusic,
  onToggleSfx,
  onExitToWorldMap,
  onLevelComplete,
}) => {
  const world = WORLD_BY_ID[worldId];
  const level = world.levels[levelNumber - 1];
  const theme = world.theme;

  const [orderIdx, setOrderIdx] = useState(0);
  const currentOrder = level.orders[orderIdx];
  const isDualMode = currentOrder.requirements.length > 1;

  // Stack per BakeryItemId in the current order
  const [stacks, setStacks] = useState<Record<string, StackLayer[]>>({});
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);
  const [timerPct, setTimerPct] = useState(100);
  const [speechLine, setSpeechLine] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [wobbleTick, setWobbleTick] = useState(0);
  const [floatingFx, setFloatingFx] = useState<FloatingFx[]>([]);
  const [earnedThisLevel, setEarnedThisLevel] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const earnedRef = useRef(0);
  const mistakesRef = useRef(0);

  // Reset stacks whenever order changes
  useEffect(() => {
    const initStacks: Record<string, StackLayer[]> = {};
    currentOrder.requirements.forEach((req) => {
      initStacks[req.itemId] = [];
    });
    setStacks(initStacks);
    setActiveSlotIdx(0);
    setTimerPct(100);
    setIsTransitioning(false);
    setSpeechLine(currentOrder.hint);
  }, [currentOrder]);

  // Gentle Oven Timer (awards speed bonus tips without harsh game-over failure)
  useEffect(() => {
    if (isTransitioning) return;
    const stepMs = 200;
    const decrement = (100 / level.timerSeconds) * (stepMs / 1000);
    const id = window.setInterval(() => {
      setTimerPct((prev) => {
        const next = prev - decrement;
        if (next <= 5) {
          return 5;
        }
        return next;
      });
    }, stepMs);
    return () => window.clearInterval(id);
  }, [level.timerSeconds, orderIdx, isTransitioning]);

  const activeReq = currentOrder.requirements[activeSlotIdx] || currentOrder.requirements[0];
  const activeItemId = activeReq.itemId;
  const activeWorldMeta = WORLD_BY_ID[activeItemId];

  const slotTotals = useMemo(() => {
    return currentOrder.requirements.map((req) => {
      const list = stacks[req.itemId] || [];
      return list.reduce((sum, layer) => sum + layer.count, 0);
    });
  }, [currentOrder.requirements, stacks]);

  const allExact = currentOrder.requirements.every(
    (req, idx) => slotTotals[idx] === req.target
  );

  const combinedCurrent = slotTotals.reduce((a, b) => a + b, 0);
  const combinedTarget = currentOrder.requirements.reduce((a, r) => a + r.target, 0);

  const spawnFx = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random();
    setFloatingFx((prev) => [...prev, { id, text, color }]);
    window.setTimeout(() => {
      setFloatingFx((prev) => prev.filter((item) => item.id !== id));
    }, 950);
  }, []);

  const handleAddTray = useCallback(
    (amount: 2 | 5 | 10) => {
      if (isTransitioning) return;
      const currentTotal = slotTotals[activeSlotIdx] || 0;
      if (currentTotal + amount > 75) {
        soundEngine.playWobble();
        spawnFx('Tray Full!', '#E11D48');
        setWobbleTick((t) => t + 1);
        return;
      }

      const newLayer: StackLayer = {
        id: `${Date.now()}-${Math.random()}`,
        count: amount,
        sourceTray: amount,
      };

      const nextTotal = currentTotal + amount;
      setStacks((prev) => ({
        ...prev,
        [activeItemId]: [...(prev[activeItemId] || []), newLayer],
      }));

      soundEngine.playTrayPop(nextTotal / activeReq.target);
      spawnFx(`+${amount}`, theme.accentHex);

      if (nextTotal === activeReq.target) {
        // If dual mode and the other slot isn't done yet, smoothly auto-focus the other slot!
        if (isDualMode) {
          const otherIdx = activeSlotIdx === 0 ? 1 : 0;
          const otherReq = currentOrder.requirements[otherIdx];
          if (slotTotals[otherIdx] !== otherReq.target) {
            setSpeechLine(
              `Exact ${activeWorldMeta.pluralName}! Now bake ${otherReq.target} ${WORLD_BY_ID[otherReq.itemId].pluralName}!`
            );
            window.setTimeout(() => setActiveSlotIdx(otherIdx), 260);
          } else {
            setSpeechLine('Both trays match! Tap SERVE ORDER!');
          }
        } else {
          setSpeechLine('Exact match! Ring the bell to SERVE!');
        }
      } else if (nextTotal > activeReq.target) {
        const diff = nextTotal - activeReq.target;
        setSpeechLine(
          level.allowSubtractTools
            ? `${diff} too many! Use Undo or Scoop -1 / Nibble -3!`
            : `${diff} too many! Tap Undo to try again!`
        );
        setWobbleTick((t) => t + 1);
      } else {
        setSpeechLine(currentOrder.hint);
      }
    },
    [
      isTransitioning,
      slotTotals,
      activeSlotIdx,
      activeItemId,
      activeReq.target,
      activeWorldMeta.pluralName,
      isDualMode,
      currentOrder,
      level.allowSubtractTools,
      theme.accentHex,
      spawnFx,
    ]
  );

  const handleUndo = useCallback(() => {
    if (isTransitioning) return;
    const list = stacks[activeItemId] || [];
    if (list.length === 0) return;
    const removed = list[list.length - 1];
    setStacks((prev) => ({
      ...prev,
      [activeItemId]: list.slice(0, -1),
    }));
    soundEngine.playSubtract();
    spawnFx(`-${removed.count}`, '#64748B');
  }, [isTransitioning, stacks, activeItemId, spawnFx]);

  const handleSubtract = useCallback(
    (amount: 1 | 3) => {
      if (isTransitioning) return;
      const list = stacks[activeItemId] || [];
      const currentTotal = slotTotals[activeSlotIdx] || 0;
      if (currentTotal < amount) return;

      const cloned = list.map((l) => ({ ...l }));
      let rem: number = amount;
      while (rem > 0 && cloned.length > 0) {
        const top = cloned[cloned.length - 1];
        if (top.count > rem) {
          top.count -= rem;
          rem = 0;
        } else {
          rem -= top.count;
          cloned.pop();
        }
      }

      const nextTotal = currentTotal - amount;
      setStacks((prev) => ({
        ...prev,
        [activeItemId]: cloned,
      }));
      soundEngine.playSubtract();
      spawnFx(amount === 1 ? '🥄 -1' : '🐭 -3', '#E11D48');

      if (nextTotal === activeReq.target) {
        if (isDualMode) {
          const otherIdx = activeSlotIdx === 0 ? 1 : 0;
          if (slotTotals[otherIdx] !== currentOrder.requirements[otherIdx].target) {
            setSpeechLine('Nice fix! Now match the other treat!');
            window.setTimeout(() => setActiveSlotIdx(otherIdx), 260);
          } else {
            setSpeechLine('Perfect fix! Tap SERVE ORDER!');
          }
        } else {
          setSpeechLine('Perfect fix! Ready to serve!');
        }
      }
    },
    [
      isTransitioning,
      stacks,
      activeItemId,
      slotTotals,
      activeSlotIdx,
      activeReq.target,
      isDualMode,
      currentOrder.requirements,
      spawnFx,
    ]
  );

  const handleServe = useCallback(() => {
    if (isTransitioning) return;

    if (!allExact) {
      soundEngine.playWobble();
      setWobbleTick((t) => t + 1);
      mistakesRef.current += 1;
      setMistakes(mistakesRef.current);

      // Give clear, encouraging feedback pointing to the mismatched item
      const badIdx = currentOrder.requirements.findIndex(
        (req, idx) => slotTotals[idx] !== req.target
      );
      if (badIdx !== -1) {
        setActiveSlotIdx(badIdx);
        const req = currentOrder.requirements[badIdx];
        const curr = slotTotals[badIdx];
        const itemLabel = WORLD_BY_ID[req.itemId].pluralName;
        if (curr < req.target) {
          setSpeechLine(`Still need ${req.target - curr} more ${itemLabel}!`);
        } else {
          setSpeechLine(`${curr - req.target} extra ${itemLabel}! Scoop or Undo!`);
        }
      }
      return;
    }

    // EXACT MATCH!
    setIsTransitioning(true);
    soundEngine.playServeSuccess();

    const speedBonus = timerPct > 55 ? 5 : timerPct > 25 ? 3 : 1;
    const orderCoins = Math.round(level.baseRewardCoins / level.orders.length) + speedBonus;
    earnedRef.current += orderCoins;
    setEarnedThisLevel(earnedRef.current);

    setSpeechLine(`YUM! Exact match! +${orderCoins} Tip Coins!`);
    spawnFx(`⭐ +${orderCoins} Coins!`, '#D97706');

    window.setTimeout(() => {
      soundEngine.playCoin();
    }, 220);

    window.setTimeout(() => {
      if (orderIdx + 1 < level.orders.length) {
        setOrderIdx((i) => i + 1);
      } else {
        const stars =
          mistakesRef.current === 0 ? 3 : mistakesRef.current <= 2 ? 2 : 1;
        onLevelComplete(stars, earnedRef.current);
      }
    }, 1050);
  }, [
    isTransitioning,
    allExact,
    currentOrder.requirements,
    slotTotals,
    timerPct,
    level.baseRewardCoins,
    level.orders.length,
    orderIdx,
    onLevelComplete,
    spawnFx,
  ]);

  // Keyboard shortcuts for desktop/Chromebook kids
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '1') handleAddTray(2);
      else if (e.key === '2') handleAddTray(5);
      else if (e.key === '3') handleAddTray(10);
      else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') handleUndo();
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleServe();
      } else if (e.key === 'Tab' && isDualMode) {
        e.preventDefault();
        setActiveSlotIdx((i) => (i === 0 ? 1 : 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleAddTray, handleUndo, handleServe, isDualMode]);

  const speedTip = timerPct > 55 ? '+5 Tip' : timerPct > 25 ? '+3 Tip' : '+1 Tip';
  const activeTotal = slotTotals[activeSlotIdx] || 0;
  const activeStack = stacks[activeItemId] || [];

  return (
    <div
      className={`w-full h-full flex flex-col overflow-hidden ${theme.patternClass}`}
      style={{ background: theme.pageBg, color: theme.textColor }}
    >
      {/* Distinct World Awning */}
      <div
        className="h-3.5 w-full shrink-0 border-b-2 border-white/80"
        style={{
          background: `repeating-linear-gradient(90deg, ${theme.awningA} 0px, ${theme.awningA} 22px, ${theme.awningB} 22px, ${theme.awningB} 44px)`,
        }}
      />

      {/* Top Gameplay HUD (Compact <= 10% height) */}
      <header className="px-3 sm:px-5 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onExitToWorldMap();
            }}
            aria-label="Back to World Map"
            className="sticker-btn h-10 px-3 rounded-2xl bg-white text-slate-800 font-display font-bold text-xs sm:text-sm flex items-center gap-1 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Levels</span>
          </button>

          <div className="min-w-0">
            <div className="font-display font-bold text-sm sm:text-base leading-tight truncate">
              {world.worldTitle} · Lvl {levelNumber}
            </div>
            <div className="text-[11px] font-bold opacity-80 tabular-nums">
              Order {orderIdx + 1} of {level.orders.length} · {world.difficultyLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <div className="paper-card bg-amber-400 text-slate-900 rounded-xl px-2.5 h-9 flex items-center gap-1 font-display font-bold text-xs sm:text-sm tabular-nums">
            <span aria-hidden="true">🪙</span>
            <span>{coins + earnedThisLevel}</span>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onToggleMathHelper();
            }}
            title="Toggle Live Math Helper"
            className={`sticker-btn h-9 px-2.5 rounded-xl font-display font-bold text-xs flex items-center gap-1 ${
              mathHelperEnabled
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            <span>123</span>
            <span className="hidden sm:inline">{mathHelperEnabled ? 'ON' : 'OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleMusic}
            aria-label="Toggle Music"
            className={`sticker-btn w-9 h-9 rounded-xl flex items-center justify-center ${
              musicEnabled ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Music className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onToggleSfx}
            aria-label="Toggle SFX"
            className={`sticker-btn w-9 h-9 rounded-xl flex items-center justify-center ${
              sfxEnabled ? 'bg-white text-slate-800' : 'bg-slate-200 text-slate-500'
            }`}
          >
            {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Oven Timer Bar */}
      <div className="px-3 sm:px-6 pb-2 max-w-5xl w-full mx-auto shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold flex items-center gap-1 shrink-0">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{world.ovenName}</span>
          </span>
          <div className="flex-1 h-3.5 bg-white/80 rounded-full border-2 border-white shadow-inner overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${timerPct}%`,
                background:
                  timerPct > 55
                    ? '#10B981'
                    : timerPct > 25
                    ? '#F59E0B'
                    : '#F43F5E',
              }}
            />
          </div>
          <span className="text-xs font-display font-bold tabular-nums shrink-0">
            {speedTip}
          </span>
        </div>
      </div>

      {/* Main Responsive Playfield: Vertical on Phones, Balanced 2-Column Craft Table on Tablets/Desktop */}
      <div className="flex-1 min-h-0 w-full max-w-5xl mx-auto px-3 sm:px-6 pb-3 flex flex-col lg:grid lg:grid-cols-12 lg:gap-5 overflow-hidden">
        {/* LEFT / TOP: Customer Order Ticket + Visual Stacking Prep Counter */}
        <div className="flex-1 lg:col-span-7 flex flex-col gap-2.5 min-h-0">
          {/* Customer Order Card */}
          <div
            className={`rounded-3xl p-3 sm:p-4 shrink-0 ${
              theme.isDarkTheme ? 'paper-card-dark' : 'paper-card'
            }`}
            style={{ backgroundColor: theme.panelBg }}
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center shrink-0">
                <CustomerAvatarSVG index={currentOrder.customerIndex} size={58} />
                <span className="mt-1 text-[10px] font-extrabold opacity-75 whitespace-nowrap">
                  {CUSTOMER_NAMES[currentOrder.customerIndex % CUSTOMER_NAMES.length]}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                {/* Order Target Requirements (1 Item in Cookie World, 2 Items in Worlds 2-6!) */}
                <div className="flex flex-wrap items-center gap-2">
                  {currentOrder.requirements.map((req, idx) => {
                    const meta = WORLD_BY_ID[req.itemId];
                    const done = slotTotals[idx] === req.target;
                    const over = slotTotals[idx] > req.target;
                    const isFocused = idx === activeSlotIdx;

                    return (
                      <button
                        key={req.itemId}
                        type="button"
                        onClick={() => {
                          if (isDualMode) {
                            soundEngine.playClick();
                            setActiveSlotIdx(idx);
                          }
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition cursor-pointer ${
                          done
                            ? 'bg-emerald-500/15 border-emerald-400'
                            : over
                            ? 'bg-rose-500/15 border-rose-400'
                            : isFocused && isDualMode
                            ? 'bg-cyan-500/15 border-cyan-400 shadow-sm'
                            : 'bg-black/5 border-transparent'
                        }`}
                      >
                        <BakeryTreatSVG itemId={req.itemId} size={34} />
                        <div className="text-left leading-tight">
                          <div className="font-display font-bold text-lg sm:text-2xl tabular-nums flex items-center gap-1">
                            <span>{req.expression ? req.expression : req.target}</span>
                            {done && <Check className="w-5 h-5 text-emerald-500" />}
                          </div>
                          <div className="text-[11px] font-bold opacity-80">
                            {meta.pluralName}
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  {/* Combined Sum Equation Readout for 2-Item Worlds */}
                  {isDualMode && mathHelperEnabled && (
                    <div className="ml-auto text-right">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
                        Total Box
                      </div>
                      <div className="font-display font-bold text-lg tabular-nums">
                        {combinedCurrent} / {combinedTarget}
                      </div>
                    </div>
                  )}
                </div>

                {/* Friendly Speech Feedback */}
                <p
                  className="mt-1.5 text-xs sm:text-sm font-bold truncate"
                  style={{
                    color: allExact
                      ? '#10B981'
                      : theme.isDarkTheme
                      ? '#FDE047'
                      : theme.accentDarkHex,
                  }}
                >
                  “{speechLine}”
                </p>
              </div>
            </div>
          </div>

          {/* Prep Counter & Visual Stacked Layers */}
          <div
            className="flex-1 min-h-0 rounded-3xl border-[3px] border-white shadow-inner p-3 flex flex-col justify-between relative overflow-hidden"
            style={{ background: theme.counterBg }}
          >
            {/* Dual-Item Switcher Tabs (Worlds 2..6) + Live Counter */}
            <div className="flex items-center justify-between gap-2 z-10">
              {isDualMode ? (
                <div className="flex items-center gap-1.5 bg-white/80 p-1 rounded-2xl border-2 border-white shadow-sm">
                  {currentOrder.requirements.map((req, idx) => {
                    const meta = WORLD_BY_ID[req.itemId];
                    const selected = idx === activeSlotIdx;
                    const done = slotTotals[idx] === req.target;
                    return (
                      <button
                        key={req.itemId}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setActiveSlotIdx(idx);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
                          selected
                            ? 'text-white shadow-sm'
                            : 'text-slate-700 hover:bg-white/70'
                        }`}
                        style={
                          selected
                            ? { backgroundColor: theme.accentHex }
                            : undefined
                        }
                      >
                        <BakeryTreatSVG itemId={req.itemId} size={22} />
                        <span>{meta.name}</span>
                        {mathHelperEnabled && (
                          <span className="tabular-nums opacity-95">
                            ({slotTotals[idx]}/{req.expression ? '?' : req.target})
                          </span>
                        )}
                        {done && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-xs font-extrabold uppercase tracking-wider opacity-80">
                  Serving Plate
                </div>
              )}

              {mathHelperEnabled && (
                <div
                  className={`px-3.5 py-1 rounded-2xl border-2 border-white font-display font-bold text-base sm:text-lg tabular-nums shadow-sm transition-transform ${
                    activeTotal === activeReq.target
                      ? 'bg-emerald-500 text-white scale-105'
                      : activeTotal > activeReq.target
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-slate-900'
                  }`}
                >
                  {activeTotal} / {activeReq.expression ? '?' : activeReq.target}
                </div>
              )}
            </div>

            {/* Floating Score FX Layer */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
              {floatingFx.map((fx) => (
                <div
                  key={fx.id}
                  className="animate-score-float font-display font-bold text-2xl px-3.5 py-1 rounded-2xl bg-white border-2 border-white shadow-lg"
                  style={{ color: fx.color }}
                >
                  {fx.text}
                </div>
              ))}
            </div>

            {/* Visual Treat Stack Area */}
            <div className="flex-1 min-h-0 flex items-end justify-between gap-2 my-1">
              {/* Undo Button */}
              <button
                type="button"
                disabled={activeStack.length === 0 || isTransitioning}
                onClick={handleUndo}
                className="sticker-btn w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white text-slate-800 flex flex-col items-center justify-center shrink-0"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-[11px] font-extrabold mt-0.5">Undo</span>
              </button>

              {/* Center Stacked Layers on Ceramic Paper-Craft Plate */}
              <div
                key={wobbleTick}
                className={`flex-1 h-full flex flex-col items-center justify-end min-w-0 ${
                  wobbleTick > 0 ? 'animate-toy-wobble' : ''
                }`}
              >
                <div className="w-full max-w-[260px] flex flex-col-reverse items-center gap-1.5 overflow-y-auto no-scrollbar max-h-full py-1">
                  {activeStack.length === 0 ? (
                    <div className="text-xs font-extrabold text-slate-600 bg-white/85 border-2 border-dashed border-slate-300 rounded-2xl px-4 py-2 text-center">
                      Tap +2, +5, or +10 {activeWorldMeta.name} trays!
                    </div>
                  ) : (
                    activeStack.map((layer, idx) => (
                      <div
                        key={layer.id}
                        className={`w-full bg-white/95 border-2 border-white rounded-2xl px-2.5 py-1.5 shadow-sm flex items-center justify-between gap-2 ${
                          idx === activeStack.length - 1 ? 'animate-paper-drop' : ''
                        }`}
                      >
                        <span
                          className="font-display font-bold text-xs text-white rounded-lg px-2 py-0.5 tabular-nums shrink-0"
                          style={{ backgroundColor: theme.accentHex }}
                        >
                          {layer.count}
                        </span>
                        <div className="flex flex-wrap items-center justify-center gap-0.5 flex-1">
                          {Array.from({ length: Math.min(layer.count, 10) }).map((_, i) => (
                            <BakeryTreatSVG
                              key={i}
                              itemId={activeItemId}
                              size={layer.count > 5 ? 18 : 22}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Serving Plate Base */}
                <div className="w-48 sm:w-60 h-4 mt-1 bg-white rounded-[50%] shadow-md border-2 border-slate-200 shrink-0" />
              </div>

              {/* Subtraction Tools (-1 Scoop & -3 Nibble) */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  disabled={!level.allowSubtractTools || activeTotal < 1 || isTransitioning}
                  onClick={() => handleSubtract(1)}
                  title="Scoop: Take away 1"
                  className="sticker-btn w-14 h-13 sm:w-16 sm:h-14 rounded-2xl bg-rose-50 text-rose-700 flex flex-col items-center justify-center"
                >
                  <span className="font-display font-bold text-base leading-none">-1</span>
                  <span className="text-[10px] font-extrabold">Scoop</span>
                </button>
                <button
                  type="button"
                  disabled={!level.allowSubtractTools || activeTotal < 3 || isTransitioning}
                  onClick={() => handleSubtract(3)}
                  title="Nibble: Take away 3"
                  className="sticker-btn w-14 h-13 sm:w-16 sm:h-14 rounded-2xl bg-rose-50 text-rose-700 flex flex-col items-center justify-center"
                >
                  <span className="font-display font-bold text-base leading-none">-3</span>
                  <span className="text-[10px] font-extrabold">Nibble</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT / BOTTOM: Tactile Tray Dock (+2, +5, +10) & Giant Serve Bell CTA */}
        <div
          className={`mt-2.5 lg:mt-0 lg:col-span-5 rounded-3xl p-3 sm:p-4 flex flex-col justify-between shrink-0 ${
            theme.isDarkTheme ? 'paper-card-dark' : 'paper-card'
          }`}
          style={{ backgroundColor: theme.panelBg }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold text-sm sm:text-base flex items-center gap-1.5">
                <BakeryTreatSVG itemId={activeItemId} size={24} />
                <span>Add {activeWorldMeta.pluralName}</span>
              </span>
              {mistakes > 0 && (
                <span className="text-xs font-bold opacity-70 tabular-nums">
                  Checks: {mistakes}
                </span>
              )}
            </div>

            {/* 3 Tactile Trays (+2, +5, +10) */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2.5">
              {([2, 5, 10] as const).map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={isTransitioning}
                  onClick={() => handleAddTray(amount)}
                  className="sticker-btn rounded-2xl p-2 sm:p-3 flex flex-col lg:flex-row items-center justify-between gap-1.5 min-h-[84px] lg:min-h-[76px]"
                  style={{
                    background: `linear-gradient(180deg, ${theme.trayTop} 0%, ${theme.trayBottom} 100%)`,
                  }}
                >
                  {/* Visual Subitizing Pattern (2, Dice-5, Ten-Frame 10) */}
                  <div className="flex items-center justify-center flex-1">
                    {amount === 2 && (
                      <div className="flex items-center gap-1.5">
                        <BakeryTreatSVG itemId={activeItemId} size={24} />
                        <BakeryTreatSVG itemId={activeItemId} size={24} />
                      </div>
                    )}
                    {amount === 5 && (
                      <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-[68px]">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <BakeryTreatSVG key={n} itemId={activeItemId} size={18} />
                        ))}
                      </div>
                    )}
                    {amount === 10 && (
                      <div className="grid grid-cols-5 gap-0.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <BakeryTreatSVG key={n} itemId={activeItemId} size={14} />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="font-display font-bold text-xl sm:text-2xl text-slate-900 bg-white/95 rounded-xl px-3 py-0.5 shadow-sm tabular-nums">
                    +{amount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary SERVE Button */}
          <button
            type="button"
            disabled={isTransitioning}
            onClick={handleServe}
            className={`sticker-btn mt-3 w-full py-3.5 sm:py-4 rounded-2xl font-display font-bold text-xl sm:text-2xl tracking-wide flex items-center justify-center gap-2.5 ${
              allExact ? 'animate-serve-ready text-white' : 'text-slate-900'
            }`}
            style={{
              background: allExact
                ? 'linear-gradient(180deg, #34D399 0%, #059669 100%)'
                : 'linear-gradient(180deg, #FDE047 0%, #F59E0B 100%)',
            }}
          >
            <span aria-hidden="true">🔔</span>
            <span>SERVE ORDER!</span>
          </button>

          <p className="hidden lg:block mt-2.5 text-[11px] font-bold text-center opacity-70">
            Keys: 1 (+2) · 2 (+5) · 3 (+10) · Z Undo · Enter Serve
          </p>
        </div>
      </div>
    </div>
  );
};
