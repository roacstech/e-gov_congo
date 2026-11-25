import crypto from "crypto";

// 32-byte (256-bit) encryption key from environment variable or secure server secret
const RAW_KEY =
  process.env.ENCRYPTION_KEY ||
  "cd_egov_sovereign_aes256_congo_secret_key_2026_drc_identity";

// Ensure exactly 32 bytes using SHA-256
const ENCRYPTION_KEY = crypto.createHash("sha256").update(RAW_KEY).digest();
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for AES-GCM

/**
 * Encrypts a string using AES-256-GCM authenticated encryption.
 * Output format: enc:gcm:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptAES256(text: string | null | undefined): string {
  if (!text) return "";
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return `enc:gcm:${iv.toString("hex")}:${tag}:${encrypted}`;
  } catch (err) {
    console.error("AES-256 Encryption error:", err);
    return text;
  }
}

/**
 * Decrypts an AES-256-GCM encrypted string.
 * Gracefully returns original text if it's not encrypted or has legacy format.
 */
export function decryptAES256(encryptedText: string | null | undefined): string {
  if (!encryptedText) return "";
  if (!encryptedText.startsWith("enc:gcm:")) {
    return encryptedText; // not encrypted or legacy plain text
  }

  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 5) return encryptedText;

    const [, , ivHex, tagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(cipherHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.error("AES-256 Decryption error:", err);
    return encryptedText;
  }
}

/**
 * Generates a deterministic SHA-256 hash (Blind Index)
 * Allows fast O(1) database lookups on encrypted columns without exposing plaintext.
 */
export function hashSHA256(text: string | null | undefined): string {
  if (!text) return "";
  return crypto.createHash("sha256").update(text.trim()).digest("hex");
}
