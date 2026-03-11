import { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { Music } from "lucide-react";

interface RhymeResult {
  word: string;
  score: number;
  numSyllables: number;
}

export default function RhymeSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [results, setResults] = useState<RhymeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setSearched(true);
    setLastQuery(query);
    setResults([]);

    try {
      const res = await fetch(`https://api.datamuse.com/words?rel_rhy=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.error("Failed to fetch rhymes", e);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (initialQuery && initialQuery !== lastQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-fuchsia-500/10 text-fuchsia-500 mb-2">
          <Music size={24} />
        </div>
        <h2 className="font-serif text-2xl text-foreground italic">Rhyme Search</h2>
        <p className="font-sans text-sm text-muted-foreground/70">
          Find the perfect rhyme to complete your verse.
        </p>
      </div>

      <div className="max-w-md mx-auto relative group">
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Type a word (e.g., luminous, heart, sky)…"
        />
        {/* Adds a subtle vibrant glow behind the search bar purely for aesthetics */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500 -z-10" />
      </div>

      {isLoading && (
        <div className="text-center py-12 text-fuchsia-500/50 animate-pulse">
          <Music size={32} className="mx-auto animate-bounce" />
          <p className="mt-4 font-sans text-sm tracking-widest uppercase">Listening…</p>
        </div>
      )}

      {!isLoading && searched && results.length > 0 && (
        <div className="mt-8">
          <p className="text-xs font-sans tracking-wider uppercase text-muted-foreground/50 text-center mb-6">
            Words that rhyme with <span className="text-fuchsia-500 font-semibold">{lastQuery}</span>
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center max-w-2xl mx-auto">
            {results.map((r, i) => (
              <div
                key={r.word + i}
                className="px-4 py-2 bg-card border border-fuchsia-500/20 text-foreground font-sans text-sm rounded-full 
                           shadow-sm hover:shadow-md hover:border-fuchsia-500/50 hover:text-fuchsia-500 
                           transition-all cursor-pointer select-all card-animate-in"
                style={{ animationDelay: `${Math.min(i * 30, 1000)}ms` }}
                title={`${r.numSyllables} syllables`}
              >
                {r.word}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && searched && results.length === 0 && (
        <div className="text-center py-12">
          <p className="font-serif text-lg text-muted-foreground/50 italic">
            No perfect rhymes found.
          </p>
          <p className="mt-1 font-sans text-sm text-muted-foreground/40">
            It might be a very unique word!
          </p>
        </div>
      )}
    </div>
  );
}
