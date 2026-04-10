export const THEMES = [
  {
    gradient: ["from-amber-50", "via-orange-50", "to-rose-50"],
    vars: {
      "--app-bg-start": "#fffbeb",
      "--app-bg-mid": "#fff7ed",
      "--app-bg-end": "#fff1f2",
      "--panel-bg": "rgba(255, 255, 255, 0.82)",
      "--panel-border": "#fcd6aa",
      "--panel-shadow": "0 10px 30px rgba(120, 53, 15, 0.12)",
      "--subcard-bg": "#fffbeb",
      "--subcard-border": "#fcd6aa",
      "--text-muted": "#b45309",
      "--text-strong": "#7c2d12",
      "--board-bg": "#9f561c",
      "--board-border": "#a85a1e",
      "--button-border": "#cf9b59",
      "--button-bg-start": "#ecd9b6",
      "--button-bg-end": "#e5cda0",
      "--button-text": "#6f4527",
      "--button-shadow": "0 8px 14px rgba(122, 76, 31, 0.2)",
      "--hint-ring": "rgba(251, 191, 36, 0.35)",
    },
  },
  {
    gradient: ["from-slate-50", "via-sky-50", "to-blue-100"],
    vars: {
      "--app-bg-start": "#f8fafc",
      "--app-bg-mid": "#f0f9ff",
      "--app-bg-end": "#dbeafe",
      "--panel-bg": "rgba(240, 249, 255, 0.85)",
      "--panel-border": "#b6ddff",
      "--panel-shadow": "0 10px 30px rgba(2, 132, 199, 0.14)",
      "--subcard-bg": "#eaf6ff",
      "--subcard-border": "#b6ddff",
      "--text-muted": "#0369a1",
      "--text-strong": "#0c4a6e",
      "--board-bg": "#1d4ed8",
      "--board-border": "#1e40af",
      "--button-border": "#60a5fa",
      "--button-bg-start": "#dbeafe",
      "--button-bg-end": "#bfdbfe",
      "--button-text": "#1e3a8a",
      "--button-shadow": "0 8px 14px rgba(29, 78, 216, 0.22)",
      "--hint-ring": "rgba(56, 189, 248, 0.4)",
    },
  },
  {
    gradient: ["from-emerald-50", "via-lime-50", "to-teal-100"],
    vars: {
      "--app-bg-start": "#ecfdf5",
      "--app-bg-mid": "#f7fee7",
      "--app-bg-end": "#ccfbf1",
      "--panel-bg": "rgba(236, 253, 245, 0.84)",
      "--panel-border": "#9ee6c6",
      "--panel-shadow": "0 10px 30px rgba(5, 150, 105, 0.15)",
      "--subcard-bg": "#ecfdf5",
      "--subcard-border": "#9ee6c6",
      "--text-muted": "#047857",
      "--text-strong": "#065f46",
      "--board-bg": "#0f766e",
      "--board-border": "#115e59",
      "--button-border": "#34d399",
      "--button-bg-start": "#d1fae5",
      "--button-bg-end": "#a7f3d0",
      "--button-text": "#065f46",
      "--button-shadow": "0 8px 14px rgba(5, 150, 105, 0.22)",
      "--hint-ring": "rgba(16, 185, 129, 0.42)",
    },
  },
  {
    gradient: ["from-fuchsia-50", "via-pink-50", "to-rose-100"],
    vars: {
      "--app-bg-start": "#fdf4ff",
      "--app-bg-mid": "#fdf2f8",
      "--app-bg-end": "#ffe4e6",
      "--panel-bg": "rgba(253, 242, 248, 0.85)",
      "--panel-border": "#f5b7d8",
      "--panel-shadow": "0 10px 30px rgba(190, 24, 93, 0.14)",
      "--subcard-bg": "#fdf2f8",
      "--subcard-border": "#f5b7d8",
      "--text-muted": "#be185d",
      "--text-strong": "#9d174d",
      "--board-bg": "#be185d",
      "--board-border": "#9d174d",
      "--button-border": "#f472b6",
      "--button-bg-start": "#fce7f3",
      "--button-bg-end": "#fbcfe8",
      "--button-text": "#9d174d",
      "--button-shadow": "0 8px 14px rgba(190, 24, 93, 0.22)",
      "--hint-ring": "rgba(244, 114, 182, 0.44)",
    },
  },
];

export function applyTheme(bodyEl, index) {
  const gradients = THEMES.flatMap((theme) => theme.gradient);
  gradients.forEach((cls) => bodyEl.classList.remove(cls));

  const selectedTheme = THEMES[index];
  selectedTheme.gradient.forEach((cls) => bodyEl.classList.add(cls));

  Object.entries(selectedTheme.vars).forEach(([key, value]) => {
    bodyEl.style.setProperty(key, value);
  });
}

export function getNextThemeIndex(currentIndex) {
  return (currentIndex + 1) % THEMES.length;
}
