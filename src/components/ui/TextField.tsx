import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string;
  labelAside?: ReactNode;
};

export function TextField({ label, name, error, labelAside, id, className, ...props }: TextFieldProps) {
  const inputId = id ?? name;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={inputId} className="text-sm font-bold">
          {label}
        </label>
        {labelAside}
      </div>
      <input
        id={inputId}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-12 w-full rounded-2xl border-[1.5px] bg-white px-4 text-[15px] text-ink outline-none transition-colors",
          "placeholder:text-ink-faint focus:border-sage-600",
          error ? "border-danger" : "border-line",
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-[13px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  );
}