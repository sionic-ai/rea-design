// First page — when the opening starts lifting (fx:open) turn on the body, and the hero photo starts advancing every 5 seconds, while
// Sentence, name, text and language sharpen in turn at .6, taking 1s with .2s steps (.5s late). When finished the notice bar turns on
(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false;
  const open = () => {
    if (opened) return;
    opened = true;
    root.classList.add("e-shown");
    document.querySelector(".e-fv__slider")?.dispatchEvent(new CustomEvent("fx:play"));
    if (reduce) { root.classList.add("is-fv-done"); return; }
    gsap.from(".e-fv-in", { duration: 1, opacity: 0.6, stagger: 0.2, delay: 0.5, onComplete: () => root.classList.add("is-fv-done") });
  };
  document.addEventListener("fx:open", open);
  document.addEventListener("fx:start", () => root.classList.add("e-shown"));
  // When the opening scrolls the window to the top, Lenis is aligned too
  window.addEventListener("fx:top", () => window.eLenis?.scrollTo(0, { immediate: true }));

  // When the top edge of the About section touches the top of the screen, the header language marker lights up and the notice bar steps back
  const about = document.querySelector(".e-about");
  const past = (on) => { root.classList.toggle("is-lang", on); root.classList.toggle("is-past-about", on); };
  if (about) ScrollTrigger.create({ trigger: about, start: "top top", onEnter: () => past(true), onLeaveBack: () => past(false) });

  const banner = document.querySelector(".e-banner");
  banner?.querySelector(".e-banner__close")?.addEventListener("click", () => banner.classList.add("is-hidden"));
})();
