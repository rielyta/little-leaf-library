import { z } from "zod";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from "@/lib/validation/username";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Enter your password"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters`)
      .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters`)
      .regex(USERNAME_PATTERN, "Use letters, numbers and underscores only"),
    name: z.string().trim().min(1, "Enter your name").max(50, "At most 50 characters"),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH, `At most ${PASSWORD_MAX_LENGTH} characters`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;