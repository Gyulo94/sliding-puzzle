export function updateBoardSize(dom) {
  const availWidth = dom.gameAreaEl.clientWidth * 0.98;
  const availHeight = dom.gameAreaEl.clientHeight * 0.98;
  const minBoardSize = window.innerWidth < 640 ? 150 : 220;
  const boardSize = Math.max(
    minBoardSize,
    Math.floor(Math.min(availWidth, availHeight)),
  );

  dom.boardEl.style.width = `${boardSize}px`;
  dom.boardEl.style.height = `${boardSize}px`;
  dom.topCardEl.style.width = `${boardSize}px`;
  dom.bottomCardEl.style.width = `${boardSize}px`;
}

export function renderBoard(dom, state, onTileClick) {
  dom.boardEl.innerHTML = "";

  state.board.forEach((val, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.style.width = `${state.tileSize}px`;
    tile.style.height = `${state.tileSize}px`;

    const x = i % state.size;
    const y = Math.floor(i / state.size);

    tile.dataset.index = String(i);
    tile.style.transform = `translate3d(${x * state.tileSize}px, ${y * state.tileSize}px, 0)`;

    if (val !== state.size * state.size - 1) {
      const imgX = val % state.size;
      const imgY = Math.floor(val / state.size);

      tile.style.backgroundImage = `url(${state.image.src})`;
      tile.style.backgroundSize = `${state.size * 100}% ${state.size * 100}%`;
      tile.style.backgroundPosition = `${(imgX / (state.size - 1)) * 100}% ${(imgY / (state.size - 1)) * 100}%`;

      const tileNumber = document.createElement("span");
      tileNumber.className = "tile-number";
      tileNumber.textContent = String(val + 1);
      tile.appendChild(tileNumber);

      tile.onclick = () => onTileClick(i);
    } else {
      tile.classList.add("tile-empty");
      tile.style.background = "var(--board-bg)";
    }

    dom.boardEl.appendChild(tile);
  });
}

export function fillLastPiece(boardEl, imageSrc) {
  boardEl.innerHTML = "";

  const full = document.createElement("img");
  full.src = imageSrc;
  full.style.width = "100%";
  full.style.height = "100%";
  full.style.objectPosition = "center";
  full.className = "rounded-2xl shadow-xl";

  boardEl.appendChild(full);
}

export function showConfetti() {
  const bursts = 4;
  for (let b = 0; b < bursts; b += 1) {
    setTimeout(() => createBurst(), b * 300);
  }
}

function createBurst() {
  for (let i = 0; i < 80; i += 1) {
    const el = document.createElement("div");
    el.className = "confetti";

    el.style.left = `${40 + Math.random() * 20}%`;
    el.style.top = `${40 + Math.random() * 20}%`;

    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 250;

    el.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
    el.style.setProperty("--y", `${Math.sin(angle) * dist}px`);
    el.style.background = `hsl(${Math.random() * 360},100%,60%)`;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}
