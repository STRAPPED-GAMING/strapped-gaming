/* Neon Snake */
GAMES.snake = function (root, api) {
  const N = 18, S = 20;
  root.innerHTML = `<canvas width="${N * S}" height="${N * S}" aria-label="Snake board"></canvas>
    <div class="dpad"><button data-d="u" aria-label="Up">▲</button><button data-d="l" aria-label="Left">◀</button><button data-d="d" aria-label="Down">▼</button><button data-d="r" aria-label="Right">▶</button></div>`;
  const cv = root.querySelector("canvas"), x = cv.getContext("2d");
  let sn, dir, next, food, score, timer, alive;
  const V = { u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0] };
  function place() { do { food = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; } while (sn.some(p => p.x === food.x && p.y === food.y)); }
  function start() {
    sn = [{ x: 8, y: 9 }, { x: 7, y: 9 }, { x: 6, y: 9 }]; dir = next = { x: 1, y: 0 }; score = 0; alive = true;
    place(); clearInterval(timer); timer = setInterval(tick, 125); draw();
  }
  function turn(k) { const v = V[k]; if (!v || !alive) return; if (v[0] === -dir.x && v[1] === -dir.y) return; next = { x: v[0], y: v[1] }; }
  function tick() {
    dir = next; const h = { x: sn[0].x + dir.x, y: sn[0].y + dir.y };
    if (h.x < 0 || h.y < 0 || h.x >= N || h.y >= N || sn.some(p => p.x === h.x && p.y === h.y)) {
      alive = false; clearInterval(timer); api.beep(130, 0.35, "sawtooth"); api.over(score); return;
    }
    sn.unshift(h);
    if (h.x === food.x && h.y === food.y) {
      score += 10; api.score(score); api.beep(700, 0.08); place();
      if (score % 50 === 0) { clearInterval(timer); timer = setInterval(tick, Math.max(65, 125 - score / 10 * 2)); }
    } else sn.pop();
    draw();
  }
  function draw() {
    x.fillStyle = "#0b0720"; x.fillRect(0, 0, cv.width, cv.height);
    x.strokeStyle = "rgba(124,58,237,.12)";
    for (let i = 0; i <= N; i++) { x.beginPath(); x.moveTo(i * S, 0); x.lineTo(i * S, N * S); x.moveTo(0, i * S); x.lineTo(N * S, i * S); x.stroke(); }
    x.shadowBlur = 14; x.shadowColor = "#22e5ff"; x.fillStyle = "#22e5ff";
    x.beginPath(); x.arc(food.x * S + S / 2, food.y * S + S / 2, S / 3, 0, 7); x.fill();
    sn.forEach((p, i) => { x.shadowColor = x.fillStyle = i ? "#9d4dff" : "#e0b3ff"; x.fillRect(p.x * S + 1, p.y * S + 1, S - 2, S - 2); });
    x.shadowBlur = 0;
  }
  const keys = { ArrowUp: "u", ArrowDown: "d", ArrowLeft: "l", ArrowRight: "r", w: "u", s: "d", a: "l", d: "r", W: "u", S: "d", A: "l", D: "r" };
  const onKey = e => { if (keys[e.key]) { e.preventDefault(); turn(keys[e.key]); } };
  document.addEventListener("keydown", onKey);
  root.querySelectorAll(".dpad button").forEach(b => b.addEventListener("pointerdown", e => { e.preventDefault(); turn(b.dataset.d); }));
  let t0; cv.addEventListener("touchstart", e => { t0 = e.touches[0]; }, { passive: true });
  cv.addEventListener("touchmove", e => e.preventDefault(), { passive: false });
  cv.addEventListener("touchend", e => {
    if (!t0) return; const t = e.changedTouches[0], dx = t.clientX - t0.clientX, dy = t.clientY - t0.clientY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "r" : "l") : (dy > 0 ? "d" : "u"));
  });
  start();
  return { restart: start, destroy() { clearInterval(timer); document.removeEventListener("keydown", onKey); } };
};
