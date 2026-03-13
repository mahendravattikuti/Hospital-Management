import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { api } from "../api/api"
import { Sidebar, Topbar } from "./Layout"
export default function PatientDashboard() {
  const location = useLocation()
  const [tab, setTab] = useState(new URLSearchParams(location.search).get("tab")||"dashboard")
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [bookForm, setBookForm] = useState({ doctor_id:"",appointment_date:"" })
  const [payForm, setPayForm] = useState({ appointment_id:"",amount:"",payment_method:"card" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user")||"{}")
  useEffect(()=>{ setTab(new URLSearchParams(location.search).get("tab")||"dashboard") },[location.search])
  // eslint-disable-next-line
  useEffect(()=>{ loadAll() },[])
  const loadAll = () => {
    api("/api/my-appointments","GET",null,token).then(setAppointments).catch(()=>{})
    api("/api/my-prescriptions","GET",null,token).then(setPrescriptions).catch(()=>{})
    api("/api/my-payments","GET",null,token).then(setPayments).catch(()=>{})
  }
  const bookAppointment = async () => {
    setError(""); setMessage("")
    try { await api("/api/appointments","POST",{ doctor_id:parseInt(bookForm.doctor_id),appointment_date:bookForm.appointment_date },token); setMessage("Appointment booked!"); setBookForm({doctor_id:"",appointment_date:""}); loadAll() }
    catch(err){ setError(err.message) }
  }
  const makePayment = async () => {
    setError(""); setMessage("")
    try { const data = await api("/api/payments","POST",{ appointment_id:parseInt(payForm.appointment_id),amount:parseInt(payForm.amount),payment_method:payForm.payment_method },token); setMessage("Payment successful! TXN: "+data.transaction_id); setPayForm({appointment_id:"",amount:"",payment_method:"card"}); loadAll() }
    catch(err){ setError(err.message) }
  }
  const totalPaid = payments.reduce((s,p)=>s+p.amount,0)
  const confirmed = appointments.filter(a=>a.status==="confirmed").length
  const initials = user.name ? user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "U"
  return (
    <div className="dashboard">
      <Sidebar active={tab} role="patient" />
      <div className="main">
        <Topbar />
        <div className="page">
          {tab==="dashboard" && <>
            <div className="page-header"><div><div className="page-title">Dashboard</div><div className="page-subtitle">Welcome back, {user.name}</div></div></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">calendar_month</span></div><span className="stat-badge up">Active</span></div><div className="stat-label">Appointments</div><div className="stat-value">{appointments.length}</div><div className="stat-sub">{confirmed} confirmed</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">prescriptions</span></div></div><div className="stat-label">Prescriptions</div><div className="stat-value">{prescriptions.length}</div><div className="stat-sub">From your doctors</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">payments</span></div></div><div className="stat-label">Total Paid</div><div className="stat-value">Rs.{totalPaid}</div><div className="stat-sub">{payments.length} transactions</div></div>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><div className="card-title">Recent Appointments</div><button className="card-action" onClick={()=>navigate("/patient?tab=appointments")}>View All</button></div>
                {appointments.length===0?<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No appointments yet.</p>:
                <div className="upcoming-list">{appointments.slice(0,3).map(a=>{ const d=new Date(a.appointment_date); return (
                  <div className="upcoming-item" key={a.id}>
                    <div className="upcoming-date"><span className="month">{d.toLocaleString("default",{month:"short"})}</span><span className="day">{d.getDate()}</span></div>
                    <div className="upcoming-info"><div className="upcoming-name">Dr. {a.doctor_name}</div><div className="upcoming-time">{d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</div></div>
                    <span className={"badge badge-"+a.status}>{a.status}</span>
                  </div>)})}</div>}
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Recent Activity</div></div>
                <div className="activity-feed">
                  {appointments.slice(0,1).map(a=><div className="activity-item" key={"a"+a.id}><div className="activity-dot teal"><span className="material-symbols-outlined" style={{fontSize:16}}>calendar_month</span></div><div className="activity-content"><div className="activity-title-row"><span className="activity-title">Appointment Booked</span><span className="activity-time">{new Date(a.appointment_date).toLocaleDateString()}</span></div><div className="activity-desc">With Dr. {a.doctor_name} — {a.status}</div></div></div>)}
                  {prescriptions.slice(0,1).map(p=><div className="activity-item" key={"p"+p.id}><div className="activity-dot slate"><span className="material-symbols-outlined" style={{fontSize:16}}>prescriptions</span></div><div className="activity-content"><div className="activity-title-row"><span className="activity-title">Prescription Issued</span></div><div className="activity-desc">Dr. {p.doctor_name} — {p.medications}</div></div></div>)}
                  {payments.slice(0,1).map(p=><div className="activity-item" key={"py"+p.id}><div className="activity-dot slate"><span className="material-symbols-outlined" style={{fontSize:16}}>payment</span></div><div className="activity-content"><div className="activity-title-row"><span className="activity-title">Payment Confirmed</span></div><div className="activity-desc">Rs.{p.amount} — {p.transaction_id}</div></div></div>)}
                  {appointments.length===0&&prescriptions.length===0&&payments.length===0&&<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No recent activity.</p>}
                </div>
              </div>
            </div>
          </>}
          {tab==="appointments" && <>
            <div className="page-header"><div><div className="page-title">My Appointments</div><div className="page-subtitle">View and manage your scheduled appointments.</div></div><button className="btn-teal" onClick={()=>navigate("/patient?tab=book")}><span className="material-symbols-outlined">add</span>Book New</button></div>
            <div className="card">{appointments.length===0?<p style={{color:"var(--text-muted)"}}>No appointments yet.</p>:<table><thead><tr><th>#</th><th>Doctor</th><th>Date & Time</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td style={{color:"var(--text-faint)",fontSize:".78rem"}}>#{a.id}</td><td><div className="patient-name-cell"><div className="patient-avatar">{a.doctor_name?.[0]}</div><span className="patient-name">Dr. {a.doctor_name}</span></div></td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>
          </>}
          {tab==="book" && <>
            <div className="page-header"><div><div className="page-title">Book an Appointment</div><div className="page-subtitle">Schedule your consultation.</div></div></div>
            {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
            <div className="card" style={{maxWidth:560}}>
              <div className="card-header"><div className="card-title">Appointment Details</div></div>
              <div className="dash-form-group"><label className="dash-form-label">Doctor ID</label><input className="dash-input" type="number" placeholder="Enter doctor user ID" value={bookForm.doctor_id} onChange={e=>setBookForm({...bookForm,doctor_id:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">Date & Time</label><input className="dash-input" type="datetime-local" value={bookForm.appointment_date} onChange={e=>setBookForm({...bookForm,appointment_date:e.target.value})} /></div>
              <div style={{display:"flex",gap:".75rem"}}><button className="btn-teal" onClick={bookAppointment}><span className="material-symbols-outlined">calendar_month</span>Book Appointment</button><button className="btn-outline-slate" onClick={()=>navigate("/patient?tab=appointments")}>Cancel</button></div>
            </div>
          </>}
          {tab==="prescriptions" && <>
            <div className="page-header"><div><div className="page-title">My Prescriptions</div><div className="page-subtitle">View all prescriptions from your doctors.</div></div></div>
            {prescriptions.length===0?<div className="card"><p style={{color:"var(--text-muted)"}}>No prescriptions yet.</p></div>:prescriptions.map(p=><div className="card" key={p.id} style={{marginBottom:"1rem"}}><div className="card-header"><div><div className="card-title">Dr. {p.doctor_name}</div><div className="card-subtitle">{p.created_at?new Date(p.created_at).toLocaleDateString():""}</div></div><span className="badge badge-confirmed">Active</span></div><div style={{fontSize:".875rem"}}><strong>Medications:</strong> {p.medications}</div>{p.instructions&&<div style={{fontSize:".875rem",marginTop:".25rem"}}><strong>Instructions:</strong> {p.instructions}</div>}{p.avoid_items&&<div style={{fontSize:".875rem",marginTop:".25rem",color:"#dc2626"}}><strong>Avoid:</strong> {p.avoid_items}</div>}</div>)}
          </>}
          {tab==="payments" && <>
            <div className="page-header"><div><div className="page-title">Payment History</div><div className="page-subtitle">View all your billing records.</div></div><button className="btn-teal" onClick={()=>navigate("/patient?tab=pay")}><span className="material-symbols-outlined">add</span>Make Payment</button></div>
            <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">account_balance_wallet</span></div></div><div className="stat-label">Total Paid</div><div className="stat-value">Rs.{totalPaid}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">task_alt</span></div></div><div className="stat-label">Completed</div><div className="stat-value">{payments.filter(p=>p.payment_status==="completed").length}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">receipt</span></div></div><div className="stat-label">Transactions</div><div className="stat-value">{payments.length}</div></div>
            </div>
            <div className="card">{payments.length===0?<p style={{color:"var(--text-muted)"}}>No payments yet.</p>:<table><thead><tr><th>Doctor</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction ID</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>Dr. {p.doctor_name}</td><td style={{fontWeight:600}}>Rs.{p.amount}</td><td style={{textTransform:"capitalize"}}>{p.payment_method}</td><td><span className={"badge badge-"+p.payment_status}>{p.payment_status}</span></td><td style={{fontSize:".75rem",color:"var(--text-faint)"}}>{p.transaction_id}</td></tr>)}</tbody></table>}</div>
          </>}
          {tab==="pay" && <>
            <div className="page-header"><div><div className="page-title">Make Payment</div><div className="page-subtitle">Pay for your appointment.</div></div></div>
            {message&&<div className="alert alert-success">{message}</div>}{error&&<div className="alert alert-error">{error}</div>}
            <div className="card" style={{maxWidth:560}}>
              <div className="dash-form-group"><label className="dash-form-label">Appointment ID</label><input className="dash-input" type="number" placeholder="Enter appointment ID" value={payForm.appointment_id} onChange={e=>setPayForm({...payForm,appointment_id:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">Amount (Rs.)</label><input className="dash-input" type="number" placeholder="500" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} /></div>
              <div className="dash-form-group"><label className="dash-form-label">Payment Method</label><select className="dash-select" value={payForm.payment_method} onChange={e=>setPayForm({...payForm,payment_method:e.target.value})}><option value="card">Credit / Debit Card</option><option value="upi">UPI</option><option value="cash">Cash</option></select></div>
              <div style={{display:"flex",gap:".75rem"}}><button className="btn-teal" onClick={makePayment}><span className="material-symbols-outlined">payments</span>Pay Now</button><button className="btn-outline-slate" onClick={()=>navigate("/patient?tab=payments")}>Cancel</button></div>
            </div>
          </>}
          {tab==="razorpay" && <div className="card coming-soon">
            <div style={{fontSize:"3rem",marginBottom:"1rem"}}>??</div>
            <h3>Razorpay Payments</h3>
            <p>Secure online payments via Razorpay are coming soon.</p>
            <div className="payment-methods">{["UPI","Credit Card","Debit Card","Net Banking","Wallets"].map(m=><div className="payment-method-chip" key={m}><span className="material-symbols-outlined" style={{fontSize:16}}>credit_card</span>{m}</div>)}</div>
            <div className="coming-soon-alert"><span className="material-symbols-outlined">construction</span>Feature under development — coming soon!</div>
          </div>}
          {tab==="profile" && <>
            <div className="page-header"><div><div className="page-title">My Profile</div><div className="page-subtitle">Your account information.</div></div></div>
            <div className="grid-2">
              <div className="card">
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1.5rem 0",borderBottom:"1px solid var(--border)",marginBottom:"1.5rem"}}>
                  <div style={{width:80,height:80,borderRadius:"999px",background:"var(--primary-mid)",border:"3px solid var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",fontWeight:700,color:"#0d9488",marginBottom:"1rem"}}>{initials}</div>
                  <div style={{fontWeight:800,fontSize:"1.1rem"}}>{user.name}</div>
                  <span className="badge badge-patient" style={{marginTop:".4rem"}}>Patient</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                  {[{icon:"mail",label:"Email",value:user.email},{icon:"badge",label:"Role",value:"Patient"},{icon:"calendar_month",label:"Appointments",value:appointments.length},{icon:"prescriptions",label:"Prescriptions",value:prescriptions.length},{icon:"payments",label:"Total Paid",value:"Rs."+totalPaid}].map((item,i)=>(
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
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/patient?tab=book")}><span className="material-symbols-outlined">add</span>Book Appointment</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/patient?tab=prescriptions")}><span className="material-symbols-outlined">prescriptions</span>View Prescriptions</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/patient?tab=payments")}><span className="material-symbols-outlined">payments</span>Payment History</button>
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
