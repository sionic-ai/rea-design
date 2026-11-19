(() => {
  // Opening where chunk pieces covering the hero are pushed outward and remain as the screen border.
  // When the cover lifts over .8s, mark · shade vanish in 1s and base in .5s, and each piece is pushed from data-from → data-to over 2s.
  // Once all pieces stand, rise turns on at 1.2s and fires fx:done
  kfFx.register("blob-frame-open", (el, { options, reduce }) => {
    const pieces = [...el.querySelectorAll('[data-fx-part="piece"]')];
    if (!pieces.length) return;
    const pick = (role) => [...el.querySelectorAll(`[data-fx-part="${role}"]`)];
    const cover = pick("cover"), mark = pick("mark"), shade = pick("shade"), base = pick("base"), rise = pick("rise");
    const narrow = options.narrow || "(max-width: 1023px)";
    const dur = +(options.dur ?? 2), delay = +(options.delay ?? 0.2), lift = +(options.lift ?? 0.8);
    const rd = +(options.rise ?? 1.2), wait = +(options.wait ?? 0);
    const ease = kfFx.ease(options.ease || "0.42,0,0.58,1", "sine.inOut");
    const at = (p, key) => {
      const sp = matchMedia(narrow).matches && p.dataset[key + "Sp"];
      return String(sp || p.dataset[key] || "0 0").trim().split(/\s+/);
    };
    const done = () => el.dispatchEvent(new CustomEvent("fx:done", { bubbles: true }));
    const finish = () => {
      gsap.set([...cover, ...mark, ...shade, ...base], { opacity: 0 });
      pieces.forEach((p) => { const [x, y] = at(p, "to"); gsap.set(p, { x, y }); });
      if (rise.length) gsap.set(rise, { opacity: 1 });
      done();
    };
    if (reduce) { finish(); return; }
    pieces.forEach((p) => { const [x, y] = at(p, "from"); gsap.set(p, { x, y }); });
    if (rise.length) gsap.set(rise, { opacity: 0 });
    const tl = gsap.timeline({ delay: wait });
    if (cover.length) tl.to(cover, { opacity: 0, duration: lift });
    tl.addLabel("open");
    if (mark.length || shade.length) tl.to([...mark, ...shade], { opacity: 0, duration: 1, ease }, "open");
    if (base.length) tl.to(base, { opacity: 0, duration: 0.5, ease }, "open");
    pieces.forEach((p) => {
      const [x, y] = at(p, "to");
      const d = p.dataset.dur != null ? +p.dataset.dur : dur, dl = p.dataset.delay != null ? +p.dataset.delay : delay;
      tl.to(p, { x, y, duration: d, ease, force3D: true }, `open+=${dl}`);
    });
    if (rise.length) tl.to(rise, { opacity: 1, duration: rd, ease });
    tl.call(done);
    return () => { tl.kill(); gsap.set([...pieces, ...cover, ...mark, ...shade, ...base, ...rise], { clearProps: "transform,opacity" }); };
  });
})();
