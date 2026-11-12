/* Sky Hopper – tap-to-fly arcade game */
GAMES.flappy = function (root, api) {
  const W = 320, H = 480;
  root.innerHTML = `<canvas width="${W}" height="${H}" aria-label="Sky Hopper game. Tap to fly."></canvas>`;
  const cv = root.querySelector("canvas"), x = cv.getContext("2d");
  let y, vy, pipes, score, state, last, raf, dist;
  function reset() { y = H / 2; vy = 0; pipes = []; score = 0; dist = 0; state = "ready"; last = 0; }
  function flap() {
    if (state === "dead") return;
    if (state === "ready") state = "play";
    vy = -6.4; api.beep(600, 0.06, "triangle");
  }
  function die() { state = "dead"; api.beep(120, 0.4, "sawtooth"); api.over(score); }
  function step(dt) {
    vy += 0.38 * dt; y += vy * dt; dist += 2.4 * dt;
    if (dist >= 95) { dist = 0; pipes.push({ x: W, gap: 70 + Math.random() * (H - 260), done: false }); }
    pipes.forEach(p => p.x -= 2.4 * dt);
    pipes = pipes.filter(p => p.x > -60);
    for (const p of pipes) {
      if (!p.done && p.x + 50 < 80) { p.done = true; score++; api.score(score); api.beep(900, 0.07); }
      if (80 + 12 > p.x && 80 - 12 < p.x + 50 && (y - 12 < p.gap || y + 12 > p.gap + 130)) return die();
    }
    if (y < 12 || y > H - 12) die();
  }
  function draw() {
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0b0720"); g.addColorStop(1, "#2a1060");
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    pipes.forEach(p => {
      x.fillStyle = "#22e5ff"; x.shadowColor = "#22e5ff"; x.shadowBlur = 10;
      x.fillRect(p.x, 0, 50, p.gap); x.fillRect(p.x, p.gap + 130, 50, H);
    });
    x.shadowBlur = 14; x.shadowColor = "#b44dff"; x.fillStyle = "#e0b3ff";
    x.save(); x.translate(80, y); x.rotate(Math.max(-0.5, Math.min(1, vy / 10)));
    x.beginPath(); x.moveTo(16, 0); x.lineTo(-12, -11); x.lineTo(-6, 0); x.lineTo(-12, 11); x.closePath(); x.fill(); x.restore();
    x.shadowBlur = 0; x.fillStyle = "#fff"; x.font = "bold 36px system-ui,sans-serif"; x.textAlign = "center"; x.fillText(score, W / 2, 56);
    if (state === "ready") { x.font = "bold 18px system-ui,sans-serif"; x.fillText("Tap or press Space to fly", W / 2, H / 2 + 70); }
  }
  function loop(t) {
    const dt = last ? Math.min(3, (t - last) / 16.67) : 1; last = t;
    if (state === "play") step(dt); else if (state === "ready") y = H / 2 + Math.sin(t / 200) * 8;
    draw(); raf = requestAnimationFrame(loop);
  }
  const onKey = e => { if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w") { e.preventDefault(); flap(); } };
  document.addEventListener("keydown", onKey);
  cv.addEventListener("pointerdown", e => { e.preventDefault(); flap(); });
  reset(); raf = requestAnimationFrame(loop);
  return { restart: reset, destroy() { cancelAnimationFrame(raf); document.removeEventListener("keydown", onKey); } };
};
