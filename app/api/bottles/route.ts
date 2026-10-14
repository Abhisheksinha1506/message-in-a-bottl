import { NextResponse, type NextRequest } from "next/server";
import { mutationClient, fail, rpcError } from "@/lib/api";
import { releaseSchema, actionSchema } from "@/lib/moderation";
export async function POST(request: NextRequest) {
  try {
    const client = await mutationClient(request);
    const body = releaseSchema.parse(await request.json());
    const { data, error } = await client.rpc("release_bottle", {
      p_content: body.content,
      p_mood: body.mood ?? undefined,
    });
    if (error) rpcError(error);
    return NextResponse.json({ id: data }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
export async function PATCH(request: NextRequest) {
  try {
    const client = await mutationClient(request);
    const body = actionSchema.parse(await request.json());
    const result =
      body.action === "delete"
        ? await client.rpc("delete_kept_bottle", { p_id: body.id })
        : await client.rpc("act_on_bottle", {
            p_id: body.id,
            p_action: body.action,
            p_content: body.content,
          });
    if (result.error) rpcError(result.error);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
