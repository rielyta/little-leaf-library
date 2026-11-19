import "server-only";

type EmailContent = {
  name: string;
  intro: string;
  buttonLabel: string;
  url: string;
  footnote: string;
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderEmail({ name, intro, buttonLabel, url, footnote }: EmailContent) {
  const text = [`Hi ${name},`, "", intro, url, "", footnote].join("\n");

  const html = `
    <div style="background:#FBF6EE;padding:32px 16px;font-family:Arial,sans-serif;color:#5A4636">
      <div style="max-width:480px;margin:0 auto;background:#FFFDF8;border:1.5px solid #5A4636;border-radius:24px;padding:32px">
        <p style="margin:0 0 8px;font-size:20px;font-weight:bold;color:#4A3929">Little Leaf Library</p>
        <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Hi ${escapeHtml(name)},</p>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6">${escapeHtml(intro)}</p>
        <a href="${escapeHtml(url)}" style="display:inline-block;background:#4F7A5B;color:#FFFFFF;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">
          ${escapeHtml(buttonLabel)}
        </a>
        <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6E5A4A">${escapeHtml(footnote)}</p>
      </div>
    </div>
  `;

  return { html, text };
}