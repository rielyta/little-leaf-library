import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { hasPdfSignature, MAX_PDF_BYTES, MAX_PDF_LABEL } from "@/lib/books";
import { readPdfInfo } from "@/lib/pdf-info";
import { bookSchema } from "@/lib/validation/book";
import { toFieldErrors } from "@/lib/validation/errors";
import { findOwnedBookcase } from "@/server/bookcases";
import { createBookForUser } from "@/server/books";
import { bookFileKey, deleteStoredFile, saveStoredFile } from "@/server/storage";

function errorResponse(status: number, error: string, fieldErrors?: Record<string, string | undefined>) {
  return Response.json({ error, fieldErrors }, { status });
}

function textField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return errorResponse(401, "Please log in again.");
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return errorResponse(400, "Choose a PDF file to upload.");
  }

  if (file.size > MAX_PDF_BYTES) {
    return errorResponse(413, `PDF files can be up to ${MAX_PDF_LABEL}.`);
  }

  const parsed = bookSchema.safeParse({
    title: textField(formData, "title"),
    author: textField(formData, "author"),
    bookcaseId: textField(formData, "bookcaseId"),
    spineColor: textField(formData, "spineColor"),
  });

  if (!parsed.success) {
    return errorResponse(400, "Please check the highlighted fields.", toFieldErrors(parsed.error));
  }

  const bookcase = await findOwnedBookcase(session.user.id, parsed.data.bookcaseId);

  if (!bookcase) {
    return errorResponse(404, "That bookcase could not be found.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!hasPdfSignature(bytes)) {
    return errorResponse(400, "This file is not a PDF.");
  }

  let pageCount: number;

  try {
    ({ pageCount } = await readPdfInfo(bytes));
  } catch {
    return errorResponse(400, "We could not read this PDF. It may be damaged or protected with a password.");
  }

  const id = randomUUID();
  const fileKey = bookFileKey(session.user.id, id);

  await saveStoredFile(fileKey, bytes);

  try {
    await createBookForUser({
      id,
      fileKey,
      pageCount,
      fileSize: file.size,
      userId: session.user.id,
      bookcaseId: bookcase.id,
      title: parsed.data.title,
      author: parsed.data.author || null,
      spineColor: parsed.data.spineColor,
    });
  } catch (error) {
    await deleteStoredFile(fileKey);
    throw error;
  }

  revalidatePath("/library");

  return Response.json({ id }, { status: 201 });
}