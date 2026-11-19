// About — ① bottom head photo: takes section progress (head at screen top → section end at screen center) through a spring (stiffness 360 · damping 66) to .4→1x, left −40%→0
// ② Leader accordion: only one open, height (head height ↔ content height) and background .4s cubic-bezier(0,1,.8,1) ③ Value cards: press shows a photo (on devices without hover)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = matchMedia("(max-width: 601px)");

  const hero = document.querySelector(".ab-hero");
  const grow = document.querySelector("[data-ab-grow]");
  if (hero && grow) {
    const apply = mkSpring(360, 66, (p) => {
      const s = 0.4 + 0.6 * p;
      grow.style.transform = narrow.matches ? `scale(${s})` : `translateX(${-40 + 40 * p}%) scale(${s})`;
    });
    const read = () => {
      const top = hero.getBoundingClientRect().top + scrollY;
      const span = hero.offsetHeight - innerHeight / 2;
      apply(Math.min(1, Math.max(0, (scrollY - top) / Math.max(1, span))));
    };
    read();
    addEventListener("scroll", read, { passive: true });
    addEventListener("resize", read);
  }

  const ease = window.CustomEase ? CustomEase.create("mk-lead", "0,1,0.8,1") : "expo.out";
  const people = [...document.querySelectorAll(".ab-person")];
  const sizes = (el) => {
    const sp = parseFloat(getComputedStyle(el).getPropertyValue("--spacing")) || 32;
    const head = el.querySelector(".ab-person__header").offsetHeight + 2 * sp;
    const body = el.querySelector(".ab-person__body").offsetHeight + sp;
    const img = el.querySelector(".ab-person__img");
    const pic = img && img.offsetWidth ? img.offsetHeight + 2 * sp : 0;
    return { open: Math.max(head + body, pic), shut: head };
  };
  let at = 0;
  const draw = (instant) => people.forEach((el, i) => {
    const { open, shut } = sizes(el);
    const on = i === at;
    el.style.setProperty("--head-h", `${shut}px`);
    el.classList.toggle("is-active", on);
    el.querySelector(".ab-person__trigger").setAttribute("aria-expanded", String(on));
    gsap.to(el, { height: on ? open : shut, duration: instant || reduce ? 0 : 0.4, ease, overwrite: "auto" });
  });
  people.forEach((el, i) => el.querySelector(".ab-person__trigger").addEventListener("click", () => { at = at === i ? -1 : i; draw(); }));
  draw(true);
  addEventListener("resize", () => draw(true));
  document.fonts?.ready.then(() => draw(true));

  document.querySelectorAll(".ab-value").forEach((card) => {
    const flip = () => card.classList.toggle("is-active");
    card.addEventListener("click", () => { if (!matchMedia("(hover: hover)").matches) flip(); });
    card.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip()));
  });
})();
