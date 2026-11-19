// Figure list. Grid is a strip of equal-width cards (glide-wrap-reel · from: view · stagger 40). At first the first card sits 100px left of the screen center and
// Slides +100 over 2s power1.out, and meanwhile on-screen cards are cleared from the left in turn .1s each (all after 1s). After that only on-screen cards stay cleared.
// Index shows the same cards as a grid — cards clear in .03s steps and the strip ignores wheel and drag. When idle (clock) the strip drifts by itself at 50px per second
window.miPages = window.miPages || {};
window.miPages.product = (scope, { reduce }) => {
  const root = document.documentElement;
  const body = document.body;
  const el = scope.querySelector(".mi-figs");
  if (!el || el.classList.contains("is-ready")) return;
  const reel = el.querySelector(".mi-figs__list");
  if (window.kfFx) kfFx.scan(reel);
  const api = () => reel.fxReel;
  const items = [...reel.querySelectorAll('[data-fx-part="item"]')];
  const navs = [...el.querySelectorAll(".mi-figs__nav li")];
  const links = [...reel.querySelectorAll(".mi-figs__link")];
  let nav = "grid";
  let loaded = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduce ? 0 : ms));

  // Only cards on screen (cell width with 1.1x margin) stay uncovered — the part attaches is-fx-near every frame
  const sync = () => {
    if (!loaded || nav !== "grid") return;
    for (const it of items) it.classList.toggle("is-active", it.classList.contains("is-fx-near"));
  };
  gsap.ticker.add(sync);

  const apply = () => {
    navs.forEach((n) => n.classList.toggle("is-active", n.dataset.nav === nav));
    el.dataset.nav = nav;
    reel.classList.toggle("is-fx-hold", nav !== "grid");
    body.dataset.color = "black";
    items.forEach((it) => it.classList.remove("is-active"));
    if (nav === "grid") {
      root.classList.remove("is-noclock");
      loaded = false;
      later(() => {
        const near = items.filter((it) => it.classList.contains("is-fx-near")).sort((a, b) => gsap.getProperty(a, "x") - gsap.getProperty(b, "x"));
        near.forEach((it, k) => later(() => it.classList.add("is-active"), 100 * (k + 1)));
        later(() => items.forEach((it) => it.classList.add("is-active")), 1000);
      }, 50);
      later(() => { loaded = true; }, 700);
    } else {
      root.classList.add("is-noclock");
      items.forEach((it, i) => later(() => it.classList.add("is-active"), 30 * i));
    }
    later(() => api() && api().measure(), 10);
    later(() => window.miLoco && window.miLoco.update(), 100);
  };

  apply();
  later(() => {
    if (!api()) return;
    const w = items[0].offsetWidth;
    api().scroll = innerWidth / 2 - w / 2 - 100;
    api().to(`+=100`, reduce ? 0 : 2, "power1.out");
  }, 10);
  el.classList.add("is-ready");

  links.forEach((a) => {
    a.addEventListener("mouseenter", () => {
      el.style.setProperty("--character", a.style.getPropertyValue("--character"));
      const wrap = a.closest(".mi-figs__wrap");
      wrap.querySelector(".mi-figs__info-name").textContent = a.querySelector(".mi-figs__name").textContent;
      wrap.querySelector(".mi-figs__info-caption").textContent = a.querySelector(".mi-figs__caption").textContent;
      if (a.hasAttribute("data-white") && nav === "grid") body.dataset.color = "white";
    });
    a.addEventListener("mouseleave", () => {
      el.style.removeProperty("--character");
      if (nav === "grid" && body.dataset.page === "product") body.dataset.color = "black";
    });
  });
  navs.forEach((n) => n.addEventListener("click", () => { nav = n.dataset.nav; apply(); }));
  const top = el.querySelector(".js-totop");
  top && top.addEventListener("click", (e) => { e.preventDefault(); window.miScrollTo && window.miScrollTo(0); });

  return {
    autoPlay: () => nav === "grid" && api() && api().play(),
    stopPlay: () => api() && api().stop(),
    destroy() {
      timers.forEach(clearTimeout);
      gsap.ticker.remove(sync);
      root.classList.remove("is-noclock");
    },
  };
};
