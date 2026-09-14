'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { BottomNav } from '@/components/ui/BottomNav';
import { readList, readSettings, writeList, STORAGE_KEYS } from '@/lib/storage';
import { THEME_TEMPLATES, instantiateTheme } from '@/lib/themeTemplates';
import type { Theme } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[] | null>(null);

  useEffect(() => {
    const settings = readSettings();
    if (!settings.onboardingCompleted) {
      router.replace('/onboarding');
      return;
    }
    setThemes(readList<Theme>(STORAGE_KEYS.themes));
  }, [router]);

  function addTheme(templateId: string) {
    const template = THEME_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const settings = readSettings();
    const current = readList<Theme>(STORAGE_KEYS.themes);
    const created = instantiateTheme(template, settings.clearRequirement);
    const next = [...current, created];
    writeList(STORAGE_KEYS.themes, next);
    setThemes(next);
  }

  if (themes === null) return null;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">今日の一歩</div>
        {themes.length === 0 && <div className="text-[13px] text-dim">まずはテーマを1つ選んでください</div>}
        {themes.map((theme) => {
          const now = theme.stages.find((s) => s.status === 'now');
          const clearCount = theme.stages.filter((s) => s.status === 'clear').length;
          return (
            <Link key={theme.id} href={`/themes/${theme.id}`}>
              <Card>
                <div className="flex justify-between items-center">
                  <div className="text-[15px] font-extrabold">{theme.name}</div>
                  <Chip>
                    {clearCount}/{theme.stages.length}段
                  </Chip>
                </div>
                {now && <div className="text-[13px] text-dim">いま: {now.name}</div>}
                {!now && <div className="text-[13px] text-amber-dark">全段クリア！</div>}
              </Card>
            </Link>
          );
        })}
        <div className="text-[13px] text-dim mt-2">＋ 新しいテーマを追加</div>
        <div className="flex flex-col gap-2">
          {THEME_TEMPLATES.filter((t) => !themes.some((th) => th.name === t.name)).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => addTheme(t.id)}
              className="text-left bg-white border border-track rounded-2xl px-4 py-3 text-sm font-bold"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="home" />
    </div>
  );
}
