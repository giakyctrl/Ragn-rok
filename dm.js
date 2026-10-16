// ============================================================================
// MODULO DUNGEON MASTER: GESTIONE CAMPAGNA, CONDIZIONI LIVE, CARTE & LEVEL UP
// ============================================================================
window.activeDmWorkspaceCode = null;
window.dmCreateActiveMode = 'compendium';
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
window.dmCreateActiveMode = 'compendium';
  window.swipedCampaignCode = null;
  window.saveDB();
};

window.openDmCampaignWorkspace = function(code) {
  if (window.swipedCampaignCode === code) { window.swipedCampaignCode = null; window.renderDmViews(); return; }
  window.activeDmWorkspaceCode = code;
  try { sessionStorage.setItem('yggdrasill_active_dm_camp', code); } catch(e){}
  document.getElementById('mode-standard-views').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.add('hidden');
  document.getElementById('mode-dm-campaign-workspace').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.remove('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.remove('hidden');
  window.switchDmWorkspaceTab('party');
};

window.exitDmCampaignWorkspace = function() {
  window.activeDmWorkspaceCode = null;
  try { sessionStorage.removeItem('yggdrasill_active_dm_camp'); } catch(e){}
  window.dmCreateActiveMode = 'compendium';
  window.switchStandardNav('dm');
};

window.switchDmWorkspaceTab = function(tab) {
  const mView = document.getElementById('dm-subview-manage');
  const pView = document.getElementById('dm-subview-party');
  const cView = document.getElementById('dm-subview-create');
  const tView = document.getElementById('dm-subview-trade');

  if (mView) mView.classList.toggle('hidden', tab !== 'manage');
  if (pView) pView.classList.toggle('hidden', tab !== 'party');
  if (cView) cView.classList.toggle('hidden', tab !== 'create');
  if (tView) tView.classList.toggle('hidden', tab !== 'trade');

  const activeSub = tab === 'manage' ? mView : tab === 'party' ? pView : tab === 'create' ? cView : tView;
  if (activeSub) {
    activeSub.classList.remove('animate-page-switch');
    void activeSub.offsetWidth;
    activeSub.classList.add('animate-page-switch');
  }

  const setClass = (id, isActive) => {
    const el = document.getElementById(id);
    if (el) el.className = isActive ? 'flex flex-col items-center gap-1 text-amber-400 w-20 py-2' : 'flex flex-col items-center gap-1 text-slate-400 w-20 py-2';
  };
  setClass('dmnav-manage', tab === 'manage');
  setClass('dmnav-trade', tab === 'trade');
  setClass('dmnav-create', tab === 'create');
  const partyLabel = document.getElementById('dmnav-party-label');
  if (partyLabel) partyLabel.className = tab === 'party' ? 'font-cinzel font-black text-[9px] sm:text-[10px] text-amber-300 mt-1 uppercase' : 'font-cinzel font-bold text-[9px] sm:text-[10px] text-slate-400 mt-1 uppercase';

  window.renderDmViews();
  if (tab === 'trade') {
    window.renderDmTradeViews();
  }
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
  if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(uKey, mChar);
  window.saveDB();
};

// Permette al DM di cambiare direttamente la condizione di un giocatore (cambiandogli lo sfondo in tempo reale)
window.dmSetMemberCondition = function(uKey, newCondition) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.condition = newCondition;
  if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(uKey, mChar);
  window.saveDB();
};

window.dmMassLevelUp = function() {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  if (!confirm("Vuoi promuovere di +1 Livello tutti gli eroi della campagna?")) return;

  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    mChar.pendingLevelUp = true;
    if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(uKey, mChar);
  });
  window.saveDB();
  alert("Promozione di livello inviata a tutti i giocatori del party!");
};

window.dmSingleLevelUp = function(uKey) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.pendingLevelUp = true;
  if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(uKey, mChar);
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

