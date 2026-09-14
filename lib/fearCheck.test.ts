import { describe, it, expect } from 'vitest';
import { FEAR_CATEGORIES, scoreFearCheck } from './fearCheck';

describe('FEAR_CATEGORIES', () => {
  it('5分類・14問ぶん重複なく揃っている', () => {
    const all = FEAR_CATEGORIES.flatMap((c) => c.questionIndexes);
    expect(FEAR_CATEGORIES.length).toBe(5);
    expect(all.length).toBe(14);
    expect(new Set(all).size).toBe(14);
  });
});

describe('scoreFearCheck', () => {
  it('各分類のはい数/問題数を返す', () => {
    const answers = Array(14).fill(false);
    answers[0] = true;
    answers[1] = true; // 失敗（1,2,3問目）のうち2問はい
    const scores = scoreFearCheck(answers);
    const failure = scores.find((s) => s.key === 'failure')!;
    expect(failure.yes).toBe(2);
    expect(failure.total).toBe(3);
  });
});
