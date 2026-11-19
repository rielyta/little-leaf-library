import "server-only";

type ResetPasswordEmailInput = {
  name: string;
  url: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function resetPasswordEmail({ name, url }: ResetPasswordEmailInput) {
  const safeName = escapeHtml(name);
  const safeUrl = escapeHtml(url);

  const subject = "Reset your Little Leaf Library password";

  const text = [
    `Hi ${name},`,
    "",
    "We received a request to reset your password. Open the link below to choose a new one:",
    url,
    "",
    "This link expires in 1 hour. If you did not ask for this, you can ignore this email.",
  ].join("\n");

  const html = `
    <div style="background:#FBF6EE;padding:32px 16px;font-family:Arial,sans-serif;color:#5A4636">
      <div style="max-width:480px;margin:0 auto;background:#FFFDF8;border:1.5px solid #5A4636;border-radius:24px;padding:32px">
        <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#4A3929">Little Leaf Library</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hi ${safeName},</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>
        <a href="${safeUrl}" style="display:inline-block;background:#4F7A5B;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">
          Choose a new password
        </a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6E5A4A">
          This link expires in 1 hour. If you did not ask for this, you can ignore this email.
        </p>
      </div>
    </div>
  `;

  return { subject, html, text };
}