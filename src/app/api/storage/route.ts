import { auth } from "@/auth";
import { getStorageUsage } from "@/server/storage-quota";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return Response.json({ error: "Please log in again." }, { status: 401 });
  }

  const usage = await getStorageUsage(session.user.id);

  return Response.json(usage, { headers: { "Cache-Control": "private, no-store" } });
}