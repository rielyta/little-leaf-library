import { z } from "zod";
import { saveReadingProgress } from "@/server/reading-progress";
import { getSession } from "@/server/session";

const progressSchema = z.object({
  page: z.number().int().min(1),
});

type ProgressRouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: ProgressRouteContext) {
  const session = await getSession();

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const { id } = await params;
  const parsed = progressSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const saved = await saveReadingProgress(session.user.id, id, parsed.data.page);

  return new Response(null, { status: saved ? 204 : 404 });
}