import { query } from "@/lib/db";
import { decryptAES256, encryptAES256, hashSHA256 } from "@/lib/crypto";
import { ensureOfficerSchema } from "@/lib/officer-db";
import {
  ApplicationStatus,
  ApplicationWorkflowData,
  OfficerApplicationRecord,
  OfficerAuditEntry,
  OfficerProfile,
  SupportingDocumentItem,
} from "@/types";

interface ServiceTableConfig {
  tableName: string;
  serviceId: string;
  aliasServiceIds: string[];
  serviceCode: string;
  defaultTitleFr: string;
  ministryFr: string;
  ministryEn: string;
  numberColumn: string;
  hashColumn: string;
  numberPrefix: string;
  idProofLabelFr: string;
  idProofLabelEn: string;
}

export const SERVICE_TABLE_CONFIGS: ServiceTableConfig[] = [
  {
    tableName: "national_id_applications",
    serviceId: "cni-biometrique",
    aliasServiceIds: ["cni", "cni-biometrique"],
    serviceCode: "CNI-01",
    defaultTitleFr: "Carte Nationale d'Identité",
    ministryFr: "Ministère de l'Intérieur, Sécurité et Affaires Coutumières",
    ministryEn: "Ministry of Interior, Security and Customary Affairs",
    numberColumn: "national_id_number",
    hashColumn: "national_id_hash",
    numberPrefix: "NIN-CD",
    idProofLabelFr: "Justificatif d'Identité & Filiation Parentale (CNI)",
    idProofLabelEn: "Identity & Parental Lineage Proof (National ID)",
  },
  {
    tableName: "passport_applications",
    serviceId: "passeport-ordinaire",
    aliasServiceIds: ["passeport-ordinaire", "passport"],
    serviceCode: "PAS-02",
    defaultTitleFr: "Demande de Passeport",
    ministryFr: "Ministère des Affaires Étrangères et Coopération Internationale",
    ministryEn: "Ministry of Foreign Affairs and International Cooperation",
    numberColumn: "passport_number",
    hashColumn: "passport_hash",
    numberPrefix: "OP-CD",
    idProofLabelFr: "Pièce d'Identité Nationale & Portrait OACI",
    idProofLabelEn: "National ID Document & ICAO Biometric Portrait",
  },
  {
    tableName: "nationality_applications",
    serviceId: "certificat-nationalite",
    aliasServiceIds: ["certificat-nationalite"],
    serviceCode: "NAT-06",
    defaultTitleFr: "Certificat de Nationalité Congolaise",
    ministryFr: "Ministère de la Justice et Garde des Sceaux",
    ministryEn: "Ministry of Justice and Keeper of the Seals",
    numberColumn: "certificate_number",
    hashColumn: "certificate_hash",
    numberPrefix: "NAT-CD",
    idProofLabelFr: "Pièces d'Identité des Parents & Portrait du Demandeur",
    idProofLabelEn: "Parental ID Proofs & Applicant Identity Portrait",
  },
  {
    tableName: "birth_applications",
    serviceId: "acte-naissance",
    aliasServiceIds: ["acte-naissance"],
    serviceCode: "CIV-04",
    defaultTitleFr: "Extrait d'Acte de Naissance",
    ministryFr: "Administration Territoriale & Mairies des Communes",
    ministryEn: "Territorial Administration & Municipal Councils",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "ACTE-NAISS",
    idProofLabelFr: "Pièces d'Identité des Parents Déclarants (NIN/CNI)",
    idProofLabelEn: "Declarant Parents' Identity Proofs (NIN/ID)",
  },
  {
    tableName: "marriage_applications",
    serviceId: "acte-mariage",
    aliasServiceIds: ["acte-mariage"],
    serviceCode: "CIV-09",
    defaultTitleFr: "Certificat d'Enregistrement de Mariage",
    ministryFr: "Officier de l'État Civil / Hôtel de Ville",
    ministryEn: "Civil Registrar / City Hall",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "ACTE-MAR",
    idProofLabelFr: "Pièces d'Identité des Deux Époux",
    idProofLabelEn: "Both Spouses' National Identity Proofs",
  },
  {
    tableName: "death_applications",
    serviceId: "acte-deces",
    aliasServiceIds: ["acte-deces"],
    serviceCode: "CIV-11",
    defaultTitleFr: "Certificat & Déclaration de Décès",
    ministryFr: "Administration Communale / État Civil",
    ministryEn: "Municipal Administration / Civil Registrar",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "ACTE-DEC",
    idProofLabelFr: "Pièces d'Identité du Défunt & du Déclarant",
    idProofLabelEn: "Deceased & Declarant Identity Proofs",
  },
  {
    tableName: "driving_license_applications",
    serviceId: "permis-conduire",
    aliasServiceIds: ["permis-conduire"],
    serviceCode: "PER-03",
    defaultTitleFr: "Permis de Conduire Sécurisé",
    ministryFr: "Ministère des Transports, Voies de Communication et Désenclavement",
    ministryEn: "Ministry of Transport, Communication and Openings",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "PERMIS-CD",
    idProofLabelFr: "Pièce d'Identité Nationale & Aptitude Conducteur",
    idProofLabelEn: "National Identity Card & Driver Proof",
  },
  {
    tableName: "residence_applications",
    serviceId: "certificat-residence",
    aliasServiceIds: ["certificat-residence"],
    serviceCode: "RES-07",
    defaultTitleFr: "Certificat de Résidence & Domicile",
    ministryFr: "Administration Communale et Quartiers",
    ministryEn: "Municipal Administration and District Offices",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "RES-CD",
    idProofLabelFr: "Pièce d'Identité Officielle & Attestation Domicile",
    idProofLabelEn: "Official Identity Proof & Address Verification",
  },
  {
    tableName: "work_permit_applications",
    serviceId: "permis-travail-etranger",
    aliasServiceIds: ["permis-travail-etranger"],
    serviceCode: "EMP-08",
    defaultTitleFr: "Permis de Travail pour Étrangers (Carte de Travail)",
    ministryFr: "Ministère de l'Emploi, Travail et Prévoyance Sociale",
    ministryEn: "Ministry of Employment, Labor and Social Security",
    numberColumn: "act_number",
    hashColumn: "act_hash",
    numberPrefix: "WORK-CD",
    idProofLabelFr: "Passeport Étranger & Visa d'Établissement DGM",
    idProofLabelEn: "Foreign Passport & DGM Residence Visa Proof",
  },
];

