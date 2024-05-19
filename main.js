const { app, globalShortcut, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const axios = require('axios');

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

app.whenReady().then(() => {
  createWindow();

  // Register a global hotkey
  globalShortcut.register('Control+Space', async () => {
    const screenshotPath = path.join(app.getPath('userData'), 'screenshot.jpg');
    await screenshot({ filename: screenshotPath });

    mainWindow.webContents.send('screenshot-taken', screenshotPath);
    mainWindow.show();

    // Send the screenshot to ChatGPT
    sendScreenshotToChatGPT(screenshotPath);
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
    const response = await axios.get(apiEndpoint);
    const data = response.data;
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

async function sendScreenshotToChatGPT(imagePath) {
  try {
    // Encode the image to base64
    const base64Image = await encodeImage(imagePath);

    // OpenAI API Key
    const apiKey = API_KEY

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };

    const payload = {
      "model": "gpt-4o",
      "messages": [
        {
          "role": "user",
          "content": "What’s in this image?"
        },
        /*
        {
          "role": "user",
          "content": `data:image/jpeg;base64,${base64Image}`
        }
        */
      ],
      "max_tokens": 50000
    };

    const response = await axios.post("https://api.openai.com/v1/chat/completions", payload, { headers });

    console.log(response.data.choices[0].message.content);
    // Handle the response as needed
  } catch (error) {
    console.error('Error sending screenshot to ChatGPT:', error.response ? error.response.data : error.message);
  }
}

function encodeImage(imagePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(Buffer.from(data).toString('base64'));
      }
    });
  });
}

ipcMain.on('explain-this', async () => {
  try {
    const imageUrl = await uploadImage(screenshotPath);
    const analysis = await analyzeImage(imageUrl, 'explain');
    mainWindow.webContents.send('analysis-result', analysis);
  } catch (error) {
    console.error('Error during analysis process:', error);
  }
});

ipcMain.on('draft-response', async () => {
  try {
    const imageUrl = await uploadImage(screenshotPath);
    const analysis = await analyzeImage(imageUrl, 'draft');
    mainWindow.webContents.send('analysis-result', analysis);
  } catch (error) {
    console.error('Error during analysis process:', error);
  }
});

ipcMain.on('recreate-with-code', () => {
  createPopup();
});

ipcMain.on('selected-language', async (event, language) => {
  try {
    const imageUrl = await uploadImage(screenshotPath);
    const analysis = await analyzeImage(imageUrl, `Recreate this image with code in ${language}.`);
    mainWindow.webContents.send('analysis-result', analysis);
    popupWindow.close();
    mainWindow.show();
  } catch (error) {
    console.error('Error during screenshot and analysis process:', error);
  }
});

