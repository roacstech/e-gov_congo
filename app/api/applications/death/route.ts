import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { encryptAES256, decryptAES256, hashSHA256 } from "@/lib/crypto";

// Helper to format/decrypt application row for API consumers
function formatDeathRow(row: Record<string, unknown>) {
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
      serviceId = "acte-deces",
      serviceTitle = "Certificat & Déclaration de Décès",
      deceasedFullName,
      deceasedGender,
      deceasedBirthDate,
      deceasedBirthPlace,
      deceasedNationality = "Congolaise",
      deceasedIdNumber,
      deceasedMaritalStatus = "Marié(e)",
      deceasedOccupation,
      deceasedLastResidence,
      deathDate,
      deathTime,
      deathPlace,
      deathLocationType = "Hôpital / Centre Médical",
      hospitalName,
      medicalNoticeNumber,
      certifyingDoctor,
      declarantFullName,
      declarantRelationship,
      declarantIdNumber,
      declarantResidence,
      declarantPhone,
      declarantEmail,
      civilRegistryOffice,
      registrationCity = "Kinshasa",
      supportingDocuments = [],
      declarationAgreed = true,
    } = body;

    if (
      !trackingId ||
      !deceasedFullName ||
      !deathDate ||
      !deathPlace ||
      !declarantFullName ||
      !declarantPhone ||
      !declarantEmail
    ) {
      return NextResponse.json(
        {
          error:
            "Champs obligatoires manquants (référence, défunt, date et lieu de décès, déclarant, contact)",
        },
        { status: 400 }
      );
    }

    // AES-256 encryption for database at-rest security
    const encryptedTrackingId = encryptAES256(trackingId);
    // SHA-256 blind index for fast indexed search lookups
    const trackingIdHash = hashSHA256(trackingId);

    const insertSql = `
      INSERT INTO death_applications (
        tracking_id,
        tracking_id_hash,
        service_id,
        service_title,
        deceased_full_name,
        deceased_gender,
        deceased_birth_date,
        deceased_birth_place,
        deceased_nationality,
        deceased_id_number,
        deceased_marital_status,
        deceased_occupation,
        deceased_last_residence,
        death_date,
        death_time,
        death_place,
        death_location_type,
        hospital_name,
        medical_notice_number,
        certifying_doctor,
        declarant_full_name,
        declarant_relationship,
        declarant_id_number,
        declarant_residence,
        declarant_phone,
        declarant_email,
        civil_registry_office,
        registration_city,
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
      deceasedFullName.trim(),
      deceasedGender || "M",
      deceasedBirthDate || "1960-01-01",
      deceasedBirthPlace || "Kinshasa",
      deceasedNationality,
      deceasedIdNumber || "NIN-CD-1960-019284",
      deceasedMaritalStatus,
      deceasedOccupation || "Retraité",
      deceasedLastResidence || "Kinshasa - Limete",
      deathDate,
      deathTime || "10:00",
      deathPlace,
      deathLocationType,
      hospitalName || "Hôpital Général de Référence de Kinshasa",
      medicalNoticeNumber || "AVIS-MED-2026-9042",
      certifyingDoctor || "Dr. TSHILUMBA Jean",
      declarantFullName.trim(),
      declarantRelationship || "Enfant / Héritier",
      declarantIdNumber || "NIN-CD-1988-049281",
      declarantResidence || "Kinshasa - Gombe",
      declarantPhone,
      declarantEmail,
      civilRegistryOffice || "Kinshasa - Maison Communale de la Gombe",
      registrationCity,
      JSON.stringify(supportingDocuments),
      declarationAgreed,
    ];

    const result = await query(insertSql, values);
    const savedApplication = formatDeathRow(result.rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Déclaration de décès enregistrée avec succès.",
        application: savedApplication,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Erreur lors de l'enregistrement de l'acte de décès:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Impossible d'enregistrer la déclaration de décès",
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
        `SELECT * FROM death_applications WHERE tracking_id_hash = $1 LIMIT 1;`,
        [trackingIdHash]
      );

      if (res.rows.length === 0) {
        return NextResponse.json(
          { error: "Déclaration de décès introuvable." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        application: formatDeathRow(res.rows[0]),
      });
    }

    if (status) {
      const res = await query(
        `SELECT * FROM death_applications WHERE status = $1 ORDER BY created_at DESC LIMIT 50;`,
        [status]
      );
      const applications = res.rows.map(formatDeathRow);
      return NextResponse.json({
        success: true,
        count: applications.length,
        applications,
      });
    }

    const res = await query(
      `SELECT * FROM death_applications ORDER BY created_at DESC LIMIT 50;`
    );
    const applications = res.rows.map(formatDeathRow);

    return NextResponse.json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error: unknown) {
    console.error("Erreur GET death_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des déclarations de décès",
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
      UPDATE death_applications
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
        { error: "Déclaration de décès introuvable." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Statut de la déclaration de décès mis à jour avec succès.",
      application: formatDeathRow(res.rows[0]),
    });
  } catch (error: unknown) {
    console.error("Erreur PATCH death_applications:", error);
    const errMsg =
      error instanceof Error ? error.message : "Erreur interne du serveur";
    return NextResponse.json(
      {
        error:
          "Impossible de mettre à jour le statut de la déclaration de décès",
        details: errMsg,
      },
      { status: 500 }
    );
  }
}
