// Header menu, phone footer collapse, floating promo badge — every section uses the same header and footer
(() => {
  const menu = document.querySelector(".ev-menu");
  const burger = document.querySelector(".ev-burger");
  if (menu && burger) {
    // The original just switches display to cover and uncover immediately (no transition)
    const set = (open) => {
      menu.classList.toggle("is-active", open);
      menu.setAttribute("aria-hidden", String(!open));
      burger.setAttribute("aria-expanded", String(open));
    };
    burger.addEventListener("click", () => set(true));
    menu.querySelector(".ev-menu__close")?.addEventListener("click", () => set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  }

  // Phone footer group — original jQuery slideToggle(300, swing): height and top margin grow and shrink together. swing is the same curve as sine.inOut
  const narrow = matchMedia("(max-width: 767px)");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll(".ev-foot__toggle").forEach((h) => {
    h.addEventListener("click", () => {
      if (!narrow.matches) return;
      const list = h.nextElementSibling;
      if (!list) return;
      const open = !h.classList.contains("is-open");
      h.classList.toggle("is-open", open);
      if (reduce || !window.gsap) { list.style.display = open ? "block" : "none"; return; }
      gsap.killTweensOf(list);
      if (open) {
        list.style.display = "block";
        gsap.fromTo(list, { height: 0, marginTop: 0 }, { height: "auto", marginTop: 20, duration: 0.3, ease: "sine.inOut", clearProps: "height,marginTop" });
      } else {
        gsap.to(list, { height: 0, marginTop: 0, duration: 0.3, ease: "sine.inOut", onComplete: () => { list.style.display = "none"; gsap.set(list, { clearProps: "height,marginTop" }); } });
      }
    });
  });
  narrow.addEventListener("change", () => document.querySelectorAll(".ev-foot__col ul").forEach((u) => { u.style.display = ""; u.previousElementSibling?.classList.remove("is-open"); }));

  document.querySelectorAll(".ev-promo__x").forEach((b) => b.addEventListener("click", () => b.closest(".ev-promo").classList.add("is-closed")));
})();
