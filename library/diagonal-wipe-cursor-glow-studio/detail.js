// Work detail — original Project: top photo clip (first visit · paging goes from the top to 50% in 1s inOut, arriving from the next work, a full panel folds to 50% in 1s expo.inOut),
// Client · title blur-in (.04 stagger), info lines rise, once the photo plane is half past the nav switches to the light plane, result line 1.4s expo.inOut, next work plane (one-screen pin · number 0→100 · advances when full)
(() => {
  const ES = window.ES;
  const { q, qa, rem } = ES;
  const half = () => (ES.mobile ? "polygon(0px 0px, 100% 0px, 100% 50vh, 0px 50vh)" : "polygon(0% 0%, 100% 0%, 100% 50%, 0% 50%)");

  ES.pages.project = (root, api) => {
    const hero = q(".es-phero", root), img = q(".es-phero-image", hero);
    const all = q(".es-allwork", root);
    const words = (el) => new SplitText(el, { type: "lines", linesClass: "es-split-line" }).lines;
    const client = words(q(".es-phero-client", hero)), title = words(q(".es-phero-title", hero));
    const meta = qa(".es-phero-meta-title, .es-phero-meta-text", hero).map((el) => { el.innerHTML = `<span class="es-line"><span class="es-line-in">${el.innerHTML}</span></span>`; return q(".es-line-in", el); });
    if (!ES.reduce) {
      if (ES.projectNext) api.intro.fromTo(img, { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 150%)" }, { clipPath: half(), duration: 1, ease: "expo.inOut" }, 0);
      else api.intro.fromTo(img, { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" }, { clipPath: half(), duration: 1, ease: "inOut" }, 0);
      if (all && !ES.projectNext) api.intro.clip(all, {}, 0.3).textIn(qa(".es-roll > span:first-child", all), {}, 0.4);
      api.intro.moveBlur(client, { stagger: 0.04 }, 0.3).moveBlur(title, { stagger: 0.04 }, 0.4).textIn(meta, { stagger: 0.06 }, 0.4);
      if (!ES.mobile) api.intro.moveBlur(q(".es-phero-visit", hero), {}, 0.5);
    }
    ES.projectNext = false;
    gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } })
      .to(hero, { duration: 1 })
      .add(() => { ES.nav.theme("dark"); if (all) all.dataset.theme = "dark"; }, 0.45)
      .add(() => { ES.nav.theme("light"); if (all) all.dataset.theme = "light"; }, 0.46);

    // Text enters
    ES.text(q(".es-brief-label", root));
    qa(".es-brief-title, .es-brief-text", root).forEach((t) => ES.text(t));
    ES.text(q(".es-ptext-image-title", root));
    ES.text(q(".es-ptext-image-text", root));
    ES.title(q(".es-pquote-title", root), { filter: "blur(1rem)", stagger: 0.07 });
    ES.title(q(".es-pquote-text", root), { yPercent: 110 });
    const res = q(".es-presults", root);
    if (res && !ES.reduce) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: res, start: "top+=10% bottom" } });
      const borders = qa(".es-presults-border", res);
      tl.fromTo(borders[0], { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0);
      tl.add(ES.title(q(".es-presults-title-in", res), {}, false).play(), 0);
      borders.slice(1).forEach((b, k) => tl.fromTo(b, { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 1.4, ease: "expo.inOut" }, 0.2 + k * 0.1));
      qa(".es-presults-figure", res).forEach((f, k) => tl.add(ES.title(f, { duration: 1.2, yPercent: 20 }, false).play(), 0.4 + k * 0.2));
      qa(".es-presults-item-title", res).forEach((f, k) => tl.add(ES.text(f, {}, false).play(), 0.6 + k * 0.2));
      qa(".es-presults-item-text", res).forEach((f, k) => tl.add(ES.text(f, {}, false).play(), 0.7 + k * 0.2));
    }
    qa(".es-pwide-media, .es-pimg-media", root).forEach((m) => {
      if (!ES.reduce) gsap.timeline({ scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } }).fromTo(q(".es-media-inner", m), { height: "140%", yPercent: -40 }, { yPercent: 0, ease: "none" });
    });

    // Next work — after the plate bottom touches the screen bottom it pins for one screen, and as the plate rises its width goes (screen−10rem)→screen and corners .4rem→0, then it moves on once full
    const next = q(".es-next", root);
    let gone = false;
    if (next && !ES.reduce) {
      const inner = q(".es-next-inner", next), media = q(".es-next-media", next), mi = q(".es-media-inner", media);
      const count = q(".es-next-count", next), url = next.dataset.url;
      const go = () => {
        if (gone || ES.busy) return;
        gone = true;
        gsap.to(inner, { width: innerWidth, x: 0, yPercent: 0, duration: 0.4, ease: "power1.out", overwrite: true });
        ES.projectNext = true;
        if (window.barba && /^https?:$/.test(location.protocol) && barba.go) barba.go(url);
        else location.href = url;
      };
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: next, start: "bottom bottom", end: () => `+=${ES.mobile ? innerHeight * 2 : innerHeight}`, pin: next, scrub: true,
          onUpdate: (st) => { if (!ES.mobile) count.textContent = Math.round(st.progress * 100); if (st.progress >= 0.999) go(); },
        },
      });
      tl.fromTo(inner, { y: () => inner.offsetHeight * 0.3 }, { y: () => -inner.getBoundingClientRect().height * 0.7 + innerHeight * 0.15, duration: 1, ease: "none" }, 0)
        .to(q(".es-next-title", next), { autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo(mi, { scale: 1.2 }, { scale: 1, duration: 0.99, ease: "none" }, 0);
      if (!ES.mobile) {
        tl.fromTo(inner, { width: () => innerWidth - rem(10), x: () => rem(5) }, { width: () => innerWidth, x: 0, duration: 0.6, ease: "none" }, 0)
          .to(q(".es-next-client", next), { x: rem(2), duration: 0.6, ease: "none" }, 0)
          .to(q(".es-next-counter", next), { x: -rem(2), duration: 0.6, ease: "none" }, 0)
          .fromTo(media, { borderRadius: rem(0.4) }, { borderRadius: 0, duration: 0.5, ease: "none" }, 0.5);
      }
    }
    return {};
  };
})();
