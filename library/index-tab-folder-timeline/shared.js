// Used everywhere on the page: ribbon lines, double-border frames, openings, windows (modals).
// The ribbon must be drawn the same in two places, the opening and the background, so keep the path here as a single set and stamp it out.
(() => {
  gsap.registerPlugin(DrawSVGPlugin);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isSp = () => matchMedia("(max-width: 959px)").matches;
  const G = (window.G = { reduced, isSp });

  // The order is the drawing order (purple → yellow → blue → pink → green). Thickness keeps the original ratio.
  const RIBBONS = {
    pc: {
      box: "0 0 1568 880",
      paths: [
        [1, 120, "M-80 760 C200 780 450 650 700 560 C900 490 1080 470 1250 510 C1400 545 1530 600 1660 640"],
        [2, 106, "M-80 500 C200 470 480 520 720 580 C950 640 1180 660 1330 600 C1460 545 1470 380 1370 370 C1270 360 1230 520 1340 620 C1420 690 1530 730 1660 750"],
        [3, 100, "M-80 170 C150 230 380 280 600 240 C780 205 900 130 1000 150 C1110 175 1110 440 1040 470 C960 500 940 330 1060 240 C1200 140 1420 100 1660 90"],
        [4, 120, "M-80 680 C150 660 360 620 470 470 C560 340 560 80 430 80 C300 80 270 300 380 470 C480 620 760 700 1000 680 C1250 660 1450 520 1660 410"],
        [5, 100, "M-80 340 C120 400 260 560 240 760 C230 880 120 860 150 700 C190 500 420 280 620 300 C760 315 800 420 720 520 C660 600 700 760 760 800 C820 640 980 470 1180 380 C1330 310 1420 330 1400 430 C1380 530 1250 520 1260 430 C1270 360 1450 330 1660 320"],
      ],
    },
    sp: {
      box: "0 0 375 710",
      paths: [
        [1, 52, "M-40 620 C80 640 180 560 260 520 C320 490 360 500 420 540"],
        [2, 46, "M-40 470 C60 450 160 500 230 560 C290 610 360 600 360 540 C360 480 300 470 290 520 C280 580 360 640 420 650"],
        [3, 43, "M-40 120 C40 170 120 190 190 160 C250 135 300 100 320 150 C340 210 300 290 270 280 C240 270 250 180 310 140 C350 115 390 110 420 110"],
        [4, 52, "M-40 400 C30 390 90 360 110 290 C135 200 125 90 100 90 C70 90 60 200 90 280 C130 380 230 420 300 400 C350 385 380 340 420 320"],
        [5, 43, "M-40 230 C20 290 70 400 60 520 C52 600 10 580 15 500 C22 380 120 290 170 310 C220 330 200 420 180 420 C150 420 210 300 260 310 C310 320 260 520 250 640 C300 520 360 420 420 380"],
      ],
    },
  };
  const ribbonSvg = (kind) =>
    `<svg class="g-ribbons g-ribbons--${kind}" viewBox="${RIBBONS[kind].box}" fill="none" aria-hidden="true">` +
    RIBBONS[kind].paths
      .map(([c, w, d]) => `<path class="g-ribbon" data-ribbon="${c}" d="${d}" style="stroke:var(--site-ribbon-${c})" stroke-width="${w}" stroke-linejoin="round"/>`)
      .join("") +
    "</svg>";
  document.querySelectorAll("[data-ribbons]").forEach((el) => (el.innerHTML = ribbonSvg("sp") + ribbonSvg("pc")));
  // Only the five lines visible at the current width move (at the 960 boundary, the PC and phone images diverge)
  G.lines = (root) => [...root.querySelectorAll(`.g-ribbons--${isSp() ? "sp" : "pc"} .g-ribbon`)];

  // ── Frame clone: invert colors only where it overlaps the dark event section ──
  const frame = document.querySelector(".g-frame");
  const dark = document.querySelector("[data-invert-frame]");
  let invert = null;
  if (frame && dark) {
    invert = frame.cloneNode(true);
    invert.classList.add("g-frame--invert");
    invert.setAttribute("aria-hidden", "true");
    invert.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
    frame.after(invert);
    const clip = () => {
      const t = dark.getBoundingClientRect();
      const f = invert.getBoundingClientRect();
      const top = Math.max(t.top, f.top), bottom = Math.min(t.bottom, f.bottom);
      const left = Math.max(t.left, f.left), right = Math.min(t.right, f.right);
      invert.style.clipPath = bottom <= top || right <= left
        ? "inset(0 0 100% 0)"
        : `inset(${top - f.top}px ${f.right - right}px ${f.bottom - bottom}px ${left - f.left}px)`;
    };
    let ticking = false;
    const ask = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { clip(); ticking = false; });
    };
    clip();
    addEventListener("scroll", ask, { passive: true });
    addEventListener("resize", ask);
  }

  // Vertical nav: turns on the section caught in the 10% band at screen center (original rootMargin -45%)
  const navTargets = document.querySelectorAll("[data-nav-section]");
  if (frame && navTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        document.querySelectorAll(`.g-frame [data-nav="${e.target.id}"]`).forEach((li) => li.classList.toggle("is-active", e.isIntersecting));
      });
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    navTargets.forEach((s) => io.observe(s));
  }

  // ── Opening ──
  const op = document.querySelector(".g-op");
  const mv = document.querySelector("[data-after-opening]");
  const frames = document.querySelectorAll(".g-frame");
  if (op && !reduced) {
    const opLines = G.lines(op);
    document.documentElement.classList.add("is-opening");
    gsap.set(op.querySelectorAll(".g-ribbon"), { drawSVG: "0%" });
    gsap.set(op.querySelector(".g-op__bar"), { scaleX: 0, transformOrigin: "left center" });
    gsap.set([mv, ...frames], { autoAlpha: 0 });

    let finishing = false;
    const finish = () => {
      if (finishing) return;
      finishing = true;
      gsap.timeline()
        .to(op.querySelector(".g-op__content"), { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" })
        .set(op, { display: "none" })
        .call(() => document.documentElement.classList.remove("is-opening"))
        .to([mv, ...frames], { autoAlpha: 1, duration: 0.8, ease: "power2.out" }, "+=0.8");
    };
    const draw = { drawSVG: "100%", duration: 1.5, ease: "power2.inOut" };
    gsap.timeline({ onComplete: finish })
      .to({}, { duration: 0.8 })
      .to(op.querySelector(".g-op__progress"), { autoAlpha: 1, duration: 0.5 })
      .addLabel("lines")
      .to(opLines[0], draw, "lines")
      .to(op.querySelector(".g-op__bar"), { scaleX: 1, duration: 3.5, ease: "none" }, "lines")
      .to(opLines[1], draw, "lines+=0.5")
      .to(opLines[2], draw, "lines+=1")
      .to(opLines[3], draw, "lines+=1.5")
      .to(opLines[4], draw, "lines+=2")
      .to({}, { duration: 0.8 });
  } else if (op) {
    op.style.display = "none";
  }

  // ── Redraw background ribbon: erase when the album top passes screen center, redraw when the bottom passes 30% from the top ──
  const bg = document.querySelector(".g-lines");
  const redrawAt = document.querySelector("[data-redraw-lines]");
  if (bg && redrawAt && !reduced) {
    let lines = [], tl = null, wiped = false, played = false;
    gsap.matchMedia().add({ pc: "(min-width: 960px)", sp: "(max-width: 959px)" }, () => {
      lines = G.lines(bg);
      gsap.set(lines, { drawSVG: "100%" });
      tl = gsap.timeline({ paused: true });
      lines.forEach((l, i) => tl.to(l, { drawSVG: "100%", duration: 1.5, ease: "power2.inOut" }, i ? "-=1.2" : 0));
      wiped = played = false;
      return () => { tl.kill(); tl = null; lines = []; };
    });
    let prevTop = redrawAt.getBoundingClientRect().top;
    let prevBottom = redrawAt.getBoundingClientRect().bottom;
    const check = () => {
      const r = redrawAt.getBoundingClientRect();
      const wipeY = innerHeight * 0.5, playY = innerHeight * 0.3;
      if (prevTop > wipeY && r.top <= wipeY && !wiped && tl) {
        tl.pause(0);
        gsap.set(lines, { drawSVG: "0%" });
        wiped = true;
        played = false;
      }
      if (prevBottom > playY && r.bottom <= playY && wiped && !played && tl) {
        tl.restart();
        played = true;
      }
      prevTop = r.top;
      prevBottom = r.bottom;
    };
    addEventListener("scroll", check, { passive: true });
    addEventListener("resize", check);
  }

  // ── Modal: receives a content node and shows it. Closes with Esc·backdrop·close button, and focus returns to the opening button ──
  const modal = document.querySelector(".g-modal");
  if (modal) {
    const inner = modal.querySelector(".g-modal__inner");
    let opener = null;
    const onKey = (e) => {
      if (e.key === "Escape") G.closeModal();
      if (e.key !== "Tab") return;
      const f = [...modal.querySelectorAll("a[href], button:not([disabled])")];
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    };
    G.openModal = (node, type, from) => {
      opener = from;
      inner.replaceChildren(node);
      document.body.dataset.modaltype = type;
      document.body.classList.add("modal-open");
      modal.hidden = false;
      requestAnimationFrame(() => modal.setAttribute("aria-hidden", "false"));
      (modal.querySelector("a[href], button") || modal.querySelector(".g-modal__content")).focus();
      document.addEventListener("keydown", onKey);
    };
    G.closeModal = () => {
      if (modal.getAttribute("aria-hidden") !== "false") return;
      document.body.classList.remove("modal-open");
      modal.setAttribute("aria-hidden", "true");
      modal.addEventListener("transitionend", () => { modal.hidden = true; inner.replaceChildren(); }, { once: true });
      document.body.dataset.modaltype = "";
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
    modal.addEventListener("click", (e) => {
      if (e.target.closest(".js-modal-close, .g-modal__overlay")) G.closeModal();
    });
  }
})();
