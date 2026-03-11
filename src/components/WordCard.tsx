import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Trash2, Copy, Plus, Music } from "lucide-react";
import type { SavedWord } from "@/lib/wordService";

interface WordCardProps {
  word: SavedWord;
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onFindRhyme?: (word: string) => void;
  variant?: "default" | "poet";
}

const WordCard = ({ word, onUpdateNotes, onDelete, onAdd, onFindRhyme, variant = "default" }: WordCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(word.notes);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setNotes(word.notes);
  }, [word.notes]);

  const handleSaveNotes = () => {
    onUpdateNotes(word.id, notes);
    setIsEditing(false);
  };

  const copyWord = () => {
    navigator.clipboard.writeText(`${word.word}: ${word.definition}`);
  };

  const poetClass = variant === "poet" ? "poet-card-reveal shadow-poet max-w-lg mx-auto" : "card-animate-in shadow-card";

  return (
    <div
      className={`rounded-lg bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover ${poetClass}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-2xl font-semibold text-foreground leading-tight">
            {word.word}
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-sans font-medium tracking-wider uppercase text-muted-foreground">
              {word.partOfSpeech}
            </span>
            {word.phonetic && (
              <span className="text-xs font-sans text-muted-foreground/70">{word.phonetic}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onFindRhyme && (
            <button onClick={() => onFindRhyme(word.word)} className="p-1.5 rounded text-fuchsia-500/50 hover:text-fuchsia-500 hover:bg-fuchsia-500/10 transition-colors" title="Find Rhymes">
              <Music size={14} />
            </button>
          )}
          <button onClick={copyWord} className="p-1.5 rounded text-muted-foreground/50 hover:text-muted-foreground transition-colors" title="Copy">
            <Copy size={14} />
          </button>
          {onAdd && (
            <button onClick={onAdd} className="p-1.5 rounded text-primary hover:text-primary transition-colors bg-primary/10" title="Save to Lexicon">
              <Plus size={14} />
            </button>
          )}
          {onDelete && !onAdd && (
            <button onClick={() => onDelete(word.id)} className="p-1.5 rounded text-muted-foreground/50 hover:text-destructive transition-colors" title="Remove">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Definition */}
      <p className="mt-3 font-sans text-sm leading-relaxed text-foreground/90">
        {word.definition}
      </p>

      {/* Synonyms */}
      {word.synonyms.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {word.synonyms.map((syn) => (
            <span
              key={syn}
              className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-sans text-muted-foreground"
            >
              {syn}
            </span>
          ))}
        </div>
      )}

      {/* Notes Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1.5 text-xs font-sans font-medium text-annotated hover:text-foreground transition-colors"
      >
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {expanded ? "Collapse notes" : word.notes ? "View notes" : "Add notes"}
      </button>

      {/* Notes Section */}
      {expanded && (
        <div className="mt-3 animate-accordion-down">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Where did you find this word? What does it evoke?"
                className="w-full px-4 py-3 rounded-md bg-background text-annotated font-sans text-sm
                  leading-relaxed resize-none outline-none min-h-[80px] placeholder:text-muted-foreground/40"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => { setIsEditing(false); setNotes(word.notes); }}
                  className="px-3 py-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-sans font-medium
                    transition-all hover:brightness-95"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsEditing(true)}
              className="px-4 py-3 rounded-md bg-background cursor-text min-h-[48px]"
            >
              {word.notes ? (
                <p className="font-sans text-sm text-annotated leading-relaxed italic">{word.notes}</p>
              ) : (
                <p className="font-sans text-sm text-muted-foreground/40 italic">Click to add your notes…</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Poet variant label */}
      {variant === "poet" && !onAdd && (
        <p className="mt-5 text-center text-xs font-sans tracking-wider text-muted-foreground/50 uppercase">
          From your lexicon
        </p>
      )}
    </div>
  );
};

export default WordCard;
