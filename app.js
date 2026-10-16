// Fallback difensivi globali per garantire resilienza all'interfaccia e alle sezioni
if (typeof window.classifyCardToDdbSection !== 'function') {
  window.classifyCardToDdbSection = function(card) {
    if (!card) return "inventory";
    const t = (card.type || "").toLowerCase().trim();
    if (t === "arma" || t === "attacco" || t === "azione") return "actions";
    if (t === "incantesimo" || t === "magia" || t === "runa") return "spells";
    return "inventory";
  };
}

if (typeof window.autoFitImageFile !== 'function') {
  window.autoFitImageFile = function(file, targetW, targetH, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const img = new Image();
      img.onload = function() {
        const c = document.createElement("canvas");
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext("2d");
        const imgR = img.width / img.height;
        const targetR = targetW / targetH;
        let dW, dH, oX, oY;
        if (imgR > targetR) {
          dH = targetH;
          dW = img.width * (targetH / img.height);
          oX = (targetW - dW) / 2;
          oY = 0;
        } else {
          dW = targetW;
          dH = img.height * (targetW / img.width);
          oX = 0;
          oY = (targetH - dH) / 2;
        }
        ctx.fillStyle = "#090d12";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, oX, oY, dW, dH);
        callback(c.toDataURL("image/jpeg", 0.82));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
}

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
      <div onclick="window.selectBuilderClan('${clan.id}')"
           class="cursor-pointer rounded-xl p-3 border transition ${active ? 'bg-sky-950/90 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-[1.02]' : 'bg-slate-950 border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-700'}">
        <div class="flex items-center gap-3">
          <img src="${clan.crest}" class="w-10 h-10 object-contain drop-shadow flex-shrink-0" alt="${clan.name}">
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-center">
              <span class="font-cinzel font-bold text-xs ${active ? 'text-sky-300' : 'text-white'}">${clan.name}</span>
              <span class="text-[10px] text-amber-300 font-bold">${clan.bonusText.split(',')[0]}</span>
            </div>
            <p class="text-[10px] text-slate-400 mt-0.5 leading-snug">${clan.trait}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.selectBuilderClan = function(clanId) {
  window.selectedBuilderClanId = clanId;
  const cfClan = document.getElementById('cf-clan');
  if (cfClan) cfClan.value = clanId;
  window.renderBuilderClans();
  window.recalcBuilderStats();
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
  const selClanKey = document.getElementById('cf-clan')?.value || window.selectedBuilderClanId;
  const clanObj = (typeof window.resolveClan === 'function' ? window.resolveClan(selClanKey) : null) || window.JTR_CLANS[0];
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
  const chosenClanKey = document.getElementById('cf-clan')?.value || window.selectedBuilderClanId;
  const clanObj = (typeof window.resolveClan === 'function' ? window.resolveClan(chosenClanKey) : null) || window.JTR_CLANS.find(c => c.id === chosenClanKey) || window.JTR_CLANS[0];
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
      const initCards = [];

      // 1. Cimelio Sacro del Clan di Midgardr (con record completo del compendio)
      if (clanObj.heirloom) {
        const foundH = allC.find(c => c.id === clanObj.heirloom.id || c.name.toLowerCase() === clanObj.heirloom.name.toLowerCase());
        const baseH = foundH ? { ...foundH } : { ...clanObj.heirloom };
        initCards.push({
          ...baseH,
          id: 'heirloom_' + Date.now(),
          canonicalId: (foundH && foundH.id) || clanObj.heirloom.id
        });
      }

      // 2. Equipaggiamento e Armi Iniziali di Classe e Background collegati al Database
      if (startingGear && startingGear.items) {
        startingGear.items.forEach((it, idx) => {
          if ((it.name || '').toLowerCase().includes('[cimelio')) return; // Evita doppioni del cimelio di clan
          const resolved = (typeof window.resolveDatabaseCardForItem === 'function')
            ? window.resolveDatabaseCardForItem(it, allC)
            : { ...it, id: 'item_' + Date.now() + '_' + idx };
          if (resolved) initCards.push(resolved);
        });
      }

      // 3. Incantesimi, Trucchetti e Rune Iniziali
      if (startingSpells) {
        const spellNames = [...(startingSpells.spells || []), ...(startingSpells.cantrips || []), ...(startingSpells.runes || [])];
        spellNames.forEach((sName, sIdx) => {
          const found = allC.find(c => c.name.toLowerCase().includes(sName.toLowerCase()) || sName.toLowerCase().includes(c.name.toLowerCase()));
          if (found) {
            initCards.push({ ...found, id: 'spell_init_' + Date.now() + '_' + sIdx, canonicalId: found.id });
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
  if (ch && ch.cards) card = ch.cards.find(c => c.id === cardId || (c.name && c.name.toLowerCase() === String(cardId).toLowerCase()));
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
  const ch = window.getMyCharacter();
  const target = clanId || (ch ? (ch.clanId || ch.clan || ch.clanName) : null) || ch;
  const clan = (typeof window.resolveClan === 'function' ? window.resolveClan(target) : null) || (window.JTR_CLANS && window.JTR_CLANS[0]);
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
    // Auto-idratazione e collegamento una tantum per carte prive di ID o dati
    if (ch.cards && ch.cards.length > 0) {
      const allDb = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
      let changed = false;
      ch.cards.forEach((c, idx) => {
        if (!c.id || c.id === 'undefined') {
          c.id = 'card_inst_' + Date.now() + '_' + idx;
          changed = true;
        }
        if (!c._hydrated) {
          if (typeof window.resolveDatabaseCardForItem === 'function') {
            const matched = window.resolveDatabaseCardForItem(c, allDb);
            if (matched) {
              c.name = c.name || matched.name;
              c.type = c.type || matched.type;
              c.rarity = c.rarity || matched.rarity;
              if (matched.damage && matched.damage !== '—') c.damage = matched.damage;
              if (matched.cost) c.cost = matched.cost;
              if (matched.range) c.range = matched.range;
              if (matched.weight !== undefined) c.weight = matched.weight;
              if (matched.img) c.img = matched.img;
              if (matched.desc) c.desc = matched.desc;
              c.canonicalId = matched.canonicalId || matched.id;
            }
          }
          c._hydrated = true;
          changed = true;
        }
      });
      if (changed) {
        try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch (e) {}
        if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch (e) {} }
      }
    }

    const currentCards = ch.cards || [];

    // ========================================================================
    // 1. SEZIONE AZIONI ED ATTACCHI (ARMI & MANOVRE)
    // ========================================================================
    if (window.activeDdbSection === 'actions') {
      const actionCards = currentCards.filter(c => window.classifyCardToDdbSection(c) === 'actions');
      body.innerHTML = actionCards.length === 0
        ? `<div class="ddb-top-card rounded-2xl p-6 text-center text-xs text-slate-400">Nessuna arma o azione disponibile. Il DM o la Forgia possono assegnarti armi e attacchi leggendari!</div>`
        : `<div class="cards-flow-grid py-2 px-1">${actionCards.map(c => window.buildYgoCardHTML(c, true)).join('')}</div>`;
      return;
    }

    // ========================================================================
    // 2. SEZIONE INVENTARIO CON 4 SLOT ARMATURA (ELMO, BUSTO, GAMBE, PIEDI)
    // ========================================================================
    if (window.activeDdbSection === 'inventory') {
      if (!ch.equippedArmor) {
        ch.equippedArmor = { head: null, chest: null, legs: null, feet: null };
      }
      if (typeof window.recalculateCharacterAC === 'function') {
        window.recalculateCharacterAC(ch);
      }

      const activeCamp = window.dbState.campaigns && Object.values(window.dbState.campaigns).find(c => c.members && c.members[window.currentUser]);
      const marketCount = (activeCamp && activeCamp.market && activeCamp.market.length) || 0;
      const myGold = ch.gold !== undefined ? ch.gold : 50;

      const armorSlotDefs = [
        { key: 'head', name: 'Elmo (Testa)', icon: '🪖', desc: 'Protezione cranica, corone o spangenhelm' },
        { key: 'chest', name: 'Busto (Corazza)', icon: '🛡️', desc: 'Corazza di scaglie, piastre o cuoio' },
        { key: 'legs', name: 'Gambe (Schinieri)', icon: '👖', desc: 'Schinieri d\'acciaio, bronzo o pelliccia' },
        { key: 'feet', name: 'Piedi (Stivali)', icon: '👢', desc: 'Stivali delle terre d\'inverno o falcate' }
      ];

      const slotsHTML = armorSlotDefs.map(def => {
        const eqCardRef = ch.equippedArmor[def.key];
        let eqCard = null;
        if (eqCardRef) {
          eqCard = currentCards.find(c => c.id === eqCardRef || c.canonicalId === eqCardRef) || (typeof eqCardRef === 'object' ? eqCardRef : null);
        }

        if (eqCard) {
          const art = eqCard.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[eqCard.type]) || 'assets/items/spada_ulfberht.jpg';
          return `
            <div class="norse-panel rounded-xl p-3 border-2 border-emerald-500/50 bg-slate-950/80 space-y-2 flex flex-col justify-between shadow-lg relative group">
              <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span class="text-[10px] font-cinzel font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span>${def.icon}</span> ${def.name}
                </span>
                <span class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 uppercase">INDOSSATO</span>
              </div>
              <div class="flex items-center gap-2.5">
                <img src="${art}" onclick="window.openCardDetailModal('${eqCard.id || eqCard.canonicalId}')" class="w-12 h-16 rounded-lg object-cover border border-emerald-400/60 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
                <div class="min-w-0 flex-1 space-y-0.5">
                  <h4 class="font-cinzel font-bold text-xs text-white truncate cursor-pointer hover:text-amber-300" onclick="window.openCardDetailModal('${eqCard.id || eqCard.canonicalId}')">${eqCard.name}</h4>
                  <p class="text-[10px] text-amber-300 font-mono font-bold">${eqCard.damage || '+1 CA'}</p>
                  <p class="text-[9px] text-slate-400 truncate">${eqCard.rarity || 'Comune'}</p>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800/80">
                <button type="button" onclick="window.openCardDetailModal('${eqCard.id || eqCard.canonicalId}')" class="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-cinzel font-bold border border-slate-700 text-center">
                  🔍 Dettagli
                </button>
                <button type="button" onclick="window.unequipArmorSlot('${def.key}')" class="py-1 px-2 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-[10px] font-cinzel font-bold text-center">
                  ✖️ Togli
                </button>
              </div>
            </div>
          `;
        } else {
          return `
            <div onclick="window.openArmorSlotPickerModal('${def.key}')" class="norse-panel rounded-xl p-3 border-2 border-dashed border-slate-700 hover:border-amber-400/80 bg-slate-950/40 space-y-2 flex flex-col justify-between cursor-pointer group transition duration-200">
              <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span class="text-[10px] font-cinzel font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300 flex items-center gap-1.5">
                  <span>${def.icon}</span> ${def.name}
                </span>
                <span class="text-[9px] text-slate-500 font-mono">VUOTO</span>
              </div>
              <div class="py-3 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 group-hover:text-slate-200">
                <div class="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 transition font-bold text-base">+</div>
                <span class="text-[10px] font-bold">Equipaggia da Inventario</span>
              </div>
              <p class="text-[9px] text-slate-500 text-center truncate">${def.desc}</p>
            </div>
          `;
        }
      }).join('');

      const invCards = currentCards.filter(c => window.classifyCardToDdbSection(c) === 'inventory');

      body.innerHTML = `
        <div class="space-y-4 animate-section-fade text-xs">
          <!-- 4 SLOT ARMATURA DEDICATI -->
          <div class="norse-panel norse-border-gold rounded-2xl p-4 space-y-3 shadow-xl">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">🛡️</span>
                <div>
                  <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Slot Armatura & Protezione Corporea</h3>
                  <p class="text-[10px] text-slate-400">Seleziona le carte dal tuo inventario per equipaggiarle nei 4 slot e aggiornare la tua Classe Armatura (CA: <strong class="text-white">${ch.ac || 14}</strong>).</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/40 text-[10px] font-mono text-amber-300 font-bold">4 Slot Disponibili</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              ${slotsHTML}
            </div>
          </div>

          <!-- BANNER VALUTA & BAZAR COMMERCIO -->
          <div class="norse-panel rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 border border-amber-500/40 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950 shadow-lg">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-xl shrink-0">💰</div>
              <div>
                <span class="text-[10px] font-cinzel uppercase text-slate-400 block font-bold">Patrimonio del Guerriero (Hacksilver)</span>
                <strong class="font-mono text-sm text-amber-300">${myGold} Monete d'Oro (mo)</strong>
              </div>
            </div>
            <button type="button" onclick="window.openPlayerMarketModal()" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-xs transition flex items-center gap-1.5 shadow-md">
              🛒 Visita Bazar del DM (${marketCount} merci)
            </button>
          </div>

          <!-- TUTTI GLI OGGETTI & RELIQUIE NELL'INVENTARIO -->
          <div class="space-y-2">
            <div class="flex items-center justify-between px-1">
              <h4 class="font-cinzel font-bold text-xs text-sky-300 uppercase tracking-wider">Tutte le Merci &amp; Oggetti nell'Inventario (${invCards.length})</h4>
              <span class="text-[10px] text-slate-400">Clicca su una carta per ispezionarla</span>
            </div>
            ${invCards.length === 0
              ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400">Nessun oggetto nell'inventario. Visita il Bazar del DM o apri le casse del dungeon!</div>`
              : `<div class="cards-flow-grid py-2 px-1">
                  ${invCards.map(c => {
                    let equippedBadge = '';
                    const equippedSlotKey = Object.keys(ch.equippedArmor || {}).find(k => ch.equippedArmor[k] === c.id || ch.equippedArmor[k] === c.canonicalId);
                    if (equippedSlotKey) {
                      const slotLabel = equippedSlotKey === 'head' ? 'Elmo' : equippedSlotKey === 'chest' ? 'Busto' : equippedSlotKey === 'legs' ? 'Gambe' : 'Piedi';
                      equippedBadge = `<div class="mb-1 text-center"><span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-bold text-[9px] uppercase tracking-wider">🛡️ INDOSSATO [${slotLabel}]</span></div>`;
                    }
                    return `<div class="flex flex-col">${equippedBadge}${window.buildYgoCardHTML(c, true)}</div>`;
                  }).join('')}
                </div>`
            }
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // 3. SEZIONE INCANTESIMI & RUNE CON SISTEMA INCANTESIMI ATTIVI / PREPARATI
    // ========================================================================
    if (window.activeDdbSection === 'spells') {
      if (!ch.preparedSpells) ch.preparedSpells = [];

      // Calcolo abilità da incantatore
      const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
      const intMod = Math.floor(((stats.INT || 10) - 10) / 2);
      const sagMod = Math.floor(((stats.SAG || 10) - 10) / 2);
      const carMod = Math.floor(((stats.CAR || 10) - 10) / 2);

      const cls = (ch.className || '').toLowerCase();
      let spellMod = intMod;
      if (cls.includes('chieric') || cls.includes('gothi') || cls.includes('druid') || cls.includes('ranger')) {
        spellMod = sagMod;
      } else if (cls.includes('bard') || cls.includes('skald') || cls.includes('stregon') || cls.includes('warlock') || cls.includes('paladin')) {
        spellMod = carMod;
      } else {
        spellMod = Math.max(intMod, sagMod, carMod);
      }
      const maxPrepared = Math.max(1, (ch.level || 1) + Math.max(0, spellMod));

      const allSpells = currentCards.filter(c => window.classifyCardToDdbSection(c) === 'spells');

      const isCantrip = (c) => {
        const typeStr = (c.type || '').toLowerCase();
        const nameStr = (c.name || '').toLowerCase();
        const descStr = (c.desc || '').toLowerCase();
        return c.level === 0 || typeStr.includes('trucchetto') || nameStr.includes('trucchetto') || nameStr.includes('runa minore') || descStr.includes('trucchetto');
      };

      const cantrips = allSpells.filter(isCantrip);
      const leveledSpells = allSpells.filter(c => !isCantrip(c));

      const isPrepared = (c) => ch.preparedSpells.includes(c.id) || (c.canonicalId && ch.preparedSpells.includes(c.canonicalId));
      const preparedList = leveledSpells.filter(isPrepared);
      const unpreparedList = leveledSpells.filter(c => !isPrepared(c));

      body.innerHTML = `
        <div class="space-y-4 animate-section-fade text-xs">
          <!-- BANNER GESTIONE INCANTESIMI PREPARATI -->
          <div class="norse-panel norse-border-gold rounded-2xl p-4 space-y-2.5 shadow-xl">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2">
              <div class="flex items-center gap-2.5">
                <span class="text-2xl">⚡</span>
                <div>
                  <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Incantesimi & Rune Preparate per il Combattimento</h3>
                  <p class="text-[10px] text-slate-400">Un incantatore non può lanciare magie a casaccio: seleziona gli incantesimi attivi dal tuo Grimorio. I Trucchetti e le Rune Minori sono sempre pronti.</p>
                </div>
              </div>
              <div class="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 flex items-center gap-2 shadow">
                <span class="text-[10px] font-cinzel font-bold text-slate-300">Preparati:</span>
                <strong class="font-mono text-sm text-amber-300 font-bold">${preparedList.length} / ${maxPrepared}</strong>
              </div>
            </div>
            <div class="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>Capacità di Preparazione: Livello (${ch.level || 1}) + Mod. Incantatore (${spellMod >= 0 ? '+' + spellMod : spellMod}) = <strong>${maxPrepared} incantesimi attivi</strong></span>
              <span class="${preparedList.length >= maxPrepared ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
                ${preparedList.length >= maxPrepared ? '⚠️ Massimo raggiunto' : `${maxPrepared - preparedList.length} slot liberi`}
              </span>
            </div>
          </div>

          <!-- SEZIONE 1: INCANTESIMI ATTIVI (TRUCCHETTI + PREPARATI) -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between px-1">
              <h4 class="font-cinzel font-bold text-xs text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔥</span> Incantesimi &amp; Rune Attivi (Pronti al Lancio) [${cantrips.length + preparedList.length}]
              </h4>
              <span class="text-[10px] text-slate-400">Clicca "Lancia Incantesimo" per scatenare la magia</span>
            </div>

            ${(cantrips.length + preparedList.length) === 0
              ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400">Nessun incantesimo attivo. Prepara le tue magie dal Grimorio sottostante!</div>`
              : `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${cantrips.map(c => `
                    <div class="norse-panel rounded-xl p-3 border border-sky-400/50 bg-slate-950/80 flex gap-3 items-center shadow-lg">
                      <img src="${c.img || window.CARD_ARTWORKS.incantesimo}" onclick="window.openCardDetailModal('${c.id}')" class="w-14 h-20 rounded-lg object-cover border border-sky-400 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
                      <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex justify-between items-start">
                          <h4 class="font-cinzel font-bold text-xs text-sky-200 truncate cursor-pointer hover:text-white" onclick="window.openCardDetailModal('${c.id}')">${c.name}</h4>
                          <span class="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 border border-sky-400 font-bold uppercase">TRUCCHETTO</span>
                        </div>
                        <p class="text-[10px] text-amber-300 font-mono font-bold">${c.damage || '1d10 o Effetto'}</p>
                        <p class="text-[9px] text-slate-400 line-clamp-1">${c.desc || ''}</p>
                        <div class="pt-1 flex gap-2">
                          <button type="button" onclick="window.castSpell('${c.id}')" class="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-cinzel font-bold text-[10px] shadow transition">
                            ✨ Lancia Magia
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}

                  ${preparedList.map(c => `
                    <div class="norse-panel rounded-xl p-3 border-2 border-amber-400/70 bg-slate-950/90 flex gap-3 items-center shadow-[0_0_15px_rgba(245,208,118,0.2)]">
                      <img src="${c.img || window.CARD_ARTWORKS.incantesimo}" onclick="window.openCardDetailModal('${c.id}')" class="w-14 h-20 rounded-lg object-cover border border-amber-400 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
                      <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex justify-between items-start">
                          <h4 class="font-cinzel font-bold text-xs text-amber-200 truncate cursor-pointer hover:text-white" onclick="window.openCardDetailModal('${c.id}')">${c.name}</h4>
                          <span class="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400 font-bold uppercase">⚡ PREPARATO</span>
                        </div>
                        <p class="text-[10px] text-amber-300 font-mono font-bold">${c.damage || 'Effetto Magico'}</p>
                        <p class="text-[9px] text-slate-400 line-clamp-1">${c.desc || ''}</p>
                        <div class="pt-1 flex gap-2">
                          <button type="button" onclick="window.castSpell('${c.id}')" class="flex-1 py-1 px-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-[10px] shadow transition">
                            ✨ Lancia Magia
                          </button>
                          <button type="button" onclick="window.togglePrepareSpell('${c.id}')" class="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-cinzel font-bold border border-slate-700">
                            Disattiva
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>`
            }
          </div>

          <!-- SEZIONE 2: GRIMORIO COMPLETO / RUNE NON PREPARATE -->
          <div class="space-y-2.5 pt-2">
            <div class="flex items-center justify-between px-1 border-t border-slate-800 pt-3">
              <h4 class="font-cinzel font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>📜</span> Grimorio &amp; Rune Apprese (Inattive) [${unpreparedList.length}]
              </h4>
              <span class="text-[10px] text-slate-400">Clicca "Prepara" per renderle attive in battaglia</span>
            </div>

            ${unpreparedList.length === 0
              ? `<div class="norse-panel rounded-2xl p-4 text-center text-xs text-slate-400">Tutti gli incantesimi del tuo Grimorio sono attualmente preparati!</div>`
              : `<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  ${unpreparedList.map(c => `
                    <div class="norse-panel rounded-xl p-3 border border-slate-800 hover:border-slate-700 bg-slate-950/60 flex gap-3 items-center opacity-85 hover:opacity-100 transition">
                      <img src="${c.img || window.CARD_ARTWORKS.incantesimo}" onclick="window.openCardDetailModal('${c.id}')" class="w-14 h-20 rounded-lg object-cover border border-slate-700 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
                      <div class="flex-1 min-w-0 space-y-1">
                        <div class="flex justify-between items-start">
                          <h4 class="font-cinzel font-bold text-xs text-white truncate cursor-pointer hover:text-amber-300" onclick="window.openCardDetailModal('${c.id}')">${c.name}</h4>
                          <span class="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold uppercase">Nel Grimorio</span>
                        </div>
                        <p class="text-[10px] text-slate-300 font-mono">${c.damage || 'Effetto'}</p>
                        <p class="text-[9px] text-slate-400 line-clamp-1">${c.desc || ''}</p>
                        <div class="pt-1 flex gap-2">
                          <button type="button" onclick="window.togglePrepareSpell('${c.id}')" class="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-cinzel font-bold text-[10px] border border-amber-500/30 shadow transition">
                            ⚡ Prepara / Rendi Attivo
                          </button>
                        </div>
                      </div>
                    </div>
                  `).join('')}
                </div>`
            }
          </div>
        </div>
      `;
      return;
    }
  }

  if (window.activeDdbSection === 'defenses') {
    const spdVal = parseInt(ch.speed) || 9;
    const feetVal = Math.round(spdVal * 3.28);
    const dashVal = spdVal * 2;
    const swimVal = Math.round(spdVal / 2 * 10) / 10;
    const isColdRes = (ch.clan === 'jotunn_sons' || (ch.clanId && ch.clanId.includes('jotun')));
    const isBarbarian = (ch.className || '').toLowerCase().includes('barbar');
    const succ = (ch.deathSaves && ch.deathSaves.successes) || 0;
    const fail = (ch.deathSaves && ch.deathSaves.failures) || 0;

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <!-- 1. VELOCITÀ & MOBILITÀ TATTICA -->
        <div class="norse-panel norse-border-gold rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-amber-400">⚡</span>
              <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Velocità & Mobilità Tattica</h3>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">${spdVal}m / ${feetVal} ft</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] text-slate-400 block uppercase font-cinzel">Passo Base</span>
              <strong class="text-white text-sm font-mono">${spdVal}m</strong>
              <span class="text-[9px] text-slate-500 block">(${feetVal} ft • ${Math.round(spdVal / 1.5)} quad)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] text-slate-400 block uppercase font-cinzel">Scatto (Dash)</span>
              <strong class="text-sky-300 text-sm font-mono">${dashVal}m</strong>
              <span class="text-[9px] text-slate-500 block">(${feetVal * 2} ft)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] text-slate-400 block uppercase font-cinzel">Nuoto nei Fiordi</span>
              <strong class="text-slate-300 text-sm font-mono">${swimVal}m</strong>
              <span class="text-[9px] text-slate-500 block">(${Math.round(feetVal / 2)} ft)</span>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] text-slate-400 block uppercase font-cinzel">Scalata Ghiacci</span>
              <strong class="text-slate-300 text-sm font-mono">${swimVal}m</strong>
              <span class="text-[9px] text-slate-500 block">(${Math.round(feetVal / 2)} ft)</span>
            </div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
            <span class="text-sky-400 text-base">🏔️</span>
            <span>${ch.clan === 'icy_crow' ? '<strong>Tratto Ali del Nord:</strong> Ignori i terreni difficili provocati da neve, lastroni di ghiaccio e burrasca polare.' : '<strong>Terreno Difficile:</strong> Ogni 1.5m (1 quad) di movimento costa 3m (2 quad) di passo a meno di privilegi speciali.'}</span>
          </div>
        </div>

        <!-- 2. CONDIZIONE ATTIVA & STATO PSICO-FISICO -->
        <div class="norse-panel rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-sky-400">🛡️</span>
              <h3 class="font-cinzel font-bold text-sm text-sky-300 uppercase tracking-wider">Condizione Psico-Fisica Attiva</h3>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded font-bold uppercase ${ch.condition === 'Normale' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'}">${ch.condition || 'Normale'}</span>
          </div>
          <p class="text-[11px] text-slate-400">Clicca su una condizione per applicarla all'Eroe o ripristinare la piena operatività:</p>
          <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
            ${['Normale', 'Ispirato', 'Ferito', 'Stordito', 'Accecato', 'Avvelenato', 'Invisibile', 'Paralizzato', 'Prono', 'Spaventato', 'Trattenuto', 'Incosciente'].map(c => `
              <button type="button" onclick="window.setMyCharacterCondition('${c}')" class="py-1.5 px-2 rounded-lg font-cinzel text-[10px] font-bold border transition ${ch.condition === c ? 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-md' : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'}">${c}</button>
            `).join('')}
          </div>
        </div>

        <!-- 3. DIFESE, RESISTENZE & IMMUNITÀ -->
        <div class="norse-panel rounded-2xl p-4 space-y-3">
          <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
            <span class="text-base text-amber-400">⚔️</span>
            <h3 class="font-cinzel font-bold text-sm text-sky-300 uppercase tracking-wider">Difese, Resistenze & Immunità</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span class="text-[10px] font-cinzel uppercase text-amber-400 block font-bold">Resistenze ai Danni</span>
              <p class="text-slate-200 font-medium">${isColdRes ? '❄️ Gelo Primordiale & Freddo Glaciale (Figli di Jötunn)' : (isBarbarian ? '⚔️ Contundente, Perforante e Tagliente durante l\'Ira Furiosa' : (ch.defenses || 'Nessuna resistenza ai danni innata'))}</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <span class="text-[10px] font-cinzel uppercase text-sky-400 block font-bold">Immunità & Vantaggi Difensivi</span>
              <p class="text-slate-200 font-medium">${ch.clan === 'gjallarhorn' ? '👁️ Non può essere Sorpreso mentre cosciente (+2 Percezione Passiva)' : 'Soggetto alle leggi fisiche e mistiche dei Nove Mondi.'}</p>
            </div>
          </div>
        </div>

        <!-- 4. TIRI SALVEZZA CONTRO LA MORTE (0 PF) -->
        <div class="norse-panel norse-border-gold rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-red-400">💀</span>
              <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Tiri Salvezza Contro la Morte (0 PF)</h3>
            </div>
            <button type="button" onclick="window.resetDeathSaves()" class="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">Azzera</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-emerald-900/40">
              <div>
                <span class="text-emerald-400 text-xs font-bold block">SUCCESSI</span>
                <span class="text-[9px] text-slate-400">3 per stabilizzarti nel gelo</span>
              </div>
              <div class="flex items-center gap-2">
                ${[1, 2, 3].map(i => `
                  <button type="button" onclick="window.toggleDeathSave('success', ${i})" class="w-7 h-7 rounded-full border-2 transition flex items-center justify-center font-bold text-xs ${succ >= i ? 'bg-emerald-500 border-emerald-300 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-slate-950 border-slate-700 text-transparent'}">✓</button>
                `).join('')}
              </div>
            </div>
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-red-900/40">
              <div>
                <span class="text-red-400 text-xs font-bold block">FALLIMENTI</span>
                <span class="text-[9px] text-slate-400">3 per raggiungere il Valhalla o Hel</span>
              </div>
              <div class="flex items-center gap-2">
                ${[1, 2, 3].map(i => `
                  <button type="button" onclick="window.toggleDeathSave('failure', ${i})" class="w-7 h-7 rounded-full border-2 transition flex items-center justify-center font-bold text-xs ${fail >= i ? 'bg-red-600 border-red-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'bg-slate-950 border-slate-700 text-transparent'}">✕</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'features') {
    const clanMatch = (typeof window.resolveClan === 'function' ? window.resolveClan(ch.clanId || ch.clan || ch.clanName) : null) || (window.JTR_CLANS && window.JTR_CLANS[0]);
    const traitsList = ch.traits || [];
    const clanTraits = traitsList.filter(t => t.toLowerCase().includes('[clan') || t.toLowerCase().includes('clan') || t.toLowerCase().includes('bjorn') || t.toLowerCase().includes('furia') || t.toLowerCase().includes('sapienza') || t.toLowerCase().includes('ali del') || t.toLowerCase().includes('sentinella') || t.toLowerCase().includes('istinto') || t.toLowerCase().includes('gelo'));
    const raceTraits = traitsList.filter(t => t.toLowerCase().includes('[stirpe') || t.toLowerCase().includes('stirpe'));
    const classTraits = traitsList.filter(t => !clanTraits.includes(t) && !raceTraits.includes(t));

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <!-- TRATTI DEL CLAN DI MIDGARDR -->
        <div class="norse-panel norse-border-gold rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div class="flex items-center gap-3">
              <img src="${(clanMatch && clanMatch.crest) || ch.clanCrest || 'assets/clans/Logo-Bear_Warriors.png'}" class="w-8 h-8 rounded-full border border-amber-400 object-cover shadow-sm">
              <div>
                <span class="text-[10px] text-amber-400 uppercase font-cinzel font-bold block">Tratto Inviolabile del Clan</span>
                <h3 class="font-cinzel font-black text-sm text-white">${(clanMatch && clanMatch.name) || ch.clanName || 'Clan di Midgardr'}</h3>
              </div>
            </div>
            <button type="button" onclick="window.openClanDetailModal('${(clanMatch && clanMatch.id) || ch.clanId || ch.clan}')" class="text-[10px] px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-cinzel font-bold hover:bg-amber-500/30 transition">Dettagli Clan</button>
          </div>
          <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed">
            ${(clanMatch && clanMatch.vantaggi) || ch.clanTrait || 'Furia ed eredità degli avi guidano ogni colpo.'}
          </div>
        </div>

        <!-- PRIVILEGI DI CLASSE & LIVELLO -->
        <div class="norse-panel rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-sky-400">⚔️</span>
              <h3 class="font-cinzel font-bold text-sm text-sky-300 uppercase tracking-wider">Privilegi di Classe (5.5e & JTR)</h3>
            </div>
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 border border-sky-500/30 text-sky-300">${ch.className} Liv. ${ch.level || 1}</span>
          </div>
          ${classTraits.length === 0 ? `
            <div class="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400">Nessun privilegio registrato. Sbloccherai nuovi poteri salendo di livello!</div>
          ` : `
            <div class="space-y-2">
              ${classTraits.map(t => {
                const parts = t.split(']');
                const tag = parts.length > 1 ? parts[0].replace('[', '') : 'Privilegio';
                const text = parts.length > 1 ? parts.slice(1).join(']').trim() : t;
                return `
                  <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${tag.toLowerCase().includes('archetipo') ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-sky-950 text-sky-300 border border-sky-500/30'}">${tag}</span>
                    </div>
                    <p class="text-slate-200 leading-relaxed pt-0.5">${text}</p>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- TRATTI DI STIRPE & RAZZA -->
        ${raceTraits.length > 0 ? `
          <div class="norse-panel rounded-2xl p-4 space-y-3">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span class="text-base text-amber-400">🧬</span>
              <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Tratti di Stirpe (${ch.race || 'Umano dei Fiordi'})</h3>
            </div>
            <div class="space-y-2">
              ${raceTraits.map(rt => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed">${rt.replace(/\[Stirpe\]\s*/i, '')}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'proficiencies') {
    const clsLower = (ch.className || '').toLowerCase();
    const isHeavy = clsLower.includes('paladin') || clsLower.includes('guerrier');
    const isMedium = isHeavy || clsLower.includes('barbar') || clsLower.includes('chieric') || clsLower.includes('druid') || clsLower.includes('ranger');
    const isShield = !clsLower.includes('mag') && !clsLower.includes('streg') && !clsLower.includes('monac');

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- 1. ARMATURE E SCUDI -->
          <div class="norse-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span class="text-base text-amber-400">🛡️</span>
              <h3 class="font-cinzel font-bold text-xs text-amber-300 uppercase tracking-wider">Armature & Scudi</h3>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-300">Armature Leggere (Cuoio, Pelli)</span>
                <span class="text-emerald-400 font-bold">✓ Competente</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-300">Armature Medie (Giaco, Scaglie)</span>
                <span class="${isMedium ? 'text-emerald-400 font-bold' : 'text-slate-500'}">${isMedium ? '✓ Competente' : '—'}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-300">Armature Pesanti (Piastre Nordiche)</span>
                <span class="${isHeavy ? 'text-emerald-400 font-bold' : 'text-slate-500'}">${isHeavy ? '✓ Competente' : '—'}</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-300">Scudi Rotondi Vichinghi</span>
                <span class="${isShield ? 'text-emerald-400 font-bold' : 'text-slate-500'}">${isShield ? '✓ Competente' : '—'}</span>
              </div>
            </div>
          </div>

          <!-- 2. ARMI & MAESTRIE 5.5E -->
          <div class="norse-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span class="text-base text-sky-400">⚔️</span>
              <h3 class="font-cinzel font-bold text-xs text-sky-300 uppercase tracking-wider">Armi & Maestrie (5.5e)</h3>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Armi Semplici</span>
                <strong class="text-white">Pugnali, Lance, Clave, Archi Corti, Asce da Lancio</strong>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Armi da Guerra Nordiche</span>
                <strong class="text-white">Spade Ulfberht, Asce Danesi Bipenni, Magli Pesanti, Archi Compositi</strong>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-950/60 border border-amber-500/20 text-amber-200/90 text-[11px]">
                ⚡ <strong>Maestrie 5.5e:</strong> Graze, Nick, Push, Sap, Slow, Topple, Vex, Cleave.
              </div>
            </div>
          </div>

          <!-- 3. STRUMENTI & MESTIERI -->
          <div class="norse-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span class="text-base text-amber-400">🛠️</span>
              <h3 class="font-cinzel font-bold text-xs text-amber-300 uppercase tracking-wider">Strumenti & Mestieri</h3>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Kit di Sopravvivenza</span>
                <p class="text-slate-200">Kit del Marinaio da Drakkar, Attrezzi da Scalata tra i Ghiacci, Acciarino e Pietra Focaia</p>
              </div>
              <div class="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Artigianato & Strumenti Speciali</span>
                <p class="text-slate-200">${ch.className.toLowerCase().includes('bardo') || ch.className.toLowerCase().includes('skald') ? 'Corno da Battaglia, Cetra a Tagliacorde, Tamburo Sciamanico' : 'Strumenti da Fabbro delle Lame, Incisore di Rune del Futhark, Kit di Concia delle Pelli'}</p>
              </div>
            </div>
          </div>

          <!-- 4. LINGUAGGI CONOSCIUTI -->
          <div class="norse-panel rounded-2xl p-4 space-y-2.5">
            <div class="flex items-center gap-2 border-b border-slate-800 pb-2">
              <span class="text-base text-sky-400">🗣️</span>
              <h3 class="font-cinzel font-bold text-xs text-sky-300 uppercase tracking-wider">Linguaggi dei Nove Mondi</h3>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-200 font-bold">Norreno Antico (Fornnörræna)</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">Nativo</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-200 font-bold">Lingua Comune di Midgardr</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">Fluente</span>
              </div>
              <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                <span class="text-slate-200 font-bold">Antico Runico Futhark</span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">Mistico</span>
              </div>
              ${ch.clan === 'jotunn_sons' ? `
                <div class="flex items-center justify-between p-2 rounded-lg bg-slate-900/70 border border-slate-800">
                  <span class="text-slate-200 font-bold">Lingua dei Giganti (Jötnar)</span>
                  <span class="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">Ancestrale</span>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'background') {
    const clanMatch = (typeof window.resolveClan === 'function' ? window.resolveClan(ch.clanId || ch.clan || ch.clanName) : null) || (window.JTR_CLANS && window.JTR_CLANS[0]);
    const bgName = ch.background || 'Vikingr';
    const virtName = ch.virtue || 'Onore';
    const alignName = ch.alignment || 'Legale Onorevole';

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <!-- 1. HERO MONUMENTALE DEL CLAN DI MIDGARDR -->
        <div class="norse-panel norse-border-gold rounded-2xl overflow-hidden relative shadow-2xl">
          <div class="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style="background-image: url('${(clanMatch && clanMatch.banner) || ch.clanBanner || 'assets/clans/OrsiGuerrireri.png'}');"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent pointer-events-none"></div>

          <div class="relative p-5 space-y-4 z-10">
            <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <img src="${(clanMatch && clanMatch.crest) || ch.clanCrest || 'assets/clans/Logo-Bear_Warriors.png'}" class="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-[0_0_20px_rgba(245,208,118,0.35)] shrink-0">
              <div class="space-y-1">
                <span class="text-[10px] font-cinzel uppercase tracking-widest text-amber-400 font-bold block">Sacro Clan di Midgardr</span>
                <h2 class="font-cinzel font-black text-xl text-white tracking-wider">${(clanMatch && clanMatch.name) || ch.clanName || 'Guerrieri dell\'Orso'}</h2>
                <p class="font-cinzel italic text-xs text-amber-200/90 leading-snug">"${(clanMatch && clanMatch.motto) || ch.clanMotto || 'La forza dei padri scorre nelle nostre vene.'}"</p>
              </div>
            </div>

            <p class="text-slate-300 leading-relaxed text-xs pt-1">${(clanMatch && clanMatch.desc) || 'Dominatori fieri e custodi dei segreti delle montagne, fedeli alla parola data e alle leggi del Thing.'}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div class="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 space-y-1">
                <span class="text-[10px] font-cinzel uppercase text-amber-400 font-bold block">Vantaggi & Privilegi</span>
                <p class="text-slate-200 leading-snug">${(clanMatch && clanMatch.vantaggi) || ch.clanTrait || 'Vantaggio alle prove d\'onore e rifugio sicuro.'}</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/90 border border-red-500/30 space-y-1">
                <span class="text-[10px] font-cinzel uppercase text-red-400 font-bold block">Tabù & Codice d'Onore</span>
                <p class="text-slate-200 leading-snug">${(clanMatch && clanMatch.svantaggi) || 'Violare una promessa giurata porta il disonore eterno.'}</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span class="text-[10px] font-cinzel uppercase text-sky-400 font-bold block">Alleanze e Rispetto</span>
                <p class="text-slate-300 leading-snug">${(clanMatch && clanMatch.amicizie) || 'Trattati commerciali e patti d\'armi con i clan vicini.'}</p>
              </div>
              <div class="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <span class="text-[10px] font-cinzel uppercase text-amber-500 font-bold block">Inimicizie Giurate</span>
                <p class="text-slate-300 leading-snug">${(clanMatch && clanMatch.odii) || 'Faide aperte con i predatori delle coste e i profanatori.'}</p>
              </div>
            </div>

            <div class="pt-2 flex justify-end">
              <button type="button" onclick="window.openClanDetailModal('${(clanMatch && clanMatch.id) || ch.clanId || ch.clan}')" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400 text-amber-300 font-cinzel font-bold text-xs hover:bg-amber-500/30 transition flex items-center gap-2 shadow-md">
                ⚔️ Visualizza Statuto Completo & Cimelio del Clan
              </button>
            </div>
          </div>
        </div>

        <!-- 2. ORIGINE, BACKGROUND & MESTIERE -->
        <div class="norse-panel rounded-2xl p-4 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-amber-400">📜</span>
              <h3 class="font-cinzel font-bold text-sm text-sky-300 uppercase tracking-wider">Origine & Background Nordico</h3>
            </div>
            <span class="px-2.5 py-0.5 rounded text-xs font-cinzel font-bold bg-sky-950 text-sky-300 border border-sky-500/30">${bgName}</span>
          </div>
          <p class="text-slate-200 leading-relaxed text-xs">
            Cresciuto come <strong>${bgName}</strong> tra i fiordi selvaggi e le sale dell'idromele di Midgardr, hai temprato lo spirito affrontando le intemperie del Nord e le faide di clan prima che i presagi del Fimbulvetr annunciassero l'imminente scontro finale.
          </p>
        </div>

        <!-- 3. LE TRE GUIDE MORALI DELL'ANIMA (VIRTÙ, ALLINEAMENTO, ORO) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="norse-panel rounded-2xl p-3.5 space-y-1 text-center">
            <span class="text-[10px] font-cinzel uppercase text-amber-400 font-bold block">Virtù Guida</span>
            <strong class="font-cinzel text-sm text-white block">${virtName}</strong>
            <p class="text-[10px] text-slate-400 leading-snug">Il faro etico che guida le tue scelte morali nel cammino verso il Valhalla.</p>
          </div>
          <div class="norse-panel rounded-2xl p-3.5 space-y-1 text-center">
            <span class="text-[10px] font-cinzel uppercase text-sky-400 font-bold block">Allineamento</span>
            <strong class="font-cinzel text-sm text-white block">${alignName}</strong>
            <p class="text-[10px] text-slate-400 leading-snug">La tua posizione rispetto alla legge del Thing e al caos primordiale.</p>
          </div>
          <div class="norse-panel rounded-2xl p-3.5 space-y-1 text-center">
            <span class="text-[10px] font-cinzel uppercase text-emerald-400 font-bold block">Oro & Argento (Hacksilver)</span>
            <strong class="font-mono text-sm text-amber-300 block">${ch.gold !== undefined ? ch.gold : 50} Monete d'Oro (mo)</strong>
            <p class="text-[10px] text-slate-400 leading-snug">Bracciali d'argento spezzato e monete coniate dai re del Nord.</p>
            <button type="button" onclick="window.openPlayerMarketModal()" class="mt-2 w-full py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400 text-amber-300 font-cinzel font-bold text-[10px] transition flex items-center justify-center gap-1 shadow">
              ⚖️ Apri Bazar del Party
            </button>
          </div>
        </div>

        <!-- 4. I QUATTRO PILASTRI DEL RUOLO -->
        <div class="norse-panel rounded-2xl p-4 space-y-3">
          <h3 class="font-cinzel font-bold text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5">I Quattro Pilastri del Ruolo</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-[10px] font-cinzel uppercase text-amber-400 font-bold block">Tratto della Personalità</span>
              <p class="text-slate-200">Non arretro mai di fronte a una sfida; guardo negli occhi chiunque parli con me.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-[10px] font-cinzel uppercase text-sky-400 font-bold block">Ideale Supremo</span>
              <p class="text-slate-200">Onore e rispetto per la parola data valgono più di un forziere colmo d'oro.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-[10px] font-cinzel uppercase text-emerald-400 font-bold block">Legame Sacro</span>
              <p class="text-slate-200">Difenderò la mia gente e il drakkar della spedizione fino all'ultimo respiro.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-[10px] font-cinzel uppercase text-red-400 font-bold block">Difetto & Ombra</span>
              <p class="text-slate-200">La sete di gloria e il furore in battaglia a volte mi fanno dimenticare la prudenza.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'notes') {
    const existingNotes = (ch.notes && ch.notes !== 'Nessuna nota.') ? ch.notes : '';

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <div class="norse-panel norse-border-gold rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-2">
            <div class="flex items-center gap-2.5">
              <span class="text-lg text-amber-400">✒️</span>
              <div>
                <h3 class="font-cinzel font-bold text-sm text-amber-300 uppercase tracking-wider">Diario di Viaggio & Cronache dello Skald</h3>
                <span class="text-[10px] text-slate-400">Note di sessione, indizi profetici e cronache di Ragnarok</span>
              </div>
            </div>
            <button type="button" id="btn-save-notes-feedback" onclick="window.saveMyCharacterNotes(document.getElementById('ddb-live-notes-area').value)" class="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-amber-300 font-cinzel font-bold text-xs hover:bg-amber-500/30 transition shadow-md">
              Salva Cronaca
            </button>
          </div>

          <textarea id="ddb-live-notes-area" rows="10" placeholder="Incidi qui le tue note di viaggio, i giuramenti prestati, gli jarl incontrati, le profezie delle Norne o le rune scoperte nei Nove Mondi..." class="w-full bg-slate-950/90 border border-slate-800 focus:border-amber-400 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 leading-relaxed outline-none transition font-sans">${existingNotes}</textarea>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px]">
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-amber-400 font-cinzel font-bold uppercase block">📜 Trama & Missioni</span>
              <p class="text-slate-400">Segna gli obiettivi ricevuti dagli dei o dai capi villaggio.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-sky-400 font-cinzel font-bold uppercase block">🗺️ Luoghi & Terre Esplorate</span>
              <p class="text-slate-400">Ricorda fiordi, porti, torri di guardia e rovine misteriose.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
              <span class="text-emerald-400 font-cinzel font-bold uppercase block">💎 Bottino & Doni</span>
              <p class="text-slate-400">Traccia manufatti, pelli preziose e ricompense d'onore.</p>
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (window.activeDdbSection === 'creatures') {
    const comp = ch.companion || window.COMPANION_PRESETS.raven;
    const hpPct = Math.round(((comp.hp || 1) / (comp.maxHp || 1)) * 100);

    body.innerHTML = `
      <div class="space-y-4 animate-section-fade text-xs">
        <!-- SELETTORE COMPAGNO ANIMALE / FAMIGLIO -->
        <div class="norse-panel rounded-2xl p-4 space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base text-amber-400">🐾</span>
              <h3 class="font-cinzel font-bold text-xs text-amber-300 uppercase tracking-wider">Evoca / Seleziona Compagno di Viaggio</h3>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button type="button" onclick="window.setMyCharacterCompanion('raven')" class="p-2 rounded-xl border text-center transition ${comp.id === 'raven' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}">
              🦅 Corvo di Odhinn
            </button>
            <button type="button" onclick="window.setMyCharacterCompanion('wolf')" class="p-2 rounded-xl border text-center transition ${comp.id === 'wolf' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}">
              🐺 Lupo delle Nevi
            </button>
            <button type="button" onclick="window.setMyCharacterCompanion('horse')" class="p-2 rounded-xl border text-center transition ${comp.id === 'horse' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}">
              🐎 Cavallo da Guerra
            </button>
            <button type="button" onclick="window.setMyCharacterCompanion('bear')" class="p-2 rounded-xl border text-center transition ${comp.id === 'bear' ? 'bg-amber-500/20 border-amber-400 text-amber-300' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'}">
              🐻 Orso delle Vette
            </button>
          </div>
        </div>

        <!-- STATBLOCK STILE D&D BEYOND DELLA CREATURA -->
        <div class="norse-panel norse-border-gold rounded-2xl p-5 space-y-4">
          <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
            <div class="flex items-center gap-3">
              <img src="${comp.avatar || 'assets/clans/Logo-Icy-Crows.png'}" class="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md">
              <div>
                <h2 class="font-cinzel font-black text-base text-white tracking-wider">${comp.name}</h2>
                <span class="text-[10px] text-slate-400 block">${comp.type} • Taglia ${comp.size}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] uppercase font-cinzel text-slate-400 block font-bold">Punti Ferita</span>
              <strong class="font-mono text-base text-emerald-400">${comp.hp} / ${comp.maxHp} PF</strong>
            </div>
          </div>

          <!-- Barra della Vita e Modificatori Rapidi -->
          <div class="space-y-1.5">
            <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div class="bg-gradient-to-r from-emerald-500 to-green-400 h-full transition-all" style="width: ${hpPct}%;"></div>
            </div>
            <div class="flex justify-between items-center text-[10px]">
              <span class="text-slate-400">Salute Compagno</span>
              <div class="flex items-center gap-1.5">
                <button type="button" onclick="window.adjustCompanionHp(-1)" class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:text-red-400">-1 PF</button>
                <button type="button" onclick="window.adjustCompanionHp(-5)" class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:text-red-400">-5 PF</button>
                <button type="button" onclick="window.adjustCompanionHp(1)" class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:text-emerald-400">+1 PF</button>
                <button type="button" onclick="window.adjustCompanionHp(5)" class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:text-emerald-400">+5 PF</button>
                <button type="button" onclick="window.adjustCompanionHp(999)" class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300">Cura Totale</button>
              </div>
            </div>
          </div>

          <!-- Statistiche Chiave -->
          <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Classe Armatura</span>
              <strong class="font-mono text-base text-amber-300">${comp.ac}</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Velocità</span>
              <strong class="font-mono text-xs text-sky-300 block pt-1">${comp.speed}</strong>
            </div>
            <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span class="text-[10px] font-cinzel uppercase text-slate-400 block">Sensi</span>
              <span class="text-[10px] text-slate-300 block pt-1">${comp.senses}</span>
            </div>
          </div>

          <!-- Tratti Speciali della Creatura -->
          <div class="space-y-2">
            <h4 class="font-cinzel font-bold text-xs text-amber-400 uppercase tracking-wider">Tratti & Istinti</h4>
            <div class="space-y-1.5">
              ${(comp.traits || []).map(tr => `
                <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <strong class="text-white text-xs block font-cinzel">${tr.name}:</strong>
                  <p class="text-slate-300 text-[11px] leading-relaxed">${tr.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Azioni d'Attacco Rapido -->
          <div class="space-y-2">
            <h4 class="font-cinzel font-bold text-xs text-sky-400 uppercase tracking-wider">Azioni & Attacchi</h4>
            <div class="space-y-2">
              ${(comp.actions || []).map(atk => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div class="space-y-0.5">
                    <strong class="text-white text-xs block font-cinzel">${atk.name}</strong>
                    <span class="text-[11px] text-slate-300 block font-mono">Tiro per Colpire: +${atk.bonus} • Danno: ${atk.damage}</span>
                    <p class="text-[10px] text-slate-400">${atk.desc}</p>
                  </div>
                  <button type="button" onclick="window.rollCompanionAttack('${comp.name}', '${atk.name}', ${atk.bonus}, '${atk.damage}')" class="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 font-cinzel font-bold text-xs hover:bg-red-900/90 transition shadow-sm self-start sm:self-center shrink-0">
                    ⚔️ Attacca
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    return;
  }
};

window.renderAllViews = function() {
  if (window._isRenderingViews) return;
  window._isRenderingViews = true;
  try {
    if (!window.currentUser || !window.dbState.users[window.currentUser]) return;
    const account = window.dbState.users[window.currentUser];
    document.getElementById('top-user-label').textContent = window.isCurrentUserAdmin() ? `Admin: ${account.username}` : `Account: ${account.username}`;

  const chars = account.characters || [];
  const ch = window.getMyCharacter();

  if (ch) {
    // 1. Rimuove qualsiasi residuo del pulsante admin all'interno della dashboard se presente in cache DOM
    const strayAdmin = document.getElementById('btn-admin-console');
    if (strayAdmin) strayAdmin.remove();

    // 2. Pulizia e deduplicazione automatica carte [CIMELIO ...]:
    // Rimuove qualsiasi carta che ha nel nome "[Cimelio" lasciando la versione pulita per tutte le classi
    if (ch.cards && ch.cards.length > 0) {
      const beforeCount = ch.cards.length;
      const cleanCards = [];
      const seenCleanNames = new Set();

      ch.cards.forEach(c => {
        const cName = (c.name || '').trim();
        if (!cName.toLowerCase().includes('[cimelio')) {
          cleanCards.push(c);
          seenCleanNames.add(cName.toLowerCase());
        }
      });

      ch.cards.forEach(c => {
        const cName = (c.name || '').trim();
        if (cName.toLowerCase().includes('[cimelio')) {
          const stripped = cName.replace(/\[cimelio[^\]]*\]\s*/i, '').trim();
          if (!seenCleanNames.has(stripped.toLowerCase())) {
            c.name = stripped;
            cleanCards.push(c);
            seenCleanNames.add(stripped.toLowerCase());
          }
        }
      });

      if (cleanCards.length !== beforeCount || ch.cards.some(c => (c.name || '').toLowerCase().includes('[cimelio'))) {
        ch.cards = cleanCards;
        window.propagateCharacterToCampaigns(ch);
        try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
        if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
      }
    }

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
    if (typeof window.recalculateCharacterAC === 'function') {
      window.recalculateCharacterAC(ch);
    } else {
      document.getElementById('sheet-ac').textContent = ch.ac || 14;
    }
    const goldValEl = document.getElementById('sheet-gold-val');
    if (goldValEl) goldValEl.textContent = ch.gold !== undefined ? ch.gold : 50;
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

    const matchedClan = (typeof window.resolveClan === 'function' ? window.resolveClan(ch) : null) || window.JTR_CLANS[0];

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
  } finally {
    window._isRenderingViews = false;
  }
};

// ==============================================================================
// 10. PRESET COMPAGNI & GESTORI INTERATTIVI DELLA SCHEDA D&D BEYOND
// ==============================================================================
window.COMPANION_PRESETS = {
  raven: {
    id: "raven",
    name: "Corvo Messaggero di Odhinn (Munin)",
    avatar: "assets/clans/Logo-Icy-Crows.png",
    type: "Bestia Celeste / Famiglio",
    size: "Minuscola",
    ac: 12,
    hp: 4,
    maxHp: 4,
    speed: "3m (Volo 18m)",
    senses: "Percezione Passiva 13, Scurovisione 18m",
    traits: [
      { name: "Occhio della Profezia", desc: "Vantaggio a tutte le prove di Saggezza (Percezione) basate sulla vista dall'alto." },
      { name: "Messaggero Cosmico", desc: "Può volare e comunicare telepaticamente con il padrone entro 1,5 km." }
    ],
    actions: [
      { name: "Beccata Sacra", bonus: 4, damage: "1d4 Tagliente", desc: "Attacco rapido con il becco indurito con le rune del gelo." }
    ]
  },
  wolf: {
    id: "wolf",
    name: "Lupo delle Nevi di Midgardr",
    avatar: "assets/clans/Logo-Wolves-of-the-Shadow.png",
    type: "Bestia dei Boschi / Segugio",
    size: "Media",
    ac: 13,
    hp: 11,
    maxHp: 11,
    speed: "12m (40 ft)",
    senses: "Percezione Passiva 13, Fiuto Acuto",
    traits: [
      { name: "Tattica di Branco", desc: "Vantaggio al tiro per colpire contro una creatura se almeno un alleato è adiacente." },
      { name: "Olfatto & Udito Affinati", desc: "Vantaggio a tutte le prove di Saggezza (Percezione) per fiutare tracce o prede nel gelo." }
    ],
    actions: [
      { name: "Morso Letale", bonus: 4, damage: "2d4+2 Perforante", desc: "Il bersaglio colpito deve superare un Tiro Salvezza su Forza CD 11 o cadere Prono a terra." }
    ]
  },
  horse: {
    id: "horse",
    name: "Cavallo da Guerra Nordico (Lignaggio di Sleipnir)",
    avatar: "assets/heroes/face_paladino.jpg",
    type: "Bestia / Cavalcatura Corazzata",
    size: "Grande",
    ac: 11,
    hp: 19,
    maxHp: 19,
    speed: "18m (60 ft)",
    senses: "Percezione Passiva 11",
    traits: [
      { name: "Zoccolo Incessante", desc: "Ignora terreni innevati o lastroni di ghiaccio mentre trasporta un cavaliere." },
      { name: "Carica Tempestosa", desc: "Se si muove di almeno 6m in linea retta prima dell'attacco, aggiunge +1d6 danni all'impatto." }
    ],
    actions: [
      { name: "Zoccoli Ferrati", bonus: 6, damage: "2d6+4 Contundente", desc: "Violenta zampata con zoccoli di ferro e bronzo forgiato." }
    ]
  },
  bear: {
    id: "bear",
    name: "Orso delle Vette di Jotunheimr",
    avatar: "assets/clans/Logo-Bear_Warriors.png",
    type: "Bestia Primordiale / Compagno Guerriero",
    size: "Grande",
    ac: 12,
    hp: 34,
    maxHp: 34,
    speed: "12m (Scalata 9m)",
    senses: "Percezione Passiva 12, Fiuto Eccezionale",
    traits: [
      { name: "Furia dei Ghiacci", desc: "Resistenza naturale al freddo polare e stazza titanica." },
      { name: "Presa d'Orso", desc: "Vantaggio a lottare o afferrare nemici di taglia Media o inferiore." }
    ],
    actions: [
      { name: "Zampata con Artigli", bonus: 5, damage: "2d6+4 Tagliente", desc: "Violento fendente d'artiglio capace di lacerare armature." },
      { name: "Morso Frantuma-Ossa", bonus: 5, damage: "1d8+4 Perforante", desc: "Morso feroce alla gola del nemico." }
    ]
  }
};

window.setMyCharacterCondition = function(cond) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  ch.condition = cond;
  window.currentCanvasCondition = cond;
  window.propagateCharacterToCampaigns(ch);
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
  if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
  window.renderDdbSectionContent(ch);
};

window.toggleDeathSave = function(type, num) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  if (!ch.deathSaves) ch.deathSaves = { successes: 0, failures: 0 };
  const current = type === 'success' ? (ch.deathSaves.successes || 0) : (ch.deathSaves.failures || 0);
  const updated = current === num ? num - 1 : num;
  if (type === 'success') ch.deathSaves.successes = updated;
  else ch.deathSaves.failures = updated;
  window.propagateCharacterToCampaigns(ch);
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
  if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
  window.renderDdbSectionContent(ch);
};

window.resetDeathSaves = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;
  ch.deathSaves = { successes: 0, failures: 0 };
  window.propagateCharacterToCampaigns(ch);
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
  if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
  window.renderDdbSectionContent(ch);
};

window.saveMyCharacterNotes = function(notesText) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  ch.notes = notesText;
  window.propagateCharacterToCampaigns(ch);
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
  if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
  const btn = document.getElementById('btn-save-notes-feedback');
  if (btn) {
    btn.textContent = '✓ Cronaca Salvata!';
    btn.classList.add('text-emerald-400');
    setTimeout(() => {
      btn.textContent = 'Salva Cronaca';
      btn.classList.remove('text-emerald-400');
    }, 2000);
  }
};

window.setMyCharacterCompanion = function(compKey) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  const presets = window.COMPANION_PRESETS || {};
  if (presets[compKey]) {
    ch.companion = JSON.parse(JSON.stringify(presets[compKey]));
    window.propagateCharacterToCampaigns(ch);
    try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
    if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
    window.renderDdbSectionContent(ch);
  }
};

window.adjustCompanionHp = function(delta) {
  const ch = window.getMyCharacter();
  if (!ch || !ch.companion) return;
  ch.companion.hp = Math.max(0, Math.min(ch.companion.maxHp, (ch.companion.hp || ch.companion.maxHp) + delta));
  window.propagateCharacterToCampaigns(ch);
  try { localStorage.setItem('yggdrasill_v3_db', JSON.stringify(window.dbState)); } catch(e){}
  if (window.fbRef) { try { window.fbRef.set(window.dbState); } catch(e){} }
  window.renderDdbSectionContent(ch);
};

window.rollCompanionAttack = function(compName, atkName, bonus, dmgFormula) {
  const d20 = Math.floor(Math.random() * 20) + 1;
  const total = d20 + bonus;
  alert(`⚔️ ${compName} esegue ${atkName}!\nTiro per Colpire: 1d20+${bonus} = ${total} (Dado: ${d20})\nDanno inflitto: ${dmgFormula}`);
};

// ============================================================================
// SISTEMA DI CALCOLO DINAMICO CLASSE ARMATURA (CA) CON I 4 SLOT EQUIPAGGIAMENTO
// ============================================================================
window.recalculateCharacterAC = function(ch) {
  if (!ch) return 14;
  const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
  const desMod = Math.floor(((stats.DES || 10) - 10) / 2);
  const conMod = Math.floor(((stats.COS || 10) - 10) / 2);
  const isBarbarian = (ch.className || '').toLowerCase().includes('barbar');

  if (!ch.equippedArmor) {
    ch.equippedArmor = { head: null, chest: null, legs: null, feet: null };
  }
  const allCards = ch.cards || [];

  const getCardForSlot = (slotKey) => {
    const ref = ch.equippedArmor[slotKey];
    if (!ref) return null;
    return allCards.find(c => c.id === ref || c.canonicalId === ref) || (typeof ref === 'object' ? ref : null);
  };

  const chestCard = getCardForSlot('chest');
  let baseAC = 10 + desMod;

  if (chestCard) {
    const cName = (chestCard.name || '').toLowerCase();
    const cDmg = (chestCard.damage || '').toLowerCase();
    if (cDmg.includes('ca 18') || cName.includes('completa') || cName.includes('piastre pesante')) {
      baseAC = 18;
    } else if (cDmg.includes('ca 17') || cName.includes('strisce')) {
      baseAC = 17;
    } else if (cDmg.includes('ca 16') || cName.includes('cotta di maglia') || cName.includes('chain mail')) {
      baseAC = 16;
    } else if (cDmg.includes('ca 15') || cName.includes('mezza armatura')) {
      baseAC = 15 + Math.min(desMod, 2);
    } else if (cDmg.includes('ca 14') || cName.includes('scaglie') || cName.includes('scale')) {
      baseAC = 14 + Math.min(desMod, 2);
    } else if (cDmg.includes('ca 13') || cName.includes('giaco')) {
      baseAC = 13 + Math.min(desMod, 2);
    } else if (cDmg.includes('ca 12') || cName.includes('borchiato')) {
      baseAC = 12 + desMod;
    } else if (cDmg.includes('ca 11') || cName.includes('cuoio')) {
      baseAC = 11 + desMod;
    } else {
      const numMatch = cDmg.match(/\b(1[0-8])\b/);
      if (numMatch) {
        baseAC = parseInt(numMatch[1], 10) + Math.min(desMod, 2);
      } else {
        baseAC = 13 + Math.min(desMod, 2);
      }
    }
  } else if (isBarbarian) {
    baseAC = 10 + desMod + conMod;
  }

  // Bonus Scudo se presente
  const hasShield = allCards.some(c => (c.type === 'scudo' || (c.name || '').toLowerCase().includes('scudo')) && (c.equipped || ch.equippedArmor.shield === c.id));
  if (hasShield) {
    baseAC += 2;
  }

  // Bonus Elmo e Schinieri
  const headCard = getCardForSlot('head');
  if (headCard) {
    const hDmg = (headCard.damage || '').toLowerCase();
    if (hDmg.includes('+1 ca') || hDmg.includes('ca +1')) baseAC += 1;
  }

  const legsCard = getCardForSlot('legs');
  if (legsCard) {
    const lDmg = (legsCard.damage || '').toLowerCase();
    if (lDmg.includes('+1 ca') || lDmg.includes('ca +1')) baseAC += 1;
  }

  ch.ac = baseAC;
  const acEl = document.getElementById('sheet-ac');
  if (acEl) acEl.textContent = baseAC;

  return baseAC;
};

// ============================================================================
// GESTIONE MODALE EQUIPAGGIAMENTO SLOT ARMATURA
// ============================================================================
window.activePickingArmorSlot = null;

window.openArmorSlotPickerModal = function(slotKey) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  window.activePickingArmorSlot = slotKey;

  const modal = document.getElementById('armor-slot-picker-modal');
  if (!modal) return;

  const titleMap = {
    head: { icon: '🪖', title: 'Equipaggia Elmo / Copricapo' },
    chest: { icon: '🛡️', title: 'Equipaggia Corazza / Busto' },
    legs: { icon: '👖', title: 'Equipaggia Schinieri / Gambe' },
    feet: { icon: '👢', title: 'Equipaggia Stivali / Calzari' }
  };
  const cfg = titleMap[slotKey] || { icon: '🛡️', title: 'Seleziona Armatura' };

  const iconEl = document.getElementById('aspm-slot-icon');
  const titleEl = document.getElementById('aspm-slot-title');
  if (iconEl) iconEl.textContent = cfg.icon;
  if (titleEl) titleEl.textContent = cfg.title;

  const allCards = ch.cards || [];
  const candidates = allCards.filter(c => {
    if (typeof window.getArmorSlotForCard === 'function') {
      const detected = window.getArmorSlotForCard(c);
      if (detected === slotKey) return true;
    }
    const name = (c.name || '').toLowerCase();
    const type = (c.type || '').toLowerCase();
    if (slotKey === 'head') return name.includes('elmo') || name.includes('corona') || name.includes('copricapo');
    if (slotKey === 'chest') return type === 'armatura' || name.includes('corazza') || name.includes('maglia') || name.includes('cuoio') || name.includes('giaco');
    if (slotKey === 'legs') return name.includes('schinieri') || name.includes('gambali');
    if (slotKey === 'feet') return name.includes('stivali') || name.includes('calzari');
    return false;
  });

  const listEl = document.getElementById('aspm-options-list');
  if (listEl) {
    let unequipBtn = '';
    if (ch.equippedArmor && ch.equippedArmor[slotKey]) {
      unequipBtn = `
        <div class="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 flex justify-between items-center mb-3">
          <span class="text-xs text-red-200">Hai un oggetto attualmente indossato in questo slot.</span>
          <button type="button" onclick="window.unequipArmorSlot('${slotKey}')" class="px-3 py-1.5 rounded-lg bg-red-900 hover:bg-red-800 text-white font-cinzel font-bold text-xs">
            ✖️ Togli Equipaggiamento
          </button>
        </div>
      `;
    }

    if (candidates.length === 0) {
      listEl.innerHTML = `
        ${unequipBtn}
        <div class="norse-panel rounded-xl p-6 text-center text-xs text-slate-400">
          Nessun equipaggiamento idoneo per lo slot <strong>${cfg.title}</strong> trovato nel tuo inventario.<br>
          <span class="text-amber-300 font-bold block mt-1">Puoi acquistare nuove armature e protezioni dal Bazar del Dungeon Master!</span>
        </div>
      `;
    } else {
      listEl.innerHTML = unequipBtn + candidates.map(c => {
        const isCurrent = ch.equippedArmor && (ch.equippedArmor[slotKey] === c.id || ch.equippedArmor[slotKey] === c.canonicalId);
        const art = c.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[c.type]) || 'assets/items/spada_ulfberht.jpg';
        return `
          <div class="norse-panel rounded-xl p-3 flex items-center justify-between gap-3 border ${isCurrent ? 'border-emerald-500 bg-emerald-950/20' : 'border-slate-800 hover:border-sky-400/50'} transition">
            <img src="${art}" class="w-12 h-16 rounded-lg object-cover border border-slate-700 shrink-0">
            <div class="flex-1 min-w-0 space-y-0.5">
              <h4 class="font-cinzel font-bold text-xs text-white truncate">${c.name}</h4>
              <p class="text-[10px] text-amber-300 font-mono font-bold">${c.damage || '+1 CA'}</p>
              <p class="text-[9px] text-slate-400 line-clamp-1">${c.desc || ''}</p>
            </div>
            ${isCurrent ? `
              <span class="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-cinzel font-bold text-xs border border-emerald-400/50">
                ✓ Attuale
              </span>
            ` : `
              <button type="button" onclick="window.equipArmorToSlot('${slotKey}', '${c.id}')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-cinzel font-bold text-xs shadow transition">
                Indossa
              </button>
            `}
          </div>
        `;
      }).join('');
    }
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeArmorSlotPickerModal = function() {
  const modal = document.getElementById('armor-slot-picker-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  window.activePickingArmorSlot = null;
};

window.equipArmorToSlot = function(slotKey, cardId) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  if (!ch.equippedArmor) ch.equippedArmor = { head: null, chest: null, legs: null, feet: null };

  ch.equippedArmor[slotKey] = cardId;
  window.recalculateCharacterAC(ch);
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
  window.closeArmorSlotPickerModal();
  window.renderDdbSectionContent(ch);
  if (typeof window.renderActiveCharacter === 'function') window.renderActiveCharacter();
};

window.unequipArmorSlot = function(slotKey) {
  const ch = window.getMyCharacter();
  if (!ch || !ch.equippedArmor) return;

  ch.equippedArmor[slotKey] = null;
  window.recalculateCharacterAC(ch);
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
  window.closeArmorSlotPickerModal();
  window.renderDdbSectionContent(ch);
  if (typeof window.renderActiveCharacter === 'function') window.renderActiveCharacter();
};

// ============================================================================
// GESTIONE INCANTESIMI PREPARATI & LANCIO MAGIE
// ============================================================================
window.togglePrepareSpell = function(cardId) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  if (!ch.preparedSpells) ch.preparedSpells = [];

  const idx = ch.preparedSpells.indexOf(cardId);
  if (idx !== -1) {
    ch.preparedSpells.splice(idx, 1);
  } else {
    // Calcolo limite massimo
    const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
    const intMod = Math.floor(((stats.INT || 10) - 10) / 2);
    const sagMod = Math.floor(((stats.SAG || 10) - 10) / 2);
    const carMod = Math.floor(((stats.CAR || 10) - 10) / 2);
    const cls = (ch.className || '').toLowerCase();
    let spellMod = intMod;
    if (cls.includes('chieric') || cls.includes('gothi') || cls.includes('druid') || cls.includes('ranger')) spellMod = sagMod;
    else if (cls.includes('bard') || cls.includes('skald') || cls.includes('stregon') || cls.includes('warlock') || cls.includes('paladin')) spellMod = carMod;
    else spellMod = Math.max(intMod, sagMod, carMod);
    const maxPrepared = Math.max(1, (ch.level || 1) + Math.max(0, spellMod));

    if (ch.preparedSpells.length >= maxPrepared) {
      alert(`⚠️ Hai già raggiunto il limite massimo di ${maxPrepared} incantesimi preparati!\nDisattiva un altro incantesimo prima di poterne preparare uno nuovo.`);
      return;
    }
    ch.preparedSpells.push(cardId);
  }

  window.propagateCharacterToCampaigns(ch);
  window.saveDB();
  window.renderDdbSectionContent(ch);
};

