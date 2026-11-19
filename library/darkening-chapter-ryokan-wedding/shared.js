// Used by all pages — screen height variable, menu drawer, slider (Swiper 8.4.4, attached after 2 seconds like the original)
(() => {
  const root = document.documentElement;
  const setVh = () => root.style.setProperty("--vh", innerHeight / 100 + "px");
  setVh();
  let lastW = innerWidth, t = 0;
  addEventListener("resize", () => { clearTimeout(t); t = setTimeout(() => { if (innerWidth !== lastW) { lastW = innerWidth; setVh(); } }, 300); });

  // Menu drawer — original order: show (0) → curtain fade (10ms) → is-modal-active (100ms) → scroll lock and scrollbar gap fill (1s)
  const modal = document.querySelector(".nm-modal");
  const triggers = [...document.querySelectorAll("[data-menu]")];
  if (modal && triggers.length) {
    const inner = modal.querySelector(".nm-modal__in");
    const bar = innerWidth - document.body.clientWidth;
    let timers = [], back = null;
    const mark = (on) => triggers.forEach((b) => { b.classList.toggle("is-active", on); b.setAttribute("aria-expanded", on); });
    const open = (btn) => {
      back = btn;
      modal.classList.add("is-active");
      timers = [
        setTimeout(() => modal.classList.add("is-show"), 10),
        setTimeout(() => root.classList.add("is-modal-active"), 100),
        setTimeout(() => { inner.style.paddingRight = bar + "px"; root.classList.add("is-scrollable"); }, 1000),
        setTimeout(() => modal.querySelector("a")?.focus(), 1200),
      ];
      mark(true);
    };
    const close = () => {
      timers.forEach(clearTimeout);
      modal.classList.remove("is-show", "is-active");
      root.classList.remove("is-scrollable", "is-modal-active");
      inner.style.paddingRight = "";
      mark(false);
      back?.focus({ preventScroll: true });
    };
    triggers.forEach((b) => b.addEventListener("click", () => (modal.classList.contains("is-active") ? close() : open(b))));
    addEventListener("keyup", (e) => { if (e.key === "Escape" && modal.classList.contains("is-active")) close(); });
    const focusables = modal.querySelectorAll("a, button");
    focusables[focusables.length - 1]?.addEventListener("blur", () => { if (modal.classList.contains("is-active")) setTimeout(() => { if (!modal.contains(document.activeElement)) close(); }, 0); });
  }

  // Slider — the original common.js defaults (speed 600 · auto 6s · keyboard · diamond dots · prev/next) overridden per type.
  const sp = () => innerWidth <= 767;
  const make = (el, extra) => {
    const wrap = el.closest("[data-swiper-wrap]") || el.parentElement;
    const opts = {
      speed: 600,
      autoplay: { delay: 6000, disableOnInteraction: false },
      keyboard: { enabled: true },
      slidesPerView: "auto",
      pagination: { el: wrap.querySelector("[data-swiper-dots]"), clickable: true, renderBullet: (i, cls) => `<button class="${cls}" type="button"><span></span></button>` },
      navigation: { nextEl: wrap.querySelector("[data-swiper-next]"), prevEl: wrap.querySelector("[data-swiper-prev]") },
      a11y: { prevSlideMessage: "To previous section", nextSlideMessage: "To the next section", paginationBulletMessage: "{{index}}To section number", slideLabelMessage: "{{slidesLength}}Mid-Section {{index}}Nth" },
      ...extra,
    };
    return new Swiper(el, opts);
  };
  const boot = () => {
    if (typeof Swiper === "undefined") return;
    document.querySelectorAll("[data-swiper=fade]").forEach((el) => make(el, { loop: true, effect: "fade", fadeEffect: { crossFade: false } }));
    document.querySelectorAll("[data-swiper=free]").forEach((el) => make(el, { loop: el.dataset.loop === "true", speed: 800, freeMode: { enabled: !sp() } }));
  };
  // Like the original lazysizes, image slots are revealed over .3s on the frame after loading
  const unveil = () => requestAnimationFrame(() => document.querySelectorAll("[data-lazy]").forEach((el) => el.classList.add("is-loaded")));
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", unveil) : unveil();
  const start = () => setTimeout(boot, 2000);
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();
})();
