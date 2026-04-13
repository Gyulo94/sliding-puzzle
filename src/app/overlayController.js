// ====================== 1. 오버레이 컨트롤러 생성 ======================
export function createOverlayController({ dom }) {
  // ====================== 2. 공통 표시 제어 ======================
  /**
   * 오버레이 요소의 표시 상태를 토글하는 함수
   * @param {HTMLElement} overlayEl
   * @param {boolean} isVisible
   */
  function setOverlayVisible(overlayEl, isVisible) {
    overlayEl.classList.toggle("hidden", !isVisible);
  }

  // ====================== 3. 난이도 오버레이 ======================
  /**
   * 난이도 선택 오버레이를 여는 함수
   */
  function openDifficultyOverlay() {
    setOverlayVisible(dom.difficultyOverlayEl, true);
  }

  /**
   * 난이도 선택 오버레이를 닫는 함수
   */
  function closeDifficultyOverlay() {
    setOverlayVisible(dom.difficultyOverlayEl, false);
  }

  // ====================== 4. 이미지 선택 오버레이 ======================
  /**
   * 이미지 선택 오버레이를 여는 함수
   */
  function openImageModeOverlay() {
    setOverlayVisible(dom.imageModeOverlayEl, true);
  }

  /**
   * 이미지 선택 오버레이를 닫는 함수
   */
  function closeImageModeOverlay() {
    setOverlayVisible(dom.imageModeOverlayEl, false);
  }

  // ====================== 5. 게임 종료 오버레이 ======================
  /**
   * 게임 종료 오버레이를 여는 함수
   */
  function openGameEndOverlay() {
    setOverlayVisible(dom.gameEndOverlayEl, true);
  }

  /**
   * 게임 종료 오버레이를 닫는 함수
   */
  function closeGameEndOverlay() {
    setOverlayVisible(dom.gameEndOverlayEl, false);
  }

  return {
    openDifficultyOverlay,
    closeDifficultyOverlay,
    openImageModeOverlay,
    closeImageModeOverlay,
    openGameEndOverlay,
    closeGameEndOverlay,
  };
}
