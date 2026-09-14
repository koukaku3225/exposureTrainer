'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { readSettings, writeSettings } from '@/lib/storage';
import type { Settings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  if (!settings) return null;

  function updateCount(count: number) {
    const next = { ...settings!, clearRequirement: { ...settings!.clearRequirement, count } };
    writeSettings(next);
    setSettings(next);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">設定</div>
        <Card>
          <div className="flex justify-between items-center py-1.5">
            <div className="flex flex-col">
              <div className="text-[14.5px] font-bold">次の段へ進む目安</div>
              <div className="text-xs text-dim">
                直近{settings.clearRequirement.count}回・不安{settings.clearRequirement.maxAnxietyAfter}以下
              </div>
            </div>
            <div className="flex gap-1.5">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateCount(n)}
                  className={`w-8 h-8 rounded-full text-sm font-bold ${
                    n === settings.clearRequirement.count ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-black/5">
            <div className="text-[14.5px] font-bold">ごほうびの設定</div>
            <div className="text-xs text-dim">{settings.rewards.length}件</div>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-black/5">
            <div className="text-[14.5px] font-bold">ポイント</div>
            <div className="text-xs text-dim">{settings.points}pt</div>
          </div>
        </Card>
        <Card>
          <Link href="/fear-check" className="flex justify-between items-center py-1">
            <div className="text-[14.5px] font-bold">恐怖チェックをする</div>
            <div className="text-xs text-coral font-bold">14問 ＞</div>
          </Link>
          <Link href="/fear-check/result" className="flex justify-between items-center py-1 border-t border-black/5">
            <div className="text-[14.5px] font-bold">前回の結果を見る</div>
            <div className="text-xs text-coral font-bold">＞</div>
          </Link>
        </Card>
      </div>
      <BottomNav active="settings" />
    </div>
  );
}
