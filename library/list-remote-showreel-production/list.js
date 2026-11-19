// Work list: card video scroll parallax, view switch (gallery ↔ fullscreen), fullscreen player (advance by wheel, swipe, arrow keys), footer title line rising
(() => {
  const { reduced, fine } = PP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const SUBJECTS = [
    "Close-up of a hand at the waist buckle of a person in a patterned shirt · warm indoor light", "Person dancing and people seated in a vermilion-walled living room · afternoon sunlight", "Two people sitting side by side on a bench · overcast seaside",
    "Wristwatch close-up · dark background · reflected light", "Profile in front of a teal wall · soft studio light", "Two elderly people in an old shop · tungsten lighting",
    "Aerial over neon skyscrapers · night", "Person holding an instant camera in a white gallery · indoor light", "Cocktail bottle on a white table · bright daytime",
    "Two men in a convertible · backlit dusk", "Person applying lip balm in front of a bus stop · midday", "Motorcycle wheel spinning close-up · side light",
  ];
  const HUES = [20, 15, 200, 220, 185, 35, 300, 40, 10, 45, 30, 25];
  // Videos reuse four placeholder videos of the lengths measured from the original (5.04~6.01s · loop)
  const items = SUBJECTS.map((s, i) => ({ title: `Project Name ${String(i + 1).padStart(2, "0")}`, label: s, hue: HUES[i], clip: ["reel-c", "reel-b", "reel-a", "reel-d"][i % 4] }));

  // ---------- Gallery ----------
  const gallery = $("[data-gallery]");
  items.forEach((it, i) => {
    const ratio = i % 3 === 0 ? "Full-width 16:6" : "Half cell 4:3";
    const el = document.createElement("article");
    el.className = "work__item";
    el.dataset.cursorText = "Full Screen";
    el.innerHTML = `<div class="work__item-media"><div class="wf-img pp-shot wf-video" style="--h:${it.hue}" data-video="${it.clip}" data-play="view" data-label="${it.label} · ${ratio}"></div></div>
      <h3 class="t-subup work__item-title" data-label="Your work English name here"><span>${it.title}</span></h3>`;
    el.addEventListener("click", () => openFull(i));
    gallery.append(el);
    it.card = el;
  });

  // The video inside a card is pushed by 8% of card height according to its on-screen position (-1~1) (1.16x enlargement hides the edges)
  const parallax = () => {
    if (reduced || matchMedia("(max-width: 991px)").matches) return;
    const vh = innerHeight;
    items.forEach((it) => {
      const r = it.card.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const p = Math.max(-1, Math.min(1, (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)));
      it.card.firstElementChild.firstElementChild.style.setProperty("--plx", `${(p * r.height * 0.08).toFixed(1)}px`);
    });
  };
  PP.lenis ? PP.lenis.on("scroll", parallax) : addEventListener("scroll", parallax, { passive: true });
  parallax();

  // Card titles slide up from below as they enter the screen
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const head = gsap.timeline({ delay: .5 });
    head.from(".work__title", { yPercent: 30, autoAlpha: 0, duration: .9, ease: "power3.out" })
      .from(".work__bar > *", { yPercent: 110, duration: .65, stagger: .06, ease: "power3.out" }, .2);
    items.forEach((it) => {
      gsap.from(it.card.querySelector(".work__item-title > span"), {
        yPercent: 110, duration: .75, ease: "power3.out",
        scrollTrigger: { trigger: it.card, start: "top 85%", toggleActions: "play none none reverse" },
      });
      gsap.from(it.card, { clipPath: "inset(12% 0% 0% 0%)", duration: .9, ease: "power3.out", scrollTrigger: { trigger: it.card, start: "top 92%" } });
    });
  });

  // ---------- Fullscreen ----------
  const wrap = $(".work__gallery-wrap"), full = $(".work__full");
  const stage = $("[data-full-stage]"), slider = $("[data-full-slider]"), frames = $("[data-full-frames]");
  const watched = $("[data-full-watched]");
  const reveal = CustomEase.create("wkReveal", "M0,0 C0.16,1 0.3,1 1,1");
  const sw = CustomEase.create("wkSwitch", "M0,0 C0.77,0 0.18,1 1,1");
  items.forEach((it, i) => {
    const ap = document.createElement("div");
    ap.className = "ap";
    ap.innerHTML = `<div class="wf-img pp-shot wf-video" style="--h:${it.hue}" data-video="${it.clip}" data-play="manual" data-label="${it.label} · Full-width screen"></div>`;
    stage.append(ap);
    it.ap = ap;
    it.video = PP.mountVideo(ap.firstElementChild);
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = it.title;
    b.addEventListener("click", () => select(i));
    slider.append(b);
    it.btn = b;
  });
  frames.innerHTML = Array.from({ length: 6 }, (_, i) => `<button type="button" class="wf-img pp-shot no-label" data-frame="${i}" aria-label="Scene ${i + 1}"></button>`).join("");
  const frameBtns = $$("button", frames);

  let cur = 0, active = false, lock = 0;
  const swap = (sel, text) => {
    const el = $(sel);
    gsap.timeline().to(el, { yPercent: -110, duration: .28, ease: "power2.in" }).add(() => (el.textContent = text)).fromTo(el, { yPercent: 110 }, { yPercent: 0, duration: .62, ease: "power3.out" });
  };
  const select = (i, first) => {
    i = (i + items.length) % items.length;
    const prev = items[cur], next = items[i];
    if (!first && i === cur) return;
    items.forEach((it, j) => it.btn.classList.toggle("is-active", j === i));
    frameBtns.forEach((f, j) => { f.style.setProperty("--h", next.hue + j * 12); f.classList.toggle("is-current", j === 0); });
    next.ap.classList.add("is-active");
    next.ap.style.zIndex = 2;
    prev.ap.style.zIndex = 1;
    if (first || reduced) {
      if (prev !== next) prev.ap.classList.remove("is-active");
    } else {
      gsap.fromTo(next.ap, { clipPath: "inset(50% 50%)" }, { clipPath: "inset(0% 0%)", duration: .9, ease: sw, onComplete: () => { prev.ap.classList.remove("is-active"); next.ap.style.zIndex = 1; } });
      gsap.fromTo(next.ap.firstElementChild, { scale: 1.6 }, { scale: 1, duration: 1.2, ease: reveal });
      swap("[data-full-title]", next.title);
      swap("[data-full-made]", `Studio Name ${String(i + 1).padStart(2, "0")}`);
      swap("[data-full-dir]", `Director Name ${String(i + 1).padStart(2, "0")}`);
    }
    if (first) { $("[data-full-title]").textContent = next.title; }
    gsap.to(slider, { x: () => -next.btn.offsetLeft, duration: reduced ? 0 : .85, ease: sw });
    cur = i;
    // Only the chosen work video replays from the start — the original does not advance when it ends and repeats the same work
    items.forEach((it, j) => { if (j === i) { if (prev !== next || first) it.video.currentTime = 0; if (active) it.video.play()?.catch(() => {}); } else if (j !== items.indexOf(prev)) it.video.pause(); });
    if (prev !== next) setTimeout(() => prev.video.pause(), reduced ? 0 : 900);
  };
  // Pressing a scene cell moves the video position to the center of that cell ((cell+.5)/cell count)
  frameBtns.forEach((f, j) => f.addEventListener("click", () => { const v = items[cur].video; if (v.duration > 0) v.currentTime = ((j + 0.5) / frameBtns.length) * v.duration; }));
  const tick = () => {
    const v = items[cur].video;
    if (active && v.duration > 0) {
      const p = Math.min(1, v.currentTime / v.duration);
      watched.style.width = `${p * 100}%`;
      const fi = Math.min(frameBtns.length - 1, Math.floor(p * frameBtns.length));
      frameBtns.forEach((f, j) => f.classList.toggle("is-current", j === fi));
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  // The wheel must roll past 22 and a swipe must push past 84px for one step — after turning, further input is ignored for 360ms
  full.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (performance.now() < lock || Math.abs(e.deltaY) < 22) return;
    lock = performance.now() + 360;
    select(cur + (e.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  let sx = null;
  full.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
  full.addEventListener("touchend", (e) => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 84) select(cur + (dx < 0 ? 1 : -1)); sx = null; });
  addEventListener("keydown", (e) => { if (!active) return; if (e.key === "ArrowRight") select(cur + 1); if (e.key === "ArrowLeft") select(cur - 1); if (e.key === "Escape") setView("gallery"); });

  const setView = (view, index) => {
    const toFull = view === "full";
    if (toFull === active) { if (toFull && index != null) select(index); return; }
    $$(".work__switch-btn").forEach((b) => b.classList.toggle("is-active", b.dataset.view === view));
    const d = reduced ? 0 : 1;
    if (toFull) {
      active = true;
      items[index ?? cur].video.play()?.catch(() => {});
      PP.lenis?.stop();
      scrollTo(0, 0);
      PP.lenis?.scrollTo(0, { immediate: true });
      select(index ?? cur, true);
      gsap.timeline()
        .to(wrap, { autoAlpha: 0, duration: .3 * d, ease: "power2.in" })
        .add(() => { wrap.classList.remove("is-active"); full.classList.add("is-active"); full.setAttribute("aria-hidden", "false"); document.documentElement.style.overflow = "hidden"; })
        .fromTo(full, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: .9 * d, ease: sw })
        .from(".work__full-top > *, .work__full-slider", { yPercent: 40, autoAlpha: 0, duration: .62 * d, stagger: .06, ease: "power3.out" }, "-=0.4");
    } else {
      active = false;
      items.forEach((it) => it.video.pause());
      gsap.timeline()
        .to(full, { clipPath: "inset(0% 0% 100% 0%)", duration: .75 * d, ease: sw })
        .add(() => { full.classList.remove("is-active"); full.setAttribute("aria-hidden", "true"); wrap.classList.add("is-active"); document.documentElement.style.overflow = ""; PP.lenis?.start(); ScrollTrigger.refresh(); parallax(); })
        .fromTo(wrap, { autoAlpha: 0 }, { autoAlpha: 1, duration: .44 * d, ease: "power3.out", clearProps: "opacity,visibility" });
    }
  };
  const openFull = (i) => setView("full", i);
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
  if (location.hash === "#long") $("[data-work-cat]").textContent = "Category 2";

  // ---------- Footer ----------
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const f = $("footer.footer");
    gsap.timeline({ scrollTrigger: { trigger: f, start: "top 60%" } })
      .from($$(".footer__heading .pp-line > span", f), { yPercent: 110, duration: .68, stagger: .055, ease: "power2.out" }, .08)
      .from($(".footer__hi", f), { clipPath: "inset(0 100% 0 0)", duration: .68, ease: "power2.out" }, .08)
      .from($$(".footer__loc, .footer__addr > *, .footer__links > *", f), { y: 16, autoAlpha: 0, duration: .52, stagger: .035, ease: "power2.out" }, .3);
    gsap.fromTo($(".footer__video", f), { scale: 1.4, yPercent: -20 }, { scale: 1, yPercent: 0, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "top top", scrub: true } });
  });
})();
