// ============================================================================
// MODULO DUNGEON MASTER: LISTA CAMPAGNE (SWIPE-TO-DELETE) & WORKSPACE CAMPAGNA
// ============================================================================
let activeDmWorkspaceCode = null;
let dmManageFilter = 'tutti';
let dmCustomCardImage = CARD_ARTWORKS.arma;
let swipedCampaignCode = null;
let touchStartX = 0;

function dmCreateCampaign() {
  const titleInput = document.getElementById('dm-new-camp-title');
  const title = titleInput.value.trim() || 'Saga di Midgard';
  const code = 'YGG-' + Math.floor(1000 + Math.random() * 9000);

  if (!dbState.campaigns) dbState.campaigns = {};
  dbState.campaigns[code] = {
    code: code,
    title: title,
    dmUser: currentUser,
    members: {},
    chest: [],
    createdCards: [],
    globalEvent: null
  };

  titleInput.value = '';
  saveDB();
}

function handleCampTouchStart(e, code) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleCampTouchEnd(e, code) {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (diff < -55) {
    swipedCampaignCode = code;
    renderDmViews();
  } else if (diff > 40 && swipedCampaignCode === code) {
    swipedCampaignCode = null;
    renderDmViews();
  }
}

function toggleSwipeDeleteState(e, code) {
  e.stopPropagation();
  swipedCampaignCode = (swipedCampaignCode === code) ? null : code;
  renderDmViews();
}

function dmDeleteCampaign(e, code) {
  e.stopPropagation();
  const camp = dbState.campaigns[code];
  if (!camp) return;
  if (!confirm(`Vuoi eliminare definitivamente la campagna "${camp.title}" (${code})?`)) return;

  delete dbState.campaigns[code];
  if (activeDmWorkspaceCode === code) activeDmWorkspaceCode = null;
  swipedCampaignCode = null;
  saveDB();
}

function openDmCampaignWorkspace(code) {
  if (swipedCampaignCode === code) {
    swipedCampaignCode = null;
    renderDmViews();
    return;
  }
  activeDmWorkspaceCode = code;

  document.getElementById('mode-standard-views').classList.add('hidden');
  document.getElementById('bottom-nav-standard').classList.add('hidden');

  document.getElementById('mode-dm-campaign-workspace').classList.remove('hidden');
  document.getElementById('bottom-nav-dm-workspace').classList.remove('hidden');
  document.getElementById('btn-exit-dm-campaign').classList.remove('hidden');

  switchDmWorkspaceTab('party');
}

function exitDmCampaignWorkspace() {
  activeDmWorkspaceCode = null;
  switchStandardNav('dm');
}

function switchDmWorkspaceTab(tab) {
  document.getElementById('dm-subview-manage').classList.toggle('hidden', tab !== 'manage');
  document.getElementById('dm-subview-party').classList.toggle('hidden', tab !== 'party');
  document.getElementById('dm-subview-create').classList.toggle('hidden', tab !== 'create');

  document.getElementById('dmnav-manage').className = tab === 'manage'
    ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';

  document.getElementById('dmnav-create').className = tab === 'create'
    ? 'flex flex-col items-center gap-1 text-amber-400 w-28 py-2'
    : 'flex flex-col items-center gap-1 text-slate-400 w-28 py-2';

  document.getElementById('dmnav-party-label').className = tab === 'party'
    ? 'font-cinzel font-black text-[10px] text-amber-300 tracking-widest mt-1 uppercase'
    : 'font-cinzel font-bold text-[10px] text-slate-400 tracking-widest mt-1 uppercase';

  renderDmViews();
  if (tab === 'create') updateDmCardPreview();
}

function dmMassAdjustHP(delta) {
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

  Object.entries(camp.members || {}).forEach(([uKey, mChar]) => {
    mChar.hp = Math.max(0, Math.min(mChar.maxHp, mChar.hp + delta));
    if (dbState.users[uKey] && dbState.users[uKey].characters) {
      const idx = dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) dbState.users[uKey].characters[idx] = mChar;
    }
  });
  saveDB();
}

function dmSingleAdjustHP(uKey, delta) {
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];
  const mChar = camp.members[uKey];
  if (!mChar) return;

  mChar.hp = Math.max(0, Math.min(mChar.maxHp, mChar.hp + delta));
  if (dbState.users[uKey] && dbState.users[uKey].characters) {
    const idx = dbState.users[uKey].characters.findIndex(c => c.id === mChar.id);
    if (idx !== -1) dbState.users[uKey].characters[idx] = mChar;
  }
  saveDB();
}

