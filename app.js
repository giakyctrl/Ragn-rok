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

for (let i = 0; i < 60; i++) {
  snowParticles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2.2 + 0.5,
    vx: Math.random() * 1.6 + 0.5,
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
// 2. DATABASE SINCRONIZZATO (PC + TELEFONI)
// ============================================================================
let dbState = JSON.parse(localStorage.getItem('yggdrasill_modular_db')) || {
  users: {},
  campaigns: {}
};

let currentUser = localStorage.getItem('yggdrasill_logged_user') || null;
let activeCharId = null;
let selectedDmCampCode = null;
let cardFilter = 'tutti';
let authMode = 'login';
let fbRef = null;
let isCloudReady = false;
let lastSeenEventTimestamp = Date.now();
let dmStagingLoot = [];
let pendingTradeCardId = null;

function getEffectiveFirebaseUrl() {
  return (FIREBASE_DATABASE_URL && FIREBASE_DATABASE_URL.trim() !== "")
    ? FIREBASE_DATABASE_URL.trim()
    : (localStorage.getItem('yggdrasill_fb_url') || localStorage.getItem('dnd_fb_url') || "");
}

function initCloudConnection() {
  const url = getEffectiveFirebaseUrl();
  const badge = document.getElementById('cloud-badge-btn');
  if (!url) {
    badge.textContent = "Cloud Non Configurato (Tocca qui)";
    badge.className = "text-[10px] text-amber-400 underline";
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp({ databaseURL: url });
    }
    fbRef = firebase.database().ref('yggdrasill_v2_realm');
    badge.textContent = "Reame Cloud Connesso (PC & Mobile Sync)";
    badge.className = "text-[10px] text-emerald-400 font-bold";

    fbRef.on('value', snap => {
      const remoteData = snap.val();
      isCloudReady = true;
      if (remoteData) {
        dbState = remoteData;
        if (!dbState.users) dbState.users = {};
        if (!dbState.campaigns) dbState.campaigns = {};
        localStorage.setItem('yggdrasill_modular_db', JSON.stringify(dbState));
        renderAllViews();
        checkIncomingLiveEvents();
      } else {
        fbRef.set(dbState);
      }
    });
  } catch (err) {
    console.error("Errore connessione Firebase:", err);
  }
}

function saveDB() {
  localStorage.setItem('yggdrasill_modular_db', JSON.stringify(dbState));
  if (fbRef) {
    fbRef.set(dbState);
  }
  renderAllViews();
}

function openCloudModal() {
  document.getElementById('cloud-url-input').value = getEffectiveFirebaseUrl();
  const m = document.getElementById('cloud-modal');
  m.classList.remove('hidden');
  m.classList.add('flex');
}

function closeCloudModal() {
  const m = document.getElementById('cloud-modal');
  m.classList.add('hidden');
  m.classList.remove('flex');
}

function saveCloudUrl() {
  const url = document.getElementById('cloud-url-input').value.trim();
  if (!url.startsWith('https://')) {
    alert("Inserisci un indirizzo Firebase valido che inizia con https://");
    return;
  }
  localStorage.setItem('yggdrasill_fb_url', url);
  closeCloudModal();
  location.reload();
}

