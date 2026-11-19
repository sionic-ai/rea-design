// First page — everything moves from a single Lenis (1.1.3, .lj-main board) progress value (original page_home):
// 0~.5 the side text beside the hero gathers inside 74rem, .15~.4 logo goes 1 → .1 scale, .3~.38 the three fade out. .42~1 the left column enters from above (-105%) and the right column from below (105%),
// On reaching the end the background turns white, page scroll stops and the wheel rotates two columns (twin-column-loop). Stacking 140rem of wheel upward returns to the 45% position.
(() => {
  const LJ = window.LJ;
  if (!LJ) return;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const map = (v, a, b, c, d) => c + ((d - c) * (v - a)) / (b - a);

  LJ.pages.home = {
    mount(root) {
      const main = document.querySelector(".lj-main");
      const lenis = new Lenis({ wrapper: main, content: root, autoResize: false, overscroll: true });
      LJ.lenis = lenis;
      const raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      const ro = new ResizeObserver(() => lenis.resize());
      ro.observe(root);

      const q = (s) => root.querySelector(s);
      const hero = q(".lj-hero"), heroL = q(".lj-hero__side--left"), heroR = q(".lj-hero__side--right"), heroM = q(".lj-hero__main");
      const colL = q(".lj-tiles__col--left"), colR = q(".lj-tiles__col--right"), tiles = q(".lj-tiles");
      const logo = document.querySelector(".lj-header__logo");
      [colL, colR].forEach((c) => { if (c) { c.style.opacity = "1"; c.style.pointerEvents = "auto"; } });
      let heroLive = true;
      // Original tile_block: off-screen blocks are visibility hidden — untouchable until the row slides in
      const tileIO = new IntersectionObserver((es) => es.forEach((en) => (en.target.style.visibility = en.isIntersecting ? "visible" : "hidden")));
      root.querySelectorAll(".lj-tiles__col > .lj-tile").forEach((t) => tileIO.observe(t));

      const frame = () => {
        const p = lenis.progress || 0;
        if (LJ.mobile()) {
          const t = clamp(map(lenis.scroll, 0, innerHeight - LJ.rem() * 7.6, 0, 1), 0, 1);
          hero.style.visibility = t >= 1 ? "hidden" : "visible";
          if (!LJ.menuOpen()) document.body.classList.toggle("is-end", t >= 1);
          return;
        }
        if (heroLive) {
          const t = clamp(map(p, 0, 0.5, 0, -74), -74, 0);
          const n = clamp(map(p, 0.15, 0.4, 1, 0.1), 0, 1);
          const i = clamp(map(p, 0.3, 0.38, 1, 0), 0, 1);
          heroM.style.opacity = i;
          heroM.style.transform = `scale(${n})`;
          heroL.style.transform = `translateX(${Math.abs(t)}rem)`;
          heroL.style.opacity = i;
          heroR.style.transform = `translateX(${t}rem)`;
          heroR.style.opacity = i;
        }
        const e = clamp(map(p, 0.42, 1, 105, 0), 0, 105);
        colL.style.transform = `translateY(-${e}%)`;
        colR.style.transform = `translateY(${e}%)`;
        const end = lenis.limit > 0 && lenis.scroll >= lenis.limit;
        document.body.classList.toggle("is-end", end);
        logo?.classList.toggle("is-light", end);
        if (end) lenis.stop(); else lenis.start();
      };
      gsap.ticker.add(frame);

      const exit = () => {
        lenis.start();
        lenis.scrollTo(lenis.dimensions.scrollHeight - lenis.dimensions.scrollHeight * 0.55, { force: true });
      };
      tiles.addEventListener("fx:twin-exit", exit);

      return {
        // Only when arriving from another page — on first open the loader puts the logo in place
        animateIn() {
          if (LJ.first || LJ.mobile() || LJ.reduce) return;
          gsap.timeline({ defaults: { duration: 1.2, ease: "power4.inOut" }, onStart: () => (heroLive = false), onComplete: () => (heroLive = true) })
            .fromTo(heroL, { x: "70rem", opacity: 0 }, { x: 0, opacity: 1 })
            .fromTo(heroR, { x: "-70rem", opacity: 0 }, { x: 0, opacity: 1 }, "<")
            .fromTo(heroM, { scale: 0.1, opacity: 0 }, { scale: 1, opacity: 1 }, "<");
        },
        unmount() {
          gsap.ticker.remove(frame);
          gsap.ticker.remove(raf);
          tiles.removeEventListener("fx:twin-exit", exit);
          tileIO.disconnect();
          ro.disconnect();
          lenis.destroy();
          if (LJ.lenis === lenis) LJ.lenis = null;
        },
      };
    },
  };
})();
