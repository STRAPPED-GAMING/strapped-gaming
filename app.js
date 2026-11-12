/* STRAPPED GAMING – main app: routing, cards, storage, sound, PWA */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const app = $("#app");
  const C = window.CATALOG, G = window.GAMES;

  /* ---------- saved data (localStorage, safe if blocked) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("sg_" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("sg_" + k, JSON.stringify(v)); } catch (e) {} }
  };
  let favs = store.get("favs", []), scores = store.get("scores", {}), soundOn = store.get("sound", true);
  let query = "", cat = "All", inst = null, msgHandler = null;

  /* ---------- helpers ---------- */
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let toastT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 3200); }
  let ac;
  function beep(f, d, type) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "square"; o.frequency.value = f || 440; g.gain.value = 0.04;
      g.gain.exponentialRampToValueAtTime(0.0008, ac.currentTime + (d || 0.1));
      o.connect(g); g.connect(ac.destination); o.start(); o.stop(ac.currentTime + (d || 0.1));
    } catch (e) {}
  }
  const isFav = id => favs.includes(id);
  function toggleFav(id) {
    favs = isFav(id) ? favs.filter(x => x !== id) : favs.concat(id);
    store.set("favs", favs);
    toast(isFav(id) ? "Added to favorites" : "Removed from favorites");
  }

  /* ---------- home page ---------- */
  function card(g) {
    const best = scores[g.id], f = isFav(g.id);
    return `<article class="card" style="--a:${g.colors[0]};--b:${g.colors[1]}">
      <a class="card-art" href="#/game/${esc(g.id)}" aria-label="Play ${esc(g.title)}"><span>${g.icon}</span></a>
      <button class="fav${f ? " on" : ""}" data-fav="${esc(g.id)}" aria-pressed="${f}" aria-label="${f ? "Remove" : "Add"} ${esc(g.title)} ${f ? "from" : "to"} favorites">♥</button>
      <div class="card-body"><h3>${esc(g.title)}</h3>
        <div class="meta"><span class="tag">${esc(g.category)}</span>${best != null ? `<span class="best">Best ${best}</span>` : ""}</div>
        <p>${esc(g.desc)}</p>
        <a class="btn small" href="#/game/${esc(g.id)}">Play</a></div></article>`;
  }
  const section = (id, title, list) => list.length ? `<section class="sec" id="${id}"><h2>${title}</h2><div class="grid">${list.map(card).join("")}</div></section>` : "";

  function matches(g) {
    const q = query.trim().toLowerCase();
    const okQ = !q || (g.title + " " + g.category + " " + g.desc).toLowerCase().includes(q);
    const okC = cat === "All" || (cat === "Favorites" ? isFav(g.id) : g.category === cat);
    return okQ && okC;
  }

  function home() {
    const cats = ["All"].concat([...new Set(C.map(g => g.category))]);
    if (favs.length) cats.push("Favorites");
    if (!cats.includes(cat)) cat = "All";
    const filtering = query.trim() || cat !== "All";
    let body;
    if (filtering) {
      const r = C.filter(matches);
      body = r.length ? section("results", `${r.length} game${r.length > 1 ? "s" : ""} found`, r)
        : `<section class="sec"><h2>No games found</h2><p class="muted">Nothing matches “${esc(query)}”. Try another word or choose All.</p></section>`;
    } else {
      body = section("featured", "Featured Games", C.filter(g => g.featured)) +
        section("popular", "Popular Games", C.filter(g => g.popular)) +
        section("new", "New Games", C.filter(g => g.isNew)) +
        section("mine", "My Games", C.filter(g => g.mine)) +
        section("favs", "Your Favorites", C.filter(g => isFav(g.id)));
    }
    app.innerHTML = `<section class="hero">
        <div class="hero-copy">
          <h1>Play fast.<br>Stay <em>strapped.</em></h1>
          <p>${C.length} free original games. No ads, no sign-up. Install it once and play offline.</p>
          <div class="hero-cta"><a class="btn" href="#featured" data-scroll="featured">Play Games</a><a class="btn ghost" href="#mine" data-scroll="mine">My Games</a></div>
        </div>
        <div class="hero-art" aria-hidden="true"><svg class="hero-logo"><use href="#logo"/></svg><i style="--i:0">🐍</i><i style="--i:1">🔢</i><i style="--i:2">🚀</i><i style="--i:3">🃏</i></div>
      </section>
      <nav class="chips" aria-label="Categories">${cats.map(c => `<button class="chip${c === cat ? " on" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("")}</nav>
      ${body}`;
  }

  /* ---------- game page ---------- */
  function stopGame() {
    if (inst && inst.destroy) { try { inst.destroy(); } catch (e) {} }
    inst = null;
    if (msgHandler) { removeEventListener("message", msgHandler); msgHandler = null; }
  }

  function gamePage(id) {
    const g = C.find(x => x.id === id);
    if (!g) { location.hash = "#/"; return; }
    const f = isFav(id);
    document.title = g.title + " – STRAPPED GAMING";
    app.innerHTML = `<section class="gpage" style="--a:${g.colors[0]};--b:${g.colors[1]}">
      <div class="gbar"><a class="btn ghost small" href="#/">‹ All games</a><h1>${esc(g.title)}</h1>
        <button class="fav big${f ? " on" : ""}" data-fav="${esc(id)}" aria-pressed="${f}" aria-label="Toggle favorite">♥</button></div>
      <div class="gwrap">
        <div class="stage"><div id="inner" class="inner"></div>
          <div id="over" class="over" hidden><h2>Game over</h2><p id="over-msg"></p><button class="btn" id="again">Play again</button></div></div>
        <aside class="side">
          <div class="stats"><div><span>Score</span><b id="sc">0</b></div><div><span>Best</span><b id="bs">${scores[id] || 0}</b></div></div>
          <button class="btn" id="restart">Restart</button>
          <div class="how"><h2>How to play</h2><ul>${g.how.map(h => `<li>${esc(h)}</li>`).join("")}</ul></div>
        </aside></div></section>`;
    const inner = $("#inner"), over = $("#over"), sc = $("#sc"), bs = $("#bs");
    const record = n => { if (n > (scores[id] || 0)) { scores[id] = n; store.set("scores", scores); } bs.textContent = scores[id] || 0; };
    const api = {
      beep,
      score(n) { sc.textContent = n; record(n); },
      over(n) { sc.textContent = n; record(n); $("#over-msg").textContent = `You scored ${n}. Best: ${scores[id] || 0}.`; over.hidden = false; $("#again").focus(); }
    };
    function start() {
      over.hidden = true; sc.textContent = "0";
      if (g.type === "iframe") {
        inner.innerHTML = `<iframe title="${esc(g.title)}" src="${esc(g.url)}" sandbox="allow-scripts allow-same-origin"></iframe>`;
        const fr = $("iframe", inner);
        if (msgHandler) removeEventListener("message", msgHandler);
        msgHandler = e => { // custom games can report scores: parent.postMessage({sg:"score",score:12,over:true},"*")
          if (e.source !== fr.contentWindow || !e.data || e.data.sg !== "score") return;
          const n = Math.max(0, Number(e.data.score) || 0);
          e.data.over ? api.over(n) : api.score(n);
        };
        addEventListener("message", msgHandler);
      } else if (G[id]) {
        inner.innerHTML = ""; inst = G[id](inner, api);
      } else inner.innerHTML = `<p class="muted pad">This game's script is missing. Check games/catalog.js.</p>`;
    }
    const restart = () => { if (g.type === "iframe") start(); else { over.hidden = true; sc.textContent = "0"; inst && inst.restart(); } };
    $("#restart").onclick = restart; $("#again").onclick = restart;
    start();
  }

  /* ---------- router + events ---------- */
  function route() {
    stopGame(); document.title = "STRAPPED GAMING – Free Arcade Games, Playable Offline";
    const m = location.hash.match(/^#\/game\/(.+)$/);
    m ? gamePage(decodeURIComponent(m[1])) : home();
    if (m || !location.hash.startsWith("#/") ) scrollTo(0, 0);
  }
  addEventListener("hashchange", route);

  app.addEventListener("click", e => {
    const fv = e.target.closest("[data-fav]"), ct = e.target.closest("[data-cat]"), sc = e.target.closest("[data-scroll]");
    if (fv) { toggleFav(fv.dataset.fav); location.hash.startsWith("#/game") ? (fv.classList.toggle("on", isFav(fv.dataset.fav)), fv.setAttribute("aria-pressed", isFav(fv.dataset.fav))) : home(); }
    else if (ct) { cat = ct.dataset.cat; home(); }
    else if (sc) { e.preventDefault(); const t = document.getElementById(sc.dataset.scroll); t && t.scrollIntoView({ behavior: "smooth" }); }
  });
  $("#search").addEventListener("input", e => {
    query = e.target.value;
    if (location.hash.startsWith("#/game")) location.hash = "#/"; else home();
  });

  /* ---------- sound toggle ---------- */
  const sb = $("#sound");
  const paintSound = () => { sb.textContent = soundOn ? "🔊" : "🔇"; sb.setAttribute("aria-pressed", soundOn); };
  sb.onclick = () => { soundOn = !soundOn; store.set("sound", soundOn); paintSound(); beep(660, 0.08); };
  paintSound();

  /* ---------- online / offline badge ---------- */
  const net = $("#net");
  function paintNet() { net.textContent = navigator.onLine ? "Online" : "Offline"; net.className = "pill " + (navigator.onLine ? "online" : "offline"); }
  addEventListener("online", () => { paintNet(); toast("Back online"); });
  addEventListener("offline", () => { paintNet(); toast("You're offline. Built-in games still work."); });
  paintNet();

  /* ---------- install button (PWA) ---------- */
  const ib = $("#install"); let deferred = null;
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferred = e; if (!standalone) ib.hidden = false; });
  addEventListener("appinstalled", () => { ib.hidden = true; toast("STRAPPED GAMING installed"); });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone) ib.hidden = false;
  ib.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null; ib.hidden = true; }
    else toast("On iPhone/iPad: tap Share, then “Add to Home Screen”.");
  };

  /* ---------- service worker ---------- */
  if ("serviceWorker" in navigator) {
    addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then(() => navigator.serviceWorker.ready).then(() => {
        if (!store.get("offlineReady", false)) { store.set("offlineReady", true); toast("Ready for offline play ✓"); }
      }).catch(() => {});
    });
  }

  $("#year").textContent = new Date().getFullYear();
  route();
})();
