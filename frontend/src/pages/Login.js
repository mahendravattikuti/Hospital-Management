import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { api } from "../api/api"
export default function Login() {
  const [form, setForm] = useState({ email:"", password:"" })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async () => {
    setError(""); setLoading(true)
    try {
      const data = await api("/api/login","POST",form)
      localStorage.setItem("token",data.token)
      localStorage.setItem("user",JSON.stringify(data.user))
      if(data.user.role==="patient") navigate("/patient")
      else if(data.user.role==="doctor") navigate("/doctor")
      else navigate("/admin")
    } catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }
  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <div className="auth-nav-brand"><div className="brand-icon"><span className="material-symbols-outlined">local_hospital</span></div><span className="brand-name">HMS Portal</span></div>
        <div className="auth-nav-links"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a><Link to="/register" className="btn-outline">Register</Link></div>
      </nav>
      <div className="auth-main">
        <div className="auth-card" style={{maxWidth:480,margin:"0 auto"}}>
          <div className="auth-card-banner"><span className="material-symbols-outlined">health_and_safety</span></div>
          <h2>Welcome Back</h2><p>Access your medical management dashboard</p>
          {error && <div className="alert alert-error" style={{marginTop:"1rem"}}>{error}</div>}
          <div style={{marginTop:"1.5rem"}}>
            <div className="form-group">
              <div className="form-label">Email Address</div>
              <div className="input-wrap"><span className="material-symbols-outlined">mail</span><input type="email" placeholder="doctor@hospital.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /></div>
            </div>
            <div className="form-group">
              <div className="form-label">Password<a href="#">Forgot?</a></div>
              <div className="input-wrap"><span className="material-symbols-outlined">lock</span><input type={showPw?"text":"password"} placeholder="Enter your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} /><button className="toggle-pw" onClick={()=>setShowPw(!showPw)}><span className="material-symbols-outlined">{showPw?"visibility_off":"visibility"}</span></button></div>
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>{loading?"Signing in...":"Sign In"}<span className="material-symbols-outlined">login</span></button>
            <div className="divider">or</div>
            <div className="auth-footer-link">New to the system? <Link to="/register">Register your account</Link></div>
          </div>
        </div>
      </div>
      <footer className="auth-page-footer"><p>© 2024 City General Hospital Management System. All rights reserved.</p><div className="auth-page-footer-links"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a><a href="#">Help Center</a></div></footer>
    </div>
  )
}
