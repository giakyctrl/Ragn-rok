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
  if (typeof window.showToast === "function") window.showToast("Party Promosso!", "Notifica di Level Up inviata a tutti i membri del gruppo.", "success");
};

window.dmSingleLevelUp = function(uKey) {
  if (typeof window.requireOnlineAction === 'function' && !window.requireOnlineAction('Promozione Eroe Livello')) return;
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp || !camp.members[uKey]) return;
  const mChar = camp.members[uKey];
  mChar.pendingLevelUp = true;
  if (typeof window.syncMemberCharToUser === 'function') window.syncMemberCharToUser(uKey, mChar);
  window.saveDB();
  if (typeof window.showToast === "function") window.showToast("Eroe Promosso!", `Level Up inviato con successo a ${mChar.name}.`, "success");
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
    const costText = c.cost ? `${c.cost} mo` : '—';
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
            DETTAGLI
          </button>
          <button type="button" onclick="window.dmAssignCardFromCompendium('${c.id}')" class="py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-[10px] transition flex items-center justify-center gap-1 shadow">
            ASSEGNA
          </button>
        </div>
      </div>
    `;
  }).join('');
};

window.dmAssignCardFromCompendium = function(cardId) {
  if (typeof window.requireOnlineAction === 'function' && !window.requireOnlineAction('Assegnazione Carta')) return;
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) {
    if (typeof window.showToast === "function") window.showToast("Attenzione", "Nessuna campagna attiva selezionata.", "warning");
    return;
  }

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
  const original = all.find(c => c.id === cardId);
  if (!original) {
    if (typeof window.showToast === "function") window.showToast("Errore Database", "Carta non trovata nel compendio.", "error");
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
  if (typeof window.showToast === "function") window.showToast("Carta Assegnata", `"${original.name}" consegnata a: ${targetName}!`, "success");
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

  if (typeof window.showToast === "function") window.showToast("Carta Creata", `"${newCard.name}" assegnata a ${targetName} e salvata nel Realm!`, "success");
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
                  <button type="button" onclick="event.stopPropagation(); window.Map3D.openMap('${c.code}', 'DM')" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-sky-600 to-indigo-700 hover:brightness-110 text-white font-cinzel font-black text-xs shadow-md flex items-center gap-2 transition">
                    <svg class="w-3.5 h-3.5 text-amber-300" viewBox="0 0 100 140" fill="none" stroke="currentColor" stroke-width="12"><path d="M 82 14 L 54 38 L 26 14 L 26 126 L 54 102 L 82 126"/></svg>
                    <span>MAP MAKER 3D</span>
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
                <span class="text-amber-300 font-bold">Oro:</span>
                <span class="font-mono font-black text-amber-200">${mChar.gold !== undefined ? mChar.gold : 50} mo</span>
              </div>
              <div class="flex items-center gap-1">
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', -10)" class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px] font-bold hover:text-white" title="-10 mo">-10</button>
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', 10)" class="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold hover:bg-amber-500/30" title="+10 mo">+10</button>
                <button type="button" onclick="window.dmAdjustPlayerGold('${uKey}', 50)" class="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[9px] font-bold hover:bg-amber-500/30" title="+50 mo">+50</button>
                <button type="button" onclick="window.dmPromptSetPlayerGold('${uKey}')" class="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-sky-300 text-[9px] font-bold hover:text-white" title="Imposta ammontare manuale"><svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg></button>
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
    if (typeof window.showToast === "function") window.showToast("Valore Non Valido", "Inserisci un numero valido di monete.", "warning");
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
                <button type="button" onclick="window.dmRemoveCardFromMarket('${item.marketId}')" class="text-red-400 hover:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950/60 border border-red-500/30" title="Ritira mercanzia dal Kaupang"><svg class="w-3 h-3 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
              </div>
              <div class="flex items-center gap-2 text-[10px]">
                <span class="text-amber-300 uppercase font-bold">${item.type}</span>
                <span class="text-slate-400">•</span>
                <span class="text-sky-300 font-semibold">${item.rarity || 'Comune'}</span>
              </div>
              <div class="flex items-center justify-between pt-1 border-t border-slate-800">
                <div class="flex items-center gap-1">
                  <span class="text-xs font-mono font-bold text-amber-300">mo</span>
                  <span class="font-mono font-black text-amber-300 text-xs">${costGold} mo</span>
                </div>
                <button type="button" onclick="window.dmEditMarketItemPrice('${item.marketId}')" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-sky-300 border border-slate-700">
                  Modifica Prezzo
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
          <span class="text-[10px] font-mono text-amber-200 block font-semibold">Valore: ${defCost}</span>
        </div>
        <button type="button" onclick="window.dmAddCardToMarket('${c.id}')" class="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-cinzel font-black text-[10px] shrink-0 shadow flex items-center gap-1 transition">
          Manda
        </button>
      </div>
    `;
  }).join('');
};

