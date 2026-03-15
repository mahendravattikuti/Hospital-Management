const pg = require('pg');

// PostgreSQL connection
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
});

client.connect().catch(err => console.error('Database connection error:', err));

// Create tables if they don't exist
const initializeDatabase = async () => {
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('admin','doctor','patient','staff')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        specialization TEXT,
        experience INTEGER,
        consultation_fee INTEGER
      );

      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        age INTEGER,
        gender TEXT,
        blood_group TEXT,
        allergies TEXT,
        medical_history TEXT
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id),
        patient_id INTEGER REFERENCES patients(id),
        appointment_date TIMESTAMP,
        status TEXT DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id),
        patient_id INTEGER REFERENCES patients(id),
        appointment_id INTEGER REFERENCES appointments(id),
        medications TEXT,
        instructions TEXT,
        avoid_items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id),
        appointment_id INTEGER REFERENCES appointments(id),
        amount INTEGER,
        payment_method TEXT,
        payment_status TEXT,
        transaction_id TEXT
      );

      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id),
        available_date DATE,
        start_time TEXT,
        end_time TEXT
      );
    `);
    console.log('Database tables initialized');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
};

initializeDatabase();

module.exports = client;
