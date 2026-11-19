// details delays clearing open when folding so the cell stays visible while folding — so the summary default action is blocked and the part holds open
(() => {
  kfFx.register("height-fold", (el, { options, reduce }) => {
    const head = el.querySelector('[data-fx-part="head"]'), body = el.querySelector('[data-fx-part="body"]');
    if (!head || !body) return;
    const dur = reduce ? 0 : +(options.dur ?? 0.4), ease = kfFx.ease(options.ease || "power3.out", "power3.out");
    // fade: false means height only (Brand accordion rows use grid-rows only, .25s), close-ease sets a separate curve (ease-in) when folding
    const fade = options.fade !== "false", closeEase = options["close-ease"] ? kfFx.ease(options["close-ease"], "power1.in") : ease;
    const details = el.tagName === "DETAILS";
    const mark = (open) => { el.classList.toggle("is-opened", open); head.setAttribute("aria-expanded", open); };
    mark(details ? el.open : el.classList.contains("is-opened"));
    let tw;
    const onClick = (e) => {
      e.preventDefault();
      const open = !el.classList.contains("is-opened");
      mark(open);
      tw?.kill();
      if (open) {
        if (details) el.open = true;
        tw = gsap.fromTo(body, { height: 0, ...(fade && { opacity: 0 }) }, { height: "auto", ...(fade && { opacity: 1 }), duration: dur, ease, overwrite: true });
      } else {
        tw = gsap.to(body, { height: 0, ...(fade && { opacity: 0 }), duration: dur, ease: closeEase, overwrite: true, onComplete: () => { if (details) el.open = false; } });
      }
    };
    head.addEventListener("click", onClick);
    return () => { head.removeEventListener("click", onClick); tw?.kill(); gsap.set(body, { clearProps: "height,opacity" }); };
  });
})();
