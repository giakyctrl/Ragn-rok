// ============================================================================
// MODULO DUNGEON MASTER: GESTIONE CAMPAGNA, CONDIZIONI LIVE, CARTE & LEVEL UP
// ============================================================================
window.activeDmWorkspaceCode = null;
window.dmManageFilter = 'tutti';
window.dmCustomCardImage = (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma) || "";
window.swipedCampaignCode = null;
window.dmTouchStartX = 0;

window.dmCreateCampaign = function() {
  const input = document.getElementById('dm-new-camp-title');
  const title = input.value.trim() || 'Saga di Midgardr';
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
  if (!camp || !confirm(`Eliminare definitivamente la campagna "${camp.title}"?`)) return;
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
  const mView = document.getElementById('dm-subview-manage');
  const pView = document.getElementById('dm-subview-party');
  const cView = document.getElementById('dm-subview-create');

  mView.classList.toggle('hidden', tab !== 'manage');
  pView.classList.toggle('hidden', tab !== 'party');
  cView.classList.toggle('hidden', tab !== 'create');

  const activeSub = tab === 'manage' ? mView : tab === 'party' ? pView : cView;
  activeSub.classList.remove('animate-page-switch');
  void activeSub.offsetWidth;
  activeSub.classList.add('animate-page-switch');

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

// Permette al DM di cambiare direttamente la condizione di un giocatore (cambiandogli lo sfondo in tempo reale)
window.dmSetMemberCondition = function(uKey, newCondition) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.condition = newCondition;
  if (window.dbState.users[uKey]?.characters) {
    const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
    if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
  }
  window.saveDB();
};

window.dmMassLevelUp = function() {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  if (!confirm("Vuoi promuovere di +1 Livello tutti gli eroi della campagna?")) return;

  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    mChar.pendingLevelUp = true;
    if (window.dbState.users[uKey]?.characters) {
      const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
    }
  });
  window.saveDB();
  alert("Promozione di livello inviata a tutti i giocatori del party!");
};

window.dmSingleLevelUp = function(uKey) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.pendingLevelUp = true;
  if (window.dbState.users[uKey]?.characters) {
    const idx = window.dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
    if (idx !== -1) window.dbState.users[uKey].characters[idx] = mChar;
  }
  window.saveDB();
  alert(`Promozione di livello inviata a ${mChar.name}!`);
};

