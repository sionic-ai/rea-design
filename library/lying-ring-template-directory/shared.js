// Behavior shared across a whole site — lenis (lerp .165 · wheel 1.25)·template expand (interaction raise)·dot menu island·price/language expand·search placeholder text swap·cookie·FAQ·big word marquee·footer wordmark marquee
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  gsap.registerPlugin(ScrollTrigger);

  // Original lenis setup — tied to gsap.ticker instead of autoRaf so it runs in the same frame as ScrollTrigger
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ smoothWheel: true, syncTouch: false, lerp: 0.165, wheelMultiplier: 1.25, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.bwLenis = lenis;
  }

  // Island unfold — original X/K (back.out(2), .6x, yPercent −6.2) · link G (.031 stagger, y 3.72)
  const ISLAND = { duration: 0.496, yPercent: -6.2, scale: 0.6, ease: "back.out(2)" };
  const DROP = { ...ISLAND, duration: 0.496 * 0.585, yPercent: -6.2 * 0.585 };
  // The template unfold’s opacity, per measurements of the original (average of three pages), is set apart from the panel size with .12s cubic-bezier(.2,.1,.4,.9)
  const fadeIn = (x) => { let lo = 0, hi = 1, t = x; for (let i = 0; i < 20; i++) { t = (lo + hi) / 2; if (0.6 * t * (1 - t) ** 2 + 1.2 * t * t * (1 - t) + t ** 3 < x) lo = t; else hi = t; } return 0.3 * t * (1 - t) ** 2 + 2.7 * t * t * (1 - t) + t ** 3; };
  const openIsland = (panel, spec, links, ownFade) => {
    gsap.killTweensOf(panel);
    const tl = gsap.timeline();
    tl.fromTo(panel, { autoAlpha: 0, yPercent: spec.yPercent, scale: spec.scale }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: reduce ? 0 : spec.duration, ease: spec.ease });
    if (ownFade && !reduce) tl.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: fadeIn, immediateRender: false }, 0);
    if (links?.length && !reduce) tl.fromTo(links, { opacity: 0, y: spec === ISLAND ? 3.72 : 2.18 }, { opacity: 1, y: 0, duration: spec === ISLAND ? 0.1984 : 0.116, stagger: spec === ISLAND ? 0.031 : 0.018, ease: "power2.out" }, spec === ISLAND ? 0.1364 : 0);
    return tl;
  };
  // Closing uses the original values (template expand .17s · island .75x length) power2.in
  const closeIsland = (panel, spec) => {
    // Template expand shrinks to 79% over .15s with power2.in, then jumps to the end value at the finish (the original .169s curve cut off at .15s)
    if (spec === DROP && !reduce) {
      gsap.to(panel, { autoAlpha: 0, yPercent: spec.yPercent, scale: spec.scale, duration: 0.15, ease: (p) => (p >= 1 ? 1 : 0.79 * p * p), overwrite: "auto" });
      return;
    }
    gsap.to(panel, { autoAlpha: 0, yPercent: spec.yPercent, scale: spec.scale, duration: reduce ? 0 : spec === DROP ? 0.17 : 0.75 * spec.duration, ease: "power2.in", overwrite: "auto" });
  };

  // Template unfold — opens on hover and closes on release (press works the same)
  document.querySelectorAll("[data-bw-dd]").forEach((dd) => {
    const panel = dd.querySelector(".bw-island"), btn = dd.querySelector("button");
    if (!panel || !btn) return;
    const links = [...panel.querySelectorAll("a, button")];
    let open = false, t = 0;
    const show = () => { clearTimeout(t); if (open) return; open = true; dd.classList.add("is-open"); btn.setAttribute("aria-expanded", "true"); openIsland(panel, DROP, links, true); };
    const hide = () => { if (!open) return; open = false; dd.classList.remove("is-open"); btn.setAttribute("aria-expanded", "false"); closeIsland(panel, DROP); };
    // Hover devices open on hover and close after a pause once released (original measured: the panel starts moving about .15s after release) — a press only opens. (On non-hover devices it toggles open/close)
    if (fine) { dd.addEventListener("mouseenter", () => { clearTimeout(t); t = setTimeout(show, 25); }); dd.addEventListener("mouseleave", () => { clearTimeout(t); t = setTimeout(hide, 110); }); }
    btn.addEventListener("click", () => (open && !fine ? hide() : show()));
    document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  });

  // Price·language dropdown — on click it opens at .98 scale in .15s (original Radix dropdown)
  document.querySelectorAll("[data-bw-pick]").forEach((pick) => {
    const btn = pick.querySelector(":scope > button"), panel = pick.querySelector(".bw-island");
    if (!btn || !panel) return;
    const up = pick.classList.contains("bw-pick--up");
    // Like Radix, each open attaches a new outer frame at the end of the document (at first outside above translate(0,-200%), data-state=closed),
    // Opens in the next frame, moved beside the button. When closed, the frame is detached after .16s
    let wrap = null, open = false, park = 0;
    const set = (v) => {
      open = v; pick.classList.toggle("is-open", v); btn.setAttribute("aria-expanded", String(v));
      clearTimeout(park);
      if (v && !wrap) {
        wrap = document.createElement("div");
        wrap.className = "bw-pick__panel";
        wrap.append(panel);
        document.body.append(wrap);
        wrap.setAttribute("data-state", "closed");
      }
      const w0 = wrap;
      if (!w0) return;
      // Rest one frame, add a position-measuring mark, then move on the next frame — the original floating-ui also measures the button and attaches on the next frame
      requestAnimationFrame(() => { w0.style.setProperty("--side", up ? "top" : "bottom"); requestAnimationFrame(() => {
        if (v) {
          const r = btn.getBoundingClientRect(), w = panel.offsetWidth, h = panel.offsetHeight;
          w0.style.transform = `translate(${Math.round(up ? r.right - w : r.left + r.width / 2 - w / 2)}px, ${Math.round(up ? r.top - h - 6 : r.bottom + 6)}px)`;
        }
        w0.classList.toggle("is-open", v);
        panel.classList.toggle("is-open", v);
        w0.setAttribute("data-state", v ? "open" : "closed");
      }); });
      if (!v) park = setTimeout(() => { if (!open && wrap === w0) { w0.remove(); pick.append(panel); wrap = null; } }, 160);
    };
    btn.addEventListener("pointerdown", (e) => { if (e.button === 0) { e.stopPropagation(); set(!open); } });
    btn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(!open); } });
    addEventListener("scroll", () => open && set(false), { passive: true });
    panel.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { btn.querySelector("span").textContent = b.textContent; set(false); }));
    document.addEventListener("pointerdown", (e) => open && !pick.contains(e.target) && !wrap?.contains(e.target) && set(false));
  });

  // Dot menu island — on wide screens, hovering the dot pops it open from the top right at .6x scale over .29s back.out(2) and the dot rotates 180°, on release it closes .1s later over the same length with back.in(2).
  // On phone, tapping opens a full-screen panel in island form (.496s)
  const dots = document.querySelector(".bw-dots"), menu = document.querySelector(".bw-menu");
  if (dots && menu) {
    const links = [...menu.querySelectorAll("a")];
    let open = false, t = 0;
    const wideNow = () => innerWidth >= 768;
    const set = (v) => {
      if (v === open) return;
      open = v; dots.setAttribute("aria-expanded", String(v)); dots.classList.toggle("is-open", v);
      if (wideNow()) {
        gsap.killTweensOf(menu);
        if (v) {
          gsap.fromTo(menu, { autoAlpha: 0, yPercent: DROP.yPercent, scale: DROP.scale }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: reduce ? 0 : DROP.duration, ease: "back.out(2)" });
          if (!reduce) gsap.fromTo(links, { opacity: 0, y: 2.18 }, { opacity: 1, y: 0, duration: 0.116, stagger: 0.018, ease: "power2.out" });
        }
        else gsap.to(menu, { autoAlpha: 0, yPercent: DROP.yPercent, scale: DROP.scale, duration: reduce ? 0 : DROP.duration, ease: "back.in(2)" });
      } else if (v) openIsland(menu, ISLAND, links); else closeIsland(menu, ISLAND);
      if (lenis) v && !wideNow() ? lenis.stop() : lenis.start();
    };
    if (fine) {
      const on = () => { clearTimeout(t); if (wideNow()) set(true); };
      const off = () => { t = setTimeout(() => wideNow() && set(false), 70); };
      [dots, menu].forEach((n) => { n.addEventListener("mouseenter", on); n.addEventListener("mouseleave", off); });
    }
    dots.addEventListener("click", (e) => { e.stopPropagation(); if (!(fine && wideNow())) set(!open); });
    document.addEventListener("click", (e) => open && !menu.contains(e.target) && !dots.contains(e.target) && set(false));
    document.addEventListener("keydown", (e) => e.key === "Escape" && open && set(false));
  }

  // Search placeholder text — every 4s the word fades out over 492ms cubic-bezier(.42,0,.58,1), then changes to the next word and reappears (original setInterval 4000)
  document.querySelectorAll(".bw-search__word").forEach((w) => {
    const words = [...w.children].map((c) => c.textContent);
    if (words.length < 2 || reduce) return;
    w.textContent = words[0];
    let i = 0;
    setInterval(() => {
      if (document.hidden) return;
      w.style.opacity = "0";
      setTimeout(() => { i = (i + 1) % words.length; w.textContent = words[i]; w.style.opacity = "1"; }, 492);
    }, 4000);
  });

  // Cookie
  document.querySelector(".bw-cookie button")?.addEventListener("click", (e) => e.currentTarget.closest(".bw-cookie").classList.add("is-gone"));

  // FAQ — open one at a time, height .34s cubic-bezier(.65,0,.35,1)
  document.querySelectorAll(".bw-faq").forEach((faq) => {
    faq.querySelectorAll(".bw-faq__item").forEach((item) => {
      const q = item.querySelector(".bw-faq__q"), a = item.querySelector(".bw-faq__a");
      q.addEventListener("click", () => {
        const opening = !item.classList.contains("is-open");
        faq.querySelectorAll(".bw-faq__item.is-open").forEach((o) => {
          if (o === item) return;
          const oa = o.querySelector(".bw-faq__a");
          oa.style.height = oa.scrollHeight + "px"; oa.offsetHeight; oa.style.height = "0px";
          o.classList.remove("is-open"); o.querySelector(".bw-faq__q").setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("is-open", opening);
        q.setAttribute("aria-expanded", String(opening));
        if (opening) { a.style.height = a.scrollHeight + "px"; }
        else { a.style.height = a.scrollHeight + "px"; a.offsetHeight; a.style.height = "0px"; }
      });
      a.addEventListener("transitionend", () => { if (item.classList.contains("is-open")) a.style.height = "auto"; ScrollTrigger.refresh(); });
    });
  });

  // Big word marquee — two rows flow in opposite directions at 120px per second, and while the section center passes from 65% to 35% of the screen it hands over to the second row (power1.inOut, scrub .4)
  document.querySelectorAll(".bw-marq").forEach((m) => {
    const tracks = [...m.querySelectorAll(".bw-marq__track")], stack = m.querySelector(".bw-marq__stack"), mask = m.querySelector(".bw-marq__mask");
    if (reduce || !tracks.length) return;
    const loops = tracks.map((t, i) => {
      const w = t.querySelector(".bw-marq__set").getBoundingClientRect().width;
      const dur = Math.max(8, w / 120);
      return i % 2 === 0 ? gsap.fromTo(t, { x: 0 }, { x: -w, duration: dur, ease: "none", repeat: -1 }) : gsap.fromTo(t, { x: -w }, { x: 0, duration: dur, ease: "none", repeat: -1 });
    });
    ScrollTrigger.create({ trigger: m, start: "top bottom", end: "bottom top", onToggle: (s) => loops.forEach((l) => (s.isActive ? l.play() : l.pause())) });
    if (stack && tracks.length > 1) gsap.fromTo(stack, { y: 0 }, { y: () => -mask.clientHeight, ease: "power1.inOut", immediateRender: false, scrollTrigger: { trigger: m, start: m.dataset.start || "center 65%", end: m.dataset.end || "center 35%", scrub: 0.4, invalidateOnRefresh: true } });
  });

  // Footer wordmark — flows at 100px per second, and rolling the wheel speeds it to 2.5× of 2.5× in .2s, then after .5s returns in 1s to 1× in the rolled direction (reversed when rolling up)
  const ft = document.querySelector(".bw-foot__track");
  if (ft && !reduce) {
    const seg = ft.querySelector(".bw-foot__seg");
    let loop = null;
    const build = () => {
      const w = seg.getBoundingClientRect().width, ts = loop ? loop.timeScale() : 1;
      loop?.kill();
      loop = gsap.fromTo(ft, { x: 0 }, { x: -w, duration: w / 100, ease: "none", repeat: -1 });
      loop.timeScale(ts);
    };
    build();
    (document.fonts?.ready || Promise.resolve()).then(build);
    addEventListener("wheel", (e) => {
      if (!loop || !e.deltaY) return;
      const n = e.deltaY < 0 ? -2.5 : 2.5;
      gsap.to(loop, { timeScale: 2.5 * n, duration: 0.2, ease: "none", overwrite: true });
      gsap.to(loop, { timeScale: n / 2.5, duration: 1, ease: "none", overwrite: "auto", delay: 0.5 });
    }, { passive: true });
  }

  addEventListener("load", () => ScrollTrigger.refresh());
})();
