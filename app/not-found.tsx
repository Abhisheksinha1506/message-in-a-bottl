import Link from "next/link";
import { BottleIllustration } from "@/components/bottle-illustration";
export default function NotFound() {
  return (
    <main className="login-page">
      <div className="login-card">
        <BottleIllustration className="mx-auto h-40 w-40" />
        <h1 className="mt-6 font-serif text-3xl">A shore we couldn’t find.</h1>
        <p className="my-5 text-sm">
          Perhaps the current carried you a little too far.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          Return to your shore
        </Link>
      </div>
    </main>
  );
}
