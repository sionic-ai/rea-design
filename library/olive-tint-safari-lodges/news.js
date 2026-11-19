// Record sheet — expand rows (height .5s power3.inOut — original values unreadable, estimated by eye), year picker, filter collapse (.16s after measuring, power2.inOut shape, visible length .28s).
(() => {
  const T = window.T;
  document.querySelectorAll(".t-acc").forEach((acc) => {
    const btn = acc.querySelector(".t-acc__toggle"), box = acc.querySelector(".t-acc__content");
    btn.addEventListener("click", () => {
      const open = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      gsap.fromTo(box, { height: open ? 0 : box.scrollHeight }, { height: open ? box.scrollHeight : 0, duration: T.reduce ? 0 : 0.5, ease: "power3.inOut", onComplete: () => { box.style.height = open ? "auto" : ""; ScrollTrigger.refresh(); } });
    });
  });
  const opts = [...document.querySelectorAll(".t-filter__opt")];
  // The original only swaps cells after reloading the list when a year is pressed — the screen stays the same at the moment of the press
  opts.forEach((o) => o.addEventListener("click", () => setTimeout(() => opts.forEach((x) => x.classList.toggle("is-on", x === o)), 1400)));
  document.querySelectorAll(".t-filter__group").forEach((g) => {
    const tog = g.querySelector(".t-filter__tog"), list = g.querySelector(".t-filter__list");
    tog.addEventListener("click", () => {
      const open = !g.classList.contains("is-open");
      g.classList.toggle("is-open", open);
      tog.setAttribute("aria-expanded", open);
      gsap.fromTo(list, { height: open ? 0 : list.scrollHeight }, { height: open ? list.scrollHeight : 0, delay: T.reduce ? 0 : 0.16, duration: T.reduce ? 0 : 0.47, ease: "power2.inOut", onComplete: () => { list.style.height = open ? "" : "0px"; } });
    });
  });
})();
