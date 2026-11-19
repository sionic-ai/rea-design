(() => {
  // ”angle | top color | middle color position | bottom color” — colors are written as --kf-* variables and color-mix as is, and resolved to rgba numbers via canvas when applied
  const ink = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgba = (probe, value) => {
    probe.style.color = "";
    probe.style.color = value;
    ink.canvas.width = ink.canvas.height = 1;
    ink.clearRect(0, 0, 1, 1);
    ink.fillStyle = getComputedStyle(probe).color;
    ink.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ink.getImageData(0, 0, 1, 1).data;
    return `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`;
  };
  const parse = (probe, text) => {
    const [angle, top, mid, bottom] = String(text || "").split("|").map((s) => s.trim());
    if (!bottom) return null;
    const m = mid.match(/^(.*\S)\s+(-?[\d.]+)%?$/);
    return [parseFloat(angle) || 0, rgba(probe, top), rgba(probe, m ? m[1] : mid), m ? +m[2] : 50, rgba(probe, bottom)];
  };
  const css = ([a, t, m, p, b]) => `linear-gradient(${a}deg, ${t} 0%, ${m} ${p}%, ${b} 100%)`;
  const lerp = (A, B, t) => A.map((x, i) => gsap.utils.interpolate(x, B[i], t));
  // Original easeInOutQuad
  const quad = (t) => (t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1);

  kfFx.register("pan-gradient-shift", (el, { options, reduce, scroller }) => {
    const track = el.querySelector('[data-fx-part="track"]');
    if (!track || !track.children.length) return;
    gsap.registerPlugin(ScrollTrigger);
    const from = +options.from || 1, upto = +options.upto || 0;
    const media = `(min-width: ${from}px)${upto ? ` and (max-width: ${upto}px)` : ""}`;
    const mm = gsap.matchMedia();
    mm.add(`${media} and (prefers-reduced-motion: no-preference)`, () => {
      const panels = [...track.children], n = panels.length;
      el.classList.add("is-fx-pan");
      // wide: 「3:1.15」 — only the third panel is 1.15x wide (original scroll). The others get equal shares, one panel each
      const wide = Object.fromEntries(String(options.wide || "").split(",").filter(Boolean).map((p) => p.split(":").map(Number)));
      panels.forEach((p, i) => gsap.set(p, { width: `${(wide[i + 1] || 1) * 100 / n}%` }));
      gsap.set(track, { width: `${100 * n + +(options.extra ?? 20)}%` });
      const tl = gsap.timeline({
        scrollTrigger: {
          scroller, trigger: el, pin: true, start: "top top", end: () => `+=${track.offsetWidth}`, anticipatePin: 1,
          scrub: options.scrub != null ? +options.scrub : 1, invalidateOnRefresh: true,
        },
      });
      tl.to(track, { x: () => -(track.offsetWidth - el.clientWidth), ease: "none" });

      const probe = document.createElement("i");
      probe.hidden = true;
      el.append(probe);
      let prev = parse(probe, el.dataset.grad);
      const keyed = panels.filter((p) => p.dataset.grad);
      const sts = keyed.map((p) => {
        const start = prev, end = parse(probe, p.dataset.grad), via = parse(probe, p.dataset.gradVia);
        prev = end;
        if (!start || !end) return null;
        return ScrollTrigger.create({
          trigger: p, containerAnimation: tl, start: "left center", end: "right center", invalidateOnRefresh: true,
          onUpdate: ({ progress: t }) => {
            el.style.background = css(via ? (t < 0.5 ? lerp(start, via, t * 2) : lerp(via, end, (t - 0.5) * 2)) : lerp(start, end, quad(t)));
          },
        });
      });
      probe.remove();
      return () => {
        sts.forEach((st) => st?.kill());
        el.style.background = "";
        el.classList.remove("is-fx-pan");
        gsap.set([track, ...panels], { clearProps: "width,transform" });
      };
    });
    return () => mm.revert();
  });
})();
