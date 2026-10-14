import { ShoreApp } from "@/components/shore-app";
import { getShore } from "@/lib/shore";
export default async function InboxPage() {
  return <ShoreApp initial={await getShore()} view="inbox" />;
}
