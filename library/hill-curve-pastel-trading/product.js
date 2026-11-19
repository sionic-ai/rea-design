// Popular products: initially the top two rows (four rows on phone = 8 items) are shown, and VIEW MORE expands them all. Opening .4s power1.out, closing .4s power1.in.
(() => {
  const box = document.querySelector(".pr-hot__target");
  const list = box.firstElementChild;
  const btn = document.querySelector(".pr-hot__more");
  const label = btn.querySelector("span");
  const shown = () => {
    const items = [...list.children];
    const last = items[Math.min(8, items.length) - 1];
    return last.offsetTop + last.offsetHeight;
  };
  const fit = () => { box.style.height = (btn.classList.contains("is-open") ? list.offsetHeight : shown()) + "px"; };
  fit();
  addEventListener("resize", fit);
  btn.addEventListener("click", () => {
    const open = !btn.classList.contains("is-open");
    btn.classList.toggle("is-open", open);
    label.textContent = open ? "CLOSE" : "VIEW MORE";
    gsap.killTweensOf(box);
    gsap.to(box, { height: open ? list.offsetHeight : shown(), duration: window.FT.reduce ? 0 : .4, ease: open ? "power1.out" : "power1.in", onComplete: () => ScrollTrigger.refresh() });
  });
})();
