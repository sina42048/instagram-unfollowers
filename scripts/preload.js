const { ipcRenderer } = require("electron");
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
    ipcRenderer: ipcRenderer
});