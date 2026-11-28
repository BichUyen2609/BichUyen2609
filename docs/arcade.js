import { StarCatch, RooftopHop, WIDTH } from "./games.js";

const copy = {
  vi: {
    hero: "Góc game nhỏ cho những đêm chưa muốn ngủ.",
    profile: "Về profile", language: "Switch to English", choose: "Chọn trò chơi",
    meters: "Điểm và kỷ lục", field: "Sân chơi", board: "Bàn lật thẻ",
    play: "Bắt đầu", again: "Chơi lại", pause: "Tạm dừng", resume: "Chơi tiếp",
    paused: "Đang tạm dừng", pausedHint: "Bạn có thể chơi tiếp khi sẵn sàng.",
    score: "Điểm", time: "Còn lại", best: "Kỷ lục", lives: "Mạng", moves: "Lượt", matches: "Đã ghép",
    left: "Di chuyển trái", right: "Di chuyển phải", jump: "Nhảy",
    newBest: "Kỷ lục mới!",
    card: (index) => `Thẻ ${index}`,
    won: (moves) => `Bạn ghép đủ 6 cặp trong ${moves} lượt.`,
    result: (points) => `Bạn đạt ${points} điểm.`,
    names: ["Ngôi sao", "Trăng non", "Pha lê", "Hành tinh", "Sao chổi", "Vòng sáng"],
    games: {
      stars: {
        title: "Hứng sao",
        hint: "Hứng sao vàng. Né thiên thạch tím.",
        rules: "Đón sao vàng và né thiên thạch trong 30 giây.",
        controls: "← → hoặc kéo trên sân",
        finish: "Hết giờ!",
        lost: "Bạn đã hết mạng!",
      },
      memory: {
        title: "Lật thẻ mặt trăng",
        hint: "Tìm sáu cặp biểu tượng giống nhau.",
        rules: "Lật hai thẻ mỗi lượt. Thử ghép hết các cặp trong ít lượt nhất.",
        controls: "Chạm thẻ hoặc dùng Tab và Enter",
        finish: "Ghép xong!",
      },
      rooftop: {
        title: "Nhảy mái nhà",
        hint: "Giúp mèo vượt qua các ống thông gió.",
        rules: "Canh đúng lúc để mèo nhảy qua chướng ngại. Càng chạy lâu, mèo càng nhanh.",
        controls: "Space, ↑ hoặc nút Nhảy",
        finish: "Mèo dừng chân!",
      },
    },
  },
  en: {
    hero: "A little arcade for nights that aren't quite over.",
    profile: "Back to profile", language: "Chuyển sang tiếng Việt", choose: "Choose a game",
    meters: "Scores and records", field: "Playfield", board: "Memory card grid",
    play: "Start", again: "Play again", pause: "Pause", resume: "Resume",
    paused: "Paused", pausedHint: "Pick up where you left off whenever you're ready.",
    score: "Score", time: "Time left", best: "Best", lives: "Lives", moves: "Moves", matches: "Pairs",
    left: "Move left", right: "Move right", jump: "Jump",
    newBest: "New record!",
    card: (index) => `Card ${index}`,
    won: (moves) => `You found all 6 pairs in ${moves} moves.`,
    result: (points) => `You scored ${points} points.`,
    names: ["Star", "Crescent", "Crystal", "Planet", "Comet", "Halo"],
    games: {
      stars: {
        title: "Star Catch",
        hint: "Catch gold stars. Dodge purple meteors.",
        rules: "Catch the gold stars and dodge meteors for 30 seconds.",
        controls: "← → or drag across the field",
        finish: "Time's up!",
        lost: "Out of lives!",
      },
      memory: {
        title: "Moon Match",
        hint: "Find six matching pairs.",
        rules: "Flip two cards per turn. Find every pair in as few moves as you can.",
        controls: "Tap a card or use Tab and Enter",
        finish: "All pairs found!",
      },
      rooftop: {
        title: "Rooftop Hop",
        hint: "Help the cat jump over the rooftop vents.",
        rules: "Time each jump to clear the vents. Stay on the roof as the pace picks up.",
        controls: "Space, ↑ or the Jump button",
        finish: "End of the run!",
      },
    },
  },
};