function dmTriggerTactical(type) {
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

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
  lastSeenEventTimestamp = evt.timestamp;
  displayGlobalAnimation(evt);
  saveDB();
}

function handleDmCardImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  autoFitImageFile(file, 400, 260, resizedDataUrl => {
    dmCustomCardImage = resizedDataUrl;
    updateDmCardPreview();
  });
}

function handleDmCardUrlInput(url) {
  if (url && url.trim().startsWith('http')) {
    dmCustomCardImage = url.trim();
    updateDmCardPreview();
  }
}

function updateDmCardPreview() {
  const previewCard = {
    id: 'preview',
    name: document.getElementById('dmc-name')?.value.trim() || 'Nuova Reliquia',
    type: document.getElementById('dmc-type')?.value || 'arma',
    rarity: document.getElementById('dmc-rarity')?.value || 'raro',
    damage: document.getElementById('dmc-dmg')?.value.trim() || '2d6+3',
    weight: parseFloat(document.getElementById('dmc-weight')?.value) || 2.0,
    stars: 5,
    img: dmCustomCardImage,
    desc: document.getElementById('dmc-desc')?.value.trim() || 'L\'immagine viene centrata e adattata automaticamente alla carta.'
  };
  const holder = document.getElementById('dm-card-live-preview');
  if (holder) {
    holder.innerHTML = buildYgoCardHTML(previewCard, false);
  }
}

function dmCreateAndAssignCard(e) {
  e.preventDefault();
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

  const ownerTarget = document.getElementById('dmc-owner').value;
  const newCard = {
    id: 'dmcard_' + Date.now(),
    name: document.getElementById('dmc-name').value.trim(),
    type: document.getElementById('dmc-type').value,
    rarity: document.getElementById('dmc-rarity').value,
    damage: document.getElementById('dmc-dmg').value.trim(),
    weight: parseFloat(document.getElementById('dmc-weight').value) || 1.5,
    stars: 5,
    img: dmCustomCardImage,
    desc: document.getElementById('dmc-desc').value.trim()
  };

  if (ownerTarget === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(newCard);
  } else if (camp.members && camp.members[ownerTarget]) {
    const mChar = camp.members[ownerTarget];
    if (!mChar.cards) mChar.cards = [];
    mChar.cards.unshift(newCard);
    if (dbState.users[ownerTarget] && dbState.users[ownerTarget].characters) {
      const idx = dbState.users[ownerTarget].characters.findIndex(c => c.id === mChar.id);
      if (idx !== -1) dbState.users[ownerTarget].characters[idx] = mChar;
    }
  }

  e.target.reset();
  dmCustomCardImage = CARD_ARTWORKS.arma;
  updateDmCardPreview();
  saveDB();
  switchDmWorkspaceTab('manage');
}

function setDmManageFilter(f) {
  dmManageFilter = f;
  ['tutti', 'arma', 'scudo', 'armatura', 'incantesimo', 'oggetto'].forEach(k => {
    const btn = document.getElementById('dmf-' + k);
    if (btn) {
      btn.className = k === f
        ? 'px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950'
        : 'px-3 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300';
    }
  });
  renderDmViews();
}

function dmReassignCard(cardId, currentOwnerKey, newOwnerKey) {
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  if (currentOwnerKey === newOwnerKey) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

  let movedCard = null;

  if (currentOwnerKey === 'CHEST') {
    const idx = (camp.chest || []).findIndex(c => c.id === cardId);
    if (idx !== -1) movedCard = camp.chest.splice(idx, 1)[0];
  } else if (camp.members && camp.members[currentOwnerKey]) {
    const mChar = camp.members[currentOwnerKey];
    const idx = (mChar.cards || []).findIndex(c => c.id === cardId);
    if (idx !== -1) {
      movedCard = mChar.cards.splice(idx, 1)[0];
      if (dbState.users[currentOwnerKey]?.characters) {
        const uIdx = dbState.users[currentOwnerKey].characters.findIndex(c => c.id === mChar.id);
        if (uIdx !== -1) dbState.users[currentOwnerKey].characters[uIdx] = mChar;
      }
    }
  }

  if (!movedCard) return;

  if (newOwnerKey === 'CHEST') {
    if (!camp.chest) camp.chest = [];
    camp.chest.push(movedCard);
  } else if (camp.members && camp.members[newOwnerKey]) {
    const targetChar = camp.members[newOwnerKey];
    if (!targetChar.cards) targetChar.cards = [];
    targetChar.cards.unshift(movedCard);
    if (dbState.users[newOwnerKey]?.characters) {
      const uIdx = dbState.users[newOwnerKey].characters.findIndex(c => c.id === targetChar.id);
      if (uIdx !== -1) dbState.users[newOwnerKey].characters[uIdx] = targetChar;
    }
  }

  saveDB();
}

