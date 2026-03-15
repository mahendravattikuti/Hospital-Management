require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { Pool } = require("pg")

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || "hospital_secret"

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

pool.on("connect", () => {
  console.log("Connected to Supabase PostgreSQL database")
})

app.use(cors())
app.use(express.json())

// Initialize tables
const initDB = async () => {
  try {
    await pool.query(`
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
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        specialization TEXT,
        experience INTEGER,
        consultation_fee INTEGER
      );

      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        age INTEGER,
        gender TEXT,
        blood_group TEXT,
        allergies TEXT,
        medical_history TEXT
      );

      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        appointment_date TIMESTAMP,
        status TEXT DEFAULT 'pending'
      );

      CREATE TABLE IF NOT EXISTS prescriptions (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        medications TEXT,
        instructions TEXT,
        avoid_items TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        appointment_id INTEGER REFERENCES appointments(id) ON DELETE CASCADE,
        amount INTEGER,
        payment_method TEXT,
        payment_status TEXT,
        transaction_id TEXT
      );

      CREATE TABLE IF NOT EXISTS doctor_availability (
        id SERIAL PRIMARY KEY,
        doctor_id INTEGER REFERENCES doctors(id) ON DELETE CASCADE,
        available_date DATE,
        start_time TEXT,
        end_time TEXT
      );
    `)
    console.log("Database tables initialized")
  } catch (err) {
    console.error("Error initializing database:", err.message)
  }
}

initDB()

// Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." })
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" })
    req.user = user
    next()
  })
}

const authorizeRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: `Access denied. Required role: ${roles.join(" or ")}` })
  next()
}

