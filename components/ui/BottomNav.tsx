'use client';
import Link from 'next/link';

type NavKey = 'home' | 'ladder' | 'practice' | 'review' | 'settings';

// themeIdがなければ「段階表」「いどむ」は押せない見た目にする（テーマ一覧では文脈がないため）。
// テーマ内にいても、いま挑戦中の段がなければ「いどむ」だけを押せない見た目にする。
export function BottomNav({
  active,
  themeId,
  practiceEnabled = true,
}: {
  active: NavKey;
  themeId?: string;
  practiceEnabled?: boolean;
}) {
  const items: { key: NavKey; label: string; href: string | null }[] = [
    { key: 'home', label: 'ホーム', href: '/' },
    { key: 'ladder', label: '段階表', href: themeId ? `/themes/${themeId}/ladder` : null },
    { key: 'practice', label: 'いどむ', href: themeId && practiceEnabled ? `/themes/${themeId}/practice` : null },
    { key: 'review', label: '振り返り', href: '/review' },
    { key: 'settings', label: '設定', href: '/settings' },
  ];

  return (
    <>
      {/* スマホのブラウザでは 100vh がアドレスバーの裏まで含むため、
          流れの中に置くとバーが画面外に出てしまう。固定表示にして、
          同じ高さの空きを流れに残し、最後の要素がバーに隠れないようにする */}
      <div aria-hidden className="h-[78px] shrink-0" />
      <div
        className="fixed bottom-0 left-0 right-0 z-20 box-border pb-3 border-t border-track grid grid-cols-5 bg-cream"
        style={{ height: 'calc(78px + env(safe-area-inset-bottom, 0px))' }}
      >
      {items.map((item) => {
        const isActive = item.key === active;
        const className = `flex flex-col items-center justify-center gap-1 text-[10px] ${
          isActive ? 'text-coral font-extrabold' : item.href ? 'text-dim2' : 'text-track'
        }`;
        if (!item.href) {
          return (
            <div key={item.key} className={className} aria-disabled="true">
              {item.label}
            </div>
          );
        }
        return (
          <Link key={item.key} href={item.href} className={className}>
            {item.label}
          </Link>
        );
      })}
      </div>
    </>
  );
}
