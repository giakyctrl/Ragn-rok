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
  document.getElementById('snav-char-label').className = tab === 'characters'
    ? 'font-cinzel font-black text-[10px] text-sky-300 tracking-widest mt-1 uppercase'
    : 'font-cinzel font-bold text-[10px] text-slate-400 tracking-widest mt-1 uppercase';

  renderAllViews();
}

function setCharSubTab(sub) {
  ['combat', 'stats', 'forge'].forEach(k => {
    document.getElementById('subcontent-' + k).classList.toggle('hidden', k !== sub);
    document.getElementById('subtab-' + k).className = k === sub
      ? 'py-2 rounded-lg bg-sky-500 text-slate-950'
      : 'py-2 rounded-lg text-slate-400';
  });
}

function switchActiveCharacter(id) {
  activeCharId = id;
  renderAllViews();
}

function getMyCharacter() {
  if (!currentUser || !dbState.users[currentUser]) return null;
  const list = dbState.users[currentUser].characters || [];
  return list.find(c => c.id === activeCharId) || list[0] || null;
}

function setCardFilter(f) {
  cardFilter = f;
  ['tutti', 'arma', 'scudo', 'armatura', 'incantesimo', 'oggetto'].forEach(k => {
    const el = document.getElementById('flt-' + k);
    if (el) {
      el.className = k === f
        ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-sky-400 text-slate-950'
        : 'px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300';
    }
  });
  renderAllViews();
}

function handlePlayerCardImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  autoFitImageFile(file, 400, 260, resizedDataUrl => {
    uploadedPlayerCardImg = resizedDataUrl;
  });
}

function createPersonalCard(e) {
  e.preventDefault();
  const ch = getMyCharacter();
  if (!ch) return;
  if (!ch.cards) ch.cards = [];

  const type = document.getElementById('newcard-type').value;
  const manualUrl = document.getElementById('newcard-img-url').value.trim();
  const finalImg = uploadedPlayerCardImg || manualUrl || CARD_ARTWORKS[type];

  ch.cards.unshift({
    id: 'card_' + Date.now(),
    name: document.getElementById('newcard-name').value.trim(),
    type: type,
    rarity: document.getElementById('newcard-rarity').value,
    damage: document.getElementById('newcard-dmg').value.trim(),
    weight: parseFloat(document.getElementById('newcard-weight').value) || 1,
    stars: 5,
    img: finalImg,
    desc: document.getElementById('newcard-desc').value.trim()
  });

  uploadedPlayerCardImg = "";
  e.target.reset();
  propagateCharacterToCampaigns(ch);
  setCharSubTab('combat');
  saveDB();
}

function adjustMyHP(delta) {
  const ch = getMyCharacter();
  if (!ch) return;
  ch.hp = Math.max(0, Math.min(ch.maxHp, ch.hp + delta));
  propagateCharacterToCampaigns(ch);
  saveDB();
}

function propagateCharacterToCampaigns(ch) {
  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
      camp.members[currentUser] = ch;
    }
  });
}

