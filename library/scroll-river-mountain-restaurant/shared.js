// River loader → fixed river (drawn by whole-document scroll), menu (on phone, menu over the river), appears once when visible.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const root = document.documentElement;
  const body = document.body;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still) root.classList.add("sn-still");
  const fontsIn = () => root.classList.contains("sn-font-wait") && root.classList.replace("sn-font-wait", "sn-font-ready");
  document.fonts.ready.then(fontsIn);
  setTimeout(fontsIn, 3000);

  // ---------- Smooth scroll — Lenis 1.0.19 same as the original, options unchanged. Turned off on iPhone and iPad (including touch Mac) like the original ----------
  let lenis = null;
  const expo = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
  const LenisCtor = window.Lenis || window.lenis;
  const ios = ["iPad", "iPhone"].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  if (!still && !ios && LenisCtor) {
    lenis = new LenisCtor({ duration: 1.2, easing: expo, orientation: "vertical", smoothWheel: true, wheelMultiplier: 0.8, smoothTouch: false, touchMultiplier: 1.5 });
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    lenis.on("scroll", ScrollTrigger.update);
  }
  gsap.ticker.lagSmoothing(0);
  lenis ? lenis.scrollTo(0, { immediate: true }) : scrollTo(0, 0);
  window.snLenis = lenis;
  const goTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 0, duration: 2, easing: expo }) : document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }));
  document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const h = a.getAttribute("href");
    if (h === "#" || !document.querySelector(h)) return;
    e.preventDefault();
    closeNav();
    goTo(h);
  }));

  // ---------- River loader — draws as far as images have loaded (min 2s), then once fully drawn flows away in 1s and turns into a scroll line ----------
  const river = document.querySelector(".sn-river");
  const prog = river.querySelector(".river-progress");
  const preview = river.querySelector(".river-preview");
  const counter = river.querySelector(".sn-river__counter");
  const L = prog.getTotalLength();
  const startScrollLine = () => {
    prog.style.transition = "";
    prog.style.strokeDasharray = `${L}`;
    prog.style.strokeDashoffset = `${L}`;
    preview.classList.add("is-visible");
    gsap.to(prog, {
      strokeDashoffset: 0, ease: "none",
      scrollTrigger: {
        trigger: body, start: "top top", end: () => `+=${root.scrollHeight - innerHeight}`, scrub: 1.5, invalidateOnRefresh: true,
        onUpdate: (st) => preview.classList.toggle("is-visible", st.progress < 0.01),
      },
    });
  };
  const loaded = () => {
    body.classList.add("is-loaded");
    document.dispatchEvent(new CustomEvent("sn:loaded"));
  };
  if (still) {
    prog.style.strokeDasharray = "none";
    river.classList.add("is-white");
    loaded();
  } else {
    prog.style.strokeDasharray = `${L} ${L} ${L}`;
    prog.style.strokeDashoffset = 3 * L;
    const imgs = [...document.images];
    let done = 0, progress = 0, startTime = null;
    imgs.forEach((im) => { if (im.complete) done++; else im.addEventListener("load", () => done++, { once: true }); });
    const minLoad = 2000;
    const step = () => {
      const byTime = ((Date.now() - startTime) / minLoad) * 100;
      const byLoad = imgs.length ? (done / imgs.length) * 100 : 100;
      const target = Math.min(byTime, byLoad, 100);
      progress = Math.min(100, progress + Math.max(-1.5, Math.min(1.5, target - progress)));
      prog.style.strokeDashoffset = 3 * L - (progress / 100) * L;
      counter.textContent = String(Math.round(progress)).padStart(2, "0");
      if (progress >= 100 && Date.now() - startTime >= minLoad) {
        setTimeout(() => {
          loaded();
          prog.style.transition = "stroke-dashoffset 1s ease-in-out";
          prog.style.strokeDashoffset = L;
          setTimeout(() => river.classList.add("is-white"), 1000);
          setTimeout(startScrollLine, 1500);
        }, 500);
      } else requestAnimationFrame(step);
    };
    setTimeout(() => { startTime = Date.now(); step(); }, 500);
  }

  // ---------- Menu — on phone the wave button turns into an X and menu names float over the river stream ----------
  const nav = document.querySelector(".sn-nav");
  const btn = nav.querySelector(".sn-nav__burger");
  function closeNav() {
    if (!nav.classList.contains("is-open")) return;
    nav.classList.remove("is-open");
    river.classList.remove("is-nav-open");
    btn.setAttribute("aria-expanded", "false");
  }
  btn.addEventListener("click", () => {
    river.classList.add("is-nav-anim");
    river.addEventListener("animationend", () => river.classList.remove("is-nav-anim"), { once: true });
    setTimeout(() => {
      const open = nav.classList.toggle("is-open");
      river.classList.toggle("is-nav-open", open);
      btn.setAttribute("aria-expanded", String(open));
    }, 500);
  });
  river.querySelectorAll(".sn-river__links a").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    closeNav();
    goTo(a.getAttribute("href"));
  }));
  addEventListener("resize", () => { if (innerWidth > 1000) closeNav(); });

  // ---------- Once when visible (20%) ----------
  const io = new IntersectionObserver((es, o) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    en.target.classList.add("is-active");
    o.unobserve(en.target);
  }), { threshold: 0.2 });
  document.querySelectorAll(".js-anim").forEach((el) => io.observe(el));

  addEventListener("load", () => ScrollTrigger.refresh());
})();
