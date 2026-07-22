const themes = [
  "default-dark",
  "default",
  "vdb-theme",
  "dracula",
  "vscode",
  "frosted-flowers",
  "q-ocean",
];

const head = document.head;

const themeLinkPage = document.createElement("link");
themeLinkPage.rel = "stylesheet";
themeLinkPage.id = "theme-link-page";
head.appendChild(themeLinkPage);

const themeDropdown = document.getElementById("theme-dropdown");

themes.forEach((theme) => {
  themeDropdown.innerHTML += `<option>${theme.toUpperCase()}</option>`;
});

const themeIndex = Number(localStorage.getItem("themeIndex")) || 0;

themeDropdown.selectedIndex = themeIndex;
SetTheme(themes[themeIndex]);

themeDropdown.addEventListener("change", () => {
  SetTheme(themeDropdown.value.toLowerCase());
});

window.addEventListener("beforeunload", (event) => {
  localStorage.setItem(
    "themeIndex",
    themes.indexOf(themeDropdown.value.toLowerCase()),
  );
});

function SetTheme(theme) {
  themeLinkPage.href = `./src/styling/themes/${theme}/${theme}.css`;
}
