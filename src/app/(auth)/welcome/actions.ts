"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { requireSession } from "@/server/session";
import { generateUniqueUsername } from "@/server/username";

export async function regenerateUsername() {
  const session = await requireSession();
  const username = await generateUniqueUsername();

  await db.user.update({
    where: { id: session.user.id },
    data: { username, displayUsername: username },
  });

  revalidatePath("/welcome");
}