// Motion shared by all pages: header bar (within the top 110px it is a transparent panel laid over the photo, further down it sticks as a white panel · scroll is checked every 250ms),
// Product dropdown (opens on hover), mobile menu · cart drawer, footer accordion (phone), back to top. The original Brand’s ScrollDirection (throttle 250 · start 100)
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const header = document.querySelector(".mm-header");
  const body = document.body;

  // Underline the current page menu
  const page = body.dataset.page;
  document.querySelectorAll(`.mm-nav [data-nav="${page}"]`).forEach((a) => a.setAttribute("aria-current", "page"));

  // Within the top 110px (original start 100 + 10) it is transparent, below that a white panel — as in the original, checked just once every 250ms
  let last = 0, timer = null;
  const check = () => {
    timer = null;
    last = performance.now();
    header.classList.toggle("is-scrolled", scrollY > 110);
  };
  addEventListener("scroll", () => {
    if (timer) return;
    const wait = Math.max(0, 250 - (performance.now() - last));
    timer = setTimeout(check, wait);
  }, { passive: true });
  check();
  header.addEventListener("pointerenter", () => header.classList.add("is-hover"));
  // If an open dropdown exists, keep the white panel (original mouseleave condition) — the country picker panel is not counted
  // Keep it even when the drawer is open (the original shows the white panel on mouseleave too when a drawer or dropdown is open)
  const held = () => header.querySelector(".mm-has-drop.is-open") || document.querySelector(".mm-drawer.is-open");
  header.addEventListener("pointerleave", () => { if (!held()) header.classList.remove("is-hover"); });

  // Product dropdown — opens on hover (original data-open-menu-type="mouseenter"), opens and closes on press
  document.querySelectorAll(".mm-has-drop").forEach((li) => {
    const btn = li.querySelector("button");
    const list = li.querySelector(".mm-drop");
    // Like the original, put the open state on the button and list too (if only one li changes, some tools don’t notice the inner panel changed)
    const set = (on) => {
      [li, btn, list].forEach((n) => n.classList.toggle("is-open", on));
      btn.setAttribute("aria-expanded", String(on));
      if (!on && !header.matches(":hover")) header.classList.remove("is-hover");
    };
    // Even after the hand leaves, it stays open for .4s (original close delay) — if it returns in between, it stays as is
    let shut;
    li.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse") return; clearTimeout(shut); set(true); });
    li.addEventListener("pointerleave", (e) => { if (e.pointerType !== "mouse") return; shut = setTimeout(() => set(false), 400); });
    // The mouse opens on hover, so press toggles only for touch and keyboard
    btn.addEventListener("click", (e) => { if (e.pointerType === "mouse") return; set(!li.classList.contains("is-open")); });
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  });

  // Country · currency — click to open, closes on outside click or Esc
  document.querySelectorAll("[data-loc]").forEach((loc) => {
    const btn = loc.querySelector("button");
    const set = (on) => { loc.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", String(on)); };
    btn.addEventListener("click", () => set(!loc.classList.contains("is-open")));
    document.addEventListener("click", (e) => { if (!loc.contains(e.target)) set(false); });
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
  });

  // Drawer — enters from the side in .7s and the back scrim turns on. Close with the scrim, the close button or Esc
  const veil = document.querySelector("[data-drawer-veil]");
  let open = null;
  const close = () => {
    if (!open) return;
    open.classList.remove("is-open");
    veil.classList.remove("is-on");
    document.documentElement.style.overflow = "";
    open = null;
    if (!header.matches(":hover")) header.classList.remove("is-hover");
  };
  document.querySelectorAll("[data-drawer-open]").forEach((b) => b.addEventListener("click", () => {
    close();
    open = document.querySelector(`[data-drawer="${b.dataset.drawerOpen}"]`);
    open.classList.add("is-open");
    veil.classList.add("is-on");
    document.documentElement.style.overflow = "hidden";
  }));
  veil.addEventListener("click", close);
  document.querySelectorAll("[data-drawer-close]").forEach((b) => b.addEventListener("click", close));
  addEventListener("keydown", (e) => e.key === "Escape" && close());

  // Footer fold (phone) — .4s to the inner height
  document.querySelectorAll("[data-acc]").forEach((acc) => {
    const btn = acc.querySelector(".mm-acc__btn"), panel = acc.querySelector(".mm-acc__body");
    btn.addEventListener("click", () => {
      const on = !acc.classList.contains("is-open");
      acc.classList.toggle("is-open", on);
      btn.setAttribute("aria-expanded", String(on));
      panel.style.height = on ? `${panel.scrollHeight}px` : "0px";
    });
  });

  // Reviews row (hero page and About page) — three wide-screen cards, arrows move one card at a time in .4s
  document.querySelectorAll(".mm-reviews").forEach((r) => {
    if (!window.Swiper) return;
    new Swiper(r.querySelector(".mm-reviews__slider"), {
      slidesPerView: 1,
      spaceBetween: 0,
      speed: reduce ? 0 : 400,
      navigation: { prevEl: r.querySelector(".mm-reviews__prev"), nextEl: r.querySelector(".mm-reviews__next") },
      breakpoints: { 768: { slidesPerView: 2 }, 1200: { slidesPerView: 3 } },
    });
  });

  document.querySelectorAll("[data-to-top]").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })));
  document.querySelectorAll('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
})();
