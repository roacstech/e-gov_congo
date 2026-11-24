const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initDeathDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize death_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS death_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'acte-deces',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Certificat & Déclaration de Décès',
        deceased_full_name VARCHAR(255) NOT NULL,
        deceased_gender VARCHAR(10) NOT NULL,
        deceased_birth_date VARCHAR(50) NOT NULL,
        deceased_birth_place VARCHAR(150) NOT NULL,
        deceased_nationality VARCHAR(100) DEFAULT 'Congolaise',
        deceased_id_number VARCHAR(100),
        deceased_marital_status VARCHAR(100),
        deceased_occupation VARCHAR(150),
        deceased_last_residence VARCHAR(255),
        death_date VARCHAR(50) NOT NULL,
        death_time VARCHAR(50),
        death_place VARCHAR(255) NOT NULL,
        death_location_type VARCHAR(100) DEFAULT 'Hôpital / Centre Médical',
        hospital_name VARCHAR(255),
        medical_notice_number VARCHAR(150),
        certifying_doctor VARCHAR(255),
        declarant_full_name VARCHAR(255) NOT NULL,
        declarant_relationship VARCHAR(150) NOT NULL,
        declarant_id_number VARCHAR(100),
        declarant_residence VARCHAR(255),
        declarant_phone VARCHAR(50) NOT NULL,
        declarant_email VARCHAR(150) NOT NULL,
        civil_registry_office VARCHAR(255) NOT NULL,
        registration_city VARCHAR(100) DEFAULT 'Kinshasa',
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Déclaration officielle de décès enregistrée. Contrôle du constat médical et transcription au registre de l''état civil en cours.',
        status_notes_en TEXT DEFAULT 'Official death declaration registered. Verification of medical death notification and civil registry transcription underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_death_tracking_hash ON death_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_death_act_hash ON death_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_death_status ON death_applications(status);
      CREATE INDEX IF NOT EXISTS idx_death_created_at ON death_applications(created_at DESC);
    `);

    console.log('✅ death_applications table and security indexes verified/created successfully.');
  } catch (err) {
    console.error('❌ Error initializing death_applications table:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDeathDb();
