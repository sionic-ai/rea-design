// About — adds one more set of window rows and flows a full loop in 20 seconds (phone 15), the rest is the shared start (curtain lifts → title shuffle → cover bars · table on scroll)
(() => {
  const ET = window.ET;
  const wrap = document.querySelector(".ap-plane__wrapper");
  const w = wrap.getBoundingClientRect().width;
  wrap.append(...[...wrap.children].map((li) => li.cloneNode(true)));
  if (!ET.reduce) {
    const loop = () => gsap.fromTo(wrap, { x: 0 }, { x: -w, duration: ET.mode === "pc" ? 20 : 15, ease: "none", onComplete: loop });
    loop();
  }
  ET.startSub();
})();
