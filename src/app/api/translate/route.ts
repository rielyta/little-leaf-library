import { normalizeSelection } from "@/lib/translate";
import { translateQuerySchema } from "@/lib/validation/translate";
import { getSession } from "@/server/session";
import { translateSelection } from "@/server/translate";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = translateQuerySchema.safeParse({
    text: normalizeSelection(searchParams.get("text") ?? ""),
    to: searchParams.get("to"),
  });

  if (!parsed.success) {
    return Response.json({ error: "That text cannot be translated." }, { status: 400 });
  }

  const result = await translateSelection(parsed.data.text, parsed.data.to);

  if (!result) {
    return Response.json({ error: "We couldn't find a translation right now. Please try again in a moment." }, { status: 502 });
  }

  return Response.json(result, { headers: { "Cache-Control": "private, max-age=86400" } });
}