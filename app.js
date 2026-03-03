/* ═══════════════════════════════════════════════════
   /*   CareSync App Logic
   ═══════════════════════════════════════════════════ */

// ── API Client ───────────────────────────────────────────
const API_BASE = '/api';
let authToken = localStorage.getItem('mb-token') || null;

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const res = await fetch(url, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.error || `HTTP ${res.status}`);
    }
    return data;
  } catch (err) {
    console.error('API Error:', err);
    throw err;
  }
}

// ── In-memory DB (fallback/cache) ─────────────────────────
let DB = {
  patients: [], appointments: [], payments: [],
  doctors: [],
  admins:[]
};

// ── State ─────────────────────────────────────────────────
let curUser = null, curPage = 'home', selDoc = null, selSlot = null;
let starRating = 5, payMethod = 'card', payAppt = null;
let dpFilter = 'pending';

// ── Dark mode ─────────────────────────────────────────────
function toggleDark(){
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('mb-theme', next);
  // Update any inline rgba backgrounds that can't use CSS vars
  updateDynamicColors(next);
}

function updateDynamicColors(theme){
  const navbar = document.querySelector('.navbar');
  if(navbar){
    navbar.style.background = theme==='dark'
      ? 'rgba(14,17,23,0.95)'
      : 'rgba(249,247,242,0.92)';
  }
  // Hero section
  const hero = document.querySelector('.hero');
  if(hero){
    hero.style.background = theme==='dark'
      ? 'radial-gradient(ellipse 60% 80% at 70% 50%, #0d2820 0%, transparent 70%), #0e1117'
      : '';
  }
  // Auth wrap
  document.querySelectorAll('.auth-wrap').forEach(el => {
    el.style.background = theme==='dark'
      ? 'radial-gradient(ellipse 70% 70% at 20% 80%, #0d2820, transparent), #0e1117'
      : '';
  });
  // Pay page
  const payPage = document.querySelector('.pay-page');
  if(payPage){
    payPage.style.background = theme==='dark'
      ? 'radial-gradient(ellipse 60% 60% at 80% 20%, #0d2820, #0e1117)'
      : '';
  }
}

