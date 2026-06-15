import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { AppNav } from "@/components/AppNav";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Copy, Check, Share2, Users, Gift, Trophy, Zap, Star, Crown,
  Infinity, ChevronRight, Loader2, Mail, MessageCircle, Link2,
  ArrowUpRight, Clock, CheckCircle2, Lock, Instagram, Shield,
} from "lucide-react";
import {
  REWARDS, nextReward, earnedRewards, getOrCreateCode, listReferrals,
} from "@/lib/referral";

export const Route = createFileRoute("/parrainage")({
  head: () => ({ meta: [{ title: "Parrainage — Springr" }] }),
  component: ParrainagePage,
});

/* ─── types ─── */
interface ReferralRow {
  id: string; referred_id: string | null; status: string;
  reward_given: boolean; created_at: string;
}

/* ─── reward icon map ─── */
const REWARD_ICONS = [Shield, Zap, Star, Trophy, Crown, Infinity];

function ParrainagePage() {
  const [userId,    setUserId]    = useState("");
  const [firstName, setFirst]     = useState("");
  const [code,      setCode]      = useState("");
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [copied,    setCopied]    = useState<"code" | "link" | null>(null);

  const profileUrl = typeof window !== "undefined" ? window.location.origin : "https://springr.app";
  const inviteUrl  = `${profileUrl}/invite/${code}`;
  const shareMsg   = `Rejoins-moi sur Springr, le réseau pro des étudiants ! Crée ton compte avec mon lien et gagne 7 jours de Premium offerts 👉 ${inviteUrl}`;

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const u = session.user;
    const m = u.user_metadata ?? {};
    const fn: string = m.firstName ?? m.name?.split(" ")[0] ?? "Springr";
    setUserId(u.id);
    setFirst(fn);
    const myCode = await getOrCreateCode(u.id, fn);
    setCode(myCode);
    const rows = await listReferrals(u.id);
    setReferrals(rows as ReferralRow[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function copyText(text: string, which: "code" | "link") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const completedCount = referrals.filter(r => r.status === "completed").length;
  const earned         = earnedRewards(completedCount);
  const next           = nextReward(completedCount);
  const pct            = next ? Math.round((completedCount / next.count) * 100) : 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <Loader2 className="size-6 text-mute animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <AppNav />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-violet/15 via-ink to-ink border-b border-white/8">
        <div className="absolute inset-0 grid-bg opacity-10" />
        <div className="mx-auto max-w-3xl px-5 py-14 sm:py-20 text-center relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-lime/10 border border-lime/25 px-4 py-1.5 text-xs text-lime font-mono mb-6">
            <Gift className="size-3.5" /> Programme de parrainage
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            Invite tes amis,<br /><span className="text-lime">gagne du Premium</span>
          </h1>
          <p className="text-mute text-lg max-w-lg mx-auto">
            1 ami inscrit = 7 jours offerts pour lui + tu avances vers 1 mois gratuit pour toi.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 sm:px-5 py-10 space-y-8 pb-24">

        {/* ── Mon code ── */}
        <section className="rounded-3xl border border-white/10 bg-ink-2 p-6 sm:p-8">
          <p className="text-xs font-mono uppercase tracking-wider text-mute mb-4">Mon code de parrainage</p>

          {/* Big code display */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex-1 w-full">
              <div className="rounded-2xl bg-gradient-to-br from-violet/20 to-lime/10 border border-violet/30 px-6 py-5 text-center">
                <span className="font-display font-bold text-3xl sm:text-4xl tracking-widest text-lime select-all">{code}</span>
              </div>
            </div>
            <div className="flex sm:flex-col gap-3 w-full sm:w-auto">
              <button onClick={() => copyText(code, "code")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${copied==="code" ? "border-lime text-lime bg-lime/10" : "border-white/15 text-mute hover:text-white hover:border-white/30"}`}>
                {copied==="code" ? <Check className="size-4"/> : <Copy className="size-4"/>}
                <span className="hidden sm:inline">{copied==="code" ? "Copié !" : "Copier le code"}</span>
                <span className="sm:hidden">{copied==="code" ? "Copié !" : "Code"}</span>
              </button>
              <button onClick={() => copyText(inviteUrl, "link")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${copied==="link" ? "border-lime text-lime bg-lime/10" : "border-white/15 text-mute hover:text-white hover:border-white/30"}`}>
                {copied==="link" ? <Check className="size-4"/> : <Link2 className="size-4"/>}
                <span className="hidden sm:inline">{copied==="link" ? "Copié !" : "Copier le lien"}</span>
                <span className="sm:hidden">{copied==="link" ? "Copié !" : "Lien"}</span>
              </button>
            </div>
          </div>

          {/* URL display */}
          <div className="flex items-center gap-2 rounded-xl bg-white/4 border border-white/8 px-4 py-2.5 mb-6">
            <span className="text-xs text-mute font-mono flex-1 truncate">{inviteUrl}</span>
            <button onClick={() => copyText(inviteUrl, "link")} className="text-mute hover:text-white transition-colors shrink-0">
              {copied==="link" ? <Check className="size-3.5 text-lime"/> : <Copy className="size-3.5"/>}
            </button>
          </div>

          {/* Share buttons */}
          <p className="text-xs font-mono uppercase tracking-wider text-mute mb-3">Partager directement</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <ShareButton
              icon="💬"
              label="WhatsApp"
              href={`https://wa.me/?text=${encodeURIComponent(shareMsg)}`}
              color="hover:border-green-400/40 hover:text-green-400"
            />
            <ShareButton
              icon={<Mail className="size-4"/>}
              label="Email"
              href={`mailto:?subject=Rejoins-moi sur Springr !&body=${encodeURIComponent(shareMsg)}`}
              color="hover:border-violet-soft/40 hover:text-violet-soft"
            />
            <ShareButton
              icon={<MessageCircle className="size-4"/>}
              label="iMessage"
              href={`sms:&body=${encodeURIComponent(shareMsg)}`}
              color="hover:border-blue-400/40 hover:text-blue-400"
            />
            <ShareButton
              icon={<Instagram className="size-4"/>}
              label="Instagram"
              href={`https://www.instagram.com/`}
              color="hover:border-pink-400/40 hover:text-pink-400"
              onClick={() => { copyText(inviteUrl, "link"); toast.info("Lien copié ! Colle-le dans ta story Instagram."); }}
            />
          </div>
        </section>

        {/* ── Progression ── */}
        <section className="rounded-3xl border border-white/10 bg-ink-2 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-mono uppercase tracking-wider text-mute">Ma progression</p>
            <span className="font-display font-bold text-xl text-lime">{completedCount}</span>
          </div>
          <p className="text-sm text-mute mb-5">
            {next
              ? <><span className="text-white font-semibold">{completedCount}/{next.count} filleuls</span> — encore {next.count - completedCount} pour débloquer <strong className="text-lime">{next.label}</strong></>
              : <span className="text-lime">🎉 Tu as atteint le niveau maximum — Premium à vie !</span>
            }
          </p>

          {/* Progress bar */}
          <div className="relative h-3 rounded-full bg-white/8 mb-8 overflow-hidden">
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet to-lime transition-all duration-700" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>

          {/* Reward milestones */}
          <div className="space-y-2">
            {REWARDS.map((r, i) => {
              const done = completedCount >= r.count;
              const active = !done && (i === 0 || completedCount >= REWARDS[i-1].count);
              const Icon = REWARD_ICONS[i];
              return (
                <div key={r.count} className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors ${
                  done   ? "border-lime/30 bg-lime/5"         :
                  active ? "border-violet/40 bg-violet/8"     :
                           "border-white/6 bg-white/2 opacity-50"
                }`}>
                  <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                    done   ? "bg-lime/20 text-lime"       :
                    active ? "bg-violet/20 text-violet-soft" :
                             "bg-white/5 text-mute"
                  }`}>
                    {done ? <CheckCircle2 className="size-5"/> : active ? <Icon className="size-4"/> : <Lock className="size-4"/>}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${done ? "text-lime" : active ? "text-white" : "text-mute"}`}>{r.label}</p>
                    <p className="text-xs text-mute">{r.count} filleul{r.count > 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-lg">{r.icon}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Mes filleuls ── */}
        <section className="rounded-3xl border border-white/10 bg-ink-2 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-mute mb-1">Mes filleuls</p>
              <h2 className="font-display font-bold text-xl">{completedCount} ami{completedCount !== 1 ? "s" : ""} parrainé{completedCount !== 1 ? "s" : ""}</h2>
            </div>
            <div className="size-12 rounded-2xl bg-violet/15 border border-violet/25 flex items-center justify-center">
              <Users className="size-5 text-violet-soft" />
            </div>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-10">
              <Users className="size-10 mx-auto mb-3 text-mute opacity-20" />
              <p className="text-sm text-mute">Tu n'as pas encore parrainé d'ami.</p>
              <p className="text-xs text-mute mt-1">Partage ton lien et commence à gagner des récompenses !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map((r) => {
                const date = new Date(r.created_at);
                const label = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
                return (
                  <div key={r.id} className="flex items-center gap-4 rounded-xl border border-white/8 px-4 py-3">
                    <div className="size-9 rounded-full bg-gradient-to-br from-violet/40 to-lime/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
                      {r.referred_id?.slice(0, 2).toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Filleul #{r.id.slice(0, 8)}</p>
                      <p className="text-xs text-mute flex items-center gap-1"><Clock className="size-3"/>{label}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-mono ${
                      r.status === "completed"
                        ? "border-lime/30 bg-lime/10 text-lime"
                        : "border-white/15 bg-white/5 text-mute"
                    }`}>
                      {r.status === "completed" ? <><Check className="size-3"/>Actif</> : <><Clock className="size-3"/>En attente</>}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Récompenses débloquées ── */}
        {earned.length > 0 && (
          <section className="rounded-3xl border border-lime/20 bg-lime/5 p-6 sm:p-8">
            <p className="text-xs font-mono uppercase tracking-wider text-lime mb-4">Récompenses débloquées 🎉</p>
            <div className="space-y-2">
              {earned.map((r) => (
                <div key={r.count} className="flex items-center gap-3">
                  <CheckCircle2 className="size-4 text-lime shrink-0" />
                  <span className="text-sm text-white">{r.label}</span>
                  <span className="ml-auto text-sm">{r.icon}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Comment ça marche ── */}
        <section>
          <p className="text-xs font-mono uppercase tracking-wider text-mute mb-4">Comment ça marche</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { n: "1", title: "Tu partages",     desc: "Envoie ton lien ou ton code à un ami.",          icon: Share2    },
              { n: "2", title: "Il s'inscrit",    desc: "Il crée son compte via ton lien en 2 minutes.",  icon: Users     },
              { n: "3", title: "Vous gagnez tous deux", desc: "Lui 7 jours Premium, toi +1 parrainage.", icon: Gift      },
            ].map(({ n, title, desc, icon: Icon }) => (
              <div key={n} className="rounded-2xl border border-white/8 bg-ink-2 p-5">
                <div className="size-8 rounded-xl bg-violet/15 border border-violet/25 flex items-center justify-center text-xs font-mono font-bold text-violet-soft mb-3">{n}</div>
                <Icon className="size-5 text-mute mb-2" />
                <p className="font-semibold text-white text-sm mb-1">{title}</p>
                <p className="text-xs text-mute">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function ShareButton({
  icon, label, href, color, onClick,
}: {
  icon: React.ReactNode; label: string; href: string;
  color: string; onClick?: () => void;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto") || href.startsWith("sms") ? "_self" : "_blank"}
      rel="noopener noreferrer"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/3 px-3 py-3 text-sm text-mute transition-all hover:bg-white/6 ${color}`}
    >
      <span className="text-base leading-none">{typeof icon === "string" ? icon : icon}</span>
      <span className="text-xs font-medium hidden sm:inline">{label}</span>
      <span className="text-xs font-medium sm:hidden">{label}</span>
    </a>
  );
}
