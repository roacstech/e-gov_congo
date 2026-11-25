import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatResidenceRow(row: Record<string, unknown>) {
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
      serviceId = "certificat-residence",
      serviceTitle = "Certificat de Résidence & Domicile",
      applicationType = "first",
      purpose,
      previousCertNumber,
      previousAddress,
      applicantSurname,
      applicantPostName,
      applicantFirstName,
      gender = "M",
      birthDate,
      birthPlace,
      nationality = "Congolaise",
      idNumber,
      maritalStatus = "Célibataire",
      profession,
      province = "Kinshasa",
      city,
      commune,
      quarter,
      avenueParcel,
      fullAddress,
      residenceDuration,
      occupancyStatus,
      quarterChiefName,
      landlordHostName,
      utilityMeterRef,
      phone,
      email,
      municipalOffice,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (
      !trackingId ||
      !applicantSurname ||
      !applicantPostName ||
      !applicantFirstName ||
      !birthDate ||
      !commune ||
      !quarter ||
      !fullAddress ||
      !phone ||
      !email
    ) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants (référence, identité complète, date de naissance, commune, quartier, adresse complète, contact)",
        },
        { status: 400 }
      );
    }

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO residence_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        application_type,
        purpose,
        previous_cert_number,
        previous_address,
        applicant_surname,
        applicant_post_name,
        applicant_first_name,
        gender,
        birth_date,
        birth_place,
        nationality,
        id_number,
        marital_status,
        profession,
        province,
        city,
        commune,
        quarter,
        avenue_parcel,
        full_address,
        residence_duration,
        occupancy_status,
        quarter_chief_name,
        landlord_host_name,
        utility_meter_ref,
        phone,
        email,
        municipal_office,
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
      applicationType,
      purpose || "Demande de Passeport ou Carte d'Identité (CNI)",
      previousCertNumber || null,
      previousAddress || null,
      applicantSurname.trim().toUpperCase(),
      applicantPostName.trim().toUpperCase(),
      applicantFirstName.trim(),
      gender,
      birthDate,
      birthPlace || "Kinshasa",
      nationality,
      idNumber || null,
      maritalStatus,
      profession || null,
      province,
      city || province,
      commune.trim(),
      quarter.trim(),
      avenueParcel ? avenueParcel.trim() : fullAddress.trim(),
      fullAddress.trim(),
      residenceDuration || "1 à 3 ans",
      occupancyStatus || "Locataire avec contrat de bail",
      quarterChiefName || null,
      landlordHostName || null,
      utilityMeterRef || null,
      phone.trim(),
      email.trim(),
      municipalOffice || "Kinshasa - Maison Communale de la Gombe",
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatResidenceRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande de certificat de résidence enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "Erreur lors de l'enregistrement du certificat de résidence:",
      error
    );
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Impossible d'enregistrer la demande de certificat de résidence",
        details: errMsg,
      },
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
        `SELECT * FROM residence_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { error: "Demande de certificat de résidence introuvable." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatResidenceRow(res.rows[0]),
      });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM residence_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 50;`,
        [status]
      );
      const applications = res.rows.map(formatResidenceRow);
      return NextResponse.json({
        success: true,
        count: applications.length,
        applications,
      });
    }

    const res = await query(
      `SELECT * FROM residence_applications ORDER BY created_at DESC LIMIT 50;`
    );
    const applications = res.rows.map(formatResidenceRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur GET residence_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération des demandes de certificat de résidence",
        details: errMsg,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      trackingId,
      status,
      actNumber,
      approvedBy,
      statusNotesFr,
      statusNotesEn,
    } = body;

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
      UPDATE residence_applications
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
      return NextResponse.json(
        { error: "Demande de certificat de résidence introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Statut du certificat de résidence mis à jour avec succès.",
      application: formatResidenceRow(res.rows[0]),
    });
  } catch (error: unknown) {
    console.error("Erreur PATCH residence_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour le statut de la demande de certificat de résidence",
        details: errMsg,
      },
      { status: 500 }
    );
  }
}
