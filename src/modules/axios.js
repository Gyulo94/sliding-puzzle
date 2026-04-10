import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim();

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 15000,
});

export const isAxiosError = axios.isAxiosError;
