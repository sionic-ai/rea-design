// ‹Book› pill — original $('.books_nav').fadeToggle() : 400ms swing(= sine.inOut), the arrow flips right away
(() => {
  const open = document.querySelector("[data-books-open]");
  const list = document.querySelector(".kt-books");
  if (!open || !list) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let shown = false;
  open.addEventListener("click", (e) => {
    e.preventDefault();
    shown = !shown;
    open.classList.toggle("is-open", shown);
    open.setAttribute("aria-expanded", String(shown));
    gsap.killTweensOf(list);
    if (shown) {
      gsap.set(list, { display: "block" });
      gsap.fromTo(list, { opacity: +getComputedStyle(list).opacity < 1 ? +getComputedStyle(list).opacity : 0 }, { opacity: 1, duration: reduce ? 0 : 0.4, ease: "sine.inOut" });
    } else {
      gsap.to(list, { opacity: 0, duration: reduce ? 0 : 0.4, ease: "sine.inOut", onComplete: () => gsap.set(list, { display: "none" }) });
    }
  });
})();
