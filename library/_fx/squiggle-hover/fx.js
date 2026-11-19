// The drawn amount uses dasharray — on entering shrink [0, t], on leaving [t, 1], erasing toward the end
(() => {
  const SHAPES = [
    "M5 22C40 14 80 12 118 19C150 25 176 27 204 20C236 12 270 14 305 18",
    "M5 26C60 18 120 8 180 8C214 8 236 14 230 22C224 30 186 32 176 24C168 16 210 10 250 10C272 10 290 12 305 14",
    "M5 28C20 18 32 16 44 24C56 32 70 30 82 20C96 10 110 12 122 22C134 32 150 30 164 20C178 10 192 12 206 22C220 32 236 30 250 20C264 10 282 14 305 22",
    "M18 32C80 32 140 32 180 30C150 26 90 18 60 10C120 8 220 10 300 14",
    "M5 21C100 17 200 14 305 14",
    "M5 30C70 26 130 18 170 16C160 22 150 30 156 33C190 26 240 12 305 6",
  ];
  let next = Math.floor(Math.random() * SHAPES.length);
  kfFx.register("squiggle-hover", (el, { options, reduce }) => {
    const dur = reduce ? 0 : +(options.dur ?? 0.5), ease = kfFx.ease(options.ease || "power2.inOut", "power2.inOut");
    const keep = options.keep === "true";
    const given = el.querySelector('[data-fx-part="line"]');
    const box = given || Object.assign(document.createElement("span"), { className: "fx-squiggle" });
    if (!given) box.setAttribute("aria-hidden", "true"), el.append(box);
    const s = { a: 0, b: 0 };
    let path = null, len = 1, inTw = null, outTw = null;
    const paint = () => path && ((path.style.strokeDasharray = `${Math.max(0, s.b - s.a) * len} ${len * 2}`), (path.style.strokeDashoffset = `${-s.a * len}`));
    const draw = (d) => {
      box.innerHTML = `<svg viewBox="0 0 310 40" preserveAspectRatio="none"><path vector-effect="non-scaling-stroke" d="${SHAPES[next]}"/></svg>`;
      next = (next + 1) % SHAPES.length;
      path = box.querySelector("path");
      len = path.getTotalLength() || 1;
      Object.assign(s, { a: 0, b: 0 });
      paint();
      return (inTw = gsap.to(s, { b: 1, duration: d, ease, onUpdate: paint }));
    };
    if (keep) draw(reduce ? 0 : 0.6);
    const out = () => {
      if (!path || (outTw && outTw.isActive())) return;
      outTw = gsap.to(s, { a: 1, duration: dur, ease, onUpdate: paint, onComplete: () => ((box.innerHTML = ""), (path = null)) });
    };
    const enter = () => {
      if (keep || (inTw && inTw.isActive())) return;
      outTw && (outTw.kill(), (outTw = null));
      draw(dur);
    };
    const leave = () => {
      if (keep) return;
      inTw && inTw.isActive() ? inTw.then(out) : out();
    };
    const ac = new AbortController(), on = { signal: ac.signal };
    el.addEventListener("mouseenter", enter, on);
    el.addEventListener("mouseleave", leave, on);
    el.addEventListener("focus", enter, on);
    el.addEventListener("blur", leave, on);
    return () => { ac.abort(); inTw?.kill(); outTw?.kill(); given ? (box.innerHTML = "") : box.remove(); };
  });
})();
