import { ShoreApp } from "@/components/shore-app";
import { getShore } from "@/lib/shore";
export const metadata = { title: "Your quiet corner" };
export default async function SettingsPage() {
  return <ShoreApp initial={await getShore()} view="settings" />;
}