function buildYgoCardHTML(card, interactive = true) {
  const starsSvg = Array.from({ length: Math.min(card.stars || 4, 7) }).map(() => `
    <svg class="w-2.5 h-2.5 text-amber-400 inline" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
    </svg>
  `).join('');

  return `
    <div class="ygo-card type-${card.type} rarity-${card.rarity} snap-center">
      <div class="bg-black/60 border border-white/20 px-2 py-1 rounded flex justify-between items-center">
        <span class="font-cinzel font-bold text-[11px] text-amber-100 truncate">${card.name}</span>
        <span class="text-[9px] uppercase font-bold text-sky-300">${card.type}</span>
      </div>
      <div class="flex justify-between items-center px-1">
        <span class="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/50 text-slate-200">${card.rarity}</span>
        <div>${starsSvg}</div>
      </div>
      <div class="ygo-art">
        <img src="${card.img \vert{}\vert{} CARD_ARTWORKS.arma}" alt="${card.name}">
      </div>
      <div class="ygo-lore">
        <p class="text-[10px] leading-snug overflow-y-auto">${card.desc}</p>
        <div class="border-t border-amber-900/40 pt-1 flex justify-between font-mono text-[10px] font-bold">
          <span>EFF: ${card.damage}</span>
          <span>${card.weight || 1} kg</span>
        </div>
      </div>
      ${interactive ? `
        <div class="grid grid-cols-3 gap-1.5 pt-1">
          <button onclick="deployCardInCombat('${card.id}')" class="col-span-2 py-1.5 rounded bg-gradient-to-r from-sky-500 to-blue-600 text-white font-cinzel font-bold text-[10px] shadow">
            SCHIERA
          </button>
          <button onclick="openTradeCardModal('${card.id}')" class="py-1.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-cinzel font-bold text-[10px]">
            SCAMBIA
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function deployCardInCombat(cardId) {
  const ch = getMyCharacter();
  if (!ch || !ch.cards) return;
  const card = ch.cards.find(c => c.id === cardId);
  if (!card) return;

  const d20 = Math.floor(Math.random() * 20) + 1;
  const hitStr = d20 === 20 ? 'CRITICO 20!' : `${d20 + ch.atkBonus} (${d20}+${ch.atkBonus})`;

  let dmgResult = card.damage;
  const clean = String(card.damage).toLowerCase().replace(/\s+/g, '');
  if (clean.includes('d')) {
    let total = 0;
    clean.split('+').forEach(part => {
      if (part.includes('d')) {
        const [cnt, sides] = part.split('d');
        for (let i = 0; i < (parseInt(cnt)||1); i++) total += Math.floor(Math.random() * (parseInt(sides)||6)) + 1;
      } else if (!isNaN(parseInt(part))) total += parseInt(part);
    });
    dmgResult = d20 === 20 ? total * 2 : total;
  }

  const eventPayload = {
    type: 'CARD_DEPLOY',
    timestamp: Date.now(),
    actor: ch.name,
    card: card,
    hit: hitStr,
    dmg: dmgResult
  };

  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
      camp.globalEvent = eventPayload;
    }
  });

  lastSeenEventTimestamp = eventPayload.timestamp;
  displayGlobalAnimation(eventPayload);
  saveDB();
}

function joinCampaignAsPlayer() {
  const code = document.getElementById('join-camp-code').value.trim().toUpperCase();
  const charId = document.getElementById('join-char-select').value;

  if (!code || !dbState.campaigns || !dbState.campaigns[code]) {
    alert("Codice Campagna non trovato.");
    return;
  }

  const account = dbState.users[currentUser];
  const charObj = (account.characters || []).find(c => c.id === charId);
  if (!charObj) return;

  const camp = dbState.campaigns[code];
  if (!camp.members) camp.members = {};
  camp.members[currentUser] = charObj;

  document.getElementById('join-camp-code').value = '';
  saveDB();
  alert(`Ti sei unito a "${camp.title}" con ${charObj.name}!`);
}

function playerClaimChestItem(campCode, itemId) {
  const ch = getMyCharacter();
  const camp = dbState.campaigns[campCode];
  if (!ch || !camp || !camp.chest) return;

  const idx = camp.chest.findIndex(i => i.id === itemId);
  if (idx === -1) return;

  const item = camp.chest.splice(idx, 1)[0];
  if (!ch.cards) ch.cards = [];
  ch.cards.unshift(item);
  propagateCharacterToCampaigns(ch);
  saveDB();
}

function openTradeCardModal(cardId) {
  const ch = getMyCharacter();
  if (!ch) return;

  let fellows = [];
  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
      Object.entries(camp.members).forEach(([uKey, mChar]) => {
        if (uKey !== currentUser) fellows.push({ uKey, mChar, campCode: camp.code });
      });
    }
  });

  if (fellows.length === 0) {
    alert("Nessun altro giocatore connesso nella campagna di questo personaggio.");
    return;
  }

  const card = ch.cards.find(c => c.id === cardId);
  pendingTradeCardId = cardId;
  document.getElementById('trade-item-label').textContent = `Cedi: ${card.name}`;
  document.getElementById('trade-recipient').innerHTML = fellows.map(f => `
    <option value="${f.uKey}\vert{}${f.campCode}">${f.mChar.name} (${f.mChar.className})</option>
  `).join('');

  const m = document.getElementById('trade-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function closeTradeModal() {
  const m = document.getElementById('trade-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function executeTrade() {
  const val = document.getElementById('trade-recipient').value;
  if (!val) return;
  const [targetUserKey, campCode] = val.split('|');

  const ch = getMyCharacter();
  const cIdx = ch.cards.findIndex(c => c.id === pendingTradeCardId);
  if (cIdx === -1) return;

  const card = ch.cards.splice(cIdx, 1)[0];
  propagateCharacterToCampaigns(ch);

  const camp = dbState.campaigns[campCode];
  const targetChar = camp.members[targetUserKey];
  if (!targetChar.cards) targetChar.cards = [];
  targetChar.cards.unshift(card);

  if (dbState.users[targetUserKey] && dbState.users[targetUserKey].characters) {
    const tIdx = dbState.users[targetUserKey].characters.findIndex(x => x.id === targetChar.id);
    if (tIdx !== -1) dbState.users[targetUserKey].characters[tIdx] = targetChar;
  }

  closeTradeModal();
  saveDB();
}

function checkIncomingLiveEvents() {
  if (!currentUser || !dbState.users[currentUser]) return;
  const account = dbState.users[currentUser];

  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser]) {
      const updated = camp.members[currentUser];
      const idx = (account.characters || []).findIndex(c => c.id === updated.id);
      if (idx !== -1) account.characters[idx] = updated;
    }

    if (camp.globalEvent && camp.globalEvent.timestamp > lastSeenEventTimestamp) {
      lastSeenEventTimestamp = camp.globalEvent.timestamp;
      displayGlobalAnimation(camp.globalEvent);

      if (camp.globalEvent.type === 'BATTLE' && camp.dmUser !== currentUser) {
        switchStandardNav('characters');
        setCharSubTab('combat');
      }
    }
  });
}

