(() => {
  const root = document.documentElement;
  const header = document.querySelector("[data-yd-header]");
  if (!header) return;

  // Header dropdown menu: opens when the pointer is on a menu name or the panel, and closes if it doesn’t return within 375ms of leaving (original value)
  const navs = header.querySelectorAll("[data-yd-nav]");
  const drop = header.querySelector(".yd-drop");
  const panels = header.querySelectorAll(".yd-drop__panel");
  let closeTimer = null;
  navs.forEach((nav, i) => {
    const panel = panels[i];
    if (!panel) return;
    const open = () => {
      clearTimeout(closeTimer);
      closeTimer = null;
      navs.forEach((n) => n.classList.remove("is-hover"));
      panels.forEach((p) => p.classList.remove("is-hover"));
      nav.classList.add("is-hover");
      drop.classList.add("is-hover");
      panel.classList.add("is-hover");
    };
    const close = () => {
      closeTimer = setTimeout(() => {
        nav.classList.remove("is-hover");
        drop.classList.remove("is-hover");
        panel.classList.remove("is-hover");
      }, 375);
    };
    nav.addEventListener("mouseenter", open);
    panel.addEventListener("mouseenter", open);
    nav.addEventListener("mouseleave", close);
    panel.addEventListener("mouseleave", close);
    nav.addEventListener("focus", open);
    nav.addEventListener("click", open);
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-yd-nav], .yd-drop__panel")) return;
    navs.forEach((n) => n.classList.remove("is-hover"));
    drop?.classList.remove("is-hover");
    panels.forEach((p) => p.classList.remove("is-hover"));
  });

  // Dark pill inside the panel: the order of the hovered row / moves down by the number of rows
  panels.forEach((panel) => {
    const pill = panel.querySelector(".yd-drop__pill");
    const links = panel.querySelectorAll(".yd-drop__inner a");
    if (!pill || !links.length) return;
    pill.style.height = `${100 / links.length}%`;
    links.forEach((a, n) => {
      a.addEventListener("mouseenter", () => {
        pill.classList.add("is-hover");
        pill.style.top = `${(n / links.length) * 100}%`;
      });
      a.addEventListener("mouseleave", () => pill.classList.remove("is-hover"));
    });
  });

  // Bottom dock menu button: toggles the panel on and off. While on, the page is frozen (original scroll-lock)
  const menuBtn = header.querySelector(".yd-bar__menu");
  const setMenu = (on) => {
    header.classList.toggle("is-menu", on);
    document.body.classList.toggle("is-locked", on);
    menuBtn?.setAttribute("aria-expanded", String(on));
  };
  menuBtn?.addEventListener("click", () => setMenu(!header.classList.contains("is-menu")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("is-menu")) setMenu(false);
  });

  // Phone accordion link: measure the height, then 0 ↔ that height in .35s
  const accs = [];
  const measure = () => accs.forEach((a) => {
    const t = a.sub.style.transition;
    a.sub.style.transition = "none";
    a.sub.style.height = "auto";
    a.h = a.sub.scrollHeight;
    a.sub.style.height = a.item.classList.contains("is-on") ? `${a.h}px` : "0px";
    a.sub.offsetHeight;
    a.sub.style.transition = t;
  });
  const narrow = matchMedia("(max-width: 1024px)");
  document.querySelectorAll(".yd-links__head").forEach((head) => {
    const item = head.closest(".yd-links__item");
    const sub = item?.querySelector(".yd-links__sub");
    if (!sub) return;
    accs.push({ item, sub, h: 0 });
    head.addEventListener("click", () => {
      if (!narrow.matches) return;
      const on = !item.classList.contains("is-on");
      item.classList.toggle("is-on", on);
      sub.style.height = on ? `${sub.scrollHeight}px` : "0px";
    });
  });
  const reset = () => {
    if (narrow.matches) measure();
    else accs.forEach((a) => { a.item.classList.remove("is-on"); a.sub.style.height = ""; });
  };
  narrow.addEventListener("change", reset);
  reset();

  // Current slot of the bottom dock: a thick border on the slot matching the body’s data-crnt (home·know·meet·use)
  const crnt = document.body.dataset.crnt;
  if (crnt) header.querySelector(`[data-yd-cell="${crnt}"]`)?.classList.add("is-crnt");

  root.classList.add("js");
})();
