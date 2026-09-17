'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { GrowthForest } from '@/components/GrowthForest';
import { readList, readSettings, STORAGE_KEYS } from '@/lib/storage';
import { buildGrowth } from '@/lib/growth';
import type { PracticeRecord, Theme } from '@/lib/types';

export default function ReviewPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setRecords(readList<PracticeRecord>(STORAGE_KEYS.records));
    setThemes(readList<Theme>(STORAGE_KEYS.themes));
    setPoints(readSettings().points);
  }, []);

  const totalCount = records.length;
  const totalDrop = records.reduce((sum, r) => sum + Math.max(0, r.anxietyBefore - r.anxietyAfter), 0);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = records.filter((r) => new Date(r.createdAt).getTime() >= oneWeekAgo);

  const growth = buildGrowth(themes, records);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">振り返り</div>
        {growth.trees.length > 0 && (
          <div className="bg-white rounded-[18px] shadow-[0_2px_10px_rgba(58,42,23,0.05)] overflow-hidden">
            <div className="px-4 pt-3.5 pb-1 flex items-center justify-between">
              <div className="text-[13.5px] font-extrabold">あなたの森</div>
              <div className="text-[11px] text-dim">実践するほど育ちます</div>
            </div>
            <GrowthForest model={growth} label="テーマごとの木。実践するほど大きく、段をクリアすると花が咲きます" />
          </div>
        )}
        <Card>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-[22px] font-black text-coral">
                {totalCount}
                <span className="text-xs text-dim">回</span>
              </div>
              <div className="text-[11px] text-dim">はじめてからの累計</div>
            </div>
            <div className="w-px bg-track" />
            <div>
              <div className="text-[22px] font-black text-coral">−{totalDrop}</div>
              <div className="text-[11px] text-dim">不安スコアの合計低下</div>
            </div>
          </div>
          <div className="text-[11px] text-dim text-center">どちらも積み上がるだけで、減ることはありません</div>
        </Card>
        <Card>
          <div className="text-[13.5px] font-extrabold">今週の実践</div>
          <div className="text-sm text-dim">
            {thisWeek.length}回（ポイント合計 {points}pt）
          </div>
        </Card>
        {records.length === 0 && (
          <div className="text-[13px] text-dim">まだ記録がありません。テーマの「いどむ」から始めてみましょう</div>
        )}
      </div>
      <BottomNav active="review" />
    </div>
  );
}