const games = {
  stars: { accent: "#a7e7ff", mark: "✦", meters: ["score", "time", "lives", "best"], create: () => new StarCatch() },
  memory: { accent: "#cdc0ff", mark: "☾", meters: ["moves", "matches", "best"] },
  rooftop: { accent: "#ffcae7", mark: "▟", meters: ["score", "best"], create: () => new RooftopHop() },
};
const faces = [
  ["✦", "#ffde9b"], ["☾", "#bbcaff"], ["◆", "#f9b5f2"],
  ["♄", "#a5e9ed"], ["⟡", "#c4aafa"], ["◎", "#a8efd1"],
];

const get = (id) => document.getElementById(id);
const field = get("field");
const context = field.getContext("2d");
const grid = get("memory-grid");
const deck = get("game-deck");
const consolePanel = get("console");
const overlay = get("overlay");
const playButton = get("play");
const pauseButton = get("pause");
const resetButton = get("restart");
const tiles = Array.from(deck.querySelectorAll("[data-game]"));
const held = new Set();
const labels = new Map();

function readSaved(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function save(key, value) {
  try { localStorage.setItem(key, value); } catch { /* Play continues if storage is unavailable. */ }
}

const recordKey = (game) => `midnight-arcade.best.${game}`;
const records = Object.fromEntries(Object.keys(games).map((game) => {
  const value = readSaved(recordKey(game));
  const record = value !== null ? Number(value) : null;
  return [game, Number.isSafeInteger(record) && record >= 0 ? record : null];
}));
let language = readSaved("midnight-arcade.language") === "en" ? "en" : "vi";
let selected;
let phase;
let action;
let memory;
let flipTimer;
let frame;
let lastTime;
let isNewRecord;

function words() { return copy[language]; }

function meterValue(key) {
  switch (key) {
    case "time": return `${Math.ceil(action.remaining)}s`;
    case "matches": return `${memory.matches} / 6`;
    case "moves": return memory.moves;
    case "best": return records[selected] ?? "—";
    default: return action[key];
  }
}

function updateMeters() {
  for (const [key, value] of labels) {
    const next = String(meterValue(key));
    if (value.textContent !== next) value.textContent = next;
  }
}

function renderMeters() {
  const meters = get("meters");
  const text = words();
  labels.clear();
  meters.replaceChildren();
  meters.setAttribute("aria-label", text.meters);
  for (const key of games[selected].meters) {
    const card = document.createElement("div");
    const label = document.createElement("span");
    const value = document.createElement("strong");
    card.className = "meter";
    label.textContent = text[key];
    card.append(label, value);
    meters.append(card);
    labels.set(key, value);
  }
  updateMeters();
}

function renderCards() {
  if (!memory) return;
  const text = words();
  for (const [index, card] of memory.cards.entries()) {
    const button = grid.children[index];
    const [symbol, color] = faces[card.face];
    button.classList.toggle("revealed", card.revealed);
    button.classList.toggle("matched", card.matched);
    button.style.setProperty("--face", color);
    button.textContent = card.revealed ? symbol : "✧";
    button.disabled = phase !== "running" || card.matched;
    button.setAttribute("aria-label", card.revealed ? text.names[card.face] : text.card(index + 1));
  }
}

function renderOverlay() {
  const text = words();
  const game = text.games[selected];
  overlay.hidden = phase === "running";
  pauseButton.disabled = phase === "ready" || phase === "finished";
  pauseButton.textContent = phase === "paused" ? text.resume : text.pause;
  resetButton.disabled = phase === "ready";
  resetButton.textContent = text.again;
  get("left").disabled = get("right").disabled = get("jump").disabled = phase !== "running";
  if (phase === "running") return;
  get("overlay-mark").textContent = games[selected].mark;
  if (phase === "finished") {
    const title = selected === "stars" && action.lives === 0 ? game.lost : game.finish;
    const result = selected === "memory" ? text.won(memory.moves) : text.result(action.score);
    get("overlay-title").textContent = title;
    get("overlay-description").textContent = isNewRecord ? `${result} ${text.newBest}` : result;
    playButton.textContent = text.again;
  } else if (phase === "paused") {
    get("overlay-title").textContent = text.paused;
    get("overlay-description").textContent = text.pausedHint;
    playButton.textContent = text.resume;
  } else {
    get("overlay-title").textContent = game.title;
    get("overlay-description").textContent = game.rules;
    playButton.textContent = text.play;
  }
}

function renderLanguage() {
  const text = words();
  const game = text.games[selected];
  document.documentElement.lang = language;
  get("hero-copy").textContent = text.hero;
  get("profile-link").textContent = text.profile;
  get("language").textContent = language === "vi" ? "EN" : "VI";
  get("language").setAttribute("aria-label", text.language);
  deck.setAttribute("aria-label", text.choose);
  for (const tile of tiles) {
    const { game: name } = tile.dataset;
    tile.querySelector("strong").textContent = gameTitle(name, language);
    tile.querySelector("small").textContent = gameTitle(name, language === "vi" ? "en" : "vi");
  }
  get("game-title").textContent = game.title;
  get("game-hint").textContent = game.hint;
  get("controls-hint").textContent = game.controls;
  get("left").setAttribute("aria-label", text.left);
  get("right").setAttribute("aria-label", text.right);
  get("jump").textContent = text.jump;
  field.setAttribute("aria-label", text.field);
  grid.setAttribute("aria-label", text.board);
  renderMeters();
  renderCards();
  renderOverlay();
}

function gameTitle(name, lang) { return copy[lang].games[name].title; }

function shuffledCards() {
  const cards = faces.flatMap((_, face) => [
    { face, revealed: false, matched: false },
    { face, revealed: false, matched: false },
  ]);
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const swap = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[swap]] = [cards[swap], cards[i]];
  }
  return cards;
}

