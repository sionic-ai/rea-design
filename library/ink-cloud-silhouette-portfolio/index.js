/* First page: an ink panel blooms and the silhouette and title stand up, plus fine and bold plate switching (the ink panel is DG.ink in shared.js) */
(() => {
  DG.page("home", {
    mount(root, { initial, afterLoader } = {}) {
      const hero = root.querySelector("[data-home-hero]");
      const ink = DG.ink(root.querySelector("[data-home-fluid]"), { water: true });
      const fig = root.querySelector(".home-hero__figure");
      const initials = root.querySelectorAll("[data-editorial-initial]"), rests = root.querySelectorAll("[data-editorial-rest]");
      const reveals = root.querySelectorAll("[data-editorial-reveal]"), mode = root.querySelector(".home-hero__mode-control");
      const tl = gsap.timeline({ delay: afterLoader ? 0 : 0.15 });
      if (DG.reduce) { if (ink) ink.st.reveal = 1; }
      else {
        // Ink spreads and blooms (1.8s), the figure stands at 7% lower · -1.4° · 1.075 scale over 1.5s, the first letter of the title rises first and the rest follow
        if (ink) tl.fromTo(ink.st, { reveal: 0 }, { reveal: 1, duration: 1.8, ease: DG.E("easeOutSmooth", "power3.out") }, 0);
        tl.fromTo(fig, { yPercent: 7, rotate: -1.4, scale: 1.075, autoAlpha: 0 }, { yPercent: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 1.5, ease: window.CustomEase ? CustomEase.create("dgFigure", "0.165, 0.84, 0.44, 1") : "power3.out" }, 0.08)
          .fromTo(initials, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: DG.E("easeOutSmooth", "power3.out"), stagger: 0.08 }, 0.2)
          .fromTo(rests, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: DG.E("easeOutSmooth", "power3.out"), stagger: 0.08 }, 0.32)
          .fromTo(reveals, { yPercent: 110 }, { yPercent: 0, duration: 0.7, ease: DG.E("easeOutSmooth", "power3.out"), stagger: 0.08 }, 0.5)
          .fromTo(mode, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power2.out" }, 0.9);
      }
      // Fine / coarse panel
      const sw = root.querySelector("[data-mode-switch]"), opts = sw?.querySelectorAll(".home-hero__mode-opt");
      const flip = () => {
        const bold = !hero.classList.contains("is-bold");
        hero.classList.toggle("is-bold", bold); sw.setAttribute("aria-pressed", String(bold));
        opts[0].classList.toggle("is-on", !bold); opts[1].classList.toggle("is-on", bold);
        DG.bold?.(root, bold);
      };
      sw?.addEventListener("click", flip);
      // When it switches to the bold board, words and lines rise in turn from under the mask and the person stands up from below
      DG.bold = (r, on) => {
        const p = r.querySelector("[data-brutalism-panel]");
        p.setAttribute("aria-hidden", String(!on));
        if (!on || DG.reduce) return;
        gsap.fromTo(p.querySelectorAll("[data-brutal-reveal]"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: DG.E("easeOutSmooth", "power3.out"), stagger: 0.06 });
        gsap.fromTo(p.querySelector(".home-hero__figure--brutal"), { yPercent: 7, scale: 1.075 }, { yPercent: 0, scale: 1, duration: 1.2, ease: DG.E("easeOutSmooth", "power3.out") });
      };
      return () => { tl.kill(); ink?.destroy(); sw?.removeEventListener("click", flip); };
    },
  });
})();
