// ============================================================================
// MAPPA TATTICA 3D & MAP BUILDER NAVIGABILE (STILE TALESPIRE)
// Telecamera WASD, Griglia Magnetica 1.5m, InstancedMesh e Miniature Real-Time
// ============================================================================

window.Map3D = (function() {
  const GRID_SIZE = 1.5; // 1 casella = 1.5 metri (standard D&D 5e)

  let container = null;
  let scene = null;
  let camera = null;
  let renderer = null;
  let animationId = null;

  let currentCampCode = 'MIDGARD-VALHALLA';
  let userRole = 'PLAYER'; // 'DM' o 'PLAYER'
  let currentUser = 'admin';

  // Stato Telecamera Tattica TaleSpire
  let cameraTarget = new THREE.Vector3(0, 0, 0);
  let cameraDistance = 14;
  let cameraYaw = Math.PI / 4;
  let cameraPitch = 0.85; // radianti dall'alto

  const keysPressed = {};
  let isRightMouseDown = false;
  let prevMouseX = 0;
  let prevMouseY = 0;

  // Strumenti DM Map Builder
  let buildMode = 'select'; // 'select', 'build', 'delete'
  let selectedBlockType = 'terrain_rock';
  let blockRotationY = 0; // radianti (rotazione con tasto R)

  // Dati Mappa 3D: Array di { x, y, z, type, rotY }
  let mapTiles = [];
  let instancedMeshes = {};
  let torchLights = [];

  // Miniature Eroi e Nemici presenti sulla griglia
  let miniatureObjects = {}; // key: uKey -> { group, targetPos, currentPos, data }
  let selectedMiniatureId = null;

  // Cursore Magnetico
  let cursorBox = null;
  let ghostMesh = null;
  let raycaster = new THREE.Raycaster();
  let mouseNorm = new THREE.Vector2(-999, -999);
  let snappedCoord = new THREE.Vector3(0, 0, 0);

  // Geometrie e Materiali Condivisi PBR
  let blockGeometries = {};
  let blockMaterials = {};

  function initGeometriesAndMaterials() {
    // 1. Terreno Roccia
    blockGeometries['terrain_rock'] = new THREE.BoxGeometry(GRID_SIZE, 0.5, GRID_SIZE);
    blockMaterials['terrain_rock'] = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.88,
      metalness: 0.12
    });

    // 2. Terreno Neve
    blockGeometries['terrain_snow'] = new THREE.BoxGeometry(GRID_SIZE, 0.5, GRID_SIZE);
    blockMaterials['terrain_snow'] = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.95,
      metalness: 0.05
    });

    // 3. Terreno Ghiaccio
    blockGeometries['terrain_ice'] = new THREE.BoxGeometry(GRID_SIZE, 0.45, GRID_SIZE);
    blockMaterials['terrain_ice'] = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.35,
      transparent: true,
      opacity: 0.85
    });

    // 4. Terreno Legno Vichingo
    blockGeometries['terrain_wood'] = new THREE.BoxGeometry(GRID_SIZE, 0.4, GRID_SIZE);
    blockMaterials['terrain_wood'] = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.80,
      metalness: 0.05
    });

    // 5. Muro in Pietra Fortificato
    blockGeometries['wall_stone'] = new THREE.BoxGeometry(GRID_SIZE, 2.0, 0.4);
    blockMaterials['wall_stone'] = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.85,
      metalness: 0.15
    });

    // 6. Pilastro Runico Intagliato
    blockGeometries['pillar_rune'] = new THREE.CylinderGeometry(0.35, 0.4, 2.6, 8);
    blockMaterials['pillar_rune'] = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.3
    });

    // 7. Albero Innevato (Composito semplificato per Istanza)
    blockGeometries['tree_snow'] = new THREE.ConeGeometry(0.85, 2.8, 7);
    blockMaterials['tree_snow'] = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      roughness: 0.9,
      metalness: 0.05
    });

    // 8. Torcia con Luce Calda
    blockGeometries['torch_light'] = new THREE.CylinderGeometry(0.08, 0.05, 0.6, 6);
    blockMaterials['torch_light'] = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.9,
      roughness: 0.4
    });

    // 9. Cassa del Dungeon
    blockGeometries['dungeon_chest'] = new THREE.BoxGeometry(0.9, 0.6, 0.6);
    blockMaterials['dungeon_chest'] = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.7,
      metalness: 0.2
    });
  }

  // ============================================================================
  // GESTIONE INSTANCED MESH PER 60 FPS COSTANTI
  // ============================================================================
  function rebuildInstancedMeshes() {
    // Rimuovi vecchi instanced meshes e luci torce
    Object.values(instancedMeshes).forEach(m => {
      scene.remove(m);
      if (m.dispose) m.dispose();
    });
    instancedMeshes = {};

    torchLights.forEach(l => scene.remove(l));
    torchLights = [];

    // Raggruppa i tile per tipo
    const groups = {};
    mapTiles.forEach(tile => {
      if (!groups[tile.type]) groups[tile.type] = [];
      groups[tile.type].push(tile);
    });

    const dummy = new THREE.Object3D();

    Object.entries(groups).forEach(([type, tiles]) => {
      const geo = blockGeometries[type];
      const mat = blockMaterials[type];
      if (!geo || !mat) return;

      const instMesh = new THREE.InstancedMesh(geo, mat, tiles.length);
      instMesh.castShadow = true;
      instMesh.receiveShadow = true;

      tiles.forEach((t, idx) => {
        dummy.position.set(t.x, t.y, t.z);
        dummy.rotation.set(0, t.rotY || 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instMesh.setMatrixAt(idx, dummy.matrix);

        // Se torcia, piazza una PointLight dinamica calda
        if (type === 'torch_light') {
          const pLight = new THREE.PointLight(0xf59e0b, 1.2, 7.5);
          pLight.position.set(t.x, t.y + 0.45, t.z);
          scene.add(pLight);
          torchLights.push(pLight);
        }
      });

      instMesh.instanceMatrix.needsUpdate = true;
      scene.add(instMesh);
      instancedMeshes[type] = instMesh;
    });
  }

  // Mappa di default iniziale (Piattaforma di Roccia e Neve con Pilastri e Torce)
  function createDefaultMapTiles() {
    const defaultTiles = [];
    // Piano base 12x12
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        const isSnow = Math.abs(x) > 3 || Math.abs(z) > 3;
        defaultTiles.push({
          x: x * GRID_SIZE,
          y: 0,
          z: z * GRID_SIZE,
          type: isSnow ? 'terrain_snow' : 'terrain_rock',
          rotY: 0
        });
      }
    }

    // Pilastri runici ai quattro angoli della sala
    defaultTiles.push({ x: -4 * GRID_SIZE, y: 1.3, z: -4 * GRID_SIZE, type: 'pillar_rune', rotY: 0 });
    defaultTiles.push({ x: 4 * GRID_SIZE, y: 1.3, z: -4 * GRID_SIZE, type: 'pillar_rune', rotY: 0 });
    defaultTiles.push({ x: -4 * GRID_SIZE, y: 1.3, z: 4 * GRID_SIZE, type: 'pillar_rune', rotY: 0 });
    defaultTiles.push({ x: 4 * GRID_SIZE, y: 1.3, z: 4 * GRID_SIZE, type: 'pillar_rune', rotY: 0 });

    // Torce accese
    defaultTiles.push({ x: -2 * GRID_SIZE, y: 0.4, z: -4 * GRID_SIZE, type: 'torch_light', rotY: 0 });
    defaultTiles.push({ x: 2 * GRID_SIZE, y: 0.4, z: -4 * GRID_SIZE, type: 'torch_light', rotY: 0 });

    // Cassa del Dungeon al fondo
    defaultTiles.push({ x: 0, y: 0.45, z: -4 * GRID_SIZE, type: 'dungeon_chest', rotY: 0 });

    return defaultTiles;
  }

  // ============================================================================
  // CARICAMENTO MINIATURE 3D IN TEMPO REALE SULLA MAPPA
  // ============================================================================
  function syncCampaignMiniatures() {
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (!camp || !camp.members) return;

    const currentMemberKeys = Object.keys(camp.members);

    // Rimuovi miniature di giocatori usciti
    Object.keys(miniatureObjects).forEach(uKey => {
      if (!camp.members[uKey]) {
        scene.remove(miniatureObjects[uKey].group);
        delete miniatureObjects[uKey];
      }
    });

    currentMemberKeys.forEach((uKey, idx) => {
      const mChar = camp.members[uKey];
      if (!mChar) return;

      // Coordinate assegnate o calcolo automatico su griglia iniziale
      const posX = mChar.posX !== undefined ? mChar.posX : (idx - 1) * GRID_SIZE;
      const posY = mChar.posY !== undefined ? mChar.posY : 0.25;
      const posZ = mChar.posZ !== undefined ? mChar.posZ : 2 * GRID_SIZE;

      let miniEntry = miniatureObjects[uKey];

      if (!miniEntry) {
        // Crea gruppo miniatura
        const group = new THREE.Group();

        // Se l'eroe ha una miniatura creata nella Fucina dell'Eroe 3D, usala!
        if (mChar.miniature3D && window.Forge3D && typeof window.Forge3D.buildProceduralMiniature === 'function') {
          const procMini = window.Forge3D.buildProceduralMiniature(mChar.miniature3D);
          group.add(procMini);
        } else {
          // Basetta runica standard con figura scolpita
          const baseMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.55, 0.6, 0.15, 16),
            new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.3 })
          );
          baseMesh.position.y = 0.08;
          group.add(baseMesh);

          // Corpo estilizzato generico
          const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.28, 1.4, 8),
            new THREE.MeshStandardMaterial({ color: uKey === currentUser ? 0x0284c7 : 0xb45309, roughness: 0.6 })
          );
          body.position.y = 0.85;
          group.add(body);
        }

        // Anello di selezione luminoso alla base
        const selRing = new THREE.Mesh(
          new THREE.RingGeometry(0.65, 0.75, 24),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })
        );
        selRing.rotation.x = -Math.PI / 2;
        selRing.position.y = 0.02;
        selRing.name = 'selRing';
        selRing.visible = (uKey === selectedMiniatureId);
        group.add(selRing);

        // Cartellino Flottante con Nome Eroe (non copre la miniatura)
        const nameSprite = createNameplateSprite(`${mChar.name} (Liv.${mChar.level || 1})`, uKey === currentUser);
        nameSprite.position.set(0, 3.2, 0);
        group.add(nameSprite);

        group.position.set(posX, posY, posZ);
        group.userData = { uKey: uKey, charData: mChar };
        scene.add(group);

        miniatureObjects[uKey] = {
          group: group,
          currentPos: new THREE.Vector3(posX, posY, posZ),
          targetPos: new THREE.Vector3(posX, posY, posZ),
          data: mChar
        };
      } else {
        // Aggiorna posizione target se cambiata da remoto
        miniEntry.targetPos.set(posX, posY, posZ);
        const ring = miniEntry.group.getObjectByName('selRing');
        if (ring) ring.visible = (uKey === selectedMiniatureId);
      }
    });
  }

  function createNameplateSprite(text, isMe) {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 128;
    const ctx = cv.getContext('2d');

    ctx.fillStyle = isMe ? 'rgba(12, 74, 110, 0.85)' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isMe ? '#38bdf8' : '#64748b';
    ctx.lineWidth = 6;

    // Riquadro arrotondato
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 96, 24);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = isMe ? '#7dd3fc' : '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 64);

    const tex = new THREE.CanvasTexture(cv);
    const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.6, 1);
    return sprite;
  }

  // ============================================================================
  // MOVIMENTO FLUIDO DELLA MINIATURA & SYNC CLOUD
  // ============================================================================
  function moveSelectedMiniatureTo(targetX, targetZ) {
    if (!selectedMiniatureId) return;
    const mini = miniatureObjects[selectedMiniatureId];
    if (!mini) return;

    // Solo il DM può muovere chiunque; il giocatore muove solo se stesso
    if (userRole !== 'DM' && selectedMiniatureId !== currentUser) {
      if (typeof window.showToast === 'function') {
        window.showToast("Movimento Negato", "Puoi muovere solo la miniatura del tuo eroe.", "warning");
      }
      return;
    }

    mini.targetPos.set(targetX, 0.25, targetZ);

    // Salva coordinate su Firebase
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (camp && camp.members && camp.members[selectedMiniatureId]) {
      camp.members[selectedMiniatureId].posX = targetX;
      camp.members[selectedMiniatureId].posY = 0.25;
      camp.members[selectedMiniatureId].posZ = targetZ;

      if (typeof window.saveDB === 'function') window.saveDB();

      try {
        const bc = new BroadcastChannel('ragnarok_sync_channel');
        bc.postMessage({
          type: 'MINIATURE_MOVED',
          campCode: currentCampCode,
          uKey: selectedMiniatureId,
          pos: { x: targetX, y: 0.25, z: targetZ }
        });
      } catch (e) {}
    }
  }

  // ============================================================================
  // TELECAMERA TATTICA TALESPIRE (WASD + ORBIT & ZOOM)
  // ============================================================================
  function updateCameraControls(delta) {
    // 1. Movimento WASD sul piano orizzontale relativo all'angolo camera
    const speed = 12 * delta;
    const forward = new THREE.Vector3(-Math.sin(cameraYaw), 0, -Math.cos(cameraYaw));
    const right = new THREE.Vector3(Math.cos(cameraYaw), 0, -Math.sin(cameraYaw));

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) cameraTarget.addScaledVector(forward, speed);
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) cameraTarget.addScaledVector(forward, -speed);
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) cameraTarget.addScaledVector(right, -speed);
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) cameraTarget.addScaledVector(right, speed);

    // Rotazione rapida Q / E
    if (keysPressed['KeyQ']) cameraYaw -= 1.8 * delta;
    if (keysPressed['KeyE']) cameraYaw += 1.8 * delta;

    // Calcolo posizione sferica camera
    const phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, cameraPitch));
    const x = cameraTarget.x + cameraDistance * Math.sin(phi) * Math.sin(cameraYaw);
    const y = cameraTarget.y + cameraDistance * Math.cos(phi);
    const z = cameraTarget.z + cameraDistance * Math.sin(phi) * Math.cos(cameraYaw);

    camera.position.set(x, y, z);
    camera.lookAt(cameraTarget);
  }

  // ============================================================================
  // RAYCASTING MAGNETICO SULLA GRIGLIA
  // ============================================================================
  function updateRaycasting() {
    if (!renderer || !camera) return;

    raycaster.setFromCamera(mouseNorm, camera);

    // Piano di intersezione a terra y = 0
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectPt = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, intersectPt)) {
      // Snapping magnetico alla griglia
      const snapX = Math.round(intersectPt.x / GRID_SIZE) * GRID_SIZE;
      const snapZ = Math.round(intersectPt.z / GRID_SIZE) * GRID_SIZE;
      snappedCoord.set(snapX, 0, snapZ);

      if (cursorBox) {
        cursorBox.position.set(snapX, 0.05, snapZ);
        cursorBox.visible = true;
      }
      if (ghostMesh && buildMode === 'build' && userRole === 'DM') {
        ghostMesh.position.set(snapX, 0.25, snapZ);
        ghostMesh.rotation.y = blockRotationY;
        ghostMesh.visible = true;
      } else if (ghostMesh) {
        ghostMesh.visible = false;
      }
    } else {
      if (cursorBox) cursorBox.visible = false;
      if (ghostMesh) ghostMesh.visible = false;
    }
  }

  // Gestione Click Viewport: Piazza, Rimuovi o Muovi Miniatura
  function handlePointerDown(e) {
    if (e.button === 2) {
      // Tasto Destro: attiva orbita telecamera
      isRightMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      return;
    }

    if (e.button === 0) {
      // Tasto Sinistro: Esegui azione
      if (buildMode === 'build' && userRole === 'DM') {
        // Piazza Blocco
        placeBlockAt(snappedCoord.x, 0, snappedCoord.z, selectedBlockType, blockRotationY);
      } else if (buildMode === 'delete' && userRole === 'DM') {
        // Rimuovi Blocco
        removeBlockAt(snappedCoord.x, snappedCoord.z);
      } else {
        // Modalità Selezione / Movimento
        // 1. Controlla se hai cliccato sopra una miniatura
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
              window.showToast("Miniatura Selezionata", `Selezionato [${chName}]. Clicca su una casella della griglia per spostarlo!`, "info");
            }
            return;
          }
        }

        // 2. Altrimenti muovi la miniatura selezionata sulla casella cliccata
        if (selectedMiniatureId) {
          moveSelectedMiniatureTo(snappedCoord.x, snappedCoord.z);
        }
      }
    }
  }

  function placeBlockAt(x, y, z, type, rotY) {
    // Rimuovi eventuale tile esistente sulla stessa coordinata
    mapTiles = mapTiles.filter(t => !(Math.abs(t.x - x) < 0.1 && Math.abs(t.z - z) < 0.1));
    mapTiles.push({ x: x, y: y, z: z, type: type, rotY: rotY });
    rebuildInstancedMeshes();
    saveMapToCampaign();
  }

  function removeBlockAt(x, z) {
    const beforeLen = mapTiles.length;
    mapTiles = mapTiles.filter(t => !(Math.abs(t.x - x) < 0.1 && Math.abs(t.z - z) < 0.1));
    if (mapTiles.length !== beforeLen) {
      rebuildInstancedMeshes();
      saveMapToCampaign();
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
  // INIZIALIZZAZIONE DELLA SCENA 3D TALESPIRE
  // ============================================================================
  function initTacticalEngine(viewportEl) {
    container = viewportEl;
    container.innerHTML = '';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.025);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.2, 200);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Illuminazione Tattica Atmosferica
    const ambLight = new THREE.AmbientLight(0x475569, 1.2);
    scene.add(ambLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    sunLight.position.set(15, 25, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    scene.add(sunLight);

    initGeometriesAndMaterials();

    // Griglia Magnetica a Terra
    const gridHelper = new THREE.GridHelper(30, 20, 0x38bdf8, 0x1e293b);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Riquadro Cursore Magnetico
    const boxGeo = new THREE.BoxGeometry(GRID_SIZE, 0.08, GRID_SIZE);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true });
    cursorBox = new THREE.Mesh(boxGeo, boxMat);
    cursorBox.visible = false;
    scene.add(cursorBox);

    // Ghost Mesh di anteprima piazzamento DM
    ghostMesh = new THREE.Mesh(
      blockGeometries['terrain_rock'],
      new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.55 })
    );
    ghostMesh.visible = false;
    scene.add(ghostMesh);

    // Carica Tiles da Campagna o crea Default
    const camp = window.dbState && window.dbState.campaigns && window.dbState.campaigns[currentCampCode];
    if (camp && camp.tacticalMap3D && Array.isArray(camp.tacticalMap3D) && camp.tacticalMap3D.length > 0) {
      mapTiles = camp.tacticalMap3D;
    } else {
      mapTiles = createDefaultMapTiles();
    }
    rebuildInstancedMeshes();

    // Sincronizza miniature
    syncCampaignMiniatures();

    // Event Listeners Input
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', () => { isRightMouseDown = false; });
    container.addEventListener('wheel', onMouseWheel, { passive: false });
    container.addEventListener('contextmenu', e => e.preventDefault());

    // Render loop a 60 FPS
    let clock = new THREE.Clock();
    function renderLoop() {
      animationId = requestAnimationFrame(renderLoop);
      const delta = clock.getDelta();

      updateCameraControls(delta);
      updateRaycasting();

      // Interpolazione fluida della posizione delle miniature (sliding)
      Object.values(miniatureObjects).forEach(m => {
        m.currentPos.lerp(m.targetPos, 0.14);
        m.group.position.copy(m.currentPos);
      });

      renderer.render(scene, camera);
    }
    renderLoop();

    // Resize Handler
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
    if (e.code === 'KeyR') {
      blockRotationY = (blockRotationY + Math.PI / 2) % (Math.PI * 2);
      if (ghostMesh) ghostMesh.rotation.y = blockRotationY;
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
      cameraYaw += dx * 0.005;
      cameraPitch = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, cameraPitch - dy * 0.005));
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    }
  }

  function onMouseWheel(e) {
    e.preventDefault();
    cameraDistance = Math.max(2.5, Math.min(45.0, cameraDistance + e.deltaY * 0.015));
  }

  // ============================================================================
  // APERTURA / CHIUSURA VISTA MAPPA TATTICA 3D
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
      initTacticalEngine(viewport);
      renderBuildToolbar();
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

  function renderBuildToolbar() {
    const tb = document.getElementById('map3d-dm-toolbar');
    if (!tb) return;
    if (userRole !== 'DM') {
      tb.classList.add('hidden');
      return;
    }
    tb.classList.remove('hidden');

    const blocks = [
      { id: 'terrain_rock', label: 'Roccia' },
      { id: 'terrain_snow', label: 'Neve' },
      { id: 'terrain_ice', label: 'Ghiaccio' },
      { id: 'terrain_wood', label: 'Legno' },
      { id: 'wall_stone', label: 'Muro' },
      { id: 'pillar_rune', label: 'Pilastro' },
      { id: 'tree_snow', label: 'Albero' },
      { id: 'torch_light', label: 'Torcia' },
      { id: 'dungeon_chest', label: 'Cassa' }
    ];

    const blocksHTML = blocks.map(b => `
      <button type="button" onclick="window.Map3D.selectBlock('${b.id}')"
              class="px-2.5 py-1.5 rounded-lg border text-[11px] font-cinzel font-bold transition ${selectedBlockType === b.id ? 'bg-amber-500/30 border-amber-400 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'}">
        ${b.label}
      </button>
    `).join('');

    tb.innerHTML = `
      <div class="norse-panel rounded-2xl p-2.5 border border-sky-500/40 shadow-2xl flex flex-wrap items-center gap-2 max-w-4xl bg-slate-950/95 backdrop-blur-md">
        <div class="flex items-center gap-1 border-r border-slate-800 pr-2">
          <button type="button" onclick="window.Map3D.setBuildMode('select')" class="px-3 py-1.5 rounded-lg text-xs font-cinzel font-black transition ${buildMode === 'select' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">
            🖐️ Muovi
          </button>
          <button type="button" onclick="window.Map3D.setBuildMode('build')" class="px-3 py-1.5 rounded-lg text-xs font-cinzel font-black transition ${buildMode === 'build' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">
            🔨 Piazza
          </button>
          <button type="button" onclick="window.Map3D.setBuildMode('delete')" class="px-3 py-1.5 rounded-lg text-xs font-cinzel font-black transition ${buildMode === 'delete' ? 'bg-red-500 text-slate-950' : 'bg-slate-900 text-slate-300'}">
            ❌ Rimuovi
          </button>
        </div>

        <div class="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5">
          ${blocksHTML}
        </div>

        <div class="border-l border-slate-800 pl-2 flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <span>Ruota: <strong>[R]</strong></span>
          <button type="button" onclick="window.Map3D.resetDefaultMap()" class="text-rose-400 hover:text-rose-300 font-bold">Resetta</button>
        </div>
      </div>
    `;
  }

  function createTacticalMapDOM() {
    const screen = document.createElement('section');
    screen.id = 'screen-map3d';
    screen.className = 'hidden fixed inset-0 z-50 bg-[#06090e] flex flex-col select-none';
    screen.innerHTML = `
      <!-- Header Superiore Mappa Tattica -->
      <header class="px-4 py-2.5 bg-slate-950/90 border-b border-slate-800 flex justify-between items-center z-20 backdrop-blur-md">
        <div class="flex items-center gap-3">
          <span class="text-sky-400 font-norse text-xl">ᛈ</span>
          <div>
            <h2 class="font-cinzel font-black text-sm text-white tracking-wider flex items-center gap-2">
              <span>MAPPA TATTICA 3D (TALESPIRE)</span>
              <span id="map3d-role-badge" class="text-[9px] px-2 py-0.5 rounded bg-sky-950 border border-sky-400/40 text-sky-300 font-mono font-bold">${userRole}</span>
            </h2>
            <span class="text-[10px] text-slate-400">Griglia D&D (1 casella = 1.5m) • WASD per muoverti • Tasto Destro per ruotare</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" onclick="window.Map3D.closeMap()" class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-cinzel font-bold text-xs transition border border-slate-700">
            Esci dalla Mappa
          </button>
        </div>
      </header>

      <!-- Viewport 3D -->
      <div id="map3d-viewport" class="flex-1 w-full h-full relative overflow-hidden"></div>

      <!-- Barra di Costruzione Esclusiva DM (In Basso) -->
      <div id="map3d-dm-toolbar" class="fixed bottom-4 inset-x-0 flex justify-center z-30 px-4 pointer-events-auto"></div>
    `;

    return screen;
  }

  return {
    openMap: openTacticalMap,
    closeMap: closeTacticalMap,
    setBuildMode: function(mode) {
      buildMode = mode;
      renderBuildToolbar();
    },
    selectBlock: function(type) {
      selectedBlockType = type;
      buildMode = 'build';
      if (ghostMesh) {
        ghostMesh.geometry = blockGeometries[type] || blockGeometries['terrain_rock'];
      }
      renderBuildToolbar();
    },
    resetDefaultMap: function() {
      mapTiles = createDefaultMapTiles();
      rebuildInstancedMeshes();
      saveMapToCampaign();
    },
    getMapTiles: function() {
      return mapTiles;
    },
    getMiniaturesCount: function() {
      return Object.keys(miniatureObjects).length;
    }
  };
})();