window.castSpell = function(cardId) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  const allCards = ch.cards || [];
  const card = allCards.find(c => c.id === cardId || c.canonicalId === cardId);
  if (!card) return;

  const stats = ch.stats || { FOR:10, DES:10, COS:10, INT:10, SAG:10, CAR:10 };
  const intMod = Math.floor(((stats.INT || 10) - 10) / 2);
  const sagMod = Math.floor(((stats.SAG || 10) - 10) / 2);
  const carMod = Math.floor(((stats.CAR || 10) - 10) / 2);
  const cls = (ch.className || '').toLowerCase();
  let spellMod = intMod;
  if (cls.includes('chieric') || cls.includes('gothi') || cls.includes('druid') || cls.includes('ranger')) spellMod = sagMod;
  else if (cls.includes('bard') || cls.includes('skald') || cls.includes('stregon') || cls.includes('warlock') || cls.includes('paladin')) spellMod = carMod;
  else spellMod = Math.max(intMod, sagMod, carMod);

  const profBonus = ch.atkBonus || 2;
  const d20 = Math.floor(Math.random() * 20) + 1;
  const atkTotal = d20 + profBonus + spellMod;
  const spellDC = 8 + profBonus + spellMod;

  alert(`🔮 ${ch.name} incanala le rune e lancia "${card.name}"!\n\n` +
        `🎲 Tiro Attacco Magico: 1d20+${profBonus + spellMod} = ${atkTotal} (Dado: ${d20})\n` +
        `🛡️ CD Salvezza per i Nemici: ${spellDC}\n` +
        `💥 Danno / Effetto: ${card.damage || 'Effetto magico applicato!'}\n` +
        `📖 Lore: ${card.desc || ''}`);
};

