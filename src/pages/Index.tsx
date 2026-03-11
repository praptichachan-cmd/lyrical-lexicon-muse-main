import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, User } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import WordVault from "@/components/WordVault";
import PoetSearch from "@/components/PoetSearch";
import WordOfTheDay from "@/components/WordOfTheDay";
import { useAuth } from "@/hooks/useAuth";
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
  const [activeTab, setActiveTab] = useState<"lexicon" | "poet">("lexicon");
  const [isLoading, setIsLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState<{ word: SavedWord; isExisting: boolean } | null>(null);

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
                  ? "bg-card shadow-card text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Lexicon
            </button>
            <button
              onClick={() => setActiveTab("poet")}
              className={`px-5 py-2 rounded-md font-sans text-sm transition-all duration-200 ${
                activeTab === "poet"
                  ? "bg-card shadow-card text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Poet's Search
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-5 py-8">
        {activeTab === "lexicon" ? (
          <div className="space-y-8">
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
                  />
                </div>
              </div>
            )}

            <div>
              <h2 className="font-serif text-lg text-muted-foreground/70 mb-4">
                {words.length > 0 ? "Your Words" : ""}
              </h2>
              <WordVault words={words} onUpdateNotes={handleUpdateNotes} onDelete={handleDelete} />
            </div>
          </div>
        ) : (
          <PoetSearch
            onUpdateNotes={handleUpdateNotes}
            onDelete={handleDelete}
            onSaveNew={handleSaveNew}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
