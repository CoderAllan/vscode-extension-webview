import * as vscode from 'vscode';
import { Base64 } from 'js-base64';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const vscodeTestDisposable = vscode.commands.registerCommand('vscodetest.webview', () => {
    const webviewPanel = vscode.window.createWebviewPanel(
      'vscodeTest',
      'VsCode test webview',
      vscode.ViewColumn.One,
      {
        enableScripts: true
      }
    );    
    webviewPanel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'saveAsPng':
            saveAsPng(message.text);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
    setHtmlContent(webviewPanel.webview, context);
  });
  context.subscriptions.push(vscodeTestDisposable);
}

function getWorkspaceFolder(): string {
  var folder = vscode.workspace.workspaceFolders;
  var directoryPath: string = '';
  if (folder != null) {
    directoryPath = folder[0].uri.fsPath;
  }
  return directoryPath;
}

function writeFile(filename: string, content: string | Uint8Array, callback: () => void) {
  fs.writeFile(filename, content, function (err) {
    if (err) {
      return console.error(err);
    }
    callback();
  });
}

function saveAsPng(messageText: string) {
  const dataUrl = messageText.split(',');
  if (dataUrl.length > 0) {
    const u8arr = Base64.toUint8Array(dataUrl[1]);

    const workspaceDirectory = getWorkspaceFolder();
    const newFilePath = path.join(workspaceDirectory, 'VsCodeExtensionTest.png');
    writeFile(newFilePath, u8arr, () => {
      vscode.window.showInformationMessage(`The file ${newFilePath} has been created in the root of the workspace.`);      
    });
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function setHtmlContent(webview: vscode.Webview, extensionContext: vscode.ExtensionContext) {
  let htmlContent = `<html>
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src cspSource; script-src 'nonce-nonce';">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="vscodeTest.css" rel="stylesheet">
  </head>
  <body>
    <div id="buttons">
      <input type="button" id="saveAsPngButton" value="Save as png">
    </div>
    <div id="canvasSection"><canvas id="vscodeTestCanvas" /></div>
    <script type="text/javascript" src="vscodeTest.js"></script>
  </body>
</html>`;
  const jsFilePath = vscode.Uri.joinPath(extensionContext.extensionUri, 'javascript', 'vscodeTest.js');
  const visUri = webview.asWebviewUri(jsFilePath);
  htmlContent = htmlContent.replace('vscodeTest.js', visUri.toString());

  const cssPath = vscode.Uri.joinPath(extensionContext.extensionUri, 'stylesheet', 'vscodeTest.css');
  const cssUri = webview.asWebviewUri(cssPath);
  htmlContent = htmlContent.replace('vscodeTest.css', cssUri.toString());
  
  const nonce = getNonce();
  htmlContent = htmlContent.replace('nonce-nonce', `nonce-${nonce}`);
  htmlContent = htmlContent.replace(/<script /g, `<script nonce="${nonce}" `);
  htmlContent = htmlContent.replace('cspSource', webview.cspSource);
  
  webview.html = htmlContent;
}

// this method is called when your extension is deactivated
export function deactivate() { }
