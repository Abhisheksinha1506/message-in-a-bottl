import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck, Waves } from "lucide-react";
import { privacyContact, privacySections, privacyUpdated } from "@/lib/privacy";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Message in a Bottle stores, how email and guest accounts work, who can access messages, and what deletion means.",
};

export default function PrivacyPage() {
  const contact = privacyContact(process.env.PRIVACY_CONTACT_EMAIL);
  return (
    <main className="info-page privacy-page" id="main-content">
      <nav aria-label="Information navigation" className="info-nav">
        <Link href="/">← Your shore</Link>
        <Link href="/about">How this place works</Link>
      </nav>
      <header className="info-heading">
        <ShieldCheck size={34} strokeWidth={1.3} aria-hidden="true" />
        <p className="eyebrow">CLEAR WORDS. QUIET BOUNDARIES.</p>
        <h1>
          Your words deserve
          <br />a little clarity.
        </h1>
        <p className="info-lead">Privacy policy for Message in a Bottle.</p>
        <p className="info-updated">
          Last updated: <time dateTime="2026-10-14">{privacyUpdated}</time>
        </p>
      </header>
      <section
        className="privacy-summary"
        aria-labelledby="privacy-summary-title"
      >
        <h2 id="privacy-summary-title">The short version</h2>
        <div className="privacy-facts">
          <div>
            <Mail size={19} aria-hidden="true" />
            <h3>Email is optional</h3>
            <p>
              Supabase Auth stores it for sign-in and verification. It is not
              shown to other users.
            </p>
          </div>
          <div>
            <ShieldCheck size={19} aria-hidden="true" />
            <h3>Anonymous, not invisible</h3>
            <p>
              Recipients do not see your identity. The operator can access
              stored records.
            </p>
          </div>
          <div>
            <Waves size={19} aria-hidden="true" />
            <h3>Discard is not deletion</h3>
            <p>
              Guest data and discarded bottles remain stored. There is no
              automatic expiry.
            </p>
          </div>
        </div>
      </section>
      <nav className="policy-contents" aria-label="Privacy policy sections">
        {privacySections.map((section, index) => (
          <a key={section.id} href={`#${section.id}`}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            {section.title}
          </a>
        ))}
        <a href="#contact">
          <span>09</span>Privacy questions and requests
        </a>
      </nav>
      <div className="policy-prose">
        {privacySections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
          >
            <h2 id={`${section.id}-title`}>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.id === "providers" && (
              <p className="provider-links">
                Provider information:{" "}
                <a href="https://supabase.com/privacy">
                  Supabase privacy notice
                </a>{" "}
                ·{" "}
                <a href="https://vercel.com/legal/privacy-notice">
                  Vercel privacy notice
                </a>
                . These do not replace this app’s policy.
              </p>
            )}
          </section>
        ))}
        <section id="contact" aria-labelledby="contact-title">
          <h2 id="contact-title">Privacy questions and requests</h2>
          {contact ? (
            <>
              <p>
                For questions about this app’s data practices or account-data
                requests, contact the project operator at{" "}
                <a href={`mailto:${encodeURIComponent(contact)}`}>{contact}</a>.
                Identity verification may be needed before account information
                can be shared or changed.
              </p>
              <p>
                Please do not send passwords, sign-in links, session tokens, or
                sensitive message content. This email is a contact route, not an
                automatic account-deletion tool.
              </p>
            </>
          ) : (
            <div className="policy-notice">
              <p>
                A dedicated privacy contact email has not yet been published for
                this early version. Full-account export and deletion are not
                available in the app.
              </p>
              <p>
                Please do not put privacy requests or identifying information
                into the shared bottle pool. The self-service choices described
                above remain available.
              </p>
            </div>
          )}
        </section>
      </div>
      <footer className="info-footer">
        <span>With kindness, and with clarity.</span>
        <Link href="/about">About this little ocean</Link>
        <Link href="/login">Visit the shore →</Link>
      </footer>
    </main>
  );
}
