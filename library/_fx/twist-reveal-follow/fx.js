// On hover a photo panel (240×180) rises, twisted, from below 20px beside the cursor (.4s expo.out, panel 50° · photo −50° going to 0), the photo settles from 2x to 1x (.7s),
// Follows the cursor, and on release the panel exits upward and the photo downward (.6s expo.out) then disappears — the original Studio’s HoverImgFx3 values
(() => {
  kfFx.register("twist-reveal-follow", (el, { options, reduce, hover }) => {
    const pic = el.querySelector('[data-fx-part="pic"]');
    if (!pic || reduce || !hover || innerWidth < +(options.min ?? 992)) return;
    const off = +(options.offset ?? 20);
    const reveal = document.createElement("div");
    reveal.className = "fx-trf";
    reveal.innerHTML = '<div class="fx-trf__inner"><div class="fx-trf__img"></div></div>';
    const inner = reveal.firstElementChild, img = inner.firstElementChild;
    const home = pic.parentNode, next = pic.nextSibling;
    img.append(pic);
    el.append(reveal);
    const place = (e) => { reveal.style.left = `${e.clientX + off}px`; reveal.style.top = `${e.clientY + off}px`; };
    // Timeline + startAt like the original — the start position is painted on the next frame, so it starts moving one frame later than fromTo, which paints first in the same frame
    let tl = null;
    const show = (e) => {
      place(e);
      tl?.kill();
      gsap.killTweensOf([inner, img]);
      tl = gsap.timeline({ onStart: () => { reveal.style.opacity = 1; gsap.set(el, { zIndex: 1000 }); } })
        .set([inner, img], { transformOrigin: "50% 100%" })
        .to(inner, { startAt: { x: "50%", y: "120%", rotation: 50 }, x: "0%", y: "0%", rotation: 0, duration: 0.4, ease: "expo.out" }, 0)
        .to(img, { startAt: { x: "-50%", y: "-120%", rotation: -50 }, x: "0%", y: "0%", rotation: 0, duration: 0.4, ease: "expo.out" }, 0)
        .to(img, { startAt: { scale: 2 }, scale: 1, duration: 0.7, ease: "expo.out" }, 0);
    };
    const hide = () => {
      tl?.kill();
      gsap.killTweensOf([inner, img]);
      tl = gsap.timeline({ onStart: () => gsap.set(el, { zIndex: 999 }), onComplete: () => { gsap.set(el, { zIndex: "" }); reveal.style.opacity = 0; } })
        .to(inner, { y: "-120%", rotation: -5, duration: 0.6, ease: "expo.out" }, 0)
        .to(img, { y: "120%", rotation: 5, scale: 1.2, duration: 0.6, ease: "expo.out" }, 0);
    };
    const move = (e) => requestAnimationFrame(() => place(e));
    el.addEventListener("mouseenter", show);
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", hide);
    return () => {
      el.removeEventListener("mouseenter", show);
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", hide);
      tl?.kill();
      gsap.killTweensOf([inner, img]);
      home ? home.insertBefore(pic, next) : el.append(pic);
      reveal.remove();
      gsap.set(el, { clearProps: "zIndex" });
    };
  });
})();
