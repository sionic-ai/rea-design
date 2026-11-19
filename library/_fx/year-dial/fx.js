(() => {
  // Original (anniversary site archive disc intervalChange + splitText): photos cropped to a circle change to the next year with an overlap every (every) seconds, fading for (fade) seconds,
  // The new year’s digits rise from 1em below in dur s with each letter delayed by each s, while the outer arc (path) is drawn linearly by one year step every every s. It pauses at the last year, and looping back to the start rewinds to one step.
  kfFx.register("year-dial", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll('[data-fx-part="slide"]')];
    if (!slides.length) return;
    const arc = el.querySelector('[data-fx-part="arc"]');
    const every = (+options.every || 5) * 1000, fade = +(options.fade ?? 1.4), each = +(options.each ?? 0.09), dur = +(options.dur ?? 0.8);
    const ease = options.ease || "0.215,0.61,0.355,1";
    const split = (p) => {
      if (!p || p.dataset.fxSplit) return;
      p.dataset.fxSplit = "1";
      const txt = p.textContent;
      p.textContent = "";
      [...txt].forEach((ch, i) => {
        const s = document.createElement("span");
        s.className = "fx-dial-char";
        s.style.cssText = `display:inline-block;opacity:0;transform:translate3d(0,1em,0);transition:opacity ${dur}s cubic-bezier(${ease}),transform ${dur}s cubic-bezier(${ease});transition-delay:${i * each}s`;
        s.textContent = ch;
        p.append(s);
      });
    };
    const label = (s) => s.querySelector('[data-fx-part="year"]');
    slides.forEach((s) => { split(label(s)); s.style.transition = `opacity ${fade}s ease, visibility ${fade}s ease`; });
    const show = (s, on) => {
      s.style.opacity = on ? 1 : 0;
      s.style.visibility = on ? "visible" : "hidden";
      label(s)?.querySelectorAll(".fx-dial-char").forEach((c) => { c.style.opacity = on ? 1 : 0; c.style.transform = on ? "translate3d(0,0,0)" : "translate3d(0,1em,0)"; });
    };
    let L = 0, one = 0;
    if (arc) { L = arc.getTotalLength(); one = L / Math.max(1, slides.length - 1); arc.style.strokeDasharray = L; arc.style.strokeDashoffset = L; }
    const drawTo = (i) => { if (!arc || i === slides.length - 1) return; arc.style.transition = reduce ? "none" : `stroke-dashoffset ${every}ms linear`; arc.style.strokeDashoffset = L - (one * i + one); };
    let at = 0;
    slides.forEach((s, i) => show(s, i === 0));
    if (reduce) { if (arc) arc.style.strokeDashoffset = 0; return () => slides.forEach((s) => { s.style.cssText = ""; }); }
    let timer = 0;
    const start = () => {
      requestAnimationFrame(() => drawTo(0));
      if (slides.length < 2) return;
      timer = setInterval(() => {
        const prev = slides[at];
        at = (at + 1) % slides.length;
        show(slides[at], true);
        setTimeout(() => prev !== slides[at] && show(prev, false), fade * 1000);
        drawTo(at);
      }, every);
    };
    // Starts running once it enters the screen
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); start(); } });
    io.observe(el);
    return () => { io.disconnect(); clearInterval(timer); slides.forEach((s) => { s.style.cssText = ""; }); if (arc) arc.style.cssText = ""; };
  });
})();
