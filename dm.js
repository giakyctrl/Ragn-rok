// ============================================================================
// MODULO DUNGEON MASTER: CREAZIONE CARTE ESCLUSIVA DM & SMISTAMENTO AUTOMATICO
// ============================================================================
window.activeDmWorkspaceCode = null;
window.dmManageFilter = 'tutti';
window.dmCustomCardImage = (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma) || "";
window.swipedCampaignCode = null;
window.dmTouchStartX = 0;

window.dmCreateCampaign = function() {
  const input = document.getElementById('dm-new-camp-title');
  const title = input.value.trim() || 'Saga di Midgard';
  const code = 'YGG-' + Math.floor(1000 + Math.random() * 9000);

  if (!window.dbState.campaigns) window.dbState.campaigns = {};
  window.dbState.campaigns[code] = {
    code: code, title: title, dmUser: window.currentUser,
    members: {}, chest: [], globalEvent: null
  };
  input.value = '';
  window.saveDB();
};

window.handleCampTouchStart = function(e) { window.dmTouchStartX = e.changedTouches[0].screenX; };
window.handleCampTouchEnd = function(e, code) {
  const diff = e.changedTouches[0].screenX - window.dmTouchStartX;
  if (diff < -50) { window.swipedCampaignCode = code; window.renderDmViews(); }
  else if (diff > 40 && window.swipedCampaignCode === code) { window.swipedCampaignCode = null; window.renderDmViews(); }
};

window.toggleSwipeDeleteState = function(e, code) {
  e.stopPropagation();
  window.swipedCampaignCode = (window.swipedCampaignCode === code) ? null : code;
  window.renderDmViews();
};

window.dmDeleteCampaign = function(e, code) {
  e.stopPropagation();
  const camp = window.dbState.campaigns[code];
  if (!camp || !confirm(`Eliminare la campagna "${camp.title}"?`)) return;
  delete window.dbState.campaigns[code];
  if (window.activeDmWorkspaceCode === code) window.activeDmWorkspaceCode = null;
  window.swipedCampaignCode = null;
  window.saveDB();
};

window.openDmCampaignWorkspace = function(code) {
  if (window.swipedCampaignCode === code) { window.swipedCampaignCode = null; window.renderDmViews(); return; }
  window.activeDmWorkspaceCode = code;
  document.getElementById('mode-standard-views').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.add('hidden');
  document.getElementById('mode-dm-campaign-workspace').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.remove('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.remove('hidden');
  window.switchDmWorkspaceTab('party');
};

window.exitDmCampaignWorkspace = function() {
  window.activeDmWorkspaceCode = null;
  window.switchStandardNav('dm');
};

window.switchDmWorkspaceTab = function(tab) {
  document.getElementById('dm-subview-manage').classList.toggle('hidden', tab !== 'manage');
  document.getElementById('dm-subview-party').classList.toggle('hidden', tab !== 'party');
  document.getElementById('dm-subview-create').classList.toggle('hidden', tab !== 'create');

  document.getElementById('dmnav-manage').className = tab === 'manage' ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2' : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  document.getElementById('dmnav-create').className = tab === 'create' ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2' : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';
  window.renderDmViews();
  if (tab === 'create') window.updateDmCardPreview();
};

window.dmMassAdjustHP = function(delta) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    mChar.hp = Math.max(0, Math.min(mChar.maxHp, mChar.hp + delta));
    if (window.dbState.users[uKey]?.characters) {
      const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
    }
  });
  window.saveDB();
};

window.dmSingleAdjustHP = function(uKey, delta) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.hp = Math.max(0, Math.min(mChar.maxHp, mChar.hp + delta));
  if (window.dbState.users[uKey]?.characters) {
    const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
    if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
  }
  window.saveDB();
};

window.dmTriggerTactical = function(type) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    if (type === 'SHORT_REST') mChar.hp = Math.min(mChar.maxHp, mChar.hp + Math.max(4, Math.round(mChar.maxHp * 0.25)));
    else if (type === 'LONG_REST') mChar.hp = mChar.maxHp;
    if (window.dbState.users[uKey]?.characters) {
      const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
    }
  });
  const evt = { type: type, timestamp: Date.now() };
  camp.globalEvent = evt;
  window.lastSeenEventTimestamp = evt.timestamp;
  window.displayGlobalAnimation(evt);
  window.saveDB();
};

window.handleDmCardImageUpload = function(e) {
  const file = e.target.files[0];
  if (!file) return;
  window.autoFitImageFile(file, 400, 260, url => {
    window.dmCustomCardImage = url;
    window.updateDmCardPreview();
  });
};

window.handleDmCardUrlInput = function(url) {
  if (url && url.trim().startsWith('http')) {
    window.dmCustomCardImage = url.trim();
    window.updateDmCardPreview();
  }
};

