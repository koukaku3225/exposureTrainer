'use client';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { isStageLocked } from '@/lib/progression';
import { readSettings } from '@/lib/storage';

export default function LadderPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { theme, records } = useTheme(id);
  if (!theme) return null;
  const settings = readSettings();
  const sorted = [...theme.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3">
        <div>
          <div className="text-xs text-dim font-bold">難しさ順に下から上へ</div>
          <div className="text-xl font-extrabold">{theme.name} の段階表</div>
        </div>
        <Card>
          {sorted.map((stage) => {
            const locked = isStageLocked(stage, theme, records, settings.guardrailThreshold);
            return (
              <div
                key={stage.id}
                className="grid grid-cols-[30px_1fr_auto] items-center gap-2.5 py-2 border-t border-black/5 first:border-t-0"
              >
                <div className="text-sm font-black text-center text-amber-dark">{stage.level}</div>
                <div
                  className={`text-[13.5px] ${stage.status === 'clear' ? 'text-dim' : ''} ${
                    stage.status === 'now' ? 'font-bold' : ''
                  }`}
                >
                  {stage.name}
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
              </div>
            );
          })}
        </Card>
        <div className="flex items-center gap-2 bg-[#fdf1e6] rounded-xl px-3 py-2.5 text-[11.5px] text-dim">
          🔒 難易度{settings.guardrailThreshold}以上は、直近3回を不安3以下でクリアすると解放されます
        </div>
      </div>
      <BottomNav active="ladder" themeId={id} />
    </div>
  );
}
