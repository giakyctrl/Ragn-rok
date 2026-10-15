// ============================================================================
// 1. TEMPESTA NORRENA SU CANVAS
// ============================================================================
(function initSnow() {
  try {
    const canvas = document.getElementById('frost-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let flakes = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 45; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        vx: Math.random() * 1.3 + 0.4,
        vy: Math.random() * 1 + 0.3,
        a: Math.random() * 0.5 + 0.15
      });
    }

    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x > canvas.width) p.x = -5;
        if (p.y > canvas.height) p.y = -5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${p.a})`;
        ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  } catch (e) {}
})();

// ============================================================================
// 2. STATO GLOBALE & CONNESSIONE SERVER (SOLO "CONNESSO / NON CONNESSO" AI PLAYER)
// ============================================================================
function loadLocalDB() {
  try {
    const p = JSON.parse(localStorage.getItem('yggdrasill_v3_db'));
    if (p && typeof p === 'object') {
      if (!p.users) p.users = {};
      if (!p.campaigns) p.campaigns = {};
      return p;
    }
  } catch (e) {}
  return { maintenance: false, users: {}, campaigns: {} };
}

window.dbState = loadLocalDB();
window.currentUser = localStorage.getItem('yggdrasill_v3_user') || null;
window.activeCharId = null;
window.activeDdbSection = 'abilities';
window.authMode = 'login';
window.fbRef = null;
window.isServerConnected = false;
window.lastSeenEventTimestamp = Date.now();
window.pendingTradeCardId = null;

window.isCurrentUserAdmin = function() {
  return window.currentUser === window.ADMIN_CREDENTIALS.username.toLowerCase();
};

window.getEffectiveFirebaseUrl = function() {
  return (window.FIREBASE_DATABASE_URL && window.FIREBASE_DATABASE_URL.trim() !== "")
    ? window.FIREBASE_DATABASE_URL.trim()
    : (localStorage.getItem('yggdrasill_fb_url') || "");
};

window.updateServerStatusIndicators = function(connected) {
  window.isServerConnected = connected;
  const sub = document.getElementById('welcome-status-sub');
  const pill = document.getElementById('main-server-pill');

  const text = connected ? "Server connesso" : "Server non connesso";
  const cls = connected ? "text-[10px] text-emerald-400 font-semibold" : "text-[10px] text-rose-400 font-semibold";
  const pillCls = connected
    ? "text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold"
    : "text-[9px] px-1.5 py-0.5 rounded bg-rose-950/80 border border-rose-500/30 text-rose-400 font-semibold";

  if (sub) { sub.textContent = text; sub.className = cls; }
  if (pill) { pill.textContent = text; pill.className = pillCls; }
};

window.initCloudConnection = function() {
  const url = window.getEffectiveFirebaseUrl();
  if (!url || typeof firebase === 'undefined') {
    window.updateServerStatusIndicators(false);
    return;
  }

  try {
    if (!firebase.apps.length) firebase.initializeApp({ databaseURL: url });
    window.fbRef = firebase.database().ref('yggdrasill_v3_realm');

    // Monitoraggio reale stato connessione Firebase
    firebase.database().ref('.info/connected').on('value', snap => {
      window.updateServerStatusIndicators(snap.val() === true);
    });

    window.fbRef.on('value', snap => {
      const remote = snap.val();
      if (remote && typeof remote === 'object') {
        window.dbState = remote;
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
  } catch (e) {
    window.updateServerStatusIndicators(false);
  }
};

window.saveDB = function() {
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch (e) {}
  if (window.fbRef) {
    try { window.fbRef.set(window.dbState); } catch (e) {}
  }
  window.enforceMaintenanceCheck();
  window.renderAllViews();
};

window.enforceMaintenanceCheck = function() {
  const maint = document.getElementById('screen-maintenance');
  if (!maint) return;
  if (window.dbState.maintenance === true && !window.isCurrentUserAdmin()) {
    maint.classList.remove('hidden');
    document.getElementById('screen-welcome').classList.add('hidden');
    document.getElementById('screen-main').classList.add('hidden');
    document.getElementById('screen-builder').classList.add('hidden');
  } else {
    maint.classList.add('hidden');
  }
};

// ============================================================================
// 3. CONSOLE ADMIN (CON DIAGNOSTICA TECNICA RISERVATA SOLO ALL'ADMIN)
// ============================================================================
window.openAdminConsole = function() {
  if (!window.isCurrentUserAdmin()) return;
  document.getElementById('admin-cloud-url').value = window.getEffectiveFirebaseUrl();
  
  const uCount = Object.keys(window.dbState.users || {}).length;
  const cCount = Object.keys(window.dbState.campaigns || {}).length;
  document.getElementById('admin-tech-diagnostics').innerHTML = `
    <div class="font-bold text-amber-300 mb-1">Diagnostica Tecnica Server (Solo Admin):</div>
    <div>• Stato Socket Firebase: <strong class="${window.isServerConnected ? 'text-emerald-400' : 'text-rose-400'}">${window.isServerConnected ? 'ONLINE (Realtime Sync Attivo)' : 'OFFLINE'}</strong></div>
    <div>• Nodo Database: <code>/yggdrasill_v3_realm</code></div>
    <div>• Utenti Registrati: <strong>${uCount}</strong> | Campagne Attive: <strong>${cCount}</strong></div>
  `;

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
  const st = document.getElementById('admin-maint-status');
  if (!btn || !st) return;
  if (window.dbState.maintenance) {
    btn.textContent = "RIAPRI SITO";
    btn.className = "px-3.5 py-2 rounded-xl font-cinzel font-bold text-[10px] bg-emerald-600 text-white";
    st.textContent = "MANUTENZIONE ATTIVA (Giocatori bloccati)";
    st.className = "text-[10px] text-amber-400 font-bold";
  } else {
    btn.textContent = "BLOCCA SITO";
    btn.className = "px-3.5 py-2 rounded-xl font-cinzel font-bold text-[10px] bg-red-600 text-white";
    st.textContent = "Sito online per tutti i giocatori.";
    st.className = "text-[10px] text-slate-400";
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
  const u = document.getElementById('admin-cloud-url').value.trim();
  if (!u.startsWith('https://')) { alert("URL non valido"); return; }
  localStorage.setItem('yggdrasill_fb_url', u);
  window.closeAdminConsole();
  location.reload();
};

window.adminWipeDatabase = function() {
  if (!window.isCurrentUserAdmin()) return;
  if (!confirm("SVUOTARE l'intero database? Verranno cancellati tutti gli utenti, i personaggi e le campagne.")) return;
  const adminKey = window.ADMIN_CREDENTIALS.username.toLowerCase();
  const adminAcc = window.dbState.users[adminKey];
  window.dbState = { maintenance: false, users: {}, campaigns: {} };
  if (adminAcc) window.dbState.users[adminKey] = adminAcc;
  window.saveDB();
  window.closeAdminConsole();
};

// ============================================================================
// 4. AUTENTICAZIONE (LOGIN / REGISTRAZIONE)
// ============================================================================
window.openAuthModal = function(mode) {
  window.authMode = mode || 'login';
  document.getElementById('auth-title').textContent = window.authMode === 'register' ? 'Registrati' : 'Accedi';
  document.getElementById('auth-subtitle').textContent = window.authMode === 'register'
    ? 'Crea il tuo account per salvare i personaggi.'
    : 'Inserisci Nome Utente e Password.';
  const m = document.getElementById('auth-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
};

window.closeAuthModal = function() {
  const m = document.getElementById('auth-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

window.handleAuthSubmit = async function(e) {
  e.preventDefault();
  const uName = document.getElementById('auth-username').value.trim();
  const uPass = document.getElementById('auth-password').value.trim();
  if (!uName || !uPass) return;

  const userKey = uName.toLowerCase();
  const btn = document.getElementById('auth-submit-btn');
  if (btn) btn.textContent = "ATTENDI...";

  if (window.fbRef) {
    try {
      const snap = await Promise.race([
        window.fbRef.once('value'),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2200))
      ]);
      if (snap && snap.val()) {
        window.dbState = snap.val();
        if (!window.dbState.users) window.dbState.users = {};
        if (!window.dbState.campaigns) window.dbState.campaigns = {};
      }
    } catch (err) {}
  }
  if (btn) btn.textContent = "CONFERMA";

  if (userKey === window.ADMIN_CREDENTIALS.username.toLowerCase() && uPass === window.ADMIN_CREDENTIALS.password) {
    if (!window.dbState.users[userKey]) {
      window.dbState.users[userKey] = { username: window.ADMIN_CREDENTIALS.username, password: uPass, characters: [] };
    }
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
    window.closeAuthModal();
    window.saveDB();
    window.enterAfterLogin();
    return;
  }

  if (window.authMode === 'register') {
    if (window.dbState.users[userKey]) { alert("Nome utente già esistente. Usa ACCEDI."); return; }
    window.dbState.users[userKey] = { username: uName, password: uPass, characters: [] };
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
    window.closeAuthModal();
    window.saveDB();
    window.enterAfterLogin();
  } else {
    const acc = window.dbState.users[userKey];
    if (!acc || acc.password !== uPass) { alert("Credenziali errate."); return; }
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
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
        id: 'admin_char', owner: window.currentUser, name: 'Custode Admin', race: 'Aesir', className: 'Master',
        level: 20, hitDie: '1d20', background: 'Admin', alignment: 'Neutrale', avatar: window.PRESET_AVATARS[1],
        hp: 100, maxHp: 100, ac: 20, atkBonus: 10, speed: '9m', inspiration: true, condition: 'Normal',
        stats: { FOR: 20, DES: 20, COS: 20, INT: 20, SAG: 20, CAR: 20 },
        saves: { FOR: true, DES: true, COS: true, INT: true, SAG: true, CAR: true },
        defenses: 'Immunità Admin', traits: ['Accesso Root'], proficiencies: 'Tutte', notes: '', cards: []
      }];
      window.saveDB();
    }
    window.activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    window.switchStandardNav('dm');
    window.renderAllViews();
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
// 5. CREAZIONE PERSONAGGIO & SCHEDA D&D BEYOND (SCREENSHOT 2 & 3)
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
    <div onclick="window.selectedFormAvatar='${url}'; window.renderAvatarSelector();" class="cursor-pointer rounded-xl overflow-hidden border-2 ${window.selectedFormAvatar === url ? 'border-sky-400 scale-105' : 'border-slate-800 opacity-50'}">
      <img src="${url}" class="w-full h-14 object-cover">
    </div>
  `).join('');
};

