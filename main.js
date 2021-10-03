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
      webSecurity: false,
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

  ipcMain.on("unfollowers_list_request", async (event, args) => {
    instagram.unfollowersListRequest(
      (unfollowers) => {
        event.sender.send("unfollowers_list_response", {
          success: true,
          unfollowers,
        });
      },
      (err) => {
        event.sender.send("unfollowers_list_response", { success: false, err });
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

  async function unfollowersListRequest(onSuccess, onFailure) {
    const followersFeed = ig.feed.accountFollowers(ig.state.cookieUserId);
    const followingsFeed = ig.feed.accountFollowing(ig.state.cookieUserId);

    try {
      const followers = await getAllItemsFromFeed(followersFeed);
      const followings = await getAllItemsFromFeed(followingsFeed);

      const followersUserName = new Set(
        followers.map(({ username }) => username)
      );
      const rawUnFollowers = followings.filter(
        (following) => !followersUserName.has(following.username)
      );
      
      const unFollowers = rawUnFollowers.map((unfollower) => {
        return {
          id: unfollower.pk,
          image: unfollower.profile_pic_url,
          name: unfollower.username,
        };
      });

      console.log(unFollowers);
      onSuccess(unFollowers);
    } catch (err) {
      console.log(err);
      onFailure(err);
    }
  }

  async function getAllItemsFromFeed(feed) {
    let items = [];

    do {
      items = items.concat(await feed.items());
    } while (feed.isMoreAvailable());
    return items;
  }

  return {
    loginRequest,
    unfollowersListRequest,
  };
})();
