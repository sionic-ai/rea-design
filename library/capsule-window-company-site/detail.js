// Interview detail: question and answer bubbles float up from below as they enter the screen (approximates the original bubble entrance .8s ease-0).
uSite.scene(({ reduce }) => {
  if (reduce) return;
  document.querySelectorAll(".iv-q, .iv-a").forEach((el) => {
    gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
  });
});
