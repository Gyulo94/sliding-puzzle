const LANGUAGE_STORAGE_KEY = "language";

const LOCALE_BY_LANGUAGE = {
  ko: "ko-KR",
  es: "es-ES",
};

const translations = {
  ko: {
    "app.title": "슬라이딩 퍼즐",
    "language.label": "언어",
    "language.ko": "한국어",
    "language.es": "Español",
    "auth.title": "슬라이딩 퍼즐",
    "auth.subtitle": "로그인 후 게임을 시작하세요",
    "auth.login": "로그인",
    "auth.signup": "회원가입",
    "auth.goSignup": "회원가입",
    "auth.goLogin": "로그인 화면으로",
    "auth.placeholder.id": "아이디",
    "auth.placeholder.name": "이름",
    "auth.placeholder.password": "비밀번호",
    "auth.validation.signupMissing": "아이디, 이름, 비밀번호를 입력해주세요",
    "auth.validation.loginMissing": "아이디와 비밀번호를 입력해주세요",
    "auth.status.processing": "처리 중...",
    "auth.status.loggingIn": "로그인 중...",
    "auth.signupSuccess": "회원가입 완료! 로그인해주세요",
    "difficulty.title": "난이도 선택",
    "difficulty.subtitle": "원하는 난이도로 게임을 시작하세요",
    "difficulty.3": "초급",
    "difficulty.4": "중급",
    "difficulty.5": "고급",
    "difficulty.option": "{label} ({size} x {size})",
    "imageMode.title": "이미지 선택 방식",
    "imageMode.subtitle": "원하는 방식을 선택하세요",
    "imageMode.upload": "이미지 업로드",
    "imageMode.random": "랜덤 이미지 선택",
    "imageMode.chooseDifficultyAgain": "난이도 다시 선택",
    "end.title": "게임 완료",
    "end.myRank.default": "내 순위: -",
    "end.summary.default": "내 점수: 0점",
    "end.field.difficulty": "난이도",
    "end.field.time": "시간",
    "end.field.moves": "이동 횟수",
    "end.field.bonus": "가산점",
    "end.field.penalty": "총 감점",
    "end.field.hints": "힌트 사용",
    "end.field.final": "최종점수",
    "end.selectDifficulty": "난이도 선택",
    "end.viewRanking": "랭킹 보기",
    "end.summary.score": "내 점수: <strong>{score}점</strong>",
    "end.summary.newRecord":
      "<br><span style='color: var(--button-border); font-weight: bold;'>최고 기록을 달성했어요! 축하합니다!</span>",
    "end.summary.tryAgain":
      "<br><span style='color: var(--text-muted);'>조금 더 노력하면 최고 기록을 깰 수 있어요! 화이팅!</span>",
    "end.value.difficulty": "{label} ({size}x{size})",
    "end.value.moves": "{count}회",
    "end.value.bonus": "+{score}점",
    "end.value.penalty": "-{score}점",
    "end.value.hints": "{count}회",
    "end.value.final": "{score}점",
    "end.tooltip.difficulty.title": "난이도 기준점수",
    "end.tooltip.difficulty.label": "- {label} ({size}x{size})",
    "end.tooltip.difficulty.base": "- 기준점수: +{score}점",
    "end.tooltip.time.title": "시간 감점 계산",
    "end.tooltip.time.elapsed": "- 경과시간: {formatted} ({seconds}초)",
    "end.tooltip.time.rate": "- 초당 감점: {score}점",
    "end.tooltip.time.total": "- 시간 감점: {seconds} x {rate} = {score}점",
    "end.tooltip.move.title": "이동 감점 계산",
    "end.tooltip.move.count": "- 이동횟수: {count}회",
    "end.tooltip.move.rate": "- 1회당 감점: {score}점",
    "end.tooltip.move.total": "- 이동 감점: {count} x {rate} = {score}점",
    "end.tooltip.hint.title": "힌트 감점 계산",
    "end.tooltip.hint.count": "- 힌트 사용: {count}회",
    "end.tooltip.hint.rate": "- 1회당 감점: {score}점",
    "end.tooltip.hint.total": "- 힌트 감점: {count} x {rate} = {score}점",
    "end.tooltip.bonus.title": "가산점 계산",
    "end.tooltip.bonus.tiles": "- 타일 수: {size} x {size} = {tiles}",
    "end.tooltip.bonus.coefficient": "- 계수: {value}",
    "end.tooltip.bonus.formula": "- 감쇠식: exp(-총감점 / {value})",
    "end.tooltip.bonus.penalty": "- 총감점: {score}점",
    "end.tooltip.bonus.total":
      "- 가산점: ({tiles} x {coefficient}) x exp(-{penalty} / {divisor}) = {score}점",
    "end.tooltip.penalty.title": "총 감점 계산",
    "end.tooltip.penalty.time": "- 시간 감점: {score}점",
    "end.tooltip.penalty.move": "- 이동 감점: {score}점",
    "end.tooltip.penalty.hint": "- 힌트 감점: {score}점",
    "end.tooltip.penalty.total":
      "- 총 감점: {time} + {move} + {hint} = {score}점",
    "end.tooltip.summary.title": "점수 계산 상세",
    "end.tooltip.summary.base": "- 기준점수: +{score}점",
    "end.tooltip.summary.bonus": "- 가산점: +{score}점",
    "end.tooltip.summary.penalty": "- 총 감점: -{score}점",
    "end.tooltip.summary.total":
      "- 최종점수: {base} + {bonus} - {penalty} = {score}점",
    "ranking.title": "랭킹",
    "ranking.refresh": "새로고침",
    "ranking.scorePanel": "점수패널",
    "ranking.difficulty": "난이도",
    "ranking.prev": "이전",
    "ranking.next": "다음",
    "ranking.loading": "불러오는 중...",
    "ranking.empty": "등록된 기록이 없습니다.",
    "ranking.meta": "시간 {time} / 이동 {moves} / 힌트 {hints}",
    "ranking.score": "{score}점",
    "ranking.myBestRank.loading": "내 최고 순위: <strong>계산 중...</strong>",
    "ranking.myBestRank.value": "내 최고 순위: <strong>{rank}등</strong>",
    "ranking.myBestRank.unavailable":
      "내 최고 순위: <strong>확인 불가</strong>",
    "loading.scoring": "점수 계산 중...",
    "stats.time": "시간",
    "stats.moves": "이동",
    "controls.back": "뒤로가기",
    "controls.theme": "테마 변경",
    "controls.restart": "다시시작",
    "controls.hint": "힌트",
    "game.imageRequired": "이미지 업로드 필요",
    "api.timeout": "요청 시간이 초과됐습니다. 다시 시도해주세요",
    "api.networkError": "서버에 연결할 수 없습니다. 네트워크를 확인해주세요",
    "api.serverError": "서버 오류가 발생했습니다 ({status})",
    "api.requestFailed": "요청 처리에 실패했습니다",
    "api.authCheckFailed": "인증 확인 실패",
    "api.saveScoreFailed": "점수 저장 실패",
    "api.loadRankingFailed": "랭킹 불러오기 실패",
  },
  es: {
    "app.title": "Rompecabezas Deslizante",
    "language.label": "Idioma",
    "language.ko": "한국어",
    "language.es": "Español",
    "auth.title": "Rompecabezas Deslizante",
    "auth.subtitle": "Inicia sesión para comenzar la partida",
    "auth.login": "Iniciar sesión",
    "auth.signup": "Registrarse",
    "auth.goSignup": "Crear cuenta",
    "auth.goLogin": "Volver al inicio de sesión",
    "auth.placeholder.id": "ID de usuario",
    "auth.placeholder.name": "Nombre",
    "auth.placeholder.password": "Contraseña",
    "auth.validation.signupMissing":
      "Introduce el ID, el nombre y la contraseña",
    "auth.validation.loginMissing": "Introduce el ID y la contraseña",
    "auth.status.processing": "Procesando...",
    "auth.status.loggingIn": "Iniciando sesión...",
    "auth.signupSuccess": "Registro completado. Inicia sesión.",
    "difficulty.title": "Selecciona la dificultad",
    "difficulty.subtitle": "Elige la dificultad con la que quieres jugar",
    "difficulty.3": "Fácil",
    "difficulty.4": "Media",
    "difficulty.5": "Difícil",
    "difficulty.option": "{label} ({size} x {size})",
    "imageMode.title": "Selecciona la imagen",
    "imageMode.subtitle": "Elige cómo quieres preparar la imagen",
    "imageMode.upload": "Subir imagen",
    "imageMode.random": "Elegir imagen aleatoria",
    "imageMode.chooseDifficultyAgain": "Volver a elegir dificultad",
    "end.title": "Partida completada",
    "end.myRank.default": "Mi puesto: -",
    "end.summary.default": "Mi puntuación: 0 pts",
    "end.field.difficulty": "Dificultad",
    "end.field.time": "Tiempo",
    "end.field.moves": "Movimientos",
    "end.field.bonus": "Bonificación",
    "end.field.penalty": "Penalización total",
    "end.field.hints": "Pistas usadas",
    "end.field.final": "Puntuación final",
    "end.selectDifficulty": "Elegir dificultad",
    "end.viewRanking": "Ver ranking",
    "end.summary.score": "Mi puntuación: <strong>{score} pts</strong>",
    "end.summary.newRecord":
      "<br><span style='color: var(--button-border); font-weight: bold;'>¡Nuevo récord! Enhorabuena.</span>",
    "end.summary.tryAgain":
      "<br><span style='color: var(--text-muted);'>Con un poco más puedes superar tu mejor marca.</span>",
    "end.value.difficulty": "{label} ({size}x{size})",
    "end.value.moves": "{count} movs",
    "end.value.bonus": "+{score} pts",
    "end.value.penalty": "-{score} pts",
    "end.value.hints": "{count} pistas",
    "end.value.final": "{score} pts",
    "end.tooltip.difficulty.title": "Puntuación base por dificultad",
    "end.tooltip.difficulty.label": "- {label} ({size}x{size})",
    "end.tooltip.difficulty.base": "- Base: +{score} pts",
    "end.tooltip.time.title": "Cálculo de penalización por tiempo",
    "end.tooltip.time.elapsed":
      "- Tiempo transcurrido: {formatted} ({seconds} s)",
    "end.tooltip.time.rate": "- Penalización por segundo: {score} pts",
    "end.tooltip.time.total":
      "- Penalización por tiempo: {seconds} x {rate} = {score} pts",
    "end.tooltip.move.title": "Cálculo de penalización por movimientos",
    "end.tooltip.move.count": "- Movimientos: {count}",
    "end.tooltip.move.rate": "- Penalización por movimiento: {score} pts",
    "end.tooltip.move.total":
      "- Penalización por movimientos: {count} x {rate} = {score} pts",
    "end.tooltip.hint.title": "Cálculo de penalización por pistas",
    "end.tooltip.hint.count": "- Pistas usadas: {count}",
    "end.tooltip.hint.rate": "- Penalización por pista: {score} pts",
    "end.tooltip.hint.total":
      "- Penalización por pistas: {count} x {rate} = {score} pts",
    "end.tooltip.bonus.title": "Cálculo de bonificación",
    "end.tooltip.bonus.tiles": "- Número de fichas: {size} x {size} = {tiles}",
    "end.tooltip.bonus.coefficient": "- Coeficiente: {value}",
    "end.tooltip.bonus.formula":
      "- Atenuación: exp(-penalización total / {value})",
    "end.tooltip.bonus.penalty": "- Penalización total: {score} pts",
    "end.tooltip.bonus.total":
      "- Bonificación: ({tiles} x {coefficient}) x exp(-{penalty} / {divisor}) = {score} pts",
    "end.tooltip.penalty.title": "Cálculo de penalización total",
    "end.tooltip.penalty.time": "- Penalización por tiempo: {score} pts",
    "end.tooltip.penalty.move": "- Penalización por movimientos: {score} pts",
    "end.tooltip.penalty.hint": "- Penalización por pistas: {score} pts",
    "end.tooltip.penalty.total":
      "- Penalización total: {time} + {move} + {hint} = {score} pts",
    "end.tooltip.summary.title": "Detalle del cálculo de puntuación",
    "end.tooltip.summary.base": "- Base: +{score} pts",
    "end.tooltip.summary.bonus": "- Bonificación: +{score} pts",
    "end.tooltip.summary.penalty": "- Penalización total: -{score} pts",
    "end.tooltip.summary.total":
      "- Puntuación final: {base} + {bonus} - {penalty} = {score} pts",
    "ranking.title": "Ranking",
    "ranking.refresh": "Actualizar",
    "ranking.scorePanel": "Panel de puntuación",
    "ranking.difficulty": "Dificultad",
    "ranking.prev": "Anterior",
    "ranking.next": "Siguiente",
    "ranking.loading": "Cargando...",
    "ranking.empty": "No hay registros todavía.",
    "ranking.meta": "Tiempo {time} / Movimientos {moves} / Pistas {hints}",
    "ranking.score": "{score} pts",
    "ranking.myBestRank.loading":
      "Mi mejor puesto: <strong>Calculando...</strong>",
    "ranking.myBestRank.value": "Mi mejor puesto: <strong>{rank}</strong>",
    "ranking.myBestRank.unavailable":
      "Mi mejor puesto: <strong>No disponible</strong>",
    "loading.scoring": "Calculando puntuación...",
    "stats.time": "Tiempo",
    "stats.moves": "Movimientos",
    "controls.back": "Atrás",
    "controls.theme": "Cambiar tema",
    "controls.restart": "Reiniciar",
    "controls.hint": "Pista",
    "game.imageRequired": "Primero debes elegir o subir una imagen",
    "api.timeout": "La solicitud ha tardado demasiado. Inténtalo de nuevo",
    "api.networkError": "No se puede conectar con el servidor. Revisa la red",
    "api.serverError": "Se ha producido un error del servidor ({status})",
    "api.requestFailed": "No se pudo procesar la solicitud",
    "api.authCheckFailed": "No se pudo verificar la autenticación",
    "api.saveScoreFailed": "No se pudo guardar la puntuación",
    "api.loadRankingFailed": "No se pudo cargar el ranking",
  },
};

