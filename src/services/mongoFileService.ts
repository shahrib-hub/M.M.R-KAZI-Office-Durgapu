import mongoose from "mongoose";
import { Readable } from "stream";

function getBucket() {
  if (!mongoose.connection?.db) {
    throw new Error("MongoDB is not connected");
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: "uploads" });
}

export async function uploadBase64ToMongoFile(params: {
  fileBase64: string;
  filename: string;
  mimeType: string;
  metadata?: Record<string, any>;
}): Promise<mongoose.Types.ObjectId> {
  const bucket = getBucket();
  const buffer = Buffer.from(params.fileBase64, "base64");

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(params.filename, {
      metadata: { ...(params.metadata ?? {}), mimeType: params.mimeType }
    });

    Readable.from(buffer)
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream.id as mongoose.Types.ObjectId));
  });
}

export async function downloadMongoFile(fileId: string) {
  const bucket = getBucket();
  const id = new mongoose.Types.ObjectId(fileId);

  const files = await bucket.find({ _id: id }).toArray();
  if (!files.length) {
    throw new Error("File not found");
  }

  return new Promise<{ buffer: Buffer; fileName: string; mimeType: string }>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = bucket.openDownloadStream(id);

    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => {
      resolve({
        buffer: Buffer.concat(chunks),
        fileName: files[0].filename,
        mimeType: String((files[0] as any).metadata?.mimeType || "application/octet-stream")
      });
    });
  });
}
