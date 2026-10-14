"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Anchor,
  ArrowRight,
  Check,
  Feather,
  Loader2,
  Send,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BottleIllustration } from "@/components/bottle-illustration";
import { moods, type Mood } from "@/lib/config";
import { contentSchema } from "@/lib/moderation";
import { readableError } from "@/lib/client-api";
import { cn } from "@/lib/utils";
export function Compose({
  onRelease,
  remaining,
  full,
}: {
  onRelease: (content: string, mood: Mood | null) => Promise<void>;
  remaining: number;
  full: boolean;
}) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const count = Array.from(content).length;
  if (sent)
    return (
      <div className="release-success">
        <BottleIllustration className="mx-auto h-48 w-48" />
        <p className="eyebrow mt-7">TRUST THE CURRENT</p>
        <h1>Your words are on their way.</h1>
        <p>
          Somewhere, a stranger will find them.
          <br />
          There’s nothing more you need to do.
        </p>
        <span className="mood-tag mx-auto mt-3">
          <Wind size={14} />
          Drifting · 6–72 hours
        </span>
        <Button asChild className="mt-8">
          <Link href="/">
            Return to your shore
            <ArrowRight size={16} />
          </Link>
        </Button>
      </div>
    );
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">A SMALL THOUGHT. AN OPEN OCEAN.</p>
        <h1>Set something free.</h1>
        <p>
          You don’t need the perfect words. Just something that feels like you.
        </p>
      </div>
      <div className="compose-layout">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const clean = contentSchema.parse(content);
              await onRelease(clean, mood);
              setContent("");
              setSent(true);
              toast.success("Your bottle is drifting.");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? readableError(error)
                  : "Please try again.",
              );
            } finally {
              setBusy(false);
            }
          }}
          className="compose-paper"
        >
          <div className="paper-top">
            <Feather size={19} strokeWidth={1.4} />
            <span>TO SOMEONE, SOMEWHERE</span>
          </div>
          <label htmlFor="bottle-content" className="sr-only">
            Your message
          </label>
          <textarea
            id="bottle-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={1600}
            placeholder={"Dear stranger,\n\nToday, I was thinking about…"}
            className="compose-text"
            aria-describedby="word-count compose-hint"
            required
          />
          <div className="compose-count">
            <span>With kindness, a stranger</span>
            <span id="word-count" className={count > 800 ? "text-red-700" : ""}>
              {count} / 800
            </span>
          </div>
          <div className="compose-mood">
            <p>
              How does this thought feel? <span>Optional</span>
            </p>
            <div className="mood-options">
              {moods.map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mood === m}
                  className={cn(
                    "mood-tag",
                    `mood-${m}`,
                    mood === m && "mood-selected",
                  )}
                  onClick={() => setMood(mood === m ? null : m)}
                >
                  {mood === m ? <Check size={12} /> : <span />}
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="compose-bottom">
            <p id="compose-hint">
              <Wind size={15} />
              {full
                ? "Your shore is full. Keep or discard a bottle, or wait for a delivery."
                : remaining > 0
                  ? `Your next bottle can drift in about ${remaining}h.`
                  : "The current will take it from here."}
            </p>
            <Button
              type="submit"
              disabled={
                busy || remaining > 0 || full || !content.trim() || count > 800
              }
            >
              {busy ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Release bottle
            </Button>
          </div>
        </form>
        <aside className="writing-aside">
          <BottleIllustration className="h-40 w-40" />
          <h2>
            What belongs
            <br />
            in a bottle?
          </h2>
          <p>
            A moment you want to remember.
            <br />A question with no easy answer.
            <br />A little hope for someone else.
          </p>
          <div className="aside-rule" />
          <p>
            Leave names, contact details, and private information on the shore.
            Here, we meet as strangers.
          </p>
          <div className="writing-timing">
            <Anchor size={18} strokeWidth={1.4} />
            <span>
              One new bottle every 12 hours.
              <br />A journey of 6–72 hours.
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}
