"use strict";
const electron = require("electron");
const path = require("path");
const promises = require("fs/promises");
const fs = require("fs");
const is = {
  dev: !electron.app.isPackaged
};
const platform = {
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
};
const electronApp = {
  setAppUserModelId(id) {
    if (platform.isWindows)
      electron.app.setAppUserModelId(is.dev ? process.execPath : id);
  },
  setAutoLaunch(auto) {
    if (platform.isLinux)
      return false;
    const isOpenAtLogin = () => {
      return electron.app.getLoginItemSettings().openAtLogin;
    };
    if (isOpenAtLogin() !== auto) {
      electron.app.setLoginItemSettings({ openAtLogin: auto });
      return isOpenAtLogin() === auto;
    } else {
      return true;
    }
  },
  skipProxy() {
    return electron.session.defaultSession.setProxy({ mode: "direct" });
  }
};
const optimizer = {
  watchWindowShortcuts(window, shortcutOptions) {
    if (!window)
      return;
    const { webContents } = window;
    const { escToCloseWindow = false, zoom = false } = shortcutOptions || {};
    webContents.on("before-input-event", (event, input) => {
      if (input.type === "keyDown") {
        if (!is.dev) {
          if (input.code === "KeyR" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "KeyI" && (input.alt && input.meta || input.control && input.shift)) {
            event.preventDefault();
          }
        } else {
          if (input.code === "F12") {
            if (webContents.isDevToolsOpened()) {
              webContents.closeDevTools();
            } else {
              webContents.openDevTools({ mode: "undocked" });
              console.log("Open dev tool...");
            }
          }
        }
        if (escToCloseWindow) {
          if (input.code === "Escape" && input.key !== "Process") {
            window.close();
            event.preventDefault();
          }
        }
        if (!zoom) {
          if (input.code === "Minus" && (input.control || input.meta))
            event.preventDefault();
          if (input.code === "Equal" && input.shift && (input.control || input.meta))
            event.preventDefault();
        }
      }
    });
  },
  registerFramelessWindowIpc() {
    electron.ipcMain.on("win:invoke", (event, action) => {
      const win = electron.BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (action === "show") {
          win.show();
        } else if (action === "showInactive") {
          win.showInactive();
        } else if (action === "min") {
          win.minimize();
        } else if (action === "max") {
          const isMaximized = win.isMaximized();
          if (isMaximized) {
            win.unmaximize();
          } else {
            win.maximize();
          }
        } else if (action === "close") {
          win.close();
        }
      }
    });
  }
};
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler((details) => {
    electron.shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
function getFoundryPath(...parts) {
  return path.join(electron.app.getPath("userData"), "foundry", ...parts);
}
function getBlueprintsPath(...parts) {
  if (is.dev) {
    return path.join(process.cwd(), "blueprints", ...parts);
  }
  return path.join(process.resourcesPath, "blueprints", ...parts);
}
function getProfilesPath(...parts) {
  if (is.dev) {
    return path.join(process.cwd(), "profiles", ...parts);
  }
  return path.join(process.resourcesPath, "profiles", ...parts);
}
electron.ipcMain.handle("foundry:readFile", async (_, filePath) => {
  try {
    const data = await promises.readFile(filePath, "utf-8");
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("foundry:writeFile", async (_, filePath, data) => {
  try {
    await promises.writeFile(filePath, data, "utf-8");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("foundry:listFiles", async (_, dirPath) => {
  try {
    const files = await promises.readdir(dirPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("foundry:ensureDir", async (_, dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      await promises.mkdir(dirPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("foundry:getPath", async (_, type, ...parts) => {
  try {
    let path2;
    switch (type) {
      case "foundry":
        path2 = getFoundryPath(...parts);
        break;
      case "blueprints":
        path2 = getBlueprintsPath(...parts);
        break;
      case "profiles":
        path2 = getProfilesPath(...parts);
        break;
      default:
        throw new Error(`Unknown path type: ${type}`);
    }
    return { success: true, path: path2 };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("github:saveToken", async (_, token) => {
  try {
    if (!electron.app.isReady()) {
      throw new Error("App not ready for secure storage");
    }
    const { safeStorage } = require("electron");
    if (!safeStorage.isEncryptionAvailable()) {
      console.warn("[GitHub] Encryption not available, storing in plain text (not recommended)");
      const tokenPath2 = getFoundryPath("github-token.txt");
      await promises.mkdir(getFoundryPath(), { recursive: true });
      await promises.writeFile(tokenPath2, token, "utf-8");
      return { success: true, encrypted: false };
    }
    const encrypted = safeStorage.encryptString(token);
    const tokenPath = getFoundryPath("github-token.enc");
    await promises.mkdir(getFoundryPath(), { recursive: true });
    await promises.writeFile(tokenPath, encrypted);
    console.log("[GitHub] Token saved securely");
    return { success: true, encrypted: true };
  } catch (error) {
    console.error("[GitHub] Failed to save token:", error);
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("github:getToken", async () => {
  try {
    if (!electron.app.isReady()) {
      throw new Error("App not ready for secure storage");
    }
    const { safeStorage } = require("electron");
    const encTokenPath = getFoundryPath("github-token.enc");
    if (fs.existsSync(encTokenPath)) {
      if (!safeStorage.isEncryptionAvailable()) {
        throw new Error("Cannot decrypt token: encryption not available");
      }
      const encrypted = await promises.readFile(encTokenPath);
      const token = safeStorage.decryptString(encrypted);
      return { success: true, token, encrypted: true };
    }
    const plainTokenPath = getFoundryPath("github-token.txt");
    if (fs.existsSync(plainTokenPath)) {
      const token = await promises.readFile(plainTokenPath, "utf-8");
      console.warn("[GitHub] Using plain text token (not encrypted)");
      return { success: true, token, encrypted: false };
    }
    return { success: false, error: "No token found" };
  } catch (error) {
    console.error("[GitHub] Failed to get token:", error);
    return { success: false, error: error.message };
  }
});
electron.ipcMain.handle("github:clearToken", async () => {
  try {
    const { unlink } = require("fs/promises");
    const encTokenPath = getFoundryPath("github-token.enc");
    const plainTokenPath = getFoundryPath("github-token.txt");
    const promises2 = [];
    if (fs.existsSync(encTokenPath)) {
      promises2.push(unlink(encTokenPath));
    }
    if (fs.existsSync(plainTokenPath)) {
      promises2.push(unlink(plainTokenPath));
    }
    await Promise.all(promises2);
    console.log("[GitHub] Token cleared");
    return { success: true };
  } catch (error) {
    console.error("[GitHub] Failed to clear token:", error);
    return { success: false, error: error.message };
  }
});
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.foundry");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
