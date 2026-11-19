(() => {
  kfFx.register("menu-takeover", (el, { options, reduce }) => {
    const part = (role) => el.querySelector(`[data-fx-part="${role}"]`);
    const btn = part("toggle"), panel = part("panel");
    if (!btn || !panel) return;
    const ac = new AbortController(), on = { signal: ac.signal };
    const bg = part("bg"), foot = panel.querySelectorAll('[data-fx-part="foot"]'), links = [...panel.querySelectorAll("a")], was = links.map((a) => a.innerHTML);
    // If every letter were inline-block, lines would break mid-word, so wrap each word as a chunk and leave the spaces between as characters so lines wrap only there
    const splitWords = (a) => {
      const text = a.textContent;
      a.textContent = "";
      for (const bit of text.split(/(\s+)/)) {
        if (!bit) continue;
        if (/^\s+$/.test(bit)) { a.append(bit); continue; }
        const w = document.createElement("span");
        w.className = "fx-word";
        for (const c of bit) { const s = document.createElement("span"); s.className = "fx-ch"; s.textContent = c; w.append(s); }
        a.append(w);
      }
    };
    links.forEach((a) => { if (!a.querySelector(".fx-ch")) splitWords(a); });
    // look: circle — a circle spreads from the button spot to open the panel (original Brand menu). Panel length dur (default 1.4), close (default .9)
    function circle() {
      const panelParts = [...links, ...foot], halves = [...btn.querySelectorAll('[data-fx-part="half"]')], st = { p: 0 }, E = "power4.out";
      const tot = reduce ? 0 : +(options.dur ?? 1.4), back = reduce ? 0 : +(options.close ?? 0.9), k = tot / 1.4;
      const tri = (t, c, w) => Math.max(0, 1 - Math.abs(t - c) / w);
      // The button jumps twice at 9% and 36%, and if halves (two half elements) exist they split apart by ∓18° (back.out(2.2))
      const heart = (t) => {
        gsap.set(btn, { scale: 1 + (t > 0 && t < 1 ? .28 * tri(t, .09, .09) + .22 * tri(t, .36, .1) : 0), transformOrigin: "50% 55%" });
        if (halves.length < 2) return;
        const o = t > 0 ? gsap.parseEase("back.out(2.2)")(Math.max(0, Math.min(1, (t - .05) / .22))) : 0, dx = 12 * o * btn.offsetWidth / 300;
        gsap.set(halves[0], { rotation: -18 * o, x: -dx }); gsap.set(halves[1], { rotation: 18 * o, x: dx });
      };
      // Radius: pops to .1 of the diagonal by 18% (power2.out) → shrinks slightly to .065 by 30% (power1.inOut) → 1.02 times until the end (power3.inOut)
      const clip = (t) => {
        const b = btn.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)), pop = .1 * far, dip = .065 * far;
        const r = t < .18 ? pop * gsap.parseEase("power2.out")(t / .18) : t < .3 ? pop - (pop - dip) * gsap.parseEase("power1.inOut")((t - .18) / .12) : dip + (1.02 * far - dip) * gsap.parseEase("power3.inOut")((t - .3) / .7);
        return `circle(${r.toFixed(1)}px at ${cx.toFixed(1)}px ${cy.toFixed(1)}px)`;
      };
      const draw = () => { panel.style.clipPath = st.p >= 1 ? "" : clip(st.p); heart(st.p); };
      gsap.set(chars, { yPercent: 0 });
      let isOpen = false, ctl;
      const setC = (want) => {
        if (want === isOpen) return;
        isOpen = want; btn.setAttribute("aria-expanded", String(want)); el.classList.toggle("is-open", want); ctl?.kill();
        const v = 160 * Math.min(1.5, Math.max(1, .4 + .6 * innerWidth / 1440));
        if (want) {
          if (panel.style.visibility !== "visible") { st.p = 0; panel.style.visibility = "visible"; panel.style.clipPath = "circle(0px at 0px 0px)"; gsap.set(links, { opacity: 0, x: v }); gsap.set(foot, { opacity: 0, y: v, visibility: "visible" }); }
          ctl = gsap.timeline({ defaults: { ease: E, duration: 1 * k } })
            .to(st, { p: 1, duration: tot * (1 - st.p), ease: "none", onUpdate: draw, onComplete: () => (panel.style.clipPath = "") }, 0)
            .to(links, { opacity: 1, x: 0, stagger: .1 * k }, .8 * k)
            .to(foot, { opacity: 1, y: 0, stagger: .15 * k }, 1.05 * k);
        } else {
          ctl = gsap.timeline({ defaults: { ease: E }, onComplete: () => { panel.style.visibility = "hidden"; panel.style.clipPath = ""; gsap.set(panelParts, { clearProps: "opacity,transform" }); } })
            .to(panelParts, { opacity: 0, duration: .35 * back / .9 }, 0)
            .to(st, { p: 0, duration: back * st.p, ease: "none", onUpdate: draw }, .25 * back / .9);
        }
      };
      // On hover, letters roll up 1.1em in random order (.05s) and a shadow copy below rises (power4.out 1s)
      if (!reduce && matchMedia("(hover: hover) and (pointer: fine)").matches) links.forEach((a) => {
        const cs = a.querySelectorAll(".fx-ch"), roll = (up) => gsap.to(cs, { y: up ? "-1.1em" : 0, duration: 1, ease: E, stagger: { each: .05, from: "random" }, overwrite: true });
        a.addEventListener("pointerenter", () => roll(true), on); a.addEventListener("pointerleave", () => roll(false), on);
      });
      btn.addEventListener("click", () => setC(!isOpen), on);
      addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) setC(false); }, on);
      return () => {
        ac.abort(); ctl?.kill(); panel.style.clipPath = ""; panel.style.visibility = "";
        gsap.set([panel, btn, ...halves, ...foot, ...links], { clearProps: "all" });
        links.forEach((a, i) => (a.innerHTML = was[i]));
        el.classList.remove("is-open");
      };
    }
    // look: fade — the curtain shows in place over dur (default 1.2), and the link rows rise from below over 1.6s starting .25s later with .08s offsets (original menu, all power4.out). On close, after .1s only the curtain lifts over close (default 1.2)
    function fade() {
      const tot = reduce ? 0 : +(options.dur ?? 1.2), back = reduce ? 0 : +(options.close ?? 1.2), k = tot / 1.2, E = "power4.out";
      const rows = [...links.map((a) => a.querySelectorAll(".fx-ch")), ...[...foot].map((f) => [f])];
      let isOpen = false, ctl;
      const setF = (want) => {
        if (want === isOpen) return;
        isOpen = want; btn.setAttribute("aria-expanded", String(want)); el.classList.toggle("is-open", want); ctl?.kill();
        if (want) {
          gsap.set(panel, { visibility: "visible" });
          ctl = gsap.timeline().fromTo(panel, { opacity: 0 }, { opacity: 1, duration: tot, ease: E }, 0);
          rows.forEach((r, i) => ctl.fromTo(r, { yPercent: 100 }, { yPercent: 0, duration: 1.6 * k, ease: E }, (0.25 + 0.08 * i) * k));
        } else {
          ctl = gsap.timeline({ onComplete: () => { gsap.set(panel, { visibility: "hidden", clearProps: "opacity" }); rows.forEach((r) => gsap.set(r, { clearProps: "transform" })); } })
            .to(panel, { opacity: 0, duration: back, ease: E }, 0.1 * back / 1.2);
        }
      };
      btn.addEventListener("click", () => setF(!isOpen), on);
      addEventListener("keydown", (e) => { if (e.key === "Escape" && isOpen) setF(false); }, on);
      return () => {
        ac.abort(); ctl?.kill();
        gsap.set([panel, ...foot], { clearProps: "all" });
        links.forEach((a, i) => (a.innerHTML = was[i]));
        el.classList.remove("is-open");
      };
    }
    // Defaults are the original values. Screens opened and closed often, like apps, shorten them — shortening the board length (dur·close) pulls the text and ending forward at the same ratio
    const chars = panel.querySelectorAll(".fx-ch"), d = reduce ? 0 : +(options.dur ?? 0.5) / 0.5, c = reduce ? 0 : +(options.close ?? 0.45) / 0.45;
    if (options.look === "circle") return circle();
    if (options.look === "fade") return fade();
    gsap.set(chars, { yPercent: 110 });
    gsap.set(foot, { autoAlpha: 0, y: 12 });
    let open = false, tl;
    const set = (want) => {
      if (want === open) return;
      open = want;
      btn.setAttribute("aria-expanded", String(want));
      el.classList.toggle("is-open", want);
      tl?.kill();
      if (want) {
        gsap.set(panel, { visibility: "visible" });
        tl = gsap.timeline()
          .to(bg, { scaleY: 1, duration: 0.5 * d, ease: "power3.inOut" })
          .to(chars, { yPercent: 0, duration: 0.6 * d, stagger: 0.018 * d, ease: "back.out(1.6)" }, 0.25 * d)
          .to(foot, { autoAlpha: 1, y: 0, duration: 0.4 * d, ease: "power2.out" }, 0.5 * d);
      } else {
        tl = gsap.timeline({ onComplete: () => { gsap.set(panel, { visibility: "hidden" }); gsap.set(chars, { yPercent: 110 }); gsap.set(foot, { y: 12 }); } })
          .to(foot, { autoAlpha: 0, duration: 0.2 * c })
          .to(chars, { yPercent: -110, duration: 0.3 * c, stagger: 0.008 * c, ease: "power2.in" }, 0)
          .to(bg, { scaleY: 0, transformOrigin: "bottom", duration: 0.45 * c, ease: "power3.inOut" }, 0.2 * c)
          .set(bg, { transformOrigin: "top" });
      }
    };
    // If another part such as crack-split is attached to the button and changes the open state itself, follow its event, otherwise listen for direct presses
    const split = btn.matches('[data-fx~="crack-split"]');
    if (split) btn.addEventListener("fx:toggle", (e) => set(e.detail.on), on);
    else btn.addEventListener("click", () => set(!open), on);
    addEventListener("keydown", (e) => { if (e.key === "Escape" && open) split ? btn.click() : set(false); }, on);
    return () => {
      ac.abort(); tl?.kill();
      gsap.set([panel, bg, ...foot], { clearProps: "all" });
      links.forEach((a, i) => (a.innerHTML = was[i]));
      el.classList.remove("is-open");
    };
  });
})();
