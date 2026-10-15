// ============================================================================
// FORGE ENGINE: ANIMAZIONE DI FORGIATURA & SISTEMA DI LEVEL-UP INTERATTIVO
// ============================================================================

window.ForgeEngine = {

  // Sintesi audio dell'incudine norrena con Web Audio API (zero file esterni, zero 404)
  playAnvilStrike: function() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      // 1. Impatto sordo e pesante dell'acciaio
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(140, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.35);
      gain1.gain.setValueAtTime(1.0, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.4);

      // 2. Rintocco squillante metallico dell'incudine (chime ad alta frequenza)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(2600, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1150, ctx.currentTime + 1.8);
      gain2.gain.setValueAtTime(0.7, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 2.0);

      // 3. Risonanza armonica delle rune
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.setValueAtTime(880, ctx.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 2.5);
      gain3.gain.setValueAtTime(0.4, ctx.currentTime + 0.05);
      gain3.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(ctx.currentTime + 0.05);
      osc3.stop(ctx.currentTime + 2.8);

      // 4. Fruscio del metallo incandescente immerso nell'acqua di sorgente (quench fizz)
      const bufferSize = ctx.sampleRate * 0.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 3500;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime + 0.2);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime + 0.2);
    } catch (e) {
      console.log("Audio synthesis notice:", e);
    }
  },

  // Generatore di particelle scintille di forgiatura
  initSparks: function(canvas) {
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const particles = [];
    const colors = ["#ffbe0b", "#fb5607", "#ff006e", "#f3c663", "#ffffff", "#c9a050"];

    for (let i = 0; i < 90; i++) {
      const angle = (Math.random() * Math.PI) - (Math.PI / 2); // verso l'alto
      const speed = Math.random() * 9 + 4;
      particles.push({
        x: canvas.width / 2 + (Math.random() * 40 - 20),
        y: canvas.height * 0.48,
        vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
        vy: -Math.abs(Math.sin(angle) * speed),
        size: Math.random() * 4 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1.0,
        decay: Math.random() * 0.02 + 0.012,
        gravity: 0.18
      });
    }

    let animId;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.life -= p.decay;

          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1.0;
      if (alive) {
        animId = requestAnimationFrame(render);
      }
    }
    render();

    return {
      stop: () => cancelAnimationFrame(animId)
    };
  },

  // Avvio schermata e flusso Level Up
  openForgeModal: function(character, onCompleteCallback) {
    const currentLvl = character.level || 1;
    if (currentLvl >= 20) {
      alert("Hai già raggiunto il 20° Livello: sei ormai una leggenda immortale tra gli Dei!");
      return;
    }

    const nextLvl = currentLvl + 1;
    const cls = (window.JTR_CLASSES || []).find(c => c.id === character.classId) || {};
    
    // Calcolo Punti Ferita aggiuntivi
    const hitDieStr = cls.hitDie || "1d10";
    const dieMax = parseInt(hitDieStr.replace("1d", "")) || 10;
    const avgHp = Math.floor(dieMax / 2) + 1;
    const conMod = Math.floor(((character.stats?.COS || 10) - 10) / 2);
    const hpGain = Math.max(1, avgHp + conMod);

    // Controllo scelte obbligatorie al livello
    const choices = window.RulesEngine.getLevelUpChoices(character, nextLvl);
    let currentChoiceIndex = 0;
    const selectedChoices = {};

    // Creazione del DOM del modale
    let modal = document.getElementById("forge-level-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "forge-level-modal";
      modal.className = "forge-modal-overlay";
      document.body.appendChild(modal);
    }

    const renderStage = () => {
      // Audio e scintille al passaggio
      this.playAnvilStrike();

      // Se ci sono scelte pendenti
      if (choices.length > 0 && currentChoiceIndex < choices.length) {
        const choice = choices[currentChoiceIndex];
        modal.innerHTML = `
          <div class="forge-modal-container choice-stage">
            <canvas id="forge-sparks-canvas"></canvas>
            
            <div class="forge-header">
              <div class="forge-rune-icon pulsing">ᚠ</div>
              <h2 class="runic-title">Scelta del Destino • Livello ${nextLvl}</h2>
              <div class="forge-subtitle">${choice.title}</div>
              <p class="forge-desc">${choice.desc}</p>
            </div>

            <div class="forge-choices-list">
              ${choice.options.map((opt, i) => `
                <div class="forge-choice-card ${selectedChoices[choice.id] === opt.name ? 'selected' : ''} ${choice.isCardPicker ? 'spell-picker-card' : ''}" onclick="window.ForgeEngine.selectOption('${choice.id}', '${opt.name.replace(/'/g, "\\'")}', ${i})">
                  <div class="choice-card-header">
                    <span class="choice-radio"></span>
                    <strong>${opt.name}</strong>
                  </div>
                  ${opt.card ? `
                    <div class="choice-spell-meta flex items-center gap-2 my-1.5 p-1 rounded bg-black/40 border border-slate-700/60 text-[11px] text-amber-300">
                      <img src="${opt.card.img || 'assets/items/ramo_runico.jpg'}" class="w-8 h-8 rounded object-cover border border-amber-500/40 flex-shrink-0">
                      <div class="flex-1 min-w-0">
                        <span class="font-bold text-sky-300 block text-[10px] uppercase">${opt.card.level === 0 ? 'Trucchetto' : opt.card.level + '° Cerchio'} • ${opt.card.type}</span>
                        <span class="text-amber-200 text-[10px] block font-mono">Danno/Effetto: ${opt.card.damage || 'Speciale'}</span>
                      </div>
                    </div>
                  ` : ''}
                  <div class="choice-card-desc">${opt.desc || ''}</div>
                </div>
              `).join('')}
            </div>

            <div class="forge-actions">
              <button class="btn btn-gold btn-large" id="btn-confirm-choice" disabled onclick="window.ForgeEngine.nextChoiceStage()">
                Prosegui nella Forgiatura ➔
              </button>
            </div>
          </div>
        `;
        setTimeout(() => {
          const cv = document.getElementById("forge-sparks-canvas");
          this.initSparks(cv);
        }, 50);
        return;
      }

      // Schermata finale di Recap con Animazione dell'Incudine
      const unlockedFeatures = (cls.levelFeatures && cls.levelFeatures[nextLvl]) || ["Aumento potenza divina dei Nove Mondi"];
      const newProf = nextLvl >= 17 ? 6 : nextLvl >= 13 ? 5 : nextLvl >= 9 ? 4 : nextLvl >= 5 ? 3 : 2;

      modal.innerHTML = `
        <div class="forge-modal-container recap-stage">
          <canvas id="forge-sparks-canvas"></canvas>
          
          <div class="forge-animation-scene">
            <div class="anvil-wrapper">
              <div class="anvil-body"></div>
              <div class="glowing-ingot">
                <span class="ingot-rune">ᛟ</span>
              </div>
              <div class="hammer-strike-effect"></div>
            </div>
          </div>

          <div class="forge-header">
            <span class="forge-badge">VIAGGIO VERSO IL RAGNAROK</span>
            <h1 class="runic-title forge-glowing-text">SEI SALITO DI LIVELLO!</h1>
            <div class="forge-level-counter">LIVELLO ${nextLvl}</div>
            <p class="forge-hero-name">${character.name} • ${cls.name || character.className}</p>
          </div>

          <div class="forge-recap-grid">
            <div class="recap-card">
              <div class="recap-icon">❤️</div>
              <div class="recap-info">
                <span class="recap-label">Punti Ferita Massimi</span>
                <span class="recap-val">+${hpGain} PF <small>(${character.maxHp} ➔ ${character.maxHp + hpGain})</small></span>
              </div>
            </div>

            <div class="recap-card">
              <div class="recap-icon">🎲</div>
              <div class="recap-info">
                <span class="recap-label">Nuovo Dado Vita</span>
                <span class="recap-val">+1${hitDieStr} <small>Totale: ${nextLvl}${hitDieStr}</small></span>
              </div>
            </div>

            <div class="recap-card">
              <div class="recap-icon">⚡</div>
              <div class="recap-info">
                <span class="recap-label">Bonus Competenza</span>
                <span class="recap-val">+${newProf}</span>
              </div>
            </div>

            ${Object.keys(selectedChoices).length > 0 ? `
              <div class="recap-card full-width choices-recap">
                <div class="recap-icon">✨</div>
                <div class="recap-info">
                  <span class="recap-label">Scelte Consacrate</span>
                  ${Object.entries(selectedChoices).map(([k, v]) => `<span class="recap-val highlight">${v}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            <div class="recap-card full-width">
              <div class="recap-icon">📜</div>
              <div class="recap-info">
                <span class="recap-label">Privilegi di Classe Sbloccati</span>
                <ul class="recap-features-list">
                  ${unlockedFeatures.map(f => `<li><strong>${f}</strong></li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <div class="forge-actions">
            <button class="btn btn-gold btn-large pulse-glow" onclick="window.ForgeEngine.completeForge()">
              🔥 CONSACRA NEL DESTINO (COMPLETA LEVEL UP)
            </button>
          </div>
        </div>
      `;

      setTimeout(() => {
        const cv = document.getElementById("forge-sparks-canvas");
        this.initSparks(cv);
      }, 50);
    };

    // Callback per selezione opzione
    window.ForgeEngine.selectOption = function(choiceId, optName, idx) {
      selectedChoices[choiceId] = optName;
      document.querySelectorAll(".forge-choice-card").forEach((card, i) => {
        card.classList.toggle("selected", i === idx);
      });
      const btn = document.getElementById("btn-confirm-choice");
      if (btn) btn.disabled = false;
    };

    window.ForgeEngine.nextChoiceStage = function() {
      currentChoiceIndex++;
      renderStage();
    };

    window.ForgeEngine.completeForge = function() {
      // Applica aumenti al personaggio
      character.level = nextLvl;
      character.maxHp = (character.maxHp || 10) + hpGain;
      character.hp = character.maxHp; // Cura completa o incrementa
      
      // Salva scelte nel personaggio
      if (!character.unlockedFeatures) character.unlockedFeatures = [];
      const unlocked = (cls.levelFeatures && cls.levelFeatures[nextLvl]) || [];
      unlocked.forEach(u => {
        if (!character.unlockedFeatures.includes(u)) character.unlockedFeatures.push(u);
      });

      if (selectedChoices.archetype) {
        character.archetype = selectedChoices.archetype;
      }
      if (selectedChoices.fighting_style) {
        character.fightingStyle = selectedChoices.fighting_style;
      }
      if (selectedChoices.asi_or_feat) {
        if (!character.feats) character.feats = [];
        character.feats.push(selectedChoices.asi_or_feat);
      }
      if (selectedChoices.spell_choice) {
        const chosenName = selectedChoices.spell_choice;
        const allCards = typeof window.getAllCards === "function" ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
        const cardObj = allCards.find(c => c.name === chosenName);
        if (cardObj) {
          if (!character.cards) character.cards = [];
          const newCard = { ...cardObj, id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) };
          character.cards.unshift(newCard);
        }
      }

      // Chiudi modale
      modal.classList.remove("active");
      setTimeout(() => {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }, 300);

      // Notifica e rinfresca scheda
      if (typeof onCompleteCallback === "function") {
        onCompleteCallback(character);
      }
    };

    modal.classList.add("active");
    renderStage();
  }
};