window.dmTriggerTactical = function(type) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    if (type === 'SHORT_REST') mChar.hp = Math.min(mChar.maxHp, mChar.hp + Math.max(4, Math.round(mChar.maxHp * 0.25)));
    else if (type === 'LONG_REST') {
      mChar.hp = mChar.maxHp;
      mChar.condition = 'Normale';
    }
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
    name: document.getElementById('dmc-name')?.value.trim() || 'Reliquia di Asgardr',
    type: type,
    rarity: document.getElementById('dmc-rarity')?.value || 'raro',
    damage: document.getElementById('dmc-dmg')?.value.trim() || '1d8+2',
    weight: parseFloat(document.getElementById('dmc-weight')?.value) || 2,
    img: window.dmCustomCardImage || window.CARD_ARTWORKS[type],
    desc: document.getElementById('dmc-desc')?.value.trim() || 'Smistata automaticamente nella sezione corretta della scheda.'
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
                  <span class="text-[10px] font-cinzel uppercase text-amber-400">Codice: ${c.code} • ${cnt} Eroi</span>
                  <h4 class="font-cinzel font-bold text-base text-white">${c.title}</h4>
                </div>
                <div class="flex items-center gap-2">
                  <a href="mappa.html?camp=${encodeURIComponent(c.code)}&role=DM" target="_blank" onclick="event.stopPropagation()" class="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-cinzel font-bold text-[10px] flex items-center gap-1 shadow transition">
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
                    MAPPA DM
                  </a>
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
  const dmMapLink = document.getElementById('dm-map-link');
  if (dmMapLink) dmMapLink.href = `mappa.html?camp=${encodeURIComponent(camp.code)}&role=DM`;

  const members = Object.entries(camp.members || {});
  const condOptions = ['Normale', 'Avvelenato', 'Stordito', 'Invisibile', 'Spaventato', 'Prono'];

  document.getElementById('dm-ws-players-list').innerHTML = members.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 col-span-2 text-center">Condividi il codice <strong>${camp.code}</strong> con i giocatori!</div>`
    : members.map(([uKey, mChar]) => {
        const pct = Math.round((mChar.hp / mChar.maxHp) * 100);
        const curCond = (mChar.condition === 'Normal' ? 'Normale' : mChar.condition === 'Stunned' ? 'Stordito' : mChar.condition) || 'Normale';
        return `
          <div class="norse-panel rounded-2xl p-4 space-y-2.5 border border-slate-800">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2.5">
                <img src="${mChar.avatar}" class="w-11 h-11 rounded-xl object-cover border border-sky-400">
                <div>
                  <h4 class="font-bold text-sm text-white">${mChar.name}</h4>
                  <p class="text-[10px] text-sky-300">${mChar.clanName ? mChar.clanName.split(' (')[0] + ' • ' : ''}${mChar.className} (Liv.${mChar.level || 1})</p>
                  <p class="text-[9px] text-slate-400">${mChar.subclass ? mChar.subclass.split(' (')[0] : ''} • CA ${mChar.ac}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-extrabold text-white block">${mChar.hp}/${mChar.maxHp} PF</span>
                <button type="button" onclick="window.dmSingleLevelUp('${uKey}')" class="mt-1 px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold">⬆️ +1 Liv</button>
              </div>
            </div>

            <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden"><div class="h-full bg-sky-400" style="width:${pct}%"></div></div>

            <div class="grid grid-cols-4 gap-1.5">
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', -5)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-5</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', -1)" class="py-1 bg-red-950 text-red-300 rounded text-[10px] font-bold">-1</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', 1)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+1</button>
              <button type="button" onclick="window.dmSingleAdjustHP('${uKey}', 5)" class="py-1 bg-emerald-950 text-emerald-300 rounded text-[10px] font-bold">+5</button>
            </div>

            <div class="pt-1 flex items-center justify-between gap-2 border-t border-slate-800/80 text-[10px]">
              <span class="text-slate-400">Condizione Sfondo:</span>
              <select onchange="window.dmSetMemberCondition('${uKey}', this.value)" class="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-amber-300 font-bold">
                ${condOptions.map(co => `<option value="${co}" ${curCond === co ? 'selected' : ''}>${co}</option>`).join('')}
              </select>
            </div>
          </div>
        `;
      }).join('');

  const ownerSel = document.getElementById('dmc-owner');
  if (ownerSel) {
    const prev = ownerSel.value;
    ownerSel.innerHTML = `<option value="CHEST">Cassa del Dungeon (Bottino condiviso)</option>` +
      members.map(([uKey, mChar]) => `<option value="${uKey}">Consegna a: ${mChar.name}</option>`).join('');
    if (prev) ownerSel.value = prev;
  }

  let allCards = [];
  (camp.chest || []).forEach(c => allCards.push({ card: c, ownerKey: 'CHEST', ownerName: 'Cassa del Dungeon' }));
  members.forEach(([uKey, mChar]) => {
    (mChar.cards || []).forEach(c => {
      const destSec = window.classifyCardToDdbSection(c);
      const secName = destSec === 'actions' ? 'Azioni' : destSec === 'spells' ? 'Incantesimi' : 'Inventario';
      allCards.push({ card: c, ownerKey: uKey, ownerName: `${mChar.name} (${secName})` });
    });
  });

  const filtered = window.dmManageFilter === 'tutti' ? allCards : allCards.filter(x => x.card.type === window.dmManageFilter);
  const grid = document.getElementById('dm-manage-cards-grid');
  if (grid) {
    grid.innerHTML = filtered.length === 0
      ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400 col-span-2">Nessuna carta trovata.</div>`
      : filtered.map(item => `
          <div class="norse-panel rounded-2xl p-3 flex gap-3 items-center border border-slate-800">
            <img src="${item.card.img || window.CARD_ARTWORKS.arma}" onclick="window.openCardDetailModal('${item.card.id}')" class="w-14 h-20 rounded-lg object-cover border border-amber-500/40 flex-shrink-0 cursor-pointer hover:scale-105 transition shadow" title="Tocca per ingrandire la carta">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex justify-between items-center"><h4 class="font-bold text-xs text-white truncate cursor-pointer hover:text-amber-300" onclick="window.openCardDetailModal('${item.card.id}')" title="Tocca per ingrandire la carta">${item.card.name}</h4><button type="button" onclick="window.dmDeleteCardFromCampaign('${item.card.id}', '${item.ownerKey}')" class="text-[10px] text-red-400 font-bold ml-1 hover:underline">Elimina</button></div>
              <p class="text-[10px] text-amber-300 uppercase font-bold">${item.card.type} • ${item.card.rarity}</p>
              <p class="text-[10px] text-sky-300 font-semibold">${item.ownerName}</p>
              <select onchange="window.dmReassignCard('${item.card.id}', '${item.ownerKey}', this.value)" class="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[10px] text-slate-300">
                <option value="${item.ownerKey}">Sposta a...</option>
                <option value="CHEST">Sposta nella Cassa</option>
                ${members.map(([uKey, mChar]) => `<option value="${uKey}">Dai a: ${mChar.name}</option>`).join('')}
              </select>
            </div>
          </div>
        `).join('');
  }
};
