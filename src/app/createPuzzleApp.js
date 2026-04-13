import { dom } from "../modules/dom.js";
import { submitScore } from "../modules/api.js";
import {
  applyStaticTranslations,
  loadSavedLanguage,
  setLanguage,
  t,
} from "../modules/i18n.js";
import { formatTime } from "../modules/scoring.js";
import { THEMES, applyTheme, getNextThemeIndex } from "../modules/theme.js";
import { DEFAULT_IMAGES_BY_DIFFICULTY } from "../modules/defaultImages.js";
import {
  canMove,
  checkWin,
  shuffleByMoves,
  applyMoveWithPath,
  findShortestHintMove,
} from "../game/engine.js";
import {
  updateBoardSize,
  renderBoard,
  fillLastPiece,
  showConfetti,
} from "../ui/boardView.js";
import { createGameState } from "./state.js";
import { createAuthController } from "./authController.js";
import { createOverlayController } from "./overlayController.js";
import {
  calculateStateScore,
  showEndSummary,
  fillEndScoreDetails,
} from "./endPanelView.js";
import { createRankingController } from "./rankingController.js";

// ====================== 1. 앱 상수 ======================
const END_PANEL_DELAY_MS = 1200;
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const THEME_INDEX_STORAGE_KEY = "themeIndex";

