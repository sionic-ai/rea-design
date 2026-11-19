// The strip flows endlessly, speeds up by the scroll speed when scrolling (rises in .3s, returns to 1× after .1s over .8s), and flows backward when scrolling up.
// On hover it glides to a stop over 1.2s, and you can drag to throw it (drag: on). One set is cloned to chain two sets.
(() => {
  kfFx.register("scroll-boost-marquee", (el, { options, reduce, hover, scroller }) => {
    const track = el.querySelector("[data-fx-part=track]");
    const set = track && track.querySelector("[data-fx-part=set]");
    if (!set) return;
    const clone = set.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("a, button").forEach((a) => (a.tabIndex = -1));
    track.appendChild(clone);
    // mode: add — instead of a multiplier, adds: base px/s by default plus scroll speed (px/s) × gain, up to max,
    // Follows at rise when going up and fall when going down (per frame at 60fps). Even when scrolling up, the direction stays the same
    if (options.mode === "add" && !reduce) {
      const basePx = +(options.base ?? 42), g2 = +(options.gain ?? 0.11), cap = +(options.max ?? 320);
      const rise = +(options.rise ?? 0.24), fall = +(options.fall ?? 0.055), sign = options.dir === "right" ? 1 : -1;
      const read = () => (scroller ? scroller.scrollTop : scrollY);
      let w = set.offsetWidth, x = 0, boost = 0, last = 0, y = read(), raf = 0;
      const step = (now) => {
        raf = requestAnimationFrame(step);
        const dt = last ? Math.min(64, Math.max(1, now - last)) : 1000 / 60;
        last = now;
        const sy = read(), want = Math.min(cap, g2 * (1000 / dt) * Math.abs(sy - y));
        y = sy;
        boost += (want - boost) * (1 - Math.pow(1 - (want > boost ? rise : fall), dt / (1000 / 60)));
        x += (dt / 1000) * (basePx + boost);
        if (w > 0) x %= w;
        track.style.transform = `translate3d(${(sign < 0 ? -x : x - w).toFixed(2)}px,0,0)`;
      };
      const io2 = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { if (!raf) { last = 0; y = read(); raf = requestAnimationFrame(step); } }
        else { cancelAnimationFrame(raf); raf = 0; }
      });
      io2.observe(el);
      const ro2 = new ResizeObserver(() => { w = set.offsetWidth; });
      ro2.observe(set);
      return () => { cancelAnimationFrame(raf); io2.disconnect(); ro2.disconnect(); track.style.transform = ""; clone.remove(); };
    }
    if (reduce || !window.ScrollTrigger) return () => clone.remove();
    gsap.registerPlugin(ScrollTrigger);

    const base = options.dir === "right" ? 1 : -1;
    const gain = +(options.gain ?? 0.15);
    const max = +options.max || 4.5;
    const glide = options.pause === "glide" && hover;
    let dir = base, tween = null, held = false, setW = 0;
    const wrap = (v) => gsap.utils.wrap(-setW, 0, v);
    // Seconds to pass one set: if lap is given, use it as is, otherwise pass speed % of the screen width per second (original product strip 5 = Screen width/20 px/s)
    const lap = () => (options.lap ? +options.lap || 82 : setW / (innerWidth * ((+options.speed || 5) / 100)));

    const run = () => {
      tween?.kill();
      setW = set.offsetWidth;
      if (!setW) return;
      const x = wrap(gsap.getProperty(track, "x"));
      gsap.set(track, { x });
      tween = gsap.to(track, { x: x + setW * dir, duration: lap(), ease: "none", repeat: -1, modifiers: { x: (v) => `${wrap(parseFloat(v))}px` } });
      if (held) tween.timeScale(0);
    };
    run();

    const onVelocity = (v) => {
      if (!tween) return;
      const d = v < -0.1 ? -base : v > 0.1 ? base : dir;
      if (d !== dir) { dir = d; run(); }
      const boost = gsap.utils.clamp(1, max, 1 + Math.abs(v) * gain);
      gsap.to(tween, { timeScale: held ? 0 : boost, duration: 0.3, overwrite: "auto" });
      gsap.to(tween, { timeScale: held ? 0 : 1, duration: 0.8, delay: 0.1, overwrite: "auto", ease: "power2.out" });
    };
    // The original uses Lenis velocity (px moved per frame) — divide ScrollTrigger’s px/s by 60 to use the same unit
    const st = ScrollTrigger.create({ trigger: el, ...(scroller && { scroller }), start: "top bottom", end: "bottom top", onUpdate: (s) => onVelocity(s.getVelocity() / 60) });

    const enter = () => { held = true; tween && gsap.to(tween, { timeScale: 0, duration: 1.2, ease: "power2.out", overwrite: "auto" }); };
    const leave = () => { held = false; drag?.isDragging || drag?.isThrowing || (tween && gsap.to(tween, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: "auto" })); };
    if (glide) { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); }

    let drag = null;
    if (options.drag === "on" && window.Draggable) {
      gsap.registerPlugin(Draggable, ...(window.InertiaPlugin ? [InertiaPlugin] : []));
      const proxy = document.createElement("div");
      let from = 0;
      const follow = function () { gsap.set(track, { x: wrap(from + this.x - this.startX) }); };
      [drag] = Draggable.create(proxy, {
        type: "x", trigger: el, inertia: !!window.InertiaPlugin, allowNativeTouchScrolling: true,
        onPress() { tween?.pause(); from = gsap.getProperty(track, "x"); gsap.set(proxy, { x: 0 }); this.update(); },
        onDrag: follow, onThrowUpdate: follow,
        onRelease() { if (!this.isThrowing) { run(); tween?.play(); } },
        onThrowComplete() { run(); },
      });
    }

    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? tween?.resume() : tween?.pause()), { rootMargin: "300px" });
    io.observe(el);
    const ro = new ResizeObserver(() => { if (set.offsetWidth !== setW) run(); });
    ro.observe(set);

    return () => {
      tween?.kill(); st.kill(); io.disconnect(); ro.disconnect(); drag?.kill();
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave);
      gsap.set(track, { clearProps: "transform" });
      clone.remove();
    };
  });
})();
