// Motion spanning several sections — values straight from the original common.js: header hide, phone menu, cursor drag, rise, first-on timing
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.getElementById("header");
  const menu = document.getElementById("menu");
  const btn = document.getElementById("menu-btn");

  // Hides on scroll down, shows on scroll up. Past the Hero height it overlaps with difference
  let last = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    header.classList.toggle("is-hide", y > 0 && last < y);
    last = y;
    header.classList.toggle("is-scroll", y >= innerHeight);
  }, { passive: true });

  const closeMenu = () => {
    btn.classList.remove("active");
    btn.textContent = "MENU";
    btn.setAttribute("aria-expanded", "false");
    menu.classList.remove("open");
    header.classList.remove("is-menu");
  };
  btn.addEventListener("click", () => {
    const open = btn.classList.toggle("active");
    menu.classList.toggle("open", open);
    header.classList.toggle("is-menu", open);
    btn.textContent = open ? "CLOSE" : "MENU";
    btn.setAttribute("aria-expanded", String(open));
    header.classList.remove("is-hide");
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // .move — pulled by 0.2 times the cursor’s distance from the center inside the element (transform .3s ease is in css)
  if (matchMedia("(hover: hover)").matches && !reduce) {
    document.querySelectorAll(".move").forEach((el) => {
      let r;
      el.addEventListener("mouseenter", () => { r = el.getBoundingClientRect(); });
      el.addEventListener("mousemove", (e) => {
        r ||= el.getBoundingClientRect();
        const x = 0.2 * (e.clientX - r.width / 2 - r.left), y = 0.2 * (e.clientY - r.height / 2 - r.top);
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = "none"; r = null; });
    });
  }

  // Turn on when the top edge rises above the 75% line. For lists, each child follows at 100ms intervals
  const line = () => Math.floor(0.75 * innerHeight);
  const fade = () => {
    for (const el of document.getElementsByClassName("fade")) if (Math.floor(el.getBoundingClientRect().top) < line()) el.classList.add("init");
  };
  const fadeSp = () => {
    if (innerWidth > 768) return;
    for (const el of document.getElementsByClassName("fade-sp")) if (Math.floor(el.getBoundingClientRect().top) < line()) el.classList.add("init");
  };
  const fadeList = () => {
    for (const list of document.getElementsByClassName("fade-list")) {
      if (list.classList.contains("init") || Math.floor(list.getBoundingClientRect().top) >= line()) continue;
      [...list.children].forEach((c, i) => setTimeout(() => c.classList.add("init"), i * 100));
      list.classList.add("init");
    }
  };
  const all = () => { fade(); fadeSp(); fadeList(); };
  if (reduce) {
    document.querySelectorAll(".fade, .fade-sp, .fade-list, .fade-list > *").forEach((el) => el.classList.add("init"));
  } else {
    addEventListener("scroll", all, { passive: true });
    addEventListener("resize", fadeSp);
  }

  // The original turns on the header .6s after window.onload and the booking circle at 1.5s (the first screen curtain and copy are in index.js)
  const reserve = document.getElementById("reserve");
  addEventListener("load", () => {
    if (!reduce) all();
    if (reduce) { header.classList.add("is-show"); reserve.classList.add("is-show"); return; }
    setTimeout(() => header.classList.add("is-show"), 600);
    setTimeout(() => reserve.classList.add("is-show"), 1500);
  });
})();
