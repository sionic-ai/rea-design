// Hover over menu text and the text slides up (inQuint), a plate with inverted text color rises from below at .2 scale and fills up, then the same text rises onto that plate.
// Release the hover and it reverses. The current page link (aria-current) stays flipped. The panel and the flipped text are made by the part.
(() => {
  kfFx.register("pill-swap-hover", (el, { options, reduce, hover }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    if (!label || !window.gsap) return;
    const dur = +(options.dur ?? 0.2833);
    const inQ = kfFx.ease(options.out || "0.64,0,0.78,0", "power4.in"), outQ = kfFx.ease(options.ease || "0.22,1,0.36,1", "power4.out"), io = kfFx.ease(options.grow || "0.83,0,0.17,1", "power4.inOut");
    const pill = document.createElement("span");
    pill.className = "fx-psh__pill";
    pill.setAttribute("aria-hidden", "true");
    const text = document.createElement("span");
    // Flipped text takes the same Type as the visible text (the writer’s type class · lang) — the panel is a different branch inside the link so it can’t inherit the text size
    text.className = `fx-psh__text ${label.className}`;
    if (label.lang) text.lang = label.lang;
    text.textContent = label.textContent.trim();
    pill.appendChild(text);
    // The plate fits the text box size — covering the link’s press padding too would make the plate larger than the text and 160% goes farther
    const wrap = document.createElement("span");
    wrap.className = "fx-psh__wrap";
    label.replaceWith(wrap);
    wrap.append(label, pill);
    const tl = gsap.timeline({ paused: true, defaults: { duration: dur, ease: outQ } })
      .to(label, { yPercent: -150, ease: inQ }, 0)
      .fromTo(pill, { yPercent: 160, scale: 0.2 }, { yPercent: 0, scale: 1, ease: io }, ">-85%")
      .fromTo(text, { yPercent: 160 }, { yPercent: 0 }, ">-40%");
    const on = () => (el.getAttribute("aria-current") === "page" || el.classList.contains("is-current") ? tl.progress(1).pause() : null);
    const enter = () => tl.play();
    const leave = () => { if (el.getAttribute("aria-current") === "page" || el.classList.contains("is-current") || el.matches(":focus-visible")) return; tl.reverse(); };
    const focus = () => { if (el.matches(":focus-visible")) tl.play(); };
    const blur = () => { if (!el.matches(":hover")) leave(); };
    if (reduce) { tl.duration(0.001); }
    if (hover) { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); }
    el.addEventListener("focus", focus);
    el.addEventListener("blur", blur);
    on();
    const mo = new MutationObserver(() => { if (el.getAttribute("aria-current") === "page" || el.classList.contains("is-current")) tl.play(); else if (!el.matches(":hover")) tl.reverse(); });
    mo.observe(el, { attributes: true, attributeFilter: ["aria-current", "class"] });
    return () => {
      mo.disconnect();
      el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave);
      el.removeEventListener("focus", focus); el.removeEventListener("blur", blur);
      tl.kill(); gsap.set(label, { clearProps: "transform" }); pill.remove(); wrap.replaceWith(label);
    };
  });
})();
