// First page motion — original values as is.
// Key visual: of seven building images, the middle one (4th) switches from before → after every 2 seconds inside a logo whirlwind (blurs and drops out to .5x · -10°, then settles back with elasticity),
// Then 30 colored lines burst out from the center in every direction and the card at bottom right switches to that task. The row drifts one slot left every 2 seconds (relax).
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => matchMedia("(max-width: 767px)").matches;
  const wait = (s) => new Promise((r) => setTimeout(r, s * 1000));
  const rand = (a, b) => Math.random() * (b - a) + a;
  // Resolve skin variables into real colors and pass them to the canvas — the canvas can’t read color-mix·relative color syntax
  const probe = document.createElement("i");
  probe.hidden = true;
  document.body.append(probe);
  const css = (v) => { probe.style.color = `var(${v})`; return getComputedStyle(probe).color; };

  // Color lines bursting from the center — canvas. 30 lines stretch for .5~.7 seconds at .4~.6 times the screen’s short side per second, fading out
  class Burst {
    constructor(box) {
      this.box = box; this.lines = []; this.opacity = 0; this.target = 0; this.raf = null; this.prev = 0;
      if (!box) return;
      this.canvas = document.createElement("canvas");
      this.ctx = this.canvas.getContext("2d");
      box.append(this.canvas);
      this.resize();
      addEventListener("resize", () => this.resize(), { passive: true });
    }
    resize() {
      if (!this.ctx) return;
      const r = this.box.getBoundingClientRect(), dpr = Math.max(1, devicePixelRatio || 1);
      this.w = Math.max(1, Math.round(r.width)); this.h = Math.max(1, Math.round(r.height)); this.side = Math.min(this.w, this.h);
      this.canvas.width = Math.round(this.w * dpr); this.canvas.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    play() {
      if (!this.ctx || reduce) return;
      const m = mobile(), colors = [css("--kf-accent"), css("--site-green"), css("--site-yellow")];
      this.opacity = 1; this.target = 1;
      for (let i = 0; i < 30; i++) {
        const len = rand(this.side * (m ? 0.1 : 0.05), this.side * (m ? 0.15 : 0.12));
        const split = Math.random() < 0.25;
        this.lines.push({
          angle: -Math.PI / 2 + (Math.PI * 2 * i) / 30, radius: rand(0, this.side * 0.08),
          segs: split ? [[0, len * 0.75], [len * 0.85, len * 0.15]] : [[0, len]],
          color: colors[Math.floor(rand(0, colors.length))], life: 0, max: rand(m ? 0.4 : 0.5, m ? 0.5 : 0.7),
          speed: rand(this.side * (m ? 1 : 0.4), this.side * (m ? 1.2 : 0.6)),
        });
      }
      if (this.raf === null) { this.prev = 0; this.raf = requestAnimationFrame((t) => this.tick(t)); }
    }
    tick(t) {
      const dt = this.prev === 0 ? 1 / 60 : Math.min((t - this.prev) / 1000, 0.05);
      this.prev = t;
      this.opacity += (this.target - this.opacity) * Math.min(1, dt * 10);
      this.lines = this.lines.filter((l) => ((l.life += dt), (l.radius += l.speed * dt), l.life < l.max));
      const c = this.ctx, cx = this.w / 2, cy = this.h / 2;
      c.clearRect(0, 0, this.w, this.h);
      c.save(); c.globalCompositeOperation = "screen"; c.lineCap = "round"; c.lineWidth = 2;
      for (const l of this.lines) {
        const a = (1 - l.life / l.max) * this.opacity, x = Math.cos(l.angle), y = Math.sin(l.angle);
        if (a <= 0) continue;
        c.globalAlpha = a; c.strokeStyle = l.color;
        for (const [off, len] of l.segs) {
          const r0 = l.radius + off, r1 = r0 + len;
          c.beginPath(); c.moveTo(cx + x * r0, cy + y * r0); c.lineTo(cx + x * r1, cy + y * r1); c.stroke();
        }
      }
      c.restore();
      if (!this.lines.length) { c.clearRect(0, 0, this.w, this.h); this.raf = null; this.prev = 0; return; }
      this.raf = requestAnimationFrame((n) => this.tick(n));
    }
  }

  class Slider {
    constructor() {
      this.ACTIVE = 3; this.TOTAL = 7; this.INTERVAL = 2;
      this.slider = document.querySelector(".mv-slider");
      this.list = document.querySelector(".mv-slider-list");
      if (!this.slider || !this.list) return;
      this.logos = [...document.querySelectorAll(".mv-logo")];
      this.logoIns = this.logos.map((l) => l.querySelector(".mv-logo-in"));
      this.cards = [...document.querySelectorAll(".mv-works-item")];
      this.originals = [...this.list.children].map((s) => s.cloneNode(true));
      this.slides = []; this.orig = 0; this.busy = false; this.auto = true; this.timer = null;
      this.burst = new Burst(document.querySelector(".mv-line"));
      this.init();
      ScrollTrigger.create({ trigger: "#about", start: "top top", onEnter: () => { this.auto = false; this.stop(); }, onLeaveBack: () => { this.auto = true; this.start(); } });
      gsap.matchMedia().add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)" }, () => this.resize());
    }
    norm(i) { return (i + this.originals.length) % this.originals.length; }
    x(i) { return (this.w + this.s) * (i - 1); }
    resize() { this.w = mobile() ? 22.4 : 28.8; this.s = mobile() ? 2 : 7.2; gsap.set(this.slider, { "--slide-w": `${this.w}rem`, "--slide-s": `${this.s}rem` }); this.slides.forEach((s, i) => gsap.set(s, { x: `${this.x(i)}rem` })); }
    async init() {
      this.resize();
      this.list.innerHTML = "";
      let i = this.norm(this.orig - this.ACTIVE);
      for (let k = 0; k < this.TOTAL; k++) { this.slides.push(this.originals[i].cloneNode(true)); i = this.norm(i + 1); }
      this.orig = this.norm(i - 1);
      this.slides.forEach((s, k) => gsap.set(s, { x: `${this.x(k)}rem`, opacity: 0 }));
      this.list.append(...this.slides);
      if (reduce) {
        this.slides.forEach((s, k) => { gsap.set(s, { opacity: 1 }); if (k <= this.ACTIVE) this.showAfter(s); });
        this.pick(0);
        return;
      }
      await wait(0.6);
      await this.opening();
      if (this.auto) this.start();
    }
    showAfter(s) { gsap.set(s.querySelector(".is-before"), { opacity: 0 }); gsap.set(s.querySelector(".is-after"), { opacity: 1 }); }
    pick(i) { this.cards.forEach((c, k) => c.classList.toggle("is-active", k === i)); }
    async opening() {
      gsap.set(this.slides, { opacity: 0, scale: 0.2, rotateZ: -60 });
      this.slides.forEach((s, k) => { if (k <= this.ACTIVE) this.showAfter(s); });
      await this.spinLogo();
      await wait(0.25);
      this.pick(0);
      this.slides.forEach((s, k) => {
        const d = 0.14 * Math.abs(k - this.ACTIVE);
        gsap.to(s, { opacity: 1, duration: 0.2, delay: d, ease: "none" });
        gsap.to(s, { scale: 1, rotateZ: 0, duration: 1.1, delay: d, ease: "elastic.out(1.1, 1)" });
      });
      gsap.set(this.logos, { zIndex: 2 });
    }
    // The two logo pieces gather from above and below, lying in 3D and shrunk to .35x while spinning -432°, then after 1.2s they unfold to normal size, scatter and vanish
    async spinLogo() {
      const [l, r] = this.logoIns;
      gsap.set(this.logos, { "--scale": 1, "--rx": "30deg", "--ry": "-70deg", "--rz": "0deg" });
      gsap.set(l, { opacity: 0, xPercent: 0, yPercent: -60, rotate: 0 });
      gsap.set(r, { opacity: 0, xPercent: 0, yPercent: 60, rotate: 0 });
      gsap.to(this.logoIns, { opacity: 1, ease: "none", duration: 0.3 });
      gsap.to([l, r], { xPercent: 0, yPercent: 0, ease: "relax", duration: 1 });
      gsap.to(this.logos, { "--scale": 0.35, "--rz": `${360 * -1.2}deg`, ease: "relax", duration: 1.6 });
      await wait(1.2);
      gsap.to(this.logos, { "--scale": 1, "--rz": "0deg", ease: "relax", duration: 1 });
      gsap.to(l, { xPercent: -20, yPercent: 30, ease: "relax", duration: 1 });
      gsap.to(r, { xPercent: 20, yPercent: -30, ease: "relax", duration: 1 });
      gsap.to(this.logoIns, { opacity: 0, ease: "power2.out", duration: 0.4, delay: 0.4 });
    }
    async swapActive() {
      const s = this.slides[this.ACTIVE], f = s.querySelector(".mv-slider-item-frame"), before = s.querySelector(".is-before"), after = s.querySelector(".is-after");
      gsap.set(after, { opacity: 0 });
      await wait(0.1);
      gsap.to(f, { rotate: -10, xPercent: -20, scale: 0.5, filter: "blur(8px)", duration: 1.4, ease: "relax" });
      await wait(0.3);
      await gsap.to(f, { opacity: 0, duration: 0.3, ease: "none" }).then();
      gsap.set(before, { opacity: 0 }); gsap.set(after, { opacity: 1 });
      gsap.set(f, { opacity: 0, xPercent: 0, scale: 0.2, rotate: -60, filter: "" });
      await wait(0.85);
      this.burst.play();
      this.pick(parseInt(s.dataset.index || "0", 10));
      gsap.to(f, { opacity: 1, duration: 0.2, ease: "none" });
      await gsap.to(f, { scale: 1, rotate: 0, duration: 1.1, ease: "elastic.out(1.1, 1)" }).then();
    }
    async next() {
      if (this.busy) return;
      this.stop(); this.busy = true;
      const n = this.orig === this.originals.length - 1 ? 0 : this.orig + 1;
      this.slides.shift()?.remove();
      const s = this.originals[n].cloneNode(true);
      gsap.set(s, { x: `${this.x(this.TOTAL - 1)}rem` });
      this.list.append(s); this.slides.push(s); this.orig = n;
      this.slides.forEach((el, k) => gsap.to(el, { x: `${this.x(k)}rem`, duration: 2, delay: 0.04 * k, ease: "relax" }));
      await wait(0.5);
      await Promise.all([this.spinLogo(), this.swapActive()]);
      this.busy = false;
      if (this.auto) this.start();
    }
    start() { if (this.timer === null) this.timer = setTimeout(() => { this.timer = null; this.next(); }, this.INTERVAL * 1000); }
    stop() { if (this.timer !== null) { clearTimeout(this.timer); this.timer = null; } }
  }
  new Slider();

  // About photo: while the section is visible it swaps every 5 seconds with a 1.2s overlap, and the new photo settles from 1.15→1 over 6s
  const covers = [...document.querySelectorAll(".about-cover-item")];
  if (covers.length) {
    let cur = 0, timer = null;
    covers.forEach((c, i) => c.classList.toggle("is-active", i === cur));
    const step = () => { covers[cur].classList.remove("is-active"); cur = (cur + 1) % covers.length; covers[cur].classList.add("is-active"); };
    const go = () => { if (timer === null && !reduce) timer = setInterval(step, 5000); };
    const halt = () => { if (timer !== null) { clearInterval(timer); timer = null; } };
    ScrollTrigger.create({ trigger: "#about", start: "top bottom", end: "bottom top", onEnter: go, onEnterBack: go, onLeave: halt, onLeaveBack: halt });
  }

  // Strengths: on wide screens the whole list is divided by scroll share to turn on two photos per section in turn, and on phones it advances every 5 seconds
  const list = document.querySelector(".asset-list"), items = [...document.querySelectorAll(".asset-item")];
  if (list && items.length) {
    const frames = items.map((it) => [...it.querySelectorAll(".asset-frame")]), share = 1 / items.length;
    gsap.matchMedia().add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)" }, (ctx) => {
      frames.forEach((f) => f[0]?.classList.add("is-active"));
      if (ctx.conditions.pc) {
        ScrollTrigger.create({
          trigger: list, start: () => `top ${parseFloat(getComputedStyle(items[0]).top)}px`, end: () => `+=${list.clientHeight - items[0].clientHeight}px`,
          onUpdate(self) {
            frames.forEach((f, a) => {
              const n = f.length + 1, p = gsap.utils.clamp(0, 1, gsap.utils.mapRange(share * a, share * (a + 1), 0, 1, self.progress));
              f.forEach((fr, k) => fr.classList.toggle("is-active", p >= k / n && (k === f.length - 1 || p < (k + 1) / n)));
            });
          },
        });
        return;
      }
      let k = 0;
      const id = setInterval(() => { k = (k + 1) % 2; frames.forEach((f) => f.forEach((fr, i) => fr.classList.toggle("is-active", i === k % f.length))); }, 5000);
      return () => clearInterval(id);
    });
  }

  // Interaction: lay the hover photo over the board, and clear the earlier photos beneath once it has fully appeared
  const field = document.querySelector(".use-field"), links = [...document.querySelectorAll(".use-link")], store = [...document.querySelectorAll(".use-store .use-cover-item")];
  if (field && links.length && store.length) {
    let shown = null, seq = 0;
    const show = (i) => {
      const src = store[i];
      if (!src || i === shown) return;
      shown = i; seq += 1;
      const id = seq, item = src.cloneNode(true), frame = item.querySelector(".use-cover-frame"), cap = item.querySelector(".use-caption"), ph = item.querySelector(".hz-ph");
      item.dataset.useId = id;
      gsap.set(frame, { opacity: 0 }); gsap.set(cap, { opacity: 0 }); gsap.set(ph, { scale: 1.1 });
      field.append(item);
      const d = reduce ? 0 : 0.4;
      gsap.to(frame, { opacity: 1, duration: d, ease: "none", onComplete: () => field.querySelectorAll(".use-cover-item").forEach((o) => +o.dataset.useId < id && o.remove()) });
      gsap.to(cap, { opacity: 1, duration: d, ease: "none" });
      gsap.to(ph, { scale: 1, duration: reduce ? 0 : 3, ease: "power4.out" });
    };
    show(0);
    links.forEach((a, i) => a.addEventListener("mouseenter", () => { if (!matchMedia("(pointer: coarse)").matches) show(i); }));
  }
})();
