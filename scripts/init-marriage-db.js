const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initMarriageDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize marriage_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS marriage_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'acte-mariage',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Certificat d''Enregistrement de Mariage',
        groom_full_name VARCHAR(255) NOT NULL,
        groom_birth_date VARCHAR(50) NOT NULL,
        groom_birth_place VARCHAR(150) NOT NULL,
        groom_nationality VARCHAR(100) DEFAULT 'Congolaise',
        groom_id_number VARCHAR(100),
        groom_occupation VARCHAR(150),
        groom_residence VARCHAR(255),
        groom_father_name VARCHAR(255),
        groom_mother_name VARCHAR(255),
        bride_full_name VARCHAR(255) NOT NULL,
        bride_birth_date VARCHAR(50) NOT NULL,
        bride_birth_place VARCHAR(150) NOT NULL,
        bride_nationality VARCHAR(100) DEFAULT 'Congolaise',
        bride_id_number VARCHAR(100),
        bride_occupation VARCHAR(150),
        bride_residence VARCHAR(255),
        bride_father_name VARCHAR(255),
        bride_mother_name VARCHAR(255),
        marriage_date VARCHAR(50) NOT NULL,
        matrimonial_regime VARCHAR(150) DEFAULT 'Communauté réduite aux acquêts',
        civil_registry_office VARCHAR(255) NOT NULL,
        registration_city VARCHAR(100),
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Dossier officiel d''enregistrement de mariage déposé. Vérification légale et transcription au registre de l''état civil en cours.',
        status_notes_en TEXT DEFAULT 'Official marriage registration application registered. Legal verification and civil registry recording underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_marriage_tracking_hash ON marriage_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_marriage_act_hash ON marriage_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_marriage_status ON marriage_applications(status);
      CREATE INDEX IF NOT EXISTS idx_marriage_created_at ON marriage_applications(created_at DESC);
    `);

    console.log('✓ marriage_applications table and indexes successfully provisioned.');
  } catch (err) {
    console.error('Error initializing marriage database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initMarriageDb();