window.updateDmCardPreview = function() {
  const type = document.getElementById('dmc-type')?.value || 'arma';
  const preview = {
    id: 'prev',
    name: document.getElementById('dmc-name')?.value.trim() || 'Nuova Carta DM',
    type: type,
    rarity: document.getElementById('dmc-rarity')?.value || 'raro',
    damage: document.getElementById('dmc-dmg')?.value.trim() || '1d8+2',
    weight: parseFloat(document.getElementById('dmc-weight')?.value) || 2,
    img: window.dmCustomCardImage || window.CARD_ARTWORKS[type],
    desc: document.getElementById('dmc-desc')?.value.trim() || 'Smistata automaticamente nella scheda del giocatore.'
  };
  const holder = document.getElementById('dm-card-live-preview');
  if (holder) holder.innerHTML = window.buildYgoCardHTML(preview, false);
};

window.dmCreateAndAssignCard = function(e) {
  e.preventDefault();
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;

  const type = document.getElementById('dmc-type').value;
  const ownerTarget = document.getElementById('dmc-owner').value;
  const newCard = {
    id: 'dmcard_' + Date.now(),
    name: document.getElementById('dmc-name').value.trim(),
    type: type,
    rarity: document.getElementById('dmc-rarity').value,
    damage: document.getElementById('dmc-dmg').value.trim(),
    weight: parseFloat(document.getElementById('dmc-weight').value) || 1.5,
    img: window.dmCustomCardImage || window.CARD_ARTWORKS[type],
    desc: document.getElementById('dmc-desc').value.trim()
  };

  if (ownerTarget === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(newCard);
  } else if (camp.members && camp.members[ownerTarget]) {
    const mChar = camp.members[ownerTarget];
    if (!mChar.cards) mChar.cards = [];
    mChar.cards.unshift(newCard);
    if (window.dbState.users[ownerTarget]?.characters) {
      const idx = window.dbState.users[ownerTarget].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) window.dbState.users[ownerTarget].characters[idx] = mChar;
    }
  }

  e.target.reset();
  window.dmCustomCardImage = window.CARD_ARTWORKS.arma;
  window.updateDmCardPreview();
  window.saveDB();
  window.switchDmWorkspaceTab('manage');
};

window.setDmManageFilter = function(f) {
  window.dmManageFilter = f;
  ['tutti', 'arma', 'scudo', 'armatura', 'incantesimo', 'oggetto'].forEach(k => {
    const btn = document.getElementById('dmf-' + k);
    if (btn) btn.className = k === f ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950' : 'px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300';
  });
  window.renderDmViews();
};

window.dmReassignCard = function(cardId, fromKey, toKey) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || fromKey === toKey) return;
  let moved = null;

  if (fromKey === 'CHEST') {
    const idx = (camp.chest || []).findIndex(c => c.id === cardId);
    if (idx !== -1) moved = camp.chest.splice(idx, 1)[0];
  } else if (camp.members?.[fromKey]) {
    const mChar = camp.members[fromKey];
    const idx = (mChar.cards || []).findIndex(c => c.id === cardId);
    if (idx !== -1) {
      moved = mChar.cards.splice(idx, 1)[0];
      const uIdx = (window.dbState.users[fromKey]?.characters || []).findIndex(c => c.id === mChar.id);
      if (uIdx !== -1) window.dbState.users[fromKey].characters[uIdx] = mChar;
    }
  }
  if (!moved) return;

  if (toKey === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(moved);
  } else if (camp.members?.[toKey]) {
    const tChar = camp.members[toKey];
    if (!tChar.cards) tChar.cards = [];
    tChar.cards.unshift(moved);
    const uIdx = (window.dbState.users[toKey]?.characters || []).findIndex(c => c.id === tChar.id);
    if (uIdx !== -1) window.dbState.users[toKey].characters[uIdx] = tChar;
  }
  window.saveDB();
};

window.dmDeleteCardFromCampaign = function(cardId, ownerKey) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  if (ownerKey === 'CHEST') {
    camp.chest = (camp.chest || []).filter(c => c.id !== cardId);
  } else if (camp.members?.[ownerKey]) {
    const mChar = camp.members[ownerKey];
    mChar.cards = (mChar.cards || []).filter(c => c.id !== cardId);
    const uIdx = (window.dbState.users[ownerKey]?.characters || []).findIndex(c => c.id === mChar.id);
    if (uIdx !== -1) window.dbState.users[ownerKey].characters[uIdx] = mChar;
  }
  window.saveDB();
};

