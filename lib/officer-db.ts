import { query } from "@/lib/db";

let schemaPromise: Promise<void> | null = null;

/**
 * Ensures the Officer Portal workflow, audit log, and 3-tier officer tables/records exist.
 * Runs idempotently once per server lifecycle.
 */
export async function ensureOfficerSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = runSchemaMigration().catch((err) => {
      schemaPromise = null;
      throw err;
    });
  }
  return schemaPromise;
}

async function runSchemaMigration(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS service_officers (
      id SERIAL PRIMARY KEY,
      officer_id VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(200) NOT NULL,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(200) NOT NULL,
      service_id VARCHAR(100) NOT NULL,
      service_title VARCHAR(255) NOT NULL,
      ministry VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'verification_officer',
      is_active BOOLEAN DEFAULT TRUE,
      phone VARCHAR(50),
      email VARCHAR(150),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE service_officers ADD COLUMN IF NOT EXISTS role_label_fr VARCHAR(150);
    ALTER TABLE service_officers ADD COLUMN IF NOT EXISTS role_label_en VARCHAR(150);
    ALTER TABLE service_officers ADD COLUMN IF NOT EXISTS signature_data TEXT;

    CREATE TABLE IF NOT EXISTS application_workflows (
      id SERIAL PRIMARY KEY,
      tracking_id_hash VARCHAR(64) UNIQUE NOT NULL,
      tracking_id TEXT NOT NULL,
      service_table VARCHAR(80) NOT NULL,
      service_id VARCHAR(100) NOT NULL,
      workflow_stage VARCHAR(50) NOT NULL DEFAULT 'submitted',

      docs_verified BOOLEAN DEFAULT FALSE,
      id_proof_verified BOOLEAN DEFAULT FALSE,
      verification_checklist JSONB DEFAULT '{}'::jsonb,
      verification_officer_id VARCHAR(64),
      verification_officer_name VARCHAR(200),
      verification_notes_fr TEXT,
      verification_notes_en TEXT,
      verification_signature TEXT,
      verification_signature_hash VARCHAR(64),
      verified_at TIMESTAMP WITH TIME ZONE,

      approver_checked_docs BOOLEAN DEFAULT FALSE,
      approver_checked_id_proof BOOLEAN DEFAULT FALSE,
      approver_officer_id VARCHAR(64),
      approver_officer_name VARCHAR(200),
      approval_notes_fr TEXT,
      approval_notes_en TEXT,
      approver_signature TEXT,
      approver_signature_hash VARCHAR(64),
      approved_at TIMESTAMP WITH TIME ZONE,

      head_officer_id VARCHAR(64),
      head_officer_name VARCHAR(200),
      head_notes_fr TEXT,
      head_notes_en TEXT,
      head_signature TEXT,
      head_signature_hash VARCHAR(64),
      issued_document_number TEXT,
      issued_at TIMESTAMP WITH TIME ZONE,

      rejected_by_role VARCHAR(50),
      rejected_by_name VARCHAR(200),
      rejection_reason TEXT,
      rejected_at TIMESTAMP WITH TIME ZONE,

      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_wf_tracking_hash ON application_workflows(tracking_id_hash);
    CREATE INDEX IF NOT EXISTS idx_wf_stage ON application_workflows(workflow_stage);

    CREATE TABLE IF NOT EXISTS officer_audit_logs (
      id SERIAL PRIMARY KEY,
      tracking_id_hash VARCHAR(64) NOT NULL,
      tracking_id TEXT NOT NULL,
      service_id VARCHAR(100) NOT NULL,
      officer_id VARCHAR(64) NOT NULL,
      officer_name VARCHAR(200) NOT NULL,
      officer_role VARCHAR(50) NOT NULL,
      action VARCHAR(80) NOT NULL,
      notes TEXT,
      signature_hash VARCHAR(64),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_tracking_hash ON officer_audit_logs(tracking_id_hash);
    CREATE INDEX IF NOT EXISTS idx_audit_created_at ON officer_audit_logs(created_at DESC);
  `);

  const threeTierOfficers = [
    {
      officer_id: "OFF-VER-001",
      full_name: "Inspecteur Patrick Kabila",
      username: "officer.verifier",
      password: "Verify@Rdc2026",
      service_id: "all",
      service_title: "Tous les Services Publics (Guichet Central)",
      ministry: "Direction Générale du Contrôle & Vérification Documentaire",
      role: "verification_officer",
      role_label_fr: "Officier de Vérification",
      role_label_en: "Verification Officer",
      phone: "+243 81 500 1001",
      email: "p.kabila@verification.gouv.cd",
    },
    {
      officer_id: "OFF-APP-002",
      full_name: "Officière Chantal Mbuyi",
      username: "officer.approver",
      password: "Approve@Rdc2026",
      service_id: "all",
      service_title: "Tous les Services Publics (Guichet Central)",
      ministry: "Direction Nationale des Approbations & Signatures Officielles",
      role: "approver_officer",
      role_label_fr: "Officier d'Approbation",
      role_label_en: "Approver Officer",
      phone: "+243 82 500 2002",
      email: "c.mbuyi@approbation.gouv.cd",
    },
    {
      officer_id: "OFF-HOS-003",
      full_name: "Directrice Henriette Kasongo",
      username: "officer.head",
      password: "Head@Rdc2026",
      service_id: "all",
      service_title: "Tous les Services Publics (Direction Générale)",
      ministry: "Secrétariat Général — Chef de Service Central",
      role: "head_of_service",
      role_label_fr: "Chef de Service",
      role_label_en: "Head of Service Officer",
      phone: "+243 89 500 3003",
      email: "h.kasongo@direction.gouv.cd",
    },
    {
      officer_id: "OFF-ADM-004",
      full_name: "Administrateur Général RDC",
      username: "superAdmin@gov",
      password: "AdminRDC@2026",
      service_id: "all",
      service_title: "Tous les Services Publics (Supervision Générale)",
      ministry: "Présidence & Administration Numérique Centrale",
      role: "super_admin",
      role_label_fr: "Super Administrateur",
      role_label_en: "Super Admin",
      phone: "+243 80 000 0001",
      email: "superAdmin@gov",
    },
  ];

  for (const off of threeTierOfficers) {
    await query(
      `
      INSERT INTO service_officers (
        officer_id, full_name, username, password, service_id,
        service_title, ministry, role, role_label_fr, role_label_en,
        is_active, phone, email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $12)
      ON CONFLICT (username) DO UPDATE SET
        role_label_fr = EXCLUDED.role_label_fr,
        role_label_en = EXCLUDED.role_label_en;
      `,
      [
        off.officer_id,
        off.full_name,
        off.username,
        off.password,
        off.service_id,
        off.service_title,
        off.ministry,
        off.role,
        off.role_label_fr,
        off.role_label_en,
        off.phone,
        off.email,
      ]
    );
  }
}
