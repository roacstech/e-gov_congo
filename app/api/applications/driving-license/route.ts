import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatDrivingRow(row: Record<string, unknown>) {
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
      serviceId = "permis-conduire",
      serviceTitle = "Permis de Conduire Sécurisé",
      applicationType = "new",
      licenseCategory = "B",
      previousLicenseNumber,
      previousIssueDate,
      renewalReason,
      applicantSurname,
      applicantPostName,
      applicantFirstName,
      gender = "M",
      birthDate,
      birthPlace,
      nationality = "Congolaise",
      idNumber,
      bloodGroup = "O+",
      profession,
      residenceAddress,
      residenceCity = "Kinshasa",
      phone,
      email,
      deliveryCenter,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (
      !trackingId ||
      !applicantSurname ||
      !applicantPostName ||
      !applicantFirstName ||
      !birthDate ||
      !residenceAddress ||
      !phone ||
      !email
    ) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants (référence, nom complet, date de naissance, adresse, contact)",
        },
        { status: 400 }
      );
    }

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO driving_license_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        application_type,
        license_category,
        previous_license_number,
        previous_issue_date,
        renewal_reason,
        applicant_surname,
        applicant_post_name,
        applicant_first_name,
        gender,
        birth_date,
        birth_place,
        nationality,
        id_number,
        blood_group,
        profession,
        residence_address,
        residence_city,
        phone,
        email,
        delivery_center,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26
      )
      RETURNING *;
    `;

    const values = [
      encryptedTrackingId,
      trackingIdHash,
      serviceId,
      serviceTitle,
      applicationType,
      licenseCategory,
      previousLicenseNumber || null,
      previousIssueDate || null,
      renewalReason || null,
      applicantSurname.trim().toUpperCase(),
      applicantPostName.trim().toUpperCase(),
      applicantFirstName.trim(),
      gender,
      birthDate,
      birthPlace || "Kinshasa",
      nationality,
      idNumber || "NIN-CD-1990-019284",
      bloodGroup,
      profession || "Chauffeur Professionnel",
      residenceAddress.trim(),
      residenceCity,
      phone,
      email,
      deliveryCenter || "Kinshasa - Centre Principal CNPR (Gombe)",
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatDrivingRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message:
          applicationType === "renewal"
            ? "Demande de renouvellement de permis de conduire enregistrée."
            : "Demande de permis de conduire enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement du permis de conduire:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Impossible d'enregistrer la demande de permis de conduire",
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
        `SELECT * FROM driving_license_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { error: "Dossier de permis de conduire introuvable." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatDrivingRow(res.rows[0]),
      });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM driving_license_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 50;`,
        [status]
      );
      const applications = res.rows.map(formatDrivingRow);
      return NextResponse.json({
        success: true,
        count: applications.length,
        applications,
      });
    }

    const res = await query(
      `SELECT * FROM driving_license_applications ORDER BY created_at DESC LIMIT 50;`
    );
    const applications = res.rows.map(formatDrivingRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur GET driving_license_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des dossiers de permis de conduire",
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
      UPDATE driving_license_applications
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
        { error: "Dossier de permis de conduire introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Statut du permis de conduire mis à jour avec succès.",
      application: formatDrivingRow(res.rows[0]),
    });
  } catch (error: unknown) {
    console.error("Erreur PATCH driving_license_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour le statut du dossier de permis de conduire",
        details: errMsg,
      },
      { status: 500 }
    );
  }
}
