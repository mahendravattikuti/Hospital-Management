import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { api } from "../api/api"

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError(""); setLoading(true)
    try {
      const data = await api("/api/login", "POST", form)
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (data.user.role === "patient") navigate("/patient")
      else if (data.user.role === "doctor") navigate("/doctor")
      else if (data.user.role === "admin") navigate("/admin")
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to your hospital account</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? "Signing in..." : "Sign In"}</button>
        <div className="auth-link">Do not have an account? <Link to="/register">Register</Link></div>
      </div>
    </div>
  )
}
