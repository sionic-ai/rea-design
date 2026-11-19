// Original Zc() — list rows fold only below 950px. Folded height 16vw ↔ expanded auto, .5s power1.inOut
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const items = [...document.querySelectorAll(".jsAccWrapper")];
  const apply = (on) => items.forEach((li) => {
    const head = li.querySelector(".jsAccHeader");
    if (!head) return;
    if (on) {
      if (!li.dataset.initialized) { gsap.set(li, { height: "16vw", overflow: "hidden" }); li.dataset.initialized = "true"; }
      head.onclick = () => {
        const was = head.classList.contains("opened");
        head.classList.toggle("opened", !was);
        gsap.to(li, { height: was ? "16vw" : "auto", duration: reduce ? 0 : 0.5, ease: "power1.inOut" });
      };
    } else {
      gsap.set(li, { clearProps: "all" });
      delete li.dataset.initialized;
      head.classList.remove("opened");
      head.onclick = null;
    }
  });
  const mq = matchMedia("(max-width: 950px)");
  const fit = () => apply(mq.matches);
  mq.addEventListener("change", fit);
  fit();
})();
