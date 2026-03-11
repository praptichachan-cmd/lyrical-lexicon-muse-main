import { useState, useEffect, useCallback } from "react";
import { Shuffle, Bell, BellOff, Sparkles } from "lucide-react";
import type { SavedWord } from "@/lib/wordService";

interface WordOfTheDayProps {
  words: SavedWord[];
}

const WOTD_KEY = "lyrical-lexicon-wotd";
const NOTIF_KEY = "lyrical-lexicon-notif";

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getStoredWotd(): { date: string; wordId: string } | null {
  try {
    const raw = localStorage.getItem(WOTD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function pickRandom(words: SavedWord[], excludeId?: string): SavedWord | null {
  const pool = excludeId ? words.filter((w) => w.id !== excludeId) : words;
  if (pool.length === 0) return words.length > 0 ? words[0] : null;
  return pool[Math.floor(Math.random() * pool.length)];
}

const WordOfTheDay = ({ words }: WordOfTheDayProps) => {
  const [wotd, setWotd] = useState<SavedWord | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem(NOTIF_KEY) === "true");

  const selectWord = useCallback(
    (forceNew = false) => {
      if (words.length === 0) return;
      const stored = getStoredWotd();
      const today = getTodayKey();

      if (!forceNew && stored && stored.date === today) {
        const found = words.find((w) => w.id === stored.wordId);
        if (found) {
          setWotd(found);
          return;
        }
      }

      const picked = pickRandom(words, forceNew ? wotd?.id : undefined);
      if (picked) {
        localStorage.setItem(WOTD_KEY, JSON.stringify({ date: today, wordId: picked.id }));
        setWotd(picked);
      }
    },
    [words, wotd?.id]
  );

  useEffect(() => {
    selectWord();
  }, [words.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNotifications = async () => {
    if (notifEnabled) {
      localStorage.setItem(NOTIF_KEY, "false");
      setNotifEnabled(false);
      return;
    }

    if (!("Notification" in window)) {
      alert("Your browser doesn't support notifications.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      localStorage.setItem(NOTIF_KEY, "true");
      setNotifEnabled(true);
      new Notification("Lyrical Lexicon", {
        body: "Daily word reminders are now enabled! 📖",
        icon: "/favicon.ico",
      });
    }
  };

  // Send notification when component mounts and notifications are enabled
  useEffect(() => {
    if (notifEnabled && wotd && "Notification" in window && Notification.permission === "granted") {
      const stored = getStoredWotd();
      const notifSentKey = `lyrical-notif-sent-${stored?.date}`;
      if (!localStorage.getItem(notifSentKey)) {
        localStorage.setItem(notifSentKey, "true");
        new Notification("Word of the Day ✨", {
          body: `${wotd.word} — ${wotd.definition.slice(0, 80)}…`,
          icon: "/favicon.ico",
        });
      }
    }
  }, [notifEnabled, wotd]);

  if (words.length === 0 || !wotd) return null;

  return (
    <div className="rounded-lg bg-card p-5 shadow-card card-animate-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-primary" />
          <span className="font-sans text-xs font-medium tracking-wider uppercase text-muted-foreground/60">
            Word of the Day
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleNotifications}
            className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
            title={notifEnabled ? "Disable notifications" : "Enable daily notifications"}
          >
            {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
          <button
            onClick={() => selectWord(true)}
            className="p-1.5 rounded text-muted-foreground/50 hover:text-foreground transition-colors"
            title="Shuffle"
          >
            <Shuffle size={14} />
          </button>
        </div>
      </div>

      <h3 className="font-serif text-2xl font-semibold text-foreground">{wotd.word}</h3>
      <span className="text-xs font-sans font-medium tracking-wider uppercase text-muted-foreground mt-0.5 block">
        {wotd.partOfSpeech}
      </span>
      <p className="mt-2 font-sans text-sm leading-relaxed text-foreground/90">{wotd.definition}</p>

      {wotd.notes && (
        <p className="mt-2 font-sans text-xs text-annotated italic border-l-2 border-primary/30 pl-3">
          {wotd.notes}
        </p>
      )}
    </div>
  );
};

export default WordOfTheDay;
