const sebLinkField = document.getElementById("seb-download-field");
const sebLink = document.getElementById("seb-download-link");
const sebQuitPassword = document.getElementById("seb-quit-password");
const sebSettingsPassword = document.getElementById("seb-settings-password");

async function GenerateSebConfig() {
  const quitPassword = sebQuitPassword.value.trim();
  const settingsPassword = sebSettingsPassword.value.trim();
  const link = `${serverUrl}/editor.html`;

  if (!quitPassword) {
    Confirm("You haven't set a quit password!");
    return;
  }

  if (!settingsPassword) {
    Confirm("You haven't set a settings password!");
    return;
  }

  try {
    const { filePath } = await window.api.generateSeb({
      quitPassword,
      settingsPassword,
      link,
      sessionName: settings.sessionName.value,
      submissionsFolder,
    });
    AlertMsg(`Saved to ${filePath}`);
    sebLinkField.style.display = "block";
    sebLink.textContent = `${serverUrl}/seb`;
  } catch (err) {
    console.error(err);
    Confirm("Failed to generate config file");
  }
}
