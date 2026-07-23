const layoutEls = document.querySelectorAll(".layout-el");
const layoutDropdown = document.getElementById("layout-dropdown");

const modeDropdown = document.getElementById("mode-dropdown");

const layouts = [{ layout: "horizontal" }, { layout: "vertical" }];

const modes = [
  { mode: "html mixed", editorSize: [100, 0, 0], gutterSize: 0 },
  { mode: "seperate", editorSize: [33, 33, 34], gutterSize: 8 },
];

const editorNavs = document.querySelectorAll(".editor-nav");
editorNavs.forEach((nav) => {
  nav.addEventListener("dblclick", () => SetEditorSize(nav));
});

let editorSplit;
let mainSplit;

layouts.forEach((layout) => {
  layoutDropdown.innerHTML += `
      <option>
        ${layout.layout.toUpperCase()}
      </option>
    `;
});

modes.forEach((mode) => {
  modeDropdown.innerHTML += `
      <option>
        ${mode.mode.toUpperCase()}
      </option>
    `;
});

layoutDropdown.addEventListener("change", () => {
  updateLayout();
});

modeDropdown.addEventListener("change", () => {
  if (modeDropdown.value.toLowerCase() === "html mixed") {
    SetFullPage();
  } else {
    SeperateCode();
  }
  updateLayout();
});

window.addEventListener("DOMContentLoaded", updateLayout);

const savedIndex = localStorage.getItem("layoutIndex");
const index = savedIndex == null ? 0 : savedIndex;
layoutDropdown.selectedIndex = index;

const savedModeIndex = localStorage.getItem("modeIndex");
const modeIndex = savedModeIndex == null ? 0 : savedModeIndex;
modeDropdown.selectedIndex = modeIndex;

function updateLayout() {
  let modeType = null;
  modes.forEach((mode) => {
    if (mode.mode.toLowerCase() == modeDropdown.value.toLowerCase()) {
      modeType = mode;
    }
  });

  if (modeType.mode == "html mixed") {
    DisableEditor(true, false, false);
  } else {
    DisableEditor(true, true, true);
  }

  const layoutType = layoutDropdown.value.toLowerCase();
  layoutEls.forEach((element) => {
    layouts.forEach((item) => {
      element.classList.remove(item.layout);
    });

    element.classList.add(layoutType);
  });

  if (editorSplit) editorSplit.destroy();
  if (mainSplit) mainSplit.destroy();

  let layout;
  layouts.forEach((element) => {
    if (element.layout === layoutType) layout = element;
  });

  let oppositeLayout = layoutType == "vertical" ? "horizontal" : "vertical";

  editorSplit = Split(["#html-panel", "#css-panel", "#js-panel"], {
    direction: layoutType,
    sizes: modeType.editorSize,
    minSize: 0,
    snapOffset: 40,
    gutterSize: modeType.gutterSize,
  });

  mainSplit = Split(["#editor-panel", "#output"], {
    direction: oppositeLayout,
    sizes: [40, 60],
    minSize: 0,
    snapOffset: 40,
    gutterSize: 8,
  });

  RefreshEditors();

  localStorage.setItem("layoutIndex", layouts.indexOf(layout));
  localStorage.setItem("modeIndex", modes.indexOf(modeType));
}

function SetEditorSize(navEl) {
  const editorSize = JSON.parse(navEl.dataset.size);
  const currentSizes = editorSplit.getSizes();

  const biggestSize = Math.max(...editorSize);
  const biggestIndex = editorSize.indexOf(biggestSize);

  if (currentSizes[biggestIndex] > 95) {
    updateLayout();
    return;
  }

  editorSplit.setSizes(editorSize);
}
