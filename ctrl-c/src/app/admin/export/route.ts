import { getAdminSession } from "@/lib/admin-auth";
import { statusLabel } from "@/lib/interest";
import { listSubmissions } from "@/lib/submissions";

function cell(value: string) {
  // Leading = + - @ would be run as a formula by spreadsheet apps.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await getAdminSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rows = (await listSubmissions()).map((s) =>
    [
      s.createdAt,
      s.name,
      s.email,
      s.phone ?? "",
      s.linkedin ?? "",
      s.website ?? "",
      s.resume ?? "",
      s.interests.join("; "),
      s.message,
      statusLabel[s.status],
      s.note,
      s.id,
    ]
      .map(cell)
      .join(","),
  );
  const header = ["Received", "Name", "Email", "Phone", "LinkedIn", "Website", "Resume", "Interests", "Message", "Status", "Note", "ID"]
    .map(cell)
    .join(",");
  const date = new Date().toISOString().slice(0, 10);

  return new Response(`\uFEFF${[header, ...rows].join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ctrl-c-submissions-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
