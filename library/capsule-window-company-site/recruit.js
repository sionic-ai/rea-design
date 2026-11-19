// Recruit: back photo (WebGL part) · disappears after the first screen and reappears at CV, rolling numbers, line graph drawing, CV copy flow.
uSite.scene(({ reduce, isPc, gridFx }) => {
  const bg = document.querySelector("[data-rc-bg]");
  // Photo transition is the mask-distort-slides part — .4s after one slide ends, the grid ripples
  bg.addEventListener("fx:mask-distort-slides", () => setTimeout(() => gridFx({ pulse: true }), 400));

  const st = { fv: 1, cv: 0 };
  const paint = () => (bg.style.opacity = Math.max(st.fv, st.cv));
  ScrollTrigger.create({ trigger: "#recruit-kv", start: "top top", end: "bottom top", onUpdate: (s) => { st.fv = 1 - s.progress; paint(); } });
  ScrollTrigger.create({ trigger: "[data-rc-cv]", start: "top bottom", end: "top 30%", onUpdate: (s) => { st.cv = s.progress; paint(); } });
  ScrollTrigger.create({ trigger: "[data-rc-cv]", start: "bottom 60%", end: "bottom top", onUpdate: (s) => { st.cv = 1 - s.progress; paint(); } });

  // Stand a digit column at each spot and roll it one extra turn from 0 to the target digit
  document.querySelectorAll(".rc-roll").forEach((el) => {
    const target = el.dataset.roll;
    el.textContent = "";
    const cols = [];
    [...target].forEach((ch) => {
      if (!/\d/.test(ch)) { el.append(ch); return; }
      const col = document.createElement("span");
      col.className = "rc-roll__col";
      const strip = document.createElement("span");
      strip.innerHTML = Array.from({ length: 20 }, (_, k) => `<span>${k % 10}</span>`).join("");
      col.append(strip);
      el.append(col);
      cols.push({ strip, d: Number(ch) });
    });
    if (reduce) { cols.forEach(({ strip, d }) => (strip.style.transform = `translateY(${-d * 5}%)`)); return; }
    ScrollTrigger.create({
      trigger: el, start: "top 85%", once: true,
      onEnter: () => cols.forEach(({ strip, d }, k) => gsap.fromTo(strip, { yPercent: 0 }, { yPercent: -(10 + d) * 5, duration: 1.6, ease: "power3.out", delay: k * 0.08 })),
    });
  });

  document.querySelectorAll("[data-line]").forEach((path) => {
    const len = path.getTotalLength();
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = reduce ? 0 : len;
    if (reduce) return;
    ScrollTrigger.create({ trigger: path.closest("svg"), start: "top 85%", once: true, onEnter: () => gsap.to(path, { strokeDashoffset: 0, duration: 1.4, ease: "power2.out" }) });
  });

  const mq = document.querySelector("[data-rc-marquee]");
  let x = 0;
  if (!reduce) gsap.ticker.add((_, dt) => {
    const half = mq.scrollWidth / 2;
    x -= ((isPc() ? 72 : 50) * dt) / 1000;
    if (-x >= half) x += half;
    mq.style.transform = `translate3d(${x}px,0,0)`;
  });
});
