// First page scenes: Hero parallax and retreat, About text flow, sentence video player, boutique auto advance.
// Scattered photos (scatter-bloom-collage) and the sentence band masking (inset-breathe-band) are attached as parts.
(() => {
  const S = window.S;
  if (!S) return;
  const mm = gsap.matchMedia();

  // Hero: while the inner video leaves the screen it drifts 16%, and from when 40% of the panel has passed above, it recedes at .8× (scrub .15)
  const hero = document.querySelector(".h-hero"), heroInner = hero?.querySelector(".h-hero__inner");
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    if (!hero) return;
    gsap.fromTo(heroInner, { yPercent: 0 }, { yPercent: 16, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.15 } });
    gsap.fromTo(hero, { scale: 1 }, { scale: 0.8, ease: "none", transformOrigin: "50% 50%", scrollTrigger: { trigger: hero, start: "40% top", end: "bottom top", scrub: 0.15 } });
  });

  // About text: on wide screens, rises 56px while the section top passes above the screen top (scrub .35)
  const edit = document.querySelector(".h-edit"), editCol = edit?.querySelector(".h-edit__col");
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    if (!edit) return;
    gsap.fromTo(editCol, { y: 0 }, { y: -56, ease: "none", scrollTrigger: { trigger: edit, start: "top 0%", end: "bottom 0%", scrub: 0.35 } });
  });

  // Sentence video: pressing the play button plays the placeholder video silently, and sends fx:play to the band part to clear the stagger.
  const band = document.querySelector(".h-state");
  if (band) {
    const film = band.querySelector(".h-state__film"), play = band.querySelector(".h-state__play"), toggle = band.querySelector(".h-state__toggle");
    const mute = band.querySelector(".h-state__mute"), track = band.querySelector(".h-state__track"), fill = band.querySelector(".h-state__fill");
    const now = band.querySelector("[data-now]"), total = band.querySelector("[data-total]");
    const clock = (t) => `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    let swap = null;
    const state = (playing) => {
      // When playback starts the button disappears and, without waiting for interaction, rewinds the icon swap (original: two frames after it starts disappearing)
      if (playing && swap) gsap.delayedCall(0.017, () => swap.reverse());
      band.classList.remove("is-loading");
      band.classList.toggle("is-playing", playing);
      band.classList.toggle("is-paused", !playing && film.currentTime > 0);
      toggle.setAttribute("aria-label", playing ? "Pause" : "Play");
      band.dispatchEvent(new Event(playing ? "fx:play" : "fx:rest"));
    };
    film.muted = true;
    // Play button interaction: swaps the original button icon — current triangle → 38px right and fades out, after .12s a new triangle ← 38px from left (.35s), rewinds on release
    const [ia, ib] = [...play.querySelectorAll(".h-state__icons > span")];
    if (ia && ib && S.fine && !S.reduce) {
      gsap.set(ib, { autoAlpha: 0, x: -38 });
      swap = gsap.timeline({ paused: true })
        .fromTo(ia, { autoAlpha: 1, x: 0 }, { autoAlpha: 0, x: 38, duration: 0.35 }, 0)
        .fromTo(ib, { autoAlpha: 0, x: -38 }, { autoAlpha: 1, x: 0, duration: 0.35 }, 0.12);
      play.addEventListener("pointerenter", () => swap.play(0));
      play.addEventListener("pointerleave", () => swap.reverse());
    }
    // The original HLS player attaches the stream after the press and takes a little over .4s to receive it, and playback starts after (measured) — the placeholder mp4 has the same wait
    play.addEventListener("click", () => { band.classList.add("is-loading"); gsap.delayedCall(S.reduce ? 0 : 0.46, () => film.play().catch(() => {})); });
    const video = band.querySelector(".h-state__video");
    let idle = null;
    const active = (on) => { band.classList.toggle("is-active", on); idle?.kill(); if (on) idle = gsap.delayedCall(3, () => band.classList.remove("is-active")); };
    video.addEventListener("pointermove", () => active(true));
    video.addEventListener("pointerleave", () => active(false));
    toggle.addEventListener("click", () => (film.paused ? film.play().catch(() => {}) : film.pause()));
    mute.addEventListener("click", () => { film.muted = !film.muted; mute.setAttribute("aria-label", film.muted ? "Sound On" : "Sound Off"); });
    track.addEventListener("click", (e) => { const r = track.getBoundingClientRect(); if (film.duration) film.currentTime = ((e.clientX - r.left) / r.width) * film.duration; });
    film.addEventListener("play", () => state(true));
    film.addEventListener("pause", () => state(false));
    film.addEventListener("loadedmetadata", () => (total.textContent = clock(film.duration)));
    film.addEventListener("timeupdate", () => { const p = (film.currentTime / (film.duration || 1)) * 100; now.textContent = clock(film.currentTime); fill.style.width = `${p}%`; track.style.setProperty("--at", `${p}%`); });
    // Pauses when it leaves the screen
    ScrollTrigger.create({ trigger: band, start: "top bottom", end: "bottom top", onLeave: () => film.pause(), onLeaveBack: () => film.pause() });
  }

  // Boutique: when the progress line fills in 6s (0.64,0,0.36,1), the next cell follows in .8s (0.64,0,0.2,1) — the new cell slides in from the left,
  // Photos inside a cell move .3 of the cell width less, giving parallax, and product cards sweep past to the cell edge. Runs only while 20% of the panel is visible
  const shop = document.querySelector(".h-shop__slider");
  if (shop) {
    const slides = [...shop.querySelectorAll(".h-shop__slide")], photos = slides.map((s) => s.querySelector(".h-shop__photo")), cards = slides.map((s) => s.querySelector(".h-shop__card"));
    const bar = shop.querySelector(".h-shop__progress i");
    const fill = CustomEase.create("spy-fill", "0.64,0,0.36,1"), move = CustomEase.create("spy-move", "0.64,0,0.2,1");
    let at = 0, seen = false, timer = null;
    const lay = (p) => {
      const w = shop.offsetWidth, cw = cards[0]?.offsetWidth || 0, side = Math.max(0, (w - cw) / 2);
      slides.forEach((s, i) => {
        // How far from the current slide d is: 0 means on screen, negative means a slide exited to the right, positive means a slide waiting on the left
        let d = i - p;
        if (d > slides.length / 2) d -= slides.length;
        if (d < -slides.length / 2) d += slides.length;
        gsap.set(s, { xPercent: -100 * d, zIndex: Math.round(10 - Math.abs(d) * 2) });
        gsap.set(photos[i], { x: S.reduce ? 0 : d * w * 0.3 });
        gsap.set(cards[i], { x: d < 0 ? side : d > 0 ? -side : 0 });
      });
    };
    const pos = { p: 0 };
    lay(0);
    const run = () => {
      timer?.kill();
      gsap.set(bar, { scaleX: 0, transformOrigin: "0 50%" });
      timer = gsap.to(bar, { scaleX: 1, duration: 6, ease: fill, paused: !seen || document.hidden, onComplete: next });
    };
    const next = () => {
      at = (at + 1) % slides.length;
      gsap.set(bar, { transformOrigin: "100% 50%" });
      gsap.to(bar, { scaleX: 0, duration: S.reduce ? 0 : 0.8, ease: move });
      // Keep the advance direction always the same — even from the end to the start, one step forward
      const target = pos.p + 1;
      gsap.to(pos, { p: target, duration: S.reduce ? 0 : 0.8, ease: move, onUpdate: () => lay(pos.p % slides.length), onComplete: () => { pos.p = target % slides.length; lay(pos.p); run(); } });
    };
    const resume = () => { if (!timer) return; seen && !document.hidden ? timer.resume() : timer.pause(); };
    new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; resume(); }, { threshold: 0.2 }).observe(shop);
    document.addEventListener("visibilitychange", resume);
    addEventListener("resize", () => lay(pos.p % slides.length));
    run();
    // The photo inside a cell drifts from −8% to 8% on scroll
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(photos, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: shop, start: "top 100%", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
    });
  }
})();
