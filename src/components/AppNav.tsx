import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Menu, X, Search, MessageSquare, LayoutDashboard, UserCircle, ChevronDown } from "lucide-react";
import type { User, RealtimeChannel } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { to: "/opportunites", label: "Offres"      },
  { to: "/bons-plans",   label: "Bons plans"  },
  { to: "/ecoles",       label: "Écoles"      },
  { to: "/evenements",   label: "Événements"  },
  { to: "/recruteurs",   label: "Recruteurs"  },
  { to: "/tarifs",       label: "Tarifs"      },
] as const;

const ICON_BTN =
  "inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const MOBILE_ITEM =
  "flex min-h-11 items-center gap-2 px-3 rounded-md text-base transition-colors";

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function fetchUnread(uid: string) {
    const db = supabase as any;
    const { data: convs } = await db
      .from("conversations")
      .select("id")
      .or(`participant_1.eq.${uid},participant_2.eq.${uid}`);
    if (!convs?.length) { setUnread(0); return; }
    const { count } = await db
      .from("messages")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .neq("sender_id", uid)
      .in("conversation_id", convs.map((c: { id: string }) => c.id));
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
    return location.pathname === path || location.pathname.startsWith(path + "/");
  }

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur bg-background border-b border-border h-17 flex items-center">
        <div className="mx-auto max-w-7xl px-5 w-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="font-display font-bold tracking-tight text-lg shrink-0 text-foreground inline-flex min-h-11 items-center"
          >
            springr.
          </Link>

          {/* Desktop nav links */}
          <nav aria-label="Navigation principale" className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                aria-current={isActive(to) ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-3 rounded-md text-sm transition-colors ${
                  isActive(to) ? "text-primary-soft-foreground font-semibold bg-primary-soft" : "text-muted-foreground hover:text-foreground hover:bg-muted"
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    placeholder="Rechercher…"
                    className="h-11 w-48 rounded-md bg-card border border-input pl-8 pr-3 text-base placeholder:text-placeholder focus:outline-none focus:border-ring focus:w-64 transition-all text-foreground"
                  />
                </div>
                <button
                  type="button"
                  aria-label="Fermer la recherche"
                  onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                  className={ICON_BTN}
                >
                  <X className="size-4" />
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                className={ICON_BTN}
                aria-label="Rechercher"
              >
                <Search className="size-4" />
              </button>
            )}

            {/* Messages icon */}
            {user && (
              <Link
                to="/messages"
                search={{ compose: false }}
                className={`relative ${ICON_BTN}`}
                aria-label="Messages"
              >
                <MessageSquare className="size-4" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 size-4 rounded-full bg-primary text-primary-foreground text-xs font-bold leading-none flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-3 hover:border-primary hover:bg-primary-soft transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    <div className="size-5 rounded-lg bg-muted flex items-center justify-center text-foreground-2 text-xs font-semibold shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm text-foreground">{(user.user_metadata?.name as string)?.split(" ")[0] ?? "Mon compte"}</span>
                    {roleLabel && (
                      <span className="text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
                        {roleLabel}
                      </span>
                    )}
                    <ChevronDown className="size-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-card border border-border text-foreground">
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-muted focus:bg-muted focus:text-foreground">
                    <Link to="/profil"><UserCircle className="size-4 text-muted-foreground shrink-0" /> Mon profil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-muted focus:bg-muted focus:text-foreground">
                    <Link to={"/dashboard" as any}><LayoutDashboard className="size-4 text-muted-foreground shrink-0" /> Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 cursor-pointer text-sm hover:bg-muted focus:bg-muted focus:text-foreground">
                    <Link to="/messages" search={{ compose: false }}>
                      <MessageSquare className="size-4 text-muted-foreground shrink-0" />
                      Messages
                      {unread > 0 && (
                        <span className="ml-auto size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shrink-0">
                          {unread > 9 ? "9+" : unread}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="gap-2.5 cursor-pointer text-sm text-muted-foreground hover:text-foreground hover:bg-muted focus:bg-muted focus:text-foreground"
                  >
                    <LogOut className="size-4 shrink-0" /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link to="/login" className="inline-flex min-h-11 items-center text-sm font-medium text-foreground-2 hover:text-foreground transition-colors px-3">
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
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
              className={ICON_BTN}
              aria-label="Rechercher"
            >
              <Search className="size-5" />
            </button>
            {user && (
              <Link
                to="/messages"
                search={{ compose: false }}
                className={`relative ${ICON_BTN}`}
                aria-label="Messages"
              >
                <MessageSquare className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-1 right-1 size-4 rounded-full bg-primary text-primary-foreground text-xs font-bold leading-none flex items-center justify-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setOpen(!open)}
              className={ICON_BTN}
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile inline search */}
        {searchOpen && (
          <div className="lg:hidden border-t border-border px-5 py-3 bg-background animate-in fade-in slide-in-from-top-1 duration-150">
            <form onSubmit={submitSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <input
                  ref={searchInputRef}
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  placeholder="Offre, mentor, événement…"
                  className="h-11 w-full rounded-md bg-card border border-input pl-10 pr-4 text-base placeholder:text-placeholder focus:outline-none focus:border-ring transition-colors text-foreground"
                />
              </div>
              <button type="submit" className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
                OK
              </button>
              <button
                type="button"
                aria-label="Fermer la recherche"
                onClick={() => { setSearchOpen(false); setSearchQ(""); }}
                className={ICON_BTN}
              >
                <X className="size-4" />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {open && (
        <nav id="mobile-menu" aria-label="Menu mobile" className="lg:hidden fixed inset-x-0 top-17 bottom-0 z-30 overflow-y-auto bg-background border-t border-border px-5 py-4 space-y-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              aria-current={isActive(to) ? "page" : undefined}
              className={`${MOBILE_ITEM} ${
                isActive(to) ? "text-primary-soft-foreground font-semibold bg-primary-soft" : "text-foreground-2 hover:text-foreground hover:bg-muted"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <div className="size-7 rounded-lg bg-muted flex items-center justify-center text-foreground-2 text-xs font-semibold shrink-0">
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{(user.user_metadata?.name as string) ?? user.email}</div>
                    {roleLabel && <div className="text-xs font-medium text-muted-foreground">{roleLabel}</div>}
                  </div>
                </div>
                <Link
                  to={"/dashboard" as any}
                  onClick={() => setOpen(false)}
                  className={`${MOBILE_ITEM} text-foreground-2 hover:text-foreground hover:bg-muted`}
                >
                  <LayoutDashboard className="size-4" /> Dashboard
                </Link>
                <Link
                  to="/profil"
                  onClick={() => setOpen(false)}
                  className={`${MOBILE_ITEM} text-foreground-2 hover:text-foreground hover:bg-muted`}
                >
                  <UserCircle className="size-4" /> Mon profil
                </Link>
                <Link
                  to="/messages"
                  search={{ compose: false }}
                  onClick={() => setOpen(false)}
                  className={`${MOBILE_ITEM} text-foreground-2 hover:text-foreground hover:bg-muted`}
                >
                  <MessageSquare className="size-4" />
                  Messages
                  {unread > 0 && (
                    <span className="ml-auto size-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </Link>
                <button
                  onClick={signOut}
                  className={`${MOBILE_ITEM} w-full text-left text-foreground-2 hover:text-foreground hover:bg-muted`}
                >
                  <LogOut className="size-4" /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={`${MOBILE_ITEM} text-foreground-2 hover:text-foreground hover:bg-muted`}
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className={`${MOBILE_ITEM} justify-center font-semibold text-primary-foreground bg-primary hover:bg-primary-hover`}
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
