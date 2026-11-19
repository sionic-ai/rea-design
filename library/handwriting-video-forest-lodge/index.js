// Home — the original common.js scroll effects with the same ScrollTrigger values: Hero blur, concept pin, photo parallax, accordion, room modal Swiper
(() => {
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    gsap.to("#front_fv", { opacity: 0, filter: "blur(50px)", ease: "none", scrollTrigger: { trigger: "#front_fv", start: "25% top", end: "bottom top", scrub: true } });
  });

  // Photo parallax — original .js-object pushes only the inner image by data-y (half on phone, follow .5 → .2). Text blocks with no image are skipped
  const drift = (half, scrub) => gsap.utils.toArray(".js-object").forEach((el) => {
    const img = el.querySelector(".wf-img");
    if (!img) return;
    const y = half ? el.getAttribute("data-y") / 2 || -100 : el.getAttribute("data-y") || -100;
    gsap.to(img, { y, scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub } });
  });

  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".kt-concept", { opacity: 1, ease: "none", scrollTrigger: { trigger: ".kt-concept__inner", start: "-180px top", end: "500%", scrub: 0.3, pin: ".kt-concept__inner" } });
    drift(false, 0.5);
  });
  mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
    gsap.to(".kt-concept", { opacity: 1, ease: "none", scrollTrigger: { trigger: ".kt-concept__inner", start: "-80px top", end: "100%", scrub: 1, pin: ".kt-concept__inner" } });
    drift(true, 0.2);
  });

  // Accordion — original js-details: height and opacity at 400ms ease-out (WAAPI), pressing again while it runs is ignored
  const timing = { duration: 400, easing: "ease-out" };
  document.querySelectorAll(".kt-acc").forEach((d) => {
    const sum = d.querySelector("summary"), body = d.querySelector(".kt-acc__body");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.dataset.anim === "running") return;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (d.open) {
        d.classList.toggle("is-opened");
        const a = body.animate([{ height: body.offsetHeight + "px", opacity: 1 }, { height: 0, opacity: 0 }], reduce ? { duration: 0 } : timing);
        d.dataset.anim = "running";
        a.onfinish = () => { d.removeAttribute("open"); d.dataset.anim = ""; ScrollTrigger.refresh(); };
      } else {
        d.setAttribute("open", "true");
        d.classList.toggle("is-opened");
        const a = body.animate([{ height: 0, opacity: 0 }, { height: body.offsetHeight + "px", opacity: 1 }], reduce ? { duration: 0 } : timing);
        d.dataset.anim = "running";
        a.onfinish = () => { d.dataset.anim = ""; ScrollTrigger.refresh(); };
      }
    });
  });

  // Room modal — like the original, whichever modal is opened, the Swipers of both modals (loop · 600ms · 2.2s autoplay · arrows · dots) are set up together, and both are torn down on close
  const rooms = [...document.querySelectorAll(".kt-room")];
  let sws = [];
  const build = () => rooms.map((dlg) => new Swiper(dlg.querySelector(".kt-room__swiper"), {
    loop: true, slidesPerView: 1, speed: 600, allowTouchMove: true,
    navigation: { nextEl: dlg.querySelector(".kt-room__next"), prevEl: dlg.querySelector(".kt-room__prev") },
    autoplay: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { delay: 2200 },
    pagination: { el: dlg.querySelector(".kt-room__pager"), clickable: true },
  }));
  rooms.forEach((dlg) => {
    dlg.addEventListener("kt:open", () => { sws.forEach((w) => w.destroy()); sws = build(); });
    dlg.addEventListener("kt:close", () => { sws.forEach((w) => w.destroy()); sws = []; });
  });
})();
