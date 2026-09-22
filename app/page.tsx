'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { getStageTitle } from '@/lib/tasks';
import { BottomNav } from '@/components/ui/BottomNav';
import { readList, readSettings, writeList, STORAGE_KEYS } from '@/lib/storage';
import { THEME_TEMPLATES, instantiateTheme } from '@/lib/themeTemplates';
import {
  createCustomTheme,
  removeTheme,
  removeThemeRecords,
  setThemeHidden,
  splitByVisibility,
} from '@/lib/themeAdmin';
import type { PracticeRecord, Theme } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [themes, setThemes] = useState<Theme[] | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [customName, setCustomName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const settings = readSettings();
    if (!settings.onboardingCompleted) {
      router.replace('/onboarding');
      return;
    }
    setThemes(readList<Theme>(STORAGE_KEYS.themes));
  }, [router]);

  function saveThemes(next: Theme[]) {
    writeList(STORAGE_KEYS.themes, next);
    setThemes(next);
  }

  function addTheme(templateId: string) {
    const template = THEME_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    saveThemes([...readList<Theme>(STORAGE_KEYS.themes), instantiateTheme(template)]);
    setAdding(false);
  }

  function addCustomTheme() {
    const name = customName.trim();
    if (!name) return;
    saveThemes([...readList<Theme>(STORAGE_KEYS.themes), createCustomTheme(name)]);
    setCustomName('');
    setAdding(false);
  }

  function hideTheme(id: string) {
    saveThemes(setThemeHidden(readList<Theme>(STORAGE_KEYS.themes), id, true, new Date().toISOString()));
  }

  function deleteTheme(id: string) {
    const records = readList<PracticeRecord>(STORAGE_KEYS.records);
    writeList(STORAGE_KEYS.records, removeThemeRecords(records, id));
    saveThemes(removeTheme(readList<Theme>(STORAGE_KEYS.themes), id));
    setDeletingId(null);
  }

  function restoreTheme(id: string) {
    const next = setThemeHidden(readList<Theme>(STORAGE_KEYS.themes), id, false, new Date().toISOString());
    writeList(STORAGE_KEYS.themes, next);
    setThemes(next);
  }

  if (themes === null) return null;
  const { visible, hidden } = splitByVisibility(themes);
  const unusedTemplates = THEME_TEMPLATES.filter((t) => !themes.some((th) => th.name === t.name));

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="text-xl font-extrabold">今日の一歩</div>
          {themes.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setEditing(!editing);
                setDeletingId(null);
              }}
              className="text-[13px] font-bold text-coral"
            >
              {editing ? '完了' : '編集'}
            </button>
          )}
        </div>
        {visible.length === 0 && (
          <div className="text-[13px] text-dim">
            {hidden.length === 0 ? 'まずはテーマを1つ選んでください' : '表示中のテーマはありません。下の「非表示のテーマ」から戻せます'}
          </div>
        )}
        {visible.map((theme) => {
          const now = theme.stages.find((s) => s.status === 'now');
          const clearCount = theme.stages.filter((s) => s.status === 'clear').length;
          const body = (
            <Card>
              <div className="flex justify-between items-center">
                <div className="text-[15px] font-extrabold">{theme.name}</div>
                <Chip>
                  {clearCount}/{theme.stages.length}段
                </Chip>
              </div>
              {now && <div className="text-[13px] text-dim">いま: {getStageTitle(now)}</div>}
              {!now && <div className="text-[13px] text-amber-dark">全段クリア！</div>}
              {editing && (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => hideTheme(theme.id)}
                    className="h-9 px-3 rounded-xl border border-track text-[13px] font-bold text-dim"
                  >
                    非表示にする
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(theme.id)}
                    className="h-9 px-3 rounded-xl border border-track text-[13px] font-bold text-coral"
                  >
                    削除する
                  </button>
                </div>
              )}
              {deletingId === theme.id && (
                <div className="flex flex-col gap-2 pt-1">
                  <div className="text-[12.5px] leading-relaxed">
                    「{theme.name}」と、このテーマの実践記録をすべて消します。元に戻せません。
                    あとでまたやるかもしれないなら「非表示にする」を選んでください。
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => deleteTheme(theme.id)}
                      className="flex-grow h-10 rounded-xl bg-coral text-white text-[13px] font-bold"
                    >
                      消す
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingId(null)}
                      className="h-10 px-3 rounded-xl text-[13px] font-bold text-dim"
                    >
                      やめる
                    </button>
                  </div>
                </div>
              )}
            </Card>
          );
          // 編集中はカードの中のボタンを押したいので、テーマ詳細へのリンクを外す
          return editing ? (
            <div key={theme.id}>{body}</div>
          ) : (
            <Link key={theme.id} href={`/themes/${theme.id}`}>
              {body}
            </Link>
          );
        })}
        {hidden.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowHidden(!showHidden)}
              className="text-left text-[13px] text-dim mt-1"
            >
              非表示のテーマ（{hidden.length}） {showHidden ? '▲' : '▼'}
            </button>
            {showHidden &&
              hidden.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between bg-white/60 rounded-2xl px-4 py-3">
                  <div className="text-sm text-dim">{theme.name}</div>
                  <button
                    type="button"
                    onClick={() => restoreTheme(theme.id)}
                    className="text-[13px] font-bold text-coral"
                  >
                    表示に戻す
                  </button>
                </div>
              ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => setAdding(!adding)}
          className="text-left text-[13px] font-bold text-coral mt-2"
        >
          ＋ 新しいテーマを追加 {adding ? '▲' : '▼'}
        </button>
        {adding && (
          <div className="flex flex-col gap-2">
            <div className="text-[12px] text-dim">自分でテーマ名を決める</div>
            <div className="flex gap-2">
              <input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="例: エレベーターで話しかける"
                className="flex-grow h-11 rounded-xl border border-track px-3 text-sm bg-white"
              />
              <button
                type="button"
                onClick={addCustomTheme}
                disabled={customName.trim() === ''}
                className="h-11 px-4 rounded-xl bg-coral text-white text-[13px] font-bold disabled:opacity-40"
              >
                作る
              </button>
            </div>
            {unusedTemplates.length > 0 && (
              <>
                <div className="text-[12px] text-dim mt-1">用意されたテーマから選ぶ</div>
                {unusedTemplates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => addTheme(t.id)}
                    className="text-left bg-white border border-track rounded-2xl px-4 py-3 text-sm font-bold"
                  >
                    {t.name}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
      <BottomNav active="home" />
    </div>
  );
}
