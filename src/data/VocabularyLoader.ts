import { Word } from '../types';
import part1Content from './n3_part1.txt?raw';
import part2Content from './n3_part2.txt?raw';

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

interface Sentence {
  ja: string;
  mm: string;
}

function generateDynamicSentence(
  kanji: string,
  _meaning: string,
  unitName: string,
  wordIndex: number
): Sentence {
  const cleanKanji = kanji.replace(/[~〜()（）]/g, '').trim();
  const lowerUnit = unitName.toLowerCase();

  const randomSelect = (...items: Sentence[]): Sentence => {
    return items[wordIndex % items.length];
  };

  if (lowerUnit.includes('time')) {
    return randomSelect(
      { ja: `${cleanKanji}、友達に会いました。`, mm: `${cleanKanji} သူငယ်ချင်းနဲ့ တွေ့ခဲ့တယ်။` },
      { ja: `${cleanKanji}の予定を教えてください。`, mm: `${cleanKanji} ရဲ့ အစီအစဉ်ကို ပြောပြပေးပါ။` }
    );
  } else if (lowerUnit.includes('family') || lowerUnit.includes('people')) {
    return randomSelect(
      { ja: `私の${cleanKanji}はとても優しいです。`, mm: `ကျွန်တော့်ရဲ့ ${cleanKanji} က အရမ်းသဘောကောင်းတယ်။` }
    );
  } else if (lowerUnit.includes('eating')) {
    return randomSelect(
      { ja: `美味しい${cleanKanji}を食べたいです。`, mm: `အရသာရှိတဲ့ ${cleanKanji} ကို စားချင်တယ်။` }
    );
  } else {
    return randomSelect(
      { ja: `新しい${cleanKanji}を見つけました。`, mm: `${cleanKanji} အသစ်ကို တွေ့ရှိခဲ့တယ်။` },
      { ja: `この${cleanKanji}はとても便利です。`, mm: `ဒီ ${cleanKanji} က အရမ်းအသုံးဝင်တယ်။` }
    );
  }
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
            const sentence = generateDynamicSentence(kanji, meaning, currentUnit, wordsInUnit);

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
