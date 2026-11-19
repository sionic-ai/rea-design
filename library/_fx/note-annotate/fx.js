(() => {
  // Hover an underlined word and a sticky-note annotation attaches beside the cursor — child [data-fx-part=note] each one is a single note card (data-title + body text).
  // look: sticky (default) one sheet stands from the title and the body grows downward · stack unfolds A·B·C circles and notes in turn and the text is typed out ·
  // lines: note lines spread one by one from the top (the original’s big Hero title). The note is a fixed layer attached to body so the plate’s overflow does not clip it.
  const wait = (ms, dead) => new Promise((r) => setTimeout(() => r(!dead()), ms));

  kfFx.register("note-annotate", (el, { options, reduce, hover }) => {
    const notes = [...el.querySelectorAll('[data-fx-part="note"]')].map((n) => ({ title: n.dataset.title || "", body: n.textContent.trim(), color: n.style.getPropertyValue("--fx-note") }));
    if (!notes.length) return;
    const look = options.look || "sticky";
    const step = +(options.step ?? 4) / 1000;
    const offX = +(options.x ?? 14), offY = +(options.y ?? 14);
    const ease = kfFx.ease("0.22,1,0.36,1", "power3.out");
    const lineEase = kfFx.ease("0.33,1,0.32,1", "power3.out");
    let card = null, run = 0, leaveT = 0, px = 0, py = 0;

    const place = () => {
      if (!card) return;
      const w = card.offsetWidth, h = card.offsetHeight;
      const x = Math.min(px + offX, innerWidth - w - 24), y = Math.min(py + offY, innerHeight - h - 24);
      card.style.left = `${Math.max(24, x)}px`;
      card.style.top = `${Math.max(24, y)}px`;
    };

    const build = () => {
      const c = document.createElement("span");
      c.className = "fx-note-card";
      c.setAttribute("role", "tooltip");
      c.dataset.look = look;
      if (look === "sticky") {
        const n = notes[0];
        c.innerHTML = '<span class="fx-note-card__panel"><span class="fx-note-card__title"></span><span class="fx-note-card__reveal"><span class="fx-note-card__desc"></span></span></span>';
        if (n.color) c.style.setProperty("--fx-note", n.color);
        c.querySelector(".fx-note-card__title").textContent = n.title;
        c.querySelector(".fx-note-card__desc").textContent = n.body;
      } else {
        notes.forEach((n, i) => {
          const row = document.createElement("span");
          row.className = "fx-note-card__row";
          if (n.color) row.style.setProperty("--fx-note", n.color);
          row.innerHTML = '<span class="fx-note-card__badge"></span><span class="fx-note-card__body"><span class="fx-note-card__copy"><span class="fx-note-card__t"></span><span class="fx-note-card__d"></span></span></span>';
          row.querySelector(".fx-note-card__badge").textContent = String.fromCharCode(65 + i);
          c.append(row);
        });
      }
      document.body.append(c);
      return c;
    };

    const typeInto = async (node, text, dead) => {
      for (let i = 1; i <= text.length; i++) { if (!(await wait(step * 1000, dead))) return false; node.textContent = text.slice(0, i); }
      return true;
    };

    const playStack = async (c, dead) => {
      const rows = [...c.querySelectorAll(".fx-note-card__row")];
      const caret = document.createElement("span");
      caret.className = "fx-note-card__caret";
      for (let i = 0; i < rows.length; i++) {
        gsap.fromTo(rows[i].querySelector(".fx-note-card__badge"), { scale: 0.45, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.14, ease });
        if (i + 1 < rows.length && !(await wait(120, dead))) return;
      }
      if (!(await wait(40, dead))) return;
      for (let i = 0; i < rows.length; i++) {
        gsap.fromTo(rows[i].querySelector(".fx-note-card__body"), { clipPath: "inset(0% 100% 0% 0% round 8px)", opacity: 0.35 }, { clipPath: "inset(0% 0% 0% 0% round 8px)", opacity: 1, duration: 0.16, ease });
        if (i + 1 < rows.length && !(await wait(120, dead))) return;
      }
      if (!(await wait(100, dead))) return;
      await Promise.all(rows.map(async (row, i) => {
        if (!(await wait(20 * i, dead))) return;
        const t = row.querySelector(".fx-note-card__t"), d = row.querySelector(".fx-note-card__d");
        t.after(caret);
        if (!(await typeInto(t, notes[i].title, dead))) return;
        d.textContent = " – ";
        const dt = document.createElement("span");
        d.append(dt);
        d.after(caret);
        await typeInto(dt, notes[i].body, dead);
      }));
      caret.remove();
    };

    const playLines = async (c, dead) => {
      const rows = [...c.querySelectorAll(".fx-note-card__row")];
      rows.forEach((row, i) => {
        row.querySelector(".fx-note-card__t").textContent = notes[i].title;
        const d = row.querySelector(".fx-note-card__d");
        d.textContent = "";
        // Wrap words in chunks so each line can be lit one at a time — spaces are left as they are
        (" – " + notes[i].body).split(/(\s+)/).forEach((w) => {
          if (/^\s+$/.test(w)) return d.append(w);
          const s = document.createElement("span");
          s.className = "fx-note-card__w";
          s.textContent = w;
          d.append(s);
        });
      });
      gsap.set(rows, { autoAlpha: 0 });
      for (let i = 0; i < rows.length; i++) {
        gsap.fromTo(rows[i], { autoAlpha: i ? 0.35 : 0, y: i ? -0.92 * rows[i].offsetHeight : 0 }, { autoAlpha: 1, y: 0, duration: i ? 0.17 : 0.16, ease });
        if (!(await wait(i ? 170 : 160, dead))) return;
      }
      if (!(await wait(90, dead))) return;
      for (const row of rows) {
        const words = [...row.querySelectorAll(".fx-note-card__w")], lines = [];
        let top = null;
        for (const w of words) { if (w.offsetTop !== top) { lines.push([]); top = w.offsetTop; } lines[lines.length - 1].push(w); }
        gsap.set(words, { opacity: 0 });
        row.querySelector(".fx-note-card__t").style.opacity = 0;
        gsap.to(row.querySelector(".fx-note-card__t"), { opacity: 1, duration: 0.52, ease: lineEase });
        for (const line of lines.slice(0, 4)) {
          gsap.to(line, { opacity: 1, duration: 0.52, ease: lineEase });
          if (!(await wait(55, dead))) return;
        }
        gsap.set(lines.slice(4).flat(), { opacity: 1 });
      }
    };

    const playSticky = async (c, dead) => {
      const panel = c.querySelector(".fx-note-card__panel");
      gsap.fromTo(panel, { autoAlpha: 0, y: -4 }, { autoAlpha: 1, y: 0, duration: 0.14, ease });
      if (!(await wait(50, dead))) return;
      c.dataset.stage = "body";
      gsap.fromTo(c.querySelector(".fx-note-card__desc"), { y: "-0.35em", opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, ease });
    };

    const open = (e) => {
      clearTimeout(leaveT);
      if (e) { px = e.clientX; py = e.clientY; }
      if (card && !card.dataset.exiting) return place();
      card?.remove();
      const my = ++run, dead = () => my !== run;
      card = build();
      place();
      if (reduce) { card.dataset.stage = "body"; card.querySelectorAll(".fx-note-card__t").forEach((t, i) => (t.textContent = notes[i].title));
        card.querySelectorAll(".fx-note-card__d").forEach((d, i) => (d.textContent = " – " + notes[i].body)); return; }
      (look === "stack" ? playStack : look === "lines" ? playLines : playSticky)(card, dead);
    };
    const close = (now) => {
      clearTimeout(leaveT);
      const go = () => {
        if (!card) return;
        run++;
        const c = card;
        card = null;
        c.dataset.exiting = "";
        gsap.killTweensOf(c.querySelectorAll("*"));
        gsap.to(c, { opacity: 0, duration: reduce ? 0 : 0.24, ease, onComplete: () => c.remove() });
      };
      now === true ? go() : (leaveT = setTimeout(go, 160));
    };
    const move = (e) => { px = e.clientX; py = e.clientY; place(); };
    const tap = (e) => { if (hover) return; e.preventDefault(); card ? close(true) : open(e); };
    const outside = (e) => { if (!hover && card && !el.contains(e.target)) close(true); };

    if (hover) {
      el.addEventListener("pointerenter", open);
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", close);
    }
    el.addEventListener("click", tap);
    const focus = () => { const r = el.getBoundingClientRect(); px = r.left; py = r.bottom; open(); };
    el.addEventListener("focus", focus);
    el.addEventListener("blur", close);
    document.addEventListener("pointerdown", outside);
    addEventListener("scroll", close, { capture: true, passive: true });
    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    return () => {
      run++;
      clearTimeout(leaveT);
      card?.remove();
      card = null;
      el.removeEventListener("pointerenter", open);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", close);
      el.removeEventListener("click", tap);
      el.removeEventListener("focus", focus);
      el.removeEventListener("blur", close);
      document.removeEventListener("pointerdown", outside);
      removeEventListener("scroll", close, { capture: true });
    };
  });
})();
