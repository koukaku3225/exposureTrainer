'use client';
import { useState } from 'react';
import { readList, STORAGE_KEYS } from '@/lib/storage';
import { createPlan, SLOTS, updatePlan } from '@/lib/plans';
import type { IfThenPlan, TimeSlot } from '@/lib/plans';
import { getTaskOptions, getStageTitle } from '@/lib/tasks';
import type { Theme } from '@/lib/types';

// イフゼンプランの入力フォーム。plan が null なら新規作成。
// 「やること」は段の課題から選ぶのを基本にし、自由入力もできるようにする。
export function PlanEditor({
  themes,
  plan,
  onSave,
  onCancel,
}: {
  themes: Theme[];
  plan: IfThenPlan | null;
  onSave: (plans: IfThenPlan[]) => void;
  onCancel: () => void;
}) {
  const [themeId, setThemeId] = useState<string>(plan?.themeId ?? themes[0]?.id ?? '');
  const [stageId, setStageId] = useState<string>(plan?.stageId ?? '');
  const [slot, setSlot] = useState<TimeSlot>(plan?.slot ?? 'anytime');
  const [trigger, setTrigger] = useState(plan?.trigger ?? '');
  const [action, setAction] = useState(plan?.action ?? '');

  const theme = themes.find((t) => t.id === themeId) ?? null;
  const stages = theme ? [...theme.stages].sort((a, b) => a.order - b.order) : [];
  const stage = stages.find((s) => s.id === stageId) ?? null;
  const taskOptions = stage ? getTaskOptions(stage) : [];

  function save() {
    const stored = readList<IfThenPlan>(STORAGE_KEYS.plans);
    if (plan) {
      onSave(
        updatePlan(
          stored,
          plan.id,
          {
            themeId: themeId || null,
            stageId: stageId || null,
            slot,
            trigger: trigger.trim(),
            action: action.trim(),
          },
          new Date().toISOString(),
        ),
      );
      return;
    }
    onSave([
      ...stored,
      createPlan({ themeId: themeId || null, stageId: stageId || null, slot, trigger, action }),
    ]);
  }

  return (
    <div className="bg-[#fff4e9] border-[1.5px] border-dashed border-[#ffcda3] rounded-2xl px-3.5 py-3 flex flex-col gap-2">
      <div className="text-[11.5px] text-dim font-bold">{plan ? 'プランを直す' : '新しいプラン'}</div>

      <div className="text-[10.5px] text-dim">どのテーマ・どの段の課題？</div>
      <select
        value={themeId}
        onChange={(e) => {
          setThemeId(e.target.value);
          setStageId('');
        }}
        className="rounded-lg border border-track px-2.5 py-2 text-[13px] bg-white"
      >
        <option value="">テーマに紐づけない（自由なプラン）</option>
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {theme && (
        <select
          value={stageId}
          onChange={(e) => {
            const nextStageId = e.target.value;
            setStageId(nextStageId);
            // 段を選んだら、その段の課題を「やること」の初期値にする（自分で書き換えてよい）
            const picked = stages.find((s) => s.id === nextStageId);
            if (picked && action.trim() === '') setAction(getTaskOptions(picked)[0] ?? '');
          }}
          className="rounded-lg border border-track px-2.5 py-2 text-[13px] bg-white"
        >
          <option value="">段を選ばない</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.level}. {getStageTitle(s)}
              {s.status === 'now' ? '（挑戦中）' : ''}
            </option>
          ))}
        </select>
      )}

      {taskOptions.length > 1 && (
        <div className="flex flex-col gap-1">
          <div className="text-[10.5px] text-dim">この段の課題から選ぶ</div>
          {taskOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setAction(t)}
              className={`text-left rounded-lg border px-2.5 py-1.5 text-[12.5px] bg-white ${
                action === t ? 'border-coral text-coral-dark font-bold' : 'border-track'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="text-[10.5px] text-dim">どんな場面で？（「〜たら」を付けずに入力）</div>
      <input
        value={trigger}
        onChange={(e) => setTrigger(e.target.value)}
        placeholder="例：会議が始まる"
        className="rounded-lg border border-track px-2.5 py-1.5 text-[13px] bg-white"
      />

      <div className="text-[10.5px] text-dim">…になったら、何をする？</div>
      <input
        value={action}
        onChange={(e) => setAction(e.target.value)}
        placeholder="例：一言だけ発言する"
        className="rounded-lg border border-track px-2.5 py-1.5 text-[13px] bg-white"
      />

      <div className="text-[10.5px] text-dim">1日のどのあたり？</div>
      <div className="flex flex-wrap gap-1.5">
        {SLOTS.map((s) => (
          <button
            key={s.slot}
            type="button"
            onClick={() => setSlot(s.slot)}
            className={`h-8 px-3 rounded-lg border text-[12px] font-bold bg-white ${
              slot === s.slot ? 'border-coral text-coral-dark' : 'border-track text-dim'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mt-1">
        <button
          type="button"
          onClick={save}
          disabled={!trigger.trim() || !action.trim()}
          className="flex-grow h-10 rounded-lg bg-coral text-white text-[13px] font-bold disabled:opacity-40"
        >
          {plan ? '保存' : '作る'}
        </button>
        <button type="button" onClick={onCancel} className="h-10 px-3 rounded-lg text-[13px] font-bold text-dim">
          やめる
        </button>
      </div>
    </div>
  );
}
