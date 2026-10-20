// ============================================================================
// DUNGEON ALCHEMIST — 3D MAP MAKER (STILE DUNGEON ALCHEMIST)
// Generatore Automatico di Stanze & Case, Scale Multilivello, Arredi,
// Luci Dinamiche, Atmosfere Cinematiche & Telecamera Esploratore POV
// ============================================================================

window.Map3D = (function() {
  const GRID_SIZE = 1.5; // 1 casella = 1.5 metri (standard D&D 5e)

  let container = null;
  let scene = null;
  let camera = null;
  let renderer = null;
  let animationId = null;

  let currentCampCode = 'MIDGARD-VALHALLA';
  let userRole = 'DM'; // 'DM' o 'PLAYER'
  let currentUser = 'admin';

  // Stato Telecamera
  let cameraMode = 'tactical'; // 'tactical', 'isometric', 'pov'
  let cameraTarget = new THREE.Vector3(0, 0, 0);
  let cameraDistance = 16;
  let cameraYaw = Math.PI / 4;
  let cameraPitch = 0.85; // radianti

  // POV First-Person Camera State
  let povPos = new THREE.Vector3(0, 1.7, 0);
  let povYaw = 0;
  let povPitch = 0;

  const keysPressed = {};
  let isRightMouseDown = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  // Strumenti Dungeon Alchemist
  let activeTab = 'rooms'; // 'rooms', 'stairs', 'structures', 'furniture', 'lights', 'nature', 'terrain'
  let toolMode = 'build'; // 'build', 'delete', 'select', 'room_painter'
  let selectedAssetId = 'house_viking_cabin';
  let selectedRoomTheme = 'tavern'; // 'tavern', 'jarl_hall', 'forge', 'cabin', 'crypt', 'camp'
  let selectedRoomSize = 'medium'; // 'small' (4x4), 'medium' (6x6), 'large' (8x6)
  let currentElevation = 0; // 0m (Terra), 1.5m (Mezzanino), 3.0m (1° Piano), 4.5m (2° Piano)
  let assetRotationY = 0; // radianti (rotazione tasto R)

  // Atmosfera & Effetti
  let currentAtmosphere = 'giorno'; // 'giorno', 'notte_aurora', 'bufera', 'cripta'
  let dirLight = null;
  let hemiLight = null;
  let snowParticles = null;
  let dynamicPointLights = [];

  // Mappa Dati: Array di { id, x, y, z, type, rotY, elevation }
  let mapTiles = [];
  let renderedMeshes = []; // Meshes 3D piazzate nella scena

  // Miniature Eroi & Nemici
  let miniatureObjects = {}; // key: uKey -> { group, targetPos, currentPos, data }
  let selectedMiniatureId = null;

  // Cursore Magnetico & Ghost Preview
  let gridHelper = null;
  let cursorBox = null;
  let ghostGroup = null;
  let raycaster = new THREE.Raycaster();
  let mouseNorm = new THREE.Vector2(-999, -999);
  let snappedCoord = new THREE.Vector3(0, 0, 0);

  // Asset Categories Definitions
  const ASSET_CATALOG = {
    rooms: [
      { id: 'room_tavern', name: 'Taverna dell\'Idromele', icon: '🍺', theme: 'tavern', desc: 'Pavimento legno, camino, grande tavolo, panche, barili e torce' },
      { id: 'room_jarl', name: 'Sala del Trono del Jarl', icon: '👑', theme: 'jarl_hall', desc: 'Lastre pietra, colonne runiche, trono con pelli, bracieri e armi' },
      { id: 'room_forge', name: 'Fucina del Fabbro', icon: '⚔️', theme: 'forge', desc: 'Terra battuta, incudine, forgia fiammeggiante, rastrelliera e forziere' },
      { id: 'room_cabin', name: 'Capanna Vichinga', icon: '🏡', theme: 'cabin', desc: 'Mura tronchi, letto con pellicce di lupo, tavolo, panca e focolare' },
      { id: 'room_crypt', name: 'Cripta Runica Sotterranea', icon: '🔮', theme: 'crypt', desc: 'Pietra scura, 4 colonne runiche illuminate, forziere e altare sacrificale' },
      { id: 'room_camp', name: 'Accampamento Innevato', icon: '⛺', theme: 'camp', desc: 'Neve fresca, grande falò centrale, tronchi, pini innevati e scorte' }
    ],
    stairs: [
      { id: 'stairs_wood_straight', name: 'Scala Dritta in Legno', icon: '🪜', desc: '5 gradini in legno con corrimano (sale a +1.5m)' },
      { id: 'stairs_stone_straight', name: 'Gradinata in Pietra', icon: '🏛️', desc: 'Scala monumentale in blocchi di pietra (+1.5m)' },
      { id: 'stairs_spiral_wood', name: 'Scala a Chiocciola', icon: '🌀', desc: 'Scala a tronco centrale con gradini a raggiera (+3.0m)' },
      { id: 'stairs_ramp_rock', name: 'Rampa in Roccia', icon: '⛰️', desc: 'Rampa inclinata naturale per dislivelli' }
    ],
    structures: [
      { id: 'house_viking_cabin', name: 'Casa Vichinga (Capanna)', icon: '🛖', desc: 'Casa in tronchi con tetto in paglia e porta' },
      { id: 'house_longhouse', name: 'Grande Longhouse dei Clan', icon: '🏰', desc: 'Edificio maestoso 6x3m con draghi sul colmo' },
      { id: 'house_stone_hall', name: 'Sala Fortificata in Pietra', icon: '🏛️', desc: 'Edificio in pietra squadrata con comignolo' },
      { id: 'wall_wood_logs', name: 'Muro in Tronchi d\'Abete', icon: '🪵', desc: 'Pezzo di muro in tronchi orizzontali' },
      { id: 'wall_stone_blocks', name: 'Muro in Pietra a Conci', icon: '🧱', desc: 'Muro solido in pietra da fortezza' },
      { id: 'wall_window_stone', name: 'Muro Pietra con Finestra', icon: '🪟', desc: 'Parete con apertura ad arco' },
      { id: 'door_arch_open', name: 'Arco con Porta in Legno', icon: '🚪', desc: 'Porta massiccia con cardini in ferro' },
      { id: 'roof_thatch_module', name: 'Tetto Spiovente in Paglia', icon: '🌾', desc: 'Falda di copertura nordica' },
      { id: 'roof_slate_module', name: 'Tetto in Scandole Ardesia', icon: '🪨', desc: 'Tetto resistente in pietra' },
      { id: 'pillar_runic_column', name: 'Colonna Runica Scolpita', icon: '🏛️', desc: 'Pilastro con rune dorate/azzurre' },
      { id: 'fence_wood_stakes', name: 'Palizzata Difensiva a Pali', icon: '🛡️', desc: 'Recinzione a pali appuntiti' }
    ],
    furniture: [
      { id: 'table_banquet_long', name: 'Tavolo da Banchetto con Boccali', icon: '🥖', desc: 'Tavolo in rovere con ciotole e idromele' },
      { id: 'throne_jarl_epic', name: 'Trono del Jarl con Pelli', icon: '👑', desc: 'Trono intagliato con corna e pellicce' },
      { id: 'bench_wood_long', name: 'Panca Rustica in Legno', icon: '🪵', desc: 'Panca per tavoli da banchetto' },
      { id: 'bed_viking_fur', name: 'Letto Nordico con Pelli di Lupo', icon: '🛏️', desc: 'Letto in legno con spesse pellicce' },
      { id: 'bookshelf_tomes', name: 'Libreria con Tomi Runici', icon: '📚', desc: 'Scaffale con grimoire e pergamene' },
      { id: 'weapon_rack_arsenal', name: 'Rastrelliera con Asce e Spade', icon: '⚔️', desc: 'Supporto verticale per armi da guerra' },
      { id: 'barrels_cluster', name: 'Catasta di Barili d\'Idromele', icon: '🛢️', desc: 'Tre barili di rovere cerchiati' },
      { id: 'chest_reinforced', name: 'Forziere Rinforzato in Ferro', icon: '📦', desc: 'Baule per bottino con serratura' },
      { id: 'fireplace_hearth', name: 'Grande Camino in Pietra', icon: '🔥', desc: 'Focolare monumentale con fuoco vivo' },
      { id: 'forge_anvil', name: 'Incudine del Fabbro su Ceppo', icon: '🔨', desc: 'Incudine in ferro con carboni ardenti' },
      { id: 'rug_polar_bear', name: 'Tappeto in Pelle d\'Orso Polare', icon: '🐻', desc: 'Pelliccia stesa a terra con testa' },
      { id: 'cauldron_gothi', name: 'Calderone su Treppiede', icon: '🧙', desc: 'Calderone rituale fumante' }
    ],
    lights: [
      { id: 'light_torch', name: 'Torcia da Parete (Luce Calda)', icon: '🕯️', desc: 'Torcia in ferro con fiamma e PointLight' },
      { id: 'light_brazier', name: 'Braciere Ardente a Tripode', icon: '🔥', desc: 'Braciere in ferro battuto con fuoco vivo' },
      { id: 'light_chandelier', name: 'Candelabro a Ruota Sospeso', icon: '✨', desc: 'Ruota di carro con candele' },
      { id: 'light_mystic_rune', name: 'Cristallo Runico Fluttuante', icon: '💎', desc: 'Cristallo azzurro con luce eterea' }
    ],
    nature: [
      { id: 'nature_pine_large', name: 'Grande Pino Innevato', icon: '🌲', desc: 'Pino sempreverde a 3 strati con neve' },
      { id: 'nature_boulder_moss', name: 'Masso Granitico Muschioso', icon: '🪨', desc: 'Roccia montano ricoperta di muschio' },
      { id: 'nature_campfire_stone', name: 'Falò da Campo Cerchiato', icon: '🏕️', desc: 'Cerchio di sassi con ceppi ardenti' },
      { id: 'nature_logs_pile', name: 'Catasta di Legna da Ardere', icon: '🪵', desc: 'Ceppi di legna spaccata pronti al fuoco' }
    ],
    terrain: [
      { id: 'terrain_planks_tavern', name: 'Assi di Legno da Taverna', icon: '🪵', desc: 'Pavimento rustico in doghe' },
      { id: 'terrain_flagstone', name: 'Lastricato in Pietra Squadrata', icon: '🧱', desc: 'Pietra tagliata per fortezze' },
      { id: 'terrain_snow', name: 'Manto Nevoso Candido', icon: '❄️', desc: 'Neve profonda di Midgardr' },
      { id: 'terrain_mountain_rock', name: 'Roccia Viva di Montagna', icon: '⛰️', desc: 'Roccia grigia grezza' },
      { id: 'terrain_packed_dirt', name: 'Terra Battuta da Sentiero', icon: '🟤', desc: 'Terreno naturale compatto' },
      { id: 'terrain_runic_circle', name: 'Lastra con Runa Sacra', icon: 'ᛈ', desc: 'Cerchio magico intagliato' }
    ]
  };

  // ============================================================================
  // GENERATORE GEOMETRIE MODULARI RICCHE (STILE DUNGEON ALCHEMIST)
  // ============================================================================
  function createAssetMesh(type, rotY = 0) {
    const group = new THREE.Group();
    group.rotation.y = rotY;

    // Colori e Materiali PBR Norreni
    const woodDarkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85 });
    const woodPlankMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75 });
    const stoneWallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.90 });
    const stoneDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const ironBlackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, metalness: 0.8 });
    const goldBronzeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4, metalness: 0.6 });
    const thatchMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.95 });
    const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const fireMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xfbbf24, emissiveIntensity: 1.2, roughness: 0.2 });
    const runeGlowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 1.0, roughness: 0.3 });
    const bearFurMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.95 });

    switch (type) {
      // 1. SCALE DRITTA IN LEGNO A 5 GRADINI
      case 'stairs_wood_straight': {
        const stepCount = 5;
        const totalHeight = 1.5;
        const totalDepth = GRID_SIZE;
        const stepH = totalHeight / stepCount;
        const stepD = totalDepth / stepCount;

        for (let i = 0; i < stepCount; i++) {
          const stepGeo = new THREE.BoxGeometry(GRID_SIZE * 0.95, stepH, stepD);
          const stepMesh = new THREE.Mesh(stepGeo, woodPlankMat);
          stepMesh.position.set(0, (i + 0.5) * stepH, -totalDepth / 2 + (i + 0.5) * stepD);
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          group.add(stepMesh);
        }

        // Montanti laterali e corrimano
        const railGeo = new THREE.BoxGeometry(0.08, 0.1, totalDepth * 1.25);
        const leftRail = new THREE.Mesh(railGeo, woodDarkMat);
        leftRail.position.set(-GRID_SIZE * 0.46, totalHeight * 0.65, 0);
        leftRail.rotation.x = Math.atan2(totalHeight, totalDepth);
        group.add(leftRail);

        const rightRail = leftRail.clone();
        rightRail.position.x = GRID_SIZE * 0.46;
        group.add(rightRail);
        break;
      }

      // 2. GRADINATA MONUMENTALE IN PIETRA
      case 'stairs_stone_straight': {
        const stepCount = 5;
        const totalHeight = 1.5;
        const totalDepth = GRID_SIZE;
        const stepH = totalHeight / stepCount;
        const stepD = totalDepth / stepCount;

        for (let i = 0; i < stepCount; i++) {
          const stepGeo = new THREE.BoxGeometry(GRID_SIZE, stepH, totalDepth - i * stepD);
          const stepMesh = new THREE.Mesh(stepGeo, stoneWallMat);
          stepMesh.position.set(0, (i + 0.5) * stepH, -totalDepth / 2 + (i * 0.5 + 0.5) * stepD);
          stepMesh.castShadow = true;
          stepMesh.receiveShadow = true;
          group.add(stepMesh);
        }
        break;
      }

      // 3. SCALA A CHIOCCIOLA CON PALO CENTRALE
      case 'stairs_spiral_wood': {
        const centerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.0, 10), woodDarkMat);
        centerPole.position.y = 1.5;
        group.add(centerPole);

        const steps = 8;
        for (let i = 0; i < steps; i++) {
          const angle = (i / steps) * Math.PI * 1.8;
          const step = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.35), woodPlankMat);
          step.position.set(Math.cos(angle) * 0.45, (i + 0.5) * (3.0 / steps), Math.sin(angle) * 0.45);
          step.rotation.y = -angle;
          group.add(step);
        }
        break;
      }

      // 4. RAMPA IN ROCCIA
      case 'stairs_ramp_rock': {
        const rampGeo = new THREE.BoxGeometry(GRID_SIZE, 0.3, GRID_SIZE * 1.2);
        const ramp = new THREE.Mesh(rampGeo, stoneWallMat);
        ramp.position.set(0, 0.75, 0);
        ramp.rotation.x = 0.55;
        group.add(ramp);
        break;
      }

      // 5. CASA / CAPANNA VICHINGA COMPLETA
      case 'house_viking_cabin': {
        // Mura in tronchi
        const bodyGeo = new THREE.BoxGeometry(GRID_SIZE * 1.8, 1.8, GRID_SIZE * 1.8);
        const body = new THREE.Mesh(bodyGeo, woodDarkMat);
        body.position.y = 0.9;
        body.castShadow = true;
        group.add(body);

        // Tetto a due falde spiovente in paglia
        const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.4, 0.15, GRID_SIZE * 2.1), thatchMat);
        roofLeft.position.set(-GRID_SIZE * 0.55, 2.1, 0);
        roofLeft.rotation.z = 0.65;
        group.add(roofLeft);

        const roofRight = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.4, 0.15, GRID_SIZE * 2.1), thatchMat);
        roofRight.position.set(GRID_SIZE * 0.55, 2.1, 0);
        roofRight.rotation.z = -0.65;
        group.add(roofRight);

        // Porta in legno scuro
        const door = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.2, 0.1), woodPlankMat);
        door.position.set(0, 0.6, GRID_SIZE * 0.91);
        group.add(door);

        // Comignolo in pietra
        const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.2, 0.35), stoneWallMat);
        chimney.position.set(GRID_SIZE * 0.5, 2.2, -GRID_SIZE * 0.4);
        group.add(chimney);
        break;
      }

      // 6. GRANDE LONGHOUSE DEI CLAN (6x3m)
      case 'house_longhouse': {
        const hall = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 3.6, 2.0, GRID_SIZE * 1.8), woodDarkMat);
        hall.position.y = 1.0;
        group.add(hall);

        // Tetto a falde con colmo e teste di drago
        const roofL = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 3.9, 0.15, GRID_SIZE * 1.3), thatchMat);
        roofL.position.set(0, 2.3, -GRID_SIZE * 0.45);
        roofL.rotation.x = 0.65;
        group.add(roofL);

        const roofR = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 3.9, 0.15, GRID_SIZE * 1.3), thatchMat);
        roofR.position.set(0, 2.3, GRID_SIZE * 0.45);
        roofR.rotation.x = -0.65;
        group.add(roofR);

        // Teste di drago alle estremità del colmo
        const dragon1 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 4), goldBronzeMat);
        dragon1.position.set(-GRID_SIZE * 1.9, 2.8, 0);
        dragon1.rotation.z = -0.6;
        group.add(dragon1);

        const dragon2 = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.8, 4), goldBronzeMat);
        dragon2.position.set(GRID_SIZE * 1.9, 2.8, 0);
        dragon2.rotation.z = 0.6;
        group.add(dragon2);
        break;
      }

      // 7. CASA / SALA FORTIFICATA IN PIETRA
      case 'house_stone_hall': {
        const stoneHall = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 2.0, 2.2, GRID_SIZE * 2.0), stoneWallMat);
        stoneHall.position.y = 1.1;
        group.add(stoneHall);

        // Tetto in ardesia scura
        const stoneRoof = new THREE.Mesh(new THREE.ConeGeometry(GRID_SIZE * 1.6, 1.2, 4), stoneDarkMat);
        stoneRoof.position.y = 2.8;
        stoneRoof.rotation.y = Math.PI / 4;
        group.add(stoneRoof);
        break;
      }

      // 8. MURO IN TRONCHI
      case 'wall_wood_logs': {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 2.0, 0.35), woodDarkMat);
        wall.position.y = 1.0;
        wall.castShadow = true;
        group.add(wall);
        break;
      }

      // 9. MURO IN PIETRA A CONCI
      case 'wall_stone_blocks': {
        const stoneW = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 2.2, 0.4), stoneWallMat);
        stoneW.position.y = 1.1;
        stoneW.castShadow = true;
        group.add(stoneW);
        break;
      }

      // 10. MURO CON FINESTRA
      case 'wall_window_stone': {
        const leftP = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.3, 2.2, 0.4), stoneWallMat);
        leftP.position.set(-GRID_SIZE * 0.35, 1.1, 0);
        group.add(leftP);

        const rightP = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.3, 2.2, 0.4), stoneWallMat);
        rightP.position.set(GRID_SIZE * 0.35, 1.1, 0);
        group.add(rightP);

        const bottomP = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.4, 0.8, 0.4), stoneWallMat);
        bottomP.position.set(0, 0.4, 0);
        group.add(bottomP);

        const topP = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.4, 0.6, 0.4), stoneWallMat);
        topP.position.set(0, 1.9, 0);
        group.add(topP);
        break;
      }

      // 11. ARCO CON PORTA APERTA
      case 'door_arch_open': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 2.2, 0.35), stoneWallMat);
        frame.position.y = 1.1;
        group.add(frame);

        const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.08), woodPlankMat);
        doorLeaf.position.set(0.3, 0.85, 0.3);
        doorLeaf.rotation.y = 1.1; // Porta aperta
        group.add(doorLeaf);
        break;
      }

      // 12. COLONNA RUNICA
      case 'pillar_runic_column': {
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.3, 0.65), stoneDarkMat);
        plinth.position.y = 0.15;
        group.add(plinth);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.2, 12), stoneDarkMat);
        shaft.position.y = 1.35;
        group.add(shaft);

        const runeBand = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.5, 12), runeGlowMat);
        runeBand.position.y = 1.35;
        group.add(runeBand);

        const capital = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.25, 0.65), stoneDarkMat);
        capital.position.y = 2.45;
        group.add(capital);
        break;
      }

      // 13. TAVOLO DA BANCHETTO CON BOCCALI
      case 'table_banquet_long': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.5, 0.1, GRID_SIZE * 0.7), woodPlankMat);
        top.position.y = 0.75;
        group.add(top);

        const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.5), woodDarkMat);
        leg1.position.set(-GRID_SIZE * 0.55, 0.35, 0);
        group.add(leg1);

        const leg2 = leg1.clone();
        leg2.position.x = GRID_SIZE * 0.55;
        group.add(leg2);

        // 3 Boccali in peltro
        for (let i = -1; i <= 1; i++) {
          const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.18, 8), ironBlackMat);
          mug.position.set(i * 0.4, 0.88, (i % 2) * 0.1);
          group.add(mug);
        }
        break;
      }

      // 14. TRONO DEL JARL EPICO
      case 'throne_jarl_epic': {
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), woodDarkMat);
        seat.position.y = 0.35;
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.15), woodDarkMat);
        back.position.set(0, 1.1, -0.35);
        group.add(back);

        const fur = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.1, 0.75), bearFurMat);
        fur.position.set(0, 0.62, 0);
        group.add(fur);

        // Corna decorative
        const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 6), goldBronzeMat);
        hornL.position.set(-0.45, 1.8, -0.35);
        hornL.rotation.z = -0.5;
        group.add(hornL);

        const hornR = hornL.clone();
        hornR.position.x = 0.45;
        hornR.rotation.z = 0.5;
        group.add(hornR);
        break;
      }

      // 15. PANCA IN LEGNO
      case 'bench_wood_long': {
        const top = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.4, 0.08, 0.35), woodPlankMat);
        top.position.y = 0.45;
        group.add(top);

        const legL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.42, 0.28), woodDarkMat);
        legL.position.set(-GRID_SIZE * 0.55, 0.22, 0);
        group.add(legL);

        const legR = legL.clone();
        legR.position.x = GRID_SIZE * 0.55;
        group.add(legR);
        break;
      }

      // 16. LETTO VICHINGO CON PELLI
      case 'bed_viking_fur': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.2, 0.35, GRID_SIZE * 0.8), woodDarkMat);
        frame.position.y = 0.2;
        group.add(frame);

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.1, 0.2, GRID_SIZE * 0.75), bearFurMat);
        mattress.position.set(0, 0.4, 0);
        group.add(mattress);

        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.65), woodPlankMat);
        pillow.position.set(-GRID_SIZE * 0.4, 0.52, 0);
        group.add(pillow);
        break;
      }

      // 17. LIBRERIA CON TOMI
      case 'bookshelf_tomes': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.9, 1.8, 0.45), woodDarkMat);
        frame.position.y = 0.9;
        group.add(frame);

        for (let y of [0.4, 0.9, 1.4]) {
          const bookRow = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.75, 0.25, 0.35), goldBronzeMat);
          bookRow.position.set(0, y, 0.05);
          group.add(bookRow);
        }
        break;
      }

      // 18. RASTRELLIERA PER ARMI
      case 'weapon_rack_arsenal': {
        const rackFrame = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 0.8, 1.4, 0.35), woodDarkMat);
        rackFrame.position.y = 0.7;
        group.add(rackFrame);

        // Asce e spade appese
        const axe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 6), ironBlackMat);
        axe.position.set(-0.25, 0.75, 0.1);
        group.add(axe);

        const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 12), goldBronzeMat);
        shield.position.set(0.15, 0.75, 0.15);
        shield.rotation.x = Math.PI / 2;
        group.add(shield);
        break;
      }

      // 19. CATASTA DI BARILI
      case 'barrels_cluster': {
        const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.75, 10), woodPlankMat);
        b1.position.set(-0.3, 0.38, -0.2);
        group.add(b1);

        const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.75, 10), woodPlankMat);
        b2.position.set(0.3, 0.38, -0.1);
        group.add(b2);

        const b3 = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.7, 10), woodDarkMat);
        b3.position.set(0, 0.35, 0.3);
        group.add(b3);
        break;
      }

      // 20. FORZIERE RINFORZATO
      case 'chest_reinforced': {
        const chest = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.55, 0.55), woodDarkMat);
        chest.position.y = 0.28;
        group.add(chest);

        const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.85, 8, 1, false, 0, Math.PI), ironBlackMat);
        lid.position.set(0, 0.55, 0);
        lid.rotation.z = Math.PI / 2;
        group.add(lid);
        break;
      }

      // 21. GRANDE CAMINO IN PIETRA CON FUOCO
      case 'fireplace_hearth': {
        const fireplace = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE * 1.1, 1.8, 0.7), stoneWallMat);
        fireplace.position.y = 0.9;
        group.add(fireplace);

        const hearthCavity = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.7, 0.5), stoneDarkMat);
        hearthCavity.position.set(0, 0.45, 0.15);
        group.add(hearthCavity);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.45, 6), fireMat);
        flame.position.set(0, 0.35, 0.18);
        group.add(flame);
        break;
      }

      // 22. INCUDINE DEL FABBRO
      case 'forge_anvil': {
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.6, 8), woodDarkMat);
        stump.position.y = 0.3;
        group.add(stump);

        const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.25, 0.25), ironBlackMat);
        anvil.position.y = 0.7;
        group.add(anvil);

        const horn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 6), ironBlackMat);
        horn.position.set(0.35, 0.7, 0);
        horn.rotation.z = -Math.PI / 2;
        group.add(horn);
        break;
      }

      // 23. TAPPETO IN PELLE D'ORSO
      case 'rug_polar_bear': {
        const skin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.04, 1.2), bearFurMat);
        skin.position.y = 0.02;
        group.add(skin);

        const head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.35), bearFurMat);
        head.position.set(0.9, 0.08, 0);
        group.add(head);
        break;
      }

      // 24. CALDERONE SU TREPPIEDE
      case 'cauldron_gothi': {
        const pot = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 8), ironBlackMat);
        pot.position.y = 0.5;
        group.add(pot);

        const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 10), runeGlowMat);
        liquid.position.y = 0.75;
        group.add(liquid);
        break;
      }

      // 25. TORCIA DA MURO (CON LUCE)
      case 'light_torch': {
        const sconce = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4, 6), ironBlackMat);
        sconce.position.set(0, 0.8, 0);
        group.add(sconce);

        const torchHead = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 6), fireMat);
        torchHead.position.set(0, 1.05, 0);
        group.add(torchHead);
        break;
      }

      // 26. BRACIERE ARDENTE A TRIPODE
      case 'light_brazier': {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.25, 0.3, 10), ironBlackMat);
        bowl.position.y = 0.65;
        group.add(bowl);

        const fire = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 7), fireMat);
        fire.position.y = 1.0;
        group.add(fire);
        break;
      }

      // 27. CRISTALLO RUNICO FLUTTUANTE
      case 'light_mystic_rune': {
        const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.35, 0), runeGlowMat);
        crystal.position.y = 1.2;
        group.add(crystal);
        break;
      }

      // 28. GRANDE PINO INNEVATO
      case 'nature_pine_large': {
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 1.2, 8), woodDarkMat);
        trunk.position.y = 0.6;
        group.add(trunk);

        const tier1 = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.4, 7), new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.9 }));
        tier1.position.y = 1.5;
        group.add(tier1);

        const tier2 = new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.2, 7), new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.9 }));
        tier2.position.y = 2.3;
        group.add(tier2);

        const snowTop = new THREE.Mesh(new THREE.ConeGeometry(0.6, 0.9, 7), snowMat);
        snowTop.position.y = 3.0;
        group.add(snowTop);
        break;
      }

      // 29. MASSO GRANITICO MUSCHIOSO
      case 'nature_boulder_moss': {
        const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.8, 1), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }));
        boulder.position.y = 0.6;
        boulder.scale.set(1.2, 0.8, 1.0);
        group.add(boulder);
        break;
      }

      // 30. FALÒ DA CAMPO CON PIETRE
      case 'nature_campfire_stone': {
        const stones = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 6, 12), stoneWallMat);
        stones.rotation.x = Math.PI / 2;
        stones.position.y = 0.1;
        group.add(stones);

        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 7), fireMat);
        flame.position.y = 0.45;
        group.add(flame);
        break;
      }

      // TERRENI (1.5m x 1.5m)
      case 'terrain_planks_tavern': {
        const t = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.2, GRID_SIZE), woodPlankMat);
        t.position.y = -0.1;
        group.add(t);
        break;
      }
      case 'terrain_flagstone': {
        const t = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.2, GRID_SIZE), stoneWallMat);
        t.position.y = -0.1;
        group.add(t);
        break;
      }
      case 'terrain_snow': {
        const t = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.2, GRID_SIZE), snowMat);
        t.position.y = -0.1;
        group.add(t);
        break;
      }
      case 'terrain_mountain_rock': {
        const t = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.2, GRID_SIZE), stoneDarkMat);
        t.position.y = -0.1;
        group.add(t);
        break;
      }
      case 'terrain_packed_dirt': {
        const t = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.2, GRID_SIZE), new THREE.MeshStandardMaterial({ color: 0x582f0e, roughness: 0.95 }));
        t.position.y = -0.1;
        group.add(t);
        break;
      }
      case 'terrain_runic_circle': {
        const slab = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.2, 16), stoneDarkMat);
        slab.position.y = -0.1;
        group.add(slab);

        const rune = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.5, 16), runeGlowMat);
        rune.rotation.x = -Math.PI / 2;
        rune.position.y = 0.01;
        group.add(rune);
        break;
      }

      default: {
        const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), stoneWallMat);
        box.position.y = 0.5;
        group.add(box);
        break;
      }
    }

    return group;
  }

  // ============================================================================
  // DUNGEON ALCHEMIST PROCEDURAL ROOM PAINTER (IL MARCHIO DI FABBRICA)
  // ============================================================================
  function generateProceduralRoom(originX, originZ, theme, sizeType) {
    let w = 4;
    let h = 4;
    if (sizeType === 'medium') { w = 6; h = 6; }
    if (sizeType === 'large') { w = 8; h = 6; }

    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);

    const newTiles = [];

    // Helper per aggiungere tile
    function addTile(relX, relZ, type, rotY = 0, elev = currentElevation) {
      const realX = originX + relX * GRID_SIZE;
      const realZ = originZ + relZ * GRID_SIZE;
      // Rimuovi preesistente
      mapTiles = mapTiles.filter(t => !(Math.abs(t.x - realX) < 0.1 && Math.abs(t.z - realZ) < 0.1 && Math.abs(t.y - elev) < 0.1));
      mapTiles.push({
        id: 'tile_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
        x: realX,
        y: elev,
        z: realZ,
        type: type,
        rotY: rotY
      });
    }

    // 1. Pavimentazione completa della stanza
    const floorType = (theme === 'tavern' || theme === 'cabin') ? 'terrain_planks_tavern' :
                      (theme === 'camp') ? 'terrain_snow' :
                      (theme === 'forge') ? 'terrain_packed_dirt' : 'terrain_flagstone';

    for (let x = -halfW; x <= halfW; x++) {
      for (let z = -halfH; z <= halfH; z++) {
        addTile(x, z, floorType, 0, currentElevation);
      }
    }

    // 2. Mura Perimetrali e Porte
    const wallType = (theme === 'tavern' || theme === 'cabin') ? 'wall_wood_logs' : 'wall_stone_blocks';

    for (let x = -halfW; x <= halfW; x++) {
      // Parete Nord (con camino o altare)
      addTile(x, -halfH, wallType, 0);
      // Parete Sud (con porta d'ingresso)
      if (x === 0) {
        addTile(x, halfH, 'door_arch_open', 0);
      } else {
        addTile(x, halfH, wallType, 0);
      }
    }

    for (let z = -halfH + 1; z < halfH; z++) {
      // Parete Ovest ed Est (con eventuali finestre)
      if (z === 0) {
        addTile(-halfW, z, 'wall_window_stone', Math.PI / 2);
        addTile(halfW, z, 'wall_window_stone', Math.PI / 2);
      } else {
        addTile(-halfW, z, wallType, Math.PI / 2);
        addTile(halfW, z, wallType, Math.PI / 2);
      }
    }

    // 3. Arredamento a Tema Automatico (Dungeon Alchemist Populator)
    if (theme === 'tavern') {
      // Tavolo centrale lungo con panche
      addTile(0, 0, 'table_banquet_long', 0);
      addTile(0, -0.6, 'bench_wood_long', 0);
      addTile(0, 0.6, 'bench_wood_long', 0);
      // Camino a nord
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      // Barili d'idromele in un angolo
      addTile(-halfW + 1, -halfH + 1, 'barrels_cluster', 0);
      // Tappeto d'orso all'entrata
      addTile(0, halfH - 1.2, 'rug_polar_bear', 0);
      // Torce accese alle pareti
      addTile(-halfW + 0.3, 0, 'light_torch', Math.PI / 2);
      addTile(halfW - 0.3, 0, 'light_torch', -Math.PI / 2);
      // Scala di legno che porta al piano superiore (primo piano!)
      addTile(halfW - 1, -halfH + 1, 'stairs_wood_straight', 0);
    }
    else if (theme === 'jarl_hall') {
      // Trono monumentale del Jarl a capotavola nord
      addTile(0, -halfH + 1, 'throne_jarl_epic', 0);
      addTile(0, -halfH + 1.8, 'rug_polar_bear', 0);
      // Colonne runiche lungo la navata
      addTile(-halfW + 1, -1, 'pillar_runic_column', 0);
      addTile(halfW - 1, -1, 'pillar_runic_column', 0);
      addTile(-halfW + 1, 1, 'pillar_runic_column', 0);
      addTile(halfW - 1, 1, 'pillar_runic_column', 0);
      // Bracieri ardenti
      addTile(-1.2, -halfH + 1, 'light_brazier', 0);
      addTile(1.2, -halfH + 1, 'light_brazier', 0);
      // Rastrelliere per armi
      addTile(-halfW + 1, 0, 'weapon_rack_arsenal', Math.PI / 2);
      addTile(halfW - 1, 0, 'weapon_rack_arsenal', -Math.PI / 2);
    }
    else if (theme === 'forge') {
      // Incudine centrale su ceppo
      addTile(0, 0, 'forge_anvil', 0);
      // Camino/fucina ardente a nord
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      // Rastrelliera armi e forziere
      addTile(-halfW + 1, 0, 'weapon_rack_arsenal', Math.PI / 2);
      addTile(halfW - 1, -halfH + 1, 'chest_reinforced', 0);
      // Barili d'acqua per temprare
      addTile(-halfW + 1, -halfH + 1, 'barrels_cluster', 0);
      addTile(0, 1.2, 'light_brazier', 0);
    }
    else if (theme === 'cabin') {
      // Letto con pelli di lupo nell'angolo
      addTile(-halfW + 1, -halfH + 1, 'bed_viking_fur', 0);
      // Panca e forziere
      addTile(halfW - 1, -halfH + 1, 'chest_reinforced', 0);
      addTile(halfW - 1, 0, 'bench_wood_long', Math.PI / 2);
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      addTile(0, 0, 'rug_polar_bear', 0);
      addTile(-halfW + 0.3, 0, 'light_torch', Math.PI / 2);
    }
    else if (theme === 'crypt') {
      // 4 Colonne runiche luminose
      addTile(-halfW + 1, -halfH + 1, 'pillar_runic_column', 0);
      addTile(halfW - 1, -halfH + 1, 'pillar_runic_column', 0);
      addTile(-halfW + 1, halfH - 1, 'pillar_runic_column', 0);
      addTile(halfW - 1, halfH - 1, 'pillar_runic_column', 0);
      // Calderone rituale e forziere antico
      addTile(0, 0, 'cauldron_gothi', 0);
      addTile(0, -halfH + 1, 'chest_reinforced', 0);
      addTile(-halfW + 1, 0, 'light_mystic_rune', 0);
      addTile(halfW - 1, 0, 'light_mystic_rune', 0);
      // Scala in pietra per salire in superficie
      addTile(0, halfH - 1, 'stairs_stone_straight', Math.PI);
    }
    else if (theme === 'camp') {
      // Falò da campo cerchiato da pietre al centro
      addTile(0, 0, 'nature_campfire_stone', 0);
      // Ceppi per sedersi attorno al fuoco
      addTile(0, -1, 'bench_wood_long', 0);
      addTile(0, 1, 'bench_wood_long', 0);
      addTile(-1, 0, 'nature_logs_pile', Math.PI / 2);
      // Pini innevati sul perimetro dell'accampamento
      addTile(-halfW, -halfH, 'nature_pine_large', 0);
      addTile(halfW, -halfH, 'nature_pine_large', 0);
      addTile(-halfW, halfH, 'nature_pine_large', 0);
      addTile(halfW, halfH, 'nature_pine_large', 0);
      addTile(halfW - 1, 0, 'barrels_cluster', 0);
    }

    rebuildSceneMeshes();
    saveMapToCampaign();

    if (typeof window.showToast === 'function') {
      window.showToast("Stanza Generata!", `[${theme.toUpperCase()}] generata e arredata automaticamente in stile Dungeon Alchemist.`, "success");
    }
  }

  // ============================================================================
  // COSTRUZIONE SCENA 3D & MESHES REBUILD
  // ============================================================================
  function rebuildSceneMeshes() {
    // Rimuovi vecchie mesh e luci
    renderedMeshes.forEach(m => scene.remove(m));
    renderedMeshes = [];

    dynamicPointLights.forEach(l => scene.remove(l));
    dynamicPointLights = [];

    mapTiles.forEach(tile => {
      const mesh = createAssetMesh(tile.type, tile.rotY || 0);
      mesh.position.set(tile.x, tile.y || 0, tile.z);
      mesh.userData = { tileId: tile.id, tileData: tile };
      scene.add(mesh);
      renderedMeshes.push(mesh);

      // Aggiungi luci dinamiche calde per torce, bracieri e camini
      if (tile.type === 'light_torch' || tile.type === 'fireplace_hearth') {
        const pLight = new THREE.PointLight(0xf59e0b, 1.2, 8.5);
        pLight.position.set(tile.x, (tile.y || 0) + 1.2, tile.z);
        scene.add(pLight);
        dynamicPointLights.push(pLight);
      } else if (tile.type === 'light_brazier' || tile.type === 'nature_campfire_stone') {
        const pLight = new THREE.PointLight(0xf97316, 1.6, 11.0);
        pLight.position.set(tile.x, (tile.y || 0) + 1.1, tile.z);
        scene.add(pLight);
        dynamicPointLights.push(pLight);
      } else if (tile.type === 'light_mystic_rune' || tile.type === 'cauldron_gothi') {
        const pLight = new THREE.PointLight(0x38bdf8, 1.5, 9.0);
        pLight.position.set(tile.x, (tile.y || 0) + 1.3, tile.z);
        scene.add(pLight);
        dynamicPointLights.push(pLight);
      }
    });
  }

  // Mappa di Default Iniziale: Taverna Vichinga Arredata con Scale per il 1° Piano
  function createDefaultDungeonMap() {
    mapTiles = [];
    generateProceduralRoom(0, 0, 'tavern', 'medium');
    return mapTiles;
  }

  // ============================================================================
  // ATMOSFERA CINEMATICA (GIORNO, NOTTE AURORA, BUFERA, CRIPTA)
  // ============================================================================
  function setAtmosphere(mode) {
    currentAtmosphere = mode;

    if (!scene) return;

    if (mode === 'giorno') {
      scene.background = new THREE.Color(0x0a111e);
      scene.fog = new THREE.FogExp2(0x0a111e, 0.012);
      if (hemiLight) hemiLight.color.setHex(0xe0f2fe);
      if (hemiLight) hemiLight.groundColor.setHex(0x1e293b);
      if (dirLight) {
        dirLight.color.setHex(0xffedd5);
        dirLight.intensity = 1.3;
        dirLight.position.set(15, 25, 15);
      }
      if (snowParticles) snowParticles.visible = false;
    }
    else if (mode === 'notte_aurora') {
      scene.background = new THREE.Color(0x030712);
      scene.fog = new THREE.FogExp2(0x030712, 0.018);
      if (hemiLight) hemiLight.color.setHex(0x065f46); // Bagliore verde aurora
      if (hemiLight) hemiLight.groundColor.setHex(0x022c22);
      if (dirLight) {
        dirLight.color.setHex(0x38bdf8); // Luce lunare fredda
        dirLight.intensity = 0.6;
        dirLight.position.set(-15, 20, -10);
      }
      if (snowParticles) snowParticles.visible = false;
    }
    else if (mode === 'bufera') {
      scene.background = new THREE.Color(0x1e293b);
      scene.fog = new THREE.FogExp2(0x1e293b, 0.035);
      if (hemiLight) hemiLight.color.setHex(0x94a3b8);
      if (dirLight) {
        dirLight.color.setHex(0xcfd8dc);
        dirLight.intensity = 0.8;
      }
      if (snowParticles) snowParticles.visible = true;
    }
    else if (mode === 'cripta') {
      scene.background = new THREE.Color(0x020408);
      scene.fog = new THREE.FogExp2(0x020408, 0.045);
      if (hemiLight) hemiLight.color.setHex(0x0f172a);
      if (hemiLight) hemiLight.intensity = 0.2;
      if (dirLight) {
        dirLight.intensity = 0.1;
      }
      if (snowParticles) snowParticles.visible = false;
    }

    renderAtmosphereButtons();
  }

  function initSnowParticles() {
    const pCount = 800;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 20;
      positions[i + 2] = (Math.random() - 0.5) * 40;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });

    snowParticles = new THREE.Points(pGeo, pMat);
    snowParticles.visible = false;
    scene.add(snowParticles);
  }

  function updateSnowParticles() {
    if (!snowParticles || !snowParticles.visible) return;
    const pos = snowParticles.geometry.attributes.position.array;
    for (let i = 1; i < pos.length; i += 3) {
      pos[i] -= 0.1;
      if (pos[i] < 0) pos[i] = 18;
    }
    snowParticles.geometry.attributes.position.needsUpdate = true;
  }

  // ============================================================================
  // CONTROLLI TELECAMERA WASD & POV FIRST-PERSON
  // ============================================================================
  function updateCamera(delta) {
    if (cameraMode === 'pov') {
      // Telecamera in prima persona (First Person)
      const moveSpeed = 6.0 * delta;
      const forward = new THREE.Vector3(-Math.sin(povYaw), 0, -Math.cos(povYaw));
      const right = new THREE.Vector3(Math.cos(povYaw), 0, -Math.sin(povYaw));

      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) povPos.addScaledVector(forward, moveSpeed);
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) povPos.addScaledVector(forward, -moveSpeed);
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) povPos.addScaledVector(right, -moveSpeed);
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) povPos.addScaledVector(right, moveSpeed);

      camera.position.copy(povPos);
      const lookTarget = new THREE.Vector3(
        povPos.x - Math.sin(povYaw) * Math.cos(povPitch),
        povPos.y + Math.sin(povPitch),
        povPos.z - Math.cos(povYaw) * Math.cos(povPitch)
      );
      camera.lookAt(lookTarget);
    } else {
      // Telecamera Tattica / Isometrica TaleSpire & Dungeon Alchemist
      const panSpeed = (cameraDistance * 0.75) * delta;
      const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
      const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

      if (keysPressed['KeyW'] || keysPressed['ArrowUp']) cameraTarget.addScaledVector(forward, panSpeed);
      if (keysPressed['KeyS'] || keysPressed['ArrowDown']) cameraTarget.addScaledVector(forward, -panSpeed);
      if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) cameraTarget.addScaledVector(right, -panSpeed);
      if (keysPressed['KeyD'] || keysPressed['ArrowRight']) cameraTarget.addScaledVector(right, panSpeed);

      // Rotazione rapida Q / E
      if (keysPressed['KeyQ']) cameraYaw -= 1.8 * delta;
      if (keysPressed['KeyE']) cameraYaw += 1.8 * delta;

      const currentPitch = (cameraMode === 'tactical') ? 1.45 : cameraPitch;

      const x = cameraTarget.x + cameraDistance * Math.sin(cameraYaw) * Math.sin(currentPitch);
      const y = cameraTarget.y + cameraDistance * Math.cos(currentPitch);
      const z = cameraTarget.z + cameraDistance * Math.cos(cameraYaw) * Math.sin(currentPitch);

      camera.position.set(x, y, z);
      camera.lookAt(cameraTarget);
    }
  }

  // ============================================================================
  // RAYCASTING & ANTEPRIMA GHOST SULLA GRIGLIA
  // ============================================================================
  function updateRaycasting() {
    if (!renderer || !camera) return;

    raycaster.setFromCamera(mouseNorm, camera);

    // Piano di intersezione all'altezza corrente currentElevation
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -currentElevation);
    const intersectPt = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
      const snapX = Math.round(intersectPt.x / GRID_SIZE) * GRID_SIZE;
      const snapZ = Math.round(intersectPt.z / GRID_SIZE) * GRID_SIZE;
      snappedCoord.set(snapX, currentElevation, snapZ);

      if (cursorBox) {
        cursorBox.position.set(snapX, currentElevation + 0.05, snapZ);
        cursorBox.visible = (toolMode !== 'delete');
      }

      if (ghostGroup && toolMode === 'build' && userRole === 'DM') {
        ghostGroup.position.set(snapX, currentElevation, snapZ);
        ghostGroup.rotation.y = assetRotationY;
        ghostGroup.visible = true;
      } else if (ghostGroup) {
        ghostGroup.visible = false;
      }
    } else {
      if (cursorBox) cursorBox.visible = false;
      if (ghostGroup) ghostGroup.visible = false;
    }
  }

  function updateGhostPreview() {
    if (!ghostGroup) return;
    while (ghostGroup.children.length > 0) {
      ghostGroup.remove(ghostGroup.children[0]);
    }

    const previewMesh = createAssetMesh(selectedAssetId, 0);
    // Rendi semi-trasparente
    previewMesh.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.transparent = true;
        child.material.opacity = 0.55;
      }
    });

    ghostGroup.add(previewMesh);
  }

  // ============================================================================
  // GESTIONE CLICK E AZIONI
  // ============================================================================
  function handlePointerDown(e) {
    if (e.button === 2) {
      isRightMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      return;
    }

    if (e.button === 0) {
      if (toolMode === 'room_painter' && userRole === 'DM') {
        // Genera stanza procedurale alle coordinate cliccate
        generateProceduralRoom(snappedCoord.x, snappedCoord.z, selectedRoomTheme, selectedRoomSize);
      }
      else if (toolMode === 'build' && userRole === 'DM') {
        // Piazza asset singolo
        placeAssetAt(snappedCoord.x, snappedCoord.y, snappedCoord.z, selectedAssetId, assetRotationY);
      }
      else if (toolMode === 'delete' && userRole === 'DM') {
        // Rimuovi asset alla coordinata
        removeAssetAt(snappedCoord.x, snappedCoord.y, snappedCoord.z);
      }
      else {
        // Selezione o Movimento Miniature
        raycaster.setFromCamera(mouseNorm, camera);
        const allMiniGroups = Object.values(miniatureObjects).map(m => m.group);
        const intersects = raycaster.intersectObjects(allMiniGroups, true);

        if (intersects.length > 0) {
          let topGroup = intersects[0].object;
          while (topGroup.parent && !topGroup.userData.uKey) {
            topGroup = topGroup.parent;
          }
          if (topGroup.userData && topGroup.userData.uKey) {
            selectedMiniatureId = topGroup.userData.uKey;
            syncCampaignMiniatures();
            const chName = topGroup.userData.charData?.name || selectedMiniatureId;
            if (typeof window.showToast === 'function') {
              window.showToast("Miniatura Selezionata", `[${chName}] selezionato. Clicca sulla griglia per spostarlo!`, "info");
            }
            return;
          }
        }

        if (selectedMiniatureId) {
          moveSelectedMiniatureTo(snappedCoord.x, snappedCoord.y, snappedCoord.z);
        }
      }
    }
  }

  function placeAssetAt(x, y, z, type, rotY) {
    // Rimuovi eventuale tile preesistente
    mapTiles = mapTiles.filter(t => !(Math.abs(t.x - x) < 0.1 && Math.abs(t.z - z) < 0.1 && Math.abs(t.y - y) < 0.1));
    mapTiles.push({
      id: 'tile_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
      x: x,
      y: y,
      z: z,
      type: type,
      rotY: rotY
    });
    rebuildSceneMeshes();
    saveMapToCampaign();
  }

  function removeAssetAt(x, y, z) {
    const beforeLen = mapTiles.length;
    mapTiles = mapTiles.filter(t => !(Math.abs(t.x - x) < 0.1 && Math.abs(t.z - z) < 0.1 && Math.abs(t.y - y) < 0.1));
    if (mapTiles.length !== beforeLen) {
      rebuildSceneMeshes();
      saveMapToCampaign();
    }
  }

  function moveSelectedMiniatureTo(targetX, targetY, targetZ) {
    if (!selectedMiniatureId) return;
    const mini = miniatureObjects[selectedMiniatureId];
    if (!mini) return;

    if (userRole !== 'DM' && selectedMiniatureId !== currentUser) {
      if (typeof window.showToast === 'function') {
        window.showToast("Movimento Negato", "Puoi muovere solo la miniatura del tuo eroe.", "warning");
      }
      return;
    }

    mini.targetPos.set(targetX, targetY + 0.25, targetZ);

    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (camp && camp.members && camp.members[selectedMiniatureId]) {
      camp.members[selectedMiniatureId].posX = targetX;
      camp.members[selectedMiniatureId].posY = targetY + 0.25;
      camp.members[selectedMiniatureId].posZ = targetZ;

      if (typeof window.saveDB === 'function') window.saveDB();
    }
  }

  function saveMapToCampaign() {
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (camp) {
      camp.tacticalMap3D = mapTiles;
      if (typeof window.saveDB === 'function') window.saveDB();
    }
  }

  // ============================================================================
  // MINIATURE EROI & NEMICI REAL-TIME
  // ============================================================================
  function syncCampaignMiniatures() {
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (!camp || !camp.members) return;

    const currentMemberKeys = Object.keys(camp.members);

    Object.keys(miniatureObjects).forEach(uKey => {
      if (!camp.members[uKey]) {
        scene.remove(miniatureObjects[uKey].group);
        delete miniatureObjects[uKey];
      }
    });

    currentMemberKeys.forEach((uKey, idx) => {
      const mChar = camp.members[uKey];
      if (!mChar) return;

      const posX = mChar.posX !== undefined ? mChar.posX : (idx - 1) * GRID_SIZE;
      const posY = mChar.posY !== undefined ? mChar.posY : 0.25;
      const posZ = mChar.posZ !== undefined ? mChar.posZ : 2 * GRID_SIZE;

      let miniEntry = miniatureObjects[uKey];

      if (!miniEntry) {
        const group = new THREE.Group();

        if (mChar.miniature3D && window.Forge3D && typeof window.Forge3D.buildProceduralMiniature === 'function') {
          const procMini = window.Forge3D.buildProceduralMiniature(mChar.miniature3D);
          group.add(procMini);
        } else {
          // Basetta runica standard con figura scolpita
          const baseMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.48, 0.52, 0.12, 16),
            new THREE.MeshStandardMaterial({
              color: mChar.isEnemy ? 0x991b1b : 0x0369a1,
              roughness: 0.4,
              metalness: 0.6
            })
          );
          baseMesh.position.y = 0.06;
          group.add(baseMesh);

          const figMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.35, 1.2, 10),
            new THREE.MeshStandardMaterial({
              color: mChar.isEnemy ? 0x7f1d1d : 0x0284c7,
              roughness: 0.5
            })
          );
          figMesh.position.y = 0.72;
          group.add(figMesh);
        }

        group.userData = { uKey: uKey, charData: mChar };
        scene.add(group);

        miniEntry = {
          group: group,
          targetPos: new THREE.Vector3(posX, posY, posZ),
          currentPos: new THREE.Vector3(posX, posY, posZ),
          data: mChar
        };
        group.position.copy(miniEntry.currentPos);
        miniatureObjects[uKey] = miniEntry;
      } else {
        miniEntry.targetPos.set(posX, posY, posZ);
        miniEntry.data = mChar;
      }
    });
  }

  // ============================================================================
  // INIZIALIZZAZIONE DELLA SCENA 3D DUNGEON ALCHEMIST
  // ============================================================================
  function initDungeonEngine(viewportEl) {
    container = viewportEl;
    container.innerHTML = '';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 56);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a111e);
    scene.fog = new THREE.FogExp2(0x0a111e, 0.012);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 14, 12);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // Luci Scena
    hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 0.9);
    scene.add(hemiLight);

    dirLight = new THREE.DirectionalLight(0xffedd5, 1.3);
    dirLight.position.set(15, 25, 15);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 70;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0003;
    scene.add(dirLight);

    // Griglia Magnetica D&D (1.5m)
    gridHelper = new THREE.GridHelper(48 * GRID_SIZE, 48, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Cursore Magnetico
    const boxGeo = new THREE.BoxGeometry(GRID_SIZE, 0.05, GRID_SIZE);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    cursorBox = new THREE.Mesh(boxGeo, boxMat);
    scene.add(cursorBox);

    // Ghost Preview Group
    ghostGroup = new THREE.Group();
    scene.add(ghostGroup);
    updateGhostPreview();

    // Inizializza Sistema Particellare di Neve
    initSnowParticles();

    // Carica Mappa Esistente o Genera Taverna di Default
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (camp && camp.tacticalMap3D && Array.isArray(camp.tacticalMap3D) && camp.tacticalMap3D.length > 0) {
      mapTiles = JSON.parse(JSON.stringify(camp.tacticalMap3D));
    } else {
      mapTiles = createDefaultDungeonMap();
    }
    rebuildSceneMeshes();
    syncCampaignMiniatures();

    // Event Listeners
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', onMouseMove);
    window.addEventListener('pointerup', () => { isRightMouseDown = false; });
    container.addEventListener('wheel', onMouseWheel, { passive: false });
    container.addEventListener('contextmenu', e => e.preventDefault());

    // Loop a 60 FPS
    let clock = new THREE.Clock();
    function renderLoop() {
      animationId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();

      updateCamera(delta);
      updateRaycasting();
      updateSnowParticles();

      // Movimento fluido delle miniature (lerp)
      Object.values(miniatureObjects).forEach(m => {
        m.currentPos.lerp(m.targetPos, 0.15);
        m.group.position.copy(m.currentPos);
      });

      // Animazione fiamme e luci pulsanti
      const time = clock.getElapsedTime();
      dynamicPointLights.forEach((l, idx) => {
        l.intensity = 1.2 + Math.sin(time * 6 + idx) * 0.2;
      });

      renderer.render(scene, camera);
    }
    renderLoop();

    const ro = new ResizeObserver(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);
  }

  function onKeyDown(e) {
    keysPressed[e.code] = true;

    // Tasto R: Ruota l'asset di 90°
    if (e.code === 'KeyR') {
      assetRotationY = (assetRotationY + Math.PI / 2) % (Math.PI * 2);
      if (ghostGroup) ghostGroup.rotation.y = assetRotationY;
    }
    // Tasto E: Alza piano (+1.5m)
    if (e.code === 'KeyE') {
      currentElevation = Math.min(6.0, currentElevation + 1.5);
      renderElevatorUI();
    }
    // Tasto Q: Abbassa piano (-1.5m)
    if (e.code === 'KeyQ') {
      currentElevation = Math.max(0.0, currentElevation - 1.5);
      renderElevatorUI();
    }
  }

  function onKeyUp(e) {
    keysPressed[e.code] = false;
  }

  function onMouseMove(e) {
    const rect = container.getBoundingClientRect();
    mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (isRightMouseDown) {
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;

      if (cameraMode === 'pov') {
        povYaw -= dx * 0.003;
        povPitch = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, povPitch - dy * 0.003));
      } else {
        cameraYaw += dx * 0.005;
        cameraPitch = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPitch - dy * 0.005));
      }

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  }

  function onMouseWheel(e) {
    e.preventDefault();
    if (cameraMode === 'pov') return;
    cameraDistance = Math.max(3.0, Math.min(50.0, cameraDistance + e.deltaY * 0.018));
  }

  // ============================================================================
  // APERTURA / CHIUSURA & INTERFACCIA UTENTE DUNGEON ALCHEMIST
  // ============================================================================
  function openTacticalMap(campCode, role) {
    currentCampCode = campCode || window.activeDmWorkspaceCode || 'MIDGARD-VALHALLA';
    userRole = role || (window.isCurrentUserAdmin() ? 'DM' : 'PLAYER');
    currentUser = window.currentUser || 'admin';

    let screen = document.getElementById('screen-map3d');
    if (!screen) {
      screen = createTacticalMapDOM();
      document.body.appendChild(screen);
    }

    screen.classList.remove('hidden');

    const viewport = document.getElementById('map3d-viewport');
    setTimeout(() => {
      initDungeonEngine(viewport);
      renderDockUI();
      renderAtmosphereButtons();
    }, 50);
  }

  function closeTacticalMap() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    const screen = document.getElementById('screen-map3d');
    if (screen) screen.classList.add('hidden');
    if (typeof window.renderAllViews === 'function') window.renderAllViews();
  }

  function createTacticalMapDOM() {
    const screen = document.createElement('section');
    screen.id = 'screen-map3d';
    screen.className = 'hidden fixed inset-0 z-50 bg-[#06090e] flex flex-col select-none overflow-hidden';
    screen.innerHTML = `
      <!-- Header Superiore Dungeon Alchemist -->
      <header class="px-4 py-2.5 bg-slate-950/95 border-b border-slate-800 flex justify-between items-center z-20 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <!-- Runa Ufficiale della Homepage -->
          <svg class="w-7 h-7 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" viewBox="0 0 100 140" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="square" stroke-linejoin="miter">
            <path d="M 82 14 L 54 38 L 26 14 L 26 126 L 54 102 L 82 126"/>
          </svg>
          <div>
            <h2 class="font-cinzel font-black text-sm text-white tracking-wider flex items-center gap-2">
              <span>DUNGEON ALCHEMIST — 3D MAP MAKER</span>
              <span id="map3d-role-badge" class="text-[9px] px-2 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-mono font-bold">${userRole}</span>
            </h2>
            <span class="text-[10px] text-slate-400">Generatore Stanze &amp; Case • Scale Multilivello • WASD per muoverti • Tasto R per ruotare</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Atmosfere Cinematiche -->
          <div id="map3d-atmos-buttons" class="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs"></div>

          <!-- Toggle Griglia -->
          <button type="button" onclick="window.Map3D.toggleGrid()" id="map3d-btn-grid" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold" title="Attiva/Disattiva Griglia">
            📐 Griglia
          </button>

          <!-- Toggle POV / Esplora a Piedi -->
          <button type="button" onclick="window.Map3D.toggleCameraMode()" id="map3d-btn-camera" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 hover:text-sky-200 text-xs font-bold flex items-center gap-1" title="Vista Prima Persona POV">
            👁️ <span id="map3d-camera-label">Top-Down</span>
          </button>

          <!-- Snapshot HD -->
          <button type="button" onclick="window.Map3D.captureSnapshot()" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1" title="Cattura Snapshot HD della Mappa">
            📸 Snapshot HD
          </button>

          <!-- Esporta / Importa JSON -->
          <button type="button" onclick="window.Map3D.exportMapJSON()" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold" title="Esporta File JSON">
            💾 Esporta
          </button>
          <label class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold cursor-pointer" title="Importa File JSON">
            📂 Importa
            <input type="file" accept=".json" onchange="window.Map3D.importMapJSON(event)" class="hidden">
          </label>

          <!-- Esci dalla Mappa -->
          <button type="button" onclick="window.Map3D.closeMap()" class="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-200 font-cinzel font-bold text-xs transition">
            Chiudi
          </button>
        </div>
      </header>

      <!-- Area Centrale: Dock Laterale Sinistro + Viewport 3D -->
      <div class="flex-1 w-full h-full relative flex overflow-hidden">
        
        <!-- DOCK LATERALE SINISTRO STILE DUNGEON ALCHEMIST -->
        <aside id="map3d-dock" class="w-80 bg-slate-950/95 border-r border-slate-800 flex flex-col z-20 backdrop-blur-md overflow-hidden transition-all duration-300">
          
          <!-- Tab Categories Bar -->
          <div class="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-900/60 p-1.5 gap-1">
            <button type="button" onclick="window.Map3D.switchTab('rooms')" id="tab-btn-rooms" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-amber-500 text-slate-950">🏠 Stanze</button>
            <button type="button" onclick="window.Map3D.switchTab('stairs')" id="tab-btn-stairs" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🪜 Scale</button>
            <button type="button" onclick="window.Map3D.switchTab('structures')" id="tab-btn-structures" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🧱 Mura</button>
            <button type="button" onclick="window.Map3D.switchTab('furniture')" id="tab-btn-furniture" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🪑 Arredi</button>
            <button type="button" onclick="window.Map3D.switchTab('lights')" id="tab-btn-lights" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🔥 Luci</button>
            <button type="button" onclick="window.Map3D.switchTab('nature')" id="tab-btn-nature" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🌲 Natura</button>
            <button type="button" onclick="window.Map3D.switchTab('terrain')" id="tab-btn-terrain" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300">🪨 Terreni</button>
          </div>

          <!-- Azioni Rapide & Modalità (Piazza, Cancella, Ruota) -->
          <div class="p-2.5 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between gap-1.5">
            <div class="flex items-center gap-1">
              <button type="button" onclick="window.Map3D.setToolMode('build')" id="mode-btn-build" class="px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-sky-500 text-slate-950 transition">Piazza</button>
              <button type="button" onclick="window.Map3D.setToolMode('delete')" id="mode-btn-delete" class="px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-slate-900 text-slate-400 hover:text-red-300 transition">Gomma</button>
              <button type="button" onclick="window.Map3D.rotateAsset()" class="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-amber-300 hover:bg-slate-800 border border-slate-700 transition" title="Ruota (Tasto R)">Ruota 90° (R)</button>
            </div>
            
            <!-- Elevazione / Piano -->
            <div id="map3d-elevation-box" class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span class="text-[10px] text-slate-400 font-mono">Piano:</span>
              <button type="button" onclick="window.Map3D.adjustElevation(-1.5)" class="text-xs text-sky-400 hover:text-white px-1 font-bold">-</button>
              <span id="map3d-elev-val" class="text-xs font-mono font-bold text-amber-300">0.0m</span>
              <button type="button" onclick="window.Map3D.adjustElevation(1.5)" class="text-xs text-sky-400 hover:text-white px-1 font-bold">+</button>
            </div>
          </div>

          <!-- Asset List Container -->
          <div id="map3d-asset-list" class="flex-1 overflow-y-auto p-2.5 space-y-2"></div>
        </aside>

        <!-- Viewport 3D -->
        <div id="map3d-viewport" class="flex-1 w-full h-full relative overflow-hidden"></div>
      </div>
    `;

    return screen;
  }

  function renderAtmosphereButtons() {
    const box = document.getElementById('map3d-atmos-buttons');
    if (!box) return;

    const list = [
      { id: 'giorno', label: '☀️ Giorno' },
      { id: 'notte_aurora', label: '🌌 Aurora' },
      { id: 'bufera', label: '❄️ Bufera' },
      { id: 'cripta', label: '🕯️ Cripta' }
    ];

    box.innerHTML = list.map(a => `
      <button type="button" onclick="window.Map3D.setAtmosphere('${a.id}')"
              class="px-2 py-1 rounded-lg font-bold transition ${currentAtmosphere === a.id ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'}">
        ${a.label}
      </button>
    `).join('');
  }

  function renderDockUI() {
    const listEl = document.getElementById('map3d-asset-list');
    if (!listEl) return;

    // Aggiorna classi tab
    ['rooms', 'stairs', 'structures', 'furniture', 'lights', 'nature', 'terrain'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      if (btn) {
        btn.className = (activeTab === t)
          ? 'px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-amber-500 text-slate-950 shadow-md'
          : 'px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 whitespace-nowrap transition bg-slate-900 text-slate-300 hover:bg-slate-800';
      }
    });

    if (activeTab === 'rooms') {
      // Room Painter UI
      const rooms = ASSET_CATALOG.rooms;
      listEl.innerHTML = `
        <div class="norse-panel rounded-xl p-3 border border-amber-500/40 space-y-2 mb-3 bg-amber-950/20">
          <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">Generatore Stanze &amp; Case</span>
          <p class="text-[11px] text-slate-300 leading-tight">Scegli una stanza a tema e le dimensioni. Clicca poi su <strong>"Genera Stanza"</strong> per piazzare l'intera struttura arredata in 1 clic!</p>
          
          <div class="flex items-center gap-2 pt-1">
            <label class="text-[10px] text-slate-400 font-bold uppercase">Misura:</label>
            <div class="flex gap-1 flex-1">
              <button type="button" onclick="window.Map3D.setRoomSize('small')" class="flex-1 py-1 rounded-lg text-[10px] font-bold ${selectedRoomSize === 'small' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">4x4</button>
              <button type="button" onclick="window.Map3D.setRoomSize('medium')" class="flex-1 py-1 rounded-lg text-[10px] font-bold ${selectedRoomSize === 'medium' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">6x6</button>
              <button type="button" onclick="window.Map3D.setRoomSize('large')" class="flex-1 py-1 rounded-lg text-[10px] font-bold ${selectedRoomSize === 'large' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">8x6</button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          ${rooms.map(r => `
            <div class="p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${selectedRoomTheme === r.theme ? 'bg-amber-500/20 border-amber-400' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
                 onclick="window.Map3D.selectRoomTheme('${r.theme}')">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${r.icon}</span>
                  <span class="font-cinzel font-bold text-xs text-white">${r.name}</span>
                </div>
                <button type="button" onclick="event.stopPropagation(); window.Map3D.spawnRoomNow('${r.theme}')" class="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-cinzel font-black text-[10px] shadow">
                  Genera
                </button>
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">${r.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      // Asset Catalog List
      const assets = ASSET_CATALOG[activeTab] || [];
      listEl.innerHTML = `
        <div class="grid grid-cols-1 gap-2">
          ${assets.map(a => `
            <div class="p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${selectedAssetId === a.id ? 'bg-sky-500/20 border-sky-400' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
                 onclick="window.Map3D.selectAsset('${a.id}')">
              <span class="text-2xl">${a.icon}</span>
              <div class="min-w-0 flex-1">
                <div class="font-cinzel font-bold text-xs text-white truncate">${a.name}</div>
                <div class="text-[10px] text-slate-400 truncate">${a.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  }

  function renderElevatorUI() {
    const el = document.getElementById('map3d-elev-val');
    if (el) el.textContent = `${currentElevation.toFixed(1)}m`;
    if (cursorBox) cursorBox.position.y = currentElevation + 0.05;
    if (ghostGroup) ghostGroup.position.y = currentElevation;
  }

  return {
    openMap: openTacticalMap,
    closeMap: closeTacticalMap,
    switchTab: function(tab) {
      activeTab = tab;
      if (tab === 'rooms') {
        toolMode = 'room_painter';
      } else {
        toolMode = 'build';
        const assets = ASSET_CATALOG[tab] || [];
        if (assets.length > 0) {
          selectedAssetId = assets[0].id;
          updateGhostPreview();
        }
      }
      renderDockUI();
    },
    selectAsset: function(id) {
      selectedAssetId = id;
      toolMode = 'build';
      updateGhostPreview();
      renderDockUI();
    },
    selectRoomTheme: function(theme) {
      selectedRoomTheme = theme;
      toolMode = 'room_painter';
      renderDockUI();
    },
    setRoomSize: function(sz) {
      selectedRoomSize = sz;
      renderDockUI();
    },
    spawnRoomNow: function(theme) {
      selectedRoomTheme = theme;
      generateProceduralRoom(snappedCoord.x, snappedCoord.z, theme, selectedRoomSize);
    },
    setToolMode: function(mode) {
      toolMode = mode;
      const bBuild = document.getElementById('mode-btn-build');
      const bDelete = document.getElementById('mode-btn-delete');
      if (bBuild) bBuild.className = (mode === 'build') ? 'px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-sky-500 text-slate-950 transition' : 'px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-slate-900 text-slate-300 transition';
      if (bDelete) bDelete.className = (mode === 'delete') ? 'px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-rose-600 text-white transition' : 'px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold bg-slate-900 text-slate-400 transition';
    },
    rotateAsset: function() {
      assetRotationY = (assetRotationY + Math.PI / 2) % (Math.PI * 2);
      if (ghostGroup) ghostGroup.rotation.y = assetRotationY;
    },
    adjustElevation: function(delta) {
      currentElevation = Math.max(0.0, Math.min(6.0, currentElevation + delta));
      renderElevatorUI();
    },
    setAtmosphere: setAtmosphere,
    toggleGrid: function() {
      if (gridHelper) gridHelper.visible = !gridHelper.visible;
      const btn = document.getElementById('map3d-btn-grid');
      if (btn) btn.classList.toggle('text-sky-300', gridHelper.visible);
    },
    toggleCameraMode: function() {
      if (cameraMode === 'tactical') {
        cameraMode = 'isometric';
        document.getElementById('map3d-camera-label').textContent = 'Isometrica';
      } else if (cameraMode === 'isometric') {
        cameraMode = 'pov';
        povPos.set(cameraTarget.x, currentElevation + 1.7, cameraTarget.z);
        povYaw = cameraYaw;
        document.getElementById('map3d-camera-label').textContent = 'POV 1ª Persona';
      } else {
        cameraMode = 'tactical';
        document.getElementById('map3d-camera-label').textContent = 'Top-Down';
      }
    },
    captureSnapshot: function() {
      if (!renderer) return;
      const dataUrl = renderer.domElement.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Yggdrasill_Map_${currentCampCode}_${Date.now()}.png`;
      a.click();
      if (typeof window.showToast === 'function') {
        window.showToast("Snapshot HD Salvata", "Immagine della mappa ad alta risoluzione scaricata!", "success");
      }
    },
    exportMapJSON: function() {
      const payload = {
        campCode: currentCampCode,
        exportedAt: new Date().toISOString(),
        tiles: mapTiles
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Yggdrasill_Map_${currentCampCode}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    importMapJSON: function(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed && Array.isArray(parsed.tiles)) {
            mapTiles = parsed.tiles;
            rebuildSceneMeshes();
            saveMapToCampaign();
            if (typeof window.showToast === 'function') {
              window.showToast("Mappa Caricata", `${mapTiles.length} elementi importati con successo!`, "success");
            }
          }
        } catch (err) {
          alert("File JSON non valido.");
        }
      };
      reader.readAsText(file);
    },
    getMapTiles: function() {
      return mapTiles;
    },
    getMiniaturesCount: function() {
      return Object.keys(miniatureObjects).length;
    }
  };
})();
