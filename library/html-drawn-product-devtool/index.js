// Home page scene: when the About sentence fragment changes (fx:pick of phrase-cycle-mark), the image inside the card of the same order spins once (2.4s).
// Original values — curve cubic-bezier(.645,.045,.355,1), first card tag shake x [0,-3,3,-3,3,-2,2,0,0,0,-3,3,-3,3,-2,2,0],
// Third card code y [-8,-80,-80,-8] at times [0,.3,.7,1] (a straight line in the middle segment).
(() => {
  const box = document.querySelector('[data-slot="statement-cards"]');
  if (!box || !window.gsap) return;
  if (window.CustomEase) gsap.registerPlugin(CustomEase);
  const ease = window.CustomEase ? CustomEase.create("if-card", "0.645,0.045,0.355,1") : "sine.inOut";
  const tag = box.querySelector(".fa-tag");
  const code = box.querySelector(".fa-code");
  const SHAKE = [0, -3, 3, -3, 3, -2, 2, 0, 0, 0, -3, 3, -3, 3, -2, 2, 0];
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.set(code, { y: -8 });
    const play = (i) => {
      gsap.killTweensOf([tag, code]);
      gsap.set(tag, { x: 0 });
      if (i === 0) gsap.to(tag, { keyframes: { x: SHAKE, easeEach: "none" }, duration: 2.4, ease });
      if (i === 2) gsap.timeline()
        .to(code, { y: -80, duration: 2.4 * 0.3, ease })
        .to(code, { y: -80, duration: 2.4 * 0.4, ease: "none" })
        .to(code, { y: -8, duration: 2.4 * 0.3, ease });
      else gsap.to(code, { y: -8, duration: 0.3, ease: "power1.out" });
    };
    const on = (e) => play(e.detail.index);
    box.addEventListener("fx:pick", on);
    play(0);
    return () => box.removeEventListener("fx:pick", on);
  });
})();