// Init theme on load
(function(){
  const saved = localStorage.getItem('mb-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  // Apply dynamic colors after DOM ready
  document.addEventListener('DOMContentLoaded', async () => {
    updateDynamicColors(theme);
    // Load doctors from API
    await loadDoctors();
    renderDocs();
    // Restore user session if token exists
    const savedUser = localStorage.getItem('mb-user');
    if(savedUser && authToken){
      curUser = JSON.parse(savedUser);
      updateNav();
    }
  });
})();

// ── Router ────────────────────────────────────────────────
function show(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const el=document.getElementById('page-'+page);
  if(el)el.classList.add('active');
  curPage=page;
  updateNav();
  // Re-apply dynamic colors for current theme
  const theme = document.documentElement.getAttribute('data-theme') || 'light';
  updateDynamicColors(theme);
  if(page==='doctors')renderDocs();
  if(page==='appointments')renderAppts();
  if(page==='profile')loadProfile();
  if(page==='doctor-panel')renderDoctorPanel();
  if(page==='admin')renderAdmin('overview');
  window.scrollTo({top:0,behavior:'smooth'});
}

function updateNav(){
  // Desktop nav links
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  const map={'home':0,'doctors':1,'appointments':2};
  const links=document.querySelectorAll('.nav-link');
  if(map[curPage]!==undefined)links[map[curPage]]?.classList.add('active');
  // Auth state
  const isIn=!!curUser;
  document.getElementById('navGuest').classList.toggle('hidden',isIn);
  document.getElementById('navUser').classList.toggle('hidden',!isIn);
  if(curUser){
    const firstName = curUser.name.split(' ')[0];
    document.getElementById('navUserName').textContent = firstName;
    document.getElementById('navUserNameLg').textContent = curUser.name;
    document.getElementById('navUserRole').textContent = curUser.role || 'Patient';
    // Show/hide doctor panel link based on role
    const doctorPanelLink = document.getElementById('navDoctorPanel');
    if(doctorPanelLink){
      doctorPanelLink.style.display = curUser.role === 'doctor' ? 'flex' : 'none';
    }
  }
  // Close user menu on nav update
  const userDropdown = document.querySelector('.user-dropdown');
  if(userDropdown) userDropdown.classList.remove('active');
  // Bottom nav
  renderBottomNav();
}

// User dropdown toggle
function toggleUserMenu(){
  const dropdown = document.querySelector('.user-dropdown');
  dropdown.classList.toggle('active');
}

// Close user menu when clicking outside
document.addEventListener('click', function(e){
  const dropdown = document.querySelector('.user-dropdown');
  if(dropdown && !dropdown.contains(e.target)){
    dropdown.classList.remove('active');
  }
});

function renderBottomNav(){
  const bnItems=document.getElementById('bnItems');
  let items;
  if(curUser?.role==='doctor') items=[{icon:'🏠',label:'Home',page:'home'},{icon:'📋',label:'Panel',page:'doctor-panel'}];
  else if(curUser?.role==='admin') items=[{icon:'🏠',label:'Home',page:'home'},{icon:'⚙️',label:'Admin',page:'admin'}];
  else items=[{icon:'🏠',label:'Home',page:'home'},{icon:'👨‍⚕️',label:'Doctors',page:'doctors'},{icon:'📅',label:'Appts',page:'appointments'},{icon:'👤',label:'Profile',page:'profile'}];
  bnItems.innerHTML=items.map(i=>`<button class="bn-btn ${curPage===i.page?'active':''}" onclick="show('${i.page}')"><span class="bn-icon">${i.icon}</span>${i.label}</button>`).join('');
}

// ── Toast ─────────────────────────────────────────────────
function toast(msg,type='info'){
  const icon={success:'✅',error:'❌',info:'ℹ️'}[type]||'ℹ️';
  const t=document.createElement('div');
  t.className=`toast toast-${type}`;
  t.innerHTML=`<span>${icon}</span><span>${msg}</span>`;
  document.getElementById('toastWrap').appendChild(t);
  setTimeout(()=>t.remove(),3500);
}

// ── Social Login — OAuth-style popup modal ────────────────
const SOCIAL_META = {
  'Google':     { icon: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,     color:'#4285F4', hint:'your.name@gmail.com' },
  'Facebook':   { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`, color:'#1877F2', hint:'your.name@facebook.com' },
  'Apple':      { icon: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>`,   color:'#000000', hint:'your.name@icloud.com' },
  'GitHub':     { icon: `<svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`, color:'#333333', hint:'username@github.com' },
  'X (Twitter)':{ icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`, color:'#000000', hint:'user@x.com' },
  'LinkedIn':   { icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`, color:'#0A66C2', hint:'your.name@company.com' },
};

let _oauthProvider = null;
let _oauthEmail = null;
let _oauthName = null;
let _verificationCode = null;

function socialLogin(provider) {
  _oauthProvider = provider;
  const meta = SOCIAL_META[provider] || { icon:'🔗', color:'#666', hint:'you@email.com' };

  // Build and show the OAuth modal
  const overlay = document.createElement('div');
  overlay.id = 'oauth-overlay';
  overlay.innerHTML = `
    <div class="oauth-modal" id="oauth-modal" role="dialog" aria-modal="true">
      <div class="oauth-header">
        <div class="oauth-provider-icon">${meta.icon}</div>
        <div>
          <div class="oauth-title">Sign in with ${provider}</div>
          <div class="oauth-subtitle">Enter your ${provider} account details</div>
        </div>
        <button class="oauth-close" onclick="closeOAuth()" aria-label="Close">✕</button>
      </div>

      <div class="oauth-divider-line"></div>

      <div class="oauth-body" id="oauth-step-1">
        <div class="oauth-app-row">
          <div class="oauth-app-icon">🩺</div>
          <div>
            <div class="oauth-app-name">CareSync</div>
            <div class="oauth-app-desc">wants to access your ${provider} account</div>
          </div>
        </div>

        <div class="oauth-permissions">
          <div class="oauth-perm">✓ Read your name and email address</div>
          <div class="oauth-perm">✓ Create your CareSync profile</div>
        </div>

        <div class="oauth-field-group">
          <label class="oauth-label">Full Name</label>
          <input id="oauth-name" class="oauth-input" type="text" placeholder="Your full name" autocomplete="name">
        </div>
        <div class="oauth-field-group">
          <label class="oauth-label">Email Address</label>
          <input id="oauth-email" class="oauth-input" type="email" placeholder="${meta.hint}" autocomplete="email">
        </div>
        <div id="oauth-err" class="oauth-err hidden"></div>

        <button class="oauth-submit" id="oauth-submit-btn"
          style="background:${meta.color === '#000000' ? (document.documentElement.getAttribute('data-theme')==='dark' ? '#fff' : '#000') : meta.color}"
          onclick="requestVerification()">
          <span style="display:inline-flex;align-items:center;gap:8px">
            ${meta.icon}
            Continue with ${provider}
          </span>
        </button>

        <p class="oauth-terms">
          By continuing, you agree to CareSync's Terms of Service and Privacy Policy.
          This is a demo — no real OAuth connection is made.
        </p>
      </div>

      <div class="oauth-body hidden" id="oauth-step-2">
        <div class="oauth-app-row">
          <div class="oauth-app-icon" style="background:var(--green)">✉️</div>
          <div>
            <div class="oauth-app-name">Verify your email</div>
            <div class="oauth-app-desc">Enter the 6-digit code sent to your email</div>
          </div>
        </div>

        <div style="background:var(--green-lt);border-radius:var(--radius-sm);padding:12px;margin-bottom:1rem;font-size:.85rem;color:var(--green)">
          <strong>Demo Mode:</strong> Use code <code style="background:rgba(255,255,255,0.5);padding:2px 6px;border-radius:4px">123456</code> to verify
        </div>

        <div class="oauth-field-group">
          <label class="oauth-label">Verification Code</label>
          <input id="oauth-code" class="oauth-input" type="text" placeholder="123456" maxlength="6" style="text-align:center;font-size:1.5rem;letter-spacing:8px">
        </div>
        <div id="oauth-code-err" class="oauth-err hidden"></div>

        <button class="oauth-submit" id="oauth-verify-btn"
          style="background:var(--green)"
          onclick="submitOAuth()">
          Verify & Continue
        </button>

        <button class="oauth-submit" style="background:transparent;color:var(--muted);margin-top:8px;border:1px solid var(--border)" onclick="backToOAuthStep1()">
          ← Back
        </button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  // Trap focus on name input
  setTimeout(() => document.getElementById('oauth-name')?.focus(), 80);
  // Close on backdrop click
  overlay.addEventListener('click', e => { if(e.target === overlay) closeOAuth(); });
  // Close on Escape
  document.addEventListener('keydown', _oauthEscHandler);
}

function showOAuthStep(step) {
  document.getElementById('oauth-step-1').classList.toggle('hidden', step !== 1);
  document.getElementById('oauth-step-2').classList.toggle('hidden', step !== 2);
}

function backToOAuthStep1() {
  showOAuthStep(1);
}

async function requestVerification() {
  const name  = document.getElementById('oauth-name')?.value?.trim();
  const email = document.getElementById('oauth-email')?.value?.trim();
  const err   = document.getElementById('oauth-err');
  const btn   = document.getElementById('oauth-submit-btn');
  err.classList.add('hidden');

  if (!name)                         return showOauthErr('Please enter your full name.');
  if (!email || !/\S+@\S+\.\S+/.test(email)) return showOauthErr('Please enter a valid email address.');

  // Validate email domain matches provider
  const domainMap = {
    'Google': ['gmail.com'],
    'Facebook': ['facebook.com'],
    'Apple': ['icloud.com', 'me.com', 'mac.com'],
    'GitHub': ['github.com'],
    'X (Twitter)': ['x.com', 'twitter.com'],
    'LinkedIn': ['linkedin.com']
  };
  const allowedDomains = domainMap[_oauthProvider];
  if (allowedDomains) {
    const userDomain = email.split('@')[1].toLowerCase();
    if (!allowedDomains.includes(userDomain)) {
      return showOauthErr(`Please use a ${allowedDomains.join(' or ')} email for ${_oauthProvider} login.`);
    }
  }

  // Loading state
  btn.textContent = 'Sending code…';
  btn.disabled = true;
  btn.style.opacity = '0.75';

  await wait(1000);

  // Generate verification code (demo: always 123456)
  _verificationCode = '123456';
  _oauthEmail = email;
  _oauthName = name;

  showOAuthStep(2);
  setTimeout(() => document.getElementById('oauth-code')?.focus(), 100);
}

function _oauthEscHandler(e) {
  if(e.key === 'Escape') closeOAuth();
}

function closeOAuth() {
  const el = document.getElementById('oauth-overlay');
  if(el) {
    el.style.animation = 'oauthFadeOut .2s ease forwards';
    setTimeout(() => el.remove(), 200);
  }
  document.removeEventListener('keydown', _oauthEscHandler);
  _oauthProvider = null;
}

async function submitOAuth() {
  const code = document.getElementById('oauth-code')?.value?.trim();
  const err = document.getElementById('oauth-code-err');
  const btn = document.getElementById('oauth-verify-btn');
  err.classList.add('hidden');

  if (!code || code.length !== 6) return showOauthCodeErr('Please enter the 6-digit verification code.');
  if (code !== _verificationCode) return showOauthCodeErr('Invalid verification code. Please try again.');

  // Loading state
  btn.textContent = 'Verifying…';
  btn.disabled = true;
  btn.style.opacity = '0.75';

  await wait(1000);

  try {
    // Call backend API to register/login via OAuth
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ 
        name: _oauthName, 
        email: _oauthEmail, 
        phone: '—', 
        age: 0, 
        password: 'oauth_' + _oauthProvider + '_' + Date.now()
      })
    });
    setUser({...data.user, token: data.token});
    closeOAuth();
    toast(`Account created via ${_oauthProvider}! Welcome, ${_oauthName.split(' ')[0]}! ✓`, 'success');
    show('doctors');
  } catch(errMsg) {
    // If already registered, try to login
    try {
      const loginData = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: _oauthEmail, password: 'oauth_' + _oauthProvider })
      });
      setUser({...loginData.user, token: loginData.token});
      closeOAuth();
      toast(`Welcome back, ${_oauthName.split(' ')[0]}! Signed in via ${_oauthProvider} ✓`, 'success');
      show('doctors');
    } catch(e) {
      showOauthCodeErr(errMsg.message || 'Authentication failed');
      btn.textContent = 'Verify & Continue';
      btn.disabled = false;
      btn.style.opacity = '1';
    }
  }
}

function showOauthCodeErr(msg) {
  const err = document.getElementById('oauth-code-err');
  if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}

function showOauthErr(msg) {
  const err = document.getElementById('oauth-err');
  if (err) { err.textContent = msg; err.classList.remove('hidden'); }
}

// ── Auth ──────────────────────────────────────────────────
async function doRegister(){
  const n=v('reg-name'),e=v('reg-email'),ph=v('reg-phone'),a=v('reg-age'),p=v('reg-pass');
  const err=document.getElementById('reg-err');
  err.classList.add('hidden');
  if(!n||!e||!ph||!a||!p)return showErr(err,'All fields are required.');
  if(!/\S+@\S+\.\S+/.test(e))return showErr(err,'Enter a valid email address.');
  if(p.length<8)return showErr(err,'Password must be at least 8 characters.');
  
  try {
    const data = await api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: n, email: e, phone: ph, age: +a, password: p })
    });
    setUser({...data.user, token: data.token});
    toast('Welcome to CareSync! 🎉','success');
    show('doctors');
  } catch(errMsg) {
    showErr(err, errMsg.message || 'Registration failed');
  }
}

async function doLogin(){
  const e=v('login-email'),p=v('login-pass'),err=document.getElementById('login-err');
  err.classList.add('hidden');
  
  try {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: e, password: p })
    });
    setUser({...data.user, token: data.token});
    toast(`Welcome back, ${data.user.name.split(' ')[0]}!`,'success');
    show('doctors');
  } catch(errMsg) {
    showErr(err, errMsg.message || 'Invalid email or password');
  }
}

async function doDoctorLogin(){
  const e=v('dl-email'),p=v('dl-pass'),err=document.getElementById('dl-err');
  err.classList.add('hidden');
  
  try {
    const data = await api('/auth/doctor-login', {
      method: 'POST',
      body: JSON.stringify({ email: e, password: p })
    });
    setUser({...data.user, token: data.token});
    toast('Doctor login successful!','success');
    show('doctor-panel');
  } catch(errMsg) {
    showErr(err, errMsg.message || 'Invalid credentials');
  }
}

// Show file name when selected
function showFileName(input, displayId){
  const display = document.getElementById(displayId);
  const uploadDiv = input.parentElement;
  if(input.files && input.files[0]){
    const file = input.files[0];
    const sizeMB = (file.size / (1024*1024)).toFixed(1);
    display.textContent = file.name + ' (' + sizeMB + ' MB)';
    uploadDiv.classList.add('has-file');
  } else {
    display.textContent = 'Click to upload';
    uploadDiv.classList.remove('has-file');
  }
}

// Doctor Registration
async function doDoctorRegister(){
  const err = document.getElementById('dr-err');
  err.classList.add('hidden');
  
  // Get all values
  const name = v('dr-name');
  const email = v('dr-email');
  const phone = v('dr-phone');
  const password = v('dr-pass');
  const spec = v('dr-spec');
  const exp = v('dr-exp');
  const regNum = v('dr-reg');
  const fee = v('dr-fee');
  const bio = v('dr-bio') || '';
  const terms = document.getElementById('dr-terms').checked;
  
  // Get selected degrees
  const degrees = [];
  document.querySelectorAll('#degree-tags input:checked').forEach(cb => degrees.push(cb.value));
  
  // Get files
  const degreeFile = document.getElementById('doc-degree').files[0];
  const regFile = document.getElementById('doc-reg').files[0];
  const idFile = document.getElementById('doc-id').files[0];
  const photoFile = document.getElementById('doc-photo').files[0];
  
  // Validation
  if(!name || !email || !phone || !password) return showErr(err, 'Please fill all required fields');
  if(password.length < 8) return showErr(err, 'Password must be at least 8 characters');
  if(!spec) return showErr(err, 'Please select a specialization');
  if(!exp || exp < 0) return showErr(err, 'Please enter valid years of experience');
  if(!regNum) return showErr(err, 'Please enter your medical registration number');
  if(degrees.length === 0) return showErr(err, 'Please select at least one degree/qualification');
  if(!fee || fee < 0) return showErr(err, 'Please enter a valid consultation fee');
  if(!degreeFile) return showErr(err, 'Please upload your medical degree certificate');
  if(!regFile) return showErr(err, 'Please upload your medical council registration');
  if(!idFile) return showErr(err, 'Please upload your government ID proof');
  if(!photoFile) return showErr(err, 'Please upload your profile photo');
  if(!terms) return showErr(err, 'Please confirm that all information is accurate');
  
  // File size validation
  if(degreeFile.size > 5*1024*1024) return showErr(err, 'Degree certificate must be less than 5MB');
  if(regFile.size > 5*1024*1024) return showErr(err, 'Registration certificate must be less than 5MB');
  if(idFile.size > 5*1024*1024) return showErr(err, 'ID proof must be less than 5MB');
  if(photoFile.size > 2*1024*1024) return showErr(err, 'Profile photo must be less than 2MB');
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('specialization', spec);
    formData.append('experience', exp);
    formData.append('registrationNumber', regNum);
    formData.append('degrees', JSON.stringify(degrees));
    formData.append('fee', fee);
    formData.append('bio', bio);
    formData.append('degreeCertificate', degreeFile);
    formData.append('registrationCertificate', regFile);
    formData.append('idProof', idFile);
    formData.append('profilePhoto', photoFile);
    
    const res = await fetch(API_BASE + '/auth/doctor-register', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    
    if(!res.ok){
      throw new Error(data.message || 'Registration failed');
    }
    
    toast('Application submitted successfully! Pending admin approval.', 'success');
    show('doctor-login');
    
    // Clear form
    document.getElementById('dr-name').value = '';
    document.getElementById('dr-email').value = '';
    document.getElementById('dr-phone').value = '';
    document.getElementById('dr-pass').value = '';
    document.getElementById('dr-spec').value = '';
    document.getElementById('dr-exp').value = '';
    document.getElementById('dr-reg').value = '';
    document.getElementById('dr-fee').value = '';
    document.getElementById('dr-bio').value = '';
    document.getElementById('dr-terms').checked = false;
    document.querySelectorAll('#degree-tags input:checked').forEach(cb => cb.checked = false);
    ['degree-name','reg-name','id-name','photo-name'].forEach(id => {
      document.getElementById(id).textContent = 'Click to upload';
    });
    document.querySelectorAll('.file-upload').forEach(el => el.classList.remove('has-file'));
    
  } catch(errMsg){
    showErr(err, errMsg.message || 'Registration failed. Please try again.');
  }
}

async function doAdminLogin(){
  const u=v('al-user'),p=v('al-pass'),err=document.getElementById('al-err');
  err.classList.add('hidden');
  
  try {
    const data = await api('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username: u, password: p })
    });
    setUser({...data.user, token: data.token});
    toast('Admin access granted','success');
    show('admin');
  } catch(errMsg) {
    showErr(err, errMsg.message || 'Invalid admin credentials');
  }
}

function setUser(u){
  curUser=u;
  if(u?.token){
    authToken=u.token;
    localStorage.setItem('mb-token', u.token);
    localStorage.setItem('mb-user', JSON.stringify(u));
  }
}
function doLogout(){
  curUser=null;
  authToken=null;
  localStorage.removeItem('mb-token');
  localStorage.removeItem('mb-user');
  toast('Logged out','info');
  show('home');
}

// ── Doctors ───────────────────────────────────────────────
async function loadDoctors(){
  try {
    const doctors = await api('/doctors');
    DB.doctors = doctors.map(d => ({
      id: d.doctor_id,
      name: d.name,
      spec: d.specialization,
      exp: d.experience,
      slots: d.available_time,
      emoji: d.emoji,
      rating: d.rating,
      reviews: d.reviews || [],
      fee: {Cardiologist:2500,Neurologist:2200,Dermatologist:1500,Orthopedic:2000,Pediatrician:1200,'General Physician':800}[d.specialization] || 1000
    }));
  } catch(e) {
    console.error('Failed to load doctors:', e);
    toast('Failed to load doctors', 'error');
  }
}

function renderDocs(){
  const q=(v('s-query')||'').toLowerCase();
  const sp=v('s-spec')||'';
  const list=DB.doctors.filter(d=>(!q||d.name.toLowerCase().includes(q)||d.spec.toLowerCase().includes(q))&&(!sp||d.spec===sp));
  document.getElementById('doc-count').textContent=`${list.length} doctor${list.length!==1?'s':''} found`;
  document.getElementById('docs-grid').innerHTML=list.length?list.map(docCard).join(''):`<div class="empty"><div class="empty-icon">🔍</div><p>No doctors found.</p></div>`;
}
function filterDocs(){renderDocs();}

function docCard(d){
  const stars='★'.repeat(Math.floor(d.rating))+'☆'.repeat(5-Math.floor(d.rating));
  return `<div class="card doc-card" onclick="openBook('${d.id}')">
    <div class="dc-head">
      <div class="dc-ava">${d.emoji}</div>
      <div>
        <div class="dc-name">${d.name}</div>
        <div class="dc-spec">${d.spec}</div>
      </div>
    </div>
    <div class="dc-exp">🎓 ${d.exp} years experience</div>
    <div><span class="stars">${stars}</span><span class="star-count">${d.rating} · ${d.reviews.length} reviews</span></div>
    <div class="dc-time">🕐 <strong>Slots:</strong> ${d.slots}</div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span class="fee-tag">Rs ${d.fee.toLocaleString()}</span>
      <button class="btn btn-primary btn-sm">Book Now</button>
    </div>
  </div>`;
}

// ── Book Appointment ──────────────────────────────────────
function openBook(docId){
  if(!curUser){show('login');toast('Please login to book','info');return;}
  selDoc=DB.doctors.find(d=>d.id===docId);
  selSlot=null;
  // Doctor info
  document.getElementById('book-doc-info').innerHTML=`
    <div class="dc-ava" style="width:60px;height:60px;font-size:2.2rem;flex-shrink:0">${selDoc.emoji}</div>
    <div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:1.2rem;font-weight:700">${selDoc.name}</div>
      <div style="font-size:.82rem;color:var(--green);font-weight:600">${selDoc.spec}</div>
      <div style="font-size:.8rem;color:var(--muted);margin-top:3px">🎓 ${selDoc.exp} yrs · Fee: Rs ${selDoc.fee.toLocaleString()}</div>
    </div>`;
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('book-date').min=today;
  document.getElementById('book-date').value=today;
  renderSlots();
  document.getElementById('book-err').classList.add('hidden');
  document.getElementById('book-prob').classList.add('hidden');
  renderDocReviews();
  show('book');
}

function renderSlots(){
  const slots=selDoc.slots.split(',').map(s=>s.trim());
  document.getElementById('book-slots').innerHTML=slots.map(s=>`<button class="slot-btn ${selSlot===s?'sel':''}" onclick="pickSlot('${s}')">${s}</button>`).join('');
}

function pickSlot(s){
  selSlot=s;
  renderSlots();
  // Show probability
  const taken=DB.appointments.filter(a=>a.docId===selDoc.id&&a.status!=='cancelled').length;
  const slots=selDoc.slots.split(',').length;
  const pct=Math.max(20,Math.round(100-(taken/slots)*60));
  const color=pct>=70?'var(--success)':pct>=40?'var(--warn)':'var(--danger)';
  const lbl=pct>=70?'High likelihood':pct>=40?'Moderate likelihood':'Low likelihood';
  document.getElementById('book-prob').innerHTML=`
    <div class="prob-label"><span style="color:var(--muted)">Confirmation probability</span><span style="color:${color};font-weight:700">${pct}% — ${lbl}</span></div>
    <div class="prob-track"><div class="prob-fill" style="width:${pct}%;background:${color}"></div></div>`;
  document.getElementById('book-prob').classList.remove('hidden');
}

function confirmBook(){
  const date=document.getElementById('book-date').value;
  const err=document.getElementById('book-err');
  err.classList.add('hidden');
  if(!date)return showErr(err,'Please select a date.');
  if(!selSlot)return showErr(err,'Please select a time slot.');
  const dup=DB.appointments.find(a=>a.docId===selDoc.id&&a.date===date&&a.time===selSlot&&a.status!=='cancelled');
  if(dup)return showErr(err,'This slot is already booked. Choose a different time.');
  const appt={
    id:'appt'+Date.now(),patId:curUser.id,patName:curUser.name,
    docId:selDoc.id,docName:selDoc.name,docSpec:selDoc.spec,docEmoji:selDoc.emoji,
    date,time:selSlot,status:'pending',
    prob:parseInt(document.querySelector('.prob-fill')?.style.width)||75,
    createdAt:new Date().toISOString()
  };
  DB.appointments.push(appt);
  payAppt=appt;
  // Set up payment page
  setupPaymentPage(appt);
  show('payment');
}

// ── Payment ───────────────────────────────────────────────
function setupPaymentPage(appt){
  const doc=DB.doctors.find(d=>d.id===appt.docId);
  document.getElementById('pay-avatar').textContent=doc.emoji;
  document.getElementById('pay-doc-name').textContent=doc.name;
  document.getElementById('pay-doc-spec').textContent=doc.spec;
  document.getElementById('pay-datetime').textContent=`📅 ${fmtDate(appt.date)} | 🕐 ${appt.time}`;
  document.getElementById('pay-fee-amt').textContent=`Rs ${doc.fee.toLocaleString()}`;
  document.getElementById('pay-total').textContent=`Rs ${doc.fee.toLocaleString()}`;
  document.getElementById('bank-amt').textContent=`Rs ${doc.fee.toLocaleString()}`;
  document.getElementById('pay-card-btn').textContent=`🔒 Pay Rs ${doc.fee.toLocaleString()}`;
  // Reset steps
  showPayStep('method');
}

function selMethod(m,btn){
  payMethod=m;
  document.querySelectorAll('.method-btn').forEach(b=>{
    b.classList.remove('sel');
    b.querySelector('.method-radio').innerHTML='';
  });
  btn.classList.add('sel');
  btn.querySelector('.method-radio').innerHTML='<div class="method-radio-dot"></div>';
}

function goToPayDetails(){
  if(payMethod==='card'){showPayStep('card');}
  else if(['gpay','phonepe','paytm','upi'].includes(payMethod)){
    const titles={gpay:'Google Pay',phonepe:'PhonePe',paytm:'Paytm',upi:'UPI'};
    document.getElementById('wallet-title').textContent=titles[payMethod]+' Payment';
    showPayStep('wallet');
  } else showPayStep('bank');
}

function showPayStep(step){
  ['method','card','wallet','upi','bank','processing','success'].forEach(s=>{
    const el=document.getElementById('pay-step-'+s);
    if(el)el.classList.add('hidden');
  });
  document.getElementById('pay-step-'+step).classList.remove('hidden');
  const hideSec=step==='processing'||step==='success';
  document.getElementById('pay-security').classList.toggle('hidden',hideSec);
}

function fmtCard(el){el.value=el.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();}
function fmtExp(el){const v=el.value.replace(/\D/g,'').slice(0,4);el.value=v.length>=3?v.slice(0,2)+'/'+v.slice(2):v;}

function updateCard(){
  document.getElementById('cv-num').textContent=v('cn-num')||'•••• •••• •••• ••••';
  document.getElementById('cv-name').textContent=v('cn-name')||'CARDHOLDER NAME';
  document.getElementById('cv-exp').textContent=v('cn-exp')||'MM/YY';
}

async function processPayment(){
  let errEl,valid=true;
  if(payMethod==='card'){
    errEl=document.getElementById('card-err');errEl.classList.add('hidden');
    if(!v('cn-name'))return showErr(errEl,'Enter cardholder name.');
    if((v('cn-num')||'').replace(/\s/g,'').length<16)return showErr(errEl,'Enter a valid 16-digit card number.');
    if((v('cn-exp')||'').length<5)return showErr(errEl,'Enter expiry (MM/YY).');
    if((v('cn-cvv')||'').length<3)return showErr(errEl,'Enter CVV.');
  } else if(['gpay','phonepe','paytm','upi'].includes(payMethod)){
    errEl=document.getElementById('wallet-err');errEl.classList.add('hidden');
    const upiId=v('wallet-num')||'';
    if(!upiId.match(/^[a-zA-Z0-9._-]+@[a-zA-Z]+$/))return showErr(errEl,'Enter a valid UPI ID (e.g., name@upi, name@okaxis)');
  } else {
    errEl=document.getElementById('bank-err');errEl.classList.add('hidden');
    if((v('bank-ref')||'').length<5)return showErr(errEl,'Enter your transaction / account number.');
  }

  showPayStep('processing');
  
  try {
    // Call backend API for payment
    const paymentData = {
      appointment_id: payAppt.id,
      doctor_id: payAppt.docId,
      method: payMethod,
      card_number: payMethod==='card' ? v('cn-num') : undefined,
      card_name: payMethod==='card' ? v('cn-name') : undefined,
      expiry: payMethod==='card' ? v('cn-exp') : undefined,
      cvv: payMethod==='card' ? v('cn-cvv') : undefined
    };
    
    const result = await api('/payments/simulate', {
      method: 'POST',
      body: JSON.stringify(paymentData)
    });
    
    const doc=DB.doctors.find(d=>d.id===payAppt.docId);
    
    // Receipt
    document.getElementById('pay-success-msg').textContent=`Your appointment with ${doc.name} is confirmed.`;
    document.getElementById('pay-receipt').innerHTML=[
      ['Transaction Ref',result.payment.transaction_ref],['Amount Paid',`Rs ${result.payment.amount.toLocaleString()}`],
      ['Doctor',doc.name],['Date & Time',`${fmtDate(payAppt.date)} · ${payAppt.time}`],
      ['Method',result.payment.method],['Status','PAID ✓']
    ].map(([l,v])=>`<div class="receipt-row"><span>${l}</span><strong>${v}</strong></div>`).join('');
    
    payAppt.status='approved';
    payAppt.payId=result.payment.payment_id;
    
    showPayStep('success');
    toast('Payment successful! 🎉','success');
  } catch(err) {
    const stepMap={card:'card',bank:'bank',gpay:'wallet',phonepe:'wallet',paytm:'wallet',upi:'wallet'};
    showPayStep(stepMap[payMethod]||'wallet');
    toast(err.message || 'Payment failed', 'error');
  }
}

// ── My Appointments ───────────────────────────────────────
function renderAppts(){
  if(!curUser){
    document.getElementById('appt-body').innerHTML=`<div class="empty"><div class="empty-icon">🔐</div><p>Please login to view your appointments.</p><button class="btn btn-primary" onclick="show('login')">Login</button></div>`;return;
  }
  const all=DB.appointments.filter(a=>a.patId===curUser.id);
  if(!all.length){
    document.getElementById('appt-body').innerHTML=`<div class="empty"><div class="empty-icon">📅</div><p>You have no appointments yet.</p><button class="btn btn-primary" onclick="show('doctors')">Book Your First</button></div>`;return;
  }
  const upcoming=all.filter(a=>a.status!=='cancelled'&&new Date(a.date+'T00:00')>=new Date());
  const past=all.filter(a=>a.status==='cancelled'||new Date(a.date+'T00:00')<new Date());
  let html='';
  if(upcoming.length){html+=`<div class="section-heading">Upcoming</div>`;upcoming.forEach(a=>{html+=apptCard(a,true)});}
  if(past.length){html+=`<div class="section-heading" style="margin-top:2rem;opacity:.7">Past / Cancelled</div>`;past.forEach(a=>{html+=apptCard(a,false)});}
  document.getElementById('appt-body').innerHTML=html;
}

function apptCard(a,showActions){
  const badge={pending:'<span class="badge badge-pending">Pending</span>',approved:'<span class="badge badge-success">Approved</span>',cancelled:'<span class="badge badge-danger">Cancelled</span>'}[a.status]||'';
  const countdown=showActions&&a.status!=='cancelled'?`<div class="countdown" style="margin-top:.7rem"><span>⏰</span><div><div style="font-size:.72rem;color:var(--muted)">Appointment in</div><div class="countdown-time">${getCountdown(a.date,a.time)}</div></div></div>`:'';
  const prob=a.status==='pending'?`<div style="margin-top:.7rem"><div class="prob-label"><span style="color:var(--muted)">Confirmation probability</span><span style="color:var(--green);font-weight:700">${a.prob||75}%</span></div><div class="prob-track"><div class="prob-fill" style="width:${a.prob||75}%;background:var(--success)"></div></div></div>`:'';
  const actions=showActions?`<div class="appt-actions">
    <button class="btn btn-outline btn-sm" onclick="printReceipt('${a.id}')">🖨️ Print</button>
    ${['pending','approved'].includes(a.status)?`<button class="btn btn-danger btn-sm" onclick="cancelAppt('${a.id}')">Cancel</button>`:''}
  </div>`:'';
  return `<div class="card appt-card" style="flex-direction:column;margin-bottom:.8rem;${a.status==='cancelled'?'opacity:.65':''}">
    <div style="display:flex;align-items:flex-start;gap:14px">
      <div class="appt-ava">${a.docEmoji}</div>
      <div class="appt-info">
        <div class="appt-doc">${a.docName}</div>
        <div class="appt-spec">${a.docSpec}</div>
        <div class="appt-dt">📅 ${fmtDate(a.date)} &nbsp;|&nbsp; 🕐 ${a.time}</div>
        <div class="appt-id"># ${a.id}</div>
      </div>
      <div>${badge}</div>
    </div>
    ${countdown}${prob}${actions}
  </div>`;
}

function cancelAppt(id){
  const a=DB.appointments.find(x=>x.id===id);
  if(a){a.status='cancelled';toast('Appointment cancelled','info');renderAppts();}
}

function printReceipt(id){
  const a=DB.appointments.find(x=>x.id===id);
  if(!a)return;
  const pay=DB.payments.find(p=>p.apptId===id);
  const w=window.open('','_blank');
  w.document.write(`<html><head><title>Appointment Receipt</title>
  <style>body{font-family:Georgia,serif;padding:40px;max-width:500px;margin:0 auto}
  h2{color:#1a4a3a}hr{margin:20px 0;border-color:#eee}
  .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f0f0f0}
  .label{color:#666;font-size:14px}.value{font-weight:600;font-size:14px}
  .footer{margin-top:30px;font-size:12px;color:#999;text-align:center}</style>
  </head><body>
  <h2>🩺 CareSync</h2><h3>Appointment Receipt</h3><hr/>
  <div class="row"><span class="label">Patient</span><span class="value">${a.patName}</span></div>
  <div class="row"><span class="label">Doctor</span><span class="value">${a.docName}</span></div>
  <div class="row"><span class="label">Specialization</span><span class="value">${a.docSpec}</span></div>
  <div class="row"><span class="label">Date</span><span class="value">${fmtDate(a.date)}</span></div>
  <div class="row"><span class="label">Time</span><span class="value">${a.time}</span></div>
  <div class="row"><span class="label">Status</span><span class="value">${a.status.toUpperCase()}</span></div>
  ${pay?`<div class="row"><span class="label">Amount Paid</span><span class="value">Rs ${pay.amount.toLocaleString()}</span></div>
  <div class="row"><span class="label">Transaction Ref</span><span class="value">${pay.txn}</span></div>`:''}
  <div class="row"><span class="label">Booking ID</span><span class="value">${a.id}</span></div>
  <div class="footer">CareSync · Printed ${new Date().toLocaleString()}</div>
  <script>window.print()<\/script></body></html>`);
  w.document.close();
}

// ── Profile ───────────────────────────────────────────────
function loadProfile(){
  if(!curUser){show('login');return;}
  document.getElementById('prof-disp-name').textContent=curUser.name;
  document.getElementById('prof-disp-email').textContent=curUser.email||'';
  document.getElementById('prof-name').value=curUser.name||'';
  document.getElementById('prof-age').value=curUser.age||'';
  document.getElementById('prof-phone').value=curUser.phone||'';
  document.getElementById('prof-email').value=curUser.email||'';
}

function saveProfile(){
  const err=document.getElementById('prof-err');err.classList.add('hidden');
  const pass=v('prof-pass');
  if(pass&&pass.length<8)return showErr(err,'Password must be 8+ characters.');
  curUser.name=v('prof-name')||curUser.name;
  curUser.age=v('prof-age')||curUser.age;
  curUser.phone=v('prof-phone')||curUser.phone;
  if(pass)curUser.password=pass;
  const pat=DB.patients.find(p=>p.id===curUser.id);
  if(pat)Object.assign(pat,{name:curUser.name,age:curUser.age,phone:curUser.phone});
  toast('Profile updated ✅','success');loadProfile();
}

// ── Doctor Panel ──────────────────────────────────────────
function renderDoctorPanel(){
  if(!curUser||curUser.role!=='doctor'){show('doctor-login');return;}
  const doc=DB.doctors.find(d=>d.id===curUser.docId);
  document.getElementById('dp-title').textContent=`Dr. ${doc?doc.name.replace('Dr. ',''):'Panel'}`;
  document.getElementById('dp-sub').textContent=`${doc?.spec||''} — Manage your appointment requests`;
  const all=DB.appointments.filter(a=>a.docId===curUser.docId);
  const counts={pending:all.filter(a=>a.status==='pending').length,approved:all.filter(a=>a.status==='approved').length,all:all.length};
  document.getElementById('dp-stats').innerHTML=[
    {icon:'📋',label:'Total',val:counts.all,bg:'var(--green-lt)',c:'var(--green)'},
    {icon:'🕐',label:'Pending',val:counts.pending,bg:'#fef6e7',c:'var(--warn)'},
    {icon:'✅',label:'Approved',val:counts.approved,bg:'#e8f5ee',c:'var(--success)'},
  ].map(s=>`<div class="card"><div class="admin-stat"><div class="admin-stat-icon" style="background:${s.bg}">${s.icon}</div><div><div class="admin-stat-num" style="color:${s.c}">${s.val}</div><div class="admin-stat-lbl">${s.label}</div></div></div></div>`).join('');
  filterPanel(dpFilter);
}

function filterPanel(f,btn){
  dpFilter=f;
  document.querySelectorAll('.panel-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const all=DB.appointments.filter(a=>a.docId===curUser.docId);
  const filtered=f==='all'?all:all.filter(a=>a.status===f);
  document.getElementById('dp-list').innerHTML=filtered.length?filtered.map(a=>{
    const badge={pending:'badge-pending',approved:'badge-success',cancelled:'badge-danger'}[a.status]||'badge-info';
    return `<div class="card" style="margin-bottom:.8rem">
      <div class="req-card">
        <div class="req-ava">👤</div>
        <div style="flex:1">
          <div style="font-weight:600">${a.patName}</div>
          <div style="font-size:.8rem;color:var(--muted)">📅 ${fmtDate(a.date)} · ${a.time}</div>
          <div style="font-size:.75rem;color:var(--muted);margin-top:2px"># ${a.id}</div>
        </div>
        <span class="badge ${badge}">${a.status}</span>
      </div>
      ${a.status==='pending'?`<div class="req-actions">
        <button class="btn btn-primary btn-sm" onclick="docAction('${a.id}','approved')">✅ Approve</button>
        <button class="btn btn-danger btn-sm" onclick="docAction('${a.id}','cancelled')">❌ Reject</button>
      </div>`:''}
    </div>`;
  }).join(''):`<div class="empty"><div class="empty-icon">📋</div><p>No appointments here.</p></div>`;
}

function docAction(id,status){
  const a=DB.appointments.find(x=>x.id===id);
  if(a){a.status=status;toast(status==='approved'?'Appointment approved ✅':'Appointment rejected','success');renderDoctorPanel();}
}

// ── Admin ─────────────────────────────────────────────────
function renderAdmin(tab){
  const body=document.getElementById('admin-body');
  if(tab==='overview'){
    const stats={patients:DB.patients.length,docs:DB.doctors.length,appts:DB.appointments.length,
      pending:DB.appointments.filter(a=>a.status==='pending').length,
      approved:DB.appointments.filter(a=>a.status==='approved').length,
      payments:DB.payments.reduce((s,p)=>s+p.amount,0)};
    body.innerHTML=`<div class="grid-3" style="margin-bottom:2rem">${[
      {icon:'👥',label:'Patients',val:stats.patients,bg:'#e8f0fe',c:'#1967d2'},
      {icon:'👨‍⚕️',label:'Doctors',val:stats.docs,bg:'var(--green-lt)',c:'var(--green)'},
      {icon:'📅',label:'Appointments',val:stats.appts,bg:'#fef6e7',c:'var(--warn)'},
      {icon:'🕐',label:'Pending',val:stats.pending,bg:'#fef6e7',c:'var(--warn)'},
      {icon:'✅',label:'Approved',val:stats.approved,bg:'#e8f5ee',c:'var(--success)'},
      {icon:'💳',label:'Revenue (Rs)',val:stats.payments.toLocaleString(),bg:var_gold_lt(),c:'var(--gold)'},
    ].map(s=>`<div class="card"><div class="admin-stat"><div class="admin-stat-icon" style="background:${s.bg}">${s.icon}</div><div><div class="admin-stat-num" style="color:${s.c}">${s.val}</div><div class="admin-stat-lbl">${s.label}</div></div></div></div>`).join('')}</div>
    <div class="section-heading">Recent Appointments</div>
    ${DB.appointments.slice(-5).reverse().map(a=>`<div class="admin-row"><div style="flex:1;font-size:.88rem"><strong>${a.patName}</strong> → <strong>${a.docName}</strong><div style="color:var(--muted);font-size:.78rem">${a.date} at ${a.time}</div></div><span class="badge ${{'pending':'badge-pending','approved':'badge-success','cancelled':'badge-danger'}[a.status]||'badge-info'}">${a.status}</span></div>`).join('')}`;
  }
  else if(tab==='appointments'){
    body.innerHTML=DB.appointments.map(a=>`<div class="admin-row">
      <div style="flex:1;font-size:.85rem"><strong>${a.patName}</strong> → <strong>${a.docName}</strong><div style="color:var(--muted);font-size:.78rem">${a.date} · ${a.time}</div></div>
      <select style="border:1.5px solid var(--border);border-radius:var(--radius-pill);padding:5px 10px;background:var(--surface);color:var(--text);font-family:inherit;font-size:.78rem;cursor:pointer" onchange="adminChgAppt('${a.id}',this.value)">
        ${['pending','approved','cancelled','completed'].map(s=>`<option ${a.status===s?'selected':''}>${s}</option>`).join('')}
      </select>
    </div>`).join('')||`<div class="empty"><div class="empty-icon">📅</div><p>No appointments yet.</p></div>`;
  }
  else if(tab==='patients'){
    body.innerHTML=`<p style="font-size:.82rem;color:var(--muted);margin-bottom:1rem">${DB.patients.length} registered patients</p>`+
    (DB.patients.map(p=>`<div class="admin-row"><div style="width:36px;height:36px;border-radius:50%;background:var(--green-lt);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0">👤</div><div style="flex:1;font-size:.85rem"><strong>${p.name}</strong><div style="color:var(--muted);font-size:.78rem">${p.email} · ${p.phone} · Age ${p.age}</div></div></div>`).join('')||`<div class="empty"><div class="empty-icon">👥</div><p>No patients yet.</p></div>`);
  }
  else if(tab==='doctors'){
    body.innerHTML=DB.doctors.map(d=>`<div class="admin-row"><span style="font-size:1.8rem">${d.emoji}</span><div style="flex:1;font-size:.85rem"><strong>${d.name}</strong><div style="color:var(--muted);font-size:.78rem">${d.spec} · ${d.exp} yrs · ⭐ ${d.rating}</div></div><button class="btn btn-danger btn-sm" onclick="adminDelDoc('${d.id}')">Remove</button></div>`).join('');
  }
  else if(tab==='payments'){
    const total=DB.payments.reduce((s,p)=>s+p.amount,0);
    body.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem"><p style="font-size:.82rem;color:var(--muted)">${DB.payments.length} transactions</p><strong style="color:var(--green)">Total: Rs ${total.toLocaleString()}</strong></div>`+
    (DB.payments.map(p=>{
      const pat=DB.patients.find(x=>x.id===p.patId);
      const doc=DB.doctors.find(x=>x.id===p.docId);
      return `<div class="admin-row"><span style="font-size:1.4rem">💳</span><div style="flex:1;font-size:.85rem"><strong>${pat?.name||'—'}</strong> → <strong>${doc?.name||'—'}</strong><div style="color:var(--muted);font-size:.78rem">Ref: ${p.txn} · ${p.method} · ${new Date(p.paidAt).toLocaleDateString()}</div></div><strong style="color:var(--green)">Rs ${p.amount.toLocaleString()}</strong><span class="badge badge-success">PAID</span></div>`;
    }).join('')||`<div class="empty"><div class="empty-icon">💳</div><p>No payments yet.</p></div>`);
  }
}

function adminTab(tab,btn){
  document.querySelectorAll('.panel-tab').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  renderAdmin(tab);
}

function adminChgAppt(id,status){
  const a=DB.appointments.find(x=>x.id===id);
  if(a){a.status=status;toast('Status updated','success');}
}

function adminDelDoc(id){
  if(!confirm('Remove this doctor from the system?'))return;
  DB.doctors=DB.doctors.filter(d=>d.id!==id);
  toast('Doctor removed','info');renderAdmin('doctors');
}

// ── Reviews ───────────────────────────────────────────────
function setStars(n){
  starRating=n;
  document.querySelectorAll('#star-btns button').forEach((b,i)=>{b.style.opacity=i<n?'1':'.3';});
}
setStars(5);

function submitReview(){
  if(!curUser){toast('Login to submit a review','info');return;}
  const text=v('review-text');
  selDoc.reviews.push({id:Date.now(),patName:curUser.name,rating:starRating,text,at:new Date().toISOString()});
  selDoc.rating=parseFloat((selDoc.reviews.reduce((s,r)=>s+r.rating,0)/selDoc.reviews.length).toFixed(1));
  document.getElementById('review-form').innerHTML=`<div style="color:var(--success);font-weight:600">✅ Thank you for your review!</div>`;
  renderDocReviews();toast('Review submitted! 🙏','success');
}

function renderDocReviews(){
  const list=selDoc.reviews;
  document.getElementById('reviews-list').innerHTML=list.length?`<div class="divider"></div><div class="section-heading">Patient Reviews</div>`+list.map(r=>`<div class="review-item"><div class="rv-meta"><span class="rv-name">${r.patName}</span><span class="stars">${'★'.repeat(r.rating)}</span></div>${r.text?`<div class="rv-text">${r.text}</div>`:''}</div>`).join(''):'';
}

// ── Utilities ─────────────────────────────────────────────
function v(id){return document.getElementById(id)?.value?.trim()||'';}
function showErr(el,msg){el.textContent=msg;el.classList.remove('hidden');}
function wait(ms){return new Promise(r=>setTimeout(r,ms));}
function fmtDate(d){return new Date(d+'T00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});}
function var_gold_lt(){return getComputedStyle(document.documentElement).getPropertyValue('--gold-lt').trim()||'#fdf6e3';}
function getCountdown(date,time){
  try{
    const t=time.replace(' ','');
    const [hm,mod]=t.split(/(AM|PM)/);
    let [h,m]=(hm||'0:0').split(':').map(Number);
    if(mod==='PM'&&h!==12)h+=12;if(mod==='AM'&&h===12)h=0;
    const target=new Date(`${date}T${String(h).padStart(2,'0')}:${String(m||0).padStart(2,'0')}:00`);
    const ms=target-new Date();
    if(ms<=0)return 'Time passed';
    const d=Math.floor(ms/86400000),hr=Math.floor((ms%86400000)/3600000),mn=Math.floor((ms%3600000)/60000);
    return d>0?`${d}d ${hr}h ${mn}m`:`${hr}h ${mn}m`;
  }catch{return '—';}
}

// Init
updateNav();
