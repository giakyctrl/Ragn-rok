// ============================================================================
// 1. CONFIGURAZIONE CLOUD, CREDENZIALI ADMIN & SEZIONI SCHEDA
// ============================================================================
window.FIREBASE_DATABASE_URL = "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";

window.ADMIN_CREDENTIALS = {
  username: "admin",
  password: "qwerty"
};

// Ritratti Ufficiali dell'Eroe (Personaggi Nordici Fantasy Disegnati)
window.PRESET_AVATARS = [
  "assets/heroes/portraits/norse_hero_01.jpg",
  "assets/heroes/portraits/norse_hero_02.jpg",
  "assets/heroes/portraits/norse_hero_03.jpg",
  "assets/heroes/portraits/norse_hero_04.jpg",
  "assets/heroes/portraits/norse_hero_05.jpg",
  "assets/heroes/portraits/norse_hero_06.jpg",
  "assets/heroes/portraits/norse_hero_07.jpg",
  "assets/heroes/portraits/norse_hero_08.jpg",
  "assets/heroes/portraits/norse_hero_09.jpg",
  "assets/heroes/portraits/norse_hero_10.jpg",
  "assets/heroes/portraits/norse_hero_11.jpg",
  "assets/heroes/portraits/norse_hero_12.jpg",
  "assets/heroes/portraits/norse_hero_13.jpg",
  "assets/heroes/portraits/norse_hero_14.jpg",
  "assets/heroes/portraits/norse_hero_15.jpg",
  "assets/heroes/portraits/norse_hero_16.jpg",
  "assets/heroes/portraits/norse_hero_17.jpg",
  "assets/heroes/portraits/norse_hero_18.jpg",
  "assets/heroes/portraits/norse_hero_19.jpg",
  "assets/heroes/portraits/norse_hero_20.jpg"
];

window.CLASS_FACE_AVATARS = {
  barbaro: "assets/heroes/Brabaro.png",
  guerriero: "assets/heroes/Guerriero.png",
  maestro_rune: "assets/heroes/MaestroDelleRune.png",
  chierico: "assets/heroes/Clerico.png",
  druido: "assets/heroes/Druido.png",
  bardo: "assets/heroes/Bardo.png",
  monaco: "assets/heroes/Monaco.png",
  paladino: "assets/heroes/Paladino.png",
  ranger: "assets/heroes/Ranger.png",
  ladro: "assets/heroes/Ladro.png",
  stregone: "assets/heroes/Stregone.png",
  warlock: "assets/heroes/Warlock.png",
  mago: "assets/heroes/Mago.png"
};

