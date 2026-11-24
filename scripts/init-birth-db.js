const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initBirthDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize birth_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS birth_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'acte-naissance',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Acte de Naissance Sécurisé',
        applicant_name VARCHAR(255) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        post_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_date VARCHAR(50) NOT NULL,
        birth_time VARCHAR(20),
        birth_city VARCHAR(150) NOT NULL,
        birth_hospital VARCHAR(255),
        birth_country VARCHAR(150) DEFAULT 'République Démocratique du Congo',
        declarant_role VARCHAR(100) DEFAULT 'Père',
        father_full_name VARCHAR(255),
        father_nationality VARCHAR(100) DEFAULT 'Congolaise',
        father_id_number VARCHAR(100),
        father_occupation VARCHAR(150),
        mother_full_name VARCHAR(255),
        mother_nationality VARCHAR(100) DEFAULT 'Congolaise',
        mother_id_number VARCHAR(100),
        mother_occupation VARCHAR(150),
        origin_province VARCHAR(100),
        origin_city VARCHAR(100),
        civil_registry_office VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        photo_url TEXT,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Dossier officiel enregistré. Vérification de la notification hospitalière et transcription à l''état civil en cours.',
        status_notes_en TEXT DEFAULT 'Official application registered. Hospital delivery notification verification and civil registry recording underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_birth_tracking_hash ON birth_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_birth_act_hash ON birth_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_birth_status ON birth_applications(status);
      CREATE INDEX IF NOT EXISTS idx_birth_created_at ON birth_applications(created_at DESC);
    `);

    console.log('Table "birth_applications" and indexes created successfully!');
  } catch (error) {
    console.error('Error creating birth_applications table:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initBirthDb();
