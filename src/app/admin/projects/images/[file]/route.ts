import { readFile } from "node:fs/promises";
import path from "node:path";
import { getAdminSession } from "@/lib/admin-auth";
import { IMAGE_DIR, IMAGE_NAME, getProjectImage } from "@/lib/projects";

const CONTENT_TYPE: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await getAdminSession())) return new Response("Unauthorized", { status: 401 });

  const { file } = await params;
  if (!IMAGE_NAME.test(file)) return new Response("Not found", { status: 404 });

  const ext = file.split(".").pop()!;
  const headers = {
    "Content-Type": CONTENT_TYPE[ext] ?? "application/octet-stream",
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  };

  try {
    const bytes = await readFile(path.join(IMAGE_DIR, file));
    return new Response(bytes, { headers });
  } catch {
    // If local file is missing, fallback to Firestore
    const id = file.split(".")[0];
    const buffer = await getProjectImage(id);
    if (buffer) {
      return new Response(new Uint8Array(buffer), { headers });
    }
    return new Response("Not found", { status: 404 });
  }
}
