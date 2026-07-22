const prompt = document.getElementById("prompt");
const questionText = document.getElementById("prompt-question");
const acceptBtn = document.getElementById("accept-btn");
const denyBtn = document.getElementById("deny-btn");

function Prompt(question, acceptFunc) {
  OpenOverlayDiv("prompt");
  console.log("Opening prompt");
  prompt.style.display = "flex";
  questionText.textContent = question;
  acceptBtn.addEventListener("click", () => {
    acceptFunc();
    CloseOverlay("prompt");
    EnableOverlay(false);
  });
}
