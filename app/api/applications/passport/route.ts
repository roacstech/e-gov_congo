import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatPassportRow(row: Record<string, unknown>) {
  return {
    ...row,
    tracking_id: decryptAES256(row.tracking_id as string),
    passport_number: row.passport_number
      ? decryptAES256(row.passport_number as string)
      : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trackingId,
      serviceId = "passeport-ordinaire",
      serviceTitle = "Demande de Passeport",
      applicantName,
      surname,
      postName,
      firstName,
      gender,
      birthDate,
      birthCity,
      birthCountry = "République Démocratique du Congo",
      maritalStatus,
      occupation,
      fatherFullName,
      fatherNationality = "Congolaise",
      motherFullName,
      motherNationality = "Congolaise",
      originProvince,
      originTerritory,
      residenceAddress,
      residenceCity,
      phone,
      email,
      collectionPoint,
      photoUrl,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (!trackingId || !surname || !postName || !firstName || !phone || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (référence, nom, post-nom, prénom, contact)" },
        { status: 400 }
      );
    }

    const computedApplicantName =
      applicantName || `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO passport_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        applicant_name,
        surname,
        post_name,
        first_name,
        gender,
        birth_date,
        birth_city,
        birth_country,
        marital_status,
        occupation,
        father_full_name,
        father_nationality,
        mother_full_name,
        mother_nationality,
        origin_province,
        origin_territory,
        residence_address,
        residence_city,
        phone,
        email,
        collection_point,
        photo_url,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28
      )
      RETURNING *;
    `;

    const values = [
      encryptedTrackingId,
      trackingIdHash,
      serviceId,
      serviceTitle,
      computedApplicantName,
      surname,
      postName,
      firstName,
      gender,
      birthDate,
      birthCity,
      birthCountry,
      maritalStatus,
      occupation,
      fatherFullName,
      fatherNationality,
      motherFullName,
      motherNationality,
      originProvince,
      originTerritory,
      residenceAddress,
      residenceCity,
      phone,
      email,
      collectionPoint,
      photoUrl,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatPassportRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande de passeport enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement de la demande de passeport:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande de passeport", details: errMsg },
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
      // Use SHA-256 blind index hash for O(1) encrypted lookup
      const trackingIdHash = hashSHA256(trackingId.trim());
      const res = await query(
        `SELECT * FROM passport_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Demande de passeport introuvable." }, { status: 404 });
      }

      return NextResponse.json({ application: formatPassportRow(res.rows[0]) });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM passport_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 100;`,
        [status]
      );
      return NextResponse.json({ applications: res.rows.map(formatPassportRow) });
    }

    const res = await query(
      `SELECT * FROM passport_applications ORDER BY created_at DESC LIMIT 100;`
    );
    return NextResponse.json({ applications: res.rows.map(formatPassportRow) });
  } catch (error: unknown) {
    console.error("Erreur de récupération des demandes de passeport:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Échec de récupération des demandes", details: errMsg },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trackingId,
      status, // "approved", "ready", "rejected", "in_review"
      officerName = "Chef de Service Chancellerie",
      notesFr,
      notesEn,
      passportNumber: customPassportNumber,
    } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId et status sont obligatoires." },
        { status: 400 }
      );
    }

    const trackingIdHash = hashSHA256(trackingId.trim());

    // Generate and encrypt official DRC passport number (OP-CD-XXXXXXX) if approved
    let encryptedPassportNumber = null;
    let passportHash = null;

    if (status === "approved" || status === "ready") {
      const generatedNumber =
        customPassportNumber ||
        `OP-CD-${Math.floor(1000000 + Math.random() * 9000000)}`;
      encryptedPassportNumber = encryptAES256(generatedNumber);
      passportHash = hashSHA256(generatedNumber);
    }

    const updateSql = `
      UPDATE passport_applications
      SET
        status = $1,
        status_notes_fr = COALESCE($2, status_notes_fr),
        status_notes_en = COALESCE($3, status_notes_en),
        passport_number = COALESCE($4, passport_number),
        passport_hash = COALESCE($5, passport_hash),
        approved_at = CASE WHEN $1 IN ('approved', 'ready') THEN CURRENT_TIMESTAMP ELSE approved_at END,
        approved_by = CASE WHEN $1 IN ('approved', 'ready') THEN $6 ELSE approved_by END,
        updated_at = CURRENT_TIMESTAMP
      WHERE tracking_id_hash = $7
      RETURNING *;
    `;

    const values = [
      status,
      notesFr ||
        (status === "approved"
          ? "Dossier approuvé par le Chef de Service. Livret de passeport transmis pour personnalisation et encodage de puce."
          : null),
      notesEn ||
        (status === "approved"
          ? "Dossier approved by Head of Service. Passport booklet queued for personalization and chip encoding."
          : null),
      encryptedPassportNumber,
      passportHash,
      officerName,
      trackingIdHash,
    ];

    const result = await query(updateSql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Demande de passeport introuvable." },
        { status: 404 }
      );
    }

    const updatedApp = formatPassportRow(result.rows[0]);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour (${status}) et numéro de passeport enregistré de manière chiffrée.`,
      application: updatedApp,
    });
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de la demande de passeport:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Impossible de mettre à jour la demande", details: errMsg },
      { status: 500 }
    );
  }
}
