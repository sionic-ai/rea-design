// First page: three Hero photos crossfade every 5s · collaboration carousel with seven-step paging (Swiper 8.4.2) and number buttons · video modal
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const slides = [...document.querySelectorAll(".ky-kv__slides li")];
  if (slides.length > 1 && !reduce) {
    let k = 0;
    addEventListener("ky:loaded", () => setInterval(() => {
      slides[k].classList.remove("is-active");
      k = (k + 1) % slides.length;
      slides[k].classList.add("is-active");
    }, 5000), { once: true });
  }

  // Collaboration carousel — original p-card2-carousel: auto 4s (continues even when pressed), center snap, loop back, 1s
  const carousel = document.querySelector("[data-carousel]");
  if (carousel) kySwiper(carousel, { autoplay: { delay: 4000, disableOnInteraction: false }, centeredSlides: true, loop: true, speed: 1000 });

  // Seven steps — original home-flow__list: no loop, .8s, number buttons drawn as custom pagination, tapping goes to that step
  const flow = document.querySelector("[data-flow]");
  if (flow) {
    const nav = flow.querySelector(".ky-flow__nav");
    kySwiper(flow, {
      centeredSlides: false, loop: false, speed: 800,
      pagination: {
        el: nav, type: "custom",
        renderCustom: (sw) => sw.slides.map((_, i) => `<li class="-bullets${i === sw.realIndex ? " is-active" : ""}" data-index="${i}"><button type="button" aria-label="${i + 1}Step"><span class="s">#</span><span class="n">${i + 1}</span></button></li>`).join(""),
      },
      on: {
        init(sw) { nav.addEventListener("click", (e) => { const li = e.target.closest("li.-bullets"); if (li) sw.slideTo(+li.dataset.index); }); },
        resize(sw) { sw.pagination.render(); },
      },
    });
  }

  const modal = document.querySelector(".ky-modal");
  if (modal) {
    const play = modal.querySelector(".ky-modal__play");
    const video = modal.querySelector("video");
    let stopT = 0;
    // Original ModalVideo: .5s after closing, stop the video, reset it to the start and show PLAY MOVIE again
    const open = (on) => {
      clearTimeout(stopT);
      modal.classList.toggle("is-visible", on);
      modal.setAttribute("aria-hidden", on ? "false" : "true");
      window.kyRehover?.();
      if (!on) stopT = setTimeout(() => { if (video) { video.pause(); video.currentTime = 0; } play.classList.remove("is-hidden"); }, 500);
      on ? window.lenis?.stop() : window.lenis?.start();
    };
    document.querySelectorAll("[data-movie-open]").forEach((b) => b.addEventListener("click", () => open(true)));
    modal.querySelectorAll("[data-movie-close]").forEach((b) => b.addEventListener("click", () => open(false)));
    play.addEventListener("click", () => { play.classList.add("is-hidden"); video?.play().catch(() => {}); });
    addEventListener("keydown", (e) => e.key === "Escape" && open(false));
  }
})();
