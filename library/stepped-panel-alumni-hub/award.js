// Year tabs, image cells, video — as in the original award.js: on wide screens the year row is a Swiper (own width, arrows if it overflows), at 767px and below it is a collapsing select box.
// The image area is a Swiper thumbnail set, video plays on press (controls bar on) and stops on another press, and the cover uses a drawn .5s frame
(() => {
  document.querySelectorAll(".year-slider").forEach((box) => {
    const list = box.querySelector(".js-year-slider");
    if (!list) return;
    const years = [...list.querySelectorAll(".swiper-slide")];
    const pick = (y) => { list.querySelector(".swiper-slide.active")?.classList.remove("active"); y.classList.add("active"); };
    if (innerWidth <= 767) {
      const cur = document.createElement("button");
      cur.type = "button";
      cur.className = "year-current";
      cur.textContent = list.querySelector(".swiper-slide.active")?.textContent.trim() ?? "";
      box.prepend(cur);
      cur.addEventListener("click", () => box.classList.toggle("is-open"));
      years.forEach((y) => y.addEventListener("click", () => { pick(y); cur.textContent = y.textContent.trim(); box.classList.remove("is-open"); }));
      return;
    }
    new Swiper(list, { slidesPerView: "auto", navigation: { nextEl: box.querySelector(".swiper-button-next"), prevEl: box.querySelector(".swiper-button-prev") }, watchOverflow: true });
    years.forEach((y) => y.addEventListener("click", () => pick(y)));
  });

  document.querySelectorAll(".gallery").forEach((g) => {
    const main = g.querySelector(".js-gallery-main"), thumbsEl = g.querySelector(".js-gallery-thumbs");
    if (!main || !thumbsEl) return;
    const thumbs = new Swiper(thumbsEl, { slidesPerView: "auto", spaceBetween: 12, watchSlidesProgress: true, slideToClickedSlide: true, threshold: 5 });
    const sw = new Swiper(main, { spaceBetween: 0, threshold: 5, thumbs: { swiper: thumbs } });
    thumbsEl.querySelectorAll(".swiper-slide").forEach((t, i) => t.addEventListener("click", () => sw.slideTo(i)));
  });

  document.querySelectorAll(".gallery video").forEach((v) => {
    const fig = v.closest("figure");
    if (!fig) return;
    fig.addEventListener("click", (e) => {
      if (e.target === v) return;
      if (v.paused) { v.play(); fig.classList.add("is-playing"); v.controls = true; } else v.pause();
    });
    v.addEventListener("click", () => (v.paused ? v.play() : v.pause()));
    v.addEventListener("loadedmetadata", () => { v.currentTime = Math.min(0.5, v.duration); });
    v.addEventListener("seeked", () => {
      const cv = document.createElement("canvas");
      cv.width = v.videoWidth; cv.height = v.videoHeight;
      cv.getContext("2d")?.drawImage(v, 0, 0, cv.width, cv.height);
      v.setAttribute("poster", cv.toDataURL("image/jpeg"));
      v.currentTime = 0;
    }, { once: true });
  });
})();
