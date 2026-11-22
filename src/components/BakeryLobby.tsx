import React from 'react';
import {
  Bell,
  Cake,
  ChevronLeft,
  Flame,
  Lock,
  Music,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { BakeryItemId, SaveProgress } from '../types/game';
import { BAKERY_WORLDS, WORLD_BY_ID } from '../data/bakeryWorlds';
import { BakeryTreatSVG, GameIcon } from './BakeryArtwork';
import { soundEngine } from '../utils/soundEngine';

interface BakeryLobbyProps {
  progress: SaveProgress;
  selectedWorldId: BakeryItemId | null;
  onSelectWorld: (worldId: BakeryItemId) => void;
  onOpenTreasureUnlock: (worldId: BakeryItemId) => void;
  onBackToWorlds: () => void;
  onStartLevel: (worldId: BakeryItemId, levelNumber: number) => void;
  onOpenStreakModal: () => void;
  onOpenCakeStudio: () => void;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
}

export const BakeryLobby: React.FC<BakeryLobbyProps> = ({
  progress,
  selectedWorldId,
  onSelectWorld,
  onOpenTreasureUnlock,
  onBackToWorlds,
  onStartLevel,
  onOpenStreakModal,
  onOpenCakeStudio,
  onToggleMusic,
  onToggleSfx,
}) => {
  const activeWorld = selectedWorldId ? WORLD_BY_ID[selectedWorldId] : null;
  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden craft-dot-bg"
      style={{
        background: activeWorld
          ? activeWorld.theme.pageBg
          : 'linear-gradient(180deg, #FFF7ED 0%, #FFE4EC 55%, #E0F2FE 100%)',
      }}
    >
      {/* Top Paper-Cutout Awning Strip */}
      <div
        className="h-3.5 w-full shrink-0 border-b-2 border-white"
        style={{
          background: activeWorld
            ? `repeating-linear-gradient(90deg, ${activeWorld.theme.awningA} 0px, ${activeWorld.theme.awningA} 24px, ${activeWorld.theme.awningB} 24px, ${activeWorld.theme.awningB} 48px)`
            : 'repeating-linear-gradient(90deg, #FF5E7E 0px, #FF5E7E 24px, #FFFFFF 24px, #FFFFFF 48px)',
        }}
      />

      {/* Compact Single-Row Top HUD */}
      <header className="px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {activeWorld ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                onBackToWorlds();
              }}
              className="sticker-btn h-11 px-3.5 rounded-2xl bg-white text-slate-800 font-display font-bold text-sm flex items-center gap-1 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Lobby</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <GameIcon size={44} className="border-2 border-white shrink-0" />
              <div className="min-w-0">
                <h1 className="font-display font-bold text-lg sm:text-xl text-slate-900 truncate leading-tight">
                  Number Bakery
                </h1>
                <p className="text-[11px] font-bold text-slate-600 truncate">
                  {totalStars} / 180 Stars · 6 Craft Ovens
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Utility Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Coins */}
          <div className="paper-card bg-amber-400 text-slate-900 rounded-2xl px-3 h-10 flex items-center gap-1.5 font-display font-bold text-sm tabular-nums">
            <span aria-hidden="true">🪙</span>
            <span>{progress.coins}</span>
          </div>

          {/* Daily Streak + Local Push Notifications */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenStreakModal();
            }}
            aria-label="Daily Streak and Push Reminders"
            className="sticker-btn h-10 px-2.5 sm:px-3 rounded-2xl bg-rose-500 text-white font-display font-bold text-xs sm:text-sm flex items-center gap-1"
          >
            <Flame className="w-4 h-4" />
            <span className="tabular-nums">{progress.streak.currentStreak}d</span>
            <Bell className="w-3.5 h-3.5 opacity-90 hidden sm:inline" />
          </button>

          {/* Cake Decorating Studio */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onOpenCakeStudio();
            }}
            aria-label="Cake Decorating Studio"
            title="Decorate a Cake (+15 Coins)"
            className="sticker-btn w-10 h-10 rounded-2xl bg-pink-500 text-white flex items-center justify-center"
          >
            <Cake className="w-5 h-5" />
          </button>

          {/* Music Toggle */}
          <button
            type="button"
            onClick={onToggleMusic}
            aria-label={progress.musicEnabled ? 'Mute Music' : 'Play Music'}
            title={progress.musicEnabled ? 'Music On' : 'Music Off'}
            className={`sticker-btn w-10 h-10 rounded-2xl flex items-center justify-center ${
              progress.musicEnabled
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            <Music className="w-5 h-5" />
          </button>

          {/* SFX Toggle */}
          <button
            type="button"
            onClick={onToggleSfx}
            aria-label={progress.sfxEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            title={progress.sfxEnabled ? 'SFX On' : 'SFX Off'}
            className={`sticker-btn w-10 h-10 rounded-2xl flex items-center justify-center ${
              progress.sfxEnabled
                ? 'bg-white text-slate-800'
                : 'bg-slate-200 text-slate-500'
            }`}
          >
            {progress.sfxEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Scrollable Content Area */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-6 pb-6 pt-1">
        {!activeWorld ? (
          /* ================= BAKERY LOBBY: ALL 6 WORLDS ================= */
          <div className="max-w-5xl mx-auto">
            {progress.readyToUnlockWorlds.length > 0 && (
              <div className="mb-4 paper-card bg-gradient-to-r from-amber-300 via-yellow-200 to-cyan-200 rounded-3xl px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-amber-700 shrink-0" />
                  <p className="font-display font-bold text-sm sm:text-base text-slate-900">
                    New Bakery Treasure Ready! Tap the glowing card below to open the chest!
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {BAKERY_WORLDS.map((world) => {
                const isUnlocked = progress.unlockedWorlds.includes(world.id);
                const isReadyToUnlock = progress.readyToUnlockWorlds.includes(world.id);
                const completedCount = progress.completedLevels[world.id] || 0;
                const partner = world.partnerItemId
                  ? WORLD_BY_ID[world.partnerItemId]
                  : null;
                const worldStars = world.levels.reduce(
                  (sum, lvl) =>
                    sum + (progress.levelStars[`${world.id}-${lvl.levelNumber}`] || 0),
                  0
                );

                return (
                  <button
                    key={world.id}
                    type="button"
                    onClick={() => {
                      if (isReadyToUnlock) {
                        soundEngine.playServeSuccess();
                        onOpenTreasureUnlock(world.id);
                      } else if (isUnlocked) {
                        soundEngine.playClick();
                        onSelectWorld(world.id);
                      } else {
                        soundEngine.playWobble();
                      }
                    }}
                    className={`relative text-left rounded-3xl p-4 sm:p-5 overflow-hidden transition-transform cursor-pointer ${
                      isReadyToUnlock
                        ? 'animate-unlock-ready border-4 border-yellow-300'
                        : isUnlocked
                        ? 'paper-card hover:-translate-y-1 active:scale-[0.98]'
                        : 'border-[3px] border-white/70 opacity-75 grayscale-[0.35]'
                    }`}
                    style={{
                      background: world.theme.pageBg,
                      color: world.theme.textColor,
                    }}
                  >
                    {/* Instruction #9: Sweeping Light Shine Effect when Ready to Unlock */}
                    {isReadyToUnlock && <div className="shine-sweep-bar" />}

                    {/* World Awning Accent Header Bar */}
                    <div
                      className="h-2.5 -mx-5 -mt-5 mb-4"
                      style={{
                        background: `repeating-linear-gradient(90deg, ${world.theme.awningA} 0px, ${world.theme.awningA} 18px, ${world.theme.awningB} 18px, ${world.theme.awningB} 36px)`,
                      }}
                    />

                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider opacity-80">
                          <span>World {world.orderIndex + 1}</span>
                          <span>·</span>
                          <span>{world.difficultyLabel}</span>
                        </div>
                        <h2 className="font-display font-bold text-2xl leading-tight mt-0.5 truncate">
                          {world.name}
                        </h2>
                        <p className="text-xs font-bold opacity-80 truncate">
                          {world.worldTitle}
                        </p>
                      </div>

                      {/* Bakery Item Icon (with Partner Preview for 2-item worlds) */}
                      <div className="relative flex items-center shrink-0">
                        <div
                          className={
                            isReadyToUnlock ? 'animate-float-gentle' : ''
                          }
                        >
                          <BakeryTreatSVG itemId={world.id} size={64} />
                        </div>
                        {partner && (
                          <div className="-ml-5 mt-7">
                            <BakeryTreatSVG itemId={partner.id} size={34} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 2-Item Math Rule Line */}
                    <p className="mt-3 text-xs font-semibold opacity-90 leading-snug">
                      {partner
                        ? `Math Combo: ${world.name} + ${partner.name}`
                        : `Starter World: ${world.pluralName} Only`}
                    </p>

                    {/* Footer Progress / Unlock CTA */}
                    <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between gap-2">
                      {isReadyToUnlock ? (
                        <div className="w-full py-2 px-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-display font-bold text-sm text-center shadow-md flex items-center justify-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>TAP TO OPEN TREASURE!</span>
                        </div>
                      ) : isUnlocked ? (
                        <>
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-xs font-extrabold mb-1 tabular-nums">
                              <span>{completedCount} / 10 Levels</span>
                              <span className="flex items-center gap-0.5">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                                {worldStars}/30
                              </span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-black/10 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${(completedCount / 10) * 100}%`,
                                  backgroundColor: world.theme.accentHex,
                                }}
                              />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-between text-xs font-bold opacity-85">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-4 h-4" />
                            Finish all 10 {partner?.name} levels
                          </span>
                          <span>Locked</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ================= 10-LEVEL WORLD MAP ================= */
          <div className="max-w-4xl mx-auto">
            {/* World Hero Banner */}
            <div
              className={`rounded-3xl p-4 sm:p-6 mb-5 flex flex-wrap items-center justify-between gap-4 ${
                activeWorld.theme.isDarkTheme ? 'paper-card-dark' : 'paper-card'
              }`}
              style={{
                backgroundColor: activeWorld.theme.panelBg,
                color: activeWorld.theme.textColor,
              }}
            >
              <div className="flex items-center gap-4">
                <div className="relative flex items-center">
                  <BakeryTreatSVG itemId={activeWorld.id} size={72} />
                  {activeWorld.partnerItemId && (
                    <div className="-ml-5 mt-8">
                      <BakeryTreatSVG itemId={activeWorld.partnerItemId} size={40} />
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider opacity-75">
                    World {activeWorld.orderIndex + 1} · {activeWorld.difficultyLabel} · {activeWorld.ovenName}
                  </div>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight">
                    {activeWorld.worldTitle}
                  </h2>
                  <p className="text-xs sm:text-sm font-semibold opacity-85 mt-0.5">
                    {activeWorld.description}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="font-display font-bold text-2xl tabular-nums">
                  {progress.completedLevels[activeWorld.id] || 0} / 10
                </div>
                <div className="text-xs font-bold opacity-75">Levels Cleared</div>
              </div>
            </div>

            {/* 10 Level Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
              {activeWorld.levels.map((lvl) => {
                const highestCompleted = progress.completedLevels[activeWorld.id] || 0;
                const isPlayable = lvl.levelNumber <= highestCompleted + 1;
                const isNextUp = lvl.levelNumber === highestCompleted + 1;
                const stars =
                  progress.levelStars[`${activeWorld.id}-${lvl.levelNumber}`] || 0;

                return (
                  <button
                    key={lvl.levelNumber}
                    type="button"
                    disabled={!isPlayable}
                    onClick={() => {
                      soundEngine.playServeSuccess();
                      onStartLevel(activeWorld.id, lvl.levelNumber);
                    }}
                    className={`sticker-btn rounded-3xl p-4 flex flex-col items-center justify-between text-center min-h-[126px] ${
                      isNextUp ? 'animate-serve-ready' : ''
                    }`}
                    style={{
                      background: isPlayable
                        ? isNextUp
                          ? `linear-gradient(180deg, ${activeWorld.theme.accentHex} 0%, ${activeWorld.theme.accentDarkHex} 100%)`
                          : activeWorld.theme.panelBg
                        : activeWorld.theme.isDarkTheme
                        ? 'rgba(30, 27, 75, 0.55)'
                        : '#E2E8F0',
                      color: isNextUp
                        ? '#FFFFFF'
                        : isPlayable
                        ? activeWorld.theme.textColor
                        : '#64748B',
                    }}
                  >
                    <span className="text-[11px] font-extrabold uppercase tracking-wider opacity-80">
                      Level
                    </span>
                    <span className="font-display font-bold text-3xl sm:text-4xl leading-none tabular-nums my-1">
                      {isPlayable ? lvl.levelNumber : <Lock className="w-7 h-7 mx-auto" />}
                    </span>
                    <span className="text-[11px] font-bold truncate w-full opacity-90">
                      {lvl.title}
                    </span>

                    {/* 3 Star Row */}
                    <div className="flex items-center justify-center gap-1 mt-2">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= stars
                              ? 'fill-amber-400 text-amber-500'
                              : isNextUp
                              ? 'text-white/40'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
