import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatNationalityRow(row: Record<string, unknown>) {
  return {
    ...row,
    tracking_id: decryptAES256(row.tracking_id as string),
    certificate_number: row.certificate_number
      ? decryptAES256(row.certificate_number as string)
      : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trackingId,
      serviceId = "certificat-nationalite",
      serviceTitle = "Certificat de Nationalité Congolaise",
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
      fatherIdNumber,
      fatherCommunity,
      fatherOrigin,
      motherFullName,
      motherNationality = "Congolaise",
      motherIdNumber,
      motherCommunity,
      motherOrigin,
      originProvince,
      originTerritory,
      residenceAddress,
      residenceCity,
      phone,
      email,
      jurisdiction,
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
      INSERT INTO nationality_applications (
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
        father_id_number,
        father_community,
        father_origin,
        mother_full_name,
        mother_nationality,
        mother_id_number,
        mother_community,
        mother_origin,
        origin_province,
        origin_territory,
        residence_address,
        residence_city,
        phone,
        email,
        jurisdiction,
        photo_url,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34
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
      fatherIdNumber || "NIN-CD-1965-098234",
      fatherCommunity || "Baluba",
      fatherOrigin || "Miabi",
      motherFullName,
      motherNationality,
      motherIdNumber || "NIN-CD-1970-112349",
      motherCommunity || "Baluba",
      motherOrigin || "Bakwanga",
      originProvince,
      originTerritory,
      residenceAddress,
      residenceCity,
      phone,
      email,
      jurisdiction || "Kinshasa - TGI Gombe (Palais de Justice)",
      photoUrl,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatNationalityRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande de certificat de nationalité enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement de la demande de certificat de nationalité:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      { error: "Impossible d'enregistrer la demande de certificat de nationalité", details: errMsg },
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
      const sql = `
        SELECT * FROM nationality_applications
        WHERE tracking_id_hash = $1
        LIMIT 1;
      `;
      const result = await query(sql, [trackingIdHash]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Dossier introuvable avec ce numéro de référence." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatNationalityRow(result.rows[0]),
      });
    }

    let sql = `
      SELECT * FROM nationality_applications
    `;
    const params: unknown[] = [];

    if (status) {
      sql += ` WHERE status = $1`;
      params.push(status);
    }

    sql += ` ORDER BY created_at DESC LIMIT 100;`;

    const result = await query(sql, params);
    const applications = result.rows.map(formatNationalityRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur de récupération des demandes de nationalité:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Impossible de récupérer les dossiers", details: errMsg },
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
      officerName = "Greffier Principal / Ministère de la Justice",
      notesFr,
      notesEn,
      certificateNumber: customCertificateNumber,
    } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId et status sont obligatoires." },
        { status: 400 }
      );
    }

    const trackingIdHash = hashSHA256(trackingId.trim());

    // Generate and encrypt official DRC nationality certificate number (NAT-CD-2026-XXXXXXX) if approved
    let encryptedCertificateNumber = null;
    let certificateHash = null;

    if (status === "approved" || status === "ready") {
      const generatedNumber =
        customCertificateNumber ||
        `NAT-CD-2026-${Math.floor(1000000 + Math.random() * 9000000)}`;
      encryptedCertificateNumber = encryptAES256(generatedNumber);
      certificateHash = hashSHA256(generatedNumber);
    }

    const updateSql = `
      UPDATE nationality_applications
      SET
        status = $1,
        status_notes_fr = COALESCE($2, status_notes_fr),
        status_notes_en = COALESCE($3, status_notes_en),
        certificate_number = COALESCE($4, certificate_number),
        certificate_hash = COALESCE($5, certificate_hash),
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
          ? "Certificat de nationalité congolaise délivré et scellé par le Ministère de la Justice."
          : null),
      notesEn ||
        (status === "approved"
          ? "Congolese nationality certificate granted and sealed by Ministry of Justice."
          : null),
      encryptedCertificateNumber,
      certificateHash,
      officerName,
      trackingIdHash,
    ];

    const result = await query(updateSql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Dossier introuvable." },
        { status: 404 }
      );
    }

    const updatedApp = formatNationalityRow(result.rows[0]);

    return NextResponse.json({
      success: true,
      message: `Statut du dossier mis à jour : ${status}`,
      application: updatedApp,
    });
  } catch (error: unknown) {
    console.error("Erreur de mise à jour du certificat de nationalité:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Impossible de mettre à jour le dossier", details: errMsg },
      { status: 500 }
    );
  }
}