window.switchDmCreateMode = function(mode) {
  window.dmCreateActiveMode = mode;
  const compSec = document.getElementById('dm-create-mode-compendium');
  const forgeSec = document.getElementById('dm-create-mode-forge');
  const compBtn = document.getElementById('dmc-tab-comp');
  const forgeBtn = document.getElementById('dmc-tab-forge');

  if (compSec) compSec.classList.toggle('hidden', mode !== 'compendium');
  if (forgeSec) forgeSec.classList.toggle('hidden', mode !== 'forge');

  if (compBtn) {
    compBtn.className = mode === 'compendium'
      ? 'px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5 transition'
      : 'px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition';
  }
  if (forgeBtn) {
    forgeBtn.className = mode === 'forge'
      ? 'px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-amber-500 text-slate-950 shadow-md flex items-center gap-1.5 transition'
      : 'px-4 py-2 rounded-xl font-cinzel font-bold text-xs bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition';
  }

  if (mode === 'compendium') {
    window.renderDmCompendiumCards();
  } else {
    window.updateDmCardPreview();
  }
};

window.renderDmCompendiumCards = function() {
  const container = document.getElementById('dm-compendium-cards-grid');
  if (!container) return;

  const q = (document.getElementById('dm-comp-search')?.value || '').toLowerCase().trim();
  const filterType = document.getElementById('dm-comp-filter-type')?.value || 'all';

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);

  const filtered = all.filter(c => {
    if (filterType !== 'all') {
      const cType = (c.type || '').toLowerCase();
      if (filterType === 'pozione') {
        if (!cType.includes('pozione') && !c.name.toLowerCase().includes('pozione') && !c.name.toLowerCase().includes('idromele')) return false;
      } else if (cType !== filterType) {
        return false;
      }
    }
    if (q) {
      const matchName = c.name.toLowerCase().includes(q);
      const matchDesc = (c.desc || '').toLowerCase().includes(q);
      const matchDmg = (c.damage || '').toLowerCase().includes(q);
      const matchType = (c.type || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchDmg && !matchType) return false;
    }
    return true;
  });

  const countBadge = document.getElementById('dm-comp-count-badge');
  if (countBadge) {
    countBadge.textContent = `${filtered.length} di ${all.length} Carte`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div class="norse-panel rounded-2xl p-8 text-center text-xs text-slate-400 col-span-full">Nessuna carta trovata nel Compendio con i filtri correnti.</div>`;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const rarityClass = (c.rarity || 'comune').toLowerCase().replace(/\s+/g, '-');
    const typeClass = (c.type || 'arma').toLowerCase();
    const artUrl = c.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[c.type]) || (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma) || 'assets/items/spada_ulfberht.jpg';
    const costText = c.cost ? `💰 ${c.cost}` : '—';
    const statText = c.damage ? `EFF: ${c.damage}` : (c.weight ? `${c.weight} kg` : (c.range || '18m'));

    return `
      <div class="ygo-card type-${typeClass} rarity-${rarityClass} group flex flex-col justify-between hover:scale-[1.02] transition duration-200">
        <div class="card-glass-header flex justify-between items-center px-2 py-1 rounded bg-black/60 border border-white/10">
          <span class="font-cinzel font-bold text-[11px] text-amber-200 truncate cursor-pointer hover:text-amber-100" onclick="window.openCardDetailModal('${c.id}')" title="Clicca per espandere">${c.name}</span>
          <span class="text-[9px] font-mono text-amber-300 font-bold">${costText}</span>
        </div>

        <div class="flex justify-between items-center px-1 text-[9px] uppercase font-bold text-slate-300">
          <span>${c.type}</span>
          <span class="text-amber-300">${c.rarity || 'Comune'}</span>
        </div>

        <div class="ygo-art cursor-pointer" onclick="window.openCardDetailModal('${c.id}')" title="Clicca per ispezionare la carta in grande">
          <img src="${artUrl}" alt="${c.name}" loading="lazy" class="w-full h-full object-cover">
        </div>

        <div class="ygo-lore">
          <p class="text-[10px] leading-snug line-clamp-3 overflow-hidden text-slate-300 cursor-pointer" onclick="window.openCardDetailModal('${c.id}')">${c.desc || ''}</p>
          <div class="border-t border-amber-900/30 pt-1 flex justify-between font-mono text-[10px] font-bold">
            <span class="text-red-900 font-extrabold truncate">${statText}</span>
            <span class="text-slate-400">${c.range ? c.range : (c.weight ? c.weight + ' kg' : '')}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-1.5 pt-1">
          <button type="button" onclick="window.openCardDetailModal('${c.id}')" class="py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 font-cinzel font-bold text-[10px] transition border border-sky-400/30 flex items-center justify-center gap-1 shadow">
            🔍 DETTAGLI
          </button>
          <button type="button" onclick="window.dmAssignCardFromCompendium('${c.id}')" class="py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-[10px] transition flex items-center justify-center gap-1 shadow">
            ➕ ASSEGNA
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.dmAssignCardFromCompendium = function(cardId) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) {
    alert("Nessuna campagna attiva selezionata.");
    return;
  }

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
  const original = all.find(c => c.id === cardId);
  if (!original) {
    alert("Carta non trovata nel database.");
    return;
  }

  const targetSelect = document.getElementById('dm-comp-target');
  const targetKey = targetSelect ? targetSelect.value : 'CHEST';

  // Istanziazione univoca per il giocatore/forziere
  const assignedCard = {
    ...original,
    id: 'inst_' + original.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
  };

  let targetName = 'Cassa del Dungeon';

  if (targetKey === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(assignedCard);
    targetName = 'Cassa del Dungeon (Bottino Condiviso)';
  } else if (camp.members && camp.members[targetKey]) {
    const mChar = camp.members[targetKey];
    if (!mChar.cards) mChar.cards = [];
    mChar.cards.unshift(assignedCard);
    targetName = mChar.name;

    if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(targetKey, mChar);
  }

  window.saveDB();
  alert(`⚔️ Carta "${original.name}" assegnata con successo a: ${targetName}!`);
  window.renderDmViews();
};

