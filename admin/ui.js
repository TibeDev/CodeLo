function CloseApp() {
  window.win.close();
}

function MinimizeApp() {
  window.win.minimize();
}

async function CopyLink(linkEl) {
  const link = linkEl.textContent;
  await navigator.clipboard.writeText(link);
  AlertMsg("Copied Link!");
}
