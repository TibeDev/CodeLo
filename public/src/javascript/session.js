const personNameInput = document.getElementById("person-name");
const sessionTimeTxt = document.getElementById("session-time");
const sessionNameTxt = document.getElementById("session-name");

let settings = null;
let sessionActive = false;
let loggedIn = false;

let msLeft;
let anchor;
let sessionEnded = false;

async function Sync() {
  const data = await fetch("/session").then((r) => r.json());
  sessionActive = data.active;

  if (!sessionActive) {
    OpenOverlayDiv("session-state");
    WipeProject();
    return;
  }

  msLeft = data.msLeft;
  anchor = Date.now();

  const storedSessionId = localStorage.getItem("sessionId");
  if (data.id && storedSessionId !== data.id) {
    WipeProject();
    localStorage.setItem("sessionId", data.id);
    sessionEnded = false;
  }

  loggedIn = !!localStorage.getItem("username");

  if (!loggedIn && !sessionEnded) {
    OpenOverlayDiv("set-name");
  } else if (!sessionEnded && currentOverlay === "session-state") {
    CloseOverlay("session-state");
  }
}

function FormatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function UpdateTimer() {
  const remaining = Math.max(0, msLeft - (Date.now() - anchor));
  sessionTimeTxt.textContent = FormatTime(remaining);

  if (remaining <= 0 && !sessionEnded) {
    sessionEnded = true;
    UploadProject(false);
    OpenOverlayDiv("session-over");
  }
}

async function Init() {
  settings = await fetch("/settings").then((r) => r.json());
  await Sync();
  UpdateTimer();
  setInterval(UpdateTimer, 1000);
  setInterval(Sync, 5000);
  sessionNameTxt.textContent = settings.sessionName;
}

function SetName() {
  if (personNameInput.value.trim() == "") {
    personNameInput.value = "";
    return;
  } else {
    loggedIn = true;
    localStorage.setItem("username", personNameInput.value.trim());
    CloseOverlay("set-name");
  }
}
Init();

async function UploadProject(showAlert) {
  const savedName = localStorage.getItem("username");
  if (!savedName || !savedName.trim()) return;

  const fullHtml = GetFullHtml(false);
  const personName = localStorage.getItem("username");

  const response = await fetch("/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html: fullHtml, personName: personName }),
  });

  if (showAlert) {
    if (response.ok) {
      AlertMsg("Uploaded succesfully!");
    } else {
      AlertMsg("Upload failed.");
    }
  }
}

function Logout() {
  loggedIn = false;
  localStorage.removeItem("username");
  WipeProject();
  Sync();
}
