import Link from "next/link";
import { cn } from "@/lib/cn";

type AuthTabsProps = {
  active: "login" | "register";
};

const tabs = [
  { key: "login", href: "/login", label: "Log in" },
  { key: "register", href: "/register", label: "Sign up" },
] as const;

export function AuthTabs({ active }: AuthTabsProps) {
  return (
    <nav aria-label="Log in or sign up" className="flex gap-1 rounded-full bg-[#F3EADF] p-1.5">
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11.5 flex-1 items-center justify-center rounded-full text-[15px] font-extrabold transition-colors",
              isActive ? "bg-white shadow-[0_2px_0_var(--color-line)]" : "hover:bg-white/60",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}