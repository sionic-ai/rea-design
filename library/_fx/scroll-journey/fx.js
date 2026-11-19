// Vertical scroll → horizontal scene journey — vertical scroll length is set by the scene width ratio (sizes), and the scene row fixed on screen is pushed sideways by that progress ratio.
// Lines follow by the lerp of each frame’s difference from the target. In a fixed scene, one wheel tick moves to the next or previous scene over dur seconds with power4.inOut,
// Other scenes are free scroll. On entering a scene, attach is-fx-in to it so that [data-fx-part=enter] rises up.
(() => {
  kfFx.register("scroll-journey", (el, { options, reduce, hover }) => {
    const track = el.querySelector(':scope > [data-fx-part="track"]');
    const scenes = track ? [...track.querySelectorAll(':scope > [data-fx-part="scene"]')] : [];
    if (!track || !scenes.length) return;
    const N = scenes.length;
    const list = (v, d) => (v ? String(v).split(",").map((x) => +x.trim()).filter((x) => !Number.isNaN(x)) : d);
    let sizes = list(options.sizes, scenes.map(() => 1));
    while (sizes.length < N) sizes.push(1);
    const narrowSizes = list(options["sizes-narrow"], sizes);
    const fixed = list(options.fixed, []);
    const lerp = +(options.lerp ?? 0.25) || 1;
    const dur = reduce ? 0 : +(options.dur ?? 0.4);
    const margin = +(options.margin ?? 0.15);
    const dotsBox = el.querySelector(':scope > [data-fx-part="dots"]');
    const mq = matchMedia(`(max-width: ${+options.narrow || 768}px)`);
    const S = { sz: sizes, sH: innerHeight, sW: innerWidth, total: 0, width: 0, scroll: 0, h: 0, to: 0, cur: -1, lock: false, raf: 0 };

    const dots = [];
    if (dotsBox) {
      dotsBox.textContent = "";
      scenes.forEach((_, i) => {
        const li = document.createElement("li");
        li.textContent = String(i + 1).padStart(2, "0");
        li.addEventListener("click", () => go(i));
        dotsBox.append(li);
        dots.push(li);
      });
    }
    const size = () => {
      S.sz = mq.matches ? narrowSizes : sizes;
      S.sH = innerHeight;
      S.sW = el.clientWidth || innerWidth;
      scenes.forEach((s, i) => { s.style.width = S.sz[i] * 100 + "vw"; });
      S.total = S.sz.slice(0, N - 1).reduce((a, s) => a + s * S.sH, 0);
      S.width = S.sz.reduce((a, s) => a + s * S.sW, 0);
      el.style.height = S.total + S.sz[N - 1] * S.sH + "px";
    };
    const top = () => el.getBoundingClientRect().top + scrollY;
    const setCur = (i) => {
      if (i === S.cur) return;
      S.cur = i;
      dots.forEach((d, k) => d.classList.toggle("is-current", k === i));
      scenes[i].classList.add("is-fx-in");
      el.dispatchEvent(new CustomEvent("scroll-journey:scene", { detail: { index: i } }));
    };
    const detect = () => {
      let p = 0;
      for (let i = 0; i < N; i++) {
        const a = p - S.sH * margin, b = p + S.sz[i] * S.sH - S.sH * margin;
        if (S.scroll >= a && S.scroll < b) { setCur(i); break; }
        p += S.sz[i] * S.sH;
      }
    };
    function go(i) {
      S.lock = true;
      const to = top() + S.sz.slice(0, i).reduce((a, s) => a + s * S.sH, 0);
      if (window.gsap && gsap.plugins && gsap.plugins.scrollTo) gsap.to(window, { scrollTo: { y: to }, duration: dur, ease: "power4.inOut", overwrite: true });
      else scrollTo(0, to);
      setTimeout(() => { S.lock = false; }, dur * 1100);
    }
    const onScroll = () => {
      S.scroll = Math.max(0, scrollY - top());
      S.h = -(S.width - S.sW) * Math.min(1, S.total ? S.scroll / S.total : 0);
    };
    // On touch screens, swipes are not hijacked — pinned scenes also scroll freely
    const onWheel = (e) => {
      if (!hover || !fixed.includes(S.cur)) return;
      if (S.scroll < 0 || S.scroll > S.total + S.sH) return;
      if (S.lock) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) > 10) {
        if (e.deltaY > 0 && S.cur < N - 1) go(S.cur + 1);
        else if (e.deltaY < 0 && S.cur > 0) go(S.cur - 1);
      }
      e.preventDefault();
    };
    const tick = () => {
      S.to += (S.h - S.to) * (reduce ? 1 : lerp);
      if (Math.abs(S.h - S.to) < 0.05) S.to = S.h;
      detect();
      track.style.transform = `translate3d(${S.to}px,0,0)`;
      S.raf = requestAnimationFrame(tick);
    };
    const onResize = () => { size(); onScroll(); };
    size();
    onScroll();
    S.to = S.h;
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    addEventListener("wheel", onWheel, { passive: false });
    const ro = new ResizeObserver(onResize);
    ro.observe(document.documentElement);
    tick();
    return () => {
      cancelAnimationFrame(S.raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      removeEventListener("wheel", onWheel);
      ro.disconnect();
      el.style.height = "";
      track.style.transform = "";
      scenes.forEach((s) => { s.style.width = ""; s.classList.remove("is-fx-in"); });
      if (dotsBox) dotsBox.textContent = "";
    };
  });
})();
