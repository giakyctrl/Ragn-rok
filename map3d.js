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
  let cameraTarget = new THREE.Vector3(0, 1.0, 0);
  let cameraDistance = 24;
  let cameraYaw = Math.PI / 4.2;
  let cameraPitch = 0.80; // radianti

  // POV First-Person Camera State
  let povPos = new THREE.Vector3(0, 1.7, 0);
  let povYaw = 0;
  let povPitch = 0;

  const keysPressed = {};
  let isRightMouseDown = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  // Strumenti Dungeon Alchemist
  let activeMode = 'rooms'; // 'rooms', 'objects', 'terrain', 'environment', 'tokens'
  let activeTab = 'stairs'; // 'stairs', 'structures', 'furniture', 'lights', 'nature'
  let toolMode = 'room_painter'; // 'build', 'delete', 'select', 'room_painter', 'terrain', 'tokens'
  let selectedAssetId = 'house_viking_cabin';
  let selectedRoomTheme = 'town_entrance';
  let selectedRoomSize = 'large';
  let currentElevation = 0; // 0m (Terra), 1.5m (Mezzanino), 3.0m (1° Piano), 4.5m (2° Piano)
  let assetRotationY = 0; // radianti (rotazione tasto R)

  // Pittura Biomi & Terreno (Stile Dungeon Alchemist)
  let selectedTerrainId = 'terrain_snow';
  let terrainBrushSize = 1; // 1 o 3

  // Illuminazione, Tempo & Atmosfere Dinamiche (Stile Dungeon Alchemist)
  let currentTimeOfDay = 'day'; // 'day' (Giorno), 'dusk' (Tramonto), 'night' (Notte)
  let currentWeather = 'clear'; // 'clear' (Sereno), 'snow' (Bufera), 'aurora' (Aurora Boreale), 'fog' (Nebbia Spettrale)
  let currentTorchMultiplier = 1.0; // 0.0x, 1.0x, 1.5x, 2.0x
  let currentAtmosphere = 'giorno'; // backwards compatibility
  let isCinematic = false;

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
  // ============================================================================
  // GLTF 3D ASSETS LOADER & MODEL CACHE (DUNGEON ALCHEMIST HIGH-FIDELITY ASSETS)
  // ============================================================================
  let gltfLoader = null;
  const glbModelCache = {};
  const glbPendingCallbacks = {};

  function initGLTFLoader() {
    if (!gltfLoader && window.THREE && typeof window.THREE.GLTFLoader === 'function') {
      gltfLoader = new window.THREE.GLTFLoader();
    }
    return gltfLoader;
  }

  function loadGLBModel(fileName, onLoad) {
    if (glbModelCache[fileName]) {
      if (onLoad) onLoad(glbModelCache[fileName].clone(true));
      return;
    }
    if (!glbPendingCallbacks[fileName]) {
      glbPendingCallbacks[fileName] = [];
    }
    if (onLoad) {
      glbPendingCallbacks[fileName].push(onLoad);
    }
    if (glbPendingCallbacks[fileName].length > 1) {
      return;
    }

    const loader = initGLTFLoader();
    if (!loader) {
      return;
    }

    loader.load(
      'assets/models/' + fileName,
      function(gltf) {
        const root = gltf.scene;
        root.traverse(function(child) {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              const matName = (child.material.name || '').toLowerCase();
              const isMetal = matName.includes('metal') || matName.includes('iron') || matName.includes('gold') || matName.includes('steel');
              child.material.metalness = isMetal ? 0.65 : 0.08;
              child.material.roughness = isMetal ? 0.45 : 0.80;
            }
          }
        });
        glbModelCache[fileName] = root;
        const cbs = glbPendingCallbacks[fileName] || [];
        glbPendingCallbacks[fileName] = [];
        cbs.forEach(function(cb) {
          try { cb(root.clone(true)); } catch (e) { console.error(e); }
        });
      },
      undefined,
      function(err) {
        console.warn("Dungeon Alchemist: Impossibile caricare modello GLB:", fileName, err);
      }
    );
  }

  function preloadCommonModels() {
    initGLTFLoader();
    const common = [
      'stairsWoodHandrail.glb', 'stairsStoneHandrail.glb', 'stairsWood.glb', 'stairsStone.glb',
      'stairsStoneCorner.glb', 'stairs.glb', 'wallWood.glb', 'wallWoodDoor.glb',
      'wallWoodWindowShutters.glb', 'wallWoodCorner.glb', 'wallStone.glb', 'wallStoneGate.glb',
      'wallStoneDoor.glb', 'wallStoneWindow.glb', 'wallStoneCorner.glb', 'fence.glb', 'fenceGate.glb',
      'fenceBroken.glb', 'pillarWood.glb', 'pillarStone.glb', 'pillarDungeon.glb', 'cart.glb',
      'cartHigh.glb', 'planks.glb', 'barrel_stack.glb', 'barrel_large.glb', 'table_feast.glb',
      'table_long.glb', 'chair.glb', 'chest.glb', 'chest_gold.glb', 'treeHigh.glb', 'tree.glb',
      'treeCrooked.glb', 'torch_mounted.glb', 'lantern.glb', 'bannerRed.glb', 'bannerGreen.glb',
      'roofHighGable.glb', 'roofGable.glb', 'roofGableEnd.glb', 'roofCorner.glb', 'chimney.glb'
    ];
    common.forEach(function(f) { loadGLBModel(f); });
  }

  // Mappa delle corrispondenze tra Asset ID e file 3D .GLB
  const GLB_ASSET_DEF = {
    // SCALE
    'stairs_wood_straight': { file: 'stairsWoodHandrail.glb', scale: 1.5, yOffset: 0 },
    'stairs_wood_handrail': { file: 'stairsWoodHandrail.glb', scale: 1.5, yOffset: 0 },
    'stairs_wood_simple': { file: 'stairsWood.glb', scale: 1.5, yOffset: 0 },
    'stairs_stone_straight': { file: 'stairsStoneHandrail.glb', scale: 1.5, yOffset: 0 },
    'stairs_stone_handrail': { file: 'stairsStoneHandrail.glb', scale: 1.5, yOffset: 0 },
    'stairs_stone_simple': { file: 'stairsStone.glb', scale: 1.5, yOffset: 0 },
    'stairs_stone_corner': { file: 'stairsStoneCorner.glb', scale: 1.5, yOffset: 0 },
    'stairs_grand': { file: 'stairs.glb', scale: 0.32, yOffset: 0 },

    // MURA & PORTE IN LEGNO
    'wall_wood_logs': { file: 'wallWood.glb', scale: 1.5, yOffset: 0 },
    'wall_wood_door': { file: 'wallWoodDoor.glb', scale: 1.5, yOffset: 0 },
    'door_arch_open': { file: 'wallWoodDoor.glb', scale: 1.5, yOffset: 0 },
    'wall_wood_window': { file: 'wallWoodWindowShutters.glb', scale: 1.5, yOffset: 0 },
    'wall_wood_window_shutters': { file: 'wallWoodWindowShutters.glb', scale: 1.5, yOffset: 0 },
    'wall_wood_corner': { file: 'wallWoodCorner.glb', scale: 1.5, yOffset: 0 },
    'wall_wood_arch': { file: 'wallWoodArch.glb', scale: 1.5, yOffset: 0 },

    // MURA & PORTALI IN PIETRA
    'wall_stone_blocks': { file: 'wallStone.glb', scale: 1.5, yOffset: 0 },
    'wall_stone_gate': { file: 'wallStoneGate.glb', scale: 1.5, yOffset: 0 },
    'wall_stone_door': { file: 'wallStoneDoor.glb', scale: 1.5, yOffset: 0 },
    'wall_stone_window': { file: 'wallStoneWindow.glb', scale: 1.5, yOffset: 0 },
    'wall_window_stone': { file: 'wallStoneWindow.glb', scale: 1.5, yOffset: 0 },
    'wall_stone_corner': { file: 'wallStoneCorner.glb', scale: 1.5, yOffset: 0 },
    'wall_stone_arch': { file: 'wallStoneArch.glb', scale: 1.5, yOffset: 0 },

    // CANCELLI & PALIZZATE (TOWN ENTRANCE)
    'fence_wood_stakes': { file: 'fence.glb', scale: 1.5, yOffset: 0 },
    'fence_gate_wood': { file: 'fenceGate.glb', scale: 1.5, yOffset: 0 },
    'fence_broken_wood': { file: 'fenceBroken.glb', scale: 1.5, yOffset: 0 },
    'pillar_wood_post': { file: 'pillarWood.glb', scale: 1.5, yOffset: 0 },
    'pillar_stone_post': { file: 'pillarStone.glb', scale: 1.5, yOffset: 0 },
    'pillar_dungeon_stone': { file: 'pillarDungeon.glb', scale: 0.7, yOffset: 0 },
    'pillar_runic_column': { file: 'pillarStone.glb', scale: 1.5, yOffset: 0 },

    // TETTI
    'roof_gable': { file: 'roofGable.glb', scale: 1.5, yOffset: 0 },
    'roof_high_gable': { file: 'roofHighGable.glb', scale: 1.5, yOffset: 0 },
    'roof_gable_end': { file: 'roofGableEnd.glb', scale: 1.5, yOffset: 0 },
    'roof_corner': { file: 'roofCorner.glb', scale: 1.5, yOffset: 0 },
    'roof_flat': { file: 'roofFlat.glb', scale: 1.5, yOffset: 0 },
    'roof_thatch_module': { file: 'roofHighGable.glb', scale: 1.5, yOffset: 0 },
    'roof_slate_module': { file: 'roofGable.glb', scale: 1.5, yOffset: 0 },
    'chimney_stone': { file: 'chimney.glb', scale: 1.5, yOffset: 0 },

    // CARRI & ARREDI
    'cart_high_sides': { file: 'cartHigh.glb', scale: 1.35, yOffset: 0 },
    'cart_goods_viking': { file: 'cart.glb', scale: 1.35, yOffset: 0 },
    'planks_wood_pile': { file: 'planks.glb', scale: 1.5, yOffset: 0 },
    'table_banquet_long': { file: 'table_feast.glb', scale: 0.65, yOffset: 0 },
    'table_kaykit_long': { file: 'table_long.glb', scale: 0.65, yOffset: 0 },
    'chair_nordic_wood': { file: 'chair.glb', scale: 0.85, yOffset: 0 },
    'chest_reinforced': { file: 'chest.glb', scale: 0.65, yOffset: 0 },
    'chest_gold_loot': { file: 'chest_gold.glb', scale: 0.65, yOffset: 0 },
    'barrel_single': { file: 'barrel_large.glb', scale: 0.5, yOffset: 0 },
    'barrels_cluster': { file: 'barrel_stack.glb', scale: 0.7, yOffset: 0 },

    // LUCI & BANNER
    'light_torch': { file: 'torch_mounted.glb', scale: 0.85, yOffset: 0.4 },
    'lantern_post_tall': { file: 'lantern.glb', scale: 1.1, yOffset: 0 },
    'banner_clan_red': { file: 'bannerRed.glb', scale: 1.5, yOffset: 0 },
    'banner_clan_green': { file: 'bannerGreen.glb', scale: 1.5, yOffset: 0 },

    // NATURA
    'nature_pine_large': { file: 'treeHigh.glb', scale: 1.35, yOffset: 0 },
    'nature_tree_standard': { file: 'tree.glb', scale: 1.35, yOffset: 0 },
    'nature_tree_crooked': { file: 'treeCrooked.glb', scale: 1.35, yOffset: 0 }
  };

  const ASSET_CATALOG = {
    "rooms": [
        {
            "id": "room_town_entrance",
            "name": "Entrata del Villaggio Vichingo",
            "icon": "🛡️",
            "theme": "town_entrance",
            "desc": "Portale fortificato, palizzata a pali, torrette di guardia con scale, carro merci e lanterne"
        },
        {
            "id": "room_watchtower",
            "name": "Torre di Guardia Fortificata",
            "icon": "🏹",
            "theme": "watchtower",
            "desc": "Torre difensiva a due piani con scalinata in legno, feritoie e postazione di vedetta"
        },
        {
            "id": "room_tavern",
            "name": "Taverna dell'Idromele",
            "icon": "🍺",
            "theme": "tavern",
            "desc": "Pavimento in legno, grande tavolo delle feste, sedie, catasta di barili, camino e torce"
        },
        {
            "id": "room_jarl",
            "name": "Sala del Trono del Jarl",
            "icon": "👑",
            "theme": "jarl_hall",
            "desc": "Lastre in pietra, colonne monumentali, trono con pelli, forzieri d'oro, bracieri e stendardi"
        },
        {
            "id": "room_forge",
            "name": "Fucina del Fabbro",
            "icon": "⚔️",
            "theme": "forge",
            "desc": "Terra battuta, incudine, grande forgia con camino, carretto, barili e forziere"
        },
        {
            "id": "room_cabin",
            "name": "Capanna Vichinga",
            "icon": "🏡",
            "theme": "cabin",
            "desc": "Mura in tronchi, letto con pellicce di lupo, tavolo, forziere, finestre con scuri e focolare"
        },
        {
            "id": "room_crypt",
            "name": "Cripta Sotterranea",
            "icon": "🔮",
            "theme": "crypt",
            "desc": "Pietra scura, colonne monumentali del dungeon, forziere dorato e altare sacrificale"
        },
        {
            "id": "room_camp",
            "name": "Accampamento Innevato",
            "icon": "⛺",
            "theme": "camp",
            "desc": "Neve fresca, falò cerchiato da pietre, tronchi da seduta, pini innevati e scorte"
        }
    ],
    "stairs": [
        {
            "id": "stairs_wood_straight",
            "name": "Scala Dritta in Legno (con Corrimano)",
            "icon": "🪜",
            "desc": "Scala in legno con corrimano rifinito (+1.5m dislivello)"
        },
        {
            "id": "stairs_stone_straight",
            "name": "Gradinata in Pietra (con Parapetto)",
            "icon": "🏛️",
            "desc": "Scala monumentale in pietra scolpita con balaustra (+1.5m)"
        },
        {
            "id": "stairs_stone_corner",
            "name": "Scala d'Angolo in Pietra",
            "icon": "📐",
            "desc": "Raccordo angolare a 90° per scalinate monumentali"
        },
        {
            "id": "stairs_grand",
            "name": "Grande Scalinata Monumentale",
            "icon": "🏰",
            "desc": "Scalinata regale per templi e fortezze del Jarl"
        },
        {
            "id": "stairs_spiral_wood",
            "name": "Scala a Chiocciola",
            "icon": "🌀",
            "desc": "Scala a tronco centrale con gradini a raggiera (+3.0m)"
        },
        {
            "id": "stairs_ramp_rock",
            "name": "Rampa in Roccia",
            "icon": "⛰️",
            "desc": "Rampa inclinata naturale per dislivelli montani"
        }
    ],
    "structures": [
        {
            "id": "house_viking_cabin",
            "name": "Casa Vichinga (Capanna Completa)",
            "icon": "🛖",
            "desc": "Casa in tronchi con finestre a scuri, porta e tetto a spiovente"
        },
        {
            "id": "wall_wood_logs",
            "name": "Muro in Tronchi d'Abete",
            "icon": "🪵",
            "desc": "Pezzo modulare di muro in tronchi orizzontali"
        },
        {
            "id": "wall_wood_door",
            "name": "Parete con Porta in Legno",
            "icon": "🚪",
            "desc": "Porta massiccia con cardini in ferro"
        },
        {
            "id": "wall_wood_window_shutters",
            "name": "Parete con Finestra e Scuri",
            "icon": "🪟",
            "desc": "Finestra nordica con persiane richiudibili"
        },
        {
            "id": "wall_wood_corner",
            "name": "Angolo Muro in Legno",
            "icon": "📐",
            "desc": "Raccordo angolare 90° in tronchi"
        },
        {
            "id": "wall_wood_arch",
            "name": "Arco in Legno Intagliato",
            "icon": "🪵",
            "desc": "Apertura ad arco per passaggi"
        },
        {
            "id": "wall_stone_blocks",
            "name": "Muro in Pietra a Conci",
            "icon": "🧱",
            "desc": "Muro solido in blocchi di pietra da fortezza"
        },
        {
            "id": "wall_stone_gate",
            "name": "Grande Portale ad Arco in Pietra",
            "icon": "⛩️",
            "desc": "Arco maestoso per entrate di villaggi e fortezze"
        },
        {
            "id": "wall_stone_door",
            "name": "Parete Pietra con Porta",
            "icon": "🚪",
            "desc": "Varco con porta blindata da dungeon"
        },
        {
            "id": "wall_stone_window",
            "name": "Parete Pietra con Finestra",
            "icon": "🪟",
            "desc": "Feritoia / apertura ad arco in pietra"
        },
        {
            "id": "wall_stone_corner",
            "name": "Angolo Muro in Pietra",
            "icon": "🧱",
            "desc": "Raccordo d'angolo solido a 90°"
        },
        {
            "id": "fence_wood_stakes",
            "name": "Palizzata a Pali Appuntiti",
            "icon": "🛡️",
            "desc": "Recinzione difensiva in tronchi di pino"
        },
        {
            "id": "fence_gate_wood",
            "name": "Cancello della Palizzata",
            "icon": "🚧",
            "desc": "Varco apribile per palizzate difensive"
        },
        {
            "id": "fence_broken_wood",
            "name": "Palizzata con Breccia",
            "icon": "🪵",
            "desc": "Tronchi sfondati da assedio"
        },
        {
            "id": "pillar_wood_post",
            "name": "Trave / Pilastro in Legno",
            "icon": "🪵",
            "desc": "Palo portante in legno d'abete"
        },
        {
            "id": "pillar_stone_post",
            "name": "Pilastro in Pietra Squadrata",
            "icon": "🏛️",
            "desc": "Colonna angolare di supporto"
        },
        {
            "id": "pillar_dungeon_stone",
            "name": "Pilastro Monumentale del Dungeon",
            "icon": "🏛️",
            "desc": "Colonna in pietra massiccia alta per cripte e sale"
        },
        {
            "id": "roof_high_gable",
            "name": "Tetto ad Alto Colmo Nordico",
            "icon": "🛖",
            "desc": "Copertura spiovente ripida per climi artici"
        },
        {
            "id": "roof_gable",
            "name": "Falda Tetto a Due Spioventi",
            "icon": "🌾",
            "desc": "Modulo di copertura standard"
        },
        {
            "id": "roof_gable_end",
            "name": "Testata Tetto con Timpano",
            "icon": "🏡",
            "desc": "Terminale frontale del tetto"
        },
        {
            "id": "roof_corner",
            "name": "Angolo Tetto",
            "icon": "📐",
            "desc": "Raccordo angolare per coperture"
        },
        {
            "id": "chimney_stone",
            "name": "Comignolo in Pietra",
            "icon": "🧱",
            "desc": "Canna fumaria per focolari e camini"
        }
    ],
    "furniture": [
        {
            "id": "cart_high_sides",
            "name": "Carro Merci (Sponde Alte)",
            "icon": "🚛",
            "desc": "Grande carro mercantile a 2 ruote per carichi pesanti"
        },
        {
            "id": "cart_goods_viking",
            "name": "Carro da Trasporto Leggero",
            "icon": "🛒",
            "desc": "Carro con pianale da carico"
        },
        {
            "id": "planks_wood_pile",
            "name": "Tavolame da Lavoro / Banchina",
            "icon": "🪵",
            "desc": "Passerella di assi stese a terra"
        },
        {
            "id": "table_banquet_long",
            "name": "Grande Tavolo da Banchetto",
            "icon": "🥖",
            "desc": "Tavolo in rovere allestito con ciotole e idromele"
        },
        {
            "id": "table_kaykit_long",
            "name": "Tavolo Lungo delle Feste",
            "icon": "🪵",
            "desc": "Tavolo massiccio in legno scuro"
        },
        {
            "id": "chair_nordic_wood",
            "name": "Sedia Vichinga da Taverna",
            "icon": "🪑",
            "desc": "Sedia in legno con schienale sagomato"
        },
        {
            "id": "chest_gold_loot",
            "name": "Baule del Tesoro Aureo",
            "icon": "💰",
            "desc": "Forziere straripante di monete d'oro e gemme"
        },
        {
            "id": "chest_reinforced",
            "name": "Forziere Rinforzato con Lucchetto",
            "icon": "📦",
            "desc": "Baule blindato per equipaggiamento"
        },
        {
            "id": "barrels_cluster",
            "name": "Catasta di Barili d'Idromele",
            "icon": "🛢️",
            "desc": "Gruppo di barili cerchiati in ferro"
        },
        {
            "id": "barrel_single",
            "name": "Barile Singolo in Rovere",
            "icon": "🛢️",
            "desc": "Botte per provviste e birra"
        },
        {
            "id": "throne_jarl_epic",
            "name": "Trono del Jarl con Pelli e Corna",
            "icon": "👑",
            "desc": "Trono maestoso intagliato con corna di alce"
        },
        {
            "id": "bed_viking_fur",
            "name": "Letto Nordico con Pelli di Lupo",
            "icon": "🛏️",
            "desc": "Letto in legno con calde pellicce"
        },
        {
            "id": "fireplace_hearth",
            "name": "Grande Camino in Pietra",
            "icon": "🔥",
            "desc": "Focolare con fuoco vivo e luce calda"
        },
        {
            "id": "forge_anvil",
            "name": "Incudine del Fabbro su Ceppo",
            "icon": "🔨",
            "desc": "Incudine in ferro battuto con carboni ardenti"
        },
        {
            "id": "rug_polar_bear",
            "name": "Tappeto in Pelle d'Orso Polare",
            "icon": "🐻",
            "desc": "Pelliccia stesa a terra con testa"
        }
    ],
    "lights": [
        {
            "id": "light_torch",
            "name": "Torcia da Parete in Ferro (Luce Dinamica)",
            "icon": "🕯️",
            "desc": "Torcia montata con fiamma e PointLight"
        },
        {
            "id": "lantern_post_tall",
            "name": "Lampione su Palo in Ferro Battuto",
            "icon": "🏮",
            "desc": "Lanterna calda su pilastro metallico"
        },
        {
            "id": "light_brazier",
            "name": "Braciere Ardente a Tripode",
            "icon": "🔥",
            "desc": "Braciere in ferro con fuoco vivo"
        },
        {
            "id": "light_mystic_rune",
            "name": "Cristallo Runico Fluttuante",
            "icon": "💎",
            "desc": "Cristallo azzurro con bagliore etereo"
        },
        {
            "id": "banner_clan_red",
            "name": "Vessillo di Guerra Rosso/Oro",
            "icon": "🚩",
            "desc": "Stendardo araldico dei guerrieri"
        },
        {
            "id": "banner_clan_green",
            "name": "Vessillo Araldico Verde/Argento",
            "icon": "🏳️",
            "desc": "Stendardo nordico decorativo"
        }
    ],
    "nature": [
        {
            "id": "nature_pine_large",
            "name": "Grande Pino Innevato Alto",
            "icon": "🌲",
            "desc": "Pino secolare maestoso della taiga"
        },
        {
            "id": "nature_tree_standard",
            "name": "Pino Montano di Midgardr",
            "icon": "🌲",
            "desc": "Albero sempreverde nordico"
        },
        {
            "id": "nature_tree_crooked",
            "name": "Albero Norreno Contorto dal Vento",
            "icon": "🌳",
            "desc": "Fusto nodoso modellato dalle tempeste"
        },
        {
            "id": "nature_campfire_stone",
            "name": "Falò da Campo Cerchiato da Sassi",
            "icon": "🏕️",
            "desc": "Cerchio di pietre con legna accesa"
        },
        {
            "id": "nature_logs_pile",
            "name": "Catasta di Ceppi Spaccati",
            "icon": "🪵",
            "desc": "Legna da ardere per l'inverno"
        },
        {
            "id": "nature_boulder_moss",
            "name": "Masso Granitico Muschioso",
            "icon": "🪨",
            "desc": "Roccia naturale ricoperta di licheni"
        }
    ],
    "terrain": [
        {
            "id": "terrain_packed_dirt",
            "name": "Terra Battuta da Sentiero",
            "icon": "🟤",
            "desc": "Sentiero calpestato naturale"
        },
        {
            "id": "terrain_planks_tavern",
            "name": "Assi di Legno da Taverna",
            "icon": "🪵",
            "desc": "Pavimento rustico in doghe d'abete"
        },
        {
            "id": "terrain_flagstone",
            "name": "Lastricato in Pietra Squadrata",
            "icon": "🧱",
            "desc": "Lastre di pietra tagliata per fortezze"
        },
        {
            "id": "terrain_snow",
            "name": "Manto Nevoso Candido",
            "icon": "❄️",
            "desc": "Neve profonda di Midgardr"
        },
        {
            "id": "terrain_mountain_rock",
            "name": "Roccia Viva di Montagna",
            "icon": "⛰️",
            "desc": "Roccia grigia grezza"
        },
        {
            "id": "terrain_runic_circle",
            "name": "Lastra con Runa Sacra",
            "icon": "ᛈ",
            "desc": "Cerchio magico intagliato nel suolo"
        }
    ]
};

  function createAssetMesh(type, rotY = 0) {
    const group = new THREE.Group();
    group.rotation.y = rotY;

    // Colori e Materiali PBR Norreni di base per terreni e arredi procedurali
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

    // 1. Controllo se l'asset ha un modello 3D .GLB ufficiale
    const glbDef = GLB_ASSET_DEF[type];
    if (glbDef) {
      const modelHolder = new THREE.Group();
      group.add(modelHolder);

      // Placeholder temporaneo a bassi poligoni
      let placeholderGeo;
      if (type.includes('stairs')) {
        placeholderGeo = new THREE.BoxGeometry(GRID_SIZE * 0.95, 1.5, GRID_SIZE * 0.95);
      } else if (type.includes('wall') || type.includes('fence')) {
        placeholderGeo = new THREE.BoxGeometry(GRID_SIZE, 1.5, 0.2);
      } else if (type.includes('tree') || type.includes('pillar') || type.includes('lantern')) {
        placeholderGeo = new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8);
      } else if (type.includes('table') || type.includes('cart')) {
        placeholderGeo = new THREE.BoxGeometry(1.4, 0.7, 1.8);
      } else {
        placeholderGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
      }
      const placeholderMesh = new THREE.Mesh(placeholderGeo, woodDarkMat);
      placeholderMesh.position.y = 0.5;
      modelHolder.add(placeholderMesh);

      // Carica o clona il modello GLB
      loadGLBModel(glbDef.file, function(cloned) {
        modelHolder.remove(placeholderMesh);
        cloned.scale.set(glbDef.scale, glbDef.scale, glbDef.scale);
        cloned.position.y = glbDef.yOffset || 0;
        modelHolder.add(cloned);
      });

      return group;
    }

    // 2. Struttura Composta: Casa Vichinga Completa (con 4 Mura GLB + Finestra + Porta + Tetto a Colmo)
    if (type === 'house_viking_cabin') {
      const houseGroup = new THREE.Group();
      group.add(houseGroup);

      // Parete Frontale con Porta
      loadGLBModel('wallWoodDoor.glb', function(front) {
        front.scale.set(1.5, 1.5, 1.5);
        front.position.set(0, 0, GRID_SIZE * 0.5);
        houseGroup.add(front);
      });
      // Parete Posteriore
      loadGLBModel('wallWood.glb', function(back) {
        back.scale.set(1.5, 1.5, 1.5);
        back.position.set(0, 0, -GRID_SIZE * 0.5);
        back.rotation.y = Math.PI;
        houseGroup.add(back);
      });
      // Parete Sinistra con Finestra e Scuri
      loadGLBModel('wallWoodWindowShutters.glb', function(left) {
        left.scale.set(1.5, 1.5, 1.5);
        left.position.set(-GRID_SIZE * 0.5, 0, 0);
        left.rotation.y = Math.PI / 2;
        houseGroup.add(left);
      });
      // Parete Destra con Finestra e Scuri
      loadGLBModel('wallWoodWindowShutters.glb', function(right) {
        right.scale.set(1.5, 1.5, 1.5);
        right.position.set(GRID_SIZE * 0.5, 0, 0);
        right.rotation.y = -Math.PI / 2;
        houseGroup.add(right);
      });
      // Tetto ad Alto Colmo Nordico
      loadGLBModel('roofHighGable.glb', function(roof) {
        roof.scale.set(1.6, 1.5, 1.6);
        roof.position.set(0, 1.5, 0);
        houseGroup.add(roof);
      });
      // Comignolo
      loadGLBModel('chimney.glb', function(ch) {
        ch.scale.set(1.2, 1.2, 1.2);
        ch.position.set(0.4, 2.2, 0.3);
        houseGroup.add(ch);
      });

      return group;
    }

    // 3. Arredi & Elementi Speciali Procedurali PBR
    switch (type) {
      // Scala a chiocciola
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

      // Rampa di roccia
      case 'stairs_ramp_rock': {
        const rampGeo = new THREE.BoxGeometry(GRID_SIZE, 0.3, GRID_SIZE * 1.2);
        const ramp = new THREE.Mesh(rampGeo, stoneWallMat);
        ramp.position.set(0, 0.75, 0);
        ramp.rotation.x = 0.55;
        group.add(ramp);
        break;
      }

      // Trono del Jarl con Pelli di Lupo e Corna
      case 'throne_jarl_epic': {
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.0), stoneDarkMat);
        base.position.y = 0.2;
        group.add(base);

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.8), woodDarkMat);
        seat.position.y = 0.65;
        group.add(seat);

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 0.15), woodDarkMat);
        back.position.set(0, 1.4, -0.35);
        group.add(back);

        const fur = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.7), bearFurMat);
        fur.position.set(0, 0.92, -0.05);
        group.add(fur);

        // Corna decorative
        const hornGeo = new THREE.ConeGeometry(0.08, 0.6, 6);
        const hornL = new THREE.Mesh(hornGeo, goldBronzeMat);
        hornL.position.set(-0.4, 2.1, -0.35);
        hornL.rotation.z = 0.4;
        group.add(hornL);

        const hornR = hornL.clone();
        hornR.position.x = 0.4;
        hornR.rotation.z = -0.4;
        group.add(hornR);
        break;
      }

      // Letto con pellicce
      case 'bed_viking_fur': {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.8), woodDarkMat);
        frame.position.y = 0.15;
        group.add(frame);
        const fur = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.7), bearFurMat);
        fur.position.y = 0.35;
        group.add(fur);
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.15, 0.4), woodPlankMat);
        pillow.position.set(0, 0.45, -0.6);
        group.add(pillow);
        break;
      }

      // Camino / focolare in pietra con fiamma viva
      case 'fireplace_hearth': {
        const hearth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.6), stoneWallMat);
        hearth.position.set(0, 0.8, 0);
        group.add(hearth);
        const fireOpening = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.3), stoneDarkMat);
        fireOpening.position.set(0, 0.5, 0.2);
        group.add(fireOpening);
        const flames = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 6), fireMat);
        flames.position.set(0, 0.4, 0.25);
        group.add(flames);
        break;
      }

      // Incudine su ceppo
      case 'forge_anvil': {
        const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.6, 10), woodDarkMat);
        stump.position.y = 0.3;
        group.add(stump);
        const anvil = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.7), ironBlackMat);
        anvil.position.y = 0.75;
        group.add(anvil);
        break;
      }

      // Tappeto in pelle d'orso polare
      case 'rug_polar_bear': {
        const skin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.02, 2.0), bearFurMat);
        skin.position.y = 0.01;
        group.add(skin);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.5), bearFurMat);
        head.position.set(0, 0.08, -1.0);
        group.add(head);
        break;
      }

      // Braciere ardente
      case 'light_brazier': {
        const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.25, 0.3, 8), ironBlackMat);
        bowl.position.y = 0.75;
        group.add(bowl);
        for (let i = 0; i < 3; i++) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6), ironBlackMat);
          const ang = (i / 3) * Math.PI * 2;
          leg.position.set(Math.cos(ang) * 0.3, 0.4, Math.sin(ang) * 0.3);
          leg.rotation.z = Math.cos(ang) * 0.2;
          group.add(leg);
        }
        const coal = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), fireMat);
        coal.position.y = 0.85;
        group.add(coal);
        break;
      }

      // Cristallo Runico Fluttuante
      case 'light_mystic_rune': {
        const crystalGeo = new THREE.OctahedronGeometry(0.35, 0);
        const crystal = new THREE.Mesh(crystalGeo, runeGlowMat);
        crystal.position.y = 1.3;
        group.add(crystal);
        const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 0.9, 8), stoneDarkMat);
        plinth.position.y = 0.45;
        group.add(plinth);
        break;
      }

      // Falò da campo cerchiato
      case 'nature_campfire_stone': {
        const stones = 8;
        for (let i = 0; i < stones; i++) {
          const ang = (i / stones) * Math.PI * 2;
          const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), stoneWallMat);
          rock.position.set(Math.cos(ang) * 0.5, 0.08, Math.sin(ang) * 0.5);
          group.add(rock);
        }
        const flame = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 6), fireMat);
        flame.position.y = 0.3;
        group.add(flame);
        break;
      }

      // Catasta di ceppi
      case 'nature_logs_pile': {
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 3 - r; c++) {
            const log = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), woodPlankMat);
            log.rotation.x = Math.PI / 2;
            log.position.set((c - (2 - r) * 0.5) * 0.28, r * 0.22 + 0.12, 0);
            group.add(log);
          }
        }
        break;
      }

      // Masso muschioso
      case 'nature_boulder_moss': {
        const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65), stoneDarkMat);
        boulder.position.set(0, 0.45, 0);
        boulder.scale.set(1.2, 0.8, 1.0);
        group.add(boulder);
        break;
      }

      // Terreni di base
      case 'terrain_planks_tavern': {
        const plankTile = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE), woodPlankMat);
        plankTile.position.y = -0.05;
        plankTile.receiveShadow = true;
        group.add(plankTile);
        break;
      }

      case 'terrain_flagstone': {
        const flagTile = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE), stoneWallMat);
        flagTile.position.y = -0.05;
        flagTile.receiveShadow = true;
        group.add(flagTile);
        break;
      }

      case 'terrain_snow': {
        const snowTile = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE), snowMat);
        snowTile.position.y = -0.05;
        snowTile.receiveShadow = true;
        group.add(snowTile);
        break;
      }

      case 'terrain_mountain_rock': {
        const rockTile = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE), stoneDarkMat);
        rockTile.position.y = -0.05;
        rockTile.receiveShadow = true;
        group.add(rockTile);
        break;
      }

      case 'terrain_packed_dirt': {
        const dirtMat = new THREE.MeshStandardMaterial({ color: 0x573919, roughness: 0.95 });
        const dirtTile = new THREE.Mesh(new THREE.BoxGeometry(GRID_SIZE, 0.1, GRID_SIZE), dirtMat);
        dirtTile.position.y = -0.05;
        dirtTile.receiveShadow = true;
        group.add(dirtTile);
        break;
      }

      case 'terrain_runic_circle': {
        const slab = new THREE.Mesh(new THREE.CylinderGeometry(GRID_SIZE * 0.48, GRID_SIZE * 0.48, 0.1, 16), stoneDarkMat);
        slab.position.y = -0.05;
        group.add(slab);
        const runeGlow = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.4, 16), runeGlowMat);
        runeGlow.rotation.x = -Math.PI / 2;
        runeGlow.position.y = 0.01;
        group.add(runeGlow);
        break;
      }

      default: {
        // Fallback generico scatola legno
        const defMesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), woodPlankMat);
        defMesh.position.y = 0.4;
        group.add(defMesh);
        break;
      }
    }

    return group;
  }

  function generateProceduralRoom(originX, originZ, theme, sizeType) {
    let w = 4;
    let h = 4;
    if (sizeType === 'medium') { w = 6; h = 6; }
    if (sizeType === 'large') { w = 8; h = 6; }

    const halfW = Math.floor(w / 2);
    const halfH = Math.floor(h / 2);

    // Helper per aggiungere tile
    function addTile(relX, relZ, type, rotY = 0, elev = currentElevation) {
      const realX = originX + relX * GRID_SIZE;
      const realZ = originZ + relZ * GRID_SIZE;
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

    // =========================================================================
    // 1. ENTRATA DEL VILLAGGIO VICHINGO (ISPIRATA AL VIDEO DUNGEON ALCHEMIST)
    // =========================================================================
    if (theme === 'town_entrance') {
      // Terreno: Sentiero centrale in terra battuta + neve circostante
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          const isRoad = Math.abs(x) <= 1;
          addTile(x, z, isRoad ? 'terrain_packed_dirt' : 'terrain_snow', 0, currentElevation);
        }
      }

      // Passerelle di tavole in legno lungo la strada principale
      addTile(0, -1, 'planks_wood_pile', 0);
      addTile(0, 1, 'planks_wood_pile', 0);
      addTile(0, -halfH + 1, 'planks_wood_pile', 0);

      // Portale fortificato monumentale in pietra
      addTile(-1, 0, 'wall_stone_gate', 0);
      addTile(1, 0, 'wall_stone_gate', Math.PI);
      addTile(0, 0, 'fence_gate_wood', 0);

      // Palizzata difensiva a pali a sinistra e a destra
      for (let x = -halfW; x <= halfW; x++) {
        if (Math.abs(x) > 1) {
          if (x === halfW) {
            addTile(x, 0, 'fence_broken_wood', 0); // Breccia difensiva d'angolo
          } else {
            addTile(x, 0, 'fence_wood_stakes', 0);
          }
        }
      }

      // Torretta di Guardia Sinistra (NW) con scala in legno
      addTile(-halfW + 1, -1, 'pillar_wood_post', 0);
      addTile(-halfW + 1, 1, 'pillar_wood_post', 0);
      addTile(-halfW + 2, -1, 'stairs_wood_straight', Math.PI / 2);
      addTile(-halfW + 1, 0, 'banner_clan_red', 0);

      // Torretta di Guardia Destra (NE) con scala e stendardo verde
      addTile(halfW - 1, -1, 'pillar_wood_post', 0);
      addTile(halfW - 1, 1, 'pillar_wood_post', 0);
      addTile(halfW - 2, -1, 'stairs_wood_straight', -Math.PI / 2);
      addTile(halfW - 1, 0, 'banner_clan_green', 0);

      // Carro mercantile ad alte sponde parcheggiato a bordo sentiero
      addTile(1.8, 1.8, 'cart_high_sides', 0.2);
      addTile(1.8, 3.0, 'barrels_cluster', 0);
      addTile(2.8, 1.8, 'barrel_single', 0);
      addTile(-1.8, 2.2, 'chest_reinforced', 0);

      // Lampioni in ferro battuto accesi con luce calda
      addTile(-1.8, 0.8, 'lantern_post_tall', 0);
      addTile(1.8, 0.8, 'lantern_post_tall', 0);

      // Natura circostante: Grandi pini innevati e alberi contorti
      addTile(-halfW, -halfH, 'nature_pine_large', 0);
      addTile(halfW, -halfH, 'nature_pine_large', 0);
      addTile(-halfW, halfH, 'nature_tree_crooked', 0);
      addTile(halfW, halfH, 'nature_tree_standard', 0);
      addTile(halfW - 1, -halfH + 1, 'nature_boulder_moss', 0);
    }
    // =========================================================================
    // 2. TORRE DI GUARDIA FORTIFICATA
    // =========================================================================
    else if (theme === 'watchtower') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_flagstone', 0, currentElevation);
        }
      }
      // Pilastri ai quattro angoli
      addTile(-halfW, -halfH, 'pillar_stone_post', 0);
      addTile(halfW, -halfH, 'pillar_stone_post', 0);
      addTile(-halfW, halfH, 'pillar_stone_post', 0);
      addTile(halfW, halfH, 'pillar_stone_post', 0);

      // Mura con feritoie
      addTile(0, -halfH, 'wall_stone_window', 0);
      addTile(-halfW, 0, 'wall_stone_blocks', Math.PI / 2);
      addTile(halfW, 0, 'wall_stone_blocks', Math.PI / 2);
      addTile(0, halfH, 'wall_stone_gate', 0);

      // Scala in pietra per salire al secondo livello
      addTile(halfW - 1, 0, 'stairs_stone_straight', -Math.PI / 2);
      addTile(-halfW + 1, 0, 'lantern_post_tall', 0);
      addTile(0, -halfH + 1, 'chest_gold_loot', 0);
    }
    // =========================================================================
    // 3. TAVERNA DELL'IDROMELE (CON TAVOLI KAYKIT E BARILI)
    // =========================================================================
    else if (theme === 'tavern') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_planks_tavern', 0, currentElevation);
        }
      }
      // Mura perimetrali in legno
      for (let x = -halfW; x <= halfW; x++) {
        addTile(x, -halfH, 'wall_wood_logs', 0);
        if (x === 0) addTile(x, halfH, 'wall_wood_door', 0);
        else addTile(x, halfH, 'wall_wood_logs', 0);
      }
      for (let z = -halfH + 1; z < halfH; z++) {
        if (z === 0) {
          addTile(-halfW, z, 'wall_wood_window_shutters', Math.PI / 2);
          addTile(halfW, z, 'wall_wood_window_shutters', Math.PI / 2);
        } else {
          addTile(-halfW, z, 'wall_wood_logs', Math.PI / 2);
          addTile(halfW, z, 'wall_wood_logs', Math.PI / 2);
        }
      }
      // Tavolo da banchetto centrale lungo con sedie
      addTile(0, 0, 'table_banquet_long', 0);
      addTile(-0.8, 0, 'chair_nordic_wood', Math.PI / 2);
      addTile(0.8, 0, 'chair_nordic_wood', -Math.PI / 2);
      // Camino a nord
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      // Catasta di barili d'idromele
      addTile(-halfW + 1, -halfH + 1, 'barrels_cluster', 0);
      addTile(-halfW + 1.8, -halfH + 1, 'barrel_single', 0);
      // Tappeto d'orso
      addTile(0, halfH - 1.2, 'rug_polar_bear', 0);
      // Torce accese
      addTile(-halfW + 0.3, 0, 'light_torch', Math.PI / 2);
      addTile(halfW - 0.3, 0, 'light_torch', -Math.PI / 2);
      // Scala in legno con corrimano al primo piano
      addTile(halfW - 1, -halfH + 1, 'stairs_wood_straight', 0);
    }
    // =========================================================================
    // 4. SALA DEL TRONO DEL JARL
    // =========================================================================
    else if (theme === 'jarl_hall') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_flagstone', 0, currentElevation);
        }
      }
      for (let x = -halfW; x <= halfW; x++) {
        addTile(x, -halfH, 'wall_stone_blocks', 0);
        if (x === 0) addTile(x, halfH, 'wall_stone_gate', 0);
        else addTile(x, halfH, 'wall_stone_blocks', 0);
      }
      for (let z = -halfH + 1; z < halfH; z++) {
        addTile(-halfW, z, 'wall_stone_blocks', Math.PI / 2);
        addTile(halfW, z, 'wall_stone_blocks', Math.PI / 2);
      }
      // Trono monumentale del Jarl
      addTile(0, -halfH + 1, 'throne_jarl_epic', 0);
      addTile(0, -halfH + 1.8, 'rug_polar_bear', 0);
      // Pilastri monumentali del dungeon
      addTile(-halfW + 1, -1, 'pillar_dungeon_stone', 0);
      addTile(halfW - 1, -1, 'pillar_dungeon_stone', 0);
      addTile(-halfW + 1, 1, 'pillar_dungeon_stone', 0);
      addTile(halfW - 1, 1, 'pillar_dungeon_stone', 0);
      // Forziere dorato e bracieri
      addTile(-1.2, -halfH + 1, 'light_brazier', 0);
      addTile(1.2, -halfH + 1, 'light_brazier', 0);
      addTile(-halfW + 1, 0, 'chest_gold_loot', Math.PI / 2);
      addTile(halfW - 1, 0, 'banner_clan_red', -Math.PI / 2);
    }
    // =========================================================================
    // 5. FUCINA DEL FABBRO
    // =========================================================================
    else if (theme === 'forge') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_packed_dirt', 0, currentElevation);
        }
      }
      for (let x = -halfW; x <= halfW; x++) {
        addTile(x, -halfH, 'wall_wood_logs', 0);
        if (x === 0) addTile(x, halfH, 'wall_wood_door', 0);
        else addTile(x, halfH, 'wall_wood_logs', 0);
      }
      for (let z = -halfH + 1; z < halfH; z++) {
        addTile(-halfW, z, 'wall_wood_logs', Math.PI / 2);
        addTile(halfW, z, 'wall_wood_logs', Math.PI / 2);
      }
      addTile(0, 0, 'forge_anvil', 0);
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      addTile(-halfW + 1, -halfH + 1, 'barrels_cluster', 0);
      addTile(halfW - 1, -halfH + 1, 'chest_reinforced', 0);
      addTile(halfW - 1, 1, 'cart_goods_viking', 0);
      addTile(0, 1.2, 'light_brazier', 0);
    }
    // =========================================================================
    // 6. CAPANNA VICHINGA
    // =========================================================================
    else if (theme === 'cabin') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_planks_tavern', 0, currentElevation);
        }
      }
      for (let x = -halfW; x <= halfW; x++) {
        addTile(x, -halfH, 'wall_wood_logs', 0);
        if (x === 0) addTile(x, halfH, 'wall_wood_door', 0);
        else addTile(x, halfH, 'wall_wood_logs', 0);
      }
      for (let z = -halfH + 1; z < halfH; z++) {
        addTile(-halfW, z, 'wall_wood_window_shutters', Math.PI / 2);
        addTile(halfW, z, 'wall_wood_window_shutters', Math.PI / 2);
      }
      addTile(-halfW + 1, -halfH + 1, 'bed_viking_fur', 0);
      addTile(halfW - 1, -halfH + 1, 'chest_reinforced', 0);
      addTile(0, -halfH + 0.35, 'fireplace_hearth', 0);
      addTile(0, 0, 'rug_polar_bear', 0);
      addTile(-halfW + 0.3, 0, 'light_torch', Math.PI / 2);
    }
    // =========================================================================
    // 7. CRIPTA SOTTERRANEA
    // =========================================================================
    else if (theme === 'crypt') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_mountain_rock', 0, currentElevation);
        }
      }
      for (let x = -halfW; x <= halfW; x++) {
        addTile(x, -halfH, 'wall_stone_blocks', 0);
        addTile(x, halfH, 'wall_stone_blocks', 0);
      }
      for (let z = -halfH + 1; z < halfH; z++) {
        addTile(-halfW, z, 'wall_stone_blocks', Math.PI / 2);
        addTile(halfW, z, 'wall_stone_blocks', Math.PI / 2);
      }
      addTile(-halfW + 1, -halfH + 1, 'pillar_dungeon_stone', 0);
      addTile(halfW - 1, -halfH + 1, 'pillar_dungeon_stone', 0);
      addTile(-halfW + 1, halfH - 1, 'pillar_dungeon_stone', 0);
      addTile(halfW - 1, halfH - 1, 'pillar_dungeon_stone', 0);
      addTile(0, -halfH + 1, 'chest_gold_loot', 0);
      addTile(0, 0, 'light_mystic_rune', 0);
      addTile(0, halfH - 1, 'stairs_stone_straight', Math.PI);
    }
    // =========================================================================
    // 8. ACCAMPAMENTO INNEVATO
    // =========================================================================
    else if (theme === 'camp') {
      for (let x = -halfW; x <= halfW; x++) {
        for (let z = -halfH; z <= halfH; z++) {
          addTile(x, z, 'terrain_snow', 0, currentElevation);
        }
      }
      addTile(0, 0, 'nature_campfire_stone', 0);
      addTile(0, -1, 'nature_logs_pile', 0);
      addTile(0, 1, 'nature_logs_pile', 0);
      addTile(-halfW, -halfH, 'nature_pine_large', 0);
      addTile(halfW, -halfH, 'nature_pine_large', 0);
      addTile(-halfW, halfH, 'nature_tree_crooked', 0);
      addTile(halfW, halfH, 'nature_tree_standard', 0);
      addTile(halfW - 1, 0, 'barrels_cluster', 0);
      addTile(-halfW + 1, 0, 'cart_goods_viking', 0);
    }

    rebuildSceneMeshes();
    saveMapToCampaign();

    if (typeof window.showToast === 'function') {
      window.showToast("Stanza Generata!", `[${theme.toUpperCase()}] generata e arredata automaticamente in stile Dungeon Alchemist.`, "success");
    }
  }

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

      // Aggiungi luci dinamiche calde per torce, lampioni, bracieri e camini
      if (tile.type === 'light_torch' || tile.type === 'fireplace_hearth') {
        const pLight = new THREE.PointLight(0xf59e0b, 1.4, 8.5);
        pLight.position.set(tile.x, (tile.y || 0) + 1.2, tile.z);
        scene.add(pLight);
        dynamicPointLights.push(pLight);
      } else if (tile.type === 'lantern_post_tall') {
        const pLight = new THREE.PointLight(0xfbbf24, 1.5, 9.5);
        pLight.position.set(tile.x, (tile.y || 0) + 1.6, tile.z);
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

  function createDefaultDungeonMap() {
    mapTiles = [];
    generateProceduralRoom(0, 0, 'town_entrance', 'large');
    return mapTiles;
  }

  // ============================================================================
  // ILLUMINAZIONE, ORA DEL GIORNO & EFFETTI METEO (DUNGEON ALCHEMIST ENGINE)
  // ============================================================================
  function setTimeOfDay(time) {
    currentTimeOfDay = time;
    updateEnvironmentLighting();
    renderDockUI();
  }

  function setWeather(weather) {
    currentWeather = weather;
    updateEnvironmentLighting();
    renderDockUI();
  }

  function setTorchMultiplier(mult) {
    currentTorchMultiplier = mult;
    updateEnvironmentLighting();
    renderDockUI();
  }

  function updateEnvironmentLighting() {
    if (!scene) return;

    // 1. Ora del Giorno: Luce Solare Direzionale & Luce Emisferica
    if (currentTimeOfDay === 'day') {
      scene.background = new THREE.Color(0x0e1b2e);
      scene.fog = new THREE.FogExp2(0x0e1b2e, 0.009);
      if (hemiLight) {
        hemiLight.color.setHex(0xe0f2fe);
        hemiLight.groundColor.setHex(0x1e293b);
        hemiLight.intensity = 1.0;
      }
      if (dirLight) {
        dirLight.color.setHex(0xfffaed);
        dirLight.intensity = 1.35;
        dirLight.position.set(18, 28, 16);
      }
    } else if (currentTimeOfDay === 'dusk') {
      scene.background = new THREE.Color(0x2d121c);
      scene.fog = new THREE.FogExp2(0x2d121c, 0.013);
      if (hemiLight) {
        hemiLight.color.setHex(0xfb923c);
        hemiLight.groundColor.setHex(0x451a03);
        hemiLight.intensity = 0.85;
      }
      if (dirLight) {
        dirLight.color.setHex(0xf59e0b);
        dirLight.intensity = 1.15;
        dirLight.position.set(28, 10, 14);
      }
    } else if (currentTimeOfDay === 'night') {
      scene.background = new THREE.Color(0x020617);
      scene.fog = new THREE.FogExp2(0x020617, 0.016);
      if (hemiLight) {
        hemiLight.color.setHex(0x0f172a);
        hemiLight.groundColor.setHex(0x020617);
        hemiLight.intensity = 0.35;
      }
      if (dirLight) {
        dirLight.color.setHex(0x93c5fd);
        dirLight.intensity = 0.40;
        dirLight.position.set(-15, 22, -12);
      }
    }

    // 2. Fenomeni Meteo & Atmosfere
    if (currentWeather === 'clear') {
      if (snowParticles) snowParticles.visible = false;
    } else if (currentWeather === 'snow') {
      if (snowParticles) snowParticles.visible = true;
      scene.fog = new THREE.FogExp2(0x1e293b, 0.032);
      if (hemiLight) hemiLight.color.setHex(0xcfd8dc);
    } else if (currentWeather === 'aurora') {
      if (snowParticles) snowParticles.visible = false;
      scene.background = new THREE.Color(0x021612);
      scene.fog = new THREE.FogExp2(0x021612, 0.018);
      if (hemiLight) {
        hemiLight.color.setHex(0x059669); // Bagliore verde smeraldo
        hemiLight.groundColor.setHex(0x064e3b);
        hemiLight.intensity = 0.75;
      }
      if (dirLight) {
        dirLight.color.setHex(0x38bdf8); // Riflesso ciano
      }
    } else if (currentWeather === 'fog') {
      if (snowParticles) snowParticles.visible = false;
      scene.fog = new THREE.FogExp2(scene.background.getHex(), 0.045); // Densa foschia
    }

    // 3. Regolazione Torce e Luci Dinamiche
    dynamicPointLights.forEach(l => {
      const base = l.userData.baseIntensity || 1.4;
      l.intensity = base * currentTorchMultiplier;
    });
  }

  // Compatibilità retroattiva per codice/test esistenti
  function setAtmosphere(mode) {
    currentAtmosphere = mode;
    if (mode === 'giorno') {
      currentTimeOfDay = 'day';
      currentWeather = 'clear';
    } else if (mode === 'notte_aurora') {
      currentTimeOfDay = 'night';
      currentWeather = 'aurora';
    } else if (mode === 'bufera') {
      currentTimeOfDay = 'day';
      currentWeather = 'snow';
    } else if (mode === 'cripta') {
      currentTimeOfDay = 'night';
      currentWeather = 'fog';
    }
    updateEnvironmentLighting();
    renderDockUI();
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
        if (toolMode === 'terrain') {
          cursorBox.visible = true;
          const s = (terrainBrushSize === 3) ? 3 : 1;
          cursorBox.scale.set(s, 1, s);
        } else {
          cursorBox.scale.set(1, 1, 1);
          cursorBox.visible = (toolMode !== 'delete');
        }
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
    // ============================================================================
  // PITTURA BIOMI & TERRENO (DUNGEON ALCHEMIST TERRAIN BRUSH)
  // ============================================================================
  function paintTerrainAt(centerX, centerZ, terrainId, brushSize) {
    const half = (brushSize === 3) ? 1 : 0;
    for (let dx = -half; dx <= half; dx++) {
      for (let dz = -half; dz <= half; dz++) {
        const tx = centerX + dx * GRID_SIZE;
        const tz = centerZ + dz * GRID_SIZE;
        // Rimuovi terreno esistente a quota 0
        mapTiles = mapTiles.filter(t => !(Math.abs(t.x - tx) < 0.1 && Math.abs(t.z - tz) < 0.1 && Math.abs(t.y) < 0.1 && t.type.startsWith('terrain_')));
        mapTiles.push({
          id: 'tile_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
          x: tx,
          y: 0,
          z: tz,
          type: terrainId,
          rotY: 0
        });
      }
    }
    rebuildSceneMeshes();
    saveMapToCampaign();
  }

  function fillEntireMapWithBiome(terrainId) {
    let replacedCount = 0;
    mapTiles.forEach(t => {
      if (t.type.startsWith('terrain_')) {
        t.type = terrainId;
        replacedCount++;
      }
    });

    if (replacedCount < 16) {
      const radius = 6;
      for (let x = -radius; x <= radius; x++) {
        for (let z = -radius; z <= radius; z++) {
          const tx = x * GRID_SIZE;
          const tz = z * GRID_SIZE;
          const exists = mapTiles.some(t => Math.abs(t.x - tx) < 0.1 && Math.abs(t.z - tz) < 0.1 && Math.abs(t.y) < 0.1);
          if (!exists) {
            mapTiles.push({
              id: 'tile_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4),
              x: tx,
              y: 0,
              z: tz,
              type: terrainId,
              rotY: 0
            });
          }
        }
      }
    }

    rebuildSceneMeshes();
    saveMapToCampaign();
    if (typeof window.showToast === 'function') {
      window.showToast("Bioma Applicato", `Intera mappa rigenerata con il bioma selezionato!`, "success");
    }
  }

  // ============================================================================
  // MODALITÀ CINEMATICA (DUNGEON ALCHEMIST CINEMATIC FIRST-PERSON VIEW)
  // ============================================================================
  function toggleCinematicMode(forceState) {
    isCinematic = (typeof forceState === 'boolean') ? forceState : !isCinematic;
    const header = document.getElementById('map3d-header');
    const dock = document.getElementById('map3d-dock');
    const hud = document.getElementById('map3d-cinematic-hud');
    const btn = document.getElementById('map3d-btn-cinematic');

    if (isCinematic) {
      if (header) header.classList.add('hidden');
      if (dock) dock.classList.add('hidden');
      if (hud) hud.classList.remove('hidden');
      if (btn) btn.classList.add('ring-2', 'ring-purple-400');
      cameraMode = 'pov';
      povPos.set(cameraTarget.x, currentElevation + 1.7, cameraTarget.z);
      povYaw = cameraYaw;
      povPitch = 0;
      if (gridHelper) gridHelper.visible = false;
      if (cursorBox) cursorBox.visible = false;
      if (ghostGroup) ghostGroup.visible = false;
      if (typeof window.showToast === 'function') {
        window.showToast("Modalità Cinematica Attiva", "WASD per camminare, Mouse Dx per orientare lo sguardo, F per foto HD, ESC per tornare all'editor.", "info");
      }
    } else {
      if (header) header.classList.remove('hidden');
      if (dock) dock.classList.remove('hidden');
      if (hud) hud.classList.add('hidden');
      if (btn) btn.classList.remove('ring-2', 'ring-purple-400');
      cameraMode = 'tactical';
      if (gridHelper) gridHelper.visible = true;
      if (cursorBox) cursorBox.visible = true;
      if (ghostGroup) ghostGroup.visible = true;
    }
  }

  // ============================================================================
  // SPAWNER PEDINE & MOSTRI NORRENI PER IL DM
  // ============================================================================
  function spawnMonsterToken(monsterType) {
    const bestiary = {
      'wolf': { name: "Lupo dell'Inverno", type: "Bestia", hp: 32, ac: 13, icon: "🐺", color: 0x64748b },
      'draugr': { name: "Draugr dei Ghiacci", type: "Non Morto", hp: 45, ac: 14, icon: "🧟", color: 0x0284c7 },
      'berserker': { name: "Berserker Nemico", type: "Umanoide", hp: 67, ac: 13, icon: "👹", color: 0xb91c1c },
      'skeleton': { name: "Scheletro Guerriero", type: "Non Morto", hp: 22, ac: 12, icon: "💀", color: 0x94a3b8 },
      'jotunn': { name: "Jötunn del Gelo", type: "Gigante", hp: 138, ac: 15, icon: "🧌", color: 0x38bdf8 }
    };
    const m = bestiary[monsterType] || bestiary['wolf'];
    const tokenKey = 'enemy_' + Date.now().toString(36);

    if (window.activeDmWorkspaceCode && window.campaignsData && window.campaignsData[window.activeDmWorkspaceCode]) {
      const camp = window.campaignsData[window.activeDmWorkspaceCode];
      if (!camp.members) camp.members = {};
      camp.members[tokenKey] = {
        name: m.name,
        charClass: m.type,
        hp: m.hp,
        maxHp: m.hp,
        ac: m.ac,
        posX: snappedCoord.x,
        posY: currentElevation + 0.25,
        posZ: snappedCoord.z,
        isEnemy: true,
        color: m.color
      };
      if (typeof window.saveCampaignsToStorage === 'function') window.saveCampaignsToStorage();
      if (typeof window.syncCampaignToFirebase === 'function') window.syncCampaignToFirebase(window.activeDmWorkspaceCode);
    }
    syncCampaignMiniatures();
    if (typeof window.showToast === 'function') {
      window.showToast("Pedina Schierata", `[${m.name}] posizionato sulla mappa!`, "success");
    }
  }

  function centerCameraOnMiniature(uKey) {
    const mini = miniatureObjects[uKey];
    if (mini) {
      cameraTarget.copy(mini.currentPos);
      if (typeof window.showToast === 'function') {
        const name = mini.data?.charData?.name || uKey;
        window.showToast("Telecamera Centrata", `Inquadrato ${name}`, "info");
      }
    }
  }

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
      else if (toolMode === 'terrain' && userRole === 'DM') {
        // Dipingi il terreno alle coordinate con il bioma selezionato
        paintTerrainAt(snappedCoord.x, snappedCoord.z, selectedTerrainId, terrainBrushSize);
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

    // Precarica in memoria i modelli 3D GLB di Dungeon Alchemist
    preloadCommonModels();
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
    // Tasto F: Snapshot HD istantaneo
    if (e.code === 'KeyF') {
      captureSnapshot();
    }
    // Tasto Escape: Esci da modalità cinematica
    if (e.code === 'Escape' && isCinematic) {
      toggleCinematicMode(false);
    }
    // Alt + Home: Toggle Modalità Cinematica
    if (e.code === 'Home' && e.altKey) {
      e.preventDefault();
      toggleCinematicMode();
    }
    // Alt + G: Toggle Griglia D&D
    if (e.code === 'KeyG' && e.altKey) {
      e.preventDefault();
      toggleGrid();
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
      <header id="map3d-header" class="px-4 py-2 bg-slate-950/95 border-b border-slate-800 flex justify-between items-center z-20 backdrop-blur-md">
        <!-- Logo e Titolo -->
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
            <span class="text-[10px] text-slate-400">Generatore Automatico di Mappe 3D • Sistema Biomi • Luci Dinamiche &amp; Meteo</span>
          </div>
        </div>

        <!-- Barra Principale Modalità di Creazione (Stile Dungeon Alchemist) -->
        <nav id="map3d-mode-nav" class="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
          <button type="button" onclick="window.Map3D.switchMode('rooms')" id="nav-mode-rooms" class="nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition bg-amber-500 text-slate-950 shadow">
            🏠 Disegna Stanza
          </button>
          <button type="button" onclick="window.Map3D.switchMode('objects')" id="nav-mode-objects" class="nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition text-slate-300 hover:text-white hover:bg-slate-800">
            🪑 Oggetti
          </button>
          <button type="button" onclick="window.Map3D.switchMode('terrain')" id="nav-mode-terrain" class="nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition text-slate-300 hover:text-white hover:bg-slate-800">
            ⛰️ Terreno &amp; Biomi
          </button>
          <button type="button" onclick="window.Map3D.switchMode('environment')" id="nav-mode-environment" class="nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition text-slate-300 hover:text-white hover:bg-slate-800">
            🌤️ Ambiente &amp; Luce
          </button>
          <button type="button" onclick="window.Map3D.switchMode('tokens')" id="nav-mode-tokens" class="nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition text-slate-300 hover:text-white hover:bg-slate-800">
            ♟️ Token &amp; Eroi
          </button>
        </nav>

        <!-- Azioni Rapide Destra -->
        <div class="flex items-center gap-2">
          <!-- Modalità Cinematica Prima Persona -->
          <button type="button" onclick="window.Map3D.toggleCinematicMode()" id="map3d-btn-cinematic" class="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900 hover:to-indigo-900 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1 transition shadow" title="Modalità Cinematica POV (Alt+Home)">
            🎥 Cinematica
          </button>

          <!-- Toggle Griglia D&D -->
          <button type="button" onclick="window.Map3D.toggleGrid()" id="map3d-btn-grid" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold" title="Attiva/Disattiva Griglia D&D (Alt+G)">
            📐 Griglia
          </button>

          <!-- Snapshot HD -->
          <button type="button" onclick="window.Map3D.captureSnapshot()" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold flex items-center gap-1" title="Cattura Snapshot HD della Mappa (Tasto F)">
            📸 Foto HD
          </button>

          <!-- Esporta / Importa JSON -->
          <button type="button" onclick="window.Map3D.exportMapJSON()" class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-300 hover:text-emerald-200 text-xs font-bold" title="Esporta Mappa in File JSON">
            💾 Esporta
          </button>
          <label class="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 hover:text-indigo-200 text-xs font-bold cursor-pointer" title="Importa Mappa da File JSON">
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
          <!-- Contenuto dinamico del dock renderizzato da renderDockUI() -->
          <div id="map3d-dock-content" class="flex-1 overflow-y-auto p-2.5 space-y-2"></div>
        </aside>

        <!-- Viewport 3D Three.js -->
        <div id="map3d-viewport" class="flex-1 w-full h-full relative overflow-hidden"></div>

        <!-- Floating HUD Modalità Cinematica -->
        <div id="map3d-cinematic-hud" class="hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-30 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-full px-5 py-2 flex items-center gap-4 text-xs shadow-2xl text-slate-200 pointer-events-auto">
            <span class="font-cinzel font-bold text-amber-400 flex items-center gap-1.5 tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              MODALITÀ CINEMATICA
            </span>
            <span class="h-4 w-px bg-slate-700"></span>
            <span class="text-slate-300">🚶 <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-sky-300">WASD</kbd> Cammina</span>
            <span class="text-slate-300">🖱️ <kbd class="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-sky-300">Mouse Dx</kbd> Guarda</span>
            <button type="button" onclick="window.Map3D.captureSnapshot()" class="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-200 font-bold flex items-center gap-1">
              📸 Foto HD (<kbd class="text-[9px] font-mono">F</kbd>)
            </button>
            <button type="button" onclick="window.Map3D.toggleCinematicMode(false)" class="px-3 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-cinzel font-bold">
              ✕ Esci (<kbd class="text-[9px] font-mono">ESC</kbd>)
            </button>
          </div>
      </div>
    `;

    return screen;
  }

  function renderAtmosphereButtons() {
    // Compatibilità vuota: i bottoni atmosfere hardcoded nell'header sono stati eliminati a favore del pannello Ambiente & Luce
  }

  function switchMode(mode) {
    activeMode = mode;
    
    // Aggiorna classi bottoni modalità nell'header
    ['rooms', 'objects', 'terrain', 'environment', 'tokens'].forEach(m => {
      const btn = document.getElementById(`nav-mode-${m}`);
      if (btn) {
        if (m === activeMode) {
          btn.className = 'nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition bg-amber-500 text-slate-950 shadow';
        } else {
          btn.className = 'nav-mode-btn px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold flex items-center gap-1.5 transition text-slate-300 hover:text-white hover:bg-slate-800';
        }
      }
    });

    if (mode === 'rooms') {
      toolMode = 'room_painter';
    } else if (mode === 'objects') {
      toolMode = 'build';
      const assets = ASSET_CATALOG[activeTab] || [];
      if (assets.length > 0) {
        selectedAssetId = assets[0].id;
        updateGhostPreview();
      }
    } else if (mode === 'terrain') {
      toolMode = 'terrain';
    } else if (mode === 'environment') {
      toolMode = 'select';
    } else if (mode === 'tokens') {
      toolMode = 'tokens';
    }

    renderDockUI();
  }

  function renderDockUI() {
    const dockEl = document.getElementById('map3d-dock-content');
    if (!dockEl) return;

    // =========================================================================
    // 1. MODALITÀ: DISEGNA STANZA (AI ROOM GENERATOR)
    // =========================================================================
    if (activeMode === 'rooms') {
      const rooms = ASSET_CATALOG.rooms || [];
      dockEl.innerHTML = `
        <div class="norse-panel rounded-xl p-3 border border-amber-500/40 space-y-2 mb-2 bg-amber-950/20">
          <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">Generatore Stanze con AI</span>
          <p class="text-[11px] text-slate-300 leading-tight">Scegli il tema architettonico e la misura. Clicca <strong>"Genera"</strong> per piazzare l'intera stanza auto-arredata in 1 clic!</p>
          
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
            <div class="p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${selectedRoomTheme === r.theme ? 'bg-amber-500/20 border-amber-400 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
                 onclick="window.Map3D.selectRoomTheme('${r.theme}')">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${r.icon}</span>
                  <span class="font-cinzel font-bold text-xs text-white">${r.name}</span>
                </div>
                <button type="button" onclick="event.stopPropagation(); window.Map3D.spawnRoomNow('${r.theme}')" class="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-cinzel font-black text-[10px] shadow">
                  Genera
                </button>
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">${r.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
    // =========================================================================
    // 2. MODALITÀ: OGGETTI & ARREDI (STRUCTURES, FURNITURE, LIGHTS, NATURE)
    // =========================================================================
    else if (activeMode === 'objects') {
      const subTabs = [
        { id: 'stairs', label: '🪜 Scale' },
        { id: 'structures', label: '🧱 Mura' },
        { id: 'furniture', label: '🪑 Arredi' },
        { id: 'lights', label: '🔥 Luci' },
        { id: 'nature', label: '🌲 Natura' }
      ];

      const currentAssets = ASSET_CATALOG[activeTab] || [];

      dockEl.innerHTML = `
        <!-- Sub-Tabs Oggetti -->
        <div class="flex overflow-x-auto no-scrollbar border-b border-slate-800 bg-slate-900/60 p-1 gap-1 rounded-xl mb-2">
          ${subTabs.map(st => `
            <button type="button" onclick="window.Map3D.switchTab('${st.id}')"
                    class="flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${activeTab === st.id ? 'bg-amber-500 text-slate-950 font-cinzel shadow' : 'bg-slate-900 text-slate-400 hover:text-white'}">
              ${st.label}
            </button>
          `).join('')}
        </div>

        <!-- Strumenti Azione: Piazza / Gomma / Ruota / Piano -->
        <div class="p-2 border border-slate-800 bg-slate-900/60 rounded-xl flex items-center justify-between gap-1 mb-2">
          <div class="flex items-center gap-1">
            <button type="button" onclick="window.Map3D.setToolMode('build')" id="mode-btn-build" class="px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold ${toolMode === 'build' ? 'bg-sky-500 text-slate-950' : 'bg-slate-950 text-slate-300'} transition">Piazza</button>
            <button type="button" onclick="window.Map3D.setToolMode('delete')" id="mode-btn-delete" class="px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold ${toolMode === 'delete' ? 'bg-rose-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-red-300'} transition">Gomma</button>
            <button type="button" onclick="window.Map3D.rotateAsset()" class="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-950 text-amber-300 border border-slate-800 hover:bg-slate-800 transition" title="Ruota 90° (Tasto R)">Ruota (R)</button>
          </div>
          
          <div class="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            <span class="text-[9px] text-slate-400 font-mono">Piano:</span>
            <button type="button" onclick="window.Map3D.adjustElevation(-1.5)" class="text-xs text-sky-400 hover:text-white px-0.5 font-bold">-</button>
            <span id="map3d-elev-val" class="text-[11px] font-mono font-bold text-amber-300">${currentElevation.toFixed(1)}m</span>
            <button type="button" onclick="window.Map3D.adjustElevation(1.5)" class="text-xs text-sky-400 hover:text-white px-0.5 font-bold">+</button>
          </div>
        </div>

        <!-- Lista Asset 3D GLB -->
        <div class="grid grid-cols-1 gap-1.5">
          ${currentAssets.map(a => `
            <div class="p-2 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${selectedAssetId === a.id ? 'bg-sky-500/20 border-sky-400 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
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
    // =========================================================================
    // 3. MODALITÀ: TERRENO & BIOMI (DUNGEON ALCHEMIST TERRAIN BRUSH)
    // =========================================================================
    else if (activeMode === 'terrain') {
      const biomes = [
        { id: 'terrain_snow', name: 'Taiga Innevata', icon: '❄️', desc: 'Manto nevoso profondo e candido di Midgardr' },
        { id: 'terrain_packed_dirt', name: 'Sentiero Terra & Fango', icon: '🟤', desc: 'Terra battuta calpestata da mercanti ed eserciti' },
        { id: 'terrain_planks_tavern', name: 'Tavolato in Legno', icon: '🪵', desc: "Pavimento rustico in assi d'abete per interni" },
        { id: 'terrain_flagstone', name: 'Lastricato Fortezza', icon: '🧱', desc: 'Pietra squadrata tagliata per sale e cinte murarie' },
        { id: 'terrain_mountain_rock', name: 'Roccia Viva di Montagna', icon: '⛰️', desc: 'Granito scuro naturale delle vette alpine' },
        { id: 'terrain_runic_circle', name: 'Lastra con Runa Sacra', icon: 'ᛈ', desc: 'Cerchio magico intagliato con incisioni luminose' }
      ];

      dockEl.innerHTML = `
        <div class="norse-panel rounded-xl p-3 border border-sky-500/40 space-y-2 mb-2 bg-sky-950/20">
          <span class="text-[10px] font-cinzel font-bold text-sky-300 uppercase tracking-wider block">Pennello Biomi &amp; Terreno</span>
          <p class="text-[11px] text-slate-300 leading-tight">Dipingi il suolo cliccando sulla mappa. Scegli la dimensione del pennello o riempi l'intera area in un colpo solo.</p>
          
          <div class="flex items-center gap-2 pt-1">
            <label class="text-[10px] text-slate-400 font-bold uppercase">Pennello:</label>
            <div class="flex gap-1 flex-1">
              <button type="button" onclick="window.Map3D.setTerrainBrushSize(1)" class="flex-1 py-1 rounded-lg text-[10px] font-bold ${terrainBrushSize === 1 ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">🖌️ 1x1 Singolo</button>
              <button type="button" onclick="window.Map3D.setTerrainBrushSize(3)" class="flex-1 py-1 rounded-lg text-[10px] font-bold ${terrainBrushSize === 3 ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">🖌️ 3x3 Area</button>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          ${biomes.map(b => `
            <div class="p-2.5 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${selectedTerrainId === b.id ? 'bg-sky-500/20 border-sky-400 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
                 onclick="window.Map3D.selectTerrain('${b.id}')">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${b.icon}</span>
                  <span class="font-cinzel font-bold text-xs text-white">${b.name}</span>
                </div>
                <button type="button" onclick="event.stopPropagation(); window.Map3D.fillEntireMapWithBiome('${b.id}')"
                        class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-bold border border-sky-500/30"
                        title="Applica a tutte le tessere terreno">
                  Riempi Tutto
                </button>
              </div>
              <p class="text-[10px] text-slate-400 leading-tight">${b.desc}</p>
            </div>
          `).join('')}
        </div>
      `;
    }
    // =========================================================================
    // 4. MODALITÀ: AMBIENTE & LUCE (TIME OF DAY, WEATHER, DYNAMIC LIGHTS)
    // =========================================================================
    else if (activeMode === 'environment') {
      const timesOfDay = [
        { id: 'day', label: 'Giorno', icon: '☀️', desc: 'Luce solare brillante e nitida' },
        { id: 'dusk', label: 'Tramonto', icon: '🌅', desc: 'Ora dorata con ombre lunghe e calde' },
        { id: 'night', label: 'Notte', icon: '🌙', desc: 'Cielo scuro stellato e luce lunare fredda' }
      ];

      const weathers = [
        { id: 'clear', label: 'Sereno', icon: '☀️', desc: 'Aria nitida, cielo terso e visibilità perfetta' },
        { id: 'snow', label: 'Bufera di Neve', icon: '❄️', desc: 'Fiocchi 3D animati cadenti in tempo reale' },
        { id: 'aurora', label: 'Aurora Boreale', icon: '🌌', desc: 'Bagliori mistici verde smeraldo e ciano nel cielo' },
        { id: 'fog', label: 'Nebbia Spettrale', icon: '🌫️', desc: 'Densa foschia volumetrica a bassa quota' }
      ];

      dockEl.innerHTML = `
        <div class="space-y-3">
          <!-- 1. Ora del Giorno -->
          <div class="norse-panel rounded-xl p-3 border border-amber-500/40 bg-amber-950/20 space-y-2">
            <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">Ora del Giorno (Time of Day)</span>
            <div class="grid grid-cols-3 gap-1.5">
              ${timesOfDay.map(t => `
                <button type="button" onclick="window.Map3D.setTimeOfDay('${t.id}')"
                        class="p-2 rounded-xl flex flex-col items-center gap-1 border transition ${currentTimeOfDay === t.id ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md' : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'}">
                  <span class="text-xl">${t.icon}</span>
                  <span class="text-[10px] font-cinzel font-bold">${t.label}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- 2. Meteo & Fenomeni Nordici -->
          <div class="norse-panel rounded-xl p-3 border border-sky-500/40 bg-sky-950/20 space-y-2">
            <span class="text-[10px] font-cinzel font-bold text-sky-300 uppercase tracking-wider block">Meteo &amp; Fenomeni Nordici</span>
            <div class="space-y-1.5">
              ${weathers.map(w => `
                <div class="p-2 rounded-xl border transition cursor-pointer flex items-center justify-between ${currentWeather === w.id ? 'bg-sky-500/20 border-sky-400 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}"
                     onclick="window.Map3D.setWeather('${w.id}')">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">${w.icon}</span>
                    <div>
                      <div class="font-cinzel font-bold text-xs text-white">${w.label}</div>
                      <div class="text-[10px] text-slate-400">${w.desc}</div>
                    </div>
                  </div>
                  <span class="text-xs ${currentWeather === w.id ? 'text-sky-300 font-bold' : 'text-slate-600'}">✓</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 3. Illuminazione Torce & Fiamme -->
          <div class="norse-panel rounded-xl p-3 border border-orange-500/40 bg-orange-950/20 space-y-2">
            <span class="text-[10px] font-cinzel font-bold text-orange-300 uppercase tracking-wider block">Intensità Fiamme &amp; Torce</span>
            <p class="text-[10px] text-slate-300 leading-tight">Le torce, i camini e le lanterne proiettano luce dinamica calda su muri e arredi.</p>
            <div class="grid grid-cols-4 gap-1 pt-1">
              <button type="button" onclick="window.Map3D.setTorchMultiplier(0)" class="py-1 rounded-lg text-[10px] font-bold ${currentTorchMultiplier === 0 ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">Spente (0x)</button>
              <button type="button" onclick="window.Map3D.setTorchMultiplier(1)" class="py-1 rounded-lg text-[10px] font-bold ${currentTorchMultiplier === 1 ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">1.0x</button>
              <button type="button" onclick="window.Map3D.setTorchMultiplier(1.5)" class="py-1 rounded-lg text-[10px] font-bold ${currentTorchMultiplier === 1.5 ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">1.5x</button>
              <button type="button" onclick="window.Map3D.setTorchMultiplier(2)" class="py-1 rounded-lg text-[10px] font-bold ${currentTorchMultiplier === 2 ? 'bg-orange-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">2.0x</button>
            </div>
          </div>
        </div>
      `;
    }
    // =========================================================================
    // 5. MODALITÀ: TOKEN & EROI (CAMPAIGN MEMBERS & MONSTER SPAWNER)
    // =========================================================================
    else if (activeMode === 'tokens') {
      const camp = (window.campaignsData && window.campaignsData[currentCampCode]) || {};
      const members = camp.members || {};
      const memberList = Object.entries(members).map(([k, v]) => ({ key: k, ...v }));

      const monsterList = [
        { id: 'wolf', name: "Lupo dell'Inverno", icon: '🐺', hp: 32, type: 'Bestia' },
        { id: 'draugr', name: 'Draugr dei Ghiacci', icon: '🧟', hp: 45, type: 'Non Morto' },
        { id: 'berserker', name: 'Berserker Nemico', icon: '👹', hp: 67, type: 'Umanoide' },
        { id: 'skeleton', name: 'Scheletro Guerriero', icon: '💀', hp: 22, type: 'Non Morto' },
        { id: 'jotunn', name: 'Jötunn del Gelo', icon: '🧌', hp: 138, type: 'Gigante' }
      ];

      dockEl.innerHTML = `
        <div class="space-y-3">
          <!-- Membri Attivi della Campagna -->
          <div class="norse-panel rounded-xl p-3 border border-sky-500/40 bg-sky-950/20 space-y-2">
            <span class="text-[10px] font-cinzel font-bold text-sky-300 uppercase tracking-wider block">Pedine Eroi in Gioco (${memberList.length})</span>
            ${memberList.length === 0 ? `
              <p class="text-[10px] text-slate-400 italic">Nessun eroe presente in questa campagna.</p>
            ` : `
              <div class="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                ${memberList.map(m => `
                  <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-1.5">
                    <div class="min-w-0 flex-1">
                      <div class="font-bold text-xs text-white truncate flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full ${m.isEnemy ? 'bg-rose-500' : 'bg-emerald-400'}"></span>
                        ${m.name || m.key}
                      </div>
                      <div class="text-[9px] text-slate-400">${m.charClass || 'Guerriero'} • PV: ${m.hp || 20}/${m.maxHp || 20}</div>
                    </div>
                    <button type="button" onclick="window.Map3D.centerCameraOnMiniature('${m.key}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-bold border border-slate-700">
                      Inquadra
                    </button>
                  </div>
                `).join('')}
              </div>
            `}
          </div>

          <!-- Spawner Mostri Norreni del DM -->
          <div class="norse-panel rounded-xl p-3 border border-rose-500/40 bg-rose-950/20 space-y-2">
            <span class="text-[10px] font-cinzel font-bold text-rose-300 uppercase tracking-wider block">Schiera Mostri del Bestiario (DM)</span>
            <p class="text-[10px] text-slate-300 leading-tight">Posiziona istantaneamente un nemico sulla griglia alla coordinata del cursore.</p>
            <div class="space-y-1.5">
              ${monsterList.map(m => `
                <div class="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">${m.icon}</span>
                    <div>
                      <div class="font-bold text-xs text-rose-200">${m.name}</div>
                      <div class="text-[9px] text-slate-400">${m.type} • PV: ${m.hp}</div>
                    </div>
                  </div>
                  <button type="button" onclick="window.Map3D.spawnMonsterToken('${m.id}')"
                          class="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-cinzel font-bold text-[10px] shadow">
                    Schiera
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
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
    switchMode: switchMode,
    switchTab: function(tab) {
      activeTab = tab;
      activeMode = 'objects';
      toolMode = 'build';
      const assets = ASSET_CATALOG[tab] || [];
      if (assets.length > 0) {
        selectedAssetId = assets[0].id;
        updateGhostPreview();
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
      if (bBuild) bBuild.className = (mode === 'build') ? 'px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold bg-sky-500 text-slate-950 transition' : 'px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold bg-slate-950 text-slate-300 transition';
      if (bDelete) bDelete.className = (mode === 'delete') ? 'px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold bg-rose-600 text-white transition' : 'px-2.5 py-1 rounded-lg text-[11px] font-cinzel font-bold bg-slate-950 text-slate-400 transition';
    },
    rotateAsset: function() {
      assetRotationY = (assetRotationY + Math.PI / 2) % (Math.PI * 2);
      if (ghostGroup) ghostGroup.rotation.y = assetRotationY;
    },
    adjustElevation: function(delta) {
      currentElevation = Math.max(0.0, Math.min(6.0, currentElevation + delta));
      renderElevatorUI();
    },
    setTerrainBrushSize: function(sz) {
      terrainBrushSize = sz;
      renderDockUI();
    },
    selectTerrain: function(id) {
      selectedTerrainId = id;
      toolMode = 'terrain';
      renderDockUI();
    },
    fillEntireMapWithBiome: fillEntireMapWithBiome,
    setTimeOfDay: setTimeOfDay,
    setWeather: setWeather,
    setTorchMultiplier: setTorchMultiplier,
    setAtmosphere: setAtmosphere, // backwards compatibility
    toggleCinematicMode: toggleCinematicMode,
    toggleGrid: function() {
      if (gridHelper) gridHelper.visible = !gridHelper.visible;
      const btn = document.getElementById('map3d-btn-grid');
      if (btn) btn.classList.toggle('text-sky-300', gridHelper.visible);
    },
    toggleCameraMode: function() {
      if (cameraMode === 'tactical') {
        cameraMode = 'isometric';
      } else if (cameraMode === 'isometric') {
        cameraMode = 'pov';
        povPos.set(cameraTarget.x, currentElevation + 1.7, cameraTarget.z);
        povYaw = cameraYaw;
      } else {
        cameraMode = 'tactical';
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
    spawnMonsterToken: spawnMonsterToken,
    centerCameraOnMiniature: centerCameraOnMiniature,
    getMapTiles: function() {
      return mapTiles;
    },
    getMiniaturesCount: function() {
      return Object.keys(miniatureObjects).length;
    }
  };
})();
