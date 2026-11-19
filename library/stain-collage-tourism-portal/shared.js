/* Values taken straight from the original shared script (jQuery) — vertical text, PICK UP, gallery slick, product category swiper, drawer button, year picker, hand-drawn frame ink line */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = window.jQuery;

  // Frame ink line — a different crooked border (o1, o2) for each odd/even card and a thick line at the bottom. The photo is clipped by css with a clipPath of the same shape
  const FRAME = {
    o1: { d: "M0.5 2.6C33 0.8 70 -0.4 99.8 2.8C99.2 36 98.6 70 99.9 99.5C70 96.6 40 96.2 18 97.4C11 97.8 6 98.6 0.8 99.4C0.2 66 0.6 33 0.5 2.6Z", b: "M1 99C30 96.4 70 96.2 99.6 99.2" },
    o2: { d: "M0.8 0.8C30 3.2 68 3.4 99.6 1.2C99.2 34 99.8 68 99.3 98.8C72 96.4 34 96.8 1.2 99.6C0.4 66 1.2 34 0.8 0.8Z", b: "M1.4 99.4C34 96.6 72 96.2 99 98.6" },
  };
  const NS = "http://www.w3.org/2000/svg";
  const line = (frame) => {
    if (frame.querySelector(".xm-frame__line")) return;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "xm-frame__line");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    const kinds = frame.dataset.frame ? [frame.dataset.frame] : ["o1", "o2"];
    kinds.forEach((k) => {
      const f = FRAME[k] || DISCOVER[k];
      const g = document.createElementNS(NS, "g");
      g.setAttribute("class", k);
      [["l1", f.d], ["l2", f.b]].forEach(([c, d]) => {
        if (!d) return;
        const p = document.createElementNS(NS, "path");
        p.setAttribute("class", c);
        p.setAttribute("d", d);
        g.append(p);
      });
      svg.append(g);
    });
    frame.append(svg);
  };
  const DISCOVER = {
    d1: { d: "M1.5 4C34 2 66 0.6 99 0.8C98.6 33 98.2 66 98.6 97.6C66 98.4 34 99.2 1 99.4C1.6 67 1.2 35 1.5 4Z", b: "M1 99.4C34 99.2 66 98.4 98.6 97.6" },
    d2: { d: "M0.6 0.8C33 1.8 67 2.2 99.4 1.6C98.8 35 99.6 68 98.8 99.2C66 97.6 34 96.8 1.6 97.6C0.8 65 1.4 33 0.6 0.8Z", b: "M1.6 97.6C34 96.8 66 97.6 98.8 99.2" },
    d3: { d: "M2.4 1.2C35 3.4 68 2.6 98.6 4.4C99.4 37 98.8 70 99.6 99C66 99.6 34 98.6 0.8 98.8C1.4 66 0.6 34 2.4 1.2Z", b: "M0.8 98.8C34 98.6 66 99.6 99.6 99" },
    d4: { d: "M0.8 2.2C34 0.6 66 2.6 99.2 0.6C99.8 33 98.8 66 99.4 97.4C66 99.4 33 98.2 1.4 99.6C0.6 66 1.6 34 0.8 2.2Z", b: "M1.4 99.6C33 98.2 66 99.4 99.4 97.4" },
  };
  document.querySelectorAll(".xm-frame").forEach(line);

  // Drawer — the original adds and removes active on .gnav_btn and .gnav together at 1080px and below
  const burger = document.querySelector(".xm-burger");
  const nav = document.querySelector(".xm-gnav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const on = !burger.classList.contains("active");
      burger.classList.toggle("active", on);
      nav.classList.toggle("active", on);
      burger.setAttribute("aria-expanded", String(on));
    });
  }

  // Year picker (news list) — pressing a button sets .active, the expand is css .2s ease-out
  document.querySelectorAll(".xm-pull").forEach((pull) => {
    const btn = pull.querySelector(".xm-pull__btn");
    btn?.addEventListener("click", () => {
      const on = !pull.classList.contains("active");
      pull.classList.toggle("active", on);
      btn.setAttribute("aria-expanded", String(on));
    });
    document.addEventListener("click", (e) => { if (!pull.contains(e.target)) pull.classList.remove("active"); });
  });

  if (!$ || !$.fn.slick) return;

  // Vertical text — autoplay 5000, speed 1000, no arrows or dots, doesn’t pause on hover. Refresh when the window size changes
  const $fix = $(".xm-fixtxt__track");
  $fix.slick({ autoplay: !reduce, autoplaySpeed: 5000, speed: 1000, arrows: false, dots: false, pauseOnFocus: false, pauseOnHover: false });
  $(window).on("resize", () => $fix.slick("refresh"));

  // PICK UP card row — autoplay 5000 · speed 1200 · centerMode · centerPadding 5% · variableWidth
  $(".xm-slide-default").slick({
    autoplay: !reduce, autoplaySpeed: 5000, speed: 1200, infinite: true, slidesToShow: 1, centerMode: true, centerPadding: "5%",
    variableWidth: true, dots: false, arrows: false, pauseOnFocus: false, pauseOnHover: false,
  });

  // Highlights page photo slider — autoplay 5000 · speed 1000 · dots (no numbers) · arrows. With a single photo the dots are removed. Arrow height is matched to the photo height
  const $slide = $(".xm-slide");
  if ($slide.length) {
    $slide.slick({
      autoplay: !reduce, autoplaySpeed: 5000, speed: 1000, dots: true, pauseOnFocus: false, pauseOnHover: false,
      prevArrow: '<a class="slick-prev" href="#" aria-label="Previous photo"></a>', nextArrow: '<a class="slick-next" href="#" aria-label="Next photo"></a>',
      customPaging: () => "",
    });
    const fit = () => $slide.each(function () { $(this).find(".slick-arrow").height($(this).find(".xm-slide__img").height()); });
    fit();
    $(window).on("resize", fit);
    $slide.each(function () { if ($(this).find(".xm-slide__img").length === 1) $(this).find(".slick-dots").remove(); });
  }
})();

// Product category and tag row — swiper speed 1000, spaceBetween 8, slidesPerView auto, no loop
(() => {
  if (!window.Swiper) return;
  document.querySelectorAll(".xm-taxrow").forEach((row) => {
    new Swiper(row.querySelector(".swiper-container"), {
      speed: 1000, spaceBetween: 8, slidesPerView: "auto", loop: false,
      navigation: { nextEl: row.querySelector(".swiper-button-next"), prevEl: row.querySelector(".swiper-button-prev") },
    });
  });
})();
