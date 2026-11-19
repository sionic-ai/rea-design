// Company About only — floating header line (original nov24header.js): on wide screens, hovering an item measures the panel height below and opens the background panel min-height (.2s) and the panel max-height (.3s, 10ms later),
// On leave, closes after 200ms, then 300ms later removes the header-row open marker. At 1184px and below or on touch, the burger opens the panel and tapping an item opens it. Scrolling down shows a shadow and closes the cookie bar.
(() => {
  const start = () => {
    const head = document.querySelector(".js-co-head");
    if (!head) return;
    const nav = head.querySelector(".js-co-nav");
    const bg = head.querySelector(".co-nav__bg");
    const overlay = document.querySelector(".js-co-overlay");
    const burger = head.querySelector(".js-co-burger");
    const items = [...head.querySelectorAll(".co-nav__first > li")].filter((li) => li.querySelector(".co-nav__second"));
    const narrow = () => window.innerWidth <= 1184 || "ontouchstart" in window;
    let to1 = 0, to2 = 0;

    const open = (li) => {
      clearTimeout(to2);
      head.classList.add("is-open");
      li.classList.add("is-open");
      li.querySelector(".co-nav__top").setAttribute("aria-expanded", "true");
      const box = li.querySelector(".co-nav__second");
      const h = box.querySelector("ul").getBoundingClientRect().height;
      if (!narrow()) bg.style.minHeight = `${h}px`;
      setTimeout(() => { box.style.maxHeight = `${h}px`; }, 10);
    };
    const close = (li) => {
      li.classList.remove("is-open");
      li.querySelector(".co-nav__top").setAttribute("aria-expanded", "false");
      li.querySelector(".co-nav__second").style.maxHeight = "";
      bg.style.minHeight = "";
    };
    const closeAll = () => items.forEach(close);

    items.forEach((li) => {
      const top = li.querySelector(".co-nav__top");
      const box = li.querySelector(".co-nav__second");
      const leave = () => {
        if (narrow()) return;
        to1 = setTimeout(() => {
          close(li);
          overlay?.classList.remove("is-on");
          to2 = setTimeout(() => head.classList.remove("is-open"), 300);
        }, 200);
      };
      const enter = () => {
        if (narrow()) return;
        clearTimeout(to1);
        overlay?.classList.add("is-on");
        items.forEach((o) => { if (o !== li) close(o); });
        open(li);
      };
      li.addEventListener("pointerenter", enter);
      li.addEventListener("pointerleave", leave);
      top.addEventListener("focus", enter);
      box.addEventListener("pointerenter", () => clearTimeout(to1));
      top.addEventListener("click", (e) => {
        e.preventDefault();
        if (!narrow()) return;
        if (li.classList.contains("is-open")) close(li); else open(li);
      });
    });
    burger?.addEventListener("click", () => {
      const on = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", on);
      burger.classList.toggle("is-open", on);
      burger.setAttribute("aria-expanded", on);
      if (!on) { closeAll(); setTimeout(() => head.classList.remove("is-open"), 300); } else head.classList.add("is-open");
    });
    overlay?.addEventListener("click", () => { closeAll(); overlay.classList.remove("is-on"); head.classList.remove("is-open"); });
    const shadow = () => head.classList.toggle("is-shadow", window.scrollY > 0);
    window.addEventListener("scroll", shadow, { passive: true });
    shadow();

    document.querySelectorAll(".js-cookie-close").forEach((b) => b.addEventListener("click", () => document.querySelector(".js-cookie")?.classList.add("is-closed")));
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
