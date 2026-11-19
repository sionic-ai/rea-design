// Shared for the whole site — Lenis (original 1.3.17 · duration 1.2), header sticking/hiding, menu panel, transition curtain (olive panel + logo line), reveal,
// Big title letter lift, photo parallax (1.12x · -6% → +6%), bottom inner drop-in, cursor tag. Motion that differs per page is attached to T by that page’s js.
(() => {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desk = () => innerWidth >= 1024;
  const T = (window.T = { reduce, desk });

  /* Smooth scroll */
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, prevent: (n) => !!n?.closest?.(".no-lenis, [data-lenis-prevent]") });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    T.lenis = lenis;
  }

  /* Header — past the hero height it sticks as a background-colored band, hides on scroll down and shows on scroll up */
  const head = document.querySelector(".t-head");
  if (head) {
    let last = scrollY;
    const tick = () => {
      const y = scrollY, past = y > (head.dataset.after ? +head.dataset.after : innerHeight * 0.5);
      head.classList.toggle("is-scrolled", past);
      head.classList.toggle("is-hidden", past && y > last + 2);
      if (y < last - 2) head.classList.remove("is-hidden");
      last = y;
    };
    addEventListener("scroll", tick, { passive: true });
    tick();
  }

  /* Menu Panel */
  const menu = document.querySelector(".t-menu");
  if (menu) {
    const panel = menu.querySelector(".t-menu__panel"), box = menu.querySelector(".t-menu__box"), back = menu.querySelector(".t-menu__back");
    const big = [...menu.querySelectorAll(".t-menu__nav li")], sub = [...menu.querySelectorAll(".t-menu__sub span")];
    const tl = gsap.timeline({ paused: true, onReverseComplete: () => menu.classList.remove("is-open") });
    tl.fromTo(panel, { width: 0, height: 0 }, { width: () => box.offsetWidth, height: () => box.offsetHeight, duration: 0.7, ease: "power3.inOut" }, "start")
      .fromTo(back, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power3.inOut" }, "start")
      .fromTo(big, { y: 20, filter: "blur(10px)", opacity: 0 }, { y: 0, filter: "blur(0px)", opacity: 1, ease: "power2.out", stagger: 0.05, duration: 0.3 }, "-=0.2")
      .fromTo(sub, { yPercent: 100 }, { yPercent: 0, ease: "power2.out", stagger: 0.05, duration: 0.3 }, "-=0.2");
    const opener = document.querySelector("[data-menu-open]");
    const open = (v) => {
      opener?.setAttribute("aria-expanded", v);
      root.classList.toggle("lock-scroll", v);
      if (v) { menu.classList.add("is-open"); T.lenis?.stop(); tl.timeScale(1).play(); }
      else { T.lenis?.start(); tl.timeScale(1.4).reverse(); }
    };
    opener?.addEventListener("click", () => open(true));
    menu.querySelector(".t-menu__close").addEventListener("click", () => open(false));
    back.addEventListener("click", () => open(false));
    addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) open(false); });
    T.closeMenu = () => open(false);
  }

  /* Transition curtain — when going to another page of the same site, an olive panel fills from below (.8s power2.inOut) and logo lines are drawn .25s apart before moving on */
  const veil = document.querySelector(".t-veil");
  const paths = veil ? [...veil.querySelectorAll("path")] : [];
  paths.forEach((p) => { const n = p.getTotalLength(); p.style.setProperty("--full", n); gsap.set(p, { strokeDasharray: n, strokeDashoffset: n }); });
  // The original also starts with the transition curtain covering on first open, lifting upward, and turns on appearing from 30% lifted (body.no-loader)
  let ready = false;
  const go = () => { if (ready) return; ready = true; root.classList.add("is-ready"); watch(); };
  if (veil && root.classList.contains("is-arriving")) {
    gsap.set(paths, { strokeDashoffset: 0 });
    // The original curtain (logo) holds until the page is fully loaded — measured, it differs per page (loader first 4.1s · About 3.4s · record sheet 2.7s · Gallery 2.3s)
    // Holds for html[data-hold] seconds then lifts. Code that pulls it out should reduce this value or set it to 0
    const hold = reduce ? 0 : +(root.dataset.hold ?? 1);
    gsap.set(veil, { clipPath: "inset(0% 0% 0% 0%)" });
    const lift = () => gsap.to(veil, {
      clipPath: "inset(0% 0% 100% 0%)", delay: hold, duration: reduce ? 0 : 0.8, ease: "power2.inOut",
      onUpdate: function () { if (this.progress() >= 0.3) go(); },
      onComplete: () => { go(); root.classList.remove("is-arriving"); gsap.set(veil, { clearProps: "clipPath" }); },
    });
    if (document.readyState === "complete") lift(); else addEventListener("load", lift, { once: true });
    sessionStorage.removeItem("t-veil");
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || !veil || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const href = a.getAttribute("href");
    if (!/^[\w-]+\.html(#.*)?$/.test(href)) return;
    e.preventDefault();
    T.closeMenu?.();
    T.lenis?.stop();
    veil.classList.add("is-on");
    if (reduce) { location.href = href; return; }
    gsap.set(paths, { strokeDashoffset: (i, p) => p.getTotalLength() });
    gsap.to(paths, { strokeDashoffset: 0, duration: 0.8, ease: "sine.out", stagger: 0.25, delay: 0.2 });
    gsap.fromTo(veil, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.8, ease: "power2.inOut", onComplete: () => { sessionStorage.setItem("t-veil", "1"); setTimeout(() => { location.href = href; }, Math.max(0, 200 + 250 * (paths.length - 1))); } });
  });
  addEventListener("pageshow", (e) => { if (e.persisted && veil) { veil.classList.remove("is-on"); gsap.set(veil, { clearProps: "clipPath" }); T.lenis?.start(); } });

  /* Big title — words are grouped and letters split (spaces kept as they are). When shown, they rise at .05 intervals */
  let ci = 0;
  document.querySelectorAll(".t-title [data-split]").forEach((line) => {
    const words = line.textContent.split(/(\s+)/);
    line.textContent = "";
    words.forEach((w) => {
      if (/^\s+$/.test(w)) { line.append(w); return; }
      const ws = document.createElement("span");
      ws.className = "w";
      for (const ch of w) { const c = document.createElement("span"); c.className = "c"; c.style.setProperty("--i", ci++ % 20); c.textContent = ch; ws.append(c); }
      line.append(ws);
    });
  });

  /* One-line title — the viewBox is refit whenever the text box changes (even if the typeface loads late) */
  document.querySelectorAll(".t-fill svg").forEach((svg) => {
    const text = svg.querySelector("text");
    let last = "";
    const fit = () => { const b = text.getBBox(); const v = `${Math.floor(b.x)} ${Math.floor(b.y)} ${Math.ceil(b.width)} ${Math.ceil(b.height)}`; if (b.width && v !== last) { svg.setAttribute("viewBox", v); last = v; } };
    new ResizeObserver(fit).observe(svg);
    document.fonts?.ready.then(fit);
    fit();
  });

  /* Reveal — .in-view is added when entering the viewport (original useInView) */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  function watch() { document.querySelectorAll("[data-in-view]:not(.in-view)").forEach((el) => io.observe(el)); }
  if (!veil) go();
  T.watch = watch;

  /* Photo parallax — inner panel scaled 1.12x, moving -6% → +6% while the section passes through the screen */
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-parallax]").forEach((box) => {
      const inner = box.firstElementChild;
      if (!inner) return;
      const k = +(box.dataset.parallax || 0.12), n = 100 * Math.abs(k);
      gsap.set(inner, { scale: 1 + Math.abs(k) });
      gsap.fromTo(inner, { yPercent: -0.5 * n }, { yPercent: 0.5 * n, ease: "none", scrollTrigger: { trigger: box, start: "top bottom", end: "bottom top", scrub: true } });
    });
    // Hero — while the section exits upward, the two lines move opposite by 5%, the text block lags by half its height, the cover stays in place (original sticky cover)
    document.querySelectorAll(".t-hero").forEach((hero) => {
      const lines = hero.querySelectorAll(".t-hero__line"), box = hero.querySelector(".t-hero__in"), cover = hero.querySelector(".t-hero__stick");
      ScrollTrigger.create({
        trigger: hero, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true,
        onUpdate: (st) => {
          const p = st.progress, h = hero.offsetHeight;
          if (desk() && lines.length > 1) { const x = gsap.utils.mapRange(0, 1, 0, 5, p); gsap.set(lines[0], { xPercent: x }); gsap.set(lines[1], { xPercent: -x }); }
          gsap.set(box, { y: h * 0.5 * p });
          if (cover) gsap.set(cover, { y: h * p });
        },
      });
    });
    const foot = document.querySelector(".t-foot"), fin = foot?.querySelector(".t-foot__in");
    if (foot && fin && desk()) gsap.to(fin, { y: "80%", ease: "none", scrollTrigger: { trigger: foot, start: "top bottom", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
  });

  /* Cursor label — one per section, starts at screen center +15px, and within the section sticks to the mouse +15px (original Hero label · LargeGallery cursor).
     When leaving the section or hovering over a button or link, the text rolls 23px down and hides (.4s (.19,1,.22,1)) */
  document.querySelectorAll("[data-tag]").forEach((zone) => {
    const tag = document.createElement("span");
    tag.className = "t-tag";
    tag.setAttribute("aria-hidden", "true");
    tag.innerHTML = `<span>${zone.dataset.tag}</span>`;
    zone.append(tag);
    gsap.set(tag, { x: innerWidth / 2 + 15, y: innerHeight / 2 + 15 });
    const move = (e) => { gsap.set(tag, { x: e.clientX + 15, y: e.clientY + 15 }); tag.classList.toggle("is-off", !!e.target.closest?.("a, button")); };
    zone.addEventListener("mouseenter", move);
    zone.addEventListener("mousemove", move);
    zone.addEventListener("mouseleave", () => tag.classList.add("is-off"));
  });

  /* Word color-in — words in the large paragraph shift from pale beige to olive at .1 intervals (screen center → top) */
  T.reveal = () => mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-reveal-words]").forEach((p) => {
      const split = SplitText.create(p, { type: "words", aria: "hidden", autoSplit: true });
      const from = getComputedStyle(root).getPropertyValue("--kf-raised").trim(), to = getComputedStyle(p).color;
      gsap.fromTo(split.words, { color: from }, { color: to, stagger: 0.1, ease: "none", scrollTrigger: { trigger: p.closest("section") || p, start: "top center", end: "top top", scrub: true } });
    });
  });
  /* Cookie notice — closes once chosen */
  const cookie = document.querySelector(".t-cookie");
  cookie?.querySelectorAll("[data-cookie]").forEach((b) => b.addEventListener("click", () => cookie.classList.add("is-gone")));
  // Pressing Settings expands the options area from 0 to full height (.45s after .25s) and the button text changes to ”Save settings”
  const more = cookie?.querySelector(".t-cookie__more"), moreBtn = cookie?.querySelector("[data-cookie-more]");
  moreBtn?.addEventListener("click", () => {
    const o = !cookie.classList.contains("is-more");
    cookie.classList.toggle("is-more", o);
    moreBtn.setAttribute("aria-expanded", o);
    moreBtn.textContent = o ? "Save settings" : "Settings";
    gsap.fromTo(more, { height: o ? 0 : more.scrollHeight }, { height: o ? more.scrollHeight : 0, delay: reduce ? 0 : 0.1, duration: reduce ? 0 : 0.4, ease: "power2.inOut", onComplete: () => { more.style.height = o ? "auto" : ""; } });
  });

  addEventListener("load", () => ScrollTrigger.refresh());
  document.fonts?.ready.then(() => { T.reveal(); ScrollTrigger.refresh(); });
})();
