// Hovering a card, one thick accent-color brush stroke winds across the photo slot (grows from the end toward the start, thickness 0→1200),
// .35s later the second photo is painted in through a mask of the same brush stroke. On release it erases in reverse 1.3x faster.
// The second photo <img> If it is, that image is drawn, otherwise (placeholder) a placeholder plate bearing the data-label is redrawn inside the svg.
(() => {
  const NS = "http://www.w3.org/2000/svg";
  // A brush path inside the 709×1012 photo cell that starts at the bottom left, bends sharply three times, and exits at the top right (our own)
  // The end runs out past the cell so its length matches the original brush stroke (2724) — same length so the same share is painted in the same time
  const PATH = "M40 760C110 1010 300 1020 340 860C390 650 -70 320 110 100C250 -70 470 440 600 480C730 520 650 70 660 30L660 -215";
  let uid = 0;
  const seg = (p, len, a) => {
    p.style.strokeDasharray = `${(1 - a) * len} ${len * 2}`;
    p.style.strokeDashoffset = `${-a * len}`;
  };

  kfFx.register("brush-swap-hover", (el, { options, reduce, hover }) => {
    const media = el.querySelector('[data-fx-part="media"]') || el;
    const swap = media.querySelector('[data-fx-part="swap"]');
    const arrow = el.querySelector('[data-fx-part="arrow"]');
    if (reduce || !hover) return;
    const width = +(options.width ?? 1200), dur = +(options.dur ?? 0.95), dur2 = +(options["swap-dur"] ?? 1.05), lag = +(options.lag ?? 0.35);
    const back = +(options.back || 1.3), d = options.path || PATH, [vw, vh] = (options.box || "709 1012").split(/[\s,]+/).map(Number);
    const id = `fx-brush-swap-${++uid}`;

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "fx-brush-swap");
    let layer = "";
    if (swap?.tagName === "IMG") layer = `<image href="${swap.currentSrc || swap.src}" x="0" y="0" width="${vw}" height="${vh}" preserveAspectRatio="xMidYMid slice" mask="url(#${id})"/>`;
    else if (swap) {
      const label = (swap.getAttribute("data-label") || "").replace(/[<&"]/g, "");
      layer = `<g mask="url(#${id})" class="fx-brush-swap__ph"><rect width="${vw}" height="${vh}"/><path d="M0 0L${vw} ${vh}M${vw} 0L0 ${vh}"/><text x="${vw / 2}" y="${vh / 2}" text-anchor="middle">${label}</text></g>`;
    }
    svg.innerHTML = `<path class="fx-brush-swap__paint" d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      (layer ? `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="${vw + 400}" height="${vh + 400}"><path class="fx-brush-swap__mask" d="${d}" fill="none" stroke-linecap="round" stroke-linejoin="round"/></mask></defs>${layer}` : "");
    if (swap) swap.style.visibility = "hidden";
    media.append(svg);
    const paint = svg.querySelector(".fx-brush-swap__paint"), mask = svg.querySelector(".fx-brush-swap__mask");
    const L = paint.getTotalLength() || 3000;
    const s1 = { a: 1 }, s2 = { a: 1 };
    const draw1 = () => seg(paint, L, s1.a), draw2 = () => mask && seg(mask, L, s2.a);
    draw1();
    draw2();
    gsap.set([paint, mask].filter(Boolean), { strokeWidth: 0 });

    const tl = gsap.timeline({ paused: true, defaults: { ease: kfFx.ease(options.ease || "power1.inOut", "power1.inOut") } });
    tl.to(s1, { a: 0, duration: dur, onUpdate: draw1 }, 0).to(paint, { strokeWidth: width, duration: dur }, 0);
    if (mask) tl.to(s2, { a: 0, duration: dur2, onUpdate: draw2 }, lag).to(mask, { strokeWidth: width, duration: dur2 }, lag);
    if (arrow) {
      gsap.set(arrow, { transformOrigin: "50% 50%" });
      tl.to(arrow, { rotation: -45, duration: 0.28, ease: "power2.out" }, 0).to(arrow, { rotation: 0, duration: 0.65, ease: "elastic.out(1.15, 0.35)" }, 0.28);
    }
    const on = () => tl.timeScale(1).play();
    const off = () => tl.timeScale(back).reverse();
    el.addEventListener("mouseenter", on);
    el.addEventListener("mouseleave", off);
    return () => {
      el.removeEventListener("mouseenter", on);
      el.removeEventListener("mouseleave", off);
      tl.kill();
      svg.remove();
      if (swap) swap.style.visibility = "";
      if (arrow) gsap.set(arrow, { clearProps: "transform" });
    };
  });
})();
