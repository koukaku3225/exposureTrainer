# 暴露療法アプリ MVP 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 設計書どおりの9+画面・localStorage完結の暴露療法記録アプリ（Next.js）をMVPとして動かす。

**Architecture:** Next.js (App Router, TypeScript, Tailwind CSS)。状態はすべて localStorage。サーバーAPIなし（AI課題生成は次フェーズ）。データ層はテストしやすい純粋関数として `lib/` に分離し、UIコンポーネントから呼ぶ。

**Tech Stack:** Next.js 14+, TypeScript, Tailwind CSS, Vitest（データ層テスト）

**Spec:** [docs/superpowers/specs/2026-09-14-exposure-app-design.md](../specs/2026-09-14-exposure-app-design.md)

## Global Constraints

- localStorage キーは `exposure.themes` / `exposure.records` / `exposure.fearChecks` / `exposure.settings`
- サーバー・APIキーなし（MVP）
- 配色: コーラル `#ff6f3c`、アンバー `#ffab3c`、背景 `#fff8f0`。フォント M PLUS Rounded 1c
- ボトムナビ5項目: ホーム／段階表／いどむ／振り返り／設定
- 進級のデフォルト合格ライン: 直近3回・不安3以下（`settings.clearRequirement`）
- ガードレール既定しきい値: 難易度8（`settings.guardrailThreshold`）

---

## Task 1: プロジェクト scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `app/layout.tsx`, `.claude/launch.json`（副業リポジトリのlaunch.jsonに追記）

**Interfaces:**
- Produces: `npm run dev` で `http://localhost:<port>` が開けること

- [ ] **Step 1: Next.js アプリを作成**

```bash
cd "C:/Users/kouka/副業/product/exposure-app"
npx --yes create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --use-npm --no-turbopack
```
対話プロンプトが出たら、既存ファイル（design/, docs/）は残す前提で「Yes」で進める。

- [ ] **Step 2: フォントとカラートークンを `app/globals.css` に追加**

```css
@import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;700;800;900&display=swap');

:root {
  --color-cream: #fff8f0;
  --color-text: #3a2a17;
  --color-dim: #b09378;
  --color-dim2: #d6b89e;
  --color-coral: #ff6f3c;
  --color-coral-dark: #d84a1a;
  --color-amber: #ffab3c;
  --color-amber-dark: #d68414;
  --color-gold: #ff9500;
  --color-track: #ffe0cc;
}

body {
  background: var(--color-cream);
  color: var(--color-text);
  font-family: 'M PLUS Rounded 1c', 'Hiragino Maru Gothic ProN', sans-serif;
}
```

- [ ] **Step 3: `tailwind.config.ts` にトークンを登録**

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fff8f0',
        ink: '#3a2a17',
        dim: '#b09378',
        dim2: '#d6b89e',
        coral: { DEFAULT: '#ff6f3c', dark: '#d84a1a' },
        amber: { DEFAULT: '#ffab3c', dark: '#d68414' },
        gold: '#ff9500',
        track: '#ffe0cc',
      },
      fontFamily: {
        rounded: ["'M PLUS Rounded 1c'", "'Hiragino Maru Gothic ProN'", 'sans-serif'],
      },
    },
  },
};
export default config;
```

- [ ] **Step 4: 開発サーバーが起動することを確認**

```bash
npm run dev
```
ブラウザで `http://localhost:3000` を開き、Next.js既定ページが表示されることを確認（Browser paneの `preview_start` を使う。`.claude/launch.json` に副業リポジトリ共通のエントリを1件追加すること — 既存の `tt-coach` / `goal-coach-dev` / `exposure-mock-preview` に並べて `exposure-app-dev` を追加し、`runtimeArgs: ["--prefix", "c:/Users/kouka/副業/product/exposure-app", "run", "dev"]`, `port: 3300`, `autoPort: true`）。

- [ ] **Step 5: Vitest を追加**

```bash
npm install -D vitest
```
`package.json` の `scripts` に `"test": "vitest run"` を追加。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: Next.jsアプリのscaffoldとデザイントークンを追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: データ層の型とlocalStorageラッパー

**Files:**
- Create: `lib/types.ts`, `lib/storage.ts`, `lib/storage.test.ts`

**Interfaces:**
- Produces:
  - `type Theme, Stage, Record, FearCheckResult, RewardSetting, Settings`（`lib/types.ts`）
  - `function readList<T>(key: string): T[]`
  - `function writeList<T>(key: string, items: T[]): void`
  - `function readSettings(): Settings`
  - `function writeSettings(s: Settings): void`
  - `const STORAGE_KEYS = { themes: 'exposure.themes', records: 'exposure.records', fearChecks: 'exposure.fearChecks', settings: 'exposure.settings' }`
  - `const DEFAULT_SETTINGS: Settings`

- [ ] **Step 1: 型定義を書く**

`lib/types.ts`:
```ts
export type Stage = {
  id: string;
  level: number;
  name: string;
  status: 'todo' | 'now' | 'clear';
  order: number;
  clearRequirement: { count: number; maxAnxietyAfter: number };
};

export type Theme = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ifThen: { trigger: string; action: string } | null;
  stages: Stage[];
};

export type PracticeRecord = {
  id: string;
  themeId: string;
  stageId: string;
  isImagined: boolean;
  anxietyBefore: number;
  anxietyAfter: number;
  choice: 'advance' | 'repeat' | 'stop_here' | null;
  createdAt: string;
};

export type FearCheckResult = {
  id: string;
  answers: boolean[];
  createdAt: string;
};

export type RewardSetting = {
  id: string;
  thresholdPt: number;
  label: string;
};

export type Settings = {
  clearRequirement: { count: number; maxAnxietyAfter: number };
  guardrailThreshold: number;
  points: number;
  rewards: RewardSetting[];
  onboardingCompleted: boolean;
};
```

- [ ] **Step 2: 失敗するテストを書く**

