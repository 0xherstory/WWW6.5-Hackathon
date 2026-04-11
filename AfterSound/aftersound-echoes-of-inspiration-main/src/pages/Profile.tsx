import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  User, Music, Link2, Shield, Edit3, Save, LogOut, Users, MessageSquare, Eye, EyeOff, Wallet,
} from "lucide-react";

export default function Profile() {
  const { t } = useLanguage();
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [works, setWorks] = useState<any[]>([]);
  const [chainRecords, setChainRecords] = useState<any[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editWallet, setEditWallet] = useState("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: p } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      if (p) {
        setProfile(p);
        setEditName(p.display_name || "");
        setEditBio(p.bio || "");
        setEditWallet(p.wallet_address || "");
      }
      const { data: w } = await supabase.from("music_works").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setWorks(w || []);
      const { data: cr } = await supabase.from("blockchain_records").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setChainRecords(cr || []);
      const { count: fc } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", user.id);
      setFollowers(fc || 0);
      const { count: fg } = await supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", user.id);
      setFollowing(fg || 0);
    };
    load();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      display_name: editName,
      bio: editBio,
      wallet_address: editWallet,
    }).eq("user_id", user.id);
    if (error) { toast.error(error.message); return; }
    setProfile({ ...profile, display_name: editName, bio: editBio, wallet_address: editWallet });
    setEditing(false);
    toast.success(t("Profile updated!", "资料已更新！"));
  };

  const toggleWorkVisibility = async (workId: string, current: boolean) => {
    await supabase.from("music_works").update({ is_public: !current }).eq("id", workId);
    setWorks(works.map((w) => (w.id === workId ? { ...w, is_public: !current } : w)));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 noise-bg">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <Card className="glass-card border-glass-border mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center border border-glass-border">
                <User className="w-10 h-10 text-foreground/40" />
              </div>
              <div className="flex-1">
                {editing ? (
                  <div className="space-y-3">
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder={t("Display name", "昵称")} className="bg-secondary border-glass-border" />
                    <Textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder={t("Bio", "简介")} className="bg-secondary border-glass-border" rows={2} />
                    <Input value={editWallet} onChange={(e) => setEditWallet(e.target.value)} placeholder={t("Wallet address", "钱包地址")} className="bg-secondary border-glass-border font-mono text-xs" />
                    <div className="flex gap-2">
                      <Button size="sm" variant="glow" onClick={saveProfile} className="gap-1"><Save className="w-3.5 h-3.5" />{t("Save", "保存")}</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>{t("Cancel", "取消")}</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-display gradient-text mb-1">{profile?.display_name || t("Unnamed", "未命名")}</h1>
                    <p className="text-sm text-muted-foreground mb-2">{profile?.bio || t("No bio yet", "暂无简介")}</p>
                    {profile?.wallet_address && (
                      <p className="text-xs text-muted-foreground/50 font-mono flex items-center gap-1"><Wallet className="w-3 h-3" />{profile.wallet_address.slice(0, 6)}...{profile.wallet_address.slice(-4)}</p>
                    )}
                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <span className="text-foreground/60"><strong>{followers}</strong> <span className="text-muted-foreground">{t("followers", "粉丝")}</span></span>
                      <span className="text-foreground/60"><strong>{following}</strong> <span className="text-muted-foreground">{t("following", "关注")}</span></span>
                      <span className="text-foreground/60"><strong>{works.length}</strong> <span className="text-muted-foreground">{t("works", "作品")}</span></span>
                    </div>
                  </>
                )}
              </div>
              {!editing && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="gap-1"><Edit3 className="w-3.5 h-3.5" />{t("Edit", "编辑")}</Button>
                  <Button size="sm" variant="ghost" onClick={handleSignOut} className="gap-1"><LogOut className="w-3.5 h-3.5" />{t("Logout", "退出")}</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="works" className="space-y-6">
          <TabsList className="glass w-full grid grid-cols-3 gap-1">
            <TabsTrigger value="works" className="gap-1.5 text-xs"><Music className="w-3.5 h-3.5" />{t("My Works", "我的作品")}</TabsTrigger>
            <TabsTrigger value="chain" className="gap-1.5 text-xs"><Link2 className="w-3.5 h-3.5" />{t("On-Chain", "链上记录")}</TabsTrigger>
            <TabsTrigger value="stats" className="gap-1.5 text-xs"><Shield className="w-3.5 h-3.5" />{t("Stats", "统计")}</TabsTrigger>
          </TabsList>

          {/* Works */}
          <TabsContent value="works">
            {works.length === 0 ? (
              <Card className="glass-card border-glass-border"><CardContent className="p-12 text-center">
                <Music className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">{t("No works yet. Start creating!", "还没有作品，去创作吧！")}</p>
                <Button variant="glow" className="mt-4" onClick={() => navigate("/create")}>{t("Start Creating", "开始创作")}</Button>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {works.map((w) => (
                  <Card key={w.id} className="glass-card border-glass-border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground/80">{w.title || t("Untitled", "未命名")}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{w.work_type} · {new Date(w.created_at).toLocaleDateString()}</p>
                        {w.hash && <p className="text-[10px] font-mono text-muted-foreground/40 mt-1">Hash: {w.hash.slice(0, 16)}...</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {w.is_on_chain && <Link2 className="w-3.5 h-3.5 text-glow-cyan" />}
                        <Button size="sm" variant="ghost" onClick={() => toggleWorkVisibility(w.id, w.is_public)}>
                          {w.is_public ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* On-Chain */}
          <TabsContent value="chain">
            {chainRecords.length === 0 ? (
              <Card className="glass-card border-glass-border"><CardContent className="p-12 text-center">
                <Link2 className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground">{t("No on-chain records yet", "暂无链上记录")}</p>
              </CardContent></Card>
            ) : (
              <div className="grid gap-4">
                {chainRecords.map((r) => (
                  <Card key={r.id} className="glass-card border-glass-border">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-foreground/70 font-mono">{r.tx_hash.slice(0, 20)}...</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.chain_name} · {new Date(r.created_at).toLocaleDateString()}</p>
                        </div>
                        <a href={`https://testnet.snowtrace.io/tx/${r.tx_hash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          {t("View", "查看")} →
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Stats */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: t("Total Works", "总作品"), value: works.length, icon: Music },
                { label: t("On-Chain", "已上链"), value: works.filter((w) => w.is_on_chain).length, icon: Link2 },
                { label: t("Followers", "粉丝"), value: followers, icon: Users },
                { label: t("Comments", "评论"), value: 0, icon: MessageSquare },
              ].map((s, i) => (
                <Card key={i} className="glass-card border-glass-border">
                  <CardContent className="p-5 text-center">
                    <s.icon className="w-6 h-6 text-primary/40 mx-auto mb-2" />
                    <p className="text-2xl font-display gradient-text">{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
