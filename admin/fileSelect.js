let submissionsFolder = null;

if (!!localStorage.getItem("submissions-folder")) {
  submissionsFolder = localStorage.getItem("submissions-folder");
  document.getElementById("folder-display").textContent = submissionsFolder;
}

async function ChooseFolder() {
  console.time("choose-folder-total");
  const folder = await window.api.chooseFolder();
  console.timeEnd("choose-folder-total");
  if (folder) {
    submissionsFolder = folder;
    document.getElementById("folder-display").textContent = folder;
    localStorage.setItem("submissions-folder", folder);
  }
}

function OpenFolder() {
  if (!submissionsFolder) return;
  window.api.openFolder(submissionsFolder);
}

function ChooseFile(id) {
  const input = document.getElementById(id + "-input");
  input.click();
}

function SetFileInputs() {
  const fileInputs = document.querySelectorAll(".file-select-input");
  fileInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const id = input.id.replace("-input", "");
      const btn = document.getElementById(id + "-btn");
      btn.textContent = input.files[0]?.name ?? "Select a file";
    });
  });
}
SetFileInputs();