export function createPuzzleApp() {
  // ====================== 2. 컨트롤러 초기화 ======================
  const state = createGameState();
  const overlayController = createOverlayController({ dom });
  const rankingController = createRankingController({ dom, state });
  const authController = createAuthController({
    dom,
    state,
    accessTokenStorageKey: ACCESS_TOKEN_STORAGE_KEY,
    onAuthenticated: () => {
      overlayController.openDifficultyOverlay();
    },
  });

  // ====================== 3. 상태/표시 유틸 ======================
  /**
   * 테마를 다음 순번으로 변경하고 로컬 스토리지에 저장하는 함수
   */
  function cycleTheme() {
    state.currentThemeIndex = getNextThemeIndex(state.currentThemeIndex);
    applyTheme(dom.bodyEl, state.currentThemeIndex);
    localStorage.setItem(
      THEME_INDEX_STORAGE_KEY,
      String(state.currentThemeIndex),
    );
  }

  /**
   * 저장된 테마 인덱스를 읽고 유효 범위 밖이면 0을 반환하는 함수
   * @returns {number}
   */
  function loadSavedThemeIndex() {
    const raw = localStorage.getItem(THEME_INDEX_STORAGE_KEY);
    const parsed = Number(raw);
    if (!Number.isInteger(parsed)) return 0;
    if (parsed < 0 || parsed >= THEMES.length) return 0;
    return parsed;
  }

  /**
   * 현재 퍼즐 크기 라벨을 UI에 반영하는 함수
   */
  function updateSizeLabelUI() {
    dom.sizeLabelEl.textContent = `${state.size} x ${state.size}`;
  }

  /**
   * 선택된 언어를 화면에 반영하고 동적 UI를 다시 그리는 함수
   * @param {string} language
   */
  function applyLanguage(language) {
    state.currentLanguage = language;
    setLanguage(language);
    applyStaticTranslations();
    dom.languageSelectEl.value = language;

    updateSizeLabelUI();
    updateMoveUI();
    updateTimeUI();
    rankingController.refreshTexts();

    if (state.lastEndScore !== null) {
      showEndSummary(dom, state.lastEndScore, state.lastEndIsNewRecord);
      fillEndScoreDetails(dom, state, state.lastEndScore);
    }
  }

  /**
   * 이동 횟수 표시와 점수 표시를 갱신하는 함수
   */
  function updateMoveUI() {
    dom.moveCountEl.textContent = String(state.moveCount);
    updateScoreUI();
  }

  /**
   * 힌트 사용 수 변경 후 점수를 갱신하는 함수
   */
  function updateHintUI() {
    updateScoreUI();
  }

  /**
   * 경과 시간 표시와 점수 표시를 갱신하는 함수
   */
  function updateTimeUI() {
    dom.timeValueEl.textContent = formatTime(state.elapsedSeconds);
    updateScoreUI();
  }

  /**
   * 현재 상태 기준으로 점수를 계산하는 함수
   */
  function updateScoreUI() {
    return calculateStateScore(state);
  }

  /**
   * 난이도 오버레이를 여는 함수
   */
  function openDifficultyOverlay() {
    overlayController.openDifficultyOverlay();
  }

  /**
   * 난이도 오버레이를 닫는 함수
   */
  function closeDifficultyOverlay() {
    overlayController.closeDifficultyOverlay();
  }

  /**
   * 이미지 선택 오버레이를 여는 함수
   */
  function openImageModeOverlay() {
    overlayController.openImageModeOverlay();
  }

  /**
   * 이미지 선택 오버레이를 닫는 함수
   */
  function closeImageModeOverlay() {
    overlayController.closeImageModeOverlay();
  }

  /**
   * 게임 종료 오버레이를 여는 함수
   */
  function openGameEndOverlay() {
    overlayController.openGameEndOverlay();
  }

  /**
   * 게임 종료 오버레이를 닫는 함수
   */
  function closeGameEndOverlay() {
    overlayController.closeGameEndOverlay();
  }

  /**
   * 선택 난이도를 적용하고 이미지 선택 단계로 이동하는 함수
   * @param {number} selectedSize
   */
  function applyDifficulty(selectedSize) {
    state.size = selectedSize;
    updateSizeLabelUI();
    closeGameEndOverlay();
    closeDifficultyOverlay();
    openImageModeOverlay();
  }

  // ====================== 4. 타이머/보드 갱신 ======================
  /**
   * 동작 중인 타이머를 정지하는 함수
   */
  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  /**
   * 타이머를 0초 상태로 초기화하는 함수
   */
  function resetTimer() {
    stopTimer();
    state.elapsedSeconds = 0;
    updateTimeUI();
  }

  /**
   * 1초 간격 타이머를 시작하는 함수
   */
  function startTimer() {
    stopTimer();
    state.timerId = setInterval(() => {
      state.elapsedSeconds += 1;
      updateTimeUI();
    }, 1000);
  }

  /**
   * 이동 횟수를 0으로 초기화하는 함수
   */
  function resetMoveCount() {
    state.moveCount = 0;
    updateMoveUI();
  }

  /**
   * 힌트 사용 횟수를 0으로 초기화하는 함수
   */
  function resetHintCount() {
    state.hintCount = 0;
    updateHintUI();
  }

  /**
   * 이동 횟수를 1 증가시키는 함수
   */
  function incrementMoveCount() {
    state.moveCount += 1;
    updateMoveUI();
  }

  /**
   * 보드/카드 레이아웃 크기를 다시 맞추는 함수
   */
  function syncBoardLayout() {
    updateBoardSize(dom);
  }

  /**
   * 현재 상태로 보드를 다시 렌더링하는 함수
   */
  function render() {
    renderBoard(dom, state, move);
  }

  /**
   * 역추적 스택에서 힌트 후보 타일을 찾는 함수
   * @returns {number|null}
   */
  function findReverseTrackedHintMove() {
    if (state.solveStack.length === 0) return null;

    const candidate = state.solveStack[state.solveStack.length - 1];
    if (!canMove(state, candidate)) return null;
    return candidate;
  }

  /**
   * 난이도별 기본 이미지 목록에서 하나를 무작위로 고르는 함수
   * @param {number} difficulty
   * @returns {{src:string}|null}
   */
  function pickRandomDefaultImage(difficulty) {
    const list = DEFAULT_IMAGES_BY_DIFFICULTY[difficulty] || [];
    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  // ====================== 5. 점수 저장/완료 처리 ======================
  /**
   * 점수를 저장하고 필요 시 랭킹 목록을 갱신하는 함수
   * @param {object} payload
   * @returns {Promise<any>}
   */
  async function submitScoreAndRefresh(payload) {
    const result = await submitScore(payload);
    if (rankingController.isOpen()) {
      await rankingController.refreshCurrent();
    }
    return result;
  }

  /**
   * 퍼즐이 완성된 경우 종료 연출, 점수 저장, 종료 패널 표시를 수행하는 함수
   */
  function completeIfWin() {
    if (!checkWin(state)) return;

    state.isCompleted = true;
    stopTimer();
    const localScore = calculateStateScore(state);

    setTimeout(() => {
      showConfetti();
      fillLastPiece(dom.boardEl, state.image.src);

      const payload = {
        userId: state.currentUser?.id,
        difficulty: state.size,
        timeSeconds: state.elapsedSeconds,
        moves: state.moveCount,
        hints: state.hintCount,
      };

      // 종료 결과 모달/오버레이 표시를 공통 처리한다.
      const showEndPanel = (
        displayScore,
        savedScoreId = null,
        isNewRecord = false,
      ) => {
        state.lastEndScore = displayScore;
        state.lastEndIsNewRecord = isNewRecord;
        showEndSummary(dom, displayScore, isNewRecord);
        fillEndScoreDetails(dom, state, displayScore);
        dom.scoringModalEl.classList.remove("hidden");

        setTimeout(() => {
          dom.scoringModalEl.classList.add("hidden");
          rankingController.loadEndMyRank(state.size, savedScoreId);
          openGameEndOverlay();
        }, END_PANEL_DELAY_MS);
      };

      if (payload.userId) {
        submitScoreAndRefresh(payload)
          .then((result) => {
            const savedScore = Number(result?.score);
            const displayScore = Number.isFinite(savedScore)
              ? savedScore
              : localScore;
            const isNewRecord = Boolean(result?.rankingUpdated);
            showEndPanel(displayScore, result?.scoreId ?? null, isNewRecord);
          })
          .catch(() => {
            showEndPanel(localScore, null, false);
          });
      } else {
        showEndPanel(localScore, null, false);
      }
    }, 350);
  }

  /**
   * 지정한 타일 이동을 시도하는 함수
   * @param {number} i
   * @returns {boolean}
   */
  function tryMove(i) {
    if (!canMove(state, i) || state.isCompleted) return false;

    state.history.push({
      board: [...state.board],
      emptyIndex: state.emptyIndex,
      moveCount: state.moveCount,
      solveStack: [...state.solveStack],
    });

    applyMoveWithPath(state, i);
    incrementMoveCount();

    requestAnimationFrame(() => {
      render();
    });

    completeIfWin();
    return true;
  }

  /**
   * 타일 클릭 이벤트에서 이동 시도를 위임하는 함수
   * @param {number} i
   */
  function move(i) {
    tryMove(i);
  }

  /**
   * 현재 이미지 기준으로 게임을 다시 시작하는 함수
   */
  function restartGame() {
    if (!state.image.src) return;
    initGame();
  }

  /**
   * 최단 경로 힌트 타일을 강조 표시하고 힌트 사용 횟수를 반영하는 함수
   */
  function showHint() {
    if (!state.isGameStarted || state.isCompleted) return;

    let targetIndex = findShortestHintMove(
      state.board,
      state.emptyIndex,
      state.size,
    );
    if (targetIndex === null) {
      targetIndex = findReverseTrackedHintMove();
      if (targetIndex === null) return;
    }

    if (!canMove(state, targetIndex)) return;

    state.hintCount += 1;
    updateHintUI();

    const tile = dom.boardEl.querySelector(`[data-index="${targetIndex}"]`);
    if (!tile) return;

    tile.classList.remove("hint-strong");
    dom.hintBtnEl.classList.remove("hint-active");

    void tile.offsetWidth;

    tile.classList.add("hint-strong");
    dom.hintBtnEl.classList.add("hint-active");

    setTimeout(() => {
      tile.classList.remove("hint-strong");
      dom.hintBtnEl.classList.remove("hint-active");
    }, 950);
  }

  // ====================== 6. 게임 초기화/이벤트 ======================
  /**
   * 보드 상태를 초기화하고 셔플한 뒤 게임을 시작하는 함수
   */
  function initGame() {
    if (!state.image.src) {
      alert(t("game.imageRequired"));
      return;
    }

    updateSizeLabelUI();
    syncBoardLayout();
    state.isGameStarted = true;
    state.isCompleted = false;

    state.tileSize = dom.boardEl.clientWidth / state.size;

    state.board = Array.from({ length: state.size * state.size }, (_, i) => i);
    state.emptyIndex = state.board.length - 1;
    state.solveStack = [];
    resetMoveCount();
    resetHintCount();
    state.history = [];
    state.lastEndScore = null;
    state.lastEndIsNewRecord = false;
    resetTimer();

    shuffleByMoves(state, state.size * state.size * 50);
    state.initialBoard = [...state.board];

    startTimer();
    render();
  }

  /**
   * UI와 전역 이벤트 핸들러를 등록하는 함수
   */
  function bindEvents() {
    dom.backBtnEl.addEventListener("click", () => {
      rankingController.closePanel();
      closeImageModeOverlay();
      closeGameEndOverlay();
      openDifficultyOverlay();
    });

    dom.themeBtnEl.addEventListener("click", cycleTheme);
    dom.restartBtnEl.addEventListener("click", restartGame);
    dom.hintBtnEl.addEventListener("click", showHint);
    dom.backToEndPanelBtnEl.addEventListener("click", () => {
      rankingController.closePanel();
      openGameEndOverlay();
    });
    dom.refreshRankingBtnEl.addEventListener("click", () =>
      rankingController.refreshCurrent(),
    );
    dom.languageSelectEl.addEventListener("change", (event) => {
      applyLanguage(event.target.value);
    });
    dom.endSelectDifficultyBtnEl.addEventListener("click", () => {
      closeGameEndOverlay();
      closeImageModeOverlay();
      openDifficultyOverlay();
    });
    dom.endViewRankingBtnEl.addEventListener("click", () => {
      closeGameEndOverlay();
      rankingController.openPanel();
    });
    dom.rankingDifficultyEl.addEventListener(
      "change",
      rankingController.onDifficultyChange,
    );
    dom.rankingPrevBtnEl.addEventListener("click", rankingController.goPrev);
    dom.rankingNextBtnEl.addEventListener("click", rankingController.goNext);

    dom.difficultyButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const selected = Number(button.dataset.size);
        if (![3, 4, 5].includes(selected)) return;
        applyDifficulty(selected);
      });
    });

    dom.chooseUploadBtnEl.addEventListener("click", () => {
      closeImageModeOverlay();
      dom.upload.click();
    });

    dom.chooseRandomBtnEl.addEventListener("click", () => {
      const picked = pickRandomDefaultImage(state.size);
      if (!picked) return;

      state.image.src = picked.src;
      closeImageModeOverlay();
      initGame();
    });

    dom.chooseDifficultyAgainBtnEl.addEventListener("click", () => {
      closeImageModeOverlay();
      openDifficultyOverlay();
    });

    authController.bindAuthEvents();

    dom.boardEl.addEventListener("click", () => {
      if (!dom.difficultyOverlayEl.classList.contains("hidden")) return;
      if (!state.image.src) {
        openImageModeOverlay();
      }
    });

    dom.upload.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        state.image.src = loadEvent.target.result;
        closeImageModeOverlay();
        closeDifficultyOverlay();
        initGame();
      };
      reader.readAsDataURL(file);
    });

    window.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        !dom.rankingPanelEl.classList.contains("hidden")
      ) {
        rankingController.closePanel();
      }
    });

    window.addEventListener("resize", () => {
      syncBoardLayout();
      if (state.board.length === 0) return;
      state.tileSize = dom.boardEl.clientWidth / state.size;
      render();
    });

    window.addEventListener("load", syncBoardLayout);
  }

  /**
   * 앱의 초기 렌더 상태를 구성하고 로그인 복구를 시도하는 함수
   */
  function start() {
    bindEvents();

    const savedLanguage = loadSavedLanguage();
    applyLanguage(savedLanguage);

    state.currentThemeIndex = loadSavedThemeIndex();
    updateMoveUI();
    updateHintUI();
    updateTimeUI();
    updateSizeLabelUI();
    rankingController.updatePaginationUI();
    applyTheme(dom.bodyEl, state.currentThemeIndex);
    authController.initialize();

    authController.restoreLoginFromToken();
  }

  return {
    start,
  };
}
