const sqlite3 = require("sqlite3").verbose()

const db = new sqlite3.Database("./hospital.db", (err) => {
  if (err) {
    console.error(err.message)
  } else {
    console.log("Connected to SQLite database")
  }
})

// ✅ Create tables first, then export
db.exec(`
-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 name TEXT NOT NULL,
 email TEXT UNIQUE NOT NULL,
 password TEXT NOT NULL,
 role TEXT CHECK(role IN ('admin','doctor','patient','staff')) NOT NULL,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 specialization TEXT,
 experience INTEGER,
 consultation_fee INTEGER,
 FOREIGN KEY(user_id) REFERENCES users(id)
);

-- PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 age INTEGER,
 gender TEXT,
 blood_group TEXT,
 allergies TEXT,
 medical_history TEXT,
 FOREIGN KEY(user_id) REFERENCES users(id)
);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 doctor_id INTEGER,
 patient_id INTEGER,
 appointment_date DATETIME,
 status TEXT DEFAULT 'pending',
 FOREIGN KEY(doctor_id) REFERENCES doctors(id),
 FOREIGN KEY(patient_id) REFERENCES patients(id)
);

-- PRESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS prescriptions (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 doctor_id INTEGER,
 patient_id INTEGER,
 appointment_id INTEGER,
 medications TEXT,
 instructions TEXT,
 avoid_items TEXT,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
 FOREIGN KEY(doctor_id) REFERENCES doctors(id),
 FOREIGN KEY(patient_id) REFERENCES patients(id),
 FOREIGN KEY(appointment_id) REFERENCES appointments(id)
);

-- PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 patient_id INTEGER,
 appointment_id INTEGER,
 amount INTEGER,
 payment_method TEXT,
 payment_status TEXT,
 transaction_id TEXT,
 FOREIGN KEY(patient_id) REFERENCES patients(id),
 FOREIGN KEY(appointment_id) REFERENCES appointments(id)
);

-- DOCTOR AVAILABILITY TABLE
CREATE TABLE IF NOT EXISTS doctor_availability (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 doctor_id INTEGER,
 available_date DATE,
 start_time TEXT,
 end_time TEXT,
 FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);
`)

// ✅ Only ONE module.exports at the end
module.exports = db