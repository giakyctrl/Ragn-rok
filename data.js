// ============================================================================
// 1. CONFIGURAZIONE CLOUD, CREDENZIALI ADMIN & SEZIONI SCHEDA
// ============================================================================
window.FIREBASE_DATABASE_URL = "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";

window.ADMIN_CREDENTIALS = {
  username: "admin",
  password: "ragnarok2026"
};

window.PRESET_AVATARS = [
  "assets/heroes/face_barbaro.jpg",
  "assets/heroes/face_guerriero.jpg",
  "assets/heroes/face_maestro_rune.jpg",
  "assets/heroes/face_chierico.jpg",
  "assets/heroes/face_bardo.jpg",
  "assets/heroes/face_monaco.jpg",
  "assets/heroes/face_paladino.jpg",
  "assets/heroes/face_ranger.jpg",
  "assets/heroes/face_ladro.jpg",
  "assets/heroes/face_stregone.jpg",
  "assets/heroes/face_warlock.jpg",
  "assets/heroes/face_mago.jpg"
];

window.CLASS_FACE_AVATARS = {
  barbaro: "assets/heroes/face_barbaro.jpg",
  guerriero: "assets/heroes/face_guerriero.jpg",
  maestro_rune: "assets/heroes/face_maestro_rune.jpg",
  chierico: "assets/heroes/face_chierico.jpg",
  bardo: "assets/heroes/face_bardo.jpg",
  monaco: "assets/heroes/face_monaco.jpg",
  paladino: "assets/heroes/face_paladino.jpg",
  ranger: "assets/heroes/face_ranger.jpg",
  ladro: "assets/heroes/face_ladro.jpg",
  stregone: "assets/heroes/face_stregone.jpg",
  warlock: "assets/heroes/face_warlock.jpg",
  mago: "assets/heroes/face_mago.jpg"
};

window.CLASS_FULL_ARTWORKS = {
  barbaro: "assets/heroes/full_barbaro.jpg",
  guerriero: "assets/heroes/full_guerriero.jpg",
  maestro_rune: "assets/heroes/full_maestro_rune.jpg",
  chierico: "assets/heroes/full_chierico.jpg",
  bardo: "assets/heroes/full_bardo.jpg",
  monaco: "assets/heroes/full_monaco.jpg",
  paladino: "assets/heroes/full_paladino.jpg",
  ranger: "assets/heroes/full_ranger.jpg",
  ladro: "assets/heroes/full_ladro.jpg",
  stregone: "assets/heroes/full_stregone.jpg",
  warlock: "assets/heroes/full_warlock.jpg",
  mago: "assets/heroes/full_mago.jpg"
};

window.CARD_ARTWORKS = {
  arma: "assets/items/spada_ulfberht.jpg",
  scudo: "assets/items/scudo_ombra_fronde.jpg",
  armatura: "assets/items/megingjord.jpg",
  incantesimo: "assets/items/ramo_runico.jpg",
  oggetto: "assets/items/dente_strega.jpg",
  maglio: "assets/items/artiglio_montagna.jpg",
  corno: "assets/items/corno_fragoroso.jpg",
  lancia: "assets/items/gungnir.jpg",
  martello: "assets/items/mjolnir.jpg",
  anello: "assets/items/draupnir.jpg",
  collana: "assets/items/brisingamen.jpg"
};

window.DDB_SECTIONS = [
  { id: "abilities", label: "Caratteristiche, Salvezza e Sensi", icon: "🐉" },
  { id: "skills", label: "Abilità (Inclusa Asatru)", icon: "✨" },
  { id: "actions", label: "Azioni e Attacchi", icon: "💥" },
  { id: "inventory", label: "Inventario", icon: "🧰" },
  { id: "spells", label: "Incantesimi e Rune", icon: "🔥" },
  { id: "defenses", label: "Velocità, Difese e Condizioni", icon: "🛡️" },
  { id: "features", label: "Privilegi di Classe e Clan", icon: "👤" },
  { id: "proficiencies", label: "Competenze e Addestramento", icon: "🔍" },
  { id: "background", label: "Clan, Background e Virtù", icon: "📜" },
  { id: "notes", label: "Note di Viaggio", icon: "💬" },
  { id: "creatures", label: "Creature e Compagni", icon: "🐺" }
];

