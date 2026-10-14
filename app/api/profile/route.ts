import { NextResponse, type NextRequest } from "next/server";
import { mutationClient, fail, rpcError } from "@/lib/api";
import { profileSchema } from "@/lib/moderation";
export async function PATCH(request: NextRequest) {
  try {
    const client = await mutationClient(request);
    const body = profileSchema.parse(await request.json());
    const { error } = await client.rpc("update_profile", {
      p_display_name: body.display_name,
      p_receive_limit: body.receive_limit,
    });
    if (error) rpcError(error);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
