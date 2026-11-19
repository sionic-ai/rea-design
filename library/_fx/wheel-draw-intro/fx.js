(() => {
  // Even with several stages, release the lock when the last one finishes
  let locks = 0;
  const lockScroll = () => { if (locks++ === 0) document.documentElement.style.overflow = "hidden"; };
  const unlockScroll = () => { if (locks > 0 && --locks === 0) document.documentElement.style.overflow = ""; };
  kfFx.register("wheel-draw-intro", (el, { options, reduce }) => {
    const part = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const parts = (n) => [...el.querySelectorAll(`[data-fx-part="${n}"]`)];
    const stage = part("stage");
    if (!stage) return;
    const title = part("title"), base = parts("base"), float = parts("float"), marks = parts("mark");
    const layers = parts("layer"), wide = part("wide"), veil = part("veil"), cue = part("cue"), body = part("body");
    const steps = +(options.steps ?? 6), span = +(options.span ?? 0.5);
    const zoom = +(options.zoom ?? 0.88), zoomSp = +(options.zoomsp ?? 1.294);
    const fadeIn = +(options.fade ?? 1), bob = +(options.bob ?? 2);
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const narrow = () => matchMedia("(max-width: 767px)").matches;
    // GSAP warns on empty targets, so pass them only when present
    const put = (t, v) => { const list = [].concat(t).filter(Boolean); if (list.length) gsap.set(list, v); };
    const all = [title, ...base, ...float, ...marks, ...layers, wide, veil, cue].filter(Boolean);

    const finish = () => {
      put([title, cue, ...marks], { autoAlpha: 0 });
      put([...base, ...float, ...layers, wide], { autoAlpha: 1 });
      if (veil) gsap.set(veil, { autoAlpha: 1 });
      gsap.set(stage, { scale: narrow() ? zoomSp : zoom });
      if (body) gsap.set(body, { autoAlpha: 1 });
      el.classList.add("is-done");
    };
    if (reduce) {
      finish();
      el.dispatchEvent(new CustomEvent("fx:done"));
      return () => { gsap.set([...all, stage, body].filter(Boolean), { clearProps: "all" }); el.classList.remove("is-done"); };
    }

    put(all, { autoAlpha: 0 });
    if (body) gsap.set(body, { autoAlpha: 0 });
    // The original keeps body fixed — wheel values are received but the document doesn’t move until the end
    lockScroll();
    let locked = true;
    const release = () => { if (locked) { locked = false; unlockScroll(); } };
    let total = 0, first = true, ended = false, sy = 0, bobTw = null;
    const tl = gsap.timeline();
    const height = () => innerHeight * Math.max(1, layers.length) * span;

    // Title 1s then bottom image 1s, .5s later the moving prop 1s and the scroll indicator 1s — once the indicator is fully shown, it wobbles up and down and starts accepting wheel turns
    if (title) tl.to(title, { autoAlpha: 1, duration: fadeIn, ease });
    tl.addLabel("base");
    if (base.length) tl.to(base, { autoAlpha: 1, duration: fadeIn, ease }, "base");
    if (float.length) tl.to(float, { autoAlpha: 1, duration: fadeIn, ease }, "base+=0.5");
    if (cue) tl.to(cue, { autoAlpha: 1, duration: fadeIn, ease }, "base+=0.5");
    tl.call(() => {
      if (cue) bobTw = gsap.to(cue, { keyframes: { yPercent: [0, 15, 0] }, duration: bob, ease: "none", repeat: -1 });
      listen();
    });

    const advance = (delta) => {
      if (ended) return;
      total += delta;
      if (first && total > 0) {
        first = false;
        if (title) gsap.to(title, { autoAlpha: 0, duration: fadeIn, ease });
        put(marks, { autoAlpha: 1 });
        if (narrow()) put(float, { autoAlpha: 0 });
      }
      let done = false;
      if (narrow()) done = total > 0;
      else {
        const p = total / height();
        // Each floor lights up by progress × steps − index — with three floors all light at 1/6·2/6·3/6 and it ends at progress 1
        layers.forEach((l, i) => gsap.set(l, { autoAlpha: Math.min(1, Math.max(0, p * steps - i)) }));
        done = p >= 1;
      }
      if (done) end();
    };
    const onWheel = (e) => advance(Math.max(e.deltaY, 0));
    const onTouchStart = (e) => { sy = e.touches[0].clientY; };
    const onTouchMove = (e) => advance(Math.max(sy - e.touches[0].clientY, 0));
    const onKey = (e) => { if (["ArrowDown", "PageDown", " ", "End"].includes(e.key)) advance(innerHeight * 0.5); };
    function listen() {
      addEventListener("wheel", onWheel, { passive: true });
      addEventListener("touchstart", onTouchStart, { passive: true });
      addEventListener("touchmove", onTouchMove, { passive: true });
      addEventListener("keydown", onKey);
    }
    function unlisten() {
      removeEventListener("wheel", onWheel);
      removeEventListener("touchstart", onTouchStart);
      removeEventListener("touchmove", onTouchMove);
      removeEventListener("keydown", onKey);
    }
    // Footer: wide image .3s → stage recedes in 1s (phone comes closer) → white veil over the wide image .3s · body opens → fx:done .5s later
    const endTl = gsap.timeline({ paused: true });
    function end() {
      ended = true;
      unlisten();
      bobTw?.kill();
      if (cue) gsap.to(cue, { autoAlpha: 0, duration: fadeIn, ease });
      if (wide) endTl.to(wide, { autoAlpha: 1, duration: 0.3, ease });
      endTl.to(stage, { scale: narrow() ? zoomSp : zoom, duration: 1, ease });
      if (veil) endTl.to(veil, { autoAlpha: 1, duration: 0.3, ease });
      endTl.call(() => {
        release();
        if (body) gsap.set(body, { autoAlpha: 1 });
        el.classList.add("is-done");
      }, null, veil ? "<" : ">");
      endTl.call(() => el.dispatchEvent(new CustomEvent("fx:done")), null, "+=0.5");
      endTl.play();
    }

    return () => {
      tl.kill(); endTl.kill(); bobTw?.kill(); unlisten();
      release();
      gsap.set([...all, stage, body].filter(Boolean), { clearProps: "all" });
      el.classList.remove("is-done");
    };
  });
})();
