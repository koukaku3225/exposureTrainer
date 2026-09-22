'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { PlanEditor } from '@/components/PlanEditor';
import { readList, writeList, STORAGE_KEYS } from '@/lib/storage';
import {
  countPlanRecords,
  groupBySlot,
  migrateLegacyIfThen,
  removePlan,
  setPlanActive,
  SLOTS,
} from '@/lib/plans';
import type { IfThenPlan } from '@/lib/plans';
import { splitByVisibility } from '@/lib/themeAdmin';
import type { PracticeRecord, Theme } from '@/lib/types';

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<IfThenPlan[] | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const storedThemes = readList<Theme>(STORAGE_KEYS.themes);
    const storedPlans = readList<IfThenPlan>(STORAGE_KEYS.plans);
    const migrated = migrateLegacyIfThen(storedThemes, storedPlans);
    if (migrated.migrated) {
      writeList(STORAGE_KEYS.themes, migrated.themes);
      writeList(STORAGE_KEYS.plans, migrated.plans);
    }
    setThemes(migrated.themes);
    setPlans(migrated.plans);
    setRecords(readList<PracticeRecord>(STORAGE_KEYS.records));
  }, []);

  function savePlans(next: IfThenPlan[]) {
    writeList(STORAGE_KEYS.plans, next);
    setPlans(next);
  }

  function practice(plan: IfThenPlan) {
    if (!plan.themeId) return;
    const params = new URLSearchParams({ planId: plan.id });
    router.push(`/themes/${plan.themeId}/practice?${params.toString()}`);
  }

  if (plans === null) return null;
  const visibleThemes = splitByVisibility(themes).visible;
  const groups = groupBySlot(plans);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div>
          <div className="text-xs text-dim font-bold">「◯◯になったら、△△する」</div>
          <div className="text-xl font-extrabold">イフゼンプラン</div>
        </div>
        <div className="text-[12.5px] text-dim leading-relaxed">
          やると決めた課題を、日常のどの場面でやるかまで決めておくと思い出しやすくなります。
        </div>

        {plans.length === 0 && !adding && (
          <div className="text-[13px] text-dim">
            まだプランがありません。下の「＋ プランを追加」から、挑みたい課題と、その場面を決めてみましょう。
          </div>
        )}

        {groups.map((group) => (
          <div key={group.slot} className="flex flex-col gap-2">
            <div className="text-[13px] font-extrabold text-coral-dark">{group.label}</div>
            {group.plans.map((plan) => {
              const theme = themes.find((t) => t.id === plan.themeId);
              const count = countPlanRecords(records, plan.id);
              if (editingId === plan.id) {
                return (
                  <PlanEditor
                    key={plan.id}
                    themes={visibleThemes}
                    plan={plan}
                    onSave={(next) => {
                      savePlans(next);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                );
              }
              return (
                <Card key={plan.id} className={plan.active ? '' : 'opacity-60'}>
                  <div className="text-[13.5px] leading-relaxed">
                    <b>{plan.trigger}</b>
                    <span className="text-dim"> になったら</span>
                    <br />→ <b className="text-coral-dark">{plan.action}</b>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-dim">
                    {theme && <span>{theme.name}</span>}
                    <span>・この場面で {count}回</span>
                    {!plan.active && <span>・お休み中</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    {plan.themeId && plan.active && (
                      <button
                        type="button"
                        onClick={() => practice(plan)}
                        className="h-9 px-4 rounded-xl bg-coral text-white text-[13px] font-bold"
                      >
                        やった
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingId(plan.id)}
                      className="h-9 px-3 rounded-xl border border-track text-[13px] font-bold text-dim"
                    >
                      直す
                    </button>
                    <button
                      type="button"
                      onClick={() => savePlans(setPlanActive(plans, plan.id, !plan.active, new Date().toISOString()))}
                      className="h-9 px-3 rounded-xl border border-track text-[13px] font-bold text-dim"
                    >
                      {plan.active ? 'お休み' : '再開'}
                    </button>
                    <button
                      type="button"
                      onClick={() => savePlans(removePlan(plans, plan.id))}
                      className="h-9 px-3 rounded-xl text-[13px] font-bold text-dim"
                    >
                      消す
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        ))}

        {adding ? (
          <PlanEditor
            themes={visibleThemes}
            plan={null}
            onSave={(next) => {
              savePlans(next);
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-left text-[13px] font-bold text-coral mt-1"
          >
            ＋ プランを追加
          </button>
        )}

        {plans.length > 0 && (
          <div className="text-[11px] text-dim mt-1">
            場面の並び: {SLOTS.map((s) => s.label).join(' → ')}
          </div>
        )}
      </div>
      <BottomNav active="plans" />
    </div>
  );
}
