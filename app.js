// ============================================================================
// 1. MOTORE CANVAS REATTIVO ALLE CONDIZIONI DEL PERSONAGGIO
// (Normale: Neve | Avvelenato: Gas Verde | Stordito: Onde Senso di Ragno Bianche
//  Invisibile: Onde Trasparenti | Spaventato: Onde Violacee | Prono: Polvere Terrosa)
// ============================================================================
window.currentCanvasCondition = 'Normale';

(function initDynamicConditionCanvas() {
  try {
    const canvas = document.getElementById('frost-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2.5 + 1,
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.55 + 0.15,
        phase: Math.random() * Math.PI * 2
      });
    }

    function renderLoop() {
      tick += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Condizione attiva solo quando siamo nella schermata Personaggi, altrimenti Neve classica
      const charView = document.getElementById('view-my-characters');
      const isViewingChar = charView && !charView.classList.contains('hidden');
      const cond = isViewingChar ? (window.currentCanvasCondition || 'Normale') : 'Normale';

      if (cond === 'Avvelenato') {
        // a. Gas verde tossico che sale dal basso
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, 'rgba(16, 185, 129, 0.16)');
        grad.addColorStop(1, 'rgba(5, 46, 22, 0.02)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.y -= (p.vy * 0.9 + 0.3);
          p.x += Math.sin(tick + p.phase) * 0.9;
          if (p.y < -30) { p.y = canvas.height + 30; p.x = Math.random() * canvas.width; }
          const rad = p.r * 12;
          const rg = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, rad);
          rg.addColorStop(0, `rgba(52, 211, 153, ${p.a * 0.42})`);
          rg.addColorStop(1, 'rgba(16, 185, 129, 0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (cond === 'Stordito') {
        // b. Onde del senso di ragno bianche vibranti
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
        ctx.lineWidth = 2;

        for (let w = 0; w < 5; w++) {
          const baseR = ((tick * 45 + w * 75) % (Math.max(canvas.width, canvas.height) * 0.65)) + 30;
          ctx.beginPath();
          for (let angle = 0; angle <= Math.PI * 2; angle += 0.12) {
            const jag = Math.sin(angle * 18 + tick * 6) * 9;
            const r = baseR + jag;
            const x = cx + Math.cos(angle) * r;
            const y = cy + Math.sin(angle) * r;
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }

      } else if (cond === 'Invisibile') {
        // c. Movimenti ad onda trasparenti ed eterei
        for (let i = 0; i < 7; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(224, 242, 254, ${0.12 + (i % 3) * 0.06})`;
          ctx.lineWidth = 2.5;
          const yOffset = (canvas.height / 8) * (i + 1);
          for (let x = 0; x <= canvas.width; x += 15) {
            const y = yOffset + Math.sin(x * 0.015 + tick * 1.5 + i) * 22;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (cond === 'Spaventato') {
        // d. Onde violacee oscure e inquietanti
        const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 40, canvas.width/2, canvas.height/2, canvas.height * 0.8);
        grad.addColorStop(0, 'rgba(88, 28, 135, 0.04)');
        grad.addColorStop(1, 'rgba(147, 51, 234, 0.22)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(192, 132, 252, ${0.28 + (i % 2) * 0.15})`;
          ctx.lineWidth = 3;
          const yBase = (canvas.height / 7) * (i + 1);
          for (let x = 0; x <= canvas.width; x += 12) {
            const y = yBase + Math.sin(x * 0.025 - tick * 2.2 + i) * 28 + Math.cos(tick * 4 + x * 0.05) * 6;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

      } else if (cond === 'Prono') {
        // e. Polvere terrosa e detriti rasoterra
        const grad = ctx.createLinearGradient(0, canvas.height, 0, canvas.height * 0.35);
        grad.addColorStop(0, 'rgba(120, 53, 15, 0.28)');
        grad.addColorStop(1, 'rgba(120, 53, 15, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
          p.x += (Math.abs(p.vx) + 1.8);
          p.y += Math.sin(tick + p.phase) * 0.4;
          if (p.x > canvas.width + 20) {
            p.x = -20;
            p.y = canvas.height * 0.45 + Math.random() * (canvas.height * 0.55);
          }
          ctx.fillStyle = `rgba(217, 119, 6, ${p.a * 0.75})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 1.8, 0, Math.PI * 2);
          ctx.fill();
        });

      } else {
        // Default ("Normale"): Tempesta di fiocchi di neve di Midgardr
        particles.forEach(p => {
          p.x += Math.abs(p.vx) + 0.4;
          p.y += p.vy;
          if (p.x > canvas.width) p.x = -5;
          if (p.y > canvas.height) p.y = -5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(186, 230, 253, ${p.a})`;
          ctx.fill();
        });
      }

      requestAnimationFrame(renderLoop);
    }
    renderLoop();
  } catch (e) {}
})();

// ============================================================================
// 2. STATO GLOBALE & SERVER
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

window.addEventListener('storage', (e) => {
  if (e.key === 'yggdrasill_v3_db') {
    window.dbState = loadLocalDB();
    window.enforceMaintenanceCheck();
    window.renderAllViews();
    window.checkIncomingLiveEvents();
  }
});

// BroadcastChannel per sincronizzazione istantanea a bassissima latenza tra schede (Admin <-> Giocatori)
try {
  const syncChannel = new BroadcastChannel('ragnarok_sync_channel');
  syncChannel.onmessage = (event) => {
    if (event.data && event.data.type === 'DB_UPDATE' && event.data.dbState) {
      window.dbState = event.data.dbState;
      if (!window.dbState.users) window.dbState.users = {};
      if (!window.dbState.campaigns) window.dbState.campaigns = {};
      localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState));
      window.enforceMaintenanceCheck();
      window.renderAllViews();
      window.checkIncomingLiveEvents();
    }
  };
} catch (e) {}

setInterval(() => {
  if (window.currentUser) {
    window.checkIncomingLiveEvents();
  }
}, 3000);

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

  const text = connected ? "Server connesso" : "Modalità Locale (Offline)";
  const cls = connected ? "text-[10px] text-emerald-400 font-semibold" : "text-[10px] text-amber-400 font-semibold";
  const pillCls = connected
    ? "text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-semibold"
    : "text-[9px] px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-400 font-semibold";

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
  try {
    const bc = new BroadcastChannel('ragnarok_sync_channel');
    bc.postMessage({ type: 'DB_UPDATE', dbState: window.dbState });
  } catch (e) {}
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
    const welcome = document.getElementById('screen-welcome');
    const main = document.getElementById('screen-main');
    const builder = document.getElementById('screen-builder');
    if (welcome && main && builder) {
      if (welcome.classList.contains('hidden') && main.classList.contains('hidden') && builder.classList.contains('hidden')) {
        if (window.currentUser && window.dbState.users && window.dbState.users[window.currentUser]) {
          main.classList.remove('hidden');
        } else {
          welcome.classList.remove('hidden');
        }
      }
    }
  }
};

