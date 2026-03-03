import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Toast system ─────────────────────────────────────────
let _addToast = null;
export function useToast() {
  return { toast: (msg, type='info') => _addToast?.(msg, type) };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _addToast = useCallback((msg, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────
export function Spinner() {
  return <div className="loading-center"><div className="spinner" /></div>;
}

// ── Stars ─────────────────────────────────────────────────
export function Stars({ rating }) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half?1:0))}
      <span style={{ fontFamily: 'DM Sans', fontSize: '0.82rem', color: 'var(--muted)', marginLeft: 4 }}>{rating}</span>
    </span>
  );
}

// ── Confirmation Probability Bar ──────────────────────────
export function ProbBar({ pct }) {
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warn)' : 'var(--danger)';
  const label = pct >= 70 ? 'High' : pct >= 40 ? 'Medium' : 'Low';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:4 }}>
        <span style={{ color:'var(--muted)' }}>Confirmation probability</span>
        <span style={{ fontWeight:700, color }}>{pct}% — {label}</span>
      </div>
      <div className="prob-bar-wrap">
        <div className="prob-bar" style={{ width:`${pct}%`, background:color }} />
      </div>
    </div>
  );
}

// ── Countdown Timer ───────────────────────────────────────
export function Countdown({ dateStr, timeStr }) {
  const [diff, setDiff] = useState('');
  useEffect(() => {
    const calc = () => {
      const target = new Date(`${dateStr}T${to24(timeStr)}`);
      const now = new Date();
      const ms = target - now;
      if (ms <= 0) { setDiff('Time passed'); return; }
      const d = Math.floor(ms/86400000);
      const h = Math.floor((ms%86400000)/3600000);
      const m = Math.floor((ms%3600000)/60000);
      setDiff(d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`);
    };
    calc(); const iv = setInterval(calc, 60000);
    return () => clearInterval(iv);
  }, [dateStr, timeStr]);
  return (
    <div className="countdown-box">
      <span>⏰</span>
      <div>
        <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Appointment in</div>
        <div className="countdown-time">{diff}</div>
      </div>
    </div>
  );
}

function to24(t) {
  const [time, mod] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mod === 'PM' && h !== 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}:00`;
}

// ── Navbar ─────────────────────────────────────────────────
export function Navbar() {
  const { user, logout, dark, toggleDark } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isActive = (path) => loc.pathname === path;

  const patientLinks = [
    { path:'/doctors', label:'Doctors' },
    { path:'/appointments', label:'My Appointments' },
    { path:'/profile', label:'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{cursor:'pointer'}} onClick={() => nav('/')}>🩺 MediBook</div>
      <div className="nav-center">
        {!user && <>
          <button className={`nav-link ${isActive('/doctors')?'active':''}`} onClick={() => nav('/doctors')}>Doctors</button>
          <button className={`nav-link ${isActive('/login')?'active':''}`} onClick={() => nav('/login')}>Login</button>
        </>}
        {user?.role === 'patient' && patientLinks.map(l => (
          <button key={l.path} className={`nav-link ${isActive(l.path)?'active':''}`} onClick={() => nav(l.path)}>{l.label}</button>
        ))}
        {user?.role === 'doctor' && <>
          <button className={`nav-link ${isActive('/doctor-panel')?'active':''}`} onClick={() => nav('/doctor-panel')}>My Appointments</button>
        </>}
        {user?.role === 'admin' && <>
          <button className={`nav-link ${isActive('/admin')?'active':''}`} onClick={() => nav('/admin')}>Dashboard</button>
        </>}
      </div>
      <div className="nav-right">
        <button className="btn btn-icon" onClick={toggleDark} title="Toggle dark mode">{dark ? '☀️' : '🌙'}</button>
        {user
          ? <><span style={{fontSize:'0.85rem', fontWeight:500}}>👤 {user.name.split(' ')[0]}</span>
              <button className="btn btn-secondary btn-sm" onClick={() => { logout(); nav('/'); }}>Logout</button></>
          : <><button className="btn btn-secondary btn-sm" onClick={() => nav('/login')}>Login</button>
              <button className="btn btn-primary btn-sm" onClick={() => nav('/register')}>Register</button></>
        }
      </div>
    </nav>
  );
}

// ── Bottom Navigation (mobile) ────────────────────────────
export function BottomNav() {
  const { user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const isActive = (path) => loc.pathname.startsWith(path);

  const patientItems = [
    { icon:'🏠', label:'Home',    path:'/' },
    { icon:'👨‍⚕️', label:'Doctors', path:'/doctors' },
    { icon:'📅', label:'Appts',   path:'/appointments' },
    { icon:'👤', label:'Profile', path:'/profile' },
  ];
  const doctorItems = [
    { icon:'🏠', label:'Home',  path:'/' },
    { icon:'📋', label:'Panel', path:'/doctor-panel' },
  ];
  const adminItems = [
    { icon:'🏠', label:'Home',  path:'/' },
    { icon:'⚙️', label:'Admin', path:'/admin' },
  ];

  const items = user?.role === 'doctor' ? doctorItems : user?.role === 'admin' ? adminItems : patientItems;

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-items">
        {items.map(i => (
          <button key={i.path} className={`bn-item ${isActive(i.path) && i.path!=='/' ? 'active' : loc.pathname==='/' && i.path==='/' ? 'active' : ''}`} onClick={() => nav(i.path)}>
            <span className="bn-icon">{i.icon}</span>
            <span>{i.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────
export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status.charAt(0).toUpperCase()+status.slice(1)}</span>;
}
