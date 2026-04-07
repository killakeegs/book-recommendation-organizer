import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface BookEmailData {
  title: string;
  author: string | null;
  recommender: string;
  note: string | null;
  coverUrl: string | null;
  amazonUrl: string | null;
}

export async function sendDailyDigest(books: BookEmailData[]) {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  });

  const booksHtml = books
    .map(
      (book) => `
    <div style="margin-bottom:28px;padding:20px;background:#FFF8EF;border-radius:10px;border-left:4px solid #D4872B;font-family:Georgia,serif;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          ${
            book.coverUrl
              ? `<td width="70" valign="top" style="padding-right:16px;">
              <img src="${book.coverUrl}" alt="${book.title}" width="60" style="border-radius:4px;display:block;" />
            </td>`
              : ""
          }
          <td valign="top">
            <p style="margin:0 0 4px 0;font-size:18px;font-weight:bold;color:#2C1810;">${book.title}</p>
            ${book.author ? `<p style="margin:0 0 6px 0;font-size:14px;color:#7A4A2A;">by ${book.author}</p>` : ""}
            <p style="margin:0 0 4px 0;font-size:13px;color:#4A2C1A;">Recommended by: <strong>${book.recommender}</strong></p>
            ${book.note ? `<p style="margin:6px 0;font-size:13px;color:#555;font-style:italic;">"${book.note}"</p>` : ""}
            ${book.amazonUrl ? `<a href="${book.amazonUrl}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#D4872B;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-family:Arial,sans-serif;">Find on Amazon →</a>` : ""}
          </td>
        </tr>
      </table>
    </div>
  `
    )
    .join("");

  await resend.emails.send({
    from: "Book Recommendations <onboarding@resend.dev>",
    to: process.env.DIGEST_EMAIL!,
    subject: `📚 Book Digest — ${books.length} new recommendation${books.length !== 1 ? "s" : ""} (${date})`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#F5ECD7;">
        <h1 style="color:#2C1810;font-size:26px;margin:0 0 8px 0;border-bottom:2px solid #D4872B;padding-bottom:12px;">
          📚 Your Daily Book Digest
        </h1>
        <p style="color:#7A4A2A;font-size:15px;margin:12px 0 24px 0;">
          You received <strong>${books.length} new recommendation${books.length !== 1 ? "s" : ""}</strong> on ${date}.
        </p>
        ${booksHtml}
        <p style="color:#B07050;font-size:12px;margin-top:32px;border-top:1px solid #E3C695;padding-top:16px;">
          This digest is sent daily at 8 PM PST. Happy reading! 📖
        </p>
      </div>
    `,
  });
}
