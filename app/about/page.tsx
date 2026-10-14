import Link from "next/link";
import { Waves } from "lucide-react";
export const metadata = { title: "About this little ocean" };
export default function AboutPage() {
  return (
    <main className="about-page">
      <Link href="/" className="text-sm text-primary">
        ← Return to your shore
      </Link>
      <Waves size={35} strokeWidth={1.2} className="mb-7 mt-16" />
      <p className="eyebrow">A NOTE ABOUT THIS PLACE</p>
      <h1 className="my-6 font-serif text-5xl">
        A little less instant.
        <br />A little more human.
      </h1>
      <div className="about-prose">
        <p>
          Message in a Bottle is a small experiment in slow correspondence. You
          write a thought, release it, and let it find a stranger. There are no
          feeds to refresh, no followers to collect, and no audience to perform
          for.
        </p>
        <h2>How the current works</h2>
        <p>
          A new bottle travels for a random 6–72 hours before finding another
          active person. Replies take the same unhurried journey back to the
          previous holder. Sometimes a full or quiet shore means a little
          longer. No delivery time is guaranteed.
        </p>
        <p>
          You can keep a bottle in your private collection, pass it on with a
          small note, or let it go. There is room for up to five pending and
          delivered bottles, and you can write one new bottle every 12 hours.
        </p>
        <h2>Meet as strangers</h2>
        <p>
          Your display name is just for you. Recipients do not see your account
          or email. Please leave names, contact details, and other private
          information out of your messages. A simple word filter helps set the
          tone, but cannot catch everything. Discard words you don’t want to
          hold.
        </p>
        <h2>A note on privacy</h2>
        <p>
          Correspondence is anonymous to other users, but it is not end-to-end
          encrypted. The app operator can access stored content and routing
          records. Kept bottles are private to you. Deleting one removes that
          bottle and its journey notes; independent replies already created
          remain with their recipients. Discarded bottles leave your inbox but
          remain stored.
        </p>
        <h2>A place to take your time</h2>
        <p>
          There are no read receipts, scores, or promises of a quick reply.
          Guest sessions can be upgraded with an email. Without an upgrade,
          losing your session may mean losing access to your shore.
        </p>
      </div>
      <footer className="mt-16 border-t border-border pt-6 text-xs text-[#6a7d74]">
        With kindness, from one shore to another.
      </footer>
    </main>
  );
}
