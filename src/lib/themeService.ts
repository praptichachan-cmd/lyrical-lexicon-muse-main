export interface ThemePreset {
  id: string;
  name: string;
  background: string;
  card: string;
  primary: string;
  secondary: string;
  muted: string;
  border: string;
  searchGlow: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    background: "216 33% 97%",
    card: "240 19% 93%",
    primary: "186 30% 71%",
    secondary: "240 19% 90%",
    muted: "240 12% 90%",
    border: "240 12% 86%",
    searchGlow: "186 30% 71%",
  },
  {
    id: "rose-water",
    name: "Rose Water",
    background: "350 40% 97%",
    card: "340 30% 93%",
    primary: "340 50% 72%",
    secondary: "340 25% 90%",
    muted: "340 15% 90%",
    border: "340 15% 86%",
    searchGlow: "340 50% 72%",
  },
  {
    id: "mint-tea",
    name: "Mint Tea",
    background: "150 30% 97%",
    card: "150 20% 92%",
    primary: "160 40% 60%",
    secondary: "150 18% 89%",
    muted: "150 12% 89%",
    border: "150 12% 85%",
    searchGlow: "160 40% 60%",
  },
  {
    id: "honey-glow",
    name: "Honey Glow",
    background: "40 40% 97%",
    card: "38 30% 92%",
    primary: "35 55% 65%",
    secondary: "38 22% 89%",
    muted: "38 15% 89%",
    border: "38 15% 85%",
    searchGlow: "35 55% 65%",
  },
  {
    id: "twilight-iris",
    name: "Twilight Iris",
    background: "260 25% 97%",
    card: "260 20% 93%",
    primary: "265 40% 68%",
    secondary: "260 18% 90%",
    muted: "260 12% 90%",
    border: "260 12% 86%",
    searchGlow: "265 40% 68%",
  },
];

const THEME_KEY = "lyrical-lexicon-theme";

export function getActiveTheme(): ThemePreset {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      const found = THEME_PRESETS.find((t) => t.id === stored);
      if (found) return found;
    }
  } catch {}
  return THEME_PRESETS[0];
}

export function setActiveTheme(themeId: string) {
  localStorage.setItem(THEME_KEY, themeId);
  applyTheme(themeId);
}

export function applyTheme(themeId: string) {
  const theme = THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
  const root = document.documentElement;
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--card", theme.card);
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
  root.style.setProperty("--muted", theme.muted);
  root.style.setProperty("--border", theme.border);
  root.style.setProperty("--input", theme.border);
  root.style.setProperty("--ring", theme.primary);
  root.style.setProperty("--accent", theme.primary);
  root.style.setProperty("--search-glow", theme.searchGlow);
  root.style.setProperty("--popover", theme.background);
}
