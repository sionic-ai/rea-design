// News list. Ten droplets fall tilted along a shallow U-shaped path in the header, squash and then straighten (original data-motion direct), and two stack on top of the lower two (stack).
// Fall time is height/720 (phone 400) seconds, minimum 1.2s power2.in · squash .08 power1.out → .18 back.out(2)
// Category pages (original /journal/category/*) share the same type, so ?cat= Filters the same list to show it.
(() => {
  gsap.registerPlugin(MotionPathPlugin);
  const { reduced, isSp } = window.VS;

  const cat = new URLSearchParams(location.search).get("cat") || "all";
  const NAME = { all: "All", info: "Information", blog: "Blog", member: "Member" };
  const items = [...document.querySelectorAll(".aitem")];
  const shown = items.filter((it) => cat === "all" || it.dataset.cat === cat);
  items.forEach((it) => it.classList.toggle("is-hidden", !shown.includes(it)));
  document.querySelector(".archive__title").textContent = NAME[cat] || "All";
  document.querySelectorAll(".archive__total b").forEach((b) => (b.textContent = cat === "all" ? 9 : shown.length));
  document.querySelectorAll(".jside a").forEach((a) => a.dataset.cat === cat ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));

  // Values from the original sub_kv_chara_item — start spot on the path (path length 1500, phone 420 basis), drop height, delay, initial tilt, offset after landing, width (%)
  const C = [
    { start: [486, 42], drop: [-420, -230], delay: 0, rot: -22, off: [0, 0], w: [4.4667, 7.4976] },
    { start: [720, 120], drop: [-520, -260], delay: 0.12, rot: 18, off: [6, 0], w: [4.0667, 6.8262] },
    { start: [654, 88], drop: [-590, -310], delay: 0.62, rot: -16, off: [0, 0], w: [4.3333, 7.2738] },
    { start: [754, 134], drop: [-660, -350], delay: 0.37, rot: -20, off: [16, 0], w: [4.2, 7.05], on: [1, 4] },
    { start: [788, 150], drop: [-430, -220], delay: 0.25, rot: 28, off: [-2, 0], w: [4.4667, 7.4976] },
    { start: [878, 197], drop: [-700, -380], delay: 0.49, rot: 20, off: [0, 0], w: [5.0667, 8.5048] },
    { start: [928, 217], drop: [-460, -240], delay: 0.96, rot: 24, off: [9, 0], w: [5.4, 9.0643], on: [5, 7] },
    { start: [952, 229], drop: [-560, -300], delay: 0.73, rot: -18, off: [-1, 0], w: [4.7333, 7.9452] },
    { start: [1020, 260], drop: [-640, -330], delay: 0.85, rot: -12, off: [-1, 0], w: [4.7333, 7.9452] },
    { start: [1116, 304], drop: [-500, -270], delay: 1.08, rot: 14, off: [-4, 0], w: [4.2667, 7.1619] },
  ];
  const wrap = document.querySelector(".jkv__charas");
  const svg = document.querySelector(".jkv__wave"), path = svg.querySelector("path");
  const els = C.map((c, i) => {
    const el = document.createElement("span");
    el.className = `jkv__chara${c.on ? " is-stack" : ""}`;
    el.style.setProperty("--w", `${c.w[0]}%`);
    el.style.setProperty("--w-sp", `${c.w[1]}%`);
    el.innerHTML = `<span class="jkv__visual">${window.VS.chara((i % 5) + 1)}</span>`;
    wrap.append(el);
    return el;
  });
  const vis = (i) => els[i].firstElementChild;
  const landY = [];
  // Placement: set on the road and raise the image by half its height so its bottom touches the road, and the two stacked ones overlap the top edge of the two supporting ones by 3px (phone 1.5)
  const layout = () => {
    const sp = isSp() ? 1 : 0;
    svg.setAttribute("viewBox", svg.dataset[sp ? "viewSp" : "viewPc"]);
    path.setAttribute("d", path.dataset[sp ? "sp" : "pc"]);
    const total = sp ? 420 : 1500;
    C.forEach((c, i) => {
      const at = c.start[sp] / total;
      gsap.set(els[i], { transformOrigin: "50% 50%", motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: at, end: at } });
      gsap.set(vis(i), { yPercent: -50, x: 0, y: c.on ? 0 : c.off[sp], rotation: 0, scaleX: 1, scaleY: 1, transformOrigin: "50% 100%" });
      landY[i] = c.on ? 0 : c.off[sp];
    });
    C.forEach((c, i) => {
      if (!c.on) return;
      const top = Math.min(...c.on.map((k) => vis(k).getBoundingClientRect().top));
      landY[i] = top + (sp ? 1.5 : 3) - vis(i).getBoundingClientRect().bottom + c.off[sp];
      gsap.set(vis(i), { y: landY[i] });
    });
  };
  const squash = (tl, el) => tl
    .to(el, { scaleX: 1.08, scaleY: 0.92, duration: 0.08, ease: "power1.out", transformOrigin: "50% 100%" })
    .to(el, { scaleX: 1, scaleY: 1, duration: 0.18, ease: "back.out(2)", transformOrigin: "50% 100%" });
  let tls = [];
  const settle = () => { layout(); els.forEach((el, i) => { gsap.set(el, { autoAlpha: 1 }); gsap.set(vis(i), { y: landY[i], rotation: 0 }); }); };
  const play = () => {
    layout();
    if (reduced) return settle();
    const sp = isSp() ? 1 : 0;
    tls = C.map((c, i) => {
      const tl = gsap.timeline({ delay: c.delay }).set(els[i], { autoAlpha: 1 });
      tl.fromTo(vis(i), { y: landY[i] + c.drop[sp], rotation: c.rot }, { y: landY[i], rotation: 0, duration: Math.max(1.2, Math.abs(c.drop[sp]) / (sp ? 400 : 720)), ease: "power2.in" });
      return squash(tl, vis(i));
    });
  };
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.05 });
  io.observe(document.querySelector(".vs-subkv__visual"));
  let rt;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!tls.length) return; tls.forEach((t) => t.kill()); settle(); }, 150); });
})();
