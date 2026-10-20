const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Accelerazione Hardware GPU per Three.js WebGL (Fucina 3D e Map Builder TaleSpire)
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-accelerated-video-decode');

// Percorso file di backup offline persistente su disco locale
const offlineDbPath = path.join(app.getPath('userData'), 'yggdrasill_offline_db.json');

// Evita istanze multiple contemporanee
const gotTheLock = app.requestSingleInstanceLock();
let mainWindow = null;

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createMainWindow);
}

function createMainWindow() {
  Menu.setApplicationMenu(null); // Rimuove menu di default del browser

  const iconPath = path.join(__dirname, 'build', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#06090e',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      spellcheck: false
    }
  });

  mainWindow.maximize();

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Tasto rapido F11 per alternare Fullscreen completo da sessione live
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11' && input.type === 'keyDown') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
      event.preventDefault();
    }
    // F12 per DevTools in caso di diagnostica
    if (input.key === 'F12' && input.type === 'keyDown') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers per Finestra
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('toggle-fullscreen', () => {
  if (mainWindow) mainWindow.setFullScreen(!mainWindow.isFullScreen());
});

// IPC Handlers per Persistenza Offline Duratura (File locale su %APPDATA%)
ipcMain.handle('save-offline-backup', async (event, data) => {
  try {
    fs.writeFileSync(offlineDbPath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    console.error('Errore salvataggio backup offline:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-offline-backup', async () => {
  try {
    if (fs.existsSync(offlineDbPath)) {
      const raw = fs.readFileSync(offlineDbPath, 'utf-8');
      return { success: true, data: JSON.parse(raw) };
    }
    return { success: false, notFound: true };
  } catch (err) {
    console.error('Errore lettura backup offline:', err);
    return { success: false, error: err.message };
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
