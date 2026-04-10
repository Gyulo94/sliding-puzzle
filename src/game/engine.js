export function getMovableTilesFromEmpty(empty, puzzleSize) {
  const moves = [];
  const r = Math.floor(empty / puzzleSize);
  const c = empty % puzzleSize;

  if (r > 0) moves.push(empty - puzzleSize);
  if (r < puzzleSize - 1) moves.push(empty + puzzleSize);
  if (c > 0) moves.push(empty - 1);
  if (c < puzzleSize - 1) moves.push(empty + 1);

  return moves;
}

export function getMovableTiles(state) {
  return getMovableTilesFromEmpty(state.emptyIndex, state.size);
}

export function swap(state, i) {
  [state.board[state.emptyIndex], state.board[i]] = [
    state.board[i],
    state.board[state.emptyIndex],
  ];
  state.emptyIndex = i;
}

export function canMove(state, i) {
  const r = Math.floor(i / state.size);
  const c = i % state.size;
  const er = Math.floor(state.emptyIndex / state.size);
  const ec = state.emptyIndex % state.size;

  return (
    (r === er && Math.abs(c - ec) === 1) || (c === ec && Math.abs(r - er) === 1)
  );
}

export function applyMoveWithPath(state, i) {
  const previousEmpty = state.emptyIndex;
  const reverseTarget = state.solveStack[state.solveStack.length - 1];

  swap(state, i);

  if (reverseTarget === i) {
    state.solveStack.pop();
  } else {
    state.solveStack.push(previousEmpty);
  }
}

export function shuffleByMoves(state, times) {
  for (let i = 0; i < times; i += 1) {
    const moves = getMovableTiles(state);
    const next = moves[Math.floor(Math.random() * moves.length)];
    applyMoveWithPath(state, next);
  }
}

export function checkWin(state) {
  return state.board.every((v, i) => v === i);
}

export function getManhattanDistance(stateArray, puzzleSize) {
  const blank = puzzleSize * puzzleSize - 1;
  let distance = 0;

  for (let i = 0; i < stateArray.length; i += 1) {
    const value = stateArray[i];
    if (value === blank) continue;

    const curRow = Math.floor(i / puzzleSize);
    const curCol = i % puzzleSize;
    const goalRow = Math.floor(value / puzzleSize);
    const goalCol = value % puzzleSize;

    distance += Math.abs(curRow - goalRow) + Math.abs(curCol - goalCol);
  }

  return distance;
}

export function findShortestHintMove(boardState, startEmpty, puzzleSize) {
  const state = [...boardState];
  const now =
    typeof performance !== "undefined" && typeof performance.now === "function"
      ? () => performance.now()
      : () => Date.now();

  const startedAt = now();
  const timeLimitMs = 1800;
  const maxVisitedNodes = 1200000;
  let visitedNodes = 0;

  let bound = getManhattanDistance(state, puzzleSize);
  if (bound === 0) return null;

  function search(empty, g, threshold, prevEmpty, firstMove) {
    visitedNodes += 1;
    if (visitedNodes > maxVisitedNodes || now() - startedAt > timeLimitMs) {
      return { timeout: true };
    }

    const h = getManhattanDistance(state, puzzleSize);
    const f = g + h;
    if (f > threshold) return { nextBound: f };
    if (h === 0) return { found: true, move: firstMove };

    let minNextBound = Infinity;
    const moves = getMovableTilesFromEmpty(empty, puzzleSize);

    for (const next of moves) {
      if (next === prevEmpty) continue;

      [state[empty], state[next]] = [state[next], state[empty]];
      const result = search(next, g + 1, threshold, empty, firstMove ?? next);
      [state[empty], state[next]] = [state[next], state[empty]];

      if (result.found) return result;
      if (result.timeout) return result;
      if (result.nextBound < minNextBound) minNextBound = result.nextBound;
    }

    return { nextBound: minNextBound };
  }

  while (true) {
    const result = search(startEmpty, 0, bound, -1, null);
    if (result.found) return result.move;
    if (result.timeout || !Number.isFinite(result.nextBound)) return null;
    bound = result.nextBound;
  }
}
