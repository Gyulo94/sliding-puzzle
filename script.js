let image = new Image();
let board = [];
let size = 3;
let emptyIndex;
let tileSize = 0;

const boardEl = document.getElementById("board");
const upload = document.getElementById("upload");

upload.addEventListener("change", (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
});

function initGame() {
  if (!image.src) return alert("이미지 업로드 필요");

  size = parseInt(document.getElementById("size").value);

  const boardSize = boardEl.clientWidth;
  tileSize = boardSize / size;

  board = Array.from({ length: size * size }, (_, i) => i);
  emptyIndex = board.length - 1;

  shuffleByMoves(size * size * 50);
  render();
}

function shuffleByMoves(times) {
  for (let i = 0; i < times; i++) {
    const moves = getMovableTiles();
    const next = moves[Math.floor(Math.random() * moves.length)];
    swap(next);
  }
}

function getMovableTiles() {
  const moves = [];
  const r = Math.floor(emptyIndex / size);
  const c = emptyIndex % size;

  if (r > 0) moves.push(emptyIndex - size);
  if (r < size - 1) moves.push(emptyIndex + size);
  if (c > 0) moves.push(emptyIndex - 1);
  if (c < size - 1) moves.push(emptyIndex + 1);

  return moves;
}

function swap(i) {
  [board[emptyIndex], board[i]] = [board[i], board[emptyIndex]];
  emptyIndex = i;
}

function canMove(i) {
  const r = Math.floor(i / size);
  const c = i % size;
  const er = Math.floor(emptyIndex / size);
  const ec = emptyIndex % size;

  return (
    (r === er && Math.abs(c - ec) === 1) || (c === ec && Math.abs(r - er) === 1)
  );
}

function move(i) {
  if (!canMove(i)) return;

  swap(i);

  requestAnimationFrame(() => {
    render();
  });

  if (checkWin()) {
    setTimeout(() => {
      showConfetti();
      fillLastPiece();
    }, 350);
  }
}

function render() {
  boardEl.innerHTML = "";

  board.forEach((val, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.style.width = tileSize + "px";
    tile.style.height = tileSize + "px";

    const x = i % size;
    const y = Math.floor(i / size);

    tile.style.transform = `translate3d(${x * tileSize}px, ${y * tileSize}px, 0)`;

    if (val !== size * size - 1) {
      const imgX = val % size;
      const imgY = Math.floor(val / size);

      tile.style.backgroundImage = `url(${image.src})`;
      tile.style.backgroundSize = `${size * 100}% ${size * 100}%`;
      tile.style.backgroundPosition = `${(imgX / (size - 1)) * 100}% ${(imgY / (size - 1)) * 100}%`;

      tile.onclick = () => move(i);
    } else {
      tile.style.background = "#f3f4f6";
    }

    boardEl.appendChild(tile);
  });
}

function checkWin() {
  return board.every((v, i) => v === i);
}

function showConfetti() {
  const bursts = 4;
  for (let b = 0; b < bursts; b++) {
    setTimeout(() => createBurst(), b * 300);
  }
}

function createBurst() {
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti";

    el.style.left = 40 + Math.random() * 20 + "%";
    el.style.top = 40 + Math.random() * 20 + "%";

    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 250;

    el.style.setProperty("--x", Math.cos(angle) * dist + "px");
    el.style.setProperty("--y", Math.sin(angle) * dist + "px");

    el.style.background = `hsl(${Math.random() * 360},100%,60%)`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

function fillLastPiece() {
  boardEl.innerHTML = "";

  const full = document.createElement("img");
  full.src = image.src;
  full.style.width = "100%";
  full.style.height = "100%";
  full.style.objectPosition = "center";
  full.className = "rounded-2xl shadow-xl";

  boardEl.appendChild(full);
}
