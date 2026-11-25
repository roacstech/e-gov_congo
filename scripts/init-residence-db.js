const { Pool } = require('pg');

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable',
});

async function initResidenceDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize residence_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS residence_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'certificat-residence',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Certificat de Résidence & Domicile',
        application_type VARCHAR(50) NOT NULL DEFAULT 'first',
        purpose VARCHAR(200) NOT NULL,
        previous_cert_number VARCHAR(100),
        previous_address VARCHAR(255),
        applicant_surname VARCHAR(100) NOT NULL,
        applicant_post_name VARCHAR(100) NOT NULL,
        applicant_first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL DEFAULT 'M',
        birth_date VARCHAR(50) NOT NULL,
        birth_place VARCHAR(150) NOT NULL,
        nationality VARCHAR(100) DEFAULT 'Congolaise',
        id_number VARCHAR(100),
        marital_status VARCHAR(80) DEFAULT 'Célibataire',
        profession VARCHAR(150),
        province VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
        city VARCHAR(120) NOT NULL,
        commune VARCHAR(120) NOT NULL,
        quarter VARCHAR(150) NOT NULL,
        avenue_parcel VARCHAR(200) NOT NULL,
        full_address TEXT NOT NULL,
        residence_duration VARCHAR(100) NOT NULL,
        occupancy_status VARCHAR(100) NOT NULL,
        quarter_chief_name VARCHAR(150),
        landlord_host_name VARCHAR(150),
        utility_meter_ref VARCHAR(120),
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        municipal_office VARCHAR(255) NOT NULL,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Demande officielle de certificat de résidence enregistrée. Vérification d''adresse et validation communale en cours.',
        status_notes_en TEXT DEFAULT 'Official residence certificate request recorded. Address verification and municipal validation underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_residence_tracking_hash ON residence_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_residence_act_hash ON residence_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_residence_status ON residence_applications(status);
      CREATE INDEX IF NOT EXISTS idx_residence_created_at ON residence_applications(created_at DESC);
    `);

    console.log('✅ residence_applications table and security indexes verified/created successfully.');
  } catch (err) {
    console.error('❌ Error initializing residence_applications table:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initResidenceDb();
