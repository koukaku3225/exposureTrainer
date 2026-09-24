'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { installMode, type InstallMode } from '@/lib/pwa';
import { clearInstallPrompt, getInstallPrompt, onInstallPromptChange } from '@/components/PwaBoot';

/**
 * 「スマホアプリとして入れる」ボタン。
 *
 * ブラウザごとに入れ方が違うので、出すものを変える（判断は lib/pwa.ts）。
 *   prompt  … ボタンでそのままインストールのダイアログを出す（Android の Chrome など）
 *   ios     … 共有 →「ホーム画面に追加」の手順を出す（ページから呼ぶ手段が無い）
 *   manual  … ブラウザのメニューから入れる案内
 *   installed … アプリとして開いているので、何も出さない
 *
 * ■ iPhone の注意書きは消さない
 * このアプリの記録はブラウザの中にしか無い。iPhone ではホーム画面のアプリと
 * Safari で保存場所が別になるので、入れただけでは記録が引き継がれない。
 * 「消えた」と思わせないために、書き出し → 読み込みの手順を必ず伝える。
 */
export function InstallCard() {
  const [mode, setMode] = useState<InstallMode | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const decide = () =>
      setMode(
        installMode({
          standalone:
            window.matchMedia('(display-mode: standalone)').matches ||
            // iPhone のホーム画面から開いたときはこちらで分かる
            (navigator as Navigator & { standalone?: boolean }).standalone === true,
          hasPrompt: getInstallPrompt() !== null,
          userAgent: navigator.userAgent,
          maxTouchPoints: navigator.maxTouchPoints ?? 0,
        }),
      );
    decide();
    return onInstallPromptChange(decide);
  }, []);

  // 判断がつくまで（サーバー側の描画中）は何も出さない。ちらつかせない
  if (mode === null || mode === 'installed') return null;

  async function install() {
    const p = getInstallPrompt();
    if (!p) return;
    setBusy(true);
    try {
      await p.prompt();
      const { outcome } = await p.userChoice;
      if (outcome === 'accepted') setDone(true);
    } finally {
      // 同じダイアログは2回出せない（ブラウザの仕様）
      clearInstallPrompt();
      setBusy(false);
    }
  }

  return (
    <Card className="border-2 border-track">
      <div className="text-[14.5px] font-bold">スマホアプリとして使う</div>
      <div className="text-xs text-dim leading-relaxed">
        ホーム画面にアイコンが置かれ、全画面で開けます。電波が無いときも使えます。
      </div>

      {done ? (
        <div role="status" className="text-[13px] font-bold text-coral">
          インストールしました。ホーム画面のアイコンから開けます。
        </div>
      ) : mode === 'prompt' ? (
        <button
          type="button"
          onClick={install}
          disabled={busy}
          className="h-11 rounded-xl bg-coral text-white text-[14px] font-extrabold disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-dark"
        >
          {busy ? '確認しています…' : 'アプリをインストール'}
        </button>
      ) : mode === 'ios' ? (
        <ol className="list-decimal pl-5 text-[13px] leading-relaxed flex flex-col gap-1">
          <li>
            画面下（iPadは上）の<b>共有ボタン</b>（四角から矢印が出ているマーク）を押す
          </li>
          <li>
            一覧を下へずらして<b>「ホーム画面に追加」</b>を押す
          </li>
          <li>右上の「追加」を押す</li>
        </ol>
      ) : (
        <div className="text-[13px] leading-relaxed">
          ブラウザのメニュー（︙ や …）から<b>「アプリをインストール」</b>または
          <b>「ホーム画面に追加」</b>を選んでください。見つからないときは、Android は Chrome、iPhone は
          Safari で開くと入れられます。
        </div>
      )}

      {mode === 'ios' && !done && (
        <div className="rounded-xl bg-[#fff0e2] px-3 py-2 text-xs leading-relaxed text-ink">
          iPhone では、ホーム画面のアプリと Safari で<b>記録の保存場所が別</b>になります。
          いまの記録を引き継ぐには、先に下の<b>「書き出す」</b>で保存し、アプリ側の設定で
          <b>「読み込む」</b>を押してください。
        </div>
      )}
    </Card>
  );
}
