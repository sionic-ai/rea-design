/* Home — original pageTop() and pageTopLoad(): first-visit curtain, frame slideshow (slick 1.8.1 center aligned), island illustration drop and speech bubble */
(() => {
  const { E } = MK;
  let offs = [];

  const caseSlide = ($c) => {
    const $slide = $c.find(".top-case-slide");
    const $nav = $c.find(".top-main .txt ul");
    $slide.on("beforeChange", function (e, slick, cur, next) {
      const $a = $("article", this);
      const max = $("article:not(.slick-cloned)", this).length;
      $a.removeClass("active scale scale-left scale-right after prev next");
      if (cur === max - 1 && next === 0) {
        $a.eq(cur + 1).addClass("prev"); $a.eq(cur + 2).addClass("prev"); $a.eq(cur + 3).addClass("scale scale-left"); $a.eq(cur + 4).addClass("next");
        $a.eq(next + 1).addClass("prev"); $a.eq(next + 2).addClass("scale scale-left"); $a.eq(next + 3).addClass("next");
        if (MK.topCaseStart === false) { $a.eq(cur + 2).addClass("after"); $a.eq(next + 1).addClass("after"); }
      } else if (cur === 0 && next === max - 1) {
        $a.eq(0).addClass("prev"); $a.eq(1).addClass("scale scale-right"); $a.eq(2).addClass("next"); $a.eq(3).addClass("next");
        $a.eq(next + 1).addClass("prev"); $a.eq(next + 2).addClass("scale scale-right"); $a.eq(next + 3).addClass("next after");
      } else {
        $a.eq(next + 2).addClass(next > cur ? "scale scale-left" : "scale scale-right");
        $a.each(function (i) { if (i < next + 2) $(this).addClass("prev"); else if (i > next + 2) $(this).addClass("next"); });
        $a.eq(cur + 2).addClass("after");
      }
    });
    $slide.on("afterChange", function (e, slick, cur) { $("article", this).eq(cur + 2).addClass("active"); });
    $slide.slick({
      fade: false, speed: 500, easing: "ease-out", autoplay: false, autoplaySpeed: 5000, pauseOnHover: false, pauseOnFocus: false,
      infinite: true, arrows: true, dots: false, slidesToShow: 1, centerMode: true, centerPadding: MK.isPc() ? "25vw" : "20vw",
      variableWidth: false, draggable: true, accessibility: true, swipe: true, swipeToSlide: true, touchMove: true, asNavFor: $nav,
    });
    $nav.slick({ asNavFor: $slide, speed: 0, arrows: false, slidesToShow: 5, slidesToScroll: 1, focusOnSelect: true });
    return $slide;
  };

  /* First-visit curtain — rises over .4s easeInSine after a .4s delay, letters .04s apart at .4s easeOutQuart, five images fly in. Closes at 3s */
  const intro = (c, $slide) => {
    const it = c.querySelector(".top-intro");
    const head = document.querySelector("header");
    const main = c.querySelector(".top-main"), tc = c.querySelector(".top-case");
    const done = () => {
      MK.topCaseStart = true;
      $slide.slick("slickPlay"); $slide.slick("slickNext");
      gsap.set(main, { opacity: 1 });
    };
    if (MK.reduce || !it) {
      if (it) it.style.display = "none";
      gsap.set([head, main, tc], { opacity: 1 });
      $slide.slick("slickGoTo", 0, true);
      $c(c).find(".top-case-slide article").eq(2).addClass("active");
      return;
    }
    MK.lock();
    $slide.slick("slickGoTo", 4, true);
    const pics = [...it.querySelectorAll(".pic1, .pic2, .pic3, .pic4, .pic5")];
    const tl = gsap.timeline({ delay: 0.4 });
    tl.set(it, { opacity: 0, y: 45 });
    tl.to(it, { opacity: 1, y: 0, duration: 0.4, ease: E.inSine }, 0);
    const spans = [...it.querySelectorAll("h2 span")];
    const hh = (spans[0]?.offsetHeight || 40) + 1;
    spans.forEach((s, n) => {
      const ch = s.querySelectorAll("i");
      tl.set(ch, { y: hh }, 0);
      tl.to(ch, { y: 0, duration: 0.4, ease: E.outQuart, stagger: 0.04 }, n === 0 ? 0 : 0.9);
    });
    tl.set(pics, { opacity: 1 }, 0);
    const w = (el) => el.offsetWidth, h = (el) => el.offsetHeight;
    const [p1, p2, p3, p4, p5] = pics;
    const pc = MK.isPc();
    tl.fromTo(p1, { x: -w(p1), y: h(p1) * 0.1 }, { x: 0, y: 0, duration: 1.1, ease: E.outCubic }, 0);
    tl.fromTo(p2, { scale: 1.15, x: -w(p2) * 0.5, y: h(p2) * 1.15 }, { scale: 1, x: 0, y: 0, duration: 0.6, ease: E.outCubic }, 0);
    tl.fromTo(p3, { scale: 1.15, x: w(p3) * 0.5, y: h(p3) * 1.15 }, { scale: 1, x: 0, y: 0, duration: 0.6, ease: E.outCubic }, 0.05);
    tl.fromTo(p4, { scale: 1.05, x: w(p4) * 1.05, y: h(p4) * 0.1 }, { scale: 1, x: 0, y: 0, duration: 1.1, ease: E.inOutSine }, 0);
    tl.fromTo(p5, { scale: 1.05, x: pc ? w(p5) * 1.5 : -w(p5) * 1.5, y: pc ? -h(p5) * 1.5 : -h(p5) * 0.1 }, { scale: 1, x: 0, y: 0, duration: 0.6, ease: E.outCubic }, 0.1);
    // Original Velocity queueing: a 2.2s wait follows the rise-in (.4s), so it closes at 3s from the start
    tl.addLabel("close", 2.6);
    const off = [[-10, 0], [-20, 20], [20, 20], [10, 0], pc ? [20, -20] : [-20, 10]];
    pics.forEach((p, i) => tl.to(p, { opacity: 0, x: off[i][0], y: off[i][1], duration: 0.15, ease: E.inQuad, overwrite: true }, "close"));
    tl.to(it.querySelectorAll("h2 span i"), { y: hh, duration: 0.15, ease: E.inQuad }, "close");
    tl.to(it, { opacity: 0, scale: 1.1, duration: 0.2, ease: E.outQuad, onComplete: () => { it.style.display = "none"; done(); } }, "close+=0.15");
    tl.to(tc, { opacity: 1, duration: 0.2, ease: E.inQuad, onComplete: () => (MK.topCaseStart = false) }, "close+=0.35");
    tl.call(() => {
      gsap.set(head, { opacity: 1 });
      const $a = $(c).find(".top-case-slide .slick-current");
      $a.prev().addClass("prev"); $a.next().addClass("next");
      MK.unlock();
    }, null, "close");
    offs.push(() => tl.kill());
  };
  const $c = (el) => $(el);

  /* Island illustration — when 100px from the bottom is visible the island squishes and bounces, animals drop down, and a flying squirrel glides in from the top left */
  const island = (c) => {
    const npc = c.querySelector(".nav-pic-case");
    if (!npc) return;
    const cases = [...npc.querySelectorAll(".case")], mom = npc.querySelector(".momonga"), isl = npc.querySelector(".island");
    let fired = false;
    const go = () => {
      if (fired) return;
      const r = npc.getBoundingClientRect();
      if (r.bottom - 100 > innerHeight) return;
      fired = true;
      if (MK.reduce) { gsap.set([...cases, mom], { opacity: 1 }); npc.classList.add("active"); return; }
      gsap.fromTo(mom, { opacity: 0, x: -120, y: -140 }, { opacity: 1, x: 0, y: 0, duration: 0.9, delay: 0.6, ease: E.outQuart });
      gsap.fromTo(mom.querySelector("a > span"), { y: 80, rotation: 45 }, { y: 0, rotation: 0, duration: 1.1, delay: 0.6, ease: E.outQuart });
      gsap.set(cases, { y: 30 });
      gsap.timeline().to(isl, { scaleX: 1.02, scaleY: 0.95, duration: 0.4, ease: E.outQuad })
        .to(isl, { scaleX: 0.98, scaleY: 1.02, duration: 0.2, ease: E.outQuad })
        .to(isl, { scaleX: 1, scaleY: 1, duration: 0.4, ease: E.spring });
      gsap.timeline({ delay: 0.4 }).to(cases, { opacity: 1, y: -10, duration: 0.25, ease: E.inOutCubic })
        .to(cases, { y: 5, duration: 0.25, ease: E.inCubic })
        .to(cases, { y: 0, duration: 0.25, ease: E.spring })
        .call(() => {
          npc.classList.add("active");
          gsap.to(npc.querySelectorAll(".case .btn"), { opacity: 0, y: 10, duration: 0.2, delay: 0.6, ease: E.outQuad });
          npc.dispatchEvent(new CustomEvent("fx:start"));
        });
    };
    addEventListener("scroll", go, { passive: true });
    go();
    offs.push(() => removeEventListener("scroll", go));
    const hov = (e) => {
      const t = e.target.closest(".case, .momonga");
      if (!t || !MK.isPc()) return;
      if (e.type === "mouseover") { npc.querySelectorAll(".case, .momonga").forEach((n) => n.classList.remove("active")); t.classList.add("active"); }
      else if (!t.contains(e.relatedTarget)) t.classList.remove("active");
    };
    const tap = (e) => {
      if (MK.isPc()) return;
      const t = e.target.closest(".case, .momonga");
      npc.querySelectorAll(".case, .momonga").forEach((n) => n.classList.remove("active"));
      if (t && !t.classList.contains("active")) { t.classList.add("active"); }
    };
    npc.addEventListener("mouseover", hov); npc.addEventListener("mouseout", hov); npc.addEventListener("click", tap);
  };

  /* Revisit questionnaire — on phone, pressing the button brings up a blurred scrim (.2s) and a center panel (.3s easeOutCubic from 20px below), and pressing close or the scrim clears them in .2s (original modalSheetReturnOpen·Close). On wide screens, css that shows it on hover */
  const sheetReturn = (c) => {
    const wrap = c.querySelector(".modal-sheet-return-wrap");
    if (!wrap) return;
    const sheet = wrap.querySelector(".modal-sheet-return"), bg = wrap.querySelector(".bg-modal-sheet-return");
    const open = () => {
      gsap.killTweensOf([sheet, bg]);
      gsap.fromTo(bg, { display: "block", opacity: 0 }, { opacity: 1, duration: MK.reduce ? 0 : 0.2, ease: E.outCubic });
      gsap.fromTo(sheet, { display: "block", opacity: 0, marginTop: 20 }, { opacity: 1, marginTop: 0, duration: MK.reduce ? 0 : 0.3, ease: E.outCubic });
      MK.lock();
    };
    const close = () => {
      gsap.killTweensOf([sheet, bg]);
      gsap.to(bg, { opacity: 0, duration: MK.reduce ? 0 : 0.2, ease: E.outCubic, onComplete: () => gsap.set(bg, { clearProps: "display,opacity" }) });
      gsap.to(sheet, { opacity: 0, marginTop: 20, duration: MK.reduce ? 0 : 0.2, ease: E.outCubic, onComplete: () => { gsap.set(sheet, { clearProps: "display,opacity,marginTop" }); MK.unlock(); } });
    };
    const click = (e) => {
      if (MK.isPc()) return;
      if (e.target.closest(".btn-modal-sheet-return")) open();
      else if (e.target.closest(".btn-modal-close") || e.target.closest(".bg-modal-sheet-return")) close();
    };
    wrap.addEventListener("click", click);
    offs.push(() => wrap.removeEventListener("click", click));
  };

  /* Header — while stuck to the hero bottom it is .btm (menu opens upward), on phone it must drop 35px for the menu button and logo to appear */
  const headerWatch = () => {
    const head = document.querySelector("header");
    const on = () => {
      const y = scrollY;
      if (MK.isPc()) head.classList.toggle("btm", !(y >= head.offsetHeight));
      else {
        document.querySelector(".btn-nav")?.classList.toggle("visible", y >= 35);
        head.querySelector(".header-title")?.classList.toggle("visible", y >= 35);
      }
    };
    addEventListener("scroll", on, { passive: true });
    on();
    offs.push(() => removeEventListener("scroll", on));
  };

  MK.view("top", {
    enter(c) {
      offs = [];
      MK.hideLoading(0);
      gsap.to(c.querySelector(".contents"), { opacity: 1, duration: 0, delay: 0.15 });
      const $slide = caseSlide($(c));
      headerWatch();
      if (MK.firstTop) { MK.firstTop = false; intro(c, $slide); }
      else {
        c.querySelector(".top-intro").style.display = "none";
        const $cur = $(c).find(".top-case-slide .slick-current");
        $cur.prev().addClass("prev"); $cur.next().addClass("next");
        $(c).find(".top-case article").removeClass("active");
        $slide.slick("slickGoTo", 0);
        gsap.to([document.querySelector("header"), c.querySelector(".contents"), c.querySelector(".top-main"), c.querySelector(".top-case")], { opacity: 1, duration: 0, delay: 0.4 });
      }
      island(c);
      sheetReturn(c);
    },
    leave(c) {
      try { $(c).find(".top-case-slide").slick("slickPause"); } catch (e) { /* None */ }
      offs.forEach((f) => f()); offs = [];
    },
  });
})();
