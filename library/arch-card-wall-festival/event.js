// On-site event page — original 2024-real. The bottom penlight row rises once the curtain lifts (.7s), flows one set width in 35s and loops,
// The holographic cell of the performer card runs --angle −450°→450° (scrub) while the card passes through the screen, FAQ toggles height 0↔auto on click (.3s power2.out)
(() => {
  const MR = window.MR;
  const track = document.querySelector(".ev-penlight__track"), row = track.querySelector(".ev-penlight__row");
  track.append(row.cloneNode(true));
  let loop;
  const run = () => {
    loop?.kill();
    gsap.set(track, { x: 0 });
    if (MR.reduce) return;
    const c = row.getBoundingClientRect().width;
    loop = gsap.timeline({ repeat: -1 }).to(track, { x: -c, duration: 35, ease: "linear" }).set(track, { x: 0 });
  };
  addEventListener("resize", run);

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    document.querySelectorAll(".ev-grid").forEach((g) => {
      gsap.timeline({ scrollTrigger: { trigger: g, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true } })
        .fromTo(g, { "--angle": "-450deg" }, { "--angle": "450deg", duration: 1, ease: "none" }, 0);
    });
  });

  document.querySelectorAll(".ev-faq__item").forEach((item) => {
    const q = item.querySelector(".ev-faq__q"), a = item.querySelector(".ev-faq__a");
    let open = false;
    q.addEventListener("click", () => {
      q.setAttribute("aria-expanded", String(!open));
      if (open) gsap.to(a, { height: 0, opacity: 0, duration: MR.reduce ? 0 : 0.3, ease: "power2.out" });
      else gsap.fromTo(a, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: MR.reduce ? 0 : 0.3, ease: "power2.out" });
      open = !open;
    });
  });

  MR.inview();
  MR.loaded(() => { document.querySelector(".ev-penlight").classList.add("is-show"); run(); });
})();
