import "server-only";
import { mkdir, readFile, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const STORAGE_ROOT = path.join(process.cwd(), "storage");
const READ_URL_TTL_SECONDS = 300;
const UPLOAD_URL_TTL_SECONDS = 600;

type StoredBytes = Uint8Array<ArrayBuffer>;

type StorageDriver = {
  save: (key: string, bytes: Uint8Array) => Promise<void>;
  read: (key: string) => Promise<StoredBytes>;
  remove: (key: string) => Promise<void>;
  removeFolder: (prefix: string) => Promise<void>;
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
  async removeFolder(prefix) {
    await rm(resolveLocalKey(prefix), { recursive: true, force: true });
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

function createS3Driver(): StorageDriver {
  const bucket = requireEnv("S3_BUCKET");
  const client = new S3Client({
    endpoint: requireEnv("S3_ENDPOINT"),
    region: requireEnv("S3_REGION"),
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
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
    async removeFolder(prefix) {
      let continuationToken: string | undefined;

      do {
        const page = await client.send(
          new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }),
        );
        const objects = (page.Contents ?? []).flatMap((object) => (object.Key ? [{ Key: object.Key }] : []));

        if (objects.length > 0) {
          await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: objects, Quiet: true } }));
        }

        continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
      } while (continuationToken);
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
  driver ??= isRemoteStorage() ? createS3Driver() : localDriver;
  return driver;
}

export function isRemoteStorage() {
  return process.env.STORAGE_DRIVER === "s3";
}

export function bookFileKey(userId: string, bookId: string) {
  return `books/${userId}/${bookId}.pdf`;
}

export function pendingUploadKey(userId: string, uploadId: string) {
  return `${pendingFolder(userId)}${uploadId}.pdf`;
}

export function pendingFolder(userId: string) {
  return `pending/${userId}/`;
}

export function userStoragePrefixes(userId: string) {
  return [`books/${userId}/`, pendingFolder(userId)];
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

export async function deleteStoredFolder(prefix: string) {
  await storage().removeFolder(prefix);
}

export async function getStoredFileUrl(key: string, fileName: string) {
  return storage().signedUrl(key, fileName);
}

export async function getUploadUrl(key: string) {
  return storage().uploadUrl(key);
}