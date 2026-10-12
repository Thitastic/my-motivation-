import { downloadFile, readFileAsText, safeJSONParse, uid } from "../utils.js";

const CHUNK_SIZE = 700;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

async function sha256(text) {
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(hash))).slice(0, 16);
}

function base64Url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (char) => char.charCodeAt(0));
}

export async function createQRFrames(jsonText) {
  const payload = base64Url(encoder.encode(jsonText));
  const transferId = uid("transfer");
  const chunks = payload.match(new RegExp(`.{1,${CHUNK_SIZE}}`, "g")) || [""];
  const checksum = await sha256(payload);
  return chunks.map((chunk, index) => JSON.stringify({
    type: "kineto-transfer",
    version: 1,
    transferId,
    index,
    total: chunks.length,
    checksum,
    data: chunk
  }));
}

export async function resolveQRFrames(frames) {
  const parsed = frames.map((frame) => typeof frame === "string" ? safeJSONParse(frame) : frame).filter(Boolean);
  if (!parsed.length) throw new Error("Không tìm thấy khung QR hợp lệ.");
  const first = parsed[0];
  if (first.type !== "kineto-transfer") throw new Error("Mã QR này không phải dữ liệu chuyển hồ sơ Kineto.");
  const byIndex = new Map(parsed.map((frame) => [frame.index, frame]));
  const missing = [];
  for (let i = 0; i < first.total; i += 1) {
    if (!byIndex.has(i)) missing.push(i + 1);
  }
  if (missing.length) throw new Error(`Thiếu khung QR ${missing.join(", ")}.`);
  const payload = [...byIndex.values()].sort((a, b) => a.index - b.index).map((frame) => frame.data).join("");
  if (await sha256(payload) !== first.checksum) throw new Error("Xác thực dữ liệu QR thất bại.");
  return decoder.decode(fromBase64Url(payload));
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
  return text;
}
