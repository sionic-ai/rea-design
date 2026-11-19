// Home — same logic as the original inline script: slick 1.8.0 (hero fade 4s/2s · reviews fade 1s · phone reasons·cases swap 3s/1s),
// Ellipse open (top top → top 50% scrub) · blur (top -70% → bottom bottom) · horizontal slide · three reasons (absolute scroll 0 · 1000 · 2000) · review pin (> 900).
(() => {
  const $ = window.jQuery;
  const { reduced } = PC;
  // The original splits PC and phone branches just once by the initial width (wid) — it doesn’t split again if the window changes
  const wid = innerWidth;

  // Slot for the original background video — autoplay, muted, loop, playsinline. With reduced motion, hold on the first scene
  if (reduced) document.querySelector(".hm-video video")?.pause();

  const hero = $(".hm-slide__list");
  hero.slick({ fade: true, autoplay: !reduced, autoplaySpeed: 4000, adaptiveHeight: true, speed: 2000, arrows: false, dots: false, pauseOnFocus: false, pauseOnHover: false })
    .on({
      beforeChange(e, slick, cur, next) {
        $(".slick-slide", this).eq(cur).addClass("preve-slide");
        $(".slick-slide", this).eq(next).addClass("slide-animation");
      },
      afterChange() { $(".preve-slide", this).removeClass("preve-slide slide-animation"); },
    });
  hero.find(".slick-slide").eq(0).addClass("slide-animation");

  // The original turns off review autoplay by commenting it out, so only the first card shows
  $(".hm-review__list").slick({ fade: true, autoplaySpeed: 5000, adaptiveHeight: true, speed: 1000, arrows: false, dots: false, pauseOnFocus: false, pauseOnHover: false });
  const review = document.querySelector(".hm-review");
  if (review && wid > 767) {
    const fix = () => review.classList.toggle("is-fix", scrollY > 900);
    addEventListener("scroll", fix, { passive: true });
    fix();
  }

  if (wid < 767) {
    const auto = { autoplay: !reduced, autoplaySpeed: 3000, speed: 1000, arrows: false, pauseOnFocus: false, pauseOnHover: false };
    $(".hm-reason__scroll").slick(auto);
    $(".hm-case__posts").slick(auto);
  }

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set(".hm-reveal__mask", { clipPath: "ellipse(100% 100% at 50% 50%)" });
  });
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // As in the original, end comes before start, so it jumps to the end value the moment it passes top top, and the mask’s CSS transition .4s bridges the gap
    gsap.timeline({ scrollTrigger: { trigger: ".hm-reveal", start: "top top", end: "top 50%", scrub: true } })
      .to(".hm-reveal__mask", { clipPath: "ellipse(100% 100% at 50% 50%)", ease: "none" });
    gsap.timeline({ scrollTrigger: { trigger: ".hm-reveal", start: "top -70%", end: "bottom bottom", scrub: true } })
      .to(".hm-reveal__mask .wf-img", { filter: "blur(16px)" });

    if (wid <= 767) return;
    const wrap = document.querySelector(".hm-horiz");
    const inner = document.querySelector(".hm-horiz__wrap");
    const horiz = gsap.to(inner, {
      x: () => -(inner.clientWidth - wrap.clientWidth),
      ease: "none",
      scrollTrigger: { trigger: wrap, start: "top top", end: () => `+=${inner.clientWidth - wrap.clientWidth}`, scrub: true, pin: true, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.utils.toArray(".hm-horiz__box").forEach((box) => {
      gsap.fromTo(box, { opacity: 1 }, { opacity: 0, scrollTrigger: { trigger: box, start: "center center", containerAnimation: horiz, toggleActions: "play reverse play reverse" } });
    });

    // Three reasons — the original gives start as a number (0·1000·2000), an absolute position from the top of the document. The check finishes before reaching the section
    // On reaching the section, the third panel that was last switched off stays on and pinned for 3000px. Kept exactly as the original behaves
    const secs = [...document.querySelectorAll(".hm-reason__sec")];
    const dots = [...document.querySelectorAll(".hm-reason__pager i")];
    const step = 1000;
    secs.forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec, toggleActions: "play reverse play reverse", start: `${step * i}`, end: `+=${step}`,
        onToggle: () => {
          secs.forEach((s, j) => s.classList.toggle("is-active", i === j));
          dots.forEach((d, j) => d.classList.toggle("is-active", i === j));
        },
      });
    });
    gsap.to(".hm-reason__scroll", { scrollTrigger: { pin: ".hm-reason", end: `+=${step * secs.length}`, pinSpacing: true } });
  });
})();
