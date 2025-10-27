/* ============================
  Simple auth + movies app
   - users stored in localStorage as: users = [{name,email,hash}]
   - currentUser stored in localStorage.currentUser = email
   - password hashed with SubtleCrypto SHA-256
   - movies list below uses real poster URLs (Wikipedia) and youtube embed URLs
   - clicking poster opens trailer modal
   ============================ */

const elems = {
  authPage: document.getElementById('authPage'),
  loginForm: document.getElementById('loginForm'),
  signupForm: document.getElementById('signupForm'),
  showSignup: document.getElementById('showSignup'),
  showLogin: document.getElementById('showLogin'),
  moviesPage: document.getElementById('moviesPage'),
  movieGrid: document.getElementById('movieGrid'),
  trailerPopup: document.getElementById('trailerPopup'),
  trailerFrame: document.getElementById('trailerFrame'),
  closeTrailer: document.getElementById('closeTrailer'),
  navControls: document.getElementById('nav-controls'),
  rememberMe: document.getElementById('rememberMe')
};

/* ---------------------------
   Movie data (real trailers from YouTube).
   Poster image URLs from public wiki pages (you can replace with local files if you prefer).
   --------------------------- */
const movies = [
  { title: "เรื่องราวของเจมส์", poster: "download2.jpg", trailer: "3e5406e1-671b-4bee-a9a2-120dfd76ee45.mp4" },
  { title: "เรื่องราวของเจมส์2", poster: "download4.jpg", trailer: "783225332.353791.mp4" },
  { title: "เรื่องราวของเจมส์3", poster: "S__4186114.jpg", trailer: "frame7.mp4" },
  { title: "เรื่องราวของเจมส์ zero", poster: "S__.jpg", trailer: "frame9.mp4" },
  { title: "เจน", poster: "F1.jpg", trailer: "vidio2.mp4" },
  { title: "จูน", poster: "f2.jpg", trailer: "vidio5.mp4" },
  { title: "เเค่ลองนิดหน่อยไม่เป็นไรหรอกมั้ง", poster: "f3.jpg", trailer: "vidio2.mp4" }
];

/* ---------------------------
   Utilities: localStorage wrappers
   --------------------------- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('users') || '[]'); }
  catch { return []; }
}
function saveUsers(arr){ localStorage.setItem('users', JSON.stringify(arr)); }
function setCurrentUser(email,remember=false){
  localStorage.setItem('currentUser', email);
  if(remember) localStorage.setItem('remember', '1'); else localStorage.removeItem('remember');
}
function clearCurrentUser(){ localStorage.removeItem('currentUser'); localStorage.removeItem('remember'); }

/* ---------------------------
   Password hashing (SHA-256)
   --------------------------- */
async function hashString(str){
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  // convert to hex
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ---------------------------
   Auth UI logic
   --------------------------- */
document.getElementById('showSignup').addEventListener('click', e=>{
  e.preventDefault(); document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
});
document.getElementById('showLogin').addEventListener('click', e=>{
  e.preventDefault(); document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
});

/* Signup */
document.getElementById('signupForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const pwd = document.getElementById('signupPassword').value;
  if(!email || !pwd){ alert('กรุณากรอกข้อมูลให้ครบ'); return; }
  const users = getUsers();
  if(users.find(u=>u.email===email)){ alert('อีเมลนี้มีบัญชีอยู่แล้ว'); return; }
  const hash = await hashString(pwd);
  users.push({name,email,hash});
  saveUsers(users);
  alert('สร้างบัญชีเรียบร้อย คุณจะถูกล็อกอินโดยอัตโนมัติ');
  setCurrentUser(email, true);
  showMoviesUI();
});

/* Login */
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pwd = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberMe').checked;
  const users = getUsers();
  const u = users.find(x=>x.email===email);
  if(!u){ alert('ไม่มีบัญชีนี้'); return; }
  const h = await hashString(pwd);
  if(h !== u.hash){ alert('รหัสผ่านไม่ถูกต้อง'); return; }
  setCurrentUser(email, remember);
  showMoviesUI();
});

/* Logout helper */
function renderNavForUser(email){
  elems.navControls.innerHTML = `
    <span style="margin-right:12px;color:var(--muted)">สวัสดี, ${escapeHtml(getUsers().find(u=>u.email===email)?.name || email)}</span>
    <button id="logoutBtn" class="navBtn">ออกจากระบบ</button>
  `;
  document.getElementById('logoutBtn').addEventListener('click', ()=>{
    clearCurrentUser();
    location.reload();
  });
}

/* Simple escape */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

/* ---------------------------
   Movies UI
   --------------------------- */
function showMoviesUI(){
  const cur = localStorage.getItem('currentUser');
  if(!cur) { alert('ต้องล็อกอินก่อน'); return; }
  elems.authPage.classList.add('hidden');
  elems.moviesPage.classList.remove('hidden');
  renderNavForUser(cur);
  renderMovies();
}

function renderMovies(){
  elems.movieGrid.innerHTML = '';
  movies.forEach(m=>{
    const card = document.createElement('div');
    card.className = 'movie';
    card.innerHTML = `
      <img src="${m.poster}" alt="${escapeHtml(m.title)} poster" />
      <div class="movie-title">${escapeHtml(m.title)}</div>
    `;
    card.addEventListener('click', ()=> openTrailer(m.trailer));
    elems.movieGrid.appendChild(card);
  });
}

/* Trailer modal */
function openTrailer(url){
  elems.trailerFrame.src = url + '?autoplay=1';
  elems.trailerPopup.classList.remove('hidden');
}
function closeTrailer(){
  elems.trailerFrame.src = '';
  elems.trailerPopup.classList.add('hidden');
}
elems.closeTrailer.addEventListener('click', closeTrailer);
elems.trailerPopup.addEventListener('click', (e)=> {
  if(e.target === elems.trailerPopup) closeTrailer();
});

/* ---------------------------
   On load: if currentUser exists -> show movies
   --------------------------- */
window.addEventListener('DOMContentLoaded', ()=>{
  const cur = localStorage.getItem('currentUser');
  const remember = localStorage.getItem('remember');
  if(cur && remember){
    // auto login
    showMoviesUI();
  } else if(cur && !remember){
    // user logged in but didn't choose remember: treat as logged out on refresh
    // If you prefer to keep session across refreshes, remove this block.
    // For now we'll show login screen but pre-fill email
    document.getElementById('loginEmail').value = cur;
    clearCurrentUser();
  }
});
