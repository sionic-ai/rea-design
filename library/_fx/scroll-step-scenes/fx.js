// Only one cell is lit, using thresholds of the passed ratio divided by cell count — the lit cell’s video starts from 0s, and title words light up split over .8s
(() => {
  kfFx.register("scroll-step-scenes", (el, { options, reduce, scroller }) => {
    const stage = el.querySelector(':scope > [data-fx-part="stage"]');
    const steps = stage ? [...stage.querySelectorAll('[data-fx-part="step"]')] : [];
    if (!steps.length) return;
    const num = stage.querySelector('[data-fx-part="num"]'), fill = stage.querySelector('[data-fx-part="fill"]');
    el.style.setProperty("--fx-steps", steps.length);
    if (options.top) el.style.setProperty("--fx-top", options.top);
    if (options.fade != null) el.style.setProperty("--fx-fade", `${+options.fade}s`);
    const spread = +(options.words ?? 0.8);
    const splits = [];
    const words = steps.map((s) => {
      const t = s.querySelector('[data-fx-part="title"]');
      if (!t || !t.textContent.trim()) return [];
      if (window.SplitText) { const sp = SplitText.create(t, { type: "words", wordsClass: "fx-wd" }); splits.push(sp); return sp.words; }
      return [t];
    });
    let cur = -1;
    function go(n) {
      steps.forEach((s, i) => {
        const v = s.querySelector("video");
        if (i === n) {
          s.classList.add("is-active");
          if (v) { v.currentTime = 0; v.play().catch(() => {}); }
          if (words[i].length && !reduce) { gsap.killTweensOf(words[i]); gsap.fromTo(words[i], { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out", stagger: { amount: spread } }); }
          s.dispatchEvent(new CustomEvent("fx:step", { bubbles: true, detail: { index: i } }));
        } else if (s.classList.contains("is-active")) {
          s.classList.remove("is-active");
          if (v) { v.pause(); v.currentTime = 0; }
        }
      });
      cur = n;
    }
    const view = () => (scroller ? scroller.clientHeight : innerHeight);
    function onScroll() {
      const r = el.getBoundingClientRect(), top = r.top - (scroller ? scroller.getBoundingClientRect().top : 0);
      const span = r.height - view();
      const p = span > 0 ? -top / span : 0;
      const k = Math.floor(Math.max(0, Math.min(0.999, p)) * steps.length);
      if (k !== cur) go(k);
      const prog = Math.max(0, Math.min(1, p));
      if (num) num.textContent = String(Math.max(1, Math.ceil(prog * steps.length))).padStart(2, "0");
      if (fill) fill.style.width = `${prog * 100}%`;
    }
    const target = scroller || window;
    target.addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    onScroll();
    return () => {
      target.removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      words.flat().forEach((w) => gsap.killTweensOf(w));
      splits.forEach((s) => s.revert());
      steps.forEach((s) => { s.classList.remove("is-active"); s.querySelector("video")?.pause(); });
      ["--fx-steps", "--fx-top", "--fx-fade"].forEach((k) => el.style.removeProperty(k));
      if (fill) fill.style.removeProperty("width");
    };
  });
})();
