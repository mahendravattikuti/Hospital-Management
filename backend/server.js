const express = require("express")
const cors = require("cors")
const db = require("./db/db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const app = express()
const JWT_SECRET = process.env.JWT_SECRET || "hospital_secret"
app.use(cors())
app.use(express.json())

app.get("/", (req, res) => { res.send("Hospital API running") })

app.post("/api/register", async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) return res.status(400).json({ message: "All fields are required" })
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: err.message })
    if (user) return res.status(400).json({ message: "Email already registered" })
    try {
      const hashedPassword = await bcrypt.hash(password, 10)
      db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, role], function (err) {
        if (err) return res.status(500).json({ message: err.message })
        res.json({ message: "User registered successfully", userId: this.lastID })
      })
    } catch (err) { res.status(500).json({ message: "Server error" }) }
  })
})

app.post("/api/login", (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: "Email and password are required" })
  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ message: err.message })
    if (!user) return res.status(401).json({ message: "Invalid email or password" })
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" })
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "1d" })
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
  })
})

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

app.get("/users", authenticateToken, authorizeRole("admin"), (req, res) => {
  db.all("SELECT id, name, email, role, created_at FROM users", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

app.get("/api/me", authenticateToken, (req, res) => { res.json({ user: req.user }) })
app.get("/api/doctor-dashboard", authenticateToken, authorizeRole("doctor"), (req, res) => { res.json({ message: `Welcome Doctor ${req.user.email}.` }) })
app.get("/api/admin-dashboard", authenticateToken, authorizeRole("admin"), (req, res) => { res.json({ message: "Welcome Admin." }) })

app.post("/api/appointments", authenticateToken, authorizeRole("patient"), (req, res) => {
  const { doctor_id, appointment_date } = req.body
  const patient_id = req.user.id
  if (!doctor_id || !appointment_date) return res.status(400).json({ message: "doctor_id and appointment_date are required" })
  db.get("SELECT * FROM users WHERE id = ? AND role = 'doctor'", [doctor_id], (err, doctor) => {
    if (err) return res.status(500).json({ message: err.message })
    if (!doctor) return res.status(404).json({ message: "Doctor not found" })
    db.run("INSERT INTO appointments (doctor_id, patient_id, appointment_date, status) VALUES (?, ?, ?, 'pending')", [doctor_id, patient_id, appointment_date], function (err) {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ message: "Appointment booked successfully", appointmentId: this.lastID })
    })
  })
})

app.get("/api/appointments", authenticateToken, authorizeRole("admin", "doctor"), (req, res) => {
  db.all("SELECT a.id, a.appointment_date, a.status, u_patient.name AS patient_name, u_doctor.name AS doctor_name FROM appointments a JOIN users u_patient ON a.patient_id = u_patient.id JOIN users u_doctor ON a.doctor_id = u_doctor.id ORDER BY a.appointment_date DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

app.get("/api/my-appointments", authenticateToken, authorizeRole("patient"), (req, res) => {
  db.all("SELECT a.id, a.appointment_date, a.status, u_doctor.name AS doctor_name FROM appointments a JOIN users u_doctor ON a.doctor_id = u_doctor.id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

app.put("/api/appointments/:id/status", authenticateToken, authorizeRole("admin", "doctor"), (req, res) => {
  const { status } = req.body
  if (!["pending", "confirmed", "cancelled"].includes(status)) return res.status(400).json({ message: "Invalid status" })
  db.run("UPDATE appointments SET status = ? WHERE id = ?", [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ message: err.message })
    if (this.changes === 0) return res.status(404).json({ message: "Appointment not found" })
    res.json({ message: `Appointment ${req.params.id} status updated to ${status}` })
  })
})

app.post("/api/prescriptions", authenticateToken, authorizeRole("doctor"), (req, res) => {
  const { patient_id, appointment_id, medications, instructions, avoid_items } = req.body
  const doctor_id = req.user.id
  if (!patient_id || !medications) return res.status(400).json({ message: "patient_id and medications are required" })
  db.get("SELECT * FROM users WHERE id = ? AND role = 'patient'", [patient_id], (err, patient) => {
    if (err) return res.status(500).json({ message: err.message })
    if (!patient) return res.status(404).json({ message: "Patient not found" })
    db.run("INSERT INTO prescriptions (doctor_id, patient_id, appointment_id, medications, instructions, avoid_items) VALUES (?, ?, ?, ?, ?, ?)", [doctor_id, patient_id, appointment_id || null, medications, instructions || null, avoid_items || null], function (err) {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ message: "Prescription created successfully", prescriptionId: this.lastID })
    })
  })
})

app.get("/api/prescriptions", authenticateToken, authorizeRole("admin", "doctor"), (req, res) => {
  db.all("SELECT p.id, p.medications, p.instructions, p.avoid_items, p.created_at, u_patient.name AS patient_name, u_doctor.name AS doctor_name FROM prescriptions p JOIN users u_patient ON p.patient_id = u_patient.id JOIN users u_doctor ON p.doctor_id = u_doctor.id ORDER BY p.created_at DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

app.get("/api/my-prescriptions", authenticateToken, authorizeRole("patient"), (req, res) => {
  db.all("SELECT p.id, p.medications, p.instructions, p.avoid_items, p.created_at, u_doctor.name AS doctor_name FROM prescriptions p JOIN users u_doctor ON p.doctor_id = u_doctor.id WHERE p.patient_id = ? ORDER BY p.created_at DESC", [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// PAYMENTS ROUTES

// Patient makes a payment
app.post("/api/payments", authenticateToken, authorizeRole("patient"), (req, res) => {
  const { appointment_id, amount, payment_method } = req.body
  const patient_id = req.user.id

  if (!appointment_id || !amount || !payment_method) {
    return res.status(400).json({ message: "appointment_id, amount and payment_method are required" })
  }

  // Check appointment exists and belongs to this patient
  db.get("SELECT * FROM appointments WHERE id = ? AND patient_id = ?", [appointment_id, patient_id], (err, appointment) => {
    if (err) return res.status(500).json({ message: err.message })
    if (!appointment) return res.status(404).json({ message: "Appointment not found or does not belong to you" })

    // Check not already paid
    db.get("SELECT * FROM payments WHERE appointment_id = ?", [appointment_id], (err, existing) => {
      if (err) return res.status(500).json({ message: err.message })
      if (existing) return res.status(400).json({ message: "Payment already made for this appointment" })

      const transaction_id = "TXN" + Date.now()

      db.run("INSERT INTO payments (patient_id, appointment_id, amount, payment_method, payment_status, transaction_id) VALUES (?, ?, ?, ?, 'completed', ?)",
        [patient_id, appointment_id, amount, payment_method, transaction_id],
        function (err) {
          if (err) return res.status(500).json({ message: err.message })
          res.json({ message: "Payment successful", paymentId: this.lastID, transaction_id })
        }
      )
    })
  })
})

// Admin - view all payments
app.get("/api/payments", authenticateToken, authorizeRole("admin"), (req, res) => {
  const sql = `
    SELECT p.id, p.amount, p.payment_method, p.payment_status, p.transaction_id,
      u.name AS patient_name, u.email AS patient_email,
      a.appointment_date
    FROM payments p
    JOIN users u ON p.patient_id = u.id
    JOIN appointments a ON p.appointment_id = a.id
    ORDER BY p.id DESC
  `
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})

// Patient - view own payments
app.get("/api/my-payments", authenticateToken, authorizeRole("patient"), (req, res) => {
  const sql = `
    SELECT p.id, p.amount, p.payment_method, p.payment_status, p.transaction_id,
      a.appointment_date,
      u_doctor.name AS doctor_name
    FROM payments p
    JOIN appointments a ON p.appointment_id = a.id
    JOIN users u_doctor ON a.doctor_id = u_doctor.id
    WHERE p.patient_id = ?
    ORDER BY p.id DESC
  `
  db.all(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(rows)
  })
})
