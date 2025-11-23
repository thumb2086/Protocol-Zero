"use strict";
const electron = require("electron");
const path = require("path");
const dgram = require("dgram");
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
class GameServer {
  socket;
  players = /* @__PURE__ */ new Map();
  port = 41234;
  constructor(port = 41234) {
    this.port = port;
    this.socket = dgram.createSocket("udp4");
  }
  start() {
    this.socket.on("error", (err) => {
      console.error("[Server] Error:", err);
      this.socket.close();
    });
    this.socket.on("message", (msg, rinfo) => {
      try {
        const packet = this.parsePacket(msg);
        this.handlePacket(packet, rinfo);
      } catch (err) {
        console.error("[Server] Failed to parse packet:", err);
      }
    });
    this.socket.on("listening", () => {
      const address = this.socket.address();
      console.log(`✓ Game Server listening on ${address.address}:${address.port}`);
      console.log("  Ready for UDP connections");
    });
    this.socket.bind(this.port);
  }
  parsePacket(buffer) {
    const type = buffer.readUInt8(0);
    const data = JSON.parse(buffer.slice(1).toString("utf-8"));
    return { type, data };
  }
  handlePacket(packet, rinfo) {
    const clientId = `${rinfo.address}:${rinfo.port}`;
    switch (packet.type) {
      case 1:
        console.log(`[Server] Player connected: ${clientId}`);
        this.players.set(clientId, {
          id: clientId,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0 },
          health: 100,
          lastUpdate: Date.now()
        });
        this.broadcast({ type: "PLAYER_JOINED", playerId: clientId });
        break;
      case 2:
        console.log(`[Server] Player disconnected: ${clientId}`);
        this.players.delete(clientId);
        this.broadcast({ type: "PLAYER_LEFT", playerId: clientId });
        break;
      case 3:
        const player = this.players.get(clientId);
        if (player) {
          player.position = packet.data.position;
          player.rotation = packet.data.rotation;
          player.lastUpdate = Date.now();
          this.broadcast({
            type: "PLAYER_MOVED",
            playerId: clientId,
            position: player.position,
            rotation: player.rotation
          }, clientId);
        }
        break;
      case 4:
        console.log(`[Server] Player ${clientId} fired weapon`);
        this.broadcast({
          type: "PLAYER_SHOT",
          playerId: clientId,
          weaponId: packet.data.weaponId,
          timestamp: Date.now()
        }, clientId);
        break;
      case 7:
        this.send({ type: "PONG", timestamp: packet.data.timestamp }, rinfo);
        break;
      default:
        console.warn(`[Server] Unknown packet type: ${packet.type}`);
    }
  }
  broadcast(data, excludeClientId) {
    const message = Buffer.from(JSON.stringify(data));
    this.players.forEach((player, clientId) => {
      if (clientId !== excludeClientId) {
        const [address, port] = clientId.split(":");
        this.socket.send(message, parseInt(port), address);
      }
    });
  }
  send(data, rinfo) {
    const message = Buffer.from(JSON.stringify(data));
    this.socket.send(message, rinfo.port, rinfo.address);
  }
  stop() {
    console.log("[Server] Shutting down...");
    this.socket.close();
    this.players.clear();
  }
  getPlayerCount() {
    return this.players.size;
  }
}
const gameServer = new GameServer(41234);
function createWindow() {
  const mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
      nodeIntegration: true,
      // For Havok/Babylon if needed, but context isolation is better
      contextIsolation: false
      // Simplifying for prototype, should be true in prod
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
electron.app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");
  electron.app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });
  console.log("[Protocol: Zero] Starting Game Server...");
  gameServer.start();
  createWindow();
  electron.app.on("activate", () => {
    if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
electron.app.on("window-all-closed", () => {
  console.log("[Protocol: Zero] Stopping Game Server...");
  gameServer.stop();
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
