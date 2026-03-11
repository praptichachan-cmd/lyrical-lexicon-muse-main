export interface SavedWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech: string;
  definition: string;
  synonyms: string[];
  notes: string;
  savedAt: number;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: { definition: string; example?: string }[];
    synonyms: string[];
  }[];
}

const STORAGE_KEY = "lyrical-lexicon-vault";

export function getVault(): SavedWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveVault(words: SavedWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export function findInVault(query: string): SavedWord | undefined {
  return getVault().find((w) => w.word.toLowerCase() === query.toLowerCase());
}

export function searchVault(query: string): SavedWord[] {
  const q = query.toLowerCase();
  return getVault().filter(
    (w) =>
      w.word.toLowerCase().includes(q) ||
      w.definition.toLowerCase().includes(q) ||
      w.synonyms.some((s) => s.toLowerCase().includes(q)) ||
      w.notes.toLowerCase().includes(q)
  );
}

export function saveWord(word: SavedWord): SavedWord[] {
  const vault = getVault();
  const existing = vault.findIndex((w) => w.word.toLowerCase() === word.word.toLowerCase());
  if (existing >= 0) {
    vault[existing] = { ...vault[existing], ...word, savedAt: vault[existing].savedAt };
  } else {
    vault.unshift(word);
  }
  saveVault(vault);
  return vault;
}

export function updateNotes(wordId: string, notes: string): SavedWord[] {
  const vault = getVault();
  const idx = vault.findIndex((w) => w.id === wordId);
  if (idx >= 0) {
    vault[idx].notes = notes;
    saveVault(vault);
  }
  return vault;
}

export function deleteWord(wordId: string): SavedWord[] {
  const vault = getVault().filter((w) => w.id !== wordId);
  saveVault(vault);
  return vault;
}

export async function fetchDefinition(word: string): Promise<DictionaryEntry | null> {
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] as DictionaryEntry;
  } catch {
    return null;
  }
}

export function entryToSavedWord(entry: DictionaryEntry): SavedWord {
  const meaning = entry.meanings[0];
  return {
    id: crypto.randomUUID(),
    word: entry.word,
    phonetic: entry.phonetic,
    partOfSpeech: meaning?.partOfSpeech || "",
    definition: meaning?.definitions[0]?.definition || "",
    synonyms: meaning?.synonyms?.slice(0, 6) || [],
    notes: "",
    savedAt: Date.now(),
  };
}
