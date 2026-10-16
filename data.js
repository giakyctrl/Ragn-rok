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
  { id: "abilities", label: "Caratteristiche, Salvezza e Sensi", iconSvg: '<svg class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>' },
  { id: "skills", label: "Abilità (Inclusa Asatru)", iconSvg: '<svg class="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
  { id: "actions", label: "Azioni e Attacchi", iconSvg: '<svg class="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6 2 2-6-3-3-5 7z"/><path d="m5 14 5 5"/></svg>' },
  { id: "inventory", label: "Inventario", iconSvg: '<svg class="w-4 h-4 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>' },
  { id: "spells", label: "Incantesimi e Rune", iconSvg: '<svg class="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>' },
  { id: "defenses", label: "Velocità, Difese e Condizioni", iconSvg: '<svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
  { id: "features", label: "Privilegi di Classe e Clan", iconSvg: '<svg class="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>' },
  { id: "proficiencies", label: "Competenze e Addestramento", iconSvg: '<svg class="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
  { id: "background", label: "Clan, Background e Virtù", iconSvg: '<svg class="w-4 h-4 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>' },
  { id: "notes", label: "Note di Viaggio", iconSvg: '<svg class="w-4 h-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
  { id: "creatures", label: "Creature e Compagni", iconSvg: '<svg class="w-4 h-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg>' }
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
  // --- TRUCCHETTI (LIVELLO 0) ---
  {
    id: "card_cantrip_firebolt",
    name: "Dardo di Fuoco",
    type: "incantesimo",
    level: 0,
    classes: ["mago", "stregone"],
    rarity: "Comune",
    damage: "1d10 Fuoco",
    range: "36 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Scagli un dardo di fiamma viva contro una creatura o un oggetto a gittata. Con un attacco magico a distanza infliggi 1d10 danni da fuoco. Il danno aumenta a 2d10 al 5° livello."
  },
  {
    id: "card_cantrip_ray_of_frost",
    name: "Raggio di Gelo",
    type: "incantesimo",
    level: 0,
    classes: ["mago", "stregone"],
    rarity: "Comune",
    damage: "1d8 Freddo (-3m vel)",
    range: "18 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Un raggio di luce bianca e gelida scaturisce verso il bersaglio. Con un attacco magico a distanza infligge 1d8 danni da freddo e la sua velocità è ridotta di 3 metri fino al suo prossimo turno."
  },
  {
    id: "card_cantrip_sacred_flame",
    name: "Fiamma Sacra",
    type: "incantesimo",
    level: 0,
    classes: ["chierico"],
    rarity: "Comune",
    damage: "1d8 Radioso",
    range: "18 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Un bagliore simile a fiamma discende su una creatura visibile a gittata. Il bersaglio deve superare un TS su Destrezza o subire 1d8 danni radiosi (non beneficia della copertura)."
  },
  {
    id: "card_cantrip_guidance",
    name: "Guida",
    type: "incantesimo",
    level: 0,
    classes: ["chierico", "druido"],
    rarity: "Comune",
    damage: "+1d4 a una prova",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 1 minuto",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Tocchi una creatura consenziente. Una volta prima del termine, il bersaglio può tirare un d4 e sommarlo a una prova di caratteristica a sua scelta."
  },
  {
    id: "card_cantrip_eldritch_blast",
    name: "Deflagrazione Occulta",
    type: "incantesimo",
    level: 0,
    classes: ["warlock"],
    rarity: "Comune",
    damage: "1d10 Forza",
    range: "36 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Un raggio di energia crepitante saetta contro una creatura. Con un attacco a distanza infliggi 1d10 danni da forza. Scaglia raggi addizionali al 5°, 11° e 17° livello."
  },
  {
    id: "card_cantrip_vicious_mockery",
    name: "Beffa Crudele",
    type: "incantesimo",
    level: 0,
    classes: ["bardo"],
    rarity: "Comune",
    damage: "1d4 Psichico (Svantaggio)",
    range: "18 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V",
    img: "assets/items/ramo_runico.jpg",
    desc: "Scagli una serie di insulti taglienti permeati di magia runica. Il bersaglio deve superare un TS su Saggezza o subire 1d4 danni psichici e avere svantaggio al suo prossimo attacco."
  },
  {
    id: "card_cantrip_shillelagh",
    name: "Bastone Incantato",
    type: "incantesimo",
    level: 0,
    classes: ["druido"],
    rarity: "Comune",
    damage: "1d8+SAG Magico",
    range: "Contatto",
    castingTime: "1 Azione Bonus",
    duration: "1 minuto",
    components: "V, S, M (foglia di vischio)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Il legno del tuo bastone o clava si impregna della potenza primordiale della natura. Puoi usare la tua Saggezza invece della Forza per colpire e ferire, infliggendo 1d8 danni magici."
  },

  // --- INCANTESIMI DI 1° LIVELLO ---
  {
    id: "card_spell_magic_missile",
    name: "Dardo Incantato",
    type: "incantesimo",
    level: 1,
    classes: ["mago", "stregone"],
    rarity: "Comune",
    damage: "3x (1d4+1) Forza",
    range: "36 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Crei tre dardi lucenti di forza magica. Ciascun dardo colpisce infallibilmente una creatura a tua scelta che puoi vedere entro la gittata, infliggendo 1d4 + 1 danni da forza ciascuno."
  },
  {
    id: "card_spell_shield",
    name: "Scudo",
    type: "incantesimo",
    level: 1,
    classes: ["mago", "stregone"],
    rarity: "Comune",
    damage: "+5 CA / Immune a Dardi",
    range: "Personale",
    castingTime: "1 Reazione",
    duration: "1 round",
    components: "V, S",
    img: "assets/items/scudo_ombra_fronde.jpg",
    desc: "Una barriera invisibile di pura forza magica si materializza a proteggerti. Fino all'inizio del tuo prossimo turno ottieni un bonus di +5 alla CA e non subisci danni da Dardo Incantato."
  },
  {
    id: "card_spell_cure_wounds",
    name: "Cura Ferite",
    type: "incantesimo",
    level: 1,
    classes: ["chierico", "druido", "bardo", "paladino", "ranger"],
    rarity: "Comune",
    damage: "Cura 2d8+Mod (5.5e)",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Tocchi una creatura infondendole la grazia guaritrice di Freyja e degli dèi. Il bersaglio recupera 2d8 + il tuo modificatore di caratteristica da incantatore in Punti Ferita."
  },
  {
    id: "card_spell_healing_word",
    name: "Parola Guaritrice",
    type: "incantesimo",
    level: 1,
    classes: ["chierico", "druido", "bardo"],
    rarity: "Comune",
    damage: "Cura 2d4+Mod (5.5e)",
    range: "18 metri",
    castingTime: "1 Azione Bonus",
    duration: "Istantaneo",
    components: "V",
    img: "assets/items/ramo_runico.jpg",
    desc: "Pronunci una parola di potere che ripristina le forze di una creatura visibile entro la gittata. Recupera 2d4 + il tuo modificatore di caratteristica in Punti Ferita come Azione Bonus."
  },
  {
    id: "card_spell_bless",
    name: "Benedizione",
    type: "incantesimo",
    level: 1,
    classes: ["chierico", "paladino"],
    rarity: "Comune",
    damage: "+1d4 a Tiri per Colpire e TS",
    range: "9 metri",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 1 minuto",
    components: "V, S, M (goccia d'acqua santa)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Benedici fino a tre creature a scelta. Ogni volta che un bersaglio compie un tiro per colpire o un tiro salvezza prima del termine, tira un d4 e somma il risultato al tiro."
  },
  {
    id: "card_spell_thunderwave",
    name: "Onda Tonante",
    type: "incantesimo",
    level: 1,
    classes: ["bardo", "druido", "stregone", "mago"],
    rarity: "Comune",
    damage: "2d8 Tuono (Spinta 3m)",
    range: "Cubo di 4.5m",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/corno_fragoroso.jpg",
    desc: "Un'ondata tonante di energia prorompe da te. Ogni creatura nel cubo deve superare un TS su Costituzione o subire 2d8 danni da tuono ed essere spinta via di 3 metri."
  },
  {
    id: "card_spell_burning_hands",
    name: "Mani Brucianti",
    type: "incantesimo",
    level: 1,
    classes: ["stregone", "mago"],
    rarity: "Comune",
    damage: "3d6 Fuoco",
    range: "Cono di 4.5m",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Unite le mani a ventaglio, proietti un getto infuocato di Muspellsheimr. Ogni creatura nel cono deve superare un TS su Destrezza o subire 3d6 danni da fuoco (metà se supera)."
  },
  {
    id: "card_spell_hex",
    name: "Anatema",
    type: "incantesimo",
    level: 1,
    classes: ["warlock"],
    rarity: "Comune",
    damage: "+1d6 Necrotico / Svantaggio",
    range: "27 metri",
    castingTime: "1 Azione Bonus",
    duration: "Concentrazione, fino a 1 ora",
    components: "V, S, M (occhio pietrificato)",
    img: "assets/items/dente_strega.jpg",
    desc: "Maledici una creatura entro la gittata. Ogni volta che la colpisci con un attacco, le infliggi 1d6 danni necrotici extra, e scegli una caratteristica in cui ha svantaggio alle prove."
  },
  {
    id: "card_spell_hunters_mark",
    name: "Marchio del Cacciatore",
    type: "incantesimo",
    level: 1,
    classes: ["ranger"],
    rarity: "Comune",
    damage: "+1d6 Danno alle Armi",
    range: "27 metri",
    castingTime: "1 Azione Bonus",
    duration: "Concentrazione, fino a 1 ora",
    components: "V",
    img: "assets/items/artiglio_montagna.jpg",
    desc: "Designe spiritualmente una creatura come tua preda. Fino al termine infliggi 1d6 danni extra ogni volta che la colpisci con un attacco con arma e hai vantaggio alle prove per rintracciarla."
  },

  // --- INCANTESIMI DI 2° LIVELLO ---
  {
    id: "card_spell_scorching_ray",
    name: "Raggio Rovente",
    type: "incantesimo",
    level: 2,
    classes: ["mago", "stregone"],
    rarity: "Non Comune",
    damage: "3x 2d6 Fuoco",
    range: "36 metri",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S",
    img: "assets/items/ramo_runico.jpg",
    desc: "Crei tre raggi infuocati e li scagli contro bersagli a gittata. Compi un attacco magico a distanza per ciascun raggio; ognuno infligge 2d6 danni da fuoco."
  },
  {
    id: "card_spell_misty_step",
    name: "Passo Velato",
    type: "incantesimo",
    level: 2,
    classes: ["mago", "stregone", "warlock"],
    rarity: "Non Comune",
    damage: "Teletrasporto 9m",
    range: "Personale (9m)",
    castingTime: "1 Azione Bonus",
    duration: "Istantaneo",
    components: "V",
    img: "assets/items/ramo_runico.jpg",
    desc: "Circondato da nebbia argentea, ti teletrasporti istantaneamente fino a 9 metri di distanza in uno spazio non occupato che puoi vedere."
  },
  {
    id: "card_spell_spiritual_weapon",
    name: "Arma Spirituale",
    type: "incantesimo",
    level: 2,
    classes: ["chierico"],
    rarity: "Non Comune",
    damage: "1d8+SAG Forza",
    range: "18 metri",
    castingTime: "1 Azione Bonus",
    duration: "1 minuto (Senza concentrazione)",
    components: "V, S",
    img: "assets/items/spada_ulfberht.jpg",
    desc: "Evoci un'arma spettrale fluttuante (come il martello di Thor o la lancia di Odhinn). Come azione bonus puoi muoverla di 6m e compiere un attacco magico in mischia per 1d8 + Saggezza danni."
  },
  {
    id: "card_spell_hold_person",
    name: "Blocca Persone",
    type: "incantesimo",
    level: 2,
    classes: ["bardo", "chierico", "druido", "stregone", "warlock", "mago"],
    rarity: "Non Comune",
    damage: "Paralisi (TS Saggezza)",
    range: "18 metri",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 1 minuto",
    components: "V, S, M (pezzetto di ferro)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Scegli un umanoide visibile entro la gittata. Deve superare un tiro salvezza su Saggezza o rimanere paralizzato per la durata. Può ripetere il TS al termine di ogni suo turno."
  },
  {
    id: "card_spell_shatter",
    name: "Frantumare",
    type: "incantesimo",
    level: 2,
    classes: ["bardo", "stregone", "warlock", "mago"],
    rarity: "Non Comune",
    damage: "3d8 Tuono",
    range: "18 metri (Raggio 3m)",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S, M (scheggia di mica)",
    img: "assets/items/corno_fragoroso.jpg",
    desc: "Un suono acuto e doloroso scuote l'area. Ogni creatura in una sfera di 3m deve superare un TS su Costituzione o subire 3d8 danni da tuono. Le creature di roccia/metallo hanno svantaggio."
  },

  // --- INCANTESIMI DI 3° LIVELLO ---
  {
    id: "card_spell_fireball",
    name: "Palla di Fuoco",
    type: "incantesimo",
    level: 3,
    classes: ["stregone", "mago"],
    rarity: "Raro",
    damage: "8d6 Fuoco",
    range: "45 metri (Raggio 6m)",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S, M (guano e zolfo)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Un lampo luminoso scaturisce dal tuo dito ed esplode con un boato sordo in una sfera di fuoco di 6m di raggio. Ogni creatura nell'area deve superare un TS su Destrezza o subire 8d6 danni da fuoco."
  },
  {
    id: "card_spell_lightning_bolt",
    name: "Fulmine",
    type: "incantesimo",
    level: 3,
    classes: ["stregone", "mago"],
    rarity: "Raro",
    damage: "8d6 Fulmine",
    range: "Linea di 30m x 1.5m",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S, M (frammento d'ambra)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Un raggio di saette accecanti saetta da te in una linea lunga 30m e larga 1.5m. Ogni creatura attraversata deve superare un TS su Destrezza o subire 8d6 danni da fulmine."
  },
  {
    id: "card_spell_spirit_guardians",
    name: "Guardiani Spirituali",
    type: "incantesimo",
    level: 3,
    classes: ["chierico"],
    rarity: "Raro",
    damage: "3d8 Radioso / Necrotico",
    range: "Emanazione di 4.5m",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 10 minuti",
    components: "V, S, M (amuleto sacro)",
    img: "assets/items/svalinn.jpg",
    desc: "Evoci spiriti protettori (Einherjar o Valchirie) che orbitano attorno a te entro 4.5m. La velocità dei nemici nell'area è dimezzata, e quando entrano o iniziano il turno subiscono 3d8 danni radiosi."
  },
  {
    id: "card_spell_revivify",
    name: "Revivificare",
    type: "incantesimo",
    level: 3,
    classes: ["chierico", "paladino", "druido"],
    rarity: "Raro",
    damage: "Rianima (1 PF)",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "Istantaneo",
    components: "V, S, M (diamanti del valore di 300 mo)",
    img: "assets/items/brisingamen.jpg",
    desc: "Tocchi una creatura morta entro l'ultimo minuto. La creatura torna in vita con 1 Punto Ferita, strappata dal regno di Hel prima che la sua anima attraversi il ponte Gjallarbru."
  },
  {
    id: "card_spell_haste",
    name: "Velocità",
    type: "incantesimo",
    level: 3,
    classes: ["stregone", "mago"],
    rarity: "Raro",
    damage: "+2 CA, Velocità x2, +1 Azione",
    range: "9 metri",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 1 minuto",
    components: "V, S, M (radice di liquirizia)",
    img: "assets/items/ramo_runico.jpg",
    desc: "Scegli una creatura consenziente. Fino al termine della durata la sua velocità è raddoppiata, ottiene +2 alla CA, vantaggio ai TS su Destrezza e un'azione aggiuntiva ogni turno per Attaccare, Scattare o Disimpegnarsi."
  },

  // --- RUNE DEL FUTHARK (JOURNEY TO RAGNAROK) ---
  {
    id: "card_rune_fehu",
    name: "Runa Fehu (Ricchezza e Prosperità)",
    type: "incantesimo",
    level: 1,
    classes: ["maestro_rune"],
    rarity: "Non Comune",
    damage: "Benedizione del Dono",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "8 ore",
    components: "Incisione su legno o metallo",
    img: "assets/items/ramo_runico.jpg",
    desc: "[Runa del Futhark - Ætt di Freyja] Incisa su una borsa o arma: il portatore ottiene vantaggio a tutte le prove sociali per negoziare e una volta al giorno trova 2d10 monete o risorse preziose."
  },
  {
    id: "card_rune_uruz",
    name: "Runa Uruz (Forza dell'Uro Selvaggio)",
    type: "incantesimo",
    level: 1,
    classes: ["maestro_rune"],
    rarity: "Non Comune",
    damage: "+2 FOR (Prove e Danni)",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 1 ora",
    components: "Incisione su cuoio o carne",
    img: "assets/items/ramo_runico.jpg",
    desc: "[Runa del Futhark - Ætt di Freyja] Incisa sul petto o sull'impugnatura dell'arma. Il guerriero ottiene vantaggio alle prove di Forza (Atletica) e aggiunge +2 ai tiri per i danni in mischia."
  },
  {
    id: "card_rune_thurisaz",
    name: "Runa Thurisaz (Spina e Tempesta di Thor)",
    type: "incantesimo",
    level: 1,
    classes: ["maestro_rune"],
    rarity: "Non Comune",
    damage: "2d6 Fulmine (Contrattacco)",
    range: "Contatto",
    castingTime: "1 Reazione",
    duration: "Istantaneo",
    components: "Incisione su scudo o armatura",
    img: "assets/items/mjolnir.jpg",
    desc: "[Runa del Futhark - Ætt di Freyja] Quando il portatore viene colpito da un attacco in mischia, scatena una scarica di fulmine runica che infligge 2d6 danni da fulmine all'attaccante."
  },
  {
    id: "card_rune_ansuz",
    name: "Runa Ansuz (Parola Divina del Padre degli Dèi)",
    type: "incantesimo",
    level: 2,
    classes: ["maestro_rune"],
    rarity: "Raro",
    damage: "Presagio / Comprensione Totale",
    range: "Personale",
    castingTime: "1 Azione",
    duration: "1 ora",
    components: "Incisione su osso",
    img: "assets/items/dente_strega.jpg",
    desc: "[Runa del Futhark - Ætt di Heimdallr] Il Maestro delle Rune comprende qualsiasi lingua parlata o scritta nei Nove Mondi e ottiene vantaggio a tutte le prove di Conoscenza e Asatru."
  },
  {
    id: "card_rune_tiwaz",
    name: "Runa Tiwaz (Giustizia e Vittoria di Tyr)",
    type: "incantesimo",
    level: 2,
    classes: ["maestro_rune"],
    rarity: "Raro",
    damage: "+2 Tiri per Colpire / Immune a Paura",
    range: "Contatto",
    castingTime: "1 Azione",
    duration: "1 ora",
    components: "Incisione sulla lama della spada",
    img: "assets/items/spada_ulfberht.jpg",
    desc: "[Runa del Futhark - Ætt di Tyr] Incisa sulla lama. L'arma ottiene +2 ai tiri per colpire, supera le resistenze magiche e rende il portatore immune alla condizione Spaventato."
  },
  {
    id: "card_rune_othala",
    name: "Runa Othala (Eredità degli Antichi)",
    type: "incantesimo",
    level: 3,
    classes: ["maestro_rune"],
    rarity: "Molto Raro",
    damage: "Aura di Difesa Totale",
    range: "Aura 6m",
    castingTime: "1 Azione",
    duration: "Concentrazione, fino a 10 minuti",
    components: "Incisione su pietra sacra",
    img: "assets/items/ramo_runico.jpg",
    desc: "[Runa del Futhark - Ætt di Tyr] Proietta un cerchio runico dorato sul suolo. Tutti gli alleati all'interno ottengono +2 a tutti i Tiri Salvezza e resistenza a freddo e fuoco."
  },

  // --- ARMI NORRENE STANDARD E LEGGENDARIE ---
  {
    id: "card_weapon_bearded_axe",
    name: "Ascia Barbuta",
    type: "arma",
    rarity: "Comune",
    damage: "1d8+FOR Tagliente",
    weight: 2.0,
    range: "Mischia (1.5m)",
    img: "assets/items/artiglio_montagna.jpg",
    desc: "L'arma per eccellenza dei guerrieri di Midgardr. La forma ricurva della lama permette di agganciare gli scudi avversari (disarmare o abbassare la guardia nemica)."
  },
  {
    id: "card_weapon_greataxe",
    name: "Ascia Bipenne da Guerra Danese",
    type: "arma",
    rarity: "Comune",
    damage: "1d12+FOR Tagliente",
    weight: 3.5,
    range: "Mischia (Pesante, Due Mani)",
    img: "assets/items/artiglio_montagna.jpg",
    desc: "Arma devastante a due mani, capace di fendere scudi e spezzare ranghi di formazioni con fendenti brutali."
  },
  {
    id: "card_weapon_seax",
    name: "Seax",
    type: "arma",
    rarity: "Comune",
    damage: "1d6+DES Perforante/Tagliente",
    weight: 1.0,
    range: "Mischia (Accurata, Leggera)",
    img: "assets/items/spada_ulfberht.jpg",
    desc: "Lungo coltello a un sol filo portato da ogni uomo libero di Midgardr, letale in spazi stretti o come arma secondaria per il combattimento a due mani."
  },
  {
    id: "card_weapon_ash_spear",
    name: "Lancia di Frassino",
    type: "arma",
    rarity: "Comune",
    damage: "1d6/1d8+FOR Perforante",
    weight: 1.8,
    range: "Mischia / Lancio (6m/18m)",
    img: "assets/items/gungnir.jpg",
    desc: "Asta in robusto legno di frassino con cuspide d'acciaio temprato. Consacrata al Padre di Tutto Odhinn, versatile a una o due mani."
  },
  {
    id: "card_weapon_mjolnir",
    name: "Mjöllnir",
    type: "arma",
    rarity: "Leggendario",
    damage: "2d8+3 + 2d8 Tuono/Fulmine",
    weight: 6.0,
    range: "Mischia / Lancio (18m, Ritorno)",
    img: "assets/items/mjolnir.jpg",
    desc: "Il leggendario martello da guerra forgiato dai nani Brokkr e Sindri. Ritorna istantaneamente nella mano di chi lo scaglia e scatena tempeste apocalittiche."
  },
  {
    id: "card_weapon_gungnir",
    name: "Gungnir",
    type: "arma",
    rarity: "Leggendario",
    damage: "2d10+3 Perforante Magico",
    weight: 3.0,
    range: "Mischia / Lancio (Infallibile)",
    img: "assets/items/gungnir.jpg",
    desc: "Forgiata dai nani Figli di Ivaldi, reca incise sull'asta le rune del destino. Quando scagliata in battaglia, non manca mai il bersaglio prefissato."
  },
  {
    id: "card_weapon_tyrfing",
    name: "Tyrfing",
    type: "arma",
    rarity: "Leggendario",
    damage: "1d10+3 + 3d6 Necrotico",
    weight: 1.5,
    range: "Mischia (1.5m)",
    img: "assets/items/tyrfing.jpg",
    desc: "Una lama d'oro scintillante forgiata dai nani Dvalinn e Durinn. Non può essere sguainata senza uccidere un uomo e squarcia qualsiasi metallo come stoffa."
  },
  {
    id: "card_weapon_gramr",
    name: "Gramr",
    type: "arma",
    rarity: "Leggendario",
    damage: "2d6+3 + 3d6 Tagliente vs Draghi",
    weight: 2.0,
    range: "Mischia (Due Mani)",
    img: "assets/items/gramr.jpg",
    desc: "La leggendaria spada di Sigurðr estratta dall'albero Barnstokkr. Fende le scaglie di qualsiasi drago o verme primordiale dei Nove Mondi."
  },

  // --- SCUDI E ARMATURE ---
  {
    id: "card_shield_round",
    name: "Scudo Tondo Dipinto di Midgardr",
    type: "scudo",
    rarity: "Comune",
    damage: "+2 CA",
    weight: 3.0,
    range: "Personale",
    img: "assets/items/scudo_ombra_fronde.jpg",
    desc: "Scudo in assi di tiglio con umbone centrale di ferro battuto, dipinto con i colori e i simboli del Clan di appartenenza."
  },
  {
    id: "card_shield_skjaldborg",
    name: "Scudo del Muro di Scudi",
    type: "scudo",
    rarity: "Non Comune",
    damage: "+2 CA (+1 ai TS Destrezza)",
    weight: 4.0,
    range: "Personale",
    img: "assets/items/scudo_ombra_fronde.jpg",
    desc: "Scudo rinforzato con cerchiatura di cuoio grezzo. Quando sei affiancato da un alleato con scudo, entrambi ottenete copertura mezza (+2 CA e TS)."
  },
  {
    id: "card_shield_svalinn",
    name: "Svalinn",
    type: "scudo",
    rarity: "Leggendario",
    damage: "+3 CA (Immune a Fuoco/Freddo)",
    weight: 4.5,
    range: "Personale",
    img: "assets/items/svalinn.jpg",
    desc: "Lo scudo cosmico che si erge davanti al carro del Sole per impedire che le montagne e il mare brucino. Conferisce immunità a fuoco e gelo."
  },
  {
    id: "card_armor_chainmail",
    name: "Giaco di Maglia ad Anelli Ribattuti",
    type: "armatura",
    rarity: "Comune",
    damage: "CA 16 (Svantaggio Furtività)",
    weight: 18.0,
    range: "Personale",
    img: "assets/items/megingjord.jpg",
    desc: "Migliaia di anelli di ferro intrecciati a mano e ribattuti uno a uno, indossati sopra una tunica imbottita. La corazza tipica dei grandi Jarl e Huscarl."
  },
  {
    id: "card_armor_megingjord",
    name: "Megingjörð (La Cintura di Forza di Thor)",
    type: "armatura",
    rarity: "Leggendario",
    damage: "Forza fissata a 25",
    weight: 2.0,
    range: "Personale",
    img: "assets/items/megingjord.jpg",
    desc: "La cintura magica indossata dal dio del tuono. Quando allacciata alla vita, raddoppia la potenza muscolare del portatore portando la Forza a 25."
  },

  // --- RELIQUIE E OGGETTI MAGICI ---
  {
    id: "card_item_draupnir",
    name: "Draupnir",
    type: "oggetto",
    rarity: "Leggendario",
    damage: "Ricchezza Divina (8 anelli/9 notti)",
    weight: 0.1,
    range: "Personale",
    img: "assets/items/draupnir.jpg",
    desc: "L'anello d'oro forgiato per Odhinn dai nani. Ogni nove notti, da Draupnir stillano otto anelli d'oro identici di pari peso e valore."
  },
  {
    id: "card_item_brisingamen",
    name: "Brísingamen",
    type: "oggetto",
    rarity: "Leggendario",
    damage: "+3 a CAR / Fascino Sovrano",
    weight: 0.5,
    range: "Personale",
    img: "assets/items/brisingamen.jpg",
    desc: "Il gioiello più splendente dei Nove Mondi forgiato dai quattro nani Brísingar. Aumenta il Carisma del portatore e conferisce autorità regale inappellabile."
  },
  {
    id: "card_item_jarngreipr",
    name: "Járngreipr",
    type: "oggetto",
    rarity: "Molto Raro",
    damage: "Presa Invulnerabile",
    weight: 2.0,
    range: "Personale",
    img: "assets/items/jarngreipr.jpg",
    desc: "Guanti di ferro massiccio indispensabili per impugnare Mjöllnir senza farsi incenerire dal calore primordiale sprigionato dal maglio del tuono."
  }
];

// Funzione helper per ottenere tutte le carte disponibili (Canoniche + Custom Admin)
window.getAllCards = function() {
  const custom = (window.dbState && window.dbState.customCards) || [];
  return [...window.GLOBAL_CARDS_DATABASE, ...custom];
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
