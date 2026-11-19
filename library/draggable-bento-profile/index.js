// Card interaction. The original was framer-motion — where no curve is given, its defaults are carried over as is (duration only: easeInOut, opacity only: .3s linear, array values .8s).
(() => {
  const ease = window.CustomEase ? "nf" : "power4.inOut";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const d = (s) => (reduce ? 0 : s);
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // Filter tabs — a white pill slides in .4s to the pressed tab’s left and width, and passes the filter to the card grid
  const filters = document.querySelector(".nf-filters");
  const pill = filters.querySelector(".nf-filters__pill");
  const grid = document.querySelector(".nf-grid");
  const tabs = [...filters.querySelectorAll(".nf-filters__tab")];
  const place = (tab, dur) => gsap.to(pill, { left: tab.offsetLeft, width: tab.offsetWidth, duration: dur, ease, overwrite: true });
  filters.addEventListener("click", (e) => {
    const tab = e.target.closest(".nf-filters__tab");
    if (!tab) return;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
    place(tab, d(0.4));
    grid.dispatchEvent(new CustomEvent("fx:filter", { detail: { name: tab.dataset.filter } }));
  });
  document.fonts?.ready.then(() => place(tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0], 0));

  // About — pressing the button turns the face ±30° and shrinks it to .4x, then it re-enters from the opposite side. After .65s a pink circle spreads to 40x and fades
  const intro = document.querySelector(".nf-intro");
  const pulse = intro.querySelector(".nf-intro__pulse");
  const spin = intro.querySelector(".nf-intro__spin");
  let face = intro.querySelector(".nf-face");
  let mood = 0, swap = null;
  // Like the original (AnimatePresence exitBeforeEnter), the new image element is inserted only after the old image has fully left — toggling a single element off and on gives a different length and curve
  intro.querySelector(".nf-intro__toggle").addEventListener("click", () => {
    swap?.progress(1);
    const was = mood;
    mood = 1 - mood;
    const old = face, next = old.cloneNode(true);
    next.dataset.face = mood ? "b" : "a";
    next.querySelector("use").setAttribute("href", mood ? "#nf-face-b" : "#nf-face-a");
    gsap.set(next, { clearProps: "all" });
    face = next;
    swap = gsap.timeline()
      .to(old, { opacity: 0, scale: 0.4, rotate: was ? 30 : -30, duration: d(0.5), ease })
      .add(() => old.replaceWith(next))
      .fromTo(next, { opacity: 0, scale: 0.4, rotate: mood ? -30 : 30 }, { opacity: 1, scale: 1, rotate: 0, duration: d(0.5), ease, immediateRender: false });
    gsap.to(spin, { rotate: mood ? 180 : 0, duration: d(0.5), ease });
    gsap.timeline()
      .to(pulse, { scale: 40, opacity: 0, backgroundColor: css("--kf-accent-soft"), duration: d(0.5), delay: d(0.65), ease: "power1.inOut" })
      .set(pulse, { scale: 0, opacity: 1, backgroundColor: css("--kf-surface") });
  });

  // Map — on hover the marker goes 1.1x, the face inside grows and wobbles 15° every 1.6s. ± zooms in 4 steps each (12 ↔ 4)
  const map = document.querySelector(".nf-map");
  const marker = map.querySelector(".nf-map__marker");
  const mface = map.querySelector(".nf-map__face");
  const land = map.querySelector(".nf-map__land");
  const zoomOut = map.querySelector(".nf-map__zoom--out");
  const zoomIn = map.querySelector(".nf-map__zoom--in");
  let wiggle = null, zoom = 12;
  map.addEventListener("pointerenter", () => {
    gsap.to(marker, { scale: 1.1, duration: d(0.5), ease, overwrite: true });
    if (reduce) return;
    wiggle?.kill();
    wiggle = gsap.to(mface, { keyframes: { scale: [1, 1.2, 1, 1.2, 1], rotate: [0, 15, 0, -15, 0], easeEach: "power1.inOut" }, duration: 1.6, ease: "none", repeat: -1 });
  });
  map.addEventListener("pointerleave", () => {
    gsap.to(marker, { scale: 1, duration: d(0.5), ease, overwrite: true });
    wiggle?.kill();
    wiggle = null;
    // The original set rotate back to 1 on release (not 0)
    gsap.to(mface, { scale: 1, rotate: 1, duration: d(0.5), ease: "power1.inOut" });
  });
  const showBtn = (btn, on) => {
    if (on && btn.hidden) {
      btn.hidden = false;
      gsap.fromTo(btn, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: d(0.25), delay: d(1), ease: "power1.inOut" });
    } else if (!on && !btn.hidden) {
      gsap.to(btn, { opacity: 0, scale: 0, duration: d(0.25), delay: d(1), ease: "power1.inOut", onComplete: () => { btn.hidden = true; } });
    }
  };
  const setZoom = (z) => {
    zoom = z;
    gsap.to(land, { scale: Math.pow(2, (zoom - 12) / 2), duration: d(1.6), ease: "power2.inOut", overwrite: true });
    showBtn(zoomOut, zoom > 4);
    showBtn(zoomIn, zoom < 12);
  };
  zoomOut.addEventListener("click", () => zoom > 4 && setZoom(zoom - 4));
  zoomIn.addEventListener("click", () => zoom < 12 && setZoom(zoom + 4));

  // Night mode — the handle is moved to the opposite end and set back by the distance moved, then returns to place in .5s (original layout animation). The moon and sun spin and swap in .3s
  const track = document.querySelector(".nf-theme__track");
  const knob = track.querySelector(".nf-theme__knob");
  const moon = track.querySelector(".nf-theme__icon--moon");
  const sun = track.querySelector(".nf-theme__icon--sun");
  const paint = (dark, animate) => {
    track.setAttribute("aria-checked", String(dark));
    const travel = track.clientWidth - knob.offsetWidth - 12;
    knob.style.left = dark ? "auto" : "6px";
    knob.style.right = dark ? "6px" : "auto";
    if (!animate) {
      gsap.set(dark ? sun : moon, { scale: 1, rotate: 0 });
      gsap.set(dark ? moon : sun, { scale: 0 });
      return;
    }
    gsap.fromTo(knob, { x: dark ? -travel : travel }, { x: 0, duration: d(0.5), ease });
    const out = dark ? moon : sun, inn = dark ? sun : moon, turn = dark ? 90 : -90;
    gsap.timeline()
      .to(out, { scale: 0, rotate: dark ? -90 : 90, duration: d(0.3), ease: "power1.inOut", overwrite: true })
      .fromTo(inn, { scale: 0, rotate: turn }, { scale: 1, rotate: 0, duration: d(0.3), ease: "power1.inOut", immediateRender: false });
  };
  paint(window.nfTheme.dark, false);
  track.addEventListener("click", () => {
    const dark = !window.nfTheme.dark;
    window.nfTheme.set(dark);
    paint(dark, true);
  });

  // Newsletter — if the input is not an email type, the field shakes 5px left and right in .8s, and if valid the cover turns on, the face pops up at 45° after .5s and confetti bursts after .6s
  const letter = document.querySelector(".nf-letter");
  const form = letter.querySelector(".nf-letter__form");
  const input = letter.querySelector(".nf-letter__input");
  const done = letter.querySelector(".nf-letter__done");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      gsap.to(input, { keyframes: { x: [0, 5, -5, 5, -5, 0], easeEach: "power1.inOut" }, duration: d(0.8), ease: "none", overwrite: true });
      return;
    }
    done.hidden = false;
    gsap.fromTo(done, { opacity: 0 }, { opacity: 1, duration: d(0.3), ease: "none" });
    // Original framer default spring — size stiffness 550, damping 30 (rest .01), rotation stiffness 500, damping 25 (rest .5°)
    const sScale = window.nfSpring(550, 30, 1, 0.01), sTurn = window.nfSpring(500, 25, 45);
    const mface2 = done.querySelector(".nf-letter__face");
    gsap.fromTo(mface2, { scale: 0 }, { scale: 1, duration: d(sScale.duration), delay: d(0.5), ease: sScale.ease });
    gsap.fromTo(mface2, { rotate: 45 }, { rotate: 0, duration: d(sTurn.duration), delay: d(0.5), ease: sTurn.ease });
    if (!reduce) setTimeout(() => burst(done.querySelector(".nf-letter__confetti")), 600);
  });

  // 40 confetti pieces — a 144° fan upward (90°), initial speed 23, drag .12, falling and fading while swaying for 3 seconds
  function burst(box) {
    const colors = ["--kf-success", "--kf-accent-soft", "--kf-warning", "--kf-accent"].map(css);
    const rad = Math.PI / 180, angle = 90 * rad, spread = 144 * rad, v0 = 23, drag = 0.12, life = 3000, stagger = 2;
    const bits = Array.from({ length: 40 }, (_, i) => {
      const el = document.createElement("i");
      el.style.backgroundColor = colors[i % colors.length];
      if (i % 2) el.style.borderRadius = "50%";
      box.append(el);
      return {
        el, x: 0, y: 0, z: 0, wobble: Math.random() * 10, ws: 0.1 + Math.random() * 0.1,
        v: v0 * 0.5 + Math.random() * v0, a2: -angle + (0.5 * spread - Math.random() * spread),
        a3: -(Math.PI / 4) + Math.random() * (Math.PI / 2), tilt: Math.random() * Math.PI, ts: 0.1 + Math.random() * 0.3,
        start: i * stagger,
      };
    });
    const t0 = performance.now();
    const tick = (now) => {
      const t = now - t0;
      for (const b of bits) {
        if (t < b.start) continue;
        b.x += Math.cos(b.a2) * b.v; b.y += Math.sin(b.a2) * b.v; b.z += Math.sin(b.a3) * b.v;
        b.wobble += b.ws; b.v -= b.v * drag; b.y += 3; b.tilt += b.ts;
        b.el.style.transform = `translate3d(${b.x + 10 * Math.cos(b.wobble)}px, ${b.y + 10 * Math.sin(b.wobble)}px, ${b.z}px) rotate3d(1, 1, 1, ${b.tilt}rad)`;
        b.el.style.opacity = String(Math.max(0, 1 - t / life));
      }
      if (t < life) requestAnimationFrame(tick);
      else bits.forEach((b) => b.el.remove());
    };
    requestAnimationFrame(tick);
  }
})();
