const htmlEditor = CodeMirror.fromTextArea(
  document.getElementById("editor-html"),
  {
    mode: "htmlmixed",
    lineNumbers: true,
    autoCloseTags: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: "theme",

    lint: true,
    gutters: ["CodeMirror-lint-markers"],
  },
);

const cssEditor = CodeMirror.fromTextArea(
  document.getElementById("editor-css"),
  {
    mode: "css",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    theme: "theme",

    lint: true,
    gutters: ["CodeMirror-lint-markers"],
  },
);

const jsEditor = CodeMirror.fromTextArea(document.getElementById("editor-js"), {
  mode: "javascript",
  lineNumbers: true,
  autoCloseBrackets: true,
  matchBrackets: true,
  theme: "theme",

  lint: true,
  gutters: ["CodeMirror-lint-markers"],
});

htmlEditor.on("inputRead", function (cm) {
  if (!settings || !settings.autocompleteHtml) return;
  if (cm.state.completionActive) return;
  CodeMirror.commands.autocomplete(cm, null, {
    completeSingle: false,
  });
});

cssEditor.on("inputRead", function (cm) {
  if (!settings || !settings.autocompleteCss) return;
  if (cm.state.completionActive) return;
  CodeMirror.commands.autocomplete(cm, null, {
    completeSingle: false,
  });
});

jsEditor.on("inputRead", function (cm) {
  if (!settings || !settings.autocompleteJs) return;
  if (cm.state.completionActive) return;
  CodeMirror.commands.autocomplete(cm, null, {
    completeSingle: false,
  });
});

htmlEditor.on("change", ResetTimer);
cssEditor.on("change", ResetTimer);
jsEditor.on("change", ResetTimer);

function RefreshEditors() {
  htmlEditor.refresh();
  cssEditor.refresh();
  jsEditor.refresh();
}

function GetFullHtml(noHtmlTag = false) {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  const inner = `<head>
<style>
${css}
</style>
</head>
<body>
${html}
<script>
${js.replace(/<\/script>/gi, "<\\/script>")}
</script>
</body>`;

  if (noHtmlTag) {
    return inner;
  }

  const fullHtml = `<!DOCTYPE html>
<html>
${inner}
</html>`;

  return fullHtml;
}

GetFromLocalStorage();

function GetFromLocalStorage() {
  htmlEditor.setValue(localStorage.getItem("htmlCode") || "");
  cssEditor.setValue(localStorage.getItem("cssCode") || "");
  jsEditor.setValue(localStorage.getItem("jsCode") || "");
}

function SaveToLocalStorage() {
  localStorage.setItem("htmlCode", htmlEditor.getValue());
  localStorage.setItem("cssCode", cssEditor.getValue());
  localStorage.setItem("jsCode", jsEditor.getValue());
}

function WipeProject() {
  const htmlCode = assets?.code ?? "";
  htmlEditor.setValue(htmlCode);

  if (modeDropdown.selectedIndex == 0) {
    SetFullPage();
  } else {
    SeperateCode();
  }

  SaveToLocalStorage();
}

function DisableEditor(htmlEnable, cssEnable, jsEnable) {
  document.getElementById("html-panel").style.display = htmlEnable
    ? "block"
    : "none";
  document.getElementById("css-panel").style.display = cssEnable
    ? "block"
    : "none";
  document.getElementById("js-panel").style.display = jsEnable
    ? "block"
    : "none";
}

function SetFullPage() {
  htmlEditor.setValue(GetFullHtml(true));
  cssEditor.setValue("");
  jsEditor.setValue("");
  Format(htmlEditor, "html");
}

function SeperateCode() {
  const fullPage = htmlEditor.getValue();

  const styleMatch = fullPage.match(/<style>([\s\S]*?)<\/style>/i);
  const bodyMatch = fullPage.match(/<body>([\s\S]*?)<script>/i);
  const scriptMatch = fullPage.match(/<script>([\s\S]*?)<\/script>/i);

  const css = styleMatch ? styleMatch[1].trim() : "";
  const html = bodyMatch ? bodyMatch[1].trim() : fullPage.trim();
  const js = scriptMatch
    ? scriptMatch[1].replace(/<\\\/script>/gi, "</script>").trim()
    : "";

  htmlEditor.setValue(html);
  cssEditor.setValue(css);
  jsEditor.setValue(js);
}

async function Format(editor, parser) {
  const formatted = await prettier.format(editor.getValue(), {
    parser: parser,
    plugins: prettierPlugins,
  });
  const cursor = editor.getCursor();
  editor.setValue(formatted);
  editor.setCursor(cursor);
}

const refrence = document.getElementById("refrence");
let visible = false;
function ShowRefrence() {
  refrence.style.display = visible ? "flex" : "none";
  visible = !visible;
}
ShowRefrence();

const refrenceBtn = document.getElementById("refrence-btn");
function EnableRefrenceBtn(enable) {
  refrenceBtn.style.display = enable ? "block" : "none";
}
