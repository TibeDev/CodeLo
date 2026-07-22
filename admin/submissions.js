const sessionMenu = document.getElementById("session-menu");
const editorSettings = document.getElementById("editor-settings");
const refreshSubmissionListBtn = document.getElementById(
  "refresh-submission-list-btn",
);
refreshSubmissionListBtn.addEventListener("click", LoadSubmissionList);

function FormatUploadTime(ms) {
  if (!ms) return "-";
  return new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function LoadSubmissionList() {
  const submissions = await window.api.listSubmissions();
  const rows = document.getElementById("submission-list-rows");
  rows.innerHTML = "";

  if (submissions.length === 0) {
    const empty = document.createElement("div");
    empty.id = "submission-list-empty";
    empty.textContent = "No submissions yet";
    rows.appendChild(empty);
    return;
  }

  for (const submission of submissions) {
    const row = document.createElement("div");
    row.className = "submission-row";

    const name = document.createElement("span");
    name.textContent = submission.name;

    const lastUpload = document.createElement("span");
    lastUpload.textContent = FormatUploadTime(submission.lastUpload);

    const count = document.createElement("span");
    count.textContent = submission.count;

    row.append(name, lastUpload, count);
    rows.appendChild(row);
  }
}
