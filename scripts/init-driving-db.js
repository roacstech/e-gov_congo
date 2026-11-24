const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initDrivingDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL to initialize driving_license_applications table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS driving_license_applications (
        id SERIAL PRIMARY KEY,
        tracking_id TEXT NOT NULL,
        tracking_id_hash VARCHAR(64) NOT NULL,
        service_id VARCHAR(100) NOT NULL DEFAULT 'permis-conduire',
        service_title VARCHAR(255) NOT NULL DEFAULT 'Permis de Conduire Sécurisé',
        application_type VARCHAR(50) NOT NULL DEFAULT 'new',
        license_category VARCHAR(10) NOT NULL DEFAULT 'B',
        previous_license_number VARCHAR(100),
        previous_issue_date VARCHAR(50),
        renewal_reason VARCHAR(150),
        applicant_surname VARCHAR(100) NOT NULL,
        applicant_post_name VARCHAR(100) NOT NULL,
        applicant_first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL DEFAULT 'M',
        birth_date VARCHAR(50) NOT NULL,
        birth_place VARCHAR(150) NOT NULL,
        nationality VARCHAR(100) DEFAULT 'Congolaise',
        id_number VARCHAR(100),
        blood_group VARCHAR(10) DEFAULT 'O+',
        profession VARCHAR(150),
        residence_address VARCHAR(255) NOT NULL,
        residence_city VARCHAR(100) NOT NULL DEFAULT 'Kinshasa',
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        delivery_center VARCHAR(255) NOT NULL,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Dossier officiel de permis de conduire enregistré. Contrôle médical et vérification des aptitudes en cours.',
        status_notes_en TEXT DEFAULT 'Official driving license dossier recorded. Medical qualification and biometric verification underway.',
        act_number TEXT,
        act_hash VARCHAR(64),
        approved_at TIMESTAMP WITH TIME ZONE,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_driving_tracking_hash ON driving_license_applications(tracking_id_hash);
      CREATE INDEX IF NOT EXISTS idx_driving_act_hash ON driving_license_applications(act_hash);
      CREATE INDEX IF NOT EXISTS idx_driving_status ON driving_license_applications(status);
      CREATE INDEX IF NOT EXISTS idx_driving_created_at ON driving_license_applications(created_at DESC);
    `);

    console.log('✅ driving_license_applications table and security indexes verified/created successfully.');
  } catch (err) {
    console.error('❌ Error initializing driving_license_applications table:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDrivingDb();
