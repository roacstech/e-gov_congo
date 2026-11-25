/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable',
});

async function initOfficerDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize Officer Portal schema...');

    await client.query(`
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
        officer_id: 'OFF-VER-001',
        full_name: 'Inspecteur Patrick Kabila',
        username: 'officer.verifier',
        password: 'Verify@Rdc2026',
        service_id: 'all',
        service_title: 'Tous les Services Publics (Guichet Central)',
        ministry: 'Direction Générale du Contrôle & Vérification Documentaire',
        role: 'verification_officer',
        role_label_fr: '1. Officier de Vérification',
        role_label_en: '1. Verification Officer',
        phone: '+243 81 500 1001',
        email: 'p.kabila@verification.gouv.cd',
      },
      {
        officer_id: 'OFF-APP-002',
        full_name: 'Officière Chantal Mbuyi',
        username: 'officer.approver',
        password: 'Approve@Rdc2026',
        service_id: 'all',
        service_title: 'Tous les Services Publics (Guichet Central)',
        ministry: 'Direction Nationale des Approbations & Signatures Officielles',
        role: 'approver_officer',
        role_label_fr: "2. Officier d'Approbation",
        role_label_en: '2. Approver Officer',
        phone: '+243 82 500 2002',
        email: 'c.mbuyi@approbation.gouv.cd',
      },
      {
        officer_id: 'OFF-HOS-003',
        full_name: 'Directrice Henriette Kasongo',
        username: 'officer.head',
        password: 'Head@Rdc2026',
        service_id: 'all',
        service_title: 'Tous les Services Publics (Direction Générale)',
        ministry: 'Secrétariat Général — Chef de Service Central',
        role: 'head_of_service',
        role_label_fr: '3. Chef de Service',
        role_label_en: '3. Head of Service Officer',
        phone: '+243 89 500 3003',
        email: 'h.kasongo@direction.gouv.cd',
      },
    ];

    for (const off of threeTierOfficers) {
      await client.query(
        `
        INSERT INTO service_officers (
          officer_id, full_name, username, password, service_id,
          service_title, ministry, role, role_label_fr, role_label_en,
          is_active, phone, email
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, $11, $12)
        ON CONFLICT (username) DO UPDATE SET
          role = EXCLUDED.role,
          role_label_fr = EXCLUDED.role_label_fr,
          role_label_en = EXCLUDED.role_label_en,
          service_id = EXCLUDED.service_id,
          service_title = EXCLUDED.service_title,
          ministry = EXCLUDED.ministry,
          is_active = TRUE,
          updated_at = CURRENT_TIMESTAMP;
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

    // Backfill bilingual role labels for any legacy service_officers rows
    await client.query(`
      UPDATE service_officers
      SET
        role_label_fr = CASE
          WHEN role IN ('verification_officer', 'service_officer', 'registrar') THEN '1. Officier de Vérification'
          WHEN role IN ('approver_officer', 'senior_officer', 'legal_officer') THEN '2. Officier d''Approbation'
          WHEN role IN ('head_of_service', 'head_officer', 'director') THEN '3. Chef de Service'
          ELSE '1. Officier de Vérification'
        END,
        role_label_en = CASE
          WHEN role IN ('verification_officer', 'service_officer', 'registrar') THEN '1. Verification Officer'
          WHEN role IN ('approver_officer', 'senior_officer', 'legal_officer') THEN '2. Approver Officer'
          WHEN role IN ('head_of_service', 'head_officer', 'director') THEN '3. Head of Service Officer'
          ELSE '1. Verification Officer'
        END
      WHERE role_label_fr IS NULL OR role_label_en IS NULL;
    `);

    console.log('Officer portal tables and 3-tier officer accounts provisioned successfully.');
  } catch (err) {
    console.error('Error initializing officer database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initOfficerDb();
