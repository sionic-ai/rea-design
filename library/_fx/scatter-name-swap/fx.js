// The next section lifts from the right, the client-name letters of the outgoing section scatter and those of the incoming section gather
(() => {
  kfFx.register("scatter-name-swap", (el, { options, reduce }) => {
    const slides = [...el.querySelectorAll(':scope > [data-fx-part="slide"]')];
    if (slides.length < 2) return;
    const dots = [...el.querySelectorAll('[data-fx-part="dot"]')];
    const count = el.querySelector('[data-fx-part="count"]');
    const dur = +(options.dur ?? 1.2), spread = +(options.spread ?? 21), every = +(options.every ?? 5);
    const ease = kfFx.ease(options.ease || "0.19,1,0.22,1", "expo.out");
    let at = Math.max(0, slides.findIndex((s) => s.classList.contains("is-active")));
    slides[at].classList.add("is-active");
    let busy = false, z = 2;
    const chars = (s) => s.querySelectorAll('[data-fx-part="char"]');
    const scatter = (s, sign) => chars(s).forEach((c, k) => c.style.setProperty("--x", `${(k % 2 ? 1 : -1) * sign * spread}vw`));
    const go = (n) => {
      if (busy || n === at) return;
      busy = true;
      const out = slides[at], inn = slides[n];
      const outImg = out.querySelector('[data-fx-part="img"]'), inImg = inn.querySelector('[data-fx-part="img"]');
      scatter(out, 1);
      if (outImg) gsap.to(outImg, { xPercent: -25, duration: dur, ease });
      scatter(inn, -1);
      z += 1;
      gsap.set(inn, { display: "block", zIndex: z });
      const tl = gsap.timeline({ onComplete: () => {
        out.classList.remove("is-active");
        gsap.set(out, { clearProps: "display,zIndex" });
        if (outImg) gsap.set(outImg, { xPercent: 0 });
        inn.classList.add("is-active");
        busy = false;
      } });
      tl.fromTo(inn, { clipPath: "inset(0% 0% 0% 100%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: reduce ? 0 : dur, ease });
      if (inImg) tl.fromTo(inImg, { xPercent: 20 }, { xPercent: 0, duration: reduce ? 0 : dur, ease }, "<");
      tl.call(() => chars(inn).forEach((c) => c.style.setProperty("--x", "0vw")), null, reduce ? 0 : "<+=0.45");
      const lines = inn.querySelectorAll('[data-fx-part="line"]');
      if (lines.length) tl.fromTo(lines, { yPercent: 25, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: reduce ? 0 : 0.5, stagger: { each: 0.1, from: "end" } }, "<+=0.2");
      dots.forEach((d, k) => d.classList.toggle("is-active", k === n));
      if (count) count.textContent = String(n + 1).padStart(2, "0");
      at = n;
    };
    const handlers = dots.map((d, k) => { const h = () => go(k); d.addEventListener("click", h); return [d, h]; });
    const timer = !reduce && every > 0 ? setInterval(() => go((at + 1) % slides.length), every * 1000) : 0;
    return () => {
      clearInterval(timer);
      handlers.forEach(([d, h]) => d.removeEventListener("click", h));
      slides.forEach((s) => { gsap.killTweensOf(s); gsap.set(s, { clearProps: "clipPath,display,zIndex" }); chars(s).forEach((c) => c.style.removeProperty("--x")); });
    };
  });
})();
