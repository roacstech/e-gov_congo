import { NextRequest, NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";
import { query } from "@/lib/db";
import { ensureOfficerSchema } from "@/lib/officer-db";
import {
  createSessionToken,
  getAuthenticatedOfficer,
  mapDbOfficerRow,
  OFFICER_SESSION_COOKIE,
} from "@/lib/officer-auth";

interface RoleCredentialConfig {
  dbUsername: string;
  acceptedPasswords: string[];
}

const ROLE_CREDENTIALS: Record<string, RoleCredentialConfig> = {
  "verification@gov.in": {
    dbUsername: "officer.verifier",
    acceptedPasswords: ["verifier@2026", "Verify@Rdc2026"],
  },
  "verification@gouv.cd": {
    dbUsername: "officer.verifier",
    acceptedPasswords: ["verifier@2026", "Verify@Rdc2026"],
  },
  "verificationofficer@gouv.cd": {
    dbUsername: "officer.verifier",
    acceptedPasswords: ["verifier@2026", "Verify@Rdc2026"],
  },
  "verificationofficer@gov": {
    dbUsername: "officer.verifier",
    acceptedPasswords: ["verifier@2026", "Verify@Rdc2026"],
  },
  "officer.verifier": {
    dbUsername: "officer.verifier",
    acceptedPasswords: ["verifier@2026", "Verify@Rdc2026"],
  },
  "approver@gov.in": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "approvar@gov.in": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "approver@gouv.cd": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "approvar@gouv.cd": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "approverofficer@gov": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "officer.approver": {
    dbUsername: "officer.approver",
    acceptedPasswords: ["approver@2026", "approvar@2026", "Approve@Rdc2026"],
  },
  "head@gov.in": {
    dbUsername: "officer.head",
    acceptedPasswords: ["head@2026", "Head@Rdc2026"],
  },
  "head@gouv.cd": {
    dbUsername: "officer.head",
    acceptedPasswords: ["head@2026", "Head@Rdc2026"],
  },
  "headofservice@gov": {
    dbUsername: "officer.head",
    acceptedPasswords: ["head@2026", "Head@Rdc2026"],
  },
  "officer.head": {
    dbUsername: "officer.head",
    acceptedPasswords: ["head@2026", "Head@Rdc2026"],
  },
  "superadmin@gov.in": {
    dbUsername: "superAdmin@gov",
    acceptedPasswords: ["superadmin@2026", "AdminRDC@2026"],
  },
  "superadmin@gouv.cd": {
    dbUsername: "superAdmin@gov",
    acceptedPasswords: ["superadmin@2026", "AdminRDC@2026"],
  },
  "superadmin@gov": {
    dbUsername: "superAdmin@gov",
    acceptedPasswords: ["superadmin@2026", "AdminRDC@2026"],
  },
  superadmin: {
    dbUsername: "superAdmin@gov",
    acceptedPasswords: ["superadmin@2026", "AdminRDC@2026"],
  },
};

export async function GET() {
  try {
    await ensureOfficerSchema();
    const officer = await getAuthenticatedOfficer();

    const listRes = await query(
      `SELECT id, officer_id, full_name, username, service_id, service_title, ministry, role, role_label_fr, role_label_en, phone, email, is_active
       FROM service_officers
       WHERE is_active = TRUE
       ORDER BY
         CASE
           WHEN role = 'verification_officer' THEN 1
           WHEN role = 'approver_officer' THEN 2
           WHEN role = 'head_of_service' THEN 3
           WHEN role = 'super_admin' THEN 4
           ELSE 5
         END,
         id ASC;`
    );

    const directory = listRes.rows.map(mapDbOfficerRow);

    return NextResponse.json({
      authenticated: Boolean(officer),
      officer,
      directory,
    });
  } catch (err) {
    unstable_rethrow(err);
    console.error("Officer session error:", err);
    return NextResponse.json(
      { error: "Erreur d'authentification du portail agent." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureOfficerSchema();
    const body = await request.json();
    const rawIdentifier = String(body.username || body.email || "").trim();
    const password = String(body.password || "");

    if (!rawIdentifier || !password) {
      return NextResponse.json(
        { error: "Adresse e-mail officielle et mot de passe requis." },
        { status: 400 }
      );
    }

    const normalizedKey = rawIdentifier.toLowerCase().replace(/\s+/g, "");
    const mappedRole = ROLE_CREDENTIALS[normalizedKey];
    const lookupUsername = mappedRole ? mappedRole.dbUsername : rawIdentifier;

    const res = await query(
      `SELECT * FROM service_officers
       WHERE (LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2) OR LOWER(email) = LOWER($2))
         AND is_active = TRUE
       LIMIT 1;`,
      [lookupUsername, rawIdentifier]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { error: "Adresse e-mail ou mot de passe officier invalide." },
        { status: 401 }
      );
    }

    const dbRow = res.rows[0];
    const passwordMatches =
      dbRow.password === password ||
      (mappedRole ? mappedRole.acceptedPasswords.includes(password) : false);

    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Adresse e-mail ou mot de passe officier invalide." },
        { status: 401 }
      );
    }

    const officer = mapDbOfficerRow(dbRow);
    const token = createSessionToken(officer.id, officer.username);

    const response = NextResponse.json({
      success: true,
      officer,
    });

    const isHttps =
      request.nextUrl.protocol === "https:" ||
      request.headers.get("x-forwarded-proto") === "https";

    response.cookies.set(OFFICER_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
      secure: isHttps,
    });

    return response;
  } catch (err) {
    console.error("Officer login error:", err);
    return NextResponse.json(
      { error: "Impossible de connecter l'agent." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(OFFICER_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