// Abilità ufficiali D&D 5e + ASATRU (Saggezza) da Journey to Ragnarok
window.DDB_SKILLS = [
  { id: "acrobazia", name: "Acrobazia", stat: "DES" },
  { id: "addestrare", name: "Addestrare Animali", stat: "SAG" },
  { id: "arcano", name: "Arcano", stat: "INT" },
  { id: "asatru", name: "Asatru (Miti e Dei Norreni)", stat: "SAG" },
  { id: "atletica", name: "Atletica", stat: "FOR" },
  { id: "furtivita", name: "Furtività", stat: "DES" },
  { id: "indagare", name: "Indagare", stat: "INT" },
  { id: "inganno", name: "Inganno", stat: "CAR" },
  { id: "intimidire", name: "Intimidire", stat: "CAR" },
  { id: "intrattenere", name: "Intrattenere", stat: "CAR" },
  { id: "intuizione", name: "Intuizione", stat: "SAG" },
  { id: "medicina", name: "Medicina", stat: "SAG" },
  { id: "natura", name: "Natura", stat: "INT" },
  { id: "percezione", name: "Percezione", stat: "SAG" },
  { id: "persuasione", name: "Persuasione", stat: "CAR" },
  { id: "rapidita", name: "Rapidità di Mano", stat: "DES" },
  { id: "religione", name: "Religione", stat: "INT" },
  { id: "sopravvivenza", name: "Sopravvivenza", stat: "SAG" },
  { id: "storia", name: "Storia", stat: "INT" }
];

// ============================================================================
// 2. COMPENDIO UFFICIALE "JOURNEY TO RAGNAROK" (CLAN, RAZZE, CLASSI, VIRTÙ)
// ============================================================================
window.JTR_RACES = [
  { id: "umano", name: "Umano di Midgardr", speed: "9m", bonus: { FOR: 1, COS: 1 }, traits: ["Sangue di Midgardr: Adattabilità e resilienza nei Nove Mondi"] },
  { id: "ljosalfar", name: "Ljósálfar (Elfo della Luce)", speed: "9m", bonus: { DES: 2, SAG: 1 }, traits: ["Scurovisione 18m", "Luce di Ljosalfheimr", "Sensi Acuti"] },
  { id: "svartalfar", name: "Svartálfar / Nano di Nidavellir", speed: "7.5m", bonus: { COS: 2, FOR: 1 }, traits: ["Scurovisione 18m", "Resilienza di Svartalfheimr (Resistenza al veleno)", "Maestria Runica della Forgia"] },
  { id: "mezzogigante", name: "Sangue Jötunn (Goliath)", speed: "9m", bonus: { FOR: 2, COS: 1 }, traits: ["Tempra dei Giganti del Gelo (Resistenza al freddo)", "Corporatura Possente"] }
];

window.JTR_CLANS = [
  {
    id: "bear_warriors",
    name: "Guerrieri dell'Orso (Bear Warriors)",
    bonusText: "+1 Forza, Competenza in Atletica o Intimidire",
    bonus: { FOR: 1 },
    crest: "assets/clans/crest_bear_warriors.jpg",
    banner: "assets/clans/banner_bear_warriors.jpg",
    trait: "[Clan Guerrieri dell'Orso] Furia di Bjorn: Vantaggio alle prove di Forza per sfondare o lottare; spirito indomito in mischia."
  },
  {
    id: "gjallarhorn",
    name: "Clan Gjallarhorn",
    bonusText: "+1 Carisma, Guardiani di Heimdallr",
    bonus: { CAR: 1 },
    crest: "assets/clans/crest_gjallarhorn.jpg",
    banner: "assets/clans/banner_gjallarhorn.jpg",
    trait: "[Clan Gjallarhorn] Sentinella dell'Alba: Non puoi essere sorpreso mentre sei cosciente e +2 alla Percezione Passiva."
  },
  {
    id: "icy_crow",
    name: "Corvo di Ghiaccio (Icy Crow)",
    bonusText: "+1 Destrezza, Esploratori dei Fiordi",
    bonus: { DES: 1 },
    crest: "assets/clans/crest_icy_crows.jpg",
    banner: "assets/clans/banner_icy_crows.jpg",
    trait: "[Clan Corvo di Ghiaccio] Ali del Nord: Ignori il terreno difficile causato da neve e ghiaccio; maestro delle imboscate."
  },
  {
    id: "jotunn_sons",
    name: "Figli degli Jötunn (Jötunn Sons)",
    bonusText: "+1 Costituzione, Sangue Primordiale",
    bonus: { COS: 1 },
    crest: "assets/clans/crest_jotunn_sons.jpg",
    banner: "assets/clans/banner_jotunn_sons.jpg",
    trait: "[Clan Figli degli Jötunn] Gelo nelle Vene: Resistenza ai climi estremi glaciali e +1 Punto Ferita massimo per livello."
  },
  {
    id: "odhinns_eye",
    name: "Occhio di Odhinn (Odhinn's Eye)",
    bonusText: "+1 Saggezza, Custodi dei Misteri Runici",
    bonus: { SAG: 1 },
    crest: "assets/clans/crest_odhinns_eye.jpg",
    banner: "assets/clans/banner_odhinns_eye.jpg",
    trait: "[Clan Occhio di Odhinn] Sapienza del Padre di Tutto: Competenza automatica nell'abilità Asatru e visione dei presagi."
  },
  {
    id: "wolves_shadow",
    name: "Lupi dell'Ombra (Wolves of the Shadow)",
    bonusText: "+1 Destrezza, Cacciatori Silenziosi",
    bonus: { DES: 1 },
    crest: "assets/clans/crest_wolves_shadow.jpg",
    banner: "assets/clans/banner_wolves_shadow.jpg",
    trait: "[Clan Lupi dell'Ombra] Istinto del Branco: Vantaggio alle prove di Furtività nella penombra o nella nebbia."
  }
];

