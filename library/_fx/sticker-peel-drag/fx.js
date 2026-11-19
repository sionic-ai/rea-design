(() => {
  // Original Name .stickero: when visible (25%) it snaps on in .9s from .6x scale · rotateX −25°, and on hover the top edge folds 25% (45% when pressed), revealing the back.
  // When dragged, it tilts and follows within .15s by the horizontal distance moved (×.4, ±20°) and slides with inertia, and on release it stands upright at once over .6s power2.out. It cannot leave the parent panel.
  kfFx.register("sticker-peel-drag", (el, { options, reduce, hover }) => {
    const art = el.querySelector('[data-fx-part="art"]');
    if (!art) return;
    const drag = document.createElement("div"), box = document.createElement("div"), main = document.createElement("div"), flap = document.createElement("div");
    drag.className = "fx-sticker-drag"; box.className = "fx-sticker-box"; main.className = "fx-sticker-main"; flap.className = "fx-sticker-flap";
    const home = art.nextSibling;
    main.appendChild(art);
    if (hover && !reduce) { const back = art.cloneNode(true); back.removeAttribute("data-fx-part"); back.setAttribute("aria-hidden", "true"); flap.appendChild(back); box.append(main, flap); }
    else box.append(main);
    drag.appendChild(box);
    el.appendChild(drag);
    let io = null, dr = null, rotateTo = null;
    if (reduce || !("IntersectionObserver" in window)) el.classList.add("is-on");
    else {
      io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { el.classList.add("is-on"); io.disconnect(); } }, { threshold: +(options.threshold ?? 0.25) });
      io.observe(el);
    }
    if (hover && window.gsap && window.Draggable) {
      const bounds = options.bounds === "none" ? null : (options.bounds && document.querySelector(options.bounds)) || el.parentElement;
      const tilt = +(options.tilt ?? 0.4), max = +(options.max ?? 20), back = +(options.back ?? 0.6);
      rotateTo = gsap.quickTo(drag, "rotation", { duration: 0.15, ease: "power1.out" });
      dr = Draggable.create(drag, {
        type: "x,y", inertia: !!window.InertiaPlugin, bounds, allowContextMenu: false,
        onPress() { el.classList.add("is-grab"); },
        onDrag() { rotateTo(gsap.utils.clamp(-max, max, this.deltaX * tilt)); },
        onRelease() { el.classList.add("is-on"); gsap.to(drag, { rotation: 0, duration: back, ease: "power2.out" }); },
      })[0];
    }
    return () => {
      io?.disconnect();
      dr?.kill();
      if (window.gsap) gsap.killTweensOf(drag);
      if (home && home.parentNode === el) el.insertBefore(art, home); else el.insertBefore(art, drag);
      drag.remove();
      el.classList.remove("is-on", "is-grab");
    };
  });
})();
