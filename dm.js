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
  const eView = document.getElementById('dm-subview-enemies');

  if (mView) mView.classList.toggle('hidden', tab !== 'manage');
  if (pView) pView.classList.toggle('hidden', tab !== 'party');
  if (cView) cView.classList.toggle('hidden', tab !== 'create');
  if (tView) tView.classList.toggle('hidden', tab !== 'trade');
  if (eView) eView.classList.toggle('hidden', tab !== 'enemies');

  const activeSub = tab === 'manage' ? mView : tab === 'party' ? pView : tab === 'create' ? cView : tab === 'trade' ? tView : eView;
  if (activeSub) {
    activeSub.classList.remove('animate-page-switch');
    void activeSub.offsetWidth;
    activeSub.classList.add('animate-page-switch');
  }

  const setClass = (id, isActive, activeCol = 'text-amber-400') => {
    const el = document.getElementById(id);
    if (el) el.className = isActive ? `flex flex-col items-center gap-1 ${activeCol} w-20 py-2` : 'flex flex-col items-center gap-1 text-slate-400 w-20 py-2';
  };
  setClass('dmnav-manage', tab === 'manage');
  setClass('dmnav-trade', tab === 'trade');
  setClass('dmnav-create', tab === 'create');
  setClass('dmnav-enemies', tab === 'enemies', 'text-red-400');
  const partyLabel = document.getElementById('dmnav-party-label');
  if (partyLabel) partyLabel.className = tab === 'party' ? 'font-cinzel font-black text-[9px] sm:text-[10px] text-amber-300 mt-1 uppercase' : 'font-cinzel font-bold text-[9px] sm:text-[10px] text-slate-400 mt-1 uppercase';

  window.renderDmViews();
  if (tab === 'trade') {
    window.renderDmTradeViews();
  }
  if (tab === 'enemies') {
    window.renderDmEnemiesViews();
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
                  <button type="button" onclick="event.stopPropagation(); window.openEmbeddedGinnungagap('${c.code}', 'DM')" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black text-xs shadow-md flex items-center gap-1.5 transition">
                    <span class="text-sm">ᚱ</span> GINNUNGAGAP (VTT 3D)
                  </button>
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

// ============================================================================
// 12. BESTIARIO NORRENO, SCHEDE NEMICI & SCHIERAMENTO VTT GINNUNGAGAP
// ============================================================================

window.DEFAULT_NORSE_BESTIARY = [
  {
    id: "draugr_cripte",
    name: "Draugr delle Cripte",
    type: "Non-Morto (Medio)",
    category: "non-morto",
    cr: "GS 1/2",
    hp: 24,
    maxHp: 24,
    ac: 13,
    speed: "9m (30ft)",
    stats: { str: 14, dex: 11, con: 14, int: 6, wis: 10, cha: 5 },
    attacks: [
      { name: "Ascia da Guerra Antica", toHit: "+4", damage: "1d8+2 Tagliente", reach: "1.5m" },
      { name: "Sguardo Ingelosente", toHit: "CD 12 Sag", damage: "2d4 Freddo", reach: "9m" }
    ],
    traits: "Resistenza ai danni da freddo e veleno. Vigore Non Morto (se scende a 0 PF effettua TS Costituzione con CD 5+danni subiti per rimanere a 1 PF).",
    actions: "Assalto Cadaverico, Urlo Ingelosente della Tomba.",
    notes: "Antico fiero guerriero norreno risorto dalla sua tomba per difendere i tesori sepolti nel permafrost.",
    avatar: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150",
    model: "draugr"
  },
  {
    id: "lupo_fenrir",
    name: "Lupo Invernale di Fenrir",
    type: "Bestia Mostruosa (Grande)",
    category: "bestia",
    cr: "GS 1",
    hp: 32,
    maxHp: 32,
    ac: 13,
    speed: "15m (50ft)",
    stats: { str: 16, dex: 13, con: 14, int: 5, wis: 12, cha: 6 },
    attacks: [
      { name: "Morso Zannuto", toHit: "+5", damage: "2d6+3 Perforante", reach: "1.5m" },
      { name: "Soffio Polare", toHit: "CD 12 Des", damage: "3d6 Freddo", reach: "4.5m cono" }
    ],
    traits: "Fiuto e Udito Sviluppati (Vantaggio su Saggezza). Tattica di Branco (Vantaggio ai tiri per colpire se ha alleati entro 1.5m).",
    actions: "Balzo Selvaggio, Atterramento (bersaglio supera TS For CD 13 o cade prono).",
    notes: "Fiera predatrice nata dalle nevi eterne dell'Utgardr al servizio della prole di Fenrir.",
    avatar: "https://images.unsplash.com/photo-1564865878688-9a244444042a?w=150",
    model: "wolf"
  },
  {
    id: "jotunn_gelo",
    name: "Jotunn del Gelo",
    type: "Gigante (Grande)",
    category: "gigante",
    cr: "GS 5",
    hp: 110,
    maxHp: 110,
    ac: 15,
    speed: "12m (40ft)",
    stats: { str: 21, dex: 9, con: 18, int: 9, wis: 10, cha: 12 },
    attacks: [
      { name: "Clava Monolitica di Ghiaccio", toHit: "+8", damage: "3d8+5 Contundente", reach: "3m" },
      { name: "Lancio del Masso", toHit: "+8", damage: "3d10+5 Contundente", reach: "18/72m" }
    ],
    traits: "Immunità assoluta al Freddo. Vulnerabilità al Fuoco. Aura di Fimbulwinter (terreno ghiacciato attorno al gigante).",
    actions: "Attacco Multiplo (2 colpi di clava), Schiacciamento tellurico.",
    notes: "Figlio primordiale di Ymir armato di una colonna di roccia e ghiaccio per annientare gli intrusi.",
    avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150",
    model: "giant"
  },
  {
    id: "guerriero_predone",
    name: "Guerriero Predone del Clan",
    type: "Umanoide (Medio)",
    category: "umanoide",
    cr: "GS 1/2",
    hp: 18,
    maxHp: 18,
    ac: 14,
    speed: "9m (30ft)",
    stats: { str: 15, dex: 12, con: 14, int: 10, wis: 11, cha: 9 },
    attacks: [
      { name: "Ascia da Battaglia Norrena", toHit: "+4", damage: "1d8+2 Tagliente", reach: "1.5m" },
      { name: "Giavellotto da Lancio", toHit: "+4", damage: "1d6+2 Perforante", reach: "9/36m" }
    ],
    traits: "Frenesia di Battaglia (Vantaggio sui TS contro Spaventato). Muro di Scudi Vichingo (+2 CA con alleato a contatto).",
    actions: "Furia Razziale, Urlo di Guerra intimidatorio.",
    notes: "Incursore dei fiordi pronto a combattere all'ultimo sangue per l'onore del proprio Jarl.",
    avatar: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=150",
    model: "berserker"
  },
  {
    id: "valkyria_corrotta",
    name: "Valkyria d'Odhinn",
    type: "Celestiale Boss (Medio)",
    category: "boss",
    cr: "GS 4",
    hp: 75,
    maxHp: 75,
    ac: 16,
    speed: "9m (volo 18m)",
    stats: { str: 17, dex: 16, con: 15, int: 12, wis: 14, cha: 16 },
    attacks: [
      { name: "Lancia di Valhalla", toHit: "+6", damage: "1d10+3 Perforante + 1d8 Radioso", reach: "3m" },
      { name: "Dardo Celestiale Runiche", toHit: "+5", damage: "3d6 Radioso", reach: "36m" }
    ],
    traits: "Resistenza a freddo, fuoco e danni radiosi. Ali dorate eteree. Sguardo del Padre di Tutti.",
    actions: "Attacco Multiplo (2 colpi con la lancia), Canto dei Caduti (TS Sag CD 14 o Spaventato).",
    notes: "Giudice celeste discesa dalla dimora degli Dei per testare il valore dei guerrieri di Midgard.",
    avatar: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150",
    model: "valkyrie"
  },
  {
    id: "sciamano_hel",
    name: "Sciamano dell'Helheimr",
    type: "Umanoide Incantatore (Medio)",
    category: "non-morto",
    cr: "GS 2",
    hp: 36,
    maxHp: 36,
    ac: 12,
    speed: "9m (30ft)",
    stats: { str: 10, dex: 12, con: 12, int: 12, wis: 16, cha: 13 },
    attacks: [
      { name: "Bastone delle Ossa Intagliato", toHit: "+3", damage: "1d6 Contundente + 1d6 Necrotico", reach: "1.5m" },
      { name: "Dardo d'Ombra Runiche", toHit: "+5", damage: "2d8 Necrotico", reach: "24m" }
    ],
    traits: "Incantatore di Helheimr (CD Salvezza 13, attacco incantesimi +5). Vista Cieca 9 metri nel buio magico.",
    actions: "Evocazione delle Ossa Risorte, Maledizione del Gelo Eterno.",
    notes: "Mistici e officianti dei riti funebri legati alla dea Hel, maestri della necromanzia runica.",
    avatar: "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=150",
    model: "runemaster"
  }
];

window.getCampaignEnemies = function(campCode) {
  const camp = window.dbState && window.dbState.campaigns ? window.dbState.campaigns[campCode] : null;
  if (!camp) return window.DEFAULT_NORSE_BESTIARY;
  if (!camp.enemies || !Array.isArray(camp.enemies) || camp.enemies.length === 0) {
    camp.enemies = JSON.parse(JSON.stringify(window.DEFAULT_NORSE_BESTIARY));
    window.saveDB?.();
  }
  return camp.enemies;
};

window.saveCampaignEnemies = function(campCode, enemies) {
  const camp = window.dbState && window.dbState.campaigns ? window.dbState.campaigns[campCode] : null;
  if (!camp) return;
  camp.enemies = enemies;
  window.saveDB?.();
};

window.activeDmEnemyFilter = 'tutti';

window.filterDmEnemies = function(cat) {
  window.activeDmEnemyFilter = cat;
  document.querySelectorAll('.dm-enemy-filter-btn').forEach(b => {
    if (b.dataset.filter === cat) {
      b.className = 'dm-enemy-filter-btn px-3 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-sm';
    } else {
      b.className = 'dm-enemy-filter-btn px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 hover:text-white';
    }
  });
  window.renderDmEnemiesViews();
};

window.renderDmEnemiesViews = function() {
  const grid = document.getElementById('dm-enemies-cards-grid');
  if (!grid) return;
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;

  const enemies = window.getCampaignEnemies(campCode);
  const search = (document.getElementById('dm-enemies-search')?.value || '').toLowerCase().trim();
  const filterCat = window.activeDmEnemyFilter || 'tutti';

  const filtered = enemies.filter(e => {
    const matchSearch = !search ||
      (e.name || '').toLowerCase().includes(search) ||
      (e.type || '').toLowerCase().includes(search) ||
      (e.cr || '').toLowerCase().includes(search);

    const cat = (e.category || '').toLowerCase() || (e.type || '').toLowerCase();
    const matchCat = (filterCat === 'tutti') ||
      (filterCat === 'non-morto' && (cat.includes('non') || cat.includes('mort') || cat.includes('draugr'))) ||
      (filterCat === 'gigante' && (cat.includes('gigant') || cat.includes('jotunn'))) ||
      (filterCat === 'bestia' && (cat.includes('bestia') || cat.includes('lupo') || cat.includes('mostr'))) ||
      (filterCat === 'umanoide' && (cat.includes('uman') || cat.includes('viching') || cat.includes('clan') || cat.includes('guerrier'))) ||
      (filterCat === 'boss' && (cat.includes('boss') || cat.includes('celest') || (e.hp >= 70)));

    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full norse-panel rounded-2xl p-8 text-center text-slate-400 space-y-2 border border-slate-800">
        <span class="text-3xl">⚔️</span>
        <h4 class="font-cinzel font-bold text-sm text-white">Nessun nemico trovato con questi filtri</h4>
        <p class="text-xs text-slate-500">Crea una nuova scheda nemico con il pulsante "+ Crea Nuova Scheda Nemico" in alto.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const atk1 = (e.attacks && e.attacks[0]) || null;
    const atk2 = (e.attacks && e.attacks[1]) || null;
    const stats = e.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

    return `
      <div class="norse-panel rounded-2xl p-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-red-500/30 hover:border-red-400 transition flex flex-col justify-between space-y-3 shadow-lg group">
        <div>
          <!-- Header Card: Nome, Tipo, GS, Icona -->
          <div class="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div class="flex items-center gap-2.5">
              <img src="${e.avatar || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150'}" alt="${e.name}" class="w-10 h-10 rounded-xl object-cover border border-red-500/50 shadow">
              <div>
                <h4 class="font-cinzel font-black text-sm text-white group-hover:text-red-300 transition truncate max-w-[170px] sm:max-w-[200px]">${e.name}</h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30">${e.cr || 'GS 1'}</span>
                  <span class="text-[10px] text-slate-400 truncate max-w-[120px]">${e.type || 'Mostro'}</span>
                </div>
              </div>
            </div>

            <!-- Badge PF & CA -->
            <div class="text-right">
              <div class="font-mono font-extrabold text-sm text-emerald-400">${e.hp} <span class="text-[9px] text-slate-400 font-sans">PF</span></div>
              <div class="text-[10px] text-amber-300 font-mono">CA ${e.ac || 12}</div>
            </div>
          </div>

          <!-- Caratteristiche Pills -->
          <div class="grid grid-cols-6 gap-1 text-center py-2 border-b border-slate-800/60 text-[9px] font-mono">
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">FOR</span><strong class="text-slate-200">${stats.str}</strong></div>
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">DES</span><strong class="text-slate-200">${stats.dex}</strong></div>
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">COS</span><strong class="text-slate-200">${stats.con}</strong></div>
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">INT</span><strong class="text-slate-200">${stats.int}</strong></div>
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">SAG</span><strong class="text-slate-200">${stats.wis}</strong></div>
            <div class="bg-slate-950/80 rounded py-0.5"><span class="text-slate-500 text-[8px] block">CAR</span><strong class="text-slate-200">${stats.cha}</strong></div>
          </div>

          <!-- Attacchi Principali -->
          <div class="space-y-1 py-2 text-xs">
            ${atk1 ? `
              <div class="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/50">
                <span class="font-bold text-white truncate max-w-[140px]">🗡️ ${atk1.name}</span>
                <span class="font-mono text-[10px] text-amber-300">${atk1.toHit || '+0'} &bull; ${atk1.damage || ''}</span>
              </div>
            ` : ''}
            ${atk2 ? `
              <div class="flex items-center justify-between bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/50">
                <span class="font-bold text-slate-300 truncate max-w-[140px]">⚡ ${atk2.name}</span>
                <span class="font-mono text-[10px] text-sky-300">${atk2.toHit || ''} &bull; ${atk2.damage || ''}</span>
              </div>
            ` : ''}
          </div>

          <!-- Tratti & Azioni Brevi -->
          ${e.traits ? `
            <p class="text-[10px] text-slate-400 line-clamp-2 leading-relaxed italic bg-slate-950/40 p-1.5 rounded-lg border border-slate-900">
              ${e.traits}
            </p>
          ` : ''}
        </div>

        <!-- AZIONI: SCHIERA SU GINNUNGAGAP, MODIFICA, DUPLICA, ELIMINA -->
        <div class="pt-2 border-t border-slate-800/80 flex flex-col gap-1.5">
          <button type="button" onclick="window.deployEnemyToGinnungagap('${e.id}')" class="w-full py-2 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:brightness-110 text-white font-cinzel font-black text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95">
            <span>⚔️</span> SCHIERA SU GINNUNGAGAP
          </button>
          <div class="grid grid-cols-3 gap-1.5 text-[10px]">
            <button type="button" onclick="window.openDmEnemyEditorModal('${e.id}')" class="py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition flex items-center justify-center gap-1">
              <span>✏️</span> Modifica
            </button>
            <button type="button" onclick="window.duplicateEnemySheet('${e.id}')" class="py-1 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white transition flex items-center justify-center gap-1">
              <span>📋</span> Clona
            </button>
            <button type="button" onclick="window.deleteEnemySheet('${e.id}')" class="py-1 px-2 rounded-lg bg-red-950/40 border border-red-500/40 hover:border-red-400 text-red-300 hover:text-red-100 transition flex items-center justify-center gap-1">
              <span>🗑️</span> Elimina
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.openDmEnemyEditorModal = function(enemyId = null) {
  const modal = document.getElementById('modal-enemy-sheet-editor');
  if (!modal) return;
  const form = document.getElementById('dm-enemy-form');
  if (form) form.reset();

  const campCode = window.activeDmWorkspaceCode;
  const enemies = window.getCampaignEnemies(campCode);
  const enemy = enemyId ? enemies.find(e => e.id === enemyId) : null;

  const title = document.getElementById('modal-enemy-editor-title');
  if (title) title.textContent = enemy ? `Modifica: ${enemy.name}` : "Nuova Scheda Nemico";

  document.getElementById('enemy-form-id').value = enemy ? enemy.id : '';
  document.getElementById('enemy-form-name').value = enemy ? enemy.name : '';
  document.getElementById('enemy-form-cr').value = enemy ? (enemy.cr || 'GS 1') : 'GS 1';
  document.getElementById('enemy-form-type').value = enemy ? (enemy.type || 'Non Morto') : 'Non Morto';
  document.getElementById('enemy-form-hp').value = enemy ? (enemy.hp || 24) : 24;
  document.getElementById('enemy-form-ac').value = enemy ? (enemy.ac || 13) : 13;
  document.getElementById('enemy-form-speed').value = enemy ? (enemy.speed || '9m (30ft)') : '9m (30ft)';

  const stats = (enemy && enemy.stats) || { str: 14, dex: 11, con: 14, int: 6, wis: 10, cha: 5 };
  document.getElementById('enemy-form-str').value = stats.str || 10;
  document.getElementById('enemy-form-dex').value = stats.dex || 10;
  document.getElementById('enemy-form-con').value = stats.con || 10;
  document.getElementById('enemy-form-int').value = stats.int || 10;
  document.getElementById('enemy-form-wis').value = stats.wis || 10;
  document.getElementById('enemy-form-cha').value = stats.cha || 10;

  const atk1 = (enemy && enemy.attacks && enemy.attacks[0]) || {};
  document.getElementById('enemy-form-atk1-name').value = atk1.name || '';
  document.getElementById('enemy-form-atk1-hit').value = atk1.toHit || '+4';
  document.getElementById('enemy-form-atk1-dmg').value = atk1.damage || '1d8+2 Tagliente';

  const atk2 = (enemy && enemy.attacks && enemy.attacks[1]) || {};
  document.getElementById('enemy-form-atk2-name').value = atk2.name || '';
  document.getElementById('enemy-form-atk2-hit').value = atk2.toHit || 'CD 12 Sag';
  document.getElementById('enemy-form-atk2-dmg').value = atk2.damage || '2d4 Freddo';

  document.getElementById('enemy-form-traits').value = enemy ? (enemy.traits || '') : '';
  document.getElementById('enemy-form-notes').value = enemy ? (enemy.notes || '') : '';

  modal.classList.remove('hidden');
};

window.closeDmEnemyEditorModal = function() {
  const modal = document.getElementById('modal-enemy-sheet-editor');
  if (modal) modal.classList.add('hidden');
};

window.saveEnemySheetFromModal = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;
  const enemies = window.getCampaignEnemies(campCode);

  const id = document.getElementById('enemy-form-id').value || ('enemy_' + Date.now());
  const name = document.getElementById('enemy-form-name').value.trim() || 'Nemico Senza Nome';
  const cr = document.getElementById('enemy-form-cr').value.trim() || 'GS 1';
  const type = document.getElementById('enemy-form-type').value.trim() || 'Mostro';
  const hp = parseInt(document.getElementById('enemy-form-hp').value, 10) || 20;
  const ac = parseInt(document.getElementById('enemy-form-ac').value, 10) || 12;
  const speed = document.getElementById('enemy-form-speed').value.trim() || '9m (30ft)';

  const stats = {
    str: parseInt(document.getElementById('enemy-form-str').value, 10) || 10,
    dex: parseInt(document.getElementById('enemy-form-dex').value, 10) || 10,
    con: parseInt(document.getElementById('enemy-form-con').value, 10) || 10,
    int: parseInt(document.getElementById('enemy-form-int').value, 10) || 10,
    wis: parseInt(document.getElementById('enemy-form-wis').value, 10) || 10,
    cha: parseInt(document.getElementById('enemy-form-cha').value, 10) || 10
  };

  const attacks = [];
  const atk1Name = document.getElementById('enemy-form-atk1-name').value.trim();
  if (atk1Name) {
    attacks.push({
      name: atk1Name,
      toHit: document.getElementById('enemy-form-atk1-hit').value.trim() || '+0',
      damage: document.getElementById('enemy-form-atk1-dmg').value.trim() || '1d6',
      reach: '1.5m'
    });
  }
  const atk2Name = document.getElementById('enemy-form-atk2-name').value.trim();
  if (atk2Name) {
    attacks.push({
      name: atk2Name,
      toHit: document.getElementById('enemy-form-atk2-hit').value.trim() || '',
      damage: document.getElementById('enemy-form-atk2-dmg').value.trim() || '',
      reach: '9m'
    });
  }

  const traits = document.getElementById('enemy-form-traits').value.trim();
  const notes = document.getElementById('enemy-form-notes').value.trim();

  // Deduci modello 3D
  let model = 'draugr';
  const tLow = (type + ' ' + name).toLowerCase();
  if (tLow.includes('lup') || tLow.includes('wolf') || tLow.includes('bestia')) model = 'wolf';
  else if (tLow.includes('gigant') || tLow.includes('jotunn')) model = 'giant';
  else if (tLow.includes('valkyr') || tLow.includes('celest')) model = 'valkyrie';
  else if (tLow.includes('mago') || tLow.includes('sciaman') || tLow.includes('rune')) model = 'runemaster';
  else if (tLow.includes('berserk') || tLow.includes('predon') || tLow.includes('jarl')) model = 'berserker';

  const existingIdx = enemies.findIndex(en => en.id === id);
  const newSheet = {
    id,
    name,
    cr,
    type,
    category: type.toLowerCase(),
    hp,
    maxHp: hp,
    ac,
    speed,
    stats,
    attacks,
    traits,
    notes,
    model,
    avatar: (existingIdx !== -1 && enemies[existingIdx].avatar) ? enemies[existingIdx].avatar : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=150'
  };

  if (existingIdx !== -1) {
    enemies[existingIdx] = newSheet;
  } else {
    enemies.push(newSheet);
  }

  window.saveCampaignEnemies(campCode, enemies);
  window.closeDmEnemyEditorModal();
  window.renderDmEnemiesViews();
  if (typeof window.showToast === 'function') {
    window.showToast('💀 Scheda Nemico Salvata', `"${name}" registrato nel bestiario.`);
  }
};

window.duplicateEnemySheet = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;
  const enemies = window.getCampaignEnemies(campCode);
  const orig = enemies.find(e => e.id === enemyId);
  if (!orig) return;

  const clone = JSON.parse(JSON.stringify(orig));
  clone.id = 'enemy_' + Date.now();
  clone.name = clone.name + ' (Copia)';
  enemies.push(clone);

  window.saveCampaignEnemies(campCode, enemies);
  window.renderDmEnemiesViews();
  if (typeof window.showToast === 'function') {
    window.showToast('📋 Scheda Clonata', `Creata copia di "${orig.name}".`);
  }
};

window.deleteEnemySheet = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;
  const enemies = window.getCampaignEnemies(campCode);
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy) return;

  if (!confirm(`Sei sicuro di voler eliminare la scheda di "${enemy.name}" dal bestiario?`)) return;

  const updated = enemies.filter(e => e.id !== enemyId);
  window.saveCampaignEnemies(campCode, updated);
  window.renderDmEnemiesViews();
  if (typeof window.showToast === 'function') {
    window.showToast('🗑️ Scheda Eliminata', `"${enemy.name}" rimosso dal bestiario.`);
  }
};

window.deployEnemyToGinnungagap = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;
  const enemies = window.getCampaignEnemies(campCode);
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy) return;

  // 1. Accoda in sessionStorage per Ginnungagap
  try {
    const pending = JSON.parse(sessionStorage.getItem('ginnungagap_pending_enemy_spawns') || '[]');
    pending.push({
      ...enemy,
      campCode: campCode,
      timestamp: Date.now()
    });
    sessionStorage.setItem('ginnungagap_pending_enemy_spawns', JSON.stringify(pending));
  } catch(e) {}

  // 2. Broadcast Channel
  try {
    const bus = new BroadcastChannel(`ginnungagap_${campCode}`);
    bus.postMessage({
      type: 'SPAWN_ENEMY_SHEET',
      enemy: enemy,
      timestamp: Date.now()
    });
    setTimeout(() => { try { bus.close(); } catch(e){} }, 1000);
  } catch(e) {}

  // 3. Se iframe è già montato e attivo
  const iframe = document.getElementById('ginnungagap-iframe');
  if (iframe && iframe.contentWindow && iframe.contentWindow.Ginnungagap && typeof iframe.contentWindow.dmSpawnEnemyFromSheet === 'function') {
    iframe.contentWindow.dmSpawnEnemyFromSheet(enemy);
    if (typeof window.showToast === 'function') {
      window.showToast('👹 Schierato su Ginnungagap', `[${enemy.name}] schierato sul tavolo tattico VTT!`);
    }
  } else {
    // Apri embedded Ginnungagap
    if (typeof window.showToast === 'function') {
      window.showToast('🎲 Lancio Ginnungagap', `Apertura tavolo tattico con [${enemy.name}] pronto sul campo!`);
    }
    window.openEmbeddedGinnungagap(campCode, 'DM');
  }
};
