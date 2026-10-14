import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottleIllustration } from "@/components/bottle-illustration";
export function EmptyState({ collection }: { collection: boolean }) {
  return (
    <div className="empty-state">
      <BottleIllustration className="mx-auto h-36 w-36" />
      <h3>
        {collection
          ? "Some words are worth keeping."
          : "The tide is taking its time."}
      </h3>
      <p>
        {collection
          ? "When a bottle speaks to you, keep it here. A small collection of unexpected kindness."
          : "Your shore is quiet for now. Somewhere, a thought may be making its way to you."}
      </p>
      <Button asChild variant="outline">
        <Link href={collection ? "/" : "/write"}>
          {collection ? "Return to your shore" : "Set a thought free"}
          <ArrowRight size={15} />
        </Link>
      </Button>
    </div>
  );
}
