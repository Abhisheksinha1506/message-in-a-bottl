"use client";
import { Button } from "@/components/ui/button";
import { BottleIllustration } from "@/components/bottle-illustration";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="login-page">
      <div className="login-card">
        <BottleIllustration className="mx-auto h-40 w-40" />
        <h1 className="mt-6 font-serif text-3xl">A little rough water.</h1>
        <p className="my-5 text-sm leading-7">
          We couldn’t reach your shore just now.
          <br />
          Your words are still safe. Try again in a moment.
        </p>
        <Button onClick={reset}>Try again</Button>
        <a className="ml-4 text-sm underline" href="/login">
          Return to sign-in
        </a>
      </div>
    </main>
  );
}
