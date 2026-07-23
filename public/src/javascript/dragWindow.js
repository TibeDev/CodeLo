const EDGE = 8;
const MIN = 50;
let shield;

function addShield(cursor) {
  shield = document.createElement("div");
  shield.style.cssText = `position:fixed;inset:0;z-index:999999;cursor:${cursor}`;
  document.body.appendChild(shield);
}

function removeShield() {
  shield?.remove();
  shield = null;
}

function getEdges(e, r) {
  return {
    l: e.clientX < r.left + EDGE,
    rt: e.clientX > r.right - EDGE,
    t: e.clientY < r.top + EDGE,
    b: e.clientY > r.bottom - EDGE,
  };
}

function edgeCursor({ l, rt, t, b }) {
  if ((t && l) || (b && rt)) return "nwse-resize";
  if ((t && rt) || (b && l)) return "nesw-resize";
  if (l || rt) return "ew-resize";
  if (t || b) return "ns-resize";
  return "move";
}

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

function makeDraggable(className) {
  document.querySelectorAll("." + className).forEach((el) => {
    el.style.position = "absolute";
    el.style.resize = "none";

    el.addEventListener("pointermove", (e) => {
      if (shield) return;
      el.style.cursor = edgeCursor(getEdges(e, el.getBoundingClientRect()));
    });

    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      el.setPointerCapture(e.pointerId);

      const r = el.getBoundingClientRect();
      const ed = getEdges(e, r);
      const resizing = ed.l || ed.rt || ed.t || ed.b;
      addShield(edgeCursor(ed));

      const startX = e.clientX,
        startY = e.clientY;
      const startW = r.width,
        startH = r.height;
      const startL = el.offsetLeft,
        startT = el.offsetTop;

      function onMove(ev) {
        const vw = document.documentElement.clientWidth;
        const vh = document.documentElement.clientHeight;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;

        if (!resizing) {
          el.style.left = clamp(startL + dx, 0, vw - startW) + "px";
          el.style.top = clamp(startT + dy, 0, vh - startH) + "px";
          return;
        }

        if (ed.rt) el.style.width = clamp(startW + dx, MIN, vw - startL) + "px";
        if (ed.b) el.style.height = clamp(startH + dy, MIN, vh - startT) + "px";

        if (ed.l) {
          const w = clamp(startW - dx, MIN, startL + startW);
          el.style.width = w + "px";
          el.style.left = startL + (startW - w) + "px";
        }
        if (ed.t) {
          const h = clamp(startH - dy, MIN, startT + startH);
          el.style.height = h + "px";
          el.style.top = startT + (startH - h) + "px";
        }
      }

      function onUp() {
        el.releasePointerCapture(e.pointerId);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        removeShield();
      }

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
    });
  });
}

makeDraggable("window");