function stop() {
  cancelAnimationFrame(frame);
  frame = null;
  lastTime = null;
  held.clear();
}

function select(name) {
  stop();
  clearTimeout(flipTimer);
  selected = name;
  phase = "ready";
  isNewRecord = false;
  const isMemory = name === "memory";
  const settings = games[name];
  action = settings.create?.();
  memory = isMemory ? { moves: 0, matches: 0, first: null, locked: false, cards: shuffledCards() } : null;
  grid.replaceChildren();
  if (memory) {
    for (const index of memory.cards.keys()) {
      const card = document.createElement("button");
      card.className = "memory-card";
      card.type = "button";
      card.addEventListener("click", () => flip(index));
      grid.append(card);
    }
  }
  grid.hidden = !isMemory;
  field.hidden = isMemory;
  field.tabIndex = isMemory ? -1 : 0;
  get("touch-pad").hidden = isMemory;
  get("left").hidden = get("right").hidden = name !== "stars";
  get("jump").hidden = name !== "rooftop";
  pauseButton.hidden = isMemory;
  consolePanel.style.setProperty("--game-accent", settings.accent);
  for (const tile of tiles) tile.setAttribute("aria-pressed", String(tile.dataset.game === name));
  const url = new URL(location.href);
  if (url.searchParams.get("game") !== name && location.protocol !== "file:") {
    url.searchParams.set("game", name);
    history.replaceState(null, "", url);
  }
  get("announcement").textContent = "";
  renderLanguage();
  if (action) action.draw(context);
}

function tick(now) {
  if (phase !== "running") return;
  let elapsed = lastTime === null ? 0 : Math.min(.25, (now - lastTime) / 1000);
  lastTime = now;
  const movement = Number(held.has("right")) - Number(held.has("left"));
  while (elapsed > 0 && !action.ended) {
    const step = Math.min(.02, elapsed);
    action.update(step, movement);
    elapsed -= step;
  }
  action.draw(context);
  updateMeters();
  if (action.ended) finish(action.score);
  else frame = requestAnimationFrame(tick);
}

function start() {
  if (phase === "finished") select(selected);
  if (phase === "running") return;
  phase = "running";
  renderOverlay();
  renderCards();
  if (memory) grid.querySelector("button:enabled")?.focus({ preventScroll: true });
  else {
    field.focus({ preventScroll: true });
    frame = requestAnimationFrame(tick);
  }
}

