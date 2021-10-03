const { ipcRenderer } = require("electron");
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("api", {
  loginRequest: (username, password) =>
    ipcRenderer.send("login_request", { username, password }),
  onLoginResponse: (handler) => {
    ipcRenderer.on("login_response", handler);
  },
  unfollowersListRequest: () => {
    ipcRenderer.send("unfollowers_list_request");
  },
  onUnfollowersListResponse: (handler) => {
    ipcRenderer.on("unfollowers_list_response", handler);
  },
});
