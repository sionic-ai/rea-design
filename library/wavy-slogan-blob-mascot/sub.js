// Sub-page common: floating blobs (original bg.js values — 30~160px · 650~1400ms interval · max 6 · back.out(1.7) .5s entrance · sine.inOut 3.2~4.8s float · disappear in .45s at the 82% point)
(() => {
  const { reduced, isSp, blobPath } = window.VS;
  if (reduced) return;
  document.querySelectorAll(".float-bg").forEach((wrap) => {
    const host = wrap.parentElement;
    const color = getComputedStyle(document.body).getPropertyValue("--site-page").trim() || "var(--site-yellow)";
    let on = false, timer = 0, last = -1, seed = 1;
    const spawn = () => {
      if (!on) return;
      const sp = isSp();
      if (wrap.childElementCount >= (sp ? 3 : 6)) return;
      const r = host.getBoundingClientRect(), w = host.clientWidth, h = host.clientHeight;
      const top = Math.max(0, -r.top), bottom = Math.min(h, innerHeight - r.top);
      if (bottom - top < 100 || w < 100) return;
      let k; do { k = gsap.utils.random(0, 5, 1); } while (k === last); last = k;
      const size = gsap.utils.random(30 * (sp ? 0.3 : 1), 160 * (sp ? 0.3 : 1));
      const pad = sp ? 10 : 20;
      const x = gsap.utils.random(pad, Math.max(pad, w - size - pad)), y = gsap.utils.random(top + pad, Math.max(top + pad, bottom - size - pad));
      const el = document.createElement("span");
      el.className = "float-obj";
      el.style.width = `${size}px`;
      el.innerHTML = `<svg viewBox="0 0 100 100"><path d="${blobPath(50, 50, 44, (seed++ % 17) + k * 7, 7 + (k % 3), 0.28)}" fill="${color}"/></svg>`;
      wrap.append(el);
      const dx = gsap.utils.random(sp ? -45 : -100, sp ? 45 : 100), dy = gsap.utils.random(sp ? -140 : -240, sp ? -70 : -120);
      const rot = gsap.utils.random(-25, 25), dr = gsap.utils.random(-22, 22), dur = gsap.utils.random(sp ? 3 : 3.2, sp ? 4.2 : 4.8);
      gsap.set(el, { x, y, autoAlpha: 0, scale: 0.55, rotation: rot, filter: "blur(10px)" });
      gsap.timeline({ onComplete: () => el.remove() })
        .to(el, { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: "back.out(1.7)" }, 0)
        .to(el, { x: x + dx, y: y + dy, rotation: rot + dr, duration: dur, ease: "sine.inOut" }, 0.12)
        .to(el, { autoAlpha: 0, scale: 0.72, filter: "blur(8px)", duration: 0.45, ease: "power3.in" }, 0.12 + 0.82 * dur);
    };
    const loop = () => {
      clearTimeout(timer);
      if (!on) return;
      timer = setTimeout(() => { spawn(); loop(); }, gsap.utils.random(isSp() ? 950 : 650, isSp() ? 1750 : 1400));
    };
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { if (!on) { on = true; spawn(); setTimeout(spawn, 350); loop(); } }
      else { on = false; clearTimeout(timer); wrap.querySelectorAll(".float-obj").forEach((o) => { gsap.killTweensOf(o); o.remove(); }); }
    }), { threshold: 0.05 }).observe(host);
  });
})();
