// ============================================================================
// 1. TEMPESTA DI GHIACCIO E VENTO SU CANVAS (ISOLATA E ANTI-CRASH)
// ============================================================================
(function initSnowEffect() {
  try {
    const canvas = document.getElementById('frost-canvas');
    if (!canvas) return;
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
  } catch (e) {
    console.warn("Canvas non disponibile:", e);
  }
})();

// ============================================================================
// 2. STATO GLOBALE SICURO E INIZIALIZZAZIONE FALLBACK
// ============================================================================
window.FIREBASE_DATABASE_URL = window.FIREBASE_DATABASE_URL || "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";
window.ADMIN_CREDENTIALS = window.ADMIN_CREDENTIALS || { username: "admin", password: "ragnarok2026" };
window.PRESET_AVATARS = window.PRESET_AVATARS || ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"];
window.CARD_ARTWORKS = window.CARD_ARTWORKS || { arma: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=500&q=80" };

function loadSafeLocalDB() {
  try {
    const raw = localStorage.getItem('yggdrasill_v3_db');
    if (!raw) return { maintenance: false, users: {}, campaigns: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { maintenance: false, users: {}, campaigns: {} };
    if (!parsed.users) parsed.users = {};
    if (!parsed.campaigns) parsed.campaigns = {};
    return parsed;
  } catch (e) {
    return { maintenance: false, users: {}, campaigns: {} };
  }
}

window.dbState = loadSafeLocalDB();
window.currentUser = localStorage.getItem('yggdrasill_v3_user') || null;
window.activeCharId = null;
window.cardFilter = 'tutti';
window.authMode = 'login';
window.fbRef = null;
window.lastSeenEventTimestamp = Date.now();
window.pendingTradeCardId = null;
window.uploadedPlayerCardImg = "";

window.isCurrentUserAdmin = function() {
  return window.currentUser === window.ADMIN_CREDENTIALS.username.toLowerCase();
};

window.getEffectiveFirebaseUrl = function() {
  return (window.FIREBASE_DATABASE_URL && window.FIREBASE_DATABASE_URL.trim() !== "")
    ? window.FIREBASE_DATABASE_URL.trim()
    : (localStorage.getItem('yggdrasill_fb_url') || "");
};

window.initCloudConnection = function() {
  const url = window.getEffectiveFirebaseUrl();
  if (!url || typeof firebase === 'undefined') return;

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: url });
    }
    window.fbRef = firebase.database().ref('yggdrasill_v3_realm');
    const sub = document.getElementById('welcome-status-sub');
    if (sub) {
      sub.textContent = "Reame Connesso in Cloud • Multi-Dispositivo Attivo";
      sub.className = "text-[10px] text-emerald-400 font-bold";
    }

    window.fbRef.on('value', snap => {
      const remoteData = snap.val();
      if (remoteData && typeof remoteData === 'object') {
        window.dbState = remoteData;
        if (!window.dbState.users) window.dbState.users = {};
        if (!window.dbState.campaigns) window.dbState.campaigns = {};
        localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState));
        window.enforceMaintenanceCheck();
        window.renderAllViews();
        window.checkIncomingLiveEvents();
      } else {
        window.fbRef.set(window.dbState);
      }
    });
  } catch (err) {
    console.warn("Errore inizializzazione Firebase:", err);
  }
};

window.saveDB = function() {
  try {
    localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState));
  } catch (e) {}
  if (window.fbRef) {
    try { window.fbRef.set(window.dbState); } catch (e) {}
  }
  window.enforceMaintenanceCheck();
  window.renderAllViews();
};

window.enforceMaintenanceCheck = function() {
  const maintScreen = document.getElementById('screen-maintenance');
  const welcomeScreen = document.getElementById('screen-welcome');
  const mainScreen = document.getElementById('screen-main');
  const builderScreen = document.getElementById('screen-builder');
  if (!maintScreen) return;

  if (window.dbState.maintenance === true && !window.isCurrentUserAdmin()) {
    maintScreen.classList.remove('hidden');
    welcomeScreen.classList.add('hidden');
    mainScreen.classList.add('hidden');
    builderScreen.classList.add('hidden');
  } else {
    maintScreen.classList.add('hidden');
  }
};

