export const DIFFICULTY_LABEL = {
  3: "초급",
  4: "중급",
  5: "고급",
};

export const SCORE_RULES = {
  bonusCoefficient: 1200,
  timePenaltyPerSecond: 10,
  movePenaltyPerMove: 16,
  hintPenaltyPerUse: 260,
  dampingDivisor: 12000,
};

export function formatTime(seconds) {
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function getDifficultyBaseScore(size) {
  const baseByDifficulty = {
    3: 10000,
    4: 14000,
    5: 18000,
  };

  return baseByDifficulty[size] || 0;
}

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

export function calculateScore(params) {
  return getScoreBreakdown(params).finalScore;
}
