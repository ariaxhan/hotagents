const { app, globalShortcut, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const fetch = require('node-fetch');
const OpenAI = require('openai');
const axios = require('axios');
const FormData = require('form-data');

const openai = new OpenAI({
  apiKey: '',
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    show: false,
  });

  mainWindow.loadFile('index.html');
}

async function uploadImage(imagePath) {
  const form = new FormData();
  form.append('image', fs.createReadStream(imagePath));

  const response = await axios.post('https://api.imgur.com/3/image', form, {
    headers: {
      'Authorization': 'Client-ID your-imgur-client-id',
      ...form.getHeaders(),
    },
  });

  return response.data.data.link;
}

async function analyzeImage(imageUrl) {
  try {
    const response = await openai.chat.completions.create({
       model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'What’s in this image?' },
        { role: 'system', content: `![Image](${imageUrl})` },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(error.status); // e.g., 401
      console.error(error.message); // e.g., The authentication token you passed was invalid...
      console.error(error.code); // e.g., 'invalid_api_key'
      console.error(error.type); // e.g., 'invalid_request_error'
    } else {
      console.error(error);
    }
    throw error;
  }
}

app.whenReady().then(() => {
  createWindow();

  // Register a global hotkey
  globalShortcut.register('Control+Space', async () => {
    try {
      const screenshotPath = path.join(app.getPath('userData'), 'screenshot.jpg');
      await screenshot({ filename: screenshotPath });

      const imageUrl = await uploadImage(screenshotPath);
      const analysis = await analyzeImage(imageUrl);

      mainWindow.webContents.send('screenshot-taken', screenshotPath);
      mainWindow.webContents.send('analysis-result', analysis);
      mainWindow.show();
    } catch (error) {
      console.error('Error during screenshot and analysis process:', error);
    }
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
