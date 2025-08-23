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
// ---------- Trophy styles ----------
const DEFAULT_STYLES = ["classic","shield","star","laurel","crown","football","ring","rocket"];

// tiny helper: unique gradient id per trophy so IDs don't clash
function grad(id, stops) {
  return `
    <defs>
      <linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
        ${stops.map(s => `<stop offset="${s.off}%" stop-color="${s.color}"/>`).join("")}
      </linearGradient>
    </defs>
  `;
}
function goldStops() {
  return [
    { off: 0,  color: "#ffd76a" },
    { off: 50, color: "#f7b500" },
    { off: 100,color: "#c88700" }
  ];
}

function svgForStyle(style, colorHex, key) {
  const gid = `grad-${style}-${key}`;
  // If you want per-year colors later, swap goldStops() with one built from colorHex
  const g = grad(gid, goldStops());

  switch ((style || "classic").toLowerCase()) {
    case "classic": // Cup with handles
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a" />
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a" />
    <path d="M100,135 c-18,0 -25,-10 -25,-28 V70 h50 v37 c0,18 -7,28 -25,28 z" fill="url(#${gid})"/>
    <path d="M60,70 a25,25 0 0 1 -35,-20 v-10 h25 v10 a10,10 0 0 0 10,10 z" fill="url(#${gid})"/>
    <path d="M140,70 a25,25 0 0 0 35,-20 v-10 h-25 v10 a10,10 0 0 1 -10,10 z" fill="url(#${gid})"/>
    <rect x="90" y="135" width="20" height="10" fill="url(#${gid})" />
  </g>
</svg>`;
    case "shield": // Plaque / shield
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <path d="M100 28 L158 50 V96 c0 40 -36 63 -58 73 -22 -10 -58 -33 -58 -73 V50 Z" fill="url(#${gid})" />
    <circle cx="70" cy="58" r="3" fill="#333"/><circle cx="130" cy="58" r="3" fill="#333"/>
    <rect x="70" y="120" width="60" height="16" rx="3" fill="#2a2a2a"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "star": // Starburst trophy
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <polygon points="100,24 118,70 165,70 127,96 142,142 100,118 58,142 73,96 35,70 82,70" fill="url(#${gid})"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "laurel": // Medallion with laurel wreath
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <circle cx="100" cy="80" r="34" fill="url(#${gid})"/>
    <path d="M58,84 c8,-16 20,-26 36,-30" stroke="#2a2a2a" stroke-width="4" fill="none"/>
    <path d="M142,84 c-8,-16 -20,-26 -36,-30" stroke="#2a2a2a" stroke-width="4" fill="none"/>
    <rect x="85" y="118" width="30" height="12" rx="3" fill="url(#${gid})"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "crown": // Crown
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <path d="M50,95 L65,55 L95,85 L120,50 L140,85 L165,60 L150,100 Z" fill="url(#${gid})"/>
    <rect x="60" y="110" width="80" height="10" rx="2" fill="url(#${gid})"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "football": // Football on a stand
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <ellipse cx="100" cy="80" rx="34" ry="22" transform="rotate(-10 100 80)" fill="url(#${gid})"/>
    <rect x="92" y="66" width="16" height="4" transform="rotate(-10 100 80)" fill="#fff" opacity=".7"/>
    <rect x="88" y="78" width="24" height="2" transform="rotate(-10 100 80)" fill="#fff" opacity=".7"/>
    <rect x="90" y="115" width="20" height="12" rx="3" fill="url(#${gid})"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "ring": // Championship ring
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <ellipse cx="100" cy="85" rx="42" ry="30" fill="#1d1f2a" stroke="url(#${gid})" stroke-width="8"/>
    <ellipse cx="100" cy="85" rx="22" ry="15" fill="url(#${gid})"/>
    <polygon points="100,72 106,88 90,80 110,80 94,88" fill="#fff" opacity=".6"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    case "rocket": // Fun rocket trophy
      return `
<svg class="trophy-svg" viewBox="0 0 200 200" aria-hidden="true">
  ${g}
  <g>
    <path d="M100,40 C120,60 120,95 100,115 C80,95 80,60 100,40 Z" fill="url(#${gid})"/>
    <polygon points="86,95 70,110 100,108" fill="#2a2a2a"/>
    <polygon points="114,95 130,110 100,108" fill="#2a2a2a"/>
    <polygon points="95,118 100,138 105,118" fill="#f7b500"/>
    <rect x="70" y="150" width="60" height="10" rx="2" fill="#3a3a3a"/>
    <rect x="60" y="160" width="80" height="12" rx="2" fill="#2a2a2a"/>
  </g>
</svg>`;
    default:
      return svgForStyle("classic", colorHex, key);
  }
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
const styleKey = s.trophyStyle || DEFAULT_STYLES[s.year % DEFAULT_STYLES.length];
const graphic = s.trophyImage
  ? `<img class="trophy-img" src="${s.trophyImage}" alt="Trophy ${s.year}">`
  : svgForStyle(styleKey, s.trophyColor, s.year);

btn.innerHTML = `
  ${graphic}
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

  // Title + subtitle
  titleEl.textContent = `Season ${season.year}`;
  subtitleEl.textContent = season.champion
    ? `Champion: ${season.champion}${season.team ? " — " + season.team : ""}`
    : "";

  // --- NEW: swap modal graphic per year (image > styled SVG fallback) ---
  const header = document.querySelector(".modal-header");
  const oldGraphic = header.querySelector("svg, img");
  if (oldGraphic) oldGraphic.remove();

  const styleKey = season.trophyStyle || DEFAULT_STYLES[season.year % DEFAULT_STYLES.length];
  if (season.trophyImage) {
    header.insertAdjacentHTML(
      "afterbegin",
      `<img class="modal-trophy-img" src="${season.trophyImage}" alt="Trophy ${season.year}">`
    );
  } else {
    header.insertAdjacentHTML(
      "afterbegin",
      svgForStyle(styleKey, season.trophyColor, `modal-${season.year}`)
    );
  }
  // --- END NEW ---

  // Podium
  podiumEl.innerHTML = "";
  const top3 = (season.top3 || []).slice().sort((a,b) => a.place - b.place);
  for (const p of top3) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="place">#${p.place}</span><span class="name">${p.name}</span>${p.team ? ` <span class="team">(${p.team})</span>` : ""}`;
    podiumEl.appendChild(li);
  }

  // Notes
  notesEl.textContent = season.note || "";

  // Open modal + a11y
  modal.setAttribute("aria-hidden", "false");
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
