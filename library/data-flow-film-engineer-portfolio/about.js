// About — when the profile code group is 40% visible, values decode in sequence at 140ms steps over 650ms, and when done (last + 120ms) the status dot fills and shows ”Verified”.
(() => {
  const LQ = (window.LQ = window.LQ || { pages: {} });
  const STEP = 140, DUR = 650;
  LQ.pages.about = (main) => {
    const sec = main.querySelector(".identify-section");
    if (!sec) return () => {};
    const text = sec.querySelector("[data-identify-text]");
    const done = () => { sec.setAttribute("data-identified", ""); if (text) text.textContent = "Confirmed"; };
    if (LQ.still() || typeof IntersectionObserver !== "function") { done(); return () => {}; }
    const undo = [];
    let timer = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return;
      io.disconnect();
      const vals = sec.querySelectorAll(".identify-value");
      vals.forEach((v, i) => undo.push(LQ.scramble(v, i * STEP, DUR)));
      timer = setTimeout(done, (vals.length - 1) * STEP + DUR + 120);
    }, { threshold: 0.4 });
    io.observe(sec);
    return () => { io.disconnect(); clearTimeout(timer); undo.forEach((f) => f()); };
  };
})();
