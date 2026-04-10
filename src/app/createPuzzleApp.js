import { dom } from "../modules/dom.js";
import {
  postAuth,
  fetchMe,
  submitScore,
  fetchRanking,
} from "../modules/api.js";
import {
  DIFFICULTY_LABEL,
  SCORE_RULES,
  formatTime,
  getScoreBreakdown,
  calculateScore,
} from "../modules/scoring.js";
import { THEMES, applyTheme, getNextThemeIndex } from "../modules/theme.js";
import { DEFAULT_IMAGES_BY_DIFFICULTY } from "../modules/defaultImages.js";
import { createGameState } from "./state.js";
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
import { renderTop5Into } from "../ui/rankingView.js";

const END_PANEL_DELAY_MS = 1200;
const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const THEME_INDEX_STORAGE_KEY = "themeIndex";
const RANKING_PAGE_SIZE = 10;

export function createPuzzleApp() {
  const state = createGameState();
  let rankingPage = 1;
  let rankingTotalPages = 1;

  function setAuthMessage(text, isError = false) {
    dom.authMessageEl.textContent = text;
    dom.authMessageEl.style.color = isError ? "#b91c1c" : "var(--text-muted)";
  }

  function setAuthMode(mode) {
    const loginMode = mode === "login";
    dom.loginFormEl.classList.toggle("hidden", !loginMode);
    dom.signupFormEl.classList.toggle("hidden", loginMode);
    setAuthMessage("");
  }

  function unlockApp() {
    dom.authOverlayEl.classList.add("hidden");
    dom.appRootEl.classList.remove("app-locked");
  }

  function lockApp() {
    dom.authOverlayEl.classList.remove("hidden");
    dom.appRootEl.classList.add("app-locked");
  }

  async function restoreLoginFromToken() {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    if (!accessToken) return false;

    try {
      const me = await fetchMe(accessToken);
      state.currentUser = {
        id: me.id,
        name: me.name || "",
      };

      unlockApp();
      openDifficultyOverlay();
      setAuthMessage("");
      return true;
    } catch (error) {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      return false;
    }
  }

  function cycleTheme() {
    state.currentThemeIndex = getNextThemeIndex(state.currentThemeIndex);
    applyTheme(dom.bodyEl, state.currentThemeIndex);
    localStorage.setItem(
      THEME_INDEX_STORAGE_KEY,
      String(state.currentThemeIndex),
    );
  }

  function loadSavedThemeIndex() {
    const raw = localStorage.getItem(THEME_INDEX_STORAGE_KEY);
    const parsed = Number(raw);
    if (!Number.isInteger(parsed)) return 0;
    if (parsed < 0 || parsed >= THEMES.length) return 0;
    return parsed;
  }

  function updateSizeLabelUI() {
    dom.sizeLabelEl.textContent = `${state.size} x ${state.size}`;
  }

  function updateMoveUI() {
    dom.moveCountEl.textContent = String(state.moveCount);
    updateScoreUI();
  }

  function updateHintUI() {
    updateScoreUI();
  }

  function updateTimeUI() {
    dom.timeValueEl.textContent = formatTime(state.elapsedSeconds);
    updateScoreUI();
  }

  function updateScoreUI() {
    return calculateScore({
      size: state.size,
      timeSeconds: state.elapsedSeconds,
      moves: state.moveCount,
      hints: state.hintCount,
    });
  }

  function openDifficultyOverlay() {
    dom.difficultyOverlayEl.classList.remove("hidden");
  }

  function closeDifficultyOverlay() {
    dom.difficultyOverlayEl.classList.add("hidden");
  }

  function openImageModeOverlay() {
    dom.imageModeOverlayEl.classList.remove("hidden");
  }

  function closeImageModeOverlay() {
    dom.imageModeOverlayEl.classList.add("hidden");
  }

  function openGameEndOverlay() {
    dom.gameEndOverlayEl.classList.remove("hidden");
  }

  function closeGameEndOverlay() {
    dom.gameEndOverlayEl.classList.add("hidden");
  }

  function applyDifficulty(selectedSize) {
    state.size = selectedSize;
    updateSizeLabelUI();
    closeGameEndOverlay();
    closeDifficultyOverlay();
    openImageModeOverlay();
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function resetTimer() {
    stopTimer();
    state.elapsedSeconds = 0;
    updateTimeUI();
  }

  function startTimer() {
    stopTimer();
    state.timerId = setInterval(() => {
      state.elapsedSeconds += 1;
      updateTimeUI();
    }, 1000);
  }

  function resetMove() {
    state.moveCount = 0;
    updateMoveUI();
  }

  function resetHintCount() {
    state.hintCount = 0;
    updateHintUI();
  }

  function applyMoveCount() {
    state.moveCount += 1;
    updateMoveUI();
  }

  function syncBoardLayout() {
    updateBoardSize(dom);
  }

  function render() {
    renderBoard(dom, state, move);
  }

  function findReverseTrackedHintMove() {
    if (state.solveStack.length === 0) return null;

    const candidate = state.solveStack[state.solveStack.length - 1];
    if (!canMove(state, candidate)) return null;
    return candidate;
  }

  function showEndSummary(score) {
    dom.endSummaryEl.innerHTML = `내 점수: <strong>${score.toLocaleString("ko-KR")}점</strong>`;
  }

  function fillEndScoreDetails(scoreOverride = null) {
    const breakdown = getScoreBreakdown({
      size: state.size,
      timeSeconds: state.elapsedSeconds,
      moves: state.moveCount,
      hints: state.hintCount,
    });

    dom.endDifficultyEl.textContent = `${DIFFICULTY_LABEL[state.size]} (${state.size}x${state.size})`;
    dom.endTimeEl.textContent = formatTime(state.elapsedSeconds);
    dom.endMovePenaltyEl.textContent = `${state.moveCount}회`;
    dom.endBonusScoreEl.textContent = `+${breakdown.bonusScore.toLocaleString("ko-KR")}점`;
    dom.endPenaltyScoreEl.textContent = `-${breakdown.penaltyScore.toLocaleString("ko-KR")}점`;
    dom.endHintsEl.textContent = `${state.hintCount}회`;

    const finalScore =
      scoreOverride !== null && Number.isFinite(scoreOverride)
        ? Math.round(scoreOverride)
        : breakdown.finalScore;
    dom.endTotalScoreEl.textContent = `${finalScore.toLocaleString("ko-KR")}점`;

    const difficultyTooltip = [
      "난이도 기준점수",
      `- ${DIFFICULTY_LABEL[state.size]} (${state.size}x${state.size})`,
      `- 기준점수: +${breakdown.baseScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const timeTooltip = [
      "시간 감점 계산",
      `- 경과시간: ${formatTime(state.elapsedSeconds)} (${state.elapsedSeconds}초)`,
      `- 초당 감점: ${SCORE_RULES.timePenaltyPerSecond}점`,
      `- 시간 감점: ${state.elapsedSeconds} x ${SCORE_RULES.timePenaltyPerSecond} = ${breakdown.timePenaltyScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const moveTooltip = [
      "이동 감점 계산",
      `- 이동횟수: ${state.moveCount}회`,
      `- 1회당 감점: ${SCORE_RULES.movePenaltyPerMove}점`,
      `- 이동 감점: ${state.moveCount} x ${SCORE_RULES.movePenaltyPerMove} = ${breakdown.movePenaltyScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const hintTooltip = [
      "힌트 감점 계산",
      `- 힌트 사용: ${state.hintCount}회`,
      `- 1회당 감점: ${SCORE_RULES.hintPenaltyPerUse}점`,
      `- 힌트 감점: ${state.hintCount} x ${SCORE_RULES.hintPenaltyPerUse} = ${breakdown.hintPenaltyScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const bonusTooltip = [
      "가산점 계산",
      `- 타일 수: ${state.size} x ${state.size} = ${state.size * state.size}`,
      `- 계수: ${SCORE_RULES.bonusCoefficient}`,
      `- 감쇠식: exp(-총감점 / ${SCORE_RULES.dampingDivisor})`,
      `- 총감점: ${breakdown.penaltyScore.toLocaleString("ko-KR")}점`,
      `- 가산점: (${state.size * state.size} x ${SCORE_RULES.bonusCoefficient}) x exp(-${breakdown.penaltyScore} / ${SCORE_RULES.dampingDivisor}) = ${breakdown.bonusScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const penaltyTooltip = [
      "총 감점 계산",
      `- 시간 감점: ${breakdown.timePenaltyScore.toLocaleString("ko-KR")}점`,
      `- 이동 감점: ${breakdown.movePenaltyScore.toLocaleString("ko-KR")}점`,
      `- 힌트 감점: ${breakdown.hintPenaltyScore.toLocaleString("ko-KR")}점`,
      `- 총 감점: ${breakdown.timePenaltyScore.toLocaleString("ko-KR")} + ${breakdown.movePenaltyScore.toLocaleString("ko-KR")} + ${breakdown.hintPenaltyScore.toLocaleString("ko-KR")} = ${breakdown.penaltyScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    const tooltipText = [
      "점수 계산 상세",
      `- 기준점수: +${breakdown.baseScore.toLocaleString("ko-KR")}점`,
      `- 가산점: +${breakdown.bonusScore.toLocaleString("ko-KR")}점`,
      `- 총 감점: -${breakdown.penaltyScore.toLocaleString("ko-KR")}점`,
      `- 최종점수: ${breakdown.baseScore.toLocaleString("ko-KR")} + ${breakdown.bonusScore.toLocaleString("ko-KR")} - ${breakdown.penaltyScore.toLocaleString("ko-KR")} = ${finalScore.toLocaleString("ko-KR")}점`,
    ].join("\n");

    function applyCardTooltip(valueEl, text) {
      const cardEl = valueEl.closest(".end-score-item");
      if (cardEl) {
        cardEl.title = text;
        cardEl.setAttribute("aria-label", text);
      }
      valueEl.removeAttribute("title");
      valueEl.setAttribute("aria-label", text);
    }

    applyCardTooltip(dom.endDifficultyEl, difficultyTooltip);
    applyCardTooltip(dom.endTimeEl, timeTooltip);
    applyCardTooltip(dom.endMovePenaltyEl, moveTooltip);
    applyCardTooltip(dom.endHintsEl, hintTooltip);
    applyCardTooltip(dom.endBonusScoreEl, bonusTooltip);
    applyCardTooltip(dom.endPenaltyScoreEl, penaltyTooltip);
    applyCardTooltip(dom.endTotalScoreEl, tooltipText);
  }

  function pickRandomDefaultImage(difficulty) {
    const list = DEFAULT_IMAGES_BY_DIFFICULTY[difficulty] || [];
    if (list.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  }

  async function loadEndMyRank(difficulty, scoreId) {
    dom.endMyRankEl.innerHTML = "내 순위: <strong>계산 중...</strong>";

    try {
      const data = await fetchRanking(difficulty, {
        limit: 3,
        scoreId,
      });

      dom.endMyRankEl.innerHTML =
        data.myRank && Number.isFinite(data.myRank)
          ? `내 순위: <strong>${data.myRank}등</strong>`
          : "내 순위: <strong>확인 불가</strong>";
    } catch (error) {
      dom.endMyRankEl.innerHTML = "내 순위: <strong>확인 불가</strong>";
    }
  }

  async function submitScoreAndRefresh(payload) {
    const result = await submitScore(payload);
    if (!dom.rankingPanelEl.classList.contains("hidden")) {
      await loadRanking(Number(dom.rankingDifficultyEl.value));
    }
    return result;
  }

  function completeIfWin() {
    if (!checkWin(state)) return;

    state.isCompleted = true;
    stopTimer();
    const localScore = calculateScore({
      size: state.size,
      timeSeconds: state.elapsedSeconds,
      moves: state.moveCount,
      hints: state.hintCount,
    });

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

      const showEndPanel = (displayScore, savedScoreId = null) => {
        showEndSummary(displayScore);
        fillEndScoreDetails(displayScore);
        dom.scoringModalEl.classList.remove("hidden");

        setTimeout(() => {
          dom.scoringModalEl.classList.add("hidden");
          loadEndMyRank(state.size, savedScoreId);
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
            showEndPanel(displayScore, result?.scoreId ?? null);
          })
          .catch(() => {
            showEndPanel(localScore, null);
          });
      } else {
        showEndPanel(localScore, null);
      }
    }, 350);
  }

  function tryMove(i) {
    if (!canMove(state, i) || state.isCompleted) return false;

    state.history.push({
      board: [...state.board],
      emptyIndex: state.emptyIndex,
      moveCount: state.moveCount,
      solveStack: [...state.solveStack],
    });

    applyMoveWithPath(state, i);
    applyMoveCount();

    requestAnimationFrame(() => {
      render();
    });

    completeIfWin();
    return true;
  }

  function move(i) {
    tryMove(i);
  }

  function restartGame() {
    if (!state.image.src) return;
    initGame();
  }

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

  function renderRanking(items) {
    renderTop5Into(dom.rankingListEl, items, state.currentUser?.id, formatTime);
  }

  function updateRankingPaginationUI() {
    dom.rankingPageTextEl.textContent = `${rankingPage} / ${rankingTotalPages}`;
    dom.rankingPrevBtnEl.disabled = rankingPage <= 1;
    dom.rankingNextBtnEl.disabled = rankingPage >= rankingTotalPages;
  }

  async function loadRanking(difficulty, page = rankingPage) {
    dom.rankingListEl.innerHTML =
      '<div class="py-[18px] text-center text-[var(--text-muted)]">불러오는 중...</div>';
    try {
      const data = await fetchRanking(difficulty, {
        page,
        limit: RANKING_PAGE_SIZE,
      });

      rankingPage = data?.pagination?.page || page;
      rankingTotalPages = data?.pagination?.totalPages || 1;
      updateRankingPaginationUI();
      renderRanking(data.items || []);
    } catch (error) {
      rankingPage = 1;
      rankingTotalPages = 1;
      updateRankingPaginationUI();
      dom.rankingListEl.innerHTML = `<div class="py-[18px] text-center text-[var(--text-muted)]">${error.message}</div>`;
    }
  }

  function openRankingPanel() {
    if (!dom.difficultyOverlayEl.classList.contains("hidden")) return;
    dom.rankingPanelEl.classList.remove("hidden");
    dom.rankingDifficultyEl.value = String(state.size);
    rankingPage = 1;
    rankingTotalPages = 1;
    updateRankingPaginationUI();
    loadRanking(state.size, 1);
  }

  function closeRankingPanel() {
    dom.rankingPanelEl.classList.add("hidden");
  }

  function initGame() {
    if (!state.image.src) {
      alert("이미지 업로드 필요");
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
    resetMove();
    resetHintCount();
    state.history = [];
    resetTimer();

    shuffleByMoves(state, state.size * state.size * 50);
    state.initialBoard = [...state.board];

    startTimer();
    render();
  }

  function bindEvents() {
    dom.backBtnEl.addEventListener("click", () => {
      closeRankingPanel();
      closeImageModeOverlay();
      closeGameEndOverlay();
      openDifficultyOverlay();
    });

    dom.themeBtnEl.addEventListener("click", cycleTheme);
    dom.restartBtnEl.addEventListener("click", restartGame);
    dom.hintBtnEl.addEventListener("click", showHint);
    dom.backToEndPanelBtnEl.addEventListener("click", () => {
      closeRankingPanel();
      openGameEndOverlay();
    });
    dom.refreshRankingBtnEl.addEventListener("click", () =>
      loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage),
    );
    dom.endSelectDifficultyBtnEl.addEventListener("click", () => {
      closeGameEndOverlay();
      closeImageModeOverlay();
      openDifficultyOverlay();
    });
    dom.endViewRankingBtnEl.addEventListener("click", () => {
      closeGameEndOverlay();
      openRankingPanel();
    });
    dom.rankingDifficultyEl.addEventListener("change", () => {
      rankingPage = 1;
      rankingTotalPages = 1;
      updateRankingPaginationUI();
      loadRanking(Number(dom.rankingDifficultyEl.value), 1);
    });

    dom.rankingPrevBtnEl.addEventListener("click", () => {
      if (rankingPage <= 1) return;
      loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage - 1);
    });

    dom.rankingNextBtnEl.addEventListener("click", () => {
      if (rankingPage >= rankingTotalPages) return;
      loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage + 1);
    });

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
      if (!picked) {
        return;
      }

      state.image.src = picked.src;
      closeImageModeOverlay();
      initGame();
    });

    dom.chooseDifficultyAgainBtnEl.addEventListener("click", () => {
      closeImageModeOverlay();
      openDifficultyOverlay();
    });

    dom.goSignupEl.addEventListener("click", () => setAuthMode("signup"));
    dom.goLoginEl.addEventListener("click", () => setAuthMode("login"));

    dom.signupFormEl.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = dom.signupIdEl.value.trim();
      const name = dom.signupNameEl.value.trim();
      const pw = dom.signupPwEl.value.trim();
      if (!id || !name || !pw) {
        setAuthMessage("아이디, 이름, 비밀번호를 입력해주세요", true);
        return;
      }

      setAuthMessage("처리 중...");
      postAuth("/api/signup", { id, name, password: pw })
        .then((data) => {
          dom.signupIdEl.value = "";
          dom.signupNameEl.value = "";
          dom.signupPwEl.value = "";
          setAuthMode("login");
          setAuthMessage(data.message || "회원가입 완료! 로그인해주세요");
        })
        .catch((error) => {
          setAuthMessage(error.message, true);
        });
    });

    dom.loginFormEl.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = dom.loginIdEl.value.trim();
      const pw = dom.loginPwEl.value.trim();

      if (!id || !pw) {
        setAuthMessage("아이디와 비밀번호를 입력해주세요", true);
        return;
      }

      setAuthMessage("로그인 중...");
      postAuth("/api/login", { id, password: pw })
        .then((data) => {
          if (data.accessToken) {
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.accessToken);
          }

          state.currentUser = {
            id: data.id || id,
            name: data.name || "",
          };
          setAuthMessage("");
          unlockApp();
          openDifficultyOverlay();
        })
        .catch((error) => {
          setAuthMessage(error.message, true);
        });
    });

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
        closeRankingPanel();
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

  function start() {
    bindEvents();

    state.currentThemeIndex = loadSavedThemeIndex();
    updateMoveUI();
    updateHintUI();
    updateTimeUI();
    updateSizeLabelUI();
    updateRankingPaginationUI();
    applyTheme(dom.bodyEl, state.currentThemeIndex);
    setAuthMode("login");
    lockApp();

    restoreLoginFromToken();
  }

  return {
    start,
  };
}
