import "server-only";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const STORAGE_ROOT = path.join(process.cwd(), "storage");
const READ_URL_TTL_SECONDS = 300;
const UPLOAD_URL_TTL_SECONDS = 600;

type StoredBytes = Uint8Array<ArrayBuffer>;

type StorageDriver = {
  save: (key: string, bytes: Uint8Array) => Promise<void>;
  read: (key: string) => Promise<StoredBytes>;
  remove: (key: string) => Promise<void>;
  signedUrl: (key: string, fileName: string) => Promise<string | null>;
  uploadUrl: (key: string) => Promise<string | null>;
};

function contentTypeFor(key: string) {
  return key.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
}

export function inlineDisposition(fileName: string) {
  return `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}

function resolveLocalKey(key: string) {
  const fullPath = path.resolve(STORAGE_ROOT, key);

  if (!fullPath.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error("Invalid storage key");
  }

  return fullPath;
}

const localDriver: StorageDriver = {
  async save(key, bytes) {
    const fullPath = resolveLocalKey(key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, bytes);
  },
  async read(key) {
    return new Uint8Array(await readFile(resolveLocalKey(key)));
  },
  async remove(key) {
    await unlink(resolveLocalKey(key)).catch(() => undefined);
  },
  async signedUrl() {
    return null;
  },
  async uploadUrl() {
    return null;
  },
};

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

function createR2Driver(): StorageDriver {
  const bucket = requireEnv("R2_BUCKET");
  const client = new S3Client({
    region: "auto",
    endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  return {
    async save(key, bytes) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentTypeFor(key),
        }),
      );
    },
    async read(key) {
      const object = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));

      if (!object.Body) {
        throw new Error("Stored file is empty");
      }

      return new Uint8Array(await object.Body.transformToByteArray());
    },
    async remove(key) {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => undefined);
    },
    async signedUrl(key, fileName) {
      return getSignedUrl(
        client,
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
          ResponseContentType: contentTypeFor(key),
          ResponseContentDisposition: inlineDisposition(fileName),
          ResponseCacheControl: "private, no-store",
        }),
        { expiresIn: READ_URL_TTL_SECONDS },
      );
    },
    async uploadUrl(key) {
      return getSignedUrl(
        client,
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: contentTypeFor(key),
        }),
        { expiresIn: UPLOAD_URL_TTL_SECONDS },
      );
    },
  };
}

let driver: StorageDriver | null = null;

function storage() {
  driver ??= isRemoteStorage() ? createR2Driver() : localDriver;
  return driver;
}

export function isRemoteStorage() {
  return process.env.STORAGE_DRIVER === "r2";
}

export function bookFileKey(userId: string, bookId: string) {
  return `books/${userId}/${bookId}.pdf`;
}

export function pendingUploadKey(userId: string, uploadId: string) {
  return `pending/${userId}/${uploadId}.pdf`;
}

export async function saveStoredFile(key: string, bytes: Uint8Array) {
  await storage().save(key, bytes);
}

export async function readStoredFile(key: string) {
  return storage().read(key);
}

export async function deleteStoredFile(key: string) {
  await storage().remove(key);
}

export async function getStoredFileUrl(key: string, fileName: string) {
  return storage().signedUrl(key, fileName);
}

export async function getUploadUrl(key: string) {
  return storage().uploadUrl(key);
}