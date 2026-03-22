import { app, BrowserWindow, globalShortcut, ipcMain, dialog, shell } from "electron";
import fs from "fs";
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

// IPC Handler for PDF Export
ipcMain.on('print-to-pdf', async (event, filename) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  
  const { filePath } = await dialog.showSaveDialog(window, {
    title: 'Exporter en PDF',
    defaultPath: filename,
    filters: [{ name: 'Adobe PDF', extensions: ['pdf'] }]
  });

  if (filePath) {
    try {
      const data = await window.webContents.printToPDF({
        printBackground: true,
        marginsType: 1, // Minimum margins
      });
      fs.writeFileSync(filePath, data);
      shell.openPath(filePath);
      event.reply('print-to-pdf-completed', true);
    } catch (error) {
      console.error('Failed to write PDF:', error);
      event.reply('print-to-pdf-completed', false);
    }
  } else {
    event.reply('print-to-pdf-completed', false);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
