import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { fileTooLargeMessage, hasRoomFor, MAX_BOOK_FILE_BYTES, quotaExceededMessage } from "@/lib/storage-quota";
import { uploadRequestSchema } from "@/lib/validation/upload";
import { checkRateLimits, RATE_LIMITS, waitLabel } from "@/server/rate-limit";
import { deleteStoredFolder, getUploadUrl, pendingFolder, pendingUploadKey } from "@/server/storage";
import { getStorageUsage } from "@/server/storage-quota";

function errorResponse(status: number, error: string, headers?: HeadersInit) {
  return Response.json({ error }, { status, headers });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return errorResponse(401, "Please log in again.");
  }

  const parsed = uploadRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return errorResponse(400, "Choose a PDF file to upload.");
  }

  const { size } = parsed.data;

  if (size > MAX_BOOK_FILE_BYTES) {
    return errorResponse(413, fileTooLargeMessage(size));
  }

  const usage = await getStorageUsage(session.user.id);

  if (!hasRoomFor(usage, size)) {
    return errorResponse(413, quotaExceededMessage(size, usage));
  }

  const limit = await checkRateLimits(session.user.id, [RATE_LIMITS.uploadPerHour]);

  if (!limit.allowed) {
    return errorResponse(
      429,
      `You have added a lot of books in a short time. Please try again in ${waitLabel(limit.retryAfterSeconds)}.`,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  await deleteStoredFolder(pendingFolder(session.user.id));

  const uploadId = randomUUID();
  const remoteUrl = await getUploadUrl(pendingUploadKey(session.user.id, uploadId));

  return Response.json({ uploadId, url: remoteUrl ?? `/api/books/uploads/${uploadId}` });
}