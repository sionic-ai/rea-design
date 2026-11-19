// Page transition curtain — the screen is divided into rows at the header band height, on leaving, each row fills with background color from below (bottom rows first) to cover,
// On the arrived page the whole covered curtain lifts upward. Match the row height to the header band so the curtain stacks in line with the band edge.
(() => {
  kfFx.register("row-mask-page", (el, { options, reduce }) => {
    const rowOpt = options.row || "52";
    const rise = +(options.rise ?? 0.5), spread = +(options.spread ?? 0.3), lift = +(options.lift ?? 1.2);
    const riseEase = options["rise-ease"] || "power1.inOut", liftEase = options["lift-ease"] || "circ.inOut";
    const nav = options.nav !== "none";
    const shade = el.querySelector('[data-fx-part="shade"]');
    const mask = document.createElement("div");
    mask.className = "fx-row-mask__rows";
    el.appendChild(mask);
    el.setAttribute("aria-hidden", "true");

    const rowH = () => {
      const ref = isNaN(+rowOpt) ? document.querySelector(rowOpt) : null;
      return Math.max(8, ref ? ref.getBoundingClientRect().height : +rowOpt);
    };
    let ins = [];
    const build = () => {
      const h = rowH(), count = Math.ceil(innerHeight / h);
      mask.style.gridTemplateRows = `repeat(${count}, ${h}px)`;
      mask.innerHTML = "<div><i></i></div>".repeat(count);
      ins = [...mask.querySelectorAll("i")];
    };
    build();
    const fire = (type) => el.dispatchEvent(new CustomEvent(type, { bubbles: true }));

    let tw = [];
    const kill = () => { tw.forEach((t) => t.kill()); tw = []; };
    const cover = () => new Promise((done) => {
      kill();
      build();
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", visibility: "visible" });
      gsap.set(ins, { scaleY: 0, transformOrigin: "0% 100%" });
      if (shade) { gsap.set(shade, { opacity: 0 }); tw.push(gsap.to(shade, { duration: reduce ? 0 : 0.8, opacity: 1 })); }
      tw.push(gsap.to(ins, {
        duration: reduce ? 0 : rise, scaleY: 1, ease: riseEase,
        stagger: reduce ? 0 : { amount: spread, from: "end" },
        onComplete: () => { fire("fx:covered"); done(); },
      }));
    });
    const reveal = () => new Promise((done) => {
      kill();
      gsap.set(ins, { scaleY: 1 });
      if (shade) gsap.set(shade, { opacity: 0 });
      gsap.set(el, { clipPath: "inset(0% 0% 0% 0%)", visibility: "visible" });
      tw.push(gsap.to(el, {
        duration: reduce ? 0 : lift, clipPath: "inset(0% 0% 100% 0%)", ease: liftEase,
        onComplete: () => { gsap.set(el, { visibility: "hidden" }); fire("fx:done"); done(); },
      }));
    });
    el.fxCover = cover;
    el.fxReveal = reveal;

    const onCover = () => cover();
    const onReveal = () => reveal();
    el.addEventListener("fx:cover", onCover);
    el.addEventListener("fx:reveal", onReveal);

    let leaving = 0;
    const onClick = (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.href === location.href || (url.pathname === location.pathname && url.hash)) return;
      e.preventDefault();
      clearTimeout(leaving);
      cover().then(() => { leaving = setTimeout(() => (location.href = url.href), 30); });
    };
    const onShow = (e) => { if (e.persisted) { kill(); gsap.set(el, { visibility: "hidden" }); } };
    const onResize = () => { if (el.style.visibility !== "visible") build(); };
    addEventListener("resize", onResize);
    if (nav) {
      document.addEventListener("click", onClick);
      addEventListener("pageshow", onShow);
      reveal();
    } else {
      gsap.set(el, { visibility: "hidden" });
    }

    return () => {
      kill();
      clearTimeout(leaving);
      document.removeEventListener("click", onClick);
      removeEventListener("pageshow", onShow);
      removeEventListener("resize", onResize);
      el.removeEventListener("fx:cover", onCover);
      el.removeEventListener("fx:reveal", onReveal);
      delete el.fxCover;
      delete el.fxReveal;
      mask.remove();
      gsap.set(el, { clearProps: "clipPath,visibility" });
    };
  });
})();
