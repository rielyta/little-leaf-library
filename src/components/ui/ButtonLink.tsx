import Link from "next/link";
import type { ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "@/components/ui/button-styles";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function ButtonLink({ href, children, variant, size, className }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}