`lib/storage.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS, DEFAULT_SETTINGS } from './storage';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
}

beforeEach(() => {
  vi.stubGlobal('localStorage', new MemoryStorage());
});

describe('readList/writeList', () => {
  it('空のキーは空配列を返す', () => {
    expect(readList(STORAGE_KEYS.themes)).toEqual([]);
  });

  it('書いたものをそのまま読み返せる', () => {
    writeList(STORAGE_KEYS.themes, [{ id: 't1' }]);
    expect(readList(STORAGE_KEYS.themes)).toEqual([{ id: 't1' }]);
  });
});

describe('readSettings/writeSettings', () => {
  it('未設定なら既定値を返す', () => {
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('書いた設定をマージして読み返せる（部分更新でも既定値が消えない）', () => {
    writeSettings({ ...DEFAULT_SETTINGS, points: 34 });
    expect(readSettings().points).toBe(34);
    expect(readSettings().guardrailThreshold).toBe(DEFAULT_SETTINGS.guardrailThreshold);
  });
});
```

- [ ] **Step 3: テストが失敗することを確認**

```bash
npx vitest run lib/storage.test.ts
```
Expected: FAIL（`storage.ts` が存在しない）

- [ ] **Step 4: 実装を書く**

`lib/storage.ts`:
```ts
import type { Settings } from './types';

export const STORAGE_KEYS = {
  themes: 'exposure.themes',
  records: 'exposure.records',
  fearChecks: 'exposure.fearChecks',
  settings: 'exposure.settings',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  clearRequirement: { count: 3, maxAnxietyAfter: 3 },
  guardrailThreshold: 8,
  points: 0,
  rewards: [
    { id: 'r1', thresholdPt: 10, label: '好きなカフェに行く' },
    { id: 'r2', thresholdPt: 30, label: '映画を観る' },
    { id: 'r3', thresholdPt: 50, label: '新しい服を買う' },
  ],
  onboardingCompleted: false,
};

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readList<T>(key: string): T[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(key);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeList<T>(key: string, items: T[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(items));
}

export function readSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(s: Settings): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));
}
```

- [ ] **Step 5: テストが通ることを確認**

```bash
npx vitest run lib/storage.test.ts
```
Expected: PASS（4件）

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: データ型とlocalStorage読み書きの薄いラッパーを追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 3: 進級判定・ガードレール判定・恐怖チェック集計（純粋関数）

**Files:**
- Create: `lib/progression.ts`, `lib/progression.test.ts`, `lib/fearCheck.ts`, `lib/fearCheck.test.ts`

**Interfaces:**
- Consumes: `Theme`, `Stage`, `PracticeRecord`, `Settings`（`lib/types.ts`）
- Produces:
  - `function meetsClearRequirement(records: PracticeRecord[], stageId: string, req: {count:number; maxAnxietyAfter:number}): boolean`
  - `function isThemeUnlocked(records: PracticeRecord[], themeId: string, threshold: number): boolean`
  - `function isStageLocked(stage: Stage, theme: Theme, records: PracticeRecord[], guardrailThreshold: number): boolean`
  - `const FEAR_CATEGORIES: {key: string; label: string; questionIndexes: number[]}[]`
  - `function scoreFearCheck(answers: boolean[]): {key: string; label: string; yes: number; total: number}[]`

- [ ] **Step 1: 失敗するテストを書く（進級判定）**

`lib/progression.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { meetsClearRequirement, isThemeUnlocked, isStageLocked } from './progression';
import type { PracticeRecord, Stage, Theme } from './types';

const rec = (over: Partial<PracticeRecord>): PracticeRecord => ({
  id: 'r', themeId: 't1', stageId: 's1', isImagined: false,
  anxietyBefore: 6, anxietyAfter: 3, choice: null, createdAt: '2026-09-14T00:00:00Z',
  ...over,
});

describe('meetsClearRequirement', () => {
  it('直近count件がすべて基準以下ならtrue', () => {
    const records = [rec({ anxietyAfter: 3 }), rec({ anxietyAfter: 2 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(true);
  });

  it('件数が足りなければfalse', () => {
    const records = [rec({ anxietyAfter: 1 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(false);
  });

  it('直近count件のうち1件でも基準を超えたらfalse', () => {
    const records = [rec({ anxietyAfter: 3 }), rec({ anxietyAfter: 5 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(false);
  });

  it('別ステージの記録は数えない', () => {
    const records = [rec({ stageId: 's2', anxietyAfter: 1 }), rec({ anxietyAfter: 1 }), rec({ anxietyAfter: 1 }), rec({ anxietyAfter: 1 })];
    expect(meetsClearRequirement(records, 's1', { count: 3, maxAnxietyAfter: 3 })).toBe(true);
  });
});

describe('isThemeUnlocked', () => {
  it('テーマ内の直近3件が基準以下ならtrue（ステージを問わない）', () => {
    const records = [
      rec({ stageId: 's1', anxietyAfter: 3 }),
      rec({ stageId: 's2', anxietyAfter: 2 }),
      rec({ stageId: 's1', anxietyAfter: 3 }),
    ];
    expect(isThemeUnlocked(records, 't1', 3)).toBe(true);
  });

  it('記録がなければfalse', () => {
    expect(isThemeUnlocked([], 't1', 3)).toBe(false);
  });
});

describe('isStageLocked', () => {
  const stage = (over: Partial<Stage>): Stage => ({
    id: 's8', level: 8, name: '難しい段', status: 'todo', order: 8,
    clearRequirement: { count: 3, maxAnxietyAfter: 3 }, ...over,
  });
  const theme = (over: Partial<Theme>): Theme => ({
    id: 't1', name: 'テーマ', createdAt: '', updatedAt: '', ifThen: null, stages: [], ...over,
  });

  it('難易度が閾値以上で、解放条件未達ならロック', () => {
    expect(isStageLocked(stage({ level: 8 }), theme({}), [], 8)).toBe(true);
  });

  it('難易度が閾値未満なら常にロックしない', () => {
    expect(isStageLocked(stage({ level: 5 }), theme({}), [], 8)).toBe(false);
  });

  it('直近3件が基準を満たせばロック解除', () => {
    const records = [
      rec({ themeId: 't1', anxietyAfter: 2 }),
      rec({ themeId: 't1', anxietyAfter: 3 }),
      rec({ themeId: 't1', anxietyAfter: 1 }),
    ];
    expect(isStageLocked(stage({ level: 8 }), theme({ id: 't1' }), records, 8)).toBe(false);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

```bash
npx vitest run lib/progression.test.ts
```
Expected: FAIL（`progression.ts` が存在しない）

- [ ] **Step 3: 実装を書く**

`lib/progression.ts`:
```ts
import type { PracticeRecord, Stage, Theme } from './types';

