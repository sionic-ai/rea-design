(() => {
  const SHAPES = {
    star: "M12 0c.9 7.4 4.6 11.1 12 12-7.4.9-11.1 4.6-12 12-.9-7.4-4.6-11.1-12-12C7.4 11.1 11.1 7.4 12 0Z",
    circle: "M12 0a12 12 0 1 1 0 24a12 12 0 1 1 0-24Z",
    diamond: "M12 0 24 12 12 24 0 12Z",
  };
  // Diameter ratio · start angle · one turn (sec) — starting from the outer ring
  const RINGS = [[0.664, 180, 20], [0.465, 0, 15], [0.305, 30, 6], [0.226, 45, 3]];
  kfFx.register("star-hole-intro", (el, { options, reduce }) => {
    const num = (k, d) => +(options[k] ?? d);
    const veilAt = num("veil", 0.5), veilDur = num("veil-dur", 0.4), gap = num("gap", 0.2), dur = num("dur", 1), size = num("size", 20000);
    const fx = num("x", 0.1135), fy = num("y", 0.1786), fs = num("s", 0.1102);
    const ease = kfFx.ease(options.ease || "power4.in", "power4.in");
    const key = options.once ? `fx-star-hole:${options.once}` : "";
    const fire = (name) => el.dispatchEvent(new CustomEvent(name, { bubbles: true }));
    const path = SHAPES[options.shape] || SHAPES.star;
    const svg = encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="${path}"/></svg>`);
    el.style.setProperty("--fx-shape", `url("data:image/svg+xml,${svg}")`);

    const made = [];
    const add = (cls, parent = el) => { const n = document.createElement("div"); n.className = cls; parent.append(n); made.push(n); return n; };
    // The white veil sits under the board — at first it looks white only inside the star hole, then lifts and the page shows through
    const veil = veilDur > 0 ? add("fx-shi-veil") : null;
    const plate = add("fx-shi-plate");
    const figure = el.querySelector('[data-fx-part="figure"]');
    if (figure) plate.append(figure);
    const count = Math.max(0, Math.min(4, Math.round(num("rings", 4))));
    if (count) {
      const box = add("fx-shi-rings", plate);
      RINGS.slice(0, count).forEach(([d, from, t]) => {
        const r = add("fx-shi-ring", box);
        r.style.cssText = `--d:${d};--from:${from}deg;--t:${t}s`;
        add("fx-shi-line", r);
        add("fx-shi-dot", r);
      });
    }

    // The hole sits at the lower right of the circle (diameter min(.9vh,.9vw)), measured as a ratio of the circle size
    const geo = () => {
      const w = el.offsetWidth || innerWidth, h = el.offsetHeight || innerHeight;
      const c = Math.min(innerHeight * 0.9, innerWidth * 0.9);
      return { x: w / 2 + c / 2 - c * fx, y: h / 2 + c / 2 - c * fy, s: c * fs };
    };
    let g = geo();
    const paint = (s) => {
      plate.style.webkitMaskSize = plate.style.maskSize = `${s}px ${s}px, 100% 100%`;
      plate.style.webkitMaskPosition = plate.style.maskPosition = `${g.x - s / 2}px ${g.y - s / 2}px, 0 0`;
    };
    const st = { s: g.s };
    paint(st.s);
    const finish = () => { el.style.display = "none"; fire("fx:done"); };
    let tl;
    if (reduce || (key && sessionStorage.getItem(key))) {
      fire("fx:open");
      tl = gsap.to(el, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "power1.out", onComplete: finish });
    } else {
      if (key) sessionStorage.setItem(key, "1");
      tl = gsap.timeline();
      if (veil) tl.to(veil, { opacity: 0, duration: veilDur, delay: veilAt, ease: "power1.out" });
      tl.call(() => fire("fx:open"), null, `+=${gap}`)
        .fromTo(st, { s: () => ((g = geo()), g.s) }, { s: size, duration: dur, ease, onUpdate: () => paint(st.s) }, "<")
        .call(finish);
    }
    const onResize = () => { g = geo(); paint(st.s); };
    addEventListener("resize", onResize);
    return () => {
      tl.kill();
      removeEventListener("resize", onResize);
      if (figure) el.append(figure);
      made.forEach((n) => n.remove());
      el.style.removeProperty("display");
      el.style.removeProperty("--fx-shape");
      gsap.set(el, { clearProps: "opacity" });
    };
  });
})();
