// Product disclosures, not a claim of compliance with any particular privacy law.
// Update these facts alongside changes to storage, providers, or deletion behavior.
export const privacyUpdated = "14 October 2026";
export const privacySections = [
  {
    id: "scope",
    title: "About this policy",
    paragraphs: [
      "This policy describes Message in a Bottle, also called Slow Correspondence, and the data handled by its project operator. It covers the app on slow-correspondence.vercel.app and its original message-in-a-bottle-two.vercel.app address. It does not make your correspondence public or give other users access to your account.",
      "The service is a small, early-stage correspondence app. Please do not include addresses, phone numbers, financial details, health information, passwords, or someone else’s private information in a bottle. It is not a confidential counselling service or an emergency channel.",
    ],
  },
  {
    id: "email",
    title: "Your email, explained",
    paragraphs: [
      "If you request an email sign-in link or add an email to a guest account, that address is processed and stored by Supabase Auth with your authentication account. It is used to identify your account, send sign-in or verification emails, and let you return to the same shore once verified. You do not need to create a password in this app.",
      "Your email is not stored in the app’s bottle or profile tables, and is not included in the bottle data sent to recipients. Other users do not see your email or your display name. The operator can associate internal account IDs with Auth records, so anonymity to recipients is not anonymity to the operator.",
      "This version has no mailing list, advertising integration, or arrival-email notifications. The app does not sell email addresses or use them for marketing. Supabase and its email-delivery infrastructure must process the recipient address when sending an authentication email. Public email delivery is not yet enabled; guest mode is available without providing an email.",
    ],
  },
  {
    id: "stored-data",
    title: "What else is stored, and why",
    paragraphs: [
      "Account and profile data includes an internal user ID, an optional display name, account-creation and last-active timestamps, your receive limit, and the time of your last original bottle. These support sign-in, private preferences, delivery eligibility, the five-bottle capacity limit, and the 12-hour writing limit.",
      "Correspondence data includes bottle and reply text, mood tags, onward notes, status, timestamps, hop counts, and internal author, holder, and reply-recipient IDs. Action history records releases, deliveries, replies, keeps, and discards. Arrival-event records allow your inbox to update. These records make delayed delivery, reply routing, and your collection work.",
      "Guest mode also creates an authentication account and stores profiles and correspondence on the server. It is email-free, not storage-free. The app’s local development preview uses browser localStorage for sample data; the live service stores real correspondence in Supabase.",
    ],
  },
  {
    id: "visibility",
    title: "Who can see a bottle",
    paragraphs: [
      "There is no public gallery or feed in this version. Through the app, you can read bottles currently delivered to you and bottles you have kept. Sender account IDs, email addresses, and private routing IDs are not shown to recipients. A bottle’s message, mood, journey count, dates, and a short chain of release notes may be visible to its current holder.",
      "Releasing a received bottle makes its content and onward notes available to a later recipient. A reply is a separate delayed bottle sent to the previous holder. A recipient can copy or share words outside this app; the app cannot prevent or retract those copies. You cannot recall a released bottle through the current interface.",
      "Correspondence is not end-to-end encrypted. Authorized project administrators and the infrastructure providers needed to operate the service can have access to stored content and account or routing records. Database access controls restrict ordinary users; they do not hide data from the operator.",
    ],
  },
  {
    id: "providers",
    title: "Supabase, Vercel, and technical records",
    paragraphs: [
      "Supabase provides authentication, the database, and inbox-arrival events. Vercel hosts the website and API. These providers process the information needed to deliver those services. Data may be processed outside your country; this app does not promise that all processing stays in your location.",
      "Infrastructure providers may process technical records such as IP addresses, browser information, request timestamps, authentication events, and errors for service operation and security. No advertising pixels, third-party analytics SDKs, or behavioural profiling tools are installed in the app. That does not mean the hosting and authentication services have no operational logs.",
    ],
  },
  {
    id: "cookies",
    title: "Cookies and guest sessions",
    paragraphs: [
      "The app uses Supabase session cookies to keep you signed in, including as a guest. These are necessary for access to your private inbox; the app does not add advertising cookies. You can clear cookies in your browser, but this can end access to your account on that browser.",
      "Without a verified email, signing out, clearing browser data, using another browser or device, or opening the other website address may leave you unable to recover a guest shore. Cookies are tied to the website address. Losing access or signing out does not delete the account or its stored bottles.",
    ],
  },
  {
    id: "retention",
    title: "Retention, discard, and permanent deletion",
    paragraphs: [
      "There is currently no automatic expiry or cleanup period for accounts, email addresses, profiles, correspondence, or action history. Being inactive for 14 days affects delivery eligibility, not deletion. The random 6–72-hour delay is a delivery setting, not a data-retention period.",
      "Discard removes a bottle from your inbox but leaves its content and history stored. Keep stores it in your personal collection. Permanently deleting a kept bottle removes that bottle from the active application database, along with its journey notes, arrival events, and its associated reply record if it is itself a reply. Independent replies and reply records already created from that bottle can remain.",
      "The current interface does not offer full-account deletion, email removal, or a full-account export. Deleting a keepsake is not deleting your account. Provider-maintained logs or backups, where present, are separate from the active database; this app does not promise immediate erasure from every provider system or from copies made by recipients.",
    ],
  },
  {
    id: "choices",
    title: "Your choices and policy updates",
    paragraphs: [
      "You can use guest mode without an email, choose or clear your optional display name, change your receive limit, discard an unwanted delivery, or permanently delete a bottle you currently keep. Avoid putting identifying information into messages or onward notes. If you need to preserve a guest shore, keep its session available until email verification is supported and completed.",
      "Privacy rights and available remedies can depend on where you live. Account-wide requests are not automated in this version. We will update this page when data practices change; the date at the top identifies this version. Any new email provider, analytics feature, public gallery, or retention workflow should be disclosed here before it is used.",
    ],
  },
] as const;

export function privacyContact(email?: string) {
  const trimmed = email?.trim();
  // A contact link is public. Reject whitespace/control characters and URL payloads.
  return trimmed &&
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(trimmed)
    ? trimmed
    : null;
}
