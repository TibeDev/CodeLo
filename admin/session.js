let serverUrl = null;

async function Init() {
  const { ip, port } = await window.api.getServerInfo();
  serverUrl = `http://${ip}:${port}`;
}
Init();

async function SaveSettings() {
  const [h, m] = settings.sessionTime.value.split(":");
  const end = new Date();
  end.setHours(Number(h), Number(m), 0, 0);
  const endTime = end.getTime();

  const codeFile = settings.templateCode.files[0];
  const refrenceFile = settings.refrenceImg.files[0];

  if (codeFile) {
    const code = await codeFile.text();

    const response = await fetch("http://localhost:3000/upload-template", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code }),
    });
  }

  if (refrenceFile) {
    const fd = new FormData();
    fd.append("name", "refrenceImg");
    fd.append("asset", refrenceFile);
    const { url } = await fetch("http://localhost:3000/upload-asset", {
      method: "POST",
      body: fd,
    }).then((r) => r.json());
  }

  const data = {
    sessionName: settings.sessionName.value,
    endTime: endTime,
    autocompleteHtml: settings.htmlCheckbox.checked,
    autocompleteCss: settings.cssCheckbox.checked,
    autocompleteJs: settings.jsCheckbox.checked,
    submissionsFolder: submissionsFolder,
    hasRefrence: refrenceFile,
  };

  if (!data.submissionsFolder) {
    return false;
  }
  if (!data.sessionName) {
    return false;
  }
  if (!data.endTime) {
    return false;
  }

  await window.api.saveSettings(data);
  return true;
}

async function StartSession() {
  const ok = await SaveSettings();
  if (!ok) {
    Confirm("You haven't filled out all required fields!");
  } else {
    const { ip, port } = await window.api.getServerInfo();
    window.api.startSession();
    document.getElementById("session-link").textContent =
      `http://${ip}:${port}/editor.html`;
    sessionMenu.style.display = "flex";
    editorSettings.style.display = "none";
    LoadSubmissionList();
  }
}

async function EndSession() {
  sessionMenu.style.display = "none";
  editorSettings.style.display = "flex";
  window.api.endSession();
  document.getElementById("submission-list-rows").innerHTML = "";
  sebLinkField.style.display = "none";
}
