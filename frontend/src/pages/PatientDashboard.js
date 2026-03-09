import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api/api"

export default function PatientDashboard() {
  const [tab, setTab] = useState("appointments")
  const [appointments, setAppointments] = useState([])
  const [prescriptions, setPrescriptions] = useState([])
  const [payments, setPayments] = useState([])
  const [bookForm, setBookForm] = useState({ doctor_id: "", appointment_date: "" })
  const [payForm, setPayForm] = useState({ appointment_id: "", amount: "", payment_method: "card" })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const token = localStorage.getItem("token")

  useEffect(() => { loadAppointments(); loadPrescriptions(); loadPayments() }, [])

  const loadAppointments = async () => { try { setAppointments(await api("/api/my-appointments", "GET", null, token)) } catch (err) {} }
  const loadPrescriptions = async () => { try { setPrescriptions(await api("/api/my-prescriptions", "GET", null, token)) } catch (err) {} }
  const loadPayments = async () => { try { setPayments(await api("/api/my-payments", "GET", null, token)) } catch (err) {} }

  const bookAppointment = async () => {
    setError(""); setMessage("")
    try {
      await api("/api/appointments", "POST", { doctor_id: parseInt(bookForm.doctor_id), appointment_date: bookForm.appointment_date }, token)
      setMessage("Appointment booked successfully!")
      setBookForm({ doctor_id: "", appointment_date: "" })
      loadAppointments()
    } catch (err) { setError(err.message) }
  }

  const makePayment = async () => {
    setError(""); setMessage("")
    try {
      const data = await api("/api/payments", "POST", { appointment_id: parseInt(payForm.appointment_id), amount: parseInt(payForm.amount), payment_method: payForm.payment_method }, token)
      setMessage("Payment successful! Transaction ID: " + data.transaction_id)
      setPayForm({ appointment_id: "", amount: "", payment_method: "card" })
      loadPayments()
    } catch (err) { setError(err.message) }
  }

  const logout = () => { localStorage.clear(); navigate("/login") }

  return (
    <div className="dashboard">
      <div className="navbar">
        <h2>Hospital</h2>
        <div className="navbar-right"><span>Welcome, {user?.name}</span><button className="logout-btn" onClick={logout}>Logout</button></div>
      </div>
      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card"><div className="stat-number">{appointments.length}</div><div className="stat-label">Appointments</div></div>
          <div className="stat-card"><div className="stat-number">{prescriptions.length}</div><div className="stat-label">Prescriptions</div></div>
          <div className="stat-card"><div className="stat-number">{payments.length}</div><div className="stat-label">Payments</div></div>
        </div>
        <div className="tabs">
          {["appointments","prescriptions","payments","book","pay","razorpay"].map(t => (
            <button key={t} className={"tab " + (tab===t?"active":"")} onClick={() => { setTab(t); setMessage(""); setError("") }}>
              {t==="book"?"Book Appointment":t==="pay"?"Manual Pay":t==="razorpay"?"?? Razorpay":t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>
        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        {tab==="appointments" && <div className="card"><h3>My Appointments</h3>{appointments.length===0?<p style={{color:"var(--muted)"}}>No appointments yet.</p>:<table><thead><tr><th>Doctor</th><th>Date</th><th>Status</th></tr></thead><tbody>{appointments.map(a=><tr key={a.id}><td>{a.doctor_name}</td><td>{new Date(a.appointment_date).toLocaleString()}</td><td><span className={"badge badge-"+a.status}>{a.status}</span></td></tr>)}</tbody></table>}</div>}
        {tab==="prescriptions" && <div className="card"><h3>My Prescriptions</h3>{prescriptions.length===0?<p style={{color:"var(--muted)"}}>No prescriptions yet.</p>:prescriptions.map(p=><div key={p.id} style={{borderBottom:"1px solid var(--border)",paddingBottom:"1rem",marginBottom:"1rem"}}><strong>Dr. {p.doctor_name}</strong><p><b>Medications:</b> {p.medications}</p>{p.instructions&&<p><b>Instructions:</b> {p.instructions}</p>}{p.avoid_items&&<p><b>Avoid:</b> {p.avoid_items}</p>}</div>)}</div>}
        {tab==="payments" && <div className="card"><h3>My Payments</h3>{payments.length===0?<p style={{color:"var(--muted)"}}>No payments yet.</p>:<table><thead><tr><th>Doctor</th><th>Amount</th><th>Method</th><th>Status</th><th>Transaction ID</th></tr></thead><tbody>{payments.map(p=><tr key={p.id}><td>{p.doctor_name}</td><td>Rs.{p.amount}</td><td>{p.payment_method}</td><td><span className={"badge badge-"+p.payment_status}>{p.payment_status}</span></td><td style={{fontSize:"0.8rem",color:"var(--muted)"}}>{p.transaction_id}</td></tr>)}</tbody></table>}</div>}
        {tab==="book" && <div className="card"><h3>Book Appointment</h3><div className="form-inline"><div className="form-group"><label>Doctor ID</label><input type="number" placeholder="Doctor user ID" value={bookForm.doctor_id} onChange={e=>setBookForm({...bookForm,doctor_id:e.target.value})} /></div><div className="form-group"><label>Date and Time</label><input type="datetime-local" value={bookForm.appointment_date} onChange={e=>setBookForm({...bookForm,appointment_date:e.target.value})} /></div></div><br/><button className="btn btn-primary" onClick={bookAppointment}>Book Appointment</button></div>}
        {tab==="pay" && <div className="card"><h3>Manual Payment</h3><div className="form-inline"><div className="form-group"><label>Appointment ID</label><input type="number" placeholder="Appointment ID" value={payForm.appointment_id} onChange={e=>setPayForm({...payForm,appointment_id:e.target.value})} /></div><div className="form-group"><label>Amount</label><input type="number" placeholder="500" value={payForm.amount} onChange={e=>setPayForm({...payForm,amount:e.target.value})} /></div><div className="form-group"><label>Payment Method</label><select value={payForm.payment_method} onChange={e=>setPayForm({...payForm,payment_method:e.target.value})}><option value="card">Card</option><option value="cash">Cash</option><option value="upi">UPI</option></select></div></div><br/><button className="btn btn-accent" onClick={makePayment}>Pay Now</button></div>}

        {tab==="razorpay" && (
          <div className="card" style={{textAlign:"center", padding:"3rem 2rem"}}>
            <div style={{fontSize:"3rem", marginBottom:"1rem"}}>??</div>
            <h3 style={{fontSize:"1.8rem", marginBottom:"0.5rem"}}>Razorpay Payments</h3>
            <p style={{color:"var(--muted)", marginBottom:"2rem", maxWidth:"400px", margin:"0 auto 2rem"}}>
              Secure online payments via Razorpay are coming soon. You will be able to pay using UPI, cards, net banking and wallets.
            </p>
            <div style={{display:"flex", gap:"1rem", justifyContent:"center", flexWrap:"wrap", marginBottom:"2rem"}}>
              {["UPI","Credit Card","Debit Card","Net Banking","Wallets"].map(m => (
                <span key={m} style={{background:"var(--bg)", border:"1px solid var(--border)", borderRadius:"20px", padding:"0.4rem 1rem", fontSize:"0.85rem", color:"var(--muted)"}}>
                  {m}
                </span>
              ))}
            </div>
            <div style={{background:"#fff8e1", border:"1px solid #ffe082", borderRadius:"8px", padding:"1rem", maxWidth:"400px", margin:"0 auto", fontSize:"0.875rem", color:"#856404"}}>
              ?? Feature under development — coming soon!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
