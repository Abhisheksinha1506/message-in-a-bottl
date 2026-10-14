import { ShoreApp } from "@/components/shore-app";
import { getShore } from "@/lib/shore";
export const metadata = { title: "Write a bottle" };
export default async function WritePage() {
  return <ShoreApp initial={await getShore()} view="write" />;
}
