import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdminSession } from "@/lib/admin-auth";
import { RESUME_DIR, RESUME_NAME, getResumeData } from "@/lib/submissions";

const CONTENT_TYPE: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const { file } = await params;
  if (!RESUME_NAME.test(file)) return new Response("Not found", { status: 404 });

  const ext = file.split(".").pop()!;
  const headers = {
    "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${file}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    const bytes = await readFile(path.join(RESUME_DIR, file));
    return new Response(bytes, { headers });
  } catch {
    const id = file.split(".")[0];
    const buffer = await getResumeData(id);
    if (buffer) {
      return new Response(new Uint8Array(buffer), { headers });
    }
    return new Response("Not found", { status: 404 });
  }
}
