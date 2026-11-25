import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatMarriageRow(row: Record<string, unknown>) {
  return {
    ...row,
    tracking_id: decryptAES256(row.tracking_id as string),
    act_number: row.act_number
      ? decryptAES256(row.act_number as string)
      : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trackingId,
      serviceId = "acte-mariage",
      serviceTitle = "Certificat d'Enregistrement de Mariage",
      groomFullName,
      groomBirthDate,
      groomBirthPlace,
      groomNationality = "Congolaise",
      groomIdNumber,
      groomOccupation,
      groomResidence,
      groomFatherName,
      groomMotherName,
      brideFullName,
      brideBirthDate,
      brideBirthPlace,
      brideNationality = "Congolaise",
      brideIdNumber,
      brideOccupation,
      brideResidence,
      brideFatherName,
      brideMotherName,
      marriageDate,
      matrimonialRegime = "Communauté réduite aux acquêts",
      civilRegistryOffice,
      registrationCity = "Kinshasa",
      phone,
      email,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (!trackingId || !groomFullName || !brideFullName || !marriageDate || !phone || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (référence, époux, épouse, date de mariage, contact)" },
        { status: 400 }
      );
    }

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO marriage_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        groom_full_name,
        groom_birth_date,
        groom_birth_place,
        groom_nationality,
        groom_id_number,
        groom_occupation,
        groom_residence,
        groom_father_name,
        groom_mother_name,
        bride_full_name,
        bride_birth_date,
        bride_birth_place,
        bride_nationality,
        bride_id_number,
        bride_occupation,
        bride_residence,
        bride_father_name,
        bride_mother_name,
        marriage_date,
        matrimonial_regime,
        civil_registry_office,
        registration_city,
        phone,
        email,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      )
      RETURNING *;
    `;

    const values = [
      encryptedTrackingId,
      trackingIdHash,
      serviceId,
      serviceTitle,
      groomFullName.trim(),
      groomBirthDate || "1990-01-01",
      groomBirthPlace || "Kinshasa",
      groomNationality,
      groomIdNumber || "NIN-CD-1990-089231",
      groomOccupation || "Cadre d'Entreprise",
      groomResidence || "Kinshasa - Gombe",
      groomFatherName || "—",
      groomMotherName || "—",
      brideFullName.trim(),
      brideBirthDate || "1994-01-01",
      brideBirthPlace || "Kinshasa",
      brideNationality,
      brideIdNumber || "NIN-CD-1994-071420",
      brideOccupation || "Enseignante",
      brideResidence || "Kinshasa - Gombe",
      brideFatherName || "—",
      brideMotherName || "—",
      marriageDate,
      matrimonialRegime,
      civilRegistryOffice || "Kinshasa - Maison Communale de la Gombe",
      registrationCity,
      phone,
      email,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatMarriageRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande de certificat de mariage enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement de l'acte de mariage:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande de certificat de mariage", details: errMsg },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get("trackingId");
    const status = searchParams.get("status");

    if (trackingId) {
      const trackingIdHash = hashSHA256(trackingId.trim());
      const res = await query(
        `SELECT * FROM marriage_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Demande de certificat de mariage introuvable." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        application: formatMarriageRow(res.rows[0]),
      });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM marriage_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 50;`,
        [status]
      );
      const applications = res.rows.map(formatMarriageRow);
      return NextResponse.json({ success: true, count: applications.length, applications });
    }

    const res = await query(
      `SELECT * FROM marriage_applications ORDER BY created_at DESC LIMIT 50;`
    );
    const applications = res.rows.map(formatMarriageRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur GET marriage_applications:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Erreur lors de la récupération des demandes de mariage", details: errMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingId, status, actNumber, approvedBy, statusNotesFr, statusNotesEn } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId et status sont obligatoires" },
        { status: 400 }
      );
    }

    const trackingIdHash = hashSHA256(trackingId.trim());

    let encryptedActNumber: string | null = null;
    let actHash: string | null = null;

    if (actNumber) {
      encryptedActNumber = encryptAES256(actNumber.trim());
      actHash = hashSHA256(actNumber.trim());
    }

    const updateSql = `
      UPDATE marriage_applications
      SET
        status = $1,
        act_number = COALESCE($2, act_number),
        act_hash = COALESCE($3, act_hash),
        approved_by = COALESCE($4, approved_by),
        approved_at = CASE WHEN $1 = 'approved' THEN CURRENT_TIMESTAMP ELSE approved_at END,
        status_notes_fr = COALESCE($5, status_notes_fr),
        status_notes_en = COALESCE($6, status_notes_en),
        updated_at = CURRENT_TIMESTAMP
      WHERE tracking_id_hash = $7
      RETURNING *;
    `;

    const res = await query(updateSql, [
      status,
      encryptedActNumber,
      actHash,
      approvedBy || null,
      statusNotesFr || null,
      statusNotesEn || null,
      trackingIdHash,
    ]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Demande de mariage introuvable." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Statut de la demande de mariage mis à jour avec succès.",
      application: formatMarriageRow(res.rows[0]),
    });
  } catch (error: unknown) {
    console.error("Erreur PATCH marriage_applications:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Impossible de mettre à jour le statut de la demande de mariage", details: errMsg },
      { status: 500 }
    );
  }
}
