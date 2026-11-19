// Loader, pill nav, phone menu, cursor dot and smooth scroll are shared by every page.
// Page scripts light the loader letters with PK.progress(0..1) and call PK.ready() when ready.
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The original loader text follows the real progress (Pace) of receiving the model — the copy follows the real progress of building the room (PK.progress) and doesn’t hold it separately
  const MIN_LOADER_MS = 0;
  const t0 = performance.now();

  gsap.registerPlugin(ScrollTrigger);

  let lenis = null;
  if (!reduce && window.Lenis) {
    // Same build as the original (@studio-freight/lenis 1.0.33), same settings — 1.2s duration, stops with an expo shape
    lenis = new Lenis({ duration: 1.2, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)), smoothTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  const fill = document.querySelector(".pk-loader__fill");
  const letters = [];
  if (fill) {
    const text = fill.textContent;
    fill.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.textContent = ch;
      fill.append(s);
      letters.push(s);
    }
  }
  let shown = 0;
  let target = 0;
  const light = () => {
    // Follow the later of actual progress and minimum time, lighting letters one by one
    const timeP = Math.min(1, (performance.now() - t0) / Math.max(1, MIN_LOADER_MS));
    const p = Math.min(target, timeP);
    const n = Math.floor(p * letters.length + 0.0001);
    while (shown < n) letters[shown++].classList.add("is-lit");
    if (shown < letters.length || !doneCalled) requestAnimationFrame(light);
  };
  let doneCalled = false;
  requestAnimationFrame(light);

  const PK = (window.PK = {
    reduce,
    lenis,
    progress(p) { target = Math.max(target, Math.min(1, p)); },
    ready() {
      target = 1;
      const wait = Math.max(0, MIN_LOADER_MS - (performance.now() - t0));
      setTimeout(() => {
        doneCalled = true;
        letters.forEach((s) => s.classList.add("is-lit"));
        root.classList.add("is-loaded");
        // Original: 1.5s after the loader clears, the first section’s text (scene-content.loaded) comes in
        setTimeout(() => root.classList.add("is-ready"), reduce ? 0 : 1500);
        lenis && lenis.start();
        document.dispatchEvent(new CustomEvent("pk:loaded"));
      }, wait + 50);
    },
    maxScroll: () => document.documentElement.scrollHeight - innerHeight,
    jump(frac) {
      const y = Math.round(PK.maxScroll() * frac);
      // The original nav doesn’t scroll smoothly, it jumps to that room at once
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else scrollTo(0, y);
      ScrollTrigger.update();
    },
  });

  // Pressing the name, like the original, a white curtain rises from below to cover the screen (first 1/3 of 2.5s), stays, then exits upward — it moves to the first position while covered.
  // Menu name moves straight to that spot
  const wipe = document.querySelector(".pk-wipe");
  let wiping = 0;
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-jump]");
    if (!a) return;
    e.preventDefault();
    closeMenu();
    const to = Number(a.dataset.jump);
    if (!wipe || reduce || !a.matches(".pk-bar__name, .pk-menu__name")) return PK.jump(to);
    clearTimeout(wiping);
    wipe.classList.remove("is-on");
    void wipe.offsetWidth;
    wipe.classList.add("is-on");
    wiping = setTimeout(() => PK.jump(to), 2500 / 3);
  });
  wipe?.addEventListener("animationend", () => wipe.classList.remove("is-on"));

  // Icon links are written only in the Contact card and copied to the bottom of the phone menu
  const socials = document.querySelector(".pk-contact [data-socials]");
  document.querySelectorAll("[data-socials]:empty").forEach((el) => socials && (el.innerHTML = socials.innerHTML));

  const menu = document.querySelector(".pk-menu");
  const openMenu = () => {
    if (!menu) return;
    menu.classList.add("is-open");
    menu.removeAttribute("inert");
    root.classList.add("menu-open");
    lenis && lenis.stop();
  };
  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("inert", "");
    root.classList.remove("menu-open");
    lenis && lenis.start();
  }
  document.querySelector(".pk-bar__menu")?.addEventListener("click", openMenu);
  menu?.querySelector(".pk-menu__close")?.addEventListener("click", closeMenu);
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());

  // Cursor dot (original curDot settings as is): only when the window is wider than 960px, it appears on the first mouse move and approaches by 1/6 of the remaining distance per frame.
  // Over a link the target diameter becomes 10 × −1, passing 0 at the same 1/6 step and vanishing (negative widths are ignored so it stops at the last small width), and returns to 10 on leaving.
  const dot = document.querySelector(".pk-cursor");
  if (dot && innerWidth > 960) {
    const D = 10, EASE = reduce ? 1 : 6;
    const to = { x: 0, y: 0, o: 0, d: D }, at = { x: 0, y: 0, o: 0, d: D };
    let started = false;
    const step = () => {
      for (const k of ["x", "y", "o", "d"]) at[k] += (to[k] - at[k]) / EASE;
      dot.style.transform = `translate3d(${at.x - at.d / 2}px, ${at.y - at.d / 2}px, 0)`;
      dot.style.opacity = at.o;
      dot.style.width = dot.style.height = `${at.d}px`;
      requestAnimationFrame(step);
    };
    addEventListener("mousemove", (e) => {
      to.x = e.clientX;
      to.y = e.clientY;
      to.o = 1;
      if (started) return;
      started = true;
      at.x = to.x;
      at.y = to.y;
      step();
    }, { passive: true });
    document.querySelectorAll("a, input[type='submit']").forEach((el) => {
      el.addEventListener("mouseover", () => (to.d = D * -1));
      el.addEventListener("mouseout", () => (to.d = D));
    });
  }
})();
