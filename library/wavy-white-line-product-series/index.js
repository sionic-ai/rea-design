// First page: opening sequence (curtain · photo · header line · line · logo · vertical text) · changing the scroll shape of the hero line · tech section pinned transition · philosophy panel settling down · footer line.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = matchMedia("(max-width: 768px)");
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;

  const start = () => {
    const loader = $(".sd-loader");
    const img = $(".sd-kv__imgbody");
    const head = $(".sd-head");
    const kvLine = $(".sd-kv__line");

    if (reduce) {
      loader.style.display = "none";
      gsap.set([img, head, ".sd-kv__logo", ".sd-kv__copy"], { opacity: 1 });
      $(".sd-intro__imgbody").dataset.visible = "true";
    } else {
      // Lock scrolling until the opening sequence ends (the original releases it at 2.6s when the header has fully come down)
      scrollTo(0, 0);
      root.style.overflow = "hidden";
      // The original added the line .6s before the header row (timeline −.2s) so GSAP pushed everything back .2s — line 0 · veil·photo .2 · header row .6 · logo 1.8 · vertical text 2.2
      // The line is drawn immediately with playback (a call at 0s of a paused timeline isn’t fired on play)
      const tl = gsap.timeline({ paused: true });
      tl.to(loader, { opacity: 0, duration: 0.1, ease: "none", onComplete: () => { loader.style.display = "none"; } }, 0.2);
      tl.to(img, { opacity: 1, duration: 1, ease: "none" }, 0.2);
      tl.fromTo(img, { scale: 1.25 }, { scale: 1, duration: 8, ease: "power4.out" }, 0.2);
      tl.fromTo(head, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 2, ease: "power3.out", onComplete: () => { root.style.overflow = ""; setTimeout(() => ScrollTrigger.refresh()); } }, 0.6);
      tl.to(".sd-kv__logo", { opacity: 1, duration: 1, ease: "none" }, 1.8);
      tl.to(".sd-kv__copy", { opacity: 1, duration: 1, ease: "none" }, 2.2);
      requestAnimationFrame(() => { kvLine.kfWiggleLine?.draw({ dur: 3.6, ease: "power4.inOut" }); tl.play(); });
    }

    // The hero line rests once the top of the intro photo passes above the screen top
    const introImg = $(".sd-intro__image");
    new IntersectionObserver(([en]) => kvLine.kfWiggleLine?.hold(en.isIntersecting), { rootMargin: "999999px 0px -100% 0px" }).observe(introImg);

    // About photo — turns on in 1s when inside 15% from the top and bottom of the screen, 1.25 → 1 over 8s
    const introBody = $(".sd-intro__imgbody");
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { introBody.dataset.visible = "true"; io.disconnect(); } }, { rootMargin: "-15% 0px" });
    io.observe(introBody);

    // ── Technology Section ──
    const texts = $$(".sd-tech__text");
    const nums = $$(".sd-tech__num p");
    const blocks = $$(".sd-tech__block");
    const bars = $$(".sd-tech__barbody");
    const lineEls = $$(".sd-tech__line");
    // The fourth section draws a polyline and a curve together
    const groups = [];
    lineEls.forEach((el) => { if (el.hasAttribute("data-pair")) groups[groups.length - 1].push(el); else groups.push([el]); });

    const video = $(".sd-tech__video video");
    const setVideo = () => {
      const src = video.dataset[sp.matches ? "sp" : "pc"];
      if (video.getAttribute("src") !== src) video.src = src;
    };
    setVideo();
    sp.addEventListener("change", setVideo);

    if (!reduce) {
      texts.forEach((t, i) => {
        const first = i === 0, last = i === texts.length - 1;
        const enter = () => {
          if (sdState.anchoring && !first && !last) return;
          gsap.set(t.firstElementChild, { opacity: 1 });
          groups[i].forEach((el) => el.kfWiggleLine?.pulse());
        };
        const leave = () => groups[i].forEach((el) => el.kfWiggleLine?.fade());
        let tl = null;
        const build = () => {
          tl?.scrollTrigger?.kill(); tl?.kill();
          const p = sp.matches ? 10 : 20;
          tl = gsap.timeline({
            scrollTrigger: { trigger: blocks[i], scrub: true, start: "top center-=50px", end: "bottom center+=50px", onEnter: enter, onEnterBack: enter, onLeave: leave, onLeaveBack: leave },
          });
          tl.fromTo(t, { opacity: first ? 1 : 0, y: first ? 0 : `${p}%` }, { opacity: 1, y: 0 });
          tl.fromTo(nums[i], { y: first ? 0 : "100%" }, { y: 0 }, "<");
          tl.to(bars[i], { width: 32, opacity: 1 }, "<");
          tl.to(t, { opacity: last ? 1 : 0, y: last ? 0 : `-${p}%` });
          tl.to(nums[i], { y: last ? 0 : "-100%" }, "<");
          tl.to(bars[i], { width: "100%", opacity: 0.4 }, "<");
        };
        build();
        sp.addEventListener("change", build);
      });

      // Magnet scroll — y mandatory only while the block group fills the screen
      const snap = $(".sd-tech__snap");
      let on = false;
      const setSnap = (yes) => {
        root.style.scrollSnapType = yes ? "y mandatory" : "none";
        root.style.scrollSnapStop = yes ? "always" : "normal";
        sdState.snapping = yes;
      };
      gsap.ticker.add(() => {
        if (sdState.anchoring) { if (on) { setSnap(false); on = false; } return; }
        const r = snap.getBoundingClientRect();
        const want = r.y < 0 && -(r.y - innerHeight) < r.height;
        if (want !== on) setSnap(want);
        on = want;
      });

      // Philosophy panel — while the Contact section head travels from the bottom to the top of the screen, it settles down by 20% of the window height
      gsap.to(".sd-belief__body", { y: () => innerHeight * 0.2, ease: "none", scrollTrigger: { trigger: "#contact", start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
    } else {
      texts.forEach((t) => gsap.set(t, { opacity: 1 }));
    }

    // Philosophy wave video — the original loads a transparent webm late
    const wave = $(".sd-belief__wave video");
    if (wave && !wave.getAttribute("src")) wave.src = wave.dataset.src;

    // Footer — turns on when the contact section head passes the screen bottom and makes the line ripple
    const foot = $(".sd-foot");
    const fline = $(".sd-foot__line");
    new IntersectionObserver(([en]) => {
      foot.dataset.visible = String(en.isIntersecting);
      fline.kfWiggleLine?.hold(!en.isIntersecting);
    }, { rootMargin: "999999px 0px 0px" }).observe($("#contact"));
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else queueMicrotask(start);
})();
