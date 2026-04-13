// ====================== 1. 이동 가능 타일 계산 ======================
/**
 * 빈칸 인덱스 기준으로 이동 가능한 인접 타일 인덱스를 계산하는 함수
 * @param {number} empty
 * @param {number} puzzleSize
 * @returns {number[]}
 */
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

/**
 * 현재 게임 상태에서 이동 가능한 타일 목록을 반환하는 함수
 * @param {{emptyIndex:number,size:number}} state
 * @returns {number[]}
 */
export function getMovableTiles(state) {
  return getMovableTilesFromEmpty(state.emptyIndex, state.size);
}

// ====================== 2. 이동 적용/검증 ======================
/**
 * 지정 타일과 빈칸을 교환해 상태를 갱신하는 함수
 * @param {{board:number[],emptyIndex:number}} state
 * @param {number} i
 */
export function swap(state, i) {
  [state.board[state.emptyIndex], state.board[i]] = [
    state.board[i],
    state.board[state.emptyIndex],
  ];
  state.emptyIndex = i;
}

/**
 * 지정 타일이 빈칸과 인접해 실제 이동 가능한지 검사하는 함수
 * @param {{size:number,emptyIndex:number}} state
 * @param {number} i
 * @returns {boolean}
 */
export function canMove(state, i) {
  const r = Math.floor(i / state.size);
  const c = i % state.size;
  const er = Math.floor(state.emptyIndex / state.size);
  const ec = state.emptyIndex % state.size;

  return (
    (r === er && Math.abs(c - ec) === 1) || (c === ec && Math.abs(r - er) === 1)
  );
}

/**
 * 타일 이동을 적용하고 역추적용 solveStack 경로를 갱신하는 함수
 * @param {{emptyIndex:number,solveStack:number[],board:number[]}} state
 * @param {number} i
 */
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

/**
 * 합법적인 랜덤 이동을 반복해 퍼즐을 셔플하는 함수
 * @param {object} state
 * @param {number} times
 */
export function shuffleByMoves(state, times) {
  for (let i = 0; i < times; i += 1) {
    const moves = getMovableTiles(state);
    const next = moves[Math.floor(Math.random() * moves.length)];
    applyMoveWithPath(state, next);
  }
}

/**
 * 현재 보드가 정답 순서인지 검사하는 함수
 * @param {{board:number[]}} state
 * @returns {boolean}
 */
export function checkWin(state) {
  return state.board.every((v, i) => v === i);
}

// ====================== 3. 힌트 탐색(IDA*) ======================
/**
 * 보드 배열의 맨해튼 거리 휴리스틱 값을 계산하는 함수
 * @param {number[]} stateArray
 * @param {number} puzzleSize
 * @returns {number}
 */
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

/**
 * IDA* 탐색으로 최단 경로 기준 다음 힌트 타일 인덱스를 찾는 함수
 * @param {number[]} boardState
 * @param {number} startEmpty
 * @param {number} puzzleSize
 * @returns {number|null}
 */
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

  /**
   * 주어진 임계값(threshold) 내에서 깊이 우선으로 IDA*를 수행하는 내부 함수
   * @param {number} empty
   * @param {number} g
   * @param {number} threshold
   * @param {number} prevEmpty
   * @param {number|null} firstMove
   * @returns {{timeout?:boolean,found?:boolean,move?:number|null,nextBound?:number}}
   */
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
