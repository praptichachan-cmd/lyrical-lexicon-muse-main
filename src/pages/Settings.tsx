import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Palette } from "lucide-react";
import { THEME_PRESETS, getActiveTheme, setActiveTheme, type ThemePreset } from "@/lib/themeService";

const Settings = () => {
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(getActiveTheme().id);

  const selectTheme = (theme: ThemePreset) => {
    setActiveId(theme.id);
    setActiveTheme(theme.id);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-500">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-serif text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-8 space-y-8">
        {/* Theme Customizer */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-primary" />
            <h2 className="font-serif text-lg text-foreground">Theme Customizer</h2>
          </div>
          <p className="font-sans text-sm text-muted-foreground/60 mb-6">
            Choose a pastel palette that matches your mood.
          </p>

          <div className="grid gap-3">
            {THEME_PRESETS.map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme)}
                className={`relative flex items-center gap-4 p-4 rounded-lg transition-all duration-300 ${
                  activeId === theme.id
                    ? "bg-card shadow-card-hover ring-2 ring-primary/30"
                    : "bg-card/50 shadow-card hover:shadow-card-hover"
                }`}
              >
                {/* Color swatches */}
                <div className="flex gap-1.5 shrink-0">
                  <div
                    className="w-7 h-7 rounded-full border border-border/50"
                    style={{ backgroundColor: `hsl(${theme.background})` }}
                  />
                  <div
                    className="w-7 h-7 rounded-full border border-border/50"
                    style={{ backgroundColor: `hsl(${theme.card})` }}
                  />
                  <div
                    className="w-7 h-7 rounded-full border border-border/50"
                    style={{ backgroundColor: `hsl(${theme.primary})` }}
                  />
                </div>

                <span className="font-sans text-sm font-medium text-foreground">{theme.name}</span>

                {activeId === theme.id && (
                  <div className="ml-auto">
                    <Check size={16} className="text-primary" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
