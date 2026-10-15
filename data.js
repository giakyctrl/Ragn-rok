// ============================================================================
// 1. CONFIGURAZIONE CLOUD FIREBASE & CREDENZIALI ADMIN
// ============================================================================
window.FIREBASE_DATABASE_URL = "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";

window.ADMIN_CREDENTIALS = {
  username: "admin",
  password: "ragnarok2026"
};

window.PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
];

window.CARD_ARTWORKS = {
  arma: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=500&q=80",
  scudo: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
  armatura: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
  incantesimo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
  oggetto: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80"
};

// Mappa Attributi (Chiave interna -> Nome completo D&D Beyond)
window.ABILITY_META = [
  { key: "FOR", label: "STRENGTH" },
  { key: "DES", label: "DEXTERITY" },
  { key: "COS", label: "CONSTITUTION" },
  { key: "INT", label: "INTELLIGENCE" },
  { key: "SAG", label: "WISDOM" },
  { key: "CAR", label: "CHARISMA" }
];

// Ordine a 2 colonne dei Saving Throws come nello screenshot D&D Beyond
window.SAVING_THROW_ORDER = ["FOR", "INT", "DES", "SAG", "COS", "CAR"];

// Le 18 Skills ufficiali di D&D 5e
window.DND_SKILLS = [
  { id: "acrobatics", name: "Acrobatics", stat: "DES" },
  { id: "animal_handling", name: "Animal Handling", stat: "SAG" },
  { id: "arcana", name: "Arcana", stat: "INT" },
  { id: "athletics", name: "Athletics", stat: "FOR" },
  { id: "deception", name: "Deception", stat: "CAR" },
  { id: "history", name: "History", stat: "INT" },
  { id: "insight", name: "Insight", stat: "SAG" },
  { id: "intimidation", name: "Intimidation", stat: "CAR" },
  { id: "investigation", name: "Investigation", stat: "INT" },
  { id: "medicine", name: "Medicine", stat: "SAG" },
  { id: "nature", name: "Nature", stat: "INT" },
  { id: "perception", name: "Perception", stat: "SAG" },
  { id: "performance", name: "Performance", stat: "CAR" },
  { id: "persuasion", name: "Persuasion", stat: "CAR" },
  { id: "religion", name: "Religion", stat: "INT" },
  { id: "sleight_of_hand", name: "Sleight of Hand", stat: "DES" },
  { id: "stealth", name: "Stealth", stat: "DES" },
  { id: "survival", name: "Survival", stat: "SAG" }
];

// Voci del Menu Drawer Sezioni (Come nel 1° Screenshot D&D Beyond)
window.DDB_SECTIONS = [
  { id: "abilities", label: "Abilities, Saves, Senses", svg: `<path d="M12 2L4 7v10l8 5 8-5V7l-8-5z"/>` },
  { id: "skills", label: "Skills", svg: `<path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.2-6.3-4.6-6.3 4.6 2.3-7.2-6-4.6h7.6z"/>` },
  { id: "actions", label: "Actions", svg: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>` },
  { id: "inventory", label: "Inventory", svg: `<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M3 12h18M8 8V6a4 4 0 018 0v2"/>` },
  { id: "spells", label: "Spells", svg: `<path d="M12 2c1 4 5 6 5 11a5 5 0 11-10 0c0-5 4-7 5-11z"/>` },
  { id: "defenses", label: "Speed & Defenses", svg: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>` },
  { id: "features", label: "Features & Traits", svg: `<circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0112 0v2"/>` },
  { id: "proficiencies", label: "Proficiencies & Training", svg: `<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>` },
  { id: "background", label: "Background", svg: `<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>` },
  { id: "notes", label: "Notes", svg: `<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>` },
  { id: "creatures", label: "Extras: Creatures", svg: `<path d="M16 4l4 4-4 4M8 20l-4-4 4-4M19 8H9a4 4 0 00-4 4v1"/>` }
];

// ============================================================================
// 2. AUTO-ADATTAMENTO E RITAGLIO IMMAGINI PER LE CARTE (400x260px)
// ============================================================================
window.autoFitImageFile = function(file, targetWidth, targetHeight, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      const c = document.createElement('canvas');
      c.width = targetWidth;
      c.height = targetHeight;
      const context = c.getContext('2d');

      const imgRatio = img.width / img.height;
      const targetRatio = targetWidth / targetHeight;
      let drawW, drawH, offsetX, offsetY;

      if (imgRatio > targetRatio) {
        drawH = targetHeight;
        drawW = img.width * (targetHeight / img.height);
        offsetX = (targetWidth - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = targetWidth;
        drawH = img.height * (targetWidth / img.width);
        offsetX = 0;
        offsetY = (targetHeight - drawH) / 2;
      }

      context.fillStyle = "#050811";
      context.fillRect(0, 0, targetWidth, targetHeight);
      context.drawImage(img, offsetX, offsetY, drawW, drawH);

      callback(c.toDataURL('image/jpeg', 0.82));
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};
