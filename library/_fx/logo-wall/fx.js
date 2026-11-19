// Lay out rows and cells to fit wall height and window width, and build three timelines — stacking, flow, collapse. Re-lays out on resize
(() => {
  kfFx.register("logo-wall", (el, { options, reduce, scroller }) => {
    const mark = el.querySelector(':scope > [data-fx-part="mark"]');
    if (mark) {
      const svg = mark.outerHTML.replace(/\sdata-fx-part="mark"/, "").replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
      el.style.setProperty("--fx-mark", `url("data:image/svg+xml,${encodeURIComponent(svg)}")`);
    }
    const dur = +(options.dur ?? 2.5), top = options.from === "top";
    const box = document.createElement("div");
    box.className = "fx-lw";
    el.append(box);
    let tl = {}, st, ro, lastW = 0, lastH = 0;
    const kill = () => { Object.values(tl).forEach((t) => t?.kill()); st?.kill(); };
    function build() {
      kill();
      box.innerHTML = '<div class="fx-lw__line"><span></span></div>';
      const cell = box.querySelector("span"), w = cell.offsetWidth + 2 || 96, h = box.firstChild.offsetHeight || 40;
      const rows = Math.ceil((el.offsetHeight || innerHeight) / h) + 2, cols = Math.ceil((el.offsetWidth || innerWidth) / w) + 2;
      box.innerHTML = Array.from({ length: rows }, () => `<div class="fx-lw__line">${"<span></span>".repeat(cols * 2)}</div>`).join("");
      const lines = [...box.children].slice(0, 25), odd = lines.filter((_, i) => i % 2 === 0), even = lines.filter((_, i) => i % 2 === 1);
      if (reduce) { gsap.set(odd, { xPercent: -50 }); return; }
      tl.intro = gsap.timeline({ paused: true });
      if (top) tl.intro.from(lines, { yPercent: (i) => -100 * (i + 1), filter: "blur(2px)", duration: 0.75, ease: "power4.out", stagger: -0.1 });
      else tl.intro.from(lines, { yPercent: (i) => 110 * (rows - i), filter: "blur(2px)", duration: 1, ease: "power4.out", stagger: { amount: 1, ease: "power1.out" } });
      if (odd.length) tl.intro.fromTo(odd, { xPercent: -45 }, { xPercent: -50, duration: dur, ease: "power2.out" }, "<");
      if (even.length) tl.intro.fromTo(even, { xPercent: -5 }, { xPercent: 0, duration: dur, ease: "power2.out" }, "<");
      tl.mov = gsap.timeline({ paused: true, repeat: -1 });
      if (odd.length) tl.mov.fromTo(odd.slice(0, 10), { x: 0 }, { x: w, duration: dur, ease: "none" });
      if (even.length) tl.mov.fromTo(even.slice(0, 10), { x: 0 }, { x: -w, duration: dur, ease: "none" }, "<");
      tl.collapse = gsap.timeline({ paused: true, onStart: () => tl.mov.pause() });
      if (odd.length) tl.collapse.to(odd.slice(0, 10), { x: `+=${w}`, duration: dur / 2, ease: "power2.out" });
      if (even.length) tl.collapse.to(even.slice(0, 10), { x: `-=${w}`, duration: dur / 2, ease: "power2.out" }, "<");
      tl.collapse.to(lines.slice(0, 20), { yPercent: (i) => 115 * (rows - i), filter: "blur(5px)", duration: 0.75, ease: "power4.in", stagger: -0.09 });
      tl.intro.eventCallback("onComplete", () => tl.mov.play());
      if (options.start === "load") tl.intro.play();
      else st = ScrollTrigger.create({ scroller, trigger: el, start: options.start || "top 75%", once: true, onEnter: () => tl.intro.play() });
    }
    build();
    ro = new ResizeObserver(() => { if (Math.abs(el.offsetWidth - lastW) > 40 || Math.abs(el.offsetHeight - lastH) > 40) { lastW = el.offsetWidth; lastH = el.offsetHeight; build(); } });
    lastW = el.offsetWidth; lastH = el.offsetHeight;
    ro.observe(el);
    const collapse = () => tl.collapse?.restart();
    const restart = () => { tl.collapse?.pause(0); tl.intro?.restart(); };
    el.addEventListener("fx:collapse", collapse);
    el.addEventListener("fx:restart", restart);
    return () => { ro.disconnect(); kill(); box.remove(); el.style.removeProperty("--fx-mark"); el.removeEventListener("fx:collapse", collapse); el.removeEventListener("fx:restart", restart); };
  });
})();
