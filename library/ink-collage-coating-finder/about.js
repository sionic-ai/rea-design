(() => {
  const { reduce } = window.arSite;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // One line below the header — each letter, .1s apart, drops in from the upper left tilted −3° with .2rem blur (1.2s)
  $$(".js-txtAnime").forEach((t) => {
    const text = t.textContent.trim();
    t.textContent = "";
    [...text].forEach((c, i) => {
      if (c === " ") { t.append(" "); return; }
      const s = document.createElement("span");
      s.className = "js-txt";
      s.style.animationDelay = `${i * 0.1}s`;
      s.textContent = c;
      t.append(s);
    });
  });

  // Show more — collapsed at a height of 77.2rem and expands fully on press (.7s)
  const more = $(".js-more_btn");
  const content = $(".js-more_content");
  const label = $(".js-more_txt");
  more.addEventListener("click", () => {
    const open = content.classList.toggle("is-open");
    more.classList.toggle("is-open", open);
    label.textContent = open ? "Close" : "See more";
    content.style.maxHeight = open ? `${content.scrollHeight}px` : "";
  });

  // When the table scrolls sideways, narrow the header cell
  const table = $(".js-table");
  let timer;
  table.addEventListener("scroll", () => {
    if (table.scrollLeft > 0) table.classList.add("is-scroll");
    clearTimeout(timer);
    timer = setTimeout(() => { if (table.scrollLeft === 0) table.classList.remove("is-scroll"); }, 200);
  });

  // Product modal — turn the veil on first, lock document scroll .35s later, then open the panel .55s after that (Swiper loop, slide .6s, no manual drag). On close the panel goes first, the veil .3s later
  const modal = $(".p-product_modal");
  const overlay = $(".p-product_modal_overlay");
  const html = document.documentElement;
  const bar = innerWidth - html.clientWidth;
  html.style.setProperty("--scrollbarWidth", `${bar}px`);
  const swiper = new Swiper(modal, { loop: true, speed: reduce ? 0 : 600, allowTouchMove: false, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" } });
  $$(".p-product_btn").forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    swiper.slideToLoop(+btn.dataset.modal, 0);
    overlay.classList.add("is-open");
    modal.scrollTop = 0;
    window.arLenis.stop();
    setTimeout(() => { html.style.overflow = "hidden"; }, reduce ? 0 : 350);
    setTimeout(() => { modal.classList.add("is-open"); document.body.style.paddingRight = `${bar}px`; }, reduce ? 0 : 550);
  }));
  const close = () => {
    modal.classList.remove("is-open");
    setTimeout(() => {
      overlay.classList.remove("is-open");
      document.body.style.paddingRight = "0px";
      html.style.overflow = "";
      window.arLenis.start();
    }, reduce ? 0 : 300);
  };
  $$(".p-product_modal_close").forEach((b) => b.addEventListener("click", close));
  overlay.addEventListener("click", close);
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("is-open")) close(); });

  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())));
  $$(".js-video").forEach((v) => io.observe(v));
})();
