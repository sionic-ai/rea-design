/* Work detail motion — original values: Hero 100svh → CSS height .8s power3.inOut · accordion height .3s power1.inOut ·
   barba transition (between detail pages only): the next work’s color panel covers from bottom to top (.55s if the title flies, otherwise .75s, power3.inOut) →
   The title/subtitle ghost flies to the next hero position with max(.85, .25 + intro)s power3.inOut and vanishes at .12s, and the panel lifts away .5s power2.out after .15s */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const initDetail = (root, opts = {}) => {
    const hero = root.querySelector(".dt-hero");
    let intro = null;
    // The first image is 100svh (.is-intro) — here it switches to a CSS height, and the difference is subtracted
    if (hero) hero.classList.remove("is-intro");
    if (hero && !reduce) {
      intro = gsap.from(hero, { height: "100svh", duration: 0.8, ease: "power3.inOut", paused: !!opts.holdIntro, clearProps: "height", onComplete: () => ScrollTrigger.refresh() });
    }
    const items = [...root.querySelectorAll("[data-acc]")];
    const tls = items.map((card) => {
      const btn = card.querySelector(".dt-acc__btn");
      const content = card.querySelector(".dt-acc__content");
      const refresh = () => { tl.invalidate(); ScrollTrigger.refresh(); };
      const tl = gsap.timeline({ paused: true, defaults: { duration: reduce ? 0 : 0.3, ease: "power1.inOut" }, onComplete: refresh, onReverseComplete: refresh });
      tl.set(content, { display: "block" }).fromTo(content, { height: 0 }, { height: "auto" });
      const open = (instant) => { card.classList.add("is-active"); btn.setAttribute("aria-expanded", "true"); instant ? tl.progress(1) : tl.play(); };
      const close = () => { if (!card.classList.contains("is-active")) return; card.classList.remove("is-active"); btn.setAttribute("aria-expanded", "false"); tl.reverse(); };
      btn.addEventListener("click", () => {
        const on = card.classList.contains("is-active");
        tls.forEach((t) => t.close());
        if (!on) open();
      });
      return { open, close };
    });
    if (tls[0]) tls[0].open(true);
    return intro;
  };

  let intro = initDetail(document);

  const overlay = document.querySelector("[data-veil]");
  const panel = document.querySelector("[data-veil-panel]");
  const ghostLayer = document.querySelector("[data-veil-ghost]");
  if (!window.barba || !overlay || reduce) return;
  const DURATION = 0.75, DURATION_SHARED = 0.55, FLIGHT = 0.85, INTRO_DELAY = 0.25, LANDING_FADE = 0.12;
  let ghosts = [];
  const textRect = (node) => { const r = document.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect(); };
  const capture = (trigger) => {
    ghosts = []; ghostLayer.innerHTML = "";
    const src = trigger && trigger.closest(".dt-next");
    if (!src) return false;
    src.querySelectorAll("[data-flip-id]").forEach((node) => {
      const box = node.getBoundingClientRect(), text = textRect(node);
      if (!box.width || !text.width) return;
      const cs = getComputedStyle(node), clone = node.cloneNode(true);
      clone.removeAttribute("data-flip-id");
      Object.assign(clone.style, { position: "fixed", margin: "0", left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`, color: cs.color, fontSize: cs.fontSize, lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, textAlign: cs.textAlign, willChange: "transform, color" });
      ghostLayer.appendChild(clone);
      ghosts.push({ id: node.dataset.flipId, el: clone, box, text, fontSize: parseFloat(cs.fontSize) || 0 });
    });
    return ghosts.length > 0;
  };
  const flip = (container, dur) => {
    const scope = container.querySelector(".dt-hero") || container;
    const tl = gsap.timeline();
    ghosts.forEach((g) => {
      const target = scope.querySelector(`[data-flip-id="${g.id}"]`);
      const to = target ? textRect(target) : null;
      if (!target || !to || !to.width) { tl.to(g.el, { opacity: 0, duration: 0.3, onComplete: () => g.el.remove() }, 0); return; }
      const cs = getComputedStyle(target);
      const scale = g.fontSize ? (parseFloat(cs.fontSize) || g.fontSize) / g.fontSize : 1;
      target.style.visibility = "hidden";
      gsap.set(g.el, { transformOrigin: `${g.text.left - g.box.left}px ${g.text.top - g.box.top}px` });
      tl.to(g.el, { x: to.left - g.text.left, y: to.top - g.text.top, scale, color: cs.color, force3D: true, duration: dur, ease: "power3.inOut",
        onComplete() { target.style.visibility = ""; gsap.to(g.el, { opacity: 0, duration: LANDING_FADE, ease: "none", onComplete: () => g.el.remove() }); } }, 0);
    });
    ghosts = [];
    return tl;
  };

  barba.init({
    preventRunning: true,
    prevent: ({ el }) => {
      if (!el || !el.href) return true;
      if (el.hasAttribute("target") || el.hasAttribute("download")) return true;
      const url = new URL(el.href, location.href);
      if (url.origin !== location.origin) return true;
      if (url.pathname === location.pathname && url.hash) return true;
      return !/detail\.html$/.test(url.pathname);
    },
    transitions: [{
      name: "accent-wipe",
      beforeLeave() { document.documentElement.classList.add("is-transitioning"); ScrollTrigger.getAll().forEach((t) => t.kill()); },
      leave(data) {
        const shared = capture(data.trigger);
        overlay.style.visibility = "visible";
        return gsap.fromTo(panel, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: shared ? DURATION_SHARED : DURATION, ease: "power3.inOut" })
          .then(() => data.current.container.remove());
      },
      beforeEnter() { scrollTo(0, 0); },
      enter(data) {
        const shared = ghosts.length > 0;
        const next = data.next.container;
        window.LR?.mount(next);
        intro = initDetail(next, { holdIntro: shared });
        const hero = next.querySelector(".dt-hero");
        let flightTl = null, flightDur = FLIGHT, introAt = 0;
        if (shared) {
          if (intro) { flightDur = Math.max(FLIGHT, INTRO_DELAY + intro.duration()); introAt = flightDur - intro.duration(); }
          const saved = hero ? hero.style.height : "";
          if (hero) hero.style.height = "";
          flightTl = flip(next, flightDur);
          if (hero) hero.style.height = saved;
        }
        ScrollTrigger.refresh();
        const tl = gsap.timeline({ onComplete() { overlay.style.visibility = "hidden"; gsap.set(panel, { opacity: 1, clipPath: "inset(100% 0% 0% 0%)" }); document.documentElement.classList.remove("is-transitioning"); } });
        if (shared) {
          tl.add(flightTl, 0).to(panel, { opacity: 0, duration: 0.5, ease: "power2.out" }, 0.15);
          if (intro) tl.call(() => intro.play(), null, introAt);
        } else {
          const title = next.querySelector(".dt-hero__title");
          tl.to(panel, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0.15);
          if (title) tl.from(title, { yPercent: 40, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.2);
        }
        return tl;
      },
      after() { ghostLayer.innerHTML = ""; ghosts = []; window.LR?.refreshTone(); },
    }],
  });
})();
