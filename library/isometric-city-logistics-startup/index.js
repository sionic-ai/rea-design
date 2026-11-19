// Home page: isometric drawing stand-up · mission unfolding · branch window·video window · vision pinned scrub · history endless band · rounded panel · press·slogan marquee · code of conduct hover.
// Original values: vision hold .8 screen / handoff 1 screen+18 / end hold 1.3 screen, scrub .5 · video swap .6s clear + 2.4s 1.15→1 power3.out · timeline .022px/ms, pauses 4s after interaction.
(() => {
  const { mm, reveal, blink, modal } = window.T7;

  document.querySelectorAll("[data-iso]").forEach((el) => window.T7.iso(el, el.dataset.iso));

  // ── 45° band pattern behind the company strip: like the original embed, an artboard (PC 1440×2400 · phone 840×4800) is stretched across the strip size and laid down,
  //    Six lines are pushed 300 toward the corner and transparent, then enter over .8s (.25,.46,.45,.94) (delayed .6s · .75s). Band shape and position are our own ──
  const band = (x, y, dir) => (dir > 0
    ? `${x},${y} ${x + 320},${y} ${x + 1320},${y + 1000} ${x + 1000},${y + 1000}`
    : `${x},${y} ${x + 320},${y} ${x - 680},${y + 1000} ${x - 1000},${y + 1000}`);
  const bands = (w, h, rows) => `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${rows.map(([x, y, dir, from, late]) =>
    `<polygon points="${band(x, y, dir)}"${from ? ` class="is-${from}${late ? " is-late" : ""}"` : ""}/>`).join("")}</svg>`;
  document.querySelector(".co__bg").innerHTML =
    bands(1440, 2400, [
      [-560, 300, 1], [1240, 1500, 1], [200, 1450, 1], [1560, 1250, -1], [900, 1650, -1], [360, -60, -1], [-200, 2000, -1],
      [-300, 80, 1, "tl"], [520, -420, 1, "tl", 1], [980, 820, -1, "bl", 1], [760, 260, 1, "br"], [1180, -260, 1, "br", 1], [1720, 650, -1, "tr"],
    ]).replace("<svg", '<svg class="is-pc"') +
    bands(840, 4800, [
      [-700, 600, 1], [400, 2600, 1], [1100, 3300, -1], [300, 3900, -1], [-400, 4200, 1],
      [-400, 300, 1, "tl"], [200, 1500, 1, "tl", 1], [900, 1100, -1, "bl"], [-100, 2100, 1, "br"], [600, 3000, 1, "br", 1],
    ]).replace("<svg", '<svg class="is-sp"');
  document.querySelector(".hi__logo").innerHTML = window.T7.icons.logo("currentColor", "currentColor");
  document.querySelector(".hm__logo").innerHTML = window.T7.icons.logo("currentColor", "currentColor");
  document.querySelector(".hm__grid").innerHTML = Array.from({ length: 36 }, (_, i) =>
    `<span class="wf-img" data-label="${["Web Article Screen Capture", "About page capture", "Interview article capture"][i % 3]}"></span>`).join("");

  // ── Mission expand: height 0 ↔ full .8s ──
  const toggle = document.querySelector(".kv__toggle");
  const greet = document.querySelector(".kv__greet");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", open);
    if (open) {
      greet.hidden = false;
      gsap.fromTo(greet, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.8, ease: "power2.out", onComplete: () => ScrollTrigger.refresh() });
    } else {
      gsap.to(greet, { height: 0, opacity: 0, duration: 0.6, ease: "power2.in", onComplete: () => { greet.hidden = true; ScrollTrigger.refresh(); } });
    }
  });

  document.querySelector("[data-branches]").addEventListener("click", () => modal(`<h2>Upcoming branch list</h2><dl>${
    Array.from({ length: 7 }, (_, i) => `<div><dt>Branch ${i + 1}</dt><dd>Your postal code and branch address in one line (shared office) here.</dd></div>`).join("")}</dl>`));
  // Presentation video: the original is a video player without autoplay — press to play in place, press again to pause
  document.querySelectorAll("[data-inline]").forEach((b) => b.addEventListener("click", () => {
    let v = b.querySelector("video");
    if (!v) {
      v = document.createElement("video");
      v.src = "media/wide.mp4";
      v.playsInline = true;
      b.querySelector(".pr__thumb").append(v);
      b.classList.add("is-playing");
    }
    v.paused ? v.play().catch(() => {}) : v.pause();
  }));
  // SNS device video: the original autoplays, muted, looped — press to pause or play
  document.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
    const v = b.querySelector("video");
    v.paused ? v.play().catch(() => {}) : v.pause();
  }));

  // ── Media pills · slogan text: attach one more copy of the same row so it flows endlessly ──
  const loop = (track, px, dir = -1) => {
    track.innerHTML += track.innerHTML;
    return gsap.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: track.scrollWidth / 2 / px, ease: "none", repeat: -1 });
  };

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The original embed is a lazy iframe, so it runs when the strip comes within 1250px below the screen and is called
    ScrollTrigger.create({ trigger: ".co", start: "top bottom+=1250", once: true, onEnter: () => document.querySelector(".co__bg").classList.add("is-in") });

    // Original sd-loop-box speed (px/s): media 80 · 60 (reverse) · 100, recruit banner slogan 80
    document.querySelectorAll(".mc__row").forEach((row) => loop(row.querySelector(".mc__track"), +row.dataset.speed, row.classList.contains("is-rev") ? 1 : -1));
    loop(document.querySelector(".rc__big"), 80);

    // ── Vision: Outer Height = Screen + hold and pass-through total, inner is sticky ──
    const vi = document.querySelector(".vi");
    const group = vi.querySelector(".vi__group");
    const blocks = [...vi.querySelectorAll(".vi__block")];
    const h3s = blocks.map((b) => b.querySelector("h3"));
    const ps = blocks.map((b) => b.querySelector(".vi__copy p"));
    const vids = [...vi.querySelectorAll(".vi__v")];
    const clips = vids.map((v) => v.querySelector("video"));
    const indi = vi.querySelector(".vi__indi");
    const bar = document.createElement("div");
    bar.className = "t7-progress";
    document.body.append(bar);
    [...h3s, ...ps].forEach((el) => gsap.set(window.T7.split(el), { opacity: 0 }));
    vids.forEach((v, i) => gsap.set(v, { opacity: i === 0 ? 1 : 0, scale: 1.15 }));
    gsap.to(vids[0], { scale: 1, duration: 2.4, ease: "power3.out" });
    let curVid = 0;
    const play = (v) => v && v.play().catch(() => {});
    const switchVideo = (idx) => {
      if (idx === curVid) return;
      gsap.to(vids[curVid], { opacity: 0, duration: 0.6, ease: "power2.inOut", overwrite: true });
      clips[curVid]?.pause();
      gsap.set(vids[idx], { scale: 1.15 });
      gsap.to(vids[idx], { opacity: 1, scale: 1, duration: 2.4, ease: "power3.out", overwrite: true });
      if (clips[idx]) { clips[idx].currentTime = 0; play(clips[idx]); }
      curVid = idx;
    };
    // Plays the current video only while the vision section is on screen (original videoST: top bottom ~ bottom top)
    ScrollTrigger.create({
      trigger: vi, start: "top bottom", end: "bottom top",
      onToggle: (self) => (self.isActive ? play(clips[curVid]) : clips.forEach((c) => c?.pause())),
    });
    const fadeIndi = (show) => gsap.to(indi, { autoAlpha: show ? 1 : 0, duration: 0.5, ease: show ? "power2.out" : "power2.in", overwrite: true });

    let tl, st;
    const build = () => {
      tl && tl.kill();
      st && st.kill();
      const vh = innerHeight;
      const step = vh + 18;
      const hold = vh * 0.8;
      const holdEnd = hold + vh * 0.5;
      const total = hold + step + hold + step + holdEnd;
      vi.style.height = vh + total + "px";
      gsap.set(group, { y: 0 });
      tl = gsap.timeline()
        .to(group, { y: 0, duration: hold, ease: "none" })
        .to(group, { y: -step, duration: step, ease: "none" })
        .to(group, { y: -step, duration: hold, ease: "none" })
        .to(group, { y: -step * 2, duration: step, ease: "none" })
        .to(group, { y: -step * 2, duration: holdEnd, ease: "none" });
      const r = (d) => d / total;
      const holdPoints = [r(hold * 0.5), r(hold + step), r(hold + step + hold + step)];
      const backPoints = [0, r(hold), r(hold + step + hold)];
      let cur = -1;
      const hide = (i) => { gsap.set(h3s[i]._split.chars, { opacity: 0, overwrite: true }); gsap.set(ps[i]._split.chars, { opacity: 0, overwrite: true }); };
      st = ScrollTrigger.create({
        trigger: vi, start: "top top", end: "bottom bottom", animation: tl, scrub: 0.5,
        onToggle: (self) => { bar.style.opacity = self.isActive ? 1 : 0; fadeIndi(self.isActive); },
        onLeaveBack: () => { if (cur >= 0) { hide(cur); cur = -1; } },
        onUpdate: (self) => {
          bar.style.width = self.progress * 100 + "%";
          const p = self.progress;
          const prev = cur;
          while (cur + 1 < holdPoints.length && p >= holdPoints[cur + 1]) cur++;
          while (cur >= 0 && p < backPoints[cur]) cur--;
          if (cur === prev) return;
          for (let i = Math.max(0, Math.min(prev, cur)); i <= Math.max(prev, cur); i++) if (i !== cur && i >= 0) hide(i);
          if (cur >= 0) { reveal(h3s[cur], true, 0.05); reveal(ps[cur], true, 0.02); switchVideo(cur); }
        },
      });
    };
    build();
    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 300); });

    // ── Logo cover: shows when the section enters, a rounded panel rises from below to cover it ──
    const hm = document.querySelector(".hm");
    gsap.fromTo(hm.querySelector(".hm__panel"), { yPercent: 100 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: hm, start: "top bottom", end: "bottom bottom", scrub: true } });
    gsap.fromTo(hm.querySelector(".hm__bg"), { y: -60 }, { y: 60, ease: "none", scrollTrigger: { trigger: hm, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from([hm.querySelector(".hm__bg"), hm.querySelector(".hm__logo")], { opacity: 0, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: hm, start: "top 70%" } });

    // ── Guidelines: row hover swaps the photo + English text blinks ──
    const imgs = [...document.querySelectorAll(".va__img")];
    imgs.forEach((im, i) => gsap.set(im, { opacity: i === 0 ? 1 : 0, scale: 1.15 }));
    gsap.to(imgs[0], { scale: 1, duration: 2.4, ease: "power3.out", scrollTrigger: { trigger: ".va", start: "top 80%" } });
    let curImg = 0;
    document.querySelectorAll(".va__list a").forEach((a, i) => a.addEventListener("mouseenter", () => {
      if (i === curImg) {
        gsap.fromTo(imgs[i], { scale: 1.05 }, { scale: 1, duration: 0.6, ease: "power2.out", overwrite: true });
      } else {
        gsap.to(imgs[curImg], { opacity: 0, duration: 0.25, ease: "power2.inOut", overwrite: true });
        gsap.fromTo(imgs[i], { scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out", overwrite: true });
        curImg = i;
      }
      blink(a.querySelector("h3"));
    }));
  });

  mm.add("(prefers-reduced-motion: reduce)", () => {
    document.querySelector(".co__bg").classList.add("is-in");
    document.querySelectorAll(".vi__v").forEach((v, i) => (v.style.opacity = i === 0 ? 1 : 0));
    document.querySelectorAll(".va__img").forEach((v, i) => (v.style.opacity = i === 0 ? 1 : 0));
  });

  // ── History: on desktop it flows endlessly sideways (pauses 4s after interaction), on phones it runs vertically with each year appearing in turn ──
  const track = document.querySelector(".hi__track");
  const originals = [...track.children];
  const copies = originals.map((item) => {
    const c = item.cloneNode(true);
    c.classList.add("is-clone");
    c.setAttribute("aria-hidden", "true");
    track.append(c);
    window.T7.appear(c);
    return c;
  });
  let hovered = false, held = false, dragging = false, until = 0, period = 0, position = 0, last = 0, startX = 0, startScroll = 0, visible = false, horizontal = false;
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const measure = () => {
    horizontal = getComputedStyle(track).flexDirection.startsWith("row");
    period = horizontal ? copies[0].getBoundingClientRect().left - originals[0].getBoundingClientRect().left : 0;
    if (!horizontal) track.scrollLeft = 0;
    position = track.scrollLeft;
  };
  const move = (x) => { if (period > 0) { position = ((x % period) + period) % period; track.scrollLeft = position; } };
  const rest = () => (until = performance.now() + 4000);
  track.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && (hovered = true));
  track.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && (hovered = false));
  track.addEventListener("pointerdown", (e) => {
    if (!horizontal) return;
    held = true; rest();
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = true; startX = e.clientX; startScroll = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
    track.style.cursor = "grabbing";
  });
  track.addEventListener("pointermove", (e) => dragging && move(startScroll + startX - e.clientX));
  const release = (e) => {
    held = false; dragging = false; rest();
    track.style.cursor = "";
    if (track.hasPointerCapture(e.pointerId)) track.releasePointerCapture(e.pointerId);
  };
  track.addEventListener("pointerup", release);
  track.addEventListener("pointercancel", release);
  track.addEventListener("keydown", (e) => {
    if (!horizontal || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
    e.preventDefault(); rest(); move(track.scrollLeft + (e.key === "ArrowRight" ? 280 : -280));
  });
  new ResizeObserver(measure).observe(track);
  new IntersectionObserver((en) => (visible = en[0].isIntersecting)).observe(track);
  measure();
  const tick = (now) => {
    const dt = last ? Math.min(now - last, 50) : 0;
    last = now;
    if (horizontal && visible && !document.hidden && !motion.matches && !hovered && !held && !dragging && now > until) move(position + dt * 0.022);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

})();
