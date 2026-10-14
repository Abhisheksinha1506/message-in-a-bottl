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
        <div className="context-steps" aria-label="A bottle’s journey">
          <div>
            <span>01 · Write</span>
            <p>A thought, a story, or a question. Up to 800 characters.</p>
          </div>
          <div>
            <span>02 · Drift</span>
            <p>A random 6–72-hour pause. No rush, and no delivery guarantee.</p>
          </div>
          <div>
            <span>03 · Connect</span>
            <p>
              One active stranger receives it. A reply takes its own slow
              journey.
            </p>
          </div>
        </div>
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
        <p>
          <Link href="/privacy" className="text-link">
            Read the full privacy policy: emails, cookies, storage, and deletion
            →
          </Link>
        </p>
        <h2>Email is optional. Context is not.</h2>
        <p>
          Guest mode creates a real account without asking for an email. Your
          bottles are still stored on the server. Email sign-in or a verified
          guest upgrade can help you return to the same account; Supabase Auth
          stores that address, and it is not shared with recipients.
        </p>
        <p>
          Public magic-link email delivery is not yet enabled in this early
          version. Use guest mode if you cannot receive an invitation. Until you
          have verified an email, keep the same browser session and website
          address to return to your shore.
        </p>
        <h2>A place to take your time</h2>
        <p>
          There are no read receipts, scores, or promises of a quick reply.
          Guest sessions can be upgraded with an email. Without an upgrade,
          losing your session may mean losing access to your shore.
        </p>
        <h2>A few things worth knowing</h2>
        <div className="context-faq">
          <details>
            <summary>What happens when I reply?</summary>
            <p>
              Your reply becomes a separate bottle, addressed to the previous
              holder after a new random delay. This is not a live chat, and
              neither person owes the other a reply.
            </p>
          </details>
          <details>
            <summary>Can a bottle visit more than one person?</summary>
            <p>
              Yes, one holder at a time. Release a received bottle again to send
              it to another eligible stranger. Its onward notes may travel with
              it, so keep them as anonymous as the original message.
            </p>
          </details>
          <details>
            <summary>Why might a bottle take longer than 72 hours?</summary>
            <p>
              The initial wait is 6–72 hours. Delivery also needs an eligible
              person who was active in the last 14 days and has room on their
              shore. Without one, the bottle waits and is retried. The maximum
              initial delay is not a guaranteed arrival time.
            </p>
          </details>
          <details>
            <summary>
              What is the difference between discard and delete?
            </summary>
            <p>
              Discard hides the bottle from your inbox but does not erase its
              stored content. You can permanently delete a bottle you currently
              keep in Keepsakes. That does not remove your account or
              independent replies already created.{" "}
              <Link href="/privacy#retention">Read the retention details.</Link>
            </p>
          </details>
          <details>
            <summary>Is this a confidential or emergency service?</summary>
            <p>
              No. Messages are not end-to-end encrypted, and a recipient may
              share their contents elsewhere. Do not put private identifiers,
              passwords, financial or medical details in a bottle. This app is
              not a place to seek urgent or emergency help.
            </p>
          </details>
        </div>
      </div>
      <footer className="info-footer">
        <span>With kindness, from one shore to another.</span>
        <Link href="/privacy">Privacy policy</Link>
        <Link href="/login">Visit the shore →</Link>
      </footer>
    </main>
  );
}
