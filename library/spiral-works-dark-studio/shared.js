// All pages — Lenis (original 1.3.26 defaults), header swapping, sun/moon toggle (light version), phone menu, cookie card, footer V mark rising in
(() => {
  const root = document.documentElement, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const THEME = "brand-theme";
  if (localStorage.getItem(THEME) === "light") root.dataset.theme = "light";

  gsap.registerPlugin(ScrollTrigger);
  const lenis = reduce ? null : new Lenis();
  if (lenis) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.vLenis = lenis;

  // Header: scroll down even a little and a blurred panel and bottom line spread in .5s
  const head = document.querySelector(".v-head");
  const onScroll = () => head?.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Sun/moon — switches the background between black and white and remembers it on the next visit
  const sw = document.querySelector(".v-switch");
  const paint = () => sw?.setAttribute("aria-checked", String(root.dataset.theme === "light"));
  // Original swaps the panel one beat late after the press (~90ms more, ~200ms when measured), and the color transitions in .22s
  sw?.addEventListener("click", () => setTimeout(() => {
    if (root.dataset.theme === "light") delete root.dataset.theme; else root.dataset.theme = "light";
    localStorage.setItem(THEME, root.dataset.theme || "dark");
    paint();
  }, 90));
  paint();

  // Phone menu
  const burger = document.querySelector(".v-burger"), drawer = document.querySelector(".v-drawer");
  burger?.addEventListener("click", () => {
    const open = drawer.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    open ? lenis?.stop() : lenis?.start();
  });

  // Cookie card — pressing either side closes it and remembers the choice
  const cookie = document.querySelector(".v-cookie"), COOKIE = "brand-cookie";
  if (cookie && sessionStorage.getItem(COOKIE)) cookie.remove();
  cookie?.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { cookie.classList.add("is-gone"); sessionStorage.setItem(COOKIE, "1"); }));

  // Footer V mark — floats up over 1.2s when visible, sinks back when it leaves
  const mark = document.querySelector(".v-mark");
  if (mark) new IntersectionObserver(([e]) => mark.classList.toggle("is-shown", e.isIntersecting), { threshold: 0.15 }).observe(mark);
})();
