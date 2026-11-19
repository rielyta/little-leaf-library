export function maskEmail(email: string) {
  const [local, domain] = email.split("@");

  if (!domain || local.length < 2) {
    return email;
  }

  return `${local[0]}${"*".repeat(Math.min(local.length - 1, 5))}@${domain}`;
}