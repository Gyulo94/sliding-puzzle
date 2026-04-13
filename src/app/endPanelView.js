import {
  SCORE_RULES,
  formatTime,
  getScoreBreakdown,
  calculateScore,
} from "../modules/scoring.js";
import { formatNumber, getDifficultyLabel, t } from "../modules/i18n.js";

// ====================== 1. 점수 입력 변환 ======================
/**
 * 게임 상태를 점수 계산 입력 객체로 변환하는 함수
 * @param {object} state
 * @returns {{size:number,timeSeconds:number,moves:number,hints:number}}
 */
function buildScoreInputFromState(state) {
  return {
    size: state.size,
    timeSeconds: state.elapsedSeconds,
    moves: state.moveCount,
    hints: state.hintCount,
  };
}

// ====================== 2. 종료 패널 계산/요약 ======================
/**
 * 현재 상태 기준 최종 점수를 계산하는 함수
 * @param {object} state
 * @returns {number}
 */
export function calculateStateScore(state) {
  return calculateScore(buildScoreInputFromState(state));
}

/**
 * 종료 패널 상단 요약 문구를 렌더링하는 함수
 * @param {object} dom
 * @param {number} score
 * @param {boolean} [isNewRecord=false]
 */
export function showEndSummary(dom, score, isNewRecord = false) {
  const scoreText = t("end.summary.score", {
    score: formatNumber(score),
  });
  const messageText = isNewRecord
    ? t("end.summary.newRecord")
    : t("end.summary.tryAgain");

  dom.endSummaryEl.innerHTML = scoreText + messageText;
}

/**
 * 종료 패널의 점수 상세 값과 툴팁을 채우는 함수
 * @param {object} dom
 * @param {object} state
 * @param {number|null} [scoreOverride=null]
 */
