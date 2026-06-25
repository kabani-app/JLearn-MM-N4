import { vocabularyN4Part2Sentences1 } from './vocabulary_n4_part2_sentences_1';
import { vocabularyN4Part2Sentences2 } from './vocabulary_n4_part2_sentences_2';
import { vocabularyN4Part2Sentences3 } from './vocabulary_n4_part2_sentences_3';
import { vocabularyN4Part2Sentences4 } from './vocabulary_n4_part2_sentences_4';
import { vocabularyN4Part2Sentences5 } from './vocabulary_n4_part2_sentences_5';

export interface VocabularySentence {
  word: string;
  reading: string;
  example_hiragana: string;
  example_myanmar: string;
}

export const vocabularyN4Part2Sentences: VocabularySentence[] = [
  ...vocabularyN4Part2Sentences1,
  ...vocabularyN4Part2Sentences2,
  ...vocabularyN4Part2Sentences3,
  ...vocabularyN4Part2Sentences4,
  ...vocabularyN4Part2Sentences5
];
