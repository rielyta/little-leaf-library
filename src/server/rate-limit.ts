import "server-only";
import { db } from "@/server/db";

export type RateLimitRule = {
  name: string;
  limit: number;
  windowSeconds: number;
};

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const RATE_LIMITS = {
  translatePerMinute: { name: "translate-minute", limit: 20, windowSeconds: MINUTE },
  translatePerDay: { name: "translate-day", limit: 300, windowSeconds: DAY },
  uploadPerHour: { name: "upload-hour", limit: 20, windowSeconds: HOUR },
} satisfies Record<string, RateLimitRule>;

type ConsumeRow = {
  count: number;
  retryAfter: number;
};

type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

async function consume(rule: RateLimitRule, subject: string): Promise<RateLimitResult> {
  const key = `${rule.name}:${subject}`;
  const windowSeconds = rule.windowSeconds;

  const [row] = await db.$queryRaw<ConsumeRow[]>`
    INSERT INTO "request_limit" ("key", "count", "windowStart")
    VALUES (${key}, 1, LOCALTIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "request_limit"."windowStart" <= LOCALTIMESTAMP - make_interval(secs => ${windowSeconds}::double precision) THEN 1
        ELSE "request_limit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "request_limit"."windowStart" <= LOCALTIMESTAMP - make_interval(secs => ${windowSeconds}::double precision) THEN LOCALTIMESTAMP
        ELSE "request_limit"."windowStart"
      END
    RETURNING
      "count",
      CEIL(EXTRACT(EPOCH FROM ("windowStart" + make_interval(secs => ${windowSeconds}::double precision) - LOCALTIMESTAMP)))::int AS "retryAfter"
  `;

  return {
    allowed: row.count <= rule.limit,
    retryAfterSeconds: Math.max(1, row.retryAfter),
  };
}

export async function checkRateLimits(subject: string, rules: RateLimitRule[]): Promise<RateLimitResult> {
  for (const rule of rules) {
    const result = await consume(rule, subject);

    if (!result.allowed) {
      return result;
    }
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function waitLabel(seconds: number) {
  if (seconds < MINUTE) {
    return `${seconds} seconds`;
  }

  const minutes = Math.ceil(seconds / MINUTE);

  if (minutes < 60) {
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }

  const hours = Math.ceil(minutes / 60);
  return hours === 1 ? "1 hour" : `${hours} hours`;
}

export function tooManyRequests(retryAfterSeconds: number, message: string) {
  return Response.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}