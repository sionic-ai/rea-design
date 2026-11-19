// HQ detail panel: photo cluster floats up (screen 20%), size slider (Swiper 12.1.2 · 1.2 slides/12px, 768 and up 2.5 slides/20px, loop at 4 or more slides),
// Photo cell zoom window (←→, Esc), phone product/spec tabs, materials download expand, quote picker window, right drawer (remembers collapse for 7 days), phone header hide, back to top.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const fades = document.querySelectorAll(".js-fade-in");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es, ob) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-visible"); ob.unobserve(e.target); }
    }), { threshold: 0.2 });
    fades.forEach((el) => io.observe(el));
  } else fades.forEach((el) => el.classList.add("is-visible"));

  const size = document.querySelector("[data-size-carousel]");
  if (size && window.Swiper) {
    const host = size.parentElement;
    const slides = size.querySelectorAll(".swiper-slide").length;
    new Swiper(size, {
      slidesPerView: 1.2,
      spaceBetween: 12,
      watchOverflow: false,
      loop: slides >= 4,
      loopAdditionalSlides: 2,
      breakpoints: { 768: { slidesPerView: 2.5, spaceBetween: 20 } },
      navigation: { addIcons: false, prevEl: host.querySelector(".swiper-button-prev"), nextEl: host.querySelector(".swiper-button-next") },
    });
  }

  // Photo cell zoom window
  const cells = [...document.querySelectorAll("[data-gallery]")];
  const modal = document.querySelector("[data-gallery-modal]");
  if (modal && cells.length) {
    const img = modal.querySelector("[data-gallery-img]");
    let at = 0;
    const show = (i) => {
      at = (i + cells.length) % cells.length;
      img.dataset.label = cells[at].querySelector(".wf-img").dataset.label;
    };
    const close = () => { modal.hidden = true; document.body.style.overflow = ""; };
    cells.forEach((c, i) => c.addEventListener("click", () => { show(i); modal.hidden = false; document.body.style.overflow = "hidden"; }));
    modal.querySelector("[data-gallery-prev]").addEventListener("click", () => show(at - 1));
    modal.querySelector("[data-gallery-next]").addEventListener("click", () => show(at + 1));
    modal.querySelector("[data-gallery-close]").addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    document.addEventListener("keydown", (e) => {
      if (modal.hidden) return;
      if (e.key === "ArrowLeft") show(at - 1);
      else if (e.key === "ArrowRight") show(at + 1);
      else if (e.key === "Escape") close();
    });
  }

  // Phone tabs — on wide screens both are visible (css)
  const tabs = document.querySelectorAll("[data-tab]");
  const pick = (id) => {
    tabs.forEach((t) => t.classList.toggle("is-on", t.dataset.tab === id));
    document.querySelectorAll("[data-content]").forEach((c) => c.classList.toggle("is-on", c.dataset.content === id));
  };
  tabs.forEach((t) => t.addEventListener("click", () => pick(t.dataset.tab)));
  document.querySelector("[data-spec-link]")?.addEventListener("click", () => pick("2"));

  // Fetch data
  const drop = document.querySelector("[data-drop]");
  const dropBtn = drop?.querySelector("[data-drop-btn]");
  dropBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = drop.classList.toggle("is-open");
    dropBtn.setAttribute("aria-expanded", String(open));
    // Like the original (Bootstrap popper), the opened list is first drawn below the button, then on the next paint moved with transform to align with the button’s right edge
    const menu = drop.querySelector(".st-drop__menu");
    menu?.classList.toggle("is-open", open);
    if (open && menu) requestAnimationFrame(() => requestAnimationFrame(() => { menu.style.inset = "0 auto auto 0"; menu.style.transform = `translate(${dropBtn.offsetWidth - menu.offsetWidth}px, ${dropBtn.offsetHeight + 2}px)`; }));
    else if (menu) menu.removeAttribute("style");
  });
  document.addEventListener("click", () => { drop?.classList.remove("is-open"); dropBtn?.setAttribute("aria-expanded", "false"); const m = drop?.querySelector(".st-drop__menu"); m?.classList.remove("is-open"); m?.removeAttribute("style"); });

  // Quote picker window — adds the chosen sample value and rewrites the amount
  const cm = document.querySelector("[data-modal]");
  if (cm) {
    let target = null;
    const picked = new Map();
    const sum = () => {
      const total = [...picked.values()].reduce((a, b) => a + b, 0);
      document.querySelector("[data-price]").textContent = total.toLocaleString();
      document.querySelector("[data-price-notax]").textContent = Math.round(total / 1.1).toLocaleString();
    };
    document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", () => { target = b; cm.hidden = false; }));
    cm.querySelector("[data-modal-close]").addEventListener("click", () => { cm.hidden = true; });
    cm.addEventListener("click", (e) => { if (e.target === cm) cm.hidden = true; });
    cm.querySelector("[data-modal-done]").addEventListener("click", () => {
      const r = cm.querySelector("input:checked");
      if (r && target) {
        picked.set(target, +r.dataset.price);
        target.nextElementSibling.textContent = r.parentElement.textContent.trim();
        sum();
      }
      cm.hidden = true;
    });
  }

  // Right drawer — the original remembers the collapsed state for 7 days via a cookie
  const pop = document.querySelector("[data-pop]");
  if (pop) {
    if (document.cookie.includes("st-popup=1")) pop.classList.add("is-close");
    pop.querySelector("[data-pop-toggle]").addEventListener("click", () => {
      const closed = pop.classList.toggle("is-close");
      document.cookie = closed ? "st-popup=1; max-age=604800; path=/" : "st-popup=; max-age=0; path=/";
    });
  }

  // Phone hamburger
  const drawer = document.querySelector("[data-drawer]");
  document.querySelector("[data-burger-open]")?.addEventListener("click", () => drawer?.classList.add("is-open"));
  document.querySelectorAll("[data-burger-close]").forEach((b) => b.addEventListener("click", () => drawer?.classList.remove("is-open")));

  // Phone header — hides when scrolling down past 150px, reappears when scrolling up more than 40px
  const sp = document.querySelector(".st-sphead");
  let last = scrollY, upFrom = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (y < 150) sp?.classList.remove("is-hide");
    else if (y > last) { sp?.classList.add("is-hide"); upFrom = y; }
    else if (upFrom - y > 40) sp?.classList.remove("is-hide");
    last = y;
  }, { passive: true });

  document.querySelector("[data-pagetop]")?.addEventListener("click", (e) => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  });
})();
