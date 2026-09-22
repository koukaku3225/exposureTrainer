'use client';
import { useState } from 'react';
import { readList, writeList, STORAGE_KEYS } from '@/lib/storage';
import { padTasks, getStageTitle } from '@/lib/tasks';
import type { Theme } from '@/lib/types';

// 段ごとに、実践のときに選べる課題を最大3件、自由に編集できるフォーム。
export function TaskEditor({
  themeId,
  stageId,
  tasks,
  onSaved,
}: {
  themeId: string;
  stageId: string;
  tasks: string[];
  onSaved: () => void;
}) {
  const [draft, setDraft] = useState<string[]>(padTasks(tasks));
  const [saved, setSaved] = useState(true);

  function updateSlot(index: number, value: string) {
    const next = [...draft];
    next[index] = value;
    setDraft(next);
    setSaved(false);
  }

  function save() {
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    const next = themes.map((t) => {
      if (t.id !== themeId) return t;
      return {
        ...t,
        stages: t.stages.map((s) => {
          if (s.id !== stageId) return s;
          const updated = { ...s, tasks: draft };
          // タイトルは課題1と連動させる。表示は getStageTitle が担うが、
          // 書き出したデータ側もそろえておく
          return { ...updated, name: getStageTitle(updated) };
        }),
        updatedAt: new Date().toISOString(),
      };
    });
    writeList(STORAGE_KEYS.themes, next);
    setSaved(true);
    onSaved();
  }

  return (
    <div className="flex flex-col gap-2 bg-[#fff8f0] rounded-xl px-3 py-3 border border-track">
      <div className="text-[11.5px] text-dim font-bold">課題のバリエーション（最大3件・自由に編集できます）</div>
      <div className="text-[10.5px] text-dim">課題1が、この段のタイトルになります</div>
      {draft.map((t, i) => (
        <input
          key={i}
          value={t}
          onChange={(e) => updateSlot(i, e.target.value)}
          placeholder={i === 0 ? '課題 1（この段のタイトルになります）' : `課題 ${i + 1}（空欄でもよい）`}
          className="rounded-lg border border-track px-2.5 py-1.5 text-[13px] bg-white"
        />
      ))}
      <button
        type="button"
        onClick={save}
        disabled={saved}
        className="h-9 rounded-lg bg-coral text-white text-[13px] font-bold disabled:opacity-40"
      >
        {saved ? '保存済み' : 'この段の課題を保存'}
      </button>
    </div>
  );
}
