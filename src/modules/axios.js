import axios from "axios";

// ====================== 1. API 기본 URL ======================
/**
 * 환경 변수에서 API 베이스 URL을 읽어 공백을 제거한 값
 * 비어 있으면 동일 오리진 요청을 사용한다.
 */
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();

// ====================== 2. Axios 인스턴스 ======================
/**
 * API 호출에 사용하는 공통 Axios 인스턴스
 */
export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 15000,
});

// ====================== 3. Axios 에러 판별 ======================
/**
 * 전달된 값이 Axios 에러인지 판별하는 유틸 함수
 */
export const isAxiosError = axios.isAxiosError;
