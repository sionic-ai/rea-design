// First-page-only motion: arch covering the pinned hero, truck passing diagonally, photos floating up in random order, photo bouncing within two cells.
(() => {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero handwritten phrase: the letters (13 stroke drawings in the original) light up for 0.4s each at 0.1s intervals (original .svg-text path, power1.inOut)
    document.querySelectorAll("[data-fv-msg]").forEach((msg) => {
      if (!msg.dataset.split) {
        msg.dataset.split = "1";
        const walk = (node) => [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) n.replaceWith(...[...n.textContent].map((ch) => {
            if (!ch.trim()) return document.createTextNode(ch);
            const s = document.createElement("span"); s.className = "h-fv__ch"; s.textContent = ch; return s;
          }));
          else walk(n);
        });
        walk(msg);
      }
      const chars = msg.querySelectorAll(".h-fv__ch");
      gsap.set(chars, { opacity: 0 });
      gsap.to(chars, { opacity: 1, duration: 0.4, stagger: 0.1, ease: "power1.inOut" });
    });

    // The Hero photo stays in place until 200px before the end of the next section (original js-fix: scrub 1, no pinSpacing)
    const fix = document.querySelector("[data-fix]");
    const concept = document.querySelector("[data-concept]");
    ScrollTrigger.create({ trigger: fix, start: "top 0px", endTrigger: concept, end: "bottom 200px", pin: true, pinSpacing: false });

    // Top edge of the covering section: a curve whose center sags by data-depth-pc % of the panel height (data-depth-sp % at 400px or less) and
    // Flattens from when the section top touches the screen bottom until it touches the screen top (original jsArch: 3% · 1%, clamped to 0~80)
    const arch = document.querySelector("[data-arch]");
    const narrow = matchMedia("(max-width: 400px)");
    const pct = () => Math.max(0, Math.min(80, Number(narrow.matches ? arch.dataset.depthSp : arch.dataset.depthPc) || 40));
    let p = pct();
    const full = () => arch.getBoundingClientRect().height * (p / 100);
    const state = { d: full() };
    const draw = () => {
      const { width: w, height: h } = arch.getBoundingClientRect();
      arch.style.clipPath = `path('M 0 0 Q ${w / 2} ${state.d} ${w} 0 L ${w} ${h} 0 ${h} Z')`;
    };
    draw();
    const tw = gsap.to(state, { d: 0, ease: "none", onUpdate: draw, scrollTrigger: { trigger: concept, start: "top bottom", end: "top top", scrub: true } });
    const fit = () => {
      const n = pct();
      if (n !== p) { p = n; state.d = full() * (1 - tw.progress()); }
      draw();
    };
    const ro = new ResizeObserver(fit);
    ro.observe(arch);
    narrow.addEventListener("change", fit);
    ScrollTrigger.addEventListener("refresh", fit);

    // Truck: from off-screen top right to off-screen bottom left, flips left-right when scrolling backward (original jsCar)
    const yFactor = innerWidth <= 480 ? 0.35 : 0.55;
    const car = document.querySelector("[data-car]");
    const span = () => {
      const w = car.getBoundingClientRect().width, h = car.getBoundingClientRect().height;
      return { fromX: 0.55 * innerWidth + w + 16, fromY: -innerHeight * yFactor - h - 16, toX: -0.55 * innerWidth - w - 16, toY: innerHeight * yFactor + h + 16 };
    };
    const flip = gsap.quickSetter(car, "scaleX");
    gsap.fromTo(car, { x: () => span().fromX, y: () => span().fromY }, {
      x: () => span().toX, y: () => span().toY, ease: "none",
      scrollTrigger: { trigger: car.parentElement, start: "top 150%", end: "+=200%", scrub: 0.6, invalidateOnRefresh: true, onUpdate: (s) => flip(s.direction === -1 ? -1 : 1) },
    });

    // Photo pile: shuffled order, floating up at .08s intervals
    const items = gsap.utils.toArray("[data-scatter] > li");
    gsap.set(items, { opacity: 0, y: 30 });
    const order = gsap.utils.shuffle(items.map((_, i) => i));
    ScrollTrigger.create({ trigger: "[data-scatter]", start: "top 70%", once: true, onEnter: () => order.forEach((n, k) => gsap.to(items[n], { opacity: 1, y: 0, duration: 0.6, delay: 0.08 * k, ease: "power1.out" })) });

    return () => { ro.disconnect(); narrow.removeEventListener("change", fit); ScrollTrigger.removeEventListener("refresh", fit); arch.style.clipPath = ""; tw.kill(); };
  });

  const boxes = document.querySelectorAll("[data-bounce-box]");
  boxes.forEach((box) => {
    const opt = box.dataset.bounceBox === "blog" ? { speedMin: 120, speedMax: 200, dtDiv: 33, nudge: 0.15 } : { speedMin: 100, speedMax: 170, dtDiv: 28, nudge: 0.15 };
    mBounce(box.querySelector(".h-two__field"), box.querySelector(".h-two__deco"), opt);
  });
})();
