const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const {
  startServer,
  setSettings,
  getSettings,
  startSession,
  endSession,
} = require("./server");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const plist = require("plist");

const { dialog } = require("electron");
const { autoUpdater } = require("electron-updater");

Menu.setApplicationMenu(null);

let win;
let serverInfo = null;

function createWindow() {
  win = new BrowserWindow({
    width: 480,
    height: 540,
    resizable: false,
    frame: false,
    webPreferences: {
      zoomFactor: 1.0,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(__dirname, "admin", "index.html"));
  //win.webContents.openDevTools();
}

ipcMain.handle("start-session", (event) => {
  startSession();
});

ipcMain.handle("end-session", (event) => {
  endSession();
});

ipcMain.on("close-window", () => {
  app.quit();
});

ipcMain.on("minimize-window", () => {
  BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.handle("get-server-info", () => serverInfo);

ipcMain.handle("save-settings", (event, config) => {
  setSettings(config);
});

ipcMain.handle("choose-folder", async () => {
  console.time("dialog");
  const result = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
  });
  console.timeEnd("dialog");
  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("open-folder", (event, folderPath) => {
  shell.openPath(folderPath);
});

ipcMain.handle("list-submissions", () => {
  const settings = getSettings();
  if (!settings || !settings.submissionsFolder || !settings.sessionName) {
    return [];
  }

  const sessionDir = path.join(
    settings.submissionsFolder,
    settings.sessionName,
  );
  if (!fs.existsSync(sessionDir)) {
    return [];
  }

  const people = fs
    .readdirSync(sessionDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());

  const submissions = people.map((person) => {
    const personDir = path.join(sessionDir, person.name);
    const files = fs
      .readdirSync(personDir)
      .filter((file) => file.endsWith(".html"));

    let lastUpload = 0;
    for (const file of files) {
      const { mtimeMs } = fs.statSync(path.join(personDir, file));
      if (mtimeMs > lastUpload) {
        lastUpload = mtimeMs;
      }
    }

    return { name: person.name, count: files.length, lastUpload };
  });

  submissions.sort((a, b) => b.lastUpload - a.lastUpload);
  return submissions;
});

app.whenReady().then(async () => {
  serverInfo = await startServer(3000);
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on("update-available", () => {
  console.log("Update available");
});

autoUpdater.on("update-downloaded", () => {
  autoUpdater.quitAndInstall();
});

function sha256Upper(value) {
  return crypto.createHash("sha256").update(value).digest("hex").toUpperCase();
}

function rncryptorV3(plaintext, password) {
  const encSalt = crypto.randomBytes(8);
  const hmacSalt = crypto.randomBytes(8);
  const iv = crypto.randomBytes(16);

  const encKey = crypto.pbkdf2Sync(password, encSalt, 10000, 32, "sha1");
  const hmacKey = crypto.pbkdf2Sync(password, hmacSalt, 10000, 32, "sha1");

  const cipher = crypto.createCipheriv("aes-256-cbc", encKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  const header = Buffer.concat([
    Buffer.from([0x03, 0x01]),
    encSalt,
    hmacSalt,
    iv,
    ciphertext,
  ]);

  const hmac = crypto.createHmac("sha256", hmacKey).update(header).digest();
  return Buffer.concat([header, hmac]);
}

function buildEncryptedSeb(xml, password) {
  const inner = zlib.gzipSync(Buffer.from(xml, "utf8"));
  const encrypted = rncryptorV3(inner, password);
  return zlib.gzipSync(
    Buffer.concat([Buffer.from("pswd", "ascii"), encrypted]),
  );
}

ipcMain.handle(
  "generate-seb",
  async (
    e,
    { quitPassword, settingsPassword, link, submissionsFolder, sessionName },
  ) => {
    const host = link.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const ipOnly = host.split(":")[0].replace(/\./g, "\\.");
    const port = host.split(":")[1];

    const browserExamKey = crypto.randomBytes(32).toString("hex");

    const config = {
      originatorVersion: "SEB_Win_3.5.0",
      startURL: link,
      sebServerURL: "",
      hashedQuitPassword: sha256Upper(quitPassword),
      allowQuit: true,

      // Fullscreen
      browserViewMode: 1,
      mainBrowserWindowWidth: "100%",
      mainBrowserWindowHeight: "100%",
      mainBrowserWindowPositioning: 1,

      // Toolbar + taskbar
      enableBrowserWindowToolbar: true,
      hideBrowserWindowToolbar: false,
      showTaskBar: true,
      taskBarHeight: 40,
      showSideMenu: true,
      showTime: true,

      // Clipboard
      clipboardPolicy: 2,
      enablePrivateClipboard: true,

      // Reload
      browserWindowAllowReload: true,
      newBrowserWindowAllowReload: true,
      showReloadButton: true,

      // Block new windows
      newBrowserWindowByLinkPolicy: 0,
      newBrowserWindowByScriptPolicy: 0,
      newBrowserWindowByLinkBlockForeign: true,
      newBrowserWindowByScriptBlockForeign: true,
      blockPopUpWindows: true,

      // URL filter (Windows keys)
      enableURLFilter: true,
      enableURLContentFilter: true,
      urlFilterRegex: true,
      urlFilterTrustedContent: false,
      blacklistURLFilter: "",
      whitelistURLFilter: `^.*?:\\/\\/((${ipOnly})|(.*?\\.${ipOnly})):${port}\\/((/.*?)|(/.*?))(()|(\\?.*?))$`,

      // No back/forward
      allowBrowsingBackForward: false,
      newBrowserWindowNavigation: false,
      showNavigationButtons: false,
      browserWindowAllowAddressBar: false,
      newBrowserWindowAllowAddressBar: false,
      allowPreferencesWindow: false,

      // Browser Exam Key
      browserExamKey,
      sendBrowserExamKey: true,

      // Don't clear browser session
      examSessionClearCookiesOnStart: false,
      examSessionClearCookiesOnEnd: false,
    };

    const xml = plist.build(config);

    const safeName = sessionName.replace(/[<>:"/\\|?*]/g, "_");
    const dir = path.join(submissionsFolder, safeName);
    fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, `${safeName}.seb`);

    if (settingsPassword) {
      fs.writeFileSync(filePath, buildEncryptedSeb(xml, settingsPassword));
    } else {
      fs.writeFileSync(filePath, xml);
    }

    return { filePath, browserExamKey };
  },
);
