// About — values exactly as in the original aboutGoals·aboutFullMedia·aboutYearsSection
(() => {
  const { color, desktop, reduce, lenis } = window.ES;

  // Team strip — flows by speed each frame (following at .1), dragging pushes 2.5x and wheel .9x, and when a hand hovers over it the speed drops to .5.
  // Cards shrink by 1 − .002×min(100,|speed|) the faster they go, and photos shift sideways up to −50% by how far they are from screen center (original productGallery)
  const team = document.querySelector(".ab-team");
  if (team) {
    const track = team.querySelector(".ab-team__track"), items = [...team.querySelectorAll(".ab-team__inner")];
    let w = items[0].clientWidth, total = items.length * w, target = 0, cur = 0, last = 0, drag = false, x0 = 0;
    const base = desktop() ? 1 : 0.5, sp = { v: reduce ? 0 : base };
    const place = (off) => items.forEach((el, i) => gsap.set(el, { x: gsap.utils.wrap(-w, total - w, i * w + off) }));
    place(0);
    const down = (e) => { drag = true; x0 = e.clientX ?? e.touches[0].clientX; track.classList.add("is-dragging"); };
    const move = (e) => { if (!drag) return; const x = e.clientX ?? e.touches[0].clientX; target -= 2.5 * (x - x0); x0 = x; };
    const up = () => { drag = false; track.classList.remove("is-dragging"); };
    track.addEventListener("mousedown", down); track.addEventListener("mousemove", move); addEventListener("mouseup", up);
    track.addEventListener("touchstart", down, { passive: true }); track.addEventListener("touchmove", move, { passive: true }); track.addEventListener("touchend", up);
    if (!reduce) addEventListener("wheel", (e) => (target += 0.9 * e.deltaY), { passive: true });
    if (desktop() && !reduce) {
      let tw = null;
      track.addEventListener("mouseenter", () => { tw?.kill(); tw = gsap.to(sp, { v: 0.5 }); });
      track.addEventListener("mouseleave", () => { tw?.kill(); tw = gsap.to(sp, { v: base }); });
    }
    addEventListener("resize", () => { w = items[0].clientWidth; total = items.length * w; });
    const cards = items.map((el) => { const card = el.querySelector(".ab-team__card"); return { card, media: el.querySelector(".ab-team__media"), img: el.querySelector(".ab-team__img"), sc: gsap.quickTo(card, "scale", { duration: 0.5, ease: "power1.out" }) }; });
    gsap.ticker.add(() => {
      target += sp.v; cur = cur * 0.9 + 0.1 * target;
      place(-cur);
      const vel = cur - last; last = cur;
      if (reduce) return;
      cards.forEach((c) => {
        c.sc(1 - 0.002 * Math.min(100, Math.abs(vel)));
        if (desktop()) { const r = c.media.getBoundingClientRect(); gsap.set(c.img, { xPercent: -50 * gsap.utils.normalize(0, innerWidth, r.left + r.width / 2 - innerWidth / 2) }); }
      });
    });
  }

  // Investor cells — on hover (press on phones) that cell gets a border and the left intro swaps in .6s power3.inOut. The intro stays pinned while passing the cell group
  const inv = document.querySelector(".ab-inv");
  if (inv) {
    const sw = inv.querySelectorAll(".ab-inv__switcher"), boxes = inv.querySelectorAll(".ab-inv__box"), content = inv.querySelector(".ab-inv__content");
    let tw = null;
    const show = (i) => {
      tw?.kill();
      sw.forEach((s, k) => { if (k !== i) gsap.set(s, { display: "none" }); else tw = gsap.fromTo(s, { display: "none", opacity: 0 }, { display: "block", opacity: 1, duration: reduce ? 0 : 0.6, ease: "power3.inOut" }); });
      boxes.forEach((b, k) => b.classList.toggle("is-active", k === i));
    };
    content.style.minHeight = `${Math.max(...[...sw].map((s) => { s.style.display = "block"; const h = s.offsetHeight; s.style.display = ""; return h; }))}px`;
    boxes.forEach((b, i) => b.addEventListener(desktop() ? "mouseenter" : "click", () => show(i)));
    if (desktop() && !reduce) ScrollTrigger.create({ trigger: inv.querySelector(".ab-inv__track"), pin: content, pinSpacing: false, start: () => `top+=${content.offsetHeight * 0.5} 50%`, end: () => `bottom-=${content.offsetHeight * 0.5} 50%` });
  }
  if (reduce) return;
  const unlit = color("--es-unlit"), ink = color("--kf-ink"), line2 = color("--es-line2");

  document.querySelectorAll(".ab-goals__list li").forEach((li) => {
    gsap.timeline({ scrollTrigger: { trigger: li, start: "top 90%", end: "bottom 50%", scrub: true } })
      .from(li.querySelectorAll(".ab-goals__num, .ab-goals__text"), { color: unlit, duration: 1, ease: "power1.inOut" });
  });

  // Large photo — on entry it shrinks from 1.25x over 1.4s expo.out, and while passing, the photo moves from -20% to 0. The quote on the left stays fixed
  const full = document.querySelector(".ab-full"), scaler = full.querySelector(".ab-full__scaler"), media = scaler.firstElementChild;
  const zoom = gsap.fromTo(scaler, { scale: 1.25 }, { scale: 1, duration: 1.4, ease: "expo.out", paused: true });
  gsap.fromTo(media, { y: "-20%" }, { y: "-0%", duration: 1, ease: "power1.inOut", scrollTrigger: { trigger: full, start: "top bottom", end: "bottom top", scrub: true, onEnter: () => zoom.restart() } });
  if (desktop()) {
    const stick = full.querySelector(".ab-full__stick"), sticky = stick.querySelector(".ab-full__sticky");
    ScrollTrigger.create({ trigger: stick, pin: sticky, start: () => `top+=${sticky.offsetHeight * 0.5} 25%`, end: () => `bottom-=${sticky.offsetHeight * 0.5} 25%` });
  }

  // History — year ticks stay fixed, and when a card date passes screen center it advances one step after .125s with .5s back.inOut, while the line folds and unfolds from white → dark
  const sec = document.querySelector(".ab-years"), track = sec.querySelector(".ab-years__track"), counter = sec.querySelector(".ab-years__counter");
  const dates = sec.querySelectorAll(".ab-card__date"), tr = sec.querySelector(".ab-years__translator"), years = sec.querySelectorAll(".ab-years__year"), line = sec.querySelector(".ab-years__line");
  const h = 100 / years.length;
  const activate = (i) => years.forEach((y, k) => y.classList.toggle("is-active", k === i));
  if (desktop()) {
    ScrollTrigger.create({ trigger: track, start: () => `top+=${counter.offsetHeight * 0.5} 50%`, end: () => `bottom-=${counter.offsetHeight * 0.5} 50%`, pin: counter, pinSpacing: false });
    let cur = 0, a = null, b = null;
    const go = (i) => {
      cur = i; a?.kill(); b?.kill();
      a = gsap.to(tr, { y: `-${h * i}%`, duration: 0.5, delay: 0.125, ease: "back.inOut(1)" });
      b = gsap.fromTo(line, { backgroundColor: ink, scaleX: 1 }, { scaleX: 0, backgroundColor: line2, ease: "power1.inOut", duration: 0.25, delay: 0.125, yoyo: true, repeat: 1 });
      activate(i);
    };
    dates.forEach((d, i) => ScrollTrigger.create({
      trigger: d, start: "50% bottom", end: "50% top",
      onEnter: () => i !== 0 && i !== cur && go(i),
      onEnterBack: () => i !== dates.length - 1 && i !== cur && go(i),
    }));
    years.forEach((y, i) => y.addEventListener("click", () => {
      const d = dates[i];
      if (d) lenis ? lenis.scrollTo(d, { offset: -0.5 * innerHeight, duration: 0.8, easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2) }) : d.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
  }
  sec.querySelectorAll(".ab-card__m").forEach((m) => {
    const first = m.classList.contains("is-first");
    gsap.fromTo(m.querySelector(".ab-card__t"), { y: first ? "25%" : "10%" }, { y: first ? "-25%" : "-10%", ease: "power1.inOut", scrollTrigger: { trigger: m, scrub: true, start: "top bottom", end: "bottom top" } });
  });
})();
