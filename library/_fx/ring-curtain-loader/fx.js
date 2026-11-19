// On first open a thin patterned ring spins (one turn per 10 seconds) and appears in 1s, then the logo lights up in 1s and from 1.8s moves up 10% while fading (1.2s expo.out, the ring turns off too).
// At 2.5s the color curtain (first) lifts over 1s power4.out and the contrast curtain beneath (second) lifts together over .8s expo.inOut, so the contrast color shows briefly and vanishes. When second is fully lifted (3.3s) the curtains are hidden and fx:done fires
(() => {
  kfFx.register("ring-curtain-loader", (el, { options, reduce }) => {
    const q = (n) => el.querySelector(`[data-fx-part="${n}"]`);
    const first = q("first"), second = q("second"), ring = q("ring"), logo = q("logo");
    if (!first && !second) return;
    const key = "fx-ring-curtain-loader";
    const finish = () => { el.style.display = "none"; el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); };
    // once: session — from the second visit in the same tab, skip the curtain (the original runs only when arriving from outside)
    const seen = options.once === "session" && sessionStorage.getItem(key);
    if (options.once === "session") sessionStorage.setItem(key, "1");
    if (reduce || seen) { finish(); return () => { el.style.display = ""; }; }
    const at = +(options.at ?? 2.5);
    const spin = ring ? gsap.to(ring, { rotation: 360, duration: +(options.spin ?? 10) || 10, repeat: -1, ease: "none" }) : null;
    const tl = gsap.timeline();
    if (ring) tl.to(ring, { opacity: 1, duration: 1, ease: "power4.out" }, 0).to(ring, { opacity: 0, duration: 1.2, ease: "power4.out" }, 1.8);
    if (logo) tl.to(logo, { opacity: 1, duration: 1, ease: "power4.out" }, 1).to(logo, { yPercent: -10, opacity: 0, duration: 1.2, ease: "expo.out" }, 1.8);
    if (first) tl.to(first, { yPercent: -100, duration: 1, ease: "power4.out" }, at);
    if (second) tl.to(second, { yPercent: -100, duration: 0.8, ease: "expo.inOut" }, at);
    tl.call(() => { spin?.kill(); finish(); }, null, at + (second ? 0.8 : 1));
    tl.timeScale(+(options.speed ?? 1) || 1);
    return () => {
      tl.kill();
      spin?.kill();
      gsap.set([first, second, ring, logo].filter(Boolean), { clearProps: "transform,opacity" });
      el.style.display = "";
    };
  });
})();
