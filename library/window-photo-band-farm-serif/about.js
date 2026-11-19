// Farm About: the map rises to y 32 at 40% of the screen, and the greeting from the owner rises from below as one block on wide screens and line by line on narrow ones (original about-us.js)
(() => {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    KN.fadeMove([...document.querySelectorAll(".fade-map")], "top 40%", 32);
    const groups = [...document.querySelectorAll(".js-message")];
    const narrow = matchMedia("(max-width: 768px)").matches;
    KN.fadeMove(narrow ? groups.flatMap((g) => (g.children.length ? [...g.children] : [g])) : groups, "top 70%", 32);
  });
})();
