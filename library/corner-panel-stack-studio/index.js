// First page: hero entrance · photo reel · section stacking · numbers · work steps · text band · review slide · check input.
// Original values: first reel circle 1.5s expo.inOut (after .15s) · entrance group 18px · 1.1s expo.out (after .7s) · reel advance every 2.6s with circle 1.1s expo.inOut, name off in .3s → changes at .6s → on in .4s
// · reel zoom scrub .6 power1.inOut · section shade 0→.3 scrub · number 1.8s power3.out · band 38s, speed/350 times (max +6) .2s → back to 1 over 1.4s power2.out
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const rtl = root.dir === "rtl";
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const corner = rtl ? "0% 0%" : "100% 0%";
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const faces = document.querySelector('[data-slot="trust-faces"]');
  if (faces) faces.innerHTML = AG.faces;

  // Hero entrance — the reel panel opens as a circle from the top right, and the button, face row and ask row rise into place from 18px below
  function intro() {
    const frame = document.querySelector("[data-hero-reel] [data-reel-frame]");
    const items = $$("[data-intro]");
    root.classList.remove("js-intro");
    if (!frame || reduced()) return;
    gsap.set(frame, { clipPath: `circle(0% at ${corner})` });
    gsap.set(items, { autoAlpha: 0, y: 18 });
    Promise.race([document.fonts.ready, wait(1600)]).then(() => gsap.to(frame, { clipPath: `circle(142% at ${corner})`, duration: 1.5, ease: "expo.inOut", delay: 0.15 + AG.arrive, clearProps: "clipPath" }));
    gsap.to(items, { autoAlpha: 1, y: 0, duration: 1.1, ease: "expo.out", delay: 0.7 + AG.arrive, clearProps: "transform,opacity,visibility" });
  }

  // Photo reel — every 2.6s the next sheet covers with a circle from the top right. It stops on hover or when off screen
  let stopReel;
  function reel(mm) {
    const hero = document.querySelector("[data-hero-reel]");
    if (!hero) return;
    const frame = hero.querySelector("[data-reel-frame]"), slides = $$("[data-reel-slide]", frame);
    const title = hero.querySelector("[data-reel-title]"), link = hero.querySelector("[data-reel-link]");
    let i = 0, still = reduced(), seen = true, timer;
    const next = () => { timer?.kill(); if (!still && seen) timer = gsap.delayedCall(2.6, () => go(i + 1)); };
    const go = (n) => {
      const to = n % slides.length, from = slides[i], el = slides[to];
      i = to;
      gsap.set(from, { zIndex: 1 });
      gsap.set(el, { zIndex: 2, visibility: "visible" });
      gsap.fromTo(el, { clipPath: `circle(0% at ${corner})` }, { clipPath: `circle(142% at ${corner})`, duration: 1.1, ease: "expo.inOut", onComplete: () => slides.forEach((s) => s !== el && gsap.set(s, { visibility: "hidden", zIndex: 0 })) });
      gsap.timeline().to(title, { opacity: 0, duration: 0.3, ease: "power1.out" }, 0)
        .add(() => { title.textContent = el.dataset.title; title.href = link.href = el.dataset.href; }, 0.6)
        .to(title, { opacity: 1, duration: 0.4, ease: "power2.out" }, 0.6);
      next();
    };
    const hold = (on) => () => { still = on || reduced(); next(); };
    frame.addEventListener("pointerenter", hold(true));
    frame.addEventListener("pointerleave", hold(false));
    frame.addEventListener("focusin", hold(true));
    frame.addEventListener("focusout", hold(false));
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; next(); });
    io.observe(frame);
    stopReel = () => { timer?.kill(); io.disconnect(); };
    // While descending, the reel panel grows to the left edge of the screen — rounded corners and name are scaled back with --s to keep their size
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const start = hero.querySelector("[data-reel-start]");
      const k = () => { const r = start.getBoundingClientRect(); return (rtl ? root.clientWidth - r.left : r.right) / r.width; };
      gsap.fromTo(frame, { scale: 1, "--s": 1, transformOrigin: rtl ? "0 0" : "100% 0" }, { scale: k, "--s": k, force3D: false, ease: "power1.inOut", scrollTrigger: { trigger: hero, start: "top top", endTrigger: start, end: "top top", scrub: 0.6, invalidateOnRefresh: true } });
    });
  }

  // Section stacking — if a section is taller than the screen, it sticks after being read to the end (--stick). While the next section rises, the previous section’s shade goes 0→.3, and the next section’s corner groove goes along with it
  function chapters(moving) {
    const list = $$("[data-chapter]");
    if (!list.length) return;
    const stick = () => list.forEach((c) => c.style.setProperty("--stick", `${Math.min(0, innerHeight - c.offsetHeight)}px`));
    stick();
    list.forEach((c) => c.classList.add("is-stacked"));
    const ro = new ResizeObserver(stick);
    list.forEach((c) => ro.observe(c));
    addEventListener("resize", stick);
    if (moving) list.slice(0, -1).forEach((c, n) => gsap.timeline({ scrollTrigger: { trigger: list[n + 1], start: "top bottom", end: "top top", scrub: true } })
      .fromTo(c, { "--shade": 0 }, { "--shade": 0.3, ease: "none" }, 0)
      .fromTo(list[n + 1], { "--notch-shade": 0 }, { "--notch-shade": 0.3, ease: "none" }, 0));
    return () => { ro.disconnect(); removeEventListener("resize", stick); list.forEach((c) => c.classList.remove("is-stacked")); };
  }

  function counts() {
    for (const el of $$("[data-count]")) {
      const o = { v: 0 }, n = Number(el.textContent);
      gsap.to(o, { v: n, duration: 1.8, ease: "power3.out", onUpdate: () => (el.textContent = String(Math.round(o.v))), scrollTrigger: { trigger: el, start: "top 90%", once: true } });
    }
  }

  // Work steps — when the share of the step group passing from 80% to 45% of the screen exceeds i/4, the i-th turns on. Display pieces follow data-step-tile order
  function progress() {
    for (const sec of $$("[data-progress]")) {
      const steps = $$("[data-step]", sec), tiles = $$("[data-step-tile]", sec);
      sec.classList.add("is-armed");
      const mark = (els, p, at) => els.forEach((el, i) => el.classList.toggle("is-on", p >= at(el, i) / steps.length));
      const tileAt = (el) => Number(el.dataset.stepTile);
      const apart = tiles.length > 0 && !matchMedia("(min-width: 64rem)").matches;
      ScrollTrigger.create({ trigger: steps[0]?.parentElement ?? sec, start: "top 80%", end: "bottom 45%", onUpdate: (st) => { mark(steps, st.progress, (el, i) => i); if (!apart) mark(tiles, st.progress, tileAt); } });
      if (apart) ScrollTrigger.create({ trigger: tiles[0].parentElement, start: "top 85%", end: "bottom 35%", onUpdate: (st) => mark(tiles, st.progress, tileAt) });
    }
  }

  function marquee() {
    for (const el of $$("[data-marquee]")) {
      const tw = gsap.to(el.firstElementChild, { xPercent: rtl ? 50 : -50, ease: "none", duration: Number(el.dataset.speed ?? 40), repeat: -1 });
      ScrollTrigger.create({ trigger: el, start: "top bottom", end: "bottom top", onUpdate: (st) => {
        gsap.killTweensOf(tw);
        gsap.timeline().to(tw, { timeScale: 1 + Math.min(Math.abs(st.getVelocity()) / 350, 6), duration: 0.2 }).to(tw, { timeScale: 1, duration: 1.4, ease: "power2.out" });
      } });
    }
  }

  // Reviews — only one card has data-active. Prev/next buttons and a sideways swipe of over 40px
  function slides() {
    for (const box of $$("[data-slides]")) {
      const list = $$("[data-slide]", box), label = box.querySelector("[data-count-label]");
      let at = 0;
      const show = (n) => {
        at = (n + list.length) % list.length;
        list.forEach((s, i) => { s.toggleAttribute("data-active", i === at); s.setAttribute("aria-hidden", String(i !== at)); });
        if (label) label.textContent = `${at + 1} / ${list.length}`;
      };
      box.querySelector("[data-prev]")?.addEventListener("click", () => show(at - 1));
      box.querySelector("[data-next]")?.addEventListener("click", () => show(at + 1));
      let x = 0, y = 0;
      box.addEventListener("touchstart", (e) => { x = e.touches[0].clientX; y = e.touches[0].clientY; }, { passive: true });
      box.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(at + ((dx < 0) === rtl ? -1 : 1));
      });
      show(0);
    }
  }

  // Check input — fits the input width to the text, and when it reaches 75% of the screen types and erases a sample address. On press, result lines fill in at .14s intervals (placeholder results)
  function aiCheck() {
    const box = document.querySelector("[data-ai-check]");
    if (!box) return;
    const form = box.querySelector("[data-check-form]"), input = form.querySelector("[data-site]"), measure = form.querySelector("[data-measure]");
    const res = box.querySelector("[data-results]"), score = box.querySelector("[data-score]"), after = box.querySelector("[data-after]"), rows = $$("[data-row]", box);
    const fit = () => { measure.textContent = input.value || input.placeholder || " "; input.style.width = `${measure.offsetWidth + 6}px`; };
    input.addEventListener("input", fit);
    const ex = JSON.parse(input.dataset.examples || "[]");
    let typing = !reduced(), k = 0, n = 0, back = false, t = 0;
    const type = () => {
      if (!typing) return;
      const word = ex[k];
      n += back ? -1 : 1;
      input.placeholder = word.slice(0, n);
      fit();
      let d = back ? 45 : 90;
      if (!back && n === word.length) { if (k === ex.length - 1) return; back = true; d = 1500; }
      if (back && n === 0) { back = false; k++; d = 300; }
      t = setTimeout(type, d);
    };
    const stop = () => { typing = false; clearTimeout(t); input.placeholder = input.dataset.placeholder; fit(); };
    input.addEventListener("focus", stop, { once: true });
    if (typing) { input.placeholder = ""; fit(); ScrollTrigger.create({ trigger: form, start: "top 75%", once: true, onEnter: () => (t = setTimeout(type, 400)) }); } else stop();
    const states = ["pass", "pass", "warn", "pass", "fail", "pass"];
    let run = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const site = input.value.trim();
      if (!site) { stop(); return input.focus(); }
      const me = ++run, gap = reduced() ? 0 : 140;
      stop();
      res.hidden = false; after.hidden = true;
      rows.forEach((r) => { r.dataset.state = "pending"; r.querySelector("[data-detail]").textContent = ""; });
      score.textContent = `${site} Looking into…`;
      ScrollTrigger.refresh();
      setTimeout(() => {
        if (me !== run) return;
        rows.forEach((r, i) => setTimeout(() => { if (me !== run) return; r.dataset.state = states[i]; r.querySelector("[data-detail]").textContent = "Your one line describing this item’s result here."; }, i * gap));
        setTimeout(() => { if (me !== run) return; score.textContent = `${site} Is ${states.length} of items ${states.filter((s) => s === "pass").length} Passed through the items.`; after.hidden = false; ScrollTrigger.refresh(); }, rows.length * gap);
      }, reduced() ? 0 : 900);
    });
    box.querySelector("[data-again]").addEventListener("click", () => { run++; res.hidden = true; input.value = ""; fit(); input.focus(); ScrollTrigger.refresh(); });
  }

  AG.boot.push((mm) => {
    intro();
    slides();
    reel(mm);
    mm.add("(prefers-reduced-motion: no-preference)", () => chapters(true));
    mm.add("(prefers-reduced-motion: reduce)", () => chapters(false));
    mm.add("(prefers-reduced-motion: no-preference)", () => { counts(); progress(); marquee(); });
    aiCheck();
  });
  addEventListener("pagehide", () => stopReel?.());
})();
