import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { api } from "../api/api"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "patient" })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true)
    try {
      await api("/api/register", "POST", form)
      setSuccess("Account created! Redirecting to login...")
      setTimeout(() => navigate("/login"), 1500)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create account</h1>
        <p>Join the hospital management system</p>
        {error && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">{success}</div>}
        <div className="form-group"><label>Full Name</label><input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
        <div className="form-group"><label>Email</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
        <div className="form-group"><label>Password</label><input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
        <div className="form-group"><label>Role</label><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="patient">Patient</option><option value="doctor">Doctor</option><option value="admin">Admin</option><option value="staff">Staff</option></select></div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Creating account..." : "Create Account"}</button>
        <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  )
}