// ============================================================================
// 3. CONSOLE ESCLUSIVA AMMINISTRATORE
// ============================================================================
window.openAdminConsole = function() {
  if (!window.isCurrentUserAdmin()) return;
  document.getElementById('admin-cloud-url').value = window.getEffectiveFirebaseUrl();
  window.updateAdminConsoleUI();
  const m = document.getElementById('admin-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
};

window.closeAdminConsole = function() {
  const m = document.getElementById('admin-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

window.updateAdminConsoleUI = function() {
  const btn = document.getElementById('admin-maint-btn');
  const status = document.getElementById('admin-maint-status');
  if (!btn || !status) return;
  if (window.dbState.maintenance) {
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
};

window.adminToggleMaintenance = function() {
  if (!window.isCurrentUserAdmin()) return;
  window.dbState.maintenance = !window.dbState.maintenance;
  window.updateAdminConsoleUI();
  window.saveDB();
};

window.adminSaveCloudUrl = function() {
  if (!window.isCurrentUserAdmin()) return;
  const url = document.getElementById('admin-cloud-url').value.trim();
  if (!url.startsWith('https://')) {
    alert("Inserisci un URL Firebase valido che inizia con https://");
    return;
  }
  localStorage.setItem('yggdrasill_fb_url', url);
  window.closeAdminConsole();
  location.reload();
};

window.adminWipeDatabase = function() {
  if (!window.isCurrentUserAdmin()) return;
  if (!confirm("Sei sicuro di voler SVUOTARE l'intero database? Verranno eliminate tutte le campagne, le carte e gli account dei giocatori.")) return;

  const adminKey = window.ADMIN_CREDENTIALS.username.toLowerCase();
  const adminAccount = window.dbState.users[adminKey];

  window.dbState = {
    maintenance: false,
    users: {},
    campaigns: {}
  };
  if (adminAccount) window.dbState.users[adminKey] = adminAccount;

  window.saveDB();
  window.closeAdminConsole();
  alert("Database svuotato con successo.");
};

// ============================================================================
// 4. REGISTRAZIONE E LOGIN (CON TIMEOUT ANTI-BLOCCO)
// ============================================================================
window.openAuthModal = function(mode) {
  window.authMode = mode || 'login';
  const titleEl = document.getElementById('auth-title');
  const subEl = document.getElementById('auth-subtitle');
  const m = document.getElementById('auth-modal');

  if (titleEl) titleEl.textContent = window.authMode === 'register' ? 'Registrati su Yggdrasill' : 'Accedi a Yggdrasill';
  if (subEl) subEl.textContent = window.authMode === 'register'
    ? 'Crea un account permanente sincronizzato su Cloud.'
    : 'Inserisci il tuo nome utente e password.';
  if (m) {
    m.classList.remove('hidden');
    m.classList.add('flex');
  }
};

window.closeAuthModal = function() {
  const m = document.getElementById('auth-modal');
  if (m) {
    m.classList.add('hidden');
    m.classList.remove('flex');
  }
};

window.handleAuthSubmit = async function(e) {
  e.preventDefault();
  const uName = document.getElementById('auth-username').value.trim();
  const uPass = document.getElementById('auth-password').value.trim();
  if (!uName || !uPass) return;

  const submitBtn = document.getElementById('auth-submit-btn');
  if (submitBtn) submitBtn.textContent = "CONNESSIONE IN CORSO...";

  const userKey = uName.toLowerCase();

  // Sincronizzazione Cloud con Timeout massimo di 2.5 secondi per non bloccare mai il login
  if (window.fbRef) {
    try {
      const snap = await Promise.race([
        window.fbRef.once('value'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500))
      ]);
      if (snap && snap.val()) {
        window.dbState = snap.val();
        if (!window.dbState.users) window.dbState.users = {};
        if (!window.dbState.campaigns) window.dbState.campaigns = {};
      }
    } catch (err) {
      console.warn("Lettura Cloud lenta o offline, procedo con memoria locale.");
    }
  }

  if (submitBtn) submitBtn.textContent = "CONFERMA";

  // Controllo prioritario Account Admin
  if (userKey === window.ADMIN_CREDENTIALS.username.toLowerCase() && uPass === window.ADMIN_CREDENTIALS.password) {
    if (!window.dbState.users[userKey]) {
      window.dbState.users[userKey] = {
        username: window.ADMIN_CREDENTIALS.username,
        password: window.ADMIN_CREDENTIALS.password,
        characters: []
      };
    }
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', window.currentUser);
    window.closeAuthModal();
    window.saveDB();
    window.enterAfterLogin();
    return;
  }

  if (window.authMode === 'register') {
    if (window.dbState.users[userKey]) {
      alert("Questo Nome Utente è già registrato. Usa il pulsante ACCEDI.");
      return;
    }
    window.dbState.users[userKey] = {
      username: uName,
      password: uPass,
      characters: []
    };
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', window.currentUser);
    window.closeAuthModal();
    window.saveDB();
    window.enterAfterLogin();
  } else {
    const acc = window.dbState.users[userKey];
    if (!acc || acc.password !== uPass) {
      alert("Nome utente o password errati.");
      return;
    }
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', window.currentUser);
    window.closeAuthModal();
    window.enterAfterLogin();
  }
};

window.enterAfterLogin = function() {
  window.enforceMaintenanceCheck();
  if (window.dbState.maintenance && !window.isCurrentUserAdmin()) return;

  const acc = window.dbState.users[window.currentUser];
  if (!acc) return;

  document.getElementById('screen-welcome').classList.add('hidden');
  document.getElementById('btn-admin-console').classList.toggle('hidden', !window.isCurrentUserAdmin());

  if (window.isCurrentUserAdmin()) {
    if (!acc.characters || acc.characters.length === 0) {
      acc.characters = [{
        id: 'admin_char',
        owner: window.currentUser,
        name: 'Odino (Admin)',
        race: 'Aesir',
        className: 'Padre di Tutto',
        level: 20,
        hitDie: '1d20',
        background: 'Custode di Yggdrasill',
        alignment: 'Neutrale',
        avatar: window.PRESET_AVATARS[1] || window.PRESET_AVATARS[0],
        hp: 999,
        maxHp: 999,
        ac: 25,
        atkBonus: 15,
        speed: '18m',
        stats: { FOR: 20, DES: 20, COS: 20, INT: 20, SAG: 20, CAR: 20 },
        traits: ['Controllo Totale del Database Cloud', 'Gestione Manutenzione e Campagne'],
        cards: []
      }];
      window.saveDB();
    }
    window.activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    window.switchStandardNav('dm');
    window.renderAllViews();
    window.openAdminConsole();
    return;
  }

  if (!acc.characters || acc.characters.length === 0) {
    window.openCharacterBuilder(false);
  } else {
    window.activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    window.switchStandardNav('characters');
    window.renderAllViews();
  }
};

window.logoutUser = function() {
  window.currentUser = null;
  localStorage.removeItem('yggdrasill_v3_user');
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-welcome').classList.remove('hidden');
  window.enforceMaintenanceCheck();
};

// ============================================================================
// 5. COMPILAZIONE LIBERA PERSONAGGIO
// ============================================================================
window.selectedFormAvatar = window.PRESET_AVATARS[0];

window.openCharacterBuilder = function(allowCancel) {
  window.selectedFormAvatar = window.PRESET_AVATARS[0];
  document.getElementById('btn-cancel-form').classList.toggle('hidden', !allowCancel);
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.remove('hidden');
  window.renderAvatarSelector();
};

window.renderAvatarSelector = function() {
  const el = document.getElementById('cf-avatar-selector');
  if (!el) return;
  el.innerHTML = window.PRESET_AVATARS.map(url => `
    <div onclick="window.selectedFormAvatar='${url}'; window.renderAvatarSelector();" class="cursor-pointer rounded-xl overflow-hidden border-2 transition ${window.selectedFormAvatar === url ? 'border-sky-400 scale-105' : 'border-slate-800 opacity-50'}">
      <img src="${url}" class="w-full h-14 object-cover">
    </div>
  `).join('');
};

window.handleAvatarFileUpload = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  window.autoFitImageFile(file, 300, 300, dataUrl => {
    window.selectedFormAvatar = dataUrl;
    window.renderAvatarSelector();
  });
};

window.cancelCharacterForm = function() {
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
};

window.saveFullCharacterSheet = function(e) {
  e.preventDefault();
  const maxHp = parseInt(document.getElementById('cf-maxhp').value) || 30;
  const traitsRaw = document.getElementById('cf-traits').value.trim();
  const traitsList = traitsRaw ? traitsRaw.split('\n').map(s => s.trim()).filter(Boolean) : ['Eroe di Midgard'];

  const newChar = {
    id: 'char_' + Date.now(),
    owner: window.currentUser,
    name: document.getElementById('cf-name').value.trim(),
    race: document.getElementById('cf-race').value.trim(),
    className: document.getElementById('cf-class').value.trim(),
    level: parseInt(document.getElementById('cf-level').value) || 1,
    hitDie: document.getElementById('cf-hitdie').value.trim() || '1d10',
    background: document.getElementById('cf-bg').value.trim() || 'Avventuriero',
    alignment: document.getElementById('cf-align').value.trim() || 'Neutrale',
    avatar: window.selectedFormAvatar,
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

  const acc = window.dbState.users[window.currentUser];
  if (!acc.characters) acc.characters = [];
  acc.characters.push(newChar);
  window.activeCharId = newChar.id;

  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  window.switchStandardNav('characters');
  window.saveDB();
};

// ============================================================================
// 6. NAVIGAZIONE MODALITÀ STANDARD
// ============================================================================
window.switchStandardNav = function(tab) {
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

  window.renderAllViews();
};

window.setCharSubTab = function(sub) {
  ['combat', 'stats', 'forge'].forEach(k => {
    document.getElementById('subcontent-' + k).classList.toggle('hidden', k !== sub);
    document.getElementById('subtab-' + k).className = k === sub
      ? 'py-2 rounded-lg bg-sky-500 text-slate-950'
      : 'py-2 rounded-lg text-slate-400';
  });
};

window.switchActiveCharacter = function(id) {
  window.activeCharId = id;
  window.renderAllViews();
};

window.getMyCharacter = function() {
  if (!window.currentUser || !window.dbState.users[window.currentUser]) return null;
  const list = window.dbState.users[window.currentUser].characters || [];
  return list.find(c => c.id === window.activeCharId) || list[0] || null;
};

window.setCardFilter = function(f) {
  window.cardFilter = f;
  ['tutti', 'arma', 'scudo', 'armatura', 'incantesimo', 'oggetto'].forEach(k => {
    const el = document.getElementById('flt-' + k);
    if (el) {
      el.className = k === f
        ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-sky-400 text-slate-950'
        : 'px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300';
    }
  });
  window.renderAllViews();
};

window.handlePlayerCardImage = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  window.autoFitImageFile(file, 400, 260, resizedDataUrl => {
    window.uploadedPlayerCardImg = resizedDataUrl;
  });
};

window.createPersonalCard = function(e) {
  e.preventDefault();
  const ch = window.getMyCharacter();
  if (!ch) return;
  if (!ch.cards) ch.cards = [];

  const type = document.getElementById('newcard-type').value;
  const manualUrl = document.getElementById('newcard-img-url').value.trim();
  const finalImg = window.uploadedPlayerCardImg || manualUrl || window.CARD_ARTWORKS[type];

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

  window.uploadedPlayerCardImg = "";
  e.target.reset();
  window.propagateCharacterToCampaigns(ch);
  window.setCharSubTab('combat');
  window.saveDB();
};

window.adjustMyHP = function(delta) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  ch.hp = Math.max(0, Math.min(ch.maxHp, ch.hp + delta));
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
};

window.propagateCharacterToCampaigns = function(ch) {
  Object.values(window.dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) {
      camp.members[window.currentUser] = ch;
    }
  });
};

