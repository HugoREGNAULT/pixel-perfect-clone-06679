import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Send,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  X,
  Check,
  CheckCheck,
  ArrowUpRight,
  UserRound,
} from "lucide-react";

export const Route = createFileRoute("/messages")({
  validateSearch: (s: Record<string, unknown>) => ({
    compose: Boolean(s.compose),
  }),
  head: () => ({ meta: [{ title: "Messages — Springr" }] }),
  component: MessagesPage,
});

/* ------------------------------------------------------------------- types */

interface DbMsg {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
}

interface ConvItem {
  id: string;
  otherUserId: string;
  otherDisplayName: string;
  otherEmail: string;
  lastMsg?: DbMsg;
  unreadCount: number;
  updatedAt: string;
}

interface FoundUser {
  id: string;
  display_name: string;
  email: string;
}

/* ------------------------------------------------------------------- utils */

function relTime(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(date));
}

function fmtTime(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(date));
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function dayLabel(date: string) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const GRADIENTS = [
  "from-violet/70 to-violet/30",
  "from-lime/60 to-lime/20",
  "from-blue-500/60 to-blue-500/20",
  "from-emerald-500/60 to-emerald-500/20",
  "from-pink-500/60 to-pink-500/20",
];
function userGradient(id: string) {
  return GRADIENTS[id.charCodeAt(0) % GRADIENTS.length];
}

/* ------------------------------------------------------------------- page */

