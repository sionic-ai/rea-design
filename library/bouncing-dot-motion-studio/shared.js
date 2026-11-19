/* Shared by all pages — ScrollSmoother (smooth 1.5·effects) · header rise (.05 interval) · glass panel · phone menu · pink cursor dot (lerp) · line-split rise · dark footer cover.
   Original values: rise 1s power4.out (lines .15 apart, button .2 · photo .4 later) · cursor follow lerp .2 · the footer pins the last section and moves y 100% → 0 over one screen height (scrub 0) */
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
  const mm = gsap.matchMedia();
  const desk = () => innerWidth > 1024;
  const home = document.body.dataset.page === "home";
  window.rx = window.rx || {};

  // ── Smooth scroll: desktop only (the original also turns it off at 1024 and below) ──
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    rx.smoother = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.5, effects: true, smoothTouch: 0.1 });
    return () => { rx.smoother && rx.smoother.kill(); rx.smoother = null; };
  });

  // ── Header: on sub pages the header text rises from 40px below at .05 gaps, and a glass panel lays down after 2 seconds (on the first page, after the loader ends) ──
  const head = document.querySelector(".rx-head");
  rx.headIn = (instant) => {
    gsap.to(".to-up", instant ? { y: 0, opacity: 1, duration: 0, stagger: 0 } : { y: 0, opacity: 1, stagger: 0.05 });
    setTimeout(() => head.classList.add("is-glossy"), 2000);
  };
  if (!home) rx.headIn(false);

  // ── Phone menu ──
  const menu = document.querySelector(".rx-menu");
  document.querySelectorAll("[data-menu]").forEach((b) => b.addEventListener("click", () => menu.classList.toggle("is-open")));

  // ── Cursor: original custom_cursor — a 144px circle whose position (lerp .2) and size (lerp .15) follow every frame. Over links·buttons·inputs·video .3, over the showreel 1, elsewhere .1.
  //    first movement turns it on with .9s Power3.easeOut and it turns off when it leaves the window ──
  const cur = document.querySelector(".rx-cursor");
  if (cur && screen.width > 1024) {
    const c = { tx: { p: 0, c: 0, a: 0.2 }, ty: { p: 0, c: 0, a: 0.2 }, sc: { p: 0.1, c: 0.1, a: 0.15 } };
    const at = { x: 0, y: 0 };
    let shown = false;
    addEventListener("mousemove", (e) => {
      at.x = e.clientX; at.y = e.clientY;
      if (!shown) { shown = true; gsap.to(cur, { opacity: 1, duration: 0.9, ease: "power3.out" }); }
    });
    // Kept as in the original — a mouseout bubbling from any element turns it off, and the next mouseover turns it right back on (one-frame flicker when crossing between elements)
    addEventListener("mouseout", () => { cur.style.opacity = 0; });
    addEventListener("mouseover", () => { cur.style.opacity = 1; });
    // As in the original, every frame via requestAnimationFrame — gsap.ticker skips frames so the lerp measures slowly.
    // The original’s per-frame lerp is a 60fps value — on a busy machine running at 30fps it takes twice as long to catch up, stretching the duration and leaving a tail, so the elapsed time is applied as a batch of 60fps frames
    let last = 0;
    const loop = (now) => {
      const f = last ? Math.min(now - last, 100) / (1000 / 60) : 1;
      last = now;
      c.tx.c = at.x - 72; c.ty.c = at.y - 72;
      for (const k in c) c[k].p += (c[k].c - c[k].p) * (1 - Math.pow(1 - c[k].a, f));
      cur.style.transform = `translateX(${c.tx.p}px) translateY(${c.ty.p}px) scale(${c.sc.p})`;
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    // The original attaches listeners only to elements present on first render — the cursor doesn’t grow over work cards that load and render later
    const hot = "a:not(.rx-proj__a), button, input, video, [data-cursor]";
    document.querySelectorAll(hot).forEach((el) => {
      const on = () => { const reel = el.matches("[data-cursor=reel]"); c.sc.c = reel ? 1 : 0.3; cur.classList.toggle("is-reel", reel); };
      el.addEventListener("mouseenter", on);
      el.addEventListener("mousemove", on);
      el.addEventListener("mouseleave", () => { c.sc.c = 0.1; cur.classList.remove("is-reel"); });
    });
  }

  // ── Split-line rise: title → lines (.15 stagger) → button (.2) → photo (.4), once at 85% of screen ──
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll("[data-rise]").forEach((box) => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out", duration: 1 } });
      const q = (s) => [...box.querySelectorAll(s)];
      if (q("[data-rise-title]").length) tl.to(q("[data-rise-title]"), { y: "0%", opacity: 1 }, 0);
      if (q("[data-rise-line]").length) tl.to(q("[data-rise-line]"), { y: "0%", opacity: 1, stagger: 0.15 }, 0);
      if (q("[data-rise-btn]").length) tl.to(q("[data-rise-btn]"), { y: "0%", opacity: 1 }, 0.2);
      if (q("[data-rise-img]").length) tl.to(q("[data-rise-img]"), { opacity: 1 }, 0.4);
      ScrollTrigger.create({ trigger: box, start: "top 85%", once: true, onEnter: () => tl.play() });
    });
  });
  mm.add("(max-width: 1024px), (prefers-reduced-motion: reduce)", () => {
    gsap.set("[data-rise] .rx-rise, [data-rise-img]", { opacity: 1, y: 0 });
  });

  // Work cards: on the first page they rise from 120px below over 1s once in view, delayed by their turn (0.n s), on the Work page they sit in place at once (original duration 0)
  mm.add("(min-width: 1025px) and (prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".rx-proj").forEach((p) => {
      const item = p.querySelector(".rx-proj__item"), i = +p.dataset.i % 7;
      if (document.body.dataset.page === "works") gsap.to(item, { y: 0, opacity: 1, duration: 0, delay: +("0." + i) });
      else ScrollTrigger.create({ trigger: item, once: true, end: "top 30%", onEnter: () => gsap.to(item, { y: 0, opacity: 1, duration: 1, delay: +("0." + i) }) });
    });
  });
  mm.add("(max-width: 1024px), (prefers-reduced-motion: reduce)", () => gsap.set(".rx-proj__item", { y: 0, opacity: 1 }));

  // ── Category filter (Work, News) — keeps only the chosen category and re-measures the fixed positions ──
  document.querySelectorAll(".rx-cats button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".rx-cats button").forEach((x) => x.classList.toggle("is-active", x === b));
    const c = b.dataset.cat, all = b === document.querySelector(".rx-cats button");
    document.querySelectorAll("[data-cat]:not(button)").forEach((el) => el.classList.toggle("is-out", !all && el.dataset.cat !== c));
    ScrollTrigger.refresh();
  }));

  // ── Dark-ink footer: with the last section pinned, it pushes up from below over one screen height and covers it ──
  const foot = document.querySelector(".rx-foot");
  const last = document.querySelector("[data-foot-pin]");
  mm.add("(min-width: 1025px)", () => {
    if (!foot || !last) return;
    // Set the initial position with GSAP only — if CSS translateY(100%) is present, GSAP reads it as y px and it overlaps with yPercent, moving down twice as far
    gsap.set(foot, { yPercent: 100, visibility: "visible" });
    const tw = gsap.to(foot, { yPercent: 0, ease: "none", scrollTrigger: { trigger: last, start: "bottom bottom", end: () => "+=" + foot.offsetHeight, pin: true, scrub: 0, invalidateOnRefresh: true } });
    return () => { tw.scrollTrigger && tw.scrollTrigger.kill(); tw.kill(); gsap.set(foot, { clearProps: "transform" }); };
  });

  // ── Footer mail: click to copy and swap the tag text ──
  document.querySelectorAll("[data-copy]").forEach((m) => m.addEventListener("click", () => {
    navigator.clipboard?.writeText(m.dataset.copy).catch(() => {});
    const tip = m.querySelector(".rx-foot__tip");
    if (tip) { tip.textContent = "Copied"; setTimeout(() => (tip.textContent = "Press to copy"), 1500); }
  }));
})();
