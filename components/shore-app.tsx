"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  Compass,
  Feather,
  Info,
  Loader2,
  MessageCircle,
  Settings,
  Shell,
  Trash2,
  Waves,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  BottleIllustration,
  OceanScene,
} from "@/components/bottle-illustration";
import { browserClient } from "@/lib/supabase/client";
import { demoAction, demoRelease } from "@/lib/demo";
import { actionSchema } from "@/lib/moderation";
import { request, readableError } from "@/lib/client-api";
import { BottleCard } from "@/components/bottle-card";
import { EmptyState } from "@/components/empty-state";
import { Compose } from "@/components/compose";
import { SettingsView } from "@/components/settings-view";
import { cn } from "@/lib/utils";
import type { Bottle, BottleAction, ShoreData } from "@/types/bottle";

type View = "inbox" | "write" | "collection" | "settings";
const navigation = [
  { href: "/", view: "inbox", label: "Your shore", icon: Shell },
  { href: "/write", view: "write", label: "Write a bottle", icon: Feather },
  {
    href: "/collection",
    view: "collection",
    label: "Keepsakes",
    icon: Bookmark,
  },
] as const;
const acknowledgements: Record<BottleAction, string> = {
  reply: "Your reply is drifting back. Give it time.",
  keep: "A little piece of someone’s world, kept.",
  release: "Back to the current. On to another shore.",
  discard: "Let gently go.",
  delete: "The bottle has been permanently deleted.",
};
const storageKey = "slow-correspondence-preview-v1";

