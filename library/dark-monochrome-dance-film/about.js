/* About — title letters float up at random, and hovering a letter fades it to .25 over .35s and back over .35s. Background is a pixel-dot cloud (video 1) */
(() => {
  const BB = (window.BB = window.BB || {});
  BB.pages = BB.pages || {};
  const $ = (s, r = document) => r.querySelector(s);
  let scroller = null, hoverChars = [];
  const onChar = (e) => {
    const t = e.currentTarget;
    if (t._busy || BB.reduce) return;
    t._busy = true;
    gsap.to(t, { opacity: 0.25, duration: 0.35, ease: "power1.in" });
    gsap.to(t, { opacity: 1, duration: 0.35, ease: "power1.out", delay: 0.35, onComplete: () => { t._busy = false; } });
  };
  BB.pages.about = {
    before() {
      BB.vars.currentIndex = 1;
      BB.anim.split(".about-txt-wrap .ttl", "words,chars");
      BB.anim.split(".about-description-wrap p", "words");
      gsap.set([".detail-back-to-home", ".detail-header-ttl .txt .shadow", ".about-txt-wrap .ttl .chars", ".about-description-wrap"], { autoAlpha: 0 });
    },
    init() {
      const D = BB.D, root = $(".about");
      BB.anim.detailsTitleIn();
      BB.anim.randomFadeIn(root, ".about-txt-wrap .ttl .chars", 0.5);
      gsap.set(".about-txt-wrap .ttl", { autoAlpha: 1 });
      gsap.fromTo(".detail-back-to-home", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1) });
      gsap.fromTo(".about-description-wrap", { autoAlpha: 0 }, { autoAlpha: 1, duration: D(1), delay: D(0.8) });
      hoverChars = Array.from(document.querySelectorAll(".about-txt-wrap .ttl .chars"));
      hoverChars.forEach((c) => c.addEventListener("mouseenter", onChar));
      scroller = new IScroll($(".about-description-wrap .txt"), { snap: false, useTransition: false, momentum: false, bounce: false, mouseWheel: true, scrollbars: "custom" });
      BB.objs.bg.showPoints(false, 1, 0.1);
    },
    out(old) {
      const D = BB.D, A = BB.anim;
      A.randomFadeOut(old, ".about-txt-wrap .ttl .chars", 0);
      A.randomFadeOut(old, ".about-description-wrap .words", 0);
      A.blurFadeOut(old.querySelector(".detail-back-to-home"), true, 0);
      A.detailsTitleOut(0);
      gsap.to(old.querySelector(".about-description-wrap"), { autoAlpha: 0, duration: D(0.65), delay: D(0.35), ease: "none" });
      gsap.fromTo(".g-center-line", { transformOrigin: "100% 50%" }, { scaleX: 0, duration: D(1), ease: "quint.inOut" });
      BB.objs.bg.hidePoints(false, 1, 0);
    },
    destroy() {
      hoverChars.forEach((c) => c.removeEventListener("mouseenter", onChar));
      hoverChars = [];
      scroller && scroller.destroy();
      scroller = null;
    },
  };
})();
