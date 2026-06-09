export interface MeaningEntry {
  word: string;
  reading: string;
  meaning_mm: string;
}

export interface Word {
  id: string; // "kanji|meaning"
  part: string; // "Part 1" or "Part 2"
  unit: string; // e.g., "Unit 1: Time"
  hiragana: string;
  kanji: string;
  meaning: string;
  pos: string; // e.g., "Verb", "Noun", "Adjective", etc.
  sentenceJa: string;
  sentenceMm: string;
  same_meanings: MeaningEntry[];
  opposite_meanings: MeaningEntry[];
}

export type ThemeMode = 'light' | 'dark';

export interface AppSettings {
  darkMode: boolean;
  lastStudiedUnit?: string;
}

export interface ColorPalette {
  background: string;
  surface: string;
  cardBackground: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primaryAccent: string;
  primaryAccentMuted: string;
  greenAccent: string;
  greenAccentBg: string;
  amberAccent: string;
  amberAccentBg: string;
  sameBtnBg: string;
  sameBtnText: string;
  sameBtnBdr: string;
  diffBtnBg: string;
  diffBtnText: string;
  diffBtnBdr: string;
  aiResultBg: string;
}
