const alertDiv = document.getElementById("alert");
const alertTime = 2;
let alertTimeout;

alertDiv.style.display = "none";

function AlertMsg(msg) {
  alertDiv.textContent = msg;
  alertDiv.style.display = "flex";

  clearTimeout(alertTimeout);
  alertTimeout = setTimeout(() => {
    alertDiv.style.display = "none";
  }, alertTime * 1000);
}
