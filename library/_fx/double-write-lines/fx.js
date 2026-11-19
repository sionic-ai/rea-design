// Two layers are overlaid per text line, and when visible the faint layer (.2) is written from the left via clip-path, then after lag seconds the dark layer covers the same path — like drawing twice with a pen.
// Line length = max(min, line width ÷ rate) sec, delayed = Group number × group + row number × line + sum of data-delay of the preceding groups
(() => {
  kfFx.register("double-write-lines", (el, { options, reduce }) => {
    const groups = [...el.querySelectorAll('[data-fx-part="group"]')];
    const sets = (groups.length ? groups : [el]).map((g) => [...g.querySelectorAll('[data-fx-part="line"]')]).filter((l) => l.length);
    if (!sets.length || !window.gsap) return;
    const min = +(options.min ?? 0.65), rate = +(options.rate || 195);
    const lineGap = +(options.line ?? 0.15), groupGap = +(options.group ?? 0.4), lag = +(options.lag ?? 0.8);
    const ghost = +(options.ghost ?? 0.2);
    const ease = kfFx.ease(options.ease || "M0,0 C0.083,0.294 0.134,0.56 0.338,0.782 0.48,0.937 0.752,1 1,1", "power2.out");
    const made = [];
    sets.flat().forEach((line) => {
      const text = line.textContent;
      const keep = line.innerHTML;
      line.classList.add("fx-dw-line");
      line.textContent = "";
      const a = document.createElement("span"), b = document.createElement("span");
      a.className = "fx-dw-ghost"; b.className = "fx-dw-ink";
      a.textContent = b.textContent = text;
      b.setAttribute("aria-hidden", "true");
      a.style.opacity = String(ghost);
      line.append(a, b);
      made.push({ line, keep, a, b });
    });
    const tweens = [];
    const play = () => {
      let acc = 0;
      sets.forEach((lines, gi) => {
        acc += +(groups[gi]?.dataset.delay || 0);
        lines.forEach((line, li) => {
          const m = made.find((x) => x.line === line);
          const d = Math.max(min, line.offsetWidth / rate);
          const at = gi * groupGap + li * lineGap + acc;
          tweens.push(gsap.to(m.a, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease, delay: at }));
          tweens.push(gsap.to(m.b, { clipPath: "inset(0% 0% 0% 0%)", duration: d, ease, delay: at + lag }));
        });
      });
    };
    if (reduce) { made.forEach((m) => { m.a.style.clipPath = m.b.style.clipPath = "none"; }); }
    const io = reduce ? null : new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      play();
    }, { rootMargin: options.margin || "-30% 0px" });
    io?.observe(el);
    return () => {
      io?.disconnect();
      tweens.forEach((t) => t.kill());
      made.forEach((m) => { m.line.classList.remove("fx-dw-line"); m.line.innerHTML = m.keep; });
    };
  });
})();
