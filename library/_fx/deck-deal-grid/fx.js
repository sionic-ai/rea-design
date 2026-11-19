// Scattering card stack: five cards laid at a slant (X 56° · Z −38°), stacked 34px apart, breathe for 3.2s, then when the wheel goes down (over 10) or swipes up
// Each piece, delayed .04s more than the last, spins twice around the Y axis (720°) while flying to the center and size of its slot (target), vanishing in .85s power2.out, while the real cards switch on from .6s at .04s intervals.
// After the cell expands, wheeling up at the top of the inner scroll reverses it into a pile over .9s power3.inOut — Brand roadmap
(() => {
  kfFx.register("deck-deal-grid", (host, { options, reduce }) => {
    const deck = host.querySelector('[data-fx-part="deck"]');
    const cards = [...host.querySelectorAll('[data-fx-part="card"]')];
    const targets = [...host.querySelectorAll('[data-fx-part="target"]')];
    if (!deck || !cards.length) return;
    const title = host.querySelector('[data-fx-part="title"]');
    const cover = [...host.querySelectorAll('[data-fx-part="cover"]')];
    const hint = options.hint ? document.querySelector(options.hint) : host.querySelector('[data-fx-part="hint"]');
    const scroller = options.scroller ? document.querySelector(options.scroller) : null;
    const dur = +(options.dur ?? 0.85), back = +(options.back ?? 0.9), each = +(options.each ?? 0.04), spin = +(options.spin ?? 720);
    let open = false, busy = false;
    const lock = (on) => { if (scroller) { scroller.scrollTop = 0; scroller.style.overflowY = on ? "hidden" : ""; } };
    host.classList.add("is-fx-dealing");
    if (targets.length) gsap.set(targets, { opacity: 0 });
    lock(true);

    const deal = () => {
      if (open || busy) return;
      open = true; busy = true;
      hint?.classList.add("is-fx-hidden");
      const r = deck.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const tl = gsap.timeline({ onComplete: () => { deck.style.display = "none"; busy = false; lock(false); host.dispatchEvent(new CustomEvent("fx:dealt")); } });
      if (title) tl.to(title, { opacity: 0, duration: 0.3, ease: "power2.out" }, 0.35);
      if (cover.length) tl.to(cover, { opacity: 0, filter: "blur(6px)", duration: 0.3, ease: "power2.out" }, 0.35);
      cards.forEach((card, i) => {
        const t = targets[i]?.getBoundingClientRect();
        const now = getComputedStyle(card).transform;
        card.style.animation = "none";
        if (now && now !== "none") card.style.transform = now;
        const to = t ? { x: t.left + t.width / 2 - cx, y: t.top + t.height / 2 - cy, scaleX: t.width / card.offsetWidth, scaleY: t.height / card.offsetHeight } : { x: 0, y: 0, scaleX: 1, scaleY: 1 };
        tl.to(card, { ...to, rotationX: 0, rotationY: spin, rotationZ: 0, opacity: 0, duration: reduce ? 0 : dur, ease: "power2.out" }, i * each);
      });
      tl.call(() => host.classList.remove("is-fx-dealing"), null, 0.58);
      if (targets.length) tl.fromTo(targets, { opacity: 0 }, { opacity: 1, duration: 0.45, stagger: each, ease: "power2.out" }, 0.6);
      if (title) tl.fromTo(title, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0.72);
    };
    const gather = () => {
      if (!open || busy) return;
      open = false; busy = true;
      host.classList.add("is-fx-dealing");
      deck.style.display = "";
      lock(true);
      if (title) gsap.to(title, { opacity: 0, duration: 0.4 });
      if (targets.length) gsap.to(targets, { opacity: 0, duration: 0.4 });
      gsap.to(cards, { x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: reduce ? 0 : back, stagger: each, ease: "power3.inOut",
        onComplete: () => {
          gsap.set(cards, { clearProps: "all" });
          cards.forEach((c) => { c.style.animation = ""; });
          if (cover.length) gsap.set(cover, { clearProps: "opacity,filter" });
          if (title) gsap.set(title, { clearProps: "opacity" });
          hint?.classList.remove("is-fx-hidden");
          busy = false;
        } });
    };
    const top = () => (scroller ? scroller.scrollTop : scrollY) <= 5;
    const wheel = (e) => {
      if (busy) { e.preventDefault(); return; }
      if (!open && e.deltaY > 10) { e.preventDefault(); deal(); }
      else if (open && top() && e.deltaY < -10) { e.preventDefault(); gather(); }
    };
    let y0 = 0;
    const tstart = (e) => { y0 = e.touches[0].clientY; };
    const tmove = (e) => {
      const d = y0 - e.touches[0].clientY;
      if (!open && d > 30) deal();
      else if (open && top() && d < -30) gather();
    };
    addEventListener("wheel", wheel, { passive: false });
    addEventListener("touchstart", tstart, { passive: true });
    addEventListener("touchmove", tmove, { passive: true });
    host.addEventListener("fx:deal", deal);
    host.addEventListener("fx:gather", gather);
    return () => {
      removeEventListener("wheel", wheel);
      removeEventListener("touchstart", tstart);
      removeEventListener("touchmove", tmove);
      host.removeEventListener("fx:deal", deal);
      host.removeEventListener("fx:gather", gather);
      gsap.killTweensOf([...cards, ...targets, title, ...cover].filter(Boolean));
      gsap.set([...cards, ...targets, ...cover, title].filter(Boolean), { clearProps: "all" });
      cards.forEach((c) => { c.style.animation = ""; });
      deck.style.display = "";
      host.classList.remove("is-fx-dealing");
      hint?.classList.remove("is-fx-hidden");
      lock(false);
    };
  });
})();
