import { useState } from "react";
import { useApp } from "../context/AppContext";
import { getContracts } from "../../lib/contracts";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Building2, MapPin, Phone, Mail, FileText, Upload, CheckCircle, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";

const STEPS = ["机构信息", "联系方式", "资质证明", "提交审核"];

interface FormData {
  name: string;
  location: string;
  address: string;
  founded: string;
  catCapacity: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  licenseUploaded: boolean;
  photoUploaded: boolean;
  agreeTerm: boolean;
}

export function InstitutionRegister() {
  const navigate = useNavigate();
  const { signer, isConnected, connectWallet } = useApp();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    name: "", location: "", address: "", founded: "", catCapacity: "",
    contactName: "", phone: "", email: "", website: "",
    licenseUploaded: false, photoUploaded: false, agreeTerm: false,
  });

  const update = (key: keyof FormData, value: string | boolean) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return form.name && form.location && form.address;
    if (step === 1) return form.contactName && form.phone && form.email;
    if (step === 2) return form.licenseUploaded && form.agreeTerm;
    return true;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!isConnected || !signer) { await connectWallet(); return; }
    if (!form.name || !form.location) { setSubmitError("请填写机构名称和所在城市"); return; }
    setSubmitting(true);
    try {
      setSubmitError(null);
      const c = getContracts(signer);
      // location 拼接城市+地址，方便链上展示
      const locationStr = form.address ? (form.location + " " + form.address).trim() : form.location;
      const tx = await c.catRegistry.registerShelter(form.name, locationStr);
      await (tx as any).wait();
      setSubmitted(true);
    } catch (err: any) {
      if (!err?.message?.includes("user rejected")) {
        const msg: string = err?.message ?? "提交失败";
        if (msg.includes("Already registered")) {
          setSubmitError("该钱包地址已注册过机构，请勿重复提交");
        } else {
          setSubmitError(msg.slice(0, 120));
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen" style={{ background: "#fffbf5" }}>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-6 pt-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
              style={{ background: "rgba(249,115,22,0.12)", border: "2px solid rgba(249,115,22,0.35)" }}>
              <CheckCircle size={36} style={{ color: "#F97316" }} />
            </div>
            <h2 className="mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              提交成功！
            </h2>
            <p className="mb-2 text-sm" style={{ color: "#78350f", fontFamily: "'Nunito', sans-serif" }}>
              你的机构注册申请已提交，平台将在 3-5 个工作日内完成审核。
            </p>
            <p className="mb-8 text-sm" style={{ color: "#b45309", fontFamily: "'Nunito', sans-serif" }}>
              审核通过后，你将可以：
              <br />• 上传猫咪档案（姓名/年龄/成长图片）
              <br />• 接受云领养捐款和真实领养申请
              <br />• 管理猫咪状态和领养进度
            </p>

            <div className="p-4 rounded-2xl mb-6 text-left"
              style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.12)" }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} style={{ color: "#F97316" }} />
                <span className="text-xs" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>注册信息</span>
              </div>
              <div className="text-xs space-y-1" style={{ color: "#b45309", fontFamily: "'Nunito', sans-serif" }}>
                <div>机构名称：{form.name}</div>
                <div>所在城市：{form.location}</div>
                <div>联系邮箱：{form.email}</div>
                <div>联系电话：{form.phone}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(249,115,22,0.06)",
                  color: "#78350f",
                  border: "1px solid rgba(249,115,22,0.12)",
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                返回首页
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex-1 py-3 rounded-xl text-sm text-white"
                style={{
                  background: "linear-gradient(135deg, #F97316, #fbbf24)",
                  fontFamily: "'Nunito', sans-serif"
                }}
              >
                浏览猫咪档案
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#fffbf5", fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(ellipse, #F97316 0%, transparent 70%)" }} />
      </div>

      <div className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-lg">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.22)" }}>
              <Building2 size={24} style={{ color: "#F97316" }} />
            </div>
            <h1 className="" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>
              机构注册入驻
            </h1>
            <p className="text-sm mt-2" style={{ color: "#b45309" }}>
              加入 PurrChain 平台，帮助更多猫咪找到温暖的家
            </p>
          </motion.div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all"
                  style={{
                    background: i <= step ? "linear-gradient(135deg, #F97316, #fbbf24)" : "rgba(249,115,22,0.12)",
                    color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    boxShadow: i === step ? "0 0 15px rgba(124,58,237,0.5)" : "none",
                  }}
                >
                  {i < step ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={{ color: i <= step ? "#F97316" : "rgba(255,255,255,0.3)" }}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px mx-2 hidden sm:block"
                    style={{ background: i < step ? "rgba(167,139,250,0.4)" : "rgba(249,115,22,0.12)", minWidth: 20 }} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <motion.div
            className="rounded-3xl p-6"
            style={{
              background: "rgba(255,255,255,0.95)",
              border: "1px solid #ddd6fe",
              boxShadow: "0 0 40px rgba(0,0,0,0.4)",
            }}
          >
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>
                    机构基本信息
                  </h3>
                  <div className="space-y-4">
                    <FormField
                      label="机构名称 *" icon={<Building2 size={15} />}
                      placeholder="例：爱心猫舍" value={form.name}
                      onChange={(v) => update("name", v)}
                    />
                    <FormField
                      label="所在城市 *" icon={<MapPin size={15} />}
                      placeholder="例：台湾彰化" value={form.location}
                      onChange={(v) => update("location", v)}
                    />
                    <FormField
                      label="详细地址 *" icon={<MapPin size={15} />}
                      placeholder="请填写机构详细地址" value={form.address}
                      onChange={(v) => update("address", v)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        label="成立年份" icon={<FileText size={15} />}
                        placeholder="例：2018" value={form.founded}
                        onChange={(v) => update("founded", v)}
                      />
                      <FormField
                        label="在养猫咪数" icon={<FileText size={15} />}
                        placeholder="例：12" value={form.catCapacity}
                        onChange={(v) => update("catCapacity", v)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>
                    联系方式
                  </h3>
                  <div className="space-y-4">
                    <FormField
                      label="联系人姓名 *" icon={<FileText size={15} />}
                      placeholder="负责人姓名" value={form.contactName}
                      onChange={(v) => update("contactName", v)}
                    />
                    <FormField
                      label="联系电话 *" icon={<Phone size={15} />}
                      placeholder="例：0912-345-678" value={form.phone}
                      onChange={(v) => update("phone", v)}
                    />
                    <FormField
                      label="电子邮件 *" icon={<Mail size={15} />}
                      placeholder="official@shelter.org" value={form.email}
                      onChange={(v) => update("email", v)}
                    />
                    <FormField
                      label="官方网站" icon={<FileText size={15} />}
                      placeholder="https://..." value={form.website}
                      onChange={(v) => update("website", v)}
                    />
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>
                    上传资质证明
                  </h3>
                  <div className="space-y-4">
                    <UploadBox
                      label="营业执照 / 立案证书 *"
                      desc="支持 PDF、JPG、PNG，最大 10MB"
                      uploaded={form.licenseUploaded}
                      onUpload={() => update("licenseUploaded", true)}
                    />
                    <UploadBox
                      label="机构实景照片"
                      desc="展示收容环境，帮助用户了解机构"
                      uploaded={form.photoUploaded}
                      onUpload={() => update("photoUploaded", true)}
                    />

                    <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(109,58,238,0.04)", border: "1px solid rgba(249,115,22,0.12)" }}>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.agreeTerm}
                          onChange={(e) => update("agreeTerm", e.target.checked)}
                          className="mt-1 accent-purple-500"
                        />
                        <span className="text-xs" style={{ color: "#78350f" }}>
                          我已阅读并同意 PurrChain 平台合作协议，确认机构信息真实有效，
                          同意捐款直接到账机构钱包，平台不经手资金。*
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="mb-5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#1e1b4b" }}>
                    确认提交
                  </h3>
                  <div className="space-y-3 mb-5">
                    {[
                      { label: "机构名称", value: form.name },
                      { label: "城市", value: form.location },
                      { label: "地址", value: form.address },
                      { label: "联系人", value: form.contactName },
                      { label: "电话", value: form.phone },
                      { label: "邮件", value: form.email },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-2"
                        style={{ borderBottom: "1px solid rgba(249,115,22,0.06)" }}>
                        <span className="text-xs" style={{ color: "#b45309", fontFamily: "'Space Grotesk', sans-serif" }}>{item.label}</span>
                        <span className="text-xs" style={{ color: "#1e1b4b" }}>{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.12)" }}>
                    <p className="text-xs" style={{ color: "#C4B5FD" }}>
                      ⏱ 审核时间：3-5 个工作日
                      <br />
                      审核通过后即可上传猫咪档案并开始接受支持
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nav buttons */}
            {submitError && (
              <div className="mt-4 px-4 py-3 rounded-xl text-xs" style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)", color: "#dc2626" }}>
                ⚠️ {submitError}
              </div>
            )}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{
                    background: "rgba(249,115,22,0.06)",
                    color: "#78350f",
                    border: "1px solid rgba(249,115,22,0.12)",
                  }}
                >
                  <ChevronLeft size={15} /> 上一步
                </button>
              )}
              <button
                onClick={step === STEPS.length - 1 ? handleSubmit : () => setStep((s) => s + 1)}
                disabled={!canNext() || submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-white transition-all"
                style={{
                  background: canNext() ? "linear-gradient(135deg, #F97316, #fbbf24)" : "rgba(249,115,22,0.12)",
                  color: canNext() ? "#fff" : "rgba(255,255,255,0.3)",
                  cursor: canNext() ? "pointer" : "default",
                  boxShadow: canNext() ? "0 0 20px rgba(249,115,22,0.35)" : "none",
                  fontFamily: "'Space Grotesk', sans-serif"
                }}
              >
                {step === STEPS.length - 1 ? (submitting ? "提交中…" : "提交审核") : "下一步"}
                {step < STEPS.length - 1 && <ChevronRight size={15} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, icon, placeholder, value, onChange }: {
  label: string; icon: ReactNode; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#b45309", fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
        style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.12)" }}>
        <span style={{ color: "#a8a6c8" }}>{icon}</span>
        <input
          className="flex-1 bg-transparent outline-none text-sm placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ fontFamily: "'Nunito', sans-serif", color: "#1e1b4b" }}
        />
      </div>
    </div>
  );
}

