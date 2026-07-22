const confirm = document.getElementById("confirm");
const messageTxt = document.getElementById("confirm-message");
const acceptBtn = document.getElementById("accept-btn");
const denyBtn = document.getElementById("deny-btn");

function Confirm(message) {
  confirm.style.display = "flex";
  messageTxt.textContent = message;
  OpenOverlayDiv("confirm");
  acceptBtn.addEventListener("click", () => {
    EnableOverlay(false, confirm);
  });
}
