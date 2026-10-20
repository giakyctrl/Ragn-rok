// ============================================================================
// LA FUCINA DELL'EROE 3D (STILE HERO FORGE) - JOURNEY TO RAGNAROK
// Motore di creazione e personalizzazione 3D procedurale per miniature tabletop
// ============================================================================

window.Forge3D = (function() {
  let scene = null;
  let camera = null;
  let renderer = null;
  let controls = null;
  let animationFrameId = null;

  let miniatureGroup = null;
  let pedestalGroup = null;
  let heroGroup = null;
  let pedestalLight = null;

  // Stato corrente di personalizzazione
  let currentConfig = {
    race: 'umano',
    scaleHeight: 1.0,
    scaleBulk: 1.0,
    hairStyle: 'braids',
    beardStyle: 'braided',
    helmetStyle: 'none',
    armorStyle: 'chainmail',
    cloakStyle: 'long',
    rightHand: 'axe',
    leftHand: 'shield',
    colors: {
      metal: '#94a3b8',
      gold: '#f59e0b',
      leather: '#78350f',
      clothPrimary: '#0369a1',
      clothSecondary: '#38bdf8',
      hair: '#fcd34d',
      skin: '#e2b49a',
      rune: '#38bdf8'
    }
  };

  // Clan Color Presets di Journey to Ragnarok
  const CLAN_PRESETS = {
    bear_warriors: { primary: '#451a03', secondary: '#b91c1c', rune: '#f59e0b', metal: '#64748b' },
    gjallarhorn:   { primary: '#1e3a8a', secondary: '#fbbf24', rune: '#38bdf8', metal: '#cbd5e1' },
    icy_crow:      { primary: '#0f172a', secondary: '#38bdf8', rune: '#06b6d4', metal: '#94a3b8' },
    jotunn_sons:   { primary: '#334155', secondary: '#0284c7', rune: '#67e8f9', metal: '#475569' },
    odhinns_eye:   { primary: '#1e1b4b', secondary: '#f59e0b', rune: '#a855f7', metal: '#e2e8f0' },
    wolves_shadow: { primary: '#090d16', secondary: '#059669', rune: '#10b981', metal: '#334155' }
  };

  // Material Cache per ottimizzazione draw calls
  let materials = {};

  function initMaterials() {
    materials.pedestalStone = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      roughness: 0.85,
      metalness: 0.15
    });

    materials.metal = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.metal),
      metalness: 0.85,
      roughness: 0.28
    });

    materials.gold = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.gold),
      metalness: 0.92,
      roughness: 0.22
    });

    materials.leather = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.leather),
      roughness: 0.78,
      metalness: 0.08
    });

    materials.clothPrimary = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.clothPrimary),
      roughness: 0.82,
      metalness: 0.05
    });

    materials.clothSecondary = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.clothSecondary),
      roughness: 0.82,
      metalness: 0.05
    });

    materials.hair = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.hair),
      roughness: 0.90,
      metalness: 0.05
    });

    materials.skin = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.skin),
      roughness: 0.75,
      metalness: 0.0
    });

    materials.rune = new THREE.MeshStandardMaterial({
      color: new THREE.Color(currentConfig.colors.rune),
      emissive: new THREE.Color(currentConfig.colors.rune),
      emissiveIntensity: 0.85,
      roughness: 0.3,
      metalness: 0.2
    });
  }

  function updateMaterialColors() {
    if (!materials.metal) return;
    materials.metal.color.set(currentConfig.colors.metal);
    materials.gold.color.set(currentConfig.colors.gold);
    materials.leather.color.set(currentConfig.colors.leather);
    materials.clothPrimary.color.set(currentConfig.colors.clothPrimary);
    materials.clothSecondary.color.set(currentConfig.colors.clothSecondary);
    materials.hair.color.set(currentConfig.colors.hair);
    materials.skin.color.set(currentConfig.colors.skin);
    materials.rune.color.set(currentConfig.colors.rune);
    materials.rune.emissive.set(currentConfig.colors.rune);
    if (pedestalLight) pedestalLight.color.set(currentConfig.colors.rune);
  }

  // Generatore Texture Procedurale Rune per il Piedistallo
  function createRunicRingCanvas() {
    const cv = document.createElement('canvas');
    cv.width = 512;
    cv.height = 512;
    const ctx = cv.getContext('2d');

    ctx.clearRect(0, 0, 512, 512);

    // Cerchio di base scuro
    ctx.strokeStyle = currentConfig.colors.rune;
    ctx.lineWidth = 14;
    ctx.shadowColor = currentConfig.colors.rune;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(256, 256, 210, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 170, 0, Math.PI * 2);
    ctx.stroke();

    // 16 Rune dell'antico Futhark & Runa Peorð (ᛈ)
    const runes = ['ᛈ', 'ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ'];
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = currentConfig.colors.rune;

    for (let i = 0; i < runes.length; i++) {
      const angle = (i / runes.length) * Math.PI * 2;
      const x = 256 + Math.cos(angle) * 190;
      const y = 256 + Math.sin(angle) * 190;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(runes[i], 0, 0);
      ctx.restore();
    }

    return cv;
  }

  // ============================================================================
  // COSTRUZIONE PIEDISTALLO RUNICO ILLUMINATO
  // ============================================================================
  function buildRunicPedestal() {
    const group = new THREE.Group();

    // Basetta cilindrica a scalino in pietra
    const baseGeo = new THREE.CylinderGeometry(1.65, 1.8, 0.28, 24);
    const baseMesh = new THREE.Mesh(baseGeo, materials.pedestalStone);
    baseMesh.position.y = 0.14;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    // Bordo dorato runico alla sommità
    const rimGeo = new THREE.TorusGeometry(1.62, 0.04, 8, 24);
    rimGeo.rotateX(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, materials.gold);
    rimMesh.position.y = 0.28;
    group.add(rimMesh);

    // Disco runico luminescente
    const runeCv = createRunicRingCanvas();
    const runeTex = new THREE.CanvasTexture(runeCv);
    const runeMat = new THREE.MeshStandardMaterial({
      map: runeTex,
      transparent: true,
      emissive: new THREE.Color(currentConfig.colors.rune),
      emissiveIntensity: 0.95,
      roughness: 0.4
    });
    const runePlane = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 3.1), runeMat);
    runePlane.rotation.x = -Math.PI / 2;
    runePlane.position.y = 0.285;
    group.add(runePlane);

    // Luce d'effetto dal basso verso l'eroe
    pedestalLight = new THREE.PointLight(currentConfig.colors.rune, 1.6, 5);
    pedestalLight.position.set(0, 0.45, 0);
    group.add(pedestalLight);

    return group;
  }

  // ============================================================================
  // COSTRUZIONE PROCEDURALE MINIATURA EROE (LOW-POLY STYLIZED)
  // ============================================================================
  function buildHeroFigure() {
    const hero = new THREE.Group();

    // 1. Proporzioni in base alla stirpe
    let raceScaleX = 1.0;
    let raceScaleY = 1.0;
    let raceScaleZ = 1.0;

    if (currentConfig.race === 'svartalfar') {
      // Nano: compatto, spalle molto larghe
      raceScaleX = 1.30 * currentConfig.scaleBulk;
      raceScaleY = 0.80 * currentConfig.scaleHeight;
      raceScaleZ = 1.25 * currentConfig.scaleBulk;
    } else if (currentConfig.race === 'ljosalfar') {
      // Elfo: alto, slanciato ed elegante
      raceScaleX = 0.92 * currentConfig.scaleBulk;
      raceScaleY = 1.10 * currentConfig.scaleHeight;
      raceScaleZ = 0.92 * currentConfig.scaleBulk;
    } else if (currentConfig.race === 'mezzogigante') {
      // Jötunn: imponente e massiccio
      raceScaleX = 1.28 * currentConfig.scaleBulk;
      raceScaleY = 1.28 * currentConfig.scaleHeight;
      raceScaleZ = 1.25 * currentConfig.scaleBulk;
    } else {
      // Umano
      raceScaleX = 1.0 * currentConfig.scaleBulk;
      raceScaleY = 1.0 * currentConfig.scaleHeight;
      raceScaleZ = 1.0 * currentConfig.scaleBulk;
    }

    const bodyGroup = new THREE.Group();

    // --- GAMBE & STIVALI ---
    const legGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.75, 8);
    const leftLeg = new THREE.Mesh(legGeo, materials.leather);
    leftLeg.position.set(-0.25, 0.65, 0);
    leftLeg.castShadow = true;
    bodyGroup.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, materials.leather);
    rightLeg.position.set(0.25, 0.65, 0);
    rightLeg.castShadow = true;
    bodyGroup.add(rightLeg);

    // Schinieri / fasce nordiche sugli stivali
    const shinGeo = new THREE.CylinderGeometry(0.155, 0.145, 0.45, 8);
    const leftShin = new THREE.Mesh(shinGeo, materials.clothPrimary);
    leftShin.position.set(-0.25, 0.55, 0);
    bodyGroup.add(leftShin);
    const rightShin = new THREE.Mesh(shinGeo, materials.clothPrimary);
    rightShin.position.set(0.25, 0.55, 0);
    bodyGroup.add(rightShin);

    // --- BACINO & CINTURA ---
    const hipsGeo = new THREE.CylinderGeometry(0.38, 0.32, 0.3, 8);
    const hips = new THREE.Mesh(hipsGeo, materials.leather);
    hips.position.set(0, 1.12, 0);
    bodyGroup.add(hips);

    // Fibbia della cintura dorata con runa incisa
    const beltBuckleGeo = new THREE.BoxGeometry(0.16, 0.12, 0.08);
    const beltBuckle = new THREE.Mesh(beltBuckleGeo, materials.gold);
    beltBuckle.position.set(0, 1.12, 0.32);
    bodyGroup.add(beltBuckle);

    // --- TORSO & CORAZZA ---
    const torsoGeo = new THREE.CylinderGeometry(0.48, 0.36, 0.72, 8);
    let torsoMat = materials.clothPrimary;
    if (currentConfig.armorStyle === 'chainmail' || currentConfig.armorStyle === 'plate') {
      torsoMat = materials.metal;
    } else if (currentConfig.armorStyle === 'leather') {
      torsoMat = materials.leather;
    }
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.set(0, 1.58, 0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    // Bordura / spalline d'onore
    const pauldronsGeo = new THREE.SphereGeometry(0.22, 6, 6);
    const leftPauldron = new THREE.Mesh(pauldronsGeo, materials.metal);
    leftPauldron.scale.set(1.2, 0.7, 1.0);
    leftPauldron.position.set(-0.52, 1.86, 0);
    bodyGroup.add(leftPauldron);

    const rightPauldron = new THREE.Mesh(pauldronsGeo, materials.metal);
    rightPauldron.scale.set(1.2, 0.7, 1.0);
    rightPauldron.position.set(0.52, 1.86, 0);
    bodyGroup.add(rightPauldron);

    // --- MANTELLO VICHINGO ---
    if (currentConfig.cloakStyle !== 'none') {
      const cloakLen = currentConfig.cloakStyle === 'long' ? 1.4 : 0.85;
      const cloakGeo = new THREE.ConeGeometry(0.65, cloakLen, 8, 1, true, -Math.PI / 2, Math.PI);
      const cloak = new THREE.Mesh(cloakGeo, materials.clothSecondary);
      cloak.position.set(0, 1.85 - cloakLen / 2, -0.22);
      cloak.rotation.x = 0.15;
      bodyGroup.add(cloak);

      // Spilla del mantello
      const broochGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 12);
      const brooch = new THREE.Mesh(broochGeo, materials.gold);
      brooch.position.set(0.2, 1.84, 0.38);
      bodyGroup.add(brooch);
    }

    // --- COLLO & TESTA ---
    const neckGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.2, 8);
    const neck = new THREE.Mesh(neckGeo, materials.skin);
    neck.position.set(0, 1.98, 0);
    bodyGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 2.18, 0);

    const headGeo = new THREE.SphereGeometry(0.26, 10, 10);
    headGeo.scale(1.0, 1.15, 1.0);
    const head = new THREE.Mesh(headGeo, materials.skin);
    head.castShadow = true;
    headGroup.add(head);

    // Orecchie (a punta se Ljósálfar)
    const isElf = (currentConfig.race === 'ljosalfar');
    const earGeo = isElf ? new THREE.ConeGeometry(0.06, 0.18, 5) : new THREE.SphereGeometry(0.06, 5, 5);
    const leftEar = new THREE.Mesh(earGeo, materials.skin);
    leftEar.position.set(-0.28, 0.02, -0.02);
    leftEar.rotation.z = isElf ? Math.PI / 3 : 0;
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, materials.skin);
    rightEar.position.set(0.28, 0.02, -0.02);
    rightEar.rotation.z = isElf ? -Math.PI / 3 : 0;
    headGroup.add(rightEar);

    // Naso
    const noseGeo = new THREE.ConeGeometry(0.045, 0.12, 4);
    const nose = new THREE.Mesh(noseGeo, materials.skin);
    nose.position.set(0, 0.02, 0.28);
    nose.rotation.x = Math.PI / 2;
    headGroup.add(nose);

    // --- CAPELLI MODULARI ---
    if (currentConfig.hairStyle === 'braids') {
      // Doppie trecce vichinghe
      const topHairGeo = new THREE.SphereGeometry(0.28, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const topHair = new THREE.Mesh(topHairGeo, materials.hair);
      topHair.position.set(0, 0.06, 0);
      headGroup.add(topHair);

      const braidGeo = new THREE.CylinderGeometry(0.04, 0.025, 0.6, 6);
      const leftBraid = new THREE.Mesh(braidGeo, materials.hair);
      leftBraid.position.set(-0.2, -0.22, 0.12);
      leftBraid.rotation.z = -0.15;
      headGroup.add(leftBraid);

      const rightBraid = new THREE.Mesh(braidGeo, materials.hair);
      rightBraid.position.set(0.2, -0.22, 0.12);
      rightBraid.rotation.z = 0.15;
      headGroup.add(rightBraid);
    } else if (currentConfig.hairStyle === 'berserkr') {
      // Cresta mohawk selvaggia
      const crestGeo = new THREE.BoxGeometry(0.10, 0.35, 0.55);
      const crest = new THREE.Mesh(crestGeo, materials.hair);
      crest.position.set(0, 0.26, -0.02);
      headGroup.add(crest);
    } else if (currentConfig.hairStyle === 'ponytail') {
      // Codino posteriore da guerriero
      const topHairGeo = new THREE.SphereGeometry(0.28, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const topHair = new THREE.Mesh(topHairGeo, materials.hair);
      headGroup.add(topHair);

      const tailGeo = new THREE.CylinderGeometry(0.06, 0.03, 0.45, 6);
      const tail = new THREE.Mesh(tailGeo, materials.hair);
      tail.position.set(0, 0.05, -0.32);
      tail.rotation.x = -Math.PI / 4;
      headGroup.add(tail);
    } else if (currentConfig.hairStyle === 'long') {
      // Capelli lunghi sulle spalle
      const longHairGeo = new THREE.CylinderGeometry(0.28, 0.36, 0.7, 8, 1, true);
      const longHair = new THREE.Mesh(longHairGeo, materials.hair);
      longHair.position.set(0, -0.1, -0.06);
      headGroup.add(longHair);
    }

    // --- BARBA MODULARE ---
    if (currentConfig.beardStyle === 'goatee') {
      const goateeGeo = new THREE.ConeGeometry(0.08, 0.22, 6);
      const goatee = new THREE.Mesh(goateeGeo, materials.hair);
      goatee.position.set(0, -0.24, 0.22);
      goatee.rotation.x = -0.3;
      headGroup.add(goatee);
    } else if (currentConfig.beardStyle === 'braided') {
      // Barba vichinga folta intrecciata con perline runiche dorate
      const beardGeo = new THREE.BoxGeometry(0.24, 0.32, 0.18);
      const beard = new THREE.Mesh(beardGeo, materials.hair);
      beard.position.set(0, -0.18, 0.2);
      headGroup.add(beard);

      // Treccia centrale
      const braidGeo = new THREE.CylinderGeometry(0.05, 0.03, 0.35, 6);
      const braid = new THREE.Mesh(braidGeo, materials.hair);
      braid.position.set(0, -0.38, 0.22);
      headGroup.add(braid);

      // Perlina runica
      const beadGeo = new THREE.TorusGeometry(0.045, 0.02, 6, 8);
      const bead = new THREE.Mesh(beadGeo, materials.gold);
      bead.position.set(0, -0.42, 0.22);
      bead.rotation.x = Math.PI / 2;
      headGroup.add(bead);
    } else if (currentConfig.beardStyle === 'jarl') {
      // Barba maestosa da Jarl
      const bigBeardGeo = new THREE.ConeGeometry(0.24, 0.55, 8);
      const bigBeard = new THREE.Mesh(bigBeardGeo, materials.hair);
      bigBeard.position.set(0, -0.32, 0.18);
      bigBeard.rotation.x = -0.15;
      headGroup.add(bigBeard);
    }

    // --- ELMO MODULARE ---
    if (currentConfig.helmetStyle === 'spangenhelm') {
      // Elmo di Gjermundbu con calotta, nasale e occhiali di ferro
      const domeGeo = new THREE.SphereGeometry(0.32, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      const dome = new THREE.Mesh(domeGeo, materials.metal);
      dome.position.set(0, 0.08, 0);
      headGroup.add(dome);

      // Maschera occhiali e nasale
      const spectacleGeo = new THREE.TorusGeometry(0.08, 0.02, 6, 8);
      const leftEyeRim = new THREE.Mesh(spectacleGeo, materials.metal);
      leftEyeRim.position.set(-0.08, 0.05, 0.27);
      headGroup.add(leftEyeRim);
      const rightEyeRim = new THREE.Mesh(spectacleGeo, materials.metal);
      rightEyeRim.position.set(0.08, 0.05, 0.27);
      headGroup.add(rightEyeRim);

      const nasalGeo = new THREE.BoxGeometry(0.04, 0.18, 0.03);
      const nasal = new THREE.Mesh(nasalGeo, materials.metal);
      nasal.position.set(0, -0.02, 0.28);
      headGroup.add(nasal);
    } else if (currentConfig.helmetStyle === 'jarl_crown') {
      // Corona da Jarl dorata
      const crownGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.12, 12, 1, true);
      const crown = new THREE.Mesh(crownGeo, materials.gold);
      crown.position.set(0, 0.18, 0);
      headGroup.add(crown);
    } else if (currentConfig.helmetStyle === 'fur_cap') {
      // Cappello di pelliccia
      const furGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.25, 10);
      const fur = new THREE.Mesh(furGeo, materials.leather);
      fur.position.set(0, 0.22, 0);
      headGroup.add(fur);
    }

    bodyGroup.add(headGroup);

    // --- BRACCIO DESTRO & ARMA ---
    const armGeo = new THREE.CylinderGeometry(0.10, 0.09, 0.65, 6);
    const rightArm = new THREE.Mesh(armGeo, materials.clothPrimary);
    rightArm.position.set(0.56, 1.55, 0.15);
    rightArm.rotation.set(-0.4, 0, -0.3);
    bodyGroup.add(rightArm);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), materials.skin);
    rightHand.position.set(0.68, 1.32, 0.35);
    bodyGroup.add(rightHand);

    // Socket Arma Destra
    const rightWeaponSocket = new THREE.Group();
    rightWeaponSocket.position.copy(rightHand.position);
    buildWeaponModel(rightWeaponSocket, currentConfig.rightHand, 'right');
    bodyGroup.add(rightWeaponSocket);

    // --- BRACCIO SINISTRO & SCUDO/ARMA ---
    const leftArm = new THREE.Mesh(armGeo, materials.clothPrimary);
    leftArm.position.set(-0.56, 1.55, 0.15);
    leftArm.rotation.set(-0.35, 0, 0.3);
    bodyGroup.add(leftArm);

    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), materials.skin);
    leftHand.position.set(-0.68, 1.32, 0.32);
    bodyGroup.add(leftHand);

    // Socket Arma Sinistra / Scudo
    const leftWeaponSocket = new THREE.Group();
    leftWeaponSocket.position.copy(leftHand.position);
    buildWeaponModel(leftWeaponSocket, currentConfig.leftHand, 'left');
    bodyGroup.add(leftWeaponSocket);

    // Applica stazza complessiva
    bodyGroup.scale.set(raceScaleX, raceScaleY, raceScaleZ);
    hero.add(bodyGroup);

    return hero;
  }

  // Costruttore Modulare Armi Norrene
  function buildWeaponModel(socket, weaponType, handSide) {
    if (weaponType === 'axe') {
      // Ascia vichinga da battaglia
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.95, 6), materials.leather);
      shaft.position.set(0, 0.15, 0);
      socket.add(shaft);

      // Lama sagomata
      const bladeGeo = new THREE.BoxGeometry(0.28, 0.22, 0.04);
      const blade = new THREE.Mesh(bladeGeo, materials.metal);
      blade.position.set(0.14, 0.52, 0);
      socket.add(blade);
    } else if (weaponType === 'sword') {
      // Spada Ulfberht
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.25, 6), materials.leather);
      socket.add(grip);

      const crossguard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.05), materials.gold);
      crossguard.position.set(0, 0.14, 0);
      socket.add(crossguard);

      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.02), materials.metal);
      blade.position.set(0, 0.62, 0);
      socket.add(blade);

      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), materials.gold);
      pommel.position.set(0, -0.14, 0);
      socket.add(pommel);
    } else if (weaponType === 'hammer') {
      // Martello di Thorr (Mjolnir)
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.65, 6), materials.leather);
      shaft.position.set(0, 0.1, 0);
      socket.add(shaft);

      const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.20), materials.metal);
      head.position.set(0, 0.42, 0);
      socket.add(head);

      const runeInlay = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.21), materials.rune);
      runeInlay.position.set(0, 0.42, 0);
      socket.add(runeInlay);
    } else if (weaponType === 'spear') {
      // Lancia Gungnir
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6), materials.leather);
      shaft.position.set(0, 0.35, 0);
      socket.add(shaft);

      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.35, 4), materials.metal);
      tip.position.set(0, 1.25, 0);
      socket.add(tip);
    } else if (weaponType === 'shield') {
      // Scudo Vichingo Tondo con motivo e umbone
      const shieldGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.04, 16);
      shieldGeo.rotateX(Math.PI / 2);
      const shield = new THREE.Mesh(shieldGeo, materials.clothPrimary);
      shield.position.set(handSide === 'left' ? -0.15 : 0.15, 0.05, 0.15);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.025, 6, 16), materials.metal);
      rim.position.set(handSide === 'left' ? -0.15 : 0.15, 0.05, 0.15);

      const boss = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), materials.metal);
      boss.position.set(handSide === 'left' ? -0.15 : 0.15, 0.05, 0.20);
      boss.scale.z = 0.5;

      socket.add(shield);
      socket.add(rim);
      socket.add(boss);
    } else if (weaponType === 'staff') {
      // Bastone Runico Intagliato
      const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.03, 1.45, 6), materials.leather);
      staff.position.set(0, 0.3, 0);
      socket.add(staff);

      const runeOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), materials.rune);
      runeOrb.position.set(0, 1.05, 0);
      socket.add(runeOrb);
    } else if (weaponType === 'rune') {
      // Mano con Runa Luminosa
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), materials.rune);
      orb.position.set(0, 0.1, 0.05);
      socket.add(orb);
    }
  }

  // ============================================================================
  // INIZIALIZZAZIONE SCENA THREE.JS & VIEWPORT
  // ============================================================================
  function initScene(canvasContainer) {
    if (!canvasContainer) return;
    canvasContainer.innerHTML = '';

    const width = canvasContainer.clientWidth || 550;
    const height = canvasContainer.clientHeight || 550;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);
    scene.fog = new THREE.FogExp2(0x06090e, 0.06);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.8, 4.2);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    canvasContainer.appendChild(renderer.domElement);

    if (window.THREE && window.THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.target.set(0, 1.3, 0);
      controls.minDistance = 1.8;
      controls.maxDistance = 6.5;
      controls.maxPolarAngle = Math.PI / 2 + 0.05; // Evita di andare sotto al pavimento
    }

    // Luci Heroic Three-Point Lighting
    const ambientLight = new THREE.AmbientLight(0x384556, 0.9);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xfff3d6, 1.8);
    mainKeyLight.position.set(3, 5, 4);
    mainKeyLight.castShadow = true;
    mainKeyLight.shadow.mapSize.width = 1024;
    mainKeyLight.shadow.mapSize.height = 1024;
    scene.add(mainKeyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    rimLight.position.set(-3, 3.5, -4);
    scene.add(rimLight);

    initMaterials();

    miniatureGroup = new THREE.Group();
    pedestalGroup = buildRunicPedestal();
    heroGroup = buildHeroFigure();

    miniatureGroup.add(pedestalGroup);
    miniatureGroup.add(heroGroup);
    scene.add(miniatureGroup);

    // Animazione render loop con rotazione dolce di idle
    let clock = new THREE.Clock();
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (controls) controls.update();
      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    }
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!canvasContainer || !renderer || !camera) return;
      const w = canvasContainer.clientWidth;
      const h = canvasContainer.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(canvasContainer);
  }

  function rebuildHeroMesh() {
    if (!heroGroup || !miniatureGroup) return;
    miniatureGroup.remove(heroGroup);
    heroGroup = buildHeroFigure();
    miniatureGroup.add(heroGroup);
  }

  // ============================================================================
  // INTERFACCIA UTENTE & GESTORI MODALE
  // ============================================================================
  function openForgeModal() {
    const ch = (typeof window.getMyCharacter === 'function') ? window.getMyCharacter() : null;
    if (ch) {
      // Carica configurazione salvata se presente
      if (ch.miniature3D) {
        currentConfig = JSON.parse(JSON.stringify(ch.miniature3D));
      } else {
        // Inizializza con la stirpe e clan della scheda del personaggio
        const clanId = ch.clan || ch.clanId || 'bear_warriors';
        const preset = CLAN_PRESETS[clanId] || CLAN_PRESETS.bear_warriors;
        currentConfig.race = (ch.race || '').toLowerCase().includes('nano') ? 'svartalfar' :
                            (ch.race || '').toLowerCase().includes('elfo') || (ch.race || '').toLowerCase().includes('ljos') ? 'ljosalfar' :
                            (ch.race || '').toLowerCase().includes('jotun') || (ch.race || '').toLowerCase().includes('gigante') ? 'mezzogigante' : 'umano';
        currentConfig.colors.clothPrimary = preset.primary;
        currentConfig.colors.clothSecondary = preset.secondary;
        currentConfig.colors.rune = preset.rune;
        currentConfig.colors.metal = preset.metal;
      }
    }

    let modal = document.getElementById('forge-3d-modal');
    if (!modal) {
      modal = createForgeModalDOM();
      document.body.appendChild(modal);
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const container = document.getElementById('forge-3d-canvas-container');
    setTimeout(() => {
      initScene(container);
      updateMaterialColors();
      rebuildHeroMesh();
      syncUIControls();
    }, 50);
  }

  function closeForgeModal() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    const modal = document.getElementById('forge-3d-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  function syncUIControls() {
    // Aggiorna valori degli input UI in base a currentConfig
    const raceSel = document.getElementById('f3d-race');
    if (raceSel) raceSel.value = currentConfig.race;
    const hairSel = document.getElementById('f3d-hair');
    if (hairSel) hairSel.value = currentConfig.hairStyle;
    const beardSel = document.getElementById('f3d-beard');
    if (beardSel) beardSel.value = currentConfig.beardStyle;
    const helmSel = document.getElementById('f3d-helmet');
    if (helmSel) helmSel.value = currentConfig.helmetStyle;
    const armorSel = document.getElementById('f3d-armor');
    if (armorSel) armorSel.value = currentConfig.armorStyle;
    const cloakSel = document.getElementById('f3d-cloak');
    if (cloakSel) cloakSel.value = currentConfig.cloakStyle;
    const rHandSel = document.getElementById('f3d-rhand');
    if (rHandSel) rHandSel.value = currentConfig.rightHand;
    const lHandSel = document.getElementById('f3d-lhand');
    if (lHandSel) lHandSel.value = currentConfig.leftHand;

    // Colori
    const cMetal = document.getElementById('f3d-col-metal');
    if (cMetal) cMetal.value = currentConfig.colors.metal;
    const cLeather = document.getElementById('f3d-col-leather');
    if (cLeather) cLeather.value = currentConfig.colors.leather;
    const cHair = document.getElementById('f3d-col-hair');
    if (cHair) cHair.value = currentConfig.colors.hair;
    const cRune = document.getElementById('f3d-col-rune');
    if (cRune) cRune.value = currentConfig.colors.rune;
  }

  function captureSnapshot() {
    if (!renderer || !scene || !camera) return null;
    renderer.render(scene, camera);
    return renderer.domElement.toDataURL('image/jpeg', 0.88);
  }

  function saveMiniatureToCharacter(setAsAvatar = false) {
    const ch = (typeof window.getMyCharacter === 'function') ? window.getMyCharacter() : null;
    if (!ch) {
      if (typeof window.showToast === 'function') {
        window.showToast("Attenzione", "Nessun personaggio attivo selezionato.", "warning");
      }
      return;
    }

    if (typeof window.requireOnlineAction === 'function') {
      if (!window.requireOnlineAction('Salvataggio Miniatura 3D')) return;
    }

    ch.miniature3D = JSON.parse(JSON.stringify(currentConfig));
    const snapshot = captureSnapshot();
    if (snapshot) {
      ch.miniature3D.snapshot = snapshot;
      if (setAsAvatar) {
        ch.avatar = snapshot;
      }
    }

    if (typeof window.propagateCharacterToCampaigns === 'function') {
      window.propagateCharacterToCampaigns(ch);
    }
    if (typeof window.saveDB === 'function') {
      window.saveDB();
    }

    if (typeof window.showToast === 'function') {
      window.showToast(
        "Miniatura 3D Consacrata!",
        `Configurazione 3D di "${ch.name}" salvata su Firebase e pronta per il tavolo Ginnungagap.`,
        "success"
      );
    }

    closeForgeModal();
    if (typeof window.renderAllViews === 'function') {
      window.renderAllViews();
    }
  }

  function applyClanPalette(clanKey) {
    const preset = CLAN_PRESETS[clanKey];
    if (!preset) return;
    currentConfig.colors.clothPrimary = preset.primary;
    currentConfig.colors.clothSecondary = preset.secondary;
    currentConfig.colors.rune = preset.rune;
    currentConfig.colors.metal = preset.metal;
    updateMaterialColors();
    rebuildHeroMesh();
    syncUIControls();
  }

  function randomizeHero() {
    const races = ['umano', 'ljosalfar', 'svartalfar', 'mezzogigante'];
    const hairs = ['none', 'braids', 'berserkr', 'ponytail', 'long'];
    const beards = ['none', 'goatee', 'braided', 'jarl'];
    const helmets = ['none', 'spangenhelm', 'jarl_crown', 'fur_cap'];
    const armors = ['chainmail', 'leather', 'plate', 'tunic'];
    const weapons = ['axe', 'sword', 'hammer', 'spear', 'staff', 'rune'];
    const shields = ['shield', 'dagger', 'torch', 'rune', 'empty'];

    currentConfig.race = races[Math.floor(Math.random() * races.length)];
    currentConfig.hairStyle = hairs[Math.floor(Math.random() * hairs.length)];
    currentConfig.beardStyle = beards[Math.floor(Math.random() * beards.length)];
    currentConfig.helmetStyle = helmets[Math.floor(Math.random() * helmets.length)];
    currentConfig.armorStyle = armors[Math.floor(Math.random() * armors.length)];
    currentConfig.rightHand = weapons[Math.floor(Math.random() * weapons.length)];
    currentConfig.leftHand = shields[Math.floor(Math.random() * shields.length)];

    rebuildHeroMesh();
    syncUIControls();
  }

  // Costruttore DOM Modale Fucina 3D
  function createForgeModalDOM() {
    const modal = document.createElement('div');
    modal.id = 'forge-3d-modal';
    modal.className = 'fixed inset-0 z-50 hidden items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-modal-pop';
    modal.innerHTML = `
      <div class="norse-panel max-w-5xl w-full h-[92vh] rounded-3xl border border-sky-500/40 shadow-[0_0_35px_rgba(56,189,248,0.35)] flex flex-col overflow-hidden bg-slate-950">
        
        <!-- Header Fucina -->
        <div class="px-5 py-3.5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div class="flex items-center gap-3">
            <span class="text-2xl text-amber-400 font-norse">ᚠ</span>
            <div>
              <h2 class="font-cinzel font-black text-base sm:text-lg text-white tracking-wider">LA FUCINA DELL'EROE (3D HERO FORGE)</h2>
              <span class="text-[10px] text-sky-300 font-semibold">Personalizza in tempo reale la miniatura del tuo eroe norreno</span>
            </div>
          </div>
          <button type="button" onclick="window.Forge3D.closeModal()" class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body con Viewport 3D e Pannello Opzioni -->
        <div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          <!-- Viewport 3D con OrbitControls -->
          <div class="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center overflow-hidden min-h-[300px]">
            <div id="forge-3d-canvas-container" class="w-full h-full"></div>
            
            <!-- Controlli Rapidi Viewport -->
            <div class="absolute bottom-3 left-3 flex gap-2">
              <button type="button" onclick="window.Forge3D.randomize()" class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-amber-300 font-cinzel font-bold text-[10px] backdrop-blur transition flex items-center gap-1.5">
                <span>🎲</span> Randomizza
              </button>
              <button type="button" onclick="window.Forge3D.resetView()" class="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 font-cinzel font-bold text-[10px] backdrop-blur transition">
                Reset Vista
              </button>
            </div>

            <div class="absolute top-3 left-3 bg-black/60 border border-slate-800 rounded-lg px-2.5 py-1 text-[9px] text-slate-400 font-mono pointer-events-none">
              Trascina per ruotare • Rotella per zoomare
            </div>
          </div>

          <!-- Drawer Opzioni a Schede -->
          <div class="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-950/95 flex flex-col overflow-y-auto p-4 space-y-4 text-xs">
            
            <!-- 1. Stirpe & Stazza -->
            <div class="norse-panel rounded-xl p-3 border border-slate-800 space-y-2">
              <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">1. Stirpe Norrena & Corporatura</span>
              <select id="f3d-race" onchange="window.Forge3D.updateOption('race', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-semibold text-xs">
                <option value="umano">Umano di Midgardr (Proporzioni Standard)</option>
                <option value="ljosalfar">Ljósálfar (Slanciato & Agile)</option>
                <option value="svartalfar">Svartálfar / Nano (Compatto & Possente)</option>
                <option value="mezzogigante">Sangue Jötunn (Imponente & Titanico)</option>
              </select>
            </div>

            <!-- 2. Testa, Capelli & Barba -->
            <div class="norse-panel rounded-xl p-3 border border-slate-800 space-y-2.5">
              <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">2. Capelli, Barba ed Elmo</span>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Acconciatura:</label>
                  <select id="f3d-hair" onchange="window.Forge3D.updateOption('hairStyle', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="braids">Trecce Vichinghe</option>
                    <option value="berserkr">Cresta Berserkr</option>
                    <option value="ponytail">Codino Guerriero</option>
                    <option value="long">Capelli Lunghi</option>
                    <option value="none">Rasato</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Barba Vichinga:</label>
                  <select id="f3d-beard" onchange="window.Forge3D.updateOption('beardStyle', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="braided">Barba con Perline</option>
                    <option value="jarl">Lunga da Jarl</option>
                    <option value="goatee">Pizzo</option>
                    <option value="none">Rasata</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="text-[10px] text-slate-400 block mb-1">Elmo / Copricapo:</label>
                <select id="f3d-helmet" onchange="window.Forge3D.updateOption('helmetStyle', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                  <option value="none">Nessun Elmo (Viso Aperto)</option>
                  <option value="spangenhelm">Elmo Gjermundbu con Occhiali</option>
                  <option value="jarl_crown">Corona Dorata dello Jarl</option>
                  <option value="fur_cap">Cappello in Pelliccia</option>
                </select>
              </div>
            </div>

            <!-- 3. Armatura & Mantello -->
            <div class="norse-panel rounded-xl p-3 border border-slate-800 space-y-2">
              <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">3. Vestiario & Mantello</span>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Corazza:</label>
                  <select id="f3d-armor" onchange="window.Forge3D.updateOption('armorStyle', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="chainmail">Cotta di Maglia</option>
                    <option value="leather">Cuoio Rinforzato</option>
                    <option value="plate">Piastre d'Acciaio</option>
                    <option value="tunic">Tunica di Lino</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Mantello:</label>
                  <select id="f3d-cloak" onchange="window.Forge3D.updateOption('cloakStyle', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="long">Lungo con Spilla</option>
                    <option value="short">Corto</option>
                    <option value="none">Senza Mantello</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. Armi (Mano Destra & Sinistra) -->
            <div class="norse-panel rounded-xl p-3 border border-slate-800 space-y-2">
              <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider block">4. Equipaggiamento da Battaglia</span>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Mano Destra:</label>
                  <select id="f3d-rhand" onchange="window.Forge3D.updateOption('rightHand', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="axe">Ascia da Guerra</option>
                    <option value="sword">Spada Ulfberht</option>
                    <option value="hammer">Maglio Mjolnir</option>
                    <option value="spear">Lancia Gungnir</option>
                    <option value="staff">Bastone Runico</option>
                    <option value="rune">Runa di Luce</option>
                  </select>
                </div>
                <div>
                  <label class="text-[10px] text-slate-400 block mb-1">Mano Sinistra:</label>
                  <select id="f3d-lhand" onchange="window.Forge3D.updateOption('leftHand', this.value)" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-[11px]">
                    <option value="shield">Scudo Vichingo</option>
                    <option value="dagger">Daga / Pugnale</option>
                    <option value="axe">Ascia Secondaria</option>
                    <option value="rune">Runa Luminescente</option>
                    <option value="empty">Mano Libera</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 5. Colori PBR & Preset Clan -->
            <div class="norse-panel rounded-xl p-3 border border-slate-800 space-y-2.5">
              <div class="flex justify-between items-center">
                <span class="text-[10px] font-cinzel font-bold text-amber-300 uppercase tracking-wider">5. Colori dei Clan di Midgardr</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5 text-[9px] font-bold">
                <button type="button" onclick="window.Forge3D.applyClan('bear_warriors')" class="p-1.5 rounded-lg bg-amber-950/60 border border-amber-600/40 text-amber-300 truncate">Orsi</button>
                <button type="button" onclick="window.Forge3D.applyClan('gjallarhorn')" class="p-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 truncate">Gjallarhorn</button>
                <button type="button" onclick="window.Forge3D.applyClan('icy_crow')" class="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 truncate">Corvi</button>
                <button type="button" onclick="window.Forge3D.applyClan('jotunn_sons')" class="p-1.5 rounded-lg bg-slate-900 border border-sky-400/40 text-sky-300 truncate">Jötunn</button>
                <button type="button" onclick="window.Forge3D.applyClan('odhinns_eye')" class="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 truncate">Odhinn</button>
                <button type="button" onclick="window.Forge3D.applyClan('wolves_shadow')" class="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 truncate">Lupi</button>
              </div>

              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80">
                <div>
                  <span class="text-[9px] text-slate-400 block truncate">Metallo</span>
                  <input type="color" id="f3d-col-metal" onchange="window.Forge3D.updateColor('metal', this.value)" class="w-full h-7 rounded bg-transparent cursor-pointer">
                </div>
                <div>
                  <span class="text-[9px] text-slate-400 block truncate">Cuoio</span>
                  <input type="color" id="f3d-col-leather" onchange="window.Forge3D.updateColor('leather', this.value)" class="w-full h-7 rounded bg-transparent cursor-pointer">
                </div>
                <div>
                  <span class="text-[9px] text-slate-400 block truncate">Capelli</span>
                  <input type="color" id="f3d-col-hair" onchange="window.Forge3D.updateColor('hair', this.value)" class="w-full h-7 rounded bg-transparent cursor-pointer">
                </div>
                <div>
                  <span class="text-[9px] text-slate-400 block truncate">Runa</span>
                  <input type="color" id="f3d-col-rune" onchange="window.Forge3D.updateColor('rune', this.value)" class="w-full h-7 rounded bg-transparent cursor-pointer">
                </div>
              </div>
            </div>

            <!-- Pulsanti di Salvataggio -->
            <div class="pt-2 space-y-2">
              <button type="button" onclick="window.Forge3D.save(false)" class="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-cinzel font-black text-xs shadow-lg flex items-center justify-center gap-2 transition">
                <span>ᛈ</span> SALVA MINIATURA 3D NELL'EROE
              </button>
              <button type="button" onclick="window.Forge3D.save(true)" class="w-full py-2 rounded-xl bg-slate-900 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-cinzel font-bold text-[11px] transition">
                Salva e Imposta come Avatar Scheda
              </button>
            </div>

          </div>
        </div>
      </div>
    `;

    return modal;
  }

  return {
    openModal: openForgeModal,
    closeModal: closeForgeModal,
    updateOption: function(key, val) {
      currentConfig[key] = val;
      rebuildHeroMesh();
    },
    updateColor: function(key, hex) {
      currentConfig.colors[key] = hex;
      updateMaterialColors();
    },
    applyClan: applyClanPalette,
    randomize: randomizeHero,
    resetView: function() {
      if (controls && camera) {
        camera.position.set(0, 1.8, 4.2);
        controls.target.set(0, 1.3, 0);
        controls.update();
      }
    },
    save: saveMiniatureToCharacter,
    getConfig: function() {
      return JSON.parse(JSON.stringify(currentConfig));
    },
    buildProceduralMiniature: function(cfg) {
      // Metodo riutilizzabile da TaleSpire / Ginnungagap VTT per generare la miniatura sul campo tattico
      const oldCfg = currentConfig;
      currentConfig = { ...currentConfig, ...cfg };
      initMaterials();
      updateMaterialColors();
      const hero = buildHeroFigure();
      const base = buildRunicPedestal();
      const group = new THREE.Group();
      group.add(base);
      group.add(hero);
      currentConfig = oldCfg;
      return group;
    }
  };
})();
