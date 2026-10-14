// ============================================================================
// 1. TEMPESTA DI GHIACCIO E VENTO SU CANVAS
// ============================================================================
const canvas = document.getElementById('frost-canvas');
const ctx = canvas.getContext('2d');
let snowParticles = [];

function resizeFrostCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeFrostCanvas);
resizeFrostCanvas();

for (let i = 0; i < 55; i++) {
  snowParticles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.1 + 0.5,
    vx: Math.random() * 1.5 + 0.4,
    vy: Math.random() * 1.1 + 0.4,
    alpha: Math.random() * 0.6 + 0.15
  });
}

function drawFrostLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snowParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x > canvas.width) p.x = -10;
    if (p.y > canvas.height) p.y = -10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(186, 230, 253, ${p.alpha})`;
    ctx.fill();
  });
  requestAnimationFrame(drawFrostLoop);
}
drawFrostLoop();

// ============================================================================
// 2. STATO GLOBALE, CLOUD & CONTROLLO MANUTENZIONE ADMIN
// ============================================================================
let dbState = JSON.parse(localStorage.getItem('yggdrasill_v3_db')) || {
  maintenance: false,
  users: {},
  campaigns: {}
};

let currentUser = localStorage.getItem('yggdrasill_v3_user') || null;
let activeCharId = null;
let cardFilter = 'tutti';
let authMode = 'login';
let fbRef = null;
let lastSeenEventTimestamp = Date.now();
let pendingTradeCardId = null;
let uploadedPlayerCardImg = "";

function isCurrentUserAdmin() {
  return currentUser === ADMIN_CREDENTIALS.username.toLowerCase();
}

function getEffectiveFirebaseUrl() {
  return (FIREBASE_DATABASE_URL && FIREBASE_DATABASE_URL.trim() !== "")
    ? FIREBASE_DATABASE_URL.trim()
    : (localStorage.getItem('yggdrasill_fb_url') || "");
}

function initCloudConnection() {
  const url = getEffectiveFirebaseUrl();
  if (!url) return;

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: url });
    }
    fbRef = firebase.database().ref('yggdrasill_v3_realm');
    const sub = document.getElementById('welcome-status-sub');
    if (sub) {
      sub.textContent = "Reame Connesso in Cloud • Multi-Dispositivo Attivo";
      sub.className = "text-[10px] text-emerald-400 font-bold";
    }

    fbRef.on('value', snap => {
      const remoteData = snap.val();
      if (remoteData) {
        dbState = remoteData;
        if (!dbState.users) dbState.users = {};
        if (!dbState.campaigns) dbState.campaigns = {};
        localStorage.setItem('yggdrasill_v3_db', JSON.stringify(dbState));
        enforceMaintenanceCheck();
        renderAllViews();
        checkIncomingLiveEvents();
      } else {
        fbRef.set(dbState);
      }
    });
  } catch (err) {
    console.error("Errore Firebase:", err);
  }
}

function saveDB() {
  localStorage.setItem('yggdrasill_v3_db', JSON.stringify(dbState));
  if (fbRef) {
    fbRef.set(dbState);
  }
  enforceMaintenanceCheck();
  renderAllViews();
}

function enforceMaintenanceCheck() {
  const maintScreen = document.getElementById('screen-maintenance');
  const welcomeScreen = document.getElementById('screen-welcome');
  const mainScreen = document.getElementById('screen-main');
  const builderScreen = document.getElementById('screen-builder');

  if (dbState.maintenance === true && !isCurrentUserAdmin()) {
    maintScreen.classList.remove('hidden');
    welcomeScreen.classList.add('hidden');
    mainScreen.classList.add('hidden');
    builderScreen.classList.add('hidden');
  } else {
    maintScreen.classList.add('hidden');
  }
}

// ============================================================================
// 3. CONSOLE ESCLUSIVA AMMINISTRATORE
// ============================================================================
function openAdminConsole() {
  if (!isCurrentUserAdmin()) return;
  document.getElementById('admin-cloud-url').value = getEffectiveFirebaseUrl();
  updateAdminConsoleUI();
  const m = document.getElementById('admin-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function closeAdminConsole() {
  const m = document.getElementById('admin-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function updateAdminConsoleUI() {
  const btn = document.getElementById('admin-maint-btn');
  const status = document.getElementById('admin-maint-status');
  if (dbState.maintenance) {
    btn.textContent = "RIAPRI SITO";
    btn.className = "px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-emerald-600 text-white";
    status.textContent = "Sito in MANUTENZIONE. I giocatori sono bloccati.";
    status.className = "text-[11px] text-amber-400 font-bold";
  } else {
    btn.textContent = "MANDALO IN MANUTENZIONE";
    btn.className = "px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-red-600 text-white";
    status.textContent = "Il sito è attualmente online per tutti.";
    status.className = "text-[11px] text-slate-400";
  }
}

function adminToggleMaintenance() {
  if (!isCurrentUserAdmin()) return;
  dbState.maintenance = !dbState.maintenance;
  updateAdminConsoleUI();
  saveDB();
}

function adminSaveCloudUrl() {
  if (!isCurrentUserAdmin()) return;
  const url = document.getElementById('admin-cloud-url').value.trim();
  if (!url.startsWith('https://')) {
    alert("Inserisci un URL Firebase valido che inizia con https://");
    return;
  }
  localStorage.setItem('yggdrasill_fb_url', url);
  closeAdminConsole();
  location.reload();
}

function adminWipeDatabase() {
  if (!isCurrentUserAdmin()) return;
  if (!confirm("Sei sicuro di voler SVUOTARE l'intero database? Verranno eliminate tutte le campagne, le carte e gli account dei giocatori.")) return;

  const adminKey = ADMIN_CREDENTIALS.username.toLowerCase();
  const adminAccount = dbState.users[adminKey];

  dbState = {
    maintenance: false,
    users: {},
    campaigns: {}
  };
  if (adminAccount) dbState.users[adminKey] = adminAccount;

  saveDB();
  closeAdminConsole();
  alert("Database svuotato con successo.");
}

// ============================================================================
// 4. REGISTRAZIONE E LOGIN (CON ACCESSO DIRETTO ADMIN)
// ============================================================================
function openAuthModal(mode) {
  authMode = mode;
  document.getElementById('auth-title').textContent = mode === 'register' ? 'Registrati su Yggdrasill' : 'Accedi a Yggdrasill';
  document.getElementById('auth-subtitle').textContent = mode === 'register'
    ? 'Crea un account permanente sincronizzato su Cloud.'
    : 'Inserisci il tuo nome utente e password.';
  const m = document.getElementById('auth-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function closeAuthModal() {
  const m = document.getElementById('auth-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const uName = document.getElementById('auth-username').value.trim();
  const uPass = document.getElementById('auth-password').value.trim();
  if (!uName || !uPass) return;

  const userKey = uName.toLowerCase();

  // Scarica sempre la versione più recente dal Cloud Firebase prima di verificare
  if (fbRef) {
    try {
      const snap = await fbRef.once('value');
      if (snap.val()) {
        dbState = snap.val();
        if (!dbState.users) dbState.users = {};
        if (!dbState.campaigns) dbState.campaigns = {};
      }
    } catch (err) {}
  }

  // Controllo prioritario Account Admin
  if (userKey === ADMIN_CREDENTIALS.username.toLowerCase() && uPass === ADMIN_CREDENTIALS.password) {
    if (!dbState.users[userKey]) {
      dbState.users[userKey] = {
        username: ADMIN_CREDENTIALS.username,
        password: ADMIN_CREDENTIALS.password,
        characters: []
      };
    }
    currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', currentUser);
    closeAuthModal();
    saveDB();
    enterAfterLogin();
    return;
  }

  if (authMode === 'register') {
    if (dbState.users[userKey]) {
      alert("Questo Nome Utente è già registrato. Usa il pulsante ACCEDI.");
      return;
    }
    dbState.users[userKey] = {
      username: uName,
      password: uPass,
      characters: []
    };
    currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', currentUser);
    closeAuthModal();
    saveDB();
    enterAfterLogin();
  } else {
    const acc = dbState.users[userKey];
    if (!acc || acc.password !== uPass) {
      alert("Nome utente o password errati.");
      return;
    }
    currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', currentUser);
    closeAuthModal();
    enterAfterLogin();
  }
}

function enterAfterLogin() {
  enforceMaintenanceCheck();
  if (dbState.maintenance && !isCurrentUserAdmin()) return;

  const acc = dbState.users[currentUser];
  document.getElementById('screen-welcome').classList.add('hidden');
  document.getElementById('btn-admin-console').classList.toggle('hidden', !isCurrentUserAdmin());

  // Se sei l'ADMIN: crea il profilo custode automatico e apri subito la Console Admin
  if (isCurrentUserAdmin()) {
    if (!acc.characters || acc.characters.length === 0) {
      acc.characters = [{
        id: 'admin_char',
        owner: currentUser,
        name: 'Odino (Admin)',
        race: 'Aesir',
        className: 'Padre di Tutto',
        level: 20,
        hitDie: '1d20',
        background: 'Custode di Yggdrasill',
        alignment: 'Neutrale',
        avatar: PRESET_AVATARS[1],
        hp: 999,
        maxHp: 999,
        ac: 25,
        atkBonus: 15,
        speed: '18m',
        stats: { FOR: 20, DES: 20, COS: 20, INT: 20, SAG: 20, CAR: 20 },
        traits: ['Controllo Totale del Database Cloud', 'Gestione Manutenzione e Campagne'],
        cards: []
      }];
      saveDB();
    }
    activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    switchStandardNav('dm');
    renderAllViews();
    openAdminConsole();
    return;
  }

  // Utente Giocatore standard
  if (!acc.characters || acc.characters.length === 0) {
    openCharacterBuilder(false);
  } else {
    activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    switchStandardNav('characters');
    renderAllViews();
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('yggdrasill_v3_user');
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-welcome').classList.remove('hidden');
  enforceMaintenanceCheck();
}

// ============================================================================
// 5. COMPILAZIONE LIBERA PERSONAGGIO
// ============================================================================
let selectedFormAvatar = PRESET_AVATARS[0];

function openCharacterBuilder(allowCancel) {
  selectedFormAvatar = PRESET_AVATARS[0];
  document.getElementById('btn-cancel-form').classList.toggle('hidden', !allowCancel);
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.remove('hidden');
  renderAvatarSelector();
}

function renderAvatarSelector() {
  document.getElementById('cf-avatar-selector').innerHTML = PRESET_AVATARS.map(url => `
    <div onclick="selectedFormAvatar='${url}'; renderAvatarSelector();" class="cursor-pointer rounded-xl overflow-hidden border-2 transition ${selectedFormAvatar === url ? 'border-sky-400 scale-105' : 'border-slate-800 opacity-50'}">
      <img src="${url}" class="w-full h-14 object-cover">
    </div>
  `).join('');
}

function handleAvatarFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  autoFitImageFile(file, 300, 300, dataUrl => {
    selectedFormAvatar = dataUrl;
    renderAvatarSelector();
  });
}

function cancelCharacterForm() {
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
}

function saveFullCharacterSheet(e) {
  e.preventDefault();
  const maxHp = parseInt(document.getElementById('cf-maxhp').value) || 30;
  const traitsRaw = document.getElementById('cf-traits').value.trim();
  const traitsList = traitsRaw ? traitsRaw.split('\n').map(s => s.trim()).filter(Boolean) : ['Eroe di Midgard'];

  const newChar = {
    id: 'char_' + Date.now(),
    owner: currentUser,
    name: document.getElementById('cf-name').value.trim(),
    race: document.getElementById('cf-race').value.trim(),
    className: document.getElementById('cf-class').value.trim(),
    level: parseInt(document.getElementById('cf-level').value) || 1,
    hitDie: document.getElementById('cf-hitdie').value.trim() || '1d10',
    background: document.getElementById('cf-bg').value.trim() || 'Avventuriero',
    alignment: document.getElementById('cf-align').value.trim() || 'Neutrale',
    avatar: selectedFormAvatar,
    hp: maxHp,
    maxHp: maxHp,
    ac: parseInt(document.getElementById('cf-ac').value) || 15,
    atkBonus: parseInt(document.getElementById('cf-atk').value) || 5,
    speed: document.getElementById('cf-speed').value.trim() || '9m',
    stats: {
      FOR: parseInt(document.getElementById('cf-stat-FOR').value) || 10,
      DES: parseInt(document.getElementById('cf-stat-DES').value) || 10,
      COS: parseInt(document.getElementById('cf-stat-COS').value) || 10,
      INT: parseInt(document.getElementById('cf-stat-INT').value) || 10,
      SAG: parseInt(document.getElementById('cf-stat-SAG').value) || 10,
      CAR: parseInt(document.getElementById('cf-stat-CAR').value) || 10
    },
    traits: traitsList,
    cards: []
  };

  const acc = dbState.users[currentUser];
  if (!acc.characters) acc.characters = [];
  acc.characters.push(newChar);
  activeCharId = newChar.id;

  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  switchStandardNav('characters');
  saveDB();
}

// ============================================================================
// 6. NAVIGAZIONE MODALITÀ STANDARD (GIOCATORE & LISTA CAMPAGNE DM)
// ============================================================================
function switchStandardNav(tab) {
  document.getElementById('mode-standard-views').classList.remove('hidden');
  document.getElementById('mode-dm-campaign-workspace').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.add('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.add('hidden');

  document.getElementById('view-dm-list').classList.toggle('hidden', tab !== 'dm');
  document.getElementById('view-my-characters').classList.toggle('hidden', tab !== 'characters');
  document.getElementById('view-my-campaigns').classList.toggle('hidden', tab !== 'campaigns');

  document.getElementById('snav-dm').className = tab === 'dm'
    ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  document.getElementById('snav-campaigns').className = tab === 'campaigns'
    ? 'flex flex-col items-center gap-1 text-sky-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  document.getElementById
