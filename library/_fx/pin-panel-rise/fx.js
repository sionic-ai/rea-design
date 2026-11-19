// Panels stay pinned and the next panel rises from below at each scroll threshold — recruit-pnp topAnimation.pinContent values as they are (1.3 screens per panel, 40%, .4s power3.out, 17px threshold, list press .6s)
(() => {
  kfFx.register("pin-panel-rise", (el, { options, reduce, scroller }) => {
    const panels = [...el.querySelectorAll('[data-fx-part="panel"]')];
    if (panels.length < 2 || !window.gsap || !window.ScrollTrigger) return;
    const nav = [...el.querySelectorAll('[data-fx-part="nav"]')];
    const pin = el.querySelector('[data-fx-part="pin"]') || el;
    const heading = el.querySelector('[data-fx-part="heading"]');
    const A = {
      move: +(options.move ?? 40), dur: +(options.dur ?? 0.4), ease: options.ease || "power3.out",
      per: +(options.per || 1.3), threshold: +(options.threshold ?? 17), navDur: +(options.navdur ?? 0.6), headDur: 0.2,
    };
    const vh = () => (scroller ? scroller.clientHeight : window.visualViewport ? window.visualViewport.height : innerHeight);
    let cur = 0, busy = false, jumping = false, locked = false, jump = null, points = [], lastY = 0;
    const setNav = (i) => nav.forEach((n, k) => n.classList.toggle("is-active", k === i));
    const setState = (i) => {
      panels.forEach((p, k) => {
        gsap.killTweensOf(p);
        gsap.set(p, k === i ? { autoAlpha: 1, yPercent: 0, zIndex: 2 } : { autoAlpha: 0, yPercent: A.move, zIndex: 1 });
        p.classList.toggle("is-active", k === i);
      });
      cur = i; setNav(i);
    };
    setState(0);
    if (reduce) return () => { panels.forEach((p) => { gsap.set(p, { clearProps: "all" }); p.classList.remove("is-active"); }); nav.forEach((n) => n.classList.remove("is-active")); };
    const go = (next, fwdName) => {
      if (next === cur || busy) return;
      const a = panels[cur], b = panels[next];
      const fwd = fwdName ? fwdName === "forward" : next > cur;
      busy = true;
      panels.forEach((p) => { gsap.killTweensOf(p); if (p !== a && p !== b) { gsap.set(p, { autoAlpha: 0, yPercent: fwd ? A.move : -A.move, zIndex: 1 }); p.classList.remove("is-active"); } });
      gsap.set(a, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
      gsap.set(b, { autoAlpha: 1, yPercent: fwd ? A.move : -A.move, zIndex: 3 });
      a.classList.add("is-active"); b.classList.add("is-active");
      gsap.timeline({
        defaults: { duration: A.dur, ease: kfFx.ease(A.ease, "power3.out") },
        onComplete: () => {
          gsap.set(a, { autoAlpha: 0, yPercent: 0, zIndex: 1 }); a.classList.remove("is-active");
          gsap.set(b, { autoAlpha: 1, yPercent: 0, zIndex: 2 });
          cur = next; setNav(next); busy = false;
        },
      })
        .to(a, { yPercent: fwd ? -A.move : A.move, autoAlpha: 0.15, overwrite: "auto" }, 0)
        .to(b, { yPercent: 0, autoAlpha: 1, overwrite: "auto" }, 0);
    };
    const fade = (v) => heading && gsap.to(heading, { opacity: v, duration: A.headDur, overwrite: "auto" });
    const st = ScrollTrigger.create({
      trigger: el, scroller,
      start: () => options.start || (innerWidth < 768 ? "top top" : "center center"),
      end: () => "+=" + (panels.length - 1) * vh() * A.per,
      pin, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 10,
      onEnter: () => fade(1), onLeave: () => fade(0), onEnterBack: () => fade(1), onLeaveBack: () => fade(0),
      onRefresh: (self) => {
        const step = (self.end - self.start) / (panels.length - 1);
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
    const offs = nav.map((item, i) => {
      const h = (e) => {
        e.preventDefault();
        if (!points[i] && points[i] !== 0) return;
        if (i === cur && !busy) return;
        jump?.kill();
        const target = points[i] + 2;
        jumping = true; locked = true;
        go(i, i > cur ? "forward" : "backward");
        const done = () => { cur = i; setNav(i); lastY = target; requestAnimationFrame(() => requestAnimationFrame(() => { jumping = false; })); };
        if (window.ScrollToPlugin) jump = gsap.to(scroller || window, { scrollTo: { y: target, autoKill: false }, duration: A.navDur, ease: "power3.out", overwrite: "auto", onComplete: done });
        else { (scroller || window).scrollTo({ top: target }); done(); }
      };
      item.addEventListener("click", h);
      return () => item.removeEventListener("click", h);
    });
    return () => {
      st.kill(true); jump?.kill(); offs.forEach((f) => f());
      panels.forEach((p) => { gsap.killTweensOf(p); gsap.set(p, { clearProps: "all" }); p.classList.remove("is-active"); });
      nav.forEach((n) => n.classList.remove("is-active"));
      if (heading) gsap.set(heading, { clearProps: "opacity" });
    };
  });
})();
