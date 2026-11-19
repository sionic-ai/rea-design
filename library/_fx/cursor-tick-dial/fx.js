(() => {
  // Compass dial of ticks arranged in a circle where only those toward the cursor (within 80° by default) thicken — follows the cursor-direction unit vector in .4s and settles in .8s after leaving
  const NS = "http://www.w3.org/2000/svg";
  kfFx.register("cursor-tick-dial", (el, { options, reduce, hover }) => {
    if (typeof gsap === "undefined") return;
    const count = Math.max(3, +options.count || 26);
    const influence = +(options.influence ?? 80);
    const minW = +(options["min-w"] ?? 8), maxW = +(options["max-w"] ?? 55);
    const sway = +(options.sway ?? 5), swayDur = +(options["sway-dur"] ?? 6);
    const follow = +(options.follow ?? 0.4), settle = +(options.settle ?? 0.8);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "power2.out");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "fx-ctd-svg");
    const g = document.createElementNS(NS, "g");
    svg.append(g);
    el.append(svg);
    let ticks = [], R = 0, H = 0;
    const cosI = Math.cos((influence * Math.PI) / 180);
    const v = { x: 0, y: 0 };
    const draw = () => {
      ticks.forEach((r, i) => {
        const a = ((2 * Math.PI) / count) * i;
        const s = Math.max(0, (Math.sin(a) * v.x - Math.cos(a) * v.y - cosI) / (1 - cosI));
        const w = minW + (maxW - minW) * s;
        r.setAttribute("x", -w / 2); r.setAttribute("width", w); r.setAttribute("rx", w / 2);
      });
    };
    const build = () => {
      const size = Math.min(el.clientWidth, el.clientHeight) || 400;
      H = +(options.length ?? size * 0.11);
      R = size / 2 - H / 2;
      const A = R + H / 2;
      svg.setAttribute("viewBox", `${-A} ${-A} ${2 * A} ${2 * A}`);
      g.replaceChildren();
      ticks = Array.from({ length: count }, (_, i) => {
        const r = document.createElementNS(NS, "rect");
        r.setAttribute("y", -R); r.setAttribute("height", H); r.setAttribute("fill", "currentColor");
        r.setAttribute("transform", `rotate(${(360 / count) * i})`);
        g.append(r);
        return r;
      });
      draw();
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    if (reduce) return () => { ro.disconnect(); svg.remove(); };
    gsap.set(g, { rotation: -sway, svgOrigin: "0 0" });
    const swayTw = sway ? gsap.to(g, { rotation: sway, svgOrigin: "0 0", duration: swayDur, ease: "sine.inOut", yoyo: true, repeat: -1 }) : null;
    let spin = null;
    const tick = () => draw();
    gsap.ticker.add(tick);
    const move = (e) => {
      const b = svg.getBoundingClientRect(), dx = e.clientX - (b.left + b.width / 2), dy = e.clientY - (b.top + b.height / 2), d = Math.hypot(dx, dy) || 1;
      gsap.to(v, { x: dx / d, y: dy / d, duration: follow, ease, overwrite: true });
    };
    const leave = () => gsap.to(v, { x: 0, y: 0, duration: settle, ease, overwrite: true });
    if (hover) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    } else {
      const s = { a: 0 };
      spin = gsap.to(s, { a: 2 * Math.PI, duration: 5, ease: "none", repeat: -1, onUpdate: () => { v.x = Math.sin(s.a); v.y = -Math.cos(s.a); } });
    }
    return () => {
      gsap.ticker.remove(tick); swayTw?.kill(); spin?.kill(); gsap.killTweensOf(v); ro.disconnect();
      el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      svg.remove();
    };
  });
})();