function isDocumentIdProof(label: string, fileName: string, typeOrId?: string): boolean {
  const hay = `${label} ${fileName} ${typeOrId || ""}`.toLowerCase();
  return (
    hay.includes("id") ||
    hay.includes("cni") ||
    hay.includes("nin") ||
    hay.includes("identit") ||
    hay.includes("passeport") ||
    hay.includes("passport") ||
    hay.includes("photo") ||
    hay.includes("visa") ||
    hay.includes("parent") ||
    hay.includes("declarant") ||
    hay.includes("deceased_id") ||
    hay.includes("groom_id") ||
    hay.includes("bride_id")
  );
}

function normalizeSupportingDocs(rawDocs: unknown): SupportingDocumentItem[] {
  if (!Array.isArray(rawDocs)) return [];

  return rawDocs.map((item, idx) => {
    if (typeof item === "string") {
      const lower = item.toLowerCase();
      let label = `Document #${idx + 1}`;
      if (lower.includes("photo")) label = "Photo d'Identité / Portrait";
      else if (lower.includes("naissance") || lower.includes("birth")) label = "Acte de Naissance";
      else if (lower.includes("residence") || lower.includes("resid")) label = "Certificat de Résidence";
      else if (lower.includes("cni") || lower.includes("id") || lower.includes("parent"))
        label = "Pièce d'Identité / CNI";
      return {
        id: `doc-${idx + 1}`,
        name: label,
        fileName: item,
        isIdProof: isDocumentIdProof(label, item),
      };
    }

    if (item && typeof item === "object") {
      const obj = item as Record<string, unknown>;
      const fileName = String(obj.fileName || obj.name || `document_${idx + 1}.pdf`);
      const typeOrId = obj.id ? String(obj.id) : obj.type ? String(obj.type) : undefined;
      const displayName = obj.fileName
        ? String(obj.name || fileName)
        : typeOrId
        ? formatDocTypeLabel(typeOrId, fileName)
        : String(obj.name || fileName);

      return {
        id: obj.id ? String(obj.id) : `doc-${idx + 1}`,
        type: obj.type ? String(obj.type) : undefined,
        name: displayName,
        fileName,
        mimeType: obj.mimeType ? String(obj.mimeType) : null,
        size: typeof obj.size === "number" ? obj.size : null,
        dataUrl: obj.dataUrl ? String(obj.dataUrl) : null,
        isIdProof: isDocumentIdProof(displayName, fileName, typeOrId),
      };
    }

    return {
      id: `doc-${idx + 1}`,
      name: `Document #${idx + 1}`,
      fileName: String(item),
      isIdProof: false,
    };
  });
}

function formatDocTypeLabel(type: string, fallback: string): string {
  const map: Record<string, string> = {
    photo: "Photo d'Identité OACI",
    photo_oaci: "Photo d'Identité OACI",
    birth_certificate: "Acte de Naissance",
    nationality_certificate: "Certificat de Nationalité",
    identity_document: "Pièce d'Identité Officielle",
    residence_certificate: "Certificat de Résidence",
    maternity_notice: "Avis de Naissance (Maternité)",
    father_id: "Pièce d'Identité du Père",
    mother_id: "Pièce d'Identité de la Mère",
    groom_birth_cert: "Acte de Naissance de l'Époux",
    bride_birth_cert: "Acte de Naissance de l'Épouse",
    groom_id: "Pièce d'Identité de l'Époux",
    bride_id: "Pièce d'Identité de l'Épouse",
  };
  return map[type] || fallback;
}

function defaultWorkflowData(row: Record<string, unknown>, issuedNumber: string | null): ApplicationWorkflowData {
  const status = (String(row.status || "submitted") as ApplicationStatus) || "submitted";
  return {
    workflowStage: status,
    docsVerified: false,
    idProofVerified: false,
    verificationChecklist: {},
    verificationOfficerId: null,
    verificationOfficerName: null,
    verificationNotesFr: null,
    verificationNotesEn: null,
    verificationSignature: null,
    verificationSignatureHash: null,
    verifiedAt: null,
    approverCheckedDocs: false,
    approverCheckedIdProof: false,
    approverOfficerId: null,
    approverOfficerName: row.approved_by ? String(row.approved_by) : null,
    approvalNotesFr: null,
    approvalNotesEn: null,
    approverSignature: null,
    approverSignatureHash: null,
    approvedAt: row.approved_at ? new Date(String(row.approved_at)).toISOString() : null,
    headOfficerId: null,
    headOfficerName: null,
    headNotesFr: null,
    headNotesEn: null,
    headSignature: null,
    headSignatureHash: null,
    issuedDocumentNumber: issuedNumber,
    issuedAt: null,
    rejectedByRole: null,
    rejectedByName: null,
    rejectionReason: null,
    rejectedAt: null,
  };
}

