(async function () {
  // ---------- Theme + UI ----------
  const toggleBtn = document.getElementById("toggleTheme");
  const stored = localStorage.getItem("theme");
  if (stored) document.documentElement.dataset.theme = stored;
  toggleBtn?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // ---------- Data load ----------
  let seasons = [];
  try {
    const res = await fetch("data/champions.json", { cache: "no-store" });
    const data = await res.json();
    seasons = Array.isArray(data) ? data : data.seasons || [];
  } catch (e) {
    console.error("Failed to load champions.json", e);
  }

  // ---------- Helpers ----------
  function normalized(str){ return (str||"").toString().toLowerCase(); }

  // Trophy styles
  const DEFAULT_STYLES = ["classic","shield","star","laurel","crown","football","ring","rocket"];
  function grad(id) {
    return `
      <defs>
        <linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffd76a"/>
          <stop offset="50%" stop-color="#f7b500"/>
          <stop offset="100%" stop-color="#c88700"/>
        </linearGradient>
      </defs>
    `;
  }
  function svgForStyle(style, key) {
    const gid = `grad-${style}-${key}`;
    const g = grad(gid);
    switch (style) {
      case "shield":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<path d="M100 28 L158 50 V96 c0 40 -36 63 -58 73 -22 -10 -58 -33 -58 -73 V50 Z" fill="url(#${gid})"/></svg>`;
      case "star":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<polygon points="100,24 118,70 165,70 127,96 142,142 100,118 58,142 73,96 35,70 82,70" fill="url(#${gid})"/></svg>`;
      case "laurel":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<circle cx="100" cy="80" r="34" fill="url(#${gid})"/></svg>`;
      case "crown":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<path d="M50,95 L65,55 L95,85 L120,50 L140,85 L165,60 L150,100 Z" fill="url(#${gid})"/></svg>`;
      case "football":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<ellipse cx="100" cy="80" rx="34" ry="22" fill="url(#${gid})"/></svg>`;
      case "ring":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<ellipse cx="100" cy="85" rx="42" ry="30" fill="#1d1f2a" stroke="url(#${gid})" stroke-width="8"/></svg>`;
      case "rocket":
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<path d="M100,40 C120,60 120,95 100,115 C80,95 80,60 100,40 Z" fill="url(#${gid})"/></svg>`;
      default: // classic cup
        return `<svg class="trophy-svg" viewBox="0 0 200 200">${g}<path d="M100,135 c-18,0 -25,-10 -25,-28 V70 h50 v37 c0,18 -7,28 -25,28 z" fill="url(#${gid})"/></svg>`;
    }
  }

  // Confetti
  function launchConfettiFrom(el) {
    if (!window.confetti || !el) return;
    const rect = el.getBoundingClientRect();
    const x = (rect.left + rect.width/2) / window.innerWidth;
    const y = (rect.top + rect.height/2) / window.innerHeight;
    confetti({ particleCount: 100, spread: 70, startVelocity: 45, origin: {x,y} });
  }

  // ---------- Grid ----------
  const grid = document.getElementById("trophyGrid");
  function renderGrid() {
    if (!grid) return;
    grid.innerHTML = "";
    for (const s of seasons) {
      const btn = document.createElement("button");
      btn.className = "trophy-tile";
      const styleKey = s.trophyStyle || DEFAULT_STYLES[s.year % DEFAULT_STYLES.length];
      btn.innerHTML = `
        ${svgForStyle(styleKey, s.year)}
        <div class="year">${s.year}</div>
        <div class="small">Champion: ${s.first}</div>
      `;
      btn.addEventListener("click", (e) => {
        if (s.year === 2024) launchConfettiFrom(e.currentTarget);
        openModal(s);
      });
      grid.appendChild(btn);
    }
  }

  // ---------- Modal ----------
  const modal = document.getElementById("modal");
  const titleEl = document.getElementById("modalTitle");
  const podiumEl = document.getElementById("podium");
  const notesEl = document.getElementById("notes");
  let lastFocus = null;

  function openModal(season) {
    lastFocus = document.activeElement;
    titleEl.textContent = `Season ${season.year}`;

    // Podium
    podiumEl.innerHTML = `
      <li>🥇 ${season.first}</li>
      <li>🥈 ${season.second}</li>
      <li>🥉 ${season.third}</li>
    `;

    // Notes: add ADP + Non-QB info
    let notes = "";
    if (season.adp1) notes += `Highest ADP: ${season.adp1.player} (${season.adp1.pos}, ${season.adp1.team})\n`;
    if (season.nonQBTop) notes += `Top Non-QB: ${season.nonQBTop.player} (${season.nonQBTop.pos}, ${season.nonQBTop.team})`;
    notesEl.textContent = notes;

    modal.setAttribute("aria-hidden","false");
    modal.querySelector(".modal-close").focus();
  }

  function closeModal() {
    modal?.setAttribute("aria-hidden","true");
    if (lastFocus) lastFocus.focus();
  }
  modal?.querySelector(".modal-close")?.addEventListener("click", closeModal);

  // ---------- Init ----------
  renderGrid();
})();