window.buildYgoCardHTML = function(card, interactive = true) {
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
        <img src="${card.img || window.CARD_ARTWORKS.arma}" alt="${card.name}">
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
          <button type="button" onclick="window.deployCardInCombat('${card.id}')" class="col-span-2 py-1.5 rounded bg-gradient-to-r from-sky-500 to-blue-600 text-white font-cinzel font-bold text-[10px] shadow">
            SCHIERA
          </button>
          <button type="button" onclick="window.openTradeCardModal('${card.id}')" class="py-1.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-cinzel font-bold text-[10px]">
            SCAMBIA
          </button>
        </div>
      ` : ''}
    </div>
  `;
};

window.deployCardInCombat = function(cardId) {
  const ch = window.getMyCharacter();
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

  Object.values(window.dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) {
      camp.globalEvent = eventPayload;
    }
  });

  window.lastSeenEventTimestamp = eventPayload.timestamp;
  window.displayGlobalAnimation(eventPayload);
  window.saveDB();
};

window.joinCampaignAsPlayer = function() {
  const code = document.getElementById('join-camp-code').value.trim().toUpperCase();
  const charId = document.getElementById('join-char-select').value;

  if (!code || !window.dbState.campaigns || !window.dbState.campaigns[code]) {
    alert("Codice Campagna non trovato.");
    return;
  }

  const account = window.dbState.users[window.currentUser];
  const charObj = (account.characters || []).find(c => c.id === charId);
  if (!charObj) return;

  const camp = window.dbState.campaigns[code];
  if (!camp.members) camp.members = {};
  camp.members[window.currentUser] = charObj;

  document.getElementById('join-camp-code').value = '';
  window.saveDB();
  alert(`Ti sei unito a "${camp.title}" con ${charObj.name}!`);
};

