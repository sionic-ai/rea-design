/* Contact — original values: smooth scroll smooth 1, two heading pieces use symbols 「$%~;><=Scrambles through *@*#+? and settles into the text (1.6s · 2.5s, after .1s, speed 1.5).
   Pressing send makes the button text vanish and a ring that turns one full circle in .7s appears (sends nowhere) */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (innerWidth > 900 && !reduce && window.ScrollSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1 });
  }
  if (window.ScrambleTextPlugin && !reduce) {
    gsap.registerPlugin(ScrambleTextPlugin);
    [[".bp-ani-1", 1.6], [".bp-ani-2", 2.5]].forEach(([sel, d]) => {
      const el = document.querySelector(sel); if (!el) return;
      gsap.to(el, { duration: d, delay: 0.1, scrambleText: { text: el.textContent, chars: "$%~;><=*@*#+?", tweenLength: false, speed: 1.5 } });
    });
  }
  const form = document.querySelector(".bp-contact__form"), bt = form?.querySelector(".bp-submit");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (bt.classList.contains("is-loading")) return;
    bt.classList.add("is-loading");
    setTimeout(() => { bt.classList.remove("is-loading"); form.reset(); }, 1400);
  });
})();
