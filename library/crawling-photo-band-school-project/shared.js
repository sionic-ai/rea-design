// Opens the several panels (menu · detail · YouTube · MAKING-OF) and the floating donate button from one place. In the original each panel calls the others with CustomEvent — keep the same names
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const emit = (name, detail) => dispatchEvent(new CustomEvent(name, { detail }));
  const locks = new Set();
  // The panel is removed from the document once the closing transition ends (the original react-modal deletes the panel after closeTimeoutMS — so hover works immediately on the button beneath)
  const layer = (el, on, closeMs) => {
    clearTimeout(el._t);
    if (on) {
      if (!el.isConnected) document.body.append(el);
      void el.offsetWidth;
      el.classList.add("is-open");
    } else {
      el.classList.remove("is-open");
      el._t = setTimeout(() => el.remove(), closeMs);
    }
  };
  const lock = (key, on) => {
    on ? locks.add(key) : locks.delete(key);
    document.body.classList.toggle("is-locked", locks.size > 0);
  };

  // ── Menu: tab text MENU↔CLOSE, and when open the MAKING-OF handwritten guide shows. Menu links close the plate and smoothly go to the spot .3s later ──
  const side = $(".ca-side");
  const menu = $("[data-menu]");
  const toggle = $("[data-menu-toggle]");
  let menuOpen = false;
  const setMenu = (on) => {
    menuOpen = on;
    layer(menu, on, 100);
    menu.setAttribute("aria-hidden", String(!on));
    side.classList.toggle("is-menu", on);
    toggle.querySelector("span").textContent = on ? "CLOSE" : "MENU";
    lock("menu", on);
  };
  addEventListener("toggleMenuModal", () => setMenu(!menuOpen));
  toggle.addEventListener("click", () => emit("toggleMenuModal"));
  $$(".ca-menu__col a[href^='#']").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    emit("toggleMenuModal");
    const to = a.getAttribute("href").length > 1 ? $(a.getAttribute("href")) : null;
    setTimeout(() => to?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }), 300);
  }));
  // The menu background video swaps two layers alternately with a .4s crossfade — the original switches 1s before the clip ends, and since the clip length is unknown it uses 5s
  const cycle = (box, every) => {
    const layers = $$(":scope > .wf-img", box);
    if (layers.length < 2 || reduce) return;
    let i = 0;
    setInterval(() => {
      layers[i].classList.remove("is-on");
      i = (i + 1) % layers.length;
      layers[i].classList.add("is-on");
    }, every);
  };
  cycle($(".ca-menu__bg"), 5000);

  // ── Detail panel: opens from anywhere on the card (original openModal). Closes with backdrop, CLOSE or Esc, and the end strip goes to the next number ──
  const sheet = $("[data-sheet-layer]");
  const order = $$("[data-sheet]").map((el) => el.dataset.sheet).filter((v, i, a) => a.indexOf(v) === i).sort();
  const fill = (no) => {
    const src = $(`[data-sheet="${no}"]`);
    $("[data-sheet-no]", sheet).textContent = no;
    $("[data-sheet-label-out]", sheet).textContent = src?.dataset.sheetLabel || "";
    const text = src?.querySelector(".ca-card__text");
    $("[data-sheet-title]", sheet).innerHTML = text ? text.innerHTML : "Your detail title here<br>Place it in two lines";
    $("[data-sheet-next-no]", sheet).textContent = order[(order.indexOf(no) + 1) % order.length];
    sheet.dataset.at = no;
  };
  let closing = 0;
  const setSheet = (on) => {
    clearTimeout(closing);
    if (!on && sheet.classList.contains("is-open")) {
      sheet.classList.add("is-closing");
      closing = setTimeout(() => sheet.classList.remove("is-closing"), 200);
    } else sheet.classList.remove("is-closing");
    layer(sheet, on, 200);
    sheet.setAttribute("aria-hidden", String(!on));
    lock("sheet", on);
  };
  addEventListener("openModal", (e) => { fill(e.detail.modalId); $(".ca-sheet__panel", sheet).scrollTop = 0; setSheet(true); });
  addEventListener("resetModalIndex", () => setSheet(false));
  $$("[data-sheet]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); emit("openModal", { modalId: el.dataset.sheet }); }));
  $("[data-sheet-close]", sheet).addEventListener("click", () => emit("resetModalIndex"));
  sheet.addEventListener("click", (e) => { if (e.target === sheet || e.target.classList.contains("ca-sheet__head")) emit("resetModalIndex"); });
  $("[data-sheet-next]", sheet).addEventListener("click", () => {
    emit("openModal", { modalId: $("[data-sheet-next-no]", sheet).textContent });
  });

  // ── YouTube panel: opens when a thumbnail or interview is clicked. For first-time visitors it opens once by itself after 1.5s (remembered for 7 days) ──
  const yt = $("[data-yt-layer]");
  let ytDur = 150;
  const setYt = (on, dur) => {
    if (on) {
      ytDur = dur || 150;
      yt.style.setProperty("--ca-yt-dur", `${ytDur}ms`);
      // The original iframe draws the player image about .65s after the panel opens — until then, a black cell
      const frame = yt.querySelector(".ca-yt__frame .wf-img");
      if (frame && !reduce) { frame.classList.add("is-wait"); clearTimeout(frame._t); frame._t = setTimeout(() => frame.classList.remove("is-wait"), 650); }
    }
    layer(yt, on, ytDur);
    yt.setAttribute("aria-hidden", String(!on));
    lock("yt", on);
  };
  addEventListener("openYouTubeModal", () => setYt(true));
  $$("[data-yt]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); emit("openYouTubeModal"); }));
  $("[data-yt-close]", yt).addEventListener("click", () => setYt(false));
  yt.addEventListener("click", (e) => { if (e.target === yt) setYt(false); });
  const SEEN = "ca-youtube-modal";
  let seen = 0;
  try { seen = +localStorage.getItem(SEEN) || 0; } catch {}
  // The first-visit panel opens in .5s like the original (animationDuration 500)
  if (Date.now() - seen > 7 * 864e5) {
    setTimeout(() => setYt(true, 500), 1500);
    try { localStorage.setItem(SEEN, String(Date.now())); } catch {}
  }

  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (yt.classList.contains("is-open")) setYt(false);
    else if (sheet.classList.contains("is-open")) emit("resetModalIndex");
    else if (menuOpen) emit("toggleMenuModal");
  });

  // ── MAKING-OF: each press toggles the noise overlay on and off (while on, it jitters ±100px every 50ms). The first time, a handwritten hint stays up for 5s and lifts over 1s.
  //    The photo cell switches to the one the student shot — the first is .3s late ──
  const making = $("[data-making]");
  const noise = $("[data-noise]");
  const note = $("[data-making-note]");
  let noiseOn = false, jitter = 0, firstDone = false, makingMode = false;
  const setNoise = (on) => {
    noiseOn = on;
    noise.classList.toggle("is-on", on);
    clearInterval(jitter);
    if (on && !reduce) jitter = setInterval(() => {
      noise.style.backgroundPosition = `${Math.floor(Math.random() * 200) - 100}px ${Math.floor(Math.random() * 200) - 100}px`;
    }, 50);
  };
  const toggleBg = () => {
    makingMode = !makingMode;
    document.documentElement.classList.toggle("is-making", makingMode);
    making.classList.toggle("is-making", makingMode);
  };
  making.addEventListener("click", () => {
    if (menuOpen) emit("toggleMenuModal");
    setNoise(!noiseOn);
    if (firstDone) toggleBg(); else setTimeout(toggleBg, 300);
    if (!firstDone) {
      firstDone = true;
      note.classList.add("is-on");
      lock("making", true);
      setTimeout(() => { note.classList.remove("is-on"); lock("making", false); }, 5000);
    }
  });

  [menu, sheet, yt].forEach((el) => { el.hidden = false; if (!el.classList.contains("is-open")) el.remove(); });

  // ── Floating donate button: hides when the footer enters the screen, click scrolls smoothly to the footer ──
  const footer = $("[data-footer-area]");
  const fab = $("[data-fab]");
  if (footer && fab) {
    new IntersectionObserver((list) => list.forEach((en) => fab.classList.toggle("is-hidden", en.isIntersecting)), { threshold: 0 }).observe(footer);
    fab.addEventListener("click", () => footer.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
  }

  cycle($(".ca-footer__donate"), 5000);

})();
