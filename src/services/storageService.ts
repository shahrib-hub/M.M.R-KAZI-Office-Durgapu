import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export type StorageKind = "templates" | "generated-pdfs" | "manual-pdf-uploads" | "image-assets";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function extFromMime(mime: string): string {
  if (mime.includes("pdf")) return "pdf";
  if (mime.includes("wordprocessingml")) return "docx";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "bin";
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

export async function saveBase64File(params: {
  base64: string;
  kind: StorageKind;
  mimeType: string;
  suggestedName?: string;
}): Promise<{ fileName: string; relativePath: string; publicUrl: string }> {
  const ext = extFromMime(params.mimeType);
  const safeName = (params.suggestedName || `file-${Date.now()}`)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .toLowerCase();
  const fileName = `${safeName}-${crypto.randomBytes(5).toString("hex")}.${ext}`;

  const dir = path.join(STORAGE_ROOT, params.kind);
  await ensureDir(dir);

  const filePath = path.join(dir, fileName);
  const buffer = Buffer.from(params.base64, "base64");
  await fs.writeFile(filePath, buffer);

  return {
    fileName,
    relativePath: `${params.kind}/${fileName}`,
    publicUrl: `/api/storage/${params.kind}/${fileName}`
  };
}

export async function readFileBuffer(relativePath: string): Promise<Buffer> {
  const absolutePath = path.join(STORAGE_ROOT, relativePath);
  return fs.readFile(absolutePath);
}

export function resolveStoragePath(kind: StorageKind, filename: string): string {
  return path.join(STORAGE_ROOT, kind, filename);
}
