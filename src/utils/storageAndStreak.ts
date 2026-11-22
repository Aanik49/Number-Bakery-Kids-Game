import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { BakeryItemId, SaveProgress } from '../types/game';

const DAILY_STREAK_NOTIF_ID = 7001;

const STORAGE_KEY = 'number_bakery_save_v1';

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayISO(): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - 1);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function createDefaultProgress(): SaveProgress {
  const today = getTodayISO();
  return {
    coins: 20,
    unlockedWorlds: ['cookie'],
    readyToUnlockWorlds: [],
    completedLevels: {
      cookie: 0,
      muffin: 0,
      bread: 0,
      croissant: 0,
      cake: 0,
      cinnamon: 0,
    },
    levelStars: {},
    musicEnabled: true,
    sfxEnabled: true,
    mathHelperEnabled: true,
    cakesDecorated: 0,
    streak: {
      currentStreak: 1,
      bestStreak: 1,
      lastPlayedDate: today,
      lastClaimedDate: null,
      reminderEnabled: false,
      reminderTime: '16:00',
    },
  };
}

export function loadProgress(): SaveProgress {
  const defaults = createDefaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SaveProgress>;
    const merged: SaveProgress = {
      ...defaults,
      ...parsed,
      completedLevels: {
        ...defaults.completedLevels,
        ...(parsed.completedLevels || {}),
      },
      levelStars: {
        ...(parsed.levelStars || {}),
      },
      streak: {
        ...defaults.streak,
        ...(parsed.streak || {}),
      },
    };
    return updateDailyStreakOnVisit(merged);
  } catch {
    return defaults;
  }
}

export function saveProgress(progress: SaveProgress): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Gracefully ignore storage quota / privacy mode errors on older WebViews
  }
}

export function updateDailyStreakOnVisit(progress: SaveProgress): SaveProgress {
  const today = getTodayISO();
  const yesterday = getYesterdayISO();
  const last = progress.streak.lastPlayedDate;

  if (last === today) {
    return progress;
  }

  let nextStreak = 1;
  if (last === yesterday) {
    nextStreak = progress.streak.currentStreak + 1;
  }

  return {
    ...progress,
    streak: {
      ...progress.streak,
      currentStreak: nextStreak,
      bestStreak: Math.max(progress.streak.bestStreak, nextStreak),
      lastPlayedDate: today,
    },
  };
}

export function getNotificationSupport(): 'supported' | 'unsupported' {
  if (Capacitor.isNativePlatform()) return 'supported';
  if (typeof window !== 'undefined' && 'Notification' in window) {
    return 'supported';
  }
  return 'unsupported';
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (Capacitor.isNativePlatform()) return 'granted';
  if (getNotificationSupport() === 'unsupported') return 'unsupported';
  return Notification.permission;
}

export async function requestLocalNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted' ? 'granted' : 'denied';
    } catch {
      return 'denied';
    }
  }
  if (getNotificationSupport() === 'unsupported') return 'unsupported';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

/**
 * Schedules or cancels a true native Android repeating daily local notification
 * when running inside the Capacitor APK (works even when the app is closed).
 */
export async function syncNativeDailyStreakReminder(
  enabled: boolean,
  reminderTime: string,
  streakDays: number
): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_STREAK_NOTIF_ID }],
    });
    if (!enabled) return;

    const [hourStr, minStr] = reminderTime.split(':');
    const hour = Number.parseInt(hourStr || '16', 10);
    const minute = Number.parseInt(minStr || '0', 10);

    await LocalNotifications.schedule({
      notifications: [
        {
          id: DAILY_STREAK_NOTIF_ID,
          title: `🔥 Number Bakery — Keep your ${streakDays}-day streak!`,
          body: 'Your ovens are warm! Come bake a quick order today and collect daily tip coins!',
          schedule: {
            on: { hour, minute },
            repeats: true,
            allowWhileIdle: true,
          },
          smallIcon: 'ic_launcher',
        },
      ],
    });
  } catch {
    // Gracefully ignore if device blocks exact alarms
  }
}

/**
 * Triggers a genuine local push notification (native Android via Capacitor when in APK,
 * or Service Worker / Web Notification API when in browser).
 */
export async function triggerLocalStreakNotification(
  streakDays: number,
  customMessage?: string
): Promise<{ deliveredByOS: boolean; title: string; body: string }> {
  const title = `🔥 Number Bakery — ${streakDays}-Day Streak!`;
  const body =
    customMessage ||
    `Your ovens are warm! Bake a quick order today to keep your ${streakDays}-day streak shining and grab bonus tip coins!`;

  if (Capacitor.isNativePlatform()) {
    try {
      const perm = await LocalNotifications.checkPermissions();
      if (perm.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
      await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Date.now() % 100000),
            title,
            body,
            schedule: { at: new Date(Date.now() + 800) },
            smallIcon: 'ic_launcher',
          },
        ],
      });
      return { deliveredByOS: true, title, body };
    } catch {
      return { deliveredByOS: false, title, body };
    }
  }

  if (getNotificationSupport() === 'supported' && Notification.permission === 'granted') {
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg && 'showNotification' in reg) {
          await reg.showNotification(title, {
            body,
            icon: '/icon.svg',
            badge: '/icon.svg',
            tag: 'number-bakery-daily-streak',
          });
          return { deliveredByOS: true, title, body };
        }
      }
      new Notification(title, {
        body,
        icon: '/icon.svg',
        tag: 'number-bakery-daily-streak',
      });
      return { deliveredByOS: true, title, body };
    } catch {
      return { deliveredByOS: false, title, body };
    }
  }

  return { deliveredByOS: false, title, body };
}

export function getWorldCompletionCount(
  progress: SaveProgress,
  worldId: BakeryItemId
): number {
  return progress.completedLevels[worldId] || 0;
}
