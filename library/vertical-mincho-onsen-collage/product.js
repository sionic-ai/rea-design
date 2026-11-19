/* Rooms — original values: hovering a thumbnail lays that room’s photo as the screen background (.6s) and the text turns white (html.is-white),
   Swiper per room (1s, staggered) — click the 20% paging zones on either side of the photo to turn, and the cursor becomes a Next/Prev circle,
   ”Details” folds and unfolds in .2s (swing easing of jQuery slideToggle), and the left index lights the room crossing the screen center. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const html = document.documentElement;

  if (BK.fine) $$(".m-roomGallery a").forEach((a) => {
    a.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && html.classList.add("is-white"));
    a.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && html.classList.remove("is-white"));
  });

  if (window.Swiper) $$(".p-room-item__slide").forEach((box) => {
    const next = $(".hover-next", box), prev = $(".hover-prev", box);
    const s = new Swiper($(".slide__container", box), {
      speed: 1000, loop: false, allowTouchMove: true, parallax: true,
      pagination: { el: $(".slide__pagination", box), type: "bullets", clickable: true, renderBullet: (i, cls) => `<span class="${cls}"></span>` },
    });
    const edge = () => { next.classList.toggle("swiper-button-disabled", s.isEnd); prev.classList.toggle("swiper-button-disabled", s.isBeginning); };
    // The original doesn’t block at first, and blocks both ends only after passing through
    s.on("slideChange", edge);
    next.addEventListener("click", (e) => { e.preventDefault(); s.slideNext(); });
    prev.addEventListener("click", (e) => { e.preventDefault(); s.slidePrev(); });
  });

  $$(".ui-ac__toggle").forEach((t) => {
    const ac = t.closest(".ui-ac"), body = t.nextElementSibling;
    gsap.set(body, { height: 0, overflow: "hidden", display: "none" });
    t.addEventListener("click", (e) => {
      e.preventDefault();
      const open = !t.classList.contains("is-show");
      ac.classList.toggle("is-current", open);
      t.classList.toggle("is-show", open);
      if (open) { gsap.set(body, { display: "block" }); gsap.fromTo(body, { height: 0 }, { height: "auto", duration: 0.2, ease: "sine.inOut", onComplete: () => ScrollTrigger.refresh() }); }
      else gsap.to(body, { height: 0, duration: 0.2, ease: "sine.inOut", onComplete: () => { gsap.set(body, { display: "none" }); ScrollTrigger.refresh(); } });
    });
  });

  const links = $$(".js-ankNav__list a");
  const io = new IntersectionObserver((list) => list.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${e.target.id}`));
  }), { rootMargin: "-50% 0px", threshold: 0 });
  $$(".js-ankNav-sec").forEach((s) => io.observe(s));
})();
