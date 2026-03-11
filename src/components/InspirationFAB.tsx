import { Cloud, Cat } from "lucide-react";

interface InspirationFABProps {
  onClick: () => void;
}

export default function InspirationFAB({ onClick }: InspirationFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 group flex items-end gap-2 transition-transform hover:scale-105 active:scale-95"
      title="Inspiration Export"
    >
      {/* Label and Cat */}
      <div className="flex flex-col items-center justify-end mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2">
        <span className="text-[10px] uppercase tracking-wider font-bold text-sky-400 mb-1 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full shadow-sm">
          Inspire
        </span>
        <Cat size={20} className="text-rose-300 fill-rose-100" />
      </div>

      {/* Cloud Button */}
      <div className="relative p-4 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 shadow-lg shadow-sky-200/50 hover:shadow-sky-300/60 border border-white/50 backdrop-blur-sm">
        <Cloud size={28} className="text-sky-400 fill-sky-200/50" />
        <div className="absolute -inset-1 rounded-full bg-white blur opacity-20 group-hover:opacity-40 transition-opacity" />
      </div>
    </button>
  );
}
