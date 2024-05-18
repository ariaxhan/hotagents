const { ipcRenderer } = require('electron');

ipcRenderer.on('screenshot-taken', (event, screenshotPath) => {
  document.getElementById('screenshot-container').style.display = 'block';
  document.getElementById('screenshot').src = screenshotPath;
});

function apiCall(apiEndpoint) {
  ipcRenderer.send('api-call', apiEndpoint);
}
