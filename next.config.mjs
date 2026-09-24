/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        /*
         * サービスワーカーはキャッシュさせない。古い sw.js を握ったままだと、
         * 直した版がいつまでも届かない（ブラウザは sw.js 自体の更新確認に
         * HTTP キャッシュを使う）。
         */
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
    ];
  },
};

export default nextConfig;
