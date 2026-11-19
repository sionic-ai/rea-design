// Every page — phone drawer (opening it locks background scroll), cookie notice (doesn’t reappear once closed), sticky table of contents (turns on the section that spans the 30–40% line of the screen),
// Team row (on phone, tap to unfold the photo). The original does the same with Alpine.
(() => {
  const html = document.documentElement;

  const toggler = document.querySelector(".md-toggler");
  const drawer = document.querySelector(".md-drawer");
  if (toggler && drawer) {
    const set = (open) => {
      toggler.classList.toggle("is-open", open);
      drawer.classList.toggle("is-open", open);
      toggler.setAttribute("aria-expanded", String(open));
      toggler.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
      drawer.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggler.addEventListener("click", () => set(!drawer.classList.contains("is-open")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a")) set(false); });
    matchMedia("(min-width: 1024px)").addEventListener("change", (e) => { if (e.matches) set(false); });
  }

  const KEY = "md-cookie-consent";
  const banner = document.querySelector(".md-cookie");
  if (banner) {
    let seen = false;
    try { seen = localStorage.getItem(KEY) === "1"; } catch {}
    banner.hidden = seen;
    if (!seen) {
      html.setAttribute("data-cookie-banner", "visible");
      requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add("is-shown")));
    }
    // The phone hero shrinks by the notice height so the logo shows above the notice
    const height = () => html.style.setProperty("--cookie-banner-height", (banner.hidden ? 0 : banner.offsetHeight) + "px");
    height();
    new ResizeObserver(height).observe(banner);
    // Like the original Alpine, hide when the blur (.3s) ends, and clear the blur value after hiding
    const hide = () => { banner.hidden = true; banner.style.opacity = "1"; height(); };
    banner.querySelector(".md-cookie__close").addEventListener("click", () => {
      banner.classList.remove("is-shown");
      html.removeAttribute("data-cookie-banner");
      const done = (e) => { if (e && e.target !== banner) return; banner.removeEventListener("transitionend", done); clearTimeout(t); hide(); };
      const t = setTimeout(done, 400);
      banner.addEventListener("transitionend", done);
      try { localStorage.setItem(KEY, "1"); } catch {}
    });
  }

  document.querySelectorAll("[data-section-index]").forEach((nav) => {
    const items = [...nav.querySelectorAll("li")];
    const targets = items.map((li) => document.getElementById(li.dataset.target)).filter(Boolean);
    if (!targets.length) return;
    const activate = (id) => items.forEach((li) => li.classList.toggle("is-active", li.dataset.target === id));
    activate(targets[0].id);
    const io = new IntersectionObserver((entries) => {
      const on = entries.filter((e) => e.isIntersecting);
      if (!on.length) return;
      activate(on.reduce((a, b) => (b.boundingClientRect.top < a.boundingClientRect.top ? b : a)).target.id);
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    targets.forEach((t) => io.observe(t));
    const list = nav.querySelector("ul");
    const height = () => html.style.setProperty("--section-index-height", Math.round(list.getBoundingClientRect().bottom - nav.getBoundingClientRect().top) + "px");
    height();
    new ResizeObserver(height).observe(nav);
  });

  const wide = matchMedia("(min-width: 1024px)");
  document.querySelectorAll("[data-member]").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (wide.matches || e.target.closest("a")) return;
      card.classList.toggle("is-open");
    });
  });
  wide.addEventListener("change", (e) => { if (e.matches) document.querySelectorAll("[data-member].is-open").forEach((c) => c.classList.remove("is-open")); });
})();
