// First page: droplet window morph (Snap.svg 10s easeInOutQuad endless) · wheel/swipe step progression · close notice card · news slider (Swiper) · facility background color change · photo strip loop · cursor
(() => {
  const { reduced, BP } = TD;
  const hfv = document.querySelector(".td-hfv");
  const white = hfv.querySelector(".td-hfv__white");
  const firsts = hfv.querySelectorAll(".td-hfv__first");
  const msg = hfv.querySelector(".td-hfv__msgText");
  const down = hfv.querySelector(".td-scrolldown");
  const headStatic = document.querySelector(".td-head--static");
  const side = document.querySelector(".td-side");
  const float = hfv.querySelector(".td-hfloat");
  const mobile = () => innerWidth <= BP;

  /* Water-drop window: at 1440, x 333–1105 · y 88–833, on phones, top center */
  const box = () => (mobile() ? [0.06, 0.2, 0.88, 0.5] : [0.231, 0.098, 0.536, 0.828]);
  const seeds = [31, 32, 33, 34, 35];
  const forms = () => seeds.map((s, i) => TD.blob(s, { rot: -40 + i * 9, stretch: 0.72, jitter: 0.15, box: box() }));
  let shapes = forms();
  const clipPath = TD.clip("td-fv-clip", shapes[0]);
  // Same Snap.svg 0.5.1 as the original — chain a 10000ms easeInOutQuad (Penner) animation to the next shape each time one ends. The shapes are our seed droplet instead of the original path.
  const easeInOutQuad = (n) => (n < 0.5 ? 2 * n * n : -1 + (4 - 2 * n) * n);
  let snapPath = null, at = 0;
  const startMorph = () => {
    if (snapPath) snapPath.stop();
    if (reduced || !window.Snap) return;
    snapPath = Snap(clipPath);
    at = 0;
    const next = () => {
      at = (at + 1) % shapes.length;
      snapPath.animate({ d: shapes[at] }, 10000, easeInOutQuad, next);
    };
    next();
  };
  startMorph();
  let lastMobile = mobile();
  addEventListener("resize", () => {
    if (mobile() === lastMobile) return;
    lastMobile = mobile();
    shapes = forms();
    clipPath.setAttribute("d", shapes[0]);
    startMorph();
  });

  // On reduced-motion screens, hold the video on its first frame
  if (reduced) hfv.querySelectorAll(".td-hfv__movie").forEach((v) => { v.removeAttribute("autoplay"); v.pause(); });

  /* Stages: 0 droplet → 1 full-bleed video → 2 text over video → 3 scroll released */
  let step = 0, wait = false;
  const later = (ms, fn) => setTimeout(fn, reduced ? 0 : ms);
  const setFirst = (hide) => firsts.forEach((f) => f.classList.toggle("is-animeHide", hide));
  const setWhite = (on) => {
    headStatic.classList.toggle("is-white", on);
    side.classList.toggle("is-animeHide", on);
  };
  const stalker = TD.stalker();
  const go = (n) => {
    wait = true;
    if (n === 0) {
      TD.lock(true);
      white.classList.add("is-show");
      later(600, () => {
        setFirst(false);
        msg.classList.remove("is-show");
        down.classList.remove("is-show");
        setWhite(false);
        stalker && stalker.show(false);
      });
      later(800, () => {
        hfv.dataset.step = "0";
        white.classList.remove("is-show");
      });
    }
    if (n === 1) {
      white.classList.add("is-show");
      later(600, () => {
        setFirst(true);
        setWhite(true);
        down.classList.add("is-show");
      });
      later(800, () => {
        hfv.dataset.step = "1";
        white.classList.remove("is-show");
        // Original: the moment the white curtain lifts, the video is stopped, reset to the start and replayed
        hfv.querySelectorAll(".td-hfv__movie").forEach((v) => { v.pause(); v.currentTime = 0; v.play().catch(() => {}); });
      });
    }
    if (n === 2) {
      msg.classList.add("is-show");
      stalker && stalker.show(true);
    }
    if (n === 3) TD.lock(false);
    step = n;
    later(1500, () => (wait = false));
  };
  const blocked = () => mobile() && !float.classList.contains("is-hide");
  if (scrollY < 100) {
    TD.lock(true);
  } else {
    setFirst(true);
    setWhite(true);
    msg.classList.add("is-show");
    down.classList.add("is-show");
    hfv.dataset.step = "3";
    step = 3;
  }
  // Original judgement as it is — the wheel uses only the sign of deltaY (no threshold), and for touch, releasing more than 50px above the press point goes forward and below goes back
  const fwd = () => { if (!blocked() && !wait && step < 3) go(step + 1); };
  const back = () => { if (!wait && step === 3 && scrollY < 1) go(0); };
  addEventListener("wheel", (e) => (e.deltaY > 0 ? fwd() : back()), { passive: true });
  let touchY = 0;
  addEventListener("touchstart", (e) => { touchY = e.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", (e) => {
    const d = touchY - e.changedTouches[0].clientY;
    if (d > 50) fwd();
    else if (d < -50) back();
  }, { passive: true });

  /* Notice card: close one by one, on phones close the whole window (tapping outside also closes) */
  float.querySelectorAll(".td-hfloat__close").forEach((b) => b.addEventListener("click", () => b.parentElement.classList.add("is-hide")));
  float.querySelector(".td-hfloat__x").addEventListener("click", () => float.classList.add("is-hide"));
  float.addEventListener("click", (e) => {
    if (mobile() && !e.target.closest(".td-hfloat__card")) float.classList.add("is-hide");
  });

  /* Cursor: only after the text over the video appears and inside the facility garden */
  if (stalker) {
    const garden = document.querySelector("[data-stalker-area]");
    let my = innerHeight / 2;
    const check = () => {
      const inFv = step >= 2 && my + scrollY < hfv.offsetHeight;
      const r = garden.getBoundingClientRect();
      stalker.show(inFv || (my > r.top && my < r.bottom));
    };
    addEventListener("mousemove", (e) => { my = e.clientY; check(); });
    addEventListener("scroll", check, { passive: true });
  }

  /* News paging: same Swiper 11.2.10 as the original — loop · slidesPerView auto · speed 1000 · a single Next button.
     On phones it is a vertical list of three as in the original, so attach only on wide screens (so the loop doesn’t reorder items on phones) */
  let newsSwiper = null;
  const newsMq = matchMedia(`(min-width: ${BP + 1}px)`);
  const newsSet = () => {
    if (newsMq.matches && !newsSwiper && window.Swiper) {
      newsSwiper = new Swiper(".td-news__swiper", { loop: true, slidesPerView: "auto", speed: reduced ? 0 : 1000, navigation: { nextEl: ".td-news__next" } });
    } else if (!newsMq.matches && newsSwiper) {
      newsSwiper.destroy(true, true);
      newsSwiper = null;
    }
  };
  newsSet();
  newsMq.addEventListener("change", newsSet);

  /* Facility background color: once the top of the screen passes a reference point 11.67vw above the section’s top edge, it takes that color. When the photo band reaches the screen bottom, it reverts */
  const main = document.querySelector(".td-home");
  const facs = [...document.querySelectorAll(".td-fac")];
  const end = document.querySelector("[data-bg-end]");
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  const bgSwitch = () => {
    const y = scrollY;
    let bg = "";
    if (y + innerHeight > top(end)) bg = "";
    else for (const f of facs) if (y > top(f) - (mobile() ? 240 : Math.min(innerWidth * 0.1167, 198))) bg = f.dataset.bg;
    if (main.dataset.homeBg !== bg) main.dataset.homeBg = bg;
  };
  addEventListener("scroll", bgSwitch, { passive: true });
  bgSwitch();

  /* Photo strip: one more set appended, looping seamlessly every 60s */
  const frame = document.querySelector(".td-story__frame");
  frame.parentElement.append(frame.cloneNode(true));
})();
