// Home — partner card horizontal paging (arrows), icon card hover motion (FAQ collapse is in shared.js)
(() => {
  const mm = gsap.matchMedia();

  // Partner slider — one card per arrow click (+16px gap), and the arrow on the end side dims when it is reached
  document.querySelectorAll(".av-carousel").forEach((c) => {
    const track = c.querySelector(".av-track");
    const [prev, next] = c.querySelectorAll(".av-arrow");
    const sync = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    c.querySelectorAll(".av-arrow").forEach((b) => b.addEventListener("click", () => {
      const card = track.querySelector(".av-partner");
      track.scrollBy({ left: (+b.dataset.dir) * ((card?.offsetWidth || 365) + 16), behavior: "smooth" });
    }));
    track.addEventListener("scroll", sync, { passive: true });
    sync();
  });

  mm.add({ motion: "(prefers-reduced-motion: no-preference)", fine: "(hover: hover) and (pointer: fine)" }, ({ conditions }) => {
    if (!conditions.motion || !conditions.fine) return;
    // Icon cards — hovering a card makes the icon perform its own action once (original: clock hands .72s · arrow .22s easeOut · dots gather · percent · key .3s easeInOut)
    const easeOut = kfFx.ease("0,0,0.58,1", "power1.out");
    gsap.utils.toArray(".av-tcard").forEach((card) => {
      const svg = card.querySelector(".av-ticon");
      const kind = svg.dataset.anim;
      const tl = gsap.timeline({ paused: true });
      if (kind === "spin") tl.fromTo(svg.querySelector("path"), { rotation: -36, svgOrigin: "16 16" }, { rotation: 0, duration: 0.72, ease: kfFx.ease("0.22,1,0.36,1", "power3.out") });
      if (kind === "up") tl.fromTo(svg, { y: 0 }, { keyframes: [{ y: -4, duration: 0.11 }, { y: 0, duration: 0.11 }], ease: easeOut });
      if (kind === "down") tl.fromTo(svg, { y: 0 }, { keyframes: [{ y: 4, duration: 0.11 }, { y: 0, duration: 0.11 }], ease: easeOut });
      if (kind === "dots") tl.to(svg.querySelectorAll("circle"), { keyframes: [{ scale: 0.6, duration: 0.11 }, { scale: 1, duration: 0.11 }], transformOrigin: "50% 50%", stagger: 0.05, ease: easeOut });
      if (kind === "pct") tl.fromTo(svg, { rotation: 0 }, { rotation: 360, transformOrigin: "50% 50%", duration: 0.3, ease: "power1.inOut" });
      if (kind === "key") tl.fromTo(svg, { rotation: 0 }, { rotation: 360, transformOrigin: "40% 40%", duration: 0.3, ease: "power1.inOut" });
      card.addEventListener("pointerenter", () => tl.restart());
    });
  });
})();
