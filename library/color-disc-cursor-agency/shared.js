// Behavior shared by the whole site — loader bar · body transition (framer variants .4s/.6s delay) · header bar scroll state · menu panel · floating input labels · embla carousel (dots)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  // framer runs opacity transitions without a given curve via WAAPI, so the default is a straight line (linear)
  const fadeEase = "none";

  // Loader bar — first fills from the left in .4s (inOut-circ), then once full it clears to the right
  const bar = document.querySelector(".mk-loader");
  const fill = (then) => {
    if (!bar) return then?.();
    bar.classList.remove("is-done");
    requestAnimationFrame(() => { bar.style.transform = "scaleX(1)"; });
    setTimeout(() => then?.(), reduce ? 0 : 400);
  };
  const clear = () => { if (!bar) return; bar.classList.add("is-done"); bar.style.transform = "scaleX(0)"; };

  // The original body sits inside AnimatePresence (initial off), so on first open it just stands there, and it only appears in .4s (after .6s) when entering via a page change.
  // The footer is attached anew on each address, so it appears at .4s (after 1s) even on first load. Whether we arrived by navigating is known from a mark left on leaving
  const main = document.querySelector("main");
  const foot = document.querySelector(".mk-foot");
  const NAV = "mk-nav";
  const enter = () => {
    let via = false;
    try { via = sessionStorage.getItem(NAV) === "1"; sessionStorage.removeItem(NAV); } catch (_) {}
    if (reduce) { gsap.set([main, foot], { opacity: 1 }); clear(); return; }
    if (via) {
      fill(clear);
      if (main) gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.6, ease: fadeEase, clearProps: "opacity" });
    }
    if (foot) gsap.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 1, ease: fadeEase, clearProps: "opacity" });
  };
  enter();
  addEventListener("pageshow", (e) => { if (e.persisted) { gsap.set([main, foot], { opacity: 1 }); clear(); } });

  // Links between our own pages pull the body away in .4s (while the bar fills) then navigate
  document.addEventListener("click", (e) => {
    const a = e.target instanceof Element && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    closeMenu();
    if (reduce) { location.href = href; return; }
    try { sessionStorage.setItem(NAV, "1"); } catch (_) {}
    gsap.to([main, foot], { opacity: 0, duration: 0.4, ease: fadeEase });
    fill(() => { location.href = href; });
  });

  // Header bar — scrolling even slightly lays down a background and vertical padding goes 24→12px (.3s)
  const head = document.querySelector(".mk-head");
  const measure = () => head && root.style.setProperty("--s-header", `${head.offsetHeight}px`);
  const onScroll = () => { head?.classList.toggle("is-scrolled", scrollY > 0); };
  onScroll();
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", measure);
  head?.addEventListener("transitionend", measure);
  requestAnimationFrame(measure);

  // Menu panel — Contact and the two-line button open the same panel. Esc closes it
  const toggles = document.querySelectorAll("[data-mk-menu]");
  const menu = document.querySelector(".mk-menu");
  function setMenu(open) {
    root.classList.toggle("is-menu-open", open);
    root.style.overflow = open ? "hidden" : "";
    toggles.forEach((b) => b.setAttribute("aria-expanded", String(open)));
    menu?.setAttribute("aria-hidden", String(!open));
    if (menu) menu.inert = !open;
  }
  function closeMenu() { if (root.classList.contains("is-menu-open")) setMenu(false); }
  setMenu(false);
  // The original changes state after the press, draws, then adds a class to html in an effect — measured, it starts opening 30~80ms late
  let pend = 0;
  toggles.forEach((b) => b.addEventListener("click", () => {
    const want = !root.classList.contains("is-menu-open");
    clearTimeout(pend);
    pend = setTimeout(() => setMenu(want), reduce ? 0 : 30);
  }));
  addEventListener("keydown", (e) => e.key === "Escape" && closeMenu());
  menu?.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());
  document.querySelector(".mk-foot__form")?.addEventListener("submit", (e) => e.preventDefault());

  // Floating label — when there is a value the label stays raised
  document.querySelectorAll(".mk-field input, .mk-field textarea").forEach((inp) => {
    const sync = () => inp.closest(".mk-field").classList.toggle("is-filled", !!inp.value);
    inp.addEventListener("input", sync);
    inp.addEventListener("blur", sync);
  });

  // embla carousel — original c-carousel settings (skipSnaps · inViewThreshold 1 · duration 25 · center/left align) and dots
  window.mkCarousel = (box, opts = {}) => {
    const view = box.querySelector(".mk-embla");
    if (!view || !window.EmblaCarousel) return null;
    const api = EmblaCarousel(view, { align: "start", containScroll: "trimSnaps", skipSnaps: true, inViewThreshold: 1, duration: 25, ...opts });
    const dots = box.querySelector(".mk-dots");
    if (dots) {
      const draw = () => {
        dots.innerHTML = api.scrollSnapList().map((_, i) => `<button type="button" aria-label="${i + 1}As the Nth"></button>`).join("");
        dots.hidden = api.scrollSnapList().length <= 1;
        [...dots.children].forEach((b, i) => b.addEventListener("click", () => api.scrollTo(i)));
        mark();
      };
      const mark = () => [...dots.children].forEach((b, i) => b.classList.toggle("is-on", i === api.selectedScrollSnap()));
      api.on("init", draw).on("reInit", draw).on("select", mark);
      draw();
    }
    return api;
  };
  document.querySelectorAll("[data-mk-carousel]").forEach((box) => {
    const narrow = matchMedia("(max-width: 1025px)");
    let api = null;
    const sync = () => {
      if (narrow.matches && !api) api = mkCarousel(box);
      else if (!narrow.matches && api) { api.destroy(); api = null; }
    };
    sync();
    narrow.addEventListener("change", sync);
  });

  // Be·Say·Do — on phone the description is a carousel, so pressing a panel makes the carousel follow, and swiping the carousel makes the orbit follow
  document.querySelectorAll("[data-fx~='orbit-trio-cycle']").forEach((philo) => {
    const box = philo.querySelector(".mk-philo__mob");
    if (!box) return;
    const narrow = matchMedia("(max-width: 1025px)");
    let api = null;
    const sync = () => {
      if (narrow.matches && !api) {
        api = mkCarousel(box, { align: "center" });
        api?.on("select", () => philo.dispatchEvent(new CustomEvent("fx:go", { detail: { index: api.selectedScrollSnap() } })));
      } else if (!narrow.matches && api) { api.destroy(); api = null; }
    };
    sync();
    narrow.addEventListener("change", sync);
    philo.addEventListener("fx:pick", (e) => api?.scrollTo(e.detail.index));
  });

  // Same spring as framer useSpring (mass 1) — takes the scroll value and passes every frame the value that lagged behind by the stiffness and damping
  window.mkSpring = (stiffness, damping, onUpdate) => {
    let x = null, v = 0, target = 0, raf = 0, last = 0;
    const tick = (now) => {
      const dt = Math.min(0.064, Math.max(0.001, (now - last) / 1000));
      last = now;
      let t = dt;
      while (t > 0) {
        const h = Math.min(t, 1 / 240);
        v += (-stiffness * (x - target) - damping * v) * h;
        x += v * h;
        t -= h;
      }
      if (Math.abs(x - target) < 0.01 && Math.abs(v) < 0.01) { x = target; v = 0; raf = 0; onUpdate(x); return; }
      onUpdate(x);
      raf = requestAnimationFrame(tick);
    };
    return (to) => {
      target = to;
      if (x === null || reduce) { x = to; onUpdate(x); return; }
      if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    };
  };

  // Video slot — loops silently on its own like the original, pauses when off screen
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    const v = en.target;
    if (en.isIntersecting) v.play?.().catch(() => {});
    else v.pause?.();
  }), { threshold: 0.01 });
  document.querySelectorAll("video[data-mk-auto]").forEach((v) => { v.muted = true; io.observe(v); });
})();
