/* About — camera path through a room · giant sun number flow · light-ray sway · card pile placement */
(() => {
  // Original entrance door loader length (from first paint until the screen settles, ms measured by motion-probe)
  Em.gateDur = 3133;
  const reduce = Em.reduce;
  const mm = gsap.matchMedia();
  const story = document.querySelector(".ab-story");
  // Original in-room camera path: five points (camera position · look-at point, original world coordinates) joined by centripetal Catmull-Rom, with the gaze 30 ahead toward the look-at point,
  // The last 20% of the section moves to the window-side end spot. The original building sat at (100, -5.5, 70) at 3x, so convert back to room model coordinates and place it in this build’s room (×0.91).
  const T = window.exports, at = window.EmWorld?.roomAt || [0, 0, 58], K = window.EmWorld?.roomK || 0.91, RC = window.EmWorld?.roomC || [-0.53, -3.04];
  const toRoom = (w) => { const x = (w[0] - 100) / 3, y = (w[1] + 5.5) / 3, z = (w[2] - 70) / 3; return new T.Vector3(at[0] + (x - RC[0]) * K, at[1] + y * K, at[2] + (z - RC[1]) * K); };
  const WAY = [
    [[111.95, 0.48, 47.93], [117.22, -1.25, 71.25]],
    [[107.98, -0.23, 67.78], [123.02, -1.92, 74.63]],
    [[102.79, 4.05, 62.06], [91.21, 1.26, 100.46]],
    [[108.23, 1.35, 53.43], [89.31, 1.76, 51.73]],
    [[90.59, 1.64, 54.75], [89.83, 1.77, 51.62]],
  ], OUTRO = [[86.1, 2.4, 36.3], [85.4, 2.5, 33.4]];
  const ahead = ([c, l]) => { const a = new T.Vector3(...c), d = new T.Vector3(...l).sub(a).normalize().multiplyScalar(30); return toRoom(a.add(d).toArray()); };
  const path = T?.CatmullRomCurve3 && new T.CatmullRomCurve3(WAY.map((w) => toRoom(w[0])), false, "centripetal");
  const lookPath = T?.CatmullRomCurve3 && new T.CatmullRomCurve3(WAY.map(ahead), false, "centripetal");
  const endCam = toRoom(OUTRO[0]), endLook = ahead(OUTRO), pc = new (T?.Vector3 || Object)(), pl = new (T?.Vector3 || Object)();
  const far = { shape: "mark", at: [0, 9, -27], size: 1.35 };
  const room = (q) => {
    const r = Math.min(q, 0.8) / 0.8, tail = Math.max(0, (q - 0.8) / 0.2);
    path.getPoint(r, pc); lookPath.getPoint(r, pl);
    if (tail > 0) { pc.lerp(endCam, tail); pl.lerp(endLook, tail); }
    return { cam: pc.toArray(), look: pl.toArray(), at: far.at, shape: far.shape, size: far.size };
  };
  Em.story(story, [
    { sel: ".a1", from: 0, to: 0.1 },
    { sel: ".a2", from: 0.1, to: 0.3 },
    { sel: ".a3", from: 0.3, to: 0.5 },
    { sel: ".a4", from: 0.5, to: 0.7 },
    { sel: ".a5", from: 0.7, to: 1.01 },
  ], path && room);
  if (path && window.EmWorld?.ready) EmWorld.path(room, 50);
  Em.veil(story, "bottom bottom+=1", "bottom top+=10%", 0, 1);

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Title lines rising up
    document.querySelectorAll(".hib__title, .fd__title, .ap__title").forEach((t) =>
      t.querySelectorAll("[data-split]").forEach((el) =>
        gsap.fromTo(Em.lines(el), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 85%" } }),
      ),
    );
    // Year numbers: while pinned, the row moves left
    const row = document.querySelector(".est__row");
    gsap.fromTo(row, { x: 0 }, { x: () => -(row.scrollWidth - innerWidth * 0.2), ease: "none", scrollTrigger: { trigger: ".est", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
    // Light shafts: sway slowly sideways
    gsap.to(".ns__rays", { xPercent: 4, duration: 6, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.fromTo(Em.lines(document.querySelector(".ns__quote")), { yPercent: 105 }, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.08, scrollTrigger: { trigger: ".ns", start: "top 60%" } });
    // Card stack: tilted stacked cards rise from below one by one and settle into place
    const cards = gsap.utils.toArray(".fd__card");
    const rot = [-8, 5, -3, 7];
    const tl = gsap.timeline({ scrollTrigger: { trigger: ".fd__stage", start: "top center", end: "bottom bottom-=28%", scrub: true } });
    cards.forEach((c, i) => tl.fromTo(c, { y: () => innerHeight * 0.9, rotation: rot[i] * 2, scale: 0.9 }, { y: 0, rotation: rot[i], scale: 1, duration: 1, ease: "power2.out" }, i * 0.6));
  });
  if (reduce) gsap.set(".fd__card", { rotation: (i) => [-8, 5, -3, 7][i] });
})();
