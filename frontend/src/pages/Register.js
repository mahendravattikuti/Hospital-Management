import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { api } from "../api/api"
export default function Register() {
  const [form, setForm] = useState({ name:"",email:"",password:"",role:"patient" })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true)
    try { await api("/api/register","POST",form); setSuccess("Account created! Redirecting..."); setTimeout(()=>navigate("/login"),1500) }
    catch(err){ setError(err.message) }
    finally{ setLoading(false) }
  }
  const roles=[{value:"patient",label:"Patient",icon:"person"},{value:"doctor",label:"Doctor",icon:"stethoscope"},{value:"admin",label:"Admin",icon:"admin_panel_settings"}]
  return (
    <div className="auth-page">
      <nav className="auth-nav">
        <div className="auth-nav-brand"><div className="brand-icon"><span className="material-symbols-outlined">medical_services</span></div><span className="brand-name">CareSync HMS</span></div>
        <div className="auth-nav-links"><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Home</button><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>About</button><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Contact</button><Link to="/login" className="btn-outline">Login</Link></div>
      </nav>
      <div className="auth-main">
        <div className="auth-grid">
          <div className="auth-hero">
            <div className="auth-badge"><span className="material-symbols-outlined">verified_user</span>Secure Healthcare Portal</div>
            <h1>Streamlining healthcare for a <span>healthier tomorrow.</span></h1>
            <p>Join thousands of healthcare professionals and patients. Access medical records, schedule appointments, and manage prescriptions seamlessly.</p>
            <div className="auth-feature-grid">
              <div className="auth-feature-card"><span className="material-symbols-outlined">speed</span><h4>Fast Setup</h4><p>Get started in under 2 minutes.</p></div>
              <div className="auth-feature-card"><span className="material-symbols-outlined">security</span><h4>HIPAA Compliant</h4><p>Your data is always encrypted.</p></div>
              <div className="auth-feature-card"><span className="material-symbols-outlined">calendar_month</span><h4>Easy Scheduling</h4><p>Book appointments in seconds.</p></div>
              <div className="auth-feature-card"><span className="material-symbols-outlined">prescriptions</span><h4>Digital Records</h4><p>All your records in one place.</p></div>
            </div>
          </div>
          <div className="auth-card">
            <h2>Create Account</h2><p>Enter your details to register as a member.</p>
            {error && <div className="alert alert-error" style={{marginTop:"1rem"}}>{error}</div>}
            {success && <div className="alert alert-success" style={{marginTop:"1rem"}}>{success}</div>}
            <div style={{marginTop:"1.5rem"}}>
              <div style={{marginBottom:"1.25rem"}}>
                <div className="form-label">I am a...</div>
                <div className="role-selector" style={{marginTop:".5rem"}}>
                  {roles.map(r=>(
                    <label key={r.value} className="role-option">
                      <input type="radio" name="role" value={r.value} checked={form.role===r.value} onChange={()=>setForm({...form,role:r.value})} />
                      <div className="role-option-label"><span className="material-symbols-outlined">{r.icon}</span>{r.label}</div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><div className="form-label">Full Name</div><div className="input-wrap"><span className="material-symbols-outlined">person</span><input type="text" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div></div>
              <div className="form-group"><div className="form-label">Email Address</div><div className="input-wrap"><span className="material-symbols-outlined">mail</span><input type="email" placeholder="john@example.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div></div>
              <div className="form-group">
                <div className="form-label">Password</div>
                <div className="input-wrap"><span className="material-symbols-outlined">lock</span><input type={showPw?"text":"password"} placeholder="��������" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><button className="toggle-pw" onClick={()=>setShowPw(!showPw)}><span className="material-symbols-outlined">{showPw?"visibility_off":"visibility"}</span></button></div>
              </div>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{marginTop:".5rem"}}>{loading?"Creating...":"Create Account"}<span className="material-symbols-outlined">arrow_forward</span></button>
              <div className="divider">Already have an account?</div>
              <div className="auth-footer-link"><Link to="/login">Sign in to your dashboard</Link></div>
            </div>
          </div>
        </div>
      </div>
      <footer className="auth-page-footer"><p>© 2024 CareSync HMS. All rights reserved.</p><div className="auth-page-footer-links"><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Privacy</button><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Terms</button><button onClick={()=>{}} style={{background:'none',border:'none',cursor:'pointer',color:'inherit'}}>Help</button></div></footer>
    </div>
  )
}
