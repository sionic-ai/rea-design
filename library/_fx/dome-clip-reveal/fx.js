// Cuts the panel with an SVG clipPath (objectBoundingBox) using quadratic curves on four sides. The center control point moves first, and the corners follow late by lag
// The curtain’s head fills with a rounded bulge (up) · comes down (down) · unfolds with four edges bulging outward from a center box (box).
(() => {
  let seq = 0;
  const mix = (a, b, t) => a + (b - a) * t;
  // With no option, use the default curve — passing an empty string to kfFx.ease returns an empty curve, which becomes the GSAP default (power1.out)
  const curve = (v, def) => (v ? kfFx.ease(v, def) : def);
  const f = (v) => v.toFixed(4);
  // a = Center (first), s = Corners (late) — original path shape: top edge Q, right edge Q, bottom edge Q, left edge Q
  const shape = (look, a, s, o) => {
    let p;
    if (look === "down") {
      const side = mix(0.5 + o.depth, 0.5, s), bot = mix(0, 1, s);
      p = [[0, 0], [0.5, 0], [1, 0], [1, side], [1, bot], [0.5, mix(0, 1, a)], [0, bot], [0, side]];
    } else if (look === "box") {
      const h = (1 - o.w) / 2, c = (1 - o.h) / 2;
      const L = mix(h, 0, s), T = mix(c, 0, s), R = mix(1 - h, 1, s), B = mix(1 - c, 1, s);
      p = [[L, T], [0.5, mix(c, 0, a)], [R, T], [mix(1 - h, 1, a), 0.5], [R, B], [0.5, mix(1 - c, 1, a)], [L, B], [mix(h, 0, a), 0.5]];
    } else {
      const top = mix(o.depth, 0, s), side = mix(0.5 + o.depth, 0.5, s);
      p = [[0, top], [o.sweep ? a : 0.5, mix(o.depth, 0, a)], [1, top], [1, side], [1, 1], [0.5, 1], [0, 1], [0, side]];
    }
    const q = (i) => `${f(p[i][0])} ${f(p[i][1])}`;
    return `M${q(0)}Q${q(1)} ${q(2)}Q${q(3)} ${q(4)}Q${q(5)} ${q(6)}Q${q(7)} ${q(0)}Z`;
  };

  kfFx.register("dome-clip-reveal", (el, { options, reduce, scroller }) => {
    if (!window.gsap) return;
    const look = options.look || "up";
    const down = look === "down", box = look === "box";
    const geo = { w: +(options.w ?? 0.48), h: +(options.h ?? 0.72), depth: +(options.depth ?? 1), sweep: options.sweep === "1" || options.sweep === "on" };
    const dur = +(options.dur ?? (down ? 1 : box ? 2 : 1.25));
    const ease = curve(options.ease, down ? "power2.inOut" : box ? "power3.inOut" : "power2.out");
    const lag = +(options.lag ?? (down ? 0.1 : 0.2));
    // The photo cell (original js-show-block) keeps its curtain even after fully opened — lifting it changes clip-path once more
    const keep = options.keep === "1" || options.keep === "on";
    const delay = +(options.delay ?? (down ? 0 : 0.25));
    const from = +(options.scale ?? (down || box ? 1 : 1.3));
    const media = el.querySelector("[data-fx-part=media]") || el;
    const subs = [...el.querySelectorAll("[data-fx-part=sub]")];
    const st = { a: 0, s: 0 };

    const id = `fx-dome-${++seq}`;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.setAttribute("aria-hidden", "true");
    svg.style.position = "absolute";
    svg.innerHTML = `<defs><clipPath id="${id}" clipPathUnits="objectBoundingBox"><path/></clipPath></defs>`;
    document.body.append(svg);
    const path = svg.querySelector("path");
    const draw = () => path.setAttribute("d", shape(look, st.a, st.s, geo));
    const clip = (on) => { el.style.clipPath = on ? `url(#${id})` : ""; };

    if (reduce) {
      st.a = st.s = 1;
      if (down) { draw(); clip(true); }
      return () => svg.remove();
    }

    draw();
    clip(true);
    if (subs.length) gsap.set(subs, { opacity: 0 });
    let tl = null, io = null, shown = false;

    const play = (wait = delay) => {
      tl?.kill();
      shown = true;
      st.a = st.s = 0;
      draw();
      clip(true);
      el.dispatchEvent(new CustomEvent("fx:start", { detail: { delay: wait } }));
      tl = gsap.timeline({ delay: wait, onComplete: () => { if (!down && !keep) clip(false); el.dispatchEvent(new CustomEvent("fx:done")); } });
      tl.to(st, { a: 1, duration: dur, ease, onUpdate: draw }, 0);
      tl.to(st, { s: 1, duration: dur, ease, onUpdate: draw }, lag);
      if (from !== 1) tl.fromTo(media, { scale: from }, { scale: 1, duration: +(options["scale-dur"] ?? dur * 1.5), ease: curve(options["scale-ease"], "expo.out") }, 0);
      const subDur = +(options["sub-dur"] ?? dur * 0.5), subAt = +(options["sub-delay"] ?? 0.5), each = +(options["sub-each"] ?? 0.25), y = +(options["sub-y"] ?? 0);
      subs.forEach((n, i) => tl.fromTo(n, { opacity: 0, y }, { opacity: 1, y: 0, duration: subDur, ease: curve(options["sub-ease"], "power2.out") }, subAt + i * each));
    };
    // Closing curtain like a drawer — center and corners revert with the same lag so the corners don’t clear first
    const close = () => {
      tl?.kill();
      clip(true);
      const cd = +(options["close-dur"] ?? dur * 0.67);
      tl = gsap.timeline({ onComplete: () => el.dispatchEvent(new CustomEvent("fx:closed")) });
      tl.to(st, { a: 0, duration: cd, ease, onUpdate: draw }, 0);
      tl.to(st, { s: 0, duration: cd, ease, onUpdate: draw }, lag);
    };
    const onPlay = () => play(+(options["play-delay"] ?? 0));

    const on = options.on || (down ? "manual" : "scroll");
    if (on === "scroll") {
      io = new IntersectionObserver((ens) => { if (ens.some((e) => e.isIntersecting) && !shown) { io.disconnect(); play(); } }, { root: scroller || null, rootMargin: options.margin || "0px", threshold: 0 });
      io.observe(options.observe === "parent" && el.parentElement ? el.parentElement : el);
    } else if (on === "load") play();
    el.addEventListener("fx:play", onPlay);
    el.addEventListener("fx:close", close);
    return () => {
      io?.disconnect();
      tl?.kill();
      el.removeEventListener("fx:play", onPlay);
      el.removeEventListener("fx:close", close);
      clip(false);
      if (subs.length) gsap.set(subs, { clearProps: "opacity,transform" });
      gsap.set(media, { clearProps: "scale" });
      svg.remove();
    };
  });
})();