window.playerClaimChestItem = function(campCode, itemId) {
  const ch = window.getMyCharacter();
  const camp = window.dbState.campaigns[campCode];
  if (!ch || !camp || !camp.chest) return;

  const idx = camp.chest.findIndex(i => i.id === itemId);
  if (idx === -1) return;

  const item = camp.chest.splice(idx, 1)[0];
  if (!ch.cards) ch.cards = [];
  ch.cards.unshift(item);
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
};

window.openTradeCardModal = function(cardId) {
  const ch = window.getMyCharacter();
  if (!ch) return;

  let fellows = [];
  Object.values(window.dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) {
      Object.entries(camp.members).forEach(([uKey, mChar]) => {
        if (uKey !== window.currentUser) fellows.push({ uKey, mChar, campCode: camp.code });
      });
    }
  });

  if (fellows.length === 0) {
    alert("Nessun altro giocatore connesso nella campagna di questo personaggio.");
    return;
  }

  const card = ch.cards.find(c => c.id === cardId);
  window.pendingTradeCardId = cardId;
  document.getElementById('trade-item-label').textContent = `Cedi: ${card.name}`;
  document.getElementById('trade-recipient').innerHTML = fellows.map(f => `
    <option value="${f.uKey}|${f.campCode}">${f.mChar.name} (${f.mChar.className})</option>
  `).join('');

  const m = document.getElementById('trade-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
};

