'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnxietyScale } from '@/components/ui/AnxietyScale';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { meetsClearRequirement } from '@/lib/progression';
import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS } from '@/lib/storage';
import type { PracticeRecord, Theme } from '@/lib/types';

const CHOICES = [
  ['advance', '次の段へ進む', '次の課題に挑戦する'],
  ['repeat', 'もう少しこの段を続ける', 'あと数回、同じ課題で慣れる'],
  ['stop_here', '今回はここでよかった', '今日はここまでにする'],
] as const;

export default function PracticePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { theme, records, refresh } = useTheme(id);
  const [before, setBefore] = useState<number | null>(null);
  const [after, setAfter] = useState<number | null>(null);
  const [isImagined, setIsImagined] = useState(false);
  const [memo, setMemo] = useState('');
  const [saved, setSaved] = useState<PracticeRecord | null>(null);

  if (!theme) return null;
  const now = theme.stages.find((s) => s.status === 'now');
  const settings = readSettings();

  // 全段クリア済み、あるいはテーマ作成直後で挑戦中の段がない場合は、
  // 白紙にせず案内を出してテーマ詳細に戻れるようにする。
  if (!now) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
          <div className="text-xl font-extrabold">実践を記録</div>
          <Card>
            <div className="text-sm leading-relaxed">
              「{theme.name}」はいま挑戦中の段がありません。全段クリアしているか、まだ段が設定されていません。
            </div>
            <Link href={`/themes/${id}`}>
              <Button variant="secondary">テーマの詳細に戻る</Button>
            </Link>
          </Card>
        </div>
        <BottomNav active="practice" themeId={id} practiceEnabled={false} />
      </div>
    );
  }

  function save() {
    if (before === null || after === null) return;
    const record: PracticeRecord = {
      id: crypto.randomUUID(),
      themeId: id,
      stageId: now!.id,
      freeText: null,
      memo: memo.trim() || null,
      isImagined,
      anxietyBefore: before,
      anxietyAfter: after,
      choice: null,
      createdAt: new Date().toISOString(),
    };
    const all = readList<PracticeRecord>(STORAGE_KEYS.records);
    writeList(STORAGE_KEYS.records, [...all, record]);
    setSaved(record);
    refresh();
  }

  function choose(choice: PracticeRecord['choice']) {
    if (!saved) return;
    const allRecords = readList<PracticeRecord>(STORAGE_KEYS.records).map((r) =>
      r.id === saved.id ? { ...r, choice } : r,
    );
    writeList(STORAGE_KEYS.records, allRecords);

    if (choice === 'advance') {
      const themes = readList<Theme>(STORAGE_KEYS.themes);
      const nextThemes = themes.map((t) => {
        if (t.id !== id) return t;
        const sorted = [...t.stages].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((s) => s.id === now!.id);
        const updatedStages = sorted.map((s, i) => {
          if (i === idx) return { ...s, status: 'clear' as const };
          if (i === idx + 1) return { ...s, status: 'now' as const };
          return s;
        });
        return { ...t, stages: updatedStages, updatedAt: new Date().toISOString() };
      });
      writeList(STORAGE_KEYS.themes, nextThemes);
    }

    const currentSettings = readSettings();
    writeSettings({ ...currentSettings, points: currentSettings.points + 5 });

    router.push(`/themes/${id}`);
  }

  const canSave = before !== null && after !== null;
  const willClear = saved
    ? meetsClearRequirement([...records, saved], now.id, settings.clearRequirement)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">実践を記録</div>
        {!saved ? (
          <>
            <Card>
              <div className="text-xs text-dim">
                {theme.name} ／ 難しさ{now.level}
              </div>
              <div className="text-base font-extrabold">{now.name}</div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsImagined(false)}
                  className={`flex-grow h-[38px] rounded-xl text-[12.5px] font-bold ${
                    !isImagined ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'
                  }`}
                >
                  現実でやった
                </button>
                <button
                  type="button"
                  onClick={() => setIsImagined(true)}
                  className={`flex-grow h-[38px] rounded-xl text-[12.5px] font-bold ${
                    isImagined ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'
                  }`}
                >
                  想像でやった
                </button>
              </div>
              <AnxietyScale label="はじめる前の不安" value={before} onChange={setBefore} />
              <AnxietyScale label="終わった後の不安" value={after} onChange={setAfter} />
              <div className="flex flex-col gap-1.5">
                <div className="text-[13px] text-dim font-bold">メモ（任意）</div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="例：声が少し震えたが、誰も気にしていなかった"
                  rows={2}
                  className="rounded-xl border border-track px-3 py-2 text-[13px] bg-white resize-none"
                />
              </div>
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className="h-[46px] rounded-[14px] bg-coral text-white font-extrabold disabled:opacity-40"
              >
                {canSave ? '記録する' : '不安のスコアを2つとも選んでください'}
              </button>
            </Card>
            <Link href={`/themes/${id}/practice/freeform`} className="text-center text-[12.5px] text-dim underline">
              段階表にない、予定外の出来事を記録する
            </Link>
          </>
        ) : (
          <Card>
            <div className="text-[13.5px] leading-relaxed">
              不安が <b className="text-coral">{saved.anxietyBefore - saved.anxietyAfter}</b> 下がりました。ゆうき{' '}
              <b className="text-coral">+5pt</b>
              {willClear ? '。合格ラインに達しました。' : '。'}
            </div>
            <div className="text-[11.5px] text-dim font-bold">どうしますか？（どれを選んでも大丈夫です）</div>
            {CHOICES.map(([choice, label, sub]) => (
              <button
                key={choice}
                type="button"
                onClick={() => choose(choice)}
                className="text-left rounded-2xl px-3.5 py-3 bg-white border-[1.5px] border-track flex items-center gap-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="text-sm font-extrabold">{label}</div>
                  <div className="text-[11.5px] text-dim">{sub}</div>
                </div>
              </button>
            ))}
          </Card>
        )}
      </div>
      <BottomNav active="practice" themeId={id} />
    </div>
  );
}
