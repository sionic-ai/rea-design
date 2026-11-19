// Home page motion — original topAnimation values: title characters .6s·stagger .08·power2.out, photo strip 100(85)px/s·phone .7x·random heights,
// Strengths English strip scrub .5, travel 0.2x, job panel pin (every 1.3 screens, .4s power3.out, 40% travel, threshold 17px, list press .6s power3.out).
(() => {
  const ICONS = {
    talk: '<svg viewBox="0 0 70 72"><circle cx="22" cy="20" r="9"/><path d="M6 52c0-10 7-17 16-17s16 7 16 17"/><circle cx="50" cy="26" r="8"/><path d="M38 56c1-9 6-14 13-14s12 5 13 14"/><path d="M40 6h22v12H48l-5 5v-5h-3z"/></svg>',
    list: '<svg viewBox="0 0 70 72"><rect x="8" y="6" width="40" height="56" rx="3"/><path d="M16 20h6M28 20h12M16 32h6M28 32h12M16 44h6M28 44h8"/><path d="M48 40l6-6 10 10-14 18-8 2 1-8z"/></svg>',
    gear: '<svg viewBox="0 0 70 72"><circle cx="35" cy="36" r="10"/><path d="M35 8v8M35 56v8M7 36h8M55 36h8M15 16l6 6M49 50l6 6M15 56l6-6M49 22l6-6"/><circle cx="35" cy="36" r="20"/></svg>',
    line: '<svg viewBox="0 0 70 72"><rect x="6" y="40" width="58" height="14" rx="7"/><circle cx="15" cy="47" r="3"/><circle cx="28" cy="47" r="3"/><circle cx="42" cy="47" r="3"/><circle cx="55" cy="47" r="3"/><rect x="22" y="22" width="26" height="14"/><path d="M35 6v16M29 12h12"/><path d="M14 62h42"/></svg>',
  };
  document.querySelectorAll("[data-icon]").forEach((el) => { el.innerHTML = ICONS[el.dataset.icon] || ""; });

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canvasBox = document.querySelector(".t-hero__canvas");
  let started = false;
  const startBlocks = () => {
    if (started || !canvasBox) return;
    started = true;
    canvasBox.dispatchEvent(new CustomEvent("fx:play"));
    gsap.to(canvasBox, { opacity: 1, duration: 1 });
  };

  /* Title: each letter rises from 10px below in .6s (.08 stagger), the copy letters overlap and continue by .2s, and the underline is drawn */
  const title = document.querySelector(".js-title");
  const split = (node, cls) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((word) => {
        if (!word) return;
        if (/^\s+$/.test(word)) { frag.append(word); return; }
        const w = document.createElement("span");
        w.style.display = "inline-block";
        [...word].forEach((ch) => { const s = document.createElement("span"); s.className = cls; s.textContent = ch; w.append(s); });
        frag.append(w);
      });
      n.replaceWith(frag);
    });
  };
  if (title) {
    title.querySelectorAll(".-row").forEach((r) => split(r, "-ch"));
    title.querySelectorAll(".-catch-line").forEach((r) => split(r, "-cc"));
    const items = title.querySelectorAll(".-ch"), catchs = title.querySelectorAll(".-cc"), lines = title.querySelectorAll(".-line line");
    if (reduce) { title.classList.add("is-split"); startBlocks(); }
    else {
      lines.forEach((l) => { const len = l.getTotalLength(); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len }); });
      gsap.set([items, catchs], { opacity: 0, y: 10 });
      title.classList.add("is-split");
      // The original title is an SVG drawing so it does not wait for fonts — ours is text, so it must start after the font loads so the glyph shapes do not change mid-entrance
      const run = () => gsap.timeline({ defaults: { ease: "power2.out" } })
        .to(items, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, onStart: startBlocks })
        .to(catchs, { opacity: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.2")
        .to(lines, { strokeDashoffset: 0, duration: 0.6, stagger: 0.08 }, "-=0.2");
      let ran = false;
      const go = () => { if (!ran) { ran = true; run(); } };
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
      setTimeout(go, 1500);
    }
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const kills = [];
    /* Photo strip: each item’s height is randomly staggered (PC -30~120, phone -10~60), and one set is cloned to loop endlessly to the left */
    document.querySelectorAll(".t-loopSlide__cover").forEach((root) => {
      const sp = innerWidth <= 767;
      const track = root.querySelector(".t-loopSlide__track");
      track.querySelectorAll("[data-clone]").forEach((n) => n.remove());
      const originals = [...track.children];
      originals.forEach((item) => item.style.setProperty("--loop-y", `${gsap.utils.random(sp ? -10 : -30, sp ? 60 : 120)}px`));
      originals.forEach((el) => { const c = el.cloneNode(true); c.dataset.clone = "1"; track.append(c); });
      const setWidth = track.scrollWidth / 2;
      const dir = Number(root.dataset.dir || 1);
      const speed = Number(root.dataset.speed || 100) * (sp ? 0.7 : 1);
      const wrapX = gsap.utils.wrap(-setWidth, 0);
      const tw = gsap.to(track, { x: dir * -setWidth, duration: setWidth / speed, ease: "none", repeat: -1, modifiers: { x: (x) => wrapX(parseFloat(x)) + "px" } });
      kills.push(() => { tw.kill(); track.querySelectorAll("[data-clone]").forEach((n) => n.remove()); gsap.set(track, { clearProps: "x" }); });
    });

    /* Strength English band: while passing through the section, each line moves in the opposite direction by 0.2 times one set’s width, scrub .5 */
    const sec = document.querySelector(".t-scroll-obj");
    if (sec) {
      sec.querySelectorAll(".t-scroll-obj__wrap").forEach((wrap, i) => {
        const setWidth = wrap.scrollWidth / 2;
        const dir = i % 2 === 0 ? 1 : -1;
        const wrapX = gsap.utils.wrap(-setWidth, 0);
        const st = ScrollTrigger.create({
          trigger: sec, start: "top bottom", end: "bottom top", scrub: 0.5,
          onUpdate: (self) => gsap.set(wrap, { x: wrapX(dir * -setWidth * self.progress * 0.2) }),
        });
        gsap.set(wrap, { x: wrapX(0) });
        kills.push(() => st.kill());
      });
    }

    /* Job panel pinned */
    document.querySelectorAll(".t-pinContent").forEach((root) => {
      const inner = root.querySelector(".t-pinContent__inner");
      const panels = [...root.querySelectorAll(".t-pinContent__panel")];
      const nav = [...root.querySelectorAll(".t-pinContent__lists__item")];
      const heading = root.querySelector(".t-pinContent__menu__heading");
      if (!inner || !panels.length || panels.length !== nav.length) return;
      const A = { dur: 0.4, ease: "power3.out", move: 40, navDur: 0.6, headDur: 0.2, threshold: 17 };
      const vh = () => (window.visualViewport ? window.visualViewport.height : innerHeight);
      let cur = 0, busy = false, jumping = false, locked = false, jump = null, points = [], lastY = scrollY;
      const setNav = (i) => nav.forEach((n, k) => n.classList.toggle("is-active", k === i));
      const setState = (i) => {
        panels.forEach((p, k) => {
          gsap.killTweensOf(p);
          gsap.set(p, k === i ? { autoAlpha: 1, yPercent: 0, zIndex: 2 } : { autoAlpha: 0, yPercent: A.move, zIndex: 1 });
          p.classList.toggle("is-active", k === i);
        });
        cur = i; setNav(i);
      };
      const go = (next, dirName) => {
        if (next === cur || busy) return;
        const a = panels[cur], b = panels[next];
        const fwd = dirName ? dirName === "forward" : next > cur;
        busy = true;
        panels.forEach((p) => { gsap.killTweensOf(p); if (p !== a && p !== b) { gsap.set(p, { autoAlpha: 0, yPercent: fwd ? A.move : -A.move, zIndex: 1 }); p.classList.remove("is-active"); } });
        gsap.set(a, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
        gsap.set(b, { autoAlpha: 1, yPercent: fwd ? A.move : -A.move, zIndex: 3 });
        a.classList.add("is-active"); b.classList.add("is-active");
        gsap.timeline({
          defaults: { duration: A.dur, ease: A.ease },
          onComplete: () => {
            gsap.set(a, { autoAlpha: 0, yPercent: 0, zIndex: 1 }); a.classList.remove("is-active");
            gsap.set(b, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
            cur = next; setNav(next); busy = false;
          },
        })
          .to(a, { yPercent: fwd ? -A.move : A.move, autoAlpha: 0.15, overwrite: "auto" }, 0)
          .to(b, { yPercent: 0, autoAlpha: 1, overwrite: "auto" }, 0);
      };
      setState(0);
      const fade = (v) => heading && gsap.to(heading, { opacity: v, duration: A.headDur, overwrite: "auto" });
      const st = ScrollTrigger.create({
        trigger: root,
        start: () => (innerWidth < 768 ? "top top" : "center center"),
        end: () => "+=" + (panels.length - 1) * vh() * 1.3,
        pin: inner, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 10,
        onEnter: () => fade(1), onLeave: () => fade(0), onEnterBack: () => fade(1), onLeaveBack: () => fade(0),
        onRefresh: (self) => {
          const step = (self.end - self.start) / Math.max(1, panels.length - 1);
          points = panels.map((_, i) => self.start + step * i);
          let near = 0;
          points.forEach((p, i) => { if (Math.abs(self.scroll() - p) < Math.abs(self.scroll() - points[near])) near = i; });
          setState(near); lastY = self.scroll();
        },
        onUpdate: (self) => {
          const y = self.scroll();
          if (jumping || busy) { lastY = y; return; }
          if (locked) { if (Math.abs(y - lastY) < 8) return; locked = false; }
          const d = y > lastY ? 1 : y < lastY ? -1 : 0;
          if (!d) { lastY = y; return; }
          if (d > 0 && cur < panels.length - 1 && y >= points[cur + 1] - A.threshold) go(cur + 1, "forward");
          if (d < 0 && cur > 0 && y <= points[cur - 1] + A.threshold) go(cur - 1, "backward");
          lastY = y;
        },
      });
      const handlers = nav.map((item, i) => {
        const h = (e) => {
          e.preventDefault();
          if (!points.length || (i === cur && !busy)) return;
          if (jump) jump.kill();
          const dirName = i > cur ? "forward" : "backward";
          const target = points[i] + 2;
          jumping = true; locked = true;
          go(i, dirName);
          const done = () => { cur = i; setNav(i); lastY = target; requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; })); };
          jump = gsap.to(window, { scrollTo: { y: target, autoKill: false }, duration: A.navDur, ease: A.ease, overwrite: "auto", onComplete: done });
        };
        item.addEventListener("click", h);
        return () => item.removeEventListener("click", h);
      });
      kills.push(() => { st.kill(); handlers.forEach((f) => f()); if (jump) jump.kill(); });
    });
    return () => kills.forEach((f) => f());
  });
})();
