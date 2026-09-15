'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnxietyScale } from '@/components/ui/AnxietyScale';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS } from '@/lib/storage';
import type { PracticeRecord } from '@/lib/types';

// 段階表の課題ではなく、予定外に起きた出来事を自由記述で記録する画面。
// 例：急遽、社内会議のリーダーを任された。
export default function FreeformPracticePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { theme } = useTheme(id);
  const [text, setText] = useState('');
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  if (!theme) return null;

  const canSave = text.trim().length > 0 && before !== null && after !== null;

  function save() {
    if (!canSave) return;
    const record: PracticeRecord = {
      id: crypto.randomUUID(),
      themeId: id,
      stageId: null,
      freeText: text.trim(),
      memo: null,
      isImagined: false,
      anxietyBefore: before as number,
      anxietyAfter: after as number,
      choice: null,
      createdAt: new Date().toISOString(),
    };
    const all = readList<PracticeRecord>(STORAGE_KEYS.records);
    writeList(STORAGE_KEYS.records, [...all, record]);

    const settings = readSettings();
    writeSettings({ ...settings, points: settings.points + 5 });

    setSaved(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">予定外の出来事を記録する</div>
        {!saved ? (
          <Card>
            <div className="text-xs text-dim">{theme.name}</div>
            <div className="flex flex-col gap-1.5">
              <div className="text-[13px] text-dim font-bold">何をしましたか？</div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="例：急遽、社内会議のリーダーを任された"
                rows={3}
                className="rounded-xl border border-track px-3 py-2 text-[13px] bg-white resize-none"
              />
            </div>
            <AnxietyScale label="予想した不快感" value={before} onChange={setBefore} />
            <AnxietyScale label="実際の不快感" value={after} onChange={setAfter} />
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="h-[46px] rounded-[14px] bg-coral text-white font-extrabold disabled:opacity-40"
            >
              {canSave ? '記録する' : '内容と不快感を入力してください'}
            </button>
          </Card>
        ) : (
          <Card>
            <div className="text-[13.5px] leading-relaxed">記録しました。ゆうき +5pt</div>
            <div className="text-[12px] text-dim leading-relaxed">
              段階表には数えませんが、振り返りの累計には反映されます。
            </div>
            <Link href={`/themes/${id}`}>
              <Button>テーマの詳細に戻る</Button>
            </Link>
          </Card>
        )}
      </div>
      <BottomNav active="practice" themeId={id} />
    </div>
  );
}
