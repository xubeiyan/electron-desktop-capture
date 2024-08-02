const {
  app,
  BrowserWindow,
  desktopCapturer,
  session,
  ipcMain,
} = require("electron");

const path = require('node:path');
const fs = require('node:fs');

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(app.getAppPath(), "preload.js"),
    },
  });

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer.getSources({ types: ["screen"] }).then((sources) => {
      // Grant access to the first screen found.
      callback({ video: sources[0], audio: "loopback" });
    });
  });

  ipcMain.on('saveVideoToFile', async (_, data) => {
    const { buffer, filename } = data;
    const saveBuffer = Buffer.from(buffer);
    fs.writeFileSync(`./${filename}`, saveBuffer);
  });

  mainWindow.loadFile("index.html");
});
