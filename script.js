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
  // 13 distinct designs so 2012-2024 (13 seasons) each get a unique trophy.
  const DEFAULT_STYLES = ["classic","shield","star","laurel","crown","football","ring","rocket","medal","pennant","torch","belt","plaque"];
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
  function shine(cx, ry, rx, ryy){ return `<ellipse cx="${cx}" cy="${ry}" rx="${rx}" ry="${ryy}" fill="rgba(255,255,255,0.32)" stroke="none" />`; }
  const STROKE = `stroke="#6b4a12" stroke-width="2" stroke-linejoin="round"`;

  function svgForStyle(style, colorHex, key) {
    const gid = `grad-${style}-${key}`;
    const g = grad(gid, goldStops());
    switch ((style||"classic").toLowerCase()) {
      case "shield":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <path d="M100 26 L160 48 V94 c0 42 -38 66 -60 76 -22 -10 -60 -34 -60 -76 V48 Z" fill="url(#${gid})" ${STROKE}/>
          <path d="M100 44 V158" stroke="#6b4a12" stroke-width="1.5" opacity=".4" fill="none"/>
          <circle cx="100" cy="66" r="5" fill="#6b4a12" opacity=".5"/>
          ${shine(78,58,14,10)}
        </g></svg>`;
      case "star":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <polygon points="100,20 121,68 172,70 132,101 148,152 100,122 52,152 68,101 28,70 79,68" fill="url(#${gid})" ${STROKE}/>
          <polygon points="100,42 113,74 148,76 121,96 131,130 100,111 69,130 79,96 52,76 87,74" fill="rgba(255,255,255,0.18)"/>
        </g></svg>`;
      case "laurel":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g fill="url(#${gid})" stroke="#6b4a12" stroke-width="1.5">
          <ellipse cx="62" cy="146" rx="11" ry="5" transform="rotate(-35 62 146)"/>
          <ellipse cx="52" cy="126" rx="11" ry="5" transform="rotate(-55 52 126)"/>
          <ellipse cx="47" cy="102" rx="11" ry="5" transform="rotate(-80 47 102)"/>
          <ellipse cx="51" cy="78" rx="11" ry="5" transform="rotate(-105 51 78)"/>
          <ellipse cx="63" cy="58" rx="11" ry="5" transform="rotate(-130 63 58)"/>
          <ellipse cx="82" cy="46" rx="11" ry="5" transform="rotate(-155 82 46)"/>
          <ellipse cx="138" cy="146" rx="11" ry="5" transform="rotate(35 138 146)"/>
          <ellipse cx="148" cy="126" rx="11" ry="5" transform="rotate(55 148 126)"/>
          <ellipse cx="153" cy="102" rx="11" ry="5" transform="rotate(80 153 102)"/>
          <ellipse cx="149" cy="78" rx="11" ry="5" transform="rotate(105 149 78)"/>
          <ellipse cx="137" cy="58" rx="11" ry="5" transform="rotate(130 137 58)"/>
          <ellipse cx="118" cy="46" rx="11" ry="5" transform="rotate(155 118 46)"/>
          <circle cx="100" cy="150" r="7"/>
        </g></svg>`;
      case "crown":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <path d="M46,108 L62,54 L92,88 L100,46 L108,88 L138,54 L154,108 Z" fill="url(#${gid})" ${STROKE}/>
          <rect x="46" y="108" width="108" height="16" rx="3" fill="url(#${gid})" ${STROKE}/>
          <circle cx="62" cy="60" r="4" fill="#7a2f2a"/>
          <circle cx="100" cy="52" r="5" fill="#7a2f2a"/>
          <circle cx="138" cy="60" r="4" fill="#7a2f2a"/>
          ${shine(88,80,14,8)}
        </g></svg>`;
      case "football":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g transform="rotate(-20 100 80)">
          <ellipse cx="100" cy="80" rx="52" ry="30" fill="url(#${gid})" stroke="#4a2c10" stroke-width="2"/>
          <g stroke="#4a2c10" stroke-width="2" stroke-linecap="round">
            <line x1="72" y1="80" x2="128" y2="80"/>
            <line x1="86" y1="73" x2="86" y2="87"/>
            <line x1="97" y1="73" x2="97" y2="87"/>
            <line x1="108" y1="73" x2="108" y2="87"/>
            <line x1="119" y1="73" x2="119" y2="87"/>
          </g>
        </g></svg>`;
      case "ring":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <ellipse cx="100" cy="112" rx="46" ry="30" fill="none" stroke="url(#${gid})" stroke-width="14"/>
          <path d="M76,68 L100,40 L124,68 L112,84 L88,84 Z" fill="url(#${gid})" ${STROKE}/>
          <circle cx="100" cy="62" r="8" fill="#7a2f2a" stroke="#6b4a12" stroke-width="1.5"/>
          ${shine(84,104,10,6)}
        </g></svg>`;
      case "rocket":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <g ${STROKE}>
            <path d="M100,34 C122,58 122,98 100,124 C78,98 78,58 100,34 Z" fill="url(#${gid})"/>
            <path d="M78,96 L60,120 L82,112 Z" fill="url(#${gid})"/>
            <path d="M122,96 L140,120 L118,112 Z" fill="url(#${gid})"/>
            <circle cx="100" cy="76" r="10" fill="#1d1f2a" stroke="url(#${gid})" stroke-width="3"/>
          </g>
          <path d="M92,124 L100,148 L108,124 Z" fill="rgba(255,140,60,0.75)"/>
          ${shine(90,58,10,14)}
        </g></svg>`;
      case "medal":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <path d="M78,20 L100,58 L122,20" fill="none" stroke="#9c3b31" stroke-width="14" stroke-linejoin="round"/>
          <circle cx="100" cy="112" r="46" fill="url(#${gid})" stroke="#6b4a12" stroke-width="3"/>
          <circle cx="100" cy="112" r="30" fill="none" stroke="#6b4a12" stroke-width="2" opacity=".5"/>
          <polygon points="100,94 106,108 121,108 109,117 114,132 100,123 86,132 91,117 79,108 94,108" fill="rgba(255,255,255,0.3)"/>
        </g></svg>`;
      case "pennant":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <line x1="60" y1="30" x2="60" y2="168" stroke="#6b4a12" stroke-width="6" stroke-linecap="round"/>
          <path d="M60,38 L156,64 L60,92 Z" fill="url(#${gid})" ${STROKE}/>
          <circle cx="60" cy="30" r="6" fill="url(#${gid})" stroke="#6b4a12" stroke-width="1.5"/>
        </g></svg>`;
      case "torch":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <g ${STROKE}>
            <path d="M88,90 L84,168 h32 L112,90 Z" fill="url(#${gid})"/>
            <path d="M80,90 h40 l-6,-14 h-28 z" fill="url(#${gid})"/>
          </g>
          <path d="M100,26 C112,42 116,56 100,72 C84,56 88,42 100,26 Z" fill="rgba(255,140,60,0.85)"/>
          <path d="M100,40 C106,50 108,58 100,66 C92,58 94,50 100,40 Z" fill="rgba(255,215,110,0.9)"/>
        </g></svg>`;
      case "belt":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <path d="M40,86 h34 v28 h-34 z" fill="#3a2a16" stroke="#6b4a12" stroke-width="2"/>
          <path d="M126,86 h34 v28 h-34 z" fill="#3a2a16" stroke="#6b4a12" stroke-width="2"/>
          <rect x="66" y="66" width="68" height="68" rx="10" fill="url(#${gid})" stroke="#6b4a12" stroke-width="3"/>
          <circle cx="100" cy="100" r="20" fill="none" stroke="#6b4a12" stroke-width="3"/>
          <polygon points="100,88 105,98 116,98 107,105 111,116 100,109 89,116 93,105 84,98 95,98" fill="rgba(255,255,255,0.3)"/>
        </g></svg>`;
      case "plaque":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <rect x="88" y="34" width="24" height="30" fill="url(#${gid})" stroke="#6b4a12" stroke-width="2"/>
          <rect x="46" y="60" width="108" height="70" rx="8" fill="url(#${gid})" stroke="#6b4a12" stroke-width="3"/>
          <line x1="62" y1="84" x2="138" y2="84" stroke="#6b4a12" stroke-width="2" opacity=".5"/>
          <line x1="62" y1="98" x2="122" y2="98" stroke="#6b4a12" stroke-width="2" opacity=".4"/>
          <line x1="62" y1="112" x2="130" y2="112" stroke="#6b4a12" stroke-width="2" opacity=".3"/>
        </g></svg>`;
      case "romanTwo": // 2024 — back-to-back championship
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <polygon points="100,18 103,26 112,27 105,33 108,42 100,37 92,42 95,33 88,27 97,26" fill="url(#${gid})" ${STROKE}/>
          <g ${STROKE}>
            <rect x="72" y="58" width="14" height="82" fill="url(#${gid})"/>
            <rect x="62" y="48" width="34" height="10" rx="2" fill="url(#${gid})"/>
            <rect x="62" y="140" width="34" height="10" rx="2" fill="url(#${gid})"/>
            <rect x="114" y="58" width="14" height="82" fill="url(#${gid})"/>
            <rect x="104" y="48" width="34" height="10" rx="2" fill="url(#${gid})"/>
            <rect x="104" y="140" width="34" height="10" rx="2" fill="url(#${gid})"/>
          </g>
          <rect x="62" y="142" width="76" height="10" fill="#2a1d10" stroke="none"/>
          <rect x="54" y="152" width="92" height="14" rx="2" fill="#3a2a16" stroke="none"/>
          ${shine(72,80,8,26)}
        </g></svg>`;
      case "lombardiStyle": // 2018 — football mounted on a tripod stand
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <g stroke="#3a2a16" stroke-width="8" stroke-linecap="round">
            <line x1="100" y1="146" x2="58" y2="180"/>
            <line x1="100" y1="146" x2="142" y2="180"/>
            <line x1="100" y1="146" x2="100" y2="182"/>
          </g>
          <rect x="93" y="108" width="14" height="40" fill="url(#${gid})" ${STROKE}/>
          <ellipse cx="100" cy="76" rx="27" ry="44" fill="url(#${gid})" stroke="#4a2c10" stroke-width="2.5"/>
          <g stroke="#4a2c10" stroke-width="2" stroke-linecap="round">
            <line x1="100" y1="52" x2="100" y2="100"/>
            <line x1="90" y1="60" x2="110" y2="60"/>
            <line x1="88" y1="70" x2="112" y2="70"/>
            <line x1="87" y1="80" x2="113" y2="80"/>
            <line x1="88" y1="90" x2="112" y2="90"/>
          </g>
          ${shine(88,58,8,16)}
        </g></svg>`;
      case "smudgedClassic": // 2015 — the classic cup, with its infamous smudge
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g ${STROKE}>
          <rect x="72" y="152" width="56" height="9" rx="2" fill="#3a2a16" stroke="none"/>
          <rect x="62" y="161" width="76" height="11" rx="2" fill="#2a1d10" stroke="none"/>
          <path d="M100,136 c-17,0 -24,-9 -24,-27 V68 h48 v41 c0,18 -7,27 -24,27 z" fill="url(#${gid})"/>
          <path d="M58,68 a24,24 0 0 1 -33,-19 v-10 h24 v10 a9,9 0 0 0 9,9 z" fill="url(#${gid})"/>
          <path d="M142,68 a24,24 0 0 0 33,-19 v-10 h-24 v10 a9,9 0 0 1 -9,9 z" fill="url(#${gid})"/>
          <rect x="88" y="136" width="24" height="9" fill="url(#${gid})" stroke="none"/>
          <line x1="82" y1="80" x2="118" y2="80" stroke="#7a5518" stroke-width="1.5" opacity=".5"/>
          ${shine(84,75,10,16)}
        </g>
        <g stroke="none">
          <ellipse cx="112" cy="95" rx="13" ry="9" fill="rgba(60,45,25,0.4)" transform="rotate(18 112 95)"/>
          <ellipse cx="118" cy="88" rx="7" ry="5" fill="rgba(60,45,25,0.3)"/>
          <ellipse cx="104" cy="104" rx="5" ry="4" fill="rgba(60,45,25,0.25)"/>
        </g></svg>`;
      case "worldCupStyle": // 2014 — spiraling risers holding up a globe
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <rect x="76" y="158" width="48" height="12" rx="2" fill="#3a2a16"/>
          <g fill="none" stroke="url(#${gid})" stroke-linecap="round">
            <path d="M100,158 C70,140 130,120 90,95 C60,75 120,60 100,44" stroke-width="12"/>
            <path d="M100,158 C130,140 70,120 110,95 C140,75 80,60 100,44" stroke-width="12"/>
          </g>
          <circle cx="100" cy="38" r="22" fill="url(#${gid})" ${STROKE}/>
          <ellipse cx="100" cy="38" rx="22" ry="8" fill="none" stroke="#6b4a12" stroke-width="1.2" opacity=".5"/>
          <line x1="100" y1="16" x2="100" y2="60" stroke="#6b4a12" stroke-width="1.2" opacity=".5"/>
          ${shine(90,32,8,10)}
        </g></svg>`;
      case "triangle": // 2012 — faceted triangle trophy
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g>
          <rect x="66" y="152" width="68" height="14" rx="2" fill="#3a2a16"/>
          <polygon points="100,34 152,150 48,150" fill="url(#${gid})" ${STROKE}/>
          <polygon points="100,58 132,150 68,150" fill="rgba(255,255,255,0.14)"/>
          <polygon points="100,58 100,150 68,150" fill="rgba(0,0,0,0.08)"/>
          ${shine(82,80,10,20)}
        </g></svg>`;
      default: // classic cup
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<g ${STROKE}>
          <rect x="72" y="152" width="56" height="9" rx="2" fill="#3a2a16" stroke="none"/>
          <rect x="62" y="161" width="76" height="11" rx="2" fill="#2a1d10" stroke="none"/>
          <path d="M100,136 c-17,0 -24,-9 -24,-27 V68 h48 v41 c0,18 -7,27 -24,27 z" fill="url(#${gid})"/>
          <path d="M58,68 a24,24 0 0 1 -33,-19 v-10 h24 v10 a9,9 0 0 0 9,9 z" fill="url(#${gid})"/>
          <path d="M142,68 a24,24 0 0 0 33,-19 v-10 h-24 v10 a9,9 0 0 1 -9,9 z" fill="url(#${gid})"/>
          <rect x="88" y="136" width="24" height="9" fill="url(#${gid})" stroke="none"/>
          <line x1="82" y1="80" x2="118" y2="80" stroke="#7a5518" stroke-width="1.5" opacity=".5"/>
          ${shine(84,75,10,16)}
        </g></svg>`;
    }
  }

  // ---------- Confetti (fires for the most recent season) ----------
  const latestYear = seasons.length ? Math.max(...seasons.map(s => s.year)) : null;
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
        if (s.year === latestYear) launchConfettiFrom(e.currentTarget);
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
