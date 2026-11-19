// Background sound button — if not yet turned on, the bars sway gently (invitation) and after a few seconds show a ”Sound on” bubble, and once on the bars jump like an equalizer.
// Browsers only play sound after a person’s first press, so by default it turns on at the first press anywhere on screen (default on, like the original). Sound file via src.
(() => {
  kfFx.register("eq-sound-toggle", (el, { options }) => {
    const label = el.querySelector('[data-fx-part="label"]');
    const onText = options.on || "Sound on", offText = options.off || "Sound off";
    const vol = +(options.vol ?? 0.45), nudgeAt = +(options.nudge ?? 2.6), first = (options.first ?? "1") !== "0";
    const audio = options.src ? new Audio(options.src) : null;
    if (audio) { audio.loop = true; audio.preload = "auto"; audio.volume = 0; }
    let playing = false, started = false, wanted = true, fade = 0, nudgeTimer = 0;
    const ramp = (to, ms, done) => {
      clearInterval(fade);
      if (!audio) { done && done(); return; }
      const from = audio.volume, t0 = performance.now();
      fade = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / ms);
        audio.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        if (k === 1) { clearInterval(fade); done && done(); }
      }, 30);
    };
    const ui = () => {
      el.classList.toggle("is-on", playing);
      el.classList.toggle("is-invite", !playing && !started && wanted);
      if (started || !wanted) el.classList.remove("is-nudge");
      el.setAttribute("aria-pressed", String(playing));
      if (label) label.textContent = playing ? onText : offText;
      el.dispatchEvent(new CustomEvent(playing ? "fx:on" : "fx:off", { bubbles: true }));
    };
    const play = () => {
      playing = true; started = true; ui();
      if (audio) { const p = audio.play(); if (p && p.catch) p.catch(() => { playing = false; started = false; ui(); }); }
      ramp(vol, 1400);
    };
    const stop = () => { playing = false; ui(); ramp(0, 500, () => { if (!playing && audio) audio.pause(); }); };
    const click = (e) => {
      e.stopPropagation();
      if (playing) { wanted = false; stop(); } else { wanted = true; play(); }
      unhook();
    };
    const GESTURES = ["pointerdown", "keydown", "touchend"];
    const gesture = (e) => {
      if (e.target && e.target.closest && e.target.closest('[data-fx~="eq-sound-toggle"]')) return;
      if (wanted && !started) play();
      unhook();
    };
    const unhook = () => GESTURES.forEach((n) => removeEventListener(n, gesture, true));
    if (first) GESTURES.forEach((n) => addEventListener(n, gesture, true));
    el.addEventListener("click", click);
    if (!el.hasAttribute("type") && el.tagName === "BUTTON") el.setAttribute("type", "button");
    ui();
    if (nudgeAt > 0) nudgeTimer = setTimeout(() => { if (!started && wanted) el.classList.add("is-nudge"); }, nudgeAt * 1000);
    const hide = () => { if (!audio) return; if (document.hidden) audio.pause(); else if (playing) audio.play().catch(() => {}); };
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearTimeout(nudgeTimer); clearInterval(fade); unhook();
      el.removeEventListener("click", click);
      document.removeEventListener("visibilitychange", hide);
      if (audio) audio.pause();
      el.classList.remove("is-on", "is-invite", "is-nudge");
    };
  });
})();
