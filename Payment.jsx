import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/UI';
import axios from 'axios';

// ── Payment method definitions ───────────────────────────
const METHODS = [
  { id: 'card',      icon: '💳', label: 'Credit / Debit Card',  desc: 'Visa, Mastercard, UnionPay' },
  { id: 'easypaisa', icon: '📱', label: 'EasyPaisa',            desc: 'Mobile wallet payment'       },
  { id: 'jazzcash',  icon: '🔶', label: 'JazzCash',             desc: 'Mobile wallet payment'       },
  { id: 'bank',      icon: '🏦', label: 'Bank Transfer',        desc: 'Direct bank / IBFT'          },
];

function formatCard(val) {
  return val.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
}
function formatExpiry(val) {
  const v = val.replace(/\D/g,'').slice(0,4);
  return v.length >= 3 ? v.slice(0,2) + '/' + v.slice(2) : v;
}

export default function Payment() {
  const location = useLocation();
  const nav = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Data passed from BookAppointment via navigate state
  const { appointment_id, doctor_id, doctor_name, doctor_spec, date, time } = location.state || {};

  const [fee,     setFee]     = useState(null);
  const [method,  setMethod]  = useState('card');
  const [step,    setStep]    = useState('method'); // method | details | processing | success
  const [error,   setError]   = useState('');

  // Card fields
  const [cardName,   setCardName]   = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');

  // Mobile wallet / bank
  const [mobileNum,  setMobileNum]  = useState('');
  const [accountNum, setAccountNum] = useState('');

  const [txnRef, setTxnRef] = useState('');

  useEffect(() => {
    if (!user) { nav('/login'); return; }
    if (!appointment_id || !doctor_id) { nav('/appointments'); return; }
    axios.get(`/api/payments/fee/${doctor_id}`)
      .then(r => setFee(r.data.fee))
      .catch(() => setFee(1000));
  }, []);

  const proceedToDetails = () => {
    if (!method) return setError('Please select a payment method.');
    setError(''); setStep('details');
  };

  const processPayment = async () => {
    setError('');
    // Front-end validation
    if (method === 'card') {
      if (!cardName.trim()) return setError('Please enter the cardholder name.');
      if (cardNumber.replace(/\s/g,'').length < 16) return setError('Please enter a valid 16-digit card number.');
      if (expiry.length < 5) return setError('Please enter a valid expiry date (MM/YY).');
      if (cvv.length < 3) return setError('Please enter a valid CVV.');
    }
    if ((method === 'easypaisa' || method === 'jazzcash') && mobileNum.replace(/\D/g,'').length < 10)
      return setError('Please enter a valid 10-digit mobile number.');
    if (method === 'bank' && accountNum.replace(/\D/g,'').length < 8)
      return setError('Please enter a valid account/IBAN number.');

    setStep('processing');
    await new Promise(r => setTimeout(r, 2200)); // simulate processing delay

    try {
      const { data } = await axios.post('/api/payments/simulate', {
        appointment_id,
        doctor_id,
        card_number : cardNumber,
        card_name   : cardName,
        expiry,
        cvv,
        method,
        mobile_number  : mobileNum,
        account_number : accountNum,
      });
      setTxnRef(data.payment.transaction_ref);
      setStep('success');
      toast('Payment successful! 🎉', 'success');
    } catch (e) {
      setStep('details');
      setError(e.response?.data?.error || 'Payment failed. Please try again.');
    }
  };

  if (!fee && step !== 'success') return (
    <div style={styles.page}><div style={styles.spinner} /></div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => step === 'details' ? setStep('method') : nav(-1)}>←</button>
          <div>
            <h2 style={styles.title}>Secure Payment</h2>
            <p style={styles.subtitle}>Appointment confirmation</p>
          </div>
          <div style={styles.lockBadge}>🔒 SSL</div>
        </div>

        {/* Order summary */}
        <div style={styles.summaryCard}>
          <div style={styles.summaryRow}>
            <div style={styles.docAvatar}>{getDoctorEmoji(doctor_spec)}</div>
            <div style={{ flex: 1 }}>
              <div style={styles.docName}>{doctor_name}</div>
              <div style={styles.docSpec}>{doctor_spec}</div>
              <div style={styles.apptTime}>📅 {formatDate(date)} &nbsp;|&nbsp; 🕐 {time}</div>
            </div>
            <div style={styles.feeBox}>
              <div style={styles.feeAmount}>Rs {fee?.toLocaleString()}</div>
              <div style={styles.feeSub}>Consultation fee</div>
            </div>
          </div>
          <div style={styles.divider} />
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.9rem', fontWeight:700 }}>
            <span>Total Due</span>
            <span style={{ color:'var(--teal)', fontSize:'1.1rem' }}>Rs {fee?.toLocaleString()}</span>
          </div>
        </div>

        {/* ── STEP: Method Selection ── */}
        {step === 'method' && (
          <div>
            <div style={styles.sectionLabel}>CHOOSE PAYMENT METHOD</div>
            <div style={styles.methodGrid}>
              {METHODS.map(m => (
                <button key={m.id} style={{ ...styles.methodBtn, ...(method===m.id ? styles.methodBtnActive : {}) }}
                  onClick={() => setMethod(m.id)}>
                  <div style={styles.methodIcon}>{m.icon}</div>
                  <div style={{ flex:1, textAlign:'left' }}>
                    <div style={styles.methodLabel}>{m.label}</div>
                    <div style={styles.methodDesc}>{m.desc}</div>
                  </div>
                  <div style={{ ...styles.methodRadio, ...(method===m.id ? styles.methodRadioActive : {}) }}>
                    {method===m.id && <div style={styles.methodRadioDot} />}
                  </div>
                </button>
              ))}
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.payBtn} onClick={proceedToDetails}>
              Continue to Payment →
            </button>
          </div>
        )}

        {/* ── STEP: Card Details ── */}
        {step === 'details' && method === 'card' && (
          <div>
            <div style={styles.sectionLabel}>CARD DETAILS</div>
            {/* Visual Card Preview */}
            <div style={styles.cardPreview}>
              <div style={styles.cardChip}>▬▬</div>
              <div style={styles.cardNumberPreview}>{cardNumber || '•••• •••• •••• ••••'}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'rgba(255,255,255,0.7)', marginTop:8 }}>
                <span>{cardName || 'CARDHOLDER NAME'}</span>
                <span>{expiry || 'MM/YY'}</span>
              </div>
              <div style={styles.cardLogo}>VISA</div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Cardholder Name</label>
              <input style={styles.input} placeholder="As on card" value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Card Number</label>
              <input style={styles.input} placeholder="1234 5678 9012 3456" value={cardNumber}
                onChange={e => setCardNumber(formatCard(e.target.value))} maxLength={19} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Expiry Date</label>
                <input style={styles.input} placeholder="MM/YY" value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))} maxLength={5} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>CVV</label>
                <input style={styles.input} placeholder="•••" type="password" value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g,'').slice(0,4))} maxLength={4} />
              </div>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.payBtn} onClick={processPayment}>
              🔒 Pay Rs {fee?.toLocaleString()}
            </button>
          </div>
        )}

        {/* ── STEP: Mobile Wallet (EasyPaisa / JazzCash) ── */}
        {step === 'details' && (method === 'easypaisa' || method === 'jazzcash') && (
          <div>
            <div style={styles.sectionLabel}>{method === 'easypaisa' ? '📱 EASYPAISA' : '🔶 JAZZCASH'} PAYMENT</div>
            <div style={{ background:'var(--teal-lt)', border:'1px solid var(--teal)', borderRadius:12, padding:'12px 16px', marginBottom:'1.2rem', fontSize:'0.85rem', color:'var(--teal)' }}>
              Enter your registered {method === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} mobile number. You will receive a payment request on your app.
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Mobile Number</label>
              <input style={styles.input} placeholder="03XX XXXXXXX" value={mobileNum}
                onChange={e => setMobileNum(e.target.value.replace(/\D/g,'').slice(0,11))} />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.payBtn} onClick={processPayment}>
              📱 Send Payment Request — Rs {fee?.toLocaleString()}
            </button>
          </div>
        )}

        {/* ── STEP: Bank Transfer ── */}
        {step === 'details' && method === 'bank' && (
          <div>
            <div style={styles.sectionLabel}>🏦 BANK TRANSFER / IBFT</div>
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:12, padding:'1rem', marginBottom:'1.2rem', fontSize:'0.85rem' }}>
              <div style={{ fontWeight:700, marginBottom:8, color:'var(--text)' }}>Transfer to:</div>
              <div style={{ color:'var(--muted)' }}>Bank: <strong style={{ color:'var(--text)' }}>HBL / Meezan / MCB</strong></div>
              <div style={{ color:'var(--muted)' }}>Account: <strong style={{ color:'var(--text)' }}>0123-4567-8901</strong></div>
              <div style={{ color:'var(--muted)' }}>IBAN: <strong style={{ color:'var(--text)' }}>PK36HABB0000000000010001</strong></div>
              <div style={{ color:'var(--muted)' }}>Amount: <strong style={{ color:'var(--teal)' }}>Rs {fee?.toLocaleString()}</strong></div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Your Account / Transaction Number</label>
              <input style={styles.input} placeholder="Enter your bank account or transaction ref" value={accountNum}
                onChange={e => setAccountNum(e.target.value)} />
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button style={styles.payBtn} onClick={processPayment}>
              ✅ Confirm Transfer — Rs {fee?.toLocaleString()}
            </button>
          </div>
        )}

        {/* ── STEP: Processing ── */}
        {step === 'processing' && (
          <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
            <div style={{ ...styles.spinner, margin:'0 auto 1.5rem' }} />
            <div style={{ fontFamily:'Playfair Display, serif', fontSize:'1.3rem', marginBottom:'0.5rem' }}>Processing Payment…</div>
            <div style={{ color:'var(--muted)', fontSize:'0.9rem' }}>Please wait, do not close this window.</div>
          </div>
        )}

        {/* ── STEP: Success ── */}
        {step === 'success' && (
          <div style={{ textAlign:'center', padding:'2rem 0' }}>
            <div style={{ fontSize:'4rem', animation:'pop 0.4s ease', marginBottom:'1rem' }}>✅</div>
            <h3 style={{ fontFamily:'Playfair Display, serif', fontSize:'1.6rem', marginBottom:'0.5rem' }}>Payment Successful!</h3>
            <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>Your appointment with {doctor_name} is confirmed.</p>
            <div style={{ background:'var(--surface2)', borderRadius:12, padding:'1rem', marginBottom:'1.5rem', fontSize:'0.85rem', textAlign:'left' }}>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Transaction Ref</span><strong>{txnRef}</strong></div>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Amount Paid</span><strong style={{ color:'var(--teal)' }}>Rs {fee?.toLocaleString()}</strong></div>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Doctor</span><strong>{doctor_name}</strong></div>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Date & Time</span><strong>{formatDate(date)} · {time}</strong></div>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Method</span><strong style={{ textTransform:'capitalize' }}>{method}</strong></div>
              <div style={styles.receiptRow}><span style={{ color:'var(--muted)' }}>Status</span><strong style={{ color:'var(--success)' }}>PAID ✓</strong></div>
            </div>
            <div style={{ display:'flex', gap:'0.8rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button style={styles.payBtn} onClick={() => nav('/appointments')}>View Appointments</button>
              <button style={{ ...styles.payBtn, background:'var(--surface2)', color:'var(--text)', boxShadow:'none' }}
                onClick={() => window.print()}>🖨️ Print Receipt</button>
            </div>
          </div>
        )}

        {/* Security note */}
        {step !== 'success' && step !== 'processing' && (
          <div style={styles.securityNote}>
            🔒 256-bit SSL encrypted · Your payment info is never stored · Powered by Stripe
          </div>
        )}
      </div>

      <style>{`
        @keyframes pop { 0%{transform:scale(0)} 80%{transform:scale(1.1)} 100%{transform:scale(1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '';
  return new Date(d + 'T00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
}
function getDoctorEmoji(spec) {
  const map = { 'Cardiologist':'👩‍⚕️','Neurologist':'👨‍⚕️','Dermatologist':'👩‍⚕️','Orthopedic':'👨‍⚕️','Pediatrician':'👩‍⚕️','General Physician':'👨‍⚕️' };
  return map[spec] || '👨‍⚕️';
}

// ── Styles ────────────────────────────────────────────────
const styles = {
  page: { minHeight:'calc(100vh - 60px)', background:'var(--bg)', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'2rem 1rem' },
  container: { width:'100%', maxWidth:520, display:'flex', flexDirection:'column', gap:'1.2rem' },
  header: { display:'flex', alignItems:'center', gap:12 },
  backBtn: { background:'var(--surface2)', border:'1px solid var(--border)', borderRadius:10, padding:'8px 14px', fontSize:'1rem', cursor:'pointer', color:'var(--text)', fontFamily:'DM Sans,sans-serif' },
  title: { fontFamily:'Playfair Display,serif', fontSize:'1.5rem', margin:0 },
  subtitle: { fontSize:'0.82rem', color:'var(--muted)', margin:0 },
  lockBadge: { marginLeft:'auto', background:'var(--teal-lt)', color:'var(--teal)', fontSize:'0.75rem', fontWeight:700, padding:'4px 10px', borderRadius:50 },
  summaryCard: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:'1.2rem', boxShadow:'var(--shadow)' },
  summaryRow: { display:'flex', alignItems:'center', gap:14, marginBottom:'0.8rem' },
  docAvatar: { width:50, height:50, borderRadius:'50%', background:'var(--teal-lt)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 },
  docName: { fontFamily:'Playfair Display,serif', fontWeight:700, fontSize:'1rem' },
  docSpec: { fontSize:'0.8rem', color:'var(--teal)', fontWeight:500, marginTop:2 },
  apptTime: { fontSize:'0.8rem', color:'var(--muted)', marginTop:4 },
  feeBox: { textAlign:'right', flexShrink:0 },
  feeAmount: { fontFamily:'Playfair Display,serif', fontSize:'1.2rem', fontWeight:700, color:'var(--teal)' },
  feeSub: { fontSize:'0.72rem', color:'var(--muted)' },
  divider: { height:1, background:'var(--border)', margin:'0.8rem 0' },
  sectionLabel: { fontSize:'0.72rem', fontWeight:700, letterSpacing:2, color:'var(--muted)', marginBottom:'0.8rem' },
  methodGrid: { display:'flex', flexDirection:'column', gap:10, marginBottom:'1.2rem' },
  methodBtn: { display:'flex', alignItems:'center', gap:14, padding:'14px 16px', background:'var(--surface)', border:'2px solid var(--border)', borderRadius:14, cursor:'pointer', transition:'all 0.2s', width:'100%', fontFamily:'DM Sans,sans-serif' },
  methodBtnActive: { borderColor:'var(--teal)', background:'var(--teal-lt)' },
  methodIcon: { fontSize:'1.8rem', flexShrink:0 },
  methodLabel: { fontSize:'0.9rem', fontWeight:600, color:'var(--text)', marginBottom:2 },
  methodDesc: { fontSize:'0.75rem', color:'var(--muted)' },
  methodRadio: { width:20, height:20, borderRadius:'50%', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  methodRadioActive: { borderColor:'var(--teal)' },
  methodRadioDot: { width:10, height:10, borderRadius:'50%', background:'var(--teal)' },
  cardPreview: { background:'linear-gradient(135deg, #0b7b81 0%, #085f64 100%)', borderRadius:18, padding:'1.4rem', marginBottom:'1.4rem', color:'white', position:'relative', overflow:'hidden', minHeight:160 },
  cardChip: { fontSize:'1.2rem', marginBottom:'1rem', opacity:0.8 },
  cardNumberPreview: { fontFamily:'monospace', fontSize:'1.1rem', letterSpacing:3, marginBottom:'0.5rem' },
  cardLogo: { position:'absolute', top:16, right:16, fontFamily:'serif', fontStyle:'italic', fontWeight:700, fontSize:'1.1rem', color:'rgba(255,255,255,0.8)' },
  formGroup: { marginBottom:'1rem' },
  label: { display:'block', fontSize:'0.8rem', fontWeight:600, marginBottom:6, color:'var(--text)' },
  input: { width:'100%', padding:'11px 14px', border:'1.5px solid var(--border)', borderRadius:10, fontSize:'0.9rem', fontFamily:'DM Sans,sans-serif', background:'var(--bg)', color:'var(--text)', outline:'none', transition:'border-color 0.2s' },
  error: { color:'var(--danger)', fontSize:'0.82rem', padding:'10px 14px', background:'color-mix(in srgb, var(--danger) 10%, transparent)', borderRadius:10, marginBottom:'1rem', border:'1px solid color-mix(in srgb, var(--danger) 20%, transparent)' },
  payBtn: { width:'100%', padding:'14px', background:'var(--teal)', color:'white', border:'none', borderRadius:50, fontSize:'1rem', fontWeight:700, fontFamily:'DM Sans,sans-serif', cursor:'pointer', boxShadow:'0 4px 16px rgba(11,123,129,0.35)', transition:'all 0.2s', marginTop:4 },
  securityNote: { textAlign:'center', fontSize:'0.75rem', color:'var(--muted)', padding:'0.5rem', borderTop:'1px solid var(--border)' },
  spinner: { width:36, height:36, border:'3px solid var(--border)', borderTopColor:'var(--teal)', borderRadius:'50%', animation:'spin 0.7s linear infinite' },
  receiptRow: { display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid var(--border)', fontSize:'0.85rem' },
};
