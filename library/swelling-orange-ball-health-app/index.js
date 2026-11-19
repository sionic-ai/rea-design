/* First page — original common.min.js · page.js as is.
   Loader: 1.2s after load the ring length retracts (.5s), the logo blurs up to 1.4x (1.2s cubic-bezier(.19,1,.22,1)), the logo box fadeOut('slow' 600ms), fadeOut just at 1.3s (400ms swing),
   At 1.2s the body curtain brightens (3.6s), at 1.3s the title line rises (1.4s, .7s later) and the text and hand drawing below appear (2s, .7s later). During the loader, a ring follows the cursor.
   slick: 1s after load, sets up the phone screen (1.2s · dot) and the hand drawing (fade 1.2s · automatic every 3 seconds) as a pair.
   Ball: swells 0.0045× per 1px of scroll (up to 40×) and the cover ball turns transparent by 0.0015 each. Solution section: the phone mockup stays centered on screen while passing three Points, and the screen changes in .6s. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = window.jQuery;
  const loading = document.getElementById("kg-loading"), box = document.getElementById("kg-loading-box"), stalker = document.getElementById("kg-loading-stalker");
  const fadein = document.getElementById("kg-fadein");

  const onMove = (e) => { stalker.style.opacity = "1"; stalker.style.top = `${e.clientY - 17}px`; stalker.style.left = `${e.clientX - 17}px`; };
  document.addEventListener("mousemove", onMove);

  const start = () => {
    if (reduce) {
      loading.remove();
      fadein.classList.add("is_open");
      document.querySelectorAll(".kg-popout__in").forEach((el) => el.classList.add("is-pop"));
      document.querySelectorAll(".kg-bottom-text, .kg-mv__ills").forEach((el) => el.classList.add("is-fade"));
      return;
    }
    setTimeout(() => {
      stalker.querySelector(".kg-spinner__path").classList.add("is-finish");
      box.classList.add("is-scale");
      $(box).fadeOut("slow");
      fadein.classList.add("is_open");
    }, 1200);
    setTimeout(() => {
      $(loading).fadeOut(400, () => document.removeEventListener("mousemove", onMove));
      document.querySelectorAll(".kg-popout__in").forEach((el) => el.classList.add("is-pop"));
      document.querySelectorAll(".kg-bottom-text, .kg-mv__ills").forEach((el) => el.classList.add("is-fade"));
    }, 1300);
    setTimeout(() => {
      const screens = $("#kg-screens").slick({ infinite: true, slidesToShow: 1, slidesToScroll: 1, arrows: false, asNavFor: "#kg-ills", pauseOnHover: false, pauseOnFocus: false, dots: true, speed: 1200 });
      $("#kg-ills").slick({ infinite: true, slidesToShow: 1, slidesToScroll: 1, autoplay: true, arrows: false, autoplaySpeed: 3000, speed: 1200, fade: true, asNavFor: "#kg-screens", pauseOnHover: false, pauseOnFocus: false });
      return screens;
    }, 1000);
  };
  document.readyState === "complete" ? start() : addEventListener("load", start, { once: true });

  // Swelling ball · white text on divider row · hide the floating ball
  const bg = document.querySelector(".kg-ball--bg"), over = document.querySelector(".kg-ball--over");
  const balls = document.querySelector(".kg-mv__balls"), rows = document.querySelector(".kg-orange__rows");
  const sec1 = document.getElementById("top_section01");
  const scrub = () => {
    const y = scrollY;
    if (!reduce) {
      // Wide panels start from the very top of the document at .0045, phone panels (1023 and below) from when the ball reaches 200px before the screen bottom at .0038
      const wide = innerWidth >= 1024;
      const d = wide ? y : y - (bg.getBoundingClientRect().top + y + 200 - innerHeight);
      const s = d > 0 ? Math.min(1 + d * (wide ? 0.0045 : 0.0038), 40) : 1;
      bg.style.transform = over.style.transform = `translateX(-50%) scale(${s}, ${s})`;
      over.style.opacity = String(d > 0 ? Math.max(0, 1 - d * 0.0015) : 1);
      bg.style.boxShadow = d < 1 ? "" : "0 0 0 transparent";
    }
    const share = document.querySelector(".kg-share");
    const footer = document.querySelector(".kg-footer");
    const ft = footer ? footer.offsetTop - 800 : Infinity;
    share?.classList.toggle("is-white", (y > 200 && y < sec1.offsetHeight) || (y > ft && y < ft + (footer?.offsetHeight || 0)));
    if (rows && balls) balls.classList.toggle("is-hidden", y > rows.getBoundingClientRect().bottom + y - innerHeight);
  };
  addEventListener("scroll", scrub, { passive: true });
  scrub();

  // Solution section — fixed mockup calculation from the original page.js as it is
  const area = document.getElementById("kg-solve-area"), phone = document.getElementById("kg-solve-phone");
  const blocks = [...area.querySelectorAll(".kg-solve__block")], screens = [...phone.querySelectorAll(".kg-solve__screen")];
  const pin = () => {
    if (innerWidth < 1024) return;
    const st = scrollY, wh = innerHeight, ph = phone.offsetHeight;
    const top = area.getBoundingClientRect().top + st, bottom = top + area.offsetHeight;
    const span = blocks.map((b) => { const t = b.getBoundingClientRect().top + st; return [t, t + b.offsetHeight]; });
    if (st > top - (wh / 2 - ph / 2) && st < bottom - (wh - 75)) {
      phone.classList.add("is-fixed"); phone.classList.remove("is-end");
      const i = span.findIndex(([a, b]) => st > a - wh / 2 && st < b - wh / 2);
      if (i >= 0) screens.forEach((s, j) => s.classList.toggle("is-on", j === i));
    } else if (st > span[0][1] - (wh / 2 - ph / 2)) {
      phone.classList.remove("is-fixed"); phone.classList.add("is-end");
    } else {
      phone.classList.remove("is-fixed", "is-end");
    }
  };
  addEventListener("scroll", pin, { passive: true });
  addEventListener("resize", pin);
  pin();
})();
