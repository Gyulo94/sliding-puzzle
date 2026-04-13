import { postAuth, fetchMe } from "../modules/api.js";
import { t } from "../modules/i18n.js";

// ====================== 1. 인증 컨트롤러 생성 ======================
export function createAuthController({
  dom,
  state,
  accessTokenStorageKey,
  onAuthenticated,
}) {
  // ====================== 2. 인증 UI 상태 ======================
  /**
   * 인증 상태 메시지를 표시하는 함수
   * @param {string} text
   * @param {boolean} [isError=false]
   */
  function setAuthMessage(text, isError = false) {
    dom.authMessageEl.textContent = text;
    dom.authMessageEl.style.color = isError ? "#b91c1c" : "var(--text-muted)";
  }

  /**
   * 로그인/회원가입 폼 표시 모드를 전환하는 함수
   * @param {"login"|"signup"} mode
   */
  function setAuthMode(mode) {
    const loginMode = mode === "login";
    dom.loginFormEl.classList.toggle("hidden", !loginMode);
    dom.signupFormEl.classList.toggle("hidden", loginMode);
    setAuthMessage("");
  }

  /**
   * 인증 완료 상태로 앱 잠금을 해제하는 함수
   */
  function unlockApp() {
    dom.authOverlayEl.classList.add("hidden");
    dom.appRootEl.classList.remove("app-locked");
  }

  /**
   * 인증 필요 상태로 앱을 잠그는 함수
   */
  function lockApp() {
    dom.authOverlayEl.classList.remove("hidden");
    dom.appRootEl.classList.add("app-locked");
  }

  // ====================== 3. 인증 복구/이벤트 ======================
  /**
   * 저장된 토큰으로 자동 로그인을 복구하는 함수
   * @returns {Promise<boolean>}
   */
  async function restoreLoginFromToken() {
    const accessToken = localStorage.getItem(accessTokenStorageKey);
    if (!accessToken) return false;

    try {
      const me = await fetchMe(accessToken);
      state.currentUser = {
        id: me.id,
        name: me.name || "",
      };

      unlockApp();
      onAuthenticated();
      setAuthMessage("");
      return true;
    } catch (error) {
      localStorage.removeItem(accessTokenStorageKey);
      return false;
    }
  }

  /**
   * 인증 관련 UI 이벤트를 바인딩하는 함수
   */
  function bindAuthEvents() {
    dom.goSignupEl.addEventListener("click", () => setAuthMode("signup"));
    dom.goLoginEl.addEventListener("click", () => setAuthMode("login"));

    dom.signupFormEl.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = dom.signupIdEl.value.trim();
      const name = dom.signupNameEl.value.trim();
      const pw = dom.signupPwEl.value.trim();
      if (!id || !name || !pw) {
        setAuthMessage(t("auth.validation.signupMissing"), true);
        return;
      }

      setAuthMessage(t("auth.status.processing"));
      postAuth("/api/signup", { id, name, password: pw })
        .then((data) => {
          dom.signupIdEl.value = "";
          dom.signupNameEl.value = "";
          dom.signupPwEl.value = "";
          setAuthMode("login");
          setAuthMessage(data.message || t("auth.signupSuccess"));
        })
        .catch((error) => {
          setAuthMessage(error.message, true);
        });
    });

    dom.loginFormEl.addEventListener("submit", (event) => {
      event.preventDefault();

      const id = dom.loginIdEl.value.trim();
      const pw = dom.loginPwEl.value.trim();

      if (!id || !pw) {
        setAuthMessage(t("auth.validation.loginMissing"), true);
        return;
      }

      setAuthMessage(t("auth.status.loggingIn"));
      postAuth("/api/login", { id, password: pw })
        .then((data) => {
          if (data.accessToken) {
            localStorage.setItem(accessTokenStorageKey, data.accessToken);
          }

          state.currentUser = {
            id: data.id || id,
            name: data.name || "",
          };

          setAuthMessage("");
          unlockApp();
          onAuthenticated();
        })
        .catch((error) => {
          setAuthMessage(error.message, true);
        });
    });
  }

  /**
   * 인증 UI 기본 상태를 초기화하는 함수
   */
  function initialize() {
    setAuthMode("login");
    lockApp();
  }

  return {
    initialize,
    bindAuthEvents,
    restoreLoginFromToken,
  };
}