// ============================================================================
// 3. REGISTRAZIONE E LOGIN SINCRONIZZATI CON IL CLOUD
// ============================================================================
function openAuthModal(mode) {
  authMode = mode;
  document.getElementById('auth-title').textContent = mode === 'register' ? 'Registrati su Yggdrasill' : 'Accedi al tuo Account';
  document.getElementById('auth-subtitle').textContent = mode === 'register'
    ? 'Crea un profilo: potrai accedere sia da PC che da Telefono.'
    : 'Inserisci le credenziali che hai registrato.';
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

  // Se Firebase è configurato, scarica prima l'elenco utenti aggiornato dal Cloud
  if (fbRef) {
    try {
      const snap = await fbRef.once('value');
      if (snap.val()) {
        dbState = snap.val();
        if (!dbState.users) dbState.users = {};
        if (!dbState.campaigns) dbState.campaigns = {};
      }
    } catch (err) {
      console.warn("Lettura cloud fallita, uso cache locale", err);
    }
  }

  if (authMode === 'register') {
    if (dbState.users[userKey]) {
      alert("Questo Nome Utente è già registrato. Usa il pulsante ACCEDI.");
      return;
    }
    dbState.users[userKey] = {
      username: uName,
      password: uPass,
      characters: [],
      joinedCampaigns: {} // { [campCode]: charId }
    };
    currentUser = userKey;
    localStorage.setItem('yggdrasill_logged_user', currentUser);
    closeAuthModal();
    saveDB();
    enterRealmAfterAuth();
  } else {
    const account = dbState.users[userKey];
    if (!account) {
      const cloudHint = !getEffectiveFirebaseUrl()
        ? "\n\nNOTA: Non hai ancora collegato l'URL Firebase! Se ti sei registrato su PC, tocca 'Verifica Cloud Database' in alto a sinistra e incolla lo stesso URL Firebase su entrambi i dispositivi."
        : "";
      alert("Account non trovato." + cloudHint);
      return;
    }
    if (account.password !== uPass) {
      alert("Password errata.");
      return;
    }
    currentUser = userKey;
    localStorage.setItem('yggdrasill_logged_user', currentUser);
    closeAuthModal();
    enterRealmAfterAuth();
  }
}

function enterRealmAfterAuth() {
  const account = dbState.users[currentUser];
  document.getElementById('screen-welcome').classList.add('hidden');

  if (!account.characters || account.characters.length === 0) {
    openCharacterBuilder(false);
  } else {
    activeCharId = account.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    switchBottomNav('characters');
    renderAllViews();
  }
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('yggdrasill_logged_user');
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-welcome').classList.remove('hidden');
}

// ============================================================================
// 4. COMPILAZIONE LIBERA DEL PERSONAGGIO (PAGINA UNICA)
// ============================================================================
let selectedFormAvatar = PRESET_AVATARS[0];

function openCharacterBuilder(allowCancel) {
  selectedFormAvatar = PRESET_AVATARS[0];
  document.getElementById('cf-avatar-url').value = '';
  document.getElementById('btn-cancel-form').classList.toggle('hidden', !allowCancel);
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.remove('hidden');
  renderAvatarSelector();
}

function renderAvatarSelector() {
  document.getElementById('cf-avatar-Selector').innerHTML = PRESET_AVATARS.map(url => `
    <div onclick="selectedFormAvatar='${url}'; renderAvatarSelector();" class="cursor-pointer rounded-xl overflow-hidden border-2 transition ${selectedFormAvatar === url ? 'border-sky-400 scale-105' : 'border-slate-800 opacity-50'}">
      <img src="${url}" class="w-full h-14 object-cover">
    </div>
  `).join('');
}

function cancelCharacterForm() {
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
}

function saveFullCharacterSheet(e) {
  e.preventDefault();
  const customUrl = document.getElementById('cf-avatar-url').value.trim();
  const finalAvatar = customUrl !== '' ? customUrl : selectedFormAvatar;
  const maxHp = parseInt(document.getElementById('cf-maxhp').value) || 25;

  const traitsRaw = document.getElementById('cf-traits').value.trim();
  const traitsList = traitsRaw
    ? traitsRaw.split('\n').map(s => s.trim()).filter(Boolean)
    : ['Avventuriero di Midgard'];

  const starterCard = {
    id: 'card_' + Date.now(),
    name: document.getElementById('cf-card-name').value.trim() || 'Arma Runica',
    type: 'arma',
    rarity: document.getElementById('cf-card-rarity').value,
    damage: document.getElementById('cf-card-dmg').value.trim() || '1d8+3',
    weight: 2.0,
    stars: 5,
    img: CARD_ARTWORKS.arma,
    desc: document.getElementById('cf-card-desc').value.trim()
  };

  const newChar = {
    id: 'char_' + Date.now(),
    owner: currentUser,
    name: document.getElementById('cf-name').value.trim(),
    race: document.getElementById('cf-race').value.trim(),
    className: document.getElementById('cf-class').value.trim(),
    level: parseInt(document.getElementById('cf-level').value) || 1,
    hitDie: document.getElementById('cf-hitdie').value.trim() || '1d10',
    background: document.getElementById('cf-bg').value.trim() || 'Eroe',
    alignment: document.getElementById('cf-align').value.trim() || 'Neutrale',
    avatar: finalAvatar,
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
    cards: [starterCard]
  };

  const account = dbState.users[currentUser];
  if (!account.characters) account.characters = [];
  account.characters.push(newChar);
  activeCharId = newChar.id;

  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
  switchBottomNav('characters');
  saveDB();
}

