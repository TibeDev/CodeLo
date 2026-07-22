const overlay = document.getElementById("overlay");
const closeBtns = document.querySelectorAll(".close-btn");

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const overlayDiv = btn.closest(".overlay-div");
    EnableOverlay(false, overlayDiv);
  });
});

function EnableOverlay(enable, overlayDiv) {
  const displayStyle = enable ? "flex" : "none";
  overlay.style.display = displayStyle;
  if (overlayDiv) overlayDiv.style.display = displayStyle;
}

function OpenOverlayDiv(id) {
  const overlayDiv = document.getElementById(id);
  EnableOverlay(true, overlayDiv);
}

function CloseOverlay(id) {
  const overlayDiv = document.getElementById(id);
  EnableOverlay(false, overlayDiv);
}

document.addEventListener("keydown", () => {
  if (event.key === "Escape") {
    EnableOverlay(false);
  }
});
