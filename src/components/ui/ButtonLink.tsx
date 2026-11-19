import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "soft" | "outline";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "border-sage-600 bg-sage-600 text-white hover:border-sage-700 hover:bg-sage-700",
  soft: "border-blush-300 bg-blush-100 text-ink hover:bg-blush-200",
  outline: "border-ink bg-transparent text-ink hover:bg-paper",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-13 px-7 text-base",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] font-extrabold transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}