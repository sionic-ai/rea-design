(() => {
  // Intensity follows --fx-chaos written on the document head by scroll-chaos-mode — on screens without that part, it stays always on at the option rate (default 1)
  const rateOf = (o) => {
    const v = document.documentElement.style.getPropertyValue("--fx-chaos");
    const base = v === "" ? 1 : +v;
    if (o.rate === "top") return base * Math.min(1, Math.max(0, scrollY / (innerHeight * 0.25)));
    if (o.rate !== undefined && o.rate !== "chaos") return +o.rate;
    return base;
  };
  const cl = (t, a, b, lo, hi) => (t <= lo ? a : t >= hi ? b : a + ((t - lo) * (b - a)) / (hi - lo));
  const mix = (a, b, t) => a * (1 - t) + b * t;
  const rad = (d) => (d * Math.PI) / 180;

  kfFx.register("slice-spread-glitch", (el, { options, reduce }) => {
    const pic = el.querySelector('[data-fx-part="pic"]') || el.querySelector("img, svg, canvas");
    if (!pic || reduce) return;
    const lines = Math.max(1, Math.round(+options.lines || 10));
    const every = Math.max(1, Math.round(+options.every || 3));
    const spin = options.spin === "1" || options.spin === "true";
    const swap = +(options.swap ?? 1);
    let types = String(options.types ?? "0,1,2").split(",").map((n) => Math.round(+n)).filter((n) => n >= 0 && n <= 2);
    if (!types.length) types = [0];
    const pick = () => types[(Math.random() * types.length) | 0];

    const layer = document.createElement("div");
    layer.className = "fx-ssg-layer";
    layer.setAttribute("aria-hidden", "true");
    const blocks = [];
    for (let i = 0; i <= lines; i++) {
      const con = document.createElement("div");
      con.className = "fx-ssg-strip";
      const img = pic.cloneNode(true);
      img.removeAttribute("data-fx-part");
      img.removeAttribute("id");
      img.classList.add("fx-ssg-pic");
      con.append(img);
      layer.append(con);
      blocks.push({ con, img });
    }
    el.append(layer);
    el.classList.add("fx-ssg-on");
    const vis = pic.style.visibility;
    pic.style.visibility = "hidden";

    let type = pick(), h = el.offsetHeight, c = 0, last = -1, seen = false;
    const ro = new ResizeObserver(() => { h = el.offsetHeight; });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => { seen = e.isIntersecting; });
    io.observe(el);

    const drawA = (r) => {
      gsap.set(el, { rotation: spin ? mix(0, (c % 360) * 2, r) : 0, overflow: r > 0 ? "visible" : "hidden" });
      const step = Math.floor(h / lines);
      const hot = Math.floor(blocks.length * cl(Math.cos(c * -0.12), 0, 1, -1, 1));
      let y = 0;
      blocks.forEach((b, s) => {
        const sy = s === hot ? mix(1, cl(Math.sin(c * 0.2), 1, 50, -1, 1), r) : 1;
        gsap.set(b.con, { width: "100%", height: step + 1, top: y, rotation: 0, scale: 1, scaleY: sy, transformOrigin: "50% 0%", filter: "none" });
        gsap.set(b.img, { y: -y });
        y += step * sy;
      });
    };
    const drawB = (r) => {
      gsap.set(el, { rotation: 0, overflow: r > 0 ? "visible" : "hidden" });
      blocks.forEach((b, s) => {
        const n = rad(c * 5 + s * 30);
        const sc = mix(1, cl(Math.sin(n), 0, 2, -1, 1), r), br = mix(1, cl(Math.sin(n), 0, 1, -1, 1), r);
        gsap.set(b.con, { width: "100%", height: "100%", top: 0, rotation: 0, scale: sc, transformOrigin: "50% 50%", filter: `brightness(${br * 100}%)` });
        gsap.set(b.img, { y: 0 });
      });
    };
    const drawC = (r) => {
      gsap.set(el, { rotation: 0, overflow: r > 0 ? "visible" : "hidden" });
      blocks.forEach((b, s) => {
        const n = rad(c + s * (360 / blocks.length));
        const rot = Math.sin(n) * mix(0, 360, r);
        const ox = cl(Math.sin(n * 0.75), 0, 100, -1, 1), oy = cl(Math.cos(n * -2.5), 0, 100, -1, 1);
        gsap.set(b.con, { width: "100%", height: "100%", top: 0, rotation: rot, scale: 1, transformOrigin: `${ox}% ${oy}%`, filter: `hue-rotate(${rot}deg)` });
        gsap.set(b.img, { y: 0 });
      });
    };
    const draw = () => {
      const r = rateOf(options);
      (type === 1 ? drawB : type === 2 ? drawC : drawA)(r);
    };

    // The original counts in 60fps frames — frames are counted from time so the speed stays the same even on a 120 refresh-rate screen
    const tick = (time) => {
      const f = Math.floor(time * 60);
      if (f === last) return;
      const steps = last < 0 ? 1 : f - last;
      last = f;
      for (let i = 0; i < steps; i++) {
        c++;
        if (types.length > 1 && Math.random() * 100 < swap) type = pick();
        if (seen && c % every === 0) draw();
      }
    };
    draw();
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      layer.remove();
      pic.style.visibility = vis;
      el.classList.remove("fx-ssg-on");
      gsap.set(el, { clearProps: "transform,overflow" });
    };
  });
})();