window.handleAvatarFileUpload = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  window.autoFitImageFile(file, 300, 300, url => {
    window.selectedFormAvatar = url;
    window.renderAvatarSelector();
  });
};

window.cancelCharacterForm = function() {
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
};

window.saveFullCharacterSheet = function(e) {
  e.preventDefault();
  const maxHp = parseInt(document.getElementById('cf-maxhp').value) || 19;
  const traitsRaw = document.getElementById('cf-traits').value.trim();

  const newChar = {
    id: 'char_' + Date.now(),
    owner: window.currentUser,
    name: document.getElementById('cf-name').value.trim(),
    race: document.getElementById('cf-race').value.trim(),
    className: document.getElementById('cf-class').value.trim(),
    level: parseInt(document.getElementById('cf-level').value) || 1,
    hitDie: document.getElementById('cf-hitdie').value.trim() || '1d8',
    background: document.getElementById('cf-bg').value.trim() || 'Outlander',
    alignment: document.getElementById('cf-align').value.trim() || 'Neutral',
    avatar: window.selectedFormAvatar,
    hp: maxHp,
    maxHp: maxHp,
    ac: parseInt(document.getElementById('cf-ac').value) || 14,
    atkBonus: parseInt(document.getElementById('cf-atk').value) || 2,
    speed: document.getElementById('cf-speed').value.trim() || '9m',
    defenses: document.getElementById('cf-defenses').value.trim() || 'Nessuna resistenza attiva',
    inspiration: false,
    condition: 'Normal',
    stats: {
      FOR: parseInt(document.getElementById('cf-stat-FOR').value) || 10,
      DES: parseInt(document.getElementById('cf-stat-DES').value) || 10,
      COS: parseInt(document.getElementById('cf-stat-COS').value) || 10,
      INT: parseInt(document.getElementById('cf-stat-INT').value) || 10,
      SAG: parseInt(document.getElementById('cf-stat-SAG').value) || 10,
      CAR: parseInt(document.getElementById('cf-stat-CAR').value) || 10
    },
    saves: {
      FOR: document.getElementById('cf-save-FOR').checked,
      DES: document.getElementById('cf-save-DES').checked,
      COS: document.getElementById('cf-save-COS').checked,
      INT: document.getElementById('cf-save-INT').checked,
      SAG: document.getElementById('cf-save-SAG').checked,
      CAR: document.getElementById('cf-save-CAR').checked
    },
    traits: traitsRaw ? traitsRaw.split('\n').map(s => s.trim()).filter(Boolean) : ['Privilegi di Classe base'],
    proficiencies: document.getElementById('cf-proficiencies').value.trim() || 'Armi semplici, Armature leggere, Comune',
    notes: document.getElementById('cf-notes').value.trim() || 'Nessuna nota registrata.',
    cards: [] // Le carte vengono create e consegnate esclusivamente dal DM
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
// 6. MENU SEZIONI D&D BEYOND & INTERAZIONI SCHEDA
// ============================================================================
window.openDdbSectionModal = function() {
  const list = document.getElementById('ddb-section-list');
  const ch = window.getMyCharacter();
  const cards = (ch && ch.cards) || [];

  list.innerHTML = window.DDB_SECTIONS.map(sec => {
    let countBadge = "";
    if (sec.id === 'actions' || sec.id === 'inventory' || sec.id === 'spells') {
      const cnt = cards.filter(c => window.classifyCardToDdbSection(c) === sec.id).length;
      if (cnt > 0) countBadge = `<span class="ml-auto text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">${cnt} carte</span>`;
    }
    return `
      <button type="button" onclick="window.selectDdbSection('${sec.id}')" class="ddb-menu-item ${window.activeDdbSection === sec.id ? 'active' : ''}">
        <span>${sec.icon}</span>
        <span>${sec.label}</span>
        ${countBadge}
      </button>
    `;
  }).join('');

  const m = document.getElementById('ddb-section-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
};

window.closeDdbSectionModal = function() {
  const m = document.getElementById('ddb-section-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

window.selectDdbSection = function(secId) {
  window.activeDdbSection = secId;
  window.closeDdbSectionModal();
  window.renderAllViews();
};

window.toggleHeroicInspiration = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;
  ch.inspiration = !ch.inspiration;
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
};

window.cycleCharacterCondition = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;
  const conds = ['Normal', 'Poisoned', 'Frightened', 'Prone', 'Stunned', 'Invisible'];
  const idx = conds.indexOf(ch.condition || 'Normal');
  ch.condition = conds[(idx + 1) % conds.length];
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
};

window.switchStandardNav = function(tab) {
  document.getElementById('mode-standard-views').classList.remove('hidden');
  document.getElementById('mode-dm-campaign-workspace').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.add('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.add('hidden');

  document.getElementById('view-dm-list').classList.toggle('hidden', tab !== 'dm');
  document.getElementById('view-my-characters').classList.toggle('hidden', tab !== 'characters');
  document.getElementById('view-my-campaigns').classList.toggle('hidden', tab !== 'campaigns');

  document.getElementById('snav-dm').className = tab === 'dm' ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2' : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  document.getElementById('snav-campaigns').className = tab === 'campaigns' ? 'flex flex-col items-center gap-1 text-sky-400 w-28 py-2' : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  window.renderAllViews();
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
  const sec = window.classifyCardToDdbSection(card);
  const badgeLabel = sec === 'actions' ? 'ACTION' : sec === 'spells' ? 'SPELL' : 'INVENTORY';

  return `
    <div class="ygo-card type-${card.type} rarity-${card.rarity} snap-center">
      <div class="bg-black/60 border border-white/20 px-2 py-1 rounded flex justify-between items-center">
        <span class="font-cinzel font-bold text-[11px] text-amber-100 truncate">${card.name}</span>
        <span class="text-[8px] uppercase font-bold text-sky-300">${badgeLabel}</span>
      </div>
      <div class="flex justify-between items-center px-1 text-[9px] uppercase font-bold text-slate-200">
        <span>${card.type}</span>
        <span class="text-amber-300">${card.rarity}</span>
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
          <button type="button" onclick="window.deployCardInCombat('${card.id}')" class="col-span-2 py-1.5 rounded bg-gradient-to-r from-sky-500 to-blue-600 text-white font-cinzel font-bold text-[10px]">USA / SCHIERA</button>
          <button type="button" onclick="window.openTradeCardModal('${card.id}')" class="py-1.5 rounded bg-slate-800 border border-slate-600 text-amber-300 font-cinzel font-bold text-[10px]">SCAMBIA</button>
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

  const evt = { type: 'CARD_DEPLOY', timestamp: Date.now(), actor: ch.name, card: card, hit: hitStr, dmg: dmgResult };
  Object.values(window.dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) {
      camp.globalEvent = evt;
    }
  });

  window.lastSeenEventTimestamp = evt.timestamp;
  window.displayGlobalAnimation(evt);
  window.saveDB();
};

window.joinCampaignAsPlayer = function() {
  const code = document.getElementById('join-camp-code').value.trim().toUpperCase();
  const charId = document.getElementById('join-char-select').value;
  if (!code || !window.dbState.campaigns || !window.dbState.campaigns[code]) {
    alert("Codice Campagna non trovato."); return;
  }
  const acc = window.dbState.users[window.currentUser];
  const charObj = (acc.characters || []).find(c => c.id === charId);
  if (!charObj) return;

  const camp = window.dbState.campaigns[code];
  if (!camp.members) camp.members = {};
  camp.members[window.currentUser] = charObj;

  document.getElementById('join-camp-code').value = '';
  window.saveDB();
  alert(`Unito a "${camp.title}" con ${charObj.name}!`);
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

  // Porta automaticamente il giocatore nella sezione D&D Beyond corrispondente alla carta appena presa!
  window.activeDdbSection = window.classifyCardToDdbSection(item);
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
  if (fellows.length === 0) { alert("Nessun altro compagno nella campagna."); return; }

  const card = ch.cards.find(c => c.id === cardId);
  window.pendingTradeCardId = cardId;
  document.getElementById('trade-item-label').textContent = `Cedi: ${card.name}`;
  document.getElementById('trade-recipient').innerHTML = fellows.map(f => `<option value="${f.uKey}|${f.campCode}">${f.mChar.name}</option>`).join('');
  const m = document.getElementById('trade-modal');
  m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeTradeModal = function() {
  const m = document.getElementById('trade-modal');
  m.classList.add('hidden'); m.classList.remove('flex');
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

  if (window.dbState.users[targetUserKey]?.characters) {
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

      // Se il DM avvia BATTAGLIA, reindirizza i giocatori sulla sezione "Actions" di D&D Beyond
      if (camp.globalEvent.type === 'BATTLE' && camp.dmUser !== window.currentUser) {
        window.switchStandardNav('characters');
        window.activeDdbSection = 'actions';
        window.renderAllViews();
      }
    }
  });
};

window.displayGlobalAnimation = function(evt) {
  const modal = document.getElementById('anim-modal');
  const box = document.getElementById('anim-box');
  if (!modal || !box) return;

  if (evt.type === 'BATTLE') {
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-red-400">INIZIA LA BATTAGLIA</h2><p class="text-xs text-slate-300">Sei stato reindirizzato alla sezione <strong>Actions</strong> della tua scheda!</p>`;
  } else if (evt.type === 'SHORT_REST') {
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-amber-300">RIPOSO CORTO</h2><p class="text-xs text-slate-300">+25% Hit Points recuperati.</p>`;
  } else if (evt.type === 'LONG_REST') {
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-sky-300">RIPOSO LUNGO</h2><p class="text-xs text-slate-300">Hit Points rigenerati al 100%.</p>`;
  } else if (evt.type === 'CARD_DEPLOY') {
    box.innerHTML = `
      <span class="text-xs font-cinzel uppercase text-sky-400">${evt.actor} usa</span>
      <div class="flex justify-center my-2">${window.buildYgoCardHTML(evt.card, false)}</div>
      <div class="norse-panel rounded-xl p-3 grid grid-cols-2 divide-x divide-slate-800">
        <div><span class="text-[10px] text-slate-400 block">Tiro D20</span><span class="font-cinzel font-black text-xl text-sky-300">${evt.hit}</span></div>
        <div><span class="text-[10px] text-slate-400 block">Effetto / Danno</span><span class="font-cinzel font-black text-xl text-red-400">${evt.dmg}</span></div>
      </div>
    `;
  }
  modal.classList.remove('hidden'); modal.classList.add('flex');
};

window.closeAnimModal = function() {
  const modal = document.getElementById('anim-modal');
  if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
};

// ============================================================================
// 7. RENDERING SCHEDA D&D BEYOND (SCREENSHOT 2 & 3) E VISTE
// ============================================================================
window.renderDdbSectionContent = function(ch) {
  const body = document.getElementById('ddb-section-body');
  if (!body || !ch) return;

  const secObj = window.DDB_SECTIONS.find(s => s.id === window.activeDdbSection) || window.DDB_SECTIONS[0];
  document.getElementById('ddb-active-section-label').textContent = secObj.label;

  const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
  const saves = ch.saves || {};
  const profBonus = ch.atkBonus || 2;
  const allCards = ch.cards || [];

  // 1. ABILITIES, SAVES, SENSES (Identico allo Screenshot 2)
  if (window.activeDdbSection === 'abilities') {
    const statNames = { FOR:'STRENGTH', DES:'DEXTERITY', COS:'CONSTITUTION', INT:'INTELLIGENCE', SAG:'WISDOM', CAR:'CHARISMA' };
    const abilitiesHTML = Object.entries(statNames).map(([key, label]) => {
      const score = stats[key] || 10;
      const mod = Math.floor((score - 10) / 2);
      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
      return `
        <button type="button" onclick="alert('Test ${label}: ' + (Math.floor(Math.random()*20)+1 + ${mod}))" class="ddb-ability-card active:scale-95 transition">
          <span class="text-[9px] font-extrabold text-slate-300 tracking-wider block">${label}</span>
          <div class="ddb-ability-mod-box">${modStr}</div>
          <div class="ddb-ability-score-pill">${score}</div>
        </button>
      `;
    }).join('');

    const savesHTML = Object.entries(statNames).map(([key, label]) => {
      const score = stats[key] || 10;
      const isProf = saves[key] === true;
      const mod = Math.floor((score - 10) / 2) + (isProf ? profBonus : 0);
      const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
      return `
        <button type="button" onclick="alert('Saving Throw ${label}: ' + (Math.floor(Math.random()*20)+1 + ${mod}))" class="ddb-save-pill active:scale-95 transition">
          <div class="flex items-center gap-2.5">
            <span class="ddb-prof-dot ${isProf ? 'proficient' : ''}"></span>
            <span class="text-xs font-extrabold text-white tracking-wide">${label}</span>
          </div>
          <span class="ddb-save-val">${modStr}</span>
        </button>
      `;
    }).join('');

    const wisMod = Math.floor(((stats.SAG || 10) - 10) / 2);
    const intMod = Math.floor(((stats.INT || 10) - 10) / 2);

    body.innerHTML = `
      <div class="grid grid-cols-3 gap-2.5">${abilitiesHTML}</div>
      <div class="pt-2 space-y-2">
        <h3 class="text-base font-extrabold text-white">Saving Throws</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${savesHTML}</div>
      </div>
      <div class="pt-2 space-y-2">
        <h3 class="text-base font-extrabold text-white">Senses</h3>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="ddb-save-pill"><span>Passive Perception</span><span class="ddb-save-val">${10 + wisMod}</span></div>
          <div class="ddb-save-pill"><span>Passive Investigation</span><span class="ddb-save-val">${10 + intMod}</span></div>
        </div>
      </div>
    `;
    return;
  }

  // 2. SKILLS
  if (window.activeDdbSection === 'skills') {
    body.innerHTML = `
      <div class="space-y-2">
        ${window.DDB_SKILLS.map(sk => {
          const mod = Math.floor(((stats[sk.stat] || 10) - 10) / 2);
          const mStr = mod >= 0 ? `+${mod}` : `${mod}`;
          return `
            <button type="button" onclick="alert('Skill ${sk.name}: ' + (Math.floor(Math.random()*20)+1 +${mod}))" class="ddb-save-pill w-full">
              <div class="flex items-center gap-2.5">
                <span class="text-[10px] font-bold text-slate-400 w-8">${sk.stat}</span>
                <span class="text-xs font-bold text-white">${sk.name}</span>
              </div>
              <span class="ddb-save-val">${mStr}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  // 3, 4, 5. ACTIONS (Armi), INVENTORY (Armature/Scudi/Oggetti), SPELLS (Magie) -> Decifrati automaticamente!
  if (window.activeDdbSection === 'actions' || window.activeDdbSection === 'inventory' || window.activeDdbSection === 'spells') {
    const sectionCards = allCards.filter(c => window.classifyCardToDdbSection(c) === window.activeDdbSection);
    body.innerHTML = sectionCards.length === 0
      ? `<div class="ddb-top-card rounded-2xl p-6 text-center text-xs text-slate-400">Nessuna carta in <strong>${secObj.label}</strong>. Il Dungeon Master può forgiare e consegnare carte nel tuo inventario!</div>`
      : `<div class="flex gap-4 overflow-x-auto no-scrollbar py-2 px-1 snap-x snap-mandatory">${sectionCards.map(c => window.buildYgoCardHTML(c, true)).join('')}</div>`;
    return;
  }

  // 6. SPEED & DEFENSES
  if (window.activeDdbSection === 'defenses') {
    body.innerHTML = `
      <div class="ddb-top-card rounded-2xl p-4 space-y-2 text-xs">
        <div class="flex justify-between border-b border-slate-800 pb-2"><span class="text-slate-400">Walking Speed</span><strong class="text-white">${ch.speed || '9m (30 ft.)'}</strong></div>
        <div><span class="text-slate-400 block mb-1">Defenses, Resistances & Immunities</span><p class="text-white font-semibold">${ch.defenses || 'Nessuna'}</p></div>
      </div>
    `;
    return;
  }

  // 7. FEATURES & TRAITS
  if (window.activeDdbSection === 'features') {
    body.innerHTML = `<div class="space-y-2 text-xs">${(ch.traits || []).map(t => `<div class="ddb-top-card p-3.5 rounded-xl text-slate-200">${t}</div>`).join('')}</div>`;
    return;
  }

  // 8, 9, 10, 11. PROFICIENCIES, BACKGROUND, NOTES, EXTRAS
  const infoMap = {
    proficiencies: ch.proficiencies || 'Armi semplici, Armature leggere',
    background: `${ch.background || 'Outlander'} • Allineamento: ${ch.alignment || 'Neutral'}`,
    notes: ch.notes || 'Nessuna nota.',
    creatures: ch.notes || 'Nessuna creatura extra registrata.'
  };
  body.innerHTML = `<div class="ddb-top-card rounded-2xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-line">${infoMap[window.activeDdbSection]}</div>`;
};

window.renderAllViews = function() {
  if (!window.currentUser || !window.dbState.users[window.currentUser]) return;
  const account = window.dbState.users[window.currentUser];
  document.getElementById('top-user-label').textContent = window.isCurrentUserAdmin() ? `Admin: ${account.username}` : `Account: ${account.username}`;

  const chars = account.characters || [];
  const ch = window.getMyCharacter();

  if (ch) {
    document.getElementById('char-picker').innerHTML = chars.map(c => `<option value="${c.id}" ${c.id === ch.id ? 'selected' : ''}>${c.name} (${c.race} ${c.className} ${c.level || 1})</option>`).join('');
    document.getElementById('sheet-name').textContent = ch.name;
    document.getElementById('sheet-race-class').textContent = `${ch.race} ${ch.className} ${ch.level || 1}`;
    document.getElementById('sheet-avatar').src = ch.avatar;

    const inspBtn = document.getElementById('sheet-insp-badge');
    if (inspBtn) inspBtn.className = ch.inspiration ? 'ddb-insp-btn active' : 'ddb-insp-btn';

    const condBtn = document.getElementById('sheet-condition-btn');
    if (condBtn) condBtn.textContent = ch.condition && ch.condition !== 'Normal' ? `⚠️ ${ch.condition}` : 'CONDITIONS';

    let activeCamp = null;
    Object.values(window.dbState.campaigns || {}).forEach(camp => {
      if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) activeCamp = camp;
    });
    document.getElementById('sheet-camp-badge').textContent = activeCamp ? `Campagna: ${activeCamp.title}` : 'Senza Campagna';

    const pct = Math.round((ch.hp / ch.maxHp) * 100);
    document.getElementById('sheet-hp-label').textContent = `${ch.hp}/${ch.maxHp}`;
    document.getElementById('sheet-hp-bar').style.width = `${pct}%`;

    const desMod = Math.floor(((ch.stats?.DES || 10) - 10) / 2);
    document.getElementById('sheet-ac').textContent = ch.ac;
    document.getElementById('sheet-init').textContent = desMod >= 0 ? `+${desMod}` : desMod;

    // Cassa del Dungeon
    const chestBox = document.getElementById('player-chest-box');
    if (activeCamp && activeCamp.chest && activeCamp.chest.length > 0) {
      chestBox.classList.remove('hidden');
      document.getElementById('player-chest-items').innerHTML = activeCamp.chest.map(item => `
        <div class="bg-slate-950 border border-amber-500/40 p-2.5 rounded-xl flex justify-between items-center text-xs">
          <div><span class="font-bold text-amber-300 block">${item.name}</span><span class="text-[10px] text-slate-400 uppercase">${item.type} • ${item.damage}</span></div>
          <button type="button" onclick="window.playerClaimChestItem('${activeCamp.code}', '${item.id}')" class="gold-btn px-3 py-1.5 rounded-lg font-cinzel font-bold text-[10px] text-white">PRENDI</button>
        </div>
      `).join('');
    } else {
      chestBox.classList.add('hidden');
    }

    window.renderDdbSectionContent(ch);
  }

  document.getElementById('join-char-select').innerHTML = chars.map(c => `<option value="${c.id}">${c.name} (${c.race} ${c.className})</option>`).join('');

  const myJoinedCamps = Object.values(window.dbState.campaigns || {}).filter(camp => camp.members && camp.members[window.currentUser]);
  document.getElementById('my-joined-campaigns-list').innerHTML = myJoinedCamps.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 text-center">Non fai parte di nessuna campagna. Inserisci il codice qui sopra!</div>`
    : myJoinedCamps.map(camp => {
        const myChar = camp.members[window.currentUser];
        const fellows = Object.values(camp.members || {});
        return `
          <div class="norse-panel rounded-2xl p-4 space-y-3 border border-sky-500/30">
            <div class="flex justify-between items-center border-b border-slate-800 pb-2">
              <div><span class="text-[10px] text-sky-400 font-bold">Codice: ${camp.code}</span><h4 class="font-cinzel font-bold text-base text-white">${camp.title}</h4></div>
              <span class="px-2.5 py-1 rounded bg-sky-950 text-xs font-bold text-sky-300">Eroe: ${myChar.name}</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              ${fellows.map(f => `
                <div class="bg-slate-950 border border-slate-800 p-2 rounded-xl flex items-center gap-2.5">
                  <img src="${f.avatar}" class="w-8 h-8 rounded-lg object-cover">
                  <div><span class="font-bold text-xs text-white block">${f.name}</span><span class="text-[10px] text-slate-400">${f.className} • ${f.hp}/${f.maxHp} HP</span></div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');

  if (typeof window.renderDmViews === 'function') window.renderDmViews();
};

window.initCloudConnection();
if (window.currentUser && window.dbState.users && window.dbState.users[window.currentUser]) {
  window.enterAfterLogin();
}
