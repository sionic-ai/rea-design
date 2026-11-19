// One note entry — for sections already read, the number box fills and the title changes from a faded color to the text color (.62s). A section counts as read once its heading passes the 60% line of the screen.
(() => {
  const LQ = (window.LQ = window.LQ || { pages: {} });
  LQ.pages.article = (main) => {
    const art = main.querySelector("[data-progress]");
    const secs = art ? [...art.querySelectorAll(".note-section")] : [];
    if (!secs.length) return () => {};
    let raf = 0;
    const paint = () => {
      raf = 0;
      const line = innerHeight * 0.6;
      secs.forEach((s) => s.toggleAttribute("data-read", s.getBoundingClientRect().top < line));
    };
    const ask = () => { raf ||= requestAnimationFrame(paint); };
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
    paint();
    return () => { cancelAnimationFrame(raf); removeEventListener("scroll", ask); removeEventListener("resize", ask); };
  };
})();
