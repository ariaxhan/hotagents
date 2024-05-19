const { app, globalShortcut, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const fetch = require('node-fetch');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Register a global hotkey
  globalShortcut.register('Control+Space', async () => {
    const screenshotPath = path.join(app.getPath('userData'), 'screenshot.jpg');
    await screenshot({ filename: screenshotPath });

    mainWindow.webContents.send('screenshot-taken', screenshotPath);
    mainWindow.show();
  });

  console.log('Listening for hotkey (Ctrl + Space)... Press Ctrl + C to stop.');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
});

ipcMain.on('api-call', async (event, apiEndpoint) => {
  try {
    const response = await fetch(apiEndpoint);
    const data = await response.json();
    new Notification({
      title: 'API Response',
      body: JSON.stringify(data),
    }).show();
  } catch (error) {
    new Notification({
      title: 'API Error',
      body: error.message,
    }).show();
  }
});
