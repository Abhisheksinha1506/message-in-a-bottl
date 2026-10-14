import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Message in a Bottle — Slow Correspondence",
    template: "%s · Message in a Bottle",
  },
  description:
    "A calm place for anonymous, unhurried correspondence. Write a thought, let it drift, and connect with a stranger.",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#f8f7f3",
              color: "#253e3d",
              border: "1px solid #dde4db",
            },
          }}
        />
      </body>
    </html>
  );
}
