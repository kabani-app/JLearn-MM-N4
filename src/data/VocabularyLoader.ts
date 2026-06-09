import { Word } from '../types';
import part1Content from './n3_part1.txt?raw';
import part2Content from './n3_part2.txt?raw';
import { getUniqueSentence } from './sentenceDictionary';
import { getOfflineMeanings } from './offlineMeanings';

function getPos(kanji: string, unitName: string): string {
  const lowerUnit = unitName.toLowerCase();
  if (lowerUnit.includes('verb') || lowerUnit.includes('action')) return 'Verb';
  if (lowerUnit.includes('adjective') || lowerUnit.includes('emotion')) return 'Adjective';
  if (lowerUnit.includes('adverb')) return 'Adverb';

  const cleanKanji = kanji.replace(/[~〜()（）]/g, '').trim();
  if (cleanKanji.length > 0) {
    const lastChar = cleanKanji.charAt(cleanKanji.length - 1);
    if (/[うくるすむぶぬ]$/.test(lastChar)) return 'Verb';
    if (cleanKanji.endsWith('な') || cleanKanji.endsWith('い')) return 'Adjective';
  }
  return 'Noun';
}

export function loadVocabulary(): Word[] {
  const list: Word[] = [];
  parseAsset(part1Content, 'Part 1', list);
  parseAsset(part2Content, 'Part 2', list);
  return list;
}

function parseAsset(content: string, partName: string, outList: Word[]): void {
  try {
    const lines = content.split(/\r?\n/);
    let currentUnit = '';
    let wordsInUnit = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;

      if (trimmed.startsWith('#')) {
        currentUnit = trimmed.substring(1).trim();
        wordsInUnit = 0;
      } else if (currentUnit.length > 0) {
        // Words are semicolon-separated in a single line or list
        const words = trimmed.split(';');
        for (const wordStr of words) {
          const parts = wordStr.split('|');
          if (parts.length >= 3) {
            const hiragana = parts[0].trim();
            const kanji = parts[1].trim() || hiragana;
            const meaning = parts[2].trim();
            const wordId = `${kanji}|${meaning}`;
            const pos = getPos(kanji, currentUnit);
            const sentence = getUniqueSentence(kanji, meaning, pos, wordsInUnit);
            const offlineMeanings = getOfflineMeanings(kanji, meaning, pos, outList.length + wordsInUnit);

            outList.push({
              id: wordId,
              part: partName,
              unit: currentUnit,
              hiragana,
              kanji,
              meaning,
              pos,
              sentenceJa: sentence.ja,
              sentenceMm: sentence.mm,
              same_meanings: offlineMeanings.same_meanings,
              opposite_meanings: offlineMeanings.opposite_meanings,
            });
            wordsInUnit++;
          }
        }
      }
    }
  } catch (e) {
    console.error('Error parsing asset content:', e);
  }
}

