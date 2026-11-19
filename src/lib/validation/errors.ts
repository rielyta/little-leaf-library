import { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function toFieldErrors<T>(error: z.ZodError<T>): FieldErrors<T> {
  const { fieldErrors } = z.flattenError(error);

  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, (messages as string[] | undefined)?.[0]]),
  ) as FieldErrors<T>;
}