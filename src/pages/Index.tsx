import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import WordVault from "@/components/WordVault";
import PoetSearch from "@/components/PoetSearch";
import RhymeSearch from "@/components/RhymeSearch";
import WordOfTheDay from "@/components/WordOfTheDay";
import InspirationFAB from "@/components/InspirationFAB";
import InspirationOverlay from "@/components/InspirationOverlay";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { applyTheme, getActiveTheme } from "@/lib/themeService";
import {
  getVault,
  findInVault,
  fetchDefinition,
  entryToSavedWord,
  saveWord,
  updateNotes,
  deleteWord,
  type SavedWord,
} from "@/lib/wordService";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<SavedWord[]>(getVault);
  const [activeTab, setActiveTab] = useState<"lexicon" | "poet" | "rhymes">("lexicon");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState<{ word: SavedWord; isExisting: boolean } | null>(null);
  const [initialRhymeQuery, setInitialRhymeQuery] = useState("");
  const [isInspirationOpen, setIsInspirationOpen] = useState(false);

  // Notifications
  const { permission, requestPermission, notifyDailyWord } = useNotifications();

  // Find today's word from the vault (replicates logic in WordOfTheDay.tsx without needing mounting)
  const getWordOfTheDay = useCallback((vaultWords: SavedWord[]) => {
    if (vaultWords.length === 0) return null;
    const now = new Date();
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const index = Math.abs(Math.sin(seed) * 10000) % vaultWords.length;
    return vaultWords[Math.floor(index)];
  }, []);

  // Set the word of the day notification on mount/vault change
  useEffect(() => {
    // Attempt to notify immediately if permitted and we have words.
    // The hook natively protects against spamming more than once a day.
    if (words.length > 0 && permission === 'granted') {
      const todayWord = getWordOfTheDay(words);
      notifyDailyWord(todayWord);
    }
  }, [words, permission, notifyDailyWord, getWordOfTheDay]);

  // Apply saved theme on mount
  useEffect(() => {
    const theme = getActiveTheme();
    applyTheme(theme.id);
  }, []);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setLastSearched(null);

    const existing = findInVault(query);
    if (existing) {
      setLastSearched({ word: existing, isExisting: true });
      setIsLoading(false);
      return;
    }

    const entry = await fetchDefinition(query);
    if (entry) {
      const newWord = entryToSavedWord(entry);
      const updated = saveWord(newWord);
      setWords(updated);
      setLastSearched({ word: newWord, isExisting: false });
    }
    setIsLoading(false);
  };

  const handleUpdateNotes = useCallback((id: string, notes: string) => {
    const updated = updateNotes(id, notes);
    setWords(updated);
    setLastSearched((prev) => (prev?.word.id === id ? { ...prev, word: { ...prev.word, notes } } : prev));
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteWord(id);
    setWords(updated);
    setLastSearched((prev) => (prev?.word.id === id ? null : prev));
  }, []);

  const handleSaveNew = useCallback((word: SavedWord) => {
    const updated = saveWord(word);
    setWords(updated);
  }, []);

  const handleFindRhyme = useCallback((word: string) => {
    setInitialRhymeQuery(word);
    setActiveTab("rhymes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="font-sans text-sm text-muted-foreground animate-pulse">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50 transition-colors duration-500">
        <div className="max-w-2xl mx-auto px-5 py-5">
          <div className="flex items-center justify-between">
            <div className="w-20" />
            <div className="text-center">
              <h1 className="font-serif text-3xl font-semibold text-foreground tracking-tight">
                Lyrical Lexicon
              </h1>
              <p className="mt-1 font-sans text-xs tracking-widest uppercase text-muted-foreground/60">
                A personal vault of words
              </p>
            </div>
            <div className="w-20 flex justify-end gap-1">
              {permission !== 'granted' && permission !== 'denied' && (
                <button
                  onClick={() => requestPermission()}
                  className="px-3 py-1.5 mr-2 rounded-lg bg-primary/10 text-primary font-sans text-xs font-medium hover:bg-primary/20 transition-colors hidden sm:block"
                >
                  Enable Notifications
                </button>
              )}
              <button
                onClick={() => navigate("/settings")}
                className="p-2 rounded-lg text-muted-foreground/50 hover:text-foreground transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="p-2 rounded-lg text-muted-foreground/50 hover:text-foreground transition-colors"
                title="Profile"
              >
                <User size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-1 mt-4">
            <button
              onClick={() => setActiveTab("lexicon")}
              className={`px-5 py-2 rounded-md font-sans text-sm transition-all duration-200 ${
                activeTab === "lexicon"
                  ? "bg-emerald-500/10 shadow-card text-emerald-500 font-medium border border-emerald-500/20"
                  : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
              }`}
            >
              Lexicon
            </button>
            <button
              onClick={() => setActiveTab("poet")}
              className={`px-5 py-2 rounded-md font-sans text-sm transition-all duration-200 ${
                activeTab === "poet"
                  ? "bg-indigo-500/10 shadow-card text-indigo-500 font-medium border border-indigo-500/20"
                  : "text-muted-foreground hover:text-indigo-500 hover:bg-indigo-500/5"
              }`}
            >
              Poet's Search
            </button>
            <button
              onClick={() => setActiveTab("rhymes")}
              className={`px-5 py-2 rounded-md font-sans text-sm transition-all duration-200 ${
                activeTab === "rhymes"
                  ? "bg-fuchsia-500/10 shadow-card text-fuchsia-500 font-medium border border-fuchsia-500/20"
                  : "text-muted-foreground hover:text-fuchsia-500 hover:bg-fuchsia-500/5"
              }`}
            >
              Rhymes
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-8">
        {activeTab === "lexicon" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Word of the Day */}
            <WordOfTheDay words={words} />

            <SearchBar onSearch={handleSearch} isLoading={isLoading} />

            {lastSearched && lastSearched.isExisting && (
              <div className="space-y-2">
                <p className="text-xs font-sans tracking-wider uppercase text-muted-foreground/50 text-center">
                  Already in your lexicon
                </p>
                <div className="card-animate-in">
                  <WordVault
                    words={[lastSearched.word]}
                    onUpdateNotes={handleUpdateNotes}
                    onDelete={handleDelete}
                    onFindRhyme={handleFindRhyme}
                  />
                </div>
              </div>
            )}

            <div>
              <h2 className="font-serif text-lg text-muted-foreground/70 mb-4">
                {words.length > 0 ? "Your Words" : ""}
              </h2>
              <WordVault 
                words={words} 
                onUpdateNotes={handleUpdateNotes} 
                onDelete={handleDelete} 
                onFindRhyme={handleFindRhyme}
              />
            </div>
          </div>
        )}

        {activeTab === "poet" && (
          <PoetSearch
            onUpdateNotes={handleUpdateNotes}
            onDelete={handleDelete}
            onSaveNew={handleSaveNew}
            onFindRhyme={handleFindRhyme}
          />
        )}

        {activeTab === "rhymes" && (
          <RhymeSearch initialQuery={initialRhymeQuery} />
        )}
      </main>

      {/* Floating Action Button */}
      {!isInspirationOpen && (
        <InspirationFAB onClick={() => setIsInspirationOpen(true)} />
      )}

      {/* Inspiration Overlay Modal */}
      <InspirationOverlay 
        isOpen={isInspirationOpen} 
        onClose={() => setIsInspirationOpen(false)} 
        vaultWords={words} 
      />
    </div>
  );
};

export default Index;
