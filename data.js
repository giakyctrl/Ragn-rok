// ============================================================================
// 1. CONFIGURAZIONE CLOUD FIREBASE & CREDENZIALI ESCLUSIVE ADMIN
// ============================================================================
const FIREBASE_DATABASE_URL = "https://yggdrasill-39093-default-rtdb.europe-west1.firebasedatabase.app/";

// Credenziali dell'unico Account Admin che può gestire Cloud, Manutenzione e Reset DB
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "ragnarok2026"
};

// Ritratti Predefiniti
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"
];

// Illustrazioni di fallback per categoria
const CARD_ARTWORKS = {
  arma: "https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=500&q=80",
  scudo: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
  armatura: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=500&q=80",
  incantesimo: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=80",
  oggetto: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80"
};

// ============================================================================
// 2. AUTO-ADATTAMENTO E RITAGLIO IMMAGINI PER LE CARTE (400x260px)
// ============================================================================
function autoFitImageFile(file, targetWidth, targetHeight, callback) {
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

      const compressedDataUrl = c.toDataURL('image/jpeg', 0.82);
      callback(compressedDataUrl);
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}
