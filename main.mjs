import { app, BrowserWindow, globalShortcut, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// Convert __filename et __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const indexPath = path.join(__dirname, "dist", "index.html");
  console.log("Loading:", indexPath); // Debug

  mainWindow.loadFile(indexPath);

  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  // Enregistrer un raccourci global (ex: Ctrl+Shift+N)
  const ret = globalShortcut.register('CommandOrControl+Shift+N', () => {
    console.log('Global shortcut triggered');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      mainWindow.webContents.send('trigger-new-note');
    }
  });

  if (!ret) {
    console.log('registration failed');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
