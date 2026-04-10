export function renderTop5Into(containerEl, items, currentUserId, formatTime) {
  containerEl.innerHTML = "";

  if (!items || items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "ranking-empty";
    empty.textContent = "등록된 기록이 없습니다.";
    containerEl.appendChild(empty);
    return;
  }

  items.slice(0, 5).forEach((row, idx) => {
    const item = document.createElement("div");
    item.className = "ranking-row";
    if (currentUserId && row.user_id === currentUserId) {
      item.classList.add("is-me");
    }

    const rank = document.createElement("div");
    rank.className = "ranking-rank";
    rank.textContent = `#${idx + 1}`;

    const info = document.createElement("div");
    const title = document.createElement("div");
    title.className = "ranking-row-title";
    title.textContent = row.name || row.user_id;

    const meta = document.createElement("div");
    meta.className = "ranking-meta";
    meta.textContent = `시간 ${formatTime(row.time_seconds)} / 이동 ${row.moves} / 힌트 ${row.hints}`;

    const scoreEl = document.createElement("div");
    scoreEl.className = "ranking-row-score";
    scoreEl.textContent = `${row.score}점`;

    info.appendChild(title);
    info.appendChild(meta);
    item.appendChild(rank);
    item.appendChild(info);
    item.appendChild(scoreEl);
    containerEl.appendChild(item);
  });
}