let currentLanguage = "ko";

function interpolate(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) => {
    if (params[key] === undefined || params[key] === null) return "";
    return String(params[key]);
  });
}

export function isSupportedLanguage(language) {
  return Object.hasOwn(LOCALE_BY_LANGUAGE, language);
}

export function getLanguage() {
  return currentLanguage;
}

export function getLocale() {
  return LOCALE_BY_LANGUAGE[currentLanguage] || LOCALE_BY_LANGUAGE.ko;
}

export function loadSavedLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLanguage(savedLanguage) ? savedLanguage : "ko";
}

export function setLanguage(language) {
  currentLanguage = isSupportedLanguage(language) ? language : "ko";
  localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
}

export function t(key, params = {}) {
  const languageTable = translations[currentLanguage] || translations.ko;
  const fallbackTable = translations.ko;
  const template = languageTable[key] ?? fallbackTable[key] ?? key;
  return interpolate(template, params);
}

export function formatNumber(value) {
  return new Intl.NumberFormat(getLocale()).format(Number(value) || 0);
}

export function getDifficultyLabel(size) {
  return t(`difficulty.${size}`);
}

export function getDifficultyOptionLabel(size) {
  return t("difficulty.option", {
    label: getDifficultyLabel(size),
    size,
  });
}

export function applyStaticTranslations(root = document) {
  document.documentElement.lang = currentLanguage;
  document.title = t("app.title");

  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.setAttribute("title", t(element.dataset.i18nTitle));
  });

  root.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  root.querySelectorAll("[data-i18n-difficulty-option]").forEach((element) => {
    const size = Number(element.dataset.i18nDifficultyOption);
    element.textContent = getDifficultyOptionLabel(size);
  });
}
