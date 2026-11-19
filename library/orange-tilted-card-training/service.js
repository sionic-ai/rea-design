// FAQ — original toggle: a closed answer has height 0, opening grows it to its own height over .3s cubic-bezier(.4,.4,0,1), and
// ＋ goes 180° → 0° · blurs out, － goes 180° → 0° · appears.
// Once fully open, release the height to auto so text isn’t cut off when the window width changes
(() => {
  const DUR = 300, WAIT = 45;
  document.querySelectorAll(".kd-faq__item").forEach((item) => {
    const btn = item.querySelector(".kd-faq__q"), box = item.querySelector(".kd-faq__a");
    let timer = 0;
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      clearTimeout(timer);
      btn.setAttribute("aria-expanded", String(open));
      timer = setTimeout(() => turn(open), WAIT);
    });
    const turn = (open) => {
      item.classList.toggle("is-open", open);
      box.inert = !open;
      box.style.height = `${open ? 0 : box.scrollHeight}px`;
      void box.offsetHeight;
      box.style.height = `${open ? box.scrollHeight : 0}px`;
      if (open) timer = setTimeout(() => (box.style.height = "auto"), DUR);
    };
  });
})();
