import { NextRequest, NextResponse } from "next/server";

const SUPER_ADMIN_CREDENTIALS = {
  username: process.env.SUPER_ADMIN_USERNAME || "superadmin",
  password: process.env.SUPER_ADMIN_PASSWORD || "AdminRDC@2026",
  alternateUsername: "admin.rdc",
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Identifiant et mot de passe requis." },
        { status: 400 }
      );
    }

    const cleanUser = username.trim().toLowerCase();

    if (
      (cleanUser === SUPER_ADMIN_CREDENTIALS.username.toLowerCase() ||
        cleanUser === SUPER_ADMIN_CREDENTIALS.alternateUsername.toLowerCase()) &&
      password === SUPER_ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json({
        success: true,
        user: {
          username: cleanUser,
          fullName: "Super Administrateur — Portail National RDC",
          role: "super_admin",
          jurisdiction: "Présidence de la République & Primature",
          loginTime: new Date().toISOString(),
          permissions: [
            "services:read",
            "services:write",
            "officers:create",
            "officers:read",
            "officers:update",
            "officers:delete",
            "applications:audit",
            "system:configure",
          ],
        },
      });
    }

    return NextResponse.json(
      { error: "Identifiants Super Admin incorrects." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Super admin login error:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
