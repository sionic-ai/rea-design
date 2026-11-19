/* Method motion — original values: twelve reasons are shuffled into eight slots, and .5s after the font arrives the list slot opens from height 0 over 1.4s expo.inOut while 
   Rows rise from the center at .55s with .05 spacing over 1s power3.out, and right after they finish the first swap happens → after that one random cell every 2s
   Slides out upward (−100%) while the new reason rises from below (100%) at the same time, .8s power4.inOut. Pauses when off-screen or when the tab is hidden */
(() => {
  const wrap = document.querySelector("[data-reasons-wrap]");
  const items = [...document.querySelectorAll(".ap-hero__item")];
  if (!wrap || !items.length) return;
  const texts = items.map((it) => it.textContent.trim());
  for (let i = texts.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [texts[i], texts[j]] = [texts[j], texts[i]]; }
  const N = Math.min(8, items.length);
  const slots = items.slice(0, N).map((it, i) => { const t = it.querySelector(".ap-hero__text"); t.textContent = texts[i]; return t; });
  const pool = texts.slice(N);
  items.slice(N).forEach((it) => it.remove());
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { wrap.style.height = "auto"; return; }
  let lastSlot = -1, lastOut = "", busy = false, introDone = false, inView = true;
  const swap = () => {
    if (!pool.length || busy) return;
    busy = true;
    let si; do { si = Math.floor(Math.random() * slots.length); } while (slots.length > 1 && si === lastSlot);
    lastSlot = si;
    let pi; do { pi = Math.floor(Math.random() * pool.length); } while (pool.length > 1 && pool[pi] === lastOut);
    const cur = slots[si], incoming = pool[pi], outgoing = cur.textContent;
    const next = cur.cloneNode(); next.textContent = incoming;
    cur.after(next);
    gsap.timeline({ onComplete: () => { cur.remove(); slots[si] = next; pool[pi] = outgoing; lastOut = outgoing; busy = false; } })
      .to(cur, { yPercent: -100, duration: 0.8, ease: "power4.inOut" }, 0)
      .fromTo(next, { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: "power4.inOut" }, 0);
  };
  const loop = gsap.delayedCall(2, function tick() { swap(); loop.restart(true); }).pause();
  const canRun = () => introDone && inView && !document.hidden;
  const updateLoop = () => loop.paused(!canRun());
  new IntersectionObserver(([en]) => { inView = en.isIntersecting; updateLoop(); }).observe(wrap.closest("section") || wrap);
  document.addEventListener("visibilitychange", updateLoop);
  gsap.set(slots, { yPercent: 100 });
  document.fonts.ready.then(() => {
    gsap.timeline({ delay: 0.5 })
      .to(wrap, { height: "auto", duration: 1.4, ease: "expo.inOut", onComplete: () => gsap.set(wrap, { height: "auto" }) })
      .to(slots, { yPercent: 0, duration: 1, ease: "power3.out", stagger: { each: 0.05, from: "center" } }, 0.55)
      .add(() => { introDone = true; if (canRun()) swap(); loop.restart(true); updateLoop(); });
  });
})();
