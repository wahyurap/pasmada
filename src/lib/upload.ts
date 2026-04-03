import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "public", "uploads");

export async function saveFile(
  file: File,
  subdir: string = "general"
): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subdir);
  await mkdir(dir, { recursive: true });

  const ext = path.extname(file.name);
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(dir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${subdir}/${filename}`;
}

export async function saveMultipleFiles(
  files: File[],
  subdir: string = "general"
): Promise<string[]> {
  return Promise.all(files.map((file) => saveFile(file, subdir)));
}
