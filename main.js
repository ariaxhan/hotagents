// Import necessary modules
const { app, globalShortcut, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Load environment variables from .env file

let mainWindow; // Main application window

// Function to create the main application window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Allow Node.js integration
      contextIsolation: false, // Disable context isolation for easier IPC
    },
    show: false, // Initially hide the window
  });

  mainWindow.loadFile('index.html'); // Load the main HTML file
}

// Function to encode image to base64 format
function encodeImage(imagePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(imagePath, (err, data) => {
      if (err) {
        reject(err); // Handle file read error
      } else {
        resolve(Buffer.from(data).toString('base64')); // Convert image data to base64
      }
    });
  });
}

// Function to convert file to Generative AI Part object
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString('base64'), // Encode file to base64
      mimeType, // Set MIME type of the file
    },
  };
}

// Function to analyze the screenshot using Gemini
async function analyzeScreenshot(screenshotPath, prompt) {
  const apiKey = process.env.GEMINI_API_KEY; // Get API key from environment variable

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable'); // Handle missing API key
  }

  const genAI = new GoogleGenerativeAI(apiKey); // Initialize Google Generative AI with API key
  const imagePart = fileToGenerativePart(screenshotPath, 'image/jpeg'); // Convert screenshot to Generative AI Part object
  const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' }); // Get the generative model

  try {
    const result = await model.generateContent([prompt, imagePart]); // Generate content based on the prompt and image
    const response = await result.response;
    const text = response.text();
    console.log('Analysis result:', text); // Log the analysis result
    mainWindow.webContents.send('analysis-result', text); // Send the result to the renderer process
  } catch (error) {
    console.error('Error during analysis:', error); // Handle errors during analysis
  }
}

// Application lifecycle event handlers
app.whenReady().then(() => {
  createWindow(); // Create the main window when the app is ready

  // Register a global hotkey
  globalShortcut.register('Control+Space', async () => {
    const screenshotPath = path.join(app.getPath('userData'), 'screenshot.jpg'); // Define the path for the screenshot
    await screenshot({ filename: screenshotPath }); // Take a screenshot and save it

    mainWindow.webContents.send('screenshot-taken', screenshotPath); // Notify the renderer process that a screenshot was taken
    mainWindow.show(); // Show the main window
  });

  console.log('Listening for hotkey (Ctrl + Space)... Press Ctrl + C to stop.');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit(); // Quit the app when all windows are closed, except on macOS
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(); // Recreate the main window if it's activated and no other windows are open
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll(); // Unregister all global shortcuts when the app is quitting
});

// IPC event handlers for communication between renderer and main processes
ipcMain.on('api-call', async (event, apiEndpoint) => {
  console.log('API call requested:', apiEndpoint); // Log the API call request
});

ipcMain.on('explain-this', async () => {
  const prompt = 'Explain the concepts, topics, and key information in the attached screenshot with simple language and analogies.';
  try {
    await analyzeScreenshot(path.join(app.getPath('userData'), 'screenshot.jpg'), prompt); // Analyze the screenshot with the "explain" prompt
  } catch (error) {
    console.error('Error during analysis:', error); // Handle errors during analysis
  }
});

ipcMain.on('draft-response', async () => {
  const prompt = 'Draft a response based on the attached screenshot.';
  try {
    await analyzeScreenshot(path.join(app.getPath('userData'), 'screenshot.jpg'), prompt); // Analyze the screenshot with the "draft response" prompt
  } catch (error) {
    console.error('Error during analysis:', error); // Handle errors during analysis
  }
});

ipcMain.on('create-with-code', async () => {
  const prompt = 'Recreate the content in the screenshot with Python code, providing the necessary steps and examples.';
  try {
    await analyzeScreenshot(path.join(app.getPath('userData'), 'screenshot.jpg'), prompt); // Analyze the screenshot with the "create with code" prompt
  } catch (error) {
    console.error('Error during analysis:', error); // Handle errors during analysis
  }
});

ipcMain.on('proofread-this', async () => {
  const prompt = 'Proofread the text in the screenshot, providing corrections and suggestions for improvement.';
  try {
    await analyzeScreenshot(path.join(app.getPath('userData'), 'screenshot.jpg'), prompt); // Analyze the screenshot with the "proofread" prompt
  } catch (error) {
    console.error('Error during analysis:', error); // Handle errors during analysis
  }
});
