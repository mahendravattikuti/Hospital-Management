import { useNavigate } from "react-router-dom"
import { useState } from "react"

export function Sidebar({ active, role }) {
  const navigate = useNavigate()
  const logout = () => { localStorage.clear(); navigate("/login") }
  const patientNav = [{ id:"dashboard",icon:"dashboard",label:"Dashboard" },{ id:"appointments",icon:"calendar_month",label:"Appointments" },{ id:"prescriptions",icon:"prescriptions",label:"Prescriptions" },{ id:"payments",icon:"payments",label:"Payments" },{ id:"razorpay",icon:"credit_card",label:"Pay Online" }]
  const doctorNav = [{ id:"dashboard",icon:"dashboard",label:"Dashboard" },{ id:"appointments",icon:"calendar_month",label:"Appointments" },{ id:"prescriptions",icon:"prescriptions",label:"Prescriptions" },{ id:"update-status",icon:"edit_calendar",label:"Update Status" },{ id:"new-prescription",icon:"add_circle",label:"New Prescription" }]
  const adminNav = [{ id:"dashboard",icon:"dashboard",label:"Dashboard" },{ id:"users",icon:"group",label:"Users" },{ id:"appointments",icon:"calendar_month",label:"Appointments" },{ id:"payments",icon:"payments",label:"Payments" }]
  const navItems = role==="patient"?patientNav:role==="doctor"?doctorNav:adminNav
  const brandName = role==="admin"?"MedCore":"HMS Portal"
  const brandLabel = role==="admin"?"Admin Panel":role==="doctor"?"Doctor Portal":"Patient Portal"
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon"><span className="material-symbols-outlined">local_hospital</span></div>
        <div className="sidebar-brand-text"><h2>{brandName}</h2><p>{brandLabel}</p></div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button key={item.id} className={`nav-item ${active===item.id?"active":""}`} onClick={() => navigate(`/${role}?tab=${item.id}`)}>
            <span className="material-symbols-outlined">{item.icon}</span>{item.label}
          </button>
        ))}
        <div className="nav-divider" />
        <button className="nav-item" onClick={() => navigate(`/${role}?tab=profile`)}><span className="material-symbols-outlined">account_circle</span>Profile</button>
        <button className="nav-item danger" onClick={logout}><span className="material-symbols-outlined">logout</span>Logout</button>
      </nav>
      {role==="admin" && (
        <div className="sidebar-bottom">
          <div className="sidebar-widget">
            <div className="sidebar-widget-title"><span>Bed Occupancy</span><span>Live</span></div>
            <div className="progress-row"><div className="progress-label"><span>ICU</span><span>18/20</span></div><div className="progress-bar"><div className="progress-fill" style={{width:"90%"}} /></div></div>
            <div className="progress-row"><div className="progress-label"><span>General Ward</span><span>142/200</span></div><div className="progress-bar"><div className="progress-fill" style={{width:"71%"}} /></div></div>
            <button className="sidebar-widget-btn">Detailed Report</button>
          </div>
        </div>
      )}
    </aside>
  )
}

