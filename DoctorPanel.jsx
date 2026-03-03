import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDoctorAppts, updateDoctorAppt } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, Spinner, useToast } from '../components/UI';

export default function DoctorPanel() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [appts,   setAppts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('pending');

  useEffect(() => {
    if (!user || user.role !== 'doctor') { nav('/doctor-login'); return; }
    getDoctorAppts()
      .then(r => { setAppts(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const updateStatus = async (id, status) => {
    try {
      await updateDoctorAppt(id, status);
      setAppts(a => a.map(x => x.appointment_id===id ? { ...x, status } : x));
      toast(status === 'approved' ? 'Appointment approved ✅' : 'Appointment rejected', status==='approved'?'success':'info');
    } catch { toast('Update failed', 'error'); }
  };

  const filtered = appts.filter(a => filter === 'all' || a.status === filter);
  const counts = { pending: appts.filter(a=>a.status==='pending').length, approved: appts.filter(a=>a.status==='approved').length, all: appts.length };

  if (loading) return <Spinner />;

  return (
    <div className="page-wrap">
      <div className="page-header">
        <h2>Doctor Panel</h2>
        <p>Welcome, {user?.name} — manage your appointment requests</p>
      </div>

      {/* Stats row */}
      <div className="grid-3" style={{ marginBottom:'2rem' }}>
        {[
          { label:'Total',    value: appts.length,  color:'var(--teal)' },
          { label:'Pending',  value: counts.pending, color:'var(--warn)' },
          { label:'Approved', value: counts.approved,color:'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2rem', fontWeight:700, color:s.color, fontFamily:'Playfair Display, serif' }}>{s.value}</div>
            <div style={{ fontSize:'0.8rem', color:'var(--muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:'1.5rem' }}>
        {[['pending','🕐 Pending'],['approved','✅ Approved'],['cancelled','❌ Cancelled'],['all','All']].map(([k,l]) => (
          <button key={k} className={`btn ${filter===k ? 'btn-primary' : 'btn-secondary'} btn-sm`} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>
          <div style={{ fontSize:'2.5rem' }}>📋</div>
          <p style={{ marginTop:'0.8rem' }}>No appointments in this category.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {filtered.map(a => (
            <div key={a.appointment_id} className="card">
              <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>👤</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600 }}>{a.patient_name}</div>
                  <div style={{ fontSize:'0.82rem', color:'var(--muted)' }}>{a.patient_phone}</div>
                  <div style={{ fontSize:'0.85rem', marginTop:4, fontWeight:500 }}>
                    📅 {new Date(a.date+'T00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})} &nbsp;|&nbsp; 🕐 {a.time}
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              {a.status === 'pending' && (
                <div style={{ display:'flex', gap:8, marginTop:'1rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => updateStatus(a.appointment_id, 'approved')}>✅ Approve</button>
                  <button className="btn btn-danger btn-sm"  onClick={() => updateStatus(a.appointment_id, 'cancelled')}>❌ Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
