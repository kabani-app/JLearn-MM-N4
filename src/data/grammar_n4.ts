import { grammarPart1, RawGrammar } from './grammar_n4_part1';
import { grammarPart2 } from './grammar_n4_part2';
import { grammarPart3 } from './grammar_n4_part3';

export interface GrammarExamplePart {
  text: string;
  type: "grammar" | "verb" | "noun" | "particle" | "normal";
}

export interface GrammarExample {
  japanese: string;
  japanese_parts?: GrammarExamplePart[];
  reading: string;
  myanmar: string;
}

export interface GrammarEntry {
  id: number;
  pattern: string;
  reading: string;
  meaning_mm: string;
  explanation_mm: string;
  examples: GrammarExample[];
  category: string;
  level: string;
}

export function parseJapaneseParts(text: string): GrammarExamplePart[] {
  const regex = /\[([NVAPT]):([^\]]+)\]|([^\[]+)/g;
  const parts: GrammarExamplePart[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      const tag = match[1];
      const content = match[2];
      let type: "grammar" | "verb" | "noun" | "particle" | "normal" = "normal";
      if (tag === 'T') type = "grammar";
      else if (tag === 'N') type = "noun";
      else if (tag === 'V') type = "verb";
      else if (tag === 'P') type = "particle";
      parts.push({ text: content, type });
    } else if (match[3]) {
      parts.push({ text: match[3], type: "normal" });
    }
  }
  return parts;
}

export function cleanJapaneseSentence(text: string): string {
  return text.replace(/\[[NVAPT]:([^\]]+)\]/g, '$1');
}

// Combine all three parts
const rawList: RawGrammar[] = [
  ...grammarPart1,
  ...grammarPart2,
  ...grammarPart3
];

// Transform to type-safe GrammarEntry[] format
export const grammarData: GrammarEntry[] = rawList.map((item) => {
  return {
    id: item.id,
    pattern: item.pattern,
    reading: item.reading,
    meaning_mm: item.meaning_mm,
    explanation_mm: item.explanation_mm,
    category: item.category,
    level: "N4",
    examples: item.examples.map((ex) => {
      return {
        japanese: cleanJapaneseSentence(ex.japanese),
        japanese_parts: parseJapaneseParts(ex.japanese),
        reading: ex.reading,
        myanmar: ex.myanmar
      };
    })
  };
});
