(() => {
  // Loader progress counts in Chinese numerals (〇一二…九, 100 is 百) — at first it rises slowly by a random 15~30,
  // After everything loads, runs to 99 in dur seconds and the panel lifts after the same time (original Loading.changeLoaded·compLoaded·removeAc).
  const DIGIT = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  const kanji = (e) => {
    if (e >= 100) return "百";
    if (e < 10) return DIGIT[e];
    const t = Math.floor(e / 10), o = e % 10;
    return DIGIT[t] + (o === 0 ? "〇" : DIGIT[o]);
  };
  kfFx.register("kanji-count-loader", (el, { options, reduce }) => {
    const num = el.querySelector('[data-fx-part="num"]');
    if (!num) return;
    const extra = el.querySelector('[data-fx-part="chara"]');
    const first = +(options.first ?? 10), dur = +(options.dur ?? 2), fade = +(options.fade ?? .6), auto = +(options.auto ?? 1.5);
    const ease = kfFx.ease(options.ease || "0.215,0.61,0.355,1", "cubic.out");
    const v = { n: 0 };
    let alive = true;
    const paint = () => { num.textContent = kanji(Math.ceil(v.n)); if (alive) requestAnimationFrame(paint); };
    const calls = [];
    const finish = () => {
      if (reduce) { gsap.set(el, { autoAlpha: 0 }); return; }
      gsap.to(v, { duration: dur, n: 99, overwrite: true, ease });
      calls.push(gsap.delayedCall(dur, () => gsap.to(el, { duration: fade, autoAlpha: 0, ease: "expo.out", onComplete: () => { alive = false; } })));
    };
    paint();
    calls.push(gsap.delayedCall(.4, () => {
      gsap.to([num, extra].filter(Boolean), { duration: .6, alpha: 1, ease: "expo.out" });
      gsap.to(v, { duration: first, n: Math.random() * 15 + 15, overwrite: true, ease });
    }));
    if (options.on === "event") document.addEventListener("fx:loaded", finish, { once: true });
    else calls.push(gsap.delayedCall(auto, finish));
    return () => {
      alive = false;
      document.removeEventListener("fx:loaded", finish);
      calls.forEach((c) => c.kill());
      gsap.killTweensOf([v, el, num, extra].filter(Boolean));
      gsap.set(el, { clearProps: "opacity,visibility" });
    };
  });
})();
