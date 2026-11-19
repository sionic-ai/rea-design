(() => {
  // Hero curtain — under the contrast-stage-colored curtain, wordmark letters rise in turn, then the wordmark in the curtain and the same wordmark on the page (page) rise into place together while
  // The curtain lifts from its bottom edge upward (clip-path), the base-color veil beneath lifts right after, and the first photo (zoom) settles down from a large scale.
  // The page wordmark must be dropped by the same amount (--fx-drop) as the wordmark inside the curtain, via the consumer’s CSS, so the two rise overlapped
  kfFx.register("wordmark-curtain-loader", (el, { options, reduce }) => {
    const curtain = el.querySelector('[data-fx-part="curtain"]');
    const mark = el.querySelector('[data-fx-part="mark"]');
    const veil = el.querySelector('[data-fx-part="veil"]');
    const pick = (s) => (s ? [...document.querySelectorAll(s)] : []);
    const page = pick(options.page), zoom = pick(options.zoom);
    const emit = (n) => el.dispatchEvent(new CustomEvent(n, { bubbles: true }));
    const KEY = options.key || "fx-wordmark-curtain-loader";
    // session: 1 — from the second visit in the same tab, skip the curtain and go straight to the end state (original sessionStorage isLoaded)
    const seen = options.session === "1" && sessionStorage.getItem(KEY) === "true";
    const finish = () => {
      el.classList.add("is-done");
      if (page.length && window.gsap) gsap.set(page, { y: 0 });
      emit("fx:done");
    };
    if (!window.gsap || !curtain || !mark || !mark.children.length || seen || reduce) {
      emit("fx:lift");
      finish();
      return () => { el.classList.remove("is-done"); if (page.length) gsap.set(page, { clearProps: "transform" }); };
    }
    const chars = [...mark.children];
    const SHOW = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", GONE = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
    let tl = null;
    // wait — time (sec) to wait with only the curtain down, original 1.2
    const timer = setTimeout(() => {
      tl = gsap.timeline({ onStart: () => { scrollTo({ top: 0 }); emit("fx:start"); } })
        .to(chars, { y: 0, stagger: { each: +(options.each ?? 0.06) }, duration: +(options.rise ?? 0.7), ease: "power3.out" })
        .addLabel("lift")
        .to([...page, mark], { y: 0, duration: +(options.lift ?? 1), ease: "power2.inOut", onStart: () => emit("fx:lift") }, "lift")
        .fromTo(curtain, { clipPath: SHOW }, { clipPath: GONE, delay: +(options["curtain-delay"] ?? 0.25), duration: +(options.curtain ?? 0.8), ease: "power2.inOut" }, "lift");
      if (veil) tl.fromTo(veil, { clipPath: SHOW }, { clipPath: GONE, delay: +(options["veil-delay"] ?? 0.4), duration: +(options.veil ?? 0.9), ease: "power2.inOut", onComplete: () => { sessionStorage.setItem(KEY, "true"); finish(); } }, "lift");
      else tl.add(() => { sessionStorage.setItem(KEY, "true"); finish(); });
      if (zoom.length) tl.fromTo(zoom, { scale: +(options["zoom-from"] ?? 1.7) }, { scale: 1, delay: +(options["zoom-delay"] ?? 0.4), duration: +(options["zoom-dur"] ?? 1.4), ease: "power2.out" }, "lift");
    }, +(options.wait ?? 1.2) * 1000);
    return () => {
      clearTimeout(timer);
      tl?.kill();
      el.classList.remove("is-done");
      gsap.set([curtain, veil, mark, ...chars, ...page, ...zoom].filter(Boolean), { clearProps: "transform,clipPath" });
    };
  });
})();
