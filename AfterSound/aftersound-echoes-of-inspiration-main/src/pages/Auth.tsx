import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Mail, Phone, Key, Eye, EyeOff, LogIn } from "lucide-react";

export default function Auth() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleGuest = () => {
    toast.success(t("Welcome, guest! Some features require an account.", "欢迎，游客！部分功能需要账号。"));
    navigate("/");
  };

  const handleEmail = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success(t("Check your email to confirm your account.", "请查看邮箱确认账号。"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success(t("Welcome back!", "欢迎回来！"));
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast.success(t("OTP sent to your phone.", "验证码已发送到手机。"));
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!otp) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: "sms" });
      if (error) throw error;
      toast.success(t("Welcome!", "欢迎！"));
      navigate("/");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 pt-20 pb-16">
      <div className="w-full max-w-md animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display gradient-text mb-1">AfterSound</h1>
          <p className="text-serif-cn text-muted-foreground">余音</p>
        </div>

        <Card className="glass-card border-glass-border">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t("Welcome", "欢迎")}</CardTitle>
            <CardDescription>
              {t("Sign in to save your creations", "登录以保存你的创作")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Guest */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGuest}
            >
              <User className="w-4 h-4" />
              {t("Continue as Guest", "以游客身份继续")}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-glass-border" />
              <span className="text-xs text-muted-foreground">{t("or sign in with", "或者使用")}</span>
              <div className="flex-1 h-px bg-glass-border" />
            </div>

            <Tabs defaultValue="email" className="space-y-4">
              <TabsList className="glass w-full grid grid-cols-2 gap-1">
                <TabsTrigger value="email" className="gap-1.5 text-xs">
                  <Mail className="w-3.5 h-3.5" />
                  {t("Email", "邮箱")}
                </TabsTrigger>
                <TabsTrigger value="phone" className="gap-1.5 text-xs">
                  <Phone className="w-3.5 h-3.5" />
                  {t("Phone", "手机号")}
                </TabsTrigger>
              </TabsList>

              {/* Email tab */}
              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t("Email", "邮箱")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-secondary border-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t("Password", "密码")}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-secondary border-glass-border pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  className="w-full gap-2"
                  variant="glow"
                  disabled={loading}
                  onClick={handleEmail}
                >
                  <LogIn className="w-4 h-4" />
                  {isSignUp ? t("Sign Up", "注册") : t("Sign In", "登录")}
                </Button>
                <button
                  type="button"
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp
                    ? t("Already have an account? Sign in", "已有账号？去登录")
                    : t("No account? Sign up", "没有账号？去注册")}
                </button>
              </TabsContent>

              {/* Phone tab */}
              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("Phone Number", "手机号码")}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 234 567 8900"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-secondary border-glass-border"
                  />
                </div>
                {!otpSent ? (
                  <Button
                    className="w-full gap-2"
                    variant="glow"
                    disabled={loading}
                    onClick={handlePhoneSendOtp}
                  >
                    <Key className="w-4 h-4" />
                    {t("Send OTP", "发送验证码")}
                  </Button>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="otp">{t("Verification Code", "验证码")}</Label>
                      <Input
                        id="otp"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="bg-secondary border-glass-border text-center tracking-widest text-lg"
                      />
                    </div>
                    <Button
                      className="w-full gap-2"
                      variant="glow"
                      disabled={loading}
                      onClick={handlePhoneVerify}
                    >
                      <LogIn className="w-4 h-4" />
                      {t("Verify & Sign In", "验证并登录")}
                    </Button>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {t(
            "Guest mode lets you explore, but projects won't be saved.",
            "游客模式可浏览，但项目不会保存。"
          )}
        </p>
      </div>
    </div>
  );
}