function displayGlobalAnimation(evt) {
  const modal = document.getElementById('anim-modal');
  const box = document.getElementById('anim-box');

  if (evt.type === 'BATTLE') {
    box.innerHTML = `
      <h2 class="font-norse text-3xl font-black text-red-400">CHIAMATA ALLE ARMI</h2>
      <p class="text-xs text-slate-300">Il Dungeon Master ha avviato una Battaglia! La tua scheda Combattimento è pronta.</p>
    `;
  } else if (evt.type === 'SHORT_REST') {
    box.innerHTML = `
      <h2 class="font-norse text-3xl font-black text-amber-300">RIPOSO CORTO</h2>
      <p class="text-xs text-slate-300">Il party riposa attorno al fuoco (+25% PF).</p>
    `;
  } else if (evt.type === 'LONG_REST') {
    box.innerHTML = `
      <h2 class="font-norse text-3xl font-black text-sky-300">RIPOSO LUNGO</h2>
      <p class="text-xs text-slate-300">Luce di Yggdrasill: tutti i Punti Ferita sono tornati al 100%.</p>
    `;
  } else if (evt.type === 'CARD_DEPLOY') {
    box.innerHTML = `
      <span class="text-xs font-cinzel uppercase tracking-widest text-sky-400">${evt.actor} schiera in battaglia</span>
      <div class="flex justify-center my-2 animate-slam">${buildYgoCardHTML(evt.card, false)}</div>
      <div class="norse-panel rounded-xl p-3 grid grid-cols-2 divide-x divide-slate-800">
        <div><span class="text-[10px] text-slate-400 uppercase block">Tiro Colpire</span><span class="font-cinzel font-black text-xl text-sky-300">${evt.hit}</span></div>
        <div><span class="text-[10px] text-slate-400 uppercase block">Danno / Effetto</span><span class="font-cinzel font-black text-xl text-red-400">${evt.dmg}</span></div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeAnimModal() {
  const modal = document.getElementById('anim-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function renderAllViews() {
  if (!currentUser || !dbState.users[currentUser]) return;
  const account = dbState.users[currentUser];
  document.getElementById('top-user-label').textContent = isCurrentUserAdmin()
    ? `AMMINISTRATORE (${account.username})`
    : `Guerriero: ${account.username}`;

  const chars = account.characters || [];
  const ch = getMyCharacter();

  if (ch) {
    document.getElementById('char-picker').innerHTML = chars.map(c => `
      <option value="${c.id}" ${c.id === ch.id ? 'selected' : ''}>${c.name} (Liv.${c.level || 1} ${c.race}${c.className})</option>
    `).join('');

    document.getElementById('sheet-avatar').src = ch.avatar;
    document.getElementById('sheet-name').textContent = ch.name;
    document.getElementById('sheet-race-class').textContent = `Liv. ${ch.level || 1} • ${ch.race} •${ch.className}`;
    document.getElementById('sheet-bg-align').textContent = `${ch.background} •${ch.alignment || 'Neutrale'}`;

    let activeCampForChar = null;
    Object.values(dbState.campaigns || {}).forEach(camp => {
      if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
        activeCampForChar = camp;
      }
    });

    document.getElementById('sheet-camp-badge').textContent = activeCampForChar ? `Saga: ${activeCampForChar.title}` : 'Senza Campagna';

    const pct = Math.round((ch.hp / ch.maxHp) * 100);
    document.getElementById('sheet-hp-label').textContent = `${ch.hp} /${ch.maxHp} PF`;
    document.getElementById('sheet-hp-bar').style.width = `${pct}%`;

    const desMod = Math.floor(((ch.stats?.DES || 10) - 10) / 2);
    document.getElementById('sheet-ac').textContent = ch.ac;
    document.getElementById('sheet-init').textContent = desMod >= 0 ? `+${desMod}` : desMod;
    document.getElementById('sheet-atk').textContent = `+${ch.atkBonus}`;
    document.getElementById('sheet-speed').textContent = ch.speed || '9m';

    const chestBox = document.getElementById('player-chest-box');
    if (activeCampForChar && activeCampForChar.chest && activeCampForChar.chest.length > 0) {
      chestBox.classList.remove('hidden');
      document.getElementById('player-chest-items').innerHTML = activeCampForChar.chest.map(item => `
        <div class="bg-slate-950 border border-amber-500/40 p-2.5 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span class="font-cinzel font-bold text-amber-300 block">${item.name}</span>
            <span class="text-[10px] text-slate-400 uppercase">${item.type} • ${item.rarity} •${item.damage}</span>
          </div>
          <button onclick="playerClaimChestItem('${activeCampForChar.code}', '${item.id}')" class="gold-btn px-3 py-1.5 rounded-lg font-cinzel font-bold text-[10px] text-white">PRENDI</button>
        </div>
      `).join('');
    } else {
      chestBox.classList.add('hidden');
    }

    const cards = ch.cards || [];
    const filtered = cardFilter === 'tutti' ? cards : cards.filter(c => c.type === cardFilter);
    document.getElementById('sheet-cards-carousel').innerHTML = filtered.map(c => buildYgoCardHTML(c, true)).join('');

    document.getElementById('sheet-stats-grid').innerHTML = Object.entries(ch.stats || {}).map(([k, v]) => {
      const mod = Math.floor((v - 10) / 2);
      return `
        <button onclick="alert('Tiro su ${k}: ' + (Math.floor(Math.random()*20)+1 +${mod}))" class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center active:scale-95 transition">
          <span class="text-[10px] text-slate-400 font-bold block">${k}</span>
          <span class="font-cinzel text-lg font-black text-sky-300">${mod >= 0 ? '+'+mod : mod}</span>
          <span class="text-[10px] text-slate-500 block">(${v})</span>
        </button>
      `;
    }).join('');

    document.getElementById('sheet-traits-list').innerHTML = (ch.traits || []).map(t => `
      <li class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">${t}</li>
    `).join('');
  }

  // Vista Destra: Le Tue Campagne
  document.getElementById('join-char-select').innerHTML = chars.map(c => `
    <option value="${c.id}">${c.name} (${c.race}${c.className})</option>
  `).join('');

  const myJoinedCamps = Object.values(dbState.campaigns || {}).filter(camp => camp.members && camp.members[currentUser]);
  document.getElementById('my-joined-campaigns-list').innerHTML = myJoinedCamps.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 text-center">Non fai ancora parte di nessuna campagna. Inserisci il codice del tuo DM qui sopra!</div>`
    : myJoinedCamps.map(camp => {
        const myChar = camp.members[currentUser];
        const fellows = Object.values(camp.members || {});
        return `
          <div class="norse-panel rounded-2xl p-5 space-y-3 border border-sky-500/30">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] font-cinzel uppercase text-sky-400">Codice Campagna: ${camp.code}</span>
                <h4 class="font-cinzel font-bold text-base text-white">${camp.title}</h4>
              </div>
              <span class="px-3 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-xs font-bold text-sky-300">
                Personaggio Iscritto: ${myChar.name}
              </span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${fellows.map(f => `
                <div class="bg-slate-950 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
                  <img src="${f.avatar}" class="w-9 h-9 rounded-lg object-cover border border-sky-400">
                  <div>
                    <span class="font-cinzel font-bold text-xs text-white block">${f.name}</span>
                    <span class="text-[10px] text-slate-400">${f.race} ${f.className} • ${f.hp}/${f.maxHp} PF</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

  if (typeof renderDmViews === 'function') {
    renderDmViews();
  }
}

initCloudConnection();
if (currentUser && dbState.users && dbState.users[currentUser]) {
  enterAfterLogin();
}
