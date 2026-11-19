// Hero door — the navy curtain lifts (0.4s), the big headline drops from above to reveal, then four shapes pop out at 0.15s intervals.
// On the first wheel (more than 10 down) or push (more than 30px), shapes rotate and stretch into a collage, and the diamond stands up as a vertical panel carrying the intro text.
// Scroll is locked during those 0.8 seconds and before entering. Rolling the wheel up at the very top returns to the starting position. Motion is the same anime.js 3.2.1 as the original.
(() => {
  const body = document.body;
  const loader = document.querySelector(".kh-loader");
  const btn = document.querySelector(".kh-fv__scroll");
  const shapes = [...document.querySelectorAll(".kh-fv__obj")];
  const lines = document.querySelectorAll(".kh-fv__line");
  const obj03 = document.querySelector(".kh-obj03");
  const rect03 = obj03.querySelector("rect");
  const texts = document.querySelectorAll(".kh-obj02 .kh-fv__objtxt, .kh-obj03 .kh-fv__objtxt");

  // Width and height are in screen-width vw — the spot in front of the door and the spot behind it
  const before = [
    { rotate: "0deg", width: 20.83, height: 26.04 },
    { rotate: "0deg", width: 17.71, height: 31.77 },
    { rotate: "45deg", width: 20.83, height: 20.83, rw: 400, rh: 400, rx: 120, vb: [400, 400] },
    { rotate: "0deg", width: 24.06, height: 24.06 },
    { rotate: "0deg", width: 20.83, height: 26.04 },
    { rotate: "0deg", width: 17.71, height: 31.77 },
    { rotate: "0deg", width: 24.06, height: 24.06 },
  ];
  const after = [
    { rotate: "90deg", width: 10.6, height: 8.5 },
    { rotate: "-90deg", width: 21.46, height: 38.49 },
    { rotate: "0deg", width: 43.07, height: 64.58, rw: 827, rh: 1240, rx: 120, vb: [827, 1240] },
    { rotate: "60deg", width: 14, height: 14 },
    { rotate: "90deg", width: 17, height: 13 },
    { rotate: "0deg", width: 10, height: 15 },
    { rotate: "90deg", width: 11, height: 11 },
  ];

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    loader.style.display = "none";
    body.classList.add("is-animated");
    lines.forEach((el) => (el.style.display = "none"));
    shapes.forEach((el, i) => {
      const a = after[i];
      Object.assign(el.style, { opacity: 1, width: a.width + "vw", height: a.height + "vw", transform: `rotate(${a.rotate})` });
    });
    rect03.setAttribute("width", 827);
    rect03.setAttribute("height", 1240);
    obj03.setAttribute("viewBox", "0 0 827 1240");
    texts.forEach((t) => (t.style.opacity = 1));
    return;
  }

  let hasAnimated = false, triggered = false, busy = false, open = false, lockedY = 0, touchY = null;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const stop = (e) => e.preventDefault();
  const stopKeys = (e) => [32, 33, 34, 35, 36, 37, 38, 39, 40].includes(e.keyCode) && e.preventDefault();
  const lock = () => {
    lockedY = scrollY;
    Object.assign(body.style, { position: "fixed", top: `-${lockedY}px`, left: "0", right: "0", overflow: "hidden" });
    addEventListener("wheel", stop, { passive: false });
    addEventListener("touchmove", stop, { passive: false });
    addEventListener("keydown", stopKeys);
  };
  const unlock = () => {
    Object.assign(body.style, { position: "", top: "", left: "", right: "", overflow: "" });
    scrollTo(0, lockedY);
    removeEventListener("wheel", stop);
    removeEventListener("touchmove", stop);
    removeEventListener("keydown", stopKeys);
  };

  const showButton = () => {
    btn.style.display = "block";
    anime({ targets: btn, opacity: [0, 1], translateY: [-20, 0], duration: 600, easing: "easeOutBack" });
  };
  const revealLines = () => {
    lines.forEach((el) => Object.assign(el.style, { visibility: "visible", pointerEvents: "auto", opacity: "0", clipPath: "inset(0 0 100% 0)", transform: "translateY(-40px)" }));
    anime({ targets: lines, opacity: [0, 1], translateY: [-40, 0], clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], easing: "easeOutCubic", duration: 800 });
  };

  const intro = () => {
    texts.forEach((t) => (t.style.opacity = "0"));
    revealLines();
    setTimeout(() => {
      anime({
        targets: obj03, opacity: [0, 1], scale: [0.2, 1], rotate: "45deg", easing: "easeOutBack", duration: 400, delay: 150,
        complete: () => { open = true; showButton(); },
      });
      anime({ targets: shapes.filter((s) => s !== obj03), opacity: [0, 1], scale: [0.2, 1], easing: "easeOutBack", duration: 400, delay: anime.stagger(150) });
    }, 700);
  };

  const morph = (el, from, to, i) => {
    anime({
      targets: el, scale: [0.3, 1], rotate: [from.rotate, to.rotate],
      width: [from.width + "vw", to.width + "vw"], height: [from.height + "vw", to.height + "vw"],
      duration: 700, easing: "easeOutBack",
    });
    if (i !== 2) return;
    anime({ targets: rect03, width: [from.rw * 0.7, to.rw], height: [from.rh * 0.7, to.rh], rx: [from.rx, to.rx], duration: 700, easing: "easeInOutQuad" });
    const vb = obj03.getAttribute("viewBox").split(" ").map(Number);
    const box = { w: vb[2], h: vb[3] };
    anime({
      targets: box, w: to.vb[0], h: to.vb[1], duration: 700, easing: "easeInOutQuad",
      update: () => obj03.setAttribute("viewBox", `0 0 ${box.w.toFixed(2)} ${box.h.toFixed(2)}`),
    });
  };

  const openGate = () => {
    if (hasAnimated || busy) return;
    busy = true;
    body.classList.add("is-animated");
    lock();
    anime.remove(lines);
    lines.forEach((el) => Object.assign(el.style, { opacity: "0", clipPath: "inset(0 0 0% 0)", pointerEvents: "none", visibility: "hidden" }));
    shapes.forEach((el, i) => morph(el, before[i], after[i], i));
    texts.forEach((t) => (t.style.opacity = "1"));
    anime({ targets: btn, opacity: [1, 0], translateY: [0, -20], duration: 200, easing: "easeInOutQuad", complete: () => (btn.style.display = "none") });
    hasAnimated = true;
    setTimeout(() => {
      unlock();
      busy = false;
      // The panel enters the flow and pushes content below — remeasure parallax decoration spots (after the .6s position shift ends)
      setTimeout(() => window.ScrollTrigger && ScrollTrigger.refresh(), 700);
    }, 800);
  };

  const closeGate = () => {
    if (!hasAnimated || busy) return;
    busy = true;
    lock();
    shapes.forEach((el, i) => morph(el, after[i], before[i], i));
    hasAnimated = false;
    triggered = false;
    body.classList.remove("is-animated");
    texts.forEach((t) => (t.style.opacity = "0"));
    lines.forEach((el) => Object.assign(el.style, { visibility: "visible", pointerEvents: "auto", opacity: "0", clipPath: "inset(0 0 100% 0)", transform: "translateY(-40px)" }));
    setTimeout(() => {
      anime({ targets: lines, opacity: [0, 1], translateY: [-40, 0], clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"], easing: "easeOutCubic", duration: 800 });
      showButton();
    }, 600);
    setTimeout(() => (busy = false), 800);
  };

  btn.style.display = "none";
  btn.style.opacity = 0;
  btn.style.transform = "translateY(-20px)";
  btn.addEventListener("click", () => {
    if (!triggered && open && !busy) { triggered = true; openGate(); }
  });

  lock();
  addEventListener("load", () => {
    setTimeout(() => scrollTo(0, 0), 10);
    anime({
      targets: loader, translateY: ["0%", "-100%"], easing: "easeInOutCubic", duration: 400,
      complete: () => { loader.style.display = "none"; setTimeout(intro, 100); },
    });
  });

  addEventListener("wheel", (e) => {
    if (!open || busy) return;
    if (!triggered && e.deltaY > 10) { triggered = true; openGate(); }
    if (body.classList.contains("is-animated") && scrollY <= 5 && e.deltaY < -10) closeGate();
  }, { passive: false });
  addEventListener("touchstart", (e) => (touchY = e.touches[0].clientY), { passive: true });
  addEventListener("touchend", (e) => {
    if (!open || busy || touchY === null) return;
    const dy = touchY - e.changedTouches[0].clientY;
    if (!triggered && dy > 30) { triggered = true; openGate(); }
    if (body.classList.contains("is-animated") && scrollY <= 5 && dy < -30) closeGate();
    touchY = null;
  }, { passive: true });
})();
