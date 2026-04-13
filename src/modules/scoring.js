// ====================== 1. 난이도/점수 상수 ======================
/**
 * 퍼즐 크기별 난이도 라벨 매핑
 */
export const DIFFICULTY_LABEL = {
  3: "초급",
  4: "중급",
  5: "고급",
};

/**
 * 점수 계산에 사용하는 공통 규칙 상수
 */
export const SCORE_RULES = {
  bonusCoefficient: 1200,
  timePenaltyPerSecond: 10,
  movePenaltyPerMove: 16,
  hintPenaltyPerUse: 260,
  dampingDivisor: 12000,
};

// ====================== 2. 점수 계산 유틸 ======================
/**
 * 초 단위 시간을 MM:SS 문자열로 포맷하는 함수
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/**
 * 난이도(보드 크기)별 기준 점수를 반환하는 함수
 * @param {number} size
 * @returns {number}
 */
export function getDifficultyBaseScore(size) {
  const baseByDifficulty = {
    3: 10000,
    4: 14000,
    5: 18000,
  };

  return baseByDifficulty[size] || 0;
}

/**
 * 점수 계산 상세(기준점수/감점/가산점/최종점수)를 반환하는 함수
 * @param {{size:number,timeSeconds:number,moves:number,hints:number}} params
 * @returns {{
 *   baseScore:number,
 *   timePenaltyScore:number,
 *   movePenaltyScore:number,
 *   hintPenaltyScore:number,
 *   bonusScore:number,
 *   penaltyScore:number,
 *   finalScore:number
 * }}
 */
export function getScoreBreakdown({
  size: boardSize,
  timeSeconds,
  moves,
  hints,
}) {
  const baseScore = getDifficultyBaseScore(boardSize);
  if (!baseScore) {
    return {
      baseScore: 0,
      timePenaltyScore: 0,
      movePenaltyScore: 0,
      hintPenaltyScore: 0,
      bonusScore: 0,
      penaltyScore: 0,
      finalScore: 0,
    };
  }

  const safeTime = Math.max(0, Number(timeSeconds) || 0);
  const safeMoves = Math.max(0, Number(moves) || 0);
  const safeHints = Math.max(0, Number(hints) || 0);

  const timePenaltyScore = Math.round(
    safeTime * SCORE_RULES.timePenaltyPerSecond,
  );
  const movePenaltyScore = Math.round(
    safeMoves * SCORE_RULES.movePenaltyPerMove,
  );
  const hintPenaltyScore = Math.round(
    safeHints * SCORE_RULES.hintPenaltyPerUse,
  );
  const penalty = timePenaltyScore + movePenaltyScore + hintPenaltyScore;
  const damping = Math.exp(-penalty / SCORE_RULES.dampingDivisor);
  const bonus = Math.round(
    boardSize * boardSize * SCORE_RULES.bonusCoefficient * damping,
  );

  return {
    baseScore,
    timePenaltyScore,
    movePenaltyScore,
    hintPenaltyScore,
    bonusScore: Math.max(0, bonus),
    penaltyScore: Math.max(0, Math.round(penalty)),
    finalScore: Math.max(0, Math.round(baseScore + bonus - penalty)),
  };
}

/**
 * 점수 계산 상세에서 최종점수만 반환하는 함수
 * @param {{size:number,timeSeconds:number,moves:number,hints:number}} params
 * @returns {number}
 */
export function calculateScore(params) {
  return getScoreBreakdown(params).finalScore;
}
