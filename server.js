const express = require("express");
const os = require("os");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const asset = multer({
  storage: multer.diskStorage({
    destination: "assets/",
    filename: (req, file, cb) => {
      cb(null, req.body.name + path.extname(file.originalname));
    },
  }),
});

let settings = null;
let sessionActive = false;
let sessionId = null;

const crypto = require("crypto");

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const [name, iface] of Object.entries(interfaces)) {
    for (const net of iface) {
      if (net.family === "IPv4" && !net.internal) {
        if (/^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(net.address)) {
          return net.address;
        }
      }
    }
  }
  return "localhost";
}

function startServer(port = 3000) {
  const app = express();

  app.use(express.static(path.join(__dirname, "public")));
  app.use(express.json());

  app.get("/settings", (req, res) => {
    res.json(settings);
  });

  app.get("/session", (req, res) => {
    if (!sessionActive) {
      return res.json({ active: false });
    }
    const msLeft = settings.endTime - Date.now();
    res.json({
      id: sessionId,
      msLeft: msLeft,
      active: sessionActive,
    });
  });

  app.get("/seb", (req, res) => {
    if (!settings) {
      return res.status(404).send("No session configured");
    }

    const filePath = path.join(
      settings.submissionsFolder,
      settings.sessionName,
      `${settings.sessionName}.seb`,
    );

    res.download(filePath, `${settings.sessionName}.seb`);
  });

  app.get("/templates", (req, res) => {
    const file = path.join(__dirname, "templates", "Template.html");
    if (!fs.existsSync(file)) return res.status(404).json({ code: null });

    const code = fs.readFileSync(file, "utf8");
    res.json({ code });
  });

  app.post("/upload-template", (req, res) => {
    const { code } = req.body;
    fs.mkdirSync("assets/Template.html", { recursive: true });
    fs.writeFileSync(`assets/Template.html`, code);
    res.json({ response: true });
  });

  app.post("/upload-asset", asset.single("asset"), (req, res) => {
    res.json({ url: "/assets/" + req.file.filename });
  });

  app.use("/assets", express.static("assets"));

  app.post("/submit", (req, res) => {
    if (!sessionActive || !settings) {
      return res.status(403).json({ error: "No active session" });
    }

    const { html, personName } = req.body;

    if (!personName || !html) {
      return res.status(400).json({ error: "Missing name or work" });
    }

    const safeName = personName.replace(/[^a-zA-Z0-9-_ ]/g, "");
    const submittedAt = new Date().toISOString();
    const stamp = submittedAt.replace(/:/g, "-");
    const personDir = `${settings.submissionsFolder}/${settings.sessionName}/${safeName}`;

    fs.mkdirSync(personDir, { recursive: true });
    fs.writeFileSync(`${personDir}/${stamp}.html`, html);
    res.json({ ok: true });
  });

  return new Promise((resolve) => {
    app.listen(port, "0.0.0.0", () => {
      resolve({ port, ip: getLocalIP(), hostname: os.hostname() });
    });
  });
}

function setSettings(config) {
  settings = config;
}

function getSettings() {
  return settings;
}

function startSession() {
  sessionId = crypto.randomUUID();
  sessionActive = true;
}
function endSession() {
  sessionId = 0;
  sessionActive = false;
}

module.exports = {
  startServer,
  setSettings,
  getSettings,
  startSession,
  endSession,
};
