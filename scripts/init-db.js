const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to live PostgreSQL database to initialize tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS national_id_applications (
        id SERIAL PRIMARY KEY,
        tracking_id VARCHAR(50) UNIQUE NOT NULL,
        service_id VARCHAR(50) NOT NULL DEFAULT 'cni',
        service_title VARCHAR(150) NOT NULL DEFAULT 'Carte Nationale d''Identité',
        applicant_name VARCHAR(200) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        post_name VARCHAR(100) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        birth_date VARCHAR(20) NOT NULL,
        birth_city VARCHAR(100) NOT NULL,
        marital_status VARCHAR(50) NOT NULL,
        nationality_origin VARCHAR(50) NOT NULL,
        father_full_name VARCHAR(150),
        father_nationality VARCHAR(50) DEFAULT 'Congolaise',
        father_id_number VARCHAR(100),
        mother_full_name VARCHAR(150),
        mother_nationality VARCHAR(50) DEFAULT 'Congolaise',
        mother_id_number VARCHAR(100),
        origin_province VARCHAR(100),
        origin_territory VARCHAR(100),
        origin_sector VARCHAR(100),
        residence_province VARCHAR(100),
        residence_city VARCHAR(100),
        residence_address TEXT,
        phone VARCHAR(50),
        email VARCHAR(150),
        occupation VARCHAR(150),
        photo_url TEXT,
        supporting_documents JSONB DEFAULT '[]'::jsonb,
        declaration_agreed BOOLEAN DEFAULT TRUE,
        status VARCHAR(50) DEFAULT 'submitted',
        status_notes_fr TEXT DEFAULT 'Dossier officiel enregistré. Contrôle de filiation et validation d''état civil en cours.',
        status_notes_en TEXT DEFAULT 'Official dossier registered. Lineage verification and civil registry review underway.',
        collection_point VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_cni_tracking_id ON national_id_applications(tracking_id);
      CREATE INDEX IF NOT EXISTS idx_cni_status ON national_id_applications(status);
      CREATE INDEX IF NOT EXISTS idx_cni_created_at ON national_id_applications(created_at DESC);
    `);

    console.log('Table "national_id_applications" created successfully on live PostgreSQL database!');
  } catch (error) {
    console.error('Error creating database table:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDb();
