import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '暴露療法トレーナー',
  description: '怖いことに少しずつ慣れていくための、個人用エクスポージャー記録アプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
