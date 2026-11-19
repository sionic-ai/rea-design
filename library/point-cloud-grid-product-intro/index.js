// Pinned section — split scroll progress into four steps, and on each step change trigger once each: the model (dot cloud transition), number roll, title line break and body scramble.
// When scanning fast (speed 650px/s or more), only the text swap is delayed .1s so mid-cell text does not flicker one after another — same as the original.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const track = document.querySelector(".dd-track");
  if (!track) return;
  const N = 4, SCRAMBLE = "A!B@C#D$E%F&G*H?J[K]L{M}N=O+P-QRSTUVWXYZ";
  const per = () => (innerWidth < 1024 ? 115 : 160);
  const headH = () => Math.round(document.querySelector(".dd-head")?.getBoundingClientRect().height || 64);
  track.style.setProperty("--cap-scroll", `${N * per()}vh`);
  const layers = [...track.querySelectorAll(".cap__layer")];
  const titles = layers.map((l) => l.querySelector(".cap__title"));
  const bodies = layers.map((l) => l.querySelector(".cap__body"));
  [...titles, ...bodies].forEach((e) => e.classList.add("is-in"));
  if (reduce) return;

  const model = track.querySelector('[data-fx~="model-point-morph"]');
  const corners = track.querySelector(".cap__corners");
  const segs = [...track.querySelectorAll(".cap__progress i")];
  const digits = [...track.querySelectorAll(".cap__digit")].map((d) => [...d.children]);
  const face = digits.map(() => 0);
  let shown = "01";
  gsap.set(digits.map((d) => d[1]), { yPercent: 100 });
  bodies.forEach((b) => { b.dataset.text = b.textContent; });
  const splits = titles.map((t) => SplitText.create(t, { type: "lines", mask: "lines", linesClass: "cap__line", aria: "none" }));
  layers.forEach((l, i) => { gsap.set(l, { opacity: +(i === 0) }); gsap.set(splits[i].lines, { yPercent: i === 0 ? 0 : 100 }); });

  const roll = (str, dir) => {
    for (let i = 0; i < str.length; i++) {
      if (shown[i] === str[i]) continue;
      const s = face[i], out = digits[i][s], inn = digits[i][1 - s];
      face[i] = 1 - s;
      gsap.killTweensOf([out, inn]);
      gsap.set(out, { yPercent: 0 });
      gsap.set(inn, { yPercent: dir > 0 ? 100 : -100 });
      inn.textContent = str[i];
      gsap.to(out, { yPercent: dir > 0 ? -100 : 100, duration: 0.55, ease: "power3.out" });
      gsap.to(inn, { yPercent: 0, duration: 0.55, ease: "power3.out" });
    }
    shown = str;
  };

  let cur = 0, pending = -1, tl = null, sec = 0, timer = 0;
  const swap = (e) => {
    if (e === pending || (e === cur && !tl)) return;
    const from = cur;
    tl?.kill();
    bodies.forEach((b) => { b.textContent = b.dataset.text; });
    if (e === from) {
      layers.forEach((l, k) => { gsap.set(l, { opacity: +(k === from) }); gsap.set(splits[k].lines, { yPercent: k === from ? 0 : 100 }); });
      tl = null; pending = -1;
      return;
    }
    const dir = e > from ? 1 : -1;
    pending = e;
    layers.forEach((l, k) => { gsap.set(l, { opacity: +(k === from) }); if (k !== from && k !== e) gsap.set(splits[k].lines, { yPercent: 100 }); });
    tl = gsap.timeline({ onComplete: () => { cur = e; tl = null; pending = -1; } });
    tl.to(splits[from].lines, { yPercent: dir > 0 ? -100 : 100, duration: 0.4, ease: "power3.in", stagger: 0.07 }, 0);
    tl.set(layers[from], { opacity: 0 }, 0.4);
    tl.set(layers[e], { opacity: 1 }, 0.4);
    tl.fromTo(splits[e].lines, { yPercent: dir > 0 ? 100 : -100 }, { yPercent: 0, duration: 0.45, ease: "power3.out", stagger: 0.07 }, 0.42);
    tl.to(bodies[e], { duration: 0.7, scrambleText: { text: bodies[e].dataset.text, chars: "upperCase", speed: 0.6 } }, 0.45);
  };

  const st = ScrollTrigger.create({
    trigger: track,
    start: () => `top top+=${headH()}`,
    end: () => `+=${N * per()}%`,
    invalidateOnRefresh: true,
    onRefresh: () => track.style.setProperty("--cap-scroll", `${N * per()}vh`),
    onUpdate: (self) => {
      const s = self.progress * N, l = Math.min(N - 1, Math.floor(s));
      segs.forEach((g, i) => g.style.setProperty("--fill", Math.min(1, Math.max(0, s - i)).toFixed(3)));
      if (l !== sec) {
        const dir = l > sec ? 1 : -1;
        sec = l;
        gsap.fromTo(corners, { "--bump": 1 }, { "--bump": 0, duration: 0.45, ease: "power4.out" });
        model?.dispatchEvent(new CustomEvent("fx:show", { detail: { index: l } }));
        roll(String(l + 1).padStart(2, "0"), dir);
      }
      clearTimeout(timer);
      if (Math.abs(self.getVelocity()) < 650) swap(l); else timer = setTimeout(() => swap(l), 100);
    },
  });

  // On first entry (section top at 95% of the screen) — numbers rise from below, the first title line rises, and the body text unfolds with a clipped reveal
  const firstDigits = digits.map((d) => d[0]);
  const enter = () => {
    gsap.fromTo(firstDigits, { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    gsap.to(splits[0].lines, { yPercent: 0, duration: 0.9, ease: "power3.out", stagger: 0.08 });
    const b = bodies[0];
    gsap.to(b, { clipPath: "inset(0 0% 0 0)", duration: 0.6, ease: "power2.out" });
    gsap.to(b, { duration: 0.9, ease: "none", scrambleText: { text: b.dataset.text, chars: SCRAMBLE, revealDelay: 0.15, speed: 0.3 } });
  };
  const k = Math.min(N - 1, Math.max(0, Math.floor(st.progress * N)));
  if (k > 0) {
    sec = k; cur = k;
    layers.forEach((l, i) => { gsap.set(l, { opacity: +(i === k) }); gsap.set(splits[i].lines, { yPercent: i === k ? 0 : 100 }); });
    const str = String(k + 1).padStart(2, "0");
    digits.forEach((d, i) => { d[0].textContent = str[i]; });
    shown = str;
    model?.dispatchEvent(new CustomEvent("fx:show", { detail: { index: k } }));
  } else {
    gsap.set(firstDigits, { yPercent: 100 });
    gsap.set(splits[0].lines, { yPercent: 100 });
    gsap.set(bodies[0], { clipPath: "inset(0 100% 0 0)" });
    ScrollTrigger.create({ trigger: track, start: "top 95%", once: true, onEnter: () => (window.ddIntro || ((f) => f()))(enter) });
  }
})();
