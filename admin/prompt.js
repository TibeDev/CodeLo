const prompt = document.getElementById("prompt");
const questionText = document.getElementById("prompt-question");
const acceptBtnPrompt = document.getElementById("accept-btn-prompt");
const denyBtnPrompt = document.getElementById("close-btn-prompt");

function Prompt(question, acceptFunc) {
  OpenOverlayDiv("prompt");
  console.log("Opening prompt");
  prompt.style.display = "flex";
  questionText.textContent = question;
  acceptBtnPrompt.addEventListener("click", () => {
    acceptFunc();
    CloseOverlay("prompt");
    EnableOverlay(false);
  });
}
