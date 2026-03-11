import { useState, useCallback } from "react";
import { X, Sparkles, Copy, ArrowLeft, Loader2 } from "lucide-react";
import type { SavedWord } from "@/lib/wordService";
import { generatePoeticSpark } from "@/lib/gemini";

interface InspirationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  vaultWords: SavedWord[];
}

export default function InspirationOverlay({ isOpen, onClose, vaultWords }: InspirationOverlayProps) {
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());
  const [vibe, setVibe] = useState("");
  const [status, setStatus] = useState<"input" | "loading" | "result" | "error">("input");
  const [result, setResult] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleToggleWord = (id: string) => {
    const next = new Set(selectedWords);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedWords(next);
  };

  const handleGenerate = async () => {
    if (selectedWords.size === 0) return;
    setStatus("loading");
    setErrorMsg("");

    const selected = vaultWords.filter((w) => selectedWords.has(w.id));
    
    try {
      const text = await generatePoeticSpark(selected, vibe);
      setResult(text);
      setStatus("result");
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to generate spark.");
      setStatus("error");
    }
  };

  const handleReset = useCallback(() => {
    setStatus("input");
    setResult("");
    setSelectedWords(new Set());
    setVibe("");
    setErrorMsg("");
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 300); // Reset after closing animation
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg h-[90vh] md:h-auto md:max-h-[85vh] bg-card border border-border/50 md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/30">
          <h2 className="font-serif text-xl font-medium flex items-center gap-2">
            <Sparkles className="text-sky-400" size={18} />
            Inspiration Export
          </h2>
          <button onClick={handleClose} className="p-1 rounded-md text-muted-foreground/60 hover:bg-muted transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          
          {/* STATE: Input */}
          {status === "input" && (
            <div className="space-y-6 flex-1 flex flex-col fade-in animate-in">
              <div>
                <label className="block text-sm font-sans font-medium text-foreground mb-2">
                  Describe the vibe or topic (optional)
                </label>
                <textarea
                  className="w-full resize-none bg-background rounded-lg border border-border/50 p-3 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-sky-400/50 transition-all"
                  rows={2}
                  placeholder="e.g., A melancholy rain, a triumphant dawn, holding onto hope..."
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value)}
                />
              </div>

              <div className="flex-1 min-h-[200px] flex flex-col">
                <label className="block text-sm font-sans font-medium text-foreground mb-2">
                  Select words to inspire the AI
                </label>
                {vaultWords.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center bg-muted/20 border border-dashed border-border rounded-lg text-muted-foreground/50 text-sm font-sans">
                    Your lexicon is empty. Add words first!
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto border border-border/50 rounded-lg bg-background p-2 space-y-1">
                    {vaultWords.map((word) => (
                      <label 
                        key={word.id} 
                        className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-border/50 text-sky-400 focus:ring-sky-400/50"
                          checked={selectedWords.has(word.id)}
                          onChange={() => handleToggleWord(word.id)}
                        />
                        <span className="font-serif text-lg">{word.word}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <button
                disabled={selectedWords.size === 0}
                onClick={handleGenerate}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white font-sans font-semibold text-base shadow-md disabled:opacity-50 disabled:grayscale transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Sparkles size={18} fill="currentColor" />
                Generate Spark
              </button>
            </div>
          )}

          {/* STATE: Loading */}
          {status === "loading" && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 fade-in animate-in duration-500">
              <Loader2 size={40} className="text-sky-400 animate-spin" />
              <p className="font-serif text-lg text-muted-foreground italic animate-pulse">
                Consulting the muse...
              </p>
            </div>
          )}

          {/* STATE: Error */}
          {status === "error" && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 fade-in animate-in">
              <p className="font-serif text-lg text-destructive italic text-center">
                The muse was interrupted.
              </p>
              <p className="text-sm font-sans text-muted-foreground text-center bg-destructive/10 p-3 rounded-md">
                {errorMsg}
              </p>
              <button 
                onClick={() => setStatus("input")}
                className="px-4 py-2 mt-4 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* STATE: Result (Notebook View) */}
          {status === "result" && (
            <div className="flex-1 flex flex-col fade-in animate-in font-serif">
              <div 
                className="flex-1 rounded-md shadow-inner overflow-hidden relative"
                style={{
                  backgroundColor: "#fdfbf7",
                  backgroundImage: "linear-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "100% 2.5rem",
                  backgroundPosition: "0 2rem", // Push first line down
                }}
              >
                {/* Red margin line */}
                <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-red-300/60" />
                
                <div className="pt-[3rem] pb-8 pr-6 pl-12 h-full overflow-y-auto">
                  <p 
                    className="text-2xl text-slate-700 leading-[2.5rem] tracking-wide whitespace-pre-wrap"
                    style={{ fontStyle: "italic" }}
                  >
                    {result}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setStatus("input")}
                  className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground font-sans font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} />
                  Back to Library
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-3 bg-sky-100/50 hover:bg-sky-100 text-sky-600 border border-sky-200 font-sans font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