function UploadBox({ label, desc, uploaded, onUpload }: {
  label: string; desc: string; uploaded: boolean; onUpload: () => void;
}) {
  return (
    <div>
      <label className="block text-xs mb-1.5" style={{ color: "#b45309", fontFamily: "'Space Grotesk', sans-serif" }}>
        {label}
      </label>
      <button
        onClick={onUpload}
        className="w-full p-4 rounded-xl text-center transition-all"
        style={{
          background: uploaded ? "rgba(249,115,22,0.07)" : "rgba(109,58,238,0.04)",
          border: uploaded ? "1px solid rgba(249,115,22,0.35)" : "2px dashed rgba(109,58,238,0.15)",
        }}
      >
        {uploaded ? (
          <div className="flex items-center justify-center gap-2" style={{ color: "#F97316" }}>
            <CheckCircle size={16} />
            <span className="text-sm">已上传</span>
          </div>
        ) : (
          <div>
            <Upload size={20} className="mx-auto mb-2" style={{ color: "#a8a6c8" }} />
            <div className="text-xs" style={{ color: "#b45309" }}>
              点击模拟上传
            </div>
            <div className="text-xs mt-1" style={{ color: "#a8a6c8" }}>{desc}</div>
          </div>
        )}
      </button>
    </div>
  );
}