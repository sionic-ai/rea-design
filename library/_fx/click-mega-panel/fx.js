(() => {
  kfFx.register("click-mega-panel", (el, { options, reduce }) => {
    const triggers = [...el.querySelectorAll('[data-fx-part="trigger"]')];
    const panel = el.querySelector('[data-fx-part="panel"]');
    if (!triggers.length || !panel) return;
    const boxes = [...panel.querySelectorAll('[data-fx-part="box"]')];
    const arrow = panel.querySelector('[data-fx-part="arrow"]');
    const mask = el.querySelector('[data-fx-part="mask"]');
    const dur = reduce ? 0 : +(options.dur ?? 0.3);
    const maskDur = reduce ? 0 : +(options.mask ?? 0.4);
    const rise = +(options.rise ?? 30);
    const lock = options.lock !== "0";
    const ease = kfFx.ease(options.ease || "0.25,0.1,0.25,1", "power1.inOut");
    const maskEase = kfFx.ease(options["mask-ease"] || "power1.out", "power1.out");
    const narrow = () => matchMedia("(max-width: 767px)").matches;
    let open = null, busy = false, tl = null;

    gsap.set(panel, { autoAlpha: 0 });
    // Keep the curtain always laid and change only its visibility — so the size doesn’t start from 0 like the original fadeIn
    if (mask) gsap.set(mask, { autoAlpha: 0 });

    const boxOf = (t) => {
      const id = (t.getAttribute("href") || "").replace(/^#/, "") || t.dataset.key;
      return boxes.find((b) => b.id === id || b.dataset.key === id) || null;
    };
    // The original places a 45° square arrow at the center of the pressed item minus 15px (half the arrow)
    const placeArrow = (t) => {
      if (!arrow || !t) return;
      const pr = panel.getBoundingClientRect(), tr = t.getBoundingClientRect();
      gsap.set(arrow, { left: tr.left - pr.left + tr.width / 2 - arrow.offsetWidth / 2 });
    };
    const placeMask = () => { if (mask) gsap.set(mask, { top: Math.max(0, el.getBoundingClientRect().bottom) }); };

    const show = (t) => {
      busy = true;
      triggers.forEach((x) => { x.classList.toggle("is-on", x === t); x.setAttribute("aria-expanded", x === t ? "true" : "false"); });
      if (lock) document.documentElement.style.overflow = "hidden";
      placeMask();
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { busy = false; } });
      if (mask) tl.to(mask, { autoAlpha: 1, duration: maskDur, ease: maskEase }, 0);
            const wasOpen = open;
      // The original calls the overlay (fadeIn) first and shows the panel after it — so the panel comes one frame later. Even if already open, hide the panel and show it again from 0
      const lag = reduce ? 0 : 0.02;
      tl.call(() => boxes.forEach((b) => b.classList.toggle("is-shown", b === boxOf(t))), null, lag);
      tl.fromTo(panel, { autoAlpha: 0, y: narrow() ? rise : 0 }, { autoAlpha: 1, y: 0, duration: dur, ease }, lag);
      open = t;
      requestAnimationFrame(() => placeArrow(t));
      el.dispatchEvent(new CustomEvent("fx:open", { detail: { trigger: t, from: wasOpen } }));
    };
    const hide = () => {
      if (!open) return;
      busy = true;
      triggers.forEach((x) => { x.classList.remove("is-on"); x.setAttribute("aria-expanded", "false"); });
      tl?.kill();
      tl = gsap.timeline({ onComplete: () => { busy = false; } });
      if (mask) tl.to(mask, { autoAlpha: 0, duration: maskDur, ease: maskEase }, 0);
      tl.to(panel, { autoAlpha: 0, y: narrow() ? rise : 0, duration: dur, ease }, reduce ? 0 : 0.02);
      if (lock) document.documentElement.style.overflow = "";
      open = null;
      el.dispatchEvent(new CustomEvent("fx:close"));
    };

    const onTrigger = (e) => {
      const t = e.currentTarget;
      e.preventDefault();
      if (busy) return;
      if (open === t) hide(); else show(t);
    };
    triggers.forEach((t) => { t.setAttribute("aria-expanded", "false"); t.addEventListener("click", onTrigger); });
    const onClose = (e) => { if (e.target.closest('[data-fx-part="close"]') || e.target === mask || e.target.closest('[data-fx-part="backdrop"]')) { e.preventDefault(); if (!busy) hide(); } };
    el.addEventListener("click", onClose);
    const onKey = (e) => { if (e.key === "Escape" && open) hide(); };
    document.addEventListener("keydown", onKey);
    const onMove = () => { if (open) { placeArrow(open); placeMask(); } };
    addEventListener("resize", onMove);
    addEventListener("scroll", onMove, { passive: true });

    return () => {
      tl?.kill();
      triggers.forEach((t) => { t.removeEventListener("click", onTrigger); t.classList.remove("is-on"); t.removeAttribute("aria-expanded"); });
      el.removeEventListener("click", onClose);
      document.removeEventListener("keydown", onKey);
      removeEventListener("resize", onMove);
      removeEventListener("scroll", onMove);
      if (lock && open) document.documentElement.style.overflow = "";
      gsap.set([panel, mask, arrow].filter(Boolean), { clearProps: "all" });
      boxes.forEach((b) => b.classList.remove("is-shown"));
    };
  });
})();
