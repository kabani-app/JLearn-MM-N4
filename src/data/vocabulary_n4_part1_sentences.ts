import { vocabularyN4Part1Sentences1 } from './vocabulary_n4_part1_sentences_1';
import { vocabularyN4Part1Sentences2 } from './vocabulary_n4_part1_sentences_2';
import { vocabularyN4Part1Sentences3 } from './vocabulary_n4_part1_sentences_3';
import { vocabularyN4Part1Sentences4 } from './vocabulary_n4_part1_sentences_4';
import { vocabularyN4Part1Sentences5 } from './vocabulary_n4_part1_sentences_5';

export interface VocabularySentence {
  word: string;
  reading: string;
  example_hiragana: string;
  example_myanmar: string;
}

export const vocabularyN4Part1Sentences: VocabularySentence[] = [
  ...vocabularyN4Part1Sentences1,
  ...vocabularyN4Part1Sentences2,
  ...vocabularyN4Part1Sentences3,
  ...vocabularyN4Part1Sentences4,
  ...vocabularyN4Part1Sentences5
];
