// Teacher interview (original .interview-main · header·footer off). Two-line heading: a green cover covers from the left (.5s, delay .2 easeInOutCubic / .4 easeOutCubic)
// After the text strip turns on, the curtain slides out to the right (.6s easeInOutQuart / delay .1 easeOutQuart) · close button at x60 in .5s easeOutQuart (delay 1.1)
(() => {
  const { TP } = window;
  TP.page("interview", {
    ready(box) {
      const { reduced, ease } = TP;
      const spans = [...box.querySelectorAll(".iv-main h2 span")];
      const close = box.querySelector(".iv-close");
      const tw = [];
      if (reduced) {
        spans.forEach((s) => (s.querySelector("b").style.opacity = 1));
        gsap.set(close, { opacity: 1 });
      } else {
        const curves = [[0.2, ease.inOutCubic, 0, ease.inOutQuart], [0.4, ease.outCubic, 0.1, ease.outQuart]];
        spans.forEach((s, i) => {
          const m = s.querySelector(".iv-mask");
          const [d1, e1, d2, e2] = curves[i] || curves[1];
          tw.push(gsap.to(m, {
            width: "100%", duration: 0.5, delay: d1, ease: e1,
            onComplete: () => {
              s.querySelector("b").style.opacity = 1;
              s.classList.add("is-right");
              tw.push(gsap.to(m, { width: 0, duration: 0.6, delay: d2, ease: e2 }));
            },
          }));
        });
        tw.push(gsap.fromTo(close, { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.5, delay: 1.1, ease: ease.outQuart }));
      }
      const mm = TP.ivCards(box);
      return () => { tw.forEach((t) => t.kill()); mm.revert(); };
    },
  });
})();
