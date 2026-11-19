// Interaction shared by all pages: first-visit cover, dropdown header bar, phone menu, search window, first-page header logo, page transition blur.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const KEY = "bx-came-from";

  // Cover — the original only hides the blank screen before the app attaches, and lifts the moment it attaches. If the font doesn’t arrive within 300ms, it shows a lifting transition instead (text blur .6s after .4s, curtain 1s after .8s)
  const cover = document.querySelector(".bx-cover");
  if (cover) {
    const gone = () => cover.classList.add("is-gone");
    let late = false;
    const t = setTimeout(() => (late = true), 300);
    (document.fonts?.ready || Promise.resolve()).then(() => {
      clearTimeout(t);
      if (!late || reduce) return gone();
      cover.classList.add("is-out");
      setTimeout(gone, 1800);
    });
  }

  // Page transition — when going to another page of ours, blurs the current panel out in .5s and leaves. The arriving side settles in over .5s after .3s
  const page = document.querySelector(".bx-page");
  if (page && sessionStorage.getItem(KEY) && !reduce) {
    sessionStorage.removeItem(KEY);
    page.classList.add("is-entering");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      page.classList.add("is-entered");
      page.classList.remove("is-entering");
      setTimeout(() => page.classList.remove("is-entered"), 900);
    }));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !page || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(?:[?#].*)?$/.test(href)) return;
    e.preventDefault();
    sessionStorage.setItem(KEY, location.pathname);
    document.body.classList.add("is-navigating");
    if (reduce) { location.href = href; return; }
    page.classList.add("is-leaving");
    setTimeout(() => (location.href = href), 500);
  });
  addEventListener("pageshow", (e) => { if (e.persisted && page) { page.classList.remove("is-leaving"); document.body.classList.remove("is-navigating"); } });

  const nav = document.querySelector(".bx-nav");
  if (!nav) return;
  const bar = nav.querySelector(".bx-nav__bar");

  // Dropdown — the header row height grows by the link rows (around .25s, proportional to the growing height, cubic-bezier(0,0,.75,1)). Pressing the same button again, clicking outside, or Esc closes it
  const buttons = [...nav.querySelectorAll(".bx-nav__item[aria-controls]")];
  let openId = null;
  const setHeight = (h) => {
    const from = nav.getBoundingClientRect().height;
    nav.style.setProperty("--drop-dur", `${Math.min(0.4, Math.max(0.12, Math.abs(h - from) / 1200)).toFixed(3)}s`);
    nav.style.setProperty("--nav-h", `${h}px`);
  };
  const closeDrop = () => {
    openId = null;
    buttons.forEach((b) => b.setAttribute("aria-expanded", "false"));
    nav.querySelectorAll(".bx-drop").forEach((d) => d.classList.remove("is-on"));
    nav.classList.remove("is-open");
    setHeight(bar.offsetHeight);
    setTimeout(() => { if (!openId) nav.querySelectorAll(".bx-drop").forEach((d) => (d.hidden = true)); }, 260);
  };
  buttons.forEach((b) => b.addEventListener("click", () => {
    const id = b.getAttribute("aria-controls");
    if (openId === id) return closeDrop();
    openId = id;
    buttons.forEach((x) => x.setAttribute("aria-expanded", String(x === b)));
    nav.querySelectorAll(".bx-drop").forEach((d) => { d.hidden = d.id !== id; d.classList.remove("is-on"); });
    const drop = nav.querySelector(`#${id}`);
    // Draw the revealed board once before turning it on so the .1s fade runs
    void drop.offsetWidth;
    drop.classList.add("is-on");
    nav.classList.add("is-open");
    setHeight(bar.offsetHeight + drop.offsetHeight);
  }));
  document.addEventListener("click", (e) => { if (openId && !nav.contains(e.target)) closeDrop(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { if (openId) closeDrop(); closeSearch(); } });
  addEventListener("scroll", () => { if (openId && scrollY > 120) closeDrop(); }, { passive: true });

  // Phone menu — header opens to full screen height
  const toggle = nav.querySelector(".bx-nav__toggle");
  toggle?.addEventListener("click", () => {
    const on = nav.classList.toggle("is-mobile-open");
    toggle.setAttribute("aria-expanded", String(on));
    toggle.setAttribute("aria-label", on ? "Close Menu" : "Open Menu");
    nav.style.removeProperty("--nav-h");
    root.classList.toggle("is-modal-open", on);
    nav.classList.toggle("is-scrolled", on || scrollY > 375);
  });

  // First page header row (phone) — the logo only shows after scrolling down past 375px (.2s ease-in)
  if (nav.classList.contains("bx-nav--landing")) {
    const tick = () => nav.classList.toggle("is-scrolled", scrollY > 375 || nav.classList.contains("is-mobile-open"));
    addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // Search window — opens instantly full screen. Two tabs (Search · AI chat)
  const search = document.querySelector(".bx-search");
  function closeSearch() {
    if (!search?.classList.contains("is-open")) return;
    search.classList.remove("is-open");
    root.classList.remove("is-modal-open");
  }
  nav.querySelector(".bx-nav__search")?.addEventListener("click", () => {
    if (!search) return;
    search.classList.add("is-open");
    root.classList.add("is-modal-open");
    search.querySelector("input")?.focus({ preventScroll: true });
  });
  search?.querySelector(".bx-search__close")?.addEventListener("click", closeSearch);
  search?.querySelectorAll(".bx-tabs button").forEach((b, i, all) => b.addEventListener("click", () => {
    all.forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    search.querySelectorAll(".bx-search__pane").forEach((p, j) => (p.hidden = j !== i));
  }));
})();
