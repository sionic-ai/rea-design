// First page — service accordion (only one open, click again to close): height and opacity .4s cubic-bezier(0,1,.8,1), closed panels hidden after .3s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ease = window.CustomEase ? CustomEase.create("mk-acc", "0,1,0.8,1") : "expo.out";
  document.querySelectorAll("[data-mk-accordion]").forEach((list) => {
    const items = [...list.querySelectorAll(".mk-acc")];
    const set = (item, open, now) => {
      const box = item.querySelector(".mk-acc__content");
      item.classList.toggle("is-active", open);
      item.querySelector(".mk-acc__toggle").setAttribute("aria-expanded", String(open));
      gsap.killTweensOf(box);
      const d = now || reduce ? 0 : 0.4;
      if (open) gsap.fromTo(box, { height: box.offsetHeight, visibility: "visible" }, { height: "auto", opacity: 1, duration: d, ease });
      else gsap.to(box, { height: 0, opacity: 0, duration: d, ease, onComplete: () => gsap.set(box, { visibility: "hidden" }) });
    };
    items.forEach((item) => set(item, item.classList.contains("is-active"), true));
    items.forEach((item) => item.querySelector(".mk-acc__toggle").addEventListener("click", () => {
      const was = item.classList.contains("is-active");
      items.forEach((o) => o !== item && o.classList.contains("is-active") && set(o, false));
      set(item, !was);
    }));
  });
})();