function MessagesPage() {
  const navigate   = useNavigate();
  const { compose: startCompose } = useSearch({ from: "/messages" });

  const [userId, setUserId]             = useState("");
  const [conversations, setConversations] = useState<ConvItem[]>([]);
  const [msgsByConv, setMsgsByConv]     = useState<Record<string, DbMsg[]>>({});
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [loading, setLoading]           = useState(true);
  const [mobileView, setMobileView]     = useState<"list" | "chat">("list");
  const [composing, setComposing]       = useState(false);
  const [emailSearch, setEmailSearch]   = useState("");
  const [foundUser, setFoundUser]       = useState<FoundUser | null>(null);
  const [searching, setSearching]       = useState(false);
  const [convSearch, setConvSearch]     = useState("");

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLTextAreaElement>(null);
  const channelRef   = useRef<RealtimeChannel | null>(null);

  /* ---- load ---- */
  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate({ to: "/login", replace: true }); return; }
      const uid = session.user.id;
      setUserId(uid);

      const { data: convData } = await supabase
        .from("conversations")
        .select("id, participant_1, participant_2, updated_at")
        .or(`participant_1.eq.${uid},participant_2.eq.${uid}`)
        .order("updated_at", { ascending: false });

      if (!convData?.length) { setLoading(false); if (startCompose) setComposing(true); return; }

      const otherIds = convData.map(c =>
        c.participant_1 === uid ? c.participant_2 : c.participant_1
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: nameData } = await (supabase as any).rpc("get_users_display_names", { user_ids: otherIds });
      const nameMap: Record<string, FoundUser> = {};
      ((nameData ?? []) as FoundUser[]).forEach((u: FoundUser) => { nameMap[u.id] = u; });

      const { data: msgData } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, read_at, created_at")
        .in("conversation_id", convData.map(c => c.id))
        .order("created_at", { ascending: true });

      const mbc: Record<string, DbMsg[]> = {};
      (msgData ?? []).forEach(m => {
        if (!mbc[m.conversation_id]) mbc[m.conversation_id] = [];
        mbc[m.conversation_id].push(m as DbMsg);
      });
      setMsgsByConv(mbc);

      const items: ConvItem[] = convData.map(c => {
        const otherId = c.participant_1 === uid ? c.participant_2 : c.participant_1;
        const msgs = mbc[c.id] ?? [];
        return {
          id: c.id,
          otherUserId: otherId,
          otherDisplayName: nameMap[otherId]?.display_name ?? "Utilisateur",
          otherEmail: nameMap[otherId]?.email ?? "",
          lastMsg: msgs[msgs.length - 1],
          unreadCount: msgs.filter(m => !m.read_at && m.sender_id !== uid).length,
          updatedAt: c.updated_at,
        };
      });
      setConversations(items);
      setLoading(false);
      if (startCompose) setComposing(true);
    }
    load();
  }, [navigate, startCompose]);

  /* ---- scroll to bottom ---- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgsByConv, selectedId]);

  /* ---- realtime subscription ---- */
  useEffect(() => {
    if (!selectedId || !userId) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase
      .channel(`conv:${selectedId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedId}` },
        (payload) => {
          const m = payload.new as DbMsg;
          setMsgsByConv(prev => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] ?? []), m],
          }));
          setConversations(prev =>
            prev
              .map(c => c.id === selectedId ? { ...c, lastMsg: m, updatedAt: m.created_at } : c)
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Mark as read
    const unread = (msgsByConv[selectedId] ?? []).filter(m => !m.read_at && m.sender_id !== userId);
    if (unread.length) {
      supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unread.map(m => m.id))
        .then(() => {
          setMsgsByConv(prev => ({
            ...prev,
            [selectedId]: (prev[selectedId] ?? []).map(m =>
              !m.read_at && m.sender_id !== userId ? { ...m, read_at: new Date().toISOString() } : m
            ),
          }));
          setConversations(prev => prev.map(c =>
            c.id === selectedId ? { ...c, unreadCount: 0 } : c
          ));
        });
    }

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, userId]);

  /* ---- send ---- */
  async function sendMessage() {
    if (!input.trim() || !selectedId || !userId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: selectedId,
      sender_id: userId,
      content,
    });
    if (error) { toast.error("Erreur lors de l'envoi."); setInput(content); }
    setSending(false);
    inputRef.current?.focus();
  }

  /* ---- find user for new conversation ---- */
  async function findUser() {
    if (!emailSearch.trim()) return;
    setSearching(true);
    setFoundUser(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase as any).rpc("find_user_by_email", { p_email: emailSearch.trim() });
    const results = data as FoundUser[] | null;
    setFoundUser(results?.[0] ?? null);
    if (!results?.length) toast.error("Aucun utilisateur trouvé avec cet email.");
    setSearching(false);
  }

  async function startConversation() {
    if (!foundUser || !userId) return;
    const p1 = userId < foundUser.id ? userId : foundUser.id;
    const p2 = userId < foundUser.id ? foundUser.id : userId;
    const { data, error } = await supabase
      .from("conversations")
      .upsert({ participant_1: p1, participant_2: p2 }, { onConflict: "participant_1,participant_2" })
      .select()
      .single();
    if (error || !data) { toast.error("Erreur lors de la création de la conversation."); return; }

    const existing = conversations.find(c => c.id === data.id);
    if (!existing) {
      const newConv: ConvItem = {
        id: data.id,
        otherUserId: foundUser.id,
        otherDisplayName: foundUser.display_name,
        otherEmail: foundUser.email,
        unreadCount: 0,
        updatedAt: data.updated_at,
      };
      setConversations(prev => [newConv, ...prev]);
      setMsgsByConv(prev => ({ ...prev, [data.id]: [] }));
    }
    setSelectedId(data.id);
    setMobileView("chat");
    setComposing(false);
    setEmailSearch("");
    setFoundUser(null);
  }

  /* ---- select conversation ---- */
  function selectConv(id: string) {
    setSelectedId(id);
    setMobileView("chat");
  }

  /* ---- filtered conversations ---- */
  const filteredConvs = conversations.filter(c =>
    !convSearch || c.otherDisplayName.toLowerCase().includes(convSearch.toLowerCase())
  );

  const selectedConv = conversations.find(c => c.id === selectedId);
  const currentMsgs  = selectedId ? (msgsByConv[selectedId] ?? []) : [];
  const totalUnread  = conversations.reduce((n, c) => n + c.unreadCount, 0);

  /* ---- render ---- */
  return (
    <div className="h-screen bg-ink text-white flex flex-col overflow-hidden">
      {/* header */}
      <header className="shrink-0 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="px-5 h-14 flex items-center justify-between max-w-7xl mx-auto">
          <Link
            to="/dashboard/etudiant"
            className="inline-flex items-center gap-2 text-sm text-mute hover:text-white transition-colors"
          >
            <ArrowLeft className="size-4" /> Dashboard
          </Link>
          <span className="font-display font-bold tracking-tight">
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </span>
          <button
            onClick={() => setComposing(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-mute hover:text-white hover:border-white/30 transition-all"
          >
            <Plus className="size-3.5" /> Nouveau
          </button>
        </div>
      </header>

      {/* compose modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-ink/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-ink shadow-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">Nouveau message</h2>
              <button onClick={() => { setComposing(false); setFoundUser(null); setEmailSearch(""); }} className="text-mute hover:text-white transition-colors">
                <X className="size-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-mute mb-2">Email du destinataire</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailSearch}
                  onChange={e => setEmailSearch(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && findUser()}
                  placeholder="utilisateur@email.com"
                  autoFocus
                  className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors"
                />
                <button
                  onClick={findUser}
                  disabled={searching || !emailSearch.trim()}
                  className="inline-flex items-center gap-1 rounded-xl bg-violet/20 border border-violet/30 px-4 text-sm text-violet-soft hover:bg-violet/30 transition-colors disabled:opacity-40"
                >
                  {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </button>
              </div>
            </div>

            {foundUser && (
              <div
                onClick={startConversation}
                className="flex items-center gap-3 rounded-xl border border-lime/30 bg-lime/5 p-3 cursor-pointer hover:bg-lime/10 transition-colors"
              >
                <div className={`size-10 rounded-xl bg-gradient-to-br ${userGradient(foundUser.id)} flex items-center justify-center font-display font-bold text-sm text-white shrink-0`}>
                  {getInitials(foundUser.display_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{foundUser.display_name}</p>
                  <p className="text-xs text-mute truncate">{foundUser.email}</p>
                </div>
                <ArrowUpRight className="size-4 text-lime shrink-0" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* main area */}
      <div className="flex-1 flex overflow-hidden">

        {/* left: conversation list */}
        <aside className={`${mobileView === "chat" ? "hidden" : "flex"} md:flex flex-col w-full md:w-72 lg:w-80 border-r border-white/5 shrink-0`}>
          {/* header */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold">Messages</h1>
                {totalUnread > 0 && (
                  <span className="size-5 rounded-full bg-lime text-ink text-[10px] font-bold flex items-center justify-center">
                    {totalUnread > 9 ? "9+" : totalUnread}
                  </span>
                )}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-mute pointer-events-none" />
              <input
                value={convSearch}
                onChange={e => setConvSearch(e.target.value)}
                placeholder="Rechercher…"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-8 pr-3 py-2 text-xs placeholder:text-mute/50 focus:outline-none focus:border-violet/50 transition-colors"
              />
            </div>
          </div>

          {/* list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 text-mute animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <MessageSquare className="size-8 text-mute mb-3" />
                <p className="text-sm text-mute">Aucune conversation</p>
                <button
                  onClick={() => setComposing(true)}
                  className="mt-3 text-xs text-lime hover:underline"
                >
                  Commencer une conversation
                </button>
              </div>
            ) : (
              filteredConvs.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => selectConv(conv.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] ${
                    selectedId === conv.id ? "bg-white/[0.05]" : ""
                  }`}
                >
                  {/* avatar */}
                  <div className={`size-10 rounded-xl bg-gradient-to-br ${userGradient(conv.otherUserId)} flex items-center justify-center font-display font-bold text-sm text-white shrink-0 relative`}>
                    {getInitials(conv.otherDisplayName)}
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 size-4 rounded-full bg-lime text-ink text-[9px] font-bold flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-sm font-semibold truncate ${conv.unreadCount > 0 ? "text-white" : "text-white/80"}`}>
                        {conv.otherDisplayName}
                      </span>
                      {conv.lastMsg && (
                        <span className="text-[10px] text-mute shrink-0">{relTime(conv.lastMsg.created_at)}</span>
                      )}
                    </div>
                    {conv.lastMsg && (
                      <p className={`text-xs truncate ${conv.unreadCount > 0 ? "text-white/70 font-medium" : "text-mute"}`}>
                        {conv.lastMsg.sender_id === userId ? "Vous : " : ""}{conv.lastMsg.content}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* right: chat */}
        <div className={`${mobileView === "list" ? "hidden" : "flex"} md:flex flex-1 flex-col min-w-0`}>
          {!selectedConv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageSquare className="size-7 text-mute" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg mb-1">Tes messages</h2>
                <p className="text-mute text-sm max-w-xs">
                  Sélectionne une conversation ou commence-en une nouvelle.
                </p>
              </div>
              <button
                onClick={() => setComposing(true)}
                className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
              >
                <Plus className="size-4" /> Nouveau message
              </button>
            </div>
          ) : (
            <>
              {/* chat header */}
              <div className="shrink-0 flex items-center gap-3 px-5 h-14 border-b border-white/5 bg-ink/50">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden text-mute hover:text-white transition-colors mr-1"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className={`size-8 rounded-lg bg-gradient-to-br ${userGradient(selectedConv.otherUserId)} flex items-center justify-center font-display font-bold text-xs text-white shrink-0`}>
                  {getInitials(selectedConv.otherDisplayName)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-none">{selectedConv.otherDisplayName}</p>
                  <p className="text-xs text-mute truncate">{selectedConv.otherEmail}</p>
                </div>
              </div>

              {/* messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
                {currentMsgs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                    <UserRound className="size-8 text-mute" />
                    <p className="text-mute text-sm">Commence la conversation !</p>
                  </div>
                ) : (
                  currentMsgs.map((m, i) => {
                    const isMine = m.sender_id === userId;
                    const prevMsg = currentMsgs[i - 1];
                    const showDay = !prevMsg || !sameDay(prevMsg.created_at, m.created_at);
                    const isLast = i === currentMsgs.length - 1;
                    const isRead = isMine && currentMsgs.slice(i + 1).every(later => !later.read_at) && m.read_at;

                    return (
                      <div key={m.id}>
                        {showDay && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-px bg-white/5" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-mute">
                              {dayLabel(m.created_at)}
                            </span>
                            <div className="flex-1 h-px bg-white/5" />
                          </div>
                        )}
                        <div className={`flex ${isMine ? "justify-end" : "justify-start"} mb-0.5`}>
                          <div className={`max-w-[75%] group`}>
                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                isMine
                                  ? "bg-violet/20 border border-violet/30 text-white rounded-br-sm"
                                  : "bg-white/[0.06] border border-white/10 text-white/90 rounded-bl-sm"
                              }`}
                            >
                              {m.content}
                            </div>
                            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "justify-end" : "justify-start"}`}>
                              <span className="text-[10px] text-mute">{fmtTime(m.created_at)}</span>
                              {isMine && isLast && (
                                <span className="text-[10px] text-mute">
                                  {m.read_at ? <CheckCheck className="size-3 text-lime" /> : <Check className="size-3" />}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* input */}
              <div className="shrink-0 px-4 py-3 border-t border-white/5 flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Écris un message… (Entrée pour envoyer)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:bg-white/[0.07] transition-colors max-h-32 overflow-y-auto"
                  style={{ minHeight: "42px" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || sending}
                  className="shrink-0 size-10 rounded-xl bg-lime flex items-center justify-center text-ink hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