// Routes
app.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields are required" })
  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userCheck.rows.length > 0) return res.status(400).json({ message: "Email already registered" })
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query("INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id", [name, email, hashedPassword, role])
    res.status(201).json({ message: "User registered successfully", userId: result.rows[0].id })
  } catch (err) {
    console.error("Registration error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

app.post("/login", async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" })
  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (userResult.rows.length === 0) return res.status(401).json({ message: "Invalid email or password" })
    const user = userResult.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" })
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" })
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  } catch (err) {
    console.error("Login error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

app.get("/me", authenticateToken, (req, res) => {
  res.json({ user: req.user })
})

app.get("/users", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role, created_at FROM users")
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching users:", err)
    res.status(500).json({ message: err.message })
  }
})

app.post("/appointments", authenticateToken, authorizeRole("patient"), async (req, res) => {
  const { doctor_id, appointment_date } = req.body
  const patient_id = req.user.id
  if (!doctor_id || !appointment_date) return res.status(400).json({ message: "doctor_id and appointment_date are required" })
  try {
    const doctorCheck = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'doctor'", [doctor_id])
    if (doctorCheck.rows.length === 0) return res.status(404).json({ message: "Doctor not found" })
    const result = await pool.query("INSERT INTO appointments (doctor_id, patient_id, appointment_date, status) VALUES ($1, $2, $3, 'pending') RETURNING id", [doctor_id, patient_id, appointment_date])
    res.json({ message: "Appointment booked successfully", appointmentId: result.rows[0].id })
  } catch (err) {
    console.error("Error booking appointment:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/appointments", authenticateToken, authorizeRole("admin", "doctor"), async (req, res) => {
  try {
    const result = await pool.query("SELECT a.id, a.appointment_date, a.status, u_patient.name AS patient_name, u_doctor.name AS doctor_name FROM appointments a JOIN users u_patient ON a.patient_id = u_patient.id JOIN users u_doctor ON a.doctor_id = u_doctor.id ORDER BY a.appointment_date DESC")
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching appointments:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/my-appointments", authenticateToken, authorizeRole("patient"), async (req, res) => {
  try {
    const result = await pool.query("SELECT a.id, a.appointment_date, a.status, u_doctor.name AS doctor_name FROM appointments a JOIN users u_doctor ON a.doctor_id = u_doctor.id WHERE a.patient_id = $1 ORDER BY a.appointment_date DESC", [req.user.id])
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching appointments:", err)
    res.status(500).json({ message: err.message })
  }
})

app.put("/appointments/:id/status", authenticateToken, authorizeRole("admin", "doctor"), async (req, res) => {
  const { status } = req.body
  if (!["pending", "confirmed", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid status" })
  try {
    const result = await pool.query("UPDATE appointments SET status = $1 WHERE id = $2", [status, req.params.id])
    if (result.rowCount === 0) return res.status(404).json({ message: "Appointment not found" })
    res.json({ message: `Appointment ${req.params.id} status updated to ${status}` })
  } catch (err) {
    console.error("Error updating appointment:", err)
    res.status(500).json({ message: err.message })
  }
})

app.post("/prescriptions", authenticateToken, authorizeRole("doctor"), async (req, res) => {
  const { patient_id, appointment_id, medications, instructions, avoid_items } = req.body
  const doctor_id = req.user.id
  if (!patient_id || !medications) return res.status(400).json({ message: "patient_id and medications are required" })
  try {
    const patientCheck = await pool.query("SELECT * FROM users WHERE id = $1 AND role = 'patient'", [patient_id])
    if (patientCheck.rows.length === 0) return res.status(404).json({ message: "Patient not found" })
    const result = await pool.query("INSERT INTO prescriptions (doctor_id, patient_id, appointment_id, medications, instructions, avoid_items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", [doctor_id, patient_id, appointment_id || null, medications, instructions || null, avoid_items || null])
    res.json({ message: "Prescription created successfully", prescriptionId: result.rows[0].id })
  } catch (err) {
    console.error("Error creating prescription:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/prescriptions", authenticateToken, authorizeRole("admin", "doctor"), async (req, res) => {
  try {
    const result = await pool.query("SELECT p.id, p.medications, p.instructions, p.avoid_items, p.created_at, u_patient.name AS patient_name, u_doctor.name AS doctor_name FROM prescriptions p JOIN users u_patient ON p.patient_id = u_patient.id JOIN users u_doctor ON p.doctor_id = u_doctor.id ORDER BY p.created_at DESC")
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching prescriptions:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/my-prescriptions", authenticateToken, authorizeRole("patient"), async (req, res) => {
  try {
    const result = await pool.query("SELECT p.id, p.medications, p.instructions, p.avoid_items, p.created_at, u_doctor.name AS doctor_name FROM prescriptions p JOIN users u_doctor ON p.doctor_id = u_doctor.id WHERE p.patient_id = $1 ORDER BY p.created_at DESC", [req.user.id])
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching prescriptions:", err)
    res.status(500).json({ message: err.message })
  }
})

app.post("/payments", authenticateToken, authorizeRole("patient"), async (req, res) => {
  const { appointment_id, amount, payment_method } = req.body
  const patient_id = req.user.id
  if (!appointment_id || !amount || !payment_method) return res.status(400).json({ message: "appointment_id, amount and payment_method are required" })
  try {
    const appointmentCheck = await pool.query("SELECT * FROM appointments WHERE id = $1 AND patient_id = $2", [appointment_id, patient_id])
    if (appointmentCheck.rows.length === 0) return res.status(404).json({ message: "Appointment not found" })
    const result = await pool.query("INSERT INTO payments (patient_id, appointment_id, amount, payment_method, payment_status, transaction_id) VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id", [patient_id, appointment_id, amount, payment_method, `TXN_${Date.now()}`])
    res.json({ message: "Payment initiated successfully", paymentId: result.rows[0].id })
  } catch (err) {
    console.error("Error creating payment:", err)
    res.status(500).json({ message: err.message })
  }
})

app.get("/payments", authenticateToken, authorizeRole("admin"), async (req, res) => {
  try {
    const result = await pool.query("SELECT p.id, p.amount, p.payment_method, p.payment_status, p.transaction_id, u.name AS patient_name FROM payments p JOIN users u ON p.patient_id = u.id ORDER BY p.id DESC")
    res.json(result.rows)
  } catch (err) {
    console.error("Error fetching payments:", err)
    res.status(500).json({ message: err.message })
  }
})

module.exports = app
