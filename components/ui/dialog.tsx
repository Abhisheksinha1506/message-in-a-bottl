"use client";
import * as React from "react";
import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogTitle = Primitive.Title;
export const DialogDescription = Primitive.Description;
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof Primitive.Content>,
  React.ComponentPropsWithoutRef<typeof Primitive.Content>
>(({ className, children, ...props }, ref) => (
  <Primitive.Portal>
    <Primitive.Overlay className="fixed inset-0 z-50 bg-[#223d38]/30 backdrop-blur-sm" />
    <Primitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-background p-7 shadow-xl focus:outline-none",
        className,
      )}
      {...props}
    >
      {children}
      <Primitive.Close className="absolute right-4 top-4 rounded-md p-2 text-[#687b73] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <X size={18} />
        <span className="sr-only">Close</span>
      </Primitive.Close>
    </Primitive.Content>
  </Primitive.Portal>
));
DialogContent.displayName = "DialogContent";
