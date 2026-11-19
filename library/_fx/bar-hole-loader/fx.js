// Hero loader: a thin bar under the logo at the center of the background-color curtain fills in 1.2s power2.inOut, rests .2s, then the logo-and-bar group slides up 20px and disappears in .4s.
// Starting .2s before that ends, a round hole opens from the bottom center of the curtain to the screen edge over 1.5s power2.inOut (transparent v% · opaque v+30%, v −30 → 150).
// When the hole starts opening fire fx:open (hook scroll unlock and the Hero entrance here), when fully open fire fx:done and hide the curtain
(() => {
  kfFx.register("bar-hole-loader", (el, { options, reduce }) => {
    const bar = el.querySelector('[data-fx-part="bar"]'), inner = el.querySelector('[data-fx-part="inner"]');
    const lock = options.lock !== "off", root = document.documentElement;
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const unlock = () => lock && root.classList.remove("fx-bhl-lock");
    const done = () => { unlock(); el.hidden = true; fire("fx:done"); };
    if (reduce) { const t = setTimeout(() => { fire("fx:open"); done(); }, 0); return () => clearTimeout(t); }
    if (lock) root.classList.add("fx-bhl-lock");
    const at = options.at || "50% 100%", soft = +(options.soft ?? 30);
    const hole = { v: -soft };
    const paint = () => {
      const m = `radial-gradient(circle at ${at}, transparent ${Math.max(0, hole.v)}%, var(--kf-ink) ${Math.max(0, hole.v + soft)}%)`;
      el.style.webkitMaskImage = m;
      el.style.maskImage = m;
    };
    paint();
    const tl = gsap.timeline({ onComplete: done });
    if (bar) tl.to(bar, { width: "100%", duration: +(options.dur ?? 1.2), ease: kfFx.ease(options.ease || "power2.inOut", "power2.inOut"), force3D: true });
    if (inner) tl.to(inner, { y: -20, opacity: 0, duration: +(options.out ?? 0.4), ease: "power2.out", force3D: true }, `+=${+(options.rest ?? 0.2)}`);
    tl.to(hole, { v: 150, duration: +(options.hole ?? 1.5), ease: kfFx.ease(options["hole-ease"] || "power2.inOut", "power2.inOut"), onStart: () => { unlock(); fire("fx:open"); }, onUpdate: paint }, inner ? "-=0.2" : ">");
    // So no task is left unfinished — the original removes the curtain after 8 seconds
    const safety = setTimeout(() => { if (!el.hidden) { tl.kill(); done(); } }, +(options.safety ?? 8) * 1000);
    return () => { tl.kill(); clearTimeout(safety); unlock(); el.hidden = false; el.style.webkitMaskImage = el.style.maskImage = ""; if (bar) gsap.set(bar, { clearProps: "width,transform" }); if (inner) gsap.set(inner, { clearProps: "transform,opacity" }); };
  });
})();