// ============================================================================
// MODALE BAZAR / COMMERCIO GIOCATORE (ACQUISTO CON MONETE D'ORO)
// ============================================================================
window.openPlayerMarketModal = function() {
  const modal = document.getElementById('player-market-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  window.renderPlayerMarket();
};

window.closePlayerMarketModal = function() {
  const modal = document.getElementById('player-market-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.renderPlayerMarket = function() {
  const ch = window.getMyCharacter();
  if (!ch) return;

  const playerGold = ch.gold !== undefined ? ch.gold : 50;
  const goldEl = document.getElementById('pmm-player-gold');
  if (goldEl) goldEl.textContent = `${playerGold} mo`;

  const activeCamp = window.dbState.campaigns && Object.values(window.dbState.campaigns).find(c => c.members && c.members[window.currentUser]);
  const grid = document.getElementById('pmm-items-grid');
  if (!grid) return;

  if (!activeCamp) {
    grid.innerHTML = `
      <div class="col-span-full norse-panel rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
        <p>Non sei ancora unito ad alcuna campagna attiva.</p>
        <p class="text-sky-300">Unisciti a una campagna dalla scheda "Le Tue Campagne" con il codice fornito dal DM per accedere al Bazar!</p>
      </div>
    `;
    return;
  }

  const marketItems = activeCamp.market || [];
  if (marketItems.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full norse-panel rounded-2xl p-8 text-center text-xs text-slate-400 space-y-2">
        <p class="text-amber-300 font-bold text-sm">Il Bazar del Dungeon Master è attualmente vuoto.</p>
        <p>Il DM non ha ancora inviato merci in vendita per la campagna "${activeCamp.title}". Chiedigli di inserire nuove armi, pozioni e armature dalla sua sezione Commercio!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = marketItems.map(item => {
    const costGold = item.priceGold !== undefined ? item.priceGold : (window.parseCostToGold ? window.parseCostToGold(item.cost) : 10);
    const canAfford = playerGold >= costGold;
    const art = item.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[item.type]) || 'assets/items/spada_ulfberht.jpg';

    return `
      <div class="norse-panel rounded-2xl p-4 border border-amber-500/40 bg-slate-950/80 space-y-3 flex flex-col justify-between shadow-xl group hover:border-amber-400 transition">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase">${item.type}</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">${item.rarity || 'Comune'}</span>
        </div>

        <div class="flex gap-3 items-center">
          <img src="${art}" onclick="window.openCardDetailModal('${item.id || item.canonicalId}')" class="w-14 h-20 rounded-xl object-cover border border-amber-500/50 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
          <div class="flex-1 min-w-0 space-y-1">
            <h4 class="font-cinzel font-bold text-xs text-white truncate cursor-pointer hover:text-amber-300" onclick="window.openCardDetailModal('${item.id || item.canonicalId}')">${item.name}</h4>
            <p class="text-[10px] text-amber-300 font-mono font-bold">${item.damage || 'Effetto Speciale'}</p>
            <p class="text-[10px] text-slate-400 line-clamp-2">${item.desc || ''}</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <span class="text-base">💰</span>
            <strong class="font-mono text-sm text-amber-300">${costGold} mo</strong>
          </div>

          ${canAfford ? `
            <button type="button" onclick="window.buyMarketItem('${item.marketId}')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-xs shadow-md transition flex items-center gap-1 active:scale-95">
              🛒 Compra
            </button>
          ` : `
            <button type="button" disabled class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-red-400 font-cinzel font-bold text-[10px] cursor-not-allowed">
              Mancano ${costGold - playerGold} mo
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
};

window.buyMarketItem = function(marketId) {
  const ch = window.getMyCharacter();
  if (!ch) return;
  const activeCamp = window.dbState.campaigns && Object.values(window.dbState.campaigns).find(c => c.members && c.members[window.currentUser]);
  if (!activeCamp || !activeCamp.market) return;

  const itemIdx = activeCamp.market.findIndex(i => i.marketId === marketId);
  if (itemIdx === -1) return alert("Questo oggetto non è più disponibile nel Bazar.");

  const item = activeCamp.market[itemIdx];
  const costGold = item.priceGold !== undefined ? item.priceGold : (window.parseCostToGold ? window.parseCostToGold(item.cost) : 10);
  const playerGold = ch.gold !== undefined ? ch.gold : 50;

  if (playerGold < costGold) {
    alert(`Monete d'Oro insufficienti! Possiedi ${playerGold} mo, ma questo oggetto costa ${costGold} mo.`);
    return;
  }

  // 1. Scala le monete d'oro
  ch.gold = playerGold - costGold;

  // 2. Crea istanza della carta nell'inventario del giocatore
  const purchasedCard = {
    ...item,
    id: 'bought_' + (item.id || 'card') + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  };
  delete purchasedCard.marketId;

  if (!ch.cards) ch.cards = [];
  ch.cards.unshift(purchasedCard);

  // 3. Rimuovi dal mercato della campagna
  activeCamp.market.splice(itemIdx, 1);

  // 4. Sincronizza nel database e nella campagna
  if (activeCamp.members && activeCamp.members[window.currentUser]) {
    activeCamp.members[window.currentUser].gold = ch.gold;
    activeCamp.members[window.currentUser].cards = ch.cards;
  }
  window.propagateCharacterToCampaigns(ch);
  window.saveDB();

  // 5. Aggiorna UI
  window.renderPlayerMarket();
  window.renderDdbSectionContent(ch);
  if (typeof window.renderActiveCharacter === 'function') window.renderActiveCharacter();

  alert(`⚔️ Acquisto completato con successo!\n"${item.name}" è ora nel tuo inventario.\nHai speso ${costGold} monete d'oro (Residuo: ${ch.gold} mo).`);
};

window.initCloudConnection();
if (window.currentUser && window.dbState.users && window.dbState.users[window.currentUser]) {
  window.enterAfterLogin();
}