function mapWorkflowRow(wf: Record<string, unknown>): ApplicationWorkflowData {
  return {
    workflowStage: String(wf.workflow_stage || "submitted") as ApplicationStatus,
    docsVerified: Boolean(wf.docs_verified),
    idProofVerified: Boolean(wf.id_proof_verified),
    verificationChecklist:
      wf.verification_checklist && typeof wf.verification_checklist === "object"
        ? (wf.verification_checklist as Record<string, boolean>)
        : {},
    verificationOfficerId: wf.verification_officer_id ? String(wf.verification_officer_id) : null,
    verificationOfficerName: wf.verification_officer_name ? String(wf.verification_officer_name) : null,
    verificationNotesFr: wf.verification_notes_fr ? String(wf.verification_notes_fr) : null,
    verificationNotesEn: wf.verification_notes_en ? String(wf.verification_notes_en) : null,
    verificationSignature: wf.verification_signature ? String(wf.verification_signature) : null,
    verificationSignatureHash: wf.verification_signature_hash ? String(wf.verification_signature_hash) : null,
    verifiedAt: wf.verified_at ? new Date(String(wf.verified_at)).toISOString() : null,
    approverCheckedDocs: Boolean(wf.approver_checked_docs),
    approverCheckedIdProof: Boolean(wf.approver_checked_id_proof),
    approverOfficerId: wf.approver_officer_id ? String(wf.approver_officer_id) : null,
    approverOfficerName: wf.approver_officer_name ? String(wf.approver_officer_name) : null,
    approvalNotesFr: wf.approval_notes_fr ? String(wf.approval_notes_fr) : null,
    approvalNotesEn: wf.approval_notes_en ? String(wf.approval_notes_en) : null,
    approverSignature: wf.approver_signature ? String(wf.approver_signature) : null,
    approverSignatureHash: wf.approver_signature_hash ? String(wf.approver_signature_hash) : null,
    approvedAt: wf.approved_at ? new Date(String(wf.approved_at)).toISOString() : null,
    headOfficerId: wf.head_officer_id ? String(wf.head_officer_id) : null,
    headOfficerName: wf.head_officer_name ? String(wf.head_officer_name) : null,
    headNotesFr: wf.head_notes_fr ? String(wf.head_notes_fr) : null,
    headNotesEn: wf.head_notes_en ? String(wf.head_notes_en) : null,
    headSignature: wf.head_signature ? String(wf.head_signature) : null,
    headSignatureHash: wf.head_signature_hash ? String(wf.head_signature_hash) : null,
    issuedDocumentNumber: wf.issued_document_number
      ? decryptAES256(String(wf.issued_document_number))
      : null,
    issuedAt: wf.issued_at ? new Date(String(wf.issued_at)).toISOString() : null,
    rejectedByRole: wf.rejected_by_role ? String(wf.rejected_by_role) : null,
    rejectedByName: wf.rejected_by_name ? String(wf.rejected_by_name) : null,
    rejectionReason: wf.rejection_reason ? String(wf.rejection_reason) : null,
    rejectedAt: wf.rejected_at ? new Date(String(wf.rejected_at)).toISOString() : null,
  };
}

