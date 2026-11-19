// Work · News list: card hover (dark veil .2 · material-color block rising from below), pill dropdown (dropdown-OPEN/CLOSE), category filtering
(() => {
  const { E } = window.msMotion;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  $$(".ms-work__link, .ms-news__link").forEach((a) => {
    const sh = $(".ms-work__shadow", a), cubes = $(".ms-work__cubes", a);
    a.addEventListener("mouseenter", () => {
      if (sh) gsap.to(sh, { opacity: 0.2, duration: 0.3, ease: E.inOutQuad, overwrite: "auto" });
      if (cubes) gsap.to(cubes, { scaleY: 1, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
    });
    a.addEventListener("mouseleave", () => {
      if (sh) gsap.to(sh, { opacity: 0, duration: 0.3, ease: E.inOutQuad, overwrite: "auto" });
      if (cubes) gsap.to(cubes, { scaleY: 0, duration: 0.2, ease: E.outQuad, overwrite: "auto" });
    });
  });

  const filterBy = (items, catSel, value) => {
    // Like the original Product, the whole list fades straight to .5 in .2s, swaps cards at the bottom, and reappears over the same length (original 383ms)
    const grid = items[0]?.parentElement;
    const swap = () => {
      items.forEach((it, i) => {
        const cat = $(catSel, it)?.textContent.trim();
        it.hidden = !(value === "*" || cat === value || (value === "Key" && i < 6));
      });
      ScrollTrigger.refresh();
    };
    if (!grid || matchMedia("(prefers-reduced-motion: reduce)").matches) { swap(); return; }
    // It must be a CSS transition like the original so it starts from the same value on the first frame (GSAP writes the first value on the next tick)
    // Driving it with a timer swaps before reaching the floor (.5), so it blurs less — wait until the blur ends
    if (grid.msFade) grid.removeEventListener("transitionend", grid.msFade);
    grid.msFade = (e) => {
      if (e && e.propertyName !== "opacity") return;
      grid.removeEventListener("transitionend", grid.msFade);
      grid.msFade = null;
      swap();
      grid.style.opacity = "";
    };
    grid.style.transition = "opacity .2s linear";
    if (getComputedStyle(grid).opacity === "0.5") { grid.msFade(); return; }
    grid.addEventListener("transitionend", grid.msFade);
    grid.style.opacity = "0.5";
  };

  const dd = $(".ms-dd");
  if (dd) {
    const toggle = $(".ms-dd__toggle", dd), list = $(".ms-dd__list", dd), arrow = $(".ms-dd__arrow", dd), label = $(".ms-dd__text", dd);
    let open = false;
    const set = (v) => {
      open = v;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) {
        gsap.set(list, { display: "flex" });
        gsap.to(arrow, { rotation: 180, duration: 0.6, ease: E.outQuad, overwrite: "auto" });
        gsap.fromTo(list, { scaleY: 0, yPercent: -50 }, { scaleY: 1, yPercent: 0, duration: 0.4, ease: E.outQuad, overwrite: "auto" });
        gsap.fromTo(list, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: E.outQuad });
      } else {
        gsap.to(arrow, { rotation: 0, duration: 0.6, ease: E.outQuad, overwrite: "auto" });
        gsap.to(list, { opacity: 0, duration: 0.3, ease: E.outQuad, overwrite: "auto" });
        gsap.to(list, { scaleY: 0, yPercent: -50, duration: 0.4, ease: E.outQuad, onComplete: () => gsap.set(list, { display: "none" }) });
      }
    };
    toggle.addEventListener("click", () => set(!open));
    const items = $$(".ms-work__item");
    $$(".ms-dd__link", list).forEach((l) => l.addEventListener("click", (e) => {
      e.preventDefault();
      const on = !l.classList.contains("is-on");
      $$(".ms-dd__link", list).forEach((x) => x.classList.remove("is-on"));
      l.classList.toggle("is-on", on);
      label.firstChild.textContent = on ? l.textContent : "All Work";
      filterBy(items, ".ms-work__cat", on ? l.dataset.filter : "*");
      set(false);
    }));
  }

  const nf = $(".ms-news__filters");
  if (nf) {
    const items = $$(".ms-news__item");
    $$(".ms-news__filter", nf).forEach((f) => f.addEventListener("click", (e) => {
      e.preventDefault();
      $$(".ms-news__filter", nf).forEach((x) => x.classList.toggle("is-on", x === f));
      filterBy(items, ".ms-news__cat", f.dataset.filter);
    }));
  }
})();
