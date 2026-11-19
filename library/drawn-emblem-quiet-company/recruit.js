/* FAQ — only the clicked item opens and the rest close. The panel height grows and shrinks to the inner height over .4s cubic-bezier(.77,0,.175,1) (original height animation from the animation library). */
(() => {
  const items = [...document.querySelectorAll(".tb-faq__item")];
  if (!items.length) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = window.CustomEase ? CustomEase.create("tb-io", "M0,0 C0.77,0 0.175,1 1,1") : "power3.inOut";
  const set = (item, open) => {
    const panel = item.querySelector(".tb-faq__panel");
    const body = item.querySelector(".tb-faq__body");
    const btn = item.querySelector(".tb-faq__btn");
    if (!panel || !body || !btn) return;
    item.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    panel.inert = !open;
    gsap.to(panel, { height: open ? body.getBoundingClientRect().height : 0, duration: reduce ? 0 : 0.4, ease, overwrite: true });
  };
  items.forEach((item) => {
    item.querySelector(".tb-faq__btn")?.addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      items.forEach((other) => { if (other !== item && other.classList.contains("is-open")) set(other, false); });
      set(item, open);
    });
    item.querySelector(".tb-faq__close")?.addEventListener("click", () => set(item, false));
  });
  addEventListener("resize", () => items.forEach((item) => {
    if (!item.classList.contains("is-open")) return;
    const body = item.querySelector(".tb-faq__body");
    gsap.set(item.querySelector(".tb-faq__panel"), { height: body.getBoundingClientRect().height });
  }));
})();
