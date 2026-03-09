import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/api"

export default function AdminDashboard() {
  const [tab, setTab] = useState("users")
  const [users, setUsers] = useState([])
  const [appointments, setAppointments] = useState([])
  const [payments, setPayments] = useState([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")

  useEffect(() => { loadUsers(); loadAppointments(); loadPayments() }, [])

  const loadUsers = async () => { try { setUsers(await api("/users", "GET", null, token)) } catch (err) {} }
  const loadAppointments = async () => { try { setAppointments(await api("/api/appointments", "GET", null, token)) } catch (err) {} }
  const loadPayments = async () => { try { setPayments(await api("/api/payments", "GET", null, token)) } catch (err) {} }

  const logout = () => { localStorage.clear(); navigate("/login") }
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Hospital Admin</h2>
        <div className="navbar-right"><span>{user?.name}</span><button className="logout-btn" onClick={logout}>Logout</button></div>
      </div>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">{users.length}</div><div className="stat-label">Total Users</div></div>
          <div className="stat-card"><div className="stat-number">{users.filter(u=>u.role==="doctor").length}</div><div className="stat-label">Doctors</div></div>
          <div className="stat-card"><div className="stat-number">{users.filter(u=>u.role==="patient").length}</div><div className="stat-label">Patients</div></div>
          <div className="stat-card"><div className="stat-number">{appointments.length}</div><div className="stat-label">Appointments</div></div>
          <div className="stat-card"><div className="stat-number">Rs.{totalRevenue}</div><div className="stat-label">Total Revenue</div></div>
        </div>
        <div className="tabs">
          {["users","appointments","payments"].map(t=>(
            <button key={t} className={"tab "+(tab===t?"active":"")} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {tab==="users" && <div className="card"><h3>All Users</h3><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>#{u.id}</td><td>{u.name}</td><td>{u.email}</td><td><span className="badge badge-confirmed">{u.role}</span></td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
        {tab==="appointments" && <div className="card"><h3>All Appointments</h3>{appointments.length===0?<p style={{color:"var(--muted)"}}>No appointments yet.</p>:<table><thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>#{a.id}</td><td>{a.patient_name}</td><td>{a.doctor_name}</td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>}
        {tab==="payments" && <div className="card"><h3>All Payments</h3>{payments.length===0?<p style={{color:"var(--muted)"}}>No payments yet.</p>:<table><thead><tr><th>ID</th><th>Patient</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction ID</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>#{p.id}</td><td>{p.patient_name}</td><td>Rs.{p.amount}</td><td>{p.payment_method}</td><td><span className={"badge badge-"+p.payment_status}>{p.payment_status}</span></td><td style={{fontSize:"0.8rem",color:"var(--muted)"}}>{p.transaction_id}</td></tr>)}</tbody></table>}</div>}
      </div>
    </div>
  )
}
