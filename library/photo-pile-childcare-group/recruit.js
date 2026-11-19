// Recruiting info (original pageRecruitLoad · recruiting drawer · interview card hover).
// Head slick fade 1.2s every 3 seconds · interview card at x30 .6s easeOutQuart (delay .8) · name row slick .8s switching every 3.4 seconds,
//   just before advancing, the face folds to −90° on the Y axis at .75 scale and goes out over .3s easeInQuart, then the next face unfolds from 90° over .6s easeOutQuart
// Wide photo slick fade 1.2s every 4 seconds · interview cards: on hover 1.13x .2s easeOutCubic → 1.1x .8s spring, smiling photo .08s
//   On release .985 scale in .15s → 1 in .8s spring, smiling photo off in .15s easeOutQuad · on phone the card row eases at x100 over .8s easeOutQuart
// Recruit drawer: board .2s easeOutCubic · text .3s (delay .1) · content y45 .6s easeOutQuart · new image from x60 y-60 -15° in .9s easeOutQuart
//   Close: new .1s · text .2s easeOutCubic · panel .2s (delay .1)
(() => {
  const { TP } = window;
  const $ = window.jQuery;
  // Three interview cards — shared by the Careers and Interview pages. Hover reactions on wide screens only (original #wrap.pc)
  TP.ivCards = (box) => {
    const { reduced, isSP, ease } = TP;
    box.querySelectorAll(".rc-list li").forEach((li) => {
      const on = li.querySelector(".on");
      const enter = () => {
        if (isSP() || reduced) return;
        gsap.killTweensOf([li, on]);
        gsap.timeline().to(li, { scale: 1.13, duration: 0.2, ease: ease.outCubic }).to(li, { scale: 1.1, duration: 0.8, ease: ease.spring });
        gsap.to(on, { opacity: 1, duration: 0.08, ease: ease.outCubic });
      };
      const leave = () => {
        if (isSP() || reduced) return;
        gsap.killTweensOf([li, on]);
        gsap.timeline().to(li, { scale: 0.985, duration: 0.15, ease: "none" }).to(li, { scale: 1, duration: 0.8, ease: ease.spring });
        gsap.to(on, { opacity: 0, duration: 0.15, ease: ease.outQuad });
      };
      li.addEventListener("mouseenter", enter);
      li.addEventListener("mouseleave", leave);
    });
    const wrap = box.querySelector(".rc-list__wrap");
    const mm = gsap.matchMedia();
    mm.add("(max-width: 767px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(wrap, { opacity: 0, x: 100 });
      ScrollTrigger.create({ trigger: wrap, start: "top bottom-=100", once: true, onEnter: () => gsap.to(wrap, { opacity: 1, x: 0, duration: 0.8, ease: ease.outQuart }) });
    });

    return mm;
  };

  TP.page("recruit", {
    ready(box) {
      const { reduced, isSP, ease } = TP;
      const offs = [];
      const fade = { fade: true, speed: 1200, easing: "ease-out", autoplay: !reduced, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, draggable: false, accessibility: false, swipe: false, swipeToSlide: false, touchMove: false };
      const $main = $(box.querySelector(".rc-main__slide")).slick({ ...fade, autoplaySpeed: 3000 });
      const $wide = $(box.querySelector(".rc-slide")).slick({ ...fade, autoplaySpeed: 4000 });

      const card = box.querySelector(".rc-main__card");
      const faces = [...card.querySelectorAll(".rc-main__faces figure")];
      const $names = $(card.querySelector(".rc-main__names")).slick({ speed: 800, easing: "ease-out", autoplay: false, autoplaySpeed: 3400, infinite: true, arrows: false, dots: false, draggable: false, accessibility: false, pauseOnHover: false, swipe: false });
      $names.slick("setPosition");
      if (!reduced) $names.slick("slickPlay");
      gsap.set(faces, { opacity: 0 });
      gsap.set(faces[0], { opacity: 1 });
      let now = 0;
      $names.on("beforeChange", () => {
        const f = faces[now];
        now = (now + 1) % faces.length;
        const n = faces[now];
        gsap.killTweensOf(faces);
        gsap.fromTo(f, { opacity: 1, scale: 1, rotationY: 0 }, {
          opacity: 0, scale: 0.75, rotationY: -90, duration: 0.3, ease: ease.inQuart,
          onComplete: () => gsap.fromTo(n, { opacity: 0, scale: 0.75, rotationY: 90 }, { opacity: 1, scale: 1, rotationY: 0, duration: 0.6, ease: ease.outQuart }),
        });
      });
      if (reduced) gsap.set(card, { opacity: 1 });
      else gsap.fromTo(card, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.6, delay: 0.8, ease: ease.outQuart });

      const mm = TP.ivCards(box);

      // Recruit drawer
      const modal = box.querySelector(".rc-modal");
      const inner = modal.querySelector(".rc-modal__in");
      const detail = modal.querySelector(".rc-modal__detail");
      const pic = modal.querySelector(".rc-modal__pic");
      let keepY = 0;
      const open = () => {
        gsap.killTweensOf([modal, inner, detail, pic]);
        gsap.set(modal, { display: "block" });
        gsap.set(inner, { opacity: 1 });
        modal.setAttribute("aria-hidden", "false");
        gsap.to(modal, { opacity: 1, duration: reduced ? 0 : 0.2, ease: ease.outCubic });
        gsap.fromTo(detail, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.3, delay: reduced ? 0 : 0.1, ease: "none" });
        gsap.fromTo(detail, { y: reduced ? 0 : 45 }, { y: 0, duration: reduced ? 0 : 0.6, ease: ease.outQuart });
        gsap.fromTo(pic, { opacity: 0, x: 60, y: -60, rotation: -15 }, { opacity: 1, x: 0, y: 0, rotation: 0, duration: reduced ? 0 : 0.9, delay: reduced ? 0 : 0.1, ease: ease.outQuart });
        keepY = scrollY;
        document.body.classList.add("tp-noscroll");
        document.body.style.top = -keepY + "px";
      };
      const close = () => {
        gsap.killTweensOf([modal, inner, detail, pic]);
        gsap.to(pic, { opacity: 0, x: -10, y: 10, rotation: 4, duration: reduced ? 0 : 0.1, ease: "none" });
        gsap.to(inner, {
          opacity: 0, duration: reduced ? 0 : 0.2, ease: ease.outCubic,
          onComplete: () => {
            modal.querySelector(".rc-modal__job").scrollTop = 0;
            document.body.classList.remove("tp-noscroll");
            document.body.style.top = "";
            scrollTo(0, keepY);
          },
        });
        gsap.to(modal, { opacity: 0, duration: reduced ? 0 : 0.2, delay: reduced ? 0 : 0.1, ease: "none", onComplete: () => { gsap.set(modal, { display: "none" }); modal.setAttribute("aria-hidden", "true"); } });
      };
      box.querySelectorAll(".rc-job__btn").forEach((b) => b.addEventListener("click", open));
      modal.querySelector(".rc-modal__close").addEventListener("click", close);
      modal.querySelector(".rc-modal__bg").addEventListener("click", close);
      const esc = (e) => e.key === "Escape" && modal.style.display === "block" && close();
      addEventListener("keydown", esc);
      offs.push(() => removeEventListener("keydown", esc));

      return () => {
        offs.forEach((f) => f());
        mm.revert();
        document.body.classList.remove("tp-noscroll");
        [$main, $wide, $names].forEach(($s) => $s.hasClass("slick-initialized") && $s.slick("unslick"));
      };
    },
  });
})();
