import { z } from "zod";
import { moods } from "@/lib/config";
const blocked = /\b(fuck|shit|nigger|faggot)\b/i;
export const contentSchema = z
  .string()
  .trim()
  .min(1, "A bottle needs a few words.")
  .refine(
    (value) => Array.from(value).length <= 800,
    "Keep your message within 800 characters.",
  )
  .refine(
    (value) => !blocked.test(value),
    "Please choose gentler words before releasing this bottle.",
  );
export const releaseSchema = z
  .object({ content: contentSchema, mood: z.enum(moods).nullable().optional() })
  .strict();
export const actionSchema = z
  .object({
    id: z.string().uuid(),
    action: z.enum(["reply", "keep", "release", "discard", "delete"]),
    content: z.string().optional(),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.action === "reply") {
      const checked = contentSchema.safeParse(value.content);
      if (!checked.success)
        context.addIssue({
          code: "custom",
          message: checked.error.issues[0].message,
        });
    }
    if (value.action === "release" && value.content?.trim()) {
      if (Array.from(value.content).length > 200)
        context.addIssue({
          code: "custom",
          message: "Keep your note within 200 characters.",
        });
      if (blocked.test(value.content))
        context.addIssue({
          code: "custom",
          message: "Please choose gentler words for your note.",
        });
    }
  });
export const profileSchema = z
  .object({
    display_name: z
      .string()
      .trim()
      .max(40)
      .refine((v) => !blocked.test(v), "Please choose a gentler name."),
    receive_limit: z.number().int().min(1).max(5),
  })
  .strict();
