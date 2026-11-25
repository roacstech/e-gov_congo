const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initPassportDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize passport_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS passport_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'passeport-ordinaire',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Passeport Ordinaire',
        applicant_name VARCHAR(255) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        post_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        birth_date VARCHAR(50) NOT NULL,
        birth_city VARCHAR(150) NOT NULL,
        birth_country VARCHAR(150) DEFAULT 'République Démocratique du Congo',
        marital_status VARCHAR(50) NOT NULL,
        occupation VARCHAR(150),
        father_full_name VARCHAR(255),
        father_nationality VARCHAR(100) DEFAULT 'Congolaise',
        mother_full_name VARCHAR(255),
        mother_nationality VARCHAR(100) DEFAULT 'Congolaise',
        origin_province VARCHAR(100),
        origin_territory VARCHAR(100),
        residence_address TEXT,
        residence_city VARCHAR(100),
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        collection_point VARCHAR(255) NOT NULL,
        photo_url TEXT,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Dossier officiel enregistré. Contrôle de conformité documentaire et éligibilité passeport en cours.',
        status_notes_en TEXT DEFAULT 'Official dossier registered. Document compliance check and passport eligibility review underway.',
        passport_number TEXT,
        passport_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_passport_tracking_hash ON passport_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_passport_hash ON passport_applications(passport_hash);
      CREATE INDEX IF NOT EXISTS idx_passport_status ON passport_applications(status);
      CREATE INDEX IF NOT EXISTS idx_passport_created_at ON passport_applications(created_at DESC);
    `);

    console.log('Table "passport_applications" and indexes created successfully!');
  } catch (error) {
    console.error('Error creating database table:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initPassportDb();
