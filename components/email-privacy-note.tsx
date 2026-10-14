import Link from "next/link";

export function EmailPrivacyNote({ id }: { id: string }) {
  return (
    <p id={id} className="email-privacy-note">
      Email is optional. Supabase Auth stores it for sign-in and verification,
      not in your bottles or a public profile. Guest accounts also store data on
      the server. <Link href="/privacy">Read the privacy policy.</Link>
    </p>
  );
}
