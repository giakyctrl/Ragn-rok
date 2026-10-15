// ============================================================================
// 1. CONFIGURAZIONE CLOUD, CREDENZIALI ADMIN & SEZIONI D&D BEYOND IN ITALIANO
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

// Sezioni D&D Beyond tradotte in italiano
window.DDB_SECTIONS = [
  { id: "abilities", label: "Caratteristiche, Salvezza e Sensi", icon: "🐉" },
  { id: "skills", label: "Abilità", icon: "✨" },
  { id: "actions", label: "Azioni e Attacchi", icon: "💥" },
  { id: "inventory", label: "Inventario", icon: "🧰" },
  { id: "spells", label: "Incantesimi", icon: "🔥" },
  { id: "defenses", label: "Velocità e Difese", icon: "🛡️" },
  { id: "features", label: "Privilegi e Tratti", icon: "👤" },
  { id: "proficiencies", label: "Competenze e Addestramento", icon: "🔍" },
  { id: "background", label: "Origine e Background", icon: "📜" },
  { id: "notes", label: "Note di Viaggio", icon: "💬" },
  { id: "creatures", label: "Creature e Compagni", icon: "🐺" }
];

window.DDB_SKILLS = [
  { name: "Acrobazia (DES)", stat: "DES" },
  { name: "Addestrare Animali (SAG)", stat: "SAG" },
  { name: "Arcano (INT)", stat: "INT" },
  { name: "Atletica (FOR)", stat: "FOR" },
  { name: "Furtività (DES)", stat: "DES" },
  { name: " Indagare (INT)", stat: "INT" },
  { name: "Inganno (CAR)", stat: "CAR" },
  { name: "Intimidire (CAR)", stat: "CAR" },
  { name: "Intuizione (SAG)", stat: "SAG" },
  { name: "Medicina (SAG)", stat: "SAG" },
  { name: "Natura (INT)", stat: "INT" },
  { name: "Percezione (SAG)", stat: "SAG" },
  { name: "Persuasione (CAR)", stat: "CAR" },
  { name: "Rapidità di Mano (DES)", stat: "DES" },
  { name: "Religione (INT)", stat: "INT" },
  { name: "Rapidità (DES)", stat: "DES" },
  { name: "Sopravvivenza (SAG)", stat: "SAG" },
  { name: "Storia (INT)", stat: "INT" },
  { name: "Intrattenere (CAR)", stat: "CAR" }
];

// Smistamento automatico nelle sezioni D&D Beyond
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
