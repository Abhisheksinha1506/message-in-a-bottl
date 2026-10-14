import { ShoreApp } from "@/components/shore-app";
import { getShore } from "@/lib/shore";
export const metadata = { title: "Keepsakes" };
export default async function CollectionPage() {
  return <ShoreApp initial={await getShore()} view="collection" />;
}
