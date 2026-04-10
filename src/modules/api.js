import { api, isAxiosError } from "./axios";

function resolveErrorMessage(error, fallbackMessage) {
  if (isAxiosError(error)) {
    return error.response?.data?.message || fallbackMessage;
  }

  return fallbackMessage;
}

async function postJson(path, payload) {
  try {
    const { data } = await api.post(path, payload);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "요청 처리에 실패했습니다"));
  }
}

export function postAuth(path, payload) {
  return postJson(path, payload);
}

export async function fetchMe(accessToken) {
  try {
    const { data } = await api.get("/api/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "인증 확인 실패"));
  }
}

export async function submitScore(payload) {
  try {
    const { data } = await api.post("/api/scores", payload);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "점수 저장 실패"));
  }
}

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
    throw new Error(resolveErrorMessage(error, "랭킹 불러오기 실패"));
  }
}
