const { app, globalShortcut, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();

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

    // Analyze the screenshot using Gemini
    analyzeScreenshot(screenshotPath);
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
  // Removed functionality for demonstration purposes
  console.log('API call requested:', apiEndpoint);
});

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function analyzeScreenshot(screenshotPath) {
  // Access your Gemini API key as an environment variable
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Converts the screenshot to a GoogleGenerativeAI.Part object
  const imagePart = fileToGenerativePart(screenshotPath, "image/jpeg");

 // For image analysis, use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "What's different between this picture?"; // Adjust the prompt as needed

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    console.log("Analysis result:", text);
    mainWindow.webContents.send('analysis-result', text);
  } catch (error) {
    console.error("Error during analysis:", error);
    // Optionally send an error message to the renderer process
  }
}