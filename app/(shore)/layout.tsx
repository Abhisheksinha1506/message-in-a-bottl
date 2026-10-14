import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { hasSupabase, isDemo } from "@/lib/config";
export const dynamic = "force-dynamic";
export default async function ShoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isDemo) {
    if (!hasSupabase) redirect("/login");
    const {
      data: { user },
    } = await (await serverClient()).auth.getUser();
    if (!user) redirect("/login");
  }
  return children;
}
