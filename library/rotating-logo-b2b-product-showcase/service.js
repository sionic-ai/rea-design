// Industry page — logo wall: as many logos are plugged in front as are visible, the rest wait in a queue. After a 1.5s rest it picks one cell and the old logo exits upward (-50%) and
// The new logo rises from below (50%) .1s late (.9s expo.inOut). The order of picking cells is shuffled and reused. Pauses when off-screen or in a hidden tab.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-logo-wall]").forEach((root) => {
    const items = Array.from(root.querySelectorAll(".zn-lwall__item"));
    const originals = items.map((it) => it.querySelector(".zn-lwall__target")).filter(Boolean);
    const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const shown = (el) => getComputedStyle(el).display !== "none";
    let visible = [], pool = [], order = [], k = 0, tl;
    function setup() {
      tl?.kill();
      visible = items.filter(shown);
      order = shuffle(visible.map((_, i) => i));
      k = 0;
      items.forEach((it) => it.querySelectorAll(".zn-lwall__target").forEach((t) => t.remove()));
      const clones = originals.map((n) => n.cloneNode(true));
      pool = clones.slice(0, visible.length).concat(shuffle(clones.slice(visible.length)));
      visible.forEach((it) => it.querySelector(".zn-lwall__logo").appendChild(pool.shift()));
      if (reduce) return;
      tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });
      tl.call(swap);
    }
    function swap() {
      if (items.filter(shown).length !== visible.length) return setup();
      if (!pool.length) return;
      const box = visible[order[k++ % order.length]].querySelector(".zn-lwall__logo");
      if (box.querySelectorAll(".zn-lwall__target").length > 1) return;
      const cur = box.querySelector(".zn-lwall__target"), inc = pool.shift();
      gsap.set(inc, { yPercent: 50, autoAlpha: 0 });
      box.appendChild(inc);
      if (cur) gsap.to(cur, { yPercent: -50, autoAlpha: 0, duration: 0.9, ease: "expo.inOut", onComplete: () => { cur.remove(); pool.push(cur); } });
      gsap.to(inc, { yPercent: 0, autoAlpha: 1, duration: 0.9, delay: 0.1, ease: "expo.inOut" });
    }
    setup();
    if (reduce) return;
    ScrollTrigger.create({ trigger: root, start: "top bottom", end: "bottom top", onEnter: () => tl.play(), onLeave: () => tl.pause(), onEnterBack: () => tl.play(), onLeaveBack: () => tl.pause() });
    document.addEventListener("visibilitychange", () => (document.hidden ? tl.pause() : tl.play()));
  });
})();
