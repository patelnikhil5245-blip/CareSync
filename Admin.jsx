import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getAdminAppts, getAdminPatients, getAdminDoctors, adminUpdateAppt, adminDeleteDoctor, getAdminPayments } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, Spinner, useToast } from '../components/UI';

export default function Admin() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [tab,     setTab]     = useState('overview');
  const [stats,   setStats]   = useState(null);
  const [appts,   setAppts]   = useState([]);
  const [patients,setPatients]= useState([]);
  const [doctors,  setDoctors]  = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') { nav('/admin-login'); return; }
    Promise.all([getAdminStats(), getAdminAppts(), getAdminPatients(), getAdminDoctors(), getAdminPayments()])
      .then(([s,a,p,d,pay]) => { setStats(s.data); setAppts(a.data); setPatients(p.data); setDoctors(d.data); setPayments(pay.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const changeApptStatus = async (id, status) => {
    try {
      await adminUpdateAppt(id, status);
      setAppts(a => a.map(x => x.appointment_id===id ? { ...x, status } : x));
      toast(`Status → ${status}`, 'success');
    } catch { toast('Update failed', 'error'); }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try {
      await adminDeleteDoctor(id);
      setDoctors(d => d.filter(x => x.doctor_id !== id));
      toast('Doctor removed', 'info');
    } catch { toast('Delete failed', 'error'); }
  };

  if (loading) return <Spinner />;

  const TABS = [['overview','📊 Overview'],['appointments','📅 Appointments'],['patients','👥 Patients'],['doctors','👨‍⚕️ Doctors'],['payments','💳 Payments']];

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <p>Full system control panel</p>
      </div>

      {/* Tab Nav */}
      <div style={{ display:'flex', gap:8, marginBottom:'2rem', flexWrap:'wrap' }}>
        {TABS.map(([k,l]) => (
          <button key={k} className={`btn ${tab===k ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && stats && (
        <div>
          <div className="grid-3" style={{ marginBottom:'2rem' }}>
            {[
              { icon:'👥', label:'Total Patients',     value: stats.totalPatients,     color:'var(--teal)' },
              { icon:'👨‍⚕️', label:'Total Doctors',      value: stats.totalDoctors,      color:'#7c3aed' },
              { icon:'📅', label:'Total Appointments', value: stats.totalAppointments, color:'var(--accent)' },
              { icon:'🕐', label:'Pending',            value: stats.pending,            color:'var(--warn)' },
              { icon:'✅', label:'Approved',           value: stats.approved,           color:'var(--success)' },
              { icon:'❌', label:'Cancelled',          value: stats.cancelled,          color:'var(--danger)' },
            ].map(s => (
              <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ fontSize:'2rem' }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:'1.8rem', fontWeight:700, color:s.color, fontFamily:'Playfair Display, serif', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:4 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent appointments */}
          <h3 style={{ fontSize:'1rem', fontWeight:700, marginBottom:'1rem', color:'var(--muted)', letterSpacing:2, textTransform:'uppercase' }}>Recent Appointments</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {appts.slice(0,5).map(a => (
              <div key={a.appointment_id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ flex:1, fontSize:'0.88rem' }}>
                  <strong>{a.patient_name}</strong> → <strong>{a.doctor_name}</strong>
                  <span style={{ color:'var(--muted)', marginLeft:8 }}>{a.date} at {a.time}</span>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Appointments */}
      {tab === 'appointments' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
          {appts.map(a => (
            <div key={a.appointment_id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div style={{ flex:1, fontSize:'0.88rem' }}>
                <strong>{a.patient_name}</strong> → <strong>{a.doctor_name}</strong> ({a.doctor_spec})
                <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:2 }}>{a.date} at {a.time}</div>
              </div>
              <StatusBadge status={a.status} />
              <select className="form-select" style={{ width:140, borderRadius:50, fontSize:'0.8rem', padding:'5px 10px' }}
                value={a.status}
                onChange={e => changeApptStatus(a.appointment_id, e.target.value)}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Patients */}
      {tab === 'patients' && (
        <div>
          <p style={{ color:'var(--muted)', marginBottom:'1rem', fontSize:'0.88rem' }}>{patients.length} registered patients</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {patients.map(p => (
              <div key={p.patient_id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>👤</div>
                <div style={{ flex:1, fontSize:'0.88rem' }}>
                  <strong>{p.name}</strong>
                  <div style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{p.email} · {p.phone} · Age {p.age}</div>
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--muted)' }}>Joined {new Date(p.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            {patients.length === 0 && <div style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>No patients registered yet.</div>}
          </div>
        </div>
      )}

      {/* Doctors */}
      {tab === 'doctors' && (
        <div>
          <p style={{ color:'var(--muted)', marginBottom:'1rem', fontSize:'0.88rem' }}>{doctors.length} doctors in system</p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {doctors.map(d => (
              <div key={d.doctor_id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ fontSize:'1.8rem' }}>{d.emoji}</div>
                <div style={{ flex:1, fontSize:'0.88rem' }}>
                  <strong>{d.name}</strong>
                  <div style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{d.specialization} · {d.experience} yrs · ⭐ {d.rating}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteDoctor(d.doctor_id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <p style={{ color:'var(--muted)', fontSize:'0.88rem' }}>{payments.length} transactions</p>
            <div style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--teal)' }}>
              Total: Rs {payments.reduce((s,p) => s + (p.amount||0), 0).toLocaleString()}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
            {payments.length === 0 && <div style={{ textAlign:'center', color:'var(--muted)', padding:'2rem' }}>No payments yet.</div>}
            {payments.map(p => (
              <div key={p.payment_id} className="card card-sm" style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                <div style={{ fontSize:'1.5rem' }}>💳</div>
                <div style={{ flex:1, fontSize:'0.88rem' }}>
                  <strong>{p.patient_name}</strong> → <strong>{p.doctor_name}</strong>
                  <div style={{ color:'var(--muted)', fontSize:'0.8rem', marginTop:2 }}>
                    Ref: {p.transaction_ref} · Method: {p.method} · {new Date(p.paid_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ fontFamily:'Playfair Display,serif', fontWeight:700, color:'var(--teal)' }}>
                  Rs {p.amount?.toLocaleString()}
                </div>
                <span className="badge badge-approved">PAID</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
