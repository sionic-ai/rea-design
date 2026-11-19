// Wraps each letter in two layers, twisting the outer one in 3D (rotation·Y·X skew·1.3x·push) and counter-rotating the inner one, then,
// When visible, the outer stands upright in 1.5s and the inner in 1.35× that. Chunks entering at the same moment are delayed gap seconds each in order so they stand in turn.
// Original (Motion animate = Like Web Animations, pass the transform string straight to element.animate. Splitting it with GSAP changes the 3D order
(() => {
  const OUTER = {
    a: { r: 15, ry: 35, rx: 25, s: 1.3, sy: 1.13, ty: -15, tx: 35 },
    b: { r: -15, ry: 35, rx: -25, s: 1.3, sy: 1.13, ty: 15, tx: -35 },
    c: { r: 5, ry: 35, rx: 25, s: 1.3, sy: 1.13, ty: 35, tx: 15 },
    d: { r: -35, ry: -50, rx: -25, s: 1.3, sy: 1.1, ty: 15, tx: -25 },
  };
  const INNER = { a: { r: -55, ry: 10, ty: 45, tx: 25 }, b: { r: 55, ry: -10, ty: 35, tx: -25 }, c: { r: -55, ry: 10, ty: 25, tx: 25 }, d: { r: 45, ry: -30, ty: 35, tx: -25 } };
  const tf = ({ r = 0, ry = 0, rx = 0, s = 1, sy = 1, ty = 0, tx = 0 } = {}) => `rotate(${r}deg) rotateY(${ry}deg) rotateX(${rx}deg) scale(${s}) scaleY(${sy}) translateY(${ty}px) translateX(${tx}px)`;
  const ID = tf();
  let batch = [], timer = 0;
  const flush = () => {
    timer = 0;
    batch.sort((p, q) => p.order - q.order).forEach((job, k) => setTimeout(job.play, k * job.gap * 1000));
    batch = [];
  };
  kfFx.register("char-twist-in", (el, { options, reduce }) => {
    if (el.querySelector(".fx-tw")) return;
    const type = OUTER[options.type] ? options.type : "a";
    const dur = +(options.dur ?? 1.5), each = +(options.stagger ?? 0.18), gap = +(options.gap ?? 1.2), delay = +(options.delay ?? 0);
    const easing = `cubic-bezier(${options.ease || "0.215,0.61,0.355,1"})`;
    const order = +(options.order ?? 0);
    const saved = el.innerHTML;
    const label = el.textContent.replace(/\s+/g, " ").trim();
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const texts = [];
    while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) texts.push(walker.currentNode);
    const outers = [], inners = [];
    texts.forEach((t) => {
      const frag = document.createDocumentFragment();
      [...t.nodeValue.replace(/\s*\n\s*/g, "")].forEach((c) => {
        const o = document.createElement("span"), i = document.createElement("span");
        o.className = "fx-tw";
        i.className = "fx-tw-in";
        i.textContent = c;
        o.append(i);
        frag.append(o);
        outers.push(o);
        inners.push(i);
      });
      t.replaceWith(frag);
    });
    if (!outers.length) { el.innerHTML = saved; return; }
    el.setAttribute("aria-label", label);
    if (reduce) { outers.forEach((o) => (o.style.opacity = 1)); return () => { el.innerHTML = saved; el.removeAttribute("aria-label"); }; }
    const anims = [];
    let done = false;
    const play = () => {
      outers.forEach((o, i) => anims.push(o.animate({ opacity: [0, 1], transform: [tf(OUTER[type]), ID] }, { duration: dur * 1000, delay: (delay + i * each) * 1000, easing, fill: "both" })));
      inners.forEach((n, i) => anims.push(n.animate({ transform: [tf(INNER[type]), ID] }, { duration: dur * 1.35 * 1000, delay: (delay + i * each) * 1000, easing, fill: "both" })));
    };
    const io = new IntersectionObserver((es) => {
      if (done || !es.some((e) => e.isIntersecting)) return;
      done = true;
      io.disconnect();
      batch.push({ play, order, gap });
      clearTimeout(timer);
      timer = setTimeout(flush, 80);
    }, { rootMargin: options.margin || "0px 0px -25% 0px" });
    io.observe(el);
    return () => { io.disconnect(); anims.forEach((a) => a.cancel()); batch = batch.filter((j) => j.play !== play); el.innerHTML = saved; el.removeAttribute("aria-label"); };
  });
})();
