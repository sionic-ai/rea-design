// Business intro: number counting (1.2s power4 — original strong preset) and drag-to-advance expert row.
(() => {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const fmt = (v) => Math.round(v).toLocaleString("en-US");
    if (GP.reduced) return (el.textContent = fmt(end));
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: 1.2, ease: "power4.out", onUpdate: () => (el.textContent = fmt(o.v)), scrollTrigger: { trigger: el, start: "top 85%", once: true } });
  });

  const track = document.querySelector(".sv-mem__track");
  if (track) {
    let down = false, sx = 0, sl = 0;
    track.addEventListener("pointerdown", (e) => ((down = true), (sx = e.clientX), (sl = track.scrollLeft), track.setPointerCapture(e.pointerId)));
    track.addEventListener("pointermove", (e) => down && (track.scrollLeft = sl - (e.clientX - sx)));
    track.addEventListener("pointerup", () => (down = false));
  }
})();
