(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ── Three view settings — text only (T) · dark (D) · monochrome (M). Two buttons (header bar · phone menu) show the same state, remembered within the tab ──
  const MODES = {
    text: { key: "T", on: (v) => document.body.classList.toggle("is-text", v) },
    dark: { key: "D", on: (v) => (v ? (document.documentElement.dataset.theme = "dark") : delete document.documentElement.dataset.theme) },
    mono: { key: "M", on: (v) => document.body.classList.toggle("is-mono", v) },
  };
  const state = {};
  const show = (k) => $$(`[data-hj-mode="${k}"]`).forEach((b) => { b.setAttribute("aria-pressed", String(state[k])); b.querySelector(".hj-ind span").textContent = state[k] ? "Y" : "N"; });
  const set = (k, v) => { state[k] = v; MODES[k].on(v); show(k); try { sessionStorage.setItem(`hj-${k}`, v ? "on" : "off"); } catch {} };
  Object.keys(MODES).forEach((k) => { let v = false; try { v = sessionStorage.getItem(`hj-${k}`) === "on"; } catch {} set(k, v); });
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-hj-mode]"); if (b) set(b.dataset.hjMode, !state[b.dataset.hjMode]); });
  document.addEventListener("keyup", (e) => {
    if (e.target.closest("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = Object.keys(MODES).find((m) => MODES[m].key === e.key.toUpperCase());
    if (k) set(k, !state[k]);
  });

  // ── Header line — screen size · OS indicator, once past the wordmark height, a line appears below the info row
  const head = $(".hj-head"), mark = $("#hj-mark");
  const visitor = () => {
    $$(".hj-res").forEach((n) => (n.textContent = `${innerWidth}x${innerHeight}`));
    const a = navigator.userAgent;
    const os = /iPhone|iPad/.test(a) ? "iOS" : /Win/.test(a) ? "Windows" : /Mac/.test(a) ? "macOS" : /Android/.test(a) ? "Android" : /Linux|X11/.test(a) ? "Linux" : "UnknownOS";
    $$(".hj-os").forEach((n) => (n.textContent = os));
  };
  visitor();
  addEventListener("resize", visitor);
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY, m = mark?.offsetHeight || 0;
    head?.classList.toggle("is-scrolled", y > m);
    if (y > lastY && y > m) menu(false);
    lastY = y;
  }, { passive: true });

  // ── Phone menu — from the button spot the panel first opens horizontally then downward (original keyframes), on close it reverses .2s later
  const btn = $(".hj-menu > .hj-btn"), fill = $(".hj-menu__fill"), box = $(".hj-menu__box");
  let outT = 0;
  function menu(open) {
    if (!btn || open === box.classList.contains("is-shown")) return;
    btn.classList.toggle("is-active", open);
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    document.body.classList.toggle("is-menu-open", open);
    $(".hj-logo")?.classList.toggle("is-menu", open);
    box.classList.toggle("is-shown", open);
    fill.style.setProperty("--target-h", `${box.clientHeight}px`);
    clearTimeout(outT);
    fill.classList.toggle("is-in", open);
    fill.classList.toggle("is-out", !open);
    if (!open) outT = setTimeout(() => fill.classList.remove("is-out"), 600);
  }
  btn?.addEventListener("click", () => menu(!box.classList.contains("is-shown")));

  // ── Page — mark the current menu, turn on the detail graphic
  // Detail visuals turn on immediately on first load, and when arriving via swup at the end of the transition (the flown-in panel covers it)
  const reveal = () => $(".hj-single__image")?.classList.add("is-shown");
  const view = () => {
    const page = $("main")?.dataset.page;
    $$(".hj-nav li").forEach((li) => (li.dataset.page === page ? li.setAttribute("aria-current", "page") : li.removeAttribute("aria-current")));
  };
  view();
  reveal();

  // ── swup transition (original 4.3.4 + scroll plugin) — swaps only the #page body, fading out and back in over .3s.
  // Work cards are handled not by swup but by frame-fly-page, which flies the image across and then hands over here. When opened as a file swup can’t load, so it usually passes through
  if (!window.Swup || location.protocol === "file:") return;
  const swup = new Swup({
    containers: ["#page"],
    linkSelector: 'a[href$=".html"]:not([data-no-swup]):not([target]), a[data-swup]',
    plugins: window.SwupScrollPlugin ? [new SwupScrollPlugin()] : [],
  });
  document.addEventListener("fx:navigate", (e) => { if (e.detail?.href) { e.preventDefault(); swup.navigate(e.detail.href); } });
  swup.hooks.on("visit:start", () => menu(false));
  swup.hooks.on("page:view", () => { view(); visitor(); });
  swup.hooks.on("visit:end", () => { reveal(); document.dispatchEvent(new Event("fx:land")); });
})();
