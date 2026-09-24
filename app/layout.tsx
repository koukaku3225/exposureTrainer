import type { Metadata, Viewport } from 'next';
import { PwaBoot } from '@/components/PwaBoot';
import './globals.css';

export const metadata: Metadata = {
  title: '暴露療法トレーナー',
  description: '怖いことに少しずつ慣れていくための、個人用エクスポージャー記録アプリ',
  // iPhone で「ホーム画面に追加」したときの名前・アイコン・全画面表示
  appleWebApp: {
    capable: true,
    title: 'ばくろ',
    statusBarStyle: 'default',
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

// アプリとして開いたときの上端の色（manifest.ts の theme_color と揃える）
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fff8f0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* スマホアプリとして入れるための下準備（サービスワーカー・インストールの取り置き） */}
        <PwaBoot />
        {children}
      </body>
    </html>
  );
}
