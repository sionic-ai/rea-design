// Shared by all pages — menu drawer open/close, shrinking the phone header wordmark after scrolling past 180px, turning on photos that enter the screen,
// Bottom overlay strip (remembers collapsed state), floating vertical video (next every 5 seconds · pause · close), load more new posts, planning slider (Swiper 4.5.0).
(() => {
  const root = document.documentElement, body = document.body;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const setMenu = (open) => {
    body.classList.toggle("is-menu-open", open);
    document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.setAttribute("aria-expanded", String(open)));
  };
  document.querySelectorAll("[data-menu-toggle]").forEach((b) => b.addEventListener("click", () => setMenu(!body.classList.contains("is-menu-open"))));
  document.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  const onScroll = () => body.classList.toggle("is-scrolled", scrollY > 180);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Original .scroll-fade-in — turns on once when even slightly visible
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
  }));
  document.querySelectorAll(".hk-fade").forEach((el) => io.observe(el));

  // Overlay strip — remembers what was folded and opens it folded again on the next page
  const ov = document.querySelector(".hk-ov__input");
  if (ov) {
    if (localStorage.getItem("hk-ov-closed") === "1") ov.checked = false;
    ov.addEventListener("change", () => localStorage.setItem("hk-ov-closed", ov.checked ? "0" : "1"));
  }
  requestAnimationFrame(() => root.classList.add("is-ov-ready"));

  // Floating vertical video — 5s per section, and when the top bar fills it moves to the next section
  const story = document.querySelector(".hk-story");
  if (story) {
    const frames = [...story.querySelectorAll(".hk-story__frame")], bar = story.querySelector(".hk-story__bar i");
    let i = 0, t = 0, last = performance.now(), paused = reduce;
    if (reduce) story.classList.add("is-paused");
    const tick = (now) => {
      const dt = Math.max(0, now - last); last = now;
      if (!paused && !story.classList.contains("is-closed")) {
        t += dt;
        if (t >= 5000) { t = 0; frames[i].classList.remove("is-on"); i = (i + 1) % frames.length; frames[i].classList.add("is-on"); }
        bar.style.width = `${(t / 5000) * 100}%`;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    story.querySelector(".hk-story__pause").addEventListener("click", () => { paused = !paused; story.classList.toggle("is-paused", paused); });
    story.querySelector(".hk-story__close").addEventListener("click", () => story.classList.add("is-closed"));
  }

  // Read more — turns on the hidden text and scrolls down to 150px above its first line in .7s (swing easing of the original jQuery animate)
  document.querySelectorAll("[data-show-more]").forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    const main = btn.closest(".hk-main");
    main.classList.add("is-opened");
    const first = main.querySelector("li.is-more");
    if (!first) return;
    const to = Math.max(0, first.getBoundingClientRect().top + scrollY - 150), from = scrollY;
    if (reduce) return scrollTo(0, to);
    root.style.scrollBehavior = "auto";
    const o = { p: 0 };
    gsap.to(o, { p: 1, duration: 0.7, ease: (p) => 0.5 - Math.cos(p * Math.PI) / 2, onUpdate: () => scrollTo(0, from + (to - from) * o.p), onComplete: () => { root.style.scrollBehavior = ""; } });
  }));

  // Planning slider — original swiper_pickup: four visible, advances two at a time in 1.3s, auto-advances every 6s (two visible at 813px and below)
  window.hkPickup = (sel, delay) => {
    document.querySelectorAll(sel).forEach((el) => new Swiper(el, {
      slidesPerView: 4, slidesPerGroup: 2, breakpoints: { 813: { slidesPerView: 2 } }, speed: 1300, spaceBetween: 20, loop: true,
      autoplay: reduce ? false : { delay, disableOnInteraction: true }, grabCursor: true, keyboard: { enabled: true },
    }));
  };
  window.hkPickup(".hk-swiper-pickup", 6000);
})();
