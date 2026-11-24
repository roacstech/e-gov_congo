import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatApplicationRow(row: Record<string, unknown>) {
  return {
    ...row,
    tracking_id: decryptAES256(row.tracking_id as string),
    national_id_number: row.national_id_number
      ? decryptAES256(row.national_id_number as string)
      : null,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      trackingId,
      serviceId = "cni",
      serviceTitle = "Carte Nationale d'Identité",
      applicantName,
      surname,
      postName,
      firstName,
      gender,
      birthDate,
      birthCity,
      maritalStatus,
      nationalityOrigin,
      fatherFullName,
      fatherNationality,
      fatherIdNumber,
      motherFullName,
      motherNationality,
      motherIdNumber,
      originProvince,
      originTerritory,
      originSector,
      residenceProvince,
      residenceCity,
      residenceAddress,
      phone,
      email,
      occupation,
      photoUrl,
      supportingDocuments = [],
      declarationAgreed = true,
      collectionPoint,
    } = body;

    if (!trackingId || !surname || !postName || !firstName) {
      return NextResponse.json(
        { error: "Missing mandatory fields (trackingId, names)" },
        { status: 400 }
      );
    }

    const computedApplicantName =
      applicantName || `${surname.trim()} ${postName.trim()} ${firstName.trim()}`;

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO national_id_applications (
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
        marital_status,
        nationality_origin,
        father_full_name,
        father_nationality,
        father_id_number,
        mother_full_name,
        mother_nationality,
        mother_id_number,
        origin_province,
        origin_territory,
        origin_sector,
        residence_province,
        residence_city,
        residence_address,
        phone,
        email,
        occupation,
        photo_url,
        supporting_documents,
        declaration_agreed,
        collection_point
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32
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
      maritalStatus,
      nationalityOrigin,
      fatherFullName,
      fatherNationality,
      fatherIdNumber,
      motherFullName,
      motherNationality,
      motherIdNumber,
      originProvince,
      originTerritory,
      originSector,
      residenceProvince,
      residenceCity,
      residenceAddress,
      phone,
      email,
      occupation,
      photoUrl,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
      collectionPoint || residenceCity,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatApplicationRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Application saved successfully to PostgreSQL database (AES-256 encrypted at rest)",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving application to database:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get("trackingId");

    if (trackingId) {
      const searchHash = hashSHA256(trackingId);
      const result = await query(
        `SELECT * FROM national_id_applications 
         WHERE tracking_id_hash = $1 OR tracking_id = $2 
         LIMIT 1`,
        [searchHash, trackingId]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatApplicationRow(result.rows[0]),
      });
    }

    const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);
    const result = await query(
      "SELECT * FROM national_id_applications ORDER BY created_at DESC LIMIT $1",
      [limit]
    );

    const formattedApplications = result.rows.map(formatApplicationRow);

    return NextResponse.json({
      success: true,
      count: formattedApplications.length,
      applications: formattedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications from database:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
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
      status, // "approved", "ready", "rejected"
      officerName = "Chef de Service CNI",
      notesFr,
      notesEn,
      nationalIdNumber: customNIN,
    } = body;

    if (!trackingId || !status) {
      return NextResponse.json(
        { error: "trackingId and status are mandatory." },
        { status: 400 }
      );
    }

    const trackingIdHash = hashSHA256(trackingId.trim());

    // Generate and encrypt official National ID Number (NIN-CD-YYYY-XXXXXXX) if approved
    let encryptedNIN = null;
    let ninHash = null;

    if (status === "approved" || status === "ready") {
      const generatedNIN =
        customNIN ||
        `NIN-CD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      encryptedNIN = encryptAES256(generatedNIN);
      ninHash = hashSHA256(generatedNIN);
    }

    const updateSql = `
      UPDATE national_id_applications
      SET
        status = $1,
        status_notes_fr = COALESCE($2, status_notes_fr),
        status_notes_en = COALESCE($3, status_notes_en),
        national_id_number = COALESCE($4, national_id_number),
        national_id_hash = COALESCE($5, national_id_hash),
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
          ? "Dossier approuvé par le Chef de Service. Carte CNI produite et transmise au centre de distribution."
          : null),
      notesEn ||
        (status === "approved"
          ? "Dossier approved by Head of Service. National ID produced and routed to distribution center."
          : null),
      encryptedNIN,
      ninHash,
      officerName,
      trackingIdHash,
    ];

    const result = await query(updateSql, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Demande CNI introuvable." },
        { status: 404 }
      );
    }

    const updatedApp = formatApplicationRow(result.rows[0]);

    return NextResponse.json({
      success: true,
      message: `Statut CNI mis à jour (${status}) et numéro NIN chiffré enregistré.`,
      application: updatedApp,
    });
  } catch (error: unknown) {
    console.error("Erreur lors de la mise à jour CNI:", error);
    const errMsg = error instanceof Error ? error.message : "Erreur interne";
    return NextResponse.json(
      { error: "Impossible de mettre à jour la demande CNI", details: errMsg },
      { status: 500 }
    );
  }
}
