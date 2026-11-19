// Hovering a link opens a vertical photo window (240×320) beside the cursor — the outer panel slides in from −100% · −100%, the inner photo from 100% · 100%, in opposite directions
// into place in .4s (wiped diagonally), on release the outer goes to 100% · 100% and the inner to −100% · −100% in .3s. The original Brand hover-reveal —
// The power5.out named in the original doesn’t exist in GSAP so it runs with the default curve power1.out (matched to that value).
// The window attaches to body — if placed inside an ancestor that has a transform, like the footer, position: fixed attaches to that ancestor instead of the screen.
(() => {
  kfFx.register("diagonal-peek-follow", (el, { options, reduce, hover }) => {
    const pic = el.querySelector('[data-fx-part="pic"]');
    if (!pic || reduce || !hover) return;
    const off = +(options.offset ?? 20);
    const side = String(options.side || "below-right");
    const dur = +(options.dur ?? 0.4), out = +(options.out ?? 0.3);
    const ease = kfFx.ease(options.ease || "", "power1.out");
    const keepOnClick = options.click === "keep";
    const tint = options.tint ? el.closest(options.tint) : null;
    const gate = options.gate ? el.closest(options.gate) : null;
    const ratio = +(options.ratio ?? 0.9);

    const box = document.createElement("div");
    box.className = "fx-dpf";
    box.style.width = `${+(options.w || 240)}px`;
    box.style.height = `${+(options.h || 320)}px`;
    box.innerHTML = '<div class="fx-dpf__inner"><div class="fx-dpf__img"></div></div>';
    const inner = box.firstElementChild, img = inner.firstElementChild;
    const home = pic.parentNode, next = pic.nextSibling;
    img.append(pic);
    document.body.append(box);

    // As in the original, it opens only when the footer is almost fully visible — grazing it while scrolling up doesn’t open it
    let open = !gate, io = null;
    if (gate) {
      io = new IntersectionObserver(([en]) => { open = en.intersectionRatio >= ratio; }, { threshold: ratio });
      io.observe(gate);
    }
    const place = (e) => {
      box.style.top = `${side.startsWith("above") ? e.clientY - box.offsetHeight - off : e.clientY + off}px`;
      box.style.left = `${side.endsWith("left") ? e.clientX - box.offsetWidth - off : e.clientX + off}px`;
    };
    const enter = (e) => {
      if (!open) return;
      place(e);
      gsap.killTweensOf([inner, img]);
      gsap.set(box, { opacity: 1 });
      gsap.timeline()
        .fromTo(inner, { x: "-100%", y: "-100%" }, { x: "0%", y: "0%", duration: dur, ease }, 0)
        .fromTo(img, { x: "100%", y: "100%" }, { x: "0%", y: "0%", duration: dur, ease }, 0);
      if (tint && el.dataset.tint) tint.dataset.tint = el.dataset.tint;
    };
    const leave = () => {
      gsap.killTweensOf([inner, img]);
      gsap.timeline({ onComplete: () => gsap.set(box, { opacity: 0 }) })
        .to(inner, { x: "100%", y: "100%", duration: out, ease }, 0)
        .to(img, { x: "-100%", y: "-100%", duration: out, ease }, 0);
      if (tint && el.dataset.tint) delete tint.dataset.tint;
    };
    const move = (e) => requestAnimationFrame(() => place(e));
    const click = () => { gsap.killTweensOf([inner, img, box]); gsap.set(box, { opacity: 0 }); };
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    if (!keepOnClick) el.addEventListener("click", click);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("click", click);
      io?.disconnect();
      gsap.killTweensOf([inner, img, box]);
      if (tint && tint.dataset.tint === el.dataset.tint) delete tint.dataset.tint;
      home ? home.insertBefore(pic, next) : el.append(pic);
      box.remove();
    };
  });
})();