window.CLASS_FULL_ARTWORKS = {
  barbaro: "assets/heroes/full_barbaro.jpg",
  guerriero: "assets/heroes/full_guerriero.jpg",
  maestro_rune: "assets/heroes/full_maestro_rune.jpg",
  chierico: "assets/heroes/full_chierico.jpg",
  druido: "assets/heroes/Druido.png",
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
  { id: "abilities", label: "Caratteristiche, Salvezza e Sensi", icon: '<svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>', iconSvg: '<svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
  { id: "skills", label: "Abilità (Inclusa Asatru)", icon: '<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', iconSvg: '<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { id: "actions", label: "Azioni e Attacchi", icon: '<svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6 2 2-6-3-3-5 7z"/><path d="m5 14 5 5"/></svg>', iconSvg: '<svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6 2 2-6-3-3-5 7z"/><path d="m5 14 5 5"/></svg>' },
  { id: "inventory", label: "Inventario", icon: '<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>', iconSvg: '<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
  { id: "spells", label: "Incantesimi e Rune", icon: '<svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>', iconSvg: '<svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' },
  { id: "defenses", label: "Velocità, Difese e Condizioni", icon: '<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>', iconSvg: '<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: "features", label: "Privilegi di Classe e Clan", icon: '<svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>', iconSvg: '<svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { id: "proficiencies", label: "Competenze e Addestramento", icon: '<svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>', iconSvg: '<svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
  { id: "background", label: "Clan, Background e Virtù", icon: '<svg class="w-4 h-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>', iconSvg: '<svg class="w-4 h-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>' },
  { id: "notes", label: "Note di Viaggio", icon: '<svg class="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>', iconSvg: '<svg class="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { id: "creatures", label: "Creature e Compagni", icon: '<svg class="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>', iconSvg: '<svg class="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>' }
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
  { id: "ljosalfar", name: "Ljósálfar", speed: "9m", bonus: { DES: 2, SAG: 1 }, traits: ["Scurovisione 18m", "Luce di Ljosalfheimr", "Sensi Acuti"] },
  { id: "svartalfar", name: "Svartálfar / Nano di Nidavellir", speed: "7.5m", bonus: { COS: 2, FOR: 1 }, traits: ["Scurovisione 18m", "Resilienza di Svartalfheimr (Resistenza al veleno)", "Maestria Runica della Forgia"] },
  { id: "mezzogigante", name: "Sangue Jötunn", speed: "9m", bonus: { FOR: 2, COS: 1 }, traits: ["Tempra dei Giganti del Gelo (Resistenza al freddo)", "Corporatura Possente"] }
];

window.JTR_CLANS = [
  {
    id: "bear_warriors",
    name: "Guerrieri dell'Orso",
    motto: "La forza della montagna scorre nel sangue dei berserkir.",
    bonusText: "+1 Forza, Competenza in Atletica o Intimidire",
    bonus: { FOR: 1 },
    crest: "assets/clans/Logo-Bear_Warriors.png",
    banner: "assets/clans/OrsiGuerrireri.png",
    desc: "I Guerrieri dell'Orso dominano le aspre foreste montane e i picchi innevati di Midgardr. Noti per la loro vigoria titanica e per i feroci berserkir che combattono avvolti in pelli d'orso sacro, credono nella comunione mistica con la terra primordiale e traggono potenza da Thorr e dagli spiriti selvaggi delle montagne.",
    vantaggi: "Furia di Björn: Vantaggio alle prove di Forza (Atletica) per lottare, sfondare porte o scudi, e atterrare nemici. Hanno diritto a vitto, rifugio d'onore e assistenza in qualsiasi villaggio o sala d'armi dell'Orso.",
    svantaggi: "Codice del Berserkr: Fuggire da un avversario ferito o colpire alle spalle è ritenuto una colpa imperdonabile. Chi rifiuta una sfida rituale o vìola una caverna d'orso sacro subisce l'ostracismo e il bando dai boschi.",
    amicizie: "Solida alleanza militare con il Clan dell'Occhio di Odhinn; reciproco rispetto con i cacciatori dei Lupi dell'Ombra per i confini delle selve.",
    odii: "Furia inesausta contro i Figli di Jötunn, considerati profanatori eretici dei monti ancestrali, e continue faide di confine con i predoni dei Corvi del Ghiaccio.",
    heirloom: {
      id: "heirloom_bear_warriors",
      name: "Artiglio della Montagna",
      type: "arma",
      rarity: "Raro",
      damage: "2d6+FOR",
      weight: 3.5,
      img: "assets/items/Bear-Warriors-Claw-of-the-Mountain.png",
      range: "Mischia (1.5m)",
      desc: "Pesante maglio cerimoniale dei Guerrieri dell'Orso forgiato nelle vette di Jotunheimr. All'impatto critico frantuma armature e atterra i nemici."
    },
    trait: "[Clan Guerrieri dell'Orso] Furia di Bjorn: Vantaggio alle prove di Forza per sfondare o lottare; spirito indomito in mischia."
  },
  {
    id: "gjallarhorn",
    name: "Clan Gjallarhorn",
    motto: "Sentinelle imperiture alla guardia dell'alba dei mondi.",
    bonusText: "+1 Carisma, Guardiani di Heimdallr",
    bonus: { CAR: 1 },
    crest: "assets/clans/Logo-Gjallarhorn.png",
    banner: "assets/clans/gjallarhorn.png",
    desc: "I custodi del Corno dorato e sentinelle devote a Heimdallr, la divinità dallo sguardo infallibile che veglia sul ponte di luce Bifröst. Vivono in alte torri costiere e fari runici monumentali, proteggendo gli insediamenti di Midgardr dalle minacce che scendono dal cielo e dalle onde scure.",
    vantaggi: "Sentinella dell'Alba: Non puoi essere sorpreso mentre sei cosciente; bonus fisso di +2 alla Percezione Passiva. Rispetto garantito da parte di tutti i messaggeri, araldi e giudici del Thing in ogni regno di Midgardr.",
    svantaggi: "Dovere Inviolabile: Vietato addormentarsi durante un turno di guardia o ignorare una richiesta di soccorso da parte di innocenti. Hanno il sacro obbligo di suonare l'allarme tempestivo al primo segno di corruzione o avvento di Ragnarok.",
    amicizie: "Intesa diplomatica e spirituale d'acciaio con i Gothi dell'Occhio di Odhinn; protettori riconosciuti delle assemblee pacifiche di Midgardr.",
    odii: "Nemici giurati degli infiltrati di Hel e dei Lupi dell'Ombra, di cui condannano l'ambiguità morale, le imboscate clandestine e i culti segreti.",
    heirloom: {
      id: "heirloom_gjallarhorn",
      name: "Corno Fragoroso",
      type: "oggetto",
      rarity: "Raro",
      damage: "3d8 Tuono",
      weight: 1.5,
      img: "assets/items/Gjallarhorn-Clangorous-Horn.png",
      range: "Cono 9m",
      desc: "Corno consacrato a Heimdallr. Come azione, emette un rimbombo assordante che infligge 3d8 danni da tuono in un cono di 9m e spaventa i nemici (TS COS CD 14)."
    },
    trait: "[Clan Gjallarhorn] Sentinella dell'Alba: Non puoi essere sorpreso mentre sei cosciente e +2 alla Percezione Passiva."
  },
  {
    id: "icy_crow",
    name: "Corvi del Ghiaccio",
    motto: "Dove il ghiaccio incrina le onde, le nostre ali aprono il sentiero.",
    bonusText: "+1 Destrezza, Esploratori dei Fiordi",
    bonus: { DES: 1 },
    crest: "assets/clans/Logo-Icy-Crows.png",
    banner: "assets/clans/CorviDiGhiaccio.png",
    desc: "Insuperabili navigatori, scuotitori di fiordi e predoni del grande mare boreale. Ispirati ai corvi Hugin e Munin e consacrati ai venti di Njördr, solcano i mari coperti di banchise a bordo dei loro agili drakkar da guerra, scoprendo rotte nascoste e tesori sepolti sotto le tempeste polari.",
    vantaggi: "Ali del Nord: Ignori qualsiasi terreno difficile provocato da neve, lastroni di ghiaccio e burrasche. Vantaggio a tutte le prove di Navigazione, Nautica e Orientamento tra i ghiacci eterni.",
    svantaggi: "Superstizione del Volo: Se prima della battaglia o della partenza un corvo vola verso ovest o verso un lido d'ombre, il clan rinvia lo sbarco interpretando il presagio funesto. Mal tollerano chi vive lontano dall'acqua salmastra.",
    amicizie: "Intese commerciali e scambi di pellicce con i Lupi dell'Ombra; accordi marittimi con i mercanti delle isole meridionali.",
    odii: "Rancori centenari con i Guerrieri dell'Orso per il predominio sui fiordi boscati e per il legname dei drakkar.",
    heirloom: {
      id: "heirloom_icy_crows",
      name: "Ramo Runico",
      type: "oggetto",
      rarity: "Raro",
      damage: "Focus +1 CD",
      weight: 1.0,
      img: "assets/items/Icy_Crows-Runic-Branch.png",
      range: "Personale",
      desc: "Verga di legno sacro intagliata con le rune del ghiaccio dei Corvi. Aggiunge +1 ai Tiri per Colpire degli incantesimi e alla CD dei tiri salvezza."
    },
    trait: "[Clan Corvi del Ghiaccio] Ali del Nord: Ignori il terreno difficile causato da neve e ghiaccio; maestro delle imboscate."
  },
  {
    id: "jotunn_sons",
    name: "Figli di Jötunn",
    motto: "Nelle nostre vene ribolle la tormenta dei giganti delle origini.",
    bonusText: "+1 Costituzione, Sangue Primordiale",
    bonus: { COS: 1 },
    crest: "assets/clans/Logo-Jotunn-Sons.png",
    banner: "assets/clans/FigliDiJotun.png",
    desc: "Guerrieri imponenti e sciamani che discendono dall'antico lignaggio dei Jötnar (giganti del gelo e del fuoco primordiali). Vivono arroccati nelle gole più inospitali di Midgardr, custodi di una sapienza primigenia legata alle forze telluriche e al Seiðr occulto della terra prima degli dei.",
    vantaggi: "Gelo nelle Vene: Resistenza naturale a tutti i danni da freddo e totale immunità agli effetti del clima polare rigido. Ottengono +1 Punto Ferita massimo addizionale per ogni livello posseduto.",
    svantaggi: "Stigma del Sangue Gigante: Visti con diffidenza e timore dai clan devoti agli Aesir. Subiscono svantaggio alle prove di Carisma (Persuasione) quando interagiscono con sacerdoti ortodossi degli Aesir.",
    amicizie: "Fratellanza con i clan di Mezzigiganti (Goliath), eremiti della tundra e druidi dei circoli elementali più remoti.",
    odii: "Guerra perenne e sangue versato contro i Guerrieri dell'Orso e contro il Clan Gjallarhorn, che li considerano una minaccia da estirpare prima della battaglia finale.",
    heirloom: {
      id: "heirloom_jotunn_sons",
      name: "Dente della Strega",
      type: "arma",
      rarity: "Raro",
      damage: "1d4+DES + 2d6 Veleno",
      weight: 0.5,
      img: "assets/items/Jotunn-Sons-Witch's-Tooth.png",
      range: "Mischia / Lancio (6m)",
      desc: "Pugnale sacrificale intagliato da una zanna di gigante dei ghiacci primordiale. Ferisce e avvelena il sangue nemico."
    },
    trait: "[Clan Figli di Jötunn] Gelo nelle Vene: Resistenza ai climi estremi glaciali e +1 Punto Ferita massimo per livello."
  },
  {
    id: "odhinns_eye",
    name: "Occhio di Odhinn",
    motto: "Il destino è inciso nelle rune; solo i saggi ne scorgono la trama.",
    bonusText: "+1 Saggezza, Custodi dei Misteri Runici",
    bonus: { SAG: 1 },
    crest: "assets/clans/Logo-Odyn's-Eye.png",
    banner: "assets/clans/OcchioDiOdino.png",
    desc: "I custodi della suprema sapienza runica, delle leggi sacre del Thing e dei misteri del Padre di Tutto. Guidati da insigni Gothi e maestri dell'antico Futhark, studiano i presagi cosmici, forgiano le prodigiose lame d'acciaio crogiolo Ulfberht e guidano il popolo con discernimento e giustizia.",
    vantaggi: "Sapienza del Padre di Tutto: Competenza d'ufficio nell'abilità Asatru e nelle Rune sacre. Hanno libero accesso a tutti i santuari e voce autorevole con diritto di arbitrato in ogni consiglio dei clan.",
    svantaggi: "Giuramento sull'Anello Sacro: Rompere una promessa prestata su un anello sacro o violare un verdetto del Thing provoca la maledizione di Odhinn e la privazione del potere runico.",
    amicizie: "Legame indissolubile con il Clan Gjallarhorn e stima fraterna con i capi dei Guerrieri dell'Orso.",
    odii: "Rifiuto categorico dei Figli di Jötunn e di ogni forma di stregoneria corruttiva che tenta di alterare i destini stabiliti dalle Norne.",
    heirloom: {
      id: "heirloom_odhinns_eye",
      name: "Spada Ulfberht",
      type: "arma",
      rarity: "Raro",
      damage: "1d8+1+FOR Tagliente",
      weight: 1.5,
      img: "assets/items/Odyn's-Eye-Ulfberht-Sword.png",
      range: "Mischia (1.5m)",
      desc: "Lama di puro acciaio crogiolo forgiata con il marchio segreto dell'Occhio di Odhinn. +1 ai tiri per colpire e per i danni; supera la resistenza ai danni non magici."
    },
    trait: "[Clan Occhio di Odhinn] Sapienza del Padre di Tutto: Competenza automatica nell'abilità Asatru e visione dei presagi."
  },
  {
    id: "wolves_shadow",
    name: "Lupi dell'Ombra",
    motto: "Nel silenzio della selva, il branco non fallisce mai il balzo.",
    bonusText: "+1 Destrezza, Cacciatori Silenziosi",
    bonus: { DES: 1 },
    crest: "assets/clans/Logo-Wolves-of-the-Shadow.png",
    banner: "assets/clans/LupiDellaNotte.png",
    desc: "Cacciatori furtivi, esploratori d'avanguardia e maestri nell'arte dell'agguato tra le fitte foreste di conifere. Ispirati ai lupi cosmici Geri e Freki, agiscono con una coordinazione fulminea e letale, muovendosi senza lasciare orme nella neve e scomparendo come spettri nella bruma.",
    vantaggi: "Istinto del Branco: Vantaggio a tutte le prove di Destrezza (Furtività) quando ti trovi nella penombra, nella nebbia o nel fitto della foresta. Aggiungi +1d6 danni da mischia se attacchi un bersaglio adiacente a un tuo alleato cosciente.",
    svantaggi: "Legge del Branco: Non agire mai da cacciatore solitario quando il branco è in allarme. Tradire o abbandonare un compagno di pattuglia è punito con il taglio dei tendini e l'esilio nel gelo.",
    amicizie: "Accordi e patti di caccia con i marinai dei Corvi del Ghiaccio; tolleranza prudente con i boscaioli dell'Orso.",
    odii: "Aperta ostilità con le ronde doganali e le sentinelle del Clan Gjallarhorn, che tentano continuamente di setacciare le loro rotte clandestine nei boschi.",
    heirloom: {
      id: "heirloom_wolves_shadow",
      name: "Scudo Ombra delle Fronde",
      type: "scudo",
      rarity: "Raro",
      damage: "+2 CA (+Vantaggio Furtività)",
      weight: 2.5,
      img: "assets/items/Wolves-of-the-Shadow-Shadow-of-Leafage.png",
      range: "Personale",
      desc: "Scudo tondo sagomato in legno di pino antico e dipinto con pigmenti d'ombra che camuffano il portatore nella penombra delle foreste di Midgardr."
    },
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
    avatar: "assets/heroes/Brabaro.png",
    levelFeatures: {
      1: ["Ira Barbarica (2/riposo lungo, +2 danni)", "Difesa Senza Armatura (10 + DES + COS)"],
      2: ["Attacco Irruento (Reckless Attack)", "Percezione del Pericolo"],
      3: ["Cammino Primordiale: Furia del Signore della Tempesta (Danni da fulmine/tuono in Ira)"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Attacco Extra (2 attacchi per azione)", "Movimento Veloce (+3m)"],
      6: ["Privilegio del Cammino: Egida della Tempesta"],
      7: ["Istinto Ferino (Vantaggio all'Iniziativa)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"],
      9: ["Critico Brutale (+1 dado danno sui critici)"],
      10: ["Privilegio del Cammino: Scudo di Tuono"]
    }
  },
  {
    id: "maestro_rune",
    name: "Maestro delle Rune",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["COS", "SAG"],
    archetypeLevel: 2,
    archetypeTitle: "Scelta dell'Ætt Runico",
    archetypes: ["Ætt di Freyja (Fertilità, Vita e Magia Seiðr)", "Ætt di Heimdallr (Ordine, Protezione e Guardiani)", "Ætt di Tyr (Guerra, Giustizia e Vittoria)"],
    avatar: "assets/heroes/MaestroDelleRune.png",
    levelFeatures: {
      1: ["Incisione Runica (Runic Inscription)", "Cerchio Futhark (Attivazione delle Rune del Destino)"],
      2: ["Legame con l'Ætt Prescelto", "Lettura delle Rune (Divinazione Runica)"],
      3: ["Proteggere l'Inscritto (Bonus difensivo a chi porta le tue rune)", "Runa Potenziata"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Maestria del Futhark (Incisione Rapida in Combattimento)", "Nuove Rune Maggiori"],
      6: ["Privilegio dell'Ætt: Risonanza Runica"],
      7: ["Sigillo del Sangue (Potenziamento runico tramite Dadi Vita)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"],
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
    avatar: "assets/heroes/Guerriero.png",
    levelFeatures: {
      1: ["Stile di Combattimento", "Recuperare Energie (Second Wind: 1d10 + liv PF)"],
      2: ["Azione Impetuosa (Action Surge: 1 azione extra)"],
      3: ["Archetipo Marziale: Muro di Scudi (Skjaldborg) e Protezione del Custode"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Attacco Extra (2 attacchi)"],
      6: ["Aumento dei Punteggi di Caratteristica o Talento (Guerriero Extra)"],
      7: ["Privilegio dell'Archetipo: Contrattacco dello Scudo"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"],
      9: ["Indomito (Ripeti un Tiro Salvezza fallito)"],
      10: ["Privilegio dell'Archetipo: Bastione Inrollabile"]
    }
  },
  {
    id: "chierico",
    name: "Chierico (Gothi)",
    hitDie: "1d8",
    baseAc: 16,
    saves: ["SAG", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Dominio Divino dei Nove Mondi",
    archetypes: ["Dominio della Guerra (Thor / Tyr)", "Dominio della Tempesta (Aegir)", "Dominio della Vita (Freyja)", "Dominio dell'Inganno (Loki)"],
    avatar: "assets/heroes/Clerico.png",
    levelFeatures: {
      1: ["Incantesimi Divini", "Dominio Divino Prescelto", "Competenza nelle Armature Pesanti / Armi"],
      2: ["Incanalare Divinità (1/riposo)"],
      3: ["Incantesimi di Dominio di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Distruggere Non Morti (Draugr)", "Incantesimi di 3° Circolo"],
      6: ["Incanalare Divinità (2/riposo)", "Privilegio di Dominio: Martirio Glorioso"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento", "Colpo Divino (+1d8 danni)"]
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
    archetypes: ["Circolo di Yggdrasill (Frassino Cosmico - JtR)", "Circolo della Luna (Forme Bestiali del Nord)", "Circolo della Terra (Taiga e Fiordi)"],
    avatar: "assets/heroes/Druido.png",
    levelFeatures: {
      1: ["Druidico", "Incantesimi della Natura"],
      2: ["Forma Selvatica", "Circolo di Yggdrasill: Radici del Frassino Cosmico"],
      3: ["Incantesimi di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento", "Forma Selvatica Migliorata"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio del Circolo: Viaggiatore tra i Rami dei Nove Mondi"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
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
    avatar: "assets/heroes/Bardo.png",
    levelFeatures: {
      1: ["Incantesimi Bardici", "Ispirazione Bardica (d6)"],
      2: ["Factotum (Jack of All Trades)", "Canto di Riposo (d6)"],
      3: ["Collegio del Valhalla: Canto degli Einherjar", "Maestria (Raddoppia competenza in 2 abilità)"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Ispirazione Bardica (d8)", "Fonte di Ispirazione (Recupero con Riposo Corto)"],
      6: ["Controfascino", "Privilegio del Collegio: Inno di Guerra di Asgardr"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
    }
  },
  {
    id: "ladro",
    name: "Ladro",
    hitDie: "1d8",
    baseAc: 14,
    saves: ["DES", "INT"],
    archetypeLevel: 3,
    archetypeTitle: "Archetipo Ladresco",
    archetypes: ["Predatore dei Fiordi / Cacciatore d'Ombra (JtR)", "Assassino dei Lupi", "Furfante Scaltro"],
    avatar: "assets/heroes/Ladro.png",
    levelFeatures: {
      1: ["Attacco Furtivo (+1d6)", "Gergo Ladresco", "Maestria"],
      2: ["Azione Scaltra (Scatto, Disimpegno, Nascondersi come Azione Bonus)"],
      3: ["Archetipo Ladresco: Passo della Nebbia", "Attacco Furtivo (+2d6)"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Schivata Prodigiosa (Dimezza danno da reazione)", "Attacco Furtivo (+3d6)"],
      7: ["Evasione (Nessun danno sui TS Destrezza riusciti)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
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
    archetypes: ["Via dei Berserker a Mani Nude", "Via della Mano Aperta", "Via dell'Ombra dei Lupi"],
    avatar: "assets/heroes/Monaco.png",
    levelFeatures: {
      1: ["Difesa Senza Armatura (10 + DES + SAG)", "Arti Marziali (1d4 a mani nude)"],
      2: ["Punti Ki (Raffica di Colpi, Difesa Paziente, Passo del Vento)", "Movimento Senza Armatura (+3m)"],
      3: ["Tradizione Monastica Prescelta", "Deviare Dardi"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento", "Caduta Lenta"],
      5: ["Attacco Extra", "Colpo Stordente (Stunning Strike)", "Dado Arti Marziali (1d6)"],
      6: ["Colpi Ki-Imbevuti (Attacchi considerati magici)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
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
    archetypes: ["Giuramento degli Aesir (JtR)", "Giuramento di Devozione", "Giuramento di Vendetta"],
    avatar: "assets/heroes/Paladino.png",
    levelFeatures: {
      1: ["Percezione del Divino", "Imposizione delle Mani (Pool 5x Livello)"],
      2: ["Stile di Combattimento", "Incantesimi da Paladino", "Punizione Divina (Divine Smite 2d8+)"],
      3: ["Giuramento Sacro: Canale Divino del Paladino", "Salute Divina (Immune a malattie)"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Attacco Extra"],
      6: ["Aura di Protezione (+CAR ai Tiri Salvezza per te e alleati vicini)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
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
    archetypes: ["Branco di Lupi (Wolfpack - JtR)", "Cacciatore di Jotunn (Jötunn Slayer - JtR)", "Signore delle Bestie"],
    avatar: "assets/heroes/Ranger.png",
    levelFeatures: {
      1: ["Nemico Prescelto (Giganti / Lupi / Non Morti)", "Esploratore Naturale (Taiga, Ghiacciai, Montagne)"],
      2: ["Stile di Combattimento", "Incantesimi da Ranger"],
      3: ["Archetipo Branco di Lupi: Tattiche del Branco e Compagno Lupo", "Consapevolezza Primordiale"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Attacco Extra"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
    }
  },
  {
    id: "stregone",
    name: "Stregone (Seiðr)",
    hitDie: "1d6",
    baseAc: 12,
    saves: ["COS", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Origine Stregonesca",
    archetypes: ["Stirpe degli Jötunn (Jötunn Blood - JtR)", "Magia delle Tempeste di Aegir", "Discendenza Draconica di Fafnir"],
    avatar: "assets/heroes/Stregone.png",
    levelFeatures: {
      1: ["Incantesimi Stregoneschi", "Stirpe degli Jötunn: Magia del Gelo di Niflheimr o del Fuoco di Muspellsheimr"],
      2: ["Fonte di Magia (Punti Stregoneria)"],
      3: ["Metamagia (2 opzioni di Metamagia)", "Incantesimi di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio di Stirpe: Cuore di Ymir (Resistenza elementale e danni potenziati)"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
    }
  },
  {
    id: "warlock",
    name: "Warlock",
    hitDie: "1d8",
    baseAc: 13,
    saves: ["SAG", "CAR"],
    archetypeLevel: 1,
    archetypeTitle: "Patrono Ultraterreno",
    archetypes: ["Hel la Regina dei Morti (JtR)", "Loki il Mutevole", "I Serpenti di Midgardr (Jormungandr)"],
    avatar: "assets/heroes/Warlock.png",
    levelFeatures: {
      1: ["Magia del Patto (Slot di livello massimo, recupero con riposo corto)", "Patrono Prescelto: Benedizione della Morte"],
      2: ["Suppliche Occulte (Eldritch Invocations: 2 scelte)"],
      3: ["Dono del Patto (Patto della Lama, del Tomo o della Catena)"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Supplica Extra", "Slot di 3° Livello"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
    }
  },
  {
    id: "mago",
    name: "Mago",
    hitDie: "1d6",
    baseAc: 12,
    saves: ["INT", "SAG"],
    archetypeLevel: 2,
    archetypeTitle: "Tradizione Arcana",
    archetypes: ["Tradizione del Viandante (Vegtamr - JtR)", "Scuola di Evocazione dei Giganti", "Scuola di Divinazione Runica"],
    avatar: "assets/heroes/Mago.png",
    levelFeatures: {
      1: ["Incantesimi Arcani", "Recupero Arcano"],
      2: ["Tradizione Scuola del Viandante: Cammino di Vegtamr e Sapienza dei Nove Mondi"],
      3: ["Incantesimi di 2° Circolo"],
      4: ["Aumento dei Punteggi di Caratteristica o Talento"],
      5: ["Incantesimi di 3° Circolo"],
      6: ["Privilegio del Viandante: Sguardo di Huginn e Muninn"],
      8: ["Aumento dei Punteggi di Caratteristica o Talento"]
    }
  }
];

window.JTR_BACKGROUNDS = [
  {
    id: "gothi",
    name: "Gothi (Sacerdote del Clan)",
    gold: 25,
    skills: ["asatru", "religione"],
    privilege: "Voce degli Dèi: Puoi celebrare i sacrifici (Blót) e ricevi sempre cibo, alloggio e rispetto in qualsiasi sala di Midgardr.",
    desc: "Guida spirituale, interprete dei presagi e custode delle rune. 25 monete d'oro iniziali.",
    img: "assets/items/Gothi.png"
  },
  {
    id: "jarlr",
    name: "Jarlr (Nobile Condottiero)",
    gold: 25,
    skills: ["storia", "persuasione"],
    privilege: "Comando Riconosciuto: Sei discendente di nobile stirpe. I contadini e guerrieri liberi ti accolgono con omaggi e favori.",
    desc: "Leader nato di una comunità, educato all'arte della guerra e del governo. 25 monete d'oro iniziali.",
    img: "assets/items/Jarlr.png"
  },
  {
    id: "huscarl",
    name: "Huscarl (Guardia Scelta del Jarl)",
    gold: 10,
    skills: ["atletica", "intimidire"],
    privilege: "Legame di Sangue col Capo: Hai giurato fedeltà armata e hai diritto a vitto, equipaggiamento e asilo nella grande sala.",
    desc: "Veterano della guardia d'élite, colonna portante della linea di scudi. 10 monete d'oro iniziali.",
    img: "assets/items/Huscarl.png"
  },
  {
    id: "vikingr",
    name: "Vikingr (Predatore dei Mari)",
    gold: 15,
    skills: ["atletica", "percezione"],
    privilege: "Lupo di Mare: Conosci rotte marittime segrete e puoi ottenere un passaggio su qualsiasi drakkar o knarr alleato.",
    desc: "Navigatore audace che ha solcato i mari ghiacciati per portare gloria e bottino. 15 monete d'oro iniziali.",
    img: "assets/items/Vikingr.png"
  },
  {
    id: "bondhi",
    name: "Bondhi (Uomo Libero di Midgardr)",
    gold: 15,
    skills: ["addestrare", "sopravvivenza"],
    privilege: "Un Focolare a cui Tornare: Possiedi una fattoria o bottega e puoi sempre trovare rifugio e supporto tra i contadini liberi.",
    desc: "Spina dorsale dei clan: artigiano, cacciatore e difensore della propria terra. 15 monete d'oro iniziali.",
    img: "assets/items/Bondhi.png"
  },
  {
    id: "skogarmadhr",
    name: "Skògarmadhr (Fuorilegge dei Boschi)",
    gold: 5,
    skills: ["furtivita", "sopravvivenza"],
    privilege: "Falsa Identità: Sei sopravvissuto all'inverno nei boschi ostili e sai celare il tuo nome a cacciatori di taglie e autorità.",
    desc: "Bandito esiliato nella grande foresta, abituato a sopravvivere da solo. 5 monete d'oro iniziali.",
    img: "assets/items/Skogarmadhr.png"
  },
  {
    id: "vaeringhi",
    name: "Vaeringhi (Mercenario Viaggiatore)",
    gold: 15,
    skills: ["atletica", "percezione"],
    privilege: "Giuramento Sacro: Il tuo giuramento sulla spada ti garantisce contatti commerciali e rispetto tra le compagnie mercenarie.",
    desc: "Veterano che ha viaggiato in terre lontane in cerca di oro e gloria. 15 monete d'oro iniziali.",
    img: "assets/items/Vaeringi.png"
  },
  {
    id: "thallr",
    name: "Thrallr (Ex-Schiavo Liberato)",
    gold: 5,
    skills: ["furtivita", "rapidita"],
    privilege: "Protetto dal Maestro: Conosci i passaggi segreti delle tenute, la psicologia degli oppressori e la tenacia della sopravvivenza.",
    desc: "Hai spezzato le tue catene e ora forgi il tuo destino con le tue mani. 5 monete d'oro iniziali.",
    img: "assets/items/Thrallr.png"
  }
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

// ============================================================================
// 3. DATABASE GLOBALE COMPLETO DI TUTTE LE CARTE CANONICHE (D&D 5.5e & JTR)
// ============================================================================
window.GLOBAL_CARDS_DATABASE = [
  {
    "id": "card_weapon_dagger",
    "name": "Daga / Pugnale Norreno",
    "type": "arma",
    "rarity": "Comune",
    "cost": "2 mo",
    "damage": "1d4+DES Perforante",
    "weight": 0.5,
    "range": "Mischia (1.5m) / Lancio (6m/18m)",
    "img": "assets/items/dente_strega.jpg",
    "desc": "Arma Semplice (Accurata, Leggera, Lancio).\nProprietà di Maestria 5.5e [Nick]: Quando effettui l'attacco extra della proprietà Leggera, puoi effettuarlo come parte dell'azione di Attacco invece di spendere la tua Azione Bonus."
  },
  {
    "id": "card_weapon_shortsword",
    "name": "Spada Corta dei Fiordi",
    "type": "arma",
    "rarity": "Comune",
    "cost": "10 mo",
    "damage": "1d6+DES Perforante",
    "weight": 1.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/spada_corta.jpg",
    "desc": "Arma da Guerra (Accurata, Leggera).\nProprietà di Maestria 5.5e [Vex]: Se colpisci una creatura con quest'arma, ottieni Vantaggio al tuo prossimo tiro per colpire contro di essa prima della fine del tuo prossimo turno."
  },
  {
    "id": "card_weapon_longsword",
    "name": "Spada Lunga Vichinga",
    "type": "arma",
    "rarity": "Comune",
    "cost": "15 mo",
    "damage": "1d8 (1d10) Tagliente",
    "weight": 1.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/spada_ulfberht.jpg",
    "desc": "Arma da Guerra (Versatile a due mani 1d10).\nProprietà di Maestria 5.5e [Sap]: Se colpisci una creatura, essa subisce Svantaggio al suo prossimo tiro per colpire prima dell'inizio del tuo prossimo turno."
  },
  {
    "id": "card_weapon_greatsword",
    "name": "Spadone a Due Mani delle Terre del Nord",
    "type": "arma",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "2d6+FOR Tagliente",
    "weight": 3.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/spadone_due_mani.jpg",
    "desc": "Arma da Guerra (Pesante, Due Mani).\nProprietà di Maestria 5.5e [Graze]: Se manchi un tiro per colpire con quest'arma, infliggi comunque al bersaglio danni pari al tuo modificatore di Forza (minimo 1)."
  },
  {
    "id": "card_weapon_handaxe",
    "name": "Ascia da Lancio / Barbuta Piccola",
    "type": "arma",
    "rarity": "Comune",
    "cost": "5 mo",
    "damage": "1d6+FOR Tagliente",
    "weight": 1.0,
    "range": "Mischia (1.5m) / Lancio (6m/18m)",
    "img": "assets/items/artiglio_montagna.jpg",
    "desc": "Arma Semplice (Leggera, Lancio).\nProprietà di Maestria 5.5e [Vex]: Se colpisci una creatura con quest'arma, ottieni Vantaggio al tuo prossimo tiro per colpire contro di essa prima della fine del tuo prossimo turno."
  },
  {
    "id": "card_weapon_battleaxe",
    "name": "Ascia da Battaglia Norrena",
    "type": "arma",
    "rarity": "Comune",
    "cost": "10 mo",
    "damage": "1d8 (1d10) Tagliente",
    "weight": 2.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/artiglio_montagna.jpg",
    "desc": "Arma da Guerra (Versatile a due mani 1d10).\nProprietà di Maestria 5.5e [Topple]: Se colpisci una creatura, puoi costringerla a un Tiro Salvezza su Costituzione (CD 8 + bonus comp. + mod. caratteristica) o cadere prona."
  },
  {
    "id": "card_weapon_greataxe",
    "name": "Ascia Bipenne Danese",
    "type": "arma",
    "rarity": "Comune",
    "cost": "30 mo",
    "damage": "1d12+FOR Tagliente",
    "weight": 3.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/ascia_bipenne.jpg",
    "desc": "Arma da Guerra (Pesante, Due Mani).\nProprietà di Maestria 5.5e [Cleave]: Se colpisci una creatura, puoi effettuare un secondo attacco in mischia contro un'altra creatura adiacente entro la tua portata, infliggendo i danni base dell'arma."
  },
  {
    "id": "card_weapon_spear",
    "name": "Lancia di Frassino",
    "type": "arma",
    "rarity": "Comune",
    "cost": "1 mo",
    "damage": "1d6 (1d8) Perforante",
    "weight": 1.5,
    "range": "Mischia (1.5m) / Lancio (6m/18m)",
    "img": "assets/items/gungnir.jpg",
    "desc": "Arma Semplice (Lancio, Versatile a due mani 1d8).\nProprietà di Maestria 5.5e [Sap]: Se colpisci una creatura, essa subisce Svantaggio al suo prossimo tiro per colpire prima dell'inizio del tuo prossimo turno."
  },
  {
    "id": "card_weapon_javelin",
    "name": "Giavellotto di Ferro Barbuto",
    "type": "arma",
    "rarity": "Comune",
    "cost": "5 ma",
    "damage": "1d6+FOR Perforante",
    "weight": 1.0,
    "range": "Lancio (9m/36m)",
    "img": "assets/items/giavellotto.jpg",
    "desc": "Arma Semplice (Lancio).\nProprietà di Maestria 5.5e [Slow]: Se colpisci una creatura e le infliggi danni, riduci la sua velocità di movimento di 3 metri fino all'inizio del tuo prossimo turno."
  },
  {
    "id": "card_weapon_quarterstaff",
    "name": "Bastone Ferrato dei Gothi",
    "type": "arma",
    "rarity": "Comune",
    "cost": "2 ma",
    "damage": "1d6 (1d8) Contundente",
    "weight": 2.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/ramo_runico.jpg",
    "desc": "Arma Semplice (Versatile a due mani 1d8).\nProprietà di Maestria 5.5e [Topple]: Se colpisci una creatura, puoi costringerla a un Tiro Salvezza su Costituzione o cadere prona."
  },
  {
    "id": "card_weapon_mace",
    "name": "Mazza Chiodata da Guerra",
    "type": "arma",
    "rarity": "Comune",
    "cost": "5 mo",
    "damage": "1d6+FOR Contundente",
    "weight": 2.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/martello_guerra.jpg",
    "desc": "Arma Semplice.\nProprietà di Maestria 5.5e [Sap]: Colpendo una creatura, la fiacchi imponendo Svantaggio al suo prossimo tiro per colpire prima dell'inizio del tuo prossimo turno."
  },
  {
    "id": "card_weapon_warhammer",
    "name": "Martello da Guerra Runico",
    "type": "arma",
    "rarity": "Comune",
    "cost": "15 mo",
    "damage": "1d8 (1d10) Contundente",
    "weight": 2.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/martello_guerra.jpg",
    "desc": "Arma da Guerra (Versatile a due mani 1d10).\nProprietà di Maestria 5.5e [Push]: Se colpisci una creatura fino a una taglia più grande di te, puoi spingerla dritta all'indietro di 3 metri."
  },
  {
    "id": "card_weapon_maul",
    "name": "Maglio Pesante Frantumatore",
    "type": "arma",
    "rarity": "Comune",
    "cost": "10 mo",
    "damage": "2d6+FOR Contundente",
    "weight": 4.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/Bear-Warriors-Claw-of-the-Mountain.png",
    "desc": "Arma da Guerra (Pesante, Due Mani).\nProprietà di Maestria 5.5e [Topple]: Se colpisci una creatura, deve superare un TS su Costituzione o cadere prona per l'impatto tellurico."
  },
  {
    "id": "card_weapon_halberd",
    "name": "Alabarda dei Guardiani del Thing",
    "type": "arma",
    "rarity": "Comune",
    "cost": "20 mo",
    "damage": "1d10+FOR Tagliente",
    "weight": 3.0,
    "range": "Portata (3m)",
    "img": "assets/items/alabarda.jpg",
    "desc": "Arma da Guerra (Pesante, Portata 3m, Due Mani).\nProprietà di Maestria 5.5e [Cleave]: Quando colpisci un bersaglio, puoi scagliare un attacco di spazzata contro un secondo nemico adiacente a portata."
  },
  {
    "id": "card_weapon_glaive",
    "name": "Falcione da Guerra Boreale",
    "type": "arma",
    "rarity": "Comune",
    "cost": "20 mo",
    "damage": "1d10+FOR Tagliente",
    "weight": 3.0,
    "range": "Portata (3m)",
    "img": "assets/items/falcione.jpg",
    "desc": "Arma da Guerra (Pesante, Portata 3m, Due Mani).\nProprietà di Maestria 5.5e [Graze]: Se manchi un colpo, la lama ricurva graffia comunque infliggendo danni pari al tuo modificatore di Forza."
  },
  {
    "id": "card_weapon_trident",
    "name": "Tridente dei Fiordi",
    "type": "arma",
    "rarity": "Comune",
    "cost": "5 mo",
    "damage": "1d8 (1d10) Perforante",
    "weight": 2.0,
    "range": "Mischia (1.5m) / Lancio (6m/18m)",
    "img": "assets/items/tridente.jpg",
    "desc": "Arma da Guerra (Versatile a due mani 1d10, Lancio).\nProprietà di Maestria 5.5e [Topple]: Infilzando le gambe o lo scudo, costringi il bersaglio a un TS Costituzione o cade prono."
  },
  {
    "id": "card_weapon_shortbow",
    "name": "Arco Corto da Caccia",
    "type": "arma",
    "rarity": "Comune",
    "cost": "25 mo",
    "damage": "1d6+DES Perforante",
    "weight": 1.0,
    "range": "Munizioni (24m/96m)",
    "img": "assets/items/arco_corto.jpg",
    "desc": "Arma Semplice a Distanza (Due Mani).\nProprietà di Maestria 5.5e [Vex]: Colpendo il bersaglio ne studi la postura, garantendoti Vantaggio al tuo prossimo tiro per colpire contro di esso."
  },
  {
    "id": "card_weapon_longbow",
    "name": "Arco Lungo in Tasso di Scandia",
    "type": "arma",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "1d8+DES Perforante",
    "weight": 1.5,
    "range": "Munizioni (45m/180m)",
    "img": "assets/items/arco_lungo.jpg",
    "desc": "Arma da Guerra a Distanza (Pesante, Due Mani).\nProprietà di Maestria 5.5e [Slow]: La potenza delle frecce pesanti conficcate rallenta il bersaglio riducendone la velocità di 3 metri."
  },
  {
    "id": "card_weapon_light_crossbow",
    "name": "Balestra Leggera da Bordo",
    "type": "arma",
    "rarity": "Comune",
    "cost": "25 mo",
    "damage": "1d8+DES Perforante",
    "weight": 2.5,
    "range": "Munizioni (24m/96m)",
    "img": "assets/items/balestra_leggera.jpg",
    "desc": "Arma Semplice a Distanza (Ricarica, Due Mani).\nProprietà di Maestria 5.5e [Slow]: Se colpisci una creatura, riduci la sua velocità di movimento di 3 metri fino al tuo prossimo turno."
  },
  {
    "id": "card_weapon_heavy_crossbow",
    "name": "Balestra Pesante d'Acciaio",
    "type": "arma",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "1d10+DES Perforante",
    "weight": 4.0,
    "range": "Munizioni (30m/120m)",
    "img": "assets/items/balestra_pesante.jpg",
    "desc": "Arma da Guerra a Distanza (Pesante, Ricarica, Due Mani).\nProprietà di Maestria 5.5e [Push]: Il quadrello scagliato con verricello spinge il bersaglio all'indietro di 3 metri se colpito."
  },
  {
    "id": "heirloom_bear_warriors",
    "name": "Artiglio della Montagna",
    "type": "arma",
    "rarity": "Raro",
    "cost": "500 mo",
    "damage": "2d6+FOR Frantumante",
    "weight": 3.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/Bear-Warriors-Claw-of-the-Mountain.png",
    "desc": "Cimelio Ancestrale dei Guerrieri dell'Orso forgiato nelle vette di Jotunheimr. All'impatto critico frantuma armature e atterra i nemici (TS Destrezza CD 14 o prono). Proprietà Maestria [Topple]."
  },
  {
    "id": "heirloom_jotunn_sons",
    "name": "Dente della Strega",
    "type": "arma",
    "rarity": "Raro",
    "cost": "450 mo",
    "damage": "1d4+DES Perforante + 2d6 Veleno",
    "weight": 0.5,
    "range": "Mischia / Lancio (6m)",
    "img": "assets/items/Jotunn-Sons-Witch's-Tooth.png",
    "desc": "Pugnale sacrificale intagliato da una zanna di gigante dei ghiacci primordiale. Ferisce e inietta tossine letali nel sangue nemico (TS Costituzione CD 13 o avvelenato per 1 minuto). Proprietà Maestria [Nick]."
  },
  {
    "id": "heirloom_odhinns_eye",
    "name": "Spada Ulfberht",
    "type": "arma",
    "rarity": "Raro",
    "cost": "600 mo",
    "damage": "1d8+1+FOR Tagliente",
    "weight": 1.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/Odyn's-Eye-Ulfberht-Sword.png",
    "desc": "Lama di puro acciaio crogiolo forgiata con il marchio segreto dell'Occhio di Odhinn. +1 ai tiri per colpire e per i danni; supera la resistenza ai danni non magici. Proprietà Maestria [Sap]."
  },
  {
    "id": "card_weapon_spada_skallfoss",
    "name": "Spada di Skallfoss",
    "type": "arma",
    "rarity": "Non Comune",
    "cost": "350 mo",
    "damage": "1d8+1 (1d10+1) Tagliente",
    "weight": 1.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/spada_skallfoss.jpg",
    "desc": "Arma creata dal leggendario fabbro Skallfoss. Hai un bonus di +1 ai tiri per colpire e per i danni. Vantaggio a tutte le prove di Carisma (Persuasione) quando interagisci con devoti agli Aesir e Vanir."
  },
  {
    "id": "card_weapon_skofnung",
    "name": "Skofnung (La Spada dei Berserkir)",
    "type": "arma",
    "rarity": "Leggendario",
    "cost": "Inestimabile",
    "damage": "1d8+3 (1d10+3) Tagliente",
    "weight": 1.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/skofnung_spada.jpg",
    "desc": "Spada leggendaria infusa con gli spiriti di dodici campioni berserkir. Bonus +3 ai tiri per colpire e ai danni. Come azione puoi pronunciare la parola di comando per evocare gli spiriti di 12 Berserkir che combattono al tuo fianco."
  },
  {
    "id": "card_weapon_tyrfing",
    "name": "Tyrfing (La Lama Maledetta)",
    "type": "arma",
    "rarity": "Molto Raro",
    "cost": "Inestimabile / Maledetto",
    "damage": "1d8+2 Tagliente (Ferita Incurabile)",
    "weight": 1.5,
    "range": "Mischia (1.5m)",
    "img": "assets/items/tyrfing_spada_full.png",
    "desc": "Forgiata dai nani Dvalinn e Durinn. +2 ai tiri per colpire e danni. I punti ferita persi contro quest'arma non possono essere recuperati con il riposo. MALEDIZIONE: Una volta sguainata non può essere rinfoderata finché non ha ucciso una creatura senziente."
  },
  {
    "id": "card_weapon_gramr",
    "name": "Gramr (La Spada del Destino di Sigfrido)",
    "type": "arma",
    "rarity": "Leggendario",
    "cost": "Inestimabile",
    "damage": "2d6+3 Tagliente + 3d6 Tuono",
    "weight": 3.0,
    "range": "Mischia (1.5m)",
    "img": "assets/items/gramr_spada_full.png",
    "desc": "La prodigiosa lama spezza-incudini conficcata da Odhinn nel tronco di Barnstokkr. Con un 20 naturale disintegra all'istante l'armatura non magica del bersaglio e infligge 3d6 danni da tuono aggiuntivi."
  },
  {
    "id": "card_weapon_mjolnir",
    "name": "Mjöllnir (Il Martello del Tuono)",
    "type": "arma",
    "rarity": "Artefatto",
    "cost": "Inestimabile / Divino",
    "damage": "2d8+3 Contundente + 2d8 Fulmine",
    "weight": 15.0,
    "range": "Mischia (1.5m) / Lancio (9m/36m)",
    "img": "assets/items/mjolnir_martello_full.jpg",
    "desc": "Il titanico martello di Thorr forgiato dai nani Brokkr e Sindri. Richiede sintonia e l'uso di Megingjörð e Járngreipr per essere sollevato. Quando scagliato, colpisce con un boato di tuono ed erompe a comando tornando magicamente nella mano del portatore."
  },
  {
    "id": "card_weapon_gungnir",
    "name": "Gungnir (La Lancia Infallibile di Odhinn)",
    "type": "arma",
    "rarity": "Artefatto",
    "cost": "Inestimabile / Divino",
    "damage": "1d12+3 Perforante + 3d8 Radioso",
    "weight": 2.0,
    "range": "Mischia (3m) / Lancio (36m)",
    "img": "assets/items/gungnir_lancia_full.png",
    "desc": "Lancia divina forgiata dai Figli di Ivaldi per Odhinn. Tutti gli attacchi con Gungnir colpiscono automaticamente e ignorano ogni forma di resistenza o immunità ai danni. Concede l'uso di Fermare il Tempo una volta al giorno."
  },
  {
    "id": "card_armor_padded",
    "name": "Tunica Imbottita di Pelliccia",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "5 mo",
    "damage": "CA 11 + DES (Svantaggio Furtività)",
    "weight": 4.0,
    "range": "Personale",
    "img": "assets/items/armatura_imbottita.jpg",
    "desc": "Armatura Leggera. Strati di panno pesante e trapuntato foderati con pelliccia di montone boreale. Offre protezione essenziale contro il freddo e le lame."
  },
  {
    "id": "card_armor_leather",
    "name": "Corazza di Cuoio Indurito",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "10 mo",
    "damage": "CA 11 + DES",
    "weight": 5.0,
    "range": "Personale",
    "img": "assets/items/armatura_cuoio.jpg",
    "desc": "Armatura Leggera. Il pettorale e gli spallacci di quest'armatura sono realizzati in cuoio cotto nell'olio e sagomato per la massima mobilità."
  },
  {
    "id": "card_armor_studded_leather",
    "name": "Cuoio Borchiato delle Selve",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "45 mo",
    "damage": "CA 12 + DES",
    "weight": 6.0,
    "range": "Personale",
    "img": "assets/items/cuoio_borchiato.jpg",
    "desc": "Armatura Leggera. Robusto cuoio rinforzato con rivetti e borchie di ferro battuto ravvicinati. La corazza prediletta da scout e cacciatori dei lupi."
  },
  {
    "id": "card_armor_chainshirt",
    "name": "Giaco di Maglia ad Anelli Ribattuti",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "CA 13 + DES (max +2)",
    "weight": 10.0,
    "range": "Personale",
    "img": "assets/items/megingjord.jpg",
    "desc": "Armatura Media. Una tunica di anelli di ferro intrecciati indossata tra strati di tessuto. Può essere nascosta sotto abiti comuni."
  },
  {
    "id": "card_armor_scalemail",
    "name": "Corazza di Scaglie di Drago Marino",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "CA 14 + DES (max +2, Svant. Furtività)",
    "weight": 20.0,
    "range": "Personale",
    "img": "assets/items/corazza_scaglie.jpg",
    "desc": "Armatura Media. Composta da un corsetto di cuoio ricoperto da placche di metallo e scaglie marine sovrapposte come le squame di un salmone o lindworm."
  },
  {
    "id": "card_armor_breastplate",
    "name": "Corazza Toracica a Piastre",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "400 mo",
    "damage": "CA 14 + DES (max +2)",
    "weight": 10.0,
    "range": "Personale",
    "img": "assets/items/corazza_toracica.jpg",
    "desc": "Armatura Media. Pettorale sagomato in metallo con schienale in cuoio. Lascia braccia e gambe libere, garantendo protezione eccellente senza penalità alla Furtività."
  },
  {
    "id": "card_armor_halfplate",
    "name": "Mezza Armatura a Piastre dell'Huscarl",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "750 mo",
    "damage": "CA 15 + DES (max +2, Svant. Furtività)",
    "weight": 18.0,
    "range": "Personale",
    "img": "assets/items/mezza_armatura.jpg",
    "desc": "Armatura Media. Piastre di metallo sagomate che coprono gran parte del corpo, con giaco di maglia a protezione delle giunture."
  },
  {
    "id": "card_armor_chainmail",
    "name": "Cotta di Maglia Pesante",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "75 mo",
    "damage": "CA 16 (Richiede FOR 13, Svant. Furtività)",
    "weight": 25.0,
    "range": "Personale",
    "img": "assets/items/Huscarl.png",
    "desc": "Armatura Pesante. Fatta di anelli d'acciaio intrecciati che coprono l'intero corpo da capo a caviglie, con camaglio integrato."
  },
  {
    "id": "card_armor_fullplate",
    "name": "Armatura Completa a Piastre dello Jarl",
    "type": "armatura",
    "rarity": "Comune",
    "cost": "1.500 mo",
    "damage": "CA 18 (Richiede FOR 15, Svant. Furtività)",
    "weight": 30.0,
    "range": "Personale",
    "img": "assets/items/armatura_completa.jpg",
    "desc": "Armatura Pesante. Il vertice della metallurgia nordica. Piastre d'acciaio incernierate e ribattute a mano con incisioni runiche dorate che proteggono totalmente il guerriero."
  },
  {
    "id": "card_shield_round",
    "name": "Scudo Rotondo di Frassino",
    "type": "scudo",
    "rarity": "Comune",
    "cost": "10 mo",
    "damage": "+2 alla Classe Armatura",
    "weight": 3.0,
    "range": "Personale",
    "img": "assets/items/scudo_rotondo_frassino.jpg",
    "desc": "Scudo di assi di frassino bordato di cuoio grezzo con umbone centrale di ferro battuto. Utilizzabile per formare il leggendario Skjaldborg (Muro di Scudi)."
  },
  {
    "id": "card_shield_tower",
    "name": "Scudo a Pavise delle Fortezze",
    "type": "scudo",
    "rarity": "Comune",
    "cost": "30 mo",
    "damage": "+2 CA (+ Copertura Mezza contro proiettili)",
    "weight": 6.0,
    "range": "Personale",
    "img": "assets/items/scudo_torre.jpg",
    "desc": "Grande scudo da fanti pesante. Oltre al bonus base di +2 alla CA, conferisce Copertura Mezza (+2 a tiri salvezza su Destrezza) contro attacchi a distanza se piantato nel terreno."
  },
  {
    "id": "heirloom_wolves_shadow",
    "name": "Scudo Ombra delle Fronde",
    "type": "scudo",
    "rarity": "Raro",
    "cost": "450 mo",
    "damage": "+2 CA (+Vantaggio Furtività)",
    "weight": 2.5,
    "range": "Personale",
    "img": "assets/items/Wolves-of-the-Shadow-Shadow-of-Leafage.png",
    "desc": "Cimelio Ancestrale dei Lupi dell'Ombra. Conferisce +2 alla CA e Vantaggio costante alle prove di Destrezza (Furtività) nelle foreste e nella penombra."
  },
  {
    "id": "card_shield_svalinn",
    "name": "Svalinn (Lo Scudo del Carro Solare)",
    "type": "scudo",
    "rarity": "Leggendario",
    "cost": "Inestimabile",
    "damage": "+3 CA (Immunità Totale Fuoco e Gelo)",
    "weight": 4.5,
    "range": "Personale",
    "img": "assets/items/svalin_scudo_full.jpg",
    "desc": "Lo scudo cosmico che si erge davanti al carro di Sol affinché le montagne e i mari di Midgardr non brucino. Conferisce +3 alla CA, immunità a tutti i danni da Fuoco e da Freddo."
  },
  {
    "id": "card_potion_healing",
    "name": "Pozione di Guarigione",
    "type": "pozione",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "Recupera 2d4+2 PF",
    "weight": 0.2,
    "range": "Contatto / Bevitore",
    "img": "assets/items/pozione_guarigione.jpg",
    "desc": "Pozione Alchemica (Azione Bonus in D&D 5.5e!). Bevendola o somministrandola a un alleato adiacente privo di sensi, la creatura recupera istantaneamente 2d4+2 Punti Ferita."
  },
  {
    "id": "card_potion_healing_greater",
    "name": "Pozione di Guarigione Superiore",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "150 mo",
    "damage": "Recupera 4d4+4 PF",
    "weight": 0.2,
    "range": "Contatto / Bevitore",
    "img": "assets/items/pozione_guarigione_superiore.jpg",
    "desc": "Liquido color rubino brillante e pulsante. Quando bevuta (Azione Bonus in 5.5e), il personaggio recupera 4d4+4 Punti Ferita."
  },
  {
    "id": "card_potion_healing_superior",
    "name": "Pozione di Guarigione Suprema",
    "type": "pozione",
    "rarity": "Raro",
    "cost": "450 mo",
    "damage": "Recupera 8d4+8 PF",
    "weight": 0.2,
    "range": "Contatto / Bevitore",
    "img": "assets/items/pozione_guarigione_suprema.jpg",
    "desc": "Infuso prezioso preparato con erbe sacre di Vanaheimr. Quando bevuta con Azione Bonus, risana all'istante 8d4+8 Punti Ferita."
  },
  {
    "id": "card_potion_healing_supreme",
    "name": "Pozione di Guarigione Divina",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "1.350 mo",
    "damage": "Recupera 10d4+20 PF",
    "weight": 0.2,
    "range": "Contatto / Bevitore",
    "img": "assets/items/pozione_guarigione_divina.jpg",
    "desc": "Elisir regale dorato distillato dai frutti aurei di Idunn. Risana 10d4+20 Punti Ferita e purifica da veleni e malattie non magiche."
  },
  {
    "id": "card_potion_blessed_mead",
    "name": "Idromele Benedetto di Odhinn",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "75 mo",
    "damage": "Rimuove Sfinimento + 10 PF Temp",
    "weight": 0.5,
    "range": "Contatto / Bevitore",
    "img": "assets/items/idromele_benedetto.jpg",
    "desc": "Idromele fermentato secondo i riti segreti dei Gothi. Rimuove 1 livello di Sfinimento accumulato e conferisce 10 Punti Ferita temporanei per 8 ore."
  },
  {
    "id": "card_potion_hill_giant",
    "name": "Pozione della Forza del Gigante della Collina",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "200 mo",
    "damage": "Forza fissata a 21 per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_forza_gigante_collina.jpg",
    "desc": "Liquido ambrato e denso con unghia di gigante disciolta. Per 1 ora dopo averla bevuta, il tuo punteggio di Forza diventa 21 (+5). Non ha effetto se la tua Forza è già pari o superiore."
  },
  {
    "id": "card_potion_frost_giant",
    "name": "Pozione della Forza del Gigante del Gelo",
    "type": "pozione",
    "rarity": "Raro",
    "cost": "500 mo",
    "damage": "Forza fissata a 23 per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_forza_gigante_gelo.jpg",
    "desc": "Infuso ceruleo ghiacciato estratto dai campioni di Jotunheimr. Per 1 ora, il tuo punteggio di Forza diventa 23 (+6) e ottieni vantaggio alle prove di Forza per sollevare carichi."
  },
  {
    "id": "card_potion_fire_giant",
    "name": "Pozione della Forza del Gigante del Fuoco",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "1.000 mo",
    "damage": "Forza fissata a 25 per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_forza_gigante_fuoco.jpg",
    "desc": "Flacone ardente distillato nella forgia di Surtr. Per 1 ora, la tua Forza sale a 25 (+7), conferendo una potenza titanica capace di spezzare pietra e metallo."
  },
  {
    "id": "card_potion_invisibility",
    "name": "Pozione di Invisibilità",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "300 mo",
    "damage": "Invisibile per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_invisibilita.jpg",
    "desc": "Flacone apparentemente vuoto con vapore grigioargenteo all'interno. Diventi invisibile per 1 ora insieme al tuo equipaggiamento; l'effetto termina se attacchi o lanci un incantesimo."
  },
  {
    "id": "card_potion_speed",
    "name": "Pozione di Velocità",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "400 mo",
    "damage": "Effetto Velocità per 1 minuto",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_velocita.jpg",
    "desc": "Fluido giallo cangiante con striature dorate. Ottieni gli effetti dell'incantesimo Velocità per 1 minuto (+2 CA, vantaggio TS Des, raddoppio movimento, azione extra) senza richiedere concentrazione."
  },
  {
    "id": "card_potion_water_breathing",
    "name": "Pozione di Respirare sott'Acqua (Dono di Ran)",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "100 mo",
    "damage": "Respiro subacqueo per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_respiro_acquatico.jpg",
    "desc": "Liquido verde azzurrino con odore di salsedine. Puoi respirare sott'acqua ed esplorare liberamente le profondità dei fiordi per 1 ora."
  },
  {
    "id": "card_potion_fire_resistance",
    "name": "Pozione di Resistenza al Fuoco",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "250 mo",
    "damage": "Resistenza a Danni da Fuoco (1 ora)",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_resistenza_fuoco.jpg",
    "desc": "Quando bevi questo liquido denso e fumante, ottieni resistenza ai danni da fuoco per 1 ora (dimezza ogni danno subito da fiamme, lava e draghi di fuoco)."
  },
  {
    "id": "card_potion_cold_resistance",
    "name": "Pozione di Resistenza al Freddo",
    "type": "pozione",
    "rarity": "Non Comune",
    "cost": "250 mo",
    "damage": "Resistenza a Danni da Freddo (1 ora)",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_resistenza_freddo.jpg",
    "desc": "Estratto di grasso di balena glaciale e licheni polari. Conferisce resistenza a tutti i danni da freddo e immunità alle penalità da ipotermia per 1 ora."
  },
  {
    "id": "card_potion_flying",
    "name": "Pozione di Volo (Ali dei Corvi)",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "500 mo",
    "damage": "Velocità di Volo 18m per 1 ora",
    "weight": 0.2,
    "range": "Bevitore",
    "img": "assets/items/pozione_volo.jpg",
    "desc": "Quando bevi questo elisir ceruleo, ottieni una velocità di volo di 18 metri e puoi fluttuare sospeso nell'aria per 1 ora."
  },
  {
    "id": "card_potion_antitoxin",
    "name": "Antitossina Reale",
    "type": "pozione",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "Vantaggio ai TS contro Veleno (1 ora)",
    "weight": 0.1,
    "range": "Bevitore",
    "img": "assets/items/antidoto_reale.jpg",
    "desc": "Una boccetta di erbe purificanti masticate e distillate. Bevendola, ottieni Vantaggio a tutti i Tiri Salvezza contro l'avvelenamento per 1 ora."
  },
  {
    "id": "card_potion_alchemist_fire",
    "name": "Fuoco Alchemico di Muspellsheimr",
    "type": "pozione",
    "rarity": "Comune",
    "cost": "50 mo",
    "damage": "1d4 Fuoco continuo per turno",
    "weight": 0.5,
    "range": "Lancio (6m)",
    "img": "assets/items/fuoco_alchemico.jpg",
    "desc": "Boccetta sigillata con pece e zolfo liquido. All'impatto contro una creatura, prende fuoco a contatto con l'aria infliggendo 1d4 danni da fuoco all'inizio di ogni suo turno finché non spende un'azione per spegnerlo (CD 10 Des)."
  },
  {
    "id": "card_potion_oil_sharpness",
    "name": "Olio di Affilatura Runica",
    "type": "pozione",
    "rarity": "Molto Raro",
    "cost": "600 mo",
    "damage": "+3 a TxC e Danni dell'arma (1 ora)",
    "weight": 0.2,
    "range": "Contatto (1 arma)",
    "img": "assets/items/olio_affilatura.jpg",
    "desc": "Spalmato sulla lama o punta di un'arma non magica, le conferisce un bonus di +3 ai tiri per colpire e per i danni per 1 ora, superando le resistenze non magiche."
  },
  {
    "id": "card_potion_jormungandr_venom",
    "name": "Veleno del Serpente di Midgardr",
    "type": "pozione",
    "rarity": "Raro",
    "cost": "400 mo",
    "damage": "3d6 Veleno (TS Cos CD 15)",
    "weight": 0.1,
    "range": "Contatto (Spalmare su 3 frecce o 1 arma)",
    "img": "assets/items/veleno_jormungandr.jpg",
    "desc": "Tossina corrosiva viola scuro. La creatura ferita dall'arma avvelenata subisce 3d6 danni da veleno e resta Avvelenata per 1 minuto (TS Costituzione CD 15 dimezza e nega condizione)."
  },
  {
    "id": "card_item_bag_of_holding",
    "name": "Borsa Conservante Runica",
    "type": "oggetto",
    "rarity": "Non Comune",
    "cost": "400 mo",
    "damage": "Capacità: 250 kg / 1.7 m³",
    "weight": 6.0,
    "range": "Personale",
    "img": "assets/items/borsa_conservante.jpg",
    "desc": "Sacca di cuoio decorata con nodi boreali che racchiude uno spazio extradimensionale. Può contenere fino a 250 kg senza superare mai il proprio peso fisso di 6 kg."
  },
  {
    "id": "card_item_boots_elvenkind",
    "name": "Stivali della Furtività dei Lupi",
    "type": "oggetto",
    "rarity": "Non Comune",
    "cost": "250 mo",
    "damage": "Vantaggio costante a Furtività",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/stivali_furtivita.jpg",
    "desc": "Calzari in morbida pelle di lupo bianco. I tuoi passi non producono alcun suono su qualsiasi superficie, conferendoti Vantaggio a tutte le prove di Destrezza (Furtività) per muoverti in silenzio."
  },
  {
    "id": "card_item_cloak_protection",
    "name": "Mantello della Protezione",
    "type": "oggetto",
    "rarity": "Non Comune",
    "cost": "350 mo",
    "damage": "+1 a CA e a TUTTI i Tiri Salvezza",
    "weight": 1.0,
    "range": "Personale",
    "img": "assets/items/mantello_protezione.jpg",
    "desc": "Mantello di lana grezza intessuto con fili di rame consacrato. Finché lo indossi, ottieni un bonus di +1 alla Classe Armatura e a tutti i tuoi Tiri Salvezza."
  },
  {
    "id": "card_item_amulet_health",
    "name": "Amuleto della Salute dei Vani",
    "type": "oggetto",
    "rarity": "Raro",
    "cost": "800 mo",
    "damage": "Costituzione fissata a 19",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/amuleto_salute.jpg",
    "desc": "Ciondolo in oro e ambra con incisa la runa Uruz. Finché sei in sintonia, il tuo punteggio di Costituzione è fissato a 19 (+4). Se è già 19 o superiore non ha effetto."
  },
  {
    "id": "card_item_headband_intellect",
    "name": "Fascia dell'Intelletto delle Rune",
    "type": "oggetto",
    "rarity": "Raro",
    "cost": "800 mo",
    "damage": "Intelligenza fissata a 19",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/fascia_intelletto.jpg",
    "desc": "Diadema d'argento intrecciato che apre la mente ai segreti del Seiðr. Il tuo punteggio di Intelligenza è fissato a 19 (+4) per tutta la durata della sintonia."
  },
  {
    "id": "card_item_gauntlets_ogre_power",
    "name": "Guanti del Potere Orchesco / Nordico",
    "type": "oggetto",
    "rarity": "Non Comune",
    "cost": "400 mo",
    "damage": "Forza fissata a 19",
    "weight": 1.0,
    "range": "Personale",
    "img": "assets/items/guanti_potere.jpg",
    "desc": "Manopole di cuoio borchiate di ferro dei troll. Mentre le indossi, il tuo punteggio di Forza sale a 19 (+4), permettendoti di maneggiare con facilità armi pesanti."
  },
  {
    "id": "card_item_horn_valhalla",
    "name": "Tromba del Valhalla in Argento",
    "type": "oggetto",
    "rarity": "Raro",
    "cost": "2.000 mo",
    "damage": "Evoca 2d4+2 Berserkir Spirituali",
    "weight": 1.0,
    "range": "Personale",
    "img": "assets/items/tromba_valhalla.jpg",
    "desc": "Suonando questo corno da guerra d'argento, evochi all'istante 2d4+2 spiriti guerrieri di Einherjar dal Valhalla che combattono al tuo fianco per 1 ora prima di svanire."
  },
  {
    "id": "card_item_horn_gjallarhorn",
    "name": "Corno Fragoroso di Heimdallr",
    "type": "oggetto",
    "rarity": "Raro",
    "cost": "500 mo",
    "damage": "3d8 Tuono (Cono 9m)",
    "weight": 1.5,
    "range": "Cono 9m",
    "img": "assets/items/Gjallarhorn-Clangorous-Horn.png",
    "desc": "Cimelio del Clan Gjallarhorn. Come azione, emette un boato assordante che infligge 3d8 danni da tuono in un cono di 9m e spaventa i nemici (TS Costituzione CD 14)."
  },
  {
    "id": "card_item_runic_branch",
    "name": "Ramo Runico dei Corvi di Ghiaccio",
    "type": "oggetto",
    "rarity": "Raro",
    "cost": "500 mo",
    "damage": "Focus +1 CD Incantesimi & TxC",
    "weight": 1.0,
    "range": "Personale",
    "img": "assets/items/Icy_Crows-Runic-Branch.png",
    "desc": "Cimelio sacro dei Corvi del Ghiaccio intagliato nelle radici di Yggdrasill. Aggiunge +1 ai Tiri per Colpire degli incantesimi e alla CD dei tiri salvezza delle tue magie."
  },
  {
    "id": "card_item_draupnir",
    "name": "Draupnir (L'Anello d'Oro di Odhinn)",
    "type": "oggetto",
    "rarity": "Artefatto",
    "cost": "Inestimabile",
    "damage": "Genera 8 anelli d'oro identici ogni 9 notti",
    "weight": 0.1,
    "range": "Personale",
    "img": "assets/items/draupnir_anello_full.jpg",
    "desc": "L'anello d'oro forgiato per Odhinn dai fratelli nani Brokkr e Sindri. Ogni nove notti, da Draupnir stillano otto anelli d'oro massiccio di pari peso e identico valore."
  },
  {
    "id": "card_item_brisingamen",
    "name": "Brísingamen (La Collana dei Nani di Freyja)",
    "type": "oggetto",
    "rarity": "Artefatto",
    "cost": "Inestimabile",
    "damage": "+3 a Carisma / Fascino Sovrano",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/brisingamen.jpg",
    "desc": "La collana più splendente di tutti i Nove Mondi forgiata dai quattro nani Brísingar. Conferisce autorità divina assoluta, immunità allo charme e vantaggio a qualsiasi prova sociale."
  },
  {
    "id": "card_item_jarngreipr",
    "name": "Járngreipr (I Guanti di Ferro di Thorr)",
    "type": "oggetto",
    "rarity": "Artefatto",
    "cost": "Inestimabile",
    "damage": "Presa Invulnerabile e Immunità Ustioni",
    "weight": 2.0,
    "range": "Personale",
    "img": "assets/items/jarngreipr_guanti_full.jpg",
    "desc": "Guanti di ferro massiccio forgiati per impugnare Mjöllnir senza bruciarsi le mani. Aumentano i danni in mischia con armi contundenti di +1d8."
  },
  {
    "id": "card_item_megingjord",
    "name": "Megingjörð (La Cintura della Forza Titanica)",
    "type": "oggetto",
    "rarity": "Artefatto",
    "cost": "Inestimabile",
    "damage": "Forza fissata a 26 (+8)",
    "weight": 2.0,
    "range": "Personale",
    "img": "assets/items/megingjord_cintura_full.jpg",
    "desc": "La leggendaria cintura indossata dal dio del tuono. Raddoppia la potenza dei muscoli portando il punteggio di Forza a 26 e concedendo Vantaggio continuo alle prove di Atletica."
  },
  {
    "id": "card_item_andvaranautr",
    "name": "Andvaranautr (L'Anello Maledetto del Tesoro)",
    "type": "oggetto",
    "rarity": "Artefatto",
    "cost": "Inestimabile / Maledetto",
    "damage": "Immunità Malattie & +1 CA (Maledizione)",
    "weight": 0.1,
    "range": "Personale",
    "img": "assets/items/andvaranautr_anello.jpg",
    "desc": "L'anello strappato al nano Andvari. Dona giovinezza eterna, immunità a malattie e +1 CA, ma scatena avidità morbosa: chi lo indossa per più di un mese inizia a mutare in drago."
  },
  {
    "id": "card_item_skidbladnir",
    "name": "Skíðblaðnir (Il Drakkar Magico di Freyr)",
    "type": "oggetto",
    "rarity": "Leggendario",
    "cost": "Inestimabile",
    "damage": "Drakkar Pieghevole da Taschino",
    "weight": 1.0,
    "range": "Personale",
    "img": "assets/items/skidbladnir_drakkar.jpg",
    "desc": "La nave costruita dai Figli di Ivaldi per Freyr. Può essere piegata come un fazzoletto ed entrare in un borsello di cuoio. Pronunciando la parola di comando, si ingrandisce in un drakkar da 30 guerrieri pronto a solcare qualsiasi mare."
  },
  {
    "id": "card_item_sunstone",
    "name": "Vera Pietra del Sole (Sólsteinn)",
    "type": "oggetto",
    "rarity": "Molto Raro",
    "cost": "1.000 mo",
    "damage": "Navigazione Infallibile e Orientamento",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/pietra_del_sole.jpg",
    "desc": "Cristallo di calcite islandese polarizzante sacro a Heimdallr. Consente di localizzare istantaneamente la posizione del Sole e il nord cosmico attraverso qualsiasi nebbia, bufera di neve o tenebra polare."
  },
  {
    "id": "card_item_einherjar_horn",
    "name": "Boccale Inesauribile dell'Einherjar",
    "type": "oggetto",
    "rarity": "Comune",
    "cost": "150 mo",
    "damage": "Birra/Idromele continuo",
    "weight": 0.5,
    "range": "Personale",
    "img": "assets/items/boccale_einherjar.jpg",
    "desc": "Boccale in corno intagliato che non si svuota mai, riempiendosi di idromele o birra fresca a comando. Disseta e rinfranca il morale dei guerrieri durante le marce nel gelo."
  },
  {
    "id": "card_cantrip_firebolt",
    "name": "Dardo di Fuoco",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "1d10 Fuoco",
    "range": "36 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_palla_fuoco.jpg",
    "desc": "Scagli un dardo di fiamma viva contro una creatura o un oggetto a gittata. Con un attacco magico a distanza infliggi 1d10 danni da fuoco. Il danno aumenta a 2d10 al 5° livello."
  },
  {
    "id": "card_cantrip_ray_of_frost",
    "name": "Raggio di Gelo",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "1d8 Freddo (-3m vel)",
    "range": "18 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_cono_freddo.jpg",
    "desc": "Un raggio di luce bianca e gelida scaturisce verso il bersaglio. Con un attacco magico a distanza infligge 1d8 danni da freddo e la sua velocità è ridotta di 3 metri fino al suo prossimo turno."
  },
  {
    "id": "card_cantrip_guidance",
    "name": "Guida",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "chierico",
      "druido"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "+1d4 a una prova",
    "range": "Contatto",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 minuto",
    "components": "V, S",
    "img": "assets/items/incanto_benedizione.jpg",
    "desc": "Tocchi una creatura consenziente invocando la saggezza dei corvi di Odhinn. Il bersaglio può sommare 1d4 a una prova di caratteristica a sua scelta."
  },
  {
    "id": "card_cantrip_sacred_flame",
    "name": "Fiamma Sacra",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "chierico"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "1d8 Radioso",
    "range": "18 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_benedizione.jpg",
    "desc": "Un bagliore solare discende sulla creatura bersaglio. Il nemico deve superare un TS su Destrezza o subire 1d8 danni radiosi ignorando qualsiasi copertura parziale."
  },
  {
    "id": "card_cantrip_booming_blade",
    "name": "Lama Folgorante del Tuono",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "mago",
      "stregone",
      "warlock"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "Danno Arma + 1d8 Tuono",
    "range": "Mischia (1.5m)",
    "castingTime": "1 Azione",
    "duration": "1 round",
    "components": "S, M (un'arma)",
    "img": "assets/items/incanto_fulmine.jpg",
    "desc": "Effettui un attacco con l'arma. Se colpito, il bersaglio viene avvolto da energia tonante: se si sposta volontariamente prima del tuo prossimo turno, subisce 1d8 danni da tuono."
  },
  {
    "id": "card_cantrip_spare_the_dying",
    "name": "Saldaferite di Eir",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "chierico",
      "druido"
    ],
    "rarity": "Comune",
    "cost": "Gratuito / Trucchetto",
    "damage": "Stabilizza creatura a 0 PF",
    "range": "Contatto (4.5m in 5.5e)",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_cura_ferite.jpg",
    "desc": "Tocchi una creatura vivente a 0 punti ferita. La creatura diventa istantaneamente stabile senza dover più effettuare tiri salvezza contro la morte."
  },
  {
    "id": "card_spell_magic_missile",
    "name": "Dardo Incantato",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "3 dardi da 1d4+1 Forza",
    "range": "36 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_fulmine.jpg",
    "desc": "Crei tre dardi luminosi di pura forza magica. Ciascun dardo colpisce infallibilmente una creatura visibile a scelta infliggendo 1d4+1 danni da forza senza richiedere tiro per colpire."
  },
  {
    "id": "card_spell_shield",
    "name": "Scudo Runico",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "+5 CA e Immunità a Dardo Incantato",
    "range": "Personale",
    "castingTime": "1 Reazione",
    "duration": "1 round",
    "components": "V, S",
    "img": "assets/items/incanto_scudo.jpg",
    "desc": "Una barriera invisibile di rune protettive si manifesta a mezz'aria. Fino all'inizio del tuo prossimo turno ottieni un bonus di +5 alla CA e non subisci danni da Dardo Incantato."
  },
  {
    "id": "card_spell_mage_armor",
    "name": "Armatura Magica",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "CA base 13 + DES",
    "range": "Contatto",
    "castingTime": "1 Azione",
    "duration": "8 ore",
    "components": "V, S, M (pezzo di cuoio)",
    "img": "assets/items/incanto_armatura_magica.jpg",
    "desc": "Tocchi una creatura consenziente priva di armatura. La sua Classe Armatura base diventa 13 + il suo modificatore di Destrezza per 8 ore."
  },
  {
    "id": "card_spell_cure_wounds",
    "name": "Cura Ferite (Versione 5.5e)",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "bardo",
      "chierico",
      "druido",
      "paladino",
      "ranger"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "2d8 + Modificatore PF",
    "range": "Contatto",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_cura_ferite.jpg",
    "desc": "Regole D&D 5.5e / 2024: La potenza di cura raddoppia a 2d8 + il tuo modificatore di caratteristica da incantatore punti ferita! Aumenta di 2d8 per ogni livello di slot superiore."
  },
  {
    "id": "card_spell_healing_word",
    "name": "Parola Guaritrice",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "bardo",
      "chierico",
      "druido"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "1d4 + Modificatore PF",
    "range": "18 metri",
    "castingTime": "1 Azione Bonus",
    "duration": "Istantaneo",
    "components": "V",
    "img": "assets/items/incanto_parola_guaritrice.jpg",
    "desc": "Sussurri una parola di conforto runico. Una creatura a scelta visibile a gittata recupera istantaneamente punti ferita pari a 1d4 + il tuo modificatore di caratteristica."
  },
  {
    "id": "card_spell_bless",
    "name": "Benedizione degli Aesir",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "chierico",
      "paladino"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "+1d4 ad Attacchi e Tiri Salvezza",
    "range": "9 metri",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 minuto",
    "components": "V, S, M (goccia d'acqua santa)",
    "img": "assets/items/incanto_benedizione.jpg",
    "desc": "Benedici fino a tre creature a scelta. Ogni volta che un bersaglio effettua un tiro per colpire o un tiro salvezza, può tirare un d4 e sommarlo al risultato."
  },
  {
    "id": "card_spell_thunderwave",
    "name": "Onda Tonante di Thorr",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "bardo",
      "druido",
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "2d8 Tuono + Spinta 3m",
    "range": "Cubo di 4.5m originato da te",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_onda_tonante.jpg",
    "desc": "Un'ondata di forza tonante esplode da te. Ciascuna creatura nel cubo deve superare un TS su Costituzione o subire 2d8 danni da tuono ed essere spinta via di 3 metri."
  },
  {
    "id": "card_spell_hunters_mark",
    "name": "Marchio del Cacciatore (5.5e)",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "ranger"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "+1d6 Danni da Forza a ogni colpo",
    "range": "27 metri",
    "castingTime": "1 Azione Bonus",
    "duration": "Concentrazione, fino a 1 ora",
    "components": "V",
    "img": "assets/items/incanto_marchio_cacciatore.jpg",
    "desc": "Designi una creatura come tua preda mistica. Ogni volta che la colpisci con un attacco con arma le infliggi 1d6 danni da forza aggiuntivi e hai vantaggio alle prove per rintracciarla."
  },
  {
    "id": "card_spell_sleep",
    "name": "Sonno Profondo (Regole 5.5e)",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "bardo",
      "mago",
      "stregone"
    ],
    "rarity": "Comune",
    "cost": "Pergamena 50 mo",
    "damage": "TS Saggezza o Condizione Addormentato",
    "range": "18 metri (Area 1.5m)",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 minuto",
    "components": "V, S, M (pizzico di sabbia)",
    "img": "assets/items/incanto_sonno.jpg",
    "desc": "In D&D 5.5e non si tirano più dadi per i PF: ogni creatura nell'area deve superare un TS su Saggezza all'inizio di ciascun turno o cadere addormentata (incapacitata)."
  },
  {
    "id": "card_spell_scorching_ray",
    "name": "Raggio Rovente di Muspellsheimr",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Non Comune",
    "cost": "Pergamena 150 mo",
    "damage": "3 raggi da 2d6 Fuoco ciascuno",
    "range": "36 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S",
    "img": "assets/items/incanto_palla_fuoco.jpg",
    "desc": "Crei tre raggi di fuoco vivo e li scagli contro bersagli a gittata. Con un attacco magico a distanza per ogni raggio, infliggi 2d6 danni da fuoco per ciascun colpo a segno."
  },
  {
    "id": "card_spell_misty_step",
    "name": "Passo Velato",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "mago",
      "stregone",
      "warlock"
    ],
    "rarity": "Non Comune",
    "cost": "Pergamena 150 mo",
    "damage": "Teletrasporto di 9 metri",
    "range": "Personale",
    "castingTime": "1 Azione Bonus",
    "duration": "Istantaneo",
    "components": "V",
    "img": "assets/items/incanto_passo_velato.jpg",
    "desc": "Circondato per un istante da brume argentee di Niflheimr, ti teletrasporti istantaneamente fino a 9 metri in uno spazio libero che puoi vedere come Azione Bonus."
  },
  {
    "id": "card_spell_spiritual_weapon",
    "name": "Arma Spirituale di Thorr",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "chierico"
    ],
    "rarity": "Non Comune",
    "cost": "Pergamena 150 mo",
    "damage": "1d8 + Modificatore Forza/Radioso",
    "range": "18 metri",
    "castingTime": "1 Azione Bonus",
    "duration": "1 minuto",
    "components": "V, S",
    "img": "assets/items/incanto_arma_spirituale.jpg",
    "desc": "Crei un'arma spettrale fluttuante (un martello da guerra, ascia o spada di luce). Quando la evochi e come azione bonus nei turni seguenti puoi colpire un bersaglio entro 1.5m da essa."
  },
  {
    "id": "card_spell_hold_person",
    "name": "Blocca Persone",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "bardo",
      "chierico",
      "druido",
      "mago",
      "stregone",
      "warlock"
    ],
    "rarity": "Non Comune",
    "cost": "Pergamena 150 mo",
    "damage": "Paralisi (TS Saggezza)",
    "range": "18 metri",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 minuto",
    "components": "V, S, M (un piccolo pezzo di ferro)",
    "img": "assets/items/incanto_passo_velato.jpg",
    "desc": "Scegli un umanoide visibile a gittata. Il bersaglio deve superare un TS su Saggezza o rimanere paralizzato per la durata. Gli attacchi in mischia contro di esso sono critici automatici."
  },
  {
    "id": "card_spell_shatter",
    "name": "Frantumare",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "bardo",
      "mago",
      "stregone",
      "warlock"
    ],
    "rarity": "Non Comune",
    "cost": "Pergamena 150 mo",
    "damage": "3d8 Tuono in raggio di 3m",
    "range": "18 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S, M (scheggia di mica)",
    "img": "assets/items/incanto_onda_tonante.jpg",
    "desc": "Un rombo acuto e assordante echeggia in un punto a scelta. Ogni creatura nell'area deve effettuare un TS su Costituzione; subisce 3d8 danni da tuono (creature in pietra o metallo subiscono svantaggio)."
  },
  {
    "id": "card_spell_fireball",
    "name": "Palla di Fuoco",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Raro",
    "cost": "Pergamena 300 mo",
    "damage": "8d6 Fuoco in raggio di 6m",
    "range": "45 metri",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S, M (pallina di guano e zolfo)",
    "img": "assets/items/incanto_palla_fuoco.jpg",
    "desc": "Una sfera incandescente saetta dal tuo dito ed esplode con un boato tellurico. Ogni creatura in una sfera di 6m di raggio subisce 8d6 danni da fuoco (TS Destrezza dimezza)."
  },
  {
    "id": "card_spell_lightning_bolt",
    "name": "Fulmine degli Aesir",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Raro",
    "cost": "Pergamena 300 mo",
    "damage": "8d6 Elettricità (Linea da 30m)",
    "range": "Personale (Linea di 30m x 1.5m)",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S, M (un pezzo di pelliccia e verga di vetro)",
    "img": "assets/items/incanto_fulmine.jpg",
    "desc": "Una saetta accecante squarcia l'aria in una linea lunga 30 metri e larga 1.5 metri. Ciascuna creatura sulla traiettoria subisce 8d6 danni da elettricità (TS Destrezza dimezza)."
  },
  {
    "id": "card_spell_haste",
    "name": "Velocità Temporale",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Raro",
    "cost": "Pergamena 300 mo",
    "damage": "+2 CA, Velocità x2, Azione Extra",
    "range": "9 metri",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 minuto",
    "components": "V, S, M (radice di liquirizia)",
    "img": "assets/items/incanto_velocita.jpg",
    "desc": "Scegli una creatura consenziente. La sua velocità raddoppia, ottiene un bonus di +2 alla CA, vantaggio ai tiri salvezza su Destrezza e un'Azione aggiuntiva in ogni suo turno per Attaccare, Scattare, Disimpegnarsi o Usare Oggetto."
  },
  {
    "id": "card_spell_fly",
    "name": "Volare",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "mago",
      "stregone",
      "warlock"
    ],
    "rarity": "Raro",
    "cost": "Pergamena 300 mo",
    "damage": "Velocità di Volo 18m",
    "range": "Contatto",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 10 minuti",
    "components": "V, S, M (una piuma d'ala di corvo)",
    "img": "assets/items/incanto_volare.jpg",
    "desc": "Tocchi una creatura consenziente conferendole il dono del volo a 18 metri di velocità per 10 minuti."
  },
  {
    "id": "card_spell_spirit_guardians",
    "name": "Guardiani Spirituali (Furia di Thorr)",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "chierico"
    ],
    "rarity": "Raro",
    "cost": "Pergamena 300 mo",
    "damage": "3d8 Radioso/Necrotico ad area",
    "range": "Personale (Emanazione 4.5m)",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 10 minuti",
    "components": "V, S, M (un simbolo sacro)",
    "img": "assets/items/incanto_arma_spirituale.jpg",
    "desc": "Evochi spiriti protettori di Einherjar che turbinano attorno a te in un raggio di 4.5m. I nemici che entrano nell'area subiscono 3d8 danni radiosi (o necrotici) e la loro velocità è dimezzata."
  },
  {
    "id": "card_spell_cone_of_cold",
    "name": "Cono di Freddo di Jotunheimr",
    "type": "incantesimo",
    "level": 5,
    "classes": [
      "mago",
      "stregone"
    ],
    "rarity": "Molto Raro",
    "cost": "Pergamena 1.000 mo",
    "damage": "8d8 Freddo in cono di 18m",
    "range": "Personale (Cono 18m)",
    "castingTime": "1 Azione",
    "duration": "Istantaneo",
    "components": "V, S, M (un piccolo cono di cristallo)",
    "img": "assets/items/incanto_cono_freddo.jpg",
    "desc": "Dalle tue mani spalancate erompe un torrente di vento polare e schegge di ghiaccio primordiale. Ciascuna creatura nel cono deve superare un TS su Costituzione o subire 8d8 danni da freddo; le creature uccise vengono congelate in statue di ghiaccio solido."
  },
  {
    "id": "card_spell_raise_dead",
    "name": "Rianimare Morti (Chiamata da Helheimr)",
    "type": "incantesimo",
    "level": 5,
    "classes": [
      "bardo",
      "chierico",
      "paladino"
    ],
    "rarity": "Molto Raro",
    "cost": "Pergamena 1.250 mo (+ Diamante 500 mo)",
    "damage": "Riporta in vita creatura morta",
    "range": "Contatto",
    "castingTime": "1 Ora",
    "duration": "Istantaneo",
    "components": "V, S, M (un diamante da 500 mo consumato)",
    "img": "assets/items/incanto_rianimare_morti.jpg",
    "desc": "Invochi le potenze delle Norne strappando un'anima dai cancelli di Helheimr. Riporti in vita una creatura morta da non più di 10 giorni con 1 Punto Ferita, curando veleni e ferite mortali."
  },
  {
    "id": "card_rune_fehu",
    "name": "Runa Fehu (Ricchezza e Bestiame)",
    "type": "incantesimo",
    "level": 0,
    "classes": [
      "maestro_rune",
      "druido",
      "chierico"
    ],
    "rarity": "Non Comune",
    "cost": "Sacro / Runa",
    "damage": "Bonus Ricchezza & +1 PF Temporaneo",
    "range": "Contatto",
    "castingTime": "1 Azione",
    "duration": "8 ore",
    "components": "S (Incisione Runa)",
    "img": "assets/items/ramo_runico.jpg",
    "desc": "La runa del bestiame e del flusso vitale. Chi porta incisa questa runa sul palmo ottiene vantaggio a tutte le prove per contrattare o addestrare animali, e ottiene 5 PF temporanei dopo ogni riposo breve."
  },
  {
    "id": "card_rune_uruz",
    "name": "Runa Uruz (La Forza dell'Uro Selvaggio)",
    "type": "incantesimo",
    "level": 1,
    "classes": [
      "maestro_rune",
      "barbaro",
      "guerriero"
    ],
    "rarity": "Raro",
    "cost": "Sacro / Runa",
    "damage": "+2 a Forza & Prove Atletica",
    "range": "Personale",
    "castingTime": "1 Azione Bonus",
    "duration": "10 minuti",
    "components": "V, S",
    "img": "assets/items/Icy_Crows-Runic-Branch.png",
    "desc": "Invocando la forza primigenia del maestoso uro boreale, il portatore ottiene un bonus di +2 a tutti i tiri per colpire e per i danni con armi da mischia basate su Forza e vantaggio alle prove di lotta."
  },
  {
    "id": "card_rune_thurisaz",
    "name": "Runa Thurisaz (La Spina e la Tempesta di Thorr)",
    "type": "incantesimo",
    "level": 2,
    "classes": [
      "maestro_rune",
      "chierico",
      "stregone"
    ],
    "rarity": "Raro",
    "cost": "Sacro / Runa",
    "damage": "Contrattacco da Tuono 2d10",
    "range": "Personale (Reazione)",
    "castingTime": "1 Reazione",
    "duration": "Istantaneo",
    "components": "S",
    "img": "assets/items/ramo_runico.jpg",
    "desc": "La runa della spina protettiva. Come reazione quando vieni colpito da un attacco in mischia, dalla runa esplodono schegge di fulmine e spine che infliggono 2d10 danni da tuono all'attaccante."
  },
  {
    "id": "card_rune_ansuz",
    "name": "Runa Ansuz (La Voce Divina del Padre di Tutto)",
    "type": "incantesimo",
    "level": 3,
    "classes": [
      "maestro_rune",
      "bardo",
      "chierico",
      "mago"
    ],
    "rarity": "Molto Raro",
    "cost": "Sacro / Runa",
    "damage": "Comando Inappellabile & Linguaggi",
    "range": "9 metri",
    "castingTime": "1 Azione",
    "duration": "Concentrazione, fino a 1 ora",
    "components": "V",
    "img": "assets/items/ramo_runico.jpg",
    "desc": "La sacra runa dell'ispirazione e della parola di Odhinn. Comprendi e parli qualsiasi lingua vivente o antica e puoi imporre il comando di Odhinn (TS Saggezza o costretto a ubbidire per 1 minuto)."
  }
];

// Funzione helper per ottenere tutte le carte disponibili (Canoniche + Custom Admin)
window.getAllCards = function(state) {
  const canonical = window.GLOBAL_CARDS_DATABASE || [];
  const currentDb = state || window.dbState || {};
  const custom = currentDb.customCards || [];

  const cardMap = new Map();
  // Inserisce prima le carte canoniche
  canonical.forEach(c => cardMap.set(c.id, { ...c, isCustom: false }));
  // Sovrascrive o aggiunge con le carte modificate/create (nessun clone!)
  custom.forEach(c => {
    const isOverride = canonical.some(orig => orig.id === c.id);
    cardMap.set(c.id, { ...c, isCustom: true, isModifiedCanonical: isOverride });
  });

  return Array.from(cardMap.values());
};

// Sincronizza istantaneamente la modifica di una carta a tutti i giocatori, membri e forzieri
window.syncCardUpdateToAllPlayers = function(cardObj, originalName, targetDb) {
  const db = targetDb || window.dbState;
  if (!db || !cardObj) return;

  const targetId = cardObj.id;
  const matchFn = (c) => {
    if (!c) return false;
    if (c.id === targetId) return true;
    if (typeof c.id === 'string' && c.id.startsWith('inst_' + targetId)) return true;
    if (c.canonicalId && c.canonicalId === targetId) return true;
    if (originalName && c.name && c.name.toLowerCase() === originalName.toLowerCase()) return true;
    return false;
  };

  const applyUpdate = (c) => {
    c.name = cardObj.name;
    c.type = cardObj.type;
    c.rarity = cardObj.rarity;
    c.damage = cardObj.damage;
    c.cost = cardObj.cost;
    c.range = cardObj.range;
    c.weight = cardObj.weight !== undefined ? cardObj.weight : c.weight;
    c.img = cardObj.img;
    c.desc = cardObj.desc;
    if (cardObj.level !== undefined) c.level = cardObj.level;
    if (cardObj.castingTime !== undefined) c.castingTime = cardObj.castingTime;
    if (cardObj.duration !== undefined) c.duration = cardObj.duration;
    if (cardObj.components !== undefined) c.components = cardObj.components;
  };

  // 1. Aggiorna in tutte le campagne (camp.chest e camp.members)
  Object.values(db.campaigns || {}).forEach(camp => {
    if (camp.chest && Array.isArray(camp.chest)) {
      camp.chest.forEach(c => {
        if (matchFn(c)) applyUpdate(c);
      });
    }
    if (camp.members && typeof camp.members === 'object') {
      Object.values(camp.members).forEach(mChar => {
        if (mChar && mChar.cards && Array.isArray(mChar.cards)) {
          mChar.cards.forEach(c => {
            if (matchFn(c)) applyUpdate(c);
          });
        }
      });
    }
  });

  // 2. Aggiorna in tutti i personaggi registrati di tutti gli utenti
  Object.values(db.users || {}).forEach(u => {
    if (u && u.characters && Array.isArray(u.characters)) {
      u.characters.forEach(char => {
        if (char && char.cards && Array.isArray(char.cards)) {
          char.cards.forEach(c => {
            if (matchFn(c)) applyUpdate(c);
          });
        }
      });
    }
  });
};

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
