// Detail: the wheel becomes sideways movement (1367↑, when the strip is wider than the window — past the end it bounces back in .3s ease), the work info expands (1s expo.inOut timeline), and clicking a photo opens a large overlay starting from that photo.
(() => {
  DT.page("detail", (main) => {
    const offs = [];
    const strip = main.querySelector("[data-strip]");
    const info = main.querySelector("[data-info]");
    const openBtn = main.querySelector(".dt-work__open");
    const content = main.querySelector("[data-info-content]");
    const HEAD = 96;
    const ratio = () => (innerWidth >= 1537 ? 0.8 : 0.72);
    const wide = () => innerWidth > 1024;
    let open = false, x = 0;

    const place = () => {
      if (!wide()) { gsap.set([strip, info], { clearProps: "height,top" }); return; }
      const h = innerHeight * (open ? 0.16 : ratio());
      gsap.set(strip, { height: h });
      gsap.set(info, { top: h + HEAD });
    };
    place();
    addEventListener("resize", place);
    offs.push(() => removeEventListener("resize", place));

    let tl = null;
    const toggle = (on) => {
      if (!wide() || on === open) return;
      open = on;
      if (tl) tl.kill();
      if (DT.reduce) { place(); gsap.set(content, { autoAlpha: on ? 1 : 0, y: on ? -22 : 60 }); gsap.set(openBtn, { autoAlpha: on ? 0 : 1 }); return; }
      tl = gsap.timeline();
      if (on) {
        const h = 0.16 * innerHeight;
        tl.to(strip, { height: h, duration: 1, ease: "expo.inOut" }, 0)
          .to(info, { top: h + HEAD, duration: 1, ease: "expo.inOut" }, "<0")
          .to(openBtn, { y: -5, opacity: 0, duration: 0.3, ease: "expo.inOut" }, "<0.2")
          .fromTo(content, { y: 60 }, { autoAlpha: 1, y: -22, duration: 0.8, ease: "expo.inOut" }, "<0");
      } else {
        const h = innerHeight * ratio();
        tl.to(strip, { height: h, duration: 1, ease: "expo.inOut" }, 0)
          .to(content, { autoAlpha: 0, y: 60, duration: 0.8, ease: "expo.inOut" }, "<0")
          .to(info, { top: h + HEAD, duration: 1, ease: "expo.inOut" }, "<0")
          .to(openBtn, { opacity: 1, y: 0, duration: 0.3, ease: "expo.inOut" }, "<0.4");
      }
    };
    main.querySelector("[data-info-open]").addEventListener("click", () => toggle(!open));
    offs.push(() => tl && tl.kill());

    const wheel = (e) => {
      if (innerWidth < 1367 || strip.scrollWidth <= innerWidth) return;
      const max = strip.scrollWidth - innerWidth;
      x += e.deltaY;
      strip.style.transition = "";
      if (x > max) { x = max; strip.style.transition = "transform 0.3s ease"; }
      if (x < 0) { x = 0; strip.style.transition = "transform 0.3s ease"; }
      strip.style.transform = `translate3d(${-x}px,0,0)`;
    };
    main.querySelector("[data-work]").addEventListener("wheel", wheel, { passive: true });

    const box = main.querySelector("[data-viewer]");
    let em = null;
    const modal = DT.modal(box, {
      onOpen(i) {
        if (!em) em = EmblaCarousel(box.querySelector("[data-viewport]"), { draggable: true, startIndex: i });
        else em.scrollTo(i, true);
      },
    });
    // In the original, tapping the strip closes the info, and tapping a photo opens the big curtain from that frame
    strip.addEventListener("click", (e) => {
      toggle(false);
      const shot = e.target.closest("[data-i]");
      if (shot && wide()) modal.open(+shot.dataset.i);
    });
    offs.push(() => { modal.destroy(); em && em.destroy(); });

    return () => offs.forEach((f) => f());
  });
})();
