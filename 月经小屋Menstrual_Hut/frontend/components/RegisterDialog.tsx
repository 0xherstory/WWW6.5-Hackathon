"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isIdentityRegistered, saveHutIdentity } from "@/lib/hut-identity-storage";

type RegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletAddress: string | undefined;
  onRegistered: () => void;
};

function normalizePhoneDigits(v: string): string {
  return v.replace(/\D/g, "");
}

function isValidCnMobile(digits: string): boolean {
  return /^1\d{10}$/.test(digits);
}

function isValidCnId18(v: string): boolean {
  const s = v.trim();
  return /^\d{17}[\dXx]$/.test(s);
}

export function RegisterDialog({
  open,
  onOpenChange,
  walletAddress,
  onRegistered,
}: RegisterDialogProps) {
  const t = useTranslations();
  const [step, setStep] = useState<"form" | "success">("form");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = useCallback(() => {
    setStep("form");
    setPhoneDigits("");
    setIdNumber("");
    setPassword("");
    setPassword2("");
    setFormError("");
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const addr = walletAddress?.trim();
    if (!addr) {
      setFormError(t("registerNoWallet"));
      return;
    }
    if (isIdentityRegistered(addr)) {
      setFormError(t("registerAlready"));
      return;
    }
    const phone = normalizePhoneDigits(phoneDigits);
    if (!isValidCnMobile(phone)) {
      setFormError(t("registerPhoneError"));
      return;
    }
    if (!isValidCnId18(idNumber)) {
      setFormError(t("registerIdError"));
      return;
    }
    if (password.length < 6) {
      setFormError(t("registerPwdShort"));
      return;
    }
    if (password !== password2) {
      setFormError(t("registerPwdMismatch"));
      return;
    }

    setSubmitting(true);
    try {
      await saveHutIdentity({
        walletAddress: addr,
        phone: `+86${phone}`,
        plainIdNumber: idNumber.trim(),
        password,
      });
      setStep("success");
      onRegistered();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("registerSaveError"));
    } finally {
      setSubmitting(false);
    }
  };

  const walletShort =
    walletAddress && walletAddress.length > 10
      ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}`
      : walletAddress;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-md"
        onPointerDownOutside={(e: Event) => {
          // 如果处于成功界面，阻止点击弹窗外部导致意外关闭
          if (step === "success") e.preventDefault();
        }}
      >
        {step === "success" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">{t("registerSuccessTitle")}</DialogTitle>
              <DialogDescription className="text-center text-base leading-relaxed">
                {t("registerSuccessBody")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-center gap-2 mt-4">
              <Button 
                type="button" 
                className="w-full sm:w-auto" 
                onClick={() => onOpenChange(false)}
              >
                {t("registerClose")}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-center text-xl">{t("registerDialogTitle")}</DialogTitle>
              <DialogDescription className="text-center text-[#9f1239]/80">
                {t("registerDialogSubtitle")}
              </DialogDescription>
            </DialogHeader>

            {walletAddress ? (
              <p className="rounded-xl border border-pink-100 bg-white/60 px-3 py-2 text-center text-xs text-[#9f1239]/75 mt-4">
                {t("registerWalletHint")}
                {": "}
                <span className="font-mono text-[#4c1d95]">{walletShort}</span>
              </p>
            ) : (
              <p className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-center text-sm text-amber-900 mt-4">
                {t("registerNoWallet")}
              </p>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="hut-phone">{t("registerPhone")}</Label>
                <div className="flex gap-2">
                  <span className="flex h-10 shrink-0 items-center rounded-xl border border-pink-200/90 bg-white/80 px-3 text-sm font-medium text-[#9f1239]">
                    +86
                  </span>
                  <Input
                    id="hut-phone"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder={t("registerPhonePh")}
                    value={phoneDigits}
                    maxLength={11}
                    disabled={!walletAddress}
                    onChange={(e) => setPhoneDigits(normalizePhoneDigits(e.target.value))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hut-id">{t("registerId")}</Label>
                <Input
                  id="hut-id"
                  autoComplete="off"
                  placeholder={t("registerIdPh")}
                  value={idNumber}
                  maxLength={18}
                  disabled={!walletAddress}
                  onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hut-pw">{t("registerPassword")}</Label>
                <Input
                  id="hut-pw"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("registerPasswordPh")}
                  value={password}
                  disabled={!walletAddress}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="hut-pw2">{t("registerPasswordConfirm")}</Label>
                <Input
                  id="hut-pw2"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t("registerPasswordConfirmPh")}
                  value={password2}
                  disabled={!walletAddress}
                  onChange={(e) => setPassword2(e.target.value)}
                />
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#9f1239]/65 mb-4">{t("registerPrivacy")}</p>

            {formError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50/90 px-3 py-2 text-sm text-rose-800 mb-4" role="alert">
                {formError}
              </p>
            ) : null}

            <DialogFooter className="gap-2 sm:justify-stretch">
              <Button
                type="submit"
                className="w-full"
                disabled={!walletAddress || submitting}
              >
                {submitting ? t("registerSubmitting") : t("registerSubmit")}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}