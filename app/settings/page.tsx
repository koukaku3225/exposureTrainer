'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { readSettings, writeSettings } from '@/lib/storage';
import { buildBackup, restoreBackup, isValidBackup } from '@/lib/backup';
import type { Settings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  if (!settings) return null;

  function updateCount(count: number) {
    const next = { ...settings!, clearRequirement: { ...settings!.clearRequirement, count } };
    writeSettings(next);
    setSettings(next);
  }

  function exportData() {
    const backup = buildBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `exposure-trainer-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(file: File) {
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isValidBackup(parsed)) {
          setImportError('このファイルはバックアップの形式ではないようです。');
          return;
        }
        const ok = window.confirm('現在のデータはすべて上書きされます。読み込みますか？');
        if (!ok) return;
        restoreBackup(parsed);
        window.location.reload();
      } catch {
        setImportError('ファイルを読み取れませんでした。JSON形式か確認してください。');
      }
    };
    reader.readAsText(file);
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
        <Card>
          <div className="text-[14.5px] font-bold">データの書き出し・読み込み</div>
          <div className="text-xs text-dim leading-relaxed">
            記録はこの端末のブラウザにだけ保存されています。他の端末に移すときや、消える前の保険として使ってください。
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportData}
              className="flex-grow h-10 rounded-xl bg-white border border-track text-[13px] font-bold text-coral"
            >
              書き出す
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-grow h-10 rounded-xl bg-white border border-track text-[13px] font-bold text-coral"
            >
              読み込む
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = '';
            }}
          />
          {importError && <div className="text-xs text-[#c1442a]">{importError}</div>}
        </Card>
      </div>
      <BottomNav active="settings" />
    </div>
  );
}
