import crypto from "crypto";

const CAPTCHA_SECRET =
  process.env.ENCRYPTION_KEY ||
  "cd_egov_sovereign_aes256_congo_secret_key_2026_drc_identity";

const CAPTCHA_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const CAPTCHA_TTL_MS = 5 * 60 * 1000; // 5 minutes

function signPayload(payloadB64: string): string {
  return crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(payloadB64)
    .digest("hex");
}

function hashAnswer(answer: string, nonce: string): string {
  return crypto
    .createHash("sha256")
    .update(`${answer.trim().toUpperCase()}:${nonce}`)
    .digest("hex");
}

function buildCaptchaSvg(code: string): string {
  const width = 200;
  const height = 60;
  const chars = code.split("");

  const noiseLines = Array.from({ length: 6 }, (_, i) => {
    const x1 = crypto.randomInt(0, width);
    const y1 = crypto.randomInt(0, height);
    const x2 = crypto.randomInt(0, width);
    const y2 = crypto.randomInt(0, height);
    const colors = ["#94a3b8", "#64748b", "#3b82f6", "#10b981"];
    const stroke = colors[i % colors.length];
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.2" opacity="0.45" />`;
  }).join("");

  const noiseDots = Array.from({ length: 24 }, () => {
    const cx = crypto.randomInt(6, width - 6);
    const cy = crypto.randomInt(6, height - 6);
    const r = (crypto.randomInt(10, 22) / 10).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#64748b" opacity="0.35" />`;
  }).join("");

  const textEls = chars
    .map((ch, idx) => {
      const x = 22 + idx * 28 + crypto.randomInt(-3, 4);
      const y = 39 + crypto.randomInt(-5, 6);
      const rot = crypto.randomInt(-18, 19);
      const palette = ["#0f172a", "#0c3b7a", "#065f46", "#1e3a8a", "#334155"];
      const fill = palette[crypto.randomInt(0, palette.length)];
      return `<text x="${x}" y="${y}" fill="${fill}" font-family="monospace, sans-serif" font-size="26" font-weight="800" transform="rotate(${rot} ${x} ${y})">${ch}</text>`;
    })
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="50%" stop-color="#eff6ff"/>
      <stop offset="100%" stop-color="#ecfdf5"/>
    </linearGradient>
    <pattern id="grid" width="12" height="12" patternUnits="userSpaceOnUse">
      <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#cbd5e1" stroke-width="0.6" opacity="0.45"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" rx="8" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" rx="8" fill="url(#grid)"/>
  ${noiseLines}
  ${noiseDots}
  ${textEls}
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg, "utf8").toString("base64")}`;
}

export function createCaptchaChallenge(): {
  challengeToken: string;
  svgDataUrl: string;
} {
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += CAPTCHA_ALPHABET[crypto.randomInt(0, CAPTCHA_ALPHABET.length)];
  }

  const nonce = crypto.randomBytes(12).toString("hex");
  const exp = Date.now() + CAPTCHA_TTL_MS;
  const answerHash = hashAnswer(code, nonce);

  const payloadB64 = Buffer.from(
    JSON.stringify({ h: answerHash, n: nonce, exp }),
    "utf8"
  ).toString("base64url");
  const sig = signPayload(payloadB64);

  return {
    challengeToken: `${payloadB64}.${sig}`,
    svgDataUrl: buildCaptchaSvg(code),
  };
}

export function verifyCaptchaChallenge(
  challengeToken: string,
  userInput: string
): { valid: boolean; reason?: "expired" | "invalid" } {
  if (!challengeToken || !userInput) {
    return { valid: false, reason: "invalid" };
  }

  const parts = challengeToken.split(".");
  if (parts.length !== 2) {
    return { valid: false, reason: "invalid" };
  }

  const [payloadB64, providedSig] = parts;
  const expectedSig = signPayload(payloadB64);

  const sigBufA = Buffer.from(providedSig, "utf8");
  const sigBufB = Buffer.from(expectedSig, "utf8");
  if (
    sigBufA.length !== sigBufB.length ||
    !crypto.timingSafeEqual(sigBufA, sigBufB)
  ) {
    return { valid: false, reason: "invalid" };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    ) as { h: string; n: string; exp: number };

    if (!parsed.exp || Date.now() > parsed.exp) {
      return { valid: false, reason: "expired" };
    }

    const expectedHash = hashAnswer(userInput, parsed.n);
    const hashBufA = Buffer.from(expectedHash, "utf8");
    const hashBufB = Buffer.from(parsed.h, "utf8");
    if (
      hashBufA.length !== hashBufB.length ||
      !crypto.timingSafeEqual(hashBufA, hashBufB)
    ) {
      return { valid: false, reason: "invalid" };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "invalid" };
  }
}