function dmDeleteCardFromCampaign(cardId, ownerKey) {
  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

  if (ownerKey === 'CHEST') {
    camp.chest = (camp.chest || []).filter(c => c.id !== cardId);
  } else if (camp.members && camp.members[ownerKey]) {
    const mChar = camp.members[ownerKey];
    mChar.cards = (mChar.cards || []).filter(c => c.id !== cardId);
    if (dbState.users[ownerKey]?.characters) {
      const uIdx = dbState.users[ownerKey].characters.findIndex(c => c.id === mChar.id);
      if (uIdx !== -1) dbState.users[ownerKey].characters[uIdx] = mChar;
    }
  }
  saveDB();
}

function renderDmViews() {
  if (!currentUser) return;

  // L'Admin vede tutte le campagne del server; un utente normale vede solo quelle che ha creato come DM
  const myCamps = Object.values(dbState.campaigns || {}).filter(c => c.dmUser === currentUser || isCurrentUserAdmin());
  const listEl = document.getElementById('dm-campaigns-swipe-list');

  if (listEl) {
    listEl.innerHTML = myCamps.length === 0
      ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400">Non hai ancora creato nessuna campagna. Usa il modulo qui sopra per fondarne una!</div>`
      : myCamps.map(c => {
          const memberCount = Object.keys(c.members || {}).length;
          const isSwiped = swipedCampaignCode === c.code;
          return `
            <div class="swipe-row-container">
              <div class="swipe-delete-bg">
                <button onclick="dmDeleteCampaign(event, '${c.code}')" class="px-4 py-2 font-cinzel font-black text-xs text-white uppercase tracking-wider">
                  ELIMINA
                </button>
              </div>
              <div onclick="openDmCampaignWorkspace('${c.code}')"
                   ontouchstart="handleCampTouchStart(event, '${c.code}')"
                   ontouchend="handleCampTouchEnd(event, '${c.code}')"
                   class="swipe-front-card ${isSwiped ? 'swiped-left' : ''} norse-panel rounded-2xl p-4 flex justify-between items-center cursor-pointer border border-amber-500/30 hover:border-amber-400">
                <div>
                  <span class="text-[10px] font-cinzel uppercase text-amber-400">Codice: ${c.code} • ${memberCount} Eroi Iscritti • DM: ${c.dmUser}</span>
                  <h4 class="font-cinzel font-bold text-base text-white">${c.title}</h4>
                </div>
                <div class="flex items-center gap-2">
                  <button onclick="toggleSwipeDeleteState(event, '${c.code}')" class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] text-slate-400 hover:text-red-400">
                    Elimina
                  </button>
                  <span class="font-cinzel font-bold text-xs text-sky-300">APRI &rarr;</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
  }

  if (!activeDmWorkspaceCode || !dbState.campaigns[activeDmWorkspaceCode]) return;
  const camp = dbState.campaigns[activeDmWorkspaceCode];

  document.getElementById('dm-ws-title').textContent = camp.title;
  document.getElementById('dm-ws-code').textContent = camp.code;

  const membersEntries = Object.entries(camp.members || {});

  document.getElementById('dm-ws-players-list').innerHTML = membersEntries.length === 0
    ? `<div class="norse-panel rounded-2xl p-5 text-xs text-slate-400 col-span-2 text-center">Nessun giocatore si è ancora unito. Condividi il codice <strong>${camp.code}</strong>!</div>`
    : membersEntries.map(([uKey, mChar]) => {
        const hpPct = Math.round((mChar.hp / mChar.maxHp) * 100);
        return `
          <div class="norse-panel rounded-2xl p-4 space-y-3 border border-slate-800">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-3">
                <img src="${mChar.avatar}" class="w-12 h-12 rounded-xl object-cover border border-sky-400">
                <div>
                  <h4 class="font-cinzel font-bold text-sm text-white">${mChar.name}</h4>
                  <p class="text-[11px] text-sky-300">Liv.${mChar.level || 1} ${mChar.race} • ${mChar.className}</p>
                </div>
              </div>
              <div class="text-right">
                <span class="text-xs font-extrabold text-red-400 block">${mChar.hp}/${mChar.maxHp} PF</span>
                <span class="text-[10px] text-amber-300 font-bold">CA ${mChar.ac} • Att +${mChar.atkBonus}</span>
              </div>
            </div>

            <div class="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-gradient-to-r from-red-600 to-rose-400" style="width:${hpPct}%"></div>
            </div>

            <div class="grid grid-cols-4 gap-1.5">
              <button onclick="dmSingleAdjustHP('${uKey}', -5)" class="py-1.5 bg-red-950 text-red-300 rounded-lg text-[10px] font-bold">-5 PF</button>
              <button onclick="dmSingleAdjustHP('${uKey}', -1)" class="py-1.5 bg-red-950 text-red-300 rounded-lg text-[10px] font-bold">-1 PF</button>
              <button onclick="dmSingleAdjustHP('${uKey}', 1)" class="py-1.5 bg-emerald-950 text-emerald-300 rounded-lg text-[10px] font-bold">+1 PF</button>
              <button onclick="dmSingleAdjustHP('${uKey}', 5)" class="py-1.5 bg-emerald-950 text-emerald-300 rounded-lg text-[10px] font-bold">+5 PF</button>
            </div>
          </div>
        `;
      }).join('');

  const ownerSelect = document.getElementById('dmc-owner');
  if (ownerSelect) {
    const prev = ownerSelect.value;
    ownerSelect.innerHTML = `
      <option value="CHEST">Cassa del Dungeon (Da aprire e dividere tra i Player)</option>
      ${membersEntries.map(([uKey, mChar]) => `<option value="${uKey}">Assegna direttamente a: ${mChar.name}</option>`).join('')}
    `;
    if (prev) ownerSelect.value = prev;
  }

  let allCampaignCards = [];
  (camp.chest || []).forEach(c => {
    allCampaignCards.push({ card: c, ownerKey: 'CHEST', ownerLabel: 'Nella Cassa del Dungeon' });
  });
  membersEntries.forEach(([uKey, mChar]) => {
    (mChar.cards || []).forEach(c => {
      allCampaignCards.push({ card: c, ownerKey: uKey, ownerLabel: `Appartiene a: ${mChar.name}` });
    });
  });

  const filteredManage = dmManageFilter === 'tutti'
    ? allCampaignCards
    : allCampaignCards.filter(item => item.card.type === dmManageFilter);

  const manageGrid = document.getElementById('dm-manage-cards-grid');
  if (manageGrid) {
    manageGrid.innerHTML = filteredManage.length === 0
      ? `<div class="norse-panel rounded-2xl p-6 text-center text-xs text-slate-400 col-span-2">Nessuna carta trovata in questa categoria. Vai su "Crea Carta" a destra per forgiarne una!</div>`
      : filteredManage.map(item => `
          <div class="norse-panel rounded-2xl p-3.5 flex gap-3 items-center border border-slate-800">
            <img src="${item.card.img || CARD_ARTWORKS.arma}" class="w-16 h-20 rounded-lg object-cover border border-amber-500/50 flex-shrink-0">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex justify-between items-start">
                <h4 class="font-cinzel font-bold text-xs text-white truncate">${item.card.name}</h4>
                <button onclick="dmDeleteCardFromCampaign('${item.card.id}', '${item.ownerKey}')" class="text-[10px] text-red-400 font-bold ml-2">Elimina</button>
              </div>
              <p class="text-[10px] text-amber-300 uppercase font-bold">${item.card.type} • ${item.card.rarity} • ${item.card.damage}</p>
              <p class="text-[10px] text-sky-300 font-semibold">${item.ownerLabel}</p>
              <div class="pt-1">
                <select onchange="dmReassignCard('${item.card.id}', '${item.ownerKey}', this.value)" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-300">
                  <option value="${item.ownerKey}">Sposta / Riassegna a...</option>
                  <option value="CHEST">Sposta nella Cassa del Dungeon</option>
                  ${membersEntries.map(([uKey, mChar]) => `<option value="${uKey}">Assegna a: ${mChar.name}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>
        `).join('');
  }
}
