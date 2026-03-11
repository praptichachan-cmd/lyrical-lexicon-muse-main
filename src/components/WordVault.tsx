import type { SavedWord } from "@/lib/wordService";
import WordCard from "./WordCard";

interface WordVaultProps {
  words: SavedWord[];
  onUpdateNotes: (id: string, notes: string) => void;
  onDelete: (id: string) => void;
}

const WordVault = ({ words, onUpdateNotes, onDelete }: WordVaultProps) => {
  if (words.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="font-serif text-xl text-muted-foreground/60 italic">
          Your lexicon awaits its first word.
        </h2>
        <p className="mt-2 font-sans text-sm text-muted-foreground/40">
          Search for a word above to begin collecting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {words.map((word, i) => (
        <div key={word.id} style={{ animationDelay: `${i * 60}ms` }}>
          <WordCard word={word} onUpdateNotes={onUpdateNotes} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};

export default WordVault;
