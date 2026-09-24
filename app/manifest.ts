import type { MetadataRoute } from 'next';

/**
 * スマホのホーム画面に「アプリとして」置くための名札。
 *
 * これと HTTPS とサービスワーカー（public/sw.js）が揃うと、
 * Android の Chrome はインストールを受け付ける。iPhone は
 * 共有 →「ホーム画面に追加」で入れる（layout.tsx の appleWebApp も見る）。
 *
 * 色は tailwind.config.ts の coral / cream に合わせてある。
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '暴露療法トレーナー',
    short_name: 'ばくろ',
    description: '怖いことに少しずつ慣れていくための記録アプリ',
    lang: 'ja',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#fff8f0',
    // 上端のバーは画面の地と同じ色にする（コーラルだと記録画面の上で目立ちすぎる）
    theme_color: '#fff8f0',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
