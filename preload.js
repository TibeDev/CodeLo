const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  saveSettings: (config) => ipcRenderer.invoke("save-settings", config),
  getServerInfo: () => ipcRenderer.invoke("get-server-info"),
  chooseFolder: () => ipcRenderer.invoke("choose-folder"),
  openFolder: (folderPath) => ipcRenderer.invoke("open-folder", folderPath),
  startSession: () => ipcRenderer.invoke("start-session"),
  endSession: () => ipcRenderer.invoke("end-session"),
  listSubmissions: () => ipcRenderer.invoke("list-submissions"),
  generateSeb: (data) => ipcRenderer.invoke("generate-seb", data),
});

contextBridge.exposeInMainWorld("win", {
  close: () => ipcRenderer.send("close-window"),
  minimize: () => ipcRenderer.send("minimize-window"),
});
