// Shared by all pages — menu panel, cookie panel, bottom bar, page-transition progress bar and handwritten heading
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FX = (window.FX = window.FX || {});

  /* Menu — the panel unfolds from .25 in .5s expo.inOut, and rows slide in 4rem, each delayed by .07(i+1)+.1s (original Tailwind transitions as is) */
  const header = document.querySelector(".fx-header");
  if (header) {
    const burger = header.querySelector(".fx-burger");
    const menu = header.querySelector(".fx-menu");
    const set = (open) => {
      header.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      if (!open) menu.classList.remove("is-sub");
    };
    burger.addEventListener("click", () => set(!header.classList.contains("is-open")));
    document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    document.addEventListener("pointerdown", (e) => { if (header.classList.contains("is-open") && !menu.contains(e.target) && !burger.contains(e.target)) set(false); });
    const sub = menu.querySelector("[data-sub]");
    const list = menu.querySelector(".fx-menu__sublist");
    const measure = () => { if (list) menu.style.setProperty("--sub-w", `${list.scrollWidth + 1}px`); };
    measure();
    document.fonts?.ready.then(measure);
    menu.querySelectorAll(".fx-menu__item").forEach((li) => {
      li.addEventListener("mouseenter", () => menu.classList.toggle("is-sub", li.contains(sub)));
    });
    sub?.addEventListener("click", () => { measure(); menu.classList.toggle("is-sub"); });
    FX.showHeader = (on) => header.classList.toggle("is-hidden", !on);

    /* Logo — on every hover a gold light band sweeps from the bottom (+91%) to the top (−107%) over 1.25s power2.out (measured, the original settles at .98s). Releasing leaves it as is (original) */
    const logo = header.querySelector(".fx-logo"), shine = logo?.querySelector(".fx-logo__shine");
    if (logo && shine && !reduce && window.gsap) {
      gsap.set(shine, { y: 0, yPercent: 91 });
      logo.addEventListener("mouseenter", () => gsap.fromTo(shine, { y: 0, yPercent: 91 }, { yPercent: -107, duration: 1.25, delay: 0.04, ease: "power2.out", overwrite: true }));
    }
  }

  /* Cookie panel — once chosen, it doesn’t reappear for this visit */
  const cookie = document.querySelector(".fx-cookie");
  FX.showCookie = () => { if (cookie && !sessionStorage.getItem("fx-cookie")) cookie.classList.remove("is-gone"); };
  cookie?.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => { sessionStorage.setItem("fx-cookie", "1"); cookie.classList.add("is-gone"); }));
  if (cookie && sessionStorage.getItem("fx-cookie")) cookie.classList.add("is-gone");

  /* Bottom band — flows one set width endlessly at 84px per second (min 5s, in .25s steps) — speed obtained by measuring the original */
  document.querySelectorAll(".fx-marquee").forEach((m) => {
    const track = m.querySelector(".fx-marquee__track");
    const unit = track?.firstElementChild;
    if (!unit) return;
    const fill = () => {
      while (track.children.length > 2) track.lastElementChild.remove();
      const w = unit.getBoundingClientRect().width;
      if (!w) return;
      const copies = Math.max(1, Math.ceil(m.clientWidth / w)) + 1;
      for (let i = track.children.length; i < copies; i++) track.appendChild(unit.cloneNode(true)).setAttribute("aria-hidden", "true");
      track.style.setProperty("--marquee-shift", `-${w}px`);
      track.style.setProperty("--marquee-duration", `${Math.max(5, Math.round((w / 84) * 4) / 4)}s`);
    };
    new ResizeObserver(fill).observe(m);
    document.fonts?.ready.then(fill);
  });

  /* Page transition — the nprogress bar of the original (Next router + nextjs-toploader). On click the bar stands, and the new page picks it up and fills it to the end */
  if (window.NProgress) {
    NProgress.configure({ minimum: 0.08, easing: "ease", speed: 200, trickle: true, trickleSpeed: 200, showSpinner: true });
    const from = sessionStorage.getItem("fx-progress");
    if (from) {
      sessionStorage.removeItem("fx-progress");
      NProgress.set(+from);
      const end = () => NProgress.done();
      document.readyState === "complete" ? setTimeout(end, 60) : addEventListener("load", end);
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
      const u = new URL(a.href, location.href);
      if (u.origin !== location.origin || u.pathname === location.pathname || !/\.html$/.test(u.pathname)) return;
      NProgress.start();
      sessionStorage.setItem("fx-progress", String(NProgress.status || 0.08));
    });
  }

  /* Handwriting heading — in the original a Lottie that plays once when visible (speed 1.6). The stroke is drawn and the fill fills in at the same spot */
  const writes = document.querySelectorAll(".fx-write");
  const wio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-written"); wio.unobserve(e.target); } }), { threshold: 0 });
  writes.forEach((n) => {
    const t = n.querySelector("text");
    if (t) {
      const fit = () => { const b = t.getBBox(); if (b.width) n.setAttribute("viewBox", `${b.x - 4} ${b.y - 4} ${b.width + 8} ${b.height + 8}`); };
      fit();
      document.fonts?.ready.then(fit);
    }
    wio.observe(n);
  });
})();
