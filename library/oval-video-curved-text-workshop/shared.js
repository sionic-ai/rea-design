// Plugs in the header · phone menu · footer · loader in one place, and with barba (page-swap-fade) clears that section’s choreography and re-applies it each time only the body changes.
// As in the original (GL.func.*), Lenis (lerp .1) only on wide screens, the loader lifts in 1s, .2s after the hero art has fully loaded.
(() => {
  const body = document.body;
  // Like the original, when a hand reaches a link, prefetch the next section (@barba/prefetch) — it must be attached before page-swap-fade inits
  if (window.barba && window.barbaPrefetch) barba.use(barbaPrefetch);
  const SP = matchMedia("(max-width: 780px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NAV_L = [["Home", "index.html", "index"], ["Shop About", "about.html", "about"], ["Hands-on workshop", "workshop.html", "workshop"]];
  const NAV_R = [["Reservation", "#", ""], ["Getting here", "access.html", "access"], ['<span class="sh-lat">Online shop</span>', "#", ""], ['<span class="sh-lat">Instagram</span>', "#", ""]];
  // Original logo drawing spot — SVG redrawing the two-line text logo in our font
  const logo = '<svg viewBox="0 0 154 49" aria-hidden="true"><text x="77" y="27" text-anchor="middle" font-size="30" font-weight="400">brand name</text><text x="77" y="46" text-anchor="middle" font-size="15" font-weight="600">atelier</text></svg>';
  const li = ([t, h, p]) => `<li><a class="sh-nav__a" href="${h}"${h === "#" ? " data-barba-prevent" : ""} data-ns="${p}">${t}</a></li>`;
  const nav = (tag) => `<div class="sh-nav"><div class="_l"><ul>${NAV_L.map(li).join("")}</ul></div><${tag} class="sh-logo-wrap" data-label="Your two-line English store wordmark here"><a class="sh-logo" href="index.html" aria-label="Back to start">${logo}</a></${tag}><div class="_r"><ul>${NAV_R.map(li).join("")}</ul></div></div>`;
  const wrap = document.querySelector('[data-barba="wrapper"]');
  wrap.insertAdjacentHTML("afterbegin", `<header class="sh-header" data-slot="header">${nav("h1")}</header>`);
  wrap.insertAdjacentHTML("beforeend", `<footer class="sh-footer" data-slot="footer" data-fx-part="fade">${nav("div")}</footer>`);
  body.insertAdjacentHTML("beforeend", `<button class="sh-burger" type="button" aria-expanded="false" aria-controls="sh-sp-nav"><span class="_o">Menu</span><span class="_c">Close</span></button>
<nav id="sh-sp-nav" data-slot="sp-menu"><ul>${[...NAV_L, ...NAV_R].map(([t, h]) => `<li><a href="${h}"${h === "#" ? " data-barba-prevent" : ""}>${t}</a></li>`).join("")}</ul></nav>
<div id="sh-loader" data-slot="loader"></div>`);

  const markCurrent = (ns) => {
    body.dataset.page = ns;
    document.querySelectorAll(".sh-nav__a").forEach((a) => (a.dataset.ns && a.dataset.ns === ns ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")));
  };
  markCurrent(document.querySelector('[data-barba="container"]').dataset.barbaNamespace);

  // Phone menu — scroll lock after .35s once opened, closes with Esc
  const burger = document.querySelector(".sh-burger");
  const setNav = (on) => { body.classList.toggle("_gnav", on); burger.setAttribute("aria-expanded", String(on)); document.documentElement.style.overflow = on ? "hidden" : ""; };
  burger.addEventListener("click", () => setNav(!body.classList.contains("_gnav")));
  document.querySelectorAll("#sh-sp-nav a").forEach((a) => a.addEventListener("click", () => setNav(false)));
  addEventListener("keyup", (e) => e.key === "Escape" && setNav(false));

  // Smooth scroll — original Lenis({ lerp: .1, duration: 1, easing: 1 − (1 − t)^7 }), off on phones
  let lenis = null;
  if (!SP.matches && !reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1, duration: 1, easing: (t) => 1 - Math.pow(1 - t, 7) });
    lenis.on("scroll", () => window.ScrollTrigger?.update());
  }
  window.shLenis = lenis;

  // While a hand is over the header menu, the sub-section header photo blurs by 6px and the top shadow deepens (original _hdr)
  const hdrNav = document.querySelector(".sh-header .sh-nav");
  if (!SP.matches) {
    hdrNav.addEventListener("mouseenter", () => body.classList.add("_hdr"));
    hdrNav.addEventListener("mouseleave", () => body.classList.remove("_hdr"));
  }

  // The header drops in only within the top 50px of the first page
  const top = () => {
    body.classList.toggle("_top", scrollY >= 0 && scrollY <= 50);
    const head = document.querySelector(".sh-pagehead"), bar = document.querySelector(".sh-header .sh-nav");
    body.classList.toggle("_under", !!head && head.getBoundingClientRect().bottom <= bar.getBoundingClientRect().height);
  };
  addEventListener("scroll", top, { passive: true });
  top();

  // ── Section reveal: _in when visible, parallax inside photo slots, oval button magnet ──
  let offs = [];
  const initPage = (root) => {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const d = +(el.dataset.animDelayIn || 0);
      setTimeout(() => el.classList.add("_in"), d * 1000);
      io.unobserve(el);
    }), { rootMargin: "0px 0px -10% 0px" });
    root.querySelectorAll('[data-anim="mask-grd"], [data-anim="fade"]').forEach((el) => (reduce ? el.classList.add("_in") : io.observe(el)));
    offs.push(() => io.disconnect());
    // Original LazyLoader — fetches images when they come generously close to the right and bottom of the screen (100% and 150%), then _on
    const lazy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      requestAnimationFrame(() => e.target.classList.add("_on"));
      lazy.unobserve(e.target);
    }), { rootMargin: "0px 100% 150% 0px" });
    root.querySelectorAll("[data-lazy]").forEach((el) => lazy.observe(el));
    offs.push(() => lazy.disconnect());
    if (!reduce && window.gsap) {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll("[data-plx]").forEach((box) => {
          const inner = box.querySelector("[data-plx-inner]");
          const r = +(box.dataset.plxPercent || 16);
          if (box.dataset.plx === "top") gsap.fromTo(inner, { yPercent: 0 }, { yPercent: r, ease: "none", scrollTrigger: { trigger: box, start: "top top", end: "bottom top", scrub: true } });
          else gsap.fromTo(inner, { yPercent: -r }, { yPercent: r, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
      offs.push(() => mm.revert());
    }
    const page = window.shPages?.[body.dataset.page];
    if (page) offs.push(page(root, { lenis, reduce, sp: SP.matches }) || (() => {}));
  };
  const killPage = () => { offs.forEach((f) => f()); offs = []; };

  document.addEventListener("fx:page-leave", () => { body.classList.add("_move"); body.classList.remove("_move_after"); killPage(); });
  document.addEventListener("fx:page-enter", (e) => {
    markCurrent(e.detail.namespace);
    lenis?.scrollTo(0, { immediate: true, force: true });
    top();
    body.classList.remove("_move");
    body.classList.add("_move_after");
    initPage(e.detail.container);
    window.ScrollTrigger?.refresh();
  });

  // Loader — waits for the Hero image, then lifts after .2s over 1s (power1.inOut)
  const loader = document.getElementById("sh-loader");
  // The original waits for the Hero image (img) — the Hero media in this copy is a placeholder video, so it waits for its first frame
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
  const media = [...document.querySelectorAll("img, video")].filter(inView);
  const ready = (m) => (m.tagName === "VIDEO" ? m.readyState >= 2 : m.complete) ? 0 : new Promise((r) => { m.addEventListener(m.tagName === "VIDEO" ? "loadeddata" : "load", r, { once: true }); m.addEventListener("error", r, { once: true }); setTimeout(r, 4000); });
  Promise.all(media.map(ready)).then(() => {
    body.classList.add("_load");
    if (reduce) loader.remove();
    else loader.animate({ opacity: [1, 0] }, { delay: 200, duration: 1000, easing: "cubic-bezier(0.455,0.03,0.515,0.955)", fill: "forwards" }).finished.then(() => loader.remove());
    setTimeout(() => initPage(document.querySelector('[data-barba="container"]')), 100);
  });
})();
