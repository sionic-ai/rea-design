// A curtain with a logo-shaped window cut out — text lines rise, a number counts up and rests, then the curtain scales around one filled point of the window until it covers the screen, opening the page through the window
(() => {
  kfFx.register("logo-hole-loader", (el, { options, reduce }) => {
    const sheet = el.querySelector('[data-fx-part="sheet"]');
    if (!sheet) return;
    const parts = [...el.querySelectorAll('[data-fx-part="label"], [data-fx-part="count"]')];
    const count = el.querySelector('[data-fx-part="count"]');
    const ins = parts.map((p) => {
      const s = document.createElement("span");
      s.className = "fx-lhl-in";
      while (p.firstChild) s.appendChild(p.firstChild);
      p.appendChild(s);
      return s;
    });
    const countIn = count ? ins[parts.indexOf(count)] : null;
    const fire = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const unwrap = () => ins.forEach((s) => { const p = s.parentNode; if (!p) return; while (s.firstChild) p.insertBefore(s.firstChild, s); s.remove(); });
    if (reduce) {
      gsap.set(el, { display: "none" });
      fire("fx:open"); fire("fx:done");
      return () => { gsap.set(el, { clearProps: "display" }); unwrap(); };
    }
    const fe = kfFx.ease("0.19,1,0.22,1", "expo.out");
    const ease = kfFx.ease(options.ease || "0.4,0,0,1", "power3.inOut");
    const hold = +(options.hold ?? 2), countDur = +(options.count ?? 1), grow = +(options.grow ?? 2), fadeAt = +(options["fade-at"] ?? 1.8);
    const depth = () => (innerWidth <= 768 ? +(options["depth-m"] || 6) : +(options.depth || 10));
    const [sx, sy] = (options.shift || "2 -7").split(/\s+/).map(Number);
    const n = { v: 0 };
    // look: blur — text lines do not rise from below but bloom alternately from x ∓10 · blur 2px at 1s intervals over 2s power4.inOut, and on opening they retreat 5px in .5s and fade out (Brand)
    const blur = options.look === "blur";
    if (ins.length && !blur) gsap.set(ins, { yPercent: 125 });
    const tl = gsap.timeline({ delay: +(options.delay ?? 0.25), onComplete: () => { gsap.set(el, { display: "none" }); fire("fx:done"); } });
    if (ins.length && !blur) tl.to(ins, { yPercent: 0, duration: 1.25, ease: fe }, 0);
    if (ins.length && blur) ins.forEach((s, i) => tl.fromTo(s, { opacity: 0, x: i % 2 ? 10 : -10, filter: "blur(2px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 2, ease: "power4.inOut" }, 1 + i));
    tl.to(n, { v: 100, duration: countDur, ease: "none", onUpdate: () => countIn && (countIn.textContent = String(Math.round(n.v)).padStart(3, "0") + "%") }, 0.5)
      .call(() => {
        const r = sheet.getBoundingClientRect();
        gsap.set(sheet, { force3D: false, transformOrigin: `${r.width / 2 + (sx || 0)}px ${r.height / 2 + (sy || 0)}px` });
      })
      .addLabel("open", `+=${hold}`);
    if (ins.length && !blur) tl.to(ins, { yPercent: -125, duration: 1.25, ease: fe }, "open");
    if (ins.length && blur) tl.to(ins, { opacity: 0, x: (i) => (i % 2 ? 5 : -5), duration: 0.5, ease: "power4.inOut" }, "open");
    tl
      .call(() => fire("fx:open"), null, "open+=0.25")
      .to(sheet, { scale: () => innerWidth / depth(), duration: grow, ease }, "open+=0.25");
    if (fadeAt >= 0) tl.to(sheet, { opacity: 0, duration: 0.4, ease }, `open+=${fadeAt}`);
    return () => { tl.kill(); gsap.set([el, sheet, ...ins], { clearProps: "all" }); unwrap(); };
  });
})();
