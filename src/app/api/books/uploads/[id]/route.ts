import { auth } from "@/auth";
import { MAX_BOOK_FILE_BYTES } from "@/lib/storage-quota";
import { uploadIdSchema } from "@/lib/validation/upload";
import { isRemoteStorage, pendingUploadKey, saveStoredFile } from "@/server/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  if (isRemoteStorage()) {
    return new Response("Not found", { status: 404 });
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  if (!uploadIdSchema.safeParse(id).success) {
    return new Response("Not found", { status: 404 });
  }

  const declaredSize = Number(request.headers.get("content-length") ?? 0);

  if (declaredSize > MAX_BOOK_FILE_BYTES) {
    return new Response("File too large", { status: 413 });
  }

  const bytes = new Uint8Array(await request.arrayBuffer());

  if (bytes.byteLength === 0 || bytes.byteLength > MAX_BOOK_FILE_BYTES) {
    return new Response("Invalid file", { status: 400 });
  }

  await saveStoredFile(pendingUploadKey(session.user.id, id), bytes);

  return new Response(null, { status: 204 });
}