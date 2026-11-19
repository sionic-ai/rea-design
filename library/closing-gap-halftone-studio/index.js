// Hero page — values taken as-is from the original home label (setInitialStates · intro · init)
(() => {
  let heroSplit = null;
  const def = {
    set(root) {
      const ps = root.querySelectorAll("[data-hero-p]");
      heroSplit = ps.length ? new SplitText(ps, { type: "lines", linesClass: "split-line", mask: "lines" }) : null;
      gsap.set(root.querySelector(".hero__btn"), { yPercent: 150 });
      gsap.set(root.querySelector(".hero__visuals"), { clipPath: "inset(100% 0% 0% 100% round 0.15rem)" });
      if (heroSplit) gsap.set(heroSplit.lines, { yPercent: 150 });
      gsap.set(root.querySelector(".mo-nav"), { autoAlpha: 0 });
    },
    // The header opens at .3s, title lines at each paragraph’s data-delay-enter (0·.2·.6), buttons at .55s, and the photo plate from 0 over 1.25s
    intro(root) {
      const { D } = MO;
      const tl = gsap.timeline({ defaults: { ease: "ease-transition" } });
      const lines = heroSplit?.lines || [];
      tl.set(root.querySelectorAll("[data-animate]"), { autoAlpha: 1 });
      MO.navIntro(tl, root, 0.3, 0.0525);
      root.querySelectorAll("[data-hero-p]").forEach((p) => {
        const own = lines.filter((l) => l.closest("[data-hero-p]") === p);
        const at = Number(p.getAttribute("data-delay-enter"));
        if (own.length) tl.to(own, { yPercent: 0, duration: D.slow, stagger: 0.075 }, Number.isFinite(at) && at >= 0 ? at : 0);
      });
      tl.to(root.querySelector(".hero__btn"), { yPercent: 0, duration: D.slow }, 0.55);
      tl.to(root.querySelector(".hero__visuals"), { clipPath: "inset(0% 0% 0% 0% round 0.15rem)", duration: D.slower }, 0);
      return tl;
    },
    init(root) {
      const { D } = MO;
      const offs = [];
      const mm = gsap.matchMedia();
      offs.push(() => mm.revert());

      // Identity label: on wide screens, while passing the hero it is pulled down from the bottom of the first view to the bottom of the hero (scrub .5)
      const deco = root.querySelector(".hero__deco"), box = root.querySelector(".hero__container");
      if (deco && box) mm.add("(min-width: 991px)", () => {
        gsap.fromTo(deco, { y: 0 }, { y: () => { const y = parseFloat(gsap.getProperty(deco, "y")) || 0; const b = deco.getBoundingClientRect().bottom - y; return Math.max(0, box.getBoundingClientRect().bottom - b); }, ease: "none", scrollTrigger: { trigger: deco.parentElement, start: "top top", end: "bottom bottom", scrub: 0.5, invalidateOnRefresh: true } });
      });

      // Case popup: a bar fills over 8s at the bottom of the chosen card, then moves to the next card. Chosen card 1x, others .95x + dark veil, large photo passes a black veil 1.2→1
      const vis = root.querySelector(".hero__visuals");
      const shots = vis ? [...vis.querySelectorAll(".hero__item")] : [], cards = vis ? [...vis.querySelectorAll(".popup__item")] : [], over = vis?.querySelector(".hero__overlay");
      const n = Math.min(shots.length, cards.length);
      if (n >= 2) {
        const bgs = cards.map((c) => c.querySelector(".popup__bg")), shades = cards.map((c) => c.querySelector(".popup__overlay")), imgs = shots.map((s) => s.querySelector(".hero__img")), btns = cards.map((c) => c.querySelector("[data-featured-item]"));
        const reset = () => { gsap.set(bgs, { y: 0, yPercent: 100 }); gsap.set(over, { autoAlpha: 0 }); cards.forEach((c, i) => gsap.set(c, { scale: i ? 0.95 : 1, transformOrigin: "center center" })); shades.forEach((s, i) => gsap.set(s, { autoAlpha: i ? 1 : 0 })); shots.forEach((s, i) => gsap.set(s, { autoAlpha: +(i === 0), zIndex: i ? 2 : 1 })); gsap.set(imgs, { scale: 1, transformOrigin: "center center" }); };
        mm.add({ motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" }, (c) => {
          const motion = c.conditions.motion, dur = motion ? 0.6 : 0, small = 0.95;
          reset();
          let cur = 0, shown = 0, prog = null, swap = null, inView = false, awake = !document.hidden;
          const play = () => prog && (inView && awake ? prog.play() : prog.pause());
          const fill = (i) => { gsap.killTweensOf(bgs[i]); prog = gsap.fromTo(bgs[i], { y: 0, yPercent: 100 }, { yPercent: 0, duration: 8, ease: "none", overwrite: "auto", paused: !(inView && awake), onComplete: () => pick((i + 1) % n) }); };
          const drain = (i) => { gsap.killTweensOf(bgs[i]); gsap.to(bgs[i], { yPercent: -100, duration: dur, ease: "ease-transition", overwrite: "auto" }); };
          const mark = (i, on) => { gsap.to(cards[i], { scale: on ? 1 : small, duration: dur, ease: "ease-transition", overwrite: "auto" }); gsap.killTweensOf(shades[i]); gsap.to(shades[i], { autoAlpha: on ? 0 : 1, duration: dur, ease: "ease-transition", overwrite: "auto" }); };
          const show = (i) => {
            swap?.kill();
            const flip = () => { const a = shots[shown], b = shots[i]; shown = i; gsap.set(a, { autoAlpha: 0, zIndex: 1 }); gsap.set(b, { autoAlpha: 1, zIndex: 2 }); gsap.set(imgs[i], { scale: motion ? 1.2 : 1 }); };
            if (!motion) { flip(); return; }
            swap = gsap.timeline().to(over, { autoAlpha: 1, duration: D.fast, ease: "ease-fade", overwrite: "auto" }).call(flip).to(over, { autoAlpha: 0, duration: D.fast, ease: "ease-fade" }).to(imgs[i], { scale: 1, duration: D.slow, ease: "ease-transition" }, "<");
          };
          const pick = (i) => { if (i === cur) return; const was = cur; cur = i; prog?.kill(); drain(was); fill(i); mark(was, false); mark(i, true); show(i); };
          const clicks = btns.map((b, i) => { const f = (e) => { e.preventDefault(); pick(i); }; b.addEventListener("click", f); return [b, f]; });
          const vischange = () => { awake = !document.hidden; play(); };
          document.addEventListener("visibilitychange", vischange);
          const st = ScrollTrigger.create({ trigger: vis, start: "top bottom", end: "bottom top", onToggle: (s) => { inView = s.isActive; play(); } });
          inView = st.isActive;
          fill(0);
          return () => { clicks.forEach(([b, f]) => b.removeEventListener("click", f)); document.removeEventListener("visibilitychange", vischange); st.kill(); prog?.kill(); swap?.kill(); };
        });
      }

      // GAP: photos change every .8 seconds, and while pinned, the half titles gather from ±30vw and the photo panel opens from inset 50%
      const gap = root.querySelector(".gap");
      if (gap) {
      const pics = gap.querySelectorAll(".gap__image");
      let gi = 0, timer = null;
      pics.forEach((p, i) => gsap.set(p, { opacity: +(i === 0) }));
      const flipPic = () => { gsap.set(pics[gi], { opacity: 0 }); gi = (gi + 1) % pics.length; gsap.set(pics[gi], { opacity: 1 }); };
      const run = () => { if (!timer && !MO.reduced) timer = setInterval(flipPic, 800); };
      const halt = () => { clearInterval(timer); timer = null; };
      ScrollTrigger.create({ trigger: gap, start: "top bottom", end: "bottom top", onEnter: run, onLeave: halt, onEnterBack: run, onLeaveBack: halt });
      offs.push(halt);
      const halves = gap.querySelectorAll(".gap__half"), cover = gap.querySelector(".gap__cover");
      gsap.timeline({ scrollTrigger: { trigger: gap, start: "top 50%", end: "bottom top", scrub: true } })
        .to(halves, { x: "0vw", duration: D.slow, ease: "ease-transition" })
        .fromTo(cover, { clipPath: "inset(50% 50% 50% 50% round 0.25rem)" }, { clipPath: "inset(0% 0% 0% 0% round 0.25rem)", duration: D.slow, ease: "ease-transition" }, "<");
      gap.querySelectorAll(".gap__heading").forEach((h) => {
        const left = h.classList.contains("is-left");
        SplitText.create(h, { type: "chars", charsClass: "gap-char", autoSplit: true, onSplit(s) {
          gsap.set(s.chars, { display: "inline-block", x: left ? -80 : 80, scaleY: 0.95, opacity: 0 });
          return gsap.to(s.chars, { keyframes: { "40%": { opacity: 1 }, "90%": { x: 0, scaleY: 1 }, "100%": {} }, duration: 1, ease: "expo.out", stagger: { each: 0.022, from: left ? "end" : "start" }, scrollTrigger: { trigger: gap.querySelector(".gap__contain"), start: "top 50%", end: "bottom top", scrub: 0.5, invalidateOnRefresh: true } });
        } });
      });
      }

      // Card stacking (wide screens): while the next card rises, the previous one is pushed 50% and a black curtain goes 0→1
      const stack = root.querySelectorAll("[data-stacking-cards-item]");
      mm.add("(min-width: 992px)", () => {
        stack.forEach((el, i) => {
          if (!i) return;
          const prev = stack[i - 1], veil = prev.querySelector("[data-stacking-cards-overlay]");
          const tl = gsap.timeline({ defaults: { ease: "none", duration: 1 }, scrollTrigger: { trigger: el, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
          tl.fromTo(prev, { yPercent: 0 }, { yPercent: 50 }, 0);
          if (veil) tl.fromTo(veil, { opacity: 0 }, { opacity: 1 }, 0);
        });
      });

      // Service: panels enter from -50% and 4px blur (scrub), hovering a name sets that row to 1 and the rest to .3, and the photo panel moves to that row’s center in .95s
      const sv = root.querySelector(".services");
      if (sv) {
      const names = [...sv.querySelectorAll("[data-content-trigger]")], wrap = sv.querySelector(".services__img-wrap"), pics2 = [...sv.querySelectorAll("[data-content-image]")];
      gsap.fromTo(wrap, { yPercent: -50, opacity: 0, filter: "blur(4px)" }, { yPercent: 0, opacity: 1, filter: "blur(0px)", ease: "none", scrollTrigger: { trigger: sv, start: "top bottom", end: "center bottom", scrub: true } });
      const host = wrap.parentElement;
      const centerOf = (el) => { const a = host.getBoundingClientRect(), b = el.getBoundingClientRect(); return b.top - a.top + b.height / 2; };
      let firstMove = true;
      const moveTo = (el) => { const y = centerOf(el); if (firstMove) { firstMove = false; gsap.set(wrap, { y }); } else gsap.to(wrap, { y, duration: D.slow, ease: "ease-transition" }); };
      const choose = (i) => {
        pics2.forEach((p, j) => { p.classList.toggle("active", j === i); gsap.to(p, { opacity: +(j === i), duration: 0.2, ease: "ease-fade" }); });
        names.forEach((nm, j) => gsap.to(nm, { opacity: j === i ? 1 : 0.3, duration: 0.2, ease: "ease-fade" }));
      };
      choose(0); moveTo(names[0]);
      names.forEach((nm, i) => nm.addEventListener("mouseenter", () => { choose(i); moveTo(nm); }));
      }

      root.querySelectorAll("[data-slider]").forEach((s) => MO.slider(s));
      MO.highlight(root);

      // Touch screen: while the work row passes the screen center (65% to 35%), it shows in the hands-on state
      mm.add("(hover: none), (pointer: coarse)", () => {
        const sts = gsap.utils.toArray(".works__item", root).map((el) => ScrollTrigger.create({ trigger: el, start: "top 65%", end: "bottom 35%", toggleClass: { targets: el, className: "is-active" } }));
        return () => sts.forEach((s) => s.kill());
      });
      return () => { offs.forEach((f) => f()); heroSplit?.revert?.(); heroSplit = null; };
    },
  };
  // about.html opens like the original /about, with the About drawer open over the first page — the Hero behind it is hooked with the same label
  if (window.MO) { MO.page("home", def); MO.page("about", def); }
})();
