'use client';
import { useState } from 'react';
import { readList, writeList, STORAGE_KEYS } from '@/lib/storage';
import type { Theme } from '@/lib/types';

// アイデア1（if-thenプランニング）の入力・編集フォーム。
// 「次にXが起きたらYをやる」をテーマごとに1つだけ持てる。
export function IfThenEditor({
  themeId,
  ifThen,
  onSaved,
}: {
  themeId: string;
  ifThen: { trigger: string; action: string } | null;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [trigger, setTrigger] = useState(ifThen?.trigger ?? '');
  const [action, setAction] = useState(ifThen?.action ?? '');

  function save() {
    const t = trigger.trim();
    const a = action.trim();
    if (!t || !a) return;
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    const next = themes.map((th) =>
      th.id === themeId ? { ...th, ifThen: { trigger: t, action: a }, updatedAt: new Date().toISOString() } : th,
    );
    writeList(STORAGE_KEYS.themes, next);
    setEditing(false);
    onSaved();
  }

  function remove() {
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    const next = themes.map((th) =>
      th.id === themeId ? { ...th, ifThen: null, updatedAt: new Date().toISOString() } : th,
    );
    writeList(STORAGE_KEYS.themes, next);
    setTrigger('');
    setAction('');
    setEditing(false);
    onSaved();
  }

  if (editing) {
    return (
      <div className="bg-[#fff4e9] border-[1.5px] border-dashed border-[#ffcda3] rounded-2xl px-3.5 py-3 flex flex-col gap-2">
        <div className="text-[11.5px] text-dim font-bold">次の一歩を決める</div>
        <div className="text-[10.5px] text-dim">次に…（「〜たら」を付けずに入力）</div>
        <input
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
          placeholder="例：会議が始まる"
          className="rounded-lg border border-track px-2.5 py-1.5 text-[13px] bg-white"
        />
        <div className="text-[10.5px] text-dim">…になったら</div>
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="例：一言だけ発言する"
          className="rounded-lg border border-track px-2.5 py-1.5 text-[13px] bg-white"
        />
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={save}
            disabled={!trigger.trim() || !action.trim()}
            className="flex-grow h-9 rounded-lg bg-coral text-white text-[13px] font-bold disabled:opacity-40"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-9 px-3 rounded-lg text-[13px] font-bold text-dim"
          >
            やめる
          </button>
        </div>
      </div>
    );
  }

  if (ifThen) {
    return (
      <div className="bg-[#fff4e9] border-[1.5px] border-dashed border-[#ffcda3] rounded-2xl px-3.5 py-3 flex items-center gap-2">
        <button type="button" onClick={() => setEditing(true)} className="flex-grow text-left text-[12.5px] leading-relaxed">
          <span className="text-dim">次の一歩：</span>
          <b>{ifThen.trigger}</b> になったら → <b className="text-coral-dark">{ifThen.action}</b>
        </button>
        <button type="button" onClick={remove} className="text-[11px] text-dim flex-shrink-0">
          消す
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className="text-left border-[1.5px] border-dashed border-track rounded-2xl px-3.5 py-3 text-[12.5px] text-dim"
    >
      ＋ 次の一歩を決める（次にXが起きたらYをやる）
    </button>
  );
}
