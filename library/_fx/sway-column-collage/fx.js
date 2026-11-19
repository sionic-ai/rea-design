// Staggered-height photo column board — the three hands-on touches of the original Brand hero, built as one part:
//  ① the track flows left and right following the mouse horizontal position (overflow width × ratio, following by .05 per frame, returns to center on leave) — 992px and up
//  ② Rolling the wheel makes each column follow deltaY/2 over a different length (.5/.8/.2/.3/.6s power3), so the columns are staggered (up to half the column height)
//  ③ After 3 seconds idle at the top of the hero, the columns sink 70px one by one (1s power1.inOut) and come back up having swapped the first photo for the next —
//     .62s between pillars, a 3s rest after one lap. While spinning, smooth scroll (window.lenis) is paused, and if the wheel was turned in the meantime it stops at the end of the lap.
(() => {
  kfFx.register("sway-column-collage", (el, { options, reduce, hover }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    const cols = [...el.querySelectorAll('[data-fx-part="col"]')].filter((c) => c.offsetParent !== null);
    if (!track || !cols.length) return;
    const lenis = () => window.lenis || null;
    const scrollTop = () => (typeof lenis()?.scroll === "number" ? lenis().scroll : scrollY);
    const cleanups = [];
    let started = false, locked = false, interrupted = false, wasTop = null, timer = 0, inView = false, acc = 0;

    const lock = () => { locked = true; lenis()?.stop(); };
    const unlock = () => { locked = false; lenis()?.start(); };

    // ③ Wheel that sinks, switches, then rises
    const sink = +(options.sink ?? 70);
    const fadeOf = (col) => {
      const wraps = [...col.querySelectorAll('[data-fx-part="media"]')].slice(0, 2);
      return wraps.map((w) => w.querySelector('[data-fx-part="pic"]')).filter(Boolean);
    };
    const swap = (col) => {
      const first = col.querySelector('[data-fx-part="media"]');
      const cur = first?.querySelector('[data-fx-part="pic"]');
      const pool = [...col.querySelectorAll('[data-fx-part="next"]')];
      if (!cur || !pool.length) return;
      const nxt = pool[0];
      cur.dataset.fxPart = "next";
      col.append(cur);
      nxt.dataset.fxPart = "pic";
      gsap.set(nxt, { opacity: 0 });
      first.append(nxt);
      if (nxt.dataset.tint) first.dataset.tint = nxt.dataset.tint;
      col.dispatchEvent(new CustomEvent("fx:cycle", { bubbles: true }));
    };
    const tl = reduce ? null : gsap.timeline({ repeat: -1, paused: true });
    if (tl) {
      let at = 0;
      cols.forEach((col, i) => {
        const wraps = [...col.querySelectorAll('[data-fx-part="media"]')].slice(0, 2);
        if (!wraps.length) return;
        gsap.set(wraps, { y: 0, willChange: "transform" });
        const n = at;
        tl.to(wraps, { y: sink, duration: 1, ease: "power1.inOut" }, n);
        tl.call(() => gsap.to(fadeOf(col), { opacity: 0, duration: 0.9, ease: "sine.inOut" }), [], n + 0.1);
        tl.to({}, { duration: 0.12 }, n + 1);
        tl.call(() => swap(col), [], n + 1.12);
        tl.to(wraps, { y: 0, duration: 1, ease: "power1.inOut" }, n + 1.12);
        tl.call(() => gsap.to(fadeOf(col), { opacity: 1, duration: 0.85, ease: "sine.inOut" }), [], n + 1.12);
        const p = n + 2.12;
        if (i === cols.length - 1) {
          tl.call(unlock, [], p);
          tl.to({}, { duration: +(options.rest ?? 3) }, p);
          const end = p + +(options.rest ?? 3);
          tl.addLabel("cycleBoundary", end);
          tl.call(() => (interrupted ? tl.pause() : lock()), [], "cycleBoundary");
        } else at = p - 1.5;
      });
      cleanups.push(() => tl.kill());
    }
    const clearTimer = () => { clearTimeout(timer); timer = 0; };
    const idle = +(options.idle ?? 3);
    const waitAtTop = () => {
      if (!tl || !started) return;
      clearTimer();
      tl.pause();
      timer = setTimeout(() => { timer = 0; if (scrollTop() <= 2) { interrupted = false; lock(); tl.play(); } }, idle * 1000);
    };
    const onScroll = () => {
      if (!tl) return;
      const top = scrollTop() <= 2;
      if (wasTop === null) wasTop = top;
      if (wasTop && !top) { interrupted = true; clearTimer(); }
      if (!wasTop && top) waitAtTop();
      wasTop = top;
    };

    // ② Columns that follow the wheel with a stagger
    const lags = String(options.lags || "0.5,0.8,0.2,0.3,0.6").split(",").map(Number);
    const half = Math.max(0, ...cols.map((c) => c.clientHeight / 2));
    const clampAcc = gsap.utils.clamp(-half, 0);
    const movers = cols.map((c, i) => gsap.quickTo(c, "y", { duration: lags[i % lags.length] || 0.5, ease: "power3" }));
    const wheelK = +(options.wheel ?? 0.5);
    const onWheel = (e) => {
      if (locked) interrupted = true;
      else if (inView && !reduce) { acc = clampAcc(acc - e.deltaY * wheelK); movers.forEach((m) => m(acc)); }
      onScroll();
    };
    addEventListener("wheel", onWheel, { passive: true });
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("touchmove", onScroll, { passive: true });
    const L0 = lenis();
    L0?.on?.("scroll", onScroll);
    cleanups.push(() => {
      removeEventListener("wheel", onWheel);
      removeEventListener("scroll", onScroll);
      removeEventListener("touchmove", onScroll);
      L0?.off?.("scroll", onScroll);
      clearTimer();
      if (locked) unlock();
      gsap.killTweensOf(cols);
      gsap.set(cols, { clearProps: "transform" });
    });
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; }, { threshold: 0 });
    io.observe(el);
    cleanups.push(() => io.disconnect());

    // ① Panel flowing with horizontal mouse position
    if (!reduce && hover && innerWidth >= +(options.min ?? 992)) {
      const lerp = +(options.lerp ?? 0.05);
      let cur = 0, target = 0, rest = 0, alive = true, raf = 0;
      const measure = (snap) => {
        const max = Math.max(0, track.scrollWidth - el.clientWidth);
        el._fxPanMax = max;
        rest = -max / 2;
        if (snap) { cur = target = rest; track.style.transform = `translate3d(${cur}px, 0, 0)`; }
        else { cur = gsap.utils.clamp(-max, 0, cur); target = gsap.utils.clamp(-max, 0, target); }
      };
      const onMove = (e) => {
        if (!started) return;
        const r = el.getBoundingClientRect();
        target = -(el._fxPanMax || 0) * gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width);
      };
      const onLeave = () => { target = rest; };
      const onResize = () => measure(false);
      measure(true);
      const tick = () => { if (!alive) return; cur += lerp * (target - cur); track.style.transform = `translate3d(${cur}px, 0, 0)`; raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
      el.addEventListener("mousemove", onMove, { passive: true });
      el.addEventListener("mouseleave", onLeave, { passive: true });
      addEventListener("resize", onResize, { passive: true });
      cleanups.push(() => {
        alive = false;
        cancelAnimationFrame(raf);
        el.removeEventListener("mousemove", onMove);
        el.removeEventListener("mouseleave", onLeave);
        removeEventListener("resize", onResize);
        track.style.transform = "";
      });
    }

    // Starts when the using side fires fx:start at the end of its intro (wait: event) — otherwise starts immediately
    const start = () => {
      if (started) return;
      started = true;
      if (!tl) return;
      wasTop = scrollTop() <= 2;
      if (wasTop) waitAtTop();
      else { interrupted = true; tl.play(); }
    };
    if (options.wait === "event") {
      el.addEventListener("fx:start", start);
      cleanups.push(() => el.removeEventListener("fx:start", start));
    } else start();

    return () => cleanups.splice(0).reverse().forEach((f) => f());
  });
})();
