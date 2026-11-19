// Common mechanism for the whole site — all pages use the same band, header row, key map, sound button, cursor, record slip and door transition.
// Subpages are treated as entered once the section title card (rune-title-loader) clears (fx:done), while on the first page index.js calls cs.enter() when the entrance door is pressed.
(() => {
  const body = document.body;
  const here = body.dataset.page || "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Our pages that the menu and map point to — the original room-name slots are English placeholders of the same length
  const ROOMS = [
    { id: "about", label: "Studio", alt: "Origin", href: "about.html" },
    { id: "team", label: "Team", alt: "People", href: "about.html#team" },
    { id: "service", label: "Services", alt: "Offering", href: "service.html" },
    { id: "works", label: "Portfolio", alt: "Gallery", href: "works.html" },
    { id: "library", label: "Library", alt: "Archive", href: "works.html#archive" },
    { id: "partners", label: "Partnership", alt: "Alliance", href: "about.html#manifesto" },
  ];
  const CONTACT = { label: "Get in touch", href: "detail.html#contact" };

  const crumb = body.dataset.crumb
    ? body.dataset.crumb.split("/").map((s, i, a) => i < a.length - 1 ? `<a href="works.html">${s.trim()}</a><span class="cs-sep" aria-hidden="true">/</span>` : `<span>${s.trim()}</span>`).join("")
    : "";
  const KEY = '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><circle cx="13" cy="6.5" r="3.6"/><path d="M13 10.1v12.6M13 17.6h3.6M13 21h2.4"/><path d="M9.2 6.5h-2M18.8 6.5h-2M13 2.7V1.4" stroke-linecap="round"/></svg>';
  const PLAN = `<svg class="cs-map__plan" viewBox="0 0 560 360" role="img" aria-label="Site map — click a room to go to that page">
    ${[
      ["about", 230, 20, 100, 70], ["team", 110, 110, 110, 70], ["service", 230, 110, 100, 120], ["works", 340, 110, 110, 70],
      ["library", 110, 200, 110, 70], ["partners", 340, 200, 110, 70],
    ].map(([id, x, y, w, h]) => {
      const r = ROOMS.find((q) => q.id === id);
      return `<a href="${r.href}" class="${here === id ? "is-here" : ""}"><path class="room" d="M${x} ${y + h}V${y + 14}Q${x + w / 2} ${y - 10} ${x + w} ${y + 14}V${y + h}Z"/><text x="${x + w / 2}" y="${y + h / 2 + 10}" text-anchor="middle">${r.label}</text></a>`;
    }).join("")}
    <path d="M200 300h160M280 230v70" stroke="currentColor" stroke-dasharray="3 4" fill="none"/>
    <a href="index.html" class="${here === "home" ? "is-here" : ""}"><path class="room" d="M230 340V312Q280 290 330 312V340Z"/><text x="280" y="333" text-anchor="middle">Nave</text></a>
  </svg>`;

  const chrome = document.createElement("div");
  chrome.className = "cs-chrome";
  chrome.innerHTML = `
    <div class="cs-cine" aria-hidden="true"><div class="cs-cine__bar cs-cine__bar--top"></div><div class="cs-cine__bar cs-cine__bar--bottom"></div><div class="cs-grain"></div></div>
    <header class="cs-head" data-slot="header">
      <a class="cs-mark" href="index.html" data-label="Studio English wordmark">Studio Name</a>
      ${crumb ? `<span class="cs-sep" aria-hidden="true">/</span><span class="cs-crumb">${crumb}</span>` : ""}
    </header>
    <button class="cs-key" type="button" aria-label="Open sitemap" aria-expanded="false" data-slot="map-key">${KEY}</button>
    <footer class="cs-foot" data-slot="sound"><button class="cs-sound is-on" type="button" aria-label="Turn Off Background Music" aria-pressed="true"><svg viewBox="0 0 15 22" aria-hidden="true">${[0, 1, 2, 3].map((i) => `<rect x="${i * 4}" y="17.4" width="2.4" height="2.6" rx=".7" fill="currentColor"/>`).join("")}</svg></button></footer>
    <div class="cs-map" data-slot="site-map" role="dialog" aria-modal="true" aria-label="Sitemap">
      <button class="cs-map__close" type="button" aria-label="Close map">×</button>
      <div class="cs-map__panel">
        <p class="cs-map__cap">— Please walk quietly —</p>
        <h2 class="cs-map__title" data-label="Map title (English)">Site Map</h2>
        <i class="cs-map__rule"></i>
        ${PLAN}
        <p class="cs-map__hint">Tap a room to move on</p>
      </div>
    </div>
    <div class="cs-door" aria-hidden="true"></div>
    <div class="cs-cursor is-out" aria-hidden="true"><div class="cs-cursor__ring"></div><div class="cs-cursor__dot"></div></div>`;
  body.prepend(chrome);
  if (here !== "home") {
    const note = document.createElement("div");
    note.className = "cs-note";
    note.dataset.slot = "consent-note";
    note.innerHTML = `<p>This site may keep a record of your visits.<br>Your extra one-line note about the record here.<br><a href="#">Privacy policy</a></p><div class="cs-note__doors"><button type="button">Remember</button><i></i><button type="button">Without a Trace</button></div>`;
    chrome.append(note);
  }

  const door = chrome.querySelector(".cs-door");
  const map = chrome.querySelector(".cs-map");
  const keyBtn = chrome.querySelector(".cs-key");

  // ── Entrance — band · header line · bottom line enter via css animation ──
  let inside = false, inAt = 0;
  const enter = (quick) => {
    if (inside) return;
    inside = true;
    inAt = performance.now();
    if (quick) body.classList.add("is-quick");
    body.classList.add("is-in");
    document.dispatchEvent(new CustomEvent("cs:in", { detail: { quick: !!quick } }));
    const note = chrome.querySelector(".cs-note");
    if (note && !sessionStorage.getItem("cs-note")) setTimeout(() => note.classList.add("is-shown"), 0);
  };
  chrome.querySelectorAll(".cs-note__doors button").forEach((b) => b.addEventListener("click", () => {
    sessionStorage.setItem("cs-note", "1");
    b.closest(".cs-note").classList.remove("is-shown");
  }));
  const card = document.querySelector('[data-fx~="rune-title-loader"]');
  // On subpages the strip, header line and bottom line are already in under the section title card as in the original, and when the card lifts only the page motion starts
  if (card && here !== "home") {
    body.classList.add("is-in");
    card.addEventListener("fx:done", () => enter(false));
  }

  // ── Door transition — on leaving the curtain takes .45s, and for the home menu index.js turns the camera toward the door and then transitions ──
  const go = (href, how) => {
    if (reduce) { location.href = href; return; }
    door.classList.add(how === "enter" ? "is-entering" : "is-leaving");
    setTimeout(() => { location.href = href; }, how === "enter" ? 1700 : 470);
  };
  addEventListener("pageshow", () => door.classList.remove("is-leaving", "is-entering"));
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    if (href.split("#")[0] === location.pathname.split("/").pop() && href.includes("#")) return;
    // Work card to detail uses no curtain but a View Transition (.68s) where the cover photo carries over into the detail header photo — left to the browser’s handoff
    if (a.hasAttribute("data-vt")) {
      a.querySelector("[data-vt-img]")?.style.setProperty("view-transition-name", "project-cover");
      return;
    }
    e.preventDefault();
    closeMap();
    if (href.startsWith("index.html")) sessionStorage.setItem("cs-entered", "1");
    const lead = window.csLeave?.(a, href);
    if (lead) return;
    go(href, "leave");
  });

  // ── Map ──
  const openMap = () => { map.classList.add("is-open"); keyBtn.setAttribute("aria-expanded", "true"); };
  const closeMap = () => { map.classList.remove("is-open"); keyBtn.setAttribute("aria-expanded", "false"); };
  keyBtn.addEventListener("click", () => (map.classList.contains("is-open") ? closeMap() : openMap()));
  map.querySelector(".cs-map__close").addEventListener("click", closeMap);
  map.addEventListener("click", (e) => { if (e.target === map) closeMap(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeMap(); });

  // ── Sound button — while on, four bars bounce between heights 2.6~16 (no sound is loaded) ──
  const sound = chrome.querySelector(".cs-sound");
  const bars = [...sound.querySelectorAll("rect")];
  const lv = [0, 0, 0, 0];
  sound.addEventListener("click", () => {
    const on = sound.classList.toggle("is-on");
    sound.setAttribute("aria-pressed", String(on));
    sound.setAttribute("aria-label", on ? "Turn Off Background Music" : "Turn On Background Music");
  });
  // Browsers block sound until a person interacts — the original music (and bars) start only after the first press or key
  let heard = false, heardAt = 0;
  // The original Services section (3D basement) does not open background music even on press — measured, and the bar did not move on a tick click
  const hear = () => { if (here === "service") return; heard = true; heardAt = performance.now(); };
  addEventListener("pointerdown", hear, { once: true, capture: true });
  addEventListener("keydown", hear, { once: true, capture: true });
  let eqLast = 0;
  const eq = (t) => {
    requestAnimationFrame(eq);
    if (t - eqLast < 60) return;
    eqLast = t;
    // Music starts only after entering — before that the bars lie flat on the floor
    const on = sound.classList.contains("is-on") && !reduce && inAt && heard;
    bars.forEach((r, i) => {
      // Each bar gets its sound at a different time — enters (after the sound opens), from .42s each bar is delayed by .215s (original stagger ~.52s, measured first bar .53~.6s)
      // On the first press on an already-entered page, bars rise one after another by .028s starting .22s later (measured about .29s like the original key press)
      const start = Math.max(inAt + 420 + i * 215, heardAt + 220 + i * 28);
      const want = on && t > start ? 0.3 + 0.64 * Math.abs(Math.sin(t / (180 + i * 60) + i * 1.7)) : 0;
      lv[i] += (want - lv[i]) * 0.5;
      const h = 2.6 + (16 - 2.6) * lv[i];
      r.setAttribute("y", String(20 - h));
      r.setAttribute("height", String(h));
    });
  };
  requestAnimationFrame(eq);

  // ── Cursor — the dot sits at the mouse, the ring follows by .18 each frame and brightens to 1.16x over links (original CustomCursor day mode — the trailing dots are on only at night, so they are not built) ──
  if (hover && !reduce) {
    body.classList.add("has-cursor");
    const cur = chrome.querySelector(".cs-cursor");
    const dot = cur.querySelector(".cs-cursor__dot"), ring = cur.querySelector(".cs-cursor__ring");
    let x = -100, y = -100, rx = x, ry = y, hot = false;
    addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX; y = e.clientY;
      cur.classList.remove("is-out");
      hot = !!e.target.closest?.("a, button, [role='button'], [data-fx~='scramble-magnet-link']") && !e.target.closest?.("a.cs-tl__item");
      ring.classList.toggle("is-hot", hot);
      dot.classList.toggle("is-hot", hot);
    });
    document.addEventListener("pointerleave", () => cur.classList.add("is-out"));
    const loop = () => {
      requestAnimationFrame(loop);
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      rx += (x - rx) * 0.18; ry += (y - ry) * 0.18;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${hot ? 1.16 : 1})`;
    };
    requestAnimationFrame(loop);
  }

  window.cs = { enter, go, rooms: ROOMS, contact: CONTACT, reduce, hover };
})();
