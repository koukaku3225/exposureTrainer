# 暴露療法トレーナー（エクスポージャー記録アプリ）

竜一さん専用。怖いことに段階的に慣れていくための記録アプリ。
データはブラウザのlocalStorageにのみ保存（サーバーなし）。

## 開発

```bash
npm install
npm run dev
```

テスト:

```bash
npm test
```

## スマホアプリとして使う（PWA）

下のタブ「設定」の一番上から入れられる。Android の Chrome はボタン1つ、
iPhone は共有 →「ホーム画面に追加」。

- iPhone では**ホーム画面のアプリと Safari で保存場所が別**。入れる前に「書き出す」で保存し、
  アプリ側で「読み込む」こと（この案内は画面にも出る）
- サービスワーカー（`public/sw.js`）は本番ビルドでだけ登録する。画面はネット優先、
  `/_next/static/` だけキャッシュ優先。電波が無くても最後に開いた画面は出る
- 詳細: `../prototypeManagementTool/docs/reports/2026-09-24-pwa.md`

## 設計

- 設計書: [docs/superpowers/specs/2026-09-14-exposure-app-design.md](docs/superpowers/specs/2026-09-14-exposure-app-design.md)
- 実装計画: [docs/superpowers/plans/2026-09-14-exposure-app-mvp.md](docs/superpowers/plans/2026-09-14-exposure-app-mvp.md)
- ノウハウ調査: [../../20_調査/2026-09-14_暴露療法ノウハウ_パレオな男.md](../../20_調査/2026-09-14_暴露療法ノウハウ_パレオな男.md)
- UIモック（Duolingo風・コーラル案）: [design/exposure-duo3-full.html](design/exposure-duo3-full.html)

## 現在の状態（MVP）

含む: 初回オンボーディング／テーマ一覧ホーム／テーマ詳細／段階表／実践記録（3択で終わる）／
振り返り（積み上げ表示）／恐怖チェック（14問・結果）／設定／if-thenカード／難易度ガードレール／
ポイント・ご褒美／同梱5テーマテンプレート。

次フェーズ送り: AI課題生成／段階の後戻り操作／実践記録のメモ欄／データの書き出し・読み込み／
通知・リマインド／ガードレールの「上限を外す」設定。
