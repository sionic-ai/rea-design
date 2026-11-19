/* Home intro — a curtain Lottie (200px) is drawn at screen center over 2.1s, and .5s after it finishes it moves to the header position over .7s cubic-bezier(.87,0,.13,1) in
   Shrinks to half size while moving up (pivot at top center). On contact it hides and plays the ring Lottie in its place (speed .5, 2 on hover), and the body text appears at .4s. */
(() => {
  const body = document.body;
  const intro = document.querySelector(".tb-intro");
  const slot = document.querySelector(".tb-home__slot");
  const ambient = slot?.querySelector(".tb-lottie");
  const content = document.querySelector(".tb-home__body");
  if (!intro || !slot || !ambient || !content) return;

  const finish = (reduce) => {
    ambient.style.opacity = "1";
    const amb = window.tbSite?.mountLottie(ambient, { autoplay: true, loop: true });
    if (!amb) ambient.dataset.failed = "1";
    content.style.transition = reduce ? "none" : "opacity .4s cubic-bezier(.77,0,.175,1)";
    content.style.opacity = "1";
    body.style.overflow = "";
    dispatchEvent(new Event("tb:intro-done"));
  };

  const SEEN = "tb-intro-seen";
  let seen = false;
  try { seen = sessionStorage.getItem(SEEN) === "1"; } catch (e) { seen = false; }
  const run = (reduce) => {
    if (reduce) { intro.remove(); finish(true); return; }
    // The original is a single-page app, so coming back within the site skips the intro and only the body appears in .4s — from the second time in the same session
    if (seen) { intro.remove(); finish(false); return; }
    try { sessionStorage.setItem(SEEN, "1"); } catch (e) { /* If it can’t be saved, the intro plays every time */ }
    body.style.overflow = "hidden";
    const anim = window.tbSite?.mountLottie(intro, { autoplay: true, loop: false });
    const fly = () => {
      const r = slot.getBoundingClientRect();
      const ease = window.CustomEase ? CustomEase.create("tb-snap", "M0,0 C0.87,0 0.13,1 1,1") : "expo.inOut";
      gsap.fromTo(intro, { left: "50%", top: "50%", xPercent: -50, yPercent: -50, scale: 1 }, {
        top: r.top, yPercent: 0, scale: 0.5, duration: 0.7, ease,
        onComplete: () => {
          intro.style.opacity = "0";
          intro.style.position = "absolute";
          finish(false);
          setTimeout(() => intro.remove(), 1000);
        },
      });
    };
    gsap.set(intro, { left: "50%", top: "50%", xPercent: -50, yPercent: -50, x: 0, y: 0, scale: 1 });
    if (anim) anim.addEventListener("complete", () => setTimeout(fly, 500));
    else setTimeout(fly, 2600);
  };

  const mm = gsap.matchMedia();
  let begun = false;
  mm.add({ calm: "(prefers-reduced-motion: reduce)", move: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
    if (begun) return;
    begun = true;
    run(!!ctx.conditions.calm);
  });
})();
