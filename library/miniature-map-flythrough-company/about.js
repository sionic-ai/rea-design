// About: accordion (only one open, height measured, .8s), symbol CTA entrance (symbol rotates -60° 1.5s · cubes .08s apart · arrow line from .8s · title lines .12s apart with 3D tilt · body .9s · button 1.1s).
(() => {
  const V = window.V;
  const items = [...document.querySelectorAll(".acc__item")];
  const setOpen = (item, open) => {
    const body = item.querySelector(".acc__content");
    body.style.maxHeight = (open ? 0 : body.scrollHeight) + "px";
    body.offsetHeight;
    body.style.maxHeight = (open ? body.scrollHeight : 0) + "px";
    item.classList.toggle("is-open", open);
    item.querySelector(".acc__header").setAttribute("aria-expanded", open);
  };
  items.forEach((item) =>
    item.querySelector(".acc__header").addEventListener("click", () => {
      const open = !item.classList.contains("is-open");
      items.forEach((o) => o !== item && o.classList.contains("is-open") && setOpen(o, false));
      setOpen(item, open);
    })
  );
  addEventListener("resize", () => items.forEach((i) => i.classList.contains("is-open") && (i.querySelector(".acc__content").style.maxHeight = i.querySelector(".acc__content").scrollHeight + "px")));

  const bridge = document.querySelector(".bridge");
  const logo = bridge.querySelector("[data-mark]");
  logo.innerHTML = V.icons.mark;
  const mark = logo.querySelector(".v-mark");
  const cubes = [...mark.querySelectorAll(".cube")];
  const chev = mark.querySelector(".chev");
  const lines = [...bridge.querySelectorAll(".bridge__line")];
  const text = bridge.querySelector(".bridge__text");
  const cta = bridge.querySelector(".bridge__cta");
  const FROM = [[0, -20], [14, -14], [20, 0], [14, 14], [0, 20], [-14, 14], [-20, 0], [-14, -14]];
  const mm = gsap.matchMedia();
  mm.add("(min-width: 981px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.set(mark, { rotation: -60, opacity: 0, transformOrigin: "50% 50%" });
    cubes.forEach((c, i) => gsap.set(c, { opacity: 0, x: FROM[i][0], y: FROM[i][1] }));
    gsap.set(chev, { strokeDasharray: 60, strokeDashoffset: 60 });
    gsap.set(lines, { opacity: 0, y: 88, rotationY: 60, rotationX: 35, transformPerspective: 1000 });
    gsap.set(text, { opacity: 0, y: 30 });
    gsap.set(cta, { opacity: 0, y: 20 });
    const st = ScrollTrigger.create({
      trigger: bridge,
      start: "top 70%",
      once: true,
      onEnter: () => {
        bridge.classList.add("show");
        gsap.timeline()
          .to(mark, { rotation: 0, opacity: 1, duration: 1.5, ease: "power3.out" }, 0)
          .to(cubes, { opacity: 1, x: 0, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }, 0)
          .to(chev, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" }, 0.8)
          .to(lines, { opacity: 1, y: 0, rotationY: 0, rotationX: 0, duration: 1.5, stagger: 0.12, ease: "power3.out" }, 0.3)
          .to(text, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }, 0.9)
          .to(cta, { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, 1.1);
      },
    });
    return () => {
      st.kill();
      gsap.set([mark, ...cubes, chev, ...lines, text, cta], { clearProps: "all" });
    };
  });
  // On phone and reduced motion, only the ellipse spins when entering
  new IntersectionObserver(([e]) => e.isIntersecting && bridge.classList.add("show"), { threshold: 0.2 }).observe(bridge);
})();
