import { api, isAxiosError } from "./axios";

function resolveErrorMessage(error, fallbackMessage) {
  if (isAxiosError(error)) {
    if (error.code === "ECONNABORTED") {
      return "요청 시간이 초과됐습니다. 다시 시도해주세요";
    }
    if (!error.response) {
      return "서버에 연결할 수 없습니다. 네트워크를 확인해주세요";
    }
    const data = error.response.data;
    if (!data || typeof data !== "object") {
      return `서버 오류가 발생했습니다 (${error.response.status})`;
    }
    return data.message || fallbackMessage;
  }

  return fallbackMessage;
}

export async function postAuth(path, payload) {
  try {
    const { data } = await api.post(path, payload);
    return data ?? {};
  } catch (error) {
    throw new Error(resolveErrorMessage(error, "요청 처리에 실패했습니다"));
  }
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
