const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
  saveVideoToFile: (data) => {
    ipcRenderer.send("saveVideoToFile", data)
  },
});
