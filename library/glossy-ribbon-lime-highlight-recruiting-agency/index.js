// First page: loader → Hero start, photo slide (original Swiper creative effect values), greeting handwriting, magazine white curtain scrub, two rows of client logos flowing.
// Original values: photos gather 1s after the loader · Hero at 4.2s · slide interval 1.2s, gap 3s · next section +20%,+20% ×.8 opacity .5 · previous section −120% z −500 · logo 40px per second.
(() => {
  const { reduced } = window.PC;

  // ── Loader ──
  const loader = document.querySelector(".ix-loader");
  loader.querySelector(".ix-loader__logo").innerHTML = PC.icons.mark;
  const hero = document.querySelector(".ix-mv");
  const title = hero.querySelector(".pc-mark");
  const startHero = () => {
    document.body.classList.remove("is-loading");
    hero.classList.add("is-on");
    title.classList.add("on");
  };
  const KEY = "pc-first-load";
  addEventListener("load", () => {
    if (reduced) { loader.classList.add("is-quick"); startHero(); return; }
    if (!sessionStorage.getItem(KEY)) {
      setTimeout(() => loader.classList.add("is-loaded"), 1000);
      setTimeout(startHero, 4200);
      sessionStorage.setItem(KEY, "1");
    } else {
      loader.classList.add("is-quick");
      startHero();
    }
  });

  PC.creativeSlider(document.querySelector(".ix-slides"));

  // ── Greeting handwriting: rises from top 85% over 1s power3.out as it is written ──
  const hi = document.querySelector(".ix-mag__hi");
  if (reduced) PC.drawDoodle(hi);
  else gsap.fromTo(hi, { opacity: 0, y: 40 }, {
    opacity: 1, y: 0, duration: 1, ease: "power3.out",
    scrollTrigger: { trigger: hi, start: "top 85%", toggleActions: "play none none reverse", onEnter: () => PC.drawDoodle(hi), onEnterBack: () => PC.drawDoodle(hi) },
  });

  // ── Magazine: the white curtain lifts to reveal a blue texture and the title turns white ──
  const magIn = document.querySelector(".ix-mag__in");
  const magTexts = [document.querySelector(".ix-mag__title"), document.querySelector(".ix-mag__hand")];
  // Color only pushes the mix ratio between skin variables (--ix-veil, --ix-ink) — the same path as the original’s straight rgb interpolation of #fff → transparent and blue → white
  if (reduced) {
    gsap.set(magIn, { "--ix-veil": 0 });
    gsap.set(magTexts, { "--ix-ink": 1 });
  } else {
    gsap.set(magIn, { "--ix-veil": 1 });
    gsap.set(magTexts, { "--ix-ink": 0 });
    gsap.timeline({ scrollTrigger: { trigger: magIn, start: "top center+=100", end: "top center-=200", scrub: 1 } })
      .to(magIn, { "--ix-veil": 0 })
      .to(magTexts[0], { "--ix-ink": 1 })
      .to(magTexts[1], { "--ix-ink": 1 }, "<");
  }

  // ── Client logos, two rows ──
  document.querySelectorAll(".ix-cl__row").forEach((row, r) => {
    const list = row.querySelector(".ix-cl__list");
    const one = Array.from({ length: 9 }, (_, i) => `<span class="wf-logo">LOGO ${String(r * 9 + i + 1).padStart(2, "0")}</span>`).join("");
    list.innerHTML = one + one;
    if (reduced) return;
    addEventListener("load", () => {
      const half = list.scrollWidth / 2;
      const left = row.dataset.dir === "left";
      gsap.fromTo(list, { x: left ? 0 : -half }, { x: left ? -half : 0, duration: half / 40, ease: "none", repeat: -1 });
    });
  });
})();
