"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { validateEmail, isGmail, simulateZKProof } from "@/lib/zkEmailSimulation";
import { useClaimStore } from "@/stores/claimStore";

type Step = "email" | "code" | "verifying" | "success";

export default function VerificationPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { setEmail, setEmailHash, setIsVerified } = useClaimStore();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmailLocal] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [verificationText, setVerificationText] = useState("");
  const [emailHash, setEmailHashLocal] = useState<string>("");

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    setError("");

    if (!validateEmail(email)) {
      setError(t('verification.error.invalidEmail'));
      return;
    }

    if (!isGmail(email)) {
      setError(t('verification.error.notGmail'));
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.remainingSeconds) {
          setCountdown(data.remainingSeconds);
        }
        setError(data.error || t('verification.error.sendFailed'));
        return;
      }

      // MVP阶段：显示验证码在界面上，方便测试
      if (data.devCode) {
        console.log(`[DEV] Your verification code is: ${data.devCode}`);
        alert(t('verification.devModeAlert', { code: data.devCode }));
      }

      setStep("code");
      setCountdown(60);
    } catch (err) {
      console.error('Send code error:', err);
      setError(t('verification.error.sendFailed'));
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    setError("");

    if (!/^\d{6}$/.test(code)) {
      setError(t('verification.error.invalidCode'));
      return;
    }

    setStep("verifying");

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('verification.error.verifyFailed'));
        setStep("code");
        return;
      }

      // 验证步骤文本 key
      const stepKeys = [
        'verification.animation.disconnecting',
        'verification.animation.reading',
        'verification.animation.generating',
        'verification.animation.shredded',
      ];

      await simulateZKProof(email, (progress) => {
        // 根据进度确定当前步骤文本
        const stepIndex = Math.min(
          Math.floor(progress * stepKeys.length),
          stepKeys.length - 1
        );
        const text = progress >= 1 ? t('verification.animation.complete') : t(stepKeys[stepIndex]);
        setVerificationText(text);
        setVerificationProgress(progress);
      });

      setEmailHashLocal(data.emailHash);
      setEmail(email);
      setEmailHash(data.emailHash);
      setIsVerified(true);

      setStep("success");
    } catch (err) {
      console.error('Verify error:', err);
      setError(t('verification.error.verifyFailed'));
      setStep("code");
    }
  };

  const handleClaimNow = () => {
    router.push(`/${locale}/claim`);
  };

  const handleClaimLater = () => {
    router.push(`/${locale}/sanctuary`);
  };

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-px bg-accent/30" />
            <div className="w-1.5 h-1.5 border border-accent/50 rotate-45" />
            <div className="w-8 h-px bg-accent/30" />
          </div>

          <h1 className="text-h2 font-serif text-text mb-4">
            {t('verification.title')}
          </h1>
          <p className="text-body text-muted mb-2">
            {t('verification.intro')}
          </p>
          <p className="text-small text-muted/70 leading-relaxed">
            {t('verification.description')}
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-xl">🔐</div>
            <div>
              <h3 className="text-sm font-medium text-text mb-1">
                {t('verification.privacy.title')}
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                {t('verification.privacy.desc')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/50 backdrop-blur-sm border border-secondary/30 p-8">
          {step === "email" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-text mb-2">
                  {t('verification.steps.input')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmailLocal(e.target.value)}
                  placeholder={t('verification.form.emailPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-accent focus:outline-none transition-colors text-text"
                  disabled={isSending}
                />
                <p className="text-xs text-muted mt-2">
                  {t('verification.form.emailNote')}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                onClick={handleSendCode}
                disabled={!email.trim() || isSending}
                className="w-full px-6 py-3 border border-accent bg-transparent text-text hover:bg-accent hover:text-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? '...' : t('verification.form.sendCode')}
              </button>
            </div>
          )}

          {step === "code" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-text mb-2">
                  {t('verification.steps.code')}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('verification.form.codePlaceholder')}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-accent focus:outline-none transition-colors text-text text-center text-2xl tracking-widest"
                  maxLength={6}
                />
                <p className="text-xs text-muted mt-2">
                  {t('verification.form.codeSent', { email })}
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="flex-1 px-4 py-3 border border-gray-200 text-muted hover:border-accent hover:text-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? t('verification.form.resendCode', { seconds: countdown })
                    : t('verification.form.sendCode')}
                </button>
                <button
                  onClick={handleVerify}
                  disabled={code.length !== 6}
                  className="flex-1 px-6 py-3 border border-accent bg-transparent text-text hover:bg-accent hover:text-light transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('verification.form.verify')}
                </button>
              </div>
            </div>
          )}

          {step === "verifying" && (
            <div className="text-center py-8">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-2 border-accent/20 rounded-full" />
                <div
                  className="absolute inset-0 border-2 border-accent rounded-full transition-all duration-300"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(verificationProgress * Math.PI * 2)}% ${50 - 50 * Math.cos(verificationProgress * Math.PI * 2)}%, 50% 50%)`
                  }}
                />
                <div className="absolute inset-4 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-accent">◆</span>
                </div>
              </div>

              <p className="text-sm text-muted animate-pulse">
                {verificationText}
              </p>

              <div className="mt-4 w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${verificationProgress * 100}%` }}
                />
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center border border-accent/30 rounded-full">
                <span className="text-4xl">🎉</span>
              </div>

              <h2 className="text-xl font-serif text-text mb-3">
                {t('verification.success.title')}
              </h2>
              <p className="text-sm text-muted mb-4">
                {t('verification.success.desc')}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg mb-6 text-xs text-muted break-all">
                <p className="font-medium mb-1">Email Hash:</p>
                <code>{emailHash}</code>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClaimNow}
                  className="flex-1 px-6 py-3 border border-accent bg-accent text-light hover:bg-accent-dark transition-all duration-300"
                >
                  {t('verification.success.claimNow')}
                </button>
                <button
                  onClick={handleClaimLater}
                  className="flex-1 px-6 py-3 border border-gray-200 text-muted hover:border-accent hover:text-accent transition-all duration-300"
                >
                  {t('verification.success.claimLater')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
