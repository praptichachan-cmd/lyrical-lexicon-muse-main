import { useState, useRef, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const SearchBar = ({ onSearch, isLoading, placeholder = "Search for a word…" }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto">
      <div className="flex gap-3 items-center">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 px-5 py-3.5 rounded-lg bg-card text-foreground font-sans text-base
            shadow-card placeholder:text-muted-foreground/60 outline-none
            transition-shadow duration-300 focus:shadow-card-hover
            ${isLoading ? "search-loading" : ""}`}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-sm
            tracking-wide transition-all duration-200 hover:brightness-95 active:scale-[0.97]
            disabled:opacity-40 disabled:cursor-not-allowed shadow-card"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
