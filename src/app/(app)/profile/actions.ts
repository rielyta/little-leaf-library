"use server";

import { revalidatePath } from "next/cache";
import { AVATAR_OPTIONS } from "@/lib/avatars";
import { db } from "@/server/db";
import { requireSession } from "@/server/session";

export async function updateAvatar(avatar: string) {
  if (!AVATAR_OPTIONS.includes(avatar)) {
    return { ok: false as const, error: "That avatar is not available." };
  }

  const { user } = await requireSession();

  await db.user.update({
    where: { id: user.id },
    data: { avatar },
  });

  revalidatePath("/", "layout");

  return { ok: true as const };
}