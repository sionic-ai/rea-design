/* Per-detail-page controls — view switching (view) · balloon play (play) · sound picking (sound). The stage is window.hkStage in shared.js */
(() => {
  const S = window.hkStage;
  if (!S) return;
  const { THREE, state, hooks, U, PAL } = S;
  const body = document.body;
  const variant = body.dataset.variant;

  /* ---------- View switch — in dark view the background becomes an inverted stage, lines turn rainbow, and the atmosphere turns teal ---------- */
  if (variant === "view") {
    const buttons = [...document.querySelectorAll("[data-view]")];
    const card = document.querySelector("[data-card]");
    const label = card?.querySelector("[data-card-label]");
    const text = card?.querySelector("[data-card-body]");
    const tpl = document.querySelector("[data-card-text='1'] p");
    const texts = [{ l: label?.textContent, b: text?.textContent }, { l: tpl?.dataset.label, b: tpl?.textContent }];
    const setView = (v) => {
      buttons.forEach((b) => { const on = +b.dataset.view === v; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
      state.darkTarget = v;
      state.holoTarget = v;
      body.classList.toggle("is-dark", v === 1);
      if (label && texts[v].l) label.textContent = texts[v].l;
      if (text && texts[v].b) text.textContent = texts[v].b;
      card?.classList.remove("is-changed");
      void card?.offsetWidth;
      card?.classList.add("is-changed");
      S.fireImpact();
    };
    buttons.forEach((b) => b.addEventListener("click", () => { if (!b.classList.contains("is-active")) setView(+b.dataset.view); }));
  }

  /* ---------- Balloon game — for 20 seconds, tap the star balloons floating up from below to pop them ---------- */
  if (variant === "play") {
    const playBtn = document.querySelector("[data-play]");
    const playLabel = playBtn?.querySelector("span");
    const scoreEl = document.querySelector("[data-score]");
    const timeEl = document.querySelector("[data-time]");
    const bestEl = document.querySelector("[data-best]");
    const result = document.querySelector("[data-result]");
    const resultScore = document.querySelector("[data-result-score]");
    const BEST_KEY = "hk-balloon-best";
    const pad = (n) => String(n).padStart(2, "0");
    let best = 0;
    try { best = +(localStorage.getItem(BEST_KEY) || 0); } catch {}
    if (bestEl) bestEl.textContent = best ? pad(best) : "—";
    const lines = [PAL.t1.line, PAL.t2.line, PAL.t3.line];
    const fills = [PAL.t1.fill, PAL.t2.fill, PAL.t3.fill];
    const group = new THREE.Group();
    group.position.set(0, 0, S.STAGE_Z);
    S.scene.add(group);
    const balloons = [];
    const game = { on: false, time: 20, score: 0, spawn: 0 };
    const sphere = new THREE.Sphere();
    const ray = new THREE.Raycaster();

    const makeBalloon = () => {
      const mat = S.objMat.clone();
      const c = Math.floor(Math.random() * 3);
      mat.uniforms.uFrom.value = 1; mat.uniforms.uTo.value = 1; mat.uniforms.uMorph.value = 0;
      mat.uniforms.uLine.value = lines[c].clone();
      mat.uniforms.uFill.value = fills[(c + 1) % 3].clone();
      mat.uniforms.uFillAlpha.value = 1;
      mat.uniforms.uWidth.value = 0.2;
      mat.uniforms.uIdle.value = Math.random() * 40;
      const m = new THREE.Mesh(S.geo, mat);
      const size = 0.32 + Math.random() * 0.22;
      m.scale.setScalar(size);
      m.position.set((Math.random() - 0.5) * 9, -5.2, (Math.random() - 0.5) * 3);
      m.userData = { size, speed: 0.9 + Math.random() * 0.8, sway: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 1.2, pop: 0 };
      group.add(m);
      balloons.push(m);
    };
    const clear = () => {
      balloons.splice(0).forEach((b) => { group.remove(b); b.material.dispose(); });
    };
    const render = () => {
      if (scoreEl) scoreEl.textContent = pad(game.score);
      if (timeEl) timeEl.textContent = pad(Math.max(0, Math.ceil(game.time)));
    };
    const startGame = () => {
      clear();
      game.on = true; game.time = 20; game.score = 0; game.spawn = 0;
      state.game = 1;
      body.classList.add("is-game");
      result?.classList.remove("is-visible");
      playBtn?.setAttribute("aria-pressed", "true");
      gsap.to(state, { gameScale: 0.55, duration: 0.8, ease: "expo.out" });
      render();
      // Like the original, the button drops out the moment it’s pressed (width 0), and .1s later the about panel slides out to the left while the ticks fade.
      // The button returns 1.2s later (turns on at .32s) at the top right beside the number pad
      if (!playBtn) return;
      clearTimeout(swap.b); clearTimeout(swap.c);
      if (S.reduce) { body.classList.add("is-game-ctl"); if (playLabel) playLabel.textContent = "stop"; return; }
      playBtn.classList.add("is-gone");
      swap.b = setTimeout(() => body.classList.add("is-game-ctl"), 100);
      swap.c = setTimeout(() => {
        if (playLabel) playLabel.textContent = "stop";
        playBtn.classList.remove("is-gone");
        gsap.fromTo(playBtn, { opacity: 0 }, { opacity: 1, duration: 0.32, ease: "power1.out", clearProps: "opacity" });
      }, 1200);
    };
    const swap = {};
    const endGame = (quiet) => {
      if (!game.on && !quiet) return;
      const was = game.on;
      game.on = false;
      state.game = 0;
      body.classList.remove("is-game", "is-game-ctl");
      clearTimeout(swap.b); clearTimeout(swap.c);
      if (playBtn) { playBtn.classList.remove("is-gone"); gsap.set(playBtn, { clearProps: "opacity" }); }
      playBtn?.setAttribute("aria-pressed", "false");
      if (playLabel) playLabel.textContent = was && !quiet ? "play again" : "play";
      gsap.to(state, { gameScale: 1, duration: 0.9, ease: "expo.out" });
      balloons.forEach((b) => { b.userData.pop = b.userData.pop || 0.001; });
      if (was && !quiet) {
        if (game.score > best) { best = game.score; try { localStorage.setItem(BEST_KEY, String(best)); } catch {} }
        if (bestEl) bestEl.textContent = best ? pad(best) : "—";
        if (resultScore) resultScore.textContent = pad(game.score);
        result?.classList.add("is-visible");
        setTimeout(() => result?.classList.remove("is-visible"), 2600);
      }
    };
    hooks.endGame = endGame;
    playBtn?.addEventListener("click", () => (game.on ? endGame(true) : startGame()));

    hooks.tap.unshift((e) => {
      if (!game.on) return false;
      ray.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), S.camera);
      let hit = null, best2 = Infinity;
      for (const b of balloons) {
        if (b.userData.pop) continue;
        sphere.center.setFromMatrixPosition(b.matrixWorld);
        sphere.radius = b.userData.size * 1.15;
        const p = ray.ray.intersectSphere(sphere, new THREE.Vector3());
        if (p && p.distanceTo(S.camera.position) < best2) { best2 = p.distanceTo(S.camera.position); hit = b; }
      }
      if (hit) {
        hit.userData.pop = 0.001;
        game.score += 1;
        render();
        S.fireImpact();
      }
      return true;
    });

    hooks.frame.push((dt) => {
      if (game.on) {
        game.time -= dt;
        game.spawn -= dt;
        if (game.spawn <= 0) { makeBalloon(); game.spawn = 0.45 + Math.random() * 0.35; }
        render();
        if (game.time <= 0) endGame(false);
      }
      for (let i = balloons.length - 1; i >= 0; i -= 1) {
        const b = balloons[i];
        const d = b.userData;
        d.sway += dt;
        b.material.uniforms.uTime.value += dt;
        b.material.uniforms.uIdle.value += dt * 0.15;
        if (d.pop) {
          d.pop += dt / 0.25;
          b.scale.setScalar(d.size * (1 + d.pop * 0.4));
          b.material.uniforms.uOpacity.value = Math.max(0, 1 - d.pop);
          if (d.pop >= 1) { group.remove(b); b.material.dispose(); balloons.splice(i, 1); }
          continue;
        }
        b.position.y += d.speed * dt;
        b.position.x += Math.sin(d.sway * 1.3) * 0.004;
        b.rotation.y += d.spin * dt;
        if (b.position.y > 5.5) { group.remove(b); b.material.dispose(); balloons.splice(i, 1); }
      }
    });
  }

  /* ---------- Sound picker — the blob sways to the beat of the chosen sound (slow breath · fine tremble · heavy beat) ---------- */
  if (variant === "sound") {
    const buttons = [...document.querySelectorAll("[data-preset]")];
    const BEATS = [
      { rate: 0.5, bass: 0.35, treble: 0.25, tones: [220, 277.18, 329.63], wave: "sine" },
      { rate: 2.2, bass: 0.15, treble: 0.9, tones: [880, 1108.73, 1318.51], wave: "triangle" },
      { rate: 1.2, bass: 0.85, treble: 0.4, tones: [110, 164.81, 220], wave: "sawtooth" },
    ];
    let ctx = null, voice = null;
    const stopVoice = () => {
      if (!voice) return;
      const v = voice;
      voice = null;
      v.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => v.osc.forEach((o) => o.stop()), 600);
    };
    const startVoice = (p) => {
      stopVoice();
      if (!state.soundOn) return;
      ctx ||= new AudioContext();
      const gain = ctx.createGain();
      gain.gain.value = 0;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1800;
      gain.connect(filter).connect(ctx.destination);
      const osc = BEATS[p].tones.map((f) => { const o = ctx.createOscillator(); o.type = BEATS[p].wave; o.frequency.value = f; o.connect(gain); o.start(); return o; });
      gain.gain.setTargetAtTime(0.035, ctx.currentTime, 0.2);
      voice = { gain, osc };
    };
    const setPreset = (p) => {
      state.playing = p;
      buttons.forEach((b) => { const on = +b.dataset.preset === p; b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", String(on)); });
      if (p === null) stopVoice(); else startVoice(p);
    };
    buttons.forEach((b) => b.addEventListener("click", () => setPreset(state.playing === +b.dataset.preset ? null : +b.dataset.preset)));
    hooks.sound = (on) => { if (!on) stopVoice(); else if (state.playing !== null) startVoice(state.playing); };
    hooks.frame.push((dt, t) => {
      if (state.playing === null) { state.audio *= 0.9; state.bass *= 0.9; state.treble *= 0.9; return; }
      const b = BEATS[state.playing];
      const beat = Math.pow(0.5 + 0.5 * Math.sin(t * Math.PI * 2 * b.rate), 2);
      const shimmer = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 * b.rate * 3.1 + 1.3);
      state.audio = THREE.MathUtils.lerp(state.audio, 0.35 + beat * 0.65, 0.2);
      state.bass = THREE.MathUtils.lerp(state.bass, b.bass * beat, 0.2);
      state.treble = THREE.MathUtils.lerp(state.treble, b.treble * shimmer, 0.2);
      if (voice) voice.gain.gain.setTargetAtTime(0.02 + beat * 0.03, ctx.currentTime, 0.05);
    });
  }
})();