// ============================================================================
// 5. NAVIGAZIONE A 3 COLONNE (SINISTRA: DM | CENTRO: PERSONAGGI | DESTRA: CAMPAGNE)
// ============================================================================
function switchBottomNav(tab) {
  document.getElementById('view-dm').classList.toggle('hidden', tab !== 'dm');
  document.getElementById('view-characters').classList.toggle('hidden', tab !== 'characters');
  document.getElementById('view-campaigns').classList.toggle('hidden', tab !== 'campaigns');

  document.getElementById('bnav-dm').className = tab === 'dm'
    ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';

  document.getElementById('bnav-campaigns').className = tab === 'campaigns'
    ? 'flex flex-col items-center gap-1 text-sky-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';

  document.getElementById('bnav-char-label').className = tab === 'characters'
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
  ['tutti', 'arma', 'incantesimo', 'armatura', 'oggetto'].forEach(k => {
    document.getElementById('flt-' + k).className = k === f
      ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-sky-400 text-slate-950'
      : 'px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300';
  });
  renderAllViews();
}

// ============================================================================
// 6. AZIONI GIOCATORE (HP, CARTE YU-GI-OH, SCHIERAMENTO, SCAMBIO)
// ============================================================================
function adjustMyHP(delta) {
  const ch = getMyCharacter();
  if (!ch) return;
  ch.hp = Math.max(0, Math.min(ch.maxHp, ch.hp + delta));
  propagateCharacterToCampaigns(ch);
  saveDB();
}

function createPersonalCard(e) {
  e.preventDefault();
  const ch = getMyCharacter();
  if (!ch) return;
  if (!ch.cards) ch.cards = [];

  const type = document.getElementById('newcard-type').value;
  ch.cards.unshift({
    id: 'card_' + Date.now(),
    name: document.getElementById('newcard-name').value.trim(),
    type: type,
    rarity: document.getElementById('newcard-rarity').value,
    damage: document.getElementById('newcard-dmg').value.trim(),
    weight: parseFloat(document.getElementById('newcard-weight').value) || 1,
    stars: 5,
    img: CARD_ARTWORKS[type] || CARD_ARTWORKS.arma,
    desc: document.getElementById('newcard-desc').value.trim()
  });

  e.target.reset();
  propagateCharacterToCampaigns(ch);
  setCharSubTab('combat');
  saveDB();
}

function propagateCharacterToCampaigns(ch) {
  if (!dbState.campaigns) return;
  Object.values(dbState.campaigns).forEach(camp => {
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
        <img src="${card.img || CARD_ARTWORKS.arma}" class="w-full h-full object-cover">
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

  // Invia l'evento a tutte le campagne di cui fa parte questo personaggio
  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
      camp.globalEvent = eventPayload;
      if (!camp.logs) camp.logs = [];
      camp.logs.unshift({
        time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }),
        text: `${ch.name} ha schierato [${card.name}] -> Colpire: ${hitStr} | Danno: ${dmgResult}`
      });
    }
  });

  lastSeenEventTimestamp = eventPayload.timestamp;
  displayGlobalAnimation(eventPayload);
  saveDB();
}

// ============================================================================
// 7. GESTIONE CAMPAGNE (DESTRA: LE TUE CAMPAGNE | SINISTRA: DUNGEON MASTER)
// ============================================================================
function createNewCampaignAsDM() {
  const title = document.getElementById('dm-new-title').value.trim() || 'Saga dei Nove Reami';
  const code = 'YGG-' + Math.floor(1000 + Math.random() * 9000);

  if (!dbState.campaigns) dbState.campaigns = {};
  dbState.campaigns[code] = {
    code: code,
    title: title,
    dmUser: currentUser,
    members: {},
    chest: [],
    logs: [{ time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }), text: `Campagna "${title}" fondata dal DM. Codice: ${code}` }],
    globalEvent: null
  };

  selectedDmCampCode = code;
  document.getElementById('dm-new-title').value = '';
  saveDB();
}

