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
  unfollowerRmoveRequest: (id) => {
    ipcRenderer.send("unfollower_remove_request", { id });
  },
  onUnfollowerRemoveResponse: (handler) => {
    ipcRenderer.on("unfollower_remove_response", handler);
  },
  closeWindowRequest: () => {
    ipcRenderer.send("close_window");
  }
});
