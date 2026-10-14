"use client";
import { ArrowRight, Bookmark, Trash2, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bottle } from "@/types/bottle";
function shortDate(date: string | null) {
  return date
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(
        new Date(date),
      )
    : "A little while ago";
}
export function BottleCard({
  bottle,
  onOpen,
  onKeep,
  collection = false,
}: {
  bottle: Bottle;
  onOpen: () => void;
  onKeep: () => void;
  collection?: boolean;
}) {
  return (
    <article className="bottle-card">
      <div className="bottle-meta">
        <span className={cn("mood-tag", `mood-${bottle.mood || "calm"}`)}>
          <span />
          {bottle.mood || "a quiet thought"}
        </span>
        <span>
          {bottle.is_reply
            ? "A reply returned"
            : collection
              ? `Kept ${shortDate(bottle.kept_at)}`
              : `Arrived ${shortDate(bottle.delivered_at)}`}
        </span>
      </div>
      <button
        onClick={onOpen}
        className="letter-preview"
        aria-label={`Read bottle: ${bottle.content.slice(0, 60)}`}
      >
        <p>{bottle.content}</p>
      </button>
      <div className="bottle-card-footer">
        <span>
          <Wind size={14} strokeWidth={1.4} />
          {bottle.hop_count === 0
            ? "A new journey"
            : `Passed through ${bottle.hop_count} ${bottle.hop_count === 1 ? "shore" : "shores"}`}
        </span>
        <div>
          <button className="card-read" onClick={onOpen}>
            Open bottle
            <ArrowRight size={13} />
          </button>
          <button
            className="card-bookmark"
            onClick={onKeep}
            aria-label={collection ? "Delete kept bottle" : "Keep bottle"}
          >
            {collection ? <Trash2 size={16} /> : <Bookmark size={16} />}
          </button>
        </div>
      </div>
    </article>
  );
}
