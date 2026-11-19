(() => {
  // Hero title entrance: two speech-bubble tags pop out in turn and tilt into place (letters inside hop at .075s intervals), and the big letter pieces below
  // Flies in from the right by half the heading width, growing over 1 second with a bounce (back.inOut) and settling in twisted. Meanwhile the big letter panel is pressed and tilted over 1.5 seconds, then bounces back.
  kfFx.register("pop-hop-copy", (el, { options, reduce }) => {
    const q = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const qa = (n) => [...el.querySelectorAll(`[data-fx-part="${n}"]`)];
    const left = q("tag-left"), right = q("tag-right"), bottom = q("bottom"), desc = q("desc");
    const pieces = qa("piece"), stars = qa("star");
    const charsOf = (tag) => (tag ? [...tag.querySelectorAll('[data-fx-part="char"]')] : []);
    if (!left && !right && !bottom && !pieces.length) return;
    const delay = +(options.delay ?? 0), drop = +(options.drop ?? 30), lag = +(options.lag ?? 1), each = +(options.each ?? 0.075);
    const tw = [];
    const T = (...a) => { const t = a.length === 3 ? gsap.fromTo(...a) : gsap.to(...a); tw.push(t); return t; };

    const width = () => el.style.setProperty("--fx-copy-w", `${(bottom || el).offsetWidth}px`);
    const ro = new ResizeObserver(width);
    ro.observe(bottom || el);
    width();

    const finalState = () => {
      if (left) gsap.set(left, { opacity: 1, scale: 1, x: 0, yPercent: 0, rotation: 0 });
      if (right) gsap.set(right, { opacity: 1, scale: 1, x: 0, yPercent: drop, rotation: 0 });
      pieces.forEach((p) => gsap.set(p, { "--p1": 1, "--p2": 1, "--p3": 0, "--p4": 0 }));
      stars.forEach((s) => gsap.set(s, { "--p1": 1 }));
      if (desc) gsap.set(desc, { opacity: 1, y: 0 });
    };
    if (reduce) { finalState(); return () => ro.disconnect(); }

    // Starts hidden
    if (left) gsap.set(left, { opacity: 0, scale: 0 });
    if (right) gsap.set(right, { opacity: 0, scale: 0, yPercent: drop });
    pieces.forEach((p) => gsap.set(p, { "--p1": 0, "--p2": 0, "--p3": 0, "--p4": 0 }));
    stars.forEach((s) => gsap.set(s, { "--p1": 0 }));
    if (desc) gsap.set(desc, { opacity: 0 });

    const hop = (chars) => chars.forEach((c, a) => {
      T(c, { yPercent: 25 }, { duration: 0.375, delay: a * each, yPercent: -25, ease: "power2.out", onComplete: () => { T(c, { duration: 0.375, yPercent: 0, ease: "power2.inOut" }); } });
    });

    const run = () => {
      if (left) {
        T(left, { opacity: 0, scale: 0, yPercent: 0, rotation: 0 }, {
          duration: 0.5, opacity: 1, scale: 1.125, yPercent: -25, rotation: -5, ease: "power2.out",
          onComplete: () => {
            T(left, { duration: 0.5, scale: 1, yPercent: 0, rotation: 0, ease: "power2.inOut" });
            if (right) {
              T(right, { opacity: 0, scale: 0, yPercent: drop, rotation: 0 }, {
                duration: 0.5, opacity: 1, scale: 1.125, yPercent: drop / 6, rotation: 5, ease: "power2.out",
                onComplete: () => { T(right, { duration: 0.5, scale: 1, yPercent: drop, rotation: 0, ease: "power2.inOut" }); },
              });
              hop(charsOf(right));
            }
          },
        });
        hop(charsOf(left));
      }
      if (bottom) {
        T(bottom, { scaleX: 1, rotation: 0, transformOrigin: "left bottom" }, {
          duration: 1.5, delay: 0.5, scaleX: 0.875, rotation: -7.5, ease: "power4.in",
          onComplete: () => { T(bottom, { duration: 0.5, scaleX: 1, rotation: 0, ease: "back.inOut" }); },
        });
      }
      pieces.forEach((p, r) => {
        const d = r * each + lag;
        T(p, { "--p1": 0 }, { "--p1": 1, duration: 1, delay: d, ease: "back.inOut" });
        T(p, { "--p2": 2, duration: 0.5, delay: d, ease: "power3.in", onComplete: () => { T(p, { "--p2": 1, duration: 0.5, ease: "power3.out" }); } });
        T(p, {
          "--p3": -1, duration: 0.4, delay: d, ease: "power3.inOut",
          onComplete: () => T(p, {
            "--p3": 0.5, duration: 0.4, ease: "power3.inOut",
            onComplete: () => {
              T(p, { "--p3": 0, duration: 0.4, ease: "power3.out" });
              // Only the last piece (the exclamation mark spot) nods one more time
              if (r === pieces.length - 1) T(p, { "--p4": 0 }, { "--p4": 1, duration: 0.2, ease: "power4.out", onComplete: () => { T(p, { "--p4": 0, duration: 0.4, ease: "back.inOut" }); } });
            },
          }),
        });
      });
      stars.forEach((s, i) => T(s, { "--p1": 0 }, { "--p1": 1, duration: 0.6, delay: lag + 0.4 + i * 0.08, ease: "back.out(2)" }));
      if (desc) T(desc, { opacity: 0, y: "1em" }, { duration: 1, delay: 3, opacity: 1, y: 0, ease: "power2.inOut" });
    };

    // start: with event, when the element receives fx:start (when the loader ends), otherwise right after attaching, after delay
    let timer = 0;
    const onStart = () => { el.removeEventListener("fx:start", onStart); timer = setTimeout(run, delay * 1000); };
    if ((options.start || "") === "event") el.addEventListener("fx:start", onStart);
    else timer = setTimeout(run, delay * 1000);

    return () => {
      clearTimeout(timer);
      el.removeEventListener("fx:start", onStart);
      ro.disconnect();
      tw.forEach((t) => t.kill());
      gsap.set([left, right, bottom, desc, ...pieces, ...stars, ...charsOf(left), ...charsOf(right)].filter(Boolean), { clearProps: "all" });
      el.style.removeProperty("--fx-copy-w");
    };
  });
})();
