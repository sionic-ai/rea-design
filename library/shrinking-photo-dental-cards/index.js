// Home — logo four letters rise (after the intro), photo panel shrinks and photos move up, greeting decorative word drops down, about/doctor slides (swiper), scroll-down letter wave.
// Original values: logo letters y 20%→0 circ.out 1s · opacity .3s none · delays [0, .0333, .1333, .3] — plays once when it’s on the first screen and the intro ends
//            Photo panel = Panel width · height (screen − 8px frame) → (screen − 20 cells frame), corner 24 → 16, sine.out, duration 8/10 · photo y −150 (phone −100) duration 10 · scrub true
//            decorative word y 50% · scrub 1 · top h → 150% top
//            Intro slide speed 1500 · auto 1500 · gap 4 · rewind · curve cubic-bezier(.65,0,.35,1) / pseudo slide speed 1500 · auto 1500 · button slide 600·300ms
(() => {
  YD.page("home", (box) => {
    const scroll = box.querySelector(".hm-fv__scroll__text");
    if (scroll) {
      const delays = [-4, -3.9978, -3.9912, -3.9802, -3.9648, -3.945, -3.9208, -3.8922, -3.8592, -3.8218, -3.78];
      scroll.innerHTML = [..."SCROLL DOWN"].map((c, i) => `<span style="animation-delay:${delays[i]}s">${c}</span>`).join("");
    }
    const h = () => innerHeight;
    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)" }, () => {
      // Four-letter logo
      const letters = box.querySelectorAll(".hm-fv__split");
      const tl = gsap.timeline({ paused: true });
      const delays = [0, 0.033333, 0.133333, 0.3];
      letters.forEach((l, i) => {
        tl.fromTo(l, { y: "20%" }, { y: "0%", duration: 1, delay: delays[i], ease: "circ.out" }, "start");
        tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.3, delay: delays[i], ease: "none" }, "start");
      });
      let inView = false, ready = false, played = false;
      const play = () => { if (!played && inView && ready) { played = true; tl.play(); } };
      ScrollTrigger.create({ trigger: box.querySelector(".hm-fv__logo-wrap"), start: () => `top ${h()}`, end: "bottom top", onToggle: (s) => { inView = s.isActive; play(); } });
      YD.introDone.then(() => { ready = true; play(); });

      // Photo panel
      const mv = box.querySelector(".hm-mv");
      const cont = mv.querySelector(".hm-mv__container"), base = mv.querySelector(".hm-mv__base");
      const mask = mv.querySelector(".hm-mv__mask"), par = mv.querySelector(".hm-mv__par");
      const pc = YD.isPC();
      const mtl = gsap.timeline({ scrollTrigger: { trigger: mv, scrub: true, invalidateOnRefresh: true, start: () => { const t = mv.getBoundingClientRect().top + scrollY; return `top ${t < h() ? t : h()}`; }, end: "bottom top" } });
      mtl.fromTo(mask, { width: () => cont.clientWidth, height: () => cont.scrollHeight, borderRadius: pc ? 24 : 16 }, { width: () => base.scrollWidth, height: () => base.scrollHeight, borderRadius: pc ? 16 : 12, duration: 8, ease: "sine.out" }, "start");
      mtl.to(par, { y: pc ? -150 : -100, duration: 10, ease: "none" }, "start");

      // Greeting decorative words
      const deco = box.querySelector(".hm-msg__deco");
      gsap.to(deco.querySelectorAll(".w > span"), { y: "50%", ease: "none", scrollTrigger: { trigger: deco, scrub: 1, start: () => `top ${h()}`, end: "150% top" } });
    });

    // Paging — the control pill’s prev and next each have their own length, the center pauses or plays autoplay
    const sw = [];
    const wire = (sel, ctrlSel, opts, stepMs) => {
      const el = box.querySelector(sel);
      if (!el || !window.Swiper) return;
      const s = new Swiper(el, { slidesPerView: "auto", watchSlidesProgress: true, speed: 1500, autoplay: YD.reduced ? false : { delay: 1500, disableOnInteraction: false }, ...opts });
      sw.push(s);
      const ctrl = box.querySelector(ctrlSel);
      if (!ctrl) return;
      const pp = ctrl.querySelector(".pp");
      const sync = () => pp.classList.toggle("is-autoplay", !!(s.autoplay && s.autoplay.running));
      s.on("autoplayStart", sync); s.on("autoplayStop", sync); sync();
      ctrl.querySelector(".prev").addEventListener("click", () => s.slidePrev(stepMs));
      ctrl.querySelector(".next").addEventListener("click", () => s.slideNext(stepMs));
      pp.addEventListener("click", () => (s.autoplay.running ? s.autoplay.stop() : s.autoplay.start()));
    };
    wire(".hm-about__swiper", '[data-ctrl="about"]', { spaceBetween: 4, rewind: true }, 600);
    wire(".hm-team__swiper", '[data-ctrl="team"]', { rewind: true }, 300);
    return () => { mm.revert(); sw.forEach((s) => s.destroy()); };
  });
})();