window.updateDmCardPreview = function() {
  const type = document.getElementById('dmc-type')?.value || 'arma';
  const preview = {
    id: 'prev',
    name: document.getElementById('dmc-name')?.value.trim() || 'Reliquia di Asgardr',
    type: type,
    rarity: document.getElementById('dmc-rarity')?.value || 'raro',
    damage: document.getElementById('dmc-dmg')?.value.trim() || '1d8+2',
    weight: document.getElementById('dmc-weight')?.value || '2.0 kg',
    cost: document.getElementById('dmc-cost')?.value.trim() || '',
    img: window.dmCustomCardImage || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[type]) || (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma),
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
  const costVal = (document.getElementById('dmc-cost')?.value || '').trim();

  const newCard = {
    id: 'custom_card_' + Date.now(),
    name: document.getElementById('dmc-name').value.trim(),
    type: type,
    rarity: document.getElementById('dmc-rarity').value,
    damage: document.getElementById('dmc-dmg').value.trim(),
    cost: costVal || undefined,
    weight: document.getElementById('dmc-weight')?.value || '2.0 kg',
    img: window.dmCustomCardImage || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[type]) || (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma),
    desc: document.getElementById('dmc-desc').value.trim()
  };

  // 1. Assegna al destinatario (Cassa o Membro)
  let targetName = 'Cassa del Dungeon';
  if (ownerTarget === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(newCard);
    targetName = 'Cassa del Dungeon (Bottino Condiviso)';
  } else if (camp.members && camp.members[ownerTarget]) {
    const mChar = camp.members[ownerTarget];
    if (!mChar.cards) mChar.cards = [];
    mChar.cards.unshift(newCard);
    targetName = mChar.name;
    if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(ownerTarget, mChar);
  }

  // 2. SINCRONIZZAZIONE FONDAMENTALE: Salva la nuova carta nel Database Admin (dbState.customCards)
  if (!window.dbState.customCards) window.dbState.customCards = [];
  const existingIdx = window.dbState.customCards.findIndex(c => c.name.toLowerCase() === newCard.name.toLowerCase());
  if (existingIdx !== -1) {
    window.dbState.customCards[existingIdx] = newCard;
  } else {
    window.dbState.customCards.unshift(newCard);
  }

  e.target.reset();
  window.dmCustomCardImage = (window.CARD_ARTWORKS && window.CARD_ARTWORKS.arma) || "";
  window.updateDmCardPreview();
  window.saveDB();

  alert(`⚒️ Carta "${newCard.name}" creata, assegnata a ${targetName} e registrata nel Database Admin globale!`);
  window.switchDmCreateMode('compendium');
  window.renderDmViews();
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
      if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(fromKey, mChar);
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
    if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(toKey, tChar);
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
    if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(ownerKey, mChar);
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

            <div class="pt-1.5 flex items-center justify-between gap-1 border-t border-slate-800/80 text-[10px]">
              <div class="flex items-center gap-1.5">
                <span class="text-amber-300 font-bold">💰 Oro:</span>
                <span class="font-mono font-black text-amber-200">${mChar.gold !== undefined ? mChar.gold : 50} mo</span>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', -10)" class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px] font-bold hover:text-white" title="-10 mo">-10</button>
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', 10)" class="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold hover:bg-amber-500/30" title="+10 mo">+10</button>
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', 50)" class="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold hover:bg-amber-500/30" title="+50 mo">+50</button>
                <button type="button" onclick="window.dmPromptSetPlayerGold('${uKey}')" class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-sky-300 text-[9px] font-bold hover:text-white" title="Imposta ammontare manuale">✏️</button>
              </div>
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

  const compTargetSel = document.getElementById('dm-comp-target');
  if (compTargetSel) {
    const prevComp = compTargetSel.value;
    compTargetSel.innerHTML = `<option value="CHEST">Cassa del Dungeon (Bottino condiviso)</option>` +
      members.map(([uKey, mChar]) => `<option value="${uKey}">Consegna a: ${mChar.name} (${mChar.className})</option>`).join('');
    if (prevComp) compTargetSel.value = prevComp;
  }

  if (window.dmCreateActiveMode === 'compendium') {
    window.renderDmCompendiumCards();
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

  // Rende anche la vista Commercio se visibile o presente
  window.renderDmTradeViews();
};

