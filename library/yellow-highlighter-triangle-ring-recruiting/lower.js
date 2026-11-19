// Subpage: About-people header (widens with scroll ratio, covers once the panel reaches the top), phone’s other-interview Swiper, INDEX current cell dot lights up
(() => {
  // About-people header — the scroll ratio until the panel touches the top of the screen goes into --progress, and is-overlay is set once it touches
  const kv = document.querySelector(".tg-pkv-sticky");
  if (kv) {
    let top = 1, tick = false;
    const measure = () => { top = Math.max(1, kv.getBoundingClientRect().top + scrollY); };
    const apply = () => {
      kv.style.setProperty("--progress", Math.max(0, Math.min(1, scrollY / top)).toFixed(4));
      kv.classList.toggle("is-overlay", scrollY >= top);
      tick = false;
    };
    const req = () => { if (!tick) { tick = true; requestAnimationFrame(apply); } };
    measure(); apply();
    addEventListener("scroll", req, { passive: true });
    addEventListener("resize", () => { measure(); req(); });
    addEventListener("load", () => { measure(); req(); });
  }

  // Other interviews — as in the original, hook up Swiper 8.4.7 (loop, 2 extra slides on each side) only when opened at phone width (767 or less). Desktop is a vertical list
  const iv = document.querySelector("[data-iv-swiper]");
  if (iv && window.Swiper && matchMedia("(max-width: 767px)").matches) {
    const n = iv.querySelectorAll(".swiper-slide").length, pad = (x) => String(x).padStart(3, "0");
    const cur = iv.querySelector("[data-iv-cur]");
    iv.querySelector("[data-iv-total]").textContent = pad(n);
    new Swiper(iv, {
      loop: n > 1, loopAdditionalSlides: 2,
      navigation: { nextEl: "[data-iv-next]", prevEl: "[data-iv-prev]" },
      on: { init: (sw) => { cur.textContent = pad(sw.realIndex + 1); }, slideChange: (sw) => { cur.textContent = pad(sw.realIndex + 1); } },
    });
  }

  const links = [...document.querySelectorAll("[data-index]")];
  const targets = [...document.querySelectorAll("[data-index-target]")];
  if (!links.length) return;
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("is-active", a.hash === `#${en.target.id}`));
  }), { rootMargin: "-50% 0px" });
  targets.forEach((t) => io.observe(t));
  links[0].classList.add("is-active");
})();
