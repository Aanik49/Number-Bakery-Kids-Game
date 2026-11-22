import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BakeryItemId, SaveProgress, ScreenMode } from './types/game';
import { getNextWorldId, WORLD_BY_ID } from './data/bakeryWorlds';
import {
  getTodayISO,
  loadProgress,
  saveProgress,
  syncNativeDailyStreakReminder,
  triggerLocalStreakNotification,
} from './utils/storageAndStreak';
import { soundEngine } from './utils/soundEngine';
import { SplashScreen } from './components/SplashScreen';
import { BakeryLobby } from './components/BakeryLobby';
import { GameplayScreen } from './components/GameplayScreen';
import { PinataCelebrationCanvas } from './components/PinataCelebrationCanvas';
import { TreasureUnlockCanvas } from './components/TreasureUnlockCanvas';
import { CakeDecorateModal } from './components/CakeDecorateModal';
import { StreakNotificationModal } from './components/StreakNotificationModal';
import { BakeryTreatSVG } from './components/BakeryArtwork';

export default function App() {
  const [progress, setProgress] = useState<SaveProgress>(() => loadProgress());
  const [screen, setScreen] = useState<ScreenMode>('SPLASH');
  const [selectedWorldId, setSelectedWorldId] = useState<BakeryItemId | null>(null);
  const [activeWorldId, setActiveWorldId] = useState<BakeryItemId>('cookie');
  const [activeLevelNum, setActiveLevelNum] = useState<number>(1);
  const [lastWinStats, setLastWinStats] = useState({
    stars: 3,
    coinsEarned: 15,
    completedAllWorldLevels: false,
    newlyReadyWorldId: null as BakeryItemId | null,
  });
  const [treasureWorldId, setTreasureWorldId] = useState<BakeryItemId | null>(null);
  const [showCakeModal, setShowCakeModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [inAppNotif, setInAppNotif] = useState<{ title: string; body: string } | null>(
    null
  );

  // Persist save progress & sync audio preferences
  useEffect(() => {
    saveProgress(progress);
    soundEngine.setSfxEnabled(progress.sfxEnabled);
    soundEngine.setMusicEnabled(progress.musicEnabled);
  }, [progress]);

  // Local Daily Streak Notification Scheduler (Native Android + Web)
  useEffect(() => {
    syncNativeDailyStreakReminder(
      progress.streak.reminderEnabled,
      progress.streak.reminderTime,
      progress.streak.currentStreak
    );
    if (!progress.streak.reminderEnabled) return;
    const checkReminder = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      if (`${hh}:${mm}` === progress.streak.reminderTime) {
        triggerLocalStreakNotification(progress.streak.currentStreak).then((res) => {
          setInAppNotif({ title: res.title, body: res.body });
        });
      }
    };
    const interval = window.setInterval(checkReminder, 60000);
    return () => window.clearInterval(interval);
  }, [
    progress.streak.reminderEnabled,
    progress.streak.reminderTime,
    progress.streak.currentStreak,
  ]);

  // Auto-hide in-app notification toast after 5s
  useEffect(() => {
    if (!inAppNotif) return;
    const id = window.setTimeout(() => setInAppNotif(null), 5000);
    return () => window.clearTimeout(id);
  }, [inAppNotif]);

  const handleToggleMusic = () => {
    setProgress((prev) => {
      const next = !prev.musicEnabled;
      soundEngine.setMusicEnabled(next);
      return { ...prev, musicEnabled: next };
    });
  };

  const handleToggleSfx = () => {
    setProgress((prev) => {
      const next = !prev.sfxEnabled;
      soundEngine.setSfxEnabled(next);
      if (next) soundEngine.playClick();
      return { ...prev, sfxEnabled: next };
    });
  };

  const handleStartLevel = (worldId: BakeryItemId, levelNumber: number) => {
    setActiveWorldId(worldId);
    setActiveLevelNum(levelNumber);
    setScreen('PLAYING');
  };

  const handleLevelComplete = (stars: number, coinsEarned: number) => {
    const levelKey = `${activeWorldId}-${activeLevelNum}`;
    const nextWorldId = getNextWorldId(activeWorldId);
    const isFinalLevelOfWorld = activeLevelNum === 10;

    let newlyReadyWorldId: BakeryItemId | null = null;

    setProgress((prev) => {
      const prevBest = prev.levelStars[levelKey] || 0;
      const prevCompleted = prev.completedLevels[activeWorldId] || 0;
      const updatedCompleted = Math.max(prevCompleted, activeLevelNum);

      let nextReadyList = [...prev.readyToUnlockWorlds];
      if (
        isFinalLevelOfWorld &&
        nextWorldId &&
        !prev.unlockedWorlds.includes(nextWorldId) &&
        !nextReadyList.includes(nextWorldId)
      ) {
        nextReadyList.push(nextWorldId);
        newlyReadyWorldId = nextWorldId;
      }

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        completedLevels: {
          ...prev.completedLevels,
          [activeWorldId]: updatedCompleted,
        },
        levelStars: {
          ...prev.levelStars,
          [levelKey]: Math.max(prevBest, stars),
        },
        readyToUnlockWorlds: nextReadyList,
      };
    });

    if (
      isFinalLevelOfWorld &&
      nextWorldId &&
      !progress.unlockedWorlds.includes(nextWorldId)
    ) {
      newlyReadyWorldId = nextWorldId;
    }

    setLastWinStats({
      stars,
      coinsEarned,
      completedAllWorldLevels: isFinalLevelOfWorld,
      newlyReadyWorldId,
    });
    setScreen('PINATA_WIN');
  };

  const handleAfterPinataNext = () => {
    if (lastWinStats.completedAllWorldLevels) {
      // Instruction #9: Show popup stating all 10 levels done -> Go to Lobby to unlock new item!
      setScreen('WORLD_COMPLETE_MODAL');
      return;
    }

    // Every 5th level cleared also offers a fun surprise Cake Decorating Studio bonus!
    if (activeLevelNum === 5) {
      setShowCakeModal(true);
    }

    handleStartLevel(activeWorldId, Math.min(10, activeLevelNum + 1));
  };

  const handleGoLobbyFromWorldComplete = () => {
    setSelectedWorldId(null);
    setScreen('LOBBY');
  };

  const handleOpenTreasureUnlock = (worldId: BakeryItemId) => {
    setTreasureWorldId(worldId);
    // Mark unlocked immediately upon opening the chest so progress is safely saved
    setProgress((prev) => ({
      ...prev,
      unlockedWorlds: prev.unlockedWorlds.includes(worldId)
        ? prev.unlockedWorlds
        : [...prev.unlockedWorlds, worldId],
      readyToUnlockWorlds: prev.readyToUnlockWorlds.filter((id) => id !== worldId),
    }));
    setScreen('TREASURE_REVEAL');
  };

  const completedWorld = WORLD_BY_ID[activeWorldId];
  const nextUnlockWorld = lastWinStats.newlyReadyWorldId
    ? WORLD_BY_ID[lastWinStats.newlyReadyWorldId]
    : null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* In-App Local Push Notification Toast Preview */}
      {inAppNotif && (
        <div className="fixed top-4 inset-x-4 z-[60] flex justify-center pointer-events-none">
          <div className="pointer-events-auto paper-card bg-white rounded-2xl px-4 py-3 max-w-sm w-full flex items-start gap-3 animate-paper-drop">
            <img
              src="/icon.svg"
              alt="Number Bakery"
              className="w-10 h-10 rounded-xl shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="font-display font-bold text-sm text-slate-900">
                {inAppNotif.title}
              </div>
              <p className="text-xs font-medium text-slate-600 leading-snug mt-0.5">
                {inAppNotif.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInAppNotif(null)}
              className="text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 1. SPLASH SCREEN */}
      {screen === 'SPLASH' && (
        <SplashScreen
          streakDays={progress.streak.currentStreak}
          onStart={() => {
            setSelectedWorldId(null);
            setScreen('LOBBY');
          }}
        />
      )}

      {/* 2. LOBBY & 10-LEVEL WORLD MAP */}
      {(screen === 'LOBBY' || screen === 'LEVEL_SELECT') && (
        <BakeryLobby
          progress={progress}
          selectedWorldId={selectedWorldId}
          onSelectWorld={(worldId) => {
            setSelectedWorldId(worldId);
            setScreen('LEVEL_SELECT');
          }}
          onOpenTreasureUnlock={handleOpenTreasureUnlock}
          onBackToWorlds={() => {
            setSelectedWorldId(null);
            setScreen('LOBBY');
          }}
          onStartLevel={handleStartLevel}
          onOpenStreakModal={() => setShowStreakModal(true)}
          onOpenCakeStudio={() => setShowCakeModal(true)}
          onToggleMusic={handleToggleMusic}
          onToggleSfx={handleToggleSfx}
        />
      )}

      {/* 3. ACTIVE GAMEPLAY */}
      {screen === 'PLAYING' && (
        <GameplayScreen
          key={`${activeWorldId}-${activeLevelNum}`}
          worldId={activeWorldId}
          levelNumber={activeLevelNum}
          coins={progress.coins}
          mathHelperEnabled={progress.mathHelperEnabled}
          musicEnabled={progress.musicEnabled}
          sfxEnabled={progress.sfxEnabled}
          onToggleMathHelper={() =>
            setProgress((p) => ({
              ...p,
              mathHelperEnabled: !p.mathHelperEnabled,
            }))
          }
          onToggleMusic={handleToggleMusic}
          onToggleSfx={handleToggleSfx}
          onExitToWorldMap={() => {
            setSelectedWorldId(activeWorldId);
            setScreen('LEVEL_SELECT');
          }}
          onLevelComplete={handleLevelComplete}
        />
      )}

      {/* 4. PIÑATA BAKERY-ITEM BURST CELEBRATION (Instruction #8) */}
      {screen === 'PINATA_WIN' && (
        <PinataCelebrationCanvas
          worldId={activeWorldId}
          levelNumber={activeLevelNum}
          starsEarned={lastWinStats.stars}
          coinsEarned={lastWinStats.coinsEarned}
          hasNextLevelInWorld={!lastWinStats.completedAllWorldLevels}
          onNext={handleAfterPinataNext}
          onReplay={() => handleStartLevel(activeWorldId, activeLevelNum)}
          onHome={() => {
            setSelectedWorldId(
              lastWinStats.completedAllWorldLevels ? null : activeWorldId
            );
            setScreen(lastWinStats.completedAllWorldLevels ? 'LOBBY' : 'LEVEL_SELECT');
          }}
        />
      )}

      {/* 5. ALL 10 LEVELS DONE POPUP -> GO TO LOBBY TO UNLOCK NEW ITEM (Instruction #9) */}
      {screen === 'WORLD_COMPLETE_MODAL' && (
        <div
          className="w-full h-full flex items-center justify-center p-5 craft-dot-bg"
          style={{ background: completedWorld.theme.pageBg }}
        >
          <div className="paper-card bg-white rounded-3xl max-w-md w-full p-6 text-center animate-paper-drop">
            <div className="flex justify-center mb-3">
              <div className="relative animate-float-gentle">
                <BakeryTreatSVG itemId={completedWorld.id} size={90} />
                <Sparkles className="w-7 h-7 text-amber-400 absolute -top-2 -right-2" />
              </div>
            </div>

            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
              All 10 Levels Complete!
            </p>
            <h2 className="font-display font-bold text-3xl text-slate-900 mt-1">
              {completedWorld.worldTitle} Mastered!
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-2 leading-relaxed">
              {nextUnlockWorld
                ? `Amazing baking! You finished every ${completedWorld.name} level. Go to the Lobby now to open the glowing treasure chest and unlock ${nextUnlockWorld.name}!`
                : `Incredible! You mastered every single bakery world in Number Bakery!`}
            </p>

            <button
              type="button"
              onClick={() => {
                soundEngine.playServeSuccess();
                handleGoLobbyFromWorldComplete();
              }}
              className="sticker-btn animate-serve-ready mt-6 w-full py-4 px-6 rounded-2xl font-display font-bold text-xl text-white"
              style={{
                background: 'linear-gradient(180deg, #F59E0B 0%, #EA580C 100%)',
              }}
            >
              {nextUnlockWorld
                ? `Go to Lobby to Unlock ${nextUnlockWorld.name}!`
                : 'Return to Bakery Lobby'}
            </button>
          </div>
        </div>
      )}

      {/* 6. TREASURE CHEST & BUBBLE POP REVEAL (Instruction #9) */}
      {screen === 'TREASURE_REVEAL' && treasureWorldId && (
        <TreasureUnlockCanvas
          unlockedWorldId={treasureWorldId}
          onContinueToWorld={() => {
            setSelectedWorldId(treasureWorldId);
            handleStartLevel(treasureWorldId, 1);
          }}
          onBackToLobby={() => {
            setSelectedWorldId(null);
            setScreen('LOBBY');
          }}
        />
      )}

      {/* BONUS MODAL: CAKE DECORATING STUDIO */}
      {showCakeModal && (
        <CakeDecorateModal
          cakesDecorated={progress.cakesDecorated}
          onClose={() => setShowCakeModal(false)}
          onComplete={(bonusCoins) => {
            setProgress((p) => ({
              ...p,
              coins: p.coins + bonusCoins,
              cakesDecorated: p.cakesDecorated + 1,
            }));
            setShowCakeModal(false);
          }}
        />
      )}

      {/* DAILY STREAK & LOCAL PUSH NOTIFICATIONS MODAL */}
      {showStreakModal && (
        <StreakNotificationModal
          streak={progress.streak}
          onClose={() => setShowStreakModal(false)}
          onClaimDailyReward={(bonusCoins) => {
            const today = getTodayISO();
            setProgress((p) => ({
              ...p,
              coins: p.coins + bonusCoins,
              streak: {
                ...p.streak,
                lastClaimedDate: today,
              },
            }));
          }}
          onUpdateReminderSettings={(enabled, time) => {
            setProgress((p) => ({
              ...p,
              streak: {
                ...p.streak,
                reminderEnabled: enabled,
                reminderTime: time,
              },
            }));
          }}
          onShowInAppBanner={(title, body) => setInAppNotif({ title, body })}
        />
      )}
    </div>
  );
}