export function Topbar() {
  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const navigate = useNavigate()
  const initials = user.name ? user.name.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) : "U"
  const roleLabel = user.role==="admin"?"Chief Admin":user.role==="doctor"?"Medical Doctor":"Patient"
  const [showNotif, setShowNotif] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifRead, setNotifRead] = useState(false)

  const notifications = [
    { id:1, icon:"calendar_month", title:"Appointment Confirmed", desc:"Your appointment has been confirmed.", time:"2 mins ago", color:"teal" },
    { id:2, icon:"prescriptions", title:"New Prescription", desc:"A new prescription has been issued.", time:"1 hour ago", color:"slate" },
    { id:3, icon:"payment", title:"Payment Successful", desc:"Your payment was processed.", time:"Yesterday", color:"slate" },
  ]

  const logout = () => { localStorage.clear(); navigate("/login") }

  return (
    <header className="topbar" style={{position:"relative"}}>
      <div className="topbar-search">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search patients, records, or doctors..." />
      </div>
      <div className="topbar-right">

        {/* Notifications */}
        <div style={{position:"relative"}}>
          <button className="topbar-icon-btn" onClick={()=>{ setShowNotif(!showNotif); setShowSettings(false); setNotifRead(true) }}>
            <span className="material-symbols-outlined">notifications</span>
            {!notifRead && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div style={{position:"absolute",top:"48px",right:0,width:"320px",background:"white",border:"1px solid var(--border)",borderRadius:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:100}}>
              <div style={{padding:"1rem 1.25rem",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontSize:".9rem"}}>Notifications</span>
                <span style={{fontSize:".72rem",color:"var(--primary)",fontWeight:600,cursor:"pointer"}} onClick={()=>setShowNotif(false)}>Mark all read</span>
              </div>
              {notifications.map(n=>(
                <div key={n.id} style={{display:"flex",gap:".75rem",padding:".9rem 1.25rem",borderBottom:"1px solid #f1f5f9",cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background="#fafafa"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                  <div style={{width:36,height:36,borderRadius:"999px",background:n.color==="teal"?"var(--primary)":"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span className="material-symbols-outlined" style={{fontSize:16,color:n.color==="teal"?"#0f172a":"var(--primary)"}}>{n.icon}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:".8rem"}}>{n.title}</div>
                    <div style={{fontSize:".75rem",color:"var(--text-muted)"}}>{n.desc}</div>
                    <div style={{fontSize:".68rem",color:"var(--text-faint)",marginTop:"2px"}}>{n.time}</div>
                  </div>
                </div>
              ))}
              <div style={{padding:".75rem",textAlign:"center"}}>
                <button onClick={()=>setShowNotif(false)} style={{fontSize:".78rem",fontWeight:600,color:"var(--primary)",background:"none",border:"none",cursor:"pointer"}}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div style={{position:"relative"}}>
          <button className="topbar-icon-btn" onClick={()=>{ setShowSettings(!showSettings); setShowNotif(false) }}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          {showSettings && (
            <div style={{position:"absolute",top:"48px",right:0,width:"240px",background:"white",border:"1px solid var(--border)",borderRadius:"12px",boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:100,padding:".5rem"}}>
              {[
                { icon:"account_circle", label:"My Profile", action:()=>{ navigate(`/${user.role}?tab=profile`); setShowSettings(false) } },
                { icon:"lock", label:"Change Password", action:()=>setShowSettings(false) },
                { icon:"notifications", label:"Notification Settings", action:()=>setShowSettings(false) },
                { icon:"help", label:"Help & Support", action:()=>setShowSettings(false) },
                { icon:"logout", label:"Logout", action:logout, danger:true },
              ].map((item,i)=>(
                <button key={i} onClick={item.action} style={{display:"flex",alignItems:"center",gap:".75rem",width:"100%",padding:".65rem .75rem",border:"none",background:"none",borderRadius:"8px",cursor:"pointer",fontSize:".85rem",fontWeight:500,color:item.danger?"#ef4444":"var(--text)",textAlign:"left"}}
                  onMouseEnter={e=>e.currentTarget.style.background=item.danger?"#fef2f2":"#f1f5f9"}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>
                  <span className="material-symbols-outlined" style={{fontSize:18,color:item.danger?"#ef4444":"var(--text-muted)"}}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="topbar-divider" />

        {/* User */}
        <div className="topbar-user" onClick={()=>{ navigate(`/${user.role}?tab=profile`); setShowNotif(false); setShowSettings(false) }}>
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-user-info"><p>{user.name}</p><p>{roleLabel}</p></div>
        </div>

      </div>

      {/* Click outside to close */}
      {(showNotif||showSettings) && <div style={{position:"fixed",inset:0,zIndex:99}} onClick={()=>{ setShowNotif(false); setShowSettings(false) }} />}
    </header>
  )
}
