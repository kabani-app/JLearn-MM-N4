import { Word } from '../types';
import { vocabularyN4Part1 } from './vocabulary_n4_part1';
import { vocabularyN4Part2 } from './vocabulary_n4_part2';
import { getUniqueSentence } from './sentenceDictionary';
import { getOfflineMeanings } from './offlineMeanings';
import { vocabularyN4Part1Sentences } from './vocabulary_n4_part1_sentences';
import { vocabularyN4Part2Sentences } from './vocabulary_n4_part2_sentences';

export function loadVocabulary(): Word[] {
  const list: Word[] = [];

  vocabularyN4Part1.forEach((item, index) => {
    const wordId = `${item.word}|${item.meaning_mm}`;
    const unitStr = `Lesson ${item.unit}`;
    
    // Attempt to find a static generated sentence matching word and reading
    const matched = vocabularyN4Part1Sentences.find(
      (s) => s.word === item.word && s.reading === item.reading
    );
    const sentenceJa = matched ? matched.example_hiragana : getUniqueSentence(item.reading, item.meaning_mm, item.pos, index).ja;
    const sentenceMm = matched ? matched.example_myanmar : getUniqueSentence(item.reading, item.meaning_mm, item.pos, index).mm;

    const offlineMeanings = getOfflineMeanings(item.word, item.meaning_mm, item.pos, index);

    list.push({
      id: wordId,
      part: 'Part 1',
      unit: unitStr,
      hiragana: item.reading,
      kanji: item.word,
      meaning: item.meaning_mm,
      pos: item.pos,
      sentenceJa,
      sentenceMm,
      same_meanings: offlineMeanings.same_meanings,
      opposite_meanings: offlineMeanings.opposite_meanings,
    });
  });

  vocabularyN4Part2.forEach((item, index) => {
    const wordId = `${item.word}|${item.meaning_mm}`;
    const unitStr = `Lesson ${item.unit}`;
    
    // Attempt to find a static generated sentence matching word and reading
    const matched = vocabularyN4Part2Sentences.find(
      (s) => s.word === item.word && s.reading === item.reading
    );
    const sentenceJa = matched ? matched.example_hiragana : getUniqueSentence(item.reading, item.meaning_mm, item.pos, vocabularyN4Part1.length + index).ja;
    const sentenceMm = matched ? matched.example_myanmar : getUniqueSentence(item.reading, item.meaning_mm, item.pos, vocabularyN4Part1.length + index).mm;

    const offlineMeanings = getOfflineMeanings(item.word, item.meaning_mm, item.pos, vocabularyN4Part1.length + index);

    list.push({
      id: wordId,
      part: 'Part 2',
      unit: unitStr,
      hiragana: item.reading,
      kanji: item.word,
      meaning: item.meaning_mm,
      pos: item.pos,
      sentenceJa,
      sentenceMm,
      same_meanings: offlineMeanings.same_meanings,
      opposite_meanings: offlineMeanings.opposite_meanings,
    });
  });

  return list;
}

