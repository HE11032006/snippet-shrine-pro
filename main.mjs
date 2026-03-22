import { app, BrowserWindow, globalShortcut, ipcMain, dialog, shell } from "electron";
import fs from "fs";
import { exec } from "child_process";
import util from "util";
const execPromise = util.promisify(exec);
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

// IPC Handler for Git Operations
ipcMain.handle('git-command', async (event, { command, repoPath }) => {
  if (!repoPath || !fs.existsSync(repoPath)) {
    return { success: false, error: 'Répertoire invalide' };
  }

  try {
    const { stdout, stderr } = await execPromise(command, { cwd: repoPath });
    return { success: true, stdout, stderr };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Select Directory for Git
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