// ============================================================================
// 3. CONSOLE ADMIN
// ============================================================================
window.openAdminConsole = function() {
  if (!window.isCurrentUserAdmin()) return;
  document.getElementById('admin-cloud-url').value = window.getEffectiveFirebaseUrl();
  
  const uCount = Object.keys(window.dbState.users || {}).length;
  const cCount = Object.keys(window.dbState.campaigns || {}).length;
  document.getElementById('admin-tech-diagnostics').innerHTML = `
    <div class="font-bold text-amber-300 mb-1">Diagnostica Tecnica Server (Solo Admin):</div>
    <div>• Stato Socket: <strong class="${window.isServerConnected ? 'text-emerald-400' : 'text-rose-400'}">${window.isServerConnected ? 'ONLINE (Sincronizzato)' : 'OFFLINE'}</strong></div>
    <div>• Endpoint: <code>/yggdrasill_v3_realm</code></div>
    <div>• Utenti Totali: <strong>${uCount}</strong> | Campagne: <strong>${cCount}</strong></div>
  `;

  window.updateAdminConsoleUI();
  const m = document.getElementById('admin-modal');
  m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeAdminConsole = function() {
  const m = document.getElementById('admin-modal');
  m.classList.add('hidden'); m.classList.remove('flex');
};

window.updateAdminConsoleUI = function() {
  const btn = document.getElementById('admin-maint-btn');
  const st = document.getElementById('admin-maint-status');
  if (!btn || !st) return;
  if (window.dbState.maintenance) {
    btn.textContent = "RIAPRI SITO";
    btn.className = "px-3.5 py-2 rounded-xl font-cinzel font-bold text-[10px] bg-emerald-600 text-white";
    st.textContent = "Manutenzione attiva";
  } else {
    btn.textContent = "BLOCCA SITO";
    btn.className = "px-3.5 py-2 rounded-xl font-cinzel font-bold text-[10px] bg-red-600 text-white";
    st.textContent = "Sito online.";
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
  if (!confirm("Svuotare l'intero database?")) return;
  const adminKey = window.ADMIN_CREDENTIALS.username.toLowerCase();
  const adminAcc = window.dbState.users[adminKey];
  window.dbState = { maintenance: false, users: {}, campaigns: {} };
  if (adminAcc) window.dbState.users[adminKey] = adminAcc;
  window.saveDB();
  window.closeAdminConsole();
};

// ============================================================================
// 4. AUTENTICAZIONE
// ============================================================================
window.openAuthModal = function(mode) {
  window.authMode = mode || 'login';
  document.getElementById('auth-title').textContent = window.authMode === 'register' ? 'Registrati' : 'Accedi';
  document.getElementById('auth-subtitle').textContent = window.authMode === 'register' ? 'Crea il tuo account.' : 'Inserisci credenziali.';
  const m = document.getElementById('auth-modal');
  m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeAuthModal = function() {
  const m = document.getElementById('auth-modal');
  m.classList.add('hidden'); m.classList.remove('flex');
};

window.handleAuthSubmit = async function(e) {
  e.preventDefault();
  const uName = document.getElementById('auth-username').value.trim();
  const uPass = document.getElementById('auth-password').value.trim();
  if (!uName || !uPass) return;

  const userKey = uName.toLowerCase();
  if (window.fbRef) {
    try {
      const snap = await Promise.race([window.fbRef.once('value'), new Promise((_, r) => setTimeout(() => r(), 2000))]);
      if (snap && snap.val()) {
        window.dbState = snap.val();
        if (!window.dbState.users) window.dbState.users = {};
        if (!window.dbState.campaigns) window.dbState.campaigns = {};
      }
    } catch (e) {}
  }

  if (userKey === window.ADMIN_CREDENTIALS.username.toLowerCase() && uPass === window.ADMIN_CREDENTIALS.password) {
    if (!window.dbState.users[userKey]) window.dbState.users[userKey] = { username: "admin", password: uPass, characters: [] };
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
    localStorage.setItem('yggdrasill_current_user', userKey);
    window.closeAuthModal(); window.saveDB(); window.enterAfterLogin();
    return;
  }

  if (window.authMode === 'register') {
    if (window.dbState.users[userKey]) { alert("Nome utente già esistente."); return; }
    window.dbState.users[userKey] = { username: uName, password: uPass, characters: [] };
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
    localStorage.setItem('yggdrasill_current_user', userKey);
    window.closeAuthModal(); window.saveDB(); window.enterAfterLogin();
  } else {
    const acc = window.dbState.users[userKey];
    if (!acc || acc.password !== uPass) { alert("Credenziali errate."); return; }
    window.currentUser = userKey;
    localStorage.setItem('yggdrasill_v3_user', userKey);
    localStorage.setItem('yggdrasill_current_user', userKey);
    window.closeAuthModal(); window.enterAfterLogin();
  }
};

window.enterAfterLogin = function() {
  window.enforceMaintenanceCheck();
  if (window.dbState.maintenance && !window.isCurrentUserAdmin()) return;
  const acc = window.dbState.users[window.currentUser];
  if (!acc) return;

  document.getElementById('screen-welcome').classList.add('hidden');
  const adminBtn = document.getElementById('btn-admin-console');
  if (adminBtn) {
    adminBtn.classList.remove('hidden');
    adminBtn.onclick = function() { window.location.href = "admin.html"; };
  }

  if (!acc.characters || acc.characters.length === 0) {
    window.openCharacterBuilder(false);
  } else {
    window.activeCharId = acc.characters[0].id;
    document.getElementById('screen-builder').classList.add('hidden');
    document.getElementById('screen-main').classList.remove('hidden');
    window.switchStandardNav('characters'); window.renderAllViews();
  }
};

window.logoutUser = function() {
  window.currentUser = null;
  localStorage.removeItem('yggdrasill_v3_user');
  localStorage.removeItem('yggdrasill_current_user');
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-welcome').classList.remove('hidden');
  window.enforceMaintenanceCheck();
};

// ============================================================================
// 5. CREAZIONE GUIDATA A SCELTA MULTIPLA (JOURNEY TO RAGNAROK)
// ============================================================================
window.selectedFormAvatar = window.PRESET_AVATARS[0];
window.selectedBuilderClanId = window.JTR_CLANS[0].id;

window.openCharacterBuilder = function(allowCancel) {
  window.selectedFormAvatar = window.PRESET_AVATARS[0];
  window.selectedBuilderClanId = window.JTR_CLANS[0].id;
  document.getElementById('btn-cancel-form').classList.toggle('hidden', !allowCancel);
  document.getElementById('screen-main').classList.add('hidden');
  document.getElementById('screen-builder').classList.remove('hidden');

  // Popola menu a scelta multipla da data.js
  document.getElementById('cf-race').innerHTML = window.JTR_RACES.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
  document.getElementById('cf-class').innerHTML = window.JTR_CLASSES.map(c => `<option value="${c.id}">${c.name} (${c.hitDie})</option>`).join('');
  document.getElementById('cf-bg').innerHTML = window.JTR_BACKGROUNDS.map(b => `<option value="${b.id}">${b.name}</option>`).join('');
  document.getElementById('cf-align').innerHTML = window.JTR_ALIGNMENTS.map(a => `<option value="${a}">${a}</option>`).join('');
  document.getElementById('cf-virtue').innerHTML = window.JTR_VIRTUES.map(v => `<option value="${v}">${v}</option>`).join('');

  // Popola Checkboxes Abilità
  document.getElementById('cf-skills-checkboxes').innerHTML = window.DDB_SKILLS.map(sk => `
    <label class="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 cursor-pointer">
      <input type="checkbox" name="cf-skill" value="${sk.id}" class="accent-sky-400">
      <span class="text-[11px] text-slate-200">${sk.name} <strong class="text-sky-400">(${sk.stat})</strong></span>
    </label>
  `).join('');

  window.renderAvatarSelector();
  window.renderBuilderClans();
  window.renderBuilderClasses();
  window.onBuilderSelectionChange();
};

window.renderAvatarSelector = function() {
  const el = document.getElementById('cf-avatar-selector');
  if (!el) return;
  el.innerHTML = window.PRESET_AVATARS.map(url => `
    <div onclick="window.selectedFormAvatar='${url}'; window.renderAvatarSelector();" class="cursor-pointer rounded-xl overflow-hidden border-2 transition ${window.selectedFormAvatar === url ? 'border-sky-400 scale-105 shadow-[0_0_12px_rgba(56,189,248,0.7)]' : 'border-slate-800 opacity-60 hover:opacity-100'}">
      <img src="${url}" class="w-full h-16 sm:h-20 object-cover" alt="Ritratto Nordico">
    </div>
  `).join('');
};

window.selectedBuilderClassId = (window.JTR_CLASSES && window.JTR_CLASSES[0]) ? window.JTR_CLASSES[0].id : "barbaro";

window.renderBuilderClasses = function() {
  const container = document.getElementById('cf-class-cards-grid');
  if (!container) return;
  const currentClassId = document.getElementById('cf-class')?.value || window.selectedBuilderClassId;

  container.innerHTML = window.JTR_CLASSES.map(cls => {
    const active = currentClassId === cls.id;
    return `
      <div onclick="window.selectBuilderClass('${cls.id}')"
           class="cursor-pointer rounded-xl p-2 border transition text-center flex flex-col items-center justify-between gap-1.5 ${active ? 'bg-sky-950/80 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-[1.02]' : 'bg-slate-950 border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-600'}">
        <img src="${cls.avatar}" class="w-16 h-20 object-contain drop-shadow-md" alt="${cls.name}">
        <div class="w-full">
          <strong class="font-cinzel text-xs text-white block truncate">${cls.name}</strong>
          <span class="text-[10px] text-amber-300 font-bold block">${cls.hitDie}</span>
        </div>
      </div>
    `;
  }).join('');
};

window.selectBuilderClass = function(classId) {
  window.selectedBuilderClassId = classId;
  const sel = document.getElementById('cf-class');
  if (sel) sel.value = classId;
  window.renderBuilderClasses();
  window.onBuilderSelectionChange();
};

window.renderBuilderClans = function() {
  const container = document.getElementById('cf-clan-cards');
  if (!container) return;
  container.innerHTML = window.JTR_CLANS.map(clan => {
    const active = window.selectedBuilderClanId === clan.id;
    return `
      <div onclick="window.selectedBuilderClanId='${clan.id}'; window.renderBuilderClans(); window.recalcBuilderStats();"
           class="cursor-pointer rounded-xl p-3 border transition ${active ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.35)]' : 'bg-slate-950 border-slate-800 opacity-75'}">
        <div class="flex items-center gap-3">
          <img src="${clan.crest}" class="w-10 h-10 object-contain drop-shadow flex-shrink-0" alt="${clan.name}">
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <span class="font-cinzel font-bold text-xs text-white">${clan.name}</span>
              <span class="text-[10px] text-amber-300 font-bold">${clan.bonusText.split(',')[0]}</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-snug">${clan.trait}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.onBuilderSelectionChange = function() {
  const classId = document.getElementById('cf-class').value;
  const lvl = parseInt(document.getElementById('cf-level').value) || 1;
  const bgId = document.getElementById('cf-bg').value;

  const clsObj = window.JTR_CLASSES.find(c => c.id === classId) || window.JTR_CLASSES[0];
  const bgObj = window.JTR_BACKGROUNDS.find(b => b.id === bgId) || window.JTR_BACKGROUNDS[0];

  // Mostra i privilegi della classe selezionata fino al livello scelto e il selettore di Archetipo/Ætt
  let unlockedTraits = [];
  for (let l = 1; l <= lvl; l++) {
    if (clsObj.levelFeatures[l]) unlockedTraits.push(...clsObj.levelFeatures[l].map(f => `[Liv.${l}] ${f}`));
  }

  document.getElementById('cf-class-preview').innerHTML = `
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4">
      <div class="flex flex-col items-center bg-slate-900/80 p-2.5 rounded-xl border border-sky-500/40 shadow-lg flex-shrink-0">
        <img src="${clsObj.avatar}" class="w-24 h-32 object-contain" alt="${clsObj.name}">
        <span class="font-cinzel font-bold text-xs text-amber-300 mt-1">${clsObj.name}</span>
      </div>
      <div class="flex-1 space-y-2.5 w-full">
        <div class="flex flex-wrap justify-between items-center gap-2 border-b border-slate-800 pb-2">
          <div class="flex items-center gap-3 text-xs">
            <span>Dado Vita: <strong class="text-amber-300 font-bold">${clsObj.hitDie}</strong></span>
            <span>Tiri Salvezza: <strong class="text-sky-300 font-bold">${clsObj.saves.join(', ')}</strong></span>
          </div>
        </div>
        <div>
          <label class="text-amber-300 font-bold block mb-1 text-xs">${clsObj.archetypeTitle} (Journey to Ragnarok):</label>
          <select id="cf-subclass" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold text-xs">
            ${clsObj.archetypes.map(a => `<option value="${a}">${a}</option>`).join('')}
          </select>
        </div>
        <div class="text-[11px] text-slate-300 space-y-1 pt-1">
          <span class="text-slate-400 font-semibold block">Privilegi di Classe sbloccati automaticamente:</span>
          ${unlockedTraits.map(t => `<div class="text-sky-200">• ${t}</div>`).join('')}
        </div>
      </div>
    </div>
  `;

  document.getElementById('cf-bg-preview').innerHTML = `
    <strong class="text-amber-300">${bgObj.name}:</strong> ${bgObj.desc} (Competenze consigliate spuntate in automatico: <strong>${bgObj.skills.join(', ').toUpperCase()}</strong>).
  `;

  // Spunta automaticamente le abilità del background scelto
  document.querySelectorAll('input[name="cf-skill"]').forEach(cb => {
    if (bgObj.skills.includes(cb.value)) cb.checked = true;
  });

  window.recalcBuilderStats();
};

window.applyStandardArray = function() {
  const std = { FOR: 15, DES: 13, COS: 14, INT: 10, SAG: 12, CAR: 8 };
  Object.entries(std).forEach(([k, v]) => { document.getElementById('cf-stat-' + k).value = v; });
  window.recalcBuilderStats();
};

window.recalcBuilderStats = function() {
  const raceObj = window.JTR_RACES.find(r => r.id === document.getElementById('cf-race').value) || window.JTR_RACES[0];
  const clsObj = window.JTR_CLASSES.find(c => c.id === document.getElementById('cf-class').value) || window.JTR_CLASSES[0];
  const clanObj = window.JTR_CLANS.find(c => c.id === window.selectedBuilderClanId) || window.JTR_CLANS[0];
  const lvl = parseInt(document.getElementById('cf-level').value) || 1;

  const cosVal = (parseInt(document.getElementById('cf-stat-COS').value) || 10) + (raceObj.bonus.COS || 0) + (clanObj.bonus.COS || 0);
  const desVal = (parseInt(document.getElementById('cf-stat-DES').value) || 10) + (raceObj.bonus.DES || 0) + (clanObj.bonus.DES || 0);
  const cosMod = Math.floor((cosVal - 10) / 2);
  const desMod = Math.floor((desVal - 10) / 2);

  const dieMax = parseInt(clsObj.hitDie.replace('1d', '')) || 8;
  const avgPerLvl = Math.floor(dieMax / 2) + 1;
  const jotunnBonus = clanObj.id === 'jotunn_sons' ? lvl : 0;
  const calcHp = Math.max(lvl, (dieMax + cosMod) + ((lvl - 1) * (avgPerLvl + cosMod)) + jotunnBonus);

  document.getElementById('cf-maxhp').value = calcHp;
  document.getElementById('cf-ac').value = clsObj.baseAc + Math.min(2, Math.max(0, desMod));
  document.getElementById('cf-speed').value = raceObj.speed || '9m';
};

window.handleAvatarFileUpload = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  window.autoFitImageFile(file, 300, 300, url => { window.selectedFormAvatar = url; window.renderAvatarSelector(); });
};

window.cancelCharacterForm = function() {
  document.getElementById('screen-builder').classList.add('hidden');
  document.getElementById('screen-main').classList.remove('hidden');
};

window.saveFullCharacterSheet = function(e) {
  e.preventDefault();
  const raceObj = window.JTR_RACES.find(r => r.id === document.getElementById('cf-race').value) || window.JTR_RACES[0];
  const clsObj = window.JTR_CLASSES.find(c => c.id === document.getElementById('cf-class').value) || window.JTR_CLASSES[0];
  const clanObj = window.JTR_CLANS.find(c => c.id === window.selectedBuilderClanId) || window.JTR_CLANS[0];
  const bgObj = window.JTR_BACKGROUNDS.find(b => b.id === document.getElementById('cf-bg').value) || window.JTR_BACKGROUNDS[0];

  const lvl = parseInt(document.getElementById('cf-level').value) || 1;
  const maxHp = parseInt(document.getElementById('cf-maxhp').value) || 15;
  const subclass = document.getElementById('cf-subclass')?.value || clsObj.archetypes[0];
  const profBonus = lvl >= 17 ? 6 : lvl >= 13 ? 5 : lvl >= 9 ? 4 : lvl >= 5 ? 3 : 2;

  // Statistiche finali comprensive dei bonus di Stirpe e Clan di Midgardr
  const finalStats = {};
  ['FOR', 'DES', 'COS', 'INT', 'SAG', 'CAR'].forEach(st => {
    const base = parseInt(document.getElementById('cf-stat-' + st).value) || 10;
    finalStats[st] = Math.min(20, base + (raceObj.bonus[st] || 0) + (clanObj.bonus[st] || 0));
  });

  const savesMap = {};
  ['FOR', 'DES', 'COS', 'INT', 'SAG', 'CAR'].forEach(st => {
    savesMap[st] = clsObj.saves.includes(st);
  });

  const checkedSkills = Array.from(document.querySelectorAll('input[name="cf-skill"]:checked')).map(cb => cb.value);
  if (clanObj.id === 'odhinns_eye' && !checkedSkills.includes('asatru')) checkedSkills.push('asatru');

  let compiledTraits = [
    clanObj.trait,
    ...raceObj.traits.map(t => `[Stirpe] ${t}`),
    `[Archetipo] ${subclass}`
  ];
  for (let l = 1; l <= lvl; l++) {
    if (clsObj.levelFeatures[l]) {
      compiledTraits.push(...clsObj.levelFeatures[l].map(f => `[Liv.${l}] ${f}`));
    }
  }

  const startingGear = (window.RulesEngine && typeof window.RulesEngine.calculateStartingEquipment === 'function')
    ? window.RulesEngine.calculateStartingEquipment(clsObj.id, bgObj.id, clanObj.id)
    : { gold: 15, items: [] };
  const startingSpells = (window.RulesEngine && typeof window.RulesEngine.getStartingSpells === 'function')
    ? window.RulesEngine.getStartingSpells(clsObj.id)
    : null;

  const newChar = {
    id: 'char_' + Date.now(),
    owner: window.currentUser,
    name: document.getElementById('cf-name').value.trim(),
    race: raceObj.name,
    clan: clanObj.id,
    clanId: clanObj.id,
    clanName: clanObj.name,
    clanCrest: clanObj.crest || "assets/clans/Logo-Bear_Warriors.png",
    clanBanner: clanObj.banner || "assets/clans/OrsiGuerrireri.png",
    clanTrait: clanObj.trait || "",
    clanMotto: clanObj.motto || "",
    classId: clsObj.id,
    className: clsObj.name.split(' (')[0],
    subclass: subclass,
    level: lvl,
    hitDie: clsObj.hitDie,
    background: bgObj.name,
    gold: startingGear.gold || 15,
    alignment: document.getElementById('cf-align').value,
    virtue: document.getElementById('cf-virtue').value,
    avatar: window.selectedFormAvatar || (window.CLASS_FACE_AVATARS && window.CLASS_FACE_AVATARS[clsObj.id]) || "assets/heroes/face_guerriero.jpg",
    fullArt: (window.CLASS_FULL_ARTWORKS && window.CLASS_FULL_ARTWORKS[clsObj.id]) || "assets/heroes/full_guerriero.jpg",
    hp: maxHp,
    maxHp: maxHp,
    ac: parseInt(document.getElementById('cf-ac').value) || 14,
    atkBonus: profBonus,
    speed: document.getElementById('cf-speed').value.trim() || '9m',
    defenses: clanObj.id === 'jotunn_sons' ? 'Resistenza al Freddo Glaciale' : 'Standard dei Nove Mondi',
    inspiration: false,
    condition: 'Normale',
    stats: finalStats,
    saves: savesMap,
    proficientSkills: checkedSkills,
    traits: compiledTraits,
    proficiencies: `Armi e armature di ${clsObj.name.split(' (')[0]}, Lingua Norrena e Runico Futhark`,
    notes: document.getElementById('cf-notes').value.trim() || 'Nessuna nota.',
    cards: (() => {
      const allC = typeof window.getAllCards === "function" ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
      const initCards = [...(startingGear.items || [])];
      if (clanObj.heirloom) {
        initCards.unshift({ ...clanObj.heirloom, id: 'heirloom_' + Date.now() });
      }
      if (startingSpells) {
        const spellNames = [...(startingSpells.spells || []), ...(startingSpells.cantrips || []), ...(startingSpells.runes || [])];
        spellNames.forEach((sName, sIdx) => {
          const found = allC.find(c => c.name.toLowerCase().includes(sName.toLowerCase()) || sName.toLowerCase().includes(c.name.toLowerCase()));
          if (found) {
            initCards.push({ ...found, id: 'spell_init_' + Date.now() + '_' + sIdx });
          }
        });
      }
      return initCards;
    })(),
    spells: startingSpells ? startingSpells.spells : [],
    cantrips: startingSpells ? startingSpells.cantrips : [],
    runes: startingSpells ? startingSpells.runes : []
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
// 6. LEVEL UP COERENTE CON IL MANUALE "JOURNEY TO RAGNAROK" & FORGING ENGINE
// ============================================================================
let currentLevelUpCharId = null;
let computedHpGain = 0;

window.openLevelUpModal = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;

  if (window.ForgeEngine && typeof window.ForgeEngine.openForgeModal === 'function') {
    window.ForgeEngine.openForgeModal(ch, (updatedChar) => {
      delete updatedChar.pendingLevelUp;
      window.propagateCharacterToCampaigns(updatedChar);
      window.saveDB();
      window.renderDdbCharacterSheet();
    });
  }
};

window.closeLevelUpModal = function() {
  const m = document.getElementById('forge-level-modal');
  if (m) m.classList.remove('active');
};

window.chooseLevelUpHpMethod = function(method) {
  const ch = window.getMyCharacter();
  const cosMod = Math.floor(((ch?.stats?.COS || 10) - 10) / 2);
  const dieNum = parseInt((ch?.hitDie || '1d8').replace('1d','')) || 8;

  if (method === 'avg') {
    computedHpGain = Math.max(1, Math.floor(dieNum / 2) + 1 + cosMod);
    document.getElementById('btn-hp-avg').className = "p-2.5 rounded-xl bg-slate-900 border border-sky-400 text-white font-bold text-center";
    document.getElementById('btn-hp-roll').className = "p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-center";
    document.getElementById('lvlup-hp-result').textContent = `Incremento PF (Media): +${computedHpGain}`;
  } else {
    const roll = Math.floor(Math.random() * dieNum) + 1;
    computedHpGain = Math.max(1, roll + cosMod);
    document.getElementById('btn-hp-roll').className = "p-2.5 rounded-xl bg-slate-900 border border-sky-400 text-white font-bold text-center";
    document.getElementById('btn-hp-avg').className = "p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 font-bold text-center";
    document.getElementById('lvlup-hp-result').textContent = `Incremento PF (Tiro d${dieNum}=${roll}): +${computedHpGain}`;
  }
};

window.confirmPlayerLevelUp = function() {
  const ch = window.getMyCharacter();
  if (!ch || ch.id !== currentLevelUpCharId) return;

  const clsObj = window.JTR_CLASSES.find(c => c.id === ch.classId) || window.JTR_CLASSES[0];
  ch.level = (ch.level || 1) + 1;
  ch.maxHp += computedHpGain;
  ch.hp += computedHpGain;
  ch.atkBonus = ch.level >= 17 ? 6 : ch.level >= 13 ? 5 : ch.level >= 9 ? 4 : ch.level >= 5 ? 3 : 2;

  // Aggiungi automaticamente i privilegi del manuale per questo livello
  const unlocked = clsObj.levelFeatures[ch.level] || [];
  if (!ch.traits) ch.traits = [];
  unlocked.forEach(feat => {
    ch.traits.push(`[Liv.${ch.level}] ${feat}`);
  });

  // Se era il livello dell'Archetipo / Ætt
  if (ch.level === clsObj.archetypeLevel) {
    const chosenSub = document.getElementById('lvlup-choice-select').value;
    if (chosenSub) {
      ch.subclass = chosenSub;
      ch.traits.push(`[${clsObj.archetypeTitle}] ${chosenSub}`);
    }
  }

  // Aumento Punteggi Caratteristica (ASI)
  const s1 = document.getElementById('lvlup-stat-1').value;
  const s2 = document.getElementById('lvlup-stat-2').value;
  if (s1 && ch.stats[s1]) ch.stats[s1] = Math.min(20, ch.stats[s1] + 1);
  if (s2 && ch.stats[s2]) ch.stats[s2] = Math.min(20, ch.stats[s2] + 1);

  const manualNote = document.getElementById('lvlup-new-trait').value.trim();
  if (manualNote) ch.traits.push(`[Scelta Liv.${ch.level}] ${manualNote}`);

  delete ch.pendingLevelUp;
  window.propagateCharacterToCampaigns(ch);
  window.closeLevelUpModal();
  window.saveDB();
};

// ============================================================================
// 7. NAVIGAZIONE, CONDIZIONI CON SFONDO REATTIVO E SALTO DIRETTO DALLA CAMPAGNA
// ============================================================================
window.openDdbSectionModal = function() {
  const list = document.getElementById('ddb-section-list');
  const ch = window.getMyCharacter();
  const cards = (ch && ch.cards) || [];

  list.innerHTML = window.DDB_SECTIONS.map((sec, idx) => {
    let countBadge = "";
    if (sec.id === 'actions' || sec.id === 'inventory' || sec.id === 'spells') {
      const cnt = cards.filter(c => window.classifyCardToDdbSection(c) === sec.id).length;
      if (cnt > 0) countBadge = `<span class="ml-auto text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-bold">${cnt}</span>`;
    }
    return `
      <button type="button" onclick="window.selectDdbSection('${sec.id}')" class="ddb-menu-item ${window.activeDdbSection === sec.id ? 'active' : ''}" style="animation-delay: ${idx * 0.03}s">
        <span class="w-5 h-5 flex items-center justify-center shrink-0">${sec.iconSvg || sec.icon || ''}</span>
        <span class="flex-1 font-semibold">${sec.label}</span>
        ${countBadge}
      </button>
    `;
  }).join('');

  const m = document.getElementById('ddb-section-modal');
  m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeDdbSectionModal = function() {
  const m = document.getElementById('ddb-section-modal');
  m.classList.add('hidden'); m.classList.remove('flex');
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

// Cicla tra le 6 condizioni in italiano (Normale, Avvelenato, Stordito, Invisibile, Spaventato, Prono)
window.cycleCharacterCondition = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;
  const conds = ['Normale', 'Avvelenato', 'Stordito', 'Invisibile', 'Spaventato', 'Prono'];
  const current = (ch.condition === 'Normal' ? 'Normale' : ch.condition === 'Stunned' ? 'Stordito' : ch.condition) || 'Normale';
  const idx = conds.indexOf(current);
  ch.condition = conds[(idx + 1) % conds.length];
  window.currentCanvasCondition = ch.condition;
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
};

// Funzione per saltare direttamente da "Le Tue Campagne" al proprio personaggio cliccato
window.jumpToCharacterSheet = function(charId) {
  window.activeCharId = charId;
  window.switchStandardNav('characters');
};

window.switchStandardNav = function(tab) {
  document.getElementById('mode-standard-views').classList.remove('hidden');
  document.getElementById('mode-dm-campaign-workspace').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.add('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.add('hidden');

  const dmView = document.getElementById('view-dm-list');
  const charView = document.getElementById('view-my-characters');
  const campView = document.getElementById('view-my-campaigns');

  dmView.classList.toggle('hidden', tab !== 'dm');
  charView.classList.toggle('hidden', tab !== 'characters');
  campView.classList.toggle('hidden', tab !== 'campaigns');

  // Riattiva animazione minimal di cambio scheda
  const activeEl = tab === 'dm' ? dmView : tab === 'characters' ? charView : campView;
  activeEl.classList.remove('animate-page-switch');
  void activeEl.offsetWidth;
  activeEl.classList.add('animate-page-switch');

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
  const badgeLabel = sec === 'actions' ? 'AZIONE' : sec === 'spells' ? 'MAGIA' : 'INVENTARIO';
  const rarityClass = (card.rarity || 'comune').toLowerCase().replace(/\s+/g, '-');
  const typeClass = (card.type || 'arma').toLowerCase();
  const artUrl = card.img || window.CARD_ARTWORKS[card.type] || window.CARD_ARTWORKS.arma;

  return `
    <div class="ygo-card compact-card type-${typeClass} rarity-${rarityClass} cursor-pointer group" onclick="window.openCardDetailModal('${card.id}')" title="Tocca per visualizzare la descrizione e le statistiche">
      <div class="relative w-full h-full overflow-hidden rounded-lg bg-black">
        <img src="${artUrl}" alt="${card.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">

        <!-- Top Header Overlay -->
        <div class="absolute top-1.5 inset-x-1.5 flex justify-between items-center pointer-events-none">
          <span class="text-[8px] font-cinzel font-bold px-1.5 py-0.5 rounded bg-black/80 text-amber-200 border border-white/10 uppercase tracking-wider backdrop-blur-sm truncate max-w-[68%]">${card.name}</span>
          <span class="text-[7px] font-bold px-1 py-0.5 rounded bg-black/80 text-sky-300 border border-sky-400/30 uppercase backdrop-blur-sm">${badgeLabel}</span>
        </div>

        <!-- Bottom Stat Glass Footer -->
        <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-4 pb-1.5 px-2 flex justify-between items-end">
          <div class="min-w-0 flex-1">
            <span class="text-[8px] font-mono text-slate-300 truncate block">${card.type} • ${card.damage || '—'}</span>
          </div>
          <span class="text-[9px] text-amber-300 font-mono font-bold opacity-90 group-hover:opacity-100 transition ml-1">${card.cost ? '💰 ' + card.cost : ''}</span>
        </div>
      </div>
    </div>
  `;
};

window.openCardDetailModal = function(cardId) {
  window.currentActiveCardModalId = cardId;
  let card = null;
  const ch = window.getMyCharacter();
  if (ch && ch.cards) card = ch.cards.find(c => c.id === cardId);
  if (!card && window.dbState && window.dbState.campaigns) {
    for (const code in window.dbState.campaigns) {
      const camp = window.dbState.campaigns[code];
      if (camp.chest) {
        card = camp.chest.find(c => c.id === cardId);
        if (card) break;
      }
      if (camp.members) {
        for (const uKey in camp.members) {
          const mChar = camp.members[uKey];
          if (mChar && mChar.cards) {
            card = mChar.cards.find(c => c.id === cardId);
            if (card) break;
          }
        }
      }
      if (card) break;
    }
  }
  if (!card) {
    const all = typeof window.getAllCards === "function" ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
    card = all.find(c => c.id === cardId || c.name === cardId);
  }
  if (!card) return;

  const modal = document.getElementById('card-detail-modal');
  if (!modal) return;

  const sec = window.classifyCardToDdbSection(card);
  const badgeLabel = sec === 'actions' ? 'AZIONE & ATTACCO' : sec === 'spells' ? 'MAGIA & RUNA' : 'INVENTARIO';

  document.getElementById('cdm-name').textContent = card.name;
  document.getElementById('cdm-badge').textContent = badgeLabel;
  document.getElementById('cdm-rarity').textContent = (card.rarity || 'Comune').toUpperCase();
  document.getElementById('cdm-type').textContent = `${(card.type || 'oggetto').toUpperCase()} ${card.level !== undefined ? (card.level === 0 ? '• TRUCCHETTO' : `• ${card.level}° CERCHIO`) : ''}`;
  document.getElementById('cdm-img').src = card.img || window.CARD_ARTWORKS[card.type] || window.CARD_ARTWORKS.arma;
  document.getElementById('cdm-dmg').textContent = card.damage || '—';
  const cdmCost = document.getElementById('cdm-cost');
  if (cdmCost) cdmCost.textContent = card.cost || '—';
  document.getElementById('cdm-range').textContent = card.range || (card.weight ? card.weight + ' kg' : 'Mischia (1.5m)');
  document.getElementById('cdm-cast-time').textContent = card.castingTime || (card.type === 'arma' ? '1 Attacco' : '1 Azione');
  document.getElementById('cdm-duration').textContent = card.duration || 'Istantaneo';
  document.getElementById('cdm-components').textContent = card.components || 'Nessuna';
  document.getElementById('cdm-desc').textContent = card.desc || 'Nessuna descrizione disponibile.';

  const rollBtn = document.getElementById('cdm-roll-btn');
  if (rollBtn) {
    if (card.damage && card.damage.includes('d')) {
      rollBtn.classList.remove('hidden');
      rollBtn.onclick = () => {
        if (typeof window.deployCardInCombat === 'function') {
          window.deployCardInCombat(card.id);
          window.closeCardDetailModal();
        }
      };
    } else {
      rollBtn.classList.add('hidden');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};


window.handleCardCustomImageUpload = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const dataUrl = ev.target.result;
    document.getElementById('cdm-img').src = dataUrl;
    
    // Aggiorna l'immagine della carta sul personaggio attuale
    if (window.currentActiveCardModalId) {
      const ch = window.getMyCharacter();
      if (ch && ch.cards) {
        const found = ch.cards.find(c => c.id === window.currentActiveCardModalId);
        if (found) {
          found.img = dataUrl;
          window.propagateCharacterToCampaigns(ch);
          window.saveDB();
          window.renderDdbSectionContent(ch);
        }
      }
    }
  };
  reader.readAsDataURL(file);
};

window.openClanDetailModal = function(clanId) {
  let clan = null;
  const ch = window.getMyCharacter();
  const searchKey = clanId || (ch ? (ch.clanId || ch.clan || ch.clanName) : null);

  if (searchKey) {
    const norm = String(searchKey).toLowerCase().trim();
    clan = (window.JTR_CLANS || []).find(c => 
      c.id.toLowerCase() === norm || 
      c.name.toLowerCase() === norm ||
      c.name.toLowerCase().includes(norm) ||
      norm.includes(c.id.toLowerCase()) ||
      norm.includes(c.name.toLowerCase())
    );
  }
  if (!clan && ch) {
    const allText = `${ch.clanName || ''} ${ch.background || ''} ${ch.name || ''}`.toLowerCase();
    clan = (window.JTR_CLANS || []).find(c => allText.includes(c.id.toLowerCase()) || allText.includes(c.name.toLowerCase()));
  }
  if (!clan && window.JTR_CLANS && window.JTR_CLANS.length > 0) {
    clan = window.JTR_CLANS[0];
  }
  if (!clan) return;

  const modal = document.getElementById('clan-detail-modal');
  if (!modal) return;

  document.getElementById('clm-name').textContent = clan.name;
  document.getElementById('clm-motto').textContent = clan.motto || '';
  document.getElementById('clm-crest').src = clan.crest || 'assets/clans/Logo-Bear_Warriors.png';
  document.getElementById('clm-banner').src = clan.banner || clan.crest || '';
  document.getElementById('clm-desc').textContent = clan.desc || '';
  document.getElementById('clm-vantaggi').textContent = clan.vantaggi || clan.trait || '';
  document.getElementById('clm-svantaggi').textContent = clan.svantaggi || 'Nessun tabù registrato.';
  document.getElementById('clm-amicizie').textContent = clan.amicizie || 'Neutralità con i regni vicini.';
  document.getElementById('clm-odii').textContent = clan.odii || 'Nessun rancore registrato.';

  if (clan.heirloom) {
    document.getElementById('clm-heirloom-img').src = clan.heirloom.img || '';
    document.getElementById('clm-heirloom-name').textContent = clan.heirloom.name || '';
    document.getElementById('clm-heirloom-rarity').textContent = (clan.heirloom.rarity || 'Raro').toUpperCase();
    document.getElementById('clm-heirloom-desc').textContent = clan.heirloom.desc || '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeClanDetailModal = function() {
  const modal = document.getElementById('clan-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.closeCardDetailModal = function() {
  const modal = document.getElementById('card-detail-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
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
  if (!code || !window.dbState.campaigns || !window.dbState.campaigns[code]) { alert("Campagna non trovata."); return; }
  const acc = window.dbState.users[window.currentUser];
  const charObj = (acc.characters || []).find(c => c.id === charId);
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
  const m = document.getElementById('trade-modal'); m.classList.remove('hidden'); m.classList.add('flex');
};

window.closeTradeModal = function() {
  const m = document.getElementById('trade-modal'); m.classList.add('hidden'); m.classList.remove('flex');
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
  window.closeTradeModal(); window.saveDB();
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
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-red-400">INIZIA LA BATTAGLIA</h2><p class="text-xs text-slate-300">Sei stato reindirizzato alla sezione <strong>Azioni e Attacchi</strong>!</p>`;
  } else if (evt.type === 'SHORT_REST') {
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-amber-300">RIPOSO CORTO</h2><p class="text-xs text-slate-300">+25% Punti Ferita recuperati.</p>`;
  } else if (evt.type === 'LONG_REST') {
    box.innerHTML = `<h2 class="font-norse text-3xl font-black text-sky-300">RIPOSO LUNGO</h2><p class="text-xs text-slate-300">Punti Ferita rigenerati al 100%.</p>`;
  } else if (evt.type === 'CARD_DEPLOY') {
    box.innerHTML = `
      <span class="text-xs font-cinzel uppercase text-sky-400">${evt.actor} usa</span>
      <div class="flex justify-center my-2">${window.buildYgoCardHTML(evt.card, false)}</div>
      <div class="norse-panel rounded-xl p-3 grid grid-cols-2 divide-x divide-slate-800">
        <div><span class="text-[10px] text-slate-400 block">Tiro D20</span><span class="font-cinzel font-black text-xl text-sky-300">${evt.hit}</span></div>
        <div><span class="text-[10px] text-slate-400 block">Danno / Effetto</span><span class="font-cinzel font-black text-xl text-red-400">${evt.dmg}</span></div>
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
// 8. RENDERING SCHEDA D&D BEYOND E CAMPAGNE CON BOX CELESTE GHIACCIATO
// ============================================================================
window.renderDdbSectionContent = function(ch) {
  const body = document.getElementById('ddb-section-body');
  if (!body || !ch) return;

  const secObj = window.DDB_SECTIONS.find(s => s.id === window.activeDdbSection) || window.DDB_SECTIONS[0];
  const labelEl = document.getElementById('ddb-active-section-label');
  if (labelEl) labelEl.textContent = secObj.label;
  const iconEl = document.getElementById('ddb-active-section-icon');
  if (iconEl) iconEl.innerHTML = secObj.iconSvg || secObj.icon || '';

  const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
  const saves = ch.saves || {};
  const profBonus = ch.atkBonus || 2;
  const allCards = ch.cards || [];
  const profSkills = ch.proficientSkills || [];

  if (window.activeDdbSection === 'abilities') {
    const statNames = { FOR:'FORZA', DES:'DESTREZZA', COS:'COSTITUZIONE', INT:'INTELLIGENZA', SAG:'SAGGEZZA', CAR:'CARISMA' };
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
        <button type="button" onclick="alert('Tiro Salvezza ${label}: ' + (Math.floor(Math.random()*20)+1 + ${mod}))" class="ddb-save-pill active:scale-95 transition">
          <div class="flex items-center gap-2.5">
            <span class="ddb-prof-dot ${isProf ? 'proficient' : ''}"></span>
            <span class="text-xs font-extrabold text-white tracking-wide">${label}</span>
          </div>
          <span class="ddb-save-val">${modStr}</span>
        </button>
      `;
    }).join('');

    const wisMod = Math.floor(((stats.SAG || 10) - 10) / 2) + (profSkills.includes('percezione') ? profBonus : 0);
    const intMod = Math.floor(((stats.INT || 10) - 10) / 2) + (profSkills.includes('indagare') ? profBonus : 0);

    body.innerHTML = `
      <div class="grid grid-cols-3 gap-2.5">${abilitiesHTML}</div>
      <div class="pt-2 space-y-2">
        <h3 class="text-base font-extrabold text-white">Tiri Salvezza (Bonus Competenza +${profBonus})</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">${savesHTML}</div>
      </div>
      <div class="pt-2 space-y-2">
        <h3 class="text-base font-extrabold text-white">Sensi</h3>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="ddb-save-pill"><span>Percezione Passiva</span><span class="ddb-save-val">${10 + wisMod}</span></div>
          <div class="ddb-save-pill"><span>Indagare Passivo</span><span class="ddb-save-val">${10 + intMod}</span></div>
        </div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'skills') {
    body.innerHTML = `
      <div class="space-y-2">
        ${window.DDB_SKILLS.map(sk => {
          const isProf = profSkills.includes(sk.id);
          const mod = Math.floor(((stats[sk.stat] || 10) - 10) / 2) + (isProf ? profBonus : 0);
          const mStr = mod >= 0 ? `+${mod}` : `${mod}`;
          return `
            <button type="button" onclick="alert('Abilità ${sk.name}: ' + (Math.floor(Math.random()*20)+1 +${mod}))" class="ddb-save-pill w-full">
              <div class="flex items-center gap-2.5">
                <span class="ddb-prof-dot ${isProf ? 'proficient' : ''}"></span>
                <span class="text-[10px] font-bold text-slate-400 w-8">${sk.stat}</span>
                <span class="text-xs font-bold ${sk.id === 'asatru' ? 'text-amber-300' : 'text-white'}">${sk.name}</span>
              </div>
              <span class="ddb-save-val">${mStr}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'actions' || window.activeDdbSection === 'inventory' || window.activeDdbSection === 'spells') {
    const sectionCards = allCards.filter(c => window.classifyCardToDdbSection(c) === window.activeDdbSection);
    body.innerHTML = sectionCards.length === 0
      ? `<div class="ddb-top-card rounded-2xl p-6 text-center text-xs text-slate-400">Nessuna carta in <strong>${secObj.label}</strong>. Il Dungeon Master ti assegnerà equipaggiamenti, rune e incantesimi!</div>`
      : `<div class="cards-flow-grid py-2 px-1">${sectionCards.map(c => window.buildYgoCardHTML(c, true)).join('')}</div>`;
    return;
  }

  if (window.activeDdbSection === 'defenses') {
    body.innerHTML = `
      <div class="ddb-top-card rounded-2xl p-4 space-y-2 text-xs">
        <div class="flex justify-between border-b border-slate-800 pb-2"><span class="text-slate-400">Velocità di Movimento</span><strong class="text-white">${ch.speed || '9m'}</strong></div>
        <div class="flex justify-between border-b border-slate-800 pb-2"><span class="text-slate-400">Condizione Attiva</span><strong class="text-amber-300">${ch.condition || 'Normale'}</strong></div>
        <div><span class="text-slate-400 block mb-1">Difese e Resistenze</span><p class="text-white font-semibold">${ch.defenses || 'Nessuna'}</p></div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'features') {
    body.innerHTML = `<div class="space-y-2 text-xs">${(ch.traits || []).map(t => `<div class="ddb-top-card p-3.5 rounded-xl text-slate-200">${t}</div>`).join('')}</div>`;
    return;
  }

  const infoMap = {
    proficiencies: ch.proficiencies || 'Competenze standard',
    background: `Clan di Midgardr: ${ch.clanName || 'Guerrieri dell\'Orso'}\nBackground: ${ch.background || 'Vikingr'}\nAllineamento: ${ch.alignment || 'Legale Onorevole'}\nVirtù Guida: ${ch.virtue || 'Onore'}`,
    notes: ch.notes || 'Nessuna nota.',
    creatures: ch.notes || 'Nessuna creatura registrata.'
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
    // Sincronizza la condizione del personaggio con lo sfondo Canvas
    const normCond = (ch.condition === 'Normal' ? 'Normale' : ch.condition === 'Stunned' ? 'Stordito' : ch.condition) || 'Normale';
    ch.condition = normCond;
    window.currentCanvasCondition = normCond;

    document.getElementById('char-picker').innerHTML = chars.map(c => `<option value="${c.id}" ${c.id === ch.id ? 'selected' : ''}>${c.name} (${c.className} Liv.${c.level || 1})</option>`).join('');
    document.getElementById('sheet-name').textContent = ch.name;
    document.getElementById('sheet-race-class').textContent = `${ch.clanName ? ch.clanName.split(' (')[0] + ' • ' : ''}${ch.className} ${ch.subclass ? '('+ch.subclass.split(' (')[0]+')' : ''} • Liv. ${ch.level || 1}`;
    document.getElementById('sheet-avatar').src = ch.avatar;

    const inspBtn = document.getElementById('sheet-insp-badge');
    if (inspBtn) inspBtn.className = ch.inspiration ? 'ddb-insp-btn active' : 'ddb-insp-btn';

    const condBtn = document.getElementById('sheet-condition-btn');
    const condLabel = document.getElementById('sheet-cond-label');
    if (condLabel) {
      condLabel.textContent = normCond.toUpperCase();
      condLabel.className = normCond !== 'Normale' ? 'text-rose-400 font-black' : 'text-amber-400 font-bold';
    } else if (condBtn) {
      condBtn.textContent = normCond !== 'Normale' ? `• ${normCond.toUpperCase()}` : 'CONDIZIONI';
    }

    let activeCamp = null;
    Object.values(window.dbState.campaigns || {}).forEach(camp => {
      if (camp.members && camp.members[window.currentUser] && camp.members[window.currentUser].id === ch.id) activeCamp = camp;
    });
    document.getElementById('sheet-camp-badge').textContent = activeCamp ? `Saga: ${activeCamp.title}` : `Virtù: ${ch.virtue || 'Onore'}`;

    const lvlBanner = document.getElementById('pending-levelup-banner');
    if (lvlBanner) lvlBanner.classList.toggle('hidden', !ch.pendingLevelUp);

    const pct = Math.round((ch.hp / ch.maxHp) * 100);
    const hpBarEl = document.getElementById('sheet-hp-bar');
    const hpLabelEl = document.getElementById('sheet-hp-label');
    hpLabelEl.textContent = `${ch.hp} / ${ch.maxHp}`;
    hpBarEl.style.width = `${pct}%`;

    // Calcolo Dinamico Colore HP: Verde Brillante (100%) -> Ambra (50%) -> Rosso -> Rosso Scuro Sangue (1 HP)
    function computeHpColor(hp, maxHp) {
      if (hp <= 0) return '#3f0c0c';
      const ratio = Math.max(0, Math.min(1, hp / maxHp));
      let r, g, b;
      if (ratio >= 0.5) {
        const factor = (ratio - 0.5) / 0.5; // 1 a 100%, 0 a 50%
        r = Math.round(234 + factor * (16 - 234));
        g = Math.round(179 + factor * (185 - 179));
        b = Math.round(8 + factor * (129 - 8));
      } else {
        const factor = ratio / 0.5; // 1 a 50%, 0 a 0%
        r = Math.round(110 + factor * (234 - 110));
        g = Math.round(15 + factor * (179 - 15));
        b = Math.round(15 + factor * (8 - 15));
      }
      return `rgb(${r}, ${g}, ${b})`;
    }
    const curHpColor = computeHpColor(ch.hp, ch.maxHp);
    hpBarEl.style.background = curHpColor;
    hpBarEl.style.boxShadow = (ch.hp / ch.maxHp) > 0.5 ? '0 0 10px rgba(16,185,129,0.4)' : '0 0 12px rgba(185,28,28,0.7)';
    hpLabelEl.style.color = curHpColor;

    const desMod = Math.floor(((ch.stats?.DES || 10) - 10) / 2);
    document.getElementById('sheet-ac').textContent = ch.ac || 14;
    document.getElementById('sheet-init').textContent = desMod >= 0 ? `+${desMod}` : desMod;
    const speedEl = document.getElementById('sheet-speed');
    if (speedEl) speedEl.textContent = ch.speed || '9m';

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

    // Aggiorna colonna destra desktop (Crest Clan, Nome e Tratto)
    const clanCrestEl = document.getElementById('sheet-clan-crest');
    const clanNameEl = document.getElementById('sheet-clan-name');
    const clanTraitEl = document.getElementById('sheet-clan-trait');

    const matchedClan = (window.JTR_CLANS || []).find(c =>
      (ch.clanId && c.id === ch.clanId) ||
      (ch.clan && c.id === ch.clan) ||
      (ch.clanName && (c.name.toLowerCase() === ch.clanName.toLowerCase() || c.name.toLowerCase().includes(ch.clanName.toLowerCase()) || ch.clanName.toLowerCase().includes(c.id)))
    ) || window.JTR_CLANS[0];

    if (clanCrestEl) clanCrestEl.src = (matchedClan && matchedClan.crest) || ch.clanCrest || 'assets/clans/Logo-Bear_Warriors.png';
    if (clanNameEl) clanNameEl.textContent = (matchedClan && matchedClan.name) || ch.clanName || 'Midgardr';
    if (clanTraitEl) clanTraitEl.textContent = (matchedClan && matchedClan.trait) || ch.clanTrait || 'Stirpe degli Uomini dei Nove Mondi.';

    window.renderDdbSectionContent(ch);
  }

  

  document.getElementById('join-char-select').innerHTML = chars.map(c => `<option value="${c.id}">${c.name} (${c.className} Liv.${c.level || 1})</option>`).join('');

  // RENDER "LE TUE CAMPAGNE": Evidenzia il tuo personaggio con il riquadro celeste ghiacciato e rendilo cliccabile!
  const myJoinedCamps = Object.values(window.dbState.campaigns || {}).filter(camp => camp.members && camp.members[window.currentUser]);
  document.getElementById('my-joined-campaigns-list').innerHTML = myJoinedCamps.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 text-center">Non fai parte di nessuna campagna. Inserisci il codice qui sopra!</div>`
    : myJoinedCamps.map(camp => {
        const membersEntries = Object.entries(camp.members || {});
        return `
          <div class="norse-panel rounded-2xl p-4 space-y-3 border border-sky-500/30">
            <div class="flex flex-wrap justify-between items-center border-b border-slate-800 pb-2 gap-2">
              <div>
                <span class="text-[10px] text-sky-400 font-bold uppercase">Codice Sala: ${camp.code}</span>
                <h4 class="font-cinzel font-bold text-base text-white">${camp.title}</h4>
              </div>
              <div class="flex items-center gap-2">
                <a href="mappa.html?camp=${encodeURIComponent(camp.code)}&role=PLAYER" target="_blank"
                   class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black text-xs shadow-md flex items-center gap-1.5 transition">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                  MAPPA TATTICA
                </a>
                <span class="text-[10px] text-slate-400 font-mono">${membersEntries.length} Eroi</span>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${membersEntries.map(([uKey, f]) => {
                const isMe = (uKey === window.currentUser);
                return `
                  <div ${isMe ? `onclick="window.jumpToCharacterSheet('${f.id}')"` : ''}
                       class="${isMe ? 'my-campaign-hero-card' : 'bg-slate-950 border border-slate-800'} p-3 rounded-xl flex items-center justify-between gap-2.5">
                    <div class="flex items-center gap-2.5">
                      <img src="${f.avatar}" class="w-10 h-10 rounded-lg object-cover border ${isMe ? 'border-sky-300' : 'border-slate-700'}">
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-xs text-white">${f.name}</span>${isMe ? `<span class="text-[9px] px-1.5 py-0.5 rounded bg-sky-400 text-slate-950 font-extrabold uppercase">TU • APRI SCHEDA</span>` : ''}
                        </div>
                        <span class="text-[10px] ${isMe ? 'text-sky-200' : 'text-slate-400'} block">Liv. ${f.level || 1} • ${f.className} • ${f.hp}/${f.maxHp} PF</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
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
