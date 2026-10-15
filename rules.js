// ============================================================================
// RULES ENGINE: JOURNEY TO RAGNAROK & D&D 5.5e (2024)
// REGOLA D'ORO: PRECEDENZA ASSOLUTA AL MANUALE NORRENO (JTR) SU D&D 5.5e
// ============================================================================

window.RulesEngine = {

  // Armi speciali norrene (JTR Manuale p. 80)
  NORDIC_WEAPONS: {
    scure_barbuta: {
      name: "Scure da Lancio Barbuta",
      damage: "1d6",
      damageType: "tagliente",
      properties: ["Accurata", "Leggera", "Lancio (gittata 6/18m)"],
      cost: "6 mo",
      weight: "1 kg",
      image: "assets/items/spada_ulfberht.jpg"
    },
    scure_assalto: {
      name: "Scure d'Assalto",
      damage: "1d8",
      damageType: "tagliente",
      properties: ["Accurata"],
      cost: "12 mo",
      weight: "2 kg",
      image: "assets/items/artiglio_montagna.jpg"
    }
  },

  // Oggetti Esotici proibiti alla creazione a Midgardr (JTR p. 80)
  EXOTIC_ITEMS_FORBIDDEN_AT_CREATION: [
    "Corazza a Strisce (Splint Mail)",
    "Armatura Completa (Plate Armor)",
    "Falcione (Glaive)",
    "Alabarda (Halberd)",
    "Balestra a Mano",
    "Balestra Pesante",
    "Balestra Leggera",
    "Stocco (Rapier)",
    "Scimitarra",
    "Libro Rilegato Straniero",
    "Clessidra",
    "Pennino d'Inchiostro",
    "Lanterna Occhio di Bue",
    "Cannocchiale (Spyglass)",
    "Libro degli Incantesimi Cartaceo"
  ],

  // Reliquie e cimeli dei clan (JTR p. 81-83)
  CLAN_HEIRLOOMS: {
    bear_warriors: {
      name: "Artiglio della Montagna",
      type: "arma",
      category: "Maglio a due mani",
      damage: "2d6",
      damageType: "contundente",
      properties: ["Pesante", "Due Mani"],
      desc: "Maglio ricavato dal cuore di pietra della Montagna sacra. Vantaggio alle prove di Forza (Atletica) per sfondare oggetti. Sui colpi critici contro bersagli con scudo, puoi scegliere di distruggere lo scudo.",
      image: "assets/items/artiglio_montagna.jpg"
    },
    gjallarhorn: {
      name: "Corno Fragoroso",
      type: "oggetto",
      category: "Strumento di Battaglia",
      desc: "Corno ricavato dai bovini reali del Danevirke. Conferisce Vantaggio a tutte le prove di Carisma (Persuasione) per incoraggiare o comandare le truppe in battaglia.",
      image: "assets/items/corno_fragoroso.jpg"
    },
    icy_crows: {
      name: "Ramo Runico di Yggdrasill",
      type: "arma",
      category: "Bastone da guerra / Focus",
      damage: "1d6/1d8",
      damageType: "contundente",
      properties: ["Versatile"],
      desc: "Ramo di frassino sacro con quarzo bianco incastonato. Funziona come bastone ferrato e focus magico. Conferisce Vantaggio alle prove di Saggezza (Asatru).",
      image: "assets/items/ramo_runico.jpg"
    },
    jotunn_sons: {
      name: "Dente di Strega",
      type: "arma",
      category: "Pugnale in Corno di Renna",
      damage: "1d4",
      damageType: "perforante",
      properties: ["Accurata", "Leggera", "Lancio (gittata 6/18m)"],
      desc: "Lama in lega speciale con sonaglio di osso. Produce scintille per accendere fuochi in climi estremi e tiene lontani gli spiriti oscuri. Vantaggio alle prove di Saggezza (Sopravvivenza).",
      image: "assets/items/dente_strega.jpg"
    },
    odhinns_eye: {
      name: "Spada Ulfberht",
      type: "arma",
      category: "Spada Lunga dei Maestri Forgiatori",
      damage: "1d8/1d10",
      damageType: "tagliente",
      properties: ["Versatile"],
      desc: "Acciaio perfetto forgiato con segreti runici. Vantaggio alle prove di Carisma (Intimidire) contro qualsiasi guerriero dei Nove Mondi.",
      image: "assets/items/spada_ulfberht.jpg"
    },
    wolves_shadow: {
      name: "Ombra di Fronde",
      type: "scudo",
      category: "Scudo in Legno Sempreverde",
      acBonus: 2,
      desc: "Scudo leggero in legno rinforzato con intrecci mimetici di aghifoglie. Fornisce +2 alla CA e Vantaggio alle prove di Destrezza (Furtività) tra vegetazione o boschi.",
      image: "assets/items/scudo_ombra_fronde.jpg"
    }
  },

  // Calcolo dell'equipaggiamento e oro iniziale coerente con JTR e D&D 2024
  calculateStartingEquipment: function(classId, backgroundId, clanId) {
    const items = [];
    let gold = 15; // default oro

    // 1. ORO E OGGETTI DA BACKGROUND NORRENO (JTR Manuale p. 64-78 - PRIORITARIO!)
    const bgGear = {
      vikingr: {
        gold: 20,
        items: [
          { name: "Abito Sfarzoso da Razziatore", qty: 1, type: "oggetto", weight: "1.5 kg" },
          { name: "Pietra Solare Runica (Strumenti da Navigatore)", qty: 1, type: "oggetto", desc: "Pietra di calcite ottica per orientarsi con la luce solare anche nella nebbia marina." },
          { name: "Cannula per Tatuaggi Tradizionali", qty: 1, type: "oggetto" },
          { name: "Borsa di Cuoio Norrena", qty: 1, type: "oggetto" }
        ],
        weapons: ["Scure d'Assalto (1d8 tagliente, Accurata)"]
      },
      huscarl: {
        gold: 20,
        items: [
          { name: "Divisa d'Onore dell'Huscarl con Mantello Pesante", qty: 1, type: "armatura", weight: "2 kg" },
          { name: "Elmo di Ferro Inciso con Rune di Protezione", qty: 1, type: "armatura" },
          { name: "Borsa di Cuoio", qty: 1, type: "oggetto" }
        ],
        weapons: ["Spada Lunga Ulfberht (1d8/1d10)"]
      },
      gothi: {
        gold: 15,
        items: [
          { name: "Abito Cerimoniale del Sacerdote Asatru", qty: 1, type: "oggetto" },
          { name: "Borsa con Strumenti da Erborista", qty: 1, type: "oggetto" },
          { name: "Talismano in Pietra Levigata con Runa Consacrata", qty: 1, type: "oggetto", desc: "Focus sacro per i riti del Blót e le divinazioni." },
          { name: "5 Pezzi di Corteccia Aromatica Sacra", qty: 5, type: "oggetto" }
        ],
        weapons: ["Bastone Sacro con Rune Incise"]
      },
      jarlr: {
        gold: 25,
        items: [
          { name: "Abiti Pregiati e Mantello Foderato di Pelliccia", qty: 1, type: "oggetto" },
          { name: "Anello d'Oro Massiccio Sigillato con Runa di Comando", qty: 1, type: "oggetto" },
          { name: "Spilla di Famiglia in Argento dei Nove Mondi", qty: 1, type: "oggetto" },
          { name: "Borsa di Cuoio Nobile", qty: 1, type: "oggetto" }
        ],
        weapons: ["Spada da Guerra dello Jarl"]
      },
      bondhi: {
        gold: 15,
        items: [
          { name: "Abiti Comuni da Uomo Libero", qty: 1, type: "oggetto" },
          { name: "Strumenti da Artigiano a Scelta", qty: 1, type: "oggetto" },
          { name: "Bracciale del Giuramento con Runa del Focolare", qty: 1, type: "oggetto" },
          { name: "Otre in Terracotta", qty: 1, type: "oggetto" }
        ],
        weapons: ["Scure da Lancio Barbuta"]
      },
      skogarmadhr: {
        gold: 5,
        items: [
          { name: "Abiti Strappati Mimetici", qty: 1, type: "oggetto" },
          { name: "Bracciale del Giuramento Spezzato", qty: 1, type: "oggetto" },
          { name: "Pugnale di Selce e Pietra Focaia", qty: 1, type: "arma" }
        ],
        weapons: ["Arco Corto con 20 Frecce"]
      },
      vaeringhi: {
        gold: 15,
        items: [
          { name: "Abiti da Viaggio e Mantello Impermeabile", qty: 1, type: "oggetto" },
          { name: "Bilancia Tascabile Rudimentale", qty: 1, type: "oggetto" },
          { name: "Peso Metallico da Scambio con Runa", qty: 1, type: "oggetto" },
          { name: "Piccolo Gioiello di Origine Straniera", qty: 1, type: "oggetto" }
        ],
        weapons: ["Spada Lunga o Lancia da Mercenario"]
      },
      thallr: {
        gold: 5,
        items: [
          { name: "Abiti Poveri da Lavoro", qty: 1, type: "oggetto" },
          { name: "Catene Spezzate della Schiavitù", qty: 1, type: "oggetto" },
          { name: "Pezzo di Legno con Runa di Libertà", qty: 1, type: "oggetto" },
          { name: "Ciotola in Legno Intagliata", qty: 1, type: "oggetto" }
        ],
        weapons: ["Mazza di Legno Rinforzato o Pugnale"]
      }
    };

    const bgData = bgGear[backgroundId] || bgGear.bondhi;
    gold = bgData.gold;
    bgData.items.forEach(it => items.push(it));
    if (bgData.weapons) {
      bgData.weapons.forEach(w => items.push({ name: w, qty: 1, type: "arma" }));
    }

    // 2. EQUIPAGGIAMENTO DI CLASSE (RISPETTANDO LE REGOLE JTR SUI LIMITI ESOTICI)
    const classGear = {
      barbaro: [
        { name: "Scure d'Assalto Norrena", qty: 1, type: "arma", desc: "1d8 tagliente, Accurata (JTR)" },
        { name: "Scure da Lancio Barbuta", qty: 2, type: "arma", desc: "1d6 tagliente, Accurata, Leggera, Lancio (6/18m)" },
        { name: "Giavellotto da Battaglia", qty: 4, type: "arma", desc: "1d6 perforante, Lancio (9/36m)" },
        { name: "Zaino dell'Esploratore delle Terre Selvagge", qty: 1, type: "oggetto", desc: "Sacco a pelo in pelliccia, torce, razioni x10, corda di canapa 15m." }
      ],
      maestro_rune: [
        { name: "Ramo Runico Intagliato (Focus Futhark)", qty: 1, type: "arma", desc: "1d6 contundente, focus sacro e arcano per tracciare le Rune del Destino." },
        { name: "Corazza di Cuoio Bollito con Trame Runiche", qty: 1, type: "armatura", desc: "CA 11 + Mod DES" },
        { name: "Scure da Lancio Barbuta", qty: 1, type: "arma" },
        { name: "Set di Strumenti per Incisione Runica (Rune Crafting Set)", qty: 1, type: "oggetto", desc: "Scalpelli in osso e ferro, inchiostro di sangue vegetale e 24 ciottoli Futhark." },
        { name: "Zaino da Studioso dei Misteri", qty: 1, type: "oggetto" }
      ],
      guerriero: [
        { name: "Cotta di Maglia ad Anelli Norrena", qty: 1, type: "armatura", desc: "CA 16, svantaggio Furtività" },
        { name: "Spada Lunga Ulfberht", qty: 1, type: "arma", desc: "1d8/1d10 tagliente, Versatile" },
        { name: "Scudo Rotondo di Quercia con Umbone in Ferro", qty: 1, type: "scudo", desc: "+2 CA" },
        { name: "Scure da Lancio Barbuta", qty: 2, type: "arma" },
        { name: "Zaino dell'Avventuriero", qty: 1, type: "oggetto" }
      ],
      bardo: [
        { name: "Corno da Battaglia dello Skaldo", qty: 1, type: "oggetto", desc: "Strumento musicale e simbolo di ispirazione per gli eroi." },
        { name: "Armatura di Cuoio", qty: 1, type: "armatura", desc: "CA 11 + Mod DES" },
        { name: "Scure d'Assalto o Spada Corta", qty: 1, type: "arma" },
        { name: "Pugnale in Osso", qty: 1, type: "arma" },
        { name: "Zaino dell'Intrattenitore", qty: 1, type: "oggetto" }
      ],
      chierico: [
        { name: "Martello da Guerra o Maglio Sacro", qty: 1, type: "arma", desc: "1d8/1d10 contundente" },
        { name: "Corazza a Scaglie Norrena", qty: 1, type: "armatura", desc: "CA 14 + Mod DES (max 2)" },
        { name: "Scudo con Inciso il Simbolo della Divinità Asatru", qty: 1, type: "scudo", desc: "+2 CA" },
        { name: "Talismano Sacro del Blót (Focus Divino)", qty: 1, type: "oggetto" },
        { name: "Zaino del Sacerdote", qty: 1, type: "oggetto" }
      ],
      druido: [
        { name: "Scudo in Legno con Intagli di Yggdrasill", qty: 1, type: "scudo", desc: "+2 CA" },
        { name: "Falcetto da Erborista o Bastone Runico", qty: 1, type: "arma" },
        { name: "Armatura di Cuoio", qty: 1, type: "armatura", desc: "CA 11 + Mod DES" },
        { name: "Focus Druidico di Vischio e Corno", qty: 1, type: "oggetto" },
        { name: "Zaino dell'Erborista", qty: 1, type: "oggetto" }
      ],
      monaco: [
        { name: "Bastone da Guerra Ferrato", qty: 1, type: "arma", desc: "1d6/1d8 contundente" },
        { name: "Dardi in Ferro", qty: 10, type: "arma", desc: "1d4 perforante, Lancio (6/18m)" },
        { name: "Fasce di Cuoio per Lotta Glima", qty: 1, type: "oggetto" },
        { name: "Zaino dell'Esploratore", qty: 1, type: "oggetto" }
      ],
      paladino: [
        { name: "Spada Lunga da Battaglia", qty: 1, type: "arma" },
        { name: "Scudo con Emblema degli Æsir", qty: 1, type: "scudo", desc: "+2 CA" },
        { name: "5 Giavellotti", qty: 5, type: "arma" },
        { name: "Cotta di Maglia", qty: 1, type: "armatura", desc: "CA 16" },
        { name: "Simbolo Sacro dei Prescelti", qty: 1, type: "oggetto" },
        { name: "Zaino del Sacerdote Guerriero", qty: 1, type: "oggetto" }
      ],
      ranger: [
        { name: "Armatura di Cuoio Rinforzato", qty: 1, type: "armatura", desc: "CA 12 + Mod DES" },
        { name: "2 Scuri Barbute (Combattimento a Due Armi)", qty: 2, type: "arma" },
        { name: "Arco Lungo con Faretra e 20 Frecce", qty: 1, type: "arma", desc: "1d8 perforante, gittata 45/180m" },
        { name: "Zaino dell'Esploratore delle Nevi", qty: 1, type: "oggetto" }
      ],
      ladro: [
        { name: "Armatura di Cuoio", qty: 1, type: "armatura", desc: "CA 11 + Mod DES" },
        { name: "Scure d'Assalto (Accurata)", qty: 1, type: "arma", desc: "1d8 tagliente, Accurata" },
        { name: "2 Pugnali di Corno di Renna", qty: 2, type: "arma" },
        { name: "Arnesi da Scasso e Disattivazione Trappole", qty: 1, type: "oggetto" },
        { name: "Zaino del Razziatore Silenzioso", qty: 1, type: "oggetto" }
      ],
      stregone: [
        { name: "Scure da Lancio Barbuta o 2 Pugnali", qty: 2, type: "arma" },
        { name: "Focus Arcano Primordiale (Frammento di Ghiaccio o Brace Eterna)", qty: 1, type: "oggetto" },
        { name: "Borsa per Componenti", qty: 1, type: "oggetto" },
        { name: "Zaino dell'Esploratore", qty: 1, type: "oggetto" }
      ],
      warlock: [
        { name: "Scure d'Assalto o Spada Semplice", qty: 1, type: "arma" },
        { name: "2 Pugnali Sacrificali", qty: 2, type: "arma" },
        { name: "Armatura di Cuoio", qty: 1, type: "armatura", desc: "CA 11 + Mod DES" },
        { name: "Focus Arcano (Fili delle Norne o Artiglio di Lupo)", qty: 1, type: "oggetto" },
        { name: "Borsa di Componenti Mistiche", qty: 1, type: "oggetto" }
      ],
      mago: [
        { name: "Bastone da Viandante (Odhinn)", qty: 1, type: "arma" },
        { name: "2 Pugnali di Selce", qty: 2, type: "arma" },
        { name: "Borsa di Componenti", qty: 1, type: "oggetto" },
        { name: "Rotoli di Cuoio e Feticci Magici (Grimorio Norreno JTR p. 62)", qty: 1, type: "oggetto", desc: "Invece di libri stampati, a Midgardr i maghi disegnano e intagliano fetischi per ogni incantesimo conosciuto." },
        { name: "Zaino dello Studioso", qty: 1, type: "oggetto" }
      ]
    };

    const cGear = classGear[classId] || classGear.guerriero;
    cGear.forEach(it => items.push(it));

    // 3. CIMELIO DEL CLAN ASSEGNATO AUTOMATICAMENTE (JTR p. 81)
    if (clanId && this.CLAN_HEIRLOOMS[clanId]) {
      const heirloom = this.CLAN_HEIRLOOMS[clanId];
      items.push({
        name: `[Cimelio del Clan] ${heirloom.name}`,
        qty: 1,
        type: heirloom.type,
        category: heirloom.category,
        desc: heirloom.desc,
        image: heirloom.image,
        isHeirloom: true
      });
    }

    return {
      gold: gold,
      items: items
    };
  },

  // Magie e Trucchetti assegnati automaticamente al 1° Livello
  getStartingSpells: function(classId) {
    const list = {
      chierico: {
        cantrips: ["Guida", "Fiamma Sacra", "Taumaturgia"],
        spells: ["Cura Ferite", "Benedizione", "Dardo Tracciante", "Scudo della Fede"]
      },
      druido: {
        cantrips: ["Druidismo", "Produrre Fiamma"],
        spells: ["Cura Ferite", "Parlare con Animali", "Intralciare"]
      },
      maestro_rune: {
        cantrips: ["Luce Runica (Light)", "Guida del Destino (Guidance)", "Runa del Freddo (Ray of Frost)"],
        spells: ["Scudo della Runa (Shield)", "Incisione Protettiva (Sanctuary)", "Lettura degli Auspici (Detect Magic)"],
        runes: ["Futhark: Fehu (Ricchezza)", "Futhark: Uruz (Forza)", "Futhark: Thurisaz (Difesa)"]
      },
      bardo: {
        cantrips: ["Beffa Crudele (Vicious Mockery)", "Luce"],
        spells: ["Parola Guaritrice", "Onda Tonante", "Fascino su Persone", "Sonno"]
      },
      mago: {
        cantrips: ["Dardo di Fuoco", "Mano Magica", "Raggio di Gelo"],
        spells: ["Dardo Incantato", "Armatura Magica", "Scudo", "Onda Tonante", "Sonno", "Individuazione del Magico"]
      },
      stregone: {
        cantrips: ["Dardo di Fuoco", "Raggio di Gelo", "Spruzzo Velenoso", "Luce"],
        spells: ["Mani Brucianti", "Scudo"]
      },
      warlock: {
        cantrips: ["Deflagrazione Occulta (Eldritch Blast)", "Tocco Gelido"],
        spells: ["Anatema (Hex)", "Braccia di Hadar"]
      }
    };
    return list[classId] || null;
  },

  // Generatore scelte per passaggio di livello
  getLevelUpChoices: function(char, targetLevel) {
    const cls = (window.JTR_CLASSES || []).find(c => c.id === char.classId) || {};
    const choices = [];

    // 1. Sottoclasse / Archetipo
    if (targetLevel === (cls.archetypeLevel || 3) && (!char.archetype || char.archetype === "Nessuno")) {
      choices.push({
        id: "archetype",
        title: `Scelta: ${cls.archetypeTitle || "Archetipo di Classe"}`,
        desc: `Al livello ${targetLevel} devi scegliere la tua specializzazione definitiva tra i cammini del destino norreno.`,
        required: true,
        options: (cls.archetypes || []).map(a => ({
          name: a,
          desc: `Cammino ufficiale conforme a Journey to Ragnarok e 5.5e.`
        }))
      });
    }

    // 2. Aumento Caratteristiche (ASI) o Talento (Livelli 4, 8, 12, 16, 19)
    if ([4, 8, 12, 16, 19].includes(targetLevel)) {
      choices.push({
        id: "asi_or_feat",
        title: "Aumento Punteggi di Caratteristica o Talento",
        desc: "Scegli se potenziare le tue caratteristiche divine (+2 a una caratteristica o +1 a due) oppure abbracciare un Talento epico.",
        required: true,
        options: [
          { name: "Aumento Statistiche (+2 a una caratteristica)", type: "asi", statBonus: 2 },
          { name: "Aumento Statistiche (+1 a due caratteristiche)", type: "asi_split", statBonus: 1 },
          { name: "Talento: Furia del Guerriero dell'Orso", desc: "+1 a FOR o COS; quando riduci un nemico a 0 PF, puoi compiere un attacco extra come azione bonus." },
          { name: "Talento: Maestro delle Rune del Futhark", desc: "+1 a SAG o INT; impari 2 nuove Rune e puoi lanciare un incantesimo di 1° cerchio senza spendere slot 1 volta al giorno." },
          { name: "Talento: Muro di Scudi (Skjaldborg)", desc: "+1 a FOR; quando un alleato adiacente a te viene attaccato, puoi usare la reazione per imporre svantaggio all'attacco." },
          { name: "Talento: Robusto (Tough)", desc: "+2 Punti Ferita massimi per ogni livello posseduto." },
          { name: "Talento: Allerta dei Guardiani dell'Alba", desc: "+5 all'Iniziativa; non puoi essere sorpreso mentre sei cosciente." }
        ]
      });
    }

    // 3. Stile di Combattimento (Guerriero/Paladino/Ranger a liv 1 o 2)
    if (["guerriero", "paladino", "ranger"].includes(char.classId) && targetLevel === (char.classId === "guerriero" ? 1 : 2) && !char.fightingStyle) {
      choices.push({
        id: "fighting_style",
        title: "Stile di Combattimento Norreno",
        desc: "Scegli come forgiare la tua maestria nelle armi di Midgardr.",
        required: true,
        options: [
          { name: "Combattere con Due Armi (Asce Gemelle)", desc: "Aggiungi il tuo modificatore di caratteristica ai danni del secondo attacco." },
          { name: "Difesa (Armatura ad Anelli)", desc: "+1 alla Classe Armatura mentre indossi un'armatura." },
          { name: "Duellare (Spada Ulfberht e Scudo)", desc: "+2 ai tiri per i danni quando impugni un'arma da mischia in una mano e nessun'altra arma." },
          { name: "Protezione (Egida dello Scudo)", desc: "Imponi svantaggio all'attacco nemico contro un alleato entro 1.5m usando la reazione." },
          { name: "Tiro con l'Arco", desc: "+2 ai tiri per colpire con armi a distanza." }
        ]
      });
    }

    // 4. Apprendimento Incantesimi / Rune (A SCELTA MULTIPLA DALLA MEGA LISTA FISSA)
    const fullCasters = ["mago", "chierico", "druido", "bardo", "stregone", "warlock", "maestro_rune"];
    const halfCasters = ["paladino", "ranger"];
    const isFull = fullCasters.includes(char.classId);
    const isHalf = halfCasters.includes(char.classId);

    if (isFull || (isHalf && targetLevel >= 2)) {
      const maxCircle = isFull
        ? (targetLevel >= 9 ? 5 : targetLevel >= 7 ? 4 : targetLevel >= 5 ? 3 : targetLevel >= 3 ? 2 : 1)
        : (targetLevel >= 9 ? 3 : targetLevel >= 5 ? 2 : 1);

      const allCards = typeof window.getAllCards === "function" ? window.getAllCards() : (window.GLOBAL_CARDS_DATABASE || []);
      const knownNames = (char.cards || []).map(c => (c.name || "").toLowerCase());

      const availableSpells = allCards.filter(c => {
        if (c.type !== "incantesimo") return false;
        if (c.level > maxCircle) return false;
        if (char.classId === "maestro_rune") {
          return (c.classes && c.classes.includes("maestro_rune")) || (c.name || "").toLowerCase().includes("runa");
        }
        if (c.classes && c.classes.includes(char.classId)) return true;
        return false;
      }).filter(c => !knownNames.includes((c.name || "").toLowerCase()));

      if (availableSpells.length > 0) {
        choices.push({
          id: "spell_choice",
          title: `Apprendimento Magico • Fino al ${maxCircle}° Cerchio`,
          desc: "Seleziona dalla mega lista fissa l'incantesimo o la runa da forgiare nel tuo repertorio sacro.",
          isCardPicker: true,
          required: true,
          options: availableSpells.map(s => ({
            name: s.name,
            card: s,
            desc: `[${s.level === 0 ? "Trucchetto" : s.level + "° Cerchio"}] Danno/Effetto: ${s.damage || "Speciale"} • Gittata: ${s.range || "18m"} • ${s.desc ? s.desc.substring(0, 95) + "..." : ""}`
          }))
        });
      }
    }

    return choices;
  }
};
