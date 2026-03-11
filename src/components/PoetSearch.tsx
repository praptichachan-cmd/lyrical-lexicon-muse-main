import { useState } from "react";
import SearchBar from "./SearchBar";
import WordCard from "./WordCard";
import { searchVault, fetchDefinition, entryToSavedWord, type SavedWord } from "@/lib/wordService";
import { Globe } from "lucide-react";

interface PoetSearchProps {
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
  onSaveNew: (word: SavedWord) => void;
}

const PoetSearch = ({ onUpdateNotes, onDelete, onSaveNew }: PoetSearchProps) => {
  const [vaultResults, setVaultResults] = useState<SavedWord[]>([]);
  const [apiResults, setApiResults] = useState<SavedWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [noResult, setNoResult] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setVaultResults([]);
    setApiResults([]);
    setNoResult(false);
    setSearched(true);
    setLastQuery(query);

    // Search vault only
    const matches = searchVault(query);
    if (matches.length > 0) {
      setVaultResults(matches);
    } else {
      setNoResult(true);
    }
    
    setIsLoading(false);
  };

  const handleGlobalSearch = async () => {
    if (!lastQuery) return;
    setIsGlobalLoading(true);
    
    // First, find the entry for the searched word to get its synonyms
    const entry = await fetchDefinition(lastQuery);
    
    if (entry && entry.meanings) {
      // Gather all synonyms across all meanings
      const allSynonyms = new Set<string>();
      entry.meanings.forEach(m => {
        m.synonyms?.forEach(s => allSynonyms.add(s));
      });
      
      const synonymsArray = Array.from(allSynonyms).slice(0, 5); // take up to 5 synonyms
      
      if (synonymsArray.length > 0) {
        // Fetch definitions for each of these synonyms to display them as full word cards
        const fetchedSynonyms = await Promise.all(
          synonymsArray.map(async (syn) => {
            const synEntry = await fetchDefinition(syn);
            return synEntry ? entryToSavedWord(synEntry) : null;
          })
        );
        
        const validSynonyms = fetchedSynonyms.filter((w): w is SavedWord => w !== null);
        
        if (validSynonyms.length > 0) {
          setApiResults(validSynonyms);
          setNoResult(false);
          setIsGlobalLoading(false);
          return;
        }
      }
    }
    
    // If no synonyms were found or fetching them failed
    setNoResult(true);
    setApiResults([]);
    setIsGlobalLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="font-serif text-2xl text-foreground italic">Poet's Search</h2>
        <p className="font-sans text-sm text-muted-foreground/70">
          Search for a feeling, a mood, a word on the tip of your tongue.
        </p>
      </div>

      <SearchBar
        onSearch={handleSearch}
        isLoading={isLoading}
        placeholder="melancholy, luminous, yearning…"
      />

      {/* Vault matches */}
      {vaultResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-sans tracking-wider uppercase text-muted-foreground/50 text-center">
            Found in your lexicon
          </p>
          {vaultResults.map((word) => (
            <div key={word.id} className="card-animate-in">
              <WordCard
                word={word}
                onUpdateNotes={onUpdateNotes}
                onDelete={onDelete}
                variant="poet"
              />
            </div>
          ))}
        </div>
      )}

      {/* API result synonyms */}
      {apiResults.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-sans tracking-wider uppercase text-muted-foreground/50 text-center mb-3">
            Synonyms from the dictionary
          </p>
          {apiResults.map(word => (
            <div key={word.id} className="card-animate-in">
              <WordCard
                word={word}
                onUpdateNotes={onUpdateNotes}
                onDelete={onDelete}
                variant="poet"
              />
            </div>
          ))}
        </div>
      )}

      {/* Global Dictionary Button — shown when API hasn't been searched yet */}
      {searched && apiResults.length === 0 && (
        <div className="text-center space-y-4 py-8">
          {vaultResults.length === 0 && (
            <div>
              <p className="font-serif text-lg text-muted-foreground/50 italic">
                No words found for that feeling—yet.
              </p>
            </div>
          )}
          <button
            onClick={handleGlobalSearch}
            disabled={isGlobalLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-card text-foreground font-sans text-sm
              shadow-card transition-all hover:shadow-card-hover disabled:opacity-50"
          >
            <Globe size={15} className="text-primary" />
            {isGlobalLoading ? "Searching…" : "Search Global Dictionary"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PoetSearch;
