// Motion shared by all pages: Lenis smooth scroll (lerp .09), menu panel dropping from above, footer signature letters, cookie bar.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The original starts at the top whenever the route changes — even when arriving by back, scroll position isn’t restored
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);

  let lenis = null;
  if (!reduced() && window.Lenis) {
    lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false, lerp: 0.09 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  window.sdSite = { lenis };

  // ── Menu Panel ──
  // On open: the panel comes down top to bottom with clip-path over 1.6s, big links at 1.32s with .09s stagger, photo at 1.6s, small info at 1.8s.
  // On close, rewinds the same timeline 1.7x faster and hides the panel when fully rewound (the original removes the panel from the document).
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.getElementById("main-menu");
  if (toggle && menu) {
    let tl = null;
    let open = false;
    const build = () => {
      const links = gsap.utils.toArray(".menu-link", menu);
      const media = menu.querySelector(".menu__media");
      const info = gsap.utils.toArray(".menu__info--studio, .menu__info--location, .menu__info--contact", menu);
      gsap.set(menu, { clipPath: "inset(0% 0% 100% 0%)", pointerEvents: "auto" });
      gsap.set(links, { yPercent: 108, autoAlpha: 0 });
      if (media) gsap.set(media, { y: 22, scale: 1.028, autoAlpha: 0 });
      gsap.set(info, { y: 12, autoAlpha: 0 });
      const t = gsap.timeline({
        paused: true,
        onReverseComplete: () => {
          tl = null;
          menu.hidden = true;
          gsap.set([menu, ...links, ...info, media].filter(Boolean), { clearProps: "all" });
        },
      });
      t.to(menu, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6, ease: "power2.inOut" }, 0);
      t.to(links, { yPercent: 0, autoAlpha: 1, duration: 0.65, stagger: 0.09, ease: "power3.out" }, 1.32);
      if (media) t.to(media, { y: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "power3.out" }, 1.6);
      t.to(info, { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.06, ease: "power2.out" }, 1.8);
      return t;
    };
    const setState = (v) => {
      open = v;
      toggle.classList.toggle("is-open", v);
      toggle.setAttribute("aria-expanded", String(v));
      toggle.setAttribute("aria-label", v ? "Close Menu" : "Open Menu");
      menu.setAttribute("aria-hidden", String(!v));
    };
    const show = () => {
      setState(true);
      // Draw the first frame where the button turns into an X first, and defer the heavy work of unfolding and measuring the panel to the next frame — the original also attaches the panel after the state changes
      requestAnimationFrame(() => {
        if (!open) return;
        menu.hidden = false;
        if (reduced()) return;
        if (tl) { gsap.set(menu, { pointerEvents: "auto" }); tl.timeScale(1).play(); return; }
        tl = build();
        tl.play(0);
      });
    };
    const hide = () => {
      setState(false);
      if (reduced() || !tl) { menu.hidden = true; return; }
      gsap.set(menu, { pointerEvents: "none" });
      tl.timeScale(1.7).reverse();
    };
    toggle.addEventListener("click", () => (open ? hide() : show()));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) hide(); });
    menu.querySelectorAll(".menu-link").forEach((a) => a.addEventListener("click", hide));
  }

  // ── Footer signature: once it passes the bottom 20% of the screen, letters rise from 115% below in 2s at .04s stagger ──
  const sig = document.querySelector(".site-footer__signature");
  if (sig) {
    const chars = gsap.utils.toArray(".char", sig);
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.set(chars, { yPercent: 115 });
      let tween = null;
      const io = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        tween = gsap.to(chars, { yPercent: 0, duration: 2, ease: "expo.out", stagger: { each: 0.04, from: "start" } });
        io.disconnect();
      }, { threshold: 0, rootMargin: "0px 0px -20% 0px" });
      io.observe(sig);
      return () => { io.disconnect(); tween?.kill(); };
    });
  }

  // ── Cookie bar: if no choice has been made yet, it floats up from the bottom after 8 seconds (as in the original — so it doesn’t cover the hero intro) ──
  const KEY = "sd-cookie-consent";
  const banner = document.querySelector(".cookie");
  if (banner) {
    const consent = () => { try { const v = localStorage.getItem(KEY); return v === "accepted" || v === "rejected" ? v : null; } catch { return null; } };
    if (!consent()) setTimeout(() => { if (!consent()) banner.hidden = false; }, 8000);
    banner.querySelectorAll("[data-consent]").forEach((b) => b.addEventListener("click", () => {
      try { localStorage.setItem(KEY, b.dataset.consent); } catch {}
      banner.hidden = true;
    }));
  }
})();
