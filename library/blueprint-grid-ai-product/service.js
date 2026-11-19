HR.page("service", (box) => {
  const offs = [];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const pre = [...box.querySelectorAll('[data-hr-in="load"]')].map((b) => HR.prep(b));
    // Chat window — the question appears and the answer is typed out one character at a time
    const me = box.querySelector(".hs-chat__msg.is-me"), ai = box.querySelector(".hs-chat__msg.is-ai span");
    const full = ai ? ai.textContent : "";
    gsap.set(me, { autoAlpha: 0, y: 1.6 * HR.rem() });
    ai && (ai.textContent = "");
    const chat = gsap.timeline({ paused: true, delay: 0.8 })
      .to(me, { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3" })
      .to({ n: 0 }, { n: full.length, duration: full.length * 0.035, ease: "none", onUpdate: function () { ai.textContent = full.slice(0, Math.round(this.targets()[0].n)); } }, "+=0.5");
    const go = () => gsap.delayedCall(0.3, () => { pre.forEach((f) => f()); chat.play(); });
    document.querySelector(".hr-loader.is-done") && HR.booted ? go() : HR.loaderDone.then(go);

    // Feature tabs — while a panel’s center passes the screen center, its tab turns on
    const tabs = box.querySelectorAll(".hs-tab");
    box.querySelectorAll(".hs-panel").forEach((p, i) => ScrollTrigger.create({ trigger: p, start: "top 50%", end: "bottom 50%",
      onToggle: (st) => st.isActive && tabs.forEach((t, k) => t.classList.toggle("is-active", k === i)) }));
  });
  HR.booted = true;
  box.querySelectorAll(".hs-tab").forEach((t) => t.addEventListener("click", () => {
    const p = box.querySelector(`.hs-panel[data-i="${t.dataset.i}"]`);
    p && HR.lenis.scrollTo(p, { offset: -innerHeight * 0.1 });
  }));

  // Logo row — same settings as the original swiper
  const sw = box.querySelector(".hs-logos");
  if (sw && window.Swiper) {
    const s = new Swiper(sw, { slidesPerView: "auto", spaceBetween: 0, speed: 600, loop: true, slidesPerGroup: 3,
      autoplay: HR.reduce ? false : { delay: 3000, disableOnInteraction: false },
      navigation: { nextEl: box.querySelector(".hs-hero__logos .is-next"), prevEl: box.querySelector(".hs-hero__logos .is-prev") } });
    offs.push(() => s.destroy(true, true));
  }

  // FAQ
  const items = box.querySelectorAll(".hs-faq__item");
  items.forEach((it) => it.querySelector(".hs-faq__q").addEventListener("click", () => {
    const on = !it.classList.contains("is-active");
    items.forEach((x) => x.classList.remove("is-active"));
    it.classList.toggle("is-active", on);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }));

  return () => { offs.forEach((f) => f()); mm.revert(); };
});
