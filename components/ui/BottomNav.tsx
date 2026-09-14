'use client';
import Link from 'next/link';

type NavKey = 'home' | 'ladder' | 'practice' | 'review' | 'settings';

// themeIdがあれば「段階表」「いどむ」はそのテーマの画面へ、なければテーマ一覧へ戻す
export function BottomNav({ active, themeId }: { active: NavKey; themeId?: string }) {
  const items: { key: NavKey; label: string; href: string }[] = [
    { key: 'home', label: 'ホーム', href: '/' },
    { key: 'ladder', label: '段階表', href: themeId ? `/themes/${themeId}/ladder` : '/' },
    { key: 'practice', label: 'いどむ', href: themeId ? `/themes/${themeId}/practice` : '/' },
    { key: 'review', label: '振り返り', href: '/review' },
    { key: 'settings', label: '設定', href: '/settings' },
  ];

  return (
    <div className="h-[78px] box-border pb-3 border-t border-track grid grid-cols-5 bg-cream">
      {items.map((item) => {
        const isActive = item.key === active;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 text-[10px] ${
              isActive ? 'text-coral font-extrabold' : 'text-dim2'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
