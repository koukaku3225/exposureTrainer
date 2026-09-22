'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { readList, readSettings, STORAGE_KEYS } from '@/lib/storage';
import type { IfThenPlan } from '@/lib/plans';

export default function ThemeDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { theme, records } = useTheme(id);

  if (!theme) return null;
  const themePlans = readList<IfThenPlan>(STORAGE_KEYS.plans).filter((p) => p.themeId === id && p.active);
  const settings = readSettings();
  const now = theme.stages.find((s) => s.status === 'now');
  const lastRecordForNow = now
    ? [...records]
        .filter((r) => r.stageId === now.id)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .at(-1)
    : undefined;
  const countForNow = now ? records.filter((r) => r.stageId === now.id).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div>
          <div className="text-xs text-dim font-bold">おかえりなさい</div>
          <div className="text-xl font-extrabold">{theme.name}</div>
        </div>
        {now && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-2xl bg-coral flex items-center justify-center text-white flex-shrink-0">
                ⚡
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[11.5px] font-bold text-coral">
                  いまのステージ・{countForNow}/{settings.clearRequirement.count}回
                </div>
                <div className="text-[14.5px] font-extrabold">{now.name}</div>
              </div>
            </div>
          </Card>
        )}
        <Link href="/plans">
          <div className="bg-[#fff4e9] border-[1.5px] border-dashed border-[#ffcda3] rounded-2xl px-3.5 py-3 flex flex-col gap-1">
            <div className="text-[11.5px] text-dim font-bold">イフゼンプラン</div>
            {themePlans.length === 0 ? (
              <div className="text-[12.5px] text-dim">＋ この課題をどの場面でやるか決める</div>
            ) : (
              themePlans.map((p) => (
                <div key={p.id} className="text-[12.5px] leading-relaxed">
                  <b>{p.trigger}</b> になったら → <b className="text-coral-dark">{p.action}</b>
                </div>
              ))
            )}
          </div>
        </Link>
        {!now && (
          <Card>
            <div className="text-sm">このテーマは全段クリアしました。おめでとうございます！</div>
          </Card>
        )}
        <div className="flex flex-col gap-2 mt-auto">
          <Link href={`/themes/${id}/ladder`}>
            <Button variant="secondary">段階表を見る</Button>
          </Link>
          {now && (
            <Link href={`/themes/${id}/practice`}>
              <Button>いどむ</Button>
            </Link>
          )}
        </div>
        {lastRecordForNow && (
          <div className="text-[11.5px] text-dim text-center">
            前回の不安: {lastRecordForNow.anxietyBefore} → {lastRecordForNow.anxietyAfter}
          </div>
        )}
      </div>
      <BottomNav active="home" themeId={id} practiceEnabled={!!now} />
    </div>
  );
}