window.JTR_CLASSES = [
  {
    id: "barbaro",
    name: "Barbaro",
    hitDie: "1d12",
    baseAc: 15,
    saves: ["FOR", "COS"],
    archetypeLevel: 3,
    archetypeTitle: "Cammino Primordiale",
    archetypes: ["Signore della Tempesta (Storm Lord - JtR)", "Berserker (Ulfhednar)", "Combattente Totemico"],
    levelFeatures: {
      1: ["Ira Barbarica (2/riposo lungo, +2 danni)", "Difesa Senza Armatura (10 + DES + COS)"],
      2: ["Attacco Irruento (Reckless Attack)", "Percezione del Pericolo"],
      3: ["Cammino Primordiale: Furia del Signore della Tempesta (Danni da fulmine/tuono in Ira)"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Attacco Extra (2 attacchi per azione)", "Movimento Veloce (+3m)"],
      6: ["Privilegio del Cammino: Egida della Tempesta"],
      7: ["Istinto Ferino (Vantaggio all'Iniziativa)"],
      8: ["Aumento dei Punteggi di Caratteristica"],
      9: ["Critico Brutale (+1 dado danno sui critici)"],
      10: ["Privilegio del Cammino: Scudo di Tuono"]
    }
  },
  {
    id: "maestro_rune",
    name: "Maestro delle Rune (Rune Master - Nuova Classe JtR)",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["COS", "SAG"],
    archetypeLevel: 2,
    archetypeTitle: "Scelta dell'Ætt Runico",
    archetypes: ["Ætt di Freyja (Fertilità, Vita e Magia Seiðr)", "Ætt di Heimdallr (Ordine, Protezione e Guardiani)", "Ætt di Tyr (Guerra, Giustizia e Vittoria)"],
    levelFeatures: {
      1: ["Incisione Runica (Runic Inscription)", "Cerchio Futhark (Attivazione delle Rune del Destino)"],
      2: ["Legame con l'Ætt Prescelto", "Lettura delle Rune (Divinazione Runica)"],
      3: ["Proteggere l'Inscritto (Bonus difensivo a chi porta le tue rune)", "Runa Potenziata"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Maestria del Futhark (Incisione Rapida in Combattimento)", "Nuove Rune Maggiori"],
      6: ["Privilegio dell'Ætt: Risonanza Runica"],
      7: ["Sigillo del Sangue (Potenziamento runico tramite Dadi Vita)"],
      8: ["Aumento dei Punteggi di Caratteristica"],
      9: ["Dominio delle 24 Rune"],
      10: ["Maestro Supremo dell'Ætt"]
    }
  },
  {
    id: "guerriero",
    name: "Guerriero",
    hitDie: "1d10",
    baseAc: 17,
    saves: ["FOR", "COS"],
    archetypeLevel: 3,
    archetypeTitle: "Archetipo Marziale",
    archetypes: ["Il Custode / Skjaldmö (The Keeper - JtR)", "Campione di Midgardr", "Maestro di Battaglia"],
    levelFeatures: {
      1: ["Stile di Combattimento", "Recuperare Energie (Second Wind: 1d10 + liv PF)"],
      2: ["Azione Impetuosa (Action Surge: 1 azione extra)"],
      3: ["Archetipo Marziale: Muro di Scudi (Skjaldborg) e Protezione del Custode"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Attacco Extra (2 attacchi)"],
      6: ["Aumento dei Punteggi di Caratteristica (Extra del Guerriero)"],
      7: ["Privilegio dell'Archetipo: Contrattacco dello Scudo"],
      8: ["Aumento dei Punteggi di Caratteristica"],
      9: ["Indomito (Ripeti un Tiro Salvezza fallito)"],
      10: ["Privilegio dell'Archetipo: Bastione Inrollabile"]
    }
  },
  {
    id: "bardo",
    name: "Bardo (Skaldo)",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["DES", "CAR"],
    archetypeLevel: 3,
    archetypeTitle: "Collegio Bardico",
    archetypes: ["Collegio del Valhalla (College of Valhalla - JtR)", "Collegio del Valore", "Collegio della Sapienza"],
    levelFeatures: {
      1: ["Incantesimi Bardici", "Ispirazione Bardica (d6)"],
      2: ["Factotum (Jack of All Trades)", "Canto di Riposo (d6)"],
      3: ["Collegio del Valhalla: Canto degli Einherjar", "Maestria (Raddoppia competenza in 2 abilità)"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Ispirazione Bardica (d8)", "Fonte di Ispirazione (Recupero con Riposo Corto)"],
      6: ["Controfascino", "Privilegio del Collegio: Inno di Guerra di Asgardr"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "chierico",
    name: "Chierico",
    hitDie: "1d8",
    baseAc: 16,
    saves: ["SAG", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Dominio Divino",
    archetypes: ["Dominio del Sacrificio (Sacrifice Domain - JtR)", "Dominio della Tempesta (Thor)", "Dominio della Guerra (Tyr)", "Dominio dell'Inganno (Loki)"],
    levelFeatures: {
      1: ["Incantesimi Divini", "Dominio del Sacrificio: Offerta di Sangue (Potenzia cure e incantesimi)"],
      2: ["Incanalare Divinità (1/riposo)", "Rito del Blót"],
      3: ["Incantesimi di Dominio di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Distruggere Non Morti (Draugr)", "Incantesimi di 3° Circolo"],
      6: ["Incanalare Divinità (2/riposo)", "Privilegio di Dominio: Martirio Glorioso"],
      8: ["Aumento dei Punteggi di Caratteristica", "Colpo Divino (+1d8 danni)"]
    }
  },
  {
    id: "druido",
    name: "Druido",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["INT", "SAG"],
    archetypeLevel: 2,
    archetypeTitle: "Circolo Druidico",
    archetypes: ["Circolo di Yggdrasill (Circle of Yggdrasill - JtR)", "Circolo della Luna", "Circolo della Terra"],
    levelFeatures: {
      1: ["Druidico", "Incantesimi della Natura"],
      2: ["Forma Selvatica", "Circolo di Yggdrasill: Radici del Frassino Cosmico"],
      3: ["Incantesimi di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica", "Forma Selvatica Migliorata"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio del Circolo: Viaggiatore tra i Rami dei Nove Mondi"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "monaco",
    name: "Monaco",
    hitDie: "1d8",
    baseAc: 15,
    saves: ["FOR", "DES"],
    archetypeLevel: 3,
    archetypeTitle: "Tradizione Monastica",
    archetypes: ["Via della Glima (Way of Glima - Lotta Vichinga JtR)", "Via della Mano Aperta", "Via dell'Ombra"],
    levelFeatures: {
      1: ["Difesa Senza Armatura (10 + DES + SAG)", "Arti Marziali (1d4)"],
      2: ["Ki (Punti Ki pari al livello)", "Movimento Senza Armatura (+3m)"],
      3: ["Via della Glima: Prese e Proiezioni Norrene", "Deviare Proiettili"],
      4: ["Aumento dei Punteggi di Caratteristica", "Caduta Lenta"],
      5: ["Attacco Extra", "Colpo Stordente (Stunning Strike)"],
      6: ["Colpi Ki Potenziati", "Privilegio della Glima: Spezzare la Guardia"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "paladino",
    name: "Paladino",
    hitDie: "1d10",
    baseAc: 18,
    saves: ["SAG", "CAR"],
    archetypeLevel: 3,
    archetypeTitle: "Giuramento Sacro",
    archetypes: ["Giuramento dei Prescelti (Oath of the Chosen - Valchirie JtR)", "Giuramento della Vendetta", "Giuramento degli Antichi"],
    levelFeatures: {
      1: ["Percezione del Divino", "Imposizione delle Mani (Liv x 5 PF)"],
      2: ["Stile di Combattimento", "Punizione Divina (+2d8 danni radiosi)"],
      3: ["Giuramento dei Prescelti: Favore delle Valchirie", "Salute Divina"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Attacco Extra"],
      6: ["Aura di Protezione (+Mod CAR a tutti i Tiri Salvezza)"],
      7: ["Aura dei Prescelti"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "ranger",
    name: "Ranger",
    hitDie: "1d10",
    baseAc: 15,
    saves: ["FOR", "DES"],
    archetypeLevel: 3,
    archetypeTitle: "Archetipo da Ranger",
    archetypes: ["Branco di Lupi (Wolf Pack - JtR)", "Cacciatore", "Signore delle Bestie"],
    levelFeatures: {
      1: ["Nemico Prescelto", "Esploratore Nato (Terreni Artici e Foreste)"],
      2: ["Stile di Combattimento", "Incantesimi da Ranger"],
      3: ["Archetipo Branco di Lupi: Tattiche del Branco e Compagno Lupo", "Consapevolezza Primordiale"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Attacco Extra"],
      7: ["Privilegio del Branco: Zanne del Gelo"],
      8: ["Aumento dei Punteggi di Caratteristica", "Passo della Terra"]
    }
  },
  {
    id: "ladro",
    name: "Ladro",
    hitDie: "1d8",
    baseAc: 15,
    saves: ["DES", "INT"],
    archetypeLevel: 3,
    archetypeTitle: "Archetipo Ladresco",
    archetypes: ["Il Senza Forma (The Shapeless - Seguace di Loki JtR)", "Assassino", "Mistificatore Arcano"],
    levelFeatures: {
      1: ["Attacco Furtivo (1d6)", "Maestria (Raddoppia 2 abilità)", "Gergo Ladresco"],
      2: ["Azione Scaltra (Scatto, Disimpegno o Nascondersi come azione bonus)"],
      3: ["Archetipo Senza Forma: Maschera dell'Ingannatore (Loki)", "Attacco Furtivo (2d6)"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Schivata Prodigiosa (Dimezza il danno di un attacco con reazione)", "Attacco Furtivo (3d6)"],
      6: ["Maestria Superiore"],
      7: ["Elusione (Zero danni sui Tiri Salvezza su DES superati)", "Attacco Furtivo (4d6)"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "stregone",
    name: "Stregone",
    hitDie: "1d6",
    baseAc: 13,
    saves: ["COS", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Origine Stregonesca",
    archetypes: ["Stirpe degli Jötunn (Jötunn Bloodline - JtR)", "Magia Selvaggia", "Discendenza Draconica (Nidhogg/Fafnir)"],
    levelFeatures: {
      1: ["Incantesimi", "Stirpe degli Jötunn: Magia del Gelo di Niflheimr o del Fuoco di Muspellsheimr"],
      2: ["Fonte di Magia (Punti Stregoneria)"],
      3: ["Metamagia (2 opzioni di Metamagia)"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio di Stirpe: Cuore di Ymir (Resistenza elementale e danni potenziati)"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "warlock",
    name: "Warlock",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["SAG", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Patrono Ultraterreno",
    archetypes: ["Signore della Fine / Le Norne (Lord of the End - JtR)", "La Regina di Helheimr (Hel)", "Il Serpente del Mondo"],
    levelFeatures: {
      1: ["Patrono Signore della Fine: Fili del Fato delle Norne", "Magia del Patto"],
      2: ["Suppliche Occulte (2 Suppliche attive)"],
      3: ["Dono del Patto (Patto della Lama, della Catena o del Tomo Runico)"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Suppliche Occulte Migliorate (3 Suppliche)"],
      6: ["Privilegio del Patrono: Presagio del Ragnarok"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  },
  {
    id: "mago",
    name: "Mago (Vitki)",
    hitDie: "1d6",
    baseAc: 13,
    saves: ["INT", "SAG"],
    archetypeLevel: 2,
    archetypeTitle: "Tradizione Arcana",
    archetypes: ["Scuola del Viandante (School of the Wanderer - Odhinn JtR)", "Scuola di Divinazione", "Scuola di Invocazione"],
    levelFeatures: {
      1: ["Incantesimi Arcani", "Recupero Arcano"],
      2: ["Tradizione Scuola del Viandante: Cammino di Vegtamr e Sapienza dei Nove Mondi"],
      3: ["Incantesimi di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio del Viandante: Sguardo di Huginn e Muninn"],
      8: ["Aumento dei Punteggi di Caratteristica"]
    }
  }
];

window.JTR_BACKGROUNDS = [
  { id: "vikingr", name: "Vikingr (Razziatore dei Mari)", gold: 20, skills: ["atletica", "intimidire"], privilege: "Fratellanza di Sangue: Legame sacro con i tuoi compagni di drakkar e accoglienza nei porti norreni.", desc: "Navigatore di Drakkar e razziatore esperto delle coste. 20 monete d'oro iniziali." },
  { id: "huscarl", name: "Huscarl (Guardia Reale dello Jarl)", gold: 20, skills: ["atletica", "intuizione"], privilege: "Abilità dell'Huscarl: Autorità marziale, vitto, alloggio e rispetto in ogni sala dello jarl.", desc: "Guerriero d'élite giurato alla protezione del proprio signore. 20 monete d'oro iniziali." },
  { id: "gothi", name: "Gothi (Sacerdote delle Rune e degli Dei)", gold: 15, skills: ["asatru", "religione"], privilege: "Auspici e Ospitalità: Benvenuto in qualsiasi comunità che venera gli Æsir e i Vanir; puoi officiare i riti del Blót.", desc: "Guida spirituale della comunità, esperto nei riti Asatru e nei sacrifici. 15 monete d'oro iniziali." },
  { id: "jarlr", name: "Jarlr (Nobile Capo Clan)", gold: 25, skills: ["persuasione", "storia"], privilege: "Sangue di Eroi: La tua casata è leggendaria; gli abitanti di Midgardr ti mostrano deferenza e ascoltano i tuoi consigli.", desc: "Nato per comandare uomini liberi e sedere nella sala dell'idromele. 25 monete d'oro iniziali." },
  { id: "bondhi", name: "Bondhi (Uomo Libero di Midgardr)", gold: 15, skills: ["addestrare", "sopravvivenza"], privilege: "Un Focolare a cui Tornare: Possiedi una fattoria o bottega e puoi sempre trovare rifugio e supporto tra i contadini liberi.", desc: "Spina dorsale dei clan: artigiano, cacciatore e difensore della propria terra. 15 monete d'oro iniziali." },
  { id: "skogarmadhr", name: "Skògarmadhr (Fuorilegge dei Boschi)", gold: 5, skills: ["furtivita", "sopravvivenza"], privilege: "Falsa Identità: Sei sopravvissuto all'inverno nei boschi ostili e sai celare il tuo nome a cacciatori di taglie e autorità.", desc: "Bandito esiliato nella grande foresta, abituato a sopravvivere da solo. 5 monete d'oro iniziali." },
  { id: "vaeringhi", name: "Vaeringhi (Mercenario Viaggiatore)", gold: 15, skills: ["atletica", "percezione"], privilege: "Giuramento Sacro: Il tuo giuramento sulla spada ti garantisce contatti commerciali e rispetto tra le compagnie mercenarie.", desc: "Veterano che ha viaggiato in terre lontane in cerca di oro e gloria. 15 monete d'oro iniziali." },
  { id: "thallr", name: "Thallr (Ex-Schiavo Liberato)", gold: 5, skills: ["furtivita", "rapidita"], privilege: "Protetto dal Maestro: Conosci i passaggi segreti delle tenute, la psicologia degli oppressori e la tenacia della sopravvivenza.", desc: "Hai spezzato le tue catene e ora forgi il tuo destino con le tue mani. 5 monete d'oro iniziali." }
];

window.JTR_ALIGNMENTS = [
  "Legale Onorevole (Rispetta la legge del Clan e l'Onore)",
  "Caotico Onorevole (Libero ma fedele al proprio Onore)",
  "Legale Disonorevole (Usa le leggi per scopi egoistici)",
  "Caotico Disonorevole (Senza onore, degno del Náströnd)"
];

window.JTR_VIRTUES = [
  "Coraggio (Courage)",
  "Verità (Truth)",
  "Onore (Honour)",
  "Fedeltà (Fidelity)",
  "Disciplina (Discipline)",
  "Ospitalità (Hospitality)",
  "Operosità (Industriousness)",
  "Autosufficienza (Self-Reliance)",
  "Perseveranza (Perseverance)"
];

window.classifyCardToDdbSection = function(card) {
  const t = (card.type || "").toLowerCase();
  if (t === "arma") return "actions";
  if (t === "incantesimo") return "spells";
  return "inventory";
};

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