export function ShoreApp({
  initial,
  view,
}: {
  initial: ShoreData;
  view: View;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [selected, setSelected] = useState<Bottle | null>(null);
  const [dialogAction, setDialogAction] = useState<BottleAction | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | "unanswered">("all");
  const [collectionPage, setCollectionPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [clock, setClock] = useState(0);
  useEffect(() => {
    setClock(Date.now());
    const timer = setInterval(() => setClock(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!initial.demo) {
      setData(initial);
      setCollectionPage(0);
      return;
    }
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (
          saved.demo &&
          Array.isArray(saved.bottles) &&
          saved.profile?.id === initial.profile.id &&
          typeof saved.stats?.pending === "number"
        )
          setData(saved);
      }
    } catch {
      /* Unavailable storage leaves the preview usable in memory. */
    }
  }, [initial]);
  useEffect(() => {
    if (initial.demo) return;
    const client = browserClient();
    let refreshTimer: ReturnType<typeof setTimeout>;
    const refresh = () => {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => router.refresh(), 250);
    };
    const channel = client
      .channel(`shore-${initial.profile.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "inbox_events",
          filter: `user_id=eq.${initial.profile.id}`,
        },
        () => {
          toast("A bottle has found your shore.", {
            icon: <Shell size={16} />,
          });
          refresh();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") refresh();
      });
    const heartbeat = setInterval(() => {
      void client.rpc("touch_profile");
    }, 5 * 60000);
    const focus = () => {
      void client.rpc("touch_profile");
      refresh();
    };
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(heartbeat);
      clearTimeout(refreshTimer);
      window.removeEventListener("focus", focus);
      void client.removeChannel(channel);
    };
  }, [initial.demo, initial.profile.id, router]);
  function persist(next: ShoreData) {
    setData(next);
    if (next.demo) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        toast("Preview changes will last for this visit only.");
      }
    }
  }
  const inbox = data.bottles.filter((b) => b.status === "delivered");
  const kept = data.bottles.filter((b) => b.status === "kept");
  async function loadMore() {
    setLoadingMore(true);
    try {
      const response = await fetch(
        `/api/collection?page=${collectionPage + 1}`,
      );
      const payload = await response.json();
      if (!response.ok)
        throw new Error(
          payload.error || "Your collection couldn’t be reached.",
        );
      setData((current) => ({
        ...current,
        bottles: [
          ...current.bottles,
          ...(payload.bottles as Bottle[]).filter(
            (b) => !current.bottles.some((existing) => existing.id === b.id),
          ),
        ],
      }));
      setCollectionPage((page) => page + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoadingMore(false);
    }
  }
  const nextAt = data.stats.next_release_at
    ? Date.parse(data.stats.next_release_at)
    : 0;
  const remaining =
    nextAt > clock && clock > 0 ? Math.ceil((nextAt - clock) / 3600000) : 0;
  const full = data.stats.pending >= data.profile.receive_limit;
  async function act(action: BottleAction) {
    if (!selected || busy) return;
    setBusy(true);
    try {
      actionSchema.parse({ id: selected.id, action, content: note });
      if (data.demo) persist(demoAction(data, selected.id, action));
      else {
        await request("/api/bottles", "PATCH", {
          id: selected.id,
          action,
          content: note,
        });
        router.refresh();
      }
      toast.success(acknowledgements[action]);
      setSelected(null);
      setDialogAction(null);
      setNote("");
    } catch (error) {
      toast.error(
        error instanceof Error ? readableError(error) : "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function open(bottle: Bottle, action: BottleAction | null = null) {
    setSelected(bottle);
    setDialogAction(action);
    setNote("");
  }
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            <BottleIllustration small className="h-12 w-12" />
          </span>
          <span>
            Message
            <br />
            in a Bottle
            <span className="brand-subtitle">SLOW CORRESPONDENCE</span>
          </span>
        </Link>
        <div className="sidebar-rule" />
        <nav aria-label="Main navigation" className="nav-list">
          {navigation.map((item) => (
            <Link
              key={item.view}
              href={item.href}
              aria-current={view === item.view ? "page" : undefined}
              className={cn("nav-item", view === item.view && "active")}
            >
              <item.icon size={19} strokeWidth={1.6} />
              <span>{item.label}</span>
              {item.view === "inbox" && inbox.length > 0 && (
                <span className="nav-count">{inbox.length}</span>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-poem">
            <Waves size={26} strokeWidth={1.2} />
            <p>
              Good things take
              <br />
              the time they take.
            </p>
          </div>
          <Link href="/about" className="nav-item">
            <Info size={17} />
            About this little ocean
          </Link>
          <Link
            href="/settings"
            aria-current={view === "settings" ? "page" : undefined}
            className={cn("nav-item", view === "settings" && "active")}
          >
            <Settings size={17} />
            Your quiet corner
          </Link>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="topbar-label">
            <span className="status-dot" /> A slower kind of connection
          </span>
          <Link href="/settings" className="identity">
            <span className="identity-dot">
              {data.profile.display_name ? (
                data.profile.display_name.slice(0, 1).toUpperCase()
              ) : (
                <Wind size={16} />
              )}
            </span>
            {data.profile.display_name || "A quiet wanderer"}
            <ChevronRight size={13} />
          </Link>
        </header>
        <main id="main-content" className="main-content">
          {data.demo && (
            <div className="demo-strip">
              <Compass size={14} />
              <span>
                You’re exploring a local preview. Bottles here are samples,
                saved in this browser.
              </span>
            </div>
          )}
          {view === "inbox" && (
            <>
              <section className="shore-hero">
                <OceanScene />
                <div className="hero-copy">
                  <p className="eyebrow">A LITTLE HUMANITY, WASHED ASHORE</p>
                  <h1>Your shore.</h1>
                  <p>
                    Somewhere, someone took a moment.
                    <br />
                    And the current brought it to you.
                  </p>
                </div>
                <span className="hero-caption">
                  <Waves size={15} /> Let the world move a little slower.
                </span>
              </section>
              <div className="inbox-layout">
                <section aria-label="Your inbox">
                  <div className="section-heading">
                    <h2>
                      Washed ashore <span>{inbox.length}</span>
                    </h2>
                    <span className="soft-label">No hurry to open them.</span>
                  </div>
                  <div
                    className="filter-bar"
                    role="group"
                    aria-label="Filter bottles"
                  >
                    <button
                      aria-pressed={filter === "all"}
                      className={cn(filter === "all" && "selected")}
                      onClick={() => setFilter("all")}
                    >
                      All bottles
                    </button>
                    <button
                      aria-pressed={filter === "unanswered"}
                      className={cn(filter === "unanswered" && "selected")}
                      onClick={() => setFilter("unanswered")}
                    >
                      Awaiting a reply
                    </button>
                  </div>
                  <div className="bottle-list">
                    {inbox
                      .filter((b) => filter === "all" || !b.replied_at)
                      .map((b) => (
                        <BottleCard
                          key={b.id}
                          bottle={b}
                          onOpen={() => open(b)}
                          onKeep={() => open(b, "keep")}
                        />
                      ))}
                    {(inbox.length === 0 ||
                      (filter === "unanswered" &&
                        inbox.every((b) => b.replied_at))) && (
                      <EmptyState collection={false} />
                    )}
                  </div>
                </section>
                <aside className="shore-aside">
                  <div className="write-invitation">
                    <span className="little-icon">
                      <Feather size={22} strokeWidth={1.3} />
                    </span>
                    <h2>
                      A thought worth
                      <br />
                      setting free?
                    </h2>
                    <p>
                      A small story. An unfinished question. Something you
                      noticed today.
                    </p>
                    <Button asChild className="w-full">
                      <Link href="/write">
                        <Feather size={15} />
                        Write a bottle
                        <ArrowRight size={15} />
                      </Link>
                    </Button>
                    <span className="tiny-caption">
                      One bottle. Every 12 hours.
                    </span>
                  </div>
                  <div className="current-card">
                    <div className="aside-label">
                      <Waves size={17} /> OUT IN THE CURRENT
                    </div>
                    <p className="current-number">
                      {data.stats.drifting}{" "}
                      <span>
                        {data.stats.drifting === 1
                          ? "bottle drifting"
                          : "bottles drifting"}
                      </span>
                    </p>
                    <p>
                      Your words will find someone.
                      <br />
                      Usually in 6–72 hours.
                    </p>
                    {remaining > 0 && (
                      <span className="next-release">
                        A new bottle in about {remaining}h
                      </span>
                    )}
                  </div>
                  <div className="quiet-note">
                    <span>“</span>
                    <p>
                      There is a kind of kindness
                      <br />
                      in being a stranger.
                    </p>
                    <div>A NOTE FROM THE SHORE</div>
                  </div>
                </aside>
              </div>
            </>
          )}
          {view === "write" && (
            <Compose
              full={full}
              remaining={remaining}
              onRelease={async (content, mood) => {
                if (data.demo) persist(demoRelease(data));
                else {
                  await request("/api/bottles", "POST", { content, mood });
                  router.refresh();
                }
              }}
            />
          )}
          {view === "collection" && (
            <>
              <div className="page-heading">
                <p className="eyebrow">THE WORDS YOU WANTED TO HOLD ON TO</p>
                <h1>Keepsakes.</h1>
                <p>
                  Little pieces of someone else’s world. A place for the words
                  that stayed with you.
                </p>
              </div>
              <div className="section-heading">
                <h2>
                  Your collection{" "}
                  <span>{data.stats.collection_total ?? kept.length}</span>
                </h2>
                <span className="soft-label">Only you can see these.</span>
              </div>
              <div className="collection-grid">
                {kept.map((b) => (
                  <BottleCard
                    key={b.id}
                    bottle={b}
                    onOpen={() => open(b)}
                    onKeep={() => open(b, "delete")}
                    collection
                  />
                ))}
                {kept.length === 0 && <EmptyState collection />}
              </div>
              {!data.demo &&
                kept.length < (data.stats.collection_total ?? 0) && (
                  <Button
                    className="mt-6"
                    variant="outline"
                    disabled={loadingMore}
                    onClick={() => void loadMore()}
                  >
                    {loadingMore && (
                      <Loader2 size={15} className="animate-spin" />
                    )}
                    More keepsakes
                  </Button>
                )}
            </>
          )}
          {view === "settings" && <SettingsView data={data} onSave={persist} />}
          <footer className="page-footer">
            <span>
              <Waves size={15} /> No feeds. No followers. Just a little
              connection.
            </span>
            <Link href="/about">
              Made for taking your time <ArrowRight size={12} />
            </Link>
          </footer>
        </main>
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(value) => {
          if (!value && !busy) {
            setSelected(null);
            setDialogAction(null);
          }
        }}
      >
        <DialogContent
          onEscapeKeyDown={(event) => {
            if (busy) event.preventDefault();
          }}
          onPointerDownOutside={(event) => {
            if (busy) event.preventDefault();
          }}
        >
          {selected && (
            <>
              <p className="eyebrow mb-3">
                {selected.status === "kept"
                  ? "A WORD YOU KEPT"
                  : "FROM ONE STRANGER TO ANOTHER"}
              </p>
              <DialogTitle className="font-serif text-2xl">
                {dialogAction === "reply"
                  ? "Send a thought back."
                  : dialogAction === "release"
                    ? "Let it find another shore."
                    : dialogAction === "delete"
                      ? "Let these words go?"
                      : dialogAction === "discard"
                        ? "Let this bottle go?"
                        : dialogAction === "keep"
                          ? "A small keepsake."
                          : "A bottle, for you."}
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm text-[#6a7d74]">
                {dialogAction === "reply"
                  ? "Your reply returns to the previous holder, after 6–72 hours."
                  : dialogAction === "release"
                    ? "Add a small note, if you like. The current will carry it onwards."
                    : dialogAction === "delete"
                      ? "This permanently deletes the bottle and its journey notes. It cannot be undone."
                      : dialogAction === "discard"
                        ? "It will leave your shore. You won’t be able to retrieve it."
                        : dialogAction === "keep"
                          ? "Keep these words in your private collection."
                          : "Take your time. There is no right way to respond."}
              </DialogDescription>
              <p className="reading-letter">{selected.content}</p>
              {selected.notes.length > 0 && (
                <div className="journey-notes">
                  <p className="eyebrow mb-3">NOTES ALONG THE WAY</p>
                  {selected.notes.map((n) => (
                    <blockquote key={n.id}>
                      <span>Shore {n.hop}</span>
                      {n.note}
                    </blockquote>
                  ))}
                </div>
              )}
              {(dialogAction === "reply" || dialogAction === "release") && (
                <div className="mt-5">
                  <label htmlFor="reply-note" className="mb-2 block text-sm">
                    {dialogAction === "reply"
                      ? "Your reply"
                      : "A note for the next shore (optional)"}
                  </label>
                  <textarea
                    id="reply-note"
                    rows={5}
                    maxLength={dialogAction === "reply" ? 1600 : 400}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="field font-serif"
                    placeholder={
                      dialogAction === "reply"
                        ? "Your words found me…"
                        : "Passing this along with a little kindness…"
                    }
                  />
                  <p className="mt-2 text-right text-xs text-[#6a7d74]">
                    {Array.from(note).length} /{" "}
                    {dialogAction === "reply" ? 800 : 200}
                  </p>
                </div>
              )}
              {dialogAction ? (
                <div className="mt-6 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="ghost"
                    disabled={busy}
                    onClick={() => {
                      setDialogAction(null);
                      setNote("");
                    }}
                  >
                    Go back
                  </Button>
                  <Button
                    variant={
                      dialogAction === "delete" || dialogAction === "discard"
                        ? "destructive"
                        : "default"
                    }
                    disabled={
                      busy || (dialogAction === "reply" && !note.trim())
                    }
                    onClick={() => void act(dialogAction)}
                  >
                    {busy && <Loader2 size={16} className="animate-spin" />}
                    {
                      {
                        reply: "Send reply",
                        keep: "Keep this bottle",
                        release: "Release again",
                        discard: "Discard bottle",
                        delete: "Permanently delete",
                      }[dialogAction]
                    }
                  </Button>
                </div>
              ) : selected.status === "delivered" ? (
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <Button
                    disabled={Boolean(selected.replied_at)}
                    onClick={() => setDialogAction("reply")}
                  >
                    <MessageCircle size={16} />
                    {selected.replied_at ? "Reply drifting" : "Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogAction("keep")}
                  >
                    <Bookmark size={16} />
                    Keep
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogAction("release")}
                  >
                    <Wind size={16} />
                    Release again
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDialogAction("discard")}
                  >
                    <Trash2 size={16} />
                    Discard
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  className="mt-5 text-[#9f4c42]"
                  onClick={() => setDialogAction("delete")}
                >
                  <Trash2 size={16} />
                  Delete from collection
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
