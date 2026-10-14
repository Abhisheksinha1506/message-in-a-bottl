"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { browserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BottleIllustration } from "@/components/bottle-illustration";
export function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("error"))
      toast.error("That link has expired. Request a fresh one.");
  }, []);
  async function enter(guest: boolean) {
    setBusy(true);
    try {
      const client = browserClient();
      const result = guest
        ? await client.auth.signInAnonymously()
        : await client.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
      if (result.error) throw result.error;
      if (guest) {
        router.replace("/");
        router.refresh();
      } else setSent(true);
    } catch {
      toast.error(
        "We couldn’t open the shore just now. Please try again in a moment.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login-page">
      <div className="login-card">
        <BottleIllustration className="mx-auto h-40 w-40" />
        <p className="eyebrow mt-8">SLOW CORRESPONDENCE</p>
        <h1 className="mt-4 font-serif text-4xl">
          A little less instant.
          <br />A little more human.
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#6a7d74]">
          Leave a thought for someone you haven’t met.
          <br />
          Let the ocean take its time.
        </p>
        {!configured ? (
          <div className="mt-8 rounded-xl border border-border bg-white/60 p-5 text-left text-sm leading-6">
            The shore is being prepared. Add your Supabase environment variables
            to enable sign-in. See the project README for setup.
          </div>
        ) : sent ? (
          <div role="status" className="mt-8 rounded-xl bg-muted p-6">
            <Mail className="mx-auto mb-3" />
            <h2 className="font-serif text-xl">
              A small invitation is on its way.
            </h2>
            <p className="mt-3 text-sm leading-6">
              Check your email for a sign-in link. You can return to this quiet
              corner from there.
            </p>
            <Button
              variant="ghost"
              className="mt-3"
              onClick={() => setSent(false)}
            >
              Use another email
            </Button>
          </div>
        ) : (
          <>
            <form
              className="mt-8 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void enter(false);
              }}
            >
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field"
              />
              <Button className="w-full" disabled={busy}>
                {busy ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <Mail size={17} />
                )}{" "}
                Send me a magic link
              </Button>
            </form>
            <Button
              variant="ghost"
              className="mt-3 w-full"
              disabled={busy}
              onClick={() => void enter(true)}
            >
              Wander in as a guest <ArrowRight size={15} />
            </Button>
            <p className="mt-5 text-xs leading-6 text-[#6a7d74]">
              No passwords. No public profiles. Just a place to be.
              <br />
              Guests can add an email later to save their collection.
            </p>
          </>
        )}
        <a
          href="/about"
          className="mt-8 inline-block text-xs underline underline-offset-4"
        >
          A note about this place
        </a>
      </div>
    </main>
  );
}
