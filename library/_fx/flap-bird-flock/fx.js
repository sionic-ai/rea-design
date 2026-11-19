(() => {
  // Our new origami bird Lottie — same frame as the original bird (500×500 · 36fps · 27 frames = 9 poses, 3 frames each, .75s wing flap)
  const LOOK = { 1: [-12, false, 100], 2: [18, true, 92], 3: [-28, false, 88], 4: [6, false, 100], 5: [-16, true, 96] };
  // Merging the pieces into one fill means a single winding direction — overlapping pieces wound the opposite way punch holes
  const sh = (raw) => {
    const area = raw.reduce((a, [x, y], i) => { const [x2, y2] = raw[(i + 1) % raw.length]; return a + x * y2 - x2 * y; }, 0);
    const v = area < 0 ? [...raw].reverse() : raw;
    return { ty: "sh", ks: { a: 0, k: { i: v.map(() => [0, 0]), o: v.map(() => [0, 0]), v, c: true } } };
  };
  // Bold origami type — thick body, wide-rooted wings with a trailing edge
  const pose = (k) => {
    const ph = (Math.PI * 2 * k) / 9, c = Math.cos(ph), s = Math.sin(ph), c2 = Math.cos(ph - 0.5);
    return [
      sh([[412, 198], [356, 212], [300, 234], [196, 262], [88, 284], [146, 306], [104, 338], [212, 318], [312, 298], [366, 258], [392, 226]]),
      sh([[342, 238], [300 - 12 * s, 248 - 104 * c], [188 + 24 * s, 250 - 210 * c], [146 + 12 * s, 260 - 124 * c], [186, 290]]),
      sh([[322, 232], [250, 248], [214 + 16 * s, 250 - 168 * c2], [268 - 6 * s, 246 - 86 * c2]]),
    ];
  };
  const data = (key, rgb, fps) => {
    const [r, flip, s] = LOOK[key] || LOOK[1];
    const layers = Array.from({ length: 9 }, (_, k) => ({
      ddd: 0, ind: k + 1, ty: 4, nm: "pose " + k, sr: 1, ao: 0, ip: k * 3, op: k * 3 + 3, st: 0, bm: 0,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: r }, p: { a: 0, k: [250, 250 - 9 * Math.cos((Math.PI * 2 * k) / 9), 0] }, a: { a: 0, k: [250, 250, 0] }, s: { a: 0, k: [flip ? -s : s, s, 100] } },
      shapes: [{ ty: "gr", nm: "bird", it: [...pose(k), { ty: "fl", c: { a: 0, k: rgb }, o: { a: 0, k: 100 }, r: 1, bm: 0 },
        { ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }] }],
    }));
    return { v: "5.11.0", fr: fps, ip: 0, op: 27, w: 500, h: 500, nm: "bird", ddd: 0, assets: [], layers, markers: [] };
  };
  // The new color is the skin’s accent color (changed to --fx-bird) — paint it on an element to get the computed value, then read rgb through a canvas (works for oklch skins too)
  const pen = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const birdRGB = (el) => {
    const p = document.createElement("i");
    p.style.cssText = "position:absolute;visibility:hidden;background-color:var(--fx-bird, var(--kf-accent))";
    el.append(p);
    const c = getComputedStyle(p).backgroundColor;
    p.remove();
    pen.clearRect(0, 0, 1, 1);
    pen.fillStyle = c;
    pen.fillRect(0, 0, 1, 1);
    const d = pen.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, 1];
  };

  kfFx.register("flap-bird-flock", (el, { options, reduce, scroller }) => {
    const birds = [...el.querySelectorAll('[data-fx-part="bird"]')];
    if (!birds.length || !window.gsap) return;
    const rgb = birdRGB(el);
    const fps = +options.fps || 36;
    const anims = window.lottie
      ? birds.map((b) => lottie.loadAnimation({ container: b, renderer: "svg", loop: true, autoplay: !reduce && options.flap !== "off", animationData: data(b.dataset.key, rgb, fps) }))
      : [];
    const clear = () => { anims.forEach((a) => a.destroy()); gsap.set(birds, { clearProps: "opacity,transform" }); };
    if (reduce) { gsap.set(birds, { opacity: 1 }); return clear; }

    // Original: from the second bird on, ‹80% before the previous bird ends› (-=80%) — a length of .75 gives .15s spacing
    const dur = +(options.dur ?? 0.75), overlap = +(options.overlap ?? 0.8), y = +(options.y ?? 25);
    const ease = kfFx.ease(options.ease || "power4.inOut", "power4.inOut");
    gsap.set(birds, { opacity: 0, y });
    const tl = gsap.timeline({ paused: true, delay: +(options.delay ?? 0), onComplete: () => el.dispatchEvent(new CustomEvent("fx:done")) });
    birds.forEach((b, i) => {
      tl.to(b, { opacity: 1, y: 0, duration: dur, ease, onStart: i === birds.length - 1 ? () => el.dispatchEvent(new CustomEvent("fx:last")) : undefined }, i * dur * (1 - overlap));
    });

    const on = options.on || "enter";
    const play = () => tl.play();
    let st;
    if (on === "load" || !window.ScrollTrigger) play();
    else st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 75%", once: true, onEnter: play });
    return () => { tl.kill(); st?.kill(); clear(); };
  });
})();
