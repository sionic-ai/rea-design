(() => {
  kfFx.register("path-letters-slide", (el, { options, reduce }) => {
    const path = el.querySelector('[data-fx-part="path"]');
    const word = options.text || el.getAttribute("aria-label") || "";
    const svg = path?.ownerSVGElement;
    if (!svg || !word.trim()) return;
    // Length is in path coordinate units. The first letter comes from outside the path end (from) to the path start side (stop), and later letters follow along the path direction
    const stop = +(options.stop ?? 180), from = +(options.from ?? 200), dur = +(options.dur ?? 5), delay = +(options.delay ?? 0);
    const gap = +(options.gap ?? 6), space = +(options.space ?? 20), ease = kfFx.ease(options.ease || "power3.inOut", "power3.inOut");
    const letters = [...word].map((ch) => {
      if (ch === " ") return null;
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("class", "fx-path-letter");
      t.setAttribute("aria-hidden", "true");
      t.textContent = ch;
      svg.appendChild(t);
      return t;
    });
    let len = 0, widths = [];
    const measure = () => { len = path.getTotalLength(); widths = letters.map((t) => (t ? t.getComputedTextLength() : 0)); };
    // Outside the path, connect straight along the end tangent
    const at = (d) => {
      if (d >= 0 && d <= len) return path.getPointAtLength(d);
      const [e, f] = d < 0 ? [0, Math.min(1, len)] : [len, Math.max(0, len - 1)];
      const p = path.getPointAtLength(e), q = path.getPointAtLength(f), k = d < 0 ? -d : d - len;
      return { x: p.x + (p.x - q.x) * k, y: p.y + (p.y - q.y) * k };
    };
    const state = { head: stop };
    const place = () => {
      let d = state.head;
      letters.forEach((t, i) => {
        if (!t) { d += space; return; }
        const w = widths[i], p = at(d), c = at(d + w / 2), n = at(d + w / 2 + 1);
        t.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${(Math.atan2(n.y - c.y, n.x - c.x) * 180) / Math.PI})`);
        d += w + gap;
      });
    };
    let tween, io, started = false;
    const start = () => {
      started = true;
      measure();
      el.classList.add("is-fx-on");
      if (reduce) { state.head = stop; place(); return; }
      state.head = len + from;
      place();
      tween = gsap.to(state, { head: stop, duration: dur, delay, ease, onUpdate: place });
    };
    const resize = () => { if (!started) return; measure(); if (!tween || !tween.isActive()) state.head = stop; place(); };
    io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => el.isConnected && start());
    }, { threshold: +(options.threshold ?? 0.25) });
    io.observe(el);
    addEventListener("resize", resize);
    return () => {
      io.disconnect();
      tween?.kill();
      removeEventListener("resize", resize);
      letters.forEach((t) => t?.remove());
      el.classList.remove("is-fx-on");
    };
  });
})();
