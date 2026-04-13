import { fetchRanking } from "../modules/api.js";
import { formatNumber, t } from "../modules/i18n.js";
import { formatTime } from "../modules/scoring.js";
import { renderTop5Into } from "../ui/rankingView.js";

// ====================== 1. 랭킹 컨트롤러 상수 ======================
const DEFAULT_PAGE_SIZE = 5;

// ====================== 2. 랭킹 컨트롤러 생성 ======================
/**
 * 랭킹 패널의 상태/렌더링/페이징을 관리하는 컨트롤러를 생성하는 함수
 * @param {{dom:object,state:object,pageSize?:number}} params
 * @returns {object}
 */
export function createRankingController({
  dom,
  state,
  pageSize = DEFAULT_PAGE_SIZE,
}) {
  // ====================== 3. 페이지 상태 ======================
  let rankingPage = 1;
  let rankingTotalPages = 1;
  let currentRankingItems = [];
  let endMyRankStatus = { type: "default", rank: null };
  const rankingCache = new Map();

  /**
   * 캐시 키를 생성하는 함수
   * @param {number} difficulty
   * @param {number} page
   * @returns {string}
   */
  function getRankingCacheKey(difficulty, page) {
    return `${difficulty}:${page}:${pageSize}`;
  }

  /**
   * 조회 결과 데이터를 현재 화면 상태에 반영하는 함수
   * @param {any} data
   * @param {number} fallbackPage
   */
  function applyRankingData(data, fallbackPage) {
    rankingPage = data?.pagination?.page || fallbackPage;
    rankingTotalPages = data?.pagination?.totalPages || 1;
    currentRankingItems = data?.items || [];
    updatePaginationUI();
    renderRanking(currentRankingItems);
  }

  /**
   * 현재 페이지 상태를 페이지네이션 UI에 반영하는 함수
   */
  function updatePaginationUI() {
    dom.rankingPageTextEl.textContent = `${formatNumber(rankingPage)} / ${formatNumber(rankingTotalPages)}`;
    dom.rankingPrevBtnEl.disabled = rankingPage <= 1;
    dom.rankingNextBtnEl.disabled = rankingPage >= rankingTotalPages;
  }

  /**
   * 페이지 상태를 1페이지 기준으로 초기화하는 함수
   */
  function resetPagination() {
    rankingPage = 1;
    rankingTotalPages = 1;
    updatePaginationUI();
  }

  // ====================== 4. 랭킹 조회/렌더링 ======================
  /**
   * 랭킹 목록을 현재 페이지 시작 순위 기준으로 렌더링하는 함수
   * @param {Array} items
   */
  function renderRanking(items) {
    const startRank = (rankingPage - 1) * pageSize + 1;
    renderTop5Into(
      dom.rankingListEl,
      items,
      state.currentUser?.id,
      formatTime,
      startRank,
    );
  }

  /**
   * 종료 패널의 내 순위 텍스트를 현재 언어로 렌더링하는 함수
   */
  function renderEndMyRank() {
    if (endMyRankStatus.type === "loading") {
      dom.endMyRankEl.innerHTML = t("ranking.myBestRank.loading");
      return;
    }

    if (endMyRankStatus.type === "value" && Number.isFinite(endMyRankStatus.rank)) {
      dom.endMyRankEl.innerHTML = t("ranking.myBestRank.value", {
        rank: formatNumber(endMyRankStatus.rank),
      });
      return;
    }

    if (endMyRankStatus.type === "unavailable") {
      dom.endMyRankEl.innerHTML = t("ranking.myBestRank.unavailable");
      return;
    }

    dom.endMyRankEl.innerHTML = t("end.myRank.default");
  }

  /**
   * 난이도/페이지 기준 랭킹 데이터를 조회하거나 캐시를 사용해 UI를 갱신하는 함수
   * @param {number} difficulty
   * @param {number} [page=rankingPage]
   * @param {{force?:boolean}} [options]
   * @returns {Promise<void>}
   */
  async function loadRanking(difficulty, page = rankingPage, options = {}) {
    const { force = false } = options;
    const cacheKey = getRankingCacheKey(difficulty, page);

    if (!force) {
      const cachedData = rankingCache.get(cacheKey);
      if (cachedData) {
        applyRankingData(cachedData, page);
        return;
      }
    }

    dom.rankingListEl.innerHTML = `<div class="py-[18px] text-center text-[var(--text-muted)]">${t("ranking.loading")}</div>`;

    try {
      const data = await fetchRanking(difficulty, {
        page,
        limit: pageSize,
      });

      rankingCache.set(cacheKey, data);
      applyRankingData(data, page);
    } catch (error) {
      rankingPage = 1;
      rankingTotalPages = 1;
      currentRankingItems = [];
      updatePaginationUI();
      dom.rankingListEl.innerHTML = `<div class="py-[18px] text-center text-[var(--text-muted)]">${error.message}</div>`;
    }
  }

  // ====================== 5. 패널 표시/이동 제어 ======================
  /**
   * 랭킹 패널을 열고 현재 난이도 기준 첫 페이지를 조회하는 함수
   */
  function openPanel() {
    if (!dom.difficultyOverlayEl.classList.contains("hidden")) return;

    dom.rankingPanelEl.classList.remove("hidden");
    dom.rankingDifficultyEl.value = String(state.size);
    resetPagination();
    loadRanking(state.size, 1);
  }

  /**
   * 랭킹 패널을 닫는 함수
   */
  function closePanel() {
    dom.rankingPanelEl.classList.add("hidden");
  }

  /**
   * 난이도 선택 변경 시 첫 페이지를 다시 조회하는 함수
   */
  function onDifficultyChange() {
    resetPagination();
    loadRanking(Number(dom.rankingDifficultyEl.value), 1);
  }

  /**
   * 이전 페이지로 이동하는 함수
   */
  function goPrev() {
    if (rankingPage <= 1) return;
    loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage - 1);
  }

  /**
   * 다음 페이지로 이동하는 함수
   */
  function goNext() {
    if (rankingPage >= rankingTotalPages) return;
    loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage + 1);
  }

  /**
   * 현재 페이지를 새로고침하는 함수
   * @returns {Promise<void>}
   */
  function refreshCurrent() {
    rankingCache.clear();
    return loadRanking(Number(dom.rankingDifficultyEl.value), rankingPage, {
      force: true,
    });
  }

  /**
   * 랭킹 패널이 열려 있는지 확인하는 함수
   * @returns {boolean}
   */
  function isOpen() {
    return !dom.rankingPanelEl.classList.contains("hidden");
  }

  // ====================== 6. 종료 패널 연동 ======================
  /**
   * 특정 점수 기준 내 최고 순위를 조회해 종료 패널에 표시하는 함수
   * @param {number} difficulty
   * @param {number|string|null} scoreId
   * @returns {Promise<void>}
   */
  async function loadEndMyRank(difficulty, scoreId) {
    endMyRankStatus = { type: "loading", rank: null };
    renderEndMyRank();

    try {
      const data = await fetchRanking(difficulty, {
        limit: 3,
        scoreId,
      });

      endMyRankStatus =
        data.myRank && Number.isFinite(data.myRank)
          ? { type: "value", rank: data.myRank }
          : { type: "unavailable", rank: null };
      renderEndMyRank();
    } catch (error) {
      endMyRankStatus = { type: "unavailable", rank: null };
      renderEndMyRank();
    }
  }

  /**
   * 현재 언어 기준으로 랭킹 관련 동적 텍스트를 다시 렌더링하는 함수
   */
  function refreshTexts() {
    updatePaginationUI();
    renderRanking(currentRankingItems);
    renderEndMyRank();
  }

  return {
    updatePaginationUI,
    resetPagination,
    loadRanking,
    openPanel,
    closePanel,
    onDifficultyChange,
    goPrev,
    goNext,
    refreshCurrent,
    isOpen,
    loadEndMyRank,
    refreshTexts,
  };
}
