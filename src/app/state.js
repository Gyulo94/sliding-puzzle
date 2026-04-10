export function createGameState() {
  return {
    image: new Image(),
    board: [],
    size: 4,
    emptyIndex: 0,
    tileSize: 0,
    initialBoard: [],
    solveStack: [],
    history: [],
    elapsedSeconds: 0,
    timerId: null,
    isGameStarted: false,
    isCompleted: false,
    hintCount: 0,
    currentUser: null,
    moveCount: 0,
    currentThemeIndex: 0,
  };
}
