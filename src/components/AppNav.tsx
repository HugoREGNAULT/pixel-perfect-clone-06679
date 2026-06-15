import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Menu, X, Search, MessageSquare, LayoutDashboard, UserCircle, Settings, ChevronDown } from "lucide-react";
import type { User, RealtimeChannel } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { to: "/opportunites", label: "Opportunités" },
  { to: "/mentors",      label: "Mentors"       },
  { to: "/bons-plans",   label: "Bons Plans"    },
  { to: "/evenements",   label: "JPO"           },
  { to: "/recruteurs",   label: "Recruteurs"    },
  { to: "/tarifs",       label: "Tarifs"        },
] as const;

export function AppNav() {
  const { location } = useRouterState();
  const navigate = useNavigate();
  const [user, setUser]         = useState<User | null>(null);
  const [open, setOpen]         = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ]   = useState("");
  const [unread, setUnread]     = useState(0);
  const searchInputRef          = useRef<HTMLInputElement>(null);
  const realtimeRef             = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchUnread(data.session.user.id);
        subscribeUnread(data.session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchUnread(s.user.id);
        subscribeUnread(s.user.id);
      } else {
        setUnread(0);
        if (realtimeRef.current) {
          supabase.removeChannel(realtimeRef.current);
          realtimeRef.current = null;
        }
      }
    });
    return () => {
      subscription.unsubscribe();
      if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    };
  }, []);

  async function fetchUnread(uid: string) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`);
    if (!convs?.length) { setUnread(0); return; }
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", uid)
      .in("conversation_id", convs.map(c => c.id));
    setUnread(count ?? 0);
  }

  function subscribeUnread(uid: string) {
    if (realtimeRef.current) supabase.removeChannel(realtimeRef.current);
    const channel = supabase
      .channel("nav-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as { sender_id: string; read_at: string | null };
          if (m.sender_id !== uid && !m.read_at) {
            setUnread(prev => prev + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages" },
        () => {
          fetchUnread(uid);
        }
      )
      .subscribe();
    realtimeRef.current = channel;
  }

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    toast.success("Déconnecté·e.");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate({ to: "/recherche", search: { q: searchQ.trim(), type: "", sector: "", city: "" } });
      setSearchOpen(false);
      setSearchQ("");
      setOpen(false);
    }
  }

  function openSearch() {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  }

  const initials = (user?.user_metadata?.name?.[0] ?? user?.email?.[0])?.toUpperCase() ?? "?";
  const roleLabel = {
    etudiant: "Étudiant", lyceen: "Lycéen", diplome: "Diplômé",
    entreprise: "Recruteur", ecole: "École",
  }[user?.user_metadata?.role as string] ?? null;

  function isActive(path: string) {
    return location.pathname === path || location.pathname.startsWith(path + "?");
  }

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink/80 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-5 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="font-display font-bold tracking-tight text-lg shrink-0"
          >
            sprin<span className="text-violet">g</span><span className="text-lime">r.</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive(to) ? "text-white font-semibold bg-white/5" : "text-mute hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right controls */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={submitSearch} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-150">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-mute pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-48 rounded-xl bg-white/5 border border-white/15 pl-8 pr-3 py-1.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 focus:w-64 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                  className="text-mute hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className="p-2 rounded-lg text-mute hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Recherche"
              >
                <Search className="size-4" />
              </button>
            )}

            {/* Messages icon */}
            {user && (
              <Link
                to="/messages"
                search={{ compose: false }}
                className="relative p-2 rounded-lg text-mute hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="size-4" />
                {unread > 0 && (
                  <span className="absolute top-0.5 right-0.5 size-4 rounded-full bg-lime text-ink text-[9px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 hover:border-white/25 hover:bg-white/5 transition-all focus:outline-none">
                    <div className="size-5 rounded-full bg-gradient-to-br from-violet to-lime flex items-center justify-center text-ink text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm text-white">{(user.user_metadata?.name as string)?.split(" ")[0] ?? "Mon compte"}</span>
                    {roleLabel && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-lime border border-lime/30 rounded-full px-1.5 py-0.5">
                        {roleLabel}
                      </span>
                    )}
                    <ChevronDown className="size-3 text-mute" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-ink-2 border border-white/10 text-white shadow-xl">
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <Link to="/profil"><UserCircle className="size-4 text-mute shrink-0" /> Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <Link to={"/dashboard" as any}><LayoutDashboard className="size-4 text-mute shrink-0" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <Link to="/messages" search={{ compose: false }}>
                      <MessageSquare className="size-4 text-mute shrink-0" />
                      Messages
                      {unread > 0 && (
                        <span className="ml-auto size-4 rounded-full bg-lime text-ink text-[9px] font-bold flex items-center justify-center shrink-0">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-white/5 focus:bg-white/5 focus:text-white">
                    <Link to="/profil"><Settings className="size-4 text-mute shrink-0" /> Paramètres</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="gap-2.5 cursor-pointer text-sm text-mute hover:text-white hover:bg-white/5 focus:bg-white/5 focus:text-white"
                  >
                    <LogOut className="size-4 shrink-0" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="text-sm text-mute hover:text-white transition-colors px-3 py-1.5">
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 rounded-full bg-lime px-4 py-1.5 text-sm font-semibold text-ink hover:-translate-y-0.5 transition-transform"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>

          {/* Mobile: search + messages + hamburger */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={openSearch}
              className="p-2 text-mute hover:text-white transition-colors"
              aria-label="Recherche"
            >
              <Search className="size-5" />
            </button>
            {user && (
              <Link
                to="/messages"
                search={{ compose: false }}
                className="relative p-2 text-mute hover:text-white transition-colors"
                aria-label="Messages"
              >
                <MessageSquare className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 size-3.5 rounded-full bg-lime text-ink text-[8px] font-bold flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setOpen(!open)}
              className="p-2 text-mute hover:text-white transition-colors"
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile inline search */}
        {searchOpen && (
          <div className="lg:hidden border-t border-white/5 px-5 py-3 bg-ink/95 animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={submitSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-mute pointer-events-none" />
                <input
                  ref={searchInputRef}
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Offre, mentor, événement…"
                  className="w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-4 py-2.5 text-sm placeholder:text-mute/50 focus:outline-none focus:border-violet/60 transition-colors"
                />
              </div>
              <button type="submit" className="rounded-xl bg-lime px-4 text-sm font-semibold text-ink">
                OK
              </button>
              <button
                type="button"
                onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                className="p-2 text-mute hover:text-white transition-colors"
              >
                <X className="size-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 bg-ink/95 backdrop-blur-xl border-b border-white/10 px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(to) ? "text-white font-semibold bg-white/5" : "text-mute hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <div className="size-7 rounded-full bg-gradient-to-br from-violet to-lime flex items-center justify-center text-ink text-xs font-bold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{(user.user_metadata?.name as string) ?? user.email}</div>
                    {roleLabel && <div className="text-[10px] font-mono uppercase tracking-wider text-lime">{roleLabel}</div>}
                  </div>
                </div>
                <Link
                  to={"/dashboard" as any}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LayoutDashboard className="size-4" /> Dashboard
                </Link>
                <Link
                  to="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors"
                >
                  <UserCircle className="size-4" /> Mon profil
                </Link>
                <Link
                  to="/messages"
                  search={{ compose: false }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors"
                >
                  <MessageSquare className="size-4" />
                  Messages
                  {unread > 0 && (
                    <span className="ml-auto size-5 rounded-full bg-lime text-ink text-[10px] font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profil"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings className="size-4" /> Paramètres
                </Link>
                <button
                  onClick={signOut}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                >
                  <LogOut className="size-4" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-mute hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-ink bg-lime text-center"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
