import { cn } from "@/lib/cn";

type FormAlertProps = {
  message: string | null;
  tone?: "error" | "success";
};

const toneClasses = {
  error: "border-blush-300 bg-blush-50 text-danger",
  success: "border-sage-200 bg-sage-50 text-sage-700",
};

export function FormAlert({ message, tone = "error" }: FormAlertProps) {
  if (!message) {
    return null;
  }

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-2xl border-[1.5px] px-4 py-3 text-sm font-semibold leading-relaxed", toneClasses[tone])}
    >
      {message}
    </p>
  );
}