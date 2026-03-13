import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { api } from "../api/api"
import { Sidebar, Topbar } from "./Layout"
export default function AdminDashboard() {
  const location = useLocation()
  const [tab, setTab] = useState(new URLSearchParams(location.search).get("tab")||"dashboard")
  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  const user = JSON.parse(localStorage.getItem("user")||"{}")
  useEffect(()=>{ setTab(new URLSearchParams(location.search).get("tab")||"dashboard") },[location.search])
  // eslint-disable-next-line
  useEffect(()=>{ loadAll() },[])
  const loadAll = () => {
    api("/users","GET",null,token).then(setUsers).catch(()=>{})
    api("/api/appointments","GET",null,token).then(setAppointments).catch(()=>{})
    api("/api/payments","GET",null,token).then(setPayments).catch(()=>{})
  }
  const totalRevenue=payments.reduce((s,p)=>s+p.amount,0)
  const doctors=users.filter(u=>u.role==="doctor").length
  const patients=users.filter(u=>u.role==="patient").length
  const initials = user.name ? user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "U"
  return (
    <div className="dashboard">
      <Sidebar active={tab} role="admin" />
      <div className="main">
        <Topbar />
        <div className="page">
          {tab==="dashboard" && <>
            <div className="page-header"><div><div className="page-title">Dashboard</div><div className="page-subtitle">Welcome, {user.name} — hospital overview.</div></div></div>
            <div className="stats-grid">
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">group</span></div><span className="stat-badge up">+12.5%</span></div><div className="stat-label">Total Patients</div><div className="stat-value">{patients}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">medical_services</span></div><span className="stat-badge up">+3%</span></div><div className="stat-label">Total Doctors</div><div className="stat-value">{doctors}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">calendar_today</span></div></div><div className="stat-label">Appointments</div><div className="stat-value">{appointments.length}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">account_balance_wallet</span></div><span className="stat-badge up">+5%</span></div><div className="stat-label">Total Revenue</div><div className="stat-value">Rs.{totalRevenue}</div></div>
            </div>
            <div className="grid-2" style={{marginBottom:"1.5rem"}}>
              <div className="card">
                <div className="card-header"><div><div className="card-title">Revenue Summary</div><div className="card-subtitle">Weekly financial overview</div></div></div>
                <div className="chart-legend"><div className="legend-item"><div className="legend-dot" style={{background:"var(--primary)"}} />Revenue</div><div className="legend-item"><div className="legend-dot" style={{background:"#94a3b8"}} />Expenses</div></div>
                <div className="chart-wrap">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#13ecc8" stopOpacity="0.2"/><stop offset="100%" stopColor="#13ecc8" stopOpacity="0"/></linearGradient></defs>
                    <path d="M 0,80 Q 15,40 25,60 T 45,30 T 65,50 T 85,20 T 100,40 V 100 H 0 Z" fill="url(#cg)"/>
                    <path d="M 0,80 Q 15,40 25,60 T 45,30 T 65,50 T 85,20 T 100,40" fill="none" stroke="#13ecc8" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
                    <path d="M 0,90 Q 20,70 30,85 T 50,60 T 70,80 T 90,50 T 100,70" fill="none" stroke="#94a3b8" strokeDasharray="4" strokeWidth="1.5" vectorEffect="non-scaling-stroke"/>
                  </svg>
                </div>
                <div className="chart-days">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=><span className="chart-day" key={d}>{d}</span>)}</div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">User Demographics</div></div>
                <div className="donut-wrap">
                  <div className="donut-center">
                    <svg width="100%" height="100%" viewBox="0 0 36 36" style={{transform:"rotate(-90deg)"}}>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="4"/>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#13ecc8" strokeWidth="4" strokeDasharray={`${users.length>0?Math.round((patients/users.length)*100):70} 100`}/>
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray={`${users.length>0?Math.round((doctors/users.length)*100):25} 100`} strokeDashoffset={`-${users.length>0?Math.round((patients/users.length)*100):70}`}/>
                    </svg>
                    <div className="donut-inner"><span className="value">{users.length}</span><span className="label">Total</span></div>
                  </div>
                  <div className="donut-legend">
                    <div className="donut-legend-item"><div className="donut-legend-label"><div className="donut-legend-dot" style={{background:"var(--primary)"}}/>Patients</div><div className="donut-legend-val">{users.length>0?Math.round((patients/users.length)*100):0}%</div></div>
                    <div className="donut-legend-item"><div className="donut-legend-label"><div className="donut-legend-dot" style={{background:"#94a3b8"}}/>Doctors</div><div className="donut-legend-val">{users.length>0?Math.round((doctors/users.length)*100):0}%</div></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid-2">
              <div className="card">
                <div className="card-header"><div className="card-title">Recent Activity</div></div>
                <div className="activity-feed">
                  {appointments.slice(0,1).map(a=><div className="activity-item" key={"a"+a.id}><div className="activity-dot teal"><span className="material-symbols-outlined" style={{fontSize:16}}>add</span></div><div className="activity-content"><div className="activity-title-row"><span className="activity-title">Appointment Booked</span><span className="activity-time">{new Date(a.appointment_date).toLocaleDateString()}</span></div><div className="activity-desc">{a.patient_name} with Dr. {a.doctor_name}</div></div></div>)}
                  {payments.slice(0,1).map(p=><div className="activity-item" key={"p"+p.id}><div className="activity-dot slate"><span className="material-symbols-outlined" style={{fontSize:16}}>payment</span></div><div className="activity-content"><div className="activity-title-row"><span className="activity-title">Payment Confirmed</span></div><div className="activity-desc">Rs.{p.amount} — {p.transaction_id}</div></div></div>)}
                  {appointments.length===0&&<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No recent activity.</p>}
                </div>
              </div>
              <div className="card">
                <div className="card-header"><div className="card-title">Upcoming Appointments</div><button className="card-action" onClick={()=>navigate("/admin?tab=appointments")}>View All</button></div>
                {appointments.length===0?<p style={{color:"var(--text-muted)",fontSize:".875rem"}}>No appointments.</p>:
                <div className="upcoming-list">{appointments.slice(0,3).map(a=>{ const d=new Date(a.appointment_date); return (
                  <div className="upcoming-item" key={a.id}>
                    <div className="upcoming-date"><span className="month">{d.toLocaleString("default",{month:"short"})}</span><span className="day">{d.getDate()}</span></div>
                    <div className="upcoming-info"><div className="upcoming-name">{a.patient_name}</div><div className="upcoming-type">with Dr. {a.doctor_name}</div></div>
                    <span className={"badge badge-"+a.status}>{a.status}</span>
                  </div>)})}</div>}
              </div>
            </div>
          </>}
          {tab==="users" && <>
            <div className="page-header"><div><div className="page-title">All Users</div><div className="page-subtitle">Manage all registered users.</div></div></div>
            <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"1.5rem"}}>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">group</span></div></div><div className="stat-label">Total Users</div><div className="stat-value">{users.length}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">person</span></div></div><div className="stat-label">Patients</div><div className="stat-value">{patients}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">medical_services</span></div></div><div className="stat-label">Doctors</div><div className="stat-value">{doctors}</div></div>
            </div>
            <div className="card"><table><thead><tr><th>User</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><div className="patient-name-cell"><div className="patient-avatar">{u.name?.[0]}</div><div><div className="patient-name">{u.name}</div><div className="patient-id">ID: #{u.id}</div></div></div></td><td style={{color:"var(--text-muted)",fontSize:".875rem"}}>{u.email}</td><td><span className={"badge badge-"+u.role}>{u.role}</span></td><td style={{fontSize:".8rem",color:"var(--text-muted)"}}>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
          </>}
          {tab==="appointments" && <>
            <div className="page-header"><div><div className="page-title">All Appointments</div><div className="page-subtitle">Monitor all hospital appointments.</div></div></div>
            <div className="card">{appointments.length===0?<p style={{color:"var(--text-muted)"}}>No appointments.</p>:<table><thead><tr><th>#</th><th>Patient</th><th>Doctor</th><th>Date & Time</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td style={{color:"var(--text-faint)",fontSize:".78rem"}}>#{a.id}</td><td><div className="patient-name-cell"><div className="patient-avatar">{a.patient_name?.[0]}</div><span className="patient-name">{a.patient_name}</span></div></td><td>Dr. {a.doctor_name}</td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>
          </>}
          {tab==="payments" && <>
            <div className="page-header"><div><div className="page-title">Payment Transactions</div><div className="page-subtitle">All billing and payment records.</div></div></div>
            <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)",marginBottom:"1.5rem"}}>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">account_balance_wallet</span></div><span className="stat-badge up">+12%</span></div><div className="stat-label">Total Revenue</div><div className="stat-value">Rs.{totalRevenue}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">task_alt</span></div></div><div className="stat-label">Completed</div><div className="stat-value">{payments.filter(p=>p.payment_status==="completed").length}</div></div>
              <div className="stat-card"><div className="stat-card-top"><div className="stat-icon"><span className="material-symbols-outlined">receipt</span></div></div><div className="stat-label">Transactions</div><div className="stat-value">{payments.length}</div></div>
            </div>
            <div className="card">{payments.length===0?<p style={{color:"var(--text-muted)"}}>No payments.</p>:<table><thead><tr><th>Patient</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction ID</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td><div className="patient-name-cell"><div className="patient-avatar">{p.patient_name?.[0]}</div><span className="patient-name">{p.patient_name}</span></div></td><td style={{fontWeight:600}}>Rs.{p.amount}</td><td style={{textTransform:"capitalize"}}>{p.payment_method}</td><td><span className={"badge badge-"+p.payment_status}>{p.payment_status}</span></td><td style={{fontSize:".75rem",color:"var(--text-faint)"}}>{p.transaction_id}</td></tr>)}</tbody></table>}</div>
          </>}
          {tab==="profile" && <>
            <div className="page-header"><div><div className="page-title">Admin Profile</div><div className="page-subtitle">Your account information.</div></div></div>
            <div className="grid-2">
              <div className="card">
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"1.5rem 0",borderBottom:"1px solid var(--border)",marginBottom:"1.5rem"}}>
                  <div style={{width:80,height:80,borderRadius:"999px",background:"var(--primary-mid)",border:"3px solid var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.75rem",fontWeight:700,color:"#0d9488",marginBottom:"1rem"}}>{initials}</div>
                  <div style={{fontWeight:800,fontSize:"1.1rem"}}>{user.name}</div>
                  <span className="badge badge-admin" style={{marginTop:".4rem"}}>Admin</span>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
                  {[{icon:"mail",label:"Email",value:user.email},{icon:"badge",label:"Role",value:"Chief Admin"},{icon:"group",label:"Total Users",value:users.length},{icon:"calendar_today",label:"Total Appointments",value:appointments.length},{icon:"account_balance_wallet",label:"Total Revenue",value:"Rs."+totalRevenue}].map((item,i)=>(
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
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/admin?tab=users")}><span className="material-symbols-outlined">group</span>Manage Users</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/admin?tab=appointments")}><span className="material-symbols-outlined">calendar_month</span>View Appointments</button>
                  <button className="btn-teal" style={{justifyContent:"flex-start"}} onClick={()=>navigate("/admin?tab=payments")}><span className="material-symbols-outlined">payments</span>View Payments</button>
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
