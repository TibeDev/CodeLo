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

  const data = {
    sessionName: settings.sessionName.value,
    endTime: endTime,
    autocompleteHtml: settings.htmlCheckbox.checked,
    autocompleteCss: settings.cssCheckbox.checked,
    autocompleteJs: settings.jsCheckbox.checked,
    submissionsFolder: submissionsFolder,
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
