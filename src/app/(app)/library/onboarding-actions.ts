"use server";

import { markOnboardingFinished } from "@/server/onboarding";
import { requireSession } from "@/server/session";

export async function finishOnboarding() {
  const { user } = await requireSession();
  await markOnboardingFinished(user.id);
}