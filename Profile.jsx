import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../api';
import { useAuth } from '../context/AuthContext';
import { Spinner, useToast } from '../components/UI';

export default function Profile() {
  const { user, login, token } = useAuth();
  const nav = useNavigate();
  const { toast } = useToast();
  const [form, setForm]     = useState({ name:'', phone:'', age:'', password:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    getProfile()
      .then(r => { setForm({ name: r.data.name, phone: r.data.phone, age: r.data.age, password:'' }); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setError(''); setSaving(true);
    try {
      const payload = { name: form.name, phone: form.phone, age: form.age };
      if (form.password) {
        if (form.password.length < 8) { setError('Password must be 8+ characters.'); setSaving(false); return; }
        payload.password = form.password;
      }
      const { data } = await updateProfile(payload);
      login({ ...user, name: data.name }, token);
      toast('Profile updated ✅', 'success');
      setForm(f => ({ ...f, password:'' }));
    } catch (e) {
      setError(e.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-wrap" style={{ maxWidth: 600 }}>
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Update your personal details</p>
      </div>

      <div className="card">
        <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'2rem', paddingBottom:'1.5rem', borderBottom:'1px solid var(--border)' }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem' }}>👤</div>
          <div>
            <div style={{ fontFamily:'Playfair Display, serif', fontSize:'1.3rem', fontWeight:700 }}>{user.name}</div>
            <div style={{ fontSize:'0.85rem', color:'var(--muted)' }}>{user.email}</div>
            <span className="badge badge-approved" style={{ marginTop:6, display:'inline-block' }}>Patient</span>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={set('name')} />
          </div>
          <div className="form-group">
            <label className="form-label">Age</label>
            <input className="form-input" type="number" value={form.age} onChange={set('age')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" value={form.phone} onChange={set('phone')} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" value={user.email} disabled style={{ opacity:0.6 }} />
          <div style={{ fontSize:'0.75rem', color:'var(--muted)', marginTop:4 }}>Email cannot be changed.</div>
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.2rem', marginTop:'0.5rem' }}>
          <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:'0.8rem', color:'var(--muted)' }}>CHANGE PASSWORD</div>
          <div className="form-group">
            <label className="form-label">New Password <span style={{ fontWeight:400 }}>(leave blank to keep current)</span></label>
            <input className="form-input" type="password" placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
