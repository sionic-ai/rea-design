// About · work detail: title letters all rise from below at once (1s power4.out), and subheads · images enter at the 95% point of the screen.
// The next-case stage at the end enters like the list page (once only). The original waits 200ms after entering before it starts.
(() => {
  gsap.registerPlugin(ScrollTrigger);
  const START = "top 95%";
  MS.view("single", (container) => {
    const root = container.matches(".single") ? container : container.querySelector(".single");
    if (!root) return null;

    const title = root.querySelector(".single-head__title");
    if (title && !title.querySelector(".char")) {
      const text = title.textContent.trim();
      title.setAttribute("aria-label", text);
      title.innerHTML = [...text].map((c) => (c === " " ? " " : `<span class="char" aria-hidden="true"><span class="char__inner">${c}</span></span>`)).join("");
    }

    const next = root.querySelector(".next");
    const s = next && MS.stage.make(next.querySelector(".ms-stage__main"), next.querySelector(".ms-stage__bg"));
    const cursor = s ? MS.stalker(next.querySelector("[data-stalker]"), [...next.querySelectorAll("a.ms-stage__item")]) : null;
    if (s) MS.stage.prime(s);
    const imgs = [...root.querySelectorAll(".group__body .image")];
    let gone = false;

    const mm = gsap.matchMedia();
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      if (ctx.conditions.still) {
        if (s) MS.fontsReady().then(() => { if (!gone) { MS.stage.layout(s, true); MS.stage.enter(s).progress(1); } });
        return;
      }
      gsap.set(imgs, { opacity: 0 });
      // Motion created after 200ms sits outside matchMedia, so it is tracked and removed separately
      let late = null;
      const t = setTimeout(() => {
        late = gsap.context(() => {
          const chars = root.querySelectorAll(".single-head__title .char__inner");
          gsap.to(chars, { opacity: 1, duration: 0.1 });
          gsap.fromTo(chars, { yPercent: 100 }, { yPercent: 0, duration: 1, ease: "power4.out" });
          root.querySelectorAll(".group__title span").forEach((el) =>
            gsap.to(el, { y: "0%", duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: START } }));
          imgs.forEach((el) => gsap.to(el, { opacity: 1, duration: 1, ease: "power4.out", scrollTrigger: { trigger: el, start: START } }));
        });
        if (s) MS.fontsReady().then(() => {
          if (gone) return;
          late.add(() => {
            MS.stage.layout(s, false);
            ScrollTrigger.create({ trigger: next, start: START, once: true, onEnter: () => MS.stage.enter(s) });
          });
        });
      }, 200);
      return () => { clearTimeout(t); if (late) late.revert(); };
    });

    return () => {
      gone = true;
      mm.revert();
      if (cursor) cursor.destroy();
      if (s) MS.stage.kill(s);
    };
  });
})();
