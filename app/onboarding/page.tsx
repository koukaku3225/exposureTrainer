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
