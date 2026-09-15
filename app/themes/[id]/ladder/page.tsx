'use client';
import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { BottomNav } from '@/components/ui/BottomNav';
import { TaskEditor } from '@/components/TaskEditor';
import { useTheme } from '@/lib/useTheme';
import { isStageLocked, retreatOneStage } from '@/lib/progression';
import { getTaskOptions, getEditableTasks } from '@/lib/tasks';
import { readList, writeList, readSettings, STORAGE_KEYS } from '@/lib/storage';
import type { Theme } from '@/lib/types';

export default function LadderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { theme, records, refresh } = useTheme(id);
  const [confirmingRetreat, setConfirmingRetreat] = useState(false);
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);
  if (!theme) return null;
  const settings = readSettings();
  const sorted = [...theme.stages].sort((a, b) => a.order - b.order);
  const nowIndex = sorted.findIndex((s) => s.status === 'now');
  const canRetreat = nowIndex > 0;
  const previousStage = canRetreat ? sorted[nowIndex - 1] : null;

  function retreat() {
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    const next = themes.map((t) => (t.id === id ? retreatOneStage(t) : t));
    writeList(STORAGE_KEYS.themes, next);
    setConfirmingRetreat(false);
    refresh();
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3 overflow-y-auto">
        <div>
          <div className="text-xs text-dim font-bold">難しさ順に下から上へ</div>
          <div className="text-xl font-extrabold">{theme.name} の段階表</div>
        </div>
        <Card>
          {sorted.map((stage) => {
            const locked = isStageLocked(stage, theme, records, settings.guardrailThreshold);
            const expanded = expandedStageId === stage.id;
            const taskCount = getTaskOptions(stage).length;
            return (
              <div key={stage.id} className="border-t border-black/5 first:border-t-0 py-2">
                <button
                  type="button"
                  onClick={() => setExpandedStageId(expanded ? null : stage.id)}
                  className="w-full grid grid-cols-[30px_1fr_auto] items-center gap-2.5 text-left"
                >
                  <div className="text-sm font-black text-center text-amber-dark">{stage.level}</div>
                  <div className="flex flex-col">
                    <div
                      className={`text-[13.5px] ${stage.status === 'clear' ? 'text-dim' : ''} ${
                        stage.status === 'now' ? 'font-bold' : ''
                      }`}
                    >
                      {stage.name}
                    </div>
                    <div className="text-[11px] text-dim">
                      課題 {taskCount}件 ・ {expanded ? '閉じる ▲' : '編集する ▼'}
                    </div>
                  </div>
                  <div>
                    {locked ? (
                      <Chip tone="dim">🔒 ロック中</Chip>
                    ) : stage.status === 'clear' ? (
                      <Chip tone="good">クリア</Chip>
                    ) : stage.status === 'now' ? (
                      <Chip>挑戦中</Chip>
                    ) : null}
                  </div>
                </button>
                {expanded && (
                  <div className="pt-2.5">
                    {/* 今回の機能より前に作られたテーマは tasks を持たない。
                        その場合、編集フォームは代表課題名（name）を1枠目に補って開く
                        （そうしないと「課題1件」表示なのにフォームが全空欄という矛盾になる） */}
                    <TaskEditor
                      themeId={id}
                      stageId={stage.id}
                      tasks={getEditableTasks(stage)}
                      onSaved={refresh}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </Card>
        <div className="flex items-center gap-2 bg-[#fdf1e6] rounded-xl px-3 py-2.5 text-[11.5px] text-dim">
          🔒 難易度{settings.guardrailThreshold}以上は、直近3回を不安3以下でクリアすると解放されます
        </div>
        {canRetreat && (
          <Card>
            {!confirmingRetreat ? (
              <button
                type="button"
                onClick={() => setConfirmingRetreat(true)}
                className="text-left text-[13px] text-dim underline"
              >
                ◀ 無理をしていたら、前の段に戻る
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="text-[13px] leading-relaxed">
                  「{previousStage?.name}」に戻ります。いまの段はもう一度挑戦中に戻ります。
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={retreat}
                    className="flex-grow h-10 rounded-xl bg-coral text-white text-[13px] font-bold"
                  >
                    前の段に戻る
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRetreat(false)}
                    className="h-10 px-3 rounded-xl text-[13px] font-bold text-dim"
                  >
                    やめる
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
      <BottomNav active="ladder" themeId={id} />
    </div>
  );
}
