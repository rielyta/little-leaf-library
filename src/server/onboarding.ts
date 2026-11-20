import "server-only";
import { db } from "@/server/db";

export async function hasFinishedOnboarding(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardedAt: true },
  });

  return Boolean(user?.onboardedAt);
}

export async function markOnboardingFinished(userId: string) {
  await db.user.updateMany({
    where: { id: userId, onboardedAt: null },
    data: { onboardedAt: new Date() },
  });
}