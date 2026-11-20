import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/validation/auth";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from "@/lib/validation/username";
import { db } from "@/server/db";
import { sendEmail } from "@/server/email";
import { resetPasswordEmail } from "@/server/emails/reset-password";
import { verifyEmailEmail } from "@/server/emails/verify-email";
import { generateUniqueUsername } from "@/server/username";

const RESET_TOKEN_LIFETIME_SECONDS = 60 * 60;
const VERIFY_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24;

const MINUTE = 60;
const HOUR = 60 * MINUTE;

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
  googleClientId && googleClientSecret
    ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
    : {};

function deliver(to: string, email: { subject: string; html: string; text: string }) {
  void sendEmail({ to, ...email }).catch((error) => {
    console.error(`[auth] Could not send "${email.subject}"`, error);
  });
}

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
    resetPasswordTokenExpiresIn: RESET_TOKEN_LIFETIME_SECONDS,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      deliver(user.email, resetPasswordEmail({ name: user.name, url }));
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: VERIFY_TOKEN_LIFETIME_SECONDS,
    sendVerificationEmail: async ({ user, url }) => {
      deliver(user.email, verifyEmailEmail({ name: user.name, url }));
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",
    window: MINUTE,
    max: 100,
    customRules: {
      "/sign-in/email": { window: MINUTE, max: 5 },
      "/sign-in/username": { window: MINUTE, max: 5 },
      "/sign-up/email": { window: HOUR, max: 5 },
      "/request-password-reset": { window: 15 * MINUTE, max: 3 },
      "/send-verification-email": { window: 15 * MINUTE, max: 3 },
      "/get-session": false,
    },
  },

  socialProviders,

  account: {
    accountLinking: {
      enabled: true,
    },
  },

  onAPIError: {
    errorURL: "/auth-error",
  },

  user: {
    additionalFields: {
      avatar: {
        type: "string",
        required: false,
        defaultValue: "cat-0",
        input: false,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const { username: existing } = user as { username?: string | null };

          if (existing) {
            return { data: user };
          }

          const generated = await generateUniqueUsername();
          return { data: { ...user, username: generated, displayUsername: generated } };
        },
      },
    },
  },

  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      usernameValidator: (value) => USERNAME_PATTERN.test(value),
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;