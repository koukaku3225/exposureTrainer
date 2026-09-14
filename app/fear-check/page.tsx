'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FEAR_QUESTIONS } from '@/lib/fearCheck';
import { readList, writeList, STORAGE_KEYS } from '@/lib/storage';
import type { FearCheckResult } from '@/lib/types';

export default function FearCheckPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  function answer(value: boolean) {
    const next = [...answers, value];
    if (index + 1 >= FEAR_QUESTIONS.length) {
      const result: FearCheckResult = {
        id: crypto.randomUUID(),
        answers: next,
        createdAt: new Date().toISOString(),
      };
      const all = readList<FearCheckResult>(STORAGE_KEYS.fearChecks);
      writeList(STORAGE_KEYS.fearChecks, [...all, result]);
      router.push('/fear-check/result');
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream px-4 pt-11 pb-8 gap-3.5">
      <div className="flex items-center gap-2.5">
        <ProgressBar percent={((index + 1) / FEAR_QUESTIONS.length) * 100} />
        <div className="text-[13px] font-extrabold text-dim">
          {index + 1}/{FEAR_QUESTIONS.length}
        </div>
      </div>
      <Card>
        <div className="text-xs text-dim">しつもん {index + 1}</div>
        <div className="text-lg font-extrabold leading-relaxed min-h-[100px]">{FEAR_QUESTIONS[index]}</div>
      </Card>
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => answer(true)}
          className="h-[54px] rounded-[18px] bg-coral text-white font-extrabold"
        >
          はい
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          className="h-[54px] rounded-[18px] bg-white text-coral border-[1.5px] border-track font-extrabold"
        >
          いいえ
        </button>
      </div>
      <div className="flex-grow" />
      <div className="text-[11.5px] text-dim text-center leading-relaxed">
        正解はありません。思ったとおりに答えてください。
        <br />
        これは診断ではなく、怖がりやすい種類を知るためのものです
      </div>
    </div>
  );
}
