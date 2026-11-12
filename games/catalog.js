/* ===== GAME CATALOG =====
   Every game card on the site comes from this list.
   To add your own game, copy the "click-rush" entry at the bottom (see README.md). */
window.GAMES = window.GAMES || {};
window.CATALOG = [
  { id:"snake", title:"Neon Snake", category:"Arcade", icon:"🐍", colors:["#7c3aed","#22e5ff"],
    desc:"Eat the glowing orbs, grow longer, don't crash.", featured:true, popular:true, isNew:false,
    how:["Arrow keys or W A S D to steer.","On phones: swipe on the board or use the arrow buttons.","Each orb is +10. Hitting a wall or yourself ends the run."] },
  { id:"2048", title:"2048 Neon", category:"Puzzle", icon:"🔢", colors:["#b44dff","#3b82f6"],
    desc:"Slide and merge tiles to reach 2048.", featured:true, popular:true, isNew:false,
    how:["Arrow keys or W A S D slide all tiles.","On phones: swipe on the board.","Equal tiles merge into one. Score adds the merged value."] },
  { id:"flappy", title:"Sky Hopper", category:"Arcade", icon:"🚀", colors:["#22e5ff","#7c3aed"],
    desc:"Tap to fly through the gaps. How far can you go?", featured:true, popular:true, isNew:true,
    how:["Tap, click or press Space / Up arrow to flap.","Fly through the gaps in the pillars: +1 each.","Touching a pillar, the floor or the ceiling ends the run."] },
  { id:"memory", title:"Memory Match", category:"Puzzle", icon:"🃏", colors:["#ec4899","#7c3aed"],
    desc:"Flip cards and find all 8 pairs in the fewest moves.", featured:false, popular:true, isNew:false,
    how:["Click or tap a card to flip it.","Find two matching cards to clear them.","Fewer moves = higher score (max 1000)."] },
  { id:"tictactoe", title:"Tic Tac Toe", category:"Classic", icon:"❌", colors:["#3b82f6","#22e5ff"],
    desc:"Beat the computer. Your score is your win streak.", featured:false, popular:false, isNew:true,
    how:["You are X. Click or tap a square.","Get three in a row to win a round (+1 score).","A draw starts a new round. One loss ends your streak."] },

  /* ---- MY GAMES (your own folders in /my-games) ---- */
  { id:"click-rush", title:"Click Rush", category:"My Games", icon:"⚡", colors:["#f59e0b","#ec4899"], mine:true,
    desc:"Sample game from the my-games folder: tap the target for 15 seconds.", isNew:true,
    type:"iframe", url:"my-games/click-rush/index.html",
    how:["Tap or click the glowing target as many times as you can in 15 seconds.","This game lives in my-games/click-rush and is a template for your own."] }
];