// ============================================================================
// GESTIONE ECONOMIA & MONETE D'ORO DEI GIOCATORI DA PARTE DEL DM
// ============================================================================
window.dmAdjustPlayerGold = function(uKey, delta) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  if (mChar.gold === undefined) mChar.gold = 50;
  mChar.gold = Math.max(0, mChar.gold + delta);

  if (typeof window.syncMemberCharToUser === 'function') {
    window.syncMemberCharToUser(uKey, mChar);
  }
  if (window.activeCharacter && (window.activeCharacter.id === mChar.id || window.activeCharacter.name === mChar.name)) {
    window.activeCharacter.gold = mChar.gold;
    if (typeof window.renderActiveCharacter === 'function') window.renderActiveCharacter();
  }
  window.saveDB();
  window.renderDmViews();
};

window.dmPromptSetPlayerGold = function(uKey) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  const cur = mChar.gold !== undefined ? mChar.gold : 50;
  const res = prompt(`Imposta Monete d'Oro per ${mChar.name}:`, cur);
  if (res === null) return;
  const val = parseInt(res, 10);
  if (isNaN(val) || val < 0) {
    alert("Valore monete non valido.");
    return;
  }
  mChar.gold = val;

  if (typeof window.syncMemberCharToUser === 'function') {
    window.syncMemberCharToUser(uKey, mChar);
  }
  if (window.activeCharacter && (window.activeCharacter.id === mChar.id || window.activeCharacter.name === mChar.name)) {
    window.activeCharacter.gold = mChar.gold;
    if (typeof window.renderActiveCharacter === 'function') window.renderActiveCharacter();
  }
  window.saveDB();
  window.renderDmViews();
};

