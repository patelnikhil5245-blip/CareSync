import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorById, bookAppointment, addReview } from '../api';
import { useAuth } from '../context/AuthContext';
import { Stars, ProbBar, Spinner, useToast } from '../components/UI';

export default function BookAppointment() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [doctor,  setDoctor]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [date,    setDate]    = useState('');
  const [slot,    setSlot]    = useState('');
  const [error,   setError]   = useState('');
  const [booking, setBooking] = useState(false);
  const [prob,    setProb]    = useState(null);

  // Review state
  const [reviewRating,  setReviewRating]  = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDone,    setReviewDone]    = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getDoctorById(id)
      .then(r => { setDoctor(r.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

  // Simulate probability update when slot changes
  useEffect(() => {
    if (slot) setProb(Math.floor(60 + Math.random() * 40));
  }, [slot, date]);

  const confirm = async () => {
    if (!user)  return nav('/login');
    if (!date)  return setError('Please select a date.');
    if (!slot)  return setError('Please select a time slot.');
    setError(''); setBooking(true);
    try {
      const { data: apptData } = await bookAppointment({ doctor_id: id, date, time: slot });
      toast('Appointment booked! Proceeding to payment…', 'info');
      nav('/payment', {
        state: {
          appointment_id: apptData.appointment_id,
          doctor_id      : id,
          doctor_name    : selectedDoctor.name,
          doctor_spec    : selectedDoctor.specialization,
          date,
          time           : slot,
        }
      });
    } catch (e) {
      setError(e.response?.data?.error || 'Booking failed. Please try again.');
    } finally { setBooking(false); }
  };

  const submitReview = async () => {
    if (!user) return nav('/login');
    try {
      await addReview(id, { rating: reviewRating, comment: reviewComment });
      setReviewDone(true);
      toast('Review submitted! Thanks 🙏', 'success');
    } catch { toast('Could not submit review', 'error'); }
  };

  if (loading) return <Spinner />;
  if (!doctor) return <div className="page-wrap"><p>Doctor not found.</p></div>;

  const slots = doctor.available_time.split(',').map(s => s.trim());

  return (
    <div className="page-wrap" style={{ maxWidth: 700 }}>
      <button className="btn btn-secondary btn-sm" style={{ marginBottom:'1.5rem' }} onClick={() => nav('/doctors')}>← Back to Doctors</button>

      {/* Doctor Card */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1.5rem' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.2rem', flexShrink:0 }}>
          {doctor.emoji}
        </div>
        <div>
          <div style={{ fontFamily:'Playfair Display, serif', fontWeight:700, fontSize:'1.2rem' }}>{doctor.name}</div>
          <div style={{ fontSize:'0.85rem', color:'var(--teal)', fontWeight:500 }}>{doctor.specialization}</div>
          <div style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:4 }}>🎓 {doctor.experience} years · <Stars rating={doctor.rating} /></div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ fontSize:'1.1rem', marginBottom:'1.2rem' }}>Select Date & Time</h3>
        <div className="form-group">
          <label className="form-label">Preferred Date</label>
          <input type="date" className="form-input" min={today} value={date} onChange={e => { setDate(e.target.value); setSlot(''); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Available Slots</label>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {slots.map(s => (
              <button key={s}
                onClick={() => setSlot(s)}
                style={{
                  padding:'9px 16px', borderRadius:10, border:`1.5px solid ${slot===s ? 'var(--teal)' : 'var(--border)'}`,
                  background: slot===s ? 'var(--teal)' : 'var(--surface2)',
                  color: slot===s ? 'white' : 'var(--text)',
                  fontSize:'0.85rem', fontWeight:500, cursor:'pointer',
                  fontFamily:'DM Sans, sans-serif', transition:'all 0.2s'
                }}>{s}</button>
            ))}
          </div>
        </div>

        {/* Confirmation Probability */}
        {prob !== null && slot && (
          <div style={{ marginTop:'1rem' }}>
            <ProbBar pct={prob} />
          </div>
        )}

        {error && <div className="form-error" style={{ marginTop:'1rem' }}>{error}</div>}
        <button className="btn btn-primary btn-full" style={{ marginTop:'1.2rem' }} onClick={confirm} disabled={booking}>
          {booking ? 'Confirming…' : user ? 'Confirm Appointment' : 'Login to Book'}
        </button>
      </div>

      {/* Leave a Review */}
      <div className="card">
        <h3 style={{ fontSize:'1.1rem', marginBottom:'1rem' }}>Leave a Review</h3>
        {reviewDone ? (
          <div style={{ color:'var(--success)', fontWeight:500 }}>✅ Thank you for your review!</div>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display:'flex', gap:8 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setReviewRating(n)}
                    style={{ fontSize:'1.5rem', background:'none', border:'none', cursor:'pointer', opacity: n<=reviewRating ? 1 : 0.3, transition:'opacity 0.15s' }}>⭐</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea className="form-textarea" placeholder="Share your experience…" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            </div>
            <button className="btn btn-secondary" onClick={submitReview}>Submit Review</button>
          </>
        )}
        {/* Existing reviews */}
        {doctor.reviews?.length > 0 && (
          <div style={{ marginTop:'1.5rem', borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:'0.8rem', color:'var(--muted)' }}>PATIENT REVIEWS</div>
            {doctor.reviews.map(r => (
              <div key={r.id} style={{ marginBottom:'0.8rem', paddingBottom:'0.8rem', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem' }}>
                  <strong>{r.patient_name}</strong>
                  <Stars rating={r.rating} />
                </div>
                {r.comment && <p style={{ fontSize:'0.82rem', color:'var(--muted)', marginTop:4 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
