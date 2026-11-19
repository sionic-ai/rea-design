// Fixed header (logo, MENU, BOOK NOW), full-screen menu, loader, fixed back layer, footer — a one-page site, but bundled so other pages can share them when pulled out
const GL = (() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PC = matchMedia("(min-width: 801px)");

  // Handwritten wordmark slot — not the original logo, newly drawn with a loop doodle and two wave lines of the same size and weight
  const mark = (big) => big
    ? `<svg class="gl-mark" viewBox="0 0 220 150" aria-label="Studio Name" data-label="Handwritten logo drawing + one line below with the brand’s English subtitle in lowercase"><path d="M30 70c10-30 20-50 14-52s-14 30-10 52c3 16 14 10 18-4 4-12 0-20-6-16-8 6 0 22 12 16 6-4 8-14 12-14s2 16 8 14 6-14 12-14-2 16 6 14 6-16 6-30c0 20 2 34 10 30s4-14 10-14 0 14 8 12 8-12 8-12"/><path d="M60 92c14-8 26 8 40 0s26 8 40 0 22 6 30 2"/><path d="M78 106c12-6 22 6 34 0s22 6 34 0"/><circle cx="104" cy="26" r="3.2"/><circle cx="114" cy="26" r="3.2"/><text x="110" y="136" font-size="14" text-anchor="middle" letter-spacing="1">studio name here</text></svg>`
    : `<svg class="gl-mark" viewBox="0 0 180 44" aria-label="Studio Name" data-label="Handwritten logo art (small)"><path d="M8 30c6-4 10-4 12 0s-8 6-6 0 10-8 14-2-2 10 4 6 6-12 10-12-2 12 6 10 4-10 8-10 0 10 6 8 4-14 4-24c0 14 0 26 8 24s2-12 8-12 0 12 8 10 6-10 10-10 0 12 8 10 6-8 10-8-2 10 6 8"/><circle cx="66" cy="12" r="2.6"/><circle cx="74" cy="12" r="2.6"/></svg>`;
  const insta = '<svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="0.6"/></svg>';
  const LINKS = [["#top", "TOP"], ["#concept", "CONCEPT"], ["#rooms", "ROOMS"], ["#food", "FOOD"], ["#facilities", "FACILITIES &amp; <br class=\"gl-br-sp\">SIGHT SEEING"], ["#access", "ACCESS"]];

  const nav = document.querySelector(".gl-nav");
  nav.innerHTML = `<a class="gl-nav__logo gl-upper" href="#top" data-jump>${mark(false)}</a>
    <div class="gl-nav__menu gl-upper" role="button" tabindex="0" aria-expanded="false">MENU</div>
    <button class="gl-nav__close" type="button" aria-label="Close Menu"><i></i><i></i></button>
    <button class="gl-nav__burger gl-upper" type="button" aria-label="Menu"><i></i><i></i><i></i></button>
    <a class="gl-nav__book gl-upper" href="#"><span>BOOK<br> NOW</span></a>
    <div class="gl-nav__inner"><ul class="gl-nav__links">${LINKS.map(([h, t]) => `<li><a href="${h}" data-jump>${t}</a></li>`).join("")}<li><a href="#" aria-label="Social Media">${insta}</a></li><li class="is-term"><a href="#">Stay Terms</a></li></ul></div>`;
  document.querySelectorAll("[data-logo=large]").forEach((el) => (el.innerHTML = mark(true)));

  const footer = document.querySelector(".gl-footer");
  footer.innerHTML = `<div class="gl-footer__inner">
      <ul class="gl-footer__news">${["Your latest post goes here as one line, truncated with an ellipsis…", "Your second post line here", "Your third post line here, running long."].map((t, i) => `<li><a href="#"><span class="date">2026.0${9 - i}.${10 + i * 7}</span><span>${t}</span></a></li>`).join("")}</ul>
      <div class="gl-footer__info"><p data-label="Your brand’s English name here">Studio Name</p><p>Your one-line address here 0000-0</p>
        <ul class="gl-footer__links">${LINKS.map(([h, t]) => `<li><a href="${h}" data-jump>${t}</a></li>`).join("")}<li><a href="#" aria-label="Social Media">${insta}</a></li><li class="is-term"><a href="#">Stay Terms</a></li></ul>
      </div>
      <p class="gl-footer__copy">Copyright © ${new Date().getFullYear()} <span data-label="Your brand’s English name here">Studio Name</span> All rights reserved.</p>
    </div>`;

  // ScrollSmoother (smooth 1) on PC only — the original also builds it only above 800px
  let smoother = null;
  if (PC.matches && !reduce) smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1, effects: true });

  const open = (v) => {
    nav.classList.toggle("is-open", v);
    nav.querySelector(".gl-nav__menu").setAttribute("aria-expanded", v);
    smoother?.paused(v);
  };
  nav.querySelector(".gl-nav__menu").addEventListener("click", () => open(true));
  nav.querySelector(".gl-nav__menu").addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(true)));
  nav.querySelector(".gl-nav__close").addEventListener("click", () => open(false));
  nav.querySelector(".gl-nav__burger").addEventListener("click", () => open(!nav.classList.contains("is-open")));
  nav.querySelectorAll(".gl-nav__inner a, .gl-nav__book").forEach((a) => a.addEventListener("click", () => open(false)));
  addEventListener("keyup", (e) => e.key === "Escape" && open(false));

  document.querySelectorAll("a[data-jump]").forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    if (smoother) smoother.scrollTo(t, true, "top top");
    else scrollTo({ top: scrollY + t.getBoundingClientRect().top, behavior: reduce ? "auto" : "smooth" });
  }));

  // Turn on back layer — original toggleClass as-is: turns on when entering, turns off when scrolling back above the first line (later layers sit on top, so earlier layers stay on)
  const back = (name) => document.querySelector(`.gl-back [data-back=${name}]`);
  const layer = (name, trigger, start, end = "bottom -50%") =>
    ScrollTrigger.create({ trigger, start, end, toggleClass: { targets: back(name), className: "is-on" } });
  const upper = () => document.querySelectorAll(".gl-upper");
  // Overlapping ranges exist, so if one ends while another is still alive, keep black
  const blackOn = new Set();
  const blackWhile = (trigger, start, end) =>
    ScrollTrigger.create({ trigger, start, end, onToggle: (st) => {
      st.isActive ? blackOn.add(st) : blackOn.delete(st);
      upper().forEach((el) => el.classList.toggle("is-black", blackOn.size > 0));
    } });

  // Once when visible: text rises 35px, photo goes 1.1→1
  const anims = () => document.querySelectorAll(".anim-fade, .anim-zoom").forEach((el) =>
    ScrollTrigger.create({ trigger: el, start: "top 90%", end: "bottom top", onEnter: () => el.classList.add("is-anim") }));

  // Loader: the original starts lifting the mint curtain 1s after DOMContentLoaded (2s fade) and turns on the head decoration and the hero logo at 1.5s
  const load = () => {
    setTimeout(() => document.querySelector(".gl-loading").classList.add("is-load"), reduce ? 0 : 1000);
    setTimeout(() => {
      nav.classList.add("is-load");
      document.querySelector(".gl-scroll").classList.add("is-on");
      document.querySelectorAll(".top").forEach((t) => t.classList.add("is-load"));
    }, reduce ? 0 : 1500);
  };
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", load);
  else load();

  return { reduce, PC, smoother, layer, blackWhile, anims, back };
})();
