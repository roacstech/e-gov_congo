import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatBirthRow(row: Record<string, unknown>) {
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
      serviceId = "acte-naissance",
      serviceTitle = "Acte de Naissance Sécurisé",
      applicantName,
      surname,
      postName,
      firstName,
      gender,
      birthDate,
      birthTime,
      birthCity,
      birthHospital,
      birthCountry = "République Démocratique du Congo",
      declarantRole = "Père",
      fatherFullName,
      fatherNationality = "Congolaise",
      fatherIdNumber,
      fatherOccupation,
      motherFullName,
      motherNationality = "Congolaise",
      motherIdNumber,
      motherOccupation,
      originProvince,
      originCity,
      civilRegistryOffice,
      phone,
      email,
      photoUrl,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (!trackingId || !surname || !postName || !firstName || !phone || !email || !birthDate || !birthCity) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (référence, nom, post-nom, prénom, date/lieu de naissance, contact)" },
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
      INSERT INTO birth_applications (
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
        birth_time,
        birth_city,
        birth_hospital,
        birth_country,
        declarant_role,
        father_full_name,
        father_nationality,
        father_id_number,
        father_occupation,
        mother_full_name,
        mother_nationality,
        mother_id_number,
        mother_occupation,
        origin_province,
        origin_city,
        civil_registry_office,
        phone,
        email,
        photo_url,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31
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
      birthTime || "08:00",
      birthCity,
      birthHospital || "Hôpital Général de Référence",
      birthCountry,
      declarantRole,
      fatherFullName,
      fatherNationality,
      fatherIdNumber || "NIN-CD-1965-098234",
      fatherOccupation || "Cadre d'Entreprise",
      motherFullName,
      motherNationality,
      motherIdNumber || "NIN-CD-1970-112349",
      motherOccupation || "Enseignante",
      originProvince,
      originCity,
      civilRegistryOffice || "Kinshasa - Maison Communale de la Gombe",
      phone,
      email,
      photoUrl,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatBirthRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande d'acte de naissance enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement de l'acte de naissance:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande d'acte de naissance", details: errMsg },
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
        `SELECT * FROM birth_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json({ error: "Demande d'acte de naissance introuvable." }, { status: 404 });
      }

      return NextResponse.json({ application: formatBirthRow(res.rows[0]) });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM birth_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 100;`,
        [status]
      );
      return NextResponse.json({ applications: res.rows.map(formatBirthRow) });
    }

    const res = await query(
      `SELECT * FROM birth_applications ORDER BY created_at DESC LIMIT 100;`
    );
    return NextResponse.json({ applications: res.rows.map(formatBirthRow) });
  } catch (error: unknown) {
    console.error("Erreur de récupération des actes de naissance:", error);
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
      officerName = "Officier de l'État Civil",
      notesFr,
      notesEn,
      actNumber: customActNumber,
    } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId et status sont obligatoires." },
        { status: 400 }
      );
    }

    const trackingIdHash = hashSHA256(trackingId.trim());

    // Generate and encrypt official DRC birth certificate register act number (AN-CD-YYYY-XXXXXXX) if approved
    let encryptedActNumber = null;
    let actHash = null;

    if (status === "approved" || status === "ready") {
      const currentYear = new Date().getFullYear();
      const generatedNumber =
        customActNumber ||
        `ACTE-NAISS-${currentYear}-${Math.floor(100000 + Math.random() * 900000)}`;
      encryptedActNumber = encryptAES256(generatedNumber);
      actHash = hashSHA256(generatedNumber);
    }

    const updateSql = `
      UPDATE birth_applications
      SET
        status = $1,
        status_notes_fr = COALESCE($2, status_notes_fr),
        status_notes_en = COALESCE($3, status_notes_en),
        act_number = COALESCE($4, act_number),
        act_hash = COALESCE($5, act_hash),
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
          ? "Acte de naissance certifié conforme et transcrit au registre national d'état civil."
          : null),
      notesEn ||
        (status === "approved"
          ? "Certified birth certificate approved and transcribed into national civil status registry."
          : null),
      encryptedActNumber,
      actHash,
      officerName,
      trackingIdHash,
    ];

    const result = await query(updateSql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Demande d'acte de naissance introuvable." },
        { status: 404 }
      );
    }

    const updatedApp = formatBirthRow(result.rows[0]);

    return NextResponse.json({
      success: true,
      message: `Statut mis à jour (${status}) et numéro d'acte d'état civil généré de manière chiffrée.`,
      application: updatedApp,
    });
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour de l'acte de naissance:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Impossible de mettre à jour la demande", details: errMsg },
      { status: 500 }
    );
  }
}
