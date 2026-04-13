import { api, isAxiosError } from "./axios";
import { t } from "./i18n.js";

// ====================== 1. 공통 에러 메시지 변환 ======================
/**
 * Axios 에러를 사용자 친화적인 메시지로 변환하는 함수
 * @param {unknown} error
 * @param {string} fallbackMessage
 * @returns {string}
 */
function resolveErrorMessage(error, fallbackMessage) {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return t("api.timeout");
    }
    if (!error.response) {
      return t("api.networkError");
    }
    const data = error.response.data;
    if (!data || typeof data !== "object") {
      return t("api.serverError", { status: error.response.status });
    }
    return data.message || fallbackMessage;
  }

  return fallbackMessage;
}

// ====================== 2. 인증 API ======================
/**
 * 로그인/회원가입 요청을 전송하는 함수
 * @param {string} path
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function postAuth(path, payload) {
  try {
    const { data } = await api.post(path, payload);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, t("api.requestFailed")));
  }
}

/**
 * 액세스 토큰으로 내 사용자 정보를 조회하는 함수
 * @param {string} accessToken
 * @returns {Promise<any>}
 */
export async function fetchMe(accessToken) {
  try {
    const { data } = await api.get("/api/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, t("api.authCheckFailed")));
  }
}

// ====================== 3. 점수/랭킹 API ======================
/**
 * 게임 점수 기록을 서버에 저장하는 함수
 * @param {object} payload
 * @returns {Promise<any>}
 */
export async function submitScore(payload) {
  try {
    const { data } = await api.post("/api/scores", payload);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, t("api.saveScoreFailed")));
  }
}

/**
 * 난이도별 랭킹 목록과 메타데이터를 조회하는 함수
 * @param {number} difficulty
 * @param {object|number} [options={}]
 * @returns {Promise<any>}
 */
export async function fetchRanking(difficulty, options = {}) {
  const normalizedOptions =
    typeof options === "number" ? { limit: options } : options;

  const { limit = 10, page = 1, scoreId = null } = normalizedOptions;

  const query = new URLSearchParams({
    difficulty: String(difficulty),
    limit: String(limit),
    page: String(page),
  });

  if (scoreId !== null && scoreId !== undefined) {
    query.set("scoreId", String(scoreId));
  }

  try {
    const { data } = await api.get(`/api/scores?${query.toString()}`);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, t("api.loadRankingFailed")));
  }
}