function selectDmCampaign(code) {
  selectedDmCampCode = code;
  renderAllViews();
}

function joinCampaignAsPlayer() {
  const code = document.getElementById('join-camp-code').value.trim().toUpperCase();
  const charId = document.getElementById('join-char-select').value;

  if (!code || !dbState.campaigns || !dbState.campaigns[code]) {
    alert("Codice Campagna non trovato. Verifica che il DM l'abbia generato.");
    return;
  }

  const account = dbState.users[currentUser];
  const charObj = (account.characters || []).find(c => c.id === charId);
  if (!charObj) return;

  if (!account.joinedCampaigns) account.joinedCampaigns = {};
  account.joinedCampaigns[code] = charObj.id;

  const camp = dbState.campaigns[code];
  if (!camp.members) camp.members = {};
  camp.members[currentUser] = charObj;

  if (!camp.logs) camp.logs = [];
  camp.logs.unshift({
    time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }),
    text: `${charObj.name} (${charObj.race} ${charObj.className}) si è unito alla campagna!`
  });

  document.getElementById('join-camp-code').value = '';
  saveDB();
  alert(`Ora fai parte della campagna "${camp.title}" con il personaggio ${charObj.name}!`);
}

function dmTriggerTactical(type) {
  if (!selectedDmCampCode || !dbState.campaigns[selectedDmCampCode]) return;
  const camp = dbState.campaigns[selectedDmCampCode];

  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    if (type === 'SHORT_REST') {
      const heal = Math.max(4, Math.round(mChar.maxHp * 0.25));
      mChar.hp = Math.min(mChar.maxHp, mChar.hp + heal);
    } else if (type === 'LONG_REST') {
      mChar.hp = mChar.maxHp;
    }
    if (dbState.users[uKey] && dbState.users[uKey].characters) {
      const idx = dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) dbState.users[uKey].characters[idx] = mChar;
    }
  });

  const evt = { type: type, timestamp: Date.now() };
  camp.globalEvent = evt;

  const msgMap = {
    'BATTLE': 'Il Dungeon Master ha dichiarato l\'inizio di una BATTAGLIA!',
    'SHORT_REST': 'Il Dungeon Master ha concesso un Riposo Corto al party (+25% PF).',
    'LONG_REST': 'Il Dungeon Master ha avviato un Riposo Lungo: tutti i PF sono al 100%.'
  };
  if (!camp.logs) camp.logs = [];
  camp.logs.unshift({
    time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }),
    text: msgMap[type]
  });

  lastSeenEventTimestamp = evt.timestamp;
  displayGlobalAnimation(evt);
  saveDB();
}

function dmAdjustMemberHP(uKey, delta) {
  if (!selectedDmCampCode || !dbState.campaigns[selectedDmCampCode]) return;
  const camp = dbState.campaigns[selectedDmCampCode];
  const mChar = camp.members[uKey];
  if (!mChar) return;

  mChar.hp = Math.max(0, Math.min(mChar.maxHp, mChar.hp + delta));
  if (dbState.users[uKey] && dbState.users[uKey].characters) {
    const idx = dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
    if (idx !== -1) dbState.users[uKey].characters[idx] = mChar;
  }
  saveDB();
}

// Cassa del Dungeon & Scambio
function dmAddLootToStaging() {
  const name = document.getElementById('dm-loot-name').value.trim();
  if (!name) return;
  const type = document.getElementById('dm-loot-type').value;

  dmStagingLoot.push({
    id: 'loot_' + Date.now() + '_' + Math.floor(Math.random()*999),
    name: name,
    type: type,
    rarity: document.getElementById('dm-loot-rarity').value,
    damage: document.getElementById('dm-loot-dmg').value.trim() || '+2',
    weight: 1.5,
    stars: 5,
    img: CARD_ARTWORKS[type] || CARD_ARTWORKS.oggetto,
    desc: document.getElementById('dm-loot-desc').value.trim() || 'Tesoro custodito nel forziere del dungeon.'
  });

  document.getElementById('dm-loot-name').value = '';
  document.getElementById('dm-loot-dmg').value = '';
  document.getElementById('dm-loot-desc').value = '';
  renderAllViews();
}

