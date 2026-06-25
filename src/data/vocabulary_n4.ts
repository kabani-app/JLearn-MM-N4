import { vocabularyN4Part1, N4Word } from './vocabulary_n4_part1';
import { vocabularyN4Part2 } from './vocabulary_n4_part2';

export const vocabularyN4: N4Word[] = [
  ...vocabularyN4Part1,
  ...vocabularyN4Part2
];

export type { N4Word };
