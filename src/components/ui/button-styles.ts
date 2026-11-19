import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "soft" | "outline" | "plain";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-sage-600 bg-sage-600 text-white hover:border-sage-700 hover:bg-sage-700",
  soft: "border-blush-300 bg-blush-100 text-ink hover:bg-blush-200",
  outline: "border-ink bg-transparent text-ink hover:bg-paper",
  plain: "border-line bg-white text-ink hover:bg-paper",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-13 px-7 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] font-extrabold transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
    "disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}