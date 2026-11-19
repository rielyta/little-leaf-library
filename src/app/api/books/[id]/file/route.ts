import { auth } from "@/auth";
import { findOwnedBook } from "@/server/books";
import { readStoredFile } from "@/server/storage";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const book = await findOwnedBook(session.user.id, id);

  if (!book) {
    return new Response("Not found", { status: 404 });
  }

  const bytes = await readStoredFile(book.fileKey);

  return new Response(bytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `inline; filename="${encodeURIComponent(book.title)}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}