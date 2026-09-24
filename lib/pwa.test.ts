import { describe, expect, it } from 'vitest';
import { installMode, isIOS } from './pwa';

/**
 * スマホアプリとして入れる案内の分岐。取り違えると
 * 「iPhone でボタンを押しても何も起きない」「入れたのに毎回勧められる」になる。
 */
const UA = {
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iphoneChrome:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/129.0 Mobile/15E148 Safari/604.1',
  ipad: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
  android:
    'Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:130.0) Gecko/20100101 Firefox/130.0',
};

describe('installMode', () => {
  it('アプリとして開いているなら、どの端末でも何も勧めない', () => {
    for (const ua of Object.values(UA)) {
      expect(installMode({ standalone: true, hasPrompt: true, userAgent: ua, maxTouchPoints: 5 })).toBe('installed');
    }
  });

  it('Android の Chrome はボタン1つで入れられる', () => {
    expect(installMode({ standalone: false, hasPrompt: true, userAgent: UA.android, maxTouchPoints: 5 })).toBe('prompt');
  });

  it('iPhone は Safari でも Chrome でも手順の案内になる', () => {
    for (const ua of [UA.iphone, UA.iphoneChrome]) {
      expect(installMode({ standalone: false, hasPrompt: false, userAgent: ua, maxTouchPoints: 5 })).toBe('ios');
    }
  });

  it('iPad（Mac を名乗る）は iPad、指で触れない Mac は iPad としない', () => {
    expect(isIOS(UA.ipad, 5)).toBe(true);
    expect(isIOS(UA.ipad, 0)).toBe(false);
  });

  it('ダイアログを呼べないブラウザは、メニューからの案内になる', () => {
    expect(installMode({ standalone: false, hasPrompt: false, userAgent: UA.firefox, maxTouchPoints: 0 })).toBe('manual');
    expect(installMode({ standalone: false, hasPrompt: false, userAgent: UA.android, maxTouchPoints: 5 })).toBe('manual');
  });
});
