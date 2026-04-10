export function renderTop5Into(containerEl, items, currentUserId, formatTime) {
  containerEl.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "py-[18px] text-center text-[var(--text-muted)]";
    empty.textContent = "등록된 기록이 없습니다.";
    containerEl.appendChild(empty);
    return;
  }

  items.slice(0, 5).forEach((row, idx) => {
    const item = document.createElement("div");
    item.className =
      "grid grid-cols-[34px_1fr_auto] items-center gap-[10px] rounded-xl border border-[var(--subcard-border)] bg-[var(--subcard-bg)] px-3 py-[10px]";
    if (currentUserId && row.user_id === currentUserId) {
      item.classList.add(
        "border-[var(--button-border)]",
        "shadow-[0_0_0_2px_color-mix(in_oklab,var(--button-border)_35%,transparent)]",
      );
    }

    const rank = document.createElement("div");
    rank.className = "text-[15px] font-black text-[var(--text-muted)]";
    rank.textContent = `#${idx + 1}`;

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "text-[var(--text-strong)]";
    title.textContent = row.name || row.user_id;

    const meta = document.createElement("div");
    meta.className = "mt-[2px] text-xs text-[var(--text-muted)]";
    meta.textContent = `시간 ${formatTime(row.time_seconds)} / 이동 ${row.moves} / 힌트 ${row.hints}`;

    const scoreEl = document.createElement("div");
    scoreEl.className = "text-[var(--text-strong)]";
    scoreEl.textContent = `${row.score}점`;

    info.appendChild(title);
    info.appendChild(meta);
    item.appendChild(rank);
    item.appendChild(info);
    item.appendChild(scoreEl);
    containerEl.appendChild(item);
  });
}