function dmPublishChest() {
  if (!selectedDmCampCode || !dbState.campaigns[selectedDmCampCode]) return;
  if (dmStagingLoot.length === 0) {
    alert("Aggiungi prima almeno un oggetto nella cassa con il pulsante '+ Aggiungi'.");
    return;
  }
  const camp = dbState.campaigns[selectedDmCampCode];
  if (!camp.chest) camp.chest = [];
  camp.chest.push(...dmStagingLoot);
  dmStagingLoot = [];

  if (!camp.logs) camp.logs = [];
  camp.logs.unshift({
    time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }),
    text: 'Una Cassa del Dungeon è apparsa! I giocatori possono aprirla e dividersi il bottino.'
  });

  saveDB();
  alert("Cassa del Dungeon inviata sugli schermi dei giocatori!");
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

  if (!camp.logs) camp.logs = [];
  camp.logs.unshift({
    time: new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit' }),
    text: `${ch.name} ha reclamato [${item.name}] dalla Cassa del Dungeon!`
  });

  saveDB();
}

function openTradeCardModal(cardId) {
  const ch = getMyCharacter();
  if (!ch) return;

  // Trova compagni di campagna
  let fellows = [];
  Object.values(dbState.campaigns || {}).forEach(camp => {
    if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
      Object.entries(camp.members).forEach(([uKey, mChar]) => {
        if (uKey !== currentUser) fellows.push({ uKey, mChar, campCode: camp.code });
      });
    }
  });

  if (fellows.length === 0) {
    alert("Per scambiare carte, il tuo personaggio deve far parte di una campagna con altri giocatori connessi.");
    return;
  }

  const card = ch.cards.find(c => c.id === cardId);
  pendingTradeCardId = cardId;
  document.getElementById('trade-item-label').textContent = `Cedi: ${card.name}`;
  document.getElementById('trade-recipient').innerHTML = fellows.map(f => `
    <option value="${f.uKey}|${f.campCode}">${f.mChar.name} (${f.mChar.className})</option>
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

// Controllo Eventi Live e Reindirizzamento in Battaglia
function checkIncomingLiveEvents() {
  if (!currentUser || !dbState.users[currentUser]) return;
  const account = dbState.users[currentUser];

  // Aggiorna i personaggi locali se il DM o una cassa li ha modificati
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
        switchBottomNav('characters');
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
      <div class="w-24 h-24 mx-auto rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.8)]">
        <svg class="w-12 h-12 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 6.5L21 18v3h-3L6.5 9.5"/>
        </svg>
      </div>
      <h2 class="font-norse text-3xl font-black text-red-400">INIZIA LA BATTAGLIA</h2>
      <p class="text-xs text-slate-300">Il Dungeon Master ha chiamato alle armi! Sei stato reindirizzato sulla tua scheda Combattimento.</p>
    `;
  } else if (evt.type === 'SHORT_REST') {
    box.innerHTML = `
      <h2 class="font-norse text-3xl font-black text-amber-300">RIPOSO CORTO</h2>
      <p class="text-xs text-slate-300">Il party riposa attorno al fuoco. Hai recuperato il 25% dei tuoi Punti Ferita!</p>
    `;
  } else if (evt.type === 'LONG_REST') {
    box.innerHTML = `
      <h2 class="font-norse text-3xl font-black text-sky-300">RIPOSO LUNGO</h2>
      <p class="text-xs text-slate-300">Le energie di Yggdrasill rigenerano completamente il party (100% PF).</p>
    `;
  } else if (evt.type === 'CARD_DEPLOY') {
    box.innerHTML = `
      <span class="text-xs font-cinzel uppercase tracking-widest text-sky-400">${evt.actor} schiera in campo</span>
      <div class="flex justify-center my-2 animate-slam">${buildYgoCardHTML(evt.card, false)}</div>
      <div class="norse-panel rounded-xl p-3 grid grid-cols-2 divide-x divide-slate-800">
        <div>
          <span class="text-[10px] text-slate-400 uppercase block">Tiro Colpire</span>
          <span class="font-cinzel font-black text-xl text-sky-300">${evt.hit}</span>
        </div>
        <div>
          <span class="text-[10px] text-slate-400 uppercase block">Danno / Effetto</span>
          <span class="font-cinzel font-black text-xl text-red-400">${evt.dmg}</span>
        </div>
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

// ============================================================================
// 8. RENDERING DELLE 3 SEZIONI PRINCIPALI
// ============================================================================
function renderAllViews() {
  if (!currentUser || !dbState.users[currentUser]) return;
  const account = dbState.users[currentUser];
  document.getElementById('top-user-label').textContent = `Guerriero: ${account.username}`;

  const chars = account.characters || [];
  const ch = getMyCharacter();

  // --- RENDER VISTA CENTRALE: PERSONAGGI ---
  if (ch) {
    document.getElementById('char-picker').innerHTML = chars.map(c => `
      <option value="${c.id}" ${c.id === ch.id ? 'selected' : ''}>${c.name} (Liv. ${c.level || 1} ${c.race} ${c.className})</option>
    `).join('');

    document.getElementById('sheet-avatar').src = ch.avatar;
    document.getElementById('sheet-name').textContent = ch.name;
    document.getElementById('sheet-race-class').textContent = `Liv. ${ch.level || 1} • ${ch.race} • ${ch.className}`;
    document.getElementById('sheet-bg-align').textContent = `${ch.background} • ${ch.alignment || 'Neutrale'}`;

    // Trova in quale campagna è iscritto questo personaggio
    let activeCampForChar = null;
    Object.values(dbState.campaigns || {}).forEach(camp => {
      if (camp.members && camp.members[currentUser] && camp.members[currentUser].id === ch.id) {
        activeCampForChar = camp;
      }
    });

    document.getElementById('sheet-camp-badge').textContent = activeCampForChar
      ? `Campagna: ${activeCampForChar.title}`
      : 'Nessuna Campagna';

    const pct = Math.round((ch.hp / ch.maxHp) * 100);
    document.getElementById('sheet-hp-label').textContent = `${ch.hp} / ${ch.maxHp} PF`;
    document.getElementById('sheet-hp-bar').style.width = `${pct}%`;

    const desMod = Math.floor(((ch.stats?.DES || 10) - 10) / 2);
    document.getElementById('sheet-ac').textContent = ch.ac;
    document.getElementById('sheet-init').textContent = desMod >= 0 ? `+${desMod}` : desMod;
    document.getElementById('sheet-atk').textContent = `+${ch.atkBonus}`;
    document.getElementById('sheet-speed').textContent = ch.speed || '9m';

    // Cassa del Dungeon attiva
    const chestBox = document.getElementById('player-chest-box');
    if (activeCampForChar && activeCampForChar.chest && activeCampForChar.chest.length > 0) {
      chestBox.classList.remove('hidden');
      document.getElementById('player-chest-items').innerHTML = activeCampForChar.chest.map(item => `
        <div class="bg-slate-950 border border-amber-500/40 p-2.5 rounded-xl flex justify-between items-center text-xs">
          <div>
            <span class="font-cinzel font-bold text-amber-300 block">${item.name}</span>
            <span class="text-[10px] text-slate-400 uppercase">${item.rarity} • ${item.damage}</span>
          </div>
          <button onclick="playerClaimChestItem('${activeCampForChar.code}', '${item.id}')" class="gold-btn px-3 py-1.5 rounded-lg font-cinzel font-bold text-[10px] text-white">
            PRENDI
          </button>
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
        <button onclick="alert('Tiro su ${k}: ' + (Math.floor(Math.random()*20)+1 + ${mod}))" class="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center active:scale-95 transition">
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

  // --- RENDER VISTA DESTRA: LE TUE CAMPAGNE ---
  document.getElementById('join-char-select').innerHTML = chars.map(c => `
    <option value="${c.id}">${c.name} (${c.race} ${c.className})</option>
  `).join('');

  const myJoinedCamps = Object.values(dbState.campaigns || {}).filter(camp => camp.members && camp.members[currentUser]);
  document.getElementById('my-joined-campaigns-list').innerHTML = myJoinedCamps.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 text-center">Non ti sei ancora unito a nessuna campagna come giocatore. Inserisci il codice del tuo DM qui sopra!</div>`
    : myJoinedCamps.map(camp => {
        const myEnrolledChar = camp.members[currentUser];
        const fellows = Object.values(camp.members || {});
        return `
          <div class="norse-panel rounded-2xl p-5 space-y-3 border border-sky-500/30">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span class="text-[10px] font-cinzel uppercase text-sky-400">Campagna Attiva • Codice: ${camp.code}</span>
                <h4 class="font-cinzel font-bold text-base text-white">${camp.title}</h4>
              </div>
              <span class="px-3 py-1 rounded-lg bg-sky-950 border border-sky-500/40 text-xs font-bold text-sky-300">
                Il tuo Eroe: ${myEnrolledChar.name}
              </span>
            </div>
            <p class="text-[11px] text-slate-400">Membri del Party in questa campagna:</p>
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

  // --- RENDER VISTA SINISTRA: DUNGEON MASTER ---
  const myOwnedCamps = Object.values(dbState.campaigns || {}).filter(camp => camp.dmUser === currentUser);
  const dmSelect = document.getElementById('dm-owned-campaigns-select');

  if (myOwnedCamps.length === 0) {
    dmSelect.innerHTML = `<option value="">Nessuna campagna creata</option>`;
    document.getElementById('dm-active-workspace').classList.add('hidden');
  } else {
    if (!selectedDmCampCode || !dbState.campaigns[selectedDmCampCode]) {
      selectedDmCampCode = myOwnedCamps[0].code;
    }
    dmSelect.innerHTML = myOwnedCamps.map(c => `
      <option value="${c.code}" ${c.code === selectedDmCampCode ? 'selected' : ''}>${c.title} (Codice: ${c.code})</option>
    `).join('');

    const activeDmCamp = dbState.campaigns[selectedDmCampCode];
    document.getElementById('dm-active-workspace').classList.remove('hidden');
    document.getElementById('dm-work-title').textContent = activeDmCamp.title;
    document.getElementById('dm-work-code').textContent = activeDmCamp.code;

    const membersList = Object.entries(activeDmCamp.members || {});
    document.getElementById('dm-players-grid').innerHTML = membersList.length === 0
      ? `<p class="text-xs text-slate-400 col-span-2">Nessun giocatore unito. Condividi il codice <strong>${activeDmCamp.code}</strong> con i tuoi player!</p>`
      : membersList.map(([uKey, mChar]) => `
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2.5">
                <img src="${mChar.avatar}" class="w-10 h-10 rounded-lg object-cover border border-sky-400">
                <div>
                  <span class="font-cinzel font-bold text-xs text-white block">${mChar.name}</span>
                  <span class="text-[10px] text-sky-300">Liv.${mChar.level || 1} ${mChar.race} ${mChar.className}</span>
                </div>
              </div>
              <span class="text-xs font-bold text-red-400">${mChar.hp}/${mChar.maxHp} PF</span>
            </div>
            <div class="grid grid-cols-4 gap-1.5 pt-1">
              <button onclick="dmAdjustMemberHP('${uKey}', -5)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-5 PF</button>
              <button onclick="dmAdjustMemberHP('${uKey}', -1)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-1 PF</button>
              <button onclick="dmAdjustMemberHP('${uKey}', 1)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+1 PF</button>
              <button onclick="dmAdjustMemberHP('${uKey}', 5)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+5 PF</button>
            </div>
            <div class="text-[10px] text-slate-400 pt-1 border-t border-slate-900">
              CA ${mChar.ac} • Bonus Att. +${mChar.atkBonus} • Carte: ${(mChar.cards || []).map(c => c.name).join(', ')}
            </div>
          </div>
        `).join('');

    document.getElementById('dm-staging-list').innerHTML = dmStagingLoot.map(i => `
      <div class="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg flex justify-between">
        <span class="text-amber-300 font-bold">${i.name} (${i.rarity})</span>
        <span class="text-slate-400">${i.damage}</span>
      </div>
    `).join('');

    document.getElementById('dm-logs-box').innerHTML = (activeDmCamp.logs || []).slice(0, 15).map(l => `
      <div class="bg-slate-950 border border-slate-800 p-2 rounded-lg">
        <span class="text-[10px] text-sky-400 font-bold mr-1">[${l.time}]</span>
        <span class="text-slate-300">${l.text}</span>
      </div>
    `).join('');
  }
}

// Avvio iniziale
initCloudConnection();
if (currentUser && dbState.users && dbState.users[currentUser]) {
  enterRealmAfterAuth();
}
