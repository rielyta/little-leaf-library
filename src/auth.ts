import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_PATTERN } from "@/lib/validation/username";
import { db } from "@/server/db";
import { generateUniqueUsername } from "@/server/username";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders =
  googleClientId && googleClientSecret
    ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
    : {};

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  socialProviders,

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