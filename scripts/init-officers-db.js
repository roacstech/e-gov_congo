const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:9r67qvymfrogs5jrd71l@147.93.30.32:5434/egov_congo_db?sslmode=disable'
});

async function initOfficersDb() {
  const client = await pool.connect();
  try {
    console.log('Connecting to PostgreSQL database to initialize service_officers table...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS service_officers (
        id SERIAL PRIMARY KEY,
        officer_id VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        service_id VARCHAR(100) NOT NULL,
        service_title VARCHAR(150) NOT NULL,
        ministry VARCHAR(200) NOT NULL,
        role VARCHAR(50) DEFAULT 'service_officer',
        is_active BOOLEAN DEFAULT TRUE,
        phone VARCHAR(50),
        email VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_officer_username ON service_officers(username);
      CREATE INDEX IF NOT EXISTS idx_officer_service_id ON service_officers(service_id);
    `);

    console.log('Table "service_officers" created successfully!');

    // Seed initial officer accounts if table is empty
    const checkRes = await client.query('SELECT COUNT(*) FROM service_officers');
    if (parseInt(checkRes.rows[0].count, 10) === 0) {
      console.log('Seeding initial officer accounts for key services...');
      const seedOfficers = [
        {
          officer_id: 'OFF-CNI-001',
          full_name: 'Agent Baudouin Ilunga',
          username: 'officer.cni',
          password: 'Cni@Kinshasa2026',
          service_id: 'cni-biometrique',
          service_title: 'Carte Nationale d\'Identité',
          ministry: 'Ministère de l\'Intérieur, Sécurité et Affaires Coutumières',
          role: 'service_officer',
          phone: '+243 81 234 5671',
          email: 'b.ilunga@interieur.gouv.cd',
        },
        {
          officer_id: 'OFF-PAS-002',
          full_name: 'Officier Mireille Kapinga',
          username: 'officer.passport',
          password: 'Pass@Dgm2026',
          service_id: 'passeport-ordinaire',
          service_title: 'Demande de Passeport Ordinaire',
          ministry: 'Ministère des Affaires Étrangères et Coopération Internationale',
          role: 'senior_officer',
          phone: '+243 82 345 6782',
          email: 'm.kapinga@dgm.gouv.cd',
        },
        {
          officer_id: 'OFF-PER-003',
          full_name: 'Inspecteur Alain Tshilombo',
          username: 'officer.driving',
          password: 'Permis@Rdc2026',
          service_id: 'permis-conduire',
          service_title: 'Permis de Conduire Sécurisé',
          ministry: 'Ministère des Transports, Voies de Communication et Désenclavement',
          role: 'service_officer',
          phone: '+243 84 456 7893',
          email: 'a.tshilombo@transports.gouv.cd',
        },
        {
          officer_id: 'OFF-EC-004',
          full_name: 'Officier d\'État Civil Jean-Paul Kalala',
          username: 'officer.birth',
          password: 'EtatCivil@2026',
          service_id: 'acte-naissance',
          service_title: 'Extrait d\'Acte de Naissance',
          ministry: 'Ministère de l\'Intérieur — Bureau Central d\'État Civil',
          role: 'registrar',
          phone: '+243 89 567 8904',
          email: 'jp.kalala@etatcivil.gouv.cd',
        },
        {
          officer_id: 'OFF-NAT-005',
          full_name: 'Conseiller Juridique Francine Mukendi',
          username: 'officer.nationality',
          password: 'Nationalite@2026',
          service_id: 'certificat-nationalite',
          service_title: 'Certificat de Nationalité Congolaise',
          ministry: 'Ministère de la Justice et Garde des Sceaux',
          role: 'legal_officer',
          phone: '+243 90 678 9015',
          email: 'f.mukendi@justice.gouv.cd',
        },
      ];

      for (const off of seedOfficers) {
        await client.query(
          `INSERT INTO service_officers 
            (officer_id, full_name, username, password, service_id, service_title, ministry, role, phone, email)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           ON CONFLICT (username) DO NOTHING`,
          [
            off.officer_id,
            off.full_name,
            off.username,
            off.password,
            off.service_id,
            off.service_title,
            off.ministry,
            off.role,
            off.phone,
            off.email,
          ]
        );
      }
      console.log('Seeded 5 initial service officers successfully!');
    }
  } catch (error) {
    console.error('Error initializing officers database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initOfficersDb();
