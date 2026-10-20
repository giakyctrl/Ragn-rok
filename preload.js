const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),
  saveOfflineBackup: (data) => ipcRenderer.invoke('save-offline-backup', data),
  loadOfflineBackup: () => ipcRenderer.invoke('load-offline-backup')
});
