import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

const fallbackOfficers = [
  {
    officer_id: "OFF-CNI-001",
    full_name: "Agent Baudouin Ilunga",
    username: "officer.cni",
    password: "Cni@Kinshasa2026",
    service_id: "cni-biometrique",
    service_title: "Carte Nationale d'Identité",
    ministry: "Ministère de l'Intérieur, Sécurité et Affaires Coutumières",
    role: "service_officer",
    is_active: true,
  },
  {
    officer_id: "OFF-PAS-002",
    full_name: "Officier Mireille Kapinga",
    username: "officer.passport",
    password: "Pass@Dgm2026",
    service_id: "passeport-ordinaire",
    service_title: "Demande de Passeport Ordinaire",
    ministry: "Ministère des Affaires Étrangères et Coopération Internationale",
    role: "senior_officer",
    is_active: true,
  },
  {
    officer_id: "OFF-PER-003",
    full_name: "Inspecteur Alain Tshilombo",
    username: "officer.driving",
    password: "Permis@Rdc2026",
    service_id: "permis-conduire",
    service_title: "Permis de Conduire Sécurisé",
    ministry: "Ministère des Transports, Voies de Communication et Désenclavement",
    role: "service_officer",
    is_active: true,
  },
  {
    officer_id: "OFF-EC-004",
    full_name: "Officier d'État Civil Jean-Paul Kalala",
    username: "officer.birth",
    password: "EtatCivil@2026",
    service_id: "acte-naissance",
    service_title: "Extrait d'Acte de Naissance",
    ministry: "Ministère de l'Intérieur — Bureau Central d'État Civil",
    role: "registrar",
    is_active: true,
  },
  {
    officer_id: "OFF-NAT-005",
    full_name: "Conseiller Juridique Francine Mukendi",
    username: "officer.nationality",
    password: "Nationalite@2026",
    service_id: "certificat-nationalite",
    service_title: "Certificat de Nationalité Congolaise",
    ministry: "Ministère de la Justice et Garde des Sceaux",
    role: "legal_officer",
    is_active: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Nom d'utilisateur et mot de passe requis." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    try {
      const res = await query(
        "SELECT * FROM service_officers WHERE LOWER(username) = $1 AND is_active = true",
        [cleanUsername]
      );

      if (res.rows.length > 0) {
        const officer = res.rows[0];
        if (officer.password === password) {
          // Remove password before returning
          const { password: _, ...officerSafe } = officer;
          return NextResponse.json({
            success: true,
            officer: officerSafe,
          });
        }
      }
    } catch (dbErr) {
      console.warn("DB login check failed, falling back to local list:", dbErr);
    }

    // Check fallback list
    const fallback = fallbackOfficers.find(
      (o) => o.username.toLowerCase() === cleanUsername && o.password === password
    );

    if (fallback) {
      const { password: _, ...officerSafe } = fallback;
      return NextResponse.json({
        success: true,
        officer: officerSafe,
      });
    }

    return NextResponse.json(
      { error: "Identifiants invalides ou compte inactif." },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error logging in officer:", error);
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}
