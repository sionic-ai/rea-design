// Home page: opening scene and boundary photo scale-down.
// Original values: background·key visual·body fade .6s power1.out → the key visual stands centered at 750px height, drops 15vh (.6s power2.inOut), then rises back into place (.8s power1.inOut)
// Grows to full screen width over 1.4s (power2.inOut). Logo starts at 1.5s (phone .5s), per-piece delay (delay-.7)×.7 (Korean) · ×.75 (English), the English group is pulled forward .38s and everything runs at 1.9x speed.
// Korean fragments blur 8px→0 over .57s power1.inOut, English fragments flicker (brightness 2.4→.2→1.6→1). When done, the menu button · ticket pill appear over .6s (delay .2). Skipped from the second time in the same session.
(() => {
  const { reduced } = window.YT;
  const body = document.body;
  const fvImage = document.querySelector(".t-fv__image");
  const title = document.querySelector("[data-fv-title]");
  title.innerHTML = YT.logo();
  const pieces = [...title.querySelectorAll(".y-logo__p")];
  const fades = [...document.querySelectorAll(".y-haze, .t-fv__image, .t-body")];
  const chrome = document.querySelectorAll(".y-spnav__trigger, .y-ticket");
  const KEY = "yt-fv-intro";

  const showChrome = (animate) =>
    animate ? gsap.to(chrome, { autoAlpha: 1, duration: 0.6, ease: "power1.out", delay: 0.2 }) : gsap.set(chrome, { autoAlpha: 1 });

  const seen = (() => { try { return sessionStorage.getItem(KEY) === "1"; } catch { return false; } })();
  const hashed = location.hash && location.hash !== "#top" && document.getElementById(decodeURIComponent(location.hash.slice(1)));

  if (reduced || seen || hashed) {
    body.classList.remove("is-page-loading");
    showChrome(false);
    gsap.fromTo(body, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.6, ease: "power1.out", clearProps: "opacity" });
  } else {
    const FADE = 0.6, DOWN = 0.6, UP = 0.8, SPEED = 1.9;
    const desktop = matchMedia("(min-width: 769px)").matches;
    gsap.set(chrome, { autoAlpha: 0 });
    gsap.set(pieces, { opacity: 0, filter: "blur(8px)" });
    gsap.set(fades, { opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        try { sessionStorage.setItem(KEY, "1"); } catch {}
        gsap.set(pieces, { clearProps: "filter" });
        gsap.set(fvImage, { clearProps: "transform" });
        showChrome(true);
      },
    });
    body.classList.remove("is-page-loading");

    if (desktop) {
      const startY = (innerHeight - 750) / 2;
      gsap.set(fvImage, { x: 0, xPercent: -50, y: startY, scale: 750 / fvImage.offsetHeight, transformOrigin: "50% 0%" });
      tl.to(fades, { opacity: 1, duration: FADE, ease: "power1.out" }, 0)
        .to(fvImage, { scale: 1, duration: DOWN + UP, ease: "power2.inOut" }, FADE)
        .to(fvImage, { y: startY + innerHeight * 0.15, duration: DOWN, ease: "power2.inOut" }, FADE)
        .to(fvImage, { y: 0, duration: UP, ease: "power1.inOut" }, FADE + DOWN);
    } else {
      tl.to(fades, { opacity: 1, duration: FADE, ease: "power1.out", delay: 0.1 }, 0);
    }

    const logo = gsap.timeline();
    ["ja", "en"].forEach((kind) => {
      const groupStart = logo.duration() - (kind === "en" ? 0.2 * SPEED : 0);
      pieces
        .filter((p) => p.dataset.logoKind === kind)
        .forEach((p) => {
          let at = Math.max(0, parseFloat(p.dataset.logoDelay) - 0.7) * (kind === "ja" ? 0.7 : 0.75);
          if (p.hasAttribute("data-logo-cross")) at = Math.max(0, at - 0.4 * SPEED);
          if (kind === "en") {
            logo.fromTo(p, { opacity: 0, filter: "blur(8px) brightness(1)" }, {
              keyframes: [
                { opacity: 1, filter: "blur(0px) brightness(2.4)", duration: 0.3 },
                { opacity: 0.2, filter: "blur(1.5px) brightness(1)", duration: 0.1 },
                { opacity: 1, filter: "blur(0px) brightness(1.6)", duration: 0.15 },
                { opacity: 1, filter: "blur(0px) brightness(1)", duration: 0.2 },
              ],
              ease: "none",
            }, groupStart + at);
          } else {
            logo.fromTo(p, { opacity: 0, filter: "blur(8px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.57, ease: "power1.inOut" }, groupStart + at);
          }
        });
    });
    tl.add(logo.timeScale(SPEED), desktop ? FADE + DOWN + UP - 0.5 : 0.5);
  }

  // Boundary photo: starts at 1.6x and goes to 1x while the photo’s top edge moves from screen bottom to top (scrub 1)
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const media = document.querySelector(".t-visual__media");
    gsap.fromTo(".t-visual__img", { scale: 1.6 }, { scale: 1, ease: "none", scrollTrigger: { trigger: media, start: "top bottom", end: "top top", scrub: 1 } });
  });
})();