function pause() {
  if (phase !== "running" || !action) return;
  stop();
  phase = "paused";
  renderOverlay();
  playButton.focus({ preventScroll: true });
}

function finish(value) {
  stop();
  phase = "finished";
  const oldRecord = records[selected];
  isNewRecord = oldRecord === null || (selected === "memory" ? value < oldRecord : value > oldRecord);
  if (isNewRecord) {
    records[selected] = value;
    save(recordKey(selected), String(value));
  }
  updateMeters();
  renderCards();
  renderOverlay();
  get("announcement").textContent = get("overlay-description").textContent;
  playButton.focus({ preventScroll: true });
}

function flip(index) {
  const card = memory.cards[index];
  if (phase !== "running" || memory.locked || card.revealed) return;
  card.revealed = true;
  if (memory.first === null) {
    memory.first = index;
    renderCards();
    return;
  }

  const first = memory.cards[memory.first];
  memory.moves += 1;
  if (first.face === card.face) {
    first.matched = card.matched = true;
    memory.first = null;
    memory.matches += 1;
    if (memory.matches === faces.length) finish(memory.moves);
    else {
      renderCards();
      grid.querySelector("button:enabled")?.focus({ preventScroll: true });
    }
  } else {
    memory.locked = true;
    renderCards();
    flipTimer = setTimeout(() => {
      first.revealed = card.revealed = false;
      memory.first = null;
      memory.locked = false;
      renderCards();
    }, 720);
  }
  updateMeters();
}

function direction(key) {
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return "left";
  if (key === "ArrowRight" || key.toLowerCase() === "d") return "right";
  return null;
}

window.addEventListener("keydown", (event) => {
  if (phase !== "running" || !action || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "Escape" || event.key.toLowerCase() === "p") {
    event.preventDefault();
    pause();
  } else if (selected === "stars" && direction(event.key)) {
    event.preventDefault();
    held.add(direction(event.key));
  } else if (selected === "rooftop" && (event.key === " " || event.key === "ArrowUp") && !(event.target instanceof HTMLButtonElement)) {
    event.preventDefault();
    if (!event.repeat) action.jump();
  }
});
window.addEventListener("keyup", (event) => held.delete(direction(event.key)));
window.addEventListener("blur", () => held.clear());
document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); });

function drag(event) {
  if (phase !== "running" || selected !== "stars") return;
  const bounds = field.getBoundingClientRect();
  action.moveTo((event.clientX - bounds.left) * WIDTH / bounds.width);
}
field.addEventListener("pointerdown", (event) => {
  if (phase !== "running") return;
  if (selected === "stars") {
    field.setPointerCapture(event.pointerId);
    drag(event);
  } else if (selected === "rooftop") action.jump();
});
field.addEventListener("pointermove", (event) => {
  if (field.hasPointerCapture(event.pointerId)) drag(event);
});

for (const name of ["left", "right"]) {
  const button = get(name);
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    held.add(name);
  });
  for (const release of ["pointerup", "pointercancel", "lostpointercapture"]) {
    button.addEventListener(release, () => held.delete(name));
  }
  button.addEventListener("click", (event) => {
    if (event.detail === 0 && phase === "running" && selected === "stars") {
      action.moveTo(action.player + (name === "left" ? -1 : 1) * 36);
    }
  });
}
get("jump").addEventListener("click", () => { if (selected === "rooftop" && phase === "running") action.jump(); });
get("language").addEventListener("click", () => {
  language = language === "vi" ? "en" : "vi";
  save("midnight-arcade.language", language);
  renderLanguage();
});
for (const tile of tiles) {
  tile.addEventListener("click", () => { if (tile.dataset.game !== selected) select(tile.dataset.game); });
}
playButton.addEventListener("click", start);
pauseButton.addEventListener("click", () => { if (phase === "paused") start(); else pause(); });
resetButton.addEventListener("click", () => { select(selected); start(); });

const requested = new URLSearchParams(location.search).get("game");
select(Object.hasOwn(games, requested) ? requested : "stars");
