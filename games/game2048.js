/* 2048 Neon */
GAMES["2048"] = function (root, api) {
  root.innerHTML = `<div class="g2048" aria-label="2048 board"></div>`;
  const box = root.firstChild; let g, score;
  function add() { const e = []; g.forEach((v, i) => v || e.push(i)); if (e.length) g[e[Math.random() * e.length | 0]] = Math.random() < 0.9 ? 2 : 4; }
  function slide(a) { const v = a.filter(Boolean); let gain = 0; for (let i = 0; i < v.length - 1; i++) if (v[i] === v[i + 1]) { v[i] *= 2; gain += v[i]; v.splice(i + 1, 1); } while (v.length < 4) v.push(0); return [v, gain]; }
  function draw() {
    box.innerHTML = g.map(v => `<div class="tile${v ? " t" : ""}" style="${v ? `--h:${(Math.log2(v) * 32 + 250) % 360}` : ""}">${v || ""}</div>`).join("");
  }
  function stuck() {
    if (g.includes(0)) return false;
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const v = g[r * 4 + c]; if ((c < 3 && v === g[r * 4 + c + 1]) || (r < 3 && v === g[(r + 1) * 4 + c])) return false; }
    return true;
  }
  function move(d) { // 0 left, 1 right, 2 up, 3 down
    const ng = g.slice(); let moved = false, gain = 0;
    for (let r = 0; r < 4; r++) {
      const idx = [0, 1, 2, 3].map(c => d < 2 ? r * 4 + c : c * 4 + r); if (d % 2) idx.reverse();
      const [v, gn] = slide(idx.map(i => g[i])); gain += gn;
      idx.forEach((i, k) => { if (ng[i] !== v[k]) moved = true; ng[i] = v[k]; });
    }
    if (!moved) return;
    g = ng; add(); score += gain; draw(); api.score(score); api.beep(gain ? 660 : 400, 0.05);
    if (stuck()) { api.beep(130, 0.4, "sawtooth"); api.over(score); }
  }
  function start() { g = Array(16).fill(0); score = 0; add(); add(); draw(); }
  const map = { ArrowLeft: 0, ArrowRight: 1, ArrowUp: 2, ArrowDown: 3, a: 0, d: 1, w: 2, s: 3, A: 0, D: 1, W: 2, S: 3 };
  const onKey = e => { if (e.key in map) { e.preventDefault(); move(map[e.key]); } };
  document.addEventListener("keydown", onKey);
  let t0; box.addEventListener("touchstart", e => { t0 = e.touches[0]; }, { passive: true });
  box.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
  box.addEventListener("touchend", e => {
    if (!t0) return; const t = e.changedTouches[0], dx = t.clientX - t0.clientX, dy = t.clientY - t0.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 24) move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : 0) : (dy > 0 ? 3 : 2));
  });
  start();
  return { restart: start, destroy() { document.removeEventListener("keydown", onKey); } };
};