// ============================================================================
// SEZIONE COMMERCIO / KAUPANG CAMPAGNA (DM)
// ============================================================================
window.renderDmTradeViews = function() {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  if (!camp.market) camp.market = [];

  const countEl = document.getElementById('dm-market-count');
  if (countEl) countEl.textContent = camp.market.length;

  const mGrid = document.getElementById('dm-market-items-grid');
  if (mGrid) {
    if (camp.market.length === 0) {
      mGrid.innerHTML = `
        <div class="col-span-full norse-panel rounded-xl p-6 text-center text-xs text-slate-400 border border-slate-800">
          Nessuna mercanzia presente nel Kaupang. Seleziona le carte dal catalogo sottostante e clicca <strong>"Manda al Kaupang"</strong> per renderle acquistabili dai giocatori!
        </div>
      `;
    } else {
      mGrid.innerHTML = camp.market.map(item => {
        const art = item.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[item.type]) || 'assets/items/spada_ulfberht.jpg';
        const costGold = item.priceGold !== undefined ? item.priceGold : (window.parseCostToGold ? window.parseCostToGold(item.cost) : 10);
        return `
          <div class="norse-panel rounded-xl p-3 border border-amber-500/40 flex gap-3 items-center shadow-lg relative group">
            <img src="${art}" onclick="window.openCardDetailModal('${item.id || item.canonicalId}')" class="w-14 h-20 rounded-lg object-cover border border-amber-500/60 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex justify-between items-start gap-1">
                <h4 class="font-cinzel font-bold text-xs text-amber-200 truncate cursor-pointer hover:text-white" onclick="window.openCardDetailModal('${item.id || item.canonicalId}')">${item.name}</h4>
                <button type="button" onclick="window.dmRemoveCardFromMarket('${item.marketId}')" class="text-red-400 hover:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30" title="Ritira mercanzia dal Kaupang">✕</button>
              </div>
              <div class="flex items-center gap-2 text-[10px]">
                <span class="text-amber-300 uppercase font-bold">${item.type}</span>
                <span class="text-slate-400">•</span>
                <span class="text-sky-300 font-semibold">${item.rarity || 'Comune'}</span>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-800">
                <div class="flex items-center gap-1">
                  <span class="text-xs">💰</span>
                  <span class="font-mono font-black text-amber-300 text-xs">${costGold} mo</span>
                </div>
                <button type="button" onclick="window.dmEditMarketItemPrice('${item.marketId}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300 border border-slate-700">
                  ✏️ Modifica Prezzo
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  window.renderDmTradeCatalog();
};

window.renderDmTradeCatalog = function() {
  const grid = document.getElementById('dm-trade-catalog-grid');
  if (!grid) return;

  const q = (document.getElementById('dm-trade-catalog-search')?.value || '').toLowerCase().trim();
  const fType = document.getElementById('dm-trade-catalog-filter')?.value || 'tutti';

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);

  const filtered = all.filter(c => {
    if (fType !== 'tutti') {
      const cType = (c.type || '').toLowerCase();
      if (fType === 'pozione') {
        if (!cType.includes('pozione') && !c.name.toLowerCase().includes('pozione') && !c.name.toLowerCase().includes('idromele')) return false;
      } else if (fType === 'oggetto') {
        if (cType !== 'oggetto' && cType !== 'valuta' && !c.name.toLowerCase().includes('hacksilver') && !c.name.toLowerCase().includes('monet')) return false;
      } else if (cType !== fType) {
        return false;
      }
    }
    if (q) {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const descMatch = (c.desc || '').toLowerCase().includes(q);
      const typeMatch = (c.type || '').toLowerCase().includes(q);
      if (!nameMatch && !descMatch && !typeMatch) return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="col-span-full norse-panel rounded-xl p-5 text-center text-xs text-slate-400">Nessun oggetto trovato nel catalogo.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => {
    const art = c.img || (window.CARD_ARTWORKS && window.CARD_ARTWORKS[c.type]) || 'assets/items/spada_ulfberht.jpg';
    const defCost = c.cost || (window.parseCostToGold ? window.parseCostToGold(c.cost) + ' mo' : '10 mo');
    return `
      <div class="norse-panel rounded-xl p-2.5 flex items-center justify-between gap-2.5 border border-slate-800 hover:border-amber-500/40 transition">
        <img src="${art}" onclick="window.openCardDetailModal('${c.id}')" class="w-12 h-16 rounded-lg object-cover border border-slate-700 shrink-0 cursor-pointer hover:scale-105 transition" title="Tocca per ingrandire">
        <div class="flex-1 min-w-0 space-y-0.5">
          <h5 class="font-cinzel font-bold text-xs text-white truncate cursor-pointer hover:text-amber-300" onclick="window.openCardDetailModal('${c.id}')">${c.name}</h5>
          <div class="flex items-center gap-1.5 text-[9px]">
            <span class="text-amber-300 font-bold uppercase">${c.type}</span>
            <span class="text-slate-500">•</span>
            <span class="text-sky-300">${c.rarity || 'Comune'}</span>
          </div>
          <span class="text-[10px] font-mono text-amber-200 block font-semibold">💰 Valore: ${defCost}</span>
        </div>
        <button type="button" onclick="window.dmAddCardToMarket('${c.id}')" class="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-[10px] shrink-0 shadow flex items-center gap-1 transition">
          ⚖️ Manda
        </button>
      </div>
    `;
  }).join('');
};

window.dmAddCardToMarket = function(cardId) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return alert("Nessuna campagna attiva selezionata.");
  if (!camp.market) camp.market = [];

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
  const card = all.find(c => c.id === cardId);
  if (!card) return alert("Carta non trovata.");

  const defaultGold = window.parseCostToGold ? window.parseCostToGold(card.cost) : 10;
  const input = prompt(`Prezzo in Monete d'Oro (mo) per mettere in vendita "${card.name}":`, defaultGold);
  if (input === null) return;
  const priceGold = parseInt(input, 10);
  if (isNaN(priceGold) || priceGold < 0) return alert("Prezzo non valido.");

  const marketItem = {
    ...card,
    marketId: 'mkt_' + card.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    priceGold: priceGold,
    cost: priceGold + ' mo'
  };

  camp.market.push(marketItem);
  window.saveDB();
  window.renderDmTradeViews();
  alert(`⚖️ "${card.name}" è ora disponibile nel Kaupang per ${priceGold} mo!`);
};

window.dmRemoveCardFromMarket = function(marketId) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.market) return;
  camp.market = camp.market.filter(item => item.marketId !== marketId);
  window.saveDB();
  window.renderDmTradeViews();
};

window.dmEditMarketItemPrice = function(marketId) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.market) return;
  const item = camp.market.find(i => i.marketId === marketId);
  if (!item) return;
  const cur = item.priceGold !== undefined ? item.priceGold : (window.parseCostToGold ? window.parseCostToGold(item.cost) : 10);
  const input = prompt(`Nuovo prezzo in Monete d'Oro per "${item.name}":`, cur);
  if (input === null) return;
  const val = parseInt(input, 10);
  if (isNaN(val) || val < 0) return alert("Prezzo non valido.");
  item.priceGold = val;
  item.cost = val + ' mo';
  window.saveDB();
  window.renderDmTradeViews();
};

window.dmClearMarket = function() {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.market || camp.market.length === 0) return;
  if (!confirm("Sei sicuro di voler svuotare tutte le merci dal Kaupang?")) return;
  camp.market = [];
  window.saveDB();
  window.renderDmTradeViews();
};

window.dmBroadcastMarketUpdate = function() {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) return;
  const count = (camp.market || []).length;
  camp.globalEvent = {
    type: 'TRADE_UPDATE',
    message: `Il Dungeon Master ha aggiornato le merci nel Kaupang (${count} oggetti disponibili)!`,
    timestamp: Date.now()
  };
  window.saveDB();
};
