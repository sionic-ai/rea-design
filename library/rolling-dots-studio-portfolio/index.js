// Home — hero slideshow · intro word swap · phone work rows · service accordion · testimonials. Orbit cards and the ASCII comma get motion parts (data-fx) attached.
KK.page("home", (c) => {
  const $ = (s) => c.querySelector(s), $$ = (s) => [...c.querySelectorAll(s)];
  const reduce = KK.reduce;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const offs = [];

  // ───── Hero slideshow — when the 6s bar fills, it slides sideways in 1.5s, and the inner photo moves the opposite way with 75% parallax ─────
  (() => {
    const hero = $("[data-hero]");
    if (!hero) return;
    const slides = $$("[data-slide]"), inners = slides.map((s) => s.querySelector("[data-slide-inner]"));
    const names = $$('[data-stack="name"] .kk-hero__stack-item'), years = $$('[data-stack="year"] .kk-hero__stack-item');
    const dots = $$("[data-dot]"), bar = $("[data-progress]"), trigger = $("[data-hero-trigger]");
    const n = slides.length;
    let cur = 0, busy = false, paused = false, prog = null, dead = false;
    const words = (el) => { const w = el ? [...el.querySelectorAll("[data-word]")] : []; return w.length ? w : [el]; };
    const prep = (list) => list.forEach((el, i) => { if (i !== cur) gsap.set(words(el), { yPercent: 125 }); });
    prep(names); prep(years);
    const img = (i, k) => slides[i]?.querySelector(`[data-img="${k}"]`);
    const swap = (i, on, now = false) => {
      const a = img(i, "primary"), b = img(i, "hover");
      if (!a || !b) return;
      gsap.killTweensOf([a, b]);
      if (reduce || now) { gsap.set(a, { autoAlpha: on ? 0 : 1, scale: on ? 0.93 : 1 }); gsap.set(b, { autoAlpha: on ? 1 : 0, scale: on ? 1 : 1.085 }); return; }
      gsap.to(a, { scale: on ? 0.93 : 1, autoAlpha: on ? 0 : 1, duration: 0.68, ease: "osmo" });
      gsap.to(b, { scale: on ? 1 : 1.085, autoAlpha: on ? 1 : 0, duration: 0.7, ease: "osmo" });
    };
    const run = () => {
      prog?.kill();
      gsap.set(bar, { scaleX: 0 });
      if (reduce || dead) return;
      prog = gsap.to(bar, { scaleX: 1, duration: 6, ease: "none", onComplete: () => go(cur + 1, 1) });
      if (paused) prog.timeScale(0);
    };
    const roll = (list, from, to, delay = 0) => {
      const a = words(list[from]), b = words(list[to]);
      list[from]?.setAttribute("aria-hidden", "true"); list[to]?.removeAttribute("aria-hidden");
      list[to]?.classList.add("is-current");
      if (reduce) { gsap.set(a, { yPercent: -125 }); gsap.set(b, { yPercent: 0 }); list[from]?.classList.remove("is-current"); return; }
      gsap.to(a, { yPercent: -125, duration: 0.7, delay, stagger: 0.08, ease: "osmo", onComplete: () => list[from]?.classList.remove("is-current") });
      gsap.fromTo(b, { yPercent: 125 }, { yPercent: 0, duration: 0.9, delay: 0.12 + delay, stagger: 0.08, ease: "osmo" });
    };
    function go(to, dir) {
      if (busy || dead) return;
      to = ((to % n) + n) % n;
      if (to === cur) return;
      const from = cur, d = dir ?? (to > from ? 1 : -1);
      busy = true; cur = to;
      dots.forEach((b, i) => b.classList.toggle("is-current", i === to));
      if (trigger) trigger.href = slides[to].dataset.href;
      swap(from, false, true); swap(to, paused, true);
      roll(names, from, to);
      if ((years[from]?.textContent || "").trim() !== (years[to]?.textContent || "").trim()) roll(years, from, to, 0.12);
      else { years[from]?.classList.remove("is-current"); years[to]?.classList.add("is-current"); gsap.set(words(years[to]), { yPercent: 0 }); }
      if (reduce) { slides[to].classList.add("is-current"); slides[from].classList.remove("is-current"); busy = false; run(); return; }
      gsap.timeline({ defaults: { duration: 1.5, ease: "osmo" }, onStart: () => slides[to].classList.add("is-current"), onComplete: () => { slides[from].classList.remove("is-current"); gsap.set([slides[from], inners[from]], { clearProps: "transform" }); busy = false; } })
        .to(slides[from], { xPercent: -d * 100 }, 0)
        .to(inners[from], { xPercent: d * 75 }, 0)
        .fromTo(slides[to], { xPercent: d * 100 }, { xPercent: 0 }, 0)
        .fromTo(inners[to], { xPercent: -d * 75 }, { xPercent: 0 }, 0);
      run();
    }
    const onDot = (e) => { const i = +e.currentTarget.dataset.index; if (i !== cur && !busy) go(i, i > cur ? 1 : -1); };
    dots.forEach((b) => b.addEventListener("click", onDot));
    // With the cursor over ”View work”, swap the photo and stop the bar in .75s
    const hold = (on) => {
      if (on === paused) return;
      paused = on; swap(cur, on);
      if (prog && !reduce) gsap.to(prog, { timeScale: on ? 0 : 1, duration: on ? 0.75 : 0.55, ease: on ? "power2.out" : "power2.inOut" });
    };
    const enter = () => hold(true), leave = () => hold(false);
    if (fine && trigger) { trigger.addEventListener("mouseenter", enter); trigger.addEventListener("mouseleave", leave); }
    // Runs once the loader has cleared
    const start = () => { removeEventListener("kk:ready", start); run(); };
    document.body.hasAttribute("data-initial-loader") ? addEventListener("kk:ready", start) : run();
    offs.push(() => {
      dead = true; prog?.kill(); removeEventListener("kk:ready", start);
      dots.forEach((b) => b.removeEventListener("click", onDot));
      trigger?.removeEventListener("mouseenter", enter); trigger?.removeEventListener("mouseleave", leave);
      gsap.killTweensOf([...slides, ...inners, bar, ...$$("[data-word]")]);
    });
  })();

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const hero = $("[data-hero]"), end = $("[data-hero-end]");
    // Photo −8% parallax (desktop)
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.to("[data-hero-parallax]", { yPercent: -8, ease: "none", scrollTrigger: { trigger: end, start: "top top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
    // Once the hero end has fully passed above the screen, cover the hero with the background color (so the pinned hero doesn’t show through behind the section below)
    if (hero && end) {
      const paint = () => { end.getBoundingClientRect().bottom <= -1 ? (hero.dataset.heroPaint = "") : delete hero.dataset.heroPaint; };
      ScrollTrigger.create({ trigger: end, start: "bottom top-=1", end: "max", onEnter: paint, onEnterBack: paint, onLeaveBack: paint, onRefresh: paint });
      const onScroll = () => requestAnimationFrame(paint);
      addEventListener("scroll", onScroll, { passive: true });
      offs.push(() => removeEventListener("scroll", onScroll));
    }
    // While a light section passes under the header, header text turns ink-dark
    const lights = $$("[data-light]"), sts = [];
    const sync = () => { document.body.dataset.sectionTheme = sts.some((s) => s.isActive) ? "active" : "inactive"; };
    lights.forEach((el) => sts.push(ScrollTrigger.create({ trigger: el, start: "top top+=96", end: "bottom top+=96", onToggle: sync, onRefresh: sync })));
    sync();
    // Intro: words push up to swap (old word stays faint on the line above), and sentence chunks drop down inside the box
    mm.add("(min-width: 640px)", () => {
      const box = $("[data-quote-box]"), move = $("[data-quote-move]");
      if (!box || !move) return;
      gsap.to(move, { y: () => { const p = box.offsetHeight || box.parentElement.offsetHeight, s = move.offsetHeight || 100; return Math.min(p * 0.32, Math.max(0, p - s - 64)); }, ease: "power1.inOut", scrollTrigger: { trigger: box, start: "top 50%", end: "bottom 30%", scrub: true, invalidateOnRefresh: true } });
      $$(".kk-swap").forEach((sw) => {
        const old = sw.querySelector(".kk-swap__old"), neo = sw.querySelector(".kk-swap__new");
        gsap.timeline({ scrollTrigger: { trigger: box, start: "top 50%", end: "bottom 50%", scrub: true, invalidateOnRefresh: true } })
          .fromTo(old, { yPercent: 0 }, { yPercent: -100 })
          .to(old, { "--ghost": "13%", opacity: 0.5, ease: "none" }, 0);
        gsap.timeline({ scrollTrigger: { trigger: box, start: "top 50%", end: "bottom 50%", scrub: true, invalidateOnRefresh: true } }).to(neo, { yPercent: -100 });
      });
    });
  }, c);
  offs.push(() => { mm.revert(); ctx.revert(); document.body.dataset.sectionTheme = "inactive"; });

  // Pressing the orbit card panel passes it on to Name
  const open = (e) => { e.preventDefault(); KK.go(e.detail.href); };
  c.addEventListener("fx:open", open);
  offs.push(() => c.removeEventListener("fx:open", open));

  // ───── Phone work row — swiping sideways switches to the name and description of the section stuck leftmost ─────
  (() => {
    const track = $("[data-mgal-track]"), slides = $$("[data-mgal-slide]"), link = $("[data-mgal-link]"), title = $("[data-mgal-title]"), desc = $("[data-mgal-desc]");
    if (!track || !slides.length) return;
    let cur = 0, raf = 0;
    const set = (i) => { cur = i; title.textContent = slides[i].dataset.name; desc.textContent = slides[i].dataset.desc; link.href = slides[i].getAttribute("href"); };
    const near = () => {
      raf = 0;
      const left = track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft || 0);
      let best = cur, d = Infinity;
      slides.forEach((s, i) => { const k = Math.abs(s.getBoundingClientRect().left - left); if (k < d) { d = k; best = i; } });
      if (best !== cur) set(best);
    };
    const onScroll = () => { raf ||= requestAnimationFrame(near); };
    track.addEventListener("scroll", onScroll, { passive: true });
    offs.push(() => { cancelAnimationFrame(raf); track.removeEventListener("scroll", onScroll); });
  })();

  // ───── Services — the preview follows the hovered row (lerp .055), and pressing makes the description rise line by line ─────
  (() => {
    const sec = $("[data-services]");
    if (!sec) return;
    const items = $$("[data-svc-item]"), panels = $$("[data-svc-panel]"), copies = $$("[data-svc-copy]"), imgs = $$("[data-svc-img]");
    const preview = $("[data-svc-preview]"), visual = $(".kk-svc__visual");
    let active = 0, open = -1, y = 0, target = 0, raf = 0, first = true, pend = 0;
    const tls = [];
    gsap.set(panels, { height: 0, autoAlpha: 0 });
    gsap.set(copies, { autoAlpha: 0 });
    const splits = reduce ? [] : copies.map((p) => new SplitText(p, { type: "lines", mask: "lines" }));
    splits.forEach((s, i) => gsap.set(s.lines, i === 0 ? { autoAlpha: 1, yPercent: 0 } : { autoAlpha: 0, yPercent: 110 }));
    const lines = (i) => (splits[i]?.lines.length ? splits[i].lines : [copies[i]]);
    const paint = () => preview.style.setProperty("--py", `${Math.round(y)}px`);
    const step = () => { const d = target - y; if (Math.abs(d) < 0.35) { y = target; paint(); raf = 0; return; } y += d * 0.055; paint(); raf = requestAnimationFrame(step); };
    const follow = () => {
      pend = 0;
      if (matchMedia("(max-width: 767px)").matches) { preview.style.removeProperty("--py"); return; }
      const it = items[active], r = it.getBoundingClientRect(), v = visual.getBoundingClientRect(), p = preview.getBoundingClientRect();
      target = r.top - v.top + r.height / 2 - p.height / 2;
      if (first || reduce) { first = false; y = target; paint(); return; }
      raf ||= requestAnimationFrame(step);
    };
    const later = () => { pend ||= requestAnimationFrame(follow); };
    const mark = (i) => items.forEach((it, k) => (it.dataset.active = k === i ? "true" : "false"));
    const show = (i) => { active = i; imgs.forEach((im, k) => (k === i ? (im.dataset.active = "true") : delete im.dataset.active)); later(); };
    const close = (i, dur = 0.45) => {
      tls[i]?.kill();
      items[i].setAttribute("aria-expanded", "false");
      if (reduce) { gsap.set(panels[i], { height: 0, autoAlpha: 0 }); return; }
      tls[i] = gsap.timeline({ onComplete: () => gsap.set(copies[i], { autoAlpha: 0 }) })
        .to(lines(i), { autoAlpha: 0, yPercent: -30, duration: 0.18, ease: "power2.in" }, 0)
        .to(panels[i], { height: 0, autoAlpha: 0, duration: dur, ease: "osmo" }, 0);
    };
    const expand = (i) => {
      tls[i]?.kill();
      items[i].setAttribute("aria-expanded", "true");
      gsap.set(copies[i], { autoAlpha: 1 });
      if (reduce) { gsap.set(panels[i], { height: "auto", autoAlpha: 1 }); later(); return; }
      gsap.set(lines(i), { autoAlpha: 0, yPercent: 110 });
      tls[i] = gsap.timeline({ onUpdate: later, onComplete: () => { gsap.set(panels[i], { height: "auto" }); later(); } })
        .set(panels[i], { height: 0, autoAlpha: 1 })
        .to(panels[i], { height: "auto", duration: 0.62, ease: "osmo" })
        .to(lines(i), { autoAlpha: 1, yPercent: 0, duration: 0.48, ease: "osmo", stagger: 0.045 }, "<0.18");
    };
    const toggle = (i) => {
      const next = open === i ? -1 : i, prev = open;
      open = next;
      if (prev !== -1 && prev !== next) close(prev, 0.62);
      next === -1 ? close(i) : expand(next);
      later(); setTimeout(later, 650);
    };
    const handlers = items.map((it, i) => {
      const over = () => { if (open !== -1) { mark(i); return; } mark(i); show(i); };
      const click = () => { mark(i); show(i); toggle(i); };
      if (fine) it.addEventListener("pointerenter", over);
      it.addEventListener("focus", over); it.addEventListener("click", click);
      return () => { it.removeEventListener("pointerenter", over); it.removeEventListener("focus", over); it.removeEventListener("click", click); };
    });
    mark(0); show(0); open = 0;
    items[0].setAttribute("aria-expanded", "true");
    gsap.set(panels[0], { height: "auto", autoAlpha: 1 }); gsap.set(copies[0], { autoAlpha: 1 });
    addEventListener("resize", later); addEventListener("scroll", later, { passive: true });
    offs.push(() => { cancelAnimationFrame(raf); cancelAnimationFrame(pend); tls.forEach((t) => t?.kill()); splits.forEach((s) => s.revert()); handlers.forEach((f) => f()); removeEventListener("resize", later); removeEventListener("scroll", later); });
  })();

  // ───── Testimonials — 10s bar, text exits upward line by line and new lines rise in after .3s ─────
  (() => {
    const sec = $("[data-voices]");
    if (!sec) return;
    const quotes = $$("[data-voice-quote]"), people = $$("[data-voice-person]"), count = $("[data-voice-count]"), bar = $("[data-voice-progress]");
    const prev = $("[data-voice-prev]"), next = $("[data-voice-next]"), n = quotes.length;
    let cur = 0, seen = false, lock = false, lockT = 0, prog = null;
    [...quotes, ...people].forEach((el, i) => gsap.set(el, { autoAlpha: i % n === 0 ? 1 : 0 }));
    const splits = reduce ? [] : quotes.map((q) => new SplitText(q.querySelector("p"), { type: "lines", mask: "lines" }));
    const run = () => { prog?.kill(); gsap.set(bar, { scaleX: 0 }); if (reduce || !seen) return; prog = gsap.to(bar, { scaleX: 1, duration: 10, ease: "none", onComplete: () => go(cur + 1) }); };
    function go(to) {
      to = ((to % n) + n) % n;
      if (to === cur) return;
      const from = cur; cur = to;
      count.textContent = String(to + 1).padStart(2, "0");
      quotes.forEach((q, i) => { if (i !== from && i !== to) gsap.set(q, { autoAlpha: 0 }); });
      people.forEach((p, i) => { if (i !== from && i !== to) gsap.set(p, { autoAlpha: 0 }); });
      const a = splits[from]?.lines, b = splits[to]?.lines;
      if (reduce) { gsap.set([quotes[from], people[from]], { autoAlpha: 0 }); gsap.set([quotes[to], people[to]], { autoAlpha: 1, y: 0 }); run(); return; }
      gsap.killTweensOf([quotes[from], quotes[to], people[from], people[to]]);
      if (a && b) {
        gsap.killTweensOf([...a, ...b]);
        gsap.set([quotes[from], quotes[to]], { autoAlpha: 1, y: 0 });
        gsap.set(b, { yPercent: 115 });
        gsap.to(a, { yPercent: -115, duration: 0.7, ease: "osmo", stagger: 0.06, onComplete: () => gsap.set(quotes[from], { autoAlpha: 0 }) });
        gsap.to(b, { yPercent: 0, duration: 0.9, ease: "osmo", stagger: 0.06, delay: 0.3 });
      }
      gsap.to(people[from], { y: -40, duration: 0.7, ease: "osmo" });
      gsap.to(people[from], { autoAlpha: 0, duration: 0.3, ease: "osmo" });
      gsap.fromTo(people[to], { y: 48 }, { y: 0, duration: 0.7, delay: 0.3, ease: "osmo" });
      gsap.fromTo(people[to], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, delay: 0.55, ease: "osmo" });
      run();
    }
    // The arrow rests for 2 seconds after one press
    const nudge = (d) => { if (lock) return; lock = true; prev.disabled = next.disabled = true; clearTimeout(lockT); lockT = setTimeout(() => { lock = false; prev.disabled = next.disabled = false; }, 2000); go(cur + d); };
    const onPrev = () => nudge(-1), onNext = () => nudge(1);
    prev.addEventListener("click", onPrev); next.addEventListener("click", onNext);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; seen ? run() : (prog?.kill(), gsap.set(bar, { scaleX: 0 })); }, { threshold: 0.25 });
    io.observe(sec);
    offs.push(() => { io.disconnect(); prog?.kill(); clearTimeout(lockT); prev.removeEventListener("click", onPrev); next.removeEventListener("click", onNext); splits.forEach((s) => s.revert()); });
  })();

  return () => offs.forEach((f) => f());
});
