// First page — an intro that runs only once (per session): photos turn on in .8s power1.out .04 apart, and .6s later the pillar panel and wordmark come in at 1.3x scale from 5vh below
// settles in place with 1.6s power2.out, at the same time two stroke groups of the wordmark are wiped in from both sides (split-stroke-wipe 1.6s power3.inOut), and at the end the subtitle turns on in .6s.
// Pillar panel hover reaction and the wheel (sway-column-collage) start only after the intro ends. Pressing a pillar (released within 6px) goes to that artist’s page.
(() => {
  const VV = (window.VV = window.VV || {});
  VV.pages = VV.pages || {};
  const KEY = "vv-home-loader";

  VV.pages.home = {
    mount(main) {
      const home = main.querySelector(".vv-home");
      const par = main.querySelector(".vv-home__parallax");
      const mark = main.querySelector(".vv-home__mark");
      const tagline = main.querySelector(".vv-home__tagline");
      const pics = [...main.querySelectorAll(".vv-home__gallery .vv-home__media > .wf-img")];
      const items = [...main.querySelectorAll(".vv-home__item")];
      const lenis = VV.lenis;
      const kill = [];
      if (!home) return () => {};

      // Pillar panel height = Longest bottom among the visible pillars (bottom margin excluded) — same formula as the original
      const fit = () => {
        if (!par) return;
        const h = items.filter((c) => c.offsetParent).reduce((m, c) => Math.max(m, c.offsetTop + c.clientHeight - (parseFloat(getComputedStyle(c).paddingBottom) || 0)), 0);
        par.style.height = `${h}px`;
      };
      fit();
      addEventListener("resize", fit);
      kill.push(() => removeEventListener("resize", fit));

      const startCollage = () => par?.dispatchEvent(new CustomEvent("fx:start"));
      const seen = !!sessionStorage.getItem(KEY);
      gsap.set(home, { opacity: 1 });
      if (seen || VV.reduced) {
        gsap.set([par, mark], { scale: 1, y: 0 });
        gsap.set(pics, { opacity: 1 });
        gsap.set(tagline, { opacity: 1 });
        mark?.dispatchEvent(new CustomEvent("fx:done"));
        startCollage();
      } else {
        gsap.set([par, mark], { scale: 1.3, y: "5vh", transformOrigin: "center top" });
        gsap.set(pics, { opacity: 0 });
        lenis?.stop();
        // Like the original, starts once each column’s first photo has finished downloading or 2s have passed — immediately if there are only placeholders
        const firsts = items.map((c) => c.querySelector(".vv-home__media img")).filter((im) => im?.src);
        const loaded = Promise.all(firsts.map((im) => (im.complete ? 0 : new Promise((r) => { im.addEventListener("load", r, { once: true }); im.addEventListener("error", r, { once: true }); }))));
        let dead = false, t1, t2, t3;
        Promise.race([loaded, new Promise((r) => setTimeout(r, 2000))]).then(() => {
          if (dead) return;
          t1 = gsap.timeline().to(pics, { opacity: 1, duration: 0.8, ease: "power1.out", stagger: 0.04 }, 0);
          t2 = gsap.timeline({
            delay: 0.6,
            onComplete: () => { lenis?.start(); sessionStorage.setItem(KEY, "1"); startCollage(); },
          });
          t2.to(par, { scale: 1, y: 0, duration: 1.6, ease: "power2.out" }, 0).to(mark, { scale: 1, y: 0, duration: 1.6, ease: "power2.out" }, 0);
          mark?.dispatchEvent(new CustomEvent("fx:play", { detail: { delay: 0.6 } }));
          t3 = gsap.to(tagline, { opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.6 + 1.6 });
        });
        kill.push(() => { dead = true; t1?.kill(); t2?.kill(); t3?.kill(); lenis?.start(); });
      }

      // Pillar press — releasing after a drag doesn’t count as a press
      let dx = 0, dy = 0;
      const down = (e) => { dx = e.clientX; dy = e.clientY; };
      const click = (e) => {
        const it = e.target.closest("[data-href]");
        if (!it || Math.hypot(e.clientX - dx, e.clientY - dy) > 6) return;
        VV.swup ? VV.swup.navigate(it.dataset.href) : (location.href = it.dataset.href);
      };
      par?.addEventListener("mousedown", down);
      par?.addEventListener("click", click);
      kill.push(() => { par?.removeEventListener("mousedown", down); par?.removeEventListener("click", click); });

      kill.push(VV.pack(main.querySelector(".vv-home-news__grid")));
      return () => kill.splice(0).reverse().forEach((f) => f());
    },
  };
})();
