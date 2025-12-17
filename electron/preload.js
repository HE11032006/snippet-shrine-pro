// Preload script pour Electron
// Permet d'exposer des APIs Node.js de manière sécurisée si nécessaire

const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true
});
