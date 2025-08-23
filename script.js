(async function () {
  // Theme
  const toggleBtn = document.getElementById("toggleTheme");
  const stored = localStorage.getItem("theme");
  if (stored) document.documentElement.dataset.theme = stored;
  toggleBtn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // Copy link
  document.getElementById("copyLink").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    } catch (e) {
      alert("Could not copy link. Copy from the address bar.");
    }
  });

  // Load data
  const res = await fetch("data/champions.json", { cache: "no-store" });
  const data = await res.json();

  // League name
  const league = data.league || "League Trophy";
  document.getElementById("leagueName").textContent = league;

  // Seasons
  let seasons = Array.isArray(data.seasons) ? data.seasons.slice() : [];
  const sortSelect = document.getElementById("sort");
  const searchInput = document.getElementById("search");

  function normalized(str) {
    return (str || "").toString().toLowerCase();
  }

  function applyFilters() {
    const q = normalized(searchInput.value);
    let filtered = seasons.filter(s => {
      const blob = [s.year, s.champion, s.team, s.note, ...(s.top3 || []).map(p => p.name + " " + (p.team || ""))].join(" ");
      return normalized(blob).includes(q);
    });
    filtered.sort((a,b) => sortSelect.value === "asc" ? (a.year - b.year) : (b.year - a.year));
    return filtered;
  }

  // Render grid
  const grid = document.getElementById("trophyGrid");
  function renderGrid() {
    grid.innerHTML = "";
    const rows = applyFilters();
    for (const s of rows) {
      const btn = document.createElement("button");
      btn.className = "trophy-tile";
      btn.setAttribute("role","listitem");
      btn.innerHTML = `
        <svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <linearGradient id="gold" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#ffd76a"/>
              <stop offset="50%" stop-color="#f7b500"/>
              <stop offset="100%" stop-color="#c88700"/>
            </linearGradient>
          </defs>
          <g>
            <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a" />
            <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a" />
            <path d="M100,135 c-18,0 -25,-10 -25,-28 V70 h50 v37 c0,18 -7,28 -25,28 z" fill="url(#gold)"/>
            <path d="M60,70 a25,25 0 0 1 -35,-20 l0,-10 h25 v10 a10,10 0 0 0 10,10 z" fill="url(#gold)"/>
            <path d="M140,70 a25,25 0 0 0 35,-20 l0,-10 h-25 v10 a10,10 0 0 1 -10,10 z" fill="url(#gold)"/>
            <rect x="90" y="135" width="20" height="10" fill="url(#gold)" />
          </g>
        </svg>
        <div class="year">${s.year ?? "—"}</div>
        <div class="small">${s.champion ? "Champion: " + s.champion : ""}</div>
      `;
      btn.addEventListener("click", () => openModal(s));
      grid.appendChild(btn);
    }
  }

  // Hall of champions
  const list = document.getElementById("championList");
  function renderHall() {
    list.innerHTML = "";
    const seasonsSorted = seasons.slice().sort((a,b) => b.year - a.year);
    seasonsSorted.forEach(s => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="champ-year">${s.year ?? "—"}</div>
        <div class="champ-name">${s.champion ?? "Unknown"}${s.team ? " — " + s.team : ""}</div>
        ${s.note ? `<div class="small">${s.note}</div>` : ""}
      `;
      list.appendChild(li);
    });
  }

  // Modal
  function getCountsFromSeasons(seasons) {
  const counts = {};
  seasons.forEach(s => {
    const podium = (Array.isArray(s.top3) && s.top3.length)
      ? s.top3
      : (s.champion ? [{ place: 1, name: s.champion }] : []);

    podium.forEach(p => {
      const name = (p.name || "").trim();
      if (!name) return;
      if (!counts[name]) counts[name] = { first: 0, second: 0, third: 0, total: 0 };
      if (p.place === 1) counts[name].first++;
      else if (p.place === 2) counts[name].second++;
      else if (p.place === 3) counts[name].third++;
    });
  });
  Object.values(counts).forEach(c => { c.total = c.first + c.second + c.third; });
  return counts;
}

function renderLeaderboard(seasons) {
  const body = document.getElementById("leaderBody");
  if (!body) return;

  const search = document.getElementById("lbSearch");
  const q = (search?.value || "").toLowerCase();

  const counts = getCountsFromSeasons(seasons);
  const rows = Object.entries(counts).map(([name, c]) => ({ name, ...c }));

  rows.sort((a, b) =>
    b.first - a.first ||
    b.second - a.second ||
    b.third - a.third ||
    a.name.localeCompare(b.name)
  );

  body.innerHTML = "";
  rows
    .filter(r => r.name.toLowerCase().includes(q))
    .forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${r.name}</td>
        <td>${r.first}</td>
        <td>${r.second}</td>
        <td>${r.third}</td>
        <td>${r.total}</td>
      `;
      body.appendChild(tr);
    });
}

  const modal = document.getElementById("modal");
  const backdrop = modal.querySelector(".modal-backdrop");
  const closeBtns = modal.querySelectorAll("[data-close]");
  const titleEl = document.getElementById("modalTitle");
  const subtitleEl = document.getElementById("modalSubtitle");
  const podiumEl = document.getElementById("podium");
  const notesEl = document.getElementById("notes");
  let lastFocus = null;

  function openModal(season) {
    lastFocus = document.activeElement;
    titleEl.textContent = `Season ${season.year}`;
    subtitleEl.textContent = season.champion ? `Champion: ${season.champion}${season.team ? " — " + season.team : ""}` : "";
    podiumEl.innerHTML = "";
    const top3 = (season.top3 || []).slice().sort((a,b) => a.place - b.place);
    for (const p of top3) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="place">#${p.place}</span><span class="name">${p.name}</span>${p.team ? ` <span class="team">(${p.team})</span>` : ""}`;
      podiumEl.appendChild(li);
    }
    notesEl.textContent = season.note || "";
    modal.setAttribute("aria-hidden", "false");
    // focus trap: focus close button
    modal.querySelector(".modal-close").focus();
    document.addEventListener("keydown", onEsc);
  }

  function closeModal() {
    modal.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", onEsc);
    if (lastFocus) lastFocus.focus();
  }

  function onEsc(e) {
    if (e.key === "Escape") closeModal();
  }
  backdrop.addEventListener("click", closeModal);
  closeBtns.forEach(b => b.addEventListener("click", closeModal));

  // Wire filters
  sortSelect.addEventListener("change", () => { renderGrid(); });
  searchInput.addEventListener("input", () => { renderGrid(); });
document.getElementById("lbSearch")?.addEventListener("input", () => renderLeaderboard(seasons));

  // Initial render
  renderGrid();
  renderLeaderboard(seasons);

})();
