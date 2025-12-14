import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

// Convert __filename et __dirname pour ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
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

  win.loadFile(indexPath);

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
