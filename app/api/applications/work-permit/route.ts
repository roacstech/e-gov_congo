import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatWorkPermitRow(row: Record<string, unknown>) {
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
      serviceId = "permis-travail-etranger",
      serviceTitle = "Permis de Travail pour Étrangers (Carte de Travail)",
      applicationType = "new",
      permitCategory = "B",
      requestedDuration,
      workProvince = "Kinshasa",
      previousPermitNumber,
      previousExpiryDate,
      applicantSurname,
      applicantPostName = "",
      applicantFirstName,
      gender = "M",
      birthDate,
      birthPlace,
      nationality,
      passportNumber,
      passportExpiry,
      visaNumber,
      phone,
      email,
      drcAddress,
      employerName,
      employerRccm,
      businessSector,
      jobTitle,
      contractType,
      onemRef,
      contractStartDate,
      employerContact,
      employerAddress,
      commissionOffice,
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (
      !trackingId ||
      !applicantSurname ||
      !applicantFirstName ||
      !birthDate ||
      !nationality ||
      !passportNumber ||
      !visaNumber ||
      !phone ||
      !email ||
      !drcAddress ||
      !employerName ||
      !employerRccm ||
      !jobTitle ||
      !employerAddress
    ) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants (référence, identité travailleur, passeport, visa, employeur, poste, adresses)",
        },
        { status: 400 }
      );
    }

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO work_permit_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        application_type,
        permit_category,
        requested_duration,
        work_province,
        previous_permit_number,
        previous_expiry_date,
        applicant_surname,
        applicant_post_name,
        applicant_first_name,
        gender,
        birth_date,
        birth_place,
        nationality,
        passport_number,
        passport_expiry,
        visa_number,
        phone,
        email,
        drc_address,
        employer_name,
        employer_rccm,
        business_sector,
        job_title,
        contract_type,
        onem_ref,
        contract_start_date,
        employer_contact,
        employer_address,
        commission_office,
        supporting_documents,
        declaration_agreed
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35
      )
      RETURNING *;
    `;

    const values = [
      encryptedTrackingId,
      trackingIdHash,
      serviceId,
      serviceTitle,
      applicationType,
      permitCategory,
      requestedDuration || "2 ans",
      workProvince,
      previousPermitNumber || null,
      previousExpiryDate || null,
      applicantSurname.trim().toUpperCase(),
      applicantPostName ? applicantPostName.trim().toUpperCase() : null,
      applicantFirstName.trim(),
      gender,
      birthDate,
      birthPlace || nationality,
      nationality.trim(),
      passportNumber.trim().toUpperCase(),
      passportExpiry || "2030-01-01",
      visaNumber.trim().toUpperCase(),
      phone.trim(),
      email.trim(),
      drcAddress.trim(),
      employerName.trim(),
      employerRccm.trim().toUpperCase(),
      businessSector || "Mines & Hydrocarbures",
      jobTitle.trim(),
      contractType || "Contrat à Durée Déterminée (CDD)",
      onemRef || null,
      contractStartDate || birthDate,
      employerContact ? employerContact.trim() : email.trim(),
      employerAddress.trim(),
      commissionOffice ||
        "Kinshasa - Commission Nationale de l'Emploi des Étrangers (Siège Central)",
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatWorkPermitRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Demande de permis de travail enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(
      "Erreur lors de l'enregistrement du permis de travail:",
      error
    );
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Impossible d'enregistrer la demande de permis de travail",
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
        `SELECT * FROM work_permit_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { error: "Demande de permis de travail introuvable." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatWorkPermitRow(res.rows[0]),
      });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM work_permit_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 50;`,
        [status]
      );
      const applications = res.rows.map(formatWorkPermitRow);
      return NextResponse.json({
        success: true,
        count: applications.length,
        applications,
      });
    }

    const res = await query(
      `SELECT * FROM work_permit_applications ORDER BY created_at DESC LIMIT 50;`
    );
    const applications = res.rows.map(formatWorkPermitRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur GET work_permit_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération des demandes de permis de travail",
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
      UPDATE work_permit_applications
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
        { error: "Demande de permis de travail introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Statut du permis de travail mis à jour avec succès.",
      application: formatWorkPermitRow(res.rows[0]),
    });
  } catch (error: unknown) {
    console.error("Erreur PATCH work_permit_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour le statut de la demande de permis de travail",
        details: errMsg,
      },
      { status: 500 }
    );
  }
}
