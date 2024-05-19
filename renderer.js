const { ipcRenderer } = require("electron");
const { marked } = require("marked");
const Prism = require('prismjs');
require('prismjs/components');
require('prismjs/components/prism-python');

ipcRenderer.on("screenshot-taken", (event, screenshotPath) => {
  document.getElementById("screenshot").src = screenshotPath;
});

ipcRenderer.on("analysis-result", (event, analysis) => {
  document.getElementById("analysis-result").innerText = analysis;
});

var accumulated_text = "";

ipcRenderer.on("update-response", (event, text) => {
  accumulated_text += text;
  var responseElement = document.getElementById("response");
  responseElement.innerHTML = marked.parse(accumulated_text);
  Prism.highlightAll();
  responseElement.scrollTop = responseElement.scrollHeight;
});
