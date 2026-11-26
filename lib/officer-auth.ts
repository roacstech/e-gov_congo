import crypto from "crypto";
import { cookies } from "next/headers";
import { query } from "@/lib/db";
import { ensureOfficerSchema } from "@/lib/officer-db";
import { OfficerProfile, OfficerRoleTier } from "@/types";

export const OFFICER_SESSION_COOKIE = "egov_officer_session";

const SESSION_SECRET =
  process.env.OFFICER_SESSION_SECRET ||
  process.env.ENCRYPTION_KEY ||
  "cd_egov_officer_portal_hmac_secret_2026_sovereign";

export function normalizeOfficerTier(rawRole: string | null | undefined): OfficerRoleTier {
  const role = (rawRole || "").trim().toLowerCase();
  if (role === "super_admin" || role === "superadmin" || role === "admin") {
    return "super_admin";
  }
  if (
    role === "head_of_service" ||
    role === "head_officer" ||
    role === "director" ||
    role === "chef_de_service"
  ) {
    return "head_of_service";
  }
  if (
    role === "approver_officer" ||
    role === "approvar_officer" ||
    role === "senior_officer" ||
    role === "legal_officer"
  ) {
    return "approver_officer";
  }
  return "verification_officer";
}

export function getRoleLabels(tier: OfficerRoleTier): { fr: string; en: string } {
  switch (tier) {
    case "verification_officer":
      return {
        fr: "1. Officier de Vérification",
        en: "1. Verification Officer",
      };
    case "approver_officer":
      return {
        fr: "2. Officier d'Approbation",
        en: "2. Approver Officer",
      };
    case "head_of_service":
      return {
        fr: "3. Chef de Service",
        en: "3. Head of Service Officer",
      };
    case "super_admin":
      return {
        fr: "4. Super Administrateur",
        en: "4. Super Admin",
      };
  }
}

export function mapDbOfficerRow(row: Record<string, unknown>): OfficerProfile {
  const rawRole = String(row.role || "verification_officer");
  const roleTier = normalizeOfficerTier(rawRole);
  const labels = getRoleLabels(roleTier);

  return {
    id: Number(row.id),
    officerId: String(row.officer_id),
    fullName: String(row.full_name),
    username: String(row.username),
    serviceId: String(row.service_id || "all"),
    serviceTitle: String(row.service_title || ""),
    ministry: String(row.ministry || ""),
    rawRole,
    roleTier,
    roleLabelFr: String(row.role_label_fr || labels.fr),
    roleLabelEn: String(row.role_label_en || labels.en),
    phone: row.phone ? String(row.phone) : null,
    email: row.email ? String(row.email) : null,
    signatureData: row.signature_data ? String(row.signature_data) : null,
  };
}

export function createSessionToken(officerId: number, username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      id: officerId,
      username,
      exp: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(
  token: string | undefined | null
): { id: number; username: string } | null {
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expectedSig = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.id || !parsed.username || (parsed.exp && Date.now() > parsed.exp)) {
      return null;
    }
    return { id: Number(parsed.id), username: String(parsed.username) };
  } catch {
    return null;
  }
}

export async function getAuthenticatedOfficer(): Promise<OfficerProfile | null> {
  await ensureOfficerSchema();
  const cookieStore = await cookies();
  const token = cookieStore.get(OFFICER_SESSION_COOKIE)?.value;
  const decoded = verifySessionToken(token);
  if (!decoded) return null;

  const res = await query(
    `SELECT * FROM service_officers WHERE id = $1 AND is_active = TRUE LIMIT 1;`,
    [decoded.id]
  );
  if (res.rows.length === 0) return null;
  return mapDbOfficerRow(res.rows[0]);
}
