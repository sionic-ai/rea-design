// Motion shared by all pages: figure silhouettes · icon art groups, loader (0.9s after load → disappears at 0.75s), fixed sky background (Swiper fade, 6s overlap), phone menu drawer.
(() => {
  // Silhouette used in place of the original’s 3D person cutout — pose only via a head circle and thick rounded lines
  const limb = (d, w) => `<path d="${d}" fill="none" stroke-width="${w}"/>`;
  const head = (x, y, r = 14) => `<circle cx="${x}" cy="${y}" r="${r}" stroke="none"/>`;
  const FIGS = {
    stand: head(50, 22) + limb("M50 44V116", 30) + limb("M36 50L31 118M64 50L69 118", 12) + limb("M44 124L42 232M56 124L58 232", 15),
    run: head(60, 22) + limb("M57 44L48 114", 28) + limb("M50 52L31 80L40 102M62 52L80 70L94 56", 11) + limb("M48 120L70 160L63 214M48 120L30 170L8 180", 15),
    fall: head(50, 62) + limb("M50 82V148", 28) + limb("M41 86L24 44L30 10M59 86L78 46L74 12", 11) + limb("M45 154L30 194L44 232M55 154L74 190L66 228", 15),
    kick: head(38, 30) + limb("M41 52L52 120", 28) + limb("M38 60L16 98M46 60L72 82", 11) + limb("M50 124L45 232M55 124L94 94", 15),
    dress: head(50, 22, 12) + limb("M50 40V88", 20) + `<path d="M37 86H63L78 172H22Z" stroke="none"/>` + limb("M41 46L30 112M59 46L70 112", 8) + limb("M42 172V232M58 172V232", 9),
    bust: `<ellipse cx="100" cy="86" rx="54" ry="66" stroke="none"/><path d="M30 60Q100 -8 170 60L176 72Q100 40 24 72Z" stroke="none"/><path d="M8 240Q14 168 100 160Q186 168 192 240Z" stroke="none"/>`,
  };
  const BOX = { stand: "0 0 100 240", run: "0 0 100 240", fall: "0 0 100 240", kick: "0 0 100 240", dress: "0 0 100 240", bust: "0 0 200 240" };
  const ICONS = {
    x: '<path d="M4 3h4.5l4 5.6L17.3 3H20l-6.2 7.2L21 21h-4.5l-4.4-6.1L6.8 21H4l6.9-8z"/>',
    insta: '<path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm5 3.5a4.5 4.5 0 110 9 4.5 4.5 0 010-9zm0 2a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM17.5 5.5a1 1 0 110 2 1 1 0 010-2z"/>',
    tube: '<path d="M22 8.2a3 3 0 00-2-2.1C18.2 5.6 12 5.6 12 5.6s-6.2 0-8 .5a3 3 0 00-2 2.1A31 31 0 001.6 12 31 31 0 002 15.8a3 3 0 002 2.1c1.8.5 8 .5 8 .5s6.2 0 8-.5a3 3 0 002-2.1 31 31 0 00.4-3.8 31 31 0 00-.4-3.8zM10 15V9l5.2 3z"/>',
    close: '<path d="M5 3.6L12 10.6 19 3.6 20.4 5 13.4 12 20.4 19 19 20.4 12 13.4 5 20.4 3.6 19 10.6 12 3.6 5z"/>',
    down: '<path d="M11 3h2v13.2l4.6-4.6 1.4 1.4-7 7-7-7 1.4-1.4 4.6 4.6z"/>',
  };
  const sprite = document.createElement("div");
  sprite.innerHTML =
    '<svg class="mh-defs" aria-hidden="true" focusable="false">' +
    Object.entries(FIGS).map(([k, v]) => `<symbol id="mh-fig-${k}" viewBox="${BOX[k]}"><g class="mh-fig">${v}</g></symbol>`).join("") +
    Object.entries(ICONS).map(([k, v]) => `<symbol id="mh-ico-${k}" viewBox="0 0 24 24">${v}</symbol>`).join("") +
    "</svg>";
  document.body.prepend(sprite.firstChild);

  /* ── Phone turned landscape: opens the screen as a 1440-wide PC layout (original spYokoView) ── */
  if (innerWidth < 766 && innerHeight < innerWidth) document.querySelector('meta[name="viewport"]')?.setAttribute("content", "width=1440");

  /* ── Loader ─────────────────────────────────────────── */
  const loader = document.querySelector(".mh-loader");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let loaded = false;
  const hideLoader = () => {
    if (loaded || !loader) return;
    loaded = true;
    if (reduce) return loader.remove();
    // jQuery delay(900).fadeOut(750) — swing has the same shape as sine.inOut
    gsap.to(loader, { autoAlpha: 0, duration: 0.75, delay: 0.9, ease: "sine.inOut", onComplete: () => loader.remove() });
  };
  // Original hashLinkScroll: when opened with a hash address, it goes to the top after load, then 100ms later jumps straight to that spot — to the place after all chapter pins have been set
  let hashDone = false;
  const hashScroll = () => {
    if (hashDone) return;
    hashDone = true;
    const t = location.hash && document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!t) return;
    scrollTo(0, 0);
    setTimeout(() => scrollTo(0, t.getBoundingClientRect().top + scrollY), 100);
  };
  addEventListener("load", () => { hideLoader(); hashScroll(); });
  setTimeout(() => { hideLoader(); hashScroll(); }, 10000);

  /* ── Fixed sky background ─────────────────────────────────── */
  // Original Swiper 8.2.6 fade (speed 6000 · loop · autoplay delay 0 · no manual swiping) — one slide overlaps into the next over 6 seconds and never rests
  if (document.querySelector("#bg-slide") && window.Swiper) {
    new Swiper("#bg-slide", {
      effect: "fade",
      speed: 6000,
      loop: true,
      allowTouchMove: false,
      autoplay: reduce ? false : { delay: 0, stopOnLastSlide: false, disableOnInteraction: false, reverseDirection: false },
    });
  }

  /* ── Phone menu drawer ── */
  const header = document.querySelector(".mh-header");
  const menuBtn = document.querySelector(".mh-menu-btn");
  if (menuBtn) {
    menuBtn.addEventListener("click", () => {
      const open = header.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    header.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => header.classList.remove("is-open")));
  }
})();
