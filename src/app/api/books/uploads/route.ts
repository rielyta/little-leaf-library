import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { hasPdfSignature } from "@/lib/books";
import { readPdfInfo } from "@/lib/pdf-info";
import { fileTooLargeMessage, hasRoomFor, MAX_BOOK_FILE_BYTES, quotaExceededMessage } from "@/lib/storage-quota";
import { toFieldErrors } from "@/lib/validation/errors";
import { finishUploadSchema } from "@/lib/validation/upload";
import { findOwnedBookcase } from "@/server/bookcases";
import { createBookForUser } from "@/server/books";
import { bookFileKey, deleteStoredFile, pendingUploadKey, readStoredFile, saveStoredFile } from "@/server/storage";
import { getStorageUsage } from "@/server/storage-quota";

const READ_RETRY_DELAYS_MS = [0, 400, 1200];

type PendingRead = { status: "found"; bytes: Uint8Array } | { status: "missing" } | { status: "unavailable" };

function errorResponse(status: number, error: string, fieldErrors?: Record<string, string | undefined>) {
  return Response.json({ error, fieldErrors }, { status });
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isMissingObject(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const metadata = (error as { $metadata?: { httpStatusCode?: number } }).$metadata;
  return error.name === "NoSuchKey" || error.name === "NotFound" || metadata?.httpStatusCode === 404 || "code" in error && error.code === "ENOENT";
}

async function readPendingUpload(key: string): Promise<PendingRead> {
  let missing = false;

  for (const delay of READ_RETRY_DELAYS_MS) {
    if (delay > 0) {
      await wait(delay);
    }

    try {
      return { status: "found", bytes: await readStoredFile(key) };
    } catch (error) {
      missing = isMissingObject(error);
      console.error("[books] Could not read pending upload", error);
    }
  }

  return missing ? { status: "missing" } : { status: "unavailable" };
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return errorResponse(401, "Please log in again.");
  }

  const parsed = finishUploadSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return errorResponse(400, "Please check the highlighted fields.", toFieldErrors(parsed.error));
  }

  const userId = session.user.id;
  const { uploadId, title, author, bookcaseId, spineColor } = parsed.data;
  const pendingKey = pendingUploadKey(userId, uploadId);

  const bookcase = await findOwnedBookcase(userId, bookcaseId);

  if (!bookcase) {
    return errorResponse(404, "That bookcase could not be found.");
  }

  const pending = await readPendingUpload(pendingKey);

  if (pending.status === "missing") {
    return errorResponse(400, "We could not find your upload. Please choose the file again.");
  }

  if (pending.status === "unavailable") {
    return errorResponse(503, "Our book storage is a little busy right now. Please press Put on shelf again in a moment.");
  }

  const { bytes } = pending;

  try {
    if (bytes.byteLength > MAX_BOOK_FILE_BYTES) {
      return errorResponse(413, fileTooLargeMessage(bytes.byteLength));
    }

    const usage = await getStorageUsage(userId);

    if (!hasRoomFor(usage, bytes.byteLength)) {
      return errorResponse(413, quotaExceededMessage(bytes.byteLength, usage));
    }

    if (!hasPdfSignature(bytes)) {
      return errorResponse(400, "This file is not a PDF.");
    }

    let pageCount: number;

    try {
      ({ pageCount } = await readPdfInfo(bytes));
    } catch {
      return errorResponse(400, "We could not read this PDF. It may be damaged or protected with a password.");
    }

    const fileKey = bookFileKey(userId, uploadId);
    await saveStoredFile(fileKey, bytes);

    try {
      await createBookForUser({
        id: uploadId,
        fileKey,
        pageCount,
        fileSize: bytes.byteLength,
        userId,
        bookcaseId: bookcase.id,
        title,
        author: author || null,
        spineColor,
      });
    } catch (error) {
      await deleteStoredFile(fileKey);
      throw error;
    }
  } finally {
    await deleteStoredFile(pendingKey);
  }

  revalidatePath("/library");

  return Response.json({ id: uploadId }, { status: 201 });
}