'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreFearCheck } from '@/lib/fearCheck';
import { readList, STORAGE_KEYS } from '@/lib/storage';
import { THEME_TEMPLATES } from '@/lib/themeTemplates';
import type { FearCheckResult } from '@/lib/types';

const CATEGORY_TO_TEMPLATE: Record<string, string> = {
  reputation: 'shame',
  rejection: 'rejection',
  control: 'control',
  connection: 'connection',
  failure: 'public-speaking',
};

export default function FearCheckResultPage() {
  const [scores, setScores] = useState<ReturnType<typeof scoreFearCheck>>([]);

  useEffect(() => {
    const all = readList<FearCheckResult>(STORAGE_KEYS.fearChecks);
    const latest = all.at(-1);
    if (latest) setScores(scoreFearCheck(latest.answers));
  }, []);

  if (scores.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-cream px-4 pt-11 pb-8 gap-3.5">
        <div className="text-xl font-extrabold">あなたの恐怖のかたち</div>
        <div className="text-[13px] text-dim">
          まだチェックを受けていません。
          <Link href="/fear-check" className="text-coral font-bold">
            恐怖チェックをはじめる
          </Link>
        </div>
      </div>
    );
  }

  const maxRatio = Math.max(...scores.map((s) => s.yes / s.total));

  return (
    <div className="min-h-screen flex flex-col bg-cream px-4 pt-11 pb-8 gap-3.5">
      <div className="text-xl font-extrabold">あなたの恐怖のかたち</div>
      <Card>
        {scores.map((s) => {
          const ratio = s.yes / s.total;
          const top = ratio === maxRatio && ratio > 0;
          return (
            <div key={s.key} className="flex flex-col gap-1.5">
              <div className={`flex justify-between text-[13.5px] ${top ? 'font-extrabold text-coral' : ''}`}>
                <div>
                  {top ? '★ ' : ''}
                  {s.label}
                </div>
                <div className="text-dim font-bold">
                  {s.yes}/{s.total}
                </div>
              </div>
              <ProgressBar percent={Math.round(ratio * 100)} color={top ? '#ff6f3c' : '#ffe0cc'} />
            </div>
          );
        })}
      </Card>
      <div className="flex flex-col gap-2">
        {scores
          .filter((s) => s.yes / s.total === maxRatio && maxRatio > 0)
          .map((s) => (
            <Link
              key={s.key}
              href="/"
              className="bg-white border border-track rounded-2xl px-4 py-3 flex flex-col gap-0.5"
            >
              <div className="text-sm font-extrabold">{s.label}</div>
              <div className="text-[11.5px] text-dim">
                {THEME_TEMPLATES.find((t) => t.id === CATEGORY_TO_TEMPLATE[s.key])?.name} の段階表へ
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
