// Home page: MV photo fade (0.5s, 5s autoplay) · photo strip (RTL 10s linear, 2.5 slides) · text strip (15s linear, 1.5 slides) · reviews (centered 1.2/2 slides, 0.5s, 5s autoplay) ·
// Instagram strip (RTL 35s linear) — same Swiper 6.8.4 and same settings as the original. One random speech bubble every 1.5s, avoiding overlapping clusters.
(() => {
  const { reduce } = window.ARC;
  const linear = (o) => (reduce ? { ...o, autoplay: false } : o);

  // Review face: stands in for the original’s line-art face illustration — shoulders inside a beige circle, five hairstyle variants (drawn before the slider makes loop clones)
  const hair = [
    '<circle class="a-f-yellow a-s-ink" stroke-width="2" cx="60" cy="24" r="11"/><path class="a-f-yellow a-s-ink" stroke-width="2" d="M36 58c0-18 10-28 24-28s24 10 24 28c-8-8-15-12-24-12s-16 4-24 12z"/>',
    '<path class="a-f-yellow a-s-ink" stroke-width="2" d="M33 72c-2-26 8-42 27-42s29 16 27 42l-6-2c0-12-2-20-6-24-8 6-20 8-34 8l-1 18z"/>',
    '<path class="a-f-ink" d="M37 54c0-16 9-25 23-25s23 9 23 25c-6-6-13-9-23-9s-17 3-23 9z"/>',
    '<path class="a-f-yellow a-s-ink" stroke-width="2" d="M32 96c-6-34 2-66 28-66s34 32 28 66l-8-2c4-20 2-34-4-42-10 6-22 8-36 8-2 12 0 24 2 34z"/>',
    '<path class="a-f-yellow a-s-ink" stroke-width="2" d="M36 56c0-16 10-26 24-26s24 10 24 26c-4-4-8-6-12-7-2 4-6 6-10 6s-8-2-10-6c-6 1-11 3-16 7z"/>',
  ];
  const face = (i) => `<svg viewBox="0 0 120 120" aria-hidden="true"><circle class="a-f-rule" cx="60" cy="60" r="60"/><path class="a-f-surface a-s-ink" stroke-width="2" d="M24 122c2-22 16-34 36-34s34 12 36 34z"/><circle class="a-f-surface a-s-ink" stroke-width="2" cx="60" cy="60" r="24"/>${hair[i % hair.length]}<circle class="a-f-ink" cx="51" cy="62" r="2"/><circle class="a-f-ink" cx="69" cy="62" r="2"/><path class="a-s-ink" fill="none" stroke-width="2" stroke-linecap="round" d="M54 72q6 5 12 0"/><g class="a-f-yellow"><circle cx="48" cy="104" r="2"/><circle cx="60" cy="108" r="2"/><circle cx="72" cy="104" r="2"/></g></svg>`;
  document.querySelectorAll("[data-face]").forEach((f) => { f.innerHTML = face(+f.dataset.face); });

  const start = () => {
    new Swiper(".js-mv-swiper", { speed: 500, loop: true, effect: "fade", autoplay: reduce ? false : { delay: 5000 } });
    new Swiper(".js-fun-swiper", linear({ speed: 10000, loop: true, slidesPerView: 1.5, spaceBetween: 10, autoplay: { delay: 0 }, breakpoints: { 768: { speed: 10000, slidesPerView: 2.5, spaceBetween: 20 } } }));
    new Swiper(".js-fun-text-swiper", linear({ speed: 15000, loop: true, slidesPerView: 1, spaceBetween: 20, autoplay: { delay: 0 }, breakpoints: { 768: { slidesPerView: 1.5 } } }));
    new Swiper(".js-voice-swiper", {
      speed: 500, loop: true, slidesPerView: 1.2, spaceBetween: 12, centeredSlides: true,
      autoplay: reduce ? false : { delay: 5000 },
      pagination: { el: ".js-voice-dots", clickable: true },
      navigation: { nextEl: ".js-voice-next", prevEl: ".js-voice-prev" },
      breakpoints: { 768: { speed: 500, slidesPerView: 2, spaceBetween: 20 } },
    });
    new Swiper(".js-insta-swiper", linear({ speed: 35000, loop: true, slidesPerView: "auto", spaceBetween: 0, loopedSlides: 5, autoplay: { delay: 0 } }));
  };
  // The original sets up the slider after everything, images included, has loaded (load)
  if (document.readyState === "complete") start(); else addEventListener("load", start, { once: true });

  // ── Speech bubble ──
  const list = document.querySelector(".js-issue-list");
  if (list) {
    const items = [...list.children];
    const sp = matchMedia("(max-width: 767px)");
    const place = () => items.forEach((li) => {
      if (!li.dataset.pc) li.dataset.pc = li.getAttribute("style") || "";
      li.setAttribute("style", sp.matches ? li.dataset.sp : li.dataset.pc);
    });
    place();
    sp.addEventListener("change", place);
    if (reduce) {
      items.slice(0, 2).forEach((li) => li.classList.add("is-active"));
    } else {
      let z = 1, began = false;
      const pick = () => {
        z++;
        const narrow = innerWidth <= 768;
        const key = narrow ? "overlapMobile" : "overlapPc";
        const hold = narrow ? 5000 : 8000;
        const busy = new Set(items.filter((li) => li.classList.contains("is-active")).flatMap((li) => (li.dataset[key] ? li.dataset[key].split(",") : [])));
        const free = items.filter((li) => !li.classList.contains("is-active") && !(li.dataset[key] ? li.dataset[key].split(",") : []).some((g) => busy.has(g)));
        if (!free.length) return;
        const li = free[Math.floor(Math.random() * free.length)];
        li.style.zIndex = z;
        li.classList.add("is-active");
        setTimeout(() => li.classList.remove("is-active"), hold);
      };
      const begin = () => {
        if (began) return;
        began = true;
        for (let i = 0; i < 2; i++) items[i].classList.add("is-active");
        const first = innerWidth <= 768 ? 3000 : 4000;
        for (let i = 0; i < 3; i++) setTimeout(() => items[i].classList.remove("is-active"), first + 2000 * i);
        setInterval(pick, 1500);
      };
      ScrollTrigger.create({ trigger: list, start: "top bottom", onEnter: begin });
    }
  }

  // ── Full review window ──
  const modal = document.querySelector(".js-voice-modal");
  if (modal) {
    const set = (sel, v) => { const el = modal.querySelector(sel); if (el) el.textContent = v; };
    const open = (card) => {
      const meta = card.querySelectorAll(".i-vcard__meta p:first-child > *");
      const who = card.querySelectorAll(".i-vcard__who span");
      set(".js-modal-time", meta[0]?.textContent || "");
      set(".js-modal-name", meta[1]?.textContent || "");
      set(".js-modal-who", who[0]?.textContent || "");
      set(".js-modal-paper", who[1]?.textContent || "");
      set(".js-modal-course", card.querySelector(".i-tag")?.textContent || "");
      set(".js-modal-text", card.querySelector(".i-vcard__text")?.textContent || "");
      const pic = modal.querySelector(".js-modal-face");
      if (pic) pic.innerHTML = card.querySelector("[data-face]")?.innerHTML || "";
      document.body.classList.add("is-locked");
      modal.classList.add("is-active");
    };
    const close = () => {
      modal.classList.remove("is-active");
      document.body.classList.remove("is-locked");
      setTimeout(() => { modal.querySelector(".i-modal__inner").scrollTop = 0; }, 200);
    };
    // The slider makes clones for looping, so we receive events via delegation
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".js-voice-card");
      if (card) open(card);
    });
    modal.querySelector(".js-modal-close").addEventListener("click", close);
    modal.querySelector(".js-modal-overlay").addEventListener("click", close);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-active")) close(); });
  }
})();
