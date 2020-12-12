
const canvas = document.getElementById('vscodeTestCanvas');

function saveAsPng() {
  // Call back to the extension context to save the image to the workspace folder.
  const vscode = acquireVsCodeApi();
  vscode.postMessage({
    command: 'saveAsPng',
    text: canvas.toDataURL()
  });
}

const saveAsPngButton = document.getElementById('saveAsPngButton');
saveAsPngButton.addEventListener('click', saveAsPng);

// Draw 
var ctx = canvas.getContext("2d");
ctx.beginPath();
ctx.rect(50, 50, 50, 50);
ctx.strokeStyle = 'blue';
ctx.lineWidth = 3;
ctx.stroke();

