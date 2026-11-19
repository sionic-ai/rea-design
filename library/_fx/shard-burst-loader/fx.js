(() => {
  // The logo at the center of the covering curtain appears over .25s and grows along the .5s curve (.14,1,.34,1), and the curtain background turns transparent over .5s after .25s.
  // Each piece gathers from its own fixed outer position (distance in 1em units) in .583s, scaling 1.4× → 1, and from .38s it flickers .03s (×8) · vertices jitter every .035s.
  // At .65s the shard panel jitters ±12px, and .416s later the shards scatter outward again for .5s (.66,0,.34,1) and vanish at .33s. The logo grows 1.5x after .4s, vanishes at .33s, then fx:done
  const OFF = [[-2.4, 0], [-7.7, 0], [-1.5, -19.6], [2.6, -4.5], [1.8, -18.3], [16.8, -31.4], [10.2, 0], [-4.5, -29], [-27.8, 8.1], [-21, -12.2], [-21.3, -75.5], [6, -43.2], [55.2, -52.4], [63.5, 54.3], [23.6, -34.3], [-69.8, 19.1], [-13.4, 77.8], [14.4, 52.6], [-42.8, 17.7], [-42.7, -16.2]];
  kfFx.register("shard-burst-loader", (el, { options, reduce }) => {
    const done = () => { el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true })); if (options.keep !== "on") el.style.display = "none"; };
    if (reduce) { done(); return; }
    const logo = el.querySelector('[data-fx-part="logo"]'), field = el.querySelector('[data-fx-part="shards"]');
    const shards = field ? [...field.querySelectorAll("polygon")] : [];
    const delay = +(options.delay ?? 0), speed = +(options.speed ?? 1);
    const out = kfFx.ease("0.14,1,0.34,1", "expo.out"), cubic = kfFx.ease("0.66,0,0.34,1", "power2.inOut"), expo = kfFx.ease("0.9,0,0.1,1", "expo.inOut");
    const unit = parseFloat(getComputedStyle(el).fontSize) || 10;
    const tl = gsap.timeline({ delay, onComplete: done });
    tl.timeScale(speed || 1);
    if (logo) tl.fromTo(logo, { opacity: 0, scale: 0.6 }, { opacity: 1, duration: 0.25 }, 0).to(logo, { scale: 1, duration: 0.5, ease: out }, 0);
    tl.to(el, { backgroundColor: "transparent", duration: 0.5, ease: "none", delay: 0.25 }, 0);
    if (shards.length) gsap.set(shards, { transformOrigin: "50% 50%" });
    shards.forEach((s, k) => {
      const [ox, oy] = OFF[k % OFF.length].map((v) => v * unit), d = 0.05 * Math.random();
      const pts = s.getAttribute("points");
      const jitter = (a) => pts.trim().split(/\s+/).map((p) => p.split(",").map((v) => (+v + (Math.random() - 0.5) * a).toFixed(1)).join(",")).join(" ");
      tl.from(s, { x: ox, y: oy, ease: out, duration: 0.583, delay: d }, 0)
        .fromTo(s, { opacity: 0, scale: 1.4 }, { scale: 1, duration: 0.583, ease: out, delay: d }, 0)
        .fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.03, repeat: 8, yoyo: true, ease: "none" }, 0.38);
      [16, 27.2, 9.6, 20.8].forEach((a, j) => tl.set(s, { attr: { points: jitter(a) } }, 0.38 + j * 0.035));
      tl.set(s, { attr: { points: pts } }, 0.38 + 4 * 0.035);
    });
    tl.addLabel("shapesIn", 0.65);
    if (field) [[-12, 6], [10, -8], [-7, 4], [5, -3], [-2, 1]].forEach(([x, y], k) => tl.to(field, { x, y, duration: 0.02 }, k ? ">" : "shapesIn")), tl.to(field, { x: 0, y: 0, duration: 0.05 });
    shards.forEach((s, k) => { const [ox, oy] = OFF[k % OFF.length].map((v) => v * unit); tl.to(s, { x: ox, y: oy, ease: cubic, duration: 0.5, delay: 0.05 * Math.random() }, "shapesIn+=.416").to(s, { opacity: 0, ease: "none", duration: 0.33 }, "<"); });
    if (logo) tl.to(logo, { scale: 1.5, ease: expo, duration: 0.5 }, "shapesIn+=.4").to(logo, { opacity: 0, ease: "none", duration: 0.33 }, "<");
    return () => { tl.kill(); gsap.set([el, logo, field, ...shards].filter(Boolean), { clearProps: "all" }); el.style.display = ""; };
  });
})();