window.closeTradeModal = function() {
  const m = document.getElementById('trade-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

window.executeTrade = function() {
  const val = document.getElementById('trade-recipient').value;
  if (!val) return;
  const [targetUserKey, campCode] = val.split('|');

  const ch = window.getMyCharacter();
  const cIdx = ch.cards.findIndex(c => c.id === window.pendingTradeCardId);
  if (cIdx === -1) return;

  const card = ch.cards.splice(cIdx, 1)[0];
  window.propagateCharacterToCampaigns(ch);

  const camp = window.dbState.campaigns[campCode];
  const targetChar = camp.members[targetUserKey];
  if (!targetChar.cards) targetChar.cards = [];
  targetChar.cards.unshift(card);

  if (window.dbState.users[targetUserKey] && window.dbState.users[targetUserKey].characters) {
    const tIdx = window.dbState.users[targetUserKey].characters.findIndex(x => x.id === targetChar.id);
    if (tIdx !== -1) window.dbState.users[targetUserKey].characters[tIdx] = targetChar;
  }

  window.closeTradeModal();
  window.saveDB();
};

window.checkIncomingLiveEvents = function() {
  if (!window.currentUser || !window.dbState.users[window.currentUser]) return;
  const account = window.dbState.users[window.currentUser];

  Object.values(window.dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[window.currentUser]) {
      const updated = camp.members[window.currentUser];
      const idx = (account.characters || []).findIndex(c => c.id === updated.id);
      if (idx !== -1) account.characters[idx] = updated;
    }

    if (camp.globalEvent && camp.globalEvent.timestamp > window.lastSeenEventTimestamp) {
      window.lastSeenEventTimestamp = camp.globalEvent.timestamp;
      window.displayGlobalAnimation(camp.globalEvent);

      if (camp.globalEvent.type === 'BATTLE' && camp.dmUser !== window.currentUser) {
        window.switchStandardNav('characters');
        window.setCharSubTab('combat');
      }
    }
  });
};

