import React, { useState } from 'react';
import { Bell, Check, Download, Flame, Gift } from 'lucide-react';
import { StreakData } from '../types/game';
import {
  getNotificationPermission,
  getTodayISO,
  requestLocalNotificationPermission,
  triggerLocalStreakNotification,
} from '../utils/storageAndStreak';
import { soundEngine } from '../utils/soundEngine';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface StreakNotificationModalProps {
  streak: StreakData;
  onClaimDailyReward: (coins: number) => void;
  onUpdateReminderSettings: (enabled: boolean, time: string) => void;
  onShowInAppBanner: (title: string, body: string) => void;
  onClose: () => void;
}

const DAY_REWARDS = [10, 15, 20, 25, 30, 40, 60];

export const StreakNotificationModal: React.FC<StreakNotificationModalProps> = ({
  streak,
  onClaimDailyReward,
  onUpdateReminderSettings,
  onShowInAppBanner,
  onClose,
}) => {
  const [permission, setPermission] = useState(getNotificationPermission());
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const today = getTodayISO();
  const alreadyClaimedToday = streak.lastClaimedDate === today;
  const activeDayIndex = Math.min(6, Math.max(0, (streak.currentStreak - 1) % 7));
  const todayReward = DAY_REWARDS[activeDayIndex];

  const handleToggleReminders = async () => {
    soundEngine.playClick();
    if (!streak.reminderEnabled) {
      const perm = await requestLocalNotificationPermission();
      setPermission(perm);
      onUpdateReminderSettings(true, streak.reminderTime);
      if (perm === 'granted') {
        setStatusMessage(
          `Daily streak reminder enabled for ${streak.reminderTime}!`
        );
      } else {
        setStatusMessage(
          `Reminder saved for ${streak.reminderTime} (using in-app alerts when browser notifications are blocked).`
        );
      }
    } else {
      onUpdateReminderSettings(false, streak.reminderTime);
      setStatusMessage('Daily streak reminders paused.');
    }
  };

  const handleTestNotification = async () => {
    soundEngine.playServeSuccess();
    let currentPerm = getNotificationPermission();
    if (currentPerm === 'default') {
      currentPerm = await requestLocalNotificationPermission();
      setPermission(currentPerm);
    }
    const res = await triggerLocalStreakNotification(streak.currentStreak);
    onShowInAppBanner(res.title, res.body);
    setStatusMessage(
      res.deliveredByOS
        ? 'Local push notification sent to your device!'
        : 'Preview shown above! Grant browser notification permission for system push alerts.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
      <div className="paper-card bg-[#FFFDF8] rounded-3xl w-full max-w-md max-h-[92vh] overflow-y-auto p-5 sm:p-6 animate-paper-drop">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shadow">
              <Flame className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h2 className="font-display font-bold text-xl text-slate-900 leading-tight">
                Daily Bakery Streak
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Current: {streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'} · Best: {streak.bestStreak}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            aria-label="Close Streak Panel"
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 7-Day Streak Ribbon */}
        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {DAY_REWARDS.map((reward, idx) => {
            const isPast = idx < activeDayIndex;
            const isToday = idx === activeDayIndex;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-2 flex flex-col items-center justify-center border-2 text-center ${
                  isToday
                    ? 'bg-amber-100 border-amber-400 shadow-sm'
                    : isPast
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-500">D{idx + 1}</span>
                <span className="font-display font-bold text-xs text-slate-900 tabular-nums mt-0.5">
                  {isPast || (isToday && alreadyClaimedToday) ? (
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  ) : (
                    `+${reward}`
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Daily Streak Bonus Button */}
        <button
          type="button"
          disabled={alreadyClaimedToday}
          onClick={() => {
            soundEngine.playCoin();
            onClaimDailyReward(todayReward);
          }}
          className="sticker-btn w-full py-3 px-4 rounded-2xl font-display font-bold text-lg text-white flex items-center justify-center gap-2 mb-5"
          style={{
            background: alreadyClaimedToday
              ? '#94A3B8'
              : 'linear-gradient(180deg, #F59E0B 0%, #EA580C 100%)',
          }}
        >
          <Gift className="w-5 h-5" />
          <span>
            {alreadyClaimedToday
              ? 'Today’s Streak Bonus Claimed!'
              : `Claim Day ${streak.currentStreak} Bonus (+${todayReward} Coins)`}
          </span>
        </button>

        {/* Local Push Notification Settings */}
        <div className="bg-sky-50/90 rounded-2xl border-2 border-sky-200 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-sky-600 shrink-0" />
              <div className="text-left">
                <h3 className="font-display font-bold text-base text-slate-900 leading-tight">
                  Daily Streak Reminders
                </h3>
                <p className="text-xs font-medium text-slate-600">
                  Local push notification so kids never lose their streak
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleReminders}
              className={`px-3.5 py-1.5 rounded-xl font-display font-bold text-xs text-white transition cursor-pointer shrink-0 ${
                streak.reminderEnabled ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            >
              {streak.reminderEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <label
              htmlFor="streak-reminder-time"
              className="text-xs font-bold text-slate-700"
            >
              Reminder Time
            </label>
            <input
              id="streak-reminder-time"
              type="time"
              value={streak.reminderTime}
              onChange={(e) =>
                onUpdateReminderSettings(streak.reminderEnabled, e.target.value)
              }
              className="bg-white border-2 border-sky-200 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <span className="text-[11px] font-semibold text-slate-500">
              Permission: {permission}
            </span>
            <button
              type="button"
              onClick={handleTestNotification}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-display font-bold text-xs cursor-pointer transition"
            >
              Send Test Reminder
            </button>
          </div>

          {statusMessage && (
            <p className="text-xs font-bold text-sky-800 bg-white/90 rounded-xl px-3 py-2 border border-sky-200">
              {statusMessage}
            </p>
          )}
        </div>

        {/* Android / Mobile PWA Home Screen Install */}
        {!isInstalled && (isInstallable || isIOS) && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            {isInstallable ? (
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  install();
                }}
                className="sticker-btn w-full py-2.5 px-4 rounded-2xl bg-indigo-600 text-white font-display font-bold text-sm flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Install Number Bakery App</span>
              </button>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide((s) => !s)}
                  className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-display font-bold text-xs cursor-pointer"
                >
                  How to Install on iPhone / iPad
                </button>
                {showIOSGuide && (
                  <p className="mt-2 text-xs text-slate-600 text-left bg-slate-50 p-3 rounded-xl">
                    1. Tap the <strong>Share</strong> icon in Safari.<br />
                    2. Tap <strong>Add to Home Screen</strong> to add the Number Bakery icon!
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