export function fillEndScoreDetails(dom, state, scoreOverride = null) {
  const breakdown = getScoreBreakdown(buildScoreInputFromState(state));
  const difficultyLabel = getDifficultyLabel(state.size);

  dom.endDifficultyEl.textContent = t("end.value.difficulty", {
    label: difficultyLabel,
    size: state.size,
  });
  dom.endTimeEl.textContent = formatTime(state.elapsedSeconds);
  dom.endMovePenaltyEl.textContent = t("end.value.moves", {
    count: formatNumber(state.moveCount),
  });
  dom.endBonusScoreEl.textContent = t("end.value.bonus", {
    score: formatNumber(breakdown.bonusScore),
  });
  dom.endPenaltyScoreEl.textContent = t("end.value.penalty", {
    score: formatNumber(breakdown.penaltyScore),
  });
  dom.endHintsEl.textContent = t("end.value.hints", {
    count: formatNumber(state.hintCount),
  });

  const finalScore =
    scoreOverride !== null && Number.isFinite(scoreOverride)
      ? Math.round(scoreOverride)
      : breakdown.finalScore;
  dom.endTotalScoreEl.textContent = t("end.value.final", {
    score: formatNumber(finalScore),
  });

  const difficultyTooltip = [
    t("end.tooltip.difficulty.title"),
    t("end.tooltip.difficulty.label", {
      label: difficultyLabel,
      size: state.size,
    }),
    t("end.tooltip.difficulty.base", {
      score: formatNumber(breakdown.baseScore),
    }),
  ].join("\n");

  const timeTooltip = [
    t("end.tooltip.time.title"),
    t("end.tooltip.time.elapsed", {
      formatted: formatTime(state.elapsedSeconds),
      seconds: formatNumber(state.elapsedSeconds),
    }),
    t("end.tooltip.time.rate", {
      score: formatNumber(SCORE_RULES.timePenaltyPerSecond),
    }),
    t("end.tooltip.time.total", {
      seconds: formatNumber(state.elapsedSeconds),
      rate: formatNumber(SCORE_RULES.timePenaltyPerSecond),
      score: formatNumber(breakdown.timePenaltyScore),
    }),
  ].join("\n");

  const moveTooltip = [
    t("end.tooltip.move.title"),
    t("end.tooltip.move.count", {
      count: formatNumber(state.moveCount),
    }),
    t("end.tooltip.move.rate", {
      score: formatNumber(SCORE_RULES.movePenaltyPerMove),
    }),
    t("end.tooltip.move.total", {
      count: formatNumber(state.moveCount),
      rate: formatNumber(SCORE_RULES.movePenaltyPerMove),
      score: formatNumber(breakdown.movePenaltyScore),
    }),
  ].join("\n");

  const hintTooltip = [
    t("end.tooltip.hint.title"),
    t("end.tooltip.hint.count", {
      count: formatNumber(state.hintCount),
    }),
    t("end.tooltip.hint.rate", {
      score: formatNumber(SCORE_RULES.hintPenaltyPerUse),
    }),
    t("end.tooltip.hint.total", {
      count: formatNumber(state.hintCount),
      rate: formatNumber(SCORE_RULES.hintPenaltyPerUse),
      score: formatNumber(breakdown.hintPenaltyScore),
    }),
  ].join("\n");

  const bonusTooltip = [
    t("end.tooltip.bonus.title"),
    t("end.tooltip.bonus.tiles", {
      size: state.size,
      tiles: formatNumber(state.size * state.size),
    }),
    t("end.tooltip.bonus.coefficient", {
      value: formatNumber(SCORE_RULES.bonusCoefficient),
    }),
    t("end.tooltip.bonus.formula", {
      value: formatNumber(SCORE_RULES.dampingDivisor),
    }),
    t("end.tooltip.bonus.penalty", {
      score: formatNumber(breakdown.penaltyScore),
    }),
    t("end.tooltip.bonus.total", {
      tiles: formatNumber(state.size * state.size),
      coefficient: formatNumber(SCORE_RULES.bonusCoefficient),
      penalty: formatNumber(breakdown.penaltyScore),
      divisor: formatNumber(SCORE_RULES.dampingDivisor),
      score: formatNumber(breakdown.bonusScore),
    }),
  ].join("\n");

  const penaltyTooltip = [
    t("end.tooltip.penalty.title"),
    t("end.tooltip.penalty.time", {
      score: formatNumber(breakdown.timePenaltyScore),
    }),
    t("end.tooltip.penalty.move", {
      score: formatNumber(breakdown.movePenaltyScore),
    }),
    t("end.tooltip.penalty.hint", {
      score: formatNumber(breakdown.hintPenaltyScore),
    }),
    t("end.tooltip.penalty.total", {
      time: formatNumber(breakdown.timePenaltyScore),
      move: formatNumber(breakdown.movePenaltyScore),
      hint: formatNumber(breakdown.hintPenaltyScore),
      score: formatNumber(breakdown.penaltyScore),
    }),
  ].join("\n");

  const tooltipText = [
    t("end.tooltip.summary.title"),
    t("end.tooltip.summary.base", {
      score: formatNumber(breakdown.baseScore),
    }),
    t("end.tooltip.summary.bonus", {
      score: formatNumber(breakdown.bonusScore),
    }),
    t("end.tooltip.summary.penalty", {
      score: formatNumber(breakdown.penaltyScore),
    }),
    t("end.tooltip.summary.total", {
      base: formatNumber(breakdown.baseScore),
      bonus: formatNumber(breakdown.bonusScore),
      penalty: formatNumber(breakdown.penaltyScore),
      score: formatNumber(finalScore),
    }),
  ].join("\n");

  applyCardTooltip(dom.endDifficultyEl, difficultyTooltip);
  applyCardTooltip(dom.endTimeEl, timeTooltip);
  applyCardTooltip(dom.endMovePenaltyEl, moveTooltip);
  applyCardTooltip(dom.endHintsEl, hintTooltip);
  applyCardTooltip(dom.endBonusScoreEl, bonusTooltip);
  applyCardTooltip(dom.endPenaltyScoreEl, penaltyTooltip);
  applyCardTooltip(dom.endTotalScoreEl, tooltipText);
}

// ====================== 3. 공통 툴팁 적용 ======================
/**
 * 점수 카드/값 엘리먼트에 접근성 라벨과 title 툴팁을 적용하는 함수
 * @param {HTMLElement} valueEl
 * @param {string} text
 */
function applyCardTooltip(valueEl, text) {
  const cardEl = valueEl.closest(".end-score-item");
  if (cardEl) {
    cardEl.title = text;
    cardEl.setAttribute("aria-label", text);
  }

  valueEl.removeAttribute("title");
  valueEl.setAttribute("aria-label", text);
}
