"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { browserClient } from "@/lib/supabase/client";
import { profileSchema } from "@/lib/moderation";
import { request, readableError } from "@/lib/client-api";
import type { ShoreData } from "@/types/bottle";
export function SettingsView({
  data,
  onSave,
}: {
  data: ShoreData;
  onSave: (next: ShoreData) => void;
}) {
  const [name, setName] = useState(data.profile.display_name || "");
  const [limit, setLimit] = useState(data.profile.receive_limit);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function upgrade() {
    setBusy(true);
    try {
      const result = await browserClient().auth.updateUser(
        { email },
        { emailRedirectTo: `${window.location.origin}/auth/callback` },
      );
      if (result.error) throw result.error;
      toast.success("Check your email to keep this shore yours.");
    } catch {
      toast.error("We couldn’t send your invitation. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">MAKE A LITTLE ROOM FOR YOURSELF</p>
        <h1>Your quiet corner.</h1>
        <p>A few small choices. Your identity stays yours.</p>
      </div>
      <div className="settings-layout">
        <form
          className="settings-card"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              const body = profileSchema.parse({
                display_name: name,
                receive_limit: limit,
              });
              if (data.demo) {
                if (limit < data.stats.pending)
                  throw new Error(
                    "Keep or discard some bottles before lowering your limit.",
                  );
                onSave({
                  ...data,
                  profile: {
                    ...data.profile,
                    display_name: body.display_name,
                    receive_limit: limit,
                  },
                });
              } else {
                await request("/api/profile", "PATCH", body);
                router.refresh();
              }
              toast.success("Your corner feels a little more like you.");
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
        >
          <h2>A name for your shore</h2>
          <p>Optional, and only shown to you. Your bottles are anonymous.</p>
          <label htmlFor="display-name">Display name</label>
          <input
            id="display-name"
            className="field"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
            placeholder="A quiet wanderer"
          />
          <label htmlFor="receive-limit" className="mt-6">
            Room on your shore
          </label>
          <select
            id="receive-limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="field"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "bottle" : "bottles"} at a time
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs">
            Includes delivered bottles, your drifting bottles, and replies on
            their way to you. Keepsakes don’t take up space.
          </p>
          <Button className="mt-6" disabled={busy}>
            Save your preferences
          </Button>
        </form>
        <div className="settings-card">
          <Mail size={23} strokeWidth={1.4} />
          <h2 className="mt-4">
            {data.guest
              ? "Keep this shore yours."
              : "A shore you can return to."}
          </h2>
          <p>
            {data.guest
              ? "A guest shore lives with this session. Add your email to return from another device and keep your collection safe."
              : "You’re signed in with an email. A magic link will bring you back whenever you like."}
          </p>
          {data.guest && !data.demo && (
            <form
              className="mt-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void upgrade();
              }}
            >
              <label htmlFor="upgrade-email">Email address</label>
              <input
                id="upgrade-email"
                type="email"
                autoComplete="email"
                required
                className="field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button disabled={busy}>Send an invitation</Button>
            </form>
          )}
          {data.demo && (
            <div className="mt-5 rounded-lg bg-muted p-4 text-xs leading-6">
              This is a browser preview. Email sign-in and upgrades become
              available after connecting Supabase.
            </div>
          )}
          {!data.demo && (
            <Button
              variant="outline"
              className="mt-6"
              disabled={busy}
              onClick={async () => {
                if (
                  data.guest &&
                  !window.confirm(
                    "Leave this guest shore? Without an email, you may not be able to return to these bottles.",
                  )
                )
                  return;
                setBusy(true);
                const { error } = await browserClient().auth.signOut();
                if (error) {
                  toast.error("We couldn’t sign you out. Please try again.");
                  setBusy(false);
                  return;
                }
                router.replace("/login");
                router.refresh();
              }}
            >
              <LogOut size={15} />
              Leave for now
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