function formatReadableDate(dateVal: unknown): string {
  if (!dateVal) return "—";
  const d = new Date(String(dateVal));
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeApplicationRow(
  cfg: ServiceTableConfig,
  row: Record<string, unknown>,
  wfRow?: Record<string, unknown>
): OfficerApplicationRecord {
  const trackingId = decryptAES256(String(row.tracking_id || ""));
  const rawNumber = row[cfg.numberColumn] ? decryptAES256(String(row[cfg.numberColumn])) : null;
  const workflow = wfRow ? mapWorkflowRow(wfRow) : defaultWorkflowData(row, rawNumber);
  const issuedNumber = workflow.issuedDocumentNumber || rawNumber;

  let applicantName = row.applicant_name ? String(row.applicant_name) : "";
  if (!applicantName && cfg.tableName === "marriage_applications") {
    applicantName = `${row.groom_full_name || "Époux"} & ${row.bride_full_name || "Épouse"}`;
  } else if (!applicantName && cfg.tableName === "death_applications") {
    applicantName = String(row.deceased_full_name || "Défunt");
  } else if (!applicantName) {
    const parts = [row.applicant_surname, row.applicant_post_name, row.applicant_first_name]
      .filter(Boolean)
      .map((s) => String(s));
    applicantName = parts.join(" ") || "Citoyen";
  }

  const email = String(row.email || row.declarant_email || "citoyen@service-public.cd");
  const phone = String(row.phone || row.declarant_phone || "—");
  const city = String(
    row.residence_city ||
      row.origin_city ||
      row.registration_city ||
      row.city ||
      row.work_province ||
      "Kinshasa"
  );
  const collectionPoint = String(
    row.collection_point ||
      row.civil_registry_office ||
      row.jurisdiction ||
      row.delivery_center ||
      row.municipal_office ||
      row.commission_office ||
      city
  );

  // Extract primary & secondary ID proof metadata from table columns
  let primaryIdNumber = issuedNumber || "En attente d'attribution";
  let secondaryIdNumber: string | null = null;
  let birthDate: string | null = row.birth_date ? String(row.birth_date) : null;
  let birthPlace: string | null = row.birth_city
    ? String(row.birth_city)
    : row.birth_place
    ? String(row.birth_place)
    : null;
  let nationality: string | null = row.nationality ? String(row.nationality) : "Congolaise";
  let address: string | null = row.residence_address
    ? String(row.residence_address)
    : row.full_address
    ? String(row.full_address)
    : row.drc_address
    ? String(row.drc_address)
    : null;

  if (cfg.tableName === "national_id_applications") {
    primaryIdNumber = issuedNumber || `Filiation Père: ${row.father_id_number || "N/A"}`;
    secondaryIdNumber = row.mother_id_number ? `Mère: ${row.mother_id_number}` : null;
  } else if (cfg.tableName === "birth_applications") {
    primaryIdNumber = `Père: ${row.father_id_number || "N/A"}`;
    secondaryIdNumber = row.mother_id_number ? `Mère: ${row.mother_id_number}` : null;
  } else if (cfg.tableName === "marriage_applications") {
    primaryIdNumber = `Époux: ${row.groom_id_number || "N/A"}`;
    secondaryIdNumber = `Épouse: ${row.bride_id_number || "N/A"}`;
    birthDate = row.marriage_date ? `Mariage: ${row.marriage_date}` : null;
    birthPlace = row.registration_city ? String(row.registration_city) : null;
    address = row.groom_residence ? String(row.groom_residence) : null;
  } else if (cfg.tableName === "death_applications") {
    primaryIdNumber = `Défunt: ${row.deceased_id_number || "N/A"}`;
    secondaryIdNumber = `Déclarant: ${row.declarant_id_number || "N/A"}`;
    birthDate = row.deceased_birth_date ? String(row.deceased_birth_date) : null;
    birthPlace = row.deceased_birth_place ? String(row.deceased_birth_place) : null;
    nationality = row.deceased_nationality ? String(row.deceased_nationality) : "Congolaise";
    address = row.deceased_last_residence ? String(row.deceased_last_residence) : null;
  } else if (cfg.tableName === "driving_license_applications" || cfg.tableName === "residence_applications") {
    primaryIdNumber = row.id_number ? String(row.id_number) : issuedNumber || "NIN en vérification";
  } else if (cfg.tableName === "work_permit_applications") {
    primaryIdNumber = `Passeport: ${row.passport_number || "N/A"}`;
    secondaryIdNumber = `Visa DGM: ${row.visa_number || "N/A"}`;
  }

  const details: Record<string, string | null | undefined> = {
    "Service": String(row.service_title || cfg.defaultTitleFr),
    "Citizen Name": applicantName,
    "Phone": phone,
    "Email": email,
    "Gender": row.gender ? String(row.gender) : row.deceased_gender ? String(row.deceased_gender) : null,
    "Birth Date": birthDate,
    "Birth Place": birthPlace,
    "Nationality": nationality,
    "Marital Status": row.marital_status
      ? String(row.marital_status)
      : row.deceased_marital_status
      ? String(row.deceased_marital_status)
      : null,
    "Occupation": row.occupation
      ? String(row.occupation)
      : row.profession
      ? String(row.profession)
      : row.deceased_occupation
      ? String(row.deceased_occupation)
      : null,
    "Address": address,
    "Province / Origin": row.origin_province
      ? [row.origin_province, row.origin_territory, row.origin_sector].filter(Boolean).join(" • ")
      : row.province
      ? [row.province, row.commune, row.quarter].filter(Boolean).join(" • ")
      : null,
    "Father Name & ID": row.father_full_name
      ? `${row.father_full_name}${row.father_id_number ? ` (${row.father_id_number})` : ""}`
      : null,
    "Mother Name & ID": row.mother_full_name
      ? `${row.mother_full_name}${row.mother_id_number ? ` (${row.mother_id_number})` : ""}`
      : null,
    "Groom": row.groom_full_name
      ? `${row.groom_full_name}${row.groom_id_number ? ` (${row.groom_id_number})` : ""}`
      : null,
    "Bride": row.bride_full_name
      ? `${row.bride_full_name}${row.bride_id_number ? ` (${row.bride_id_number})` : ""}`
      : null,
    "Marriage Date & Regime": row.marriage_date
      ? `${row.marriage_date}${row.matrimonial_regime ? ` • ${row.matrimonial_regime}` : ""}`
      : null,
    "Death Date & Place": row.death_date
      ? `${row.death_date}${row.death_place ? ` • ${row.death_place}` : ""}`
      : null,
    "Hospital / Doctor": row.birth_hospital
      ? String(row.birth_hospital)
      : row.hospital_name
      ? `${row.hospital_name}${row.certifying_doctor ? ` • ${row.certifying_doctor}` : ""}`
      : null,
    "Declarant": row.declarant_full_name
      ? `${row.declarant_full_name}${row.declarant_relationship ? ` (${row.declarant_relationship})` : ""}`
      : row.declarant_role
      ? String(row.declarant_role)
      : null,
    "ID / NIN": row.id_number ? String(row.id_number) : null,
    "License Category": row.license_category
      ? `${row.license_category}${row.blood_group ? ` • Blood: ${row.blood_group}` : ""}`
      : null,
    "Passport & Visa": row.passport_number
      ? `${row.passport_number}${row.visa_number ? ` • Visa: ${row.visa_number}` : ""}`
      : null,
    "Employer": row.employer_name
      ? `${row.employer_name}${row.employer_rccm ? ` (${row.employer_rccm})` : ""}`
      : null,
    "Job / Sector": row.job_title
      ? `${row.job_title}${row.business_sector ? ` • ${row.business_sector}` : ""}`
      : null,
    "Quarter Chief / Utility": row.quarter_chief_name || row.utility_meter_ref
      ? [row.quarter_chief_name, row.utility_meter_ref].filter(Boolean).join(" • ")
      : null,
    "Collection Hub": collectionPoint,
  };

  const rawTitle = String(row.service_title || cfg.defaultTitleFr);
  const serviceTitle =
    cfg.tableName === "passport_applications" &&
    /passeport ordinaire/i.test(rawTitle)
      ? cfg.defaultTitleFr
      : rawTitle;

  return {
    id: Number(row.id),
    tableName: cfg.tableName,
    trackingId,
    serviceId: cfg.serviceId,
    serviceCode: cfg.serviceCode,
    serviceTitle,
    ministryFr: cfg.ministryFr,
    ministryEn: cfg.ministryEn,
    applicantName,
    email,
    phone,
    city,
    collectionPoint,
    submittedAt: formatReadableDate(row.created_at),
    createdAtIso: row.created_at ? new Date(String(row.created_at)).toISOString() : new Date().toISOString(),
    updatedAtIso: row.updated_at ? new Date(String(row.updated_at)).toISOString() : new Date().toISOString(),
    status: (workflow.workflowStage || row.status || "submitted") as ApplicationStatus,
    statusNotesFr: String(row.status_notes_fr || ""),
    statusNotesEn: String(row.status_notes_en || ""),
    issuedNumber,
    photoUrl: row.photo_url ? String(row.photo_url) : null,
    idProofSummary: {
      labelFr: cfg.idProofLabelFr,
      labelEn: cfg.idProofLabelEn,
      primaryIdNumber,
      secondaryIdNumber,
      holderName: applicantName,
      birthDate,
      birthPlace,
      nationality,
      address,
    },
    supportingDocuments: normalizeSupportingDocs(row.supporting_documents),
    details,
    workflow: {
      ...workflow,
      issuedDocumentNumber: issuedNumber,
    },
  };
}

export async function fetchAllOfficerApplications(options?: {
  serviceId?: string;
}): Promise<OfficerApplicationRecord[]> {
  await ensureOfficerSchema();

  const wfRes = await query(`SELECT * FROM application_workflows;`);
  const wfByHash = new Map<string, Record<string, unknown>>();
  for (const wf of wfRes.rows) {
    wfByHash.set(String(wf.tracking_id_hash), wf);
  }

  const targetConfigs =
    options?.serviceId && options.serviceId !== "all"
      ? SERVICE_TABLE_CONFIGS.filter(
          (c) =>
            c.serviceId === options.serviceId ||
            c.aliasServiceIds.includes(options.serviceId || "")
        )
      : SERVICE_TABLE_CONFIGS;

  const allApps: OfficerApplicationRecord[] = [];
  for (const cfg of targetConfigs) {
    try {
      const res = await query(
        `SELECT * FROM "${cfg.tableName}" ORDER BY created_at DESC LIMIT 100;`
      );
      for (const row of res.rows) {
        const trackingHash = row.tracking_id_hash
          ? String(row.tracking_id_hash)
          : hashSHA256(decryptAES256(String(row.tracking_id || "")));
        const wf = wfByHash.get(trackingHash);
        allApps.push(normalizeApplicationRow(cfg, row, wf));
      }
    } catch (err) {
      console.warn(`Skipping table ${cfg.tableName}:`, err);
    }
  }

  allApps.sort(
    (a, b) => new Date(b.createdAtIso).getTime() - new Date(a.createdAtIso).getTime()
  );

  return allApps;
}

export interface PaginatedApplicationsResult {
  applications: OfficerApplicationRecord[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
  stats: {
    total: number;
    pendingVerification: number;
    pendingApproval: number;
    pendingHeadIssuance: number;
    ready: number;
    rejected: number;
  };
  serviceCounts: Record<string, number>;
  statusCounts: {
    pending: number;
    verified: number;
    pendingApproval: number;
    approved: number;
    all: number;
  };
}

export async function fetchPaginatedOfficerApplications(options: {
  officerServiceId?: string;
  serviceId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedApplicationsResult> {
  const allApps = await fetchAllOfficerApplications({
    serviceId: options.officerServiceId,
  });

  const stats = {
    total: allApps.length,
    pendingVerification: allApps.filter(
      (a) => a.status === "submitted" || a.status === "in_review"
    ).length,
    pendingApproval: allApps.filter((a) => a.status === "verified").length,
    pendingHeadIssuance: allApps.filter((a) => a.status === "approved").length,
    ready: allApps.filter((a) => a.status === "ready").length,
    rejected: allApps.filter((a) => a.status === "rejected").length,
  };

  const serviceCounts: Record<string, number> = { all: allApps.length };
  for (const app of allApps) {
    serviceCounts[app.serviceId] = (serviceCounts[app.serviceId] || 0) + 1;
  }

  const targetService = options.serviceId || "all";
  const q = (options.search || "").trim().toLowerCase();

  // Base filtered by service and search (before status tab) to compute accurate tab counts
  const serviceAndSearchFiltered = allApps.filter((app) => {
    if (targetService !== "all" && app.serviceId !== targetService) {
      return false;
    }
    if (q) {
      return (
        app.trackingId.toLowerCase().includes(q) ||
        app.applicantName.toLowerCase().includes(q) ||
        app.serviceTitle.toLowerCase().includes(q) ||
        app.city.toLowerCase().includes(q) ||
        (app.issuedNumber || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statusCounts = {
    pending: serviceAndSearchFiltered.filter(
      (a) => a.status === "submitted" || a.status === "in_review"
    ).length,
    verified: serviceAndSearchFiltered.filter(
      (a) => a.status !== "submitted" && a.status !== "in_review"
    ).length,
    pendingApproval: serviceAndSearchFiltered.filter(
      (a) => a.status === "verified"
    ).length,
    approved: serviceAndSearchFiltered.filter(
      (a) => a.status === "approved" || a.status === "ready"
    ).length,
    all: serviceAndSearchFiltered.length,
  };

  const statusFilter = options.status || "all";
  const fullyFiltered = serviceAndSearchFiltered.filter((app) => {
    if (statusFilter === "pending") {
      return app.status === "submitted" || app.status === "in_review";
    }
    if (statusFilter === "verified") {
      return app.status !== "submitted" && app.status !== "in_review";
    }
    if (statusFilter === "pending_approval") {
      return app.status === "verified";
    }
    if (statusFilter === "approved") {
      return app.status === "approved" || app.status === "ready";
    }
    if (statusFilter === "pending_head") {
      return app.status === "approved";
    }
    if (statusFilter === "ready") {
      return app.status === "ready";
    }
    if (statusFilter === "rejected") {
      return app.status === "rejected";
    }
    return true;
  });

  const limit = Math.min(Math.max(1, Number(options.limit) || 10), 100);
  const totalItems = fullyFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const page = Math.min(Math.max(1, Number(options.page) || 1), totalPages);
  const start = (page - 1) * limit;
  const pagedApps = fullyFiltered.slice(start, start + limit);

  return {
    applications: pagedApps,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
    },
    stats,
    serviceCounts,
    statusCounts,
  };
}

export async function findApplicationByTrackingOrDocNumber(
  identifier: string
): Promise<OfficerApplicationRecord | null> {
  await ensureOfficerSchema();
  const clean = identifier.trim().replace(/\s+/g, "");
  if (!clean) return null;

  const hash = hashSHA256(clean);
  const upperHash = hashSHA256(clean.toUpperCase());

  const wfRes = await query(`SELECT * FROM application_workflows WHERE tracking_id_hash = $1 OR tracking_id_hash = $2 LIMIT 1;`, [
    hash,
    upperHash,
  ]);
  const wfMap = new Map<string, Record<string, unknown>>();
  for (const wf of wfRes.rows) {
    wfMap.set(String(wf.tracking_id_hash), wf);
  }

  for (const cfg of SERVICE_TABLE_CONFIGS) {
    try {
      const res = await query(
        `SELECT * FROM "${cfg.tableName}"
         WHERE tracking_id_hash = $1
            OR tracking_id_hash = $2
            OR "${cfg.hashColumn}" = $1
            OR "${cfg.hashColumn}" = $2
         LIMIT 1;`,
        [hash, upperHash]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const rowTrackHash = row.tracking_id_hash
          ? String(row.tracking_id_hash)
          : hashSHA256(decryptAES256(String(row.tracking_id || "")));
        let wf = wfMap.get(rowTrackHash);
        if (!wf) {
          const fallbackWf = await query(
            `SELECT * FROM application_workflows WHERE tracking_id_hash = $1 LIMIT 1;`,
            [rowTrackHash]
          );
          wf = fallbackWf.rows[0];
        }
        return normalizeApplicationRow(cfg, row, wf);
      }
    } catch (err) {
      console.warn(`Search error in ${cfg.tableName}:`, err);
    }
  }

  // Fallback: match against workflow.issued_document_number when hashColumn wasn't indexed yet
  try {
    const allWf = await query(
      `SELECT * FROM application_workflows WHERE issued_document_number IS NOT NULL ORDER BY updated_at DESC LIMIT 250;`
    );
    const targetUpper = clean.toUpperCase();
    for (const wf of allWf.rows) {
      const decDoc = decryptAES256(String(wf.issued_document_number || ""));
      if (decDoc && decDoc.toUpperCase() === targetUpper) {
        const wfCfg = SERVICE_TABLE_CONFIGS.find(
          (c) => c.serviceId === String(wf.service_id) || c.aliasServiceIds.includes(String(wf.service_id))
        );
        const searchConfigs = wfCfg
          ? [wfCfg, ...SERVICE_TABLE_CONFIGS.filter((c) => c.tableName !== wfCfg.tableName)]
          : SERVICE_TABLE_CONFIGS;
        for (const cfg of searchConfigs) {
          const rowRes = await query(
            `SELECT * FROM "${cfg.tableName}" WHERE tracking_id_hash = $1 LIMIT 1;`,
            [String(wf.tracking_id_hash)]
          );
          if (rowRes.rows.length > 0) {
            return normalizeApplicationRow(cfg, rowRes.rows[0], wf);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Workflow issued_document_number fallback search error:", err);
  }

  return null;
}

export async function fetchAuditLogs(trackingId?: string): Promise<OfficerAuditEntry[]> {
  await ensureOfficerSchema();
  let res;
  if (trackingId) {
    const hash = hashSHA256(trackingId.trim());
    res = await query(
      `SELECT * FROM officer_audit_logs WHERE tracking_id_hash = $1 ORDER BY created_at DESC LIMIT 50;`,
      [hash]
    );
  } else {
    res = await query(
      `SELECT * FROM officer_audit_logs ORDER BY created_at DESC LIMIT 100;`
    );
  }

  return res.rows.map((r) => ({
    id: Number(r.id),
    trackingId: decryptAES256(String(r.tracking_id)),
    serviceId: String(r.service_id),
    officerId: String(r.officer_id),
    officerName: String(r.officer_name),
    officerRole: String(r.officer_role),
    action: String(r.action),
    notes: r.notes ? String(r.notes) : null,
    signatureHash: r.signature_hash ? String(r.signature_hash) : null,
    createdAt: new Date(String(r.created_at)).toISOString(),
  }));
}

export interface WorkflowActionInput {
  trackingId: string;
  action: "verify_and_sign" | "check_and_approve" | "head_issue" | "reject";
  officer: OfficerProfile;
  signatureData?: string;
  docsChecked?: boolean;
  idProofChecked?: boolean;
  checklist?: Record<string, boolean>;
  notesFr?: string;
  notesEn?: string;
  rejectionReason?: string;
}

export async function executeWorkflowAction(
  input: WorkflowActionInput
): Promise<OfficerApplicationRecord> {
  await ensureOfficerSchema();
  const app = await findApplicationByTrackingOrDocNumber(input.trackingId);
  if (!app) {
    throw new WorkflowError("Dossier introuvable dans le registre national.", 404);
  }

  const cfg = SERVICE_TABLE_CONFIGS.find((c) => c.tableName === app.tableName);
  if (!cfg) {
    throw new WorkflowError("Configuration de service invalide.", 500);
  }

  if (
    input.officer.serviceId !== "all" &&
    !cfg.aliasServiceIds.includes(input.officer.serviceId) &&
    cfg.serviceId !== input.officer.serviceId
  ) {
    throw new WorkflowError(
      `Accès refusé : votre compte est affecté au service "${input.officer.serviceTitle}".`,
      403
    );
  }

  const trackingHash = hashSHA256(app.trackingId.trim());
  const encryptedTrackingId = encryptAES256(app.trackingId.trim());

  const existingWfRes = await query(
    `SELECT * FROM application_workflows WHERE tracking_id_hash = $1 LIMIT 1;`,
    [trackingHash]
  );
  const existingWf = existingWfRes.rows[0] || null;
  const currentStage = (existingWf?.workflow_stage || app.status || "submitted") as ApplicationStatus;

  if (input.action === "verify_and_sign") {
    if (input.officer.roleTier !== "verification_officer") {
      throw new WorkflowError(
        "Seul l'Officier de Vérification (Niveau 1) peut vérifier et signer cette étape.",
        403
      );
    }
    if (currentStage !== "submitted" && currentStage !== "in_review") {
      throw new WorkflowError(
        `Ce dossier est déjà au stade "${currentStage}" et ne peut plus être re-vérifié.`,
        409
      );
    }
    if (!input.docsChecked || !input.idProofChecked) {
      throw new WorkflowError(
        "Vous devez confirmer le contrôle du document ET de la pièce d'identité (ID Proof) avant de signer.",
        400
      );
    }
    if (!input.signatureData || !input.signatureData.startsWith("data:image/")) {
      throw new WorkflowError(
        "La signature électronique de l'Officier de Vérification est obligatoire.",
        400
      );
    }

    const sigHash = hashSHA256(
      `${app.trackingId}|${input.officer.officerId}|VERIFY|${input.signatureData.slice(0, 128)}|${Date.now()}`
    );
    const noteFr =
      input.notesFr?.trim() ||
      `Documents et pièce d'identité vérifiés et signés par ${input.officer.fullName} (${input.officer.officerId}). Transmis à l'Officier d'Approbation.`;
    const noteEn =
      input.notesEn?.trim() ||
      `Documents and ID proof verified and signed by ${input.officer.fullName} (${input.officer.officerId}). Routed to Approver Officer.`;

    await query(
      `
      INSERT INTO application_workflows (
        tracking_id_hash, tracking_id, service_table, service_id, workflow_stage,
        docs_verified, id_proof_verified, verification_checklist,
        verification_officer_id, verification_officer_name,
        verification_notes_fr, verification_notes_en,
        verification_signature, verification_signature_hash, verified_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'verified',
        TRUE, TRUE, $5::jsonb,
        $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (tracking_id_hash) DO UPDATE SET
        workflow_stage = 'verified',
        docs_verified = TRUE,
        id_proof_verified = TRUE,
        verification_checklist = EXCLUDED.verification_checklist,
        verification_officer_id = EXCLUDED.verification_officer_id,
        verification_officer_name = EXCLUDED.verification_officer_name,
        verification_notes_fr = EXCLUDED.verification_notes_fr,
        verification_notes_en = EXCLUDED.verification_notes_en,
        verification_signature = EXCLUDED.verification_signature,
        verification_signature_hash = EXCLUDED.verification_signature_hash,
        verified_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
      `,
      [
        trackingHash,
        encryptedTrackingId,
        cfg.tableName,
        cfg.serviceId,
        JSON.stringify(input.checklist || { documents: true, idProof: true }),
        input.officer.officerId,
        input.officer.fullName,
        noteFr,
        noteEn,
        input.signatureData,
        sigHash,
      ]
    );

    await query(
      `UPDATE "${cfg.tableName}"
       SET status = 'verified',
           status_notes_fr = $1,
           status_notes_en = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [noteFr, noteEn, app.id]
    );

    await insertAuditLog(
      trackingHash,
      encryptedTrackingId,
      cfg.serviceId,
      input.officer,
      "VERIFY_AND_SIGN",
      noteEn,
      sigHash
    );
  } else if (input.action === "check_and_approve") {
    if (input.officer.roleTier !== "approver_officer") {
      throw new WorkflowError(
        "Seul l'Officier d'Approbation (Niveau 2) peut approuver et apposer la deuxième signature.",
        403
      );
    }
    if (currentStage !== "verified" || !existingWf?.verification_signature) {
      throw new WorkflowError(
        "Le dossier doit d'abord être vérifié et signé par l'Officier de Vérification.",
        409
      );
    }
    if (!input.signatureData || !input.signatureData.startsWith("data:image/")) {
      throw new WorkflowError(
        "La signature électronique de l'Officier d'Approbation est obligatoire.",
        400
      );
    }

    const sigHash = hashSHA256(
      `${app.trackingId}|${input.officer.officerId}|APPROVE|${input.signatureData.slice(0, 128)}|${Date.now()}`
    );
    const generatedNumber =
      app.issuedNumber ||
      `${cfg.numberPrefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const encryptedDocNum = encryptAES256(generatedNumber);
    const docNumHash = hashSHA256(generatedNumber);

    const noteFr =
      input.notesFr?.trim() ||
      `Dossier contrôlé, signé et approuvé par ${input.officer.fullName} (${input.officer.officerId}). Double signature apposée sur le document et la pièce d'identité.`;
    const noteEn =
      input.notesEn?.trim() ||
      `Dossier checked, signed and approved by ${input.officer.fullName} (${input.officer.officerId}). Both signatures stamped on document and ID proof.`;

    await query(
      `
      UPDATE application_workflows
      SET
        workflow_stage = 'approved',
        approver_checked_docs = TRUE,
        approver_checked_id_proof = TRUE,
        approver_officer_id = $1,
        approver_officer_name = $2,
        approval_notes_fr = $3,
        approval_notes_en = $4,
        approver_signature = $5,
        approver_signature_hash = $6,
        approved_at = CURRENT_TIMESTAMP,
        issued_document_number = COALESCE(issued_document_number, $7),
        updated_at = CURRENT_TIMESTAMP
      WHERE tracking_id_hash = $8;
      `,
      [
        input.officer.officerId,
        input.officer.fullName,
        noteFr,
        noteEn,
        input.signatureData,
        sigHash,
        encryptedDocNum,
        trackingHash,
      ]
    );

    await query(
      `UPDATE "${cfg.tableName}"
       SET status = 'approved',
           status_notes_fr = $1,
           status_notes_en = $2,
           "${cfg.numberColumn}" = COALESCE("${cfg.numberColumn}", $3),
           "${cfg.hashColumn}" = COALESCE("${cfg.hashColumn}", $4),
           approved_by = $5,
           approved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6;`,
      [
        noteFr,
        noteEn,
        encryptedDocNum,
        docNumHash,
        `${existingWf.verification_officer_name || "Vérificateur"} & ${input.officer.fullName}`,
        app.id,
      ]
    );

    await insertAuditLog(
      trackingHash,
      encryptedTrackingId,
      cfg.serviceId,
      input.officer,
      "CHECK_AND_APPROVE",
      noteEn,
      sigHash
    );
  } else if (input.action === "head_issue") {
    if (input.officer.roleTier !== "head_of_service") {
      throw new WorkflowError(
        "Seul le Chef de Service (Niveau 3) peut délivrer et sceller le document final.",
        403
      );
    }
    if (
      currentStage !== "approved" ||
      !existingWf?.verification_signature ||
      !existingWf?.approver_signature
    ) {
      throw new WorkflowError(
        "Impossible de délivrer : les signatures de l'Officier de Vérification (1) et de l'Officier d'Approbation (2) sont requises sur le document et la pièce d'identité.",
        409
      );
    }
    if (!input.signatureData || !input.signatureData.startsWith("data:image/")) {
      throw new WorkflowError(
        "Veuillez apposer la signature finale / visa du Chef de Service pour délivrer le document.",
        400
      );
    }

    const sigHash = hashSHA256(
      `${app.trackingId}|${input.officer.officerId}|HEAD_ISSUE|${input.signatureData.slice(0, 128)}|${Date.now()}`
    );
    const generatedNumber =
      app.issuedNumber ||
      `${cfg.numberPrefix}-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const encryptedDocNum = encryptAES256(generatedNumber);
    const docNumHash = hashSHA256(generatedNumber);

    const noteFr =
      input.notesFr?.trim() ||
      `Document officiel et pièce d'identité authentifiés avec double signature et délivrés par le Chef de Service ${input.officer.fullName} (${generatedNumber}).`;
    const noteEn =
      input.notesEn?.trim() ||
      `Official document and ID proof authenticated with dual officer signatures and issued by Head of Service ${input.officer.fullName} (${generatedNumber}).`;

    await query(
      `
      UPDATE application_workflows
      SET
        workflow_stage = 'ready',
        head_officer_id = $1,
        head_officer_name = $2,
        head_notes_fr = $3,
        head_notes_en = $4,
        head_signature = $5,
        head_signature_hash = $6,
        issued_document_number = COALESCE(issued_document_number, $7),
        issued_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE tracking_id_hash = $8;
      `,
      [
        input.officer.officerId,
        input.officer.fullName,
        noteFr,
        noteEn,
        input.signatureData,
        sigHash,
        encryptedDocNum,
        trackingHash,
      ]
    );

    await query(
      `UPDATE "${cfg.tableName}"
       SET status = 'ready',
           status_notes_fr = $1,
           status_notes_en = $2,
           "${cfg.numberColumn}" = COALESCE("${cfg.numberColumn}", $3),
           "${cfg.hashColumn}" = COALESCE("${cfg.hashColumn}", $4),
           approved_by = COALESCE(approved_by, $5),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6;`,
      [
        noteFr,
        noteEn,
        encryptedDocNum,
        docNumHash,
        `${existingWf.verification_officer_name} & ${existingWf.approver_officer_name} | Visa: ${input.officer.fullName}`,
        app.id,
      ]
    );

    await insertAuditLog(
      trackingHash,
      encryptedTrackingId,
      cfg.serviceId,
      input.officer,
      "HEAD_AUTHORIZE_ISSUE",
      noteEn,
      sigHash
    );
  } else if (input.action === "reject") {
    if (currentStage === "ready" || currentStage === "rejected") {
      throw new WorkflowError("Ce dossier est déjà clôturé.", 409);
    }
    const reason = input.rejectionReason?.trim() || input.notesFr?.trim() || input.notesEn?.trim();
    if (!reason) {
      throw new WorkflowError("Veuillez indiquer le motif du rejet.", 400);
    }

    const noteFr = `Dossier rejeté (${input.officer.roleLabelFr} — ${input.officer.fullName}) : ${reason}`;
    const noteEn = `Application rejected (${input.officer.roleLabelEn} — ${input.officer.fullName}): ${reason}`;

    await query(
      `
      INSERT INTO application_workflows (
        tracking_id_hash, tracking_id, service_table, service_id, workflow_stage,
        rejected_by_role, rejected_by_name, rejection_reason, rejected_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, 'rejected',
        $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (tracking_id_hash) DO UPDATE SET
        workflow_stage = 'rejected',
        rejected_by_role = EXCLUDED.rejected_by_role,
        rejected_by_name = EXCLUDED.rejected_by_name,
        rejection_reason = EXCLUDED.rejection_reason,
        rejected_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP;
      `,
      [
        trackingHash,
        encryptedTrackingId,
        cfg.tableName,
        cfg.serviceId,
        input.officer.roleTier,
        input.officer.fullName,
        reason,
      ]
    );

    await query(
      `UPDATE "${cfg.tableName}"
       SET status = 'rejected',
           status_notes_fr = $1,
           status_notes_en = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3;`,
      [noteFr, noteEn, app.id]
    );

    await insertAuditLog(
      trackingHash,
      encryptedTrackingId,
      cfg.serviceId,
      input.officer,
      "REJECT",
      reason,
      null
    );
  }

  const updated = await findApplicationByTrackingOrDocNumber(app.trackingId);
  if (!updated) {
    throw new WorkflowError("Impossible de recharger le dossier mis à jour.", 500);
  }
  return updated;
}

async function insertAuditLog(
  trackingHash: string,
  encryptedTrackingId: string,
  serviceId: string,
  officer: OfficerProfile,
  action: string,
  notes: string,
  signatureHash: string | null
) {
  await query(
    `
    INSERT INTO officer_audit_logs (
      tracking_id_hash, tracking_id, service_id,
      officer_id, officer_name, officer_role,
      action, notes, signature_hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `,
    [
      trackingHash,
      encryptedTrackingId,
      serviceId,
      officer.officerId,
      officer.fullName,
      officer.roleTier,
      action,
      notes,
      signatureHash,
    ]
  );
}

export class WorkflowError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}