export function meetsClearRequirement(
  records: PracticeRecord[],
  stageId: string,
  req: { count: number; maxAnxietyAfter: number },
): boolean {
  const forStage = records
    .filter((r) => r.stageId === stageId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (forStage.length < req.count) return false;
  const recent = forStage.slice(-req.count);
  return recent.every((r) => r.anxietyAfter <= req.maxAnxietyAfter);
}

export function isThemeUnlocked(
  records: PracticeRecord[],
  themeId: string,
  maxAnxietyAfter: number,
): boolean {
  const forTheme = records
    .filter((r) => r.themeId === themeId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (forTheme.length < 3) return false;
  const recent = forTheme.slice(-3);
  return recent.every((r) => r.anxietyAfter <= maxAnxietyAfter);
}

export function isStageLocked(
  stage: Stage,
  theme: Theme,
  records: PracticeRecord[],
  guardrailThreshold: number,
): boolean {
  if (stage.level < guardrailThreshold) return false;
  return !isThemeUnlocked(records, theme.id, 3);
}
```

- [ ] **Step 4: テストが通ることを確認**

```bash
npx vitest run lib/progression.test.ts
```
Expected: PASS（8件）

- [ ] **Step 5: 恐怖チェック集計の失敗するテストを書く**

`lib/fearCheck.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { FEAR_CATEGORIES, scoreFearCheck } from './fearCheck';

describe('FEAR_CATEGORIES', () => {
  it('5分類・14問ぶん重複なく揃っている', () => {
    const all = FEAR_CATEGORIES.flatMap((c) => c.questionIndexes);
    expect(FEAR_CATEGORIES.length).toBe(5);
    expect(all.length).toBe(14);
    expect(new Set(all).size).toBe(14);
  });
});

describe('scoreFearCheck', () => {
  it('各分類のはい数/問題数を返す', () => {
    const answers = Array(14).fill(false);
    answers[0] = true; answers[1] = true; // 失敗（1,2,3問目）のうち2問はい
    const scores = scoreFearCheck(answers);
    const failure = scores.find((s) => s.key === 'failure')!;
    expect(failure.yes).toBe(2);
    expect(failure.total).toBe(3);
  });
});
```

- [ ] **Step 6: テストが失敗することを確認**

```bash
npx vitest run lib/fearCheck.test.ts
```
Expected: FAIL（`fearCheck.ts` が存在しない）

- [ ] **Step 7: 実装を書く**

`lib/fearCheck.ts`:
```ts
export const FEAR_QUESTIONS: string[] = [
  '難しい状況で責任を負わされたり、人に頼られたりするのが怖い',
  'うまくいくかどうか分からないことをするのは不安だ',
  '物事がすぐに理解できないと不安になる',
  '新しい人と知り合うとき、その人に拒絶されるのが怖い',
  '知らない人に近づくとき、冷たい態度を取られないか不安になる',
  '他人から拒絶されることは、自分にとって大きな脅威に感じる',
  '物事を自分でコントロールできなくなると怖い',
  '自分が何かに影響を与えられていないと気づくと、すぐ心配になる',
  '状況をコントロールできなかったらと考えると怖くなる',
  '親しい友人との連絡が途絶えたら、大きなショックを受けると思う',
  '大切な人との気持ちのふれあいを失うと、動揺すると思う',
  '親しい友人に距離を置かれたら、その関係に不安を覚える',
  '自分の評判が危うくなると、とても心配になる',
  '自分の評判が下がっていないか、いつも気になる',
];

export const FEAR_CATEGORIES: { key: string; label: string; questionIndexes: number[] }[] = [
  { key: 'failure', label: '失敗', questionIndexes: [0, 1, 2] },
  { key: 'rejection', label: '拒絶', questionIndexes: [3, 4, 5] },
  { key: 'control', label: 'コントロール', questionIndexes: [6, 7, 8] },
  { key: 'connection', label: 'つながり', questionIndexes: [9, 10, 11] },
  { key: 'reputation', label: '評判', questionIndexes: [12, 13] },
];

export function scoreFearCheck(
  answers: boolean[],
): { key: string; label: string; yes: number; total: number }[] {
  return FEAR_CATEGORIES.map((cat) => ({
    key: cat.key,
    label: cat.label,
    yes: cat.questionIndexes.filter((i) => answers[i]).length,
    total: cat.questionIndexes.length,
  }));
}
```

- [ ] **Step 8: テストが通ることを確認**

```bash
npx vitest run lib/fearCheck.test.ts
```
Expected: PASS（2件）

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: 進級判定・ガードレール判定・恐怖チェック集計のロジックを追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 4: 同梱テーマテンプレート5種

**Files:**
- Create: `lib/themeTemplates.ts`

**Interfaces:**
- Consumes: なし（静的データ）
- Produces: `type ThemeTemplate = { id: string; name: string; stages: { level: number; name: string }[] }`, `const THEME_TEMPLATES: ThemeTemplate[]`, `function instantiateTheme(template: ThemeTemplate, clearRequirement: {count:number;maxAnxietyAfter:number}): Theme`（`crypto.randomUUID()` でid採番、1段目を `now`、以降 `todo` にする）

- [ ] **Step 1: 実装を書く**

`lib/themeTemplates.ts`:
```ts
import type { Theme, Stage } from './types';

export type ThemeTemplate = {
  id: string;
  name: string;
  stages: { level: number; name: string }[];
};

export const THEME_TEMPLATES: ThemeTemplate[] = [
  {
    id: 'public-speaking',
    name: '人前で話す',
    stages: [
      { level: 1, name: '30秒スピーチを録音して聞き返す' },
      { level: 2, name: '録画して表情ごと見返す' },
      { level: 3, name: '会議で一言だけ発言する' },
      { level: 4, name: '2〜3人の前で3分話す' },
      { level: 4, name: '話の途中でわざと一瞬詰まる' },
      { level: 5, name: '勉強会で自己紹介する' },
      { level: 6, name: 'オンラインで10人に5分発表する' },
      { level: 8, name: '30〜50人の前で話す' },
      { level: 10, name: '100人の前で話す' },
    ],
  },
  {
    id: 'shame',
    name: '恥（評判）',
    stages: [
      { level: 1, name: '近所のコンビニまでパジャマのまま行く' },
      { level: 2, name: 'エレベーターで独り言風に「失礼します」と言う' },
      { level: 3, name: '店員さんにちょっと変わった質問をする' },
      { level: 4, name: '会社資料にわざと小さな誤字を入れる' },
      { level: 5, name: '会議でわざと言葉に詰まってみる' },
      { level: 6, name: '普段と違うファッションで外出する' },
      { level: 7, name: 'オンライン会議でカメラをオンにして雑談する' },
      { level: 9, name: '人前で失敗談を自分から話す' },
    ],
  },
  {
    id: 'rejection',
    name: '拒絶',
    stages: [
      { level: 1, name: '知らない人と目を合わせる' },
      { level: 2, name: 'コンビニの店員に「ありがとう」と言う' },
      { level: 3, name: '同僚や知人に一言話しかける' },
      { level: 4, name: '道を尋ねる（知っている道でもよい）' },
      { level: 5, name: '店員に小さなお願いをする（例：試着したい）' },
      { level: 6, name: '断られてもいい軽い誘いをしてみる' },
      { level: 8, name: '本気の誘い・お願いをして、断られる可能性を受け入れる' },
    ],
  },
  {
    id: 'control',
    name: '不確実さ（コントロール）',
    stages: [
      { level: 1, name: '普段使わない道を歩いてみる' },
      { level: 2, name: '普段選ばないメニューを注文する' },
      { level: 3, name: '行き先を決めずに30分散歩する' },
      { level: 4, name: '調べずに知らない店に入ってみる' },
      { level: 5, name: '予定を1つ、当日決めにしてみる' },
      { level: 7, name: '計画を立てずに小さな旅に出る' },
    ],
  },
  {
    id: 'connection',
    name: 'つながり（自己開示）',
    stages: [
      { level: 1, name: '今日の天気について雑談する' },
      { level: 2, name: '「最近どうですか」と相手に質問する' },
      { level: 3, name: '親しい人に小さな本音を1つ話す' },
      { level: 4, name: '小さなお願いを誰かにしてみる' },
      { level: 5, name: '弱っていることを1つ打ち明ける' },
      { level: 7, name: '本音の相談を持ちかける' },
    ],
  },
];

export function instantiateTheme(
  template: ThemeTemplate,
  clearRequirement: { count: number; maxAnxietyAfter: number },
): Theme {
  const now = new Date().toISOString();
  const stages: Stage[] = template.stages.map((s, i) => ({
    id: crypto.randomUUID(),
    level: s.level,
    name: s.name,
    status: i === 0 ? 'now' : 'todo',
    order: i,
    clearRequirement,
  }));
  return {
    id: crypto.randomUUID(),
    name: template.name,
    createdAt: now,
    updatedAt: now,
    ifThen: null,
    stages,
  };
}
```

- [ ] **Step 2: 型チェックが通ることを確認**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 同梱テーマテンプレート5種を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 5: 共通UIコンポーネント

**Files:**
- Create: `components/ui/Card.tsx`, `components/ui/Button.tsx`, `components/ui/BottomNav.tsx`, `components/ui/AnxietyScale.tsx`, `components/ui/ProgressBar.tsx`, `components/ui/Chip.tsx`

**Interfaces:**
- Produces:
  - `<Card>{children}</Card>`
  - `<Button variant="primary"|"secondary" onClick={...}>{children}</Button>`
  - `<BottomNav active="home"|"ladder"|"practice"|"review"|"settings" />`
  - `<AnxietyScale label={string} value={number} onChange={(n:number)=>void} />`
  - `<ProgressBar percent={number} color?={string} />`
  - `<Chip tone="coral"|"good"|"dim">{children}</Chip>`

- [ ] **Step 1: モックのマークアップ・色をそのままTailwindクラスに移植する**

`components/ui/Card.tsx`:
```tsx
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-[18px] p-4 shadow-[0_2px_10px_rgba(58,42,23,0.05)] flex flex-col gap-2.5 ${className}`}>
      {children}
    </div>
  );
}
```

`components/ui/Button.tsx`:
```tsx
type Props = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
  type?: 'button' | 'submit';
};

export function Button({ children, variant = 'primary', onClick, type = 'button' }: Props) {
  const base = 'h-[54px] rounded-[18px] flex items-center justify-center gap-2 text-[16px] font-extrabold w-full';
  const styleClass =
    variant === 'primary'
      ? 'bg-coral text-white shadow-[0_5px_0_#d84a1a]'
      : 'bg-white text-coral border-[1.5px] border-track';
  return (
    <button type={type} onClick={onClick} className={`${base} ${styleClass}`}>
      {children}
    </button>
  );
}
```

`components/ui/BottomNav.tsx`（`next/link` でルーティング。テーマ未選択時の「段階表」「いどむ」はテーマ一覧 `/` に遷移）:
```tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { key: 'home', label: 'ホーム', href: '/' },
  { key: 'ladder', label: '段階表', href: '/' },
  { key: 'practice', label: 'いどむ', href: '/' },
  { key: 'review', label: '振り返り', href: '/review' },
  { key: 'settings', label: '設定', href: '/settings' },
] as const;

export function BottomNav({ active }: { active: typeof ITEMS[number]['key'] }) {
  const pathname = usePathname();
  return (
    <div className="h-[78px] box-border pb-3 border-t border-track grid grid-cols-5 bg-cream">
      {ITEMS.map((item) => {
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
```
（`pathname` は現状未使用だが、次フェーズでテーマ文脈つきリンクに差し替える際に使う想定。ESLintの unused-vars を避けるため、このタスクでは `usePathname` の呼び出し自体は残しつつ `void pathname;` を入れる）

`components/ui/AnxietyScale.tsx`:
```tsx
export function AnxietyScale({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-[13px] text-dim font-bold">{label}</div>
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-grow h-10 rounded-xl flex items-center justify-center font-extrabold text-sm ${
              n === value ? 'bg-coral text-white' : 'bg-[#fff0e2] text-[#d6a172]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
```

`components/ui/ProgressBar.tsx`:
```tsx
export function ProgressBar({ percent, color = '#ff6f3c' }: { percent: number; color?: string }) {
  return (
    <div className="h-2.5 rounded-full bg-track overflow-hidden flex">
      <div className="rounded-full" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}
```

`components/ui/Chip.tsx`:
```tsx
const TONES = {
  coral: 'bg-[#ffe9db] text-[#d84a1a]',
  good: 'bg-[#fff3de] text-amber-dark',
  dim: 'bg-[#f5ece1] text-dim',
} as const;

export function Chip({ children, tone = 'coral' }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11.5px] font-extrabold ${TONES[tone]}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 共通UIコンポーネント（Card/Button/BottomNav/AnxietyScale/ProgressBar/Chip）を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 6: 初回オンボーディング（2画面）

**Files:**
- Create: `app/onboarding/page.tsx`

**Interfaces:**
- Consumes: `readSettings`, `writeSettings`, `THEME_TEMPLATES`, `instantiateTheme`, `writeList`, `STORAGE_KEYS`, `readList`
- Produces: 完了後 `settings.onboardingCompleted = true` になり `/` へ遷移

- [ ] **Step 1: 2ステップのクライアントコンポーネントを書く**

`app/onboarding/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { readSettings, writeSettings } from '@/lib/storage';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  function finish() {
    const settings = readSettings();
    writeSettings({ ...settings, onboardingCompleted: true });
    router.push('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream px-5 pt-12 pb-8">
      <div className="flex-grow flex flex-col justify-center gap-6 items-center text-center">
        {step === 1 ? (
          <>
            <div className="w-[72px] h-[72px] rounded-full bg-white border-[3px] border-gold flex items-center justify-center text-3xl">
              ✦
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-extrabold">はじめまして</div>
              <div className="text-[13.5px] text-dim leading-loose max-w-[280px]">
                怖いことを、少しずつ小さく試して慣れていくアプリです。
                <br />
                まずは1つだけ、絶対に失敗しない一歩から始めましょう。
              </div>
            </div>
            <Card>
              <div className="flex items-center gap-2.5">
                <Chip>難易度 1</Chip>
                <div className="text-[11.5px] text-dim">30秒で終わります</div>
              </div>
              <div className="text-base font-extrabold text-left">
                スマホで30秒だけ、独り言でスピーチの練習をしてみる
              </div>
            </Card>
          </>
        ) : (
          <>
            <div className="w-[84px] h-[84px] rounded-full bg-amber shadow-[0_6px_0_#d68414] flex items-center justify-center text-white text-3xl">
              ✓
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-extrabold">できました！</div>
              <div className="text-[13.5px] text-dim leading-loose max-w-[280px]">
                これが「いどむ」です。むずかしく考えず、こんな小さな一歩から積み重ねていきます。
              </div>
            </div>
          </>
        )}
      </div>
      <Button onClick={() => (step === 1 ? setStep(2) : finish())}>
        {step === 1 ? 'やってみる' : 'はじめる'}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 初回オンボーディング画面を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 7: テーマ一覧ホーム（`/`）

**Files:**
- Create: `app/page.tsx`

**Interfaces:**
- Consumes: `readList<Theme>(STORAGE_KEYS.themes)`, `readSettings`, `THEME_TEMPLATES`, `instantiateTheme`
- Produces: `/` — オンボーディング未完了なら `/onboarding` へリダイレクト。テーマが0件ならテンプレート選択、1件以上ならカード一覧＋「＋新しいテーマ」

- [ ] **Step 1: 実装を書く**

`app/page.tsx`:
```tsx
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
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5 overflow-hidden">
        <div className="text-xl font-extrabold">今日の一歩</div>
        {themes.length === 0 && (
          <div className="text-[13px] text-dim">まずはテーマを1つ選んでください</div>
        )}
        {themes.map((theme) => {
          const now = theme.stages.find((s) => s.status === 'now');
          const clearCount = theme.stages.filter((s) => s.status === 'clear').length;
          return (
            <Link key={theme.id} href={`/themes/${theme.id}`}>
              <Card>
                <div className="flex justify-between items-center">
                  <div className="text-[15px] font-extrabold">{theme.name}</div>
                  <Chip>{clearCount}/{theme.stages.length}段</Chip>
                </div>
                {now && <div className="text-[13px] text-dim">いま: {now.name}</div>}
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
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: ブラウザで確認**

`npm run dev` の状態で `/` を開き、テンプレートから1つ追加してカードが表示されることを目視確認する。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: テーマ一覧ホーム画面を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 8: テーマ詳細（`/themes/[id]`）と段階表（`/themes/[id]/ladder`）

**Files:**
- Create: `app/themes/[id]/page.tsx`, `app/themes/[id]/ladder/page.tsx`, `lib/useTheme.ts`

**Interfaces:**
- Consumes: `readList/writeList<Theme>`, `readList<PracticeRecord>`, `isStageLocked`, `readSettings`
- Produces: `function useTheme(id: string): { theme: Theme | null; records: PracticeRecord[]; refresh: () => void }`

- [ ] **Step 1: 共有フックを書く**

`lib/useTheme.ts`:
```ts
'use client';
import { useCallback, useEffect, useState } from 'react';
import { readList, STORAGE_KEYS } from './storage';
import type { PracticeRecord, Theme } from './types';

export function useTheme(id: string) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [records, setRecords] = useState<PracticeRecord[]>([]);

  const refresh = useCallback(() => {
    const themes = readList<Theme>(STORAGE_KEYS.themes);
    setTheme(themes.find((t) => t.id === id) ?? null);
    setRecords(readList<PracticeRecord>(STORAGE_KEYS.records).filter((r) => r.themeId === id));
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { theme, records, refresh };
}
```

- [ ] **Step 2: テーマ詳細画面を書く**

`app/themes/[id]/page.tsx`:
```tsx
'use client';
import Link from 'next/link';
import { use } from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';

export default function ThemeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { theme, records } = useTheme(id);

  if (!theme) return null;
  const now = theme.stages.find((s) => s.status === 'now');
  const lastRecordForNow = now
    ? [...records].filter((r) => r.stageId === now.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).at(-1)
    : undefined;
  const countForNow = now ? records.filter((r) => r.stageId === now.id).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs text-dim font-bold">おかえりなさい</div>
            <div className="text-xl font-extrabold">{theme.name}</div>
          </div>
        </div>
        {now && (
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-2xl bg-coral flex items-center justify-center text-white flex-shrink-0">
                ⚡
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="text-[11.5px] font-bold text-coral">
                  いまのステージ・{countForNow}/{now.clearRequirement.count}回
                </div>
                <div className="text-[14.5px] font-extrabold">{now.name}</div>
              </div>
            </div>
          </Card>
        )}
        {theme.ifThen && (
          <div className="bg-[#fff4e9] border-[1.5px] border-dashed border-[#ffcda3] rounded-2xl px-3.5 py-3 text-[12.5px] leading-relaxed">
            <span className="text-dim">次の一歩：</span>
            <b>{theme.ifThen.trigger}</b> になったら → <b className="text-coral-dark">{theme.ifThen.action}</b>
          </div>
        )}
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
      <BottomNav active="ladder" />
    </div>
  );
}
```

- [ ] **Step 3: 段階表画面を書く**

`app/themes/[id]/ladder/page.tsx`:
```tsx
'use client';
import { use } from 'react';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { isStageLocked } from '@/lib/progression';
import { readSettings } from '@/lib/storage';

export default function LadderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { theme, records } = useTheme(id);
  if (!theme) return null;
  const settings = readSettings();
  const sorted = [...theme.stages].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3">
        <div>
          <div className="text-xs text-dim font-bold">難しさ順に下から上へ</div>
          <div className="text-xl font-extrabold">{theme.name} の段階表</div>
        </div>
        <Card>
          {sorted.map((stage) => {
            const locked = isStageLocked(stage, theme, records, settings.guardrailThreshold);
            return (
              <div
                key={stage.id}
                className="grid grid-cols-[30px_1fr_auto] items-center gap-2.5 py-2 border-t border-black/5 first:border-t-0"
              >
                <div className="text-sm font-black text-center text-amber-dark">{stage.level}</div>
                <div className={`text-[13.5px] ${stage.status === 'clear' ? 'text-dim' : ''} ${stage.status === 'now' ? 'font-bold' : ''}`}>
                  {stage.name}
                </div>
                <div>
                  {locked ? (
                    <Chip tone="dim">🔒 ロック中</Chip>
                  ) : stage.status === 'clear' ? (
                    <Chip tone="good">クリア</Chip>
                  ) : stage.status === 'now' ? (
                    <Chip>挑戦中</Chip>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>
        <div className="flex items-center gap-2 bg-[#fdf1e6] rounded-xl px-3 py-2.5 text-[11.5px] text-dim">
          🔒 難易度{settings.guardrailThreshold}以上は、直近3回を不安3以下でクリアすると解放されます
        </div>
      </div>
      <BottomNav active="ladder" />
    </div>
  );
}
```

- [ ] **Step 4: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 5: ブラウザで確認**

テーマ詳細→段階表の行き来ができ、難易度8以上の行に🔒が出ることを目視確認する。

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: テーマ詳細画面と段階表画面（ガードレール表示つき）を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 9: 実践記録画面（`/themes/[id]/practice`）

**Files:**
- Create: `app/themes/[id]/practice/page.tsx`

**Interfaces:**
- Consumes: `useTheme`, `readSettings`, `writeSettings`, `readList/writeList<PracticeRecord>`, `meetsClearRequirement`, `AnxietyScale`, `Button`
- Produces: 記録保存後、3択のいずれかを選ぶと `theme.stages` の `status` を更新し `/themes/[id]` に戻る

- [ ] **Step 1: 実装を書く**

`app/themes/[id]/practice/page.tsx`:
```tsx
'use client';
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { AnxietyScale } from '@/components/ui/AnxietyScale';
import { BottomNav } from '@/components/ui/BottomNav';
import { useTheme } from '@/lib/useTheme';
import { meetsClearRequirement } from '@/lib/progression';
import { readList, writeList, readSettings, writeSettings, STORAGE_KEYS } from '@/lib/storage';
import type { PracticeRecord, Theme } from '@/lib/types';

export default function PracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { theme, records, refresh } = useTheme(id);
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [isImagined, setIsImagined] = useState(false);
  const [saved, setSaved] = useState<PracticeRecord | null>(null);

  if (!theme) return null;
  const now = theme.stages.find((s) => s.status === 'now');
  if (!now) return null;

  function save() {
    const record: PracticeRecord = {
      id: crypto.randomUUID(),
      themeId: id,
      stageId: now!.id,
      isImagined,
      anxietyBefore: before,
      anxietyAfter: after,
      choice: null,
      createdAt: new Date().toISOString(),
    };
    const all = readList<PracticeRecord>(STORAGE_KEYS.records);
    writeList(STORAGE_KEYS.records, [...all, record]);
    setSaved(record);
    refresh();
  }

  function choose(choice: PracticeRecord['choice']) {
    if (!saved) return;
    const allRecords = readList<PracticeRecord>(STORAGE_KEYS.records).map((r) =>
      r.id === saved.id ? { ...r, choice } : r,
    );
    writeList(STORAGE_KEYS.records, allRecords);

    if (choice === 'advance') {
      const themes = readList<Theme>(STORAGE_KEYS.themes);
      const nextThemes = themes.map((t) => {
        if (t.id !== id) return t;
        const sorted = [...t.stages].sort((a, b) => a.order - b.order);
        const idx = sorted.findIndex((s) => s.id === now!.id);
        const updatedStages = sorted.map((s, i) => {
          if (i === idx) return { ...s, status: 'clear' as const };
          if (i === idx + 1) return { ...s, status: 'now' as const };
          return s;
        });
        return { ...t, stages: updatedStages, updatedAt: new Date().toISOString() };
      });
      writeList(STORAGE_KEYS.themes, nextThemes);
    }

    const settings = readSettings();
    writeSettings({ ...settings, points: settings.points + 5 });

    router.push(`/themes/${id}`);
  }

  const settings = readSettings();
  const willClear = saved
    ? meetsClearRequirement([...records, saved], now.id, now.clearRequirement)
    : false;

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">実践を記録</div>
        {!saved ? (
          <Card>
            <div className="text-xs text-dim">{theme.name} ／ 難しさ{now.level}</div>
            <div className="text-base font-extrabold">{now.name}</div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setIsImagined(false)}
                className={`flex-grow h-[38px] rounded-xl text-[12.5px] font-bold ${!isImagined ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'}`}
              >
                現実でやった
              </button>
              <button
                type="button"
                onClick={() => setIsImagined(true)}
                className={`flex-grow h-[38px] rounded-xl text-[12.5px] font-bold ${isImagined ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'}`}
              >
                想像でやった
              </button>
            </div>
            <AnxietyScale label="はじめる前の不安" value={before} onChange={setBefore} />
            <AnxietyScale label="終わった後の不安" value={after} onChange={setAfter} />
            <button type="button" onClick={save} className="h-[46px] rounded-[14px] bg-coral text-white font-extrabold">
              記録する
            </button>
          </Card>
        ) : (
          <Card>
            <div className="text-[13.5px] leading-relaxed">
              不安が <b className="text-coral">{saved.anxietyBefore - saved.anxietyAfter}</b> 下がりました。ゆうき{' '}
              <b className="text-coral">+5pt</b>
              {willClear ? '。合格ラインに達しました。' : '。'}
            </div>
            <div className="text-[11.5px] text-dim font-bold">どうしますか？（どれを選んでも大丈夫です）</div>
            {(
              [
                ['advance', '次の段へ進む', '次の課題に挑戦する'],
                ['repeat', 'もう少しこの段を続ける', 'あと数回、同じ課題で慣れる'],
                ['stop_here', '今回はここでよかった', '今日はここまでにする'],
              ] as const
            ).map(([choice, label, sub]) => (
              <button
                key={choice}
                type="button"
                onClick={() => choose(choice)}
                className="text-left rounded-2xl px-3.5 py-3 bg-white border-[1.5px] border-track flex items-center gap-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="text-sm font-extrabold">{label}</div>
                  <div className="text-[11.5px] text-dim">{sub}</div>
                </div>
              </button>
            ))}
          </Card>
        )}
      </div>
      <BottomNav active="practice" />
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: ブラウザで通し確認**

記録→3択→「次の段へ進む」を選んでテーマ詳細に戻ったとき、`now` の課題が次の段になっていることを確認する。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: 実践記録画面（3択で対等に終わる）を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 10: 振り返り画面（`/review`）

**Files:**
- Create: `app/review/page.tsx`

**Interfaces:**
- Consumes: `readList<PracticeRecord>`, `readList<Theme>`, `readSettings`

- [ ] **Step 1: 実装を書く**

`app/review/page.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { readList, readSettings, STORAGE_KEYS } from '@/lib/storage';
import type { PracticeRecord } from '@/lib/types';

export default function ReviewPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setRecords(readList<PracticeRecord>(STORAGE_KEYS.records));
    setPoints(readSettings().points);
  }, []);

  const totalCount = records.length;
  const totalDrop = records.reduce((sum, r) => sum + Math.max(0, r.anxietyBefore - r.anxietyAfter), 0);

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = records.filter((r) => new Date(r.createdAt).getTime() >= oneWeekAgo);

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">振り返り</div>
        <Card>
          <div className="flex justify-around text-center">
            <div>
              <div className="text-[22px] font-black text-coral">{totalCount}<span className="text-xs text-dim">回</span></div>
              <div className="text-[11px] text-dim">はじめてからの累計</div>
            </div>
            <div className="w-px bg-track" />
            <div>
              <div className="text-[22px] font-black text-coral">−{totalDrop}</div>
              <div className="text-[11px] text-dim">不安スコアの合計低下</div>
            </div>
          </div>
          <div className="text-[11px] text-dim text-center">どちらも積み上がるだけで、減ることはありません</div>
        </Card>
        <Card>
          <div className="text-[13.5px] font-extrabold">今週の実践</div>
          <div className="text-sm text-dim">{thisWeek.length}回（ポイント合計 {points}pt）</div>
        </Card>
      </div>
      <BottomNav active="review" />
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 振り返り画面（積み上げ表示）を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 11: 恐怖チェック（`/fear-check`, `/fear-check/result`）

**Files:**
- Create: `app/fear-check/page.tsx`, `app/fear-check/result/page.tsx`

**Interfaces:**
- Consumes: `FEAR_QUESTIONS`, `FEAR_CATEGORIES`, `scoreFearCheck`, `readList/writeList<FearCheckResult>`

- [ ] **Step 1: 質問画面を書く**

`app/fear-check/page.tsx`:
```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FEAR_QUESTIONS } from '@/lib/fearCheck';
import { readList, writeList, STORAGE_KEYS } from '@/lib/storage';
import type { FearCheckResult } from '@/lib/types';

export default function FearCheckPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);

  function answer(value: boolean) {
    const next = [...answers, value];
    if (index + 1 >= FEAR_QUESTIONS.length) {
      const result: FearCheckResult = {
        id: crypto.randomUUID(),
        answers: next,
        createdAt: new Date().toISOString(),
      };
      const all = readList<FearCheckResult>(STORAGE_KEYS.fearChecks);
      writeList(STORAGE_KEYS.fearChecks, [...all, result]);
      router.push('/fear-check/result');
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream px-4 pt-11 pb-8 gap-3.5">
      <div className="flex items-center gap-2.5">
        <ProgressBar percent={((index + 1) / FEAR_QUESTIONS.length) * 100} />
        <div className="text-[13px] font-extrabold text-dim">
          {index + 1}/{FEAR_QUESTIONS.length}
        </div>
      </div>
      <Card>
        <div className="text-xs text-dim">しつもん {index + 1}</div>
        <div className="text-lg font-extrabold leading-relaxed min-h-[100px]">{FEAR_QUESTIONS[index]}</div>
      </Card>
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={() => answer(true)} className="h-[54px] rounded-[18px] bg-coral text-white font-extrabold">
          はい
        </button>
        <button type="button" onClick={() => answer(false)} className="h-[54px] rounded-[18px] bg-white text-coral border-[1.5px] border-track font-extrabold">
          いいえ
        </button>
      </div>
      <div className="flex-grow" />
      <div className="text-[11.5px] text-dim text-center leading-relaxed">
        正解はありません。思ったとおりに答えてください。
        <br />
        これは診断ではなく、怖がりやすい種類を知るためのものです
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 結果画面を書く**

`app/fear-check/result/page.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { scoreFearCheck } from '@/lib/fearCheck';
import { readList, STORAGE_KEYS } from '@/lib/storage';
import { THEME_TEMPLATES } from '@/lib/themeTemplates';
import type { FearCheckResult } from '@/lib/types';

const CATEGORY_TO_TEMPLATE: Record<string, string> = {
  reputation: 'shame',
  rejection: 'rejection',
  control: 'control',
  connection: 'connection',
  failure: 'public-speaking',
};

export default function FearCheckResultPage() {
  const [scores, setScores] = useState<ReturnType<typeof scoreFearCheck>>([]);

  useEffect(() => {
    const all = readList<FearCheckResult>(STORAGE_KEYS.fearChecks);
    const latest = all.at(-1);
    if (latest) setScores(scoreFearCheck(latest.answers));
  }, []);

  const maxRatio = Math.max(...scores.map((s) => s.yes / s.total), 0);

  return (
    <div className="min-h-screen flex flex-col bg-cream px-4 pt-11 pb-8 gap-3.5">
      <div className="text-xl font-extrabold">あなたの恐怖のかたち</div>
      <Card>
        {scores.map((s) => {
          const ratio = s.yes / s.total;
          const top = ratio === maxRatio && ratio > 0;
          return (
            <div key={s.key} className="flex flex-col gap-1.5">
              <div className={`flex justify-between text-[13.5px] ${top ? 'font-extrabold text-coral' : ''}`}>
                <div>{top ? '★ ' : ''}{s.label}</div>
                <div className="text-dim font-bold">{s.yes}/{s.total}</div>
              </div>
              <ProgressBar percent={Math.round(ratio * 100)} color={top ? '#ff6f3c' : '#ffe0cc'} />
            </div>
          );
        })}
      </Card>
      <div className="flex flex-col gap-2">
        {scores
          .filter((s) => s.yes / s.total === maxRatio && maxRatio > 0)
          .map((s) => (
            <Link
              key={s.key}
              href="/"
              className="bg-white border border-track rounded-2xl px-4 py-3 flex flex-col gap-0.5"
            >
              <div className="text-sm font-extrabold">{s.label}</div>
              <div className="text-[11.5px] text-dim">
                {THEME_TEMPLATES.find((t) => t.id === CATEGORY_TO_TEMPLATE[s.key])?.name} の段階表へ
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 4: ブラウザで通し確認**

14問すべて答え、結果画面に5分類のバーが表示され、最大割合の分類が★つきでハイライトされることを確認する。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: 恐怖チェック（14問・結果画面）を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 12: 設定画面（`/settings`）

**Files:**
- Create: `app/settings/page.tsx`

**Interfaces:**
- Consumes: `readSettings`, `writeSettings`

- [ ] **Step 1: 実装を書く**

`app/settings/page.tsx`:
```tsx
'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BottomNav } from '@/components/ui/BottomNav';
import { readSettings, writeSettings } from '@/lib/storage';
import type { Settings } from '@/lib/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    setSettings(readSettings());
  }, []);

  if (!settings) return null;

  function updateCount(count: number) {
    const next = { ...settings!, clearRequirement: { ...settings!.clearRequirement, count } };
    writeSettings(next);
    setSettings(next);
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <div className="flex-grow px-4 pt-11 pb-2 flex flex-col gap-3.5">
        <div className="text-xl font-extrabold">設定</div>
        <Card>
          <div className="flex justify-between items-center py-1.5">
            <div className="flex flex-col">
              <div className="text-[14.5px] font-bold">次の段へ進む目安</div>
              <div className="text-xs text-dim">直近{settings.clearRequirement.count}回・不安{settings.clearRequirement.maxAnxietyAfter}以下</div>
            </div>
            <div className="flex gap-1.5">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => updateCount(n)}
                  className={`w-8 h-8 rounded-full text-sm font-bold ${n === settings.clearRequirement.count ? 'bg-coral text-white' : 'bg-[#fff0e2] text-dim'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-black/5">
            <div className="text-[14.5px] font-bold">ごほうびの設定</div>
            <div className="text-xs text-dim">{settings.rewards.length}件</div>
          </div>
          <div className="flex justify-between items-center py-1.5 border-t border-black/5">
            <div className="text-[14.5px] font-bold">ポイント</div>
            <div className="text-xs text-dim">{settings.points}pt</div>
          </div>
        </Card>
      </div>
      <BottomNav active="settings" />
    </div>
  );
}
```

- [ ] **Step 2: 型チェック**

```bash
npx tsc --noEmit
```
Expected: エラーなし

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: 設定画面を追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 13: トップレベルの導線調整とルートレイアウト

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`（初回アクセス時に `/onboarding` へ飛ぶ分岐は Task 7 で実装済み。ここでは `metadata` のタイトル等を調整するのみ）

**Interfaces:**
- Consumes: なし

- [ ] **Step 1: `app/layout.tsx` のタイトル・言語設定を直す**

```tsx
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
```

- [ ] **Step 2: 全体を通しで動作確認**

Browser paneで `exposure-app-dev`（Task 1で追加したlaunch.jsonエントリ）を起動し、次の一連の流れをクリックで確認する:
1. 初回アクセス → オンボーディング2画面 → ホームへ
2. ホームでテーマを1つ追加 → テーマ詳細 → 段階表を見る → 戻る
3. 「いどむ」→ 不安スコアを選ぶ → 記録する → 3択から「次の段へ進む」→ テーマ詳細で次の段になっていることを確認
4. 振り返り画面で累計回数が増えていることを確認
5. 恐怖チェック14問に回答 → 結果画面でバーが表示される
6. 設定画面で進級目安の数字を変更できる

コンソールエラーがないことも `read_console_messages` で確認する。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: レイアウトのタイトル調整、MVP通し確認

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 14: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 書く**

```markdown
# 暴露療法トレーナー（エクスポージャー記録アプリ）

竜一さん専用。怖いことに段階的に慣れていくための記録アプリ。
データはブラウザのlocalStorageにのみ保存（サーバーなし）。

## 開発

\`\`\`bash
npm install
npm run dev
\`\`\`

## 設計

- 設計書: [docs/superpowers/specs/2026-09-14-exposure-app-design.md](docs/superpowers/specs/2026-09-14-exposure-app-design.md)
- 実装計画: [docs/superpowers/plans/2026-09-14-exposure-app-mvp.md](docs/superpowers/plans/2026-09-14-exposure-app-mvp.md)
- ノウハウ調査: [../../20_調査/2026-09-14_暴露療法ノウハウ_パレオな男.md](../../20_調査/2026-09-14_暴露療法ノウハウ_パレオな男.md)
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "docs: READMEを追加

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```
