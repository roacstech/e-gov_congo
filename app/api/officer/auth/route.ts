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

export async function GET() {
  try {
    await ensureOfficerSchema();
    const officer = await getAuthenticatedOfficer();

    // Also return available officer directory (excluding passwords) for the login role selector
    const listRes = await query(
      `SELECT id, officer_id, full_name, username, service_id, service_title, ministry, role, role_label_fr, role_label_en, phone, email, is_active
       FROM service_officers
       WHERE is_active = TRUE
       ORDER BY
         CASE
           WHEN role = 'verification_officer' THEN 1
           WHEN role = 'approver_officer' THEN 2
           WHEN role = 'head_of_service' THEN 3
           ELSE 4
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
    const username = String(body.username || "").trim();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    const res = await query(
      `SELECT * FROM service_officers
       WHERE LOWER(username) = LOWER($1) AND is_active = TRUE
       LIMIT 1;`,
      [username]
    );

    if (res.rows.length === 0 || res.rows[0].password !== password) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe officier invalide." },
        { status: 401 }
      );
    }

    const officer = mapDbOfficerRow(res.rows[0]);
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
