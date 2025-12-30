(async function () {
  // ---------- Theme toggle ----------
  const toggleBtn = document.getElementById("toggleTheme");
  const stored = localStorage.getItem("theme");
  if (stored) document.documentElement.dataset.theme = stored;
  toggleBtn?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // ---------- Load data ----------
  let data, seasons = [];
  try {
    const res = await fetch("data/champions.json", { cache: "no-store" });
    data = await res.json();
    seasons = Array.isArray(data.seasons) ? data.seasons.slice() : []; // expects { league?, seasons: [...] }
  } catch (e) {
    console.error("Failed to load champions.json", e);
    seasons = [];
  }

  // League name
  const league = data?.league || "League Trophy Case";
  const nameEl = document.getElementById("leagueName");
  if (nameEl) nameEl.textContent = league;

  // ---------- Controls ----------
  const sortSelect = document.getElementById("sort");
  const searchInput = document.getElementById("search");
  function normalized(str){ return (str||"").toString().toLowerCase(); }

  // ---------- Trophy styles ----------
  const DEFAULT_STYLES = ["classic","shield","star","laurel","crown","football","ring","rocket"];
  function grad(id, stops) {
    return `
      <defs>
        <linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
          ${stops.map(s => `<stop offset="${s.off}%" stop-color="${s.color}"/>`).join("")}
        </linearGradient>
      </defs>
    `;
  }
  function goldStops(){ return [{off:0,color:"#ffd76a"},{off:50,color:"#f7b500"},{off:100,color:"#c88700"}]; }
  function svgForStyle(style, colorHex, key) {
    const gid = `grad-${style}-${key}`;
    const g = grad(gid, goldStops());
    switch ((style||"classic").toLowerCase()) {
      case "shield":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><path d="M100 28 L158 50 V96 c0 40 -36 63 -58 73 -22 -10 -58 -33 -58 -73 V50 Z" fill="url(#${gid})" /></g></svg>`;
      case "star":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><polygon points="100,24 118,70 165,70 127,96 142,142 100,118 58,142 73,96 35,70 82,70" fill="url(#${gid})"/></g></svg>`;
      case "laurel":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><circle cx="100" cy="80" r="34" fill="url(#${gid})"/></g></svg>`;
      case "crown":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><path d="M50,95 L65,55 L95,85 L120,50 L140,85 L165,60 L150,100 Z" fill="url(#${gid})"/></g></svg>`;
      case "football":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><ellipse cx="100" cy="80" rx="34" ry="22" fill="url(#${gid})"/></g></svg>`;
      case "ring":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><ellipse cx="100" cy="85" rx="42" ry="30" fill="#1d1f2a" stroke="url(#${gid})" stroke-width="8"/></g></svg>`;
      case "rocket":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g><path d="M100,40 C120,60 120,95 100,115 C80,95 80,60 100,40 Z" fill="url(#${gid})"/></g></svg>`;
      default: // classic cup
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a" />
          <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a" />
          <path d="M100,135 c-18,0 -25,-10 -25,-28 V70 h50 v37 c0,18 -7,28 -25,28 z" fill="url(#${gid})"/>
          <path d="M60,70 a25,25 0 0 1 -35,-20 v-10 h25 v10 a10,10 0 0 0 10,10 z" fill="url(#${gid})"/>
          <path d="M140,70 a25,25 0 0 0 35,-20 v-10 h-25 v10 a10,10 0 0 1 -10,10 z" fill="url(#${gid})"/>
          <rect x="90" y="135" width="20" height="10" fill="url(#${gid})" />
        </g></svg>`;
    }
  }

  // ---------- Confetti (only fires for 2025) ----------
  function launchConfettiFrom(el) {
    if (!window.confetti || !el) return;
    const r = el.getBoundingClientRect();
    const x = (r.left + r.width/2) / window.innerWidth;
    const y = (r.top + r.height/2) / window.innerHeight;
    const base = { particleCount: 100, spread: 70, startVelocity: 45, gravity: 0.9, ticks: 200, scalar: 0.9, origin: {x,y} };
    confetti({ ...base, angle: 60, colors: ["#ffd76a","#f7b500","#c88700","#ffffff"] });
    confetti({ ...base, angle: 120, colors: ["#ffd76a","#f7b500","#c88700","#ffffff"] });
  }

  // ---------- Filtering ----------
  function applyFilters(list) {
    const q = normalized(searchInput?.value);
    let filtered = list.filter(s => {
      const blob = [
        s.year, s.first, s.second, s.third,
        s.adp1?.player, s.adp1?.team, s.adp1?.pos,
        s.nonQBTop?.player, s.nonQBTop?.team, s.nonQBTop?.pos
      ].join(" ");
      return normalized(blob).includes(q);
    });
    filtered.sort((a,b) => (sortSelect?.value === "asc") ? (a.year - b.year) : (b.year - a.year));
    return filtered;
  }

  // ---------- Grid ----------
  const grid = document.getElementById("trophyGrid");
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    const rows = applyFilters(seasons);
    for (const s of rows) {
      const btn = document.createElement("button");
      btn.className = "trophy-tile";
      const styleKey = s.trophyStyle || DEFAULT_STYLES[s.year % DEFAULT_STYLES.length];
      const graphic = s.trophyImage
        ? `<img class="trophy-img" src="${s.trophyImage}" alt="Trophy ${s.year}">`
        : svgForStyle(styleKey, s.trophyColor, s.year);
      btn.innerHTML = `
        ${graphic}
        <div class="year">${s.year}</div>
        <div class="small">Champion: ${s.first}</div>
      `;
      btn.addEventListener("click", (e) => {
        if (s.year === 2025) launchConfettiFrom(e.currentTarget);
        openModal(s);
      });
      grid.appendChild(btn);
    }
  }

  // ---------- Leaderboard ----------
  function getCountsFromSeasons(list) {
    const counts = {};
    list.forEach(s => {
      [ {place:1,name:s.first}, {place:2,name:s.second}, {place:3,name:s.third} ].forEach(p => {
        const name = (p.name || "").trim();
        if (!name) return;
        if (!counts[name]) counts[name] = { first:0, second:0, third:0, total:0 };
        if (p.place === 1) counts[name].first++;
        if (p.place === 2) counts[name].second++;
        if (p.place === 3) counts[name].third++;
      });
    });
    Object.values(counts).forEach(c => c.total = c.first + c.second + c.third);
    return counts;
  }
  function renderLeaderboard(list) {
    const body = document.getElementById("leaderBody");
    if (!body) return;
    const q = (document.getElementById("lbSearch")?.value || "").toLowerCase();
    const rows = Object.entries(getCountsFromSeasons(list)).map(([name,c]) => ({ name, ...c }));
    rows.sort((a,b) => b.first - a.first || b.second - a.second || b.third - a.third || a.name.localeCompare(b.name));
    body.innerHTML = "";
    rows.filter(r => r.name.toLowerCase().includes(q)).forEach(r => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.name}</td><td>${r.first}</td><td>${r.second}</td><td>${r.third}</td><td>${r.total}</td>`;
      body.appendChild(tr);
    });
  }

  // ---------- Modal ----------
  const modal = document.getElementById("modal");
  const backdrop = modal?.querySelector(".modal-backdrop");
  const closeBtns = modal?.querySelectorAll("[data-close]") || [];
  const titleEl = document.getElementById("modalTitle");
  const subtitleEl = document.getElementById("modalSubtitle");
  const podiumEl = document.getElementById("podium");
  const notesEl = document.getElementById("notes");
  let lastFocus = null;

  function openModal(season) {
    lastFocus = document.activeElement;

    // Title + subtitle
    titleEl.textContent = `Season ${season.year}`;
    subtitleEl.textContent = season.first ? `Champion: ${season.first}` : "";

    // Swap modal graphic per year
    const header = document.querySelector(".modal-header");
    const oldGraphic = header?.querySelector("svg, img");
    if (oldGraphic) oldGraphic.remove();
    const styleKey = season.trophyStyle || DEFAULT_STYLES[season.year % DEFAULT_STYLES.length];
    header?.insertAdjacentHTML("afterbegin",
      season.trophyImage
        ? `<img class="modal-trophy-img" src="${season.trophyImage}" alt="Trophy ${season.year}">`
        : svgForStyle(styleKey, season.trophyColor, `modal-${season.year}`)
    );

    // Podium
    podiumEl.innerHTML = `
      <li>🥇 ${season.first}</li>
      <li>🥈 ${season.second}</li>
      <li>🥉 ${season.third}</li>
    `;

    // Notes: ADP & non-QB
    let notes = "";
    if (season.adp1) notes += `Highest ADP: ${season.adp1.player} (${season.adp1.pos}, ${season.adp1.team})\n`;
    if (season.nonQBTop) notes += `Top Non-QB: ${season.nonQBTop.player} (${season.nonQBTop.pos}, ${season.nonQBTop.team})`;
    notesEl.textContent = notes;

    // Open modal
    modal.setAttribute("aria-hidden","false");
    modal.querySelector(".modal-close").focus();
    document.addEventListener("keydown", onEsc);
  }

  function closeModal() {
    modal?.setAttribute("aria-hidden","true");
    document.removeEventListener("keydown", onEsc);
    if (lastFocus) lastFocus.focus();
  }
  function onEsc(e){ if (e.key === "Escape") closeModal(); }
  backdrop?.addEventListener("click", closeModal);
  closeBtns.forEach(b => b.addEventListener("click", closeModal));

  // ---------- Wire controls ----------
  sortSelect?.addEventListener("change", () => { renderGrid(); });
  searchInput?.addEventListener("input", () => { renderGrid(); });
  document.getElementById("lbSearch")?.addEventListener("input", () => renderLeaderboard(seasons));

  // ---------- Initial render ----------
  renderGrid();
  renderLeaderboard(seasons);
})();