window.displayGlobalAnimation = function(evt) {
  const modal = document.getElementById('anim-modal');
  const box = document.getElementById('anim-box');
  if (!modal || !box) return;

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
      <div class="flex justify-center my-2 animate-slam">${window.buildYgoCardHTML(evt.card, false)}</div>
      <div class="norse-panel rounded-xl p-3 grid grid-cols-2 divide-x divide-slate-800">
        <div><span class="text-[10px] text-slate-400 uppercase block">Tiro Colpire</span><span class="font-cinzel font-black text-xl text-sky-300">${evt.hit}</span></div>
        <div><span class="text-[10px] text-slate-400 uppercase block">Danno / Effetto</span><span class="font-cinzel font-black text-xl text-red-400">${evt.dmg}</span></div>
      </div>
    `;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeAnimModal = function() {
  const modal = document.getElementById('anim-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.renderAllViews = function() {
  if (!window.currentUser || !window.dbState.users[window.currentUser]) return;
  const account = window.dbState.users[window.currentUser];
  document.getElementById('top-user-label').textContent = window.isCurrentUserAdmin()
    ? `AMMINISTRATORE (${account.username})`
    : `Guerriero: ${account.username}`;

  const chars = account.characters || [];
  const ch = window.getMyCharacter();

  if (ch) {
    document.getElementById('char-picker').innerHTML = chars.map(c => `
      <option value="${c.id}" ${c.id === ch.id ? 'selected' : ''}>${c.name} (Liv.${c.level || 1} ${c.race} ${c.className})</option>
    `).join('');

    document.getElementById('sheet-avatar').src = ch.avatar;
    document.getElementById('sheet-name').textContent = ch.name;
    document.getElementById('sheet-race-class').textContent = `Liv. ${ch.level || 1} • ${ch.race} • ${ch.className}`;
    document.getElementById('sheet-bg-align').textContent = `${ch.background} • ${ch.alignment || 'Neutrale'}`;

    let activeCampForChar = null;
    Object.values(window.dbState.campaigns || {}).forEach(camp => {
      if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) {
        activeCampForChar = camp;
      }
    });

    document.getElementById('sheet-camp-badge').textContent = activeCampForChar ? `Saga: ${activeCampForChar.title}` : 'Senza Campagna';

    const pct = Math.round((ch.hp / ch.maxHp) * 100);
    document.getElementById('sheet-hp-label').textContent = `${ch.hp} / ${ch.maxHp} PF`;
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
            <span class="text-[10px] text-slate-400 uppercase">${item.type} • ${item.rarity} • ${item.damage}</span>
          </div>
          <button type="button" onclick="window.playerClaimChestItem('${activeCampForChar.code}', '${item.id}')" class="gold-btn px-3 py-1.5 rounded-lg font-cinzel font-bold text-[10px] text-white">PRENDI</button>
        </div>
      `).join('');
    } else {
      chestBox.classList.add('hidden');
    }

    const cards = ch.cards || [];
    const filtered = window.cardFilter === 'tutti' ? cards : cards.filter(c => c.type === window.cardFilter);
    document.getElementById('sheet-cards-carousel').innerHTML = filtered.map(c => window.buildYgoCardHTML(c, true)).join('');

    document.getElementById('sheet-stats-grid').innerHTML = Object.entries(ch.stats || {}).map(([k, v]) => {
      const mod = Math.floor((v - 10) / 2);
      return `
        <button type="button" onclick="alert('Tiro su ${k}: ' + (Math.floor(Math.random()*20)+1 + ${mod}))" class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center active:scale-95 transition">
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

  document.getElementById('join-char-select').innerHTML = chars.map(c => `
    <option value="${c.id}">${c.name} (${c.race} ${c.className})</option>
  `).join('');

  const myJoinedCamps = Object.values(window.dbState.campaigns || {}).filter(camp => camp.members && camp.members[window.currentUser]);
  document.getElementById('my-joined-campaigns-list').innerHTML = myJoinedCamps.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 text-center">Non fai ancora parte di nessuna campagna. Inserisci il codice del tuo DM qui sopra!</div>`
    : myJoinedCamps.map(camp => {
        const myChar = camp.members[window.currentUser];
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
                    <span class="text-[10px] text-slate-400">${f.race}${f.className} • ${f.hp}/${f.maxHp} PF</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

  if (typeof window.renderDmViews === 'function') {
    window.renderDmViews();
  }
};

window.initCloudConnection();
if (window.currentUser && window.dbState.users && window.dbState.users[window.currentUser]) {
  window.enterAfterLogin();
}
