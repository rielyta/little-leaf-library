"use client";

import { useRouter } from "next/navigation";
import { PasswordRow } from "@/components/profile/PasswordRow";
import { ProfileField, type SaveResult } from "@/components/profile/ProfileField";
import { authClient } from "@/lib/auth-client";
import { nameField, usernameField } from "@/lib/validation/auth";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH } from "@/lib/validation/username";

type ProfileInfoProps = {
  username: string;
  name: string;
  email: string;
  hasPassword: boolean;
  hasGoogle: boolean;
};

export function ProfileInfo({ username, name, email, hasPassword, hasGoogle }: ProfileInfoProps) {
  const router = useRouter();

  async function saveUser(data: { name: string } | { username: string; displayUsername: string }): Promise<SaveResult> {
    const { error } = await authClient.updateUser(data);

    if (error) {
      return { ok: false, error: error.message ?? "We could not save that. Please try again." };
    }

    router.refresh();
    return { ok: true };
  }

  return (
    <section
      aria-labelledby="info-title"
      className="flex min-w-0 flex-[1.3_1_30rem] flex-col rounded-[1.75rem] border-[1.5px] border-[#EADFD2] bg-white p-6.5"
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h2 id="info-title" className="font-display text-xl font-semibold text-ink-strong">
          Profile info
        </h2>
        {hasGoogle && (
          <span className="rounded-full border-[1.5px] border-mist-100 bg-mist-50 px-3 py-1 text-xs font-extrabold text-mist-800">
            Connected with Google
          </span>
        )}
      </div>

      <ProfileField
        id="username"
        label="Username"
        value={username}
        displayValue={`@${username}`}
        editHint={`Letters, numbers and underscores, ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters.`}
        schema={usernameField}
        onSave={(value) => saveUser({ username: value, displayUsername: value })}
      />

      <ProfileField
        id="name"
        label="Name"
        value={name}
        editHint="This is how we greet you in your library."
        schema={nameField}
        onSave={(value) => saveUser({ name: value })}
      />

      <div className="flex flex-col gap-0.5 border-t-[1.5px] border-[#F0E6DA] py-4">
        <span className="text-[13px] font-extrabold text-ink-soft">Email</span>
        <span className="break-words text-[17px] font-bold text-ink-strong">{email}</span>
        <span className="text-[13px] text-ink-soft">Used to log in and to receive password links.</span>
      </div>

      <PasswordRow email={email} hasPassword={hasPassword} />
    </section>
  );
}