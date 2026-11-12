/* Memory Match – 8 pairs. Score = 1000 minus 30 per move (minimum 100). */
GAMES.memory = function (root, api) {
  const E = ["🐙", "🦄", "🍕", "🎸", "🚀", "💎", "🔥", "🎲"];
  root.innerHTML = `<div class="mem"><p class="tmsg">Moves: <b id="mv">0</b></p><div class="mboard"></div></div>`;
  const board = root.querySelector(".mboard"), mv = root.querySelector("#mv");
  let open, moves, matched, lock, timers = [];
  function start() {
    timers.forEach(clearTimeout); timers = [];
    const d = E.concat(E).sort(() => Math.random() - 0.5);
    open = []; moves = 0; matched = 0; lock = false; mv.textContent = 0;
    board.innerHTML = d.map((e, i) => `<button class="mcard" data-e="${e}" aria-label="Card ${i + 1}"><span class="front">${e}</span><span class="back">?</span></button>`).join("");
    board.querySelectorAll(".mcard").forEach(c => c.addEventListener("click", () => flip(c)));
  }
  function flip(c) {
    if (lock || c.classList.contains("up") || c.classList.contains("done")) return;
    c.classList.add("up"); api.beep(500, 0.05); open.push(c);
    if (open.length < 2) return;
    moves++; mv.textContent = moves; lock = true;
    const [a, b] = open; open = [];
    if (a.dataset.e === b.dataset.e) {
      timers.push(setTimeout(() => {
        a.classList.add("done"); b.classList.add("done"); api.beep(880, 0.12); lock = false; matched++;
        if (matched === E.length) { const s = Math.max(100, 1000 - moves * 30); api.score(s); api.over(s); }
      }, 350));
    } else timers.push(setTimeout(() => { a.classList.remove("up"); b.classList.remove("up"); lock = false; }, 800));
  }
  start();
  return { restart: start, destroy() { timers.forEach(clearTimeout); } };
};
