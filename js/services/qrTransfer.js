import { downloadFile, readFileAsText, safeJSONParse, uid } from "../utils.js";

const CHUNK_SIZE = 850;
const MAX_QR_FRAMES = 48;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function sha256Bytes(bytes) {
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return base64Url(new Uint8Array(hash));
}

async function sha256(text) {
  return sha256Bytes(encoder.encode(text));
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

async function gzip(text) {
  if (!("CompressionStream" in window)) return { compression: "none", bytes: encoder.encode(text) };
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  return { compression: "gzip", bytes };
}

async function gunzip(bytes, compression) {
  if (compression !== "gzip") return decoder.decode(bytes);
  if (!("DecompressionStream" in window)) throw new Error("Trình duyệt này chưa hỗ trợ giải nén bản sao lưu QR.");
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Response(stream).text();
}

export function validateBackupObject(value) {
  if (!value || typeof value !== "object") throw new Error("Dữ liệu sao lưu không hợp lệ.");
  if (!Array.isArray(value.workoutHistory)) throw new Error("Thiếu lịch sử tập luyện trong bản sao lưu.");
  if (!value.xp || typeof value.xp !== "object") throw new Error("Thiếu dữ liệu XP trong bản sao lưu.");
  if (!value.streaks || typeof value.streaks !== "object") throw new Error("Thiếu dữ liệu chuỗi tập trong bản sao lưu.");
  return value;
}

export async function createQRFrames(jsonText) {
  const raw = safeJSONParse(jsonText);
  validateBackupObject(raw);
  const transferId = uid("transfer");
  const { compression, bytes } = await gzip(jsonText);
  const encoded = base64Url(bytes);
  const checksum = await sha256Bytes(bytes);
  const chunks = encoded.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [""];
  if (chunks.length > MAX_QR_FRAMES) {
    const error = new Error("Hồ sơ quá lớn để chuyển bằng QR một cách thực tế.");
    error.code = "QR_TOO_LARGE";
    error.frameCount = chunks.length;
    throw error;
  }
  const frames = chunks.map((chunk, index) => JSON.stringify({
    type: "kineto-transfer",
    schemaVersion: 2,
    transferId,
    index,
    total: chunks.length,
    checksum,
    compression,
    byteLength: bytes.byteLength,
    createdAt: new Date().toISOString(),
    data: chunk
  }));
  frames.transferId = transferId;
  frames.byteLength = bytes.byteLength;
  frames.compression = compression;
  return frames;
}

export async function resolveQRFrames(frames) {
  const parsed = frames.map((frame) => typeof frame === "string" ? safeJSONParse(frame) : frame).filter(Boolean);
  if (!parsed.length) throw new Error("Không tìm thấy khung QR hợp lệ.");
  const first = parsed[0];
  if (first.type !== "kineto-transfer") throw new Error("Mã QR này không phải dữ liệu chuyển hồ sơ Kineto.");
  const sameTransfer = parsed.filter((frame) => frame.transferId === first.transferId);
  const byIndex = new Map();
  sameTransfer.forEach((frame) => {
    if (Number.isInteger(frame.index) && frame.index >= 0 && frame.index < frame.total) byIndex.set(frame.index, frame);
  });
  const missing = [];
  for (let i = 0; i < first.total; i += 1) {
    if (!byIndex.has(i)) missing.push(i + 1);
  }
  if (missing.length) {
    const error = new Error(`Thiếu khung QR ${missing.join(", ")}.`);
    error.missing = missing;
    throw error;
  }
  const encoded = [...byIndex.values()].sort((a, b) => a.index - b.index).map((frame) => frame.data).join("");

  if (first.schemaVersion === 2) {
    const bytes = fromBase64Url(encoded);
    if (await sha256Bytes(bytes) !== first.checksum) throw new Error("Xác thực dữ liệu QR thất bại.");
    return gunzip(bytes, first.compression);
  }

  if (await sha256(encoded) !== first.checksum) throw new Error("Xác thực dữ liệu QR thất bại.");
  return decoder.decode(fromBase64Url(encoded));
}

export function exportJSON(filename, jsonText) {
  downloadFile(filename, "application/json", jsonText);
}

export async function encryptBackup(jsonText, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"]
  );
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(jsonText));
  return JSON.stringify({
    type: "kineto-encrypted-backup",
    version: 1,
    salt: base64Url(salt),
    iv: base64Url(iv),
    data: base64Url(new Uint8Array(cipher))
  }, null, 2);
}

export async function decryptBackup(text, password) {
  const payload = safeJSONParse(text);
  if (!payload || payload.type !== "kineto-encrypted-backup") throw new Error("Tệp sao lưu mã hóa không được hỗ trợ.");
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: fromBase64Url(payload.salt), iterations: 150000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64Url(payload.iv) }, key, fromBase64Url(payload.data));
  return decoder.decode(plain);
}

export async function parseBackupFile(file, password = "") {
  const text = await readFileAsText(file);
  const parsed = safeJSONParse(text);
  if (parsed?.type === "kineto-encrypted-backup") return decryptBackup(text, password);
  validateBackupObject(parsed);
  return text;
}
