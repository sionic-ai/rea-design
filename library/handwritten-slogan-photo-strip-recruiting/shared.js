// Shared by several pages — text and person card slider (arrows move one slot at a time, translate .18s cubic-bezier(.58,.21,.41,.96) starting .035s after the press — values measured from the original Studio slider), drawer menu.
// Appear, flowing photo band and handwriting get motion parts (studio-appear·marquee·lottie-path-draw) attached.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Slider ----------
  const slider = (box) => {
    const track = $("[data-tv-slider-track]", box);
    if (!track) return;
    // Endless loop type — as in the original, pressing Prev on the first slot still shifts one slot right. One copy is attached before and after,
    // Only when touching the edge, it quietly shifts by one set length just before the next slide — no instant jump right after the slide
    const cards = [...track.children], n = cards.length;
    if (!n) return;
    const clone = (c) => { const k = c.cloneNode(true); k.setAttribute("aria-hidden", "true"); k.querySelectorAll("a, button").forEach((x) => x.setAttribute("tabindex", "-1")); return k; };
    track.prepend(...cards.map(clone));
    track.append(...cards.map(clone));
    const all = [...track.children];
    let i = n;
    const step = () => all[1].getBoundingClientRect().left - all[0].getBoundingClientRect().left;
    const place = (animate) => {
      if (!animate) track.style.transition = "none";
      track.style.translate = `${-i * step()}px 0`;
      all.forEach((c, k) => c.classList.toggle("is-active", k === i));
      if (!animate) { track.offsetWidth; track.style.transition = ""; }
    };
    const go = (to) => {
      if (to < 1 || to > 2 * n - 1) { i += to < 1 ? n : -n; to += to < 1 ? n : -n; place(false); }
      i = to;
      place(true);
    };
    $("[data-tv-prev]", box)?.addEventListener("click", () => go(i - 1));
    $("[data-tv-next]", box)?.addEventListener("click", () => go(i + 1));
    new ResizeObserver(() => place(false)).observe(box);
    place(false);
  };

  // ---------- Drawer menu ----------
  const drawer = $("[data-tv-menu]");
  const openBtn = $("[data-tv-menu-open]");
  const setOpen = (on) => {
    if (!drawer) return;
    openBtn?.setAttribute("aria-expanded", String(on));
    if (on) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add("is-open"));
      document.documentElement.style.overflow = "hidden";
    } else {
      drawer.classList.remove("is-open");
      document.documentElement.style.overflow = "";
      setTimeout(() => { if (!drawer.classList.contains("is-open")) drawer.hidden = true; }, 400);
    }
  };
  openBtn?.addEventListener("click", () => setOpen(true));
  $("[data-tv-menu-close]")?.addEventListener("click", () => setOpen(false));
  drawer?.addEventListener("click", (e) => e.target === drawer && setOpen(false));
  addEventListener("keydown", (e) => e.key === "Escape" && setOpen(false));

  // ---------- Page turn: like Studio, the body starts clearing (.18s), moves on 90ms later, and the next page appears at .15s. The browser holds the old screen until it paints the new page, so even that wait reads as clearing, which means the wait should stay short ----------
  const KEY = "tv-page-leave";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (sessionStorage.getItem(KEY)) {
    sessionStorage.removeItem(KEY);
    document.documentElement.classList.add("is-entering");
    requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.remove("is-entering")));
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    const href = a?.getAttribute("href") || "";
    if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || reduce || !/^[\w-]+\.html$/.test(href)) return;
    e.preventDefault();
    setOpen(false);
    sessionStorage.setItem(KEY, "1");
    document.documentElement.classList.add("is-leaving");
    setTimeout(() => (location.href = href), 90);
  });
  addEventListener("pageshow", (e) => e.persisted && document.documentElement.classList.remove("is-leaving"));

  const start = () => $$("[data-tv-slider]").forEach(slider);
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
