// Home — when the loader lifts, the stage curtain lifts in 1s, and once past the middle of the music video section the stage leaves only the globe (original #musicVideo start 50% 50%).
// When the video window is fully open, the title and play mark turn on with .4s power3.out
(() => {
  const stage = document.getElementById("stage");
  const mv = document.getElementById("musicVideo");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const shows = mv ? [mv.querySelector(".ks-mv__play"), mv.querySelector(".ks-mv__info")] : [];
  const show = (on) => gsap.to(shows, { autoAlpha: on ? 1 : 0, duration: 0.4, ease: "power3.out", overwrite: true });
  if (reduce) gsap.set(shows, { autoAlpha: 1 });
  mv?.addEventListener("fx:full", () => show(true));
  mv?.addEventListener("fx:unfull", () => show(false));

  if (!window.ScrollTrigger || !stage || !mv) return;
  gsap.registerPlugin(ScrollTrigger);
  const send = (name) => stage.dispatchEvent(new CustomEvent(name));
  ScrollTrigger.create({
    trigger: mv, start: "50% 50%", end: "bottom bottom",
    toggleClass: { targets: mv, className: "is-active" },
    onEnter: () => send("fx:globe"), onLeave: () => send("fx:globe"),
    onEnterBack: () => send("fx:all"), onLeaveBack: () => send("fx:all"),
  });
})();
