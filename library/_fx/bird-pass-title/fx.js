(() => {
  // Original VT·BT·cp: letter y = −60 + lift·sin(π/(n·8)·i)·2 down to 0, the bird goes offset-distance 0→100% · offset-rotate −55→55°, the line is drawn and then erased from the opposite end
  const LINE = "M819.5,0.5C616.5,231.5,269,278,0.5,151";
  const LINE_R = "M0.5 151C269 278 616.5 231.5 819.5 0.5";
  const LEN = 891.74;
  const BIRD = '<svg viewBox="0 0 200 240" aria-hidden="true"><path d="M124 4C114 58 110 112 100 158C92 194 80 218 60 238C94 214 114 180 124 136C134 92 134 46 124 4Z"/><path d="M4 122C40 114 80 118 112 122C148 126 176 112 198 82C188 116 162 140 120 142C80 144 40 138 4 122Z"/></svg>';
  kfFx.register("bird-pass-title", (el, { options, reduce, scroller }) => {
    const label = el.querySelector('[data-fx-part="label"]') || el;
    const text = label.textContent.trim();
    if (!text) return;
    const saved = label.innerHTML;
    label.setAttribute("aria-label", text);
    label.textContent = "";
    const chars = [];
    text.split(/\s+/).forEach((word, i) => {
      if (i) label.appendChild(document.createTextNode(" "));
      const w = document.createElement("span");
      w.className = "fx-bpt-word";
      w.setAttribute("aria-hidden", "true");
      for (const c of word) { const s = document.createElement("span"); s.className = "fx-bpt-ch"; s.textContent = c; w.appendChild(s); chars.push(s); }
      label.appendChild(w);
    });
    const added = [];
    let bird = el.querySelector('[data-fx-part="bird"]');
    if (!bird) {
      bird = document.createElement("span");
      bird.setAttribute("data-fx-part", "bird");
      bird.setAttribute("aria-hidden", "true");
      bird.innerHTML = BIRD;
      el.appendChild(bird);
      added.push(bird);
    }
    const lines = document.createElement("span");
    lines.className = "fx-bpt-lines";
    lines.setAttribute("aria-hidden", "true");
    lines.innerHTML = `<span class="fx-bpt-line"><svg viewBox="0 0 820 221" preserveAspectRatio="none"><path d="${LINE}" style="stroke-dasharray:${LEN} ${LEN}"/></svg></span><span class="fx-bpt-line"><svg viewBox="0 0 820 221" preserveAspectRatio="none"><path d="${LINE_R}" style="stroke-dasharray:${LEN} ${LEN}"/></svg></span>`;
    el.appendChild(lines);
    added.push(lines);
    const [line, lineR] = lines.children;

    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.registerPlugin(ScrollTrigger);
      const dur = +(options.dur ?? 2), k = dur / 2, delay = +(options.delay ?? 0.5), lift = +(options.lift ?? 100);
      const s = Math.PI / (chars.length * 8);
      chars.forEach((c, i) => gsap.set(c, { y: -60 + lift * Math.sin(s * i) * 2, opacity: 0 }));
      gsap.set(bird, { display: "block", opacity: 0, offsetDistance: "0%", offsetRotate: "-55deg" });
      ScrollTrigger.create({
        scroller, trigger: label, start: options.start || "top bottom", once: true,
        onEnter: () => {
          const st = { amount: 0.1, from: "end" };
          gsap.to(chars, { opacity: 1, duration: 1 * k, ease: "expo.inOut", stagger: st, delay });
          gsap.to(chars, { x: 0, y: 0, duration: 1 * k, ease: "expo.inOut", stagger: st, delay: delay + 0.5 * k });
          gsap.to(bird, { opacity: 1, duration: 0.2, delay: 0.6 * k });
          gsap.to(bird, { offsetDistance: "100%", offsetRotate: "55deg", duration: dur, ease: "expo.inOut" });
          gsap.to(bird, { y: "-30%", duration: dur / 2, ease: "expo.inOut", delay: dur / 2 });
          gsap.set(line, { opacity: 1 });
          gsap.fromTo(line, { strokeDashoffset: LEN }, { strokeDashoffset: 0, duration: 1.8 * k, ease: "expo.inOut", delay: 0.2 * k });
          gsap.delayedCall(1 * k, () => {
            gsap.set(line, { opacity: 0 });
            gsap.set(lineR, { opacity: 1 });
            gsap.to(bird, { opacity: 0, duration: 0.4 });
            gsap.fromTo(lineR, { strokeDashoffset: 0 }, { strokeDashoffset: LEN, duration: 1 * k, ease: "power2.out" });
          });
        },
      });
    }, el);
    return () => { ctx.revert(); added.forEach((n) => n.remove()); label.innerHTML = saved; label.removeAttribute("aria-label"); };
  });
})();
