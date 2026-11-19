// Spawns one photo at a time inside the plate, flows it straight from bottom-left to top-right and tumbles it with rotate3d — passed photos are removed
(() => {
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const STAR = "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

  kfFx.register("tumble-drift-stream", (el, { options, reduce }) => {
    const photos = [...el.querySelectorAll(':scope > [data-fx-part="photo"]')];
    const solos = [...el.querySelectorAll(':scope > [data-fx-part="solo"]')];
    if (!photos.length && !solos.length) return;

    const num = (k, d) => +(options[k] ?? d);
    const sizeMin = num("size-min", 3), sizeMax = num("size-max", 25);
    const driftMin = num("drift-min", 15000), driftMax = num("drift-max", 50000);
    const spinMin = num("spin-min", 10000), spinMax = num("spin-max", 50000);
    const soloMin = num("solo-min", 10000), soloMax = num("solo-max", 20000);
    const everyMin = +options["every-min"] || 300, everyMax = +options["every-max"] || 700;
    const fade = num("fade", 2000), star = num("star", 50), narrowAt = num("narrow", 768);
    const made = new Set();

    const ratioOf = (src) => +(src.dataset.ratio || 0) || 0.6667;
    const shapeOf = (src, isSolo) => src.dataset.shape || (isSolo ? "square" : "round");

    // The original picks one of two tumbling keyframes, and the initial angle (rotate ±90°) is immediately overwritten by the animation
    const disc = (src, isSolo) => {
      const d = src.cloneNode(true);
      d.removeAttribute("data-fx-part");
      d.classList.add("fx-tds-disc");
      const shape = shapeOf(src, isSolo);
      if (!isSolo && star > 0 && rand(0, star) === star) d.style.clipPath = STAR;
      else if (shape === "round") d.style.borderRadius = "100%";
      d.style.animation = `${rand(1, 2) === 2 ? "fx-tds-tumble" : "fx-tds-tumble-back"} ${rand(spinMin, spinMax)}ms linear infinite`;
      return d;
    };

    const launch = (src, isSolo, done) => {
      const post = document.createElement("div");
      post.className = "fx-tds-post";
      post.setAttribute("aria-hidden", isSolo ? "false" : "true");
      const frame = document.createElement("div");
      frame.className = "fx-tds-frame";
      frame.style.paddingBottom = ratioOf(src) * 100 + "%";
      const d = disc(src, isSolo);
      frame.append(d);
      post.append(frame);
      // Original puts photos in the panel only after all files are downloaded — so the first section appears as late as the download takes, and photos that failed don’t flow half-drawn
      const imgs = [...(d.matches("img") ? [d] : []), ...d.querySelectorAll("img")];
      Promise.all(imgs.map((i) => i.decode().catch(() => {}))).then(() => alive && go(post, frame, isSolo, src, done));
    };

    const go = (post, frame, isSolo, src, done) => {
      const W = el.clientWidth, H = el.clientHeight;
      const narrow = W < narrowAt;
      let lo = sizeMin, hi = sizeMax;
      const own = (narrow && src.dataset.sizeNarrow) || src.dataset.size;
      if (own) [lo, hi] = own.split(/[\s,]+/).map(Number);
      else if (narrow && !isSolo) [lo, hi] = [lo * 3, hi * 2.5];
      post.style.width = rand(lo, hi) + "%";
      // One of the three starts from the bottom edge, the rest from the left edge — so it always flows from bottom left → top right
      const [a, b] = isSolo ? [20, 80] : [-10, 110];
      if (rand(0, 2) === 2) { post.style.top = "100%"; post.style.left = rand(a, b) + "%"; }
      else post.style.top = rand(a, b) + "%";
      const dur = isSolo ? rand(soloMin, soloMax) : rand(driftMin, driftMax);
      el.append(post);
      made.add(post);
      const runs = [
        post.animate([{ transform: "translate(0, 0)" }, { transform: `translate(${W}px, ${-H}px)` }], { duration: dur, easing: "linear" }),
        frame.animate([{ transform: "translate(-100%, 0)" }, { transform: "translate(100%, -100%)" }], { duration: dur, easing: "linear" }),
      ];
      requestAnimationFrame(() => post.classList.add("is-in"));
      post.style.setProperty("--fx-fade", fade + "ms");
      runs[0].onfinish = () => { post.remove(); made.delete(post); done?.(); };
    };

    if (reduce) {
      const spots = [[6, 8, 14], [70, 12, 10], [18, 62, 18], [82, 58, 12], [44, 30, 8], [58, 78, 16]];
      (photos.length ? photos : solos).slice(0, spots.length).forEach((src, i) => {
        const post = document.createElement("div");
        post.className = "fx-tds-post is-in is-still";
        post.style.cssText = `left:${spots[i][0]}%;top:${spots[i][1]}%;width:${spots[i][2]}%`;
        const frame = document.createElement("div");
        frame.className = "fx-tds-frame";
        frame.style.paddingBottom = ratioOf(src) * 100 + "%";
        const d = disc(src, false);
        d.style.animation = "none";
        if (shapeOf(src, false) === "round") d.style.borderRadius = "100%";
        frame.append(d);
        post.append(frame);
        el.append(post);
        made.add(post);
      });
      return () => { made.forEach((p) => p.remove()); made.clear(); };
    }

    let order = photos.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    let at = -1, visible = true, timer = 0, alive = true;
    const next = () => { if (!visible || document.hidden) return; at = (at + 1) % order.length; launch(photos[order[at]], false); };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);

    // The original picks the interval only once and passes it to setInterval — even if a line draws a new one, the interval already set stays, so the tempo is constant
    const scale = el.clientWidth < narrowAt ? 1.5 : 1;
    if (photos.length) { next(); timer = setInterval(next, rand(everyMin * scale, everyMax * scale)); }
    // Covers and icons are one each — once all have passed, the next is spawned right away
    solos.forEach((src) => { const loop = () => alive && launch(src, true, loop); loop(); });

    return () => {
      alive = false;
      clearInterval(timer);
      io.disconnect();
      made.forEach((p) => { p.getAnimations({ subtree: true }).forEach((a) => a.cancel()); p.remove(); });
      made.clear();
    };
  });
})();
