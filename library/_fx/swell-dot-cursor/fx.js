(() => {
  // The original (Webflow mouse move, smoothing 60) moves a dot pinned at screen center by the mouse ratio — same as following by .4 of the remaining distance each frame
  kfFx.register("swell-dot-cursor", (el, { options, reduce, hover }) => {
    if (!window.gsap || !hover) return;
    const size = +(options.size ?? 20), grow = +(options.grow ?? 50), big = +(options.big ?? 100);
    const lerp = Math.min(1, Math.max(0.01, +(options.lerp ?? 0.4)));
    const sel = options.links || "a, button, [data-fx-part=grow]";
    const growEase = kfFx.ease(options.ease || "back.inOut(2.594)", "back.inOut(2.594)");
    // Place the dot inside a center-aligned panel covering the screen — the center stays put when size changes, so no percent translate is used
    const wrap = document.createElement("div");
    wrap.className = "fx-sdc-wrap";
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = '<div class="fx-sdc"><span class="fx-sdc__label"></span></div>';
    const dot = wrap.firstChild, label = dot.firstChild;
    // The original blends the dot-holding panel with exclusion, so dots look complementary over bright bands
    if (options.blend) wrap.style.mixBlendMode = options.blend;
    document.body.appendChild(wrap);
    // Like the original, place it at the screen center and move it from there to the mouse — the origin must be the same for measured values to give the same coordinates
    gsap.set(dot, { width: size, height: size, x: 0, y: 0 });

    let mx = 0, my = 0, x = 0, y = 0, shown = false, state = "", sticky = false;
    // gsap.ticker passes (seconds, elapsed ms) — match the frame length to the ms side
    const tick = (time, delta) => {
      const dt = Math.max(1, delta || 16.7);
      const k = reduce ? 1 : 1 - Math.pow(1 - lerp, dt / 16.7);
      x += (mx - x) * k;
      y += (my - y) * k;
      gsap.set(dot, { x, y });
    };
    gsap.ticker.add(tick);
    const to = (next, text) => {
      if (next === state) return;
      const prev = state;
      state = next;
      if (next === "big") {
        label.textContent = text;
        gsap.to(dot, { width: big, height: big, duration: 0.5, ease: "back.out(1.7)", overwrite: "auto" });
        gsap.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.2, ease: "none", overwrite: true });
        return;
      }
      gsap.to(label, { opacity: 0, duration: 0.2, ease: "none", overwrite: true });
      if (next === "grow") gsap.to(dot, { width: grow, height: grow, delay: +(options.lag ?? 0), duration: +(options.growdur ?? 0.2), ease: growEase, overwrite: "auto" });
      else gsap.to(dot, { width: size, height: size, duration: 0.5, ease: prev === "big" ? "back.out(1.7)" : growEase, overwrite: "auto" });
    };
    // Even when a card stopped by scrolling ends up under the cursor, the browser fires only pointerover — so the size is picked again then too
    const pick = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      const named = t?.closest("[data-cursor]");
      if (named && el.contains(named)) { to("big", named.getAttribute("data-cursor")); sticky = named.hasAttribute("data-cursor-stick"); }
      else if (t?.closest(sel) && el.contains(t)) to("grow");
      // Spots with only the on-state, like the original hero band, keep the big circle after leaving
      else if (!(state === "big" && sticky)) to("");
    };
    const move = (e) => {
      mx = e.clientX - innerWidth / 2; my = e.clientY - innerHeight / 2;
      if (!shown) { shown = true; x = mx; y = my; }
      // The original (site builder) moves one step first on the spot where the event is received, then follows from the next frame
      else if (!reduce) { x += (mx - x) * lerp; y += (my - y) * lerp; gsap.set(dot, { x, y }); }
      dot.classList.add("is-on");
      pick(e);
    };
    // In the original the dot stays even when it leaves the window and follows from that spot when it re-enters — no teleporting
    const out = (e) => { if (!e.relatedTarget && options.hideout === "1") dot.classList.remove("is-on"); };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", pick);
    document.addEventListener("pointerout", out);
    if (options.hide === "1") el.classList.add("fx-sdc-host");
    return () => {
      gsap.ticker.remove(tick);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", pick);
      document.removeEventListener("pointerout", out);
      gsap.killTweensOf([dot, label]);
      wrap.remove();
      el.classList.remove("fx-sdc-host");
    };
  });
})();
