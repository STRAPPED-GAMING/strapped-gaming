# STRAPPED GAMING

A free arcade website and offline-capable app (PWA). No build tools, no frameworks, no external files.

## Folder structure
```
strapped-gaming/
├── index.html            page shell (header, footer, script tags)
├── style.css             all styling and colors
├── app.js                routing, cards, search, favorites, high scores, sound, PWA
├── manifest.json         install-to-home-screen info
├── service-worker.js     offline cache
├── icons/                icon-192.png, icon-512.png, icon.svg
├── games/
│   ├── catalog.js        THE LIST OF ALL GAMES (edit this to add games)
│   ├── snake.js  tictactoe.js  memory.js  game2048.js  flappy.js
└── my-games/
    └── click-rush/index.html   sample of your own game
```

## Run it on your computer
Service workers need `http://localhost` (not a double-clicked file). Install Python, open a terminal in this folder and run `python -m http.server 8000`, then open http://localhost:8000.

## Add your own game (3 steps)
1. Make a folder: `my-games/my-cool-game/` with an `index.html` (CSS and JS can be inside it or in files next to it).
2. Register it in `games/catalog.js` by copying the click-rush entry:
   `{ id:"my-cool-game", title:"My Cool Game", category:"My Games", icon:"🎮", colors:["#7c3aed","#22e5ff"], mine:true, isNew:true, type:"iframe", url:"my-games/my-cool-game/index.html", desc:"One sentence.", how:["Instruction 1","Instruction 2"] }`
3. Add every file of your game to the `PRECACHE` list in `service-worker.js`, and change `CACHE_VERSION` ("v1" → "v2") so phones download the update.

Optional: to save high scores, your game can call `parent.postMessage({sg:"score", score:123, over:false}, "*")` while playing and `over:true` at the end (see click-rush).
Your game must not load files from other websites if you want it to work offline.

## Offline mode
The first visit needs internet. When you see “Ready for offline play”, every built-in game is cached and works with no connection. The header badge shows Online/Offline.
