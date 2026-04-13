// ====================== 1. 게임 상태 팩토리 ======================
/**
 * 슬라이딩 퍼즐의 초기 게임 상태 객체를 생성하는 함수
 * @returns {object}
 */
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
    currentLanguage: "ko",
    lastEndScore: null,
    lastEndIsNewRecord: false,
  };
}
