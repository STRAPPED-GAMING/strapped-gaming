/* Tic Tac Toe – you (X) vs the computer (O). Score = win streak. */
GAMES.tictactoe = function (root, api) {
  const L = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  root.innerHTML = `<div class="ttt"><p id="tmsg" class="tmsg" aria-live="polite"></p><div class="tboard">${[...Array(9)].map((_, i) => `<button data-i="${i}" aria-label="Square ${i + 1}"></button>`).join("")}</div></div>`;
  const cells = [...root.querySelectorAll(".tboard button")], msg = root.querySelector("#tmsg");
  let b, score = 0, busy = false, timers = [];
  const later = (f, ms) => timers.push(setTimeout(f, ms));
  const winner = () => { for (const l of L) if (b[l[0]] && b[l[0]] === b[l[1]] && b[l[0]] === b[l[2]]) return b[l[0]]; return b.every(Boolean) ? "D" : null; };
  function paint() { cells.forEach((c, i) => { c.textContent = b[i] || ""; c.className = b[i] ? "p" + b[i] : ""; c.disabled = !!b[i]; }); }
  function round() { b = Array(9).fill(""); busy = false; msg.textContent = "Your turn (X)"; paint(); }
  function pick() {
    const find = p => { for (const l of L) { const v = l.map(i => b[i]); if (v.filter(s => s === p).length === 2 && v.includes("")) return l[v.indexOf("")]; } return -1; };
    let m = find("O"); if (m < 0) m = find("X");
    if (m < 0 && !b[4]) m = 4;
    if (m < 0) { const c = [0, 2, 6, 8].filter(i => !b[i]); if (c.length) m = c[Math.random() * c.length | 0]; }
    if (m < 0) { const e = b.map((v, i) => v ? -1 : i).filter(i => i >= 0); m = e[Math.random() * e.length | 0]; }
    return m;
  }
  function end(w) {
    busy = true;
    if (w === "X") { score++; api.score(score); api.beep(880, 0.2); msg.textContent = "You win! Next round…"; later(round, 1100); }
    else if (w === "D") { api.beep(300, 0.2); msg.textContent = "Draw. Next round…"; later(round, 1100); }
    else { api.beep(120, 0.4, "sawtooth"); msg.textContent = "Computer wins."; later(() => api.over(score), 700); }
  }
  cells.forEach(c => c.addEventListener("click", () => {
    const i = +c.dataset.i; if (busy || b[i]) return;
    b[i] = "X"; api.beep(520, 0.06); paint(); let w = winner(); if (w) return end(w);
    busy = true; msg.textContent = "Computer thinking…";
    later(() => { b[pick()] = "O"; api.beep(380, 0.06); paint(); w = winner(); if (w) return end(w); busy = false; msg.textContent = "Your turn (X)"; }, 450);
  }));
  function restart() { timers.forEach(clearTimeout); timers = []; score = 0; round(); }
  restart();
  return { restart, destroy() { timers.forEach(clearTimeout); } };
};
