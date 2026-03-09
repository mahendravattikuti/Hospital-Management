import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/api"

export default function DoctorDashboard() {
  const [tab, setTab] = useState("appointments")
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [presForm, setPresForm] = useState({ patient_id: "", appointment_id: "", medications: "", instructions: "", avoid_items: "" })
  const [statusForm, setStatusForm] = useState({ id: "", status: "confirmed" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")

  useEffect(() => { loadAppointments(); loadPrescriptions() }, [])

  const loadAppointments = async () => { try { setAppointments(await api("/api/appointments", "GET", null, token)) } catch (err) {} }
  const loadPrescriptions = async () => { try { setPrescriptions(await api("/api/prescriptions", "GET", null, token)) } catch (err) {} }

  const updateStatus = async () => {
    setError(""); setMessage("")
    try {
      await api("/api/appointments/"+statusForm.id+"/status", "PUT", { status: statusForm.status }, token)
      setMessage("Appointment "+statusForm.id+" updated to "+statusForm.status)
      setStatusForm({ id: "", status: "confirmed" })
      loadAppointments()
    } catch (err) { setError(err.message) }
  }

  const createPrescription = async () => {
    setError(""); setMessage("")
    try {
      await api("/api/prescriptions", "POST", { patient_id: parseInt(presForm.patient_id), appointment_id: parseInt(presForm.appointment_id)||null, medications: presForm.medications, instructions: presForm.instructions, avoid_items: presForm.avoid_items }, token)
      setMessage("Prescription created successfully!")
      setPresForm({ patient_id: "", appointment_id: "", medications: "", instructions: "", avoid_items: "" })
      loadPrescriptions()
    } catch (err) { setError(err.message) }
  }

  const logout = () => { localStorage.clear(); navigate("/login") }

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Hospital</h2>
        <div className="navbar-right"><span>Dr. {user?.name}</span><button className="logout-btn" onClick={logout}>Logout</button></div>
      </div>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">{appointments.length}</div><div className="stat-label">Total Appointments</div></div>
          <div className="stat-card"><div className="stat-number">{appointments.filter(a=>a.status==="confirmed").length}</div><div className="stat-label">Confirmed</div></div>
          <div className="stat-card"><div className="stat-number">{prescriptions.length}</div><div className="stat-label">Prescriptions Written</div></div>
        </div>
        <div className="tabs">
          {["appointments","prescriptions","update-status","new-prescription"].map(t=>(
            <button key={t} className={"tab "+(tab===t?"active":"")} onClick={()=>{ setTab(t); setMessage(""); setError("") }}>
              {t==="update-status"?"Update Status":t==="new-prescription"?"New Prescription":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}
        {tab==="appointments" && <div className="card"><h3>All Appointments</h3>{appointments.length===0?<p style={{color:"var(--muted)"}}>No appointments yet.</p>:<table><thead><tr><th>ID</th><th>Patient</th><th>Date</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>#{a.id}</td><td>{a.patient_name}</td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>}
        {tab==="prescriptions" && <div className="card"><h3>All Prescriptions</h3>{prescriptions.length===0?<p style={{color:"var(--muted)"}}>No prescriptions yet.</p>:prescriptions.map(p=><div key={p.id} style={{borderBottom:"1px solid var(--border)",paddingBottom:"1rem",marginBottom:"1rem"}}><strong>{p.patient_name}</strong><p><b>Medications:</b> {p.medications}</p>{p.instructions&&<p><b>Instructions:</b> {p.instructions}</p>}{p.avoid_items&&<p><b>Avoid:</b> {p.avoid_items}</p>}</div>)}</div>}
        {tab==="update-status" && <div className="card"><h3>Update Appointment Status</h3><div className="form-inline"><div className="form-group"><label>Appointment ID</label><input type="number" placeholder="Appointment ID" value={statusForm.id} onChange={e=>setStatusForm({...statusForm,id:e.target.value})} /></div><div className="form-group"><label>New Status</label><select value={statusForm.status} onChange={e=>setStatusForm({...statusForm,status:e.target.value})}><option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option></select></div></div><br/><button className="btn btn-success" onClick={updateStatus}>Update Status</button></div>}
        {tab==="new-prescription" && <div className="card"><h3>Write Prescription</h3><div className="form-inline"><div className="form-group"><label>Patient ID</label><input type="number" placeholder="Patient user ID" value={presForm.patient_id} onChange={e=>setPresForm({...presForm,patient_id:e.target.value})} /></div><div className="form-group"><label>Appointment ID (optional)</label><input type="number" placeholder="Appointment ID" value={presForm.appointment_id} onChange={e=>setPresForm({...presForm,appointment_id:e.target.value})} /></div></div><div className="form-group" style={{marginTop:"1rem"}}><label>Medications</label><input type="text" placeholder="e.g. Paracetamol 500mg" value={presForm.medications} onChange={e=>setPresForm({...presForm,medications:e.target.value})} /></div><div className="form-group"><label>Instructions</label><input type="text" placeholder="e.g. Take after meals" value={presForm.instructions} onChange={e=>setPresForm({...presForm,instructions:e.target.value})} /></div><div className="form-group"><label>Avoid Items</label><input type="text" placeholder="e.g. Alcohol" value={presForm.avoid_items} onChange={e=>setPresForm({...presForm,avoid_items:e.target.value})} /></div><button className="btn btn-primary" onClick={createPrescription}>Create Prescription</button></div>}
      </div>
    </div>
  )
}