window.renderDmViews = function() {
  if (!window.currentUser) return;
  const myCamps = Object.values(window.dbState.campaigns || {}).filter(c => c.dmUser === window.currentUser || window.isCurrentUserAdmin());
  const listEl = document.getElementById('dm-campaigns-swipe-list');

  if (listEl) {
    listEl.innerHTML = myCamps.length === 0
      ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400">Nessuna campagna creata.</div>`
      : myCamps.map(c => {
          const cnt = Object.keys(c.members || {}).length;
          const isSwiped = window.swipedCampaignCode === c.code;
          return `
            <div class="swipe-row-container">
              <div class="swipe-delete-bg">
                <button type="button" onclick="window.dmDeleteCampaign(event, '${c.code}')" class="px-4 py-2 font-cinzel font-black text-xs text-white">ELIMINA</button>
              </div>
              <div onclick="window.openDmCampaignWorkspace('${c.code}')" ontouchstart="window.handleCampTouchStart(event)" ontouchend="window.handleCampTouchEnd(event, '${c.code}')" class="swipe-front-card ${isSwiped ? 'swiped-left' : ''} norse-panel rounded-2xl p-4 flex justify-between items-center cursor-pointer border border-amber-500/30">
                <div>
                  <span class="text-[10px] font-cinzel uppercase text-amber-400">Codice: ${c.code} • ${cnt} Giocatori</span>
                  <h4 class="font-cinzel font-bold text-base text-white">${c.title}</h4>
                </div>
                <div class="flex items-center gap-2">
                  <button type="button" onclick="window.toggleSwipeDeleteState(event, '${c.code}')" class="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[10px] text-slate-400">Elimina</button>
                  <span class="font-cinzel font-bold text-xs text-sky-300">APRI &rarr;</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
  }

  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;

  document.getElementById('dm-ws-title').textContent = camp.title;
  document.getElementById('dm-ws-code').textContent = camp.code;

  const members = Object.entries(camp.members || {});
  document.getElementById('dm-ws-players-list').innerHTML = members.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 col-span-2 text-center">Condividi il codice <strong>${camp.code}</strong> con i giocatori!</div>`
    : members.map(([uKey, mChar]) => {
        const pct = Math.round((mChar.hp / mChar.maxHp) * 100);
        return `
          <div class="norse-panel rounded-2xl p-4 space-y-2.5 border border-slate-800">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-2.5">
                <img src="${mChar.avatar}" class="w-11 h-11 rounded-xl object-cover border border-sky-400">
                <div><h4 class="font-bold text-sm text-white">${mChar.name}</h4><p class="text-[10px] text-sky-300">${mChar.race} ${mChar.className} ${mChar.level || 1}</p></div>
              </div>
              <div class="text-right"><span class="text-xs font-extrabold text-white block">${mChar.hp}/${mChar.maxHp} HP</span><span class="text-[10px] text-slate-400">CA ${mChar.ac}</span></div>
            </div>
            <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden"><div class="h-full bg-sky-400" style="width:${pct}%"></div></div>
            <div class="grid grid-cols-4 gap-1.5">
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', -5)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-5</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', -1)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-1</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', 1)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+1</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', 5)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+5</button>
            </div>
          </div>
        `;
      }).join('');

  const ownerSel = document.getElementById('dmc-owner');
  if (ownerSel) {
    const prev = ownerSel.value;
    ownerSel.innerHTML = `<option value="CHEST">Cassa del Dungeon (Bottino condiviso)</option>` +
      members.map(([uKey, mChar]) => `<option value="${uKey}">Consegna nell'inventario di: ${mChar.name}</option>`).join('');
    if (prev) ownerSel.value = prev;
  }

  let allCards = [];
  (camp.chest || []).forEach(c => allCards.push({ card: c, ownerKey: 'CHEST', ownerName: 'Cassa del Dungeon' }));
  members.forEach(([uKey, mChar]) => {
    (mChar.cards || []).forEach(c => {
      const destSec = window.classifyCardToDdbSection(c).toUpperCase();
      allCards.push({ card: c, ownerKey: uKey, ownerName: `${mChar.name} (Sezione: ${destSec})` });
    });
  });

  const filtered = window.dmManageFilter === 'tutti' ? allCards : allCards.filter(x => x.card.type === window.dmManageFilter);
  const grid = document.getElementById('dm-manage-cards-grid');
  if (grid) {
    grid.innerHTML = filtered.length === 0
      ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400 col-span-2">Nessuna carta in questa categoria.</div>`
      : filtered.map(item => `
          <div class="norse-panel rounded-2xl p-3 flex gap-3 items-center border border-slate-800">
            <img src="${item.card.img || window.CARD_ARTWORKS.arma}" class="w-14 h-20 rounded-lg object-cover border border-amber-500/40 flex-shrink-0">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex justify-between"><h4 class="font-bold text-xs text-white truncate">${item.card.name}</h4><button type="button" onclick="window.dmDeleteCardFromCampaign('${item.card.id}', '${item.ownerKey}')" class="text-[10px] text-red-400 font-bold">Elimina</button></div>
              <p class="text-[10px] text-amber-300 uppercase font-bold">${item.card.type} • ${item.card.rarity} • ${item.card.damage}</p>
              <p class="text-[10px] text-sky-300 font-semibold">${item.ownerName}</p>
              <select onchange="window.dmReassignCard('${item.card.id}', '${item.ownerKey}', this.value)" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300">
                <option value="${item.ownerKey}">Trasferisci a...</option>
                <option value="CHEST">Sposta nella Cassa del Dungeon</option>
                ${members.map(([uKey, mChar]) => `<option value="${uKey}">Dai a: ${mChar.name}</option>`).join('')}
              </select>
            </div>
          </div>
        `).join('');
  }
};
