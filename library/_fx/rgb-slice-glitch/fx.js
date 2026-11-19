(() => {
  // Duplicates a picture·text block twice more as red and blue shadows, cuts it into horizontal bands every 5% for 1.35s so it jitters left and right, then fades it out (scanline grain on top)
  // Strips: [x, y, top clip %, bottom clip %] — original values (17 steps at 5% intervals), the blue layer jumps the opposite way
  const A = [[-30,-4,0,68],[22,4,56,0],[-18,-3,18,24],[30,5,70,0],[-26,-5,4,46],[18,3,34,10],[-34,-4,12,36],[26,5,60,2],[-16,-2,0,74],[34,4,24,12],[-30,-5,76,0],[22,3,14,20],[-18,-4,42,4],[28,5,6,44],[-24,-3,82,0],[16,4,28,14],[-12,-2,2,64]];
  const B = [[30,4,64,0],[-22,-4,0,68],[18,3,36,8],[-30,-5,10,34],[26,5,78,0],[-18,-3,2,50],[34,4,26,14],[-26,-5,58,0],[16,2,0,78],[-34,-4,18,22],[30,5,72,0],[-22,-3,8,38],[18,4,46,2],[-28,-5,0,58],[24,3,32,10],[-16,-4,84,0],[12,2,12,34]];
  const NOISE = [[0, 0, 0], [0.1, 0.75, -4], [0.2, 0.35, 5], [0.35, 0.82, -3], [0.5, 0.28, 4], [0.65, 0.66, -5], [0.8, 0.24, 3], [1, 0, 0]];
  const frames = (list, amp) => {
    const f = [{ offset: 0, opacity: 0, transform: "translate(0,0)", clipPath: "inset(0 0 0 0)" }];
    list.forEach(([x, y, t, b], i) => f.push({ offset: (i + 1) * 0.05, opacity: 1, transform: `translate(${x * amp}px,${y * amp}px)`, clipPath: `inset(${t}% 0 ${b}% 0)` }));
    f.push({ offset: 1, opacity: 0, transform: "translate(0,0)", clipPath: "inset(0 0 0 0)" });
    return f;
  };
  kfFx.register("rgb-slice-glitch", (el, { options, reduce, scroller }) => {
    const src = el.querySelector('[data-fx-part="art"]') || el.firstElementChild;
    if (!src || reduce) return;
    const dur = +(options.dur ?? 1.35) * 1000, amp = +(options.amp ?? 1), on = options.on || "load";
    const layers = ["a", "b"].map((k) => {
      const c = src.cloneNode(true);
      c.removeAttribute("data-fx-part");
      c.setAttribute("aria-hidden", "true");
      c.classList.add("fx-glitch-layer", `fx-glitch-${k}`);
      el.append(c);
      return c;
    });
    const scan = document.createElement("span");
    scan.className = "fx-glitch-scan";
    scan.setAttribute("aria-hidden", "true");
    el.append(scan);
    let anims = [], st = null, played = false;
    const play = () => {
      if (played) return;
      played = true;
      anims = [
        layers[0].animate(frames(A, amp), { duration: dur, easing: "linear", fill: "forwards" }),
        layers[1].animate(frames(B, amp), { duration: dur, easing: "linear", fill: "forwards" }),
        scan.animate(NOISE.map(([offset, opacity, y]) => ({ offset, opacity, transform: `translateY(${y}px)` })), { duration: dur, easing: "linear", fill: "forwards" }),
      ];
    };
    const onEvt = () => play();
    if (on === "load") requestAnimationFrame(() => requestAnimationFrame(play));
    else if (on === "scroll" && window.ScrollTrigger) st = ScrollTrigger.create({ trigger: el, scroller, start: options.start || "top 80%", once: true, onEnter: play });
    else document.addEventListener(on, onEvt, { once: true });
    return () => {
      anims.forEach((a) => a.cancel());
      st?.kill();
      document.removeEventListener(on, onEvt);
      layers.forEach((l) => l.remove());
      scan.remove();
    };
  });
})();
