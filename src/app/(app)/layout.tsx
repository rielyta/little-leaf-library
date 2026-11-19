import type { ReactNode } from "react";
import { requireSession } from "@/server/session";

export default async function AppLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireSession();

  return <>{children}</>;
}