window.dmAddCardToMarket = function(cardId) {
  const camp = window.dbState.campaigns[window.activeDmWorkspaceCode];
  if (!camp) { if (typeof window.showToast === "function") window.showToast("Attenzione", "Nessuna campagna attiva selezionata.", "warning"); return; }
  if (!camp.market) camp.market = [];

  const all = typeof window.getAllCards === 'function' ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
  const card = all.find(c => c.id === cardId);
  if (!card) { if (typeof window.showToast === "function") window.showToast("Carta Mancante", "Carta non trovata.", "warning"); return; }

  const defaultGold = window.parseCostToGold ? window.parseCostToGold(card.cost) : 10;
  const input = prompt(`Prezzo in Monete d'Oro (mo) per mettere in vendita "${card.name}":`, defaultGold);
  if (input === null) return;
  const priceGold = parseInt(input, 10);
  if (isNaN(priceGold) || priceGold < 0) { if (typeof window.showToast === "function") window.showToast("Prezzo Errato", "Inserisci un prezzo in monete valido.", "warning"); return; }

  const marketItem = {
    ...card,
    marketId: 'mkt_' + card.id + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    priceGold: priceGold,
    cost: priceGold + ' mo'
  };

  camp.market.push(marketItem);
  window.saveDB();
  window.renderDmTradeViews();
  if (typeof window.showToast === "function") window.showToast("Kaupang di Midgard", `"${card.name}" è in vendita nel mercato per ${priceGold} mo!`, "success");
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
  if (isNaN(val) || val < 0) { if (typeof window.showToast === "function") window.showToast("Prezzo Errato", "Prezzo non valido.", "warning"); return; }
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
// ============================================================================
// 12. NEMICI NORRENI, SCHEDE COMPLETE & SCHIERAMENTO VTT GINNUNGAGAP
// ============================================================================

window.DEFAULT_NORSE_BESTIARY = [
  {
    id: "odhinn",
    name: "Odhinn (Padre di Tutti)",
    type: "Grande Divinità (Æsir), Legale Onorevole",
    category: "dei",
    cr: "GS 30",
    hp: 320, maxHp: 320, ac: 22,
    speed: "12m (40ft)",
    stats: { str: 24, dex: 22, con: 24, int: 22, wis: 26, cha: 24 },
    saves: { str: true, con: true, wis: true, cha: true },
    proficientSkills: ["percezione", "intimidire", "religione", "asatru", "storia"],
    senses: "Vista Vera 36m, Vista Cieca 18m, Percezione Passiva 28",
    damageImmunities: "Necrotico, Radioso; Contundente, Perforante e Tagliente da armi non magiche",
    conditionImmunities: "Affascinato, Esausto, Spaventato, Paralizzato, Avvelenato",
    attacks: [
      { name: "Gungnir, la Lancia del Fato", toHit: "+18", damage: "2d10+8 Perforante + 4d8 Radioso", reach: "3m (Lancio 36m)", desc: "Non manca mai il bersaglio per volere delle Rune." },
      { name: "Bagliore delle Rune Primordiali", toHit: "CD 22 Des", damage: "6d8 Forza / Radioso", reach: "36m" }
    ],
    traits: "Onniscienza delle Rune (Vantaggio su ogni prova di caratteristica). Huginn e Muninn (I due corvi condividono la vista con Odino ovunque nei Nove Mondi). Resistenza Leggendaria (3/giorno). Presenza Divina (CD 22 Saggezza o Spaventato).",
    actions: "Attacco Multiplo (3 attacchi con Gungnir), Squarcio della Realtà, Evocazione degli Einherjar caduti.",
    legendaryActions: ["Colpo di Gungnir (1 Azione)", "Sguardo dei Corvi / Teletrasporto Etereo (2 Azioni)", "Decreto del Padre di Tutti (3 Azioni)"],
    notes: "Il sovrano supremo di Asgardr, colui che si impiccò al Frassino Yggdrasill per nove notti e sacrificò il suo occhio alla fonte di Mimir per apprendere il segreto supremo delle Rune.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "thorr",
    name: "Thorr (Dio del Tuono)",
    type: "Grande Divinità (Æsir), Caotico Onorevole",
    category: "dei",
    cr: "GS 28",
    hp: 340, maxHp: 340, ac: 23,
    speed: "12m (40ft)",
    stats: { str: 30, dex: 18, con: 28, int: 12, wis: 18, cha: 20 },
    saves: { str: true, con: true, wis: true },
    proficientSkills: ["atletica", "intimidire", "percezione", "asatru"],
    senses: "Scurovisione 36m, Percezione Passiva 24",
    damageImmunities: "Fulmine, Tuono; Contundente, Perforante e Tagliente da armi non magiche",
    conditionImmunities: "Spaventato, Paralizzato, Avvelenato, Esausto",
    attacks: [
      { name: "Mjölnir, il Fracassatore", toHit: "+19", damage: "3d8+10 Contundente + 3d8 Tuono", reach: "3m (Lancio 24m, ritorna in pugno)", desc: "Devasta barriere, scudi e ossa. I colpi critici atterrano e stordiscono i giganti." },
      { name: "Folgore Celeste", toHit: "CD 21 Des", damage: "8d8 Fulmine", reach: "30m linea" }
    ],
    traits: "Cintura Megingjörd (Raddoppia la forza titanica). Ira della Tempesta (I nemici entro 3m subiscono 2d8 danni da tuono all'inizio del turno). Resistenza Leggendaria (3/giorno).",
    actions: "Attacco Multiplo (3 colpi con Mjölnir), Terremoto del Tuono, Richiamo delle Tempeste dei Nove Mondi.",
    legendaryActions: ["Lancio e Ritorno di Mjölnir (1 Azione)", "Scatto Tempestoso (1 Azione)", "Boato dell'Apocalisse (3 Azioni)"],
    notes: "Il più potente guerriero di Asgardr, flagello implacabile dei giganti e protettore giurato dell'umanità di Midgardr.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "loki",
    name: "Loki (Dio dell'Inganno)",
    type: "Grande Divinità, Caotico Disonorevole",
    category: "dei",
    cr: "GS 25",
    hp: 300, maxHp: 300, ac: 20,
    speed: "12m (40ft)",
    stats: { str: 20, dex: 26, con: 20, int: 30, wis: 20, cha: 30 },
    saves: { str: true, con: true, wis: true, cha: true },
    proficientSkills: ["inganno", "intimidire", "percezione", "persuasione", "furtivita", "rapidita"],
    senses: "Vista Vera 36m, Percezione Passiva 22",
    damageImmunities: "Necrotico, Veleno; Contundente, Perforante e Tagliente da armi non magiche",
    damageResistances: "Radioso, Freddo, Fuoco",
    conditionImmunities: "Affascinato, Esausto, Spaventato, Paralizzato",
    attacks: [
      { name: "Pugnali delle Ombre di Lopt", toHit: "+17", damage: "2d4+8 Perforante + 4d6 Veleno/Necrotico", reach: "1.5m (Lancio 18m)", desc: "Lame invisibili che corrompono il sangue e l'anima." },
      { name: "Bagliore del Caos Illusorio", toHit: "CD 21 Sag", damage: "5d8 Psichico", reach: "24m" }
    ],
    traits: "Maestro dell'Inganno (Impossibile discernere le sue menzogne con la magia). Mutamento di Forma Illusorio (Può assumere l'aspetto di qualsiasi creatura o bestia). Riflesso Speculare Illusorio (Ogni attacco ha il 50% di colpire un'illusione). Resistenza Leggendaria (3/giorno).",
    actions: "Attacco Multiplo (3 pugnalate), Scambio di Posizione Etereo, Dissoluzione nell'Ombra.",
    legendaryActions: ["Scivolata nell'Ombra (1 Azione)", "Lancio di Dardi Velenosi (2 Azioni)", "Onda di Follia e Discordia (3 Azioni)"],
    notes: "Padre di Fenrir, Hel e Jörmungandr, architetto della morte di Baldr e artefice dell'inizio del Ragnarok.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "freyja",
    name: "Freyja (Signora del Seidr)",
    type: "Grande Divinità (Vanir), Neutrale Onorevole",
    category: "dei",
    cr: "GS 24",
    hp: 275, maxHp: 275, ac: 20,
    speed: "12m (volo 18m)",
    stats: { str: 18, dex: 22, con: 20, int: 20, wis: 24, cha: 28 },
    saves: { dex: true, wis: true, cha: true },
    proficientSkills: ["asatru", "persuasione", "percezione", "intuizione", "addestrare"],
    senses: "Vista Vera 24m, Percezione Passiva 23",
    damageResistances: "Freddo, Fulmine; Danni non magici",
    conditionImmunities: "Affascinato, Spaventato, Paralizzato",
    attacks: [
      { name: "Lancia del Destino Vanir", toHit: "+14", damage: "1d10+6 Perforante + 3d8 Radioso", reach: "3m" },
      { name: "Canto Mistico del Seidr", toHit: "CD 20 Sag", damage: "4d8 Psichico / Radioso", reach: "24m" }
    ],
    traits: "Collana Brísingamen (Fascino irresistibile, vantaggio sui tiri salvezza magici). Mantello di Falco (Capacità di volare silenziosamente e trasformarsi in falco). Metà dei Caduti (Rivendica metà dei guerrieri morti in battaglia per Fólkvangr).",
    actions: "Attacco Multiplo (2 colpi con la lancia), Canto del Fato, Richiamo dei Gatti Celesti.",
    legendaryActions: ["Volo di Falco (1 Azione)", "Aura Rigenerativa (2 Azioni)", "Comando Sovrano del Seidr (3 Azioni)"],
    notes: "La dea più gloriosa dei Vanir, maestra suprema della magia del Seidr, signora dell'amore, della fertilità e della guerra.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "heimdallr",
    name: "Heimdallr (Custode di Bifröst)",
    type: "Grande Divinità (Æsir), Legale Onorevole",
    category: "dei",
    cr: "GS 24",
    hp: 290, maxHp: 290, ac: 21,
    speed: "12m (40ft)",
    stats: { str: 24, dex: 22, con: 24, int: 18, wis: 28, cha: 20 },
    saves: { str: true, con: true, wis: true },
    proficientSkills: ["percezione", "intuizione", "atletica", "storia"],
    senses: "Sensi Infiniti (Sente l'erba crescere e vede a cento leghe giorno e notte), Vista Vera 72m, Percezione Passiva 30",
    damageImmunities: "Danni non magici",
    conditionImmunities: "Accecato, Assordato, Affascinato, Sorpreso",
    attacks: [
      { name: "Höfund, la Spada Radiosa", toHit: "+15", damage: "2d8+7 Tagliente + 3d8 Radioso", reach: "1.5m" },
      { name: "Squillo di Gjallarhorn", toHit: "CD 21 Cos", damage: "6d8 Tuono / Frastornato", reach: "36m cono" }
    ],
    traits: "Insonne Custode del Ponte dell'Arcobaleno. Vista e Udito Divini (Impossibile coglierlo di sorpresa o nascondersi dalla sua vista). Squillo del Fato.",
    actions: "Attacco Multiplo (3 fendenti con Höfund), Squillo d'Allarme di Asgardr, Sigillo del Bifröst.",
    legendaryActions: ["Fendente di Luce (1 Azione)", "Bagliore Iridato (2 Azioni)", "Ruggito del Gjallarhorn (3 Azioni)"],
    notes: "Il guardiano biondo di Asgardr, nemico giurato di Loki contro il quale combatterà fino alla morte reciproca al Ragnarok.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "tyr",
    name: "Tyr (Dio della Giustizia e della Guerra)",
    type: "Grande Divinità (Æsir), Legale Onorevole",
    category: "dei",
    cr: "GS 26",
    hp: 310, maxHp: 310, ac: 22,
    speed: "12m (40ft)",
    stats: { str: 26, dex: 20, con: 26, int: 16, wis: 22, cha: 22 },
    saves: { str: true, con: true, wis: true },
    proficientSkills: ["atletica", "intimidire", "storia", "asatru"],
    senses: "Vista Vera 24m, Percezione Passiva 22",
    damageImmunities: "Danni non magici",
    conditionImmunities: "Spaventato, Affascinato, Paralizzato",
    attacks: [
      { name: "Spada del Giuramento Sacro", toHit: "+16", damage: "3d8+8 Tagliente + 2d8 Radioso", reach: "1.5m" },
      { name: "Colpo Monomano di Giustizia", toHit: "+16", damage: "2d10+8 Contundente", reach: "1.5m" }
    ],
    traits: "Moncone del Sacrificio (Sacrificò la mano destra nella fauce di Fenrir per legarlo; immune a qualsiasi disarmo o presa). Aura di Coraggio Incrollabile.",
    actions: "Attacco Multiplo (3 attacchi con la spada), Giudizio del Thing, Scudo della Legge.",
    legendaryActions: ["Fendente della Legge (1 Azione)", "Imposizione del Giuramento (2 Azioni)", "Giudizio del Fato (3 Azioni)"],
    notes: "Il dio del diritto, del coraggio e dell'onore marziale, destinato a scontrarsi e morire con il mastino infernale Garmr.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "hel",
    name: "Hel (Regina dei Morti)",
    type: "Grande Divinità (Regina dell'Oltretomba), Neutrale Disonorevole",
    category: "dei",
    cr: "GS 24",
    hp: 280, maxHp: 280, ac: 20,
    speed: "12m (40ft)",
    stats: { str: 18, dex: 18, con: 22, int: 24, wis: 24, cha: 24 },
    saves: { con: true, int: true, wis: true, cha: true },
    proficientSkills: ["inganno", "intimidire", "religione", "percezione"],
    senses: "Scurovisione 36m, Vista Cieca 18m, Percezione Passiva 23",
    damageImmunities: "Necrotico, Freddo, Veleno; Danni da armi non magiche",
    conditionImmunities: "Affascinato, Esausto, Spaventato, Paralizzato, Avvelenato",
    attacks: [
      { name: "Tocco della Morte Eterna", toHit: "+14", damage: "3d10+7 Necrotico + 2d8 Freddo", reach: "1.5m", desc: "I PF massimi della creatura vengono ridotti di un ammontare pari al danno necrotico." },
      { name: "Onda Gelida dell'Eljudnir", toHit: "CD 21 Cos", damage: "6d8 Freddo / Necrotico", reach: "18m cono" }
    ],
    traits: "Sembiante Duplice (Metà corpo viva e bellissima, metà scheletrica e putrefatta). Aura Sepolcrale (I nemici entro 6m non possono recuperare punti ferita). Regina dei Caduti di Malattia e Vecchiaia.",
    actions: "Attacco Multiplo (2 tocchi letali), Evoca Legione di Draugr (2d4 scheletri o draugr), Maledizione di Helheimr.",
    legendaryActions: ["Tocco Spettrale (1 Azione)", "Spirito dei Sepolcri (2 Azioni)", "Gelo dell'Abisso Infernale (3 Azioni)"],
    notes: "Figlia di Loki e Angrboða, sovrana del regno nebbioso e freddo dell'Helheimr dove dimorano le anime non morte con onore in battaglia.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "fenrir",
    name: "Fenrir (Il Grande Lupo del Ragnarok)",
    type: "Bestia Titanica (Gargantuesca), Caotico Disonorevole",
    category: "boss",
    cr: "GS 28",
    hp: 420, maxHp: 420, ac: 21,
    speed: "18m (60ft)",
    stats: { str: 30, dex: 26, con: 28, int: 18, wis: 20, cha: 20 },
    saves: { str: true, dex: true, con: true, wis: true },
    proficientSkills: ["percezione", "furtivita", "atletica", "intimidire"],
    senses: "Scurovisione 36m, Fiuto Implacabile 72m, Percezione Passiva 25",
    damageImmunities: "Veleno; Contundente, Perforante e Tagliente da armi non magiche",
    damageResistances: "Freddo, Fuoco, Tuono",
    conditionImmunities: "Affascinato, Spaventato, Paralizzato, Prono",
    attacks: [
      { name: "Morso Inghiotti-Dei", toHit: "+18", damage: "4d12+10 Perforante + 3d8 Necrotico", reach: "3m", desc: "Se il bersaglio è Grande o inferiore viene inghiottito se scende a 0 PF." },
      { name: "Zampata Squartatrice", toHit: "+18", damage: "3d10+10 Tagliente", reach: "3m" }
    ],
    traits: "Spezzatore di Gleipnir (Immune a qualsiasi catena, vincolo magico o paralisi). Fauci del Mondo (La bocca aperta tocca contemporaneamente terra e cielo). Ruggito della Fine dei Tempi.",
    actions: "Attacco Multiplo (1 Morso e 2 Zampate), Balzo Titanico, Ruggito Apocalittico (CD 21 Sag o Spaventato e Stordito).",
    legendaryActions: ["Zampata Fulminea (1 Azione)", "Scatto Selvaggio (1 Azione)", "Morso Devastatore (2 Azioni)"],
    notes: "Il mostruoso lupo figlio di Loki, destinato a spezzare le catene di Gleipnir, divorare il sole e inghiottire Odino nella battaglia finale del Ragnarok.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "jormungandr",
    name: "Jörmungandr (Il Serpente di Midgardr)",
    type: "Drago Titanico (Gargantuesco), Caotico Disonorevole",
    category: "boss",
    cr: "GS 30",
    hp: 480, maxHp: 480, ac: 22,
    speed: "15m (nuoto 24m)",
    stats: { str: 30, dex: 10, con: 30, int: 10, wis: 18, cha: 16 },
    saves: { str: true, con: true, wis: true },
    proficientSkills: ["percezione", "atletica", "intimidire"],
    senses: "Vista Cieca 36m, Scurovisione 36m, Percezione Passiva 24",
    damageImmunities: "Veleno, Freddo, Acido; Armi non magiche",
    conditionImmunities: "Avvelenato, Affascinato, Paralizzato, Pietrificato, Prono",
    attacks: [
      { name: "Morso Tossico dell'Abisso", toHit: "+19", damage: "4d12+10 Perforante + 6d8 Veleno", reach: "4.5m" },
      { name: "Stretta Soffocante della Coda", toHit: "+19", damage: "4d10+10 Contundente", reach: "6m", desc: "Bersaglio afferrato e stritolato (CD 23 Forza per liberarsi)." },
      { name: "Soffio Letale di Eitr", toHit: "CD 23 Cos", damage: "12d8 Veleno / Acido", reach: "27m cono" }
    ],
    traits: "Serpente del Mondo (Il suo corpo cinge l'intero Midgardr). Sangue Velenoso di Eitr (Le armi da mischia che lo colpiscono subiscono corrosione). Maremoto Tellurico.",
    actions: "Attacco Multiplo (1 Morso, 1 Stretta di Coda), Soffio di Eitr (Ricarica 5-6), Maremoto Oceanico.",
    legendaryActions: ["Colpo di Coda (1 Azione)", "Stretta Mortale (2 Azioni)", "Spruzzo Tossico (2 Azioni)"],
    notes: "Il gigantesco serpente oceanico figlio di Loki, nemico predestinato di Thorr col quale si uccideranno a vicenda al termine di nove passi.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "surtr",
    name: "Surtr (Signore di Muspellsheimr)",
    type: "Gigante di Fuoco Titanico (Enorme), Caotico Disonorevole",
    category: "boss",
    cr: "GS 28",
    hp: 390, maxHp: 390, ac: 22,
    speed: "15m (50ft)",
    stats: { str: 30, dex: 14, con: 28, int: 18, wis: 20, cha: 22 },
    saves: { str: true, con: true, wis: true, cha: true },
    proficientSkills: ["atletica", "intimidire", "percezione"],
    senses: "Scurovisione 36m, Vista Cieca 18m, Percezione Passiva 23",
    damageImmunities: "Fuoco; Armi non magiche",
    conditionImmunities: "Affascinato, Spaventato, Paralizzato, Avvelenato",
    attacks: [
      { name: "Spada Fiammeggiante del Crepuscolo", toHit: "+18", damage: "4d10+10 Tagliente + 4d8 Fuoco", reach: "3m", desc: "Lama ardente più brillante del sole che brucia l'aria e dissolve ogni armatura." },
      { name: "Lancio del Magma Incandescente", toHit: "+18", damage: "4d8+10 Contundente + 3d8 Fuoco", reach: "18/72m" }
    ],
    traits: "Aura di Muspel (Ogni creatura entro 3m subisce 2d8 danni da fuoco all'inizio del turno). Flagello di Yggdrasill (Incendierà i Nove Mondi con la sua spada). Resistenza Leggendaria (3/giorno).",
    actions: "Attacco Multiplo (3 fendenti con la Spada del Crepuscolo), Eruzione Tellurica, Pioggia di Lapilli ardenti.",
    legendaryActions: ["Fendente di Fiamma (1 Azione)", "Muro di Magma (2 Azioni)", "Incendio dei Mondi (3 Azioni)"],
    notes: "Il sovrano dei giganti del fuoco di Muspellsheimr, custode della lama ardente primordiale destinato a uccidere Freyr e bruciare il cosmo.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "fafnir",
    name: "Fafnir (Il Drago dell'Oro Maledetto)",
    type: "Drago Enorme, Legale Disonorevole",
    category: "boss",
    cr: "GS 18",
    hp: 256, maxHp: 256, ac: 19,
    speed: "12m (volo 24m)",
    stats: { str: 25, dex: 14, con: 23, int: 18, wis: 15, cha: 19 },
    saves: { dex: true, con: true, wis: true, cha: true },
    proficientSkills: ["furtivita", "percezione", "inganno", "intimidire"],
    senses: "Vista Cieca 18m, Scurovisione 36m, Percezione Passiva 22",
    damageImmunities: "Veleno, Fuoco",
    conditionImmunities: "Affascinato, Spaventato, Paralizzato, Avvelenato",
    attacks: [
      { name: "Morso del Drago Corrotto", toHit: "+13", damage: "2d10+7 Perforante + 2d8 Veleno", reach: "3m" },
      { name: "Artigli Dilanianti", toHit: "+13", damage: "2d6+7 Tagliente", reach: "1.5m" },
      { name: "Soffio Velenoso Maledetto", toHit: "CD 19 Cos", damage: "10d8 Veleno", reach: "18m cono" }
    ],
    traits: "Aura di Cupidigia (Le creature vicine devono superare TS Sag CD 17 o essere ossessionate dal suo tesoro d'oro). Squame d'Acciaio Antico (Resistenza ai colpi non sferrati da una lama leggendaria come Gramr).",
    actions: "Attacco Multiplo (1 Morso e 2 Artigli), Soffio Tossico (Ricarica 5-6), Presenza Terrificante.",
    legendaryActions: ["Spazzata di Coda (1 Azione)", "Battito d'Ali (2 Azioni)"],
    notes: "Un tempo nobile dvergar figlio di Hreidmar, trasformato in una bestia mostruosa dalla corruzione dell'anello maledetto di Andvari.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "garmr",
    name: "Garmr (Il Mastino Infernale di Helheimr)",
    type: "Bestia Enorme (Segugio Infernale), Neutrale Malvagio",
    category: "boss",
    cr: "GS 14",
    hp: 195, maxHp: 195, ac: 18,
    speed: "15m (50ft)",
    stats: { str: 24, dex: 16, con: 22, int: 8, wis: 16, cha: 12 },
    saves: { str: true, dex: true, con: true },
    proficientSkills: ["percezione", "atletica", "furtivita"],
    senses: "Scurovisione 36m, Fiuto del Sangue 36m, Percezione Passiva 21",
    damageImmunities: "Freddo, Necrotico",
    conditionImmunities: "Affascinato, Spaventato, Paralizzato",
    attacks: [
      { name: "Morso Insanguinato della Gnipahellir", toHit: "+12", damage: "3d10+7 Perforante + 2d8 Necrotico", reach: "3m", desc: "Bersaglio atterrato e trattenuto nelle fauci insanguinate." },
      { name: "Urlo Infernale dell'Oltretomba", toHit: "CD 17 Sag", damage: "4d8 Tuono / Spaventato", reach: "12m raggio" }
    ],
    traits: "Custode delle Porte della Caverna Gnipahellir. Pelo grondante di sangue delle anime prave. Fiuto della Morte.",
    actions: "Attacco Multiplo (2 Morsi Zannuti), Ruggito Infernale, Balzo Dilaniante.",
    legendaryActions: ["Zampata Spezzaossa (1 Azione)", "Morso Rabbioso (2 Azioni)"],
    notes: "Il feroce mastino a quattro occhi incatenato all'ingresso del regno di Hel, destinato a battersi all'ultimo respiro contro il dio Tyr.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "jotunn_gelo",
    name: "Jötunn del Gelo (Gigante delle Montagne)",
    type: "Gigante Enorme, Neutrale Disonorevole",
    category: "gigante",
    cr: "GS 8",
    hp: 138, maxHp: 138, ac: 15,
    speed: "12m (40ft)",
    stats: { str: 23, dex: 9, con: 21, int: 9, wis: 10, cha: 12 },
    saves: { str: true, con: true },
    proficientSkills: ["atletica", "percezione"],
    senses: "Scurovisione 18m, Percezione Passiva 13",
    damageImmunities: "Freddo",
    damageVulnerabilities: "Fuoco",
    attacks: [
      { name: "Ascia Bipenne Titanica", toHit: "+9", damage: "3d12+6 Tagliente + 1d8 Freddo", reach: "3m" },
      { name: "Lancio del Macigno Glaciale", toHit: "+9", damage: "3d10+6 Contundente", reach: "18/72m" }
    ],
    traits: "Nato dal corpo primordiale di Ymir. Fimbulwinter (Il terreno entro 3m è terreno difficile di ghiaccio scivoloso).",
    actions: "Attacco Multiplo (2 colpi con l'Ascia Bipenne), Terremoto del Piede, Lancio del Masso.",
    notes: "Gigante glaciale delle alture dell'Utgardr, eterno nemico dei clan vichinghi e guerriero implacabile nelle bufere.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "geri_freki",
    name: "Geri & Freki (I Lupi Celesti di Odhinn)",
    type: "Bestia Grande, Legale Onorevole",
    category: "bestia",
    cr: "GS 8",
    hp: 120, maxHp: 120, ac: 20,
    speed: "18m (60ft)",
    stats: { str: 22, dex: 22, con: 17, int: 11, wis: 16, cha: 10 },
    saves: { dex: true, wis: true },
    proficientSkills: ["percezione", "furtivita", "sopravvivenza"],
    senses: "Vista Spirituale 36m, Fiuto delle Tracce 72m, Percezione Passiva 21",
    damageImmunities: "Veleno",
    damageResistances: "Danni da armi non magiche",
    attacks: [
      { name: "Morso Spirituale dei Járnviðr", toHit: "+9", damage: "2d8+6 Perforante + 2d6 Radioso", reach: "1.5m", desc: "Bersaglio supera TS For CD 17 o cade prono." },
      { name: "Assalto di Branco Coordinato", toHit: "+9", damage: "2d6+6 Tagliente", reach: "1.5m" }
    ],
    traits: "Tracciatore Spirituale (Interagiscono direttamente con il mondo degli spiriti e le anime). Tattica di Branco di Valhalla (Vantaggio sui tiri per colpire vicino a un alleato).",
    actions: "Attacco Multiplo (2 colpi di zanna), Atterramento Feroce, Balzo Silenzioso.",
    notes: "I due lupi compagni inseparabili del Padre di Tutti, nutriti con il cibo della tavola di Odino nel Valhalla.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "sleipnir",
    name: "Sleipnir (Destriero a Otto Zampe)",
    type: "Bestia Grande, Legale Onorevole",
    category: "bestia",
    cr: "GS 8",
    hp: 145, maxHp: 145, ac: 18,
    speed: "18m (volo 18m, nuoto 18m)",
    stats: { str: 24, dex: 18, con: 20, int: 11, wis: 17, cha: 15 },
    saves: { str: true, con: true },
    proficientSkills: ["atletica", "percezione"],
    senses: "Vista Magica 36m, Percezione Passiva 19",
    damageImmunities: "Veleno",
    attacks: [
      { name: "Zoccolo delle Otto Zampe", toHit: "+10", damage: "2d8+7 Contundente", reach: "1.5m" },
      { name: "Carica Tonante tra i Mondi", toHit: "+10", damage: "3d10+7 Contundente + 2d8 Tuono", reach: "3m" }
    ],
    traits: "Volo tra i Nove Mondi (Può cavalcare nell'aria, sulle acque e tra le dimensioni dei Nove Mondi). Otto Zampe Inarrestabili (Immune al terreno difficile).",
    actions: "Attacco Multiplo (2 Zoccolate), Salto Dimensionale del Bifröst, Calpestamento.",
    notes: "Il destriero supremo di Odino, nato dall'unione di Loki con il cavallo Svadilfari durante la costruzione delle mura di Asgardr.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "valkyria_odhinn",
    name: "Valkyria d'Odhinn (Sceglitrice dei Caduti)",
    type: "Celestiale Medio, Neutrale Onorevole",
    category: "boss",
    cr: "GS 5",
    hp: 85, maxHp: 85, ac: 17,
    speed: "9m (volo 18m)",
    stats: { str: 18, dex: 16, con: 16, int: 12, wis: 16, cha: 16 },
    saves: { con: true, wis: true },
    proficientSkills: ["percezione", "religione", "intimidire", "atletica"],
    senses: "Scurovisione 18m, Percezione Passiva 16",
    damageResistances: "Freddo, Fulmine, Radioso; Armi non magiche",
    attacks: [
      { name: "Lancia di Valhalla", toHit: "+7", damage: "1d10+4 Perforante + 1d8 Radioso", reach: "3m" },
      { name: "Dardo Runiche Celestiale", toHit: "+6", damage: "3d6 Radioso", reach: "36m" }
    ],
    traits: "Ali d'Oro del Valhalla (Volo etereo senza provocare attacchi di opportunità). Favore dei Caduti (Vantaggio sui tiri contro creature a meno di metà PF).",
    actions: "Attacco Multiplo (2 colpi di lancia), Canto della Gloria (Alleati entro 9m hanno +1d4 ai tiri per colpire).",
    notes: "Guerriera alata inviata dal Padre di Tutti per scegliere i guerrieri caduti più valorosi e condurli al Valhalla.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "sciamano_hel",
    name: "Sciamano dell'Helheimr",
    type: "Umanoide Medio (Seidmadhr Corrotto), Caotico Malvagio",
    category: "non-morto",
    cr: "GS 4",
    hp: 58, maxHp: 58, ac: 13,
    speed: "9m (30ft)",
    stats: { str: 10, dex: 14, con: 14, int: 14, wis: 18, cha: 13 },
    saves: { wis: true, int: true },
    proficientSkills: ["asatru", "religione", "inganno", "percezione"],
    senses: "Vista Cieca 9m, Percezione Passiva 16",
    damageResistances: "Necrotico, Freddo",
    attacks: [
      { name: "Bastone delle Rune d'Ossa", toHit: "+5", damage: "1d6+2 Contundente + 2d6 Necrotico", reach: "1.5m" },
      { name: "Dardo dell'Abisso Infernale", toHit: "+6", damage: "3d8 Necrotico", reach: "24m" }
    ],
    traits: "Incantatore del Seidr Oscuro (CD 14, bonus attacco incantesimi +6). Sussurri dei Defunti (I nemici entro 6m hanno svantaggio sui TS Saggezza).",
    actions: "Attacco Multiplo (2 dardi necrotici), Rianima Scheletro dal Permafrost, Maledizione delle Ossa Gelide.",
    notes: "Officiante dei riti sacrileghi legati alla dimora nebbiosa di Hel, capace di richiamare i guerrieri morti dal ghiaccio.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "lupo_invernale",
    name: "Lupo Invernale di Fenrir",
    type: "Bestia Grande, Caotico Malvagio",
    category: "bestia",
    cr: "GS 3",
    hp: 75, maxHp: 75, ac: 15,
    speed: "15m (50ft)",
    stats: { str: 18, dex: 14, con: 16, int: 6, wis: 12, cha: 8 },
    saves: { dex: true, con: true },
    proficientSkills: ["percezione", "furtivita"],
    senses: "Fiuto e Udito Sviluppati, Scurovisione 18m, Percezione Passiva 15",
    damageImmunities: "Freddo",
    attacks: [
      { name: "Morso Zannuto Glaciale", toHit: "+6", damage: "2d6+4 Perforante + 1d6 Freddo", reach: "1.5m", desc: "Bersaglio deve superare TS For CD 14 o cadere prono." },
      { name: "Soffio del Gelo Polare", toHit: "CD 13 Des", damage: "4d6 Freddo", reach: "4.5m cono" }
    ],
    traits: "Tattica di Branco (Vantaggio sui tiri per colpire se ha alleati a 1.5m). Passo nella Bufera (Nessun malus da neve o ghiaccio).",
    actions: "Morso Zannuto, Soffio Polare (Ricarica 5-6), Balzo Rapido.",
    notes: "Predatore nato dalle profondità dei boschi di Járnviðr che caccia nei branchi al servizio della prole di Fenrir.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "draugr_cripte",
    name: "Draugr delle Cripte",
    type: "Non-Morto Medio (Guerriero del Tumulo), Caotico Disonorevole",
    category: "non-morto",
    cr: "GS 2",
    hp: 45, maxHp: 45, ac: 14,
    speed: "9m (30ft)",
    stats: { str: 16, dex: 11, con: 16, int: 6, wis: 10, cha: 6 },
    saves: { con: true, str: true },
    proficientSkills: ["atletica", "intimidire"],
    senses: "Scurovisione 18m, Percezione Passiva 10",
    damageImmunities: "Veleno",
    damageResistances: "Freddo, Necrotico",
    conditionImmunities: "Avvelenato, Esausto",
    attacks: [
      { name: "Spada Arrugginita del Sepolcro", toHit: "+5", damage: "1d8+3 Tagliente + 1d6 Necrotico", reach: "1.5m" },
      { name: "Tocco Cadaverico Ingelosente", toHit: "+5", damage: "2d6 Freddo", reach: "1.5m" }
    ],
    traits: "Tenacia del Non-Morto (Se ridotto a 0 PF effettua TS Costituzione con CD 5+danni per tornare a 1 PF). Odore della Decomposizione.",
    actions: "Attacco Multiplo (2 colpi con la spada), Sguardo Terrificante della Tomba.",
    notes: "Antico fiero guerriero vichingo rianimato dalla magia oscura per difendere il tesoro del suo tumulo funerario nel permafrost.",
    avatar: "",
    model: "",
    custom3dModel: null
  },
  {
    id: "guerriero_predone",
    name: "Guerriero Predone del Clan",
    type: "Umanoide Medio (Berserker Vichingo), Caotico Neutrale",
    category: "umanoide",
    cr: "GS 2",
    hp: 38, maxHp: 38, ac: 13,
    speed: "9m (30ft)",
    stats: { str: 16, dex: 12, con: 15, int: 10, wis: 11, cha: 9 },
    saves: { str: true, con: true },
    proficientSkills: ["atletica", "intimidire", "sopravvivenza"],
    senses: "Percezione Passiva 11",
    attacks: [
      { name: "Ascia da Battaglia Norrena", toHit: "+5", damage: "1d8+3 Tagliente (o 1d10+3 a due mani)", reach: "1.5m" },
      { name: "Giavellotto di Frassino", toHit: "+5", damage: "1d6+3 Perforante", reach: "9/36m" }
    ],
    traits: "Frenesia di Sangue (Vantaggio sui tiri salvezza contro Spaventato). Muro di Scudi (+2 CA se adiacente a un alleato armato di scudo).",
    actions: "Attacco Multiplo (2 colpi di ascia), Urlo di Guerra intimidatorio.",
    notes: "Incursore veterano dei fiordi di Norvegr pronto a dare la vita per il suo Jarl e guadagnarsi il Valhalla.",
    avatar: "",
    model: "",
    custom3dModel: null
  }
];

window.getCampaignEnemies = function(campCode) {
  const camp = window.dbState && window.dbState.campaigns ? window.dbState.campaigns[campCode] : null;
  if (!camp) return window.DEFAULT_NORSE_BESTIARY;
  if (!camp.enemies || !Array.isArray(camp.enemies) || camp.enemies.length < window.DEFAULT_NORSE_BESTIARY.length) {
    const existingIds = new Set((camp.enemies || []).map(e => e.id));
    const merged = [...(camp.enemies || [])];
    window.DEFAULT_NORSE_BESTIARY.forEach(defEnemy => {
      if (!existingIds.has(defEnemy.id)) {
        merged.push(JSON.parse(JSON.stringify(defEnemy)));
      }
    });
    camp.enemies = merged.length >= window.DEFAULT_NORSE_BESTIARY.length ? merged : JSON.parse(JSON.stringify(window.DEFAULT_NORSE_BESTIARY));
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
      b.className = 'dm-enemy-filter-btn px-3 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white shadow-sm';
    } else {
      b.className = 'dm-enemy-filter-btn px-3 py-1 rounded-full text-[10px] font-bold bg-slate-900 text-slate-300 hover:text-white';
    }
  });
  window.renderDmEnemiesViews();
};

