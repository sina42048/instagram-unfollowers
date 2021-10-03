const { app, BrowserWindow, ipcMain, webContents } = require("electron");
const { IgApiClient } = require("instagram-private-api");
const url = require("url");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    center: true,
    fullscreenable: false,
    hasShadow: true,
    title: "Instagram Unfollowers",
    width: 640,
    height: 480,
    resizable: false,
    //frame: false,
    icon: path.join(__dirname, path.sep, "images", "instagram.png"),
    webPreferences: {
      preload: path.join(__dirname, path.sep, "scripts", "preload.js"),
    },
  });

  win.loadURL(
    url.format({
      pathname: path.join(__dirname, "index.html"),
      protocol: "file:",
      slashes: true,
    })
  );

  win.webContents.openDevTools();
}

app.setAppUserModelId("Instagram Unfollowers");

app.whenReady().then(() => {
  createWindow();

  ipcMain.on("login_request", async (event, args) => {
    console.log(args);
    const userData = {
      username: args.username,
      password: args.password,
    };
    await instagram.loginRequest(
      userData,
      (user) => {
        event.sender.send("login_response", { success: true, ...user });
      },
      (err) => {
        event.sender.send("login_response", { success: false, err });
      }
    );
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

const instagram = (function () {
  const ig = new IgApiClient();

  async function loginRequest({ username, password }, onSuccess, onFailure) {
    ig.state.generateDevice((Math.random() * 100000).toString());
    try {
      const userData = await ig.account.login(username, password);
      onSuccess(userData);
    } catch (err) {
      onFailure(err);
    }
  }

  return {
    loginRequest,
  };
})();
