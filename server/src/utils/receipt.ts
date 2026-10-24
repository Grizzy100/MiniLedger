import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env";
import { AppError } from "./AppError";

export type ReceiptFile = {
  buffer: Buffer;
  mimetype: string;
};

export type StoredReceipt = {
  relativePath: string;
  mimetype: "image/jpeg" | "image/png";
};

function getReceiptType(buffer: Buffer): StoredReceipt["mimetype"] | null {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  return null;
}

export async function storeReceipt(file: ReceiptFile): Promise<StoredReceipt> {
  const mimetype = getReceiptType(file.buffer);
  if (!mimetype) {
    throw new AppError("UNSUPPORTED_FILE_TYPE", 415, "Receipt must be a JPEG or PNG image");
  }

  const extension = mimetype === "image/jpeg" ? "jpg" : "png";
  const filename = `${randomUUID()}.${extension}`;
  await mkdir(env.UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(env.UPLOAD_DIR, filename), file.buffer, { flag: "wx" });

  return { relativePath: filename, mimetype };
}

export async function deleteReceipt(relativePath: string) {
  await unlink(path.join(env.UPLOAD_DIR, relativePath)).catch(() => undefined);
}

export async function readReceipt(relativePath: string) {
  const safePath = path.basename(relativePath);
  if (safePath !== relativePath) {
    throw new AppError("RECEIPT_NOT_FOUND", 404, "Receipt not found");
  }

  return readFile(path.join(env.UPLOAD_DIR, safePath));
}

export function receiptMimeType(relativePath: string) {
  return path.extname(relativePath).toLowerCase() === ".png"
    ? "image/png"
    : "image/jpeg";
}
