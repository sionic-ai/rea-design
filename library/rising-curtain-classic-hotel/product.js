// Product row photo slider — stacked photos swap overlapping in .5s power2.out, and the dots · prev · next follow the current slide (at the ends, that side’s button dims)
(() => {
  document.querySelectorAll("[data-slider]").forEach((item) => {
    const pics = [...item.querySelectorAll(".tg > .wf-img")];
    const dotsBox = item.querySelector(".dots"), prev = item.querySelector("[data-dir=prev]"), next = item.querySelector("[data-dir=next]");
    let now = 0;
    const dots = pics.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", `${i + 1}Nth photo`);
      b.addEventListener("click", () => go(i));
      dotsBox.append(b);
      return b;
    });
    pics.forEach((p, i) => gsap.set(p, { opacity: i ? 0 : 1 }));
    const paint = () => {
      dots.forEach((d, i) => d.classList.toggle("is-on", i === now));
      prev.classList.toggle("is-off", now === 0);
      next.classList.toggle("is-off", now === pics.length - 1);
    };
    const go = (i) => {
      if (i < 0 || i >= pics.length) return;
      now = i;
      pics.forEach((p, k) => gsap.to(p, { opacity: k === now ? 1 : 0, duration: 0.5, ease: "power2.out" }));
      paint();
    };
    prev.addEventListener("click", () => go(now - 1));
    next.addEventListener("click", () => go(now + 1));
    paint();
  });
})();