window.CR_XP_MAP = {
  '1/8': '25 PE', '1/4': '50 PE', '1/2': '100 PE',
  '1': '200 PE', '2': '450 PE', '3': '700 PE', '4': '1,100 PE', '5': '1,800 PE',
  '6': '2,300 PE', '7': '2,900 PE', '8': '3,900 PE', '9': '5,000 PE', '10': '5,900 PE',
  '11': '7,200 PE', '12': '8,400 PE', '13': '10,000 PE', '14': '11,500 PE', '15': '13,000 PE',
  '16': '15,000 PE', '17': '18,000 PE', '18': '20,000 PE', '19': '22,000 PE', '20': '25,000 PE',
  '21': '33,000 PE', '22': '41,000 PE', '23': '50,000 PE', '24': '62,000 PE', '25': '75,000 PE',
  '28': '120,000 PE', '30': '155,000 PE'
};

function getStatModStr(val) {
  const mod = Math.floor(((val || 10) - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

window.renderDmEnemiesViews = function() {
  const grid = document.getElementById('dm-enemies-cards-grid');
  if (!grid) return;
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;

  const enemies = window.getCampaignEnemies(campCode);
  const search = (document.getElementById('dm-enemies-search')?.value || '').toLowerCase().trim();
  const filterCat = window.activeDmEnemyFilter || 'tutti';

  // Aggiorna KPI Dashboard
  const kpiTotal = document.getElementById('kpi-total-enemies');
  const kpiBoss = document.getElementById('kpi-boss-enemies');
  const kpiStl = document.getElementById('kpi-stl-enemies');
  const kpiCr = document.getElementById('kpi-max-cr');

  if (kpiTotal) kpiTotal.textContent = enemies.length;
  if (kpiBoss) {
    kpiBoss.textContent = enemies.filter(e => {
      const c = ((e.category || '') + ' ' + (e.type || '')).toLowerCase();
      return c.includes('boss') || c.includes('dei') || (e.hp >= 150);
    }).length;
  }
  if (kpiStl) {
    kpiStl.textContent = enemies.filter(e => e.custom3dModel && (e.custom3dModel.has3D || e.custom3dModel.dataUrl || e.custom3dModel.name)).length;
  }
  if (kpiCr) {
    let maxCrNum = 0;
    enemies.forEach(e => {
      const num = parseInt((e.cr || '0').replace(/\D/g, '')) || 0;
      if (num > maxCrNum) maxCrNum = num;
    });
    kpiCr.textContent = `GS ${maxCrNum || 1}`;
  }

  const filtered = enemies.filter(e => {
    const matchSearch = !search ||
      (e.name || '').toLowerCase().includes(search) ||
      (e.type || '').toLowerCase().includes(search) ||
      (e.cr || '').toLowerCase().includes(search);

    const cat = (e.category || '').toLowerCase() || (e.type || '').toLowerCase();
    const matchCat = (filterCat === 'tutti') ||
      (filterCat === 'dei' && (cat.includes('dei') || cat.includes('divin') || cat.includes('aesir') || cat.includes('vanir'))) ||
      (filterCat === 'boss' && (cat.includes('boss') || cat.includes('dei') || (e.hp >= 150))) ||
      (filterCat === 'gigante' && (cat.includes('gigant') || cat.includes('jotunn'))) ||
      (filterCat === 'bestia' && (cat.includes('bestia') || cat.includes('lupo') || cat.includes('drago') || cat.includes('serpente'))) ||
      (filterCat === 'non-morto' && (cat.includes('non') || cat.includes('mort') || cat.includes('draugr') || cat.includes('schelet'))) ||
      (filterCat === 'umanoide' && (cat.includes('uman') || cat.includes('viching') || cat.includes('clan') || cat.includes('berserk')));

    return matchSearch && matchCat;
  });

  const iconSword = window.getNorseIcon ? window.getNorseIcon('swords', 'w-4 h-4 inline mr-1 text-amber-300') : '';
  const iconQuill = window.getNorseIcon ? window.getNorseIcon('quill', 'w-3 h-3 inline mr-1') : '';
  const iconClone = window.getNorseIcon ? window.getNorseIcon('clone', 'w-3 h-3 inline mr-1') : '';
  const iconTrash = window.getNorseIcon ? window.getNorseIcon('trash', 'w-3 h-3 inline mr-1') : '';
  const iconStl = window.getNorseIcon ? window.getNorseIcon('stl3d', 'w-3.5 h-3.5 text-cyan-400 inline mr-1') : '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full norse-panel rounded-3xl p-10 text-center text-slate-400 space-y-3 border-2 border-slate-800 bg-slate-950/70">
        <h4 class="font-cinzel font-bold text-base text-white">Nessuna creatura trovata</h4>
        <p class="text-xs text-slate-500">Prova a modificare i filtri di ricerca o crea una nuova scheda per la campagna.</p>
        <button type="button" onclick="window.filterDmEnemies('tutti'); document.getElementById('dm-enemies-search').value='';" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 hover:text-white transition">Reimposta Filtri</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(e => {
    const atk1 = (e.attacks && e.attacks[0]) || null;
    const atk2 = (e.attacks && e.attacks[1]) || null;
    const stats = e.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const hasStl = !!(e.custom3dModel && (e.custom3dModel.has3D || e.custom3dModel.dataUrl || e.custom3dModel.name));
    const stlName = (e.custom3dModel && e.custom3dModel.name) || 'Modello 3D';

    const catStr = ((e.category || '') + ' ' + (e.type || '')).toLowerCase();
    const isBoss = (e.hp >= 150) || catStr.includes('boss') || catStr.includes('dei');
    const isGiant = catStr.includes('gigant') || catStr.includes('jotunn');
    const isUndead = catStr.includes('non') || catStr.includes('mort') || catStr.includes('draugr');
    const isBeast = catStr.includes('bestia') || catStr.includes('lupo') || catStr.includes('drago') || catStr.includes('serpente');

    let cardBorder = 'border-slate-800 hover:border-amber-500/50 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900';
    let tokenBorder = 'border-amber-500/60 bg-slate-950 text-amber-300';
    let badgeBg = 'bg-amber-950/80 text-amber-300 border-amber-500/40';

    if (isBoss) {
      cardBorder = 'border-amber-400/70 shadow-[0_0_30px_rgba(245,158,11,0.22)] bg-gradient-to-b from-[#1c1204] via-slate-950 to-slate-900 hover:border-amber-300';
      tokenBorder = 'border-amber-400 bg-amber-950 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      badgeBg = 'bg-amber-900/90 text-amber-200 border-amber-400/60';
    } else if (isGiant) {
      cardBorder = 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-gradient-to-b from-[#190808] via-slate-950 to-slate-900 hover:border-red-400';
      tokenBorder = 'border-red-500 bg-red-950 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]';
      badgeBg = 'bg-red-950/90 text-red-300 border-red-500/40';
    } else if (isUndead) {
      cardBorder = 'border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-gradient-to-b from-[#14081c] via-slate-950 to-slate-900 hover:border-purple-400';
      tokenBorder = 'border-purple-500 bg-purple-950 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]';
      badgeBg = 'bg-purple-950/90 text-purple-300 border-purple-500/40';
    } else if (isBeast) {
      cardBorder = 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-gradient-to-b from-[#06170d] via-slate-950 to-slate-900 hover:border-emerald-400';
      tokenBorder = 'border-emerald-500 bg-emerald-950 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]';
      badgeBg = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40';
    }

    const crNum = (e.cr || '1').replace(/\D/g, '');
    const xpText = window.CR_XP_MAP[crNum] || `${e.cr || 'GS 1'}`;
    const initial = (e.name || 'N').charAt(0).toUpperCase();

    return `
      <div class="norse-panel rounded-3xl p-4.5 border-2 ${cardBorder} transition-all duration-300 flex flex-col justify-between space-y-3.5 shadow-xl group">
        <div class="space-y-3">
          <!-- Header Card: Token Iniziale, Nome, Archetipo, GS & PE -->
          <div class="flex items-start justify-between gap-2.5 border-b border-slate-800/80 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl border-2 ${tokenBorder} flex items-center justify-center font-cinzel font-black text-lg shrink-0">
                ${initial}
              </div>
              <div class="min-w-0">
                <h4 class="font-cinzel font-black text-sm text-white group-hover:text-amber-300 transition truncate max-w-[180px] sm:max-w-[210px]">${e.name}</h4>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="text-[9px] font-mono font-bold px-2 py-0.2 rounded-md ${badgeBg} border">${e.cr || 'GS 1'} &bull; ${xpText}</span>
                  <span class="text-[10px] text-slate-400 truncate max-w-[120px]">${e.type || 'Creatura'}</span>
                </div>
              </div>
            </div>

            <!-- Badge PF & CA -->
            <div class="text-right flex-shrink-0">
              <div class="font-mono font-extrabold text-sm text-emerald-400 flex items-center justify-end gap-1">
                <span>${e.hp}</span> <span class="text-[9px] text-slate-400 font-sans font-normal">PF</span>
              </div>
              <div class="text-[10px] text-amber-300 font-mono font-bold flex items-center justify-end gap-1">
                <svg class="w-3 h-3 text-amber-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> CA ${e.ac || 12}
              </div>
            </div>
          </div>

          <!-- Barra Salute Visiva & Velocità Metrica -->
          <div class="space-y-1">
            <div class="flex justify-between items-center text-[9px] font-mono text-slate-400">
              <span>Salute Massima</span>
              <span class="text-slate-300 font-bold">${e.hp}/${e.hp} PF &bull; Vel: ${e.speed || '9m'}</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" style="width: 100%;"></div>
            </div>
          </div>

          <!-- Modello 3D STL Status & Caricamento Rapido 1-Click -->
          <div class="p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-[10px]">
            <div class="flex items-center gap-1.5 truncate">
              <span class="text-slate-400 font-cinzel">Miniatura 3D:</span>
              ${hasStl ? `
                <span class="text-cyan-300 font-mono font-bold flex items-center gap-1 truncate">
                  ${iconStl} ${stlName}
                </span>
              ` : `
                <span class="text-slate-500 font-mono text-[9px]">Basetta Tattica Base</span>
              `}
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <input type="file" id="direct-stl-${e.id}" accept=".stl,.glb,.gltf,.obj" class="hidden" onchange="window.handleDirectEnemyStlUpload(event, '${e.id}')">
              <button type="button" onclick="document.getElementById('direct-stl-${e.id}').click()" class="px-2 py-0.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-[9px] font-bold transition">
                ${hasStl ? 'Cambia' : '+ STL'}
              </button>
              ${hasStl ? `
                <button type="button" onclick="window.clearEnemyDirectStl('${e.id}')" title="Rimuovi miniatura 3D" class="px-1.5 py-0.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 text-[9px] font-mono font-bold transition">
                  &times;
                </button>
              ` : ''}
            </div>
          </div>

          <!-- Caratteristiche Pills D&D 5E con Modificatori (+4, -1...) -->
          <div class="grid grid-cols-6 gap-1 text-center py-1 border-y border-slate-800/80 text-[9px] font-mono">
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">FOR</span>
              <strong class="text-white">${stats.str || 10}</strong>
              <span class="text-[8px] text-amber-300 block">${getStatModStr(stats.str)}</span>
            </div>
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">DES</span>
              <strong class="text-white">${stats.dex || 10}</strong>
              <span class="text-[8px] text-sky-300 block">${getStatModStr(stats.dex)}</span>
            </div>
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">COS</span>
              <strong class="text-white">${stats.con || 10}</strong>
              <span class="text-[8px] text-emerald-300 block">${getStatModStr(stats.con)}</span>
            </div>
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">INT</span>
              <strong class="text-white">${stats.int || 10}</strong>
              <span class="text-[8px] text-purple-300 block">${getStatModStr(stats.int)}</span>
            </div>
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">SAG</span>
              <strong class="text-white">${stats.wis || 10}</strong>
              <span class="text-[8px] text-cyan-300 block">${getStatModStr(stats.wis)}</span>
            </div>
            <div class="bg-slate-950/80 rounded-lg py-1 border border-slate-900">
              <span class="text-slate-500 text-[8px] block">CAR</span>
              <strong class="text-white">${stats.cha || 10}</strong>
              <span class="text-[8px] text-pink-300 block">${getStatModStr(stats.cha)}</span>
            </div>
          </div>

          <!-- Attacchi Principali -->
          <div class="space-y-1 py-1 text-xs">
            ${atk1 ? `
              <div class="flex items-center justify-between bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                <span class="font-bold text-white truncate max-w-[140px] flex items-center gap-1">
                  <svg class="w-3 h-3 text-amber-400 inline shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6 2 2-6-3-3-5 7z"/><path d="m5 14 5 5"/></svg>
                  <span class="truncate">${atk1.name}</span>
                </span>
                <span class="font-mono text-[10px] text-amber-300 font-bold shrink-0">${atk1.toHit || '+0'} &bull; ${atk1.damage || ''}</span>
              </div>
            ` : ''}
            ${atk2 ? `
              <div class="flex items-center justify-between bg-slate-950/70 px-2.5 py-1.5 rounded-xl border border-slate-800/60">
                <span class="font-bold text-slate-300 truncate max-w-[140px] flex items-center gap-1">
                  <svg class="w-3 h-3 text-sky-400 inline shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></svg>
                  <span class="truncate">${atk2.name}</span>
                </span>
                <span class="font-mono text-[10px] text-sky-300 font-bold shrink-0">${atk2.toHit || ''} &bull; ${atk2.damage || ''}</span>
              </div>
            ` : ''}
          </div>

          <!-- Tratti & Privilegi Brevi -->
          ${e.traits ? `
            <p class="text-[10px] text-slate-300 line-clamp-2 leading-relaxed italic bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
              "${e.traits}"
            </p>
          ` : ''}
        </div>

        <!-- AZIONI: SCHIERA SULLA MAPPA 3D, SCHEDA COMPLETA, CLONA, ELIMINA -->
        <div class="pt-3 border-t border-slate-800/80 flex flex-col gap-2">
          <button type="button" onclick="window.deployEnemyToMap3D('${e.id}')" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-700 via-red-600 to-amber-600 hover:brightness-110 text-white font-cinzel font-black text-xs shadow-lg shadow-red-950/40 flex items-center justify-center transition active:scale-95">
            ${iconSword} SCHIERA SULLA MAPPA 3D
          </button>
          <div class="grid grid-cols-3 gap-1.5 text-[10px]">
            <button type="button" onclick="window.openDmEnemyEditorModal('${e.id}')" class="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition flex items-center justify-center font-bold font-cinzel">
              ${iconQuill} Scheda
            </button>
            <button type="button" onclick="window.duplicateEnemySheet('${e.id}')" class="py-1.5 px-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white transition flex items-center justify-center font-bold font-cinzel">
              ${iconClone} Clona
            </button>
            <button type="button" onclick="window.deleteEnemySheet('${e.id}')" class="py-1.5 px-2 rounded-xl bg-red-950/40 border border-red-500/40 hover:border-red-400 text-red-300 hover:text-red-100 transition flex items-center justify-center font-bold font-cinzel">
              ${iconTrash} Elimina
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
};

window.handleDirectEnemyStlUpload = function(event, enemyId) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (!['stl', 'glb', 'gltf', 'obj'].includes(ext)) {
    if (typeof window.showToast === "function") window.showToast("Formato 3D Non Valido", "Carica un file .stl, .glb o .obj.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const campCode = window.activeDmWorkspaceCode;
    const enemies = window.getCampaignEnemies(campCode);
    const enemy = enemies.find(x => x.id === enemyId);
    if (enemy) {
      enemy.custom3dModel = {
        type: ext,
        name: file.name,
        size: file.size,
        has3D: true,
        dataUrl: e.target.result
      };
      window.saveCampaignEnemies(campCode, enemies);
      window.renderDmEnemiesViews();
      if (typeof window.showToast === 'function') {
        window.showToast('Miniatura 3D Collegata', `"${file.name}" associato con successo a ${enemy.name}!`);
      }
    }
  };
  reader.readAsDataURL(file);
};

window.clearEnemyDirectStl = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode;
  const enemies = window.getCampaignEnemies(campCode);
  const enemy = enemies.find(x => x.id === enemyId);
  if (enemy) {
    enemy.custom3dModel = null;
    window.saveCampaignEnemies(campCode, enemies);
    window.renderDmEnemiesViews();
    if (typeof window.showToast === 'function') {
      window.showToast('Miniatura Rimossa', `Modello 3D rimosso da ${enemy.name}.`);
    }
  }
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
  if (title) title.textContent = enemy ? `Scheda Completa: ${enemy.name}` : "Nuova Scheda Nemico (Manuale Norreno)";

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

  // Gestione Miniatura 3D (.STL / .GLB / .OBJ)
  window._currentEditingEnemyStl = (enemy && enemy.custom3dModel) ? JSON.parse(JSON.stringify(enemy.custom3dModel)) : null;
  window.updateEnemyStlPreviewBadge();

  modal.classList.remove('hidden');
};

window.closeDmEnemyEditorModal = function() {
  const modal = document.getElementById('modal-enemy-sheet-editor');
  if (modal) modal.classList.add('hidden');
};

window.updateEnemyStlPreviewBadge = function() {
  const badge = document.getElementById('enemy-stl-status-badge');
  const clearBtn = document.getElementById('enemy-stl-clear-btn');
  if (!badge) return;

  if (window._currentEditingEnemyStl && window._currentEditingEnemyStl.name) {
    badge.innerHTML = `
      <span class="text-cyan-300 font-mono font-bold flex items-center gap-1.5">
        <svg class="w-4 h-4 text-cyan-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21 16-9 5-9-5V8l9-5 9 5v8z"/><path d="m3.27 6.96 8.73 4.88 8.73-4.88"/><path d="M12 22.08V12"/></svg>
        File 3D Collegato: ${window._currentEditingEnemyStl.name}
      </span>
    `;
    if (clearBtn) clearBtn.classList.remove('hidden');
  } else {
    badge.innerHTML = `
      <span class="text-slate-500 font-mono text-xs">Nessun file .STL collegato (apparirà la basetta runica tattica con iniziale sul VTT).</span>
    `;
    if (clearBtn) clearBtn.classList.add('hidden');
  }
};

window.handleEnemyStlFileUpload = function(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const ext = file.name.split('.').pop().toLowerCase();
  if (ext !== 'stl' && ext !== 'glb' && ext !== 'gltf' && ext !== 'obj') {
    if (typeof window.showToast === "function") window.showToast("Formato 3D Non Valido", "Carica un file .stl, .glb o .obj.", "error");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    window._currentEditingEnemyStl = {
      type: ext,
      name: file.name,
      size: file.size,
      dataUrl: e.target.result
    };
    window.updateEnemyStlPreviewBadge();
    if (typeof window.showToast === 'function') {
      window.showToast('Miniatura 3D Collegata', `File 3D "${file.name}" caricato nella scheda.`);
    }
  };
  reader.readAsDataURL(file);
};

window.clearEnemyStlFile = function() {
  if (window._currentEditingEnemyStl && window._currentEditingEnemyStl.modelId && window.Ygg3DStore) {
    window.Ygg3DStore.removeModel(window._currentEditingEnemyStl.modelId);
  }
  window._currentEditingEnemyStl = null;
  const input = document.getElementById('enemy-stl-file-input');
  if (input) input.value = '';
  window.updateEnemyStlPreviewBadge();
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

  let enemyCustom3d = null;
  if (window._currentEditingEnemyStl) {
    const modelId = window._currentEditingEnemyStl.modelId || ('enemy_' + id);
    if (window.Ygg3DStore && window._currentEditingEnemyStl.dataUrl) {
      window.Ygg3DStore.saveModel(modelId, {
        modelId: modelId,
        type: window._currentEditingEnemyStl.type,
        name: window._currentEditingEnemyStl.name,
        size: window._currentEditingEnemyStl.size,
        dataUrl: window._currentEditingEnemyStl.dataUrl
      });
    }
    enemyCustom3d = {
      modelId: modelId,
      type: window._currentEditingEnemyStl.type,
      name: window._currentEditingEnemyStl.name,
      size: window._currentEditingEnemyStl.size,
      has3D: true,
      dataUrl: (window._currentEditingEnemyStl.size < 300000) ? window._currentEditingEnemyStl.dataUrl : null
    };
  }

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
    avatar: "",
    model: "",
    custom3dModel: enemyCustom3d
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
    window.showToast('Scheda Salvata', `"${name}" registrata con successo.`);
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
    window.showToast('Scheda Clonata', `Creata copia di "${orig.name}".`);
  }
};

window.deleteEnemySheet = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode;
  if (!campCode) return;
  const enemies = window.getCampaignEnemies(campCode);
  const enemy = enemies.find(e => e.id === enemyId);
  if (!enemy) return;

  if (!confirm(`Sei sicuro di voler eliminare la scheda di "${enemy.name}" dai nemici?`)) return;

  const updated = enemies.filter(e => e.id !== enemyId);
  window.saveCampaignEnemies(campCode, updated);
  window.renderDmEnemiesViews();
  if (typeof window.showToast === 'function') {
    window.showToast('Scheda Eliminata', `"${enemy.name}" rimosso dai nemici.`);
  }
};

window.deployEnemyToMap3D = function(enemyId) {
  const campCode = window.activeDmWorkspaceCode || 'MIDGARD-VALHALLA';
  const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[campCode];
  if (!camp) return;
  const enemy = (camp.customEnemies || []).find(e => e.id === enemyId);
  if (!enemy) return;

  if (!camp.members) camp.members = {};
  const tokenKey = 'enemy_' + enemy.id + '_' + Date.now().toString(36);
  camp.members[tokenKey] = {
    id: tokenKey,
    name: enemy.name,
    charClass: enemy.type || 'Mostro',
    level: enemy.cr || 1,
    hp: enemy.hp || 30,
    maxHp: enemy.hp || 30,
    ac: enemy.ac || 14,
    posX: 0,
    posY: 0.25,
    posZ: 0,
    isEnemy: true
  };
  window.saveDB();
  if (typeof window.showToast === 'function') {
    window.showToast("Nemico Schierato", `[${enemy.name}] schierato sulla Mappa 3D!`, "success");
  }
  if (window.Map3D && typeof window.Map3D.openMap === 'function') {
    window.Map3D.openMap(campCode, 'DM');
  }
};
