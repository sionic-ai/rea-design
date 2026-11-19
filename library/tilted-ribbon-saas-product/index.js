// Six feature cells — the original loops a Rive file in each cell. Rive files are original assets so they are not used, and SVG/HTML graphics at the same position and size are used instead
// Loop with a GSAP timeline. Like the original, it runs only while the cell is on screen and stops when it leaves
(() => {
  const NS = "http://www.w3.org/2000/svg";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lerpColor = (i, n) => `color-mix(in oklab, var(--kf-accent) ${Math.round(100 - (i / Math.max(1, n - 1)) * 100)}%, var(--site-lime))`;

  // Column 1 — a front that flows in from the top left, gathers at the left of the question column, and spreads out to the right again
  const wires = document.querySelector(".art-wires");
  const draw = (svg, list) => list.forEach(([d, i, n]) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.style.stroke = lerpColor(i, n);
    svg.append(p);
  });
  if (wires) {
    const n = 9, inL = [], outR = [];
    for (let i = 0; i < n; i++) {
      const y0 = -10 + i * 22, yc = 190 + i * 3.2;
      inL.push([`M0 ${y0}C120 ${y0 + 40} 170 ${yc - 10} 300 ${yc}`, i, n]);
      outR.push([`M440 ${yc}C540 ${yc} 600 ${yc + 6 - i * 3} 700 ${200 + i * 4.6}`, i, n]);
    }
    draw(wires, [...inL, ...outR, [`M190 220C320 300 460 290 700 238`, 4, n]]);
  }
  const bus = document.querySelector(".art-bus");
  if (bus) {
    const n = 8, list = [];
    for (let i = 0; i < n; i++) { const y = 40 + i * 4, w = (i - n / 2) * 3; list.push([`M0 ${y + w * 3}C80 ${y + w * 2} 110 ${y} 170 ${y}S260 ${y - w * 2} 340 ${y - w * 4}`, i, n]); }
    draw(bus, list);
  }

  // Light passing over the wire: slides a dashed segment 14% long from start to end
  const glowOn = (svg, count) => {
    const paths = [...svg.querySelectorAll("path")];
    return paths.filter((_, i) => i % Math.ceil(paths.length / count) === 0).map((p) => {
      const g = p.cloneNode();
      g.classList.add("glow");
      g.style.stroke = "var(--kf-accent-text)";
      const L = p.getTotalLength();
      g.setAttribute("stroke-dasharray", `${L * 0.14} ${L}`);
      g.setAttribute("stroke-dashoffset", L * 0.14);
      g.style.opacity = 0;
      svg.append(g);
      return { g, L };
    });
  };

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const loops = [];
    const keep = (card, tl) => { tl.pause(); loops.push([card, tl]); };

    // Cell 1: three lights flow in turn, and the question cell text is typed and erased as it changes
    const askCard = document.querySelector('[data-art="ask"]');
    if (askCard && wires) {
      const glows = glowOn(wires, 4);
      const tl = gsap.timeline({ repeat: -1 });
      glows.forEach(({ g, L }, k) => tl.fromTo(g, { strokeDashoffset: L * 0.14, opacity: 0 }, { strokeDashoffset: -L, opacity: 1, duration: 2.2, ease: "power1.inOut" }, k * 0.55).to(g, { opacity: 0, duration: 0.3 }, k * 0.55 + 1.9));
      keep(askCard, tl);
      const text = askCard.querySelector(".art-ask__text");
      const lines = ["Ask AI anything...", "How do I set up a domain?", "Summarize the latest changes"];
      const type = gsap.timeline({ repeat: -1 });
      lines.forEach((line) => {
        const o = { n: 0 };
        type.to(o, { n: line.length, duration: line.length * 0.045, ease: "none", onUpdate: () => (text.firstChild ? (text.firstChild.nodeValue = line.slice(0, Math.round(o.n))) : (text.textContent = line.slice(0, Math.round(o.n)))) })
          .to({}, { duration: 1.6 })
          .to(o, { n: 0, duration: line.length * 0.018, ease: "none", onUpdate: () => (text.firstChild.nodeValue = line.slice(0, Math.round(o.n))) })
          .to({}, { duration: 0.3 });
      });
      keep(askCard, type);
    }

    // Cell 2: the ring spins, then checks off at .6 second intervals, and spins again after 1.2 seconds
    const upCard = document.querySelector('[data-art="update"]');
    if (upCard) {
      const rows = [...upCard.querySelectorAll(".art-row")], spins = upCard.querySelectorAll(".art-spin");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4 });
      tl.to(spins, { rotate: "+=720", duration: 2.4, ease: "none" }, 0);
      rows.forEach((r, i) => tl.call(() => r.classList.add("is-done"), null, 1.2 + i * 0.6));
      tl.call(() => rows.forEach((r) => r.classList.remove("is-done")), null, 4.2);
      tl.fromTo(rows, { x: 12, opacity: 0.6 }, { x: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 4.2);
      keep(upCard, tl);
    }

    // Cell 3: the highlight (green border, sliding out to the left) moves to the next row every 2 seconds
    const acCard = document.querySelector('[data-art="access"]');
    if (acCard) {
      const users = [...acCard.querySelectorAll(".art-user:not(.art-user--ghost)")];
      let k = 1;
      const tl = gsap.timeline({ repeat: -1 });
      tl.to({}, { duration: 2, onComplete: () => { users[k].classList.remove("is-on"); k = (k + 1) % users.length; users[k].classList.add("is-on"); } });
      keep(acCard, tl);
    }

    // Cell 4: light passes the bundle from left to right, and as it passes three cells scale 1.06x in turn
    const coCard = document.querySelector('[data-art="connect"]');
    if (coCard && bus) {
      const glows = glowOn(bus, 3), tiles = coCard.querySelectorAll(".art-tiles i");
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6 });
      glows.forEach(({ g, L }, k) => tl.fromTo(g, { strokeDashoffset: L * 0.14, opacity: 1 }, { strokeDashoffset: -L, duration: 2, ease: "none" }, k * 0.25));
      tl.to(tiles, { scale: 1.06, duration: 0.25, ease: "power2.out", stagger: 0.12, yoyo: true, repeat: 1 }, 0.75);
      keep(coCard, tl);
    }

    // Cell 5: three cursors drift with different lengths each, and the line is rewritten from the left
    const clCard = document.querySelector('[data-art="collab"]');
    if (clCard) {
      const tl = gsap.timeline({ repeat: -1 });
      [[".art-cur--a", [[-30, 24], [18, 46], [0, 0]], 1.4], [".art-cur--b", [[40, -20], [70, 30], [0, 0]], 1.7], [".art-cur--c", [[-60, -40], [-20, 20], [0, 0]], 1.2]].forEach(([sel, path, d]) => {
        const sub = gsap.timeline();
        path.forEach(([x, y]) => sub.to(clCard.querySelector(sel), { x, y, duration: d, ease: "power2.inOut" }).to({}, { duration: 0.4 }));
        tl.add(sub, 0);
      });
      tl.fromTo(clCard.querySelectorAll(".art-doc__body b"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, stagger: 0.18, ease: "power2.out" }, 0.3);
      keep(clCard, tl);
    }

    // Cell 6: the search window and file window alternately float up from 8px above
    const buCard = document.querySelector('[data-art="build"]');
    if (buCard) {
      const [s, f] = buCard.querySelectorAll(".art-dash__pop");
      const tl = gsap.timeline({ repeat: -1 });
      tl.fromTo(s, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" })
        .to(s, { y: -4, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=1.8")
        .fromTo(f, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.1")
        .to(f, { y: -4, opacity: 0, duration: 0.4, ease: "power2.in" }, "+=1.8");
      keep(buCard, tl);
    }

    const io = new IntersectionObserver((es) => es.forEach((e) => loops.filter(([c]) => c === e.target).forEach(([, tl]) => (e.isIntersecting ? tl.play() : tl.pause()))), { threshold: 0.05 });
    new Set(loops.map(([c]) => c)).forEach((c) => io.observe(c));
    return () => { io.disconnect(); loops.forEach(([, tl]) => tl.kill()); };
  });

  if (reduce) document.querySelectorAll('[data-art="update"] .art-row').forEach((r) => r.classList.add("is-done"));
})();
