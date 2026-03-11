import { useState, useEffect, useCallback } from 'react';
import type { SavedWord } from '@/lib/wordService';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return 'denied';
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (e) {
      console.error("Error requesting notification permission:", e);
      return 'denied';
    }
  };

  const notifyDailyWord = useCallback((wordOfTheDay: SavedWord | null) => {
    if (!wordOfTheDay) return;
    if (permission !== 'granted') return;

    const todayStr = new Date().toDateString();
    const lastNotified = localStorage.getItem('lyrical-lexicon-last-notification');

    // Only send if we haven't already sent one today
    if (lastNotified === todayStr) return;

    try {
      const notification = new Notification(`Word of the Day: ${wordOfTheDay.word}`, {
        body: wordOfTheDay.definition,
        icon: '/favicon.ico', // Standard favicon for now
        tag: 'daily-word',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Mark that we've sent today's notification
      localStorage.setItem('lyrical-lexicon-last-notification', todayStr);
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }, [permission]);

  return { permission, requestPermission, notifyDailyWord };
}
