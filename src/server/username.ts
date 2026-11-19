import "server-only";
import { randomInt } from "node:crypto";
import { db } from "@/server/db";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const GENERATED_LENGTH = 10;
const MAX_ATTEMPTS = 5;

function randomUsername() {
  let value = "";

  while (!/[a-z]/.test(value) || !/\d/.test(value)) {
    value = Array.from({ length: GENERATED_LENGTH }, () => ALPHABET[randomInt(ALPHABET.length)]).join("");
  }

  return value;
}

export async function generateUniqueUsername() {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = randomUsername();
    const taken = await db.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!taken) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique username");
}