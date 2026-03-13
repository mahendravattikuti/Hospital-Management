import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { api } from "../api/api"
import { Sidebar, Topbar } from "./Layout"
export default function DoctorDashboard() {
  const location = useLocation()
  const [tab, setTab] = useState(new URLSearchParams(location.search).get("tab")||"dashboard")
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [presForm, setPresForm] = useState({ patient_id:"",appointment_id:"",medications:"",instructions:"",avoid_items:"" })
  const [statusForm, setStatusForm] = useState({ id:"",status:"confirmed" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user")||"{}")
  useEffect(()=>{ setTab(new URLSearchParams(location.search).get("tab")||"dashboard") },[location.search])
  // eslint-disable-next-line
  useEffect(()=>{ loadAll() },[])
  const loadAll = () => {
    api("/api/appointments","GET",null,token).then(setAppointments).catch(()=>{})
    api("/api/prescriptions","GET",null,token).then(setPrescriptions).catch(()=>{})
  }
  const updateStatus = async () => {
    setError(""); setMessage("")
    try { await api(`/api/appointments/${statusForm.id}/status`,"PUT",{status:statusForm.status},token); setMessage(`Appointment #${statusForm.id} updated to ${statusForm.status}`); setStatusForm({id:"",status:"confirmed"}); loadAll() }
    catch(err){ setError(err.message) }
  }
  const createPrescription = async () => {
    setError(""); setMessage("")
    try { await api("/api/prescriptions","POST",{ patient_id:parseInt(presForm.patient_id),appointment_id:presForm.appointment_id?parseInt(presForm.appointment_id):null,medications:presForm.medications,instructions:presForm.instructions,avoid_items:presForm.avoid_items },token); setMessage("Prescription created!"); setPresForm({patient_id:"",appointment_id:"",medications:"",instructions:"",avoid_items:""}); loadAll() }
    catch(err){ setError(err.message) }
  }
  const confirmed=appointments.filter(a=>a.status==="confirmed").length
  const pending=appointments.filter(a=>a.status==="pending").length
  const initials = user.name ? user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "U"
  return (
    <div className="dashboard">
      <Sidebar active={tab} role="doctor" />
      <div className="main">
        <Topbar />
        <div className="page">
          {tab==="dashboard" && <>
            <div className="page-header"><div><div className="page-title">Doctor Dashboard</div><div className="page-subtitle">Welcome, Dr. {user.name}</div></div></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">calendar_month</span></div><span className="stat-badge up">+8%</span></div><div className="stat-label">Total Appointments</div><div className="stat-value">{appointments.length}</div><div className="stat-sub">{pending} pending</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">event_available</span></div></div><div className="stat-label">Confirmed</div><div className="stat-value">{confirmed}</div><div className="stat-sub">Ready to see</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">prescriptions</span></div></div><div className="stat-label">Prescriptions Written</div><div className="stat-value">{prescriptions.length}</div></div>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><div className="card-title">Upcoming Appointments</div><button className="card-action" onClick={()=>navigate("/doctor?tab=appointments")}>View All</button></div>
                {appointments.length===0?<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No appointments.</p>:
                <div className="upcoming-list">{appointments.slice(0,3).map(a=>{ const d=new Date(a.appointment_date); return (
                  <div className="upcoming-item" key={a.id}>
                    <div className="upcoming-date"><span className="month">{d.toLocaleString("default",{month:"short"})}</span><span className="day">{d.getDate()}</span></div>
                    <div className="upcoming-info"><div className="upcoming-name">{a.patient_name}</div><div className="upcoming-time">{d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div></div>
                    <span className={"badge badge-"+a.status}>{a.status}</span>
                  </div>)})}</div>}
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Recent Prescriptions</div><button className="card-action" onClick={()=>navigate("/doctor?tab=prescriptions")}>View All</button></div>
                {prescriptions.length===0?<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No prescriptions yet.</p>:prescriptions.slice(0,3).map(p=><div key={p.id} style={{borderBottom:"1px solid var(--border)",paddingBottom:".75rem",marginBottom:".75rem"}}><div style={{fontWeight:600,fontSize:".875rem"}}>{p.patient_name}</div><div style={{fontSize:".78rem",color:"var(--text-muted)"}}>{p.medications}</div></div>)}
              </div>
            </div>
          </>}
          {tab==="appointments" && <>
            <div className="page-header"><div><div className="page-title">All Appointments</div><div className="page-subtitle">Manage all patient appointments.</div></div><button className="btn-teal" onClick={()=>navigate("/doctor?tab=update-status")}><span className="material-symbols-outlined">edit</span>Update Status</button></div>
            <div className="card">{appointments.length===0?<p style={{color:"var(--text-muted)"}}>No appointments.</p>:<table><thead><tr><th>#</th><th>Patient</th><th>Date & Time</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td style={{color:"var(--text-faint)",fontSize:".78rem"}}>#{a.id}</td><td><div className="patient-name-cell"><div className="patient-avatar">{a.patient_name?.[0]}</div><span className="patient-name">{a.patient_name}</span></div></td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>
          </>}
          {tab==="update-status" && <>
            <div className="page-header"><div><div className="page-title">Update Appointment Status</div></div></div>
            {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
            <div className="card" style={{maxWidth:480}}>
              <div className="dash-form-group"><label className="dash-form-label">Appointment ID</label><input className="dash-input" type="number" placeholder="Enter appointment ID" value={statusForm.id} onChange={e=>setStatusForm({...statusForm,id:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">New Status</label><select className="dash-select" value={statusForm.status} onChange={e=>setStatusForm({...statusForm,status:e.target.value})}><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></select></div>
              <button className="btn-teal" onClick={updateStatus}><span className="material-symbols-outlined">edit_calendar</span>Update Status</button>
            </div>
          </>}
          {tab==="prescriptions" && <>
            <div className="page-header"><div><div className="page-title">Prescriptions</div><div className="page-subtitle">All prescriptions you have issued.</div></div><button className="btn-teal" onClick={()=>navigate("/doctor?tab=new-prescription")}><span className="material-symbols-outlined">add</span>New Prescription</button></div>
            {prescriptions.length===0?<div className="card"><p style={{color:"var(--text-muted)"}}>No prescriptions yet.</p></div>:prescriptions.map(p=><div className="card" key={p.id} style={{marginBottom:"1rem"}}><div className="card-header"><div><div className="card-title">{p.patient_name}</div><div className="card-subtitle">{p.created_at?new Date(p.created_at).toLocaleDateString():""}</div></div><span className="badge badge-confirmed">Issued</span></div><div style={{fontSize:".875rem"}}><strong>Medications:</strong> {p.medications}</div>{p.instructions&&<div style={{fontSize:".875rem",marginTop:".25rem"}}><strong>Instructions:</strong> {p.instructions}</div>}{p.avoid_items&&<div style={{fontSize:".875rem",marginTop:".25rem",color:"#dc2626"}}><strong>Avoid:</strong> {p.avoid_items}</div>}</div>)}
          </>}
          {tab==="new-prescription" && <>
            <div className="page-header"><div><div className="page-title">Create New Prescription</div></div></div>
            {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
            <div className="card" style={{maxWidth:600}}>
              <div className="form-row">
                <div className="dash-form-group"><label className="dash-form-label">Patient ID</label><input className="dash-input" type="number" placeholder="Patient user ID" value={presForm.patient_id} onChange={e=>setPresForm({...presForm,patient_id:e.target.value})} /></div>
                <div className="dash-form-group"><label className="dash-form-label">Appointment ID (optional)</label><input className="dash-input" type="number" placeholder="Appointment ID" value={presForm.appointment_id} onChange={e=>setPresForm({...presForm,appointment_id:e.target.value})} /></div>
              </div>
              <div className="dash-form-group"><label className="dash-form-label">Medications</label><input className="dash-input" type="text" placeholder="e.g. Paracetamol 500mg twice daily" value={presForm.medications} onChange={e=>setPresForm({...presForm,medications:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">Dosage Instructions</label><textarea className="dash-textarea" placeholder="Enter specific instructions..." value={presForm.instructions} onChange={e=>setPresForm({...presForm,instructions:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">Items to Avoid</label><input className="dash-input" type="text" placeholder="e.g. Alcohol, Dairy Products" value={presForm.avoid_items} onChange={e=>setPresForm({...presForm,avoid_items:e.target.value})} /></div>
              <div style={{display:"flex",gap:".75rem"}}><button className="btn-teal" onClick={createPrescription}><span className="material-symbols-outlined">save</span>Save Prescription</button><button className="btn-outline-slate" onClick={()=>navigate("/doctor?tab=prescriptions")}>Discard</button></div>
            </div>
          </>}
          {tab==="profile" && <>
            <div className="page-header"><div><div className="page-title">My Profile</div><div className="page-subtitle">Your account information.</div></div></div>
            <div className="grid-2">
              <div className="card">
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1.5rem 0",borderBottom:"1px solid var(--border)",marginBottom:"1.5rem"}}>
                  <div style={{width:80,height:80,borderRadius:"999px",background:"var(--primary-mid)",border:"3px solid var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",fontWeight:700,color:"#0d9488",marginBottom:"1rem"}}>{initials}</div>
                  <div style={{fontWeight:800,fontSize:"1.1rem"}}>Dr. {user.name}</div>
                  <span className="badge badge-doctor" style={{marginTop:".4rem"}}>Doctor</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                  {[{icon:"mail",label:"Email",value:user.email},{icon:"badge",label:"Role",value:"Doctor"},{icon:"calendar_month",label:"Total Appointments",value:appointments.length},{icon:"prescriptions",label:"Prescriptions Written",value:prescriptions.length},{icon:"event_available",label:"Confirmed",value:confirmed}].map((item,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:"1rem",padding:".75rem",background:"#f8fafc",borderRadius:"10px"}}>
                      <div style={{width:36,height:36,borderRadius:"8px",background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="material-symbols-outlined" style={{color:"#0d9488",fontSize:18}}>{item.icon}</span></div>
                      <div><div style={{fontSize:".72rem",color:"var(--text-faint)",fontWeight:600,textTransform:"uppercase",letterSpacing:".05em"}}>{item.label}</div><div style={{fontWeight:600,fontSize:".9rem"}}>{item.value}</div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Quick Actions</div></div>
                <div style={{display:"flex",flexDirection:"column",gap:".75rem"}}>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/doctor?tab=appointments")}><span className="material-symbols-outlined">calendar_month</span>View Appointments</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/doctor?tab=new-prescription")}><span className="material-symbols-outlined">add</span>New Prescription</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/doctor?tab=update-status")}><span className="material-symbols-outlined">edit_calendar</span>Update Status</button>
                  <button className="btn-outline-slate" style={{justifyContent:"flex-start"}} onClick={()=>{ localStorage.clear(); navigate("/login") }}><span className="material-symbols-outlined">logout</span>Logout</button>
                </div>
              </div>
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}
