const overlay = document.getElementById("overlay");
const closeBtns = document.querySelectorAll(".close-btn");
const allOverlayDivs = document.querySelectorAll(".overlay-div");

let currentOverlay = null;

function OpenOverlayDiv(id) {
  if (currentOverlay === id) return;

  allOverlayDivs.forEach((div) => (div.style.display = "none"));

  const overlayDiv = document.getElementById(id);
  if (!overlayDiv) return;

  overlayDiv.style.display = "flex";
  overlay.style.display = "flex";
  currentOverlay = id;
}

function CloseOverlay(id) {
  if (id && currentOverlay !== id) return;

  allOverlayDivs.forEach((div) => (div.style.display = "none"));
  overlay.style.display = "none";
  currentOverlay = null;
}

function EnableOverlay(enable, overlayDiv) {
  if (enable && overlayDiv) {
    OpenOverlayDiv(overlayDiv.id);
  } else {
    CloseOverlay();
  }
}

closeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const overlayDiv = btn.closest(".overlay-div");
    if (overlayDiv) CloseOverlay(overlayDiv.id);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (currentOverlay === "set-name" || currentOverlay === "session-over")
    return;
  CloseOverlay();
});
