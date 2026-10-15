// ============================================================================
// 1. CONFIGURAZIONE CLOUD, CREDENZIALI ADMIN & SEZIONI D&D BEYOND
// ============================================================================
window.FIREBASE_DATABASE_URL = "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";

window.ADMIN_CREDENTIALS = {
  username: "admin",
  password: "qwerty"
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

// Elenco Ufficiale Sezioni Scheda D&D Beyond
window.DDB_SECTIONS = [
  { id: "abilities", label: "Abilities, Saves, Senses", icon: "🐉" },
  { id: "skills", label: "Skills", icon: "✨" },
  { id: "actions", label: "Actions", icon: "💥" },
  { id: "inventory", label: "Inventory", icon: "🧰" },
  { id: "spells", label: "Spells", icon: "🔥" },
  { id: "defenses", label: "Speed & Defenses", icon: "🛡️" },
  { id: "features", label: "Features & Traits", icon: "👤" },
  { id: "proficiencies", label: "Proficiencies & Training", icon: "🔍" },
  { id: "background", label: "Background", icon: "📜" },
  { id: "notes", label: "Notes", icon: "💬" },
  { id: "creatures", label: "Extras: Creatures", icon: "🐺" }
];

// Elenco Abilità D&D 5e collegate alla relativa Caratteristica
window.DDB_SKILLS = [
  { name: "Acrobatics", stat: "DES" },
  { name: "Animal Handling", stat: "SAG" },
  { name: "Arcana", stat: "INT" },
  { name: "Athletics", stat: "FOR" },
  { name: "Deception", stat: "CAR" },
  { name: "History", stat: "INT" },
  { name: "Insight", stat: "SAG" },
  { name: "Intimidation", stat: "CAR" },
  { name: "Investigation", stat: "INT" },
  { name: "Medicine", stat: "SAG" },
  { name: "Nature", stat: "INT" },
  { name: "Perception", stat: "SAG" },
  { name: "Performance", stat: "CAR" },
  { name: "Persuasion", stat: "CAR" },
  { name: "Religion", stat: "INT" },
  { name: "Sleight of Hand", stat: "DES" },
  { name: "Stealth", stat: "DES" },
  { name: "Survival", stat: "SAG" }
];

// Decifratore automatico: smista la carta nella categoria D&D Beyond adeguata
window.classifyCardToDdbSection = function(card) {
  const t = (card.type || "").toLowerCase();
  if (t === "arma") return "actions";
  if (t === "incantesimo") return "spells";
  return "inventory"; // Armature, Scudi e Oggetti vari vanno in Inventory
};

// Auto-Crop & Resize automatico delle immagini caricate manualmente (400x260px)
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
