// About us (original pageAbout, pageAboutLoad).
// Header: block-frame photos unfold from the center (mask .8s easeInOutQuart, delay .45/.2 · photo .65→1 1.7s easeOutQuart) · slick fade 1.5s every 3.5 seconds (second frame .4s later)
// Tagline band width 0→100% .8s easeInOutQuart (delay .75/.85, phone 1.1/1.25) · fluff x-60 y-20 20° → 5° .9s easeOutQuart (delay 1.3, phone .8)
//       house tag switches on in .15s, pops up to 1.04x, then settles in .65s along a Velocity spring curve (delay 1.5, phone 1)
// Hand-drawn town: once past 400 (phone 200) px below the screen, the base chunk .9→1 .7s easeOutCubic, people y20 .6s easeOutQuad, fluff flies in diagonally 1.6s easeOutQuart
(() => {
  const { TP } = window;
  const $ = window.jQuery;
  TP.page("about", {
    ready(box) {
      const { reduced, isSP, ease } = TP;
      const sp = isSP();
      const title = box.querySelector(".ab-title");
      const logo = box.querySelector(".ab-outline__logo");
      if (logo && !logo.firstChild) logo.innerHTML = TP.icons.wide;
      const opts = { fade: true, speed: 1500, easing: "ease-out", autoplay: false, autoplaySpeed: 3500, pauseOnHover: false, pauseOnFocus: false, infinite: true, arrows: false, dots: false, slidesToShow: 1, draggable: false, accessibility: false, swipe: false, swipeToSlide: false, touchMove: false };
      const $i1 = $(box.querySelector(".ab-img1")).slick(opts);
      const $i2 = $(box.querySelector(".ab-img2")).slick(opts);
      const tweens = [];
      const later = (t) => (tweens.push(t), t);
      if (!reduced) {
        $i1.slick("slickPlay");
        later(gsap.delayedCall(0.4, () => $i2.slick("slickPlay")));
      }
      title.classList.add("is-anime");

      const spans = [...title.querySelectorAll("h2 span")];
      const pic = title.querySelector(".ab-title__pic");
      const house = title.querySelector(".ab-title__house");
      const d = sp ? { h: [1.1, 1.25], pic: 0.8, house: 1 } : { h: [0.75, 0.85], pic: 1.3, house: 1.5 };
      const sts = [];
      if (reduced) {
        gsap.set(spans, { width: "100%" });
        gsap.set(pic, { opacity: 1 });
        gsap.set(house, { opacity: 1 });
      } else {
        // Original: if inside the hero, immediately, otherwise when the line reaches the bottom edge of the screen (delay 0/.15)
        const h2 = title.querySelector("h2");
        const inView = (el, k = 1) => el.getBoundingClientRect().top + el.offsetHeight / k < innerHeight;
        const bands = (delays) => spans.forEach((s, i) => later(gsap.to(s, { width: "100%", duration: 0.8, delay: delays[i], ease: ease.inOutQuart })));
        if (inView(h2, sp ? 2.2 : 1)) bands(d.h);
        else { d.house = 1; sts.push(ScrollTrigger.create({ trigger: h2, start: "bottom bottom", once: true, onEnter: () => bands([0, 0.15]) })); }
        const flyPic = () => later(gsap.fromTo(pic, { x: -60, y: -20, rotation: 20 }, { opacity: 1, x: 0, y: 0, rotation: 5, duration: 0.9, delay: inView(pic) ? d.pic : 0, ease: ease.outQuart }));
        if (inView(pic)) flyPic();
        else sts.push(ScrollTrigger.create({ trigger: pic, start: "bottom bottom", once: true, onEnter: flyPic }));
        later(gsap.timeline({ delay: d.house })
          .to(house, { opacity: 1, scaleY: 1.04, duration: 0.15, ease: "none" })
          .to(house, { scaleY: 1, duration: 0.65, ease: ease.spring }));
      }

      const ill = box.querySelector(".ab-ill");
      const q = (c) => ill.querySelector(c);
      if (reduced) gsap.set(ill.querySelectorAll("svg"), { opacity: 1 });
      else {
        gsap.set([q(".p11"), q(".p21"), q(".p31")], { scale: 0.9 });
        gsap.set([q(".p12"), q(".p22"), q(".p32")], { y: 20 });
        gsap.set([q(".pf1"), q(".pf2")], { x: 100, y: -60, rotation: -5 });
        gsap.set(q(".pf3"), { x: 220, y: -20, rotation: -40 });
        sts.push(ScrollTrigger.create({
          trigger: ill, start: () => `top bottom-=${sp ? 200 : 400}`, once: true,
          onEnter: () => TP.tick(() => {
            [[".p11", 0.4], [".p21", 0.8], [".p31", 0.9]].forEach(([c, dl]) => gsap.to(q(c), { opacity: 1, scale: 1, duration: 0.7, delay: dl, ease: ease.outCubic }));
            [[".p12", 0.55], [".p22", 0.95], [".p32", 1.05]].forEach(([c, dl]) => gsap.to(q(c), { opacity: 1, y: 0, duration: 0.6, delay: dl, ease: ease.outQuad }));
            [[".pf1", 1.15], [".pf2", 1.3]].forEach(([c, dl]) => gsap.to(q(c), { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.6, delay: dl, ease: ease.outQuart }));
            gsap.to(q(".pf3"), { opacity: 1, x: 0, y: 0, rotation: 0, duration: 1.4, delay: 1.45, ease: ease.outQuart });
          }),
        }));
      }
      return () => {
        tweens.forEach((t) => t.kill());
        sts.forEach((s) => s.kill());
        [$i1, $i2].forEach(($s) => $s.hasClass("slick-initialized") && $s.slick("unslick"));
      };
    },
  });
})();
