// Mask the logo letters cell by cell and stand one more copy of the same letter one cell below, so each cell rolls up once and returns to the original letter —
// At each point where the loop ends it checks whether to stop, so letters never stop misaligned. Once all are set, the whole logo moves to the hero wordmark position (original preloader).
(() => {
  kfFx.register("char-roll-loader", (el, { options, reduce }) => {
    const mark = el.querySelector('[data-fx-part="mark"]');
    if (!mark || !mark.textContent.trim() || !window.gsap || !window.SplitText) return;
    gsap.registerPlugin(SplitText);
    const n = (k, d) => +(options[k] ?? d);
    const roll = n("roll", 1.2), each = n("each", 0.24), intro = n("intro", 0.9), introEach = n("intro-each", 0.08);
    const min = n("min", 2), max = n("max", 8), move = n("move", 0.6), fade = n("fade", 0.5);
    const rowK = n("row", 1.5) || 1.5, gapK = n("gap", 0.2);
    const t0 = performance.now();
    let live = true, finished = false, phase = "idle", stop = false, padTop = 0, split = null, loop = null, introTl = null, outTl = null;
    const timers = [];
    const done = () => { el.classList.add("is-done"); el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };

    if (reduce) {
      gsap.set(el, { autoAlpha: 0, pointerEvents: "none" });
      queueMicrotask(() => live && done());
      return () => { live = false; gsap.set(el, { clearProps: "opacity,visibility,pointerEvents" }); el.classList.remove("is-done"); };
    }

    gsap.set(mark, { opacity: 0 });

    function finish() {
      if (finished || !live) return;
      finished = true;
      done();
      const target = options.to ? document.querySelector(options.to) : null;
      const from = mark.getBoundingClientRect();
      gsap.set(mark, { position: "fixed", top: from.top, left: from.left, margin: 0 });
      outTl = gsap.timeline({ onComplete: () => gsap.set(el, { visibility: "hidden", pointerEvents: "none" }) });
      if (target) {
        const to = target.getBoundingClientRect();
        outTl.to(mark, { top: to.top - padTop, left: to.left, duration: move, ease: "power2.inOut" });
      }
      outTl.to(el, { opacity: 0, duration: fade, ease: "power2.out" });
    }

    function startLoop(tracks) {
      loop = gsap.timeline({
        repeat: -1,
        onRepeat() {
          if (!stop) return;
          this.pause(0);
          finish();
        },
      });
      tracks.forEach((t, i) => loop.fromTo(t, { y: 0 }, { y: -t._flip, duration: roll, ease: "power2.inOut" }, i * each));
    }

    function build() {
      if (!live) return;
      split = SplitText.create(mark, { type: "chars", mask: "chars" });
      const tracks = split.chars.map((ch, i) => {
        const box = ch.parentNode;
        const h = ch.getBoundingClientRect().height;
        const lh = parseFloat(getComputedStyle(ch).lineHeight);
        const row = (isNaN(lh) ? h : Math.max(lh, h)) * rowK;
        const gap = row * gapK;
        if (i === 0) padTop = (row - h) / 2;
        Object.assign(box.style, { display: "inline-block", overflow: "hidden", height: `${row}px`, verticalAlign: "top" });
        const track = document.createElement("div");
        Object.assign(track.style, { display: "flex", flexDirection: "column", gap: `${gap}px` });
        [ch, ch.cloneNode(true)].forEach((node) => {
          const r = document.createElement("div");
          Object.assign(r.style, { height: `${row}px`, display: "flex", alignItems: "center" });
          r.append(node);
          track.append(r);
        });
        box.append(track);
        track._flip = row + gap;
        track._row = row;
        return track;
      });
      gsap.set(tracks, { y: (i) => tracks[i]._row });
      phase = "intro";
      introTl = gsap.timeline({
        onComplete() {
          if (stop) { phase = "done"; finish(); return; }
          phase = "loop";
          startLoop(tracks);
        },
      });
      introTl.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: intro, ease: "power2.out" }, 0);
      tracks.forEach((t, i) => introTl.fromTo(t, { y: t._row }, { y: 0, duration: intro, ease: "power3.out" }, i * introEach));
    }

    function proceed() {
      if (phase === "idle") finish();
      else stop = true;
    }

    const loaded = new Promise((res) => (document.readyState === "complete" ? res() : addEventListener("load", res, { once: true })));
    const pics = Promise.all([...document.images].filter((im) => !im.complete).map((im) => new Promise((res) => {
      im.addEventListener("load", res, { once: true });
      im.addEventListener("error", res, { once: true });
    })));
    Promise.all([loaded, pics]).then(() => {
      timers.push(setTimeout(proceed, Math.max(min * 1000 - (performance.now() - t0), 0)));
    });
    timers.push(setTimeout(proceed, max * 1000));
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(build);

    return () => {
      live = false;
      timers.forEach(clearTimeout);
      [introTl, loop, outTl].forEach((t) => t && t.kill());
      split && split.revert();
      gsap.set(mark, { clearProps: "opacity,position,top,left,margin" });
      gsap.set(el, { clearProps: "opacity,visibility,pointerEvents" });
      el.classList.remove("is-done");
    };
  });
})();
