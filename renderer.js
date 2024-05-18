const { ipcRenderer } = require('electron');

ipcRenderer.on('screenshot-taken', (event, screenshotPath) => {
  document.getElementById('screenshot-container').style.display = 'block';
  document.getElementById('screenshot').src = screenshotPath;
});

ipcRenderer.on('analysis-result', (event, analysis) => {
  document.getElementById('analysis-result').innerText = analysis;
});

function apiCall(apiEndpoint) {
  ipcRenderer.send('api-call', apiEndpoint);
}

function chatgptCall(prompt) {
  ipcRenderer.send('chatgpt-call', prompt);
}
