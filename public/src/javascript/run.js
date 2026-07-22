const SHIM_HTML = `
<style>
  #__modal{position:fixed;inset:0;background:rgba(0,0,0,.5);display:none;
    align-items:center;justify-content:center;z-index:2147483647;font:14px sans-serif}
  #__modal>div{background:#fff;padding:16px;border-radius:8px;min-width:240px;max-width:80%}
  #__modal input{width:100%;margin:8px 0;padding:6px;box-sizing:border-box}
  #__modal button{margin-left:8px;padding:5px 12px}
</style>
<div id="__modal"><div>
  <p id="__msg"></p>
  <input id="__in" hidden>
  <div style="text-align:right">
    <button id="__cancel" hidden>Cancel</button>
    <button id="__ok">OK</button>
  </div>
</div></div>
`;

const SHIM_JS = `
(function(){
  var m=document.getElementById('__modal'),msg=document.getElementById('__msg'),
      inp=document.getElementById('__in'),ok=document.getElementById('__ok'),
      cancel=document.getElementById('__cancel');
  var queue=Promise.resolve();
  function show(text,o){
    o=o||{};
    return queue=queue.then(function(){return new Promise(function(res){
      msg.textContent=String(text);
      inp.hidden=!o.input; inp.value=o.def||'';
      cancel.hidden=!o.cancelBtn;
      m.style.display='flex';
      function done(v){m.style.display='none';ok.onclick=cancel.onclick=null;res(v);}
      ok.onclick=function(){done(o.input?inp.value:true);};
      cancel.onclick=function(){done(o.input?null:false);};
    });});
  }
  window.alert=function(t){return show(t);};
  window.prompt=function(t,d){return show(t,{input:true,cancelBtn:true,def:d||''});};
  window.confirm=function(t){return show(t,{cancelBtn:true});};
})();
`;

const CT = "<" + "/script>";

let timeOutId;
const idleTime = 500;

function ResetTimer() {
  clearTimeout(timeOutId);
  timeOutId = setTimeout(run, idleTime);
}

function PatchDialogs(src) {
  return src.replace(/(?<!\.)\b(alert|prompt|confirm)\s*\(/g, "await $1(");
}

function run() {
  const html = htmlEditor.getValue();
  const css = cssEditor.getValue();
  const js = jsEditor.getValue();

  SaveToLocalStorage();

  const userJs = PatchDialogs(js).replace(/<\/script>/gi, "<\\/script>");

  document.getElementById("output").srcdoc =
    "<!DOCTYPE html><html><head><style>" +
    css +
    "</style></head><body>" +
    SHIM_HTML +
    "<script>" +
    SHIM_JS +
    CT +
    html +
    "<script>(async function(){\n" +
    userJs +
    "\n})();" +
    CT +
    "</body></html>";
}
