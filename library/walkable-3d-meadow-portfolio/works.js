// FAQ: measures height directly to expand and collapse (like the original, 280–520ms proportional to distance, opening one closes the others).
// Work card: on hover the video slot appears over the photo (the original plays a clip in place).
(() => {
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    const items = [...document.querySelectorAll(".hp-faq__item")];
    const bodyOf = (item) => item.querySelector(".hp-faq__body");
    const run = (item, from, to, done) => {
      item._anim?.cancel();
      const anim = bodyOf(item).animate({ height: [from + "px", to + "px"] }, { duration: Math.max(280, Math.min(520, Math.abs(to - from) * 2.2)), easing: EASE, fill: "forwards" });
      item._anim = anim;
      anim.onfinish = () => { done?.(); anim.cancel(); item._anim = null; };
    };
    const open = (item) => {
      items.forEach((o) => o !== item && o.open && !o.classList.contains("is-closing") && close(o));
      const from = item.open ? bodyOf(item).getBoundingClientRect().height : 0;
      if (!item.open) {
        item.classList.add("is-opening");
        requestAnimationFrame(() => requestAnimationFrame(() => item.classList.remove("is-opening")));
      }
      item.classList.remove("is-closing");
      item.open = true;
      run(item, from, bodyOf(item).scrollHeight);
    };
    const close = (item) => {
      const from = bodyOf(item).getBoundingClientRect().height;
      item.classList.add("is-closing");
      run(item, from, 0, () => { item.open = false; item.classList.remove("is-closing"); });
    };
    items.forEach((item) => item.querySelector("summary").addEventListener("click", (e) => {
      e.preventDefault();
      item.open && !item.classList.contains("is-closing") ? close(item) : open(item);
    }));

    if (fine) document.querySelectorAll("[data-hover-clip]").forEach((card) => {
      card.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && card.classList.add("is-playing"));
      card.addEventListener("pointerleave", () => card.classList.remove("is-playing"));
    });
  });
  window.fxInit();
})();
