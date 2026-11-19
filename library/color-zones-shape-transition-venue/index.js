// First page part — called each time the app in shared.js hooks #page-frame (it re-hooks even when navigated into)
(() => {
  const RB = (window.RB = window.RB || {});
  RB.pageModules = RB.pageModules || [];
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const R = gsap.utils.random;

  // Hero — text and props rise from 40% below and transparent, .8s expo.out, in document order at .015s stagger
  const hero = (root) => {
    const el = root.querySelector("[data-hero-reveal]");
    if (!el) return [];
    if (reduce) { el.classList.add("is-ready"); return []; }
    const m = { played: false };
    return document.fonts.ready.then(() => {
      m.split = SplitText.create(el, { type: "words, chars", charsClass: "rb-hero-letter", ignore: "[data-dance]", autoSplit: true,
        onSplit: () => {
          if (m.played) return;
          m.tl = gsap.timeline({ paused: true });
          $$(".rb-hero-letter, [data-dance]", el).forEach((t, i) => m.tl.fromTo(t, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.8, ease: "expo.out" }, i * 0.015));
          el.classList.add("is-ready");
        } });
      m.play = () => { if (m.played) return; m.played = true; m.tl?.play(); };
      m.destroy = () => { m.tl?.kill(); m.split?.revert(); };
      return m;
    });
  };

  // Accompanying reveal — [data-banner-reveal=Start] items inside rise from 40px below and transparent over .9s expo.out (delay = Start + each item’s own data-banner-delay)
  const bannerReveal = (root) => $$("[data-banner-reveal]", root).map((box) => {
    const start = Number(box.dataset.bannerReveal) || 0;
    const items = [...box.children].map((el, i) => ({ el, at: start + (el.dataset.bannerDelay === undefined ? i * 0.12 : Number(el.dataset.bannerDelay)) }));
    if (reduce) return { destroy() {} };
    items.forEach(({ el }) => gsap.set(el, { autoAlpha: 0, y: 40 }));
    const m = { tweens: [] };
    m.play = () => { if (m.played) return; m.played = true; m.tweens = items.map(({ el, at }) => gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", delay: at, onComplete: () => gsap.set(el, { clearProps: "opacity,visibility,transform" }) })); };
    m.destroy = () => m.tweens.forEach((t) => t.kill());
    return m;
  });

  // Event tab — swaps the panel and re-measures ScrollTrigger
  const tabs = (root) => $$("[data-events]", root).map((block) => {
    const tb = $$("[data-events-tab]", block), panels = $$("[data-events-panel]", block);
    const on = (t) => {
      tb.forEach((o) => { o.classList.toggle("active", o === t); o.setAttribute("aria-selected", o === t); });
      panels.forEach((p) => p.classList.toggle("hidden", p.dataset.eventsPanel !== t.dataset.eventsTab));
      ScrollTrigger.refresh();
    };
    const hs = tb.map((t) => { const f = () => on(t); t.addEventListener("click", f); return [t, f]; });
    return { destroy: () => hs.forEach(([t, f]) => t.removeEventListener("click", f)) };
  });

  // Event slider — same smooothy as the original (with ends · snaps to cells · speed damping .9). Cards shift ±40% and tilt by the drag speed (speed × 10, tilt × .05)
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const sliders = (root) => {
    const els = $$("[data-event-slider]", root);
    if (!els.length || !window.Smooothy) return [];
    const list = els.map((el) => {
      const s = new Smooothy(el, { infinite: false, snap: true, speedDecay: 0.9, setOffset: ({ wrapperWidth, totalWidth }) => Math.min(wrapperWidth, totalWidth) });
      const cards = s.items.map((it) => it.querySelector("[data-p]"));
      let ls = 0;
      s.onUpdate = ({ speed, deltaTime }) => {
        ls = damp(ls, speed, 5, deltaTime);
        const { wrapperWidth, itemWidth } = s.viewport;
        const n = itemWidth ? wrapperWidth / itemWidth / 2 : 0;
        cards.forEach((c, a) => {
          if (!c || reduce) return;
          const u = gsap.utils.clamp(-40, 40, (s.current + a + 0.5 - n) * Math.abs(ls) * 10);
          c.style.transform = `translateX(${u}%) rotate(${u * 0.05}deg)`;
        });
      };
      // So links aren’t pressed while dragging — only releases within 5px and 200ms count as a press
      $$("a", el).forEach((a) => {
        a.style.pointerEvents = "none";
        const p = a.parentElement;
        let x = 0, y = 0, t = 0, moved = false;
        p.addEventListener("pointerdown", (e) => { x = e.clientX; y = e.clientY; t = Date.now(); moved = false; });
        p.addEventListener("pointermove", (e) => { if (t && (Math.abs(e.clientX - x) > 5 || Math.abs(e.clientY - y) > 5)) moved = true; });
        p.addEventListener("pointerup", () => { if (t && !moved && Date.now() - t < 200) a.click(); t = 0; });
      });
      const tick = () => s.update();
      gsap.ticker.add(tick);
      return { s, el, destroy: () => { gsap.ticker.remove(tick); cards.forEach((c) => c && (c.style.transform = "")); s.destroy(); } };
    });
    const navs = $$("[data-events]", root).flatMap((block) => {
      const nav = block.querySelector("[data-slider-nav]");
      if (!nav) return [];
      const prev = nav.querySelector("[data-slider-prev]"), next = nav.querySelector("[data-slider-next]");
      const active = () => (list.find((l) => !l.el.closest("[data-events-panel]")?.classList.contains("hidden")) || list[0]).s;
      const p = () => active().goToPrev(), n = () => active().goToNext();
      const sync = () => { const s = active(); prev.disabled = s.target >= -0.01; next.disabled = s.target <= s.maxScroll + 0.01; };
      prev.addEventListener("click", p);
      next.addEventListener("click", n);
      gsap.ticker.add(sync);
      return [{ destroy: () => { gsap.ticker.remove(sync); prev.removeEventListener("click", p); next.removeEventListener("click", n); } }];
    });
    return [...list, ...navs];
  };

  // Title dance — splits letter pieces into three groups, staggered .1s each, tilting −3, 0, 3° every .3s
  const titleDance = (items) => {
    const sets = [[], [], []];
    items.forEach((el, i) => sets[i % 3].push(el));
    const tls = sets.map((g, n) => gsap.timeline({ repeat: -1, paused: true, delay: (0.3 / 3) * n }).call(() => g.forEach((el) => gsap.set(el, { rotation: R(-3, 3, 3) }))).to({}, { duration: 0.3 }));
    return { play: () => tls.forEach((t) => t.play()), pause: () => tls.forEach((t) => t.pause()), kill: () => tls.forEach((t) => t.kill()) };
  };

  // Four spaces — during the panel pin, the progress share decides which one is current and swaps the background color with .75s power2.out,
  // Words, title pieces and buttons of the old section hide in random order within .3s, and those of the new section turn on the same way after .21s.
  // For each section, a shaped-hole photo passes from the bottom of the screen to the top during that section’s range, by (screen height + photo height)
  const spaces = (root) => {
    const triggers = $$("[data-spaces-trigger]", root);
    if (!triggers.length) return [];
    return document.fonts.ready.then(() => triggers.map((trigger) => {
      const bg = trigger.querySelector("[data-spaces-bg]");
      const panels = $$("[data-spaces-color]", trigger);
      const colours = panels.map((p) => RB.rgb(`--site-${p.dataset.spacesColor}`));
      const splits = [];
      const pieces = panels.map((p) => [
        ...$$(".block-content > *:not(.rb-btn):not(.rb-space__title)", p).flatMap((el) => { const s = SplitText.create(el, { type: "words", ignore: "a" }); splits.push(s); return s.words; }),
        ...$$("[data-item]", p), ...$$("a", p),
      ]);
      const images = panels.map((p) => p.querySelector("[data-spaces-image]"));
      let active = 0, transition = null;
      gsap.set(bg, { backgroundColor: colours[0] });
      panels.forEach((p, i) => { gsap.set(p, { autoAlpha: i === 0 ? 1 : 0 }); gsap.set(pieces[i], { visibility: i === 0 ? "inherit" : "hidden" }); });
      images.forEach((im, i) => im && gsap.set(im, { x: 0, xPercent: -50, y: 0, autoAlpha: i === 0 ? 1 : 0 }));
      const dances = reduce ? [] : panels.map((p) => titleDance($$("[data-item]", p)));
      const setDance = (t) => { dances.forEach((d, i) => i !== t && d.pause()); dances[t]?.play(); };
      setDance(0);
      const reveal = (list, show) => {
        const order = gsap.utils.shuffle([...list]), st = { p: 0 };
        let k = 0;
        return gsap.to(st, { p: 1, duration: 0.3, ease: "none", onUpdate: () => { const n = Math.round(st.p * order.length); while (k < n) order[k++].style.visibility = show ? "inherit" : "hidden"; } });
      };
      const goTo = (t) => {
        if (t === active) return;
        const old = active;
        active = t;
        transition?.progress(1).kill();
        dances[t]?.play();
        transition = gsap.timeline()
          .set(panels[t], { autoAlpha: 1 })
          .add(reveal(pieces[old], false), 0)
          .add(gsap.to(bg, { backgroundColor: colours[t], duration: 0.75, ease: "power2.out" }), 0)
          .add(reveal(pieces[t], true), 0.3 * 0.7)
          .set(panels, { autoAlpha: (i, el) => (el === panels[t] ? 1 : 0) }, ">")
          .call(() => setDance(t));
      };
      const setters = images.map((im) => (im ? gsap.quickSetter(im, "y", "px") : null));
      let travel = [];
      const measure = () => (travel = images.map((im) => (im ? innerHeight + im.offsetHeight : 0)));
      const sync = (prog) => {
        const n = panels.length, e = gsap.utils.clamp(0, n, prog * n), r = Math.min(n - 1, Math.floor(e)), f = gsap.utils.clamp(0, 1, e - r);
        if (r !== active) { goTo(r); images.forEach((im, i) => im && gsap.set(im, { autoAlpha: i === r ? 1 : 0 })); }
        setters[r]?.(-travel[r] * f);
      };
      measure();
      const st = ScrollTrigger.create({ trigger, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
        onRefresh: (s) => { measure(); sync(s.progress); }, onUpdate: (s) => sync(s.progress), onLeave: () => sync(1), onLeaveBack: () => sync(0) });
      sync(st.progress);
      // Hovering a photo scales it to 1.05 and tilts it ±12° toward the pointer (.4s power3.out)
      const tilts = matchMedia("(hover: hover)").matches && !reduce ? images.map((im) => {
        const inner = im?.querySelector("[data-spaces-image-inner]");
        if (!inner) return null;
        const o = { duration: 0.4, ease: "power3.out" }, rx = gsap.quickTo(inner, "rotationY", o), ry = gsap.quickTo(inner, "rotationX", o);
        const en = () => gsap.to(inner, { scale: 1.05, ...o });
        const mv = (e) => { const b = im.getBoundingClientRect(); rx(((e.clientX - b.left) / b.width * 2 - 1) * 12); ry(-((e.clientY - b.top) / b.height * 2 - 1) * 12); };
        const lv = () => { rx(0); ry(0); gsap.to(inner, { scale: 1, ...o }); };
        im.addEventListener("pointerenter", en); im.addEventListener("pointermove", mv); im.addEventListener("pointerleave", lv);
        return () => { im.removeEventListener("pointerenter", en); im.removeEventListener("pointermove", mv); im.removeEventListener("pointerleave", lv); };
      }).filter(Boolean) : [];
      ScrollTrigger.refresh();
      return { destroy: () => { tilts.forEach((f) => f()); st.kill(); transition?.kill(); dances.forEach((d) => d.kill()); splits.forEach((s) => s.revert()); } };
    }));
  };

  // Big center text — letters switch on in random order from .2 to 1 (tied to scroll, text top at 85% of the screen → text bottom at 90%)
  const centerText = (root) => {
    const blocks = $$("[data-center-text]", root);
    if (!blocks.length || reduce) return [];
    return document.fonts.ready.then(() => blocks.map((b) => {
      const content = b.querySelector(".block-content");
      const m = {};
      m.split = SplitText.create([...content.children], { type: "lines, words, chars", autoSplit: true, charsClass: "rb-inline",
        onSplit: (s) => {
          m.tl?.scrollTrigger?.kill(); m.tl?.kill();
          gsap.set(s.lines, { perspective: 400 });
          m.tl = gsap.timeline({ scrollTrigger: { trigger: content, start: "top bottom-=15%", end: "bottom bottom-=10%", scrub: true } })
            .from(s.chars, { opacity: 0.2, ease: "none", stagger: { from: "random", each: 1 } });
          return m.tl;
        } });
      m.destroy = () => { m.tl?.scrollTrigger?.kill(); m.tl?.kill(); m.split?.revert(); };
      return m;
    }));
  };

  // Sentence — left and right halves sit on opposite sides (by half-width) inside their own masks, then spread into place on scroll (power2.out).
  // Each half bends by −.5, 0, .5° every .3s
  const crests = (root) => $$("[data-crest-scroll]", root).map((svg) => {
    const groups = $$("g[clip-path]", svg);
    if (!groups.length || reduce) return { destroy() {} };
    const centre = svg.viewBox.baseVal.width / 2;
    const layers = groups.map((g) => {
      const rect = svg.querySelector(`${g.getAttribute("clip-path").match(/#([^)]+)/)[0]} rect`);
      const x = rect.x.baseVal.value, w = rect.width.baseVal.value, side = x + w / 2 > centre ? 1 : -1;
      const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      layer.append(...g.childNodes);
      g.append(layer);
      return { layer, offset: -side * w };
    });
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top bottom", end: "bottom top", scrub: true } });
    layers.forEach(({ layer, offset }) => tl.fromTo(layer, { x: offset }, { x: 0, ease: "power2.out" }, 0));
    const ds = groups.map((g) => gsap.to(g, { rotation: () => R(-0.5, 0.5, 0.5), duration: 0.3, delay: R(0, 0.5), ease: "steps(1)", transformOrigin: "50% 50%", repeat: -1, repeatRefresh: true }));
    return { destroy: () => { tl.scrollTrigger?.kill(); tl.kill(); ds.forEach((d) => d.kill()); } };
  });

  RB.pageModules.push(hero, bannerReveal, tabs, sliders, spaces, centerText, crests);
})();
