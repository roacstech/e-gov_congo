const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable',
});

async function initWorkPermitDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize work_permit_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS work_permit_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'permis-travail-etranger',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Permis de Travail pour Étrangers (Carte de Travail)',
        application_type VARCHAR(50) NOT NULL DEFAULT 'new',
        permit_category VARCHAR(10) NOT NULL DEFAULT 'B',
        requested_duration VARCHAR(80) NOT NULL,
        work_province VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
        previous_permit_number VARCHAR(100),
        previous_expiry_date VARCHAR(50),
        applicant_surname VARCHAR(100) NOT NULL,
        applicant_post_name VARCHAR(100),
        applicant_first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL DEFAULT 'M',
        birth_date VARCHAR(50) NOT NULL,
        birth_place VARCHAR(150) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        passport_number VARCHAR(100) NOT NULL,
        passport_expiry VARCHAR(50) NOT NULL,
        visa_number VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        drc_address TEXT NOT NULL,
        employer_name VARCHAR(255) NOT NULL,
        employer_rccm VARCHAR(120) NOT NULL,
        business_sector VARCHAR(150) NOT NULL,
        job_title VARCHAR(180) NOT NULL,
        contract_type VARCHAR(100) NOT NULL,
        onem_ref VARCHAR(120),
        contract_start_date VARCHAR(50) NOT NULL,
        employer_contact VARCHAR(150) NOT NULL,
        employer_address TEXT NOT NULL,
        commission_office VARCHAR(255) NOT NULL,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Demande officielle de carte de travail pour étranger enregistrée. Examen par la Commission Nationale de l''Emploi des Étrangers et l''ONEM en cours.',
        status_notes_en TEXT DEFAULT 'Official foreign national work permit application recorded. Review by the National Commission for Foreign Employment and ONEM underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_work_permit_tracking_hash ON work_permit_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_work_permit_act_hash ON work_permit_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_work_permit_status ON work_permit_applications(status);
      CREATE INDEX IF NOT EXISTS idx_work_permit_created_at ON work_permit_applications(created_at DESC);
    `);

    console.log('✅ work_permit_applications table and security indexes verified/created successfully.');
  } catch (err) {
    console.error('❌ Error initializing work_permit_applications table:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initWorkPermitDb();
