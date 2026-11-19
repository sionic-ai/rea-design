// First page: opening, the heading that settled onto the hero rises with scroll, full-bleed video parallax + white panel 0.5→1,
// A Play circle that follows the mouse, a full-screen video, banquet-hall photos that overlap and fade, big headline letters, and a fixed table of contents.
// Each time this page is entered, shared.js calls the body (box) as scope, and text selectors are searched only within this body.
(() => {
  TR.views.index = (box, { first }) => {
    const { isSP, reduced } = window.TR;
    const header = document.querySelector(".tr-header");
    const logo = document.querySelector(".tr-header__logo");

    /* Wordmark letter splitting — parentheses are raised small and blanks keep only their width */
    box.querySelectorAll(".tr-mv__title [data-chars]").forEach((el) => {
      const text = el.textContent;
      el.textContent = "";
      [...text].forEach((c, i) => {
        const s = document.createElement("span");
        if (c === " ") s.className = "char-space";
        else { s.textContent = c; s.dataset.text = c; }
        if (i === 0) s.classList.add("char-first");
        el.append(s);
      });
    });

    const sp = isSP();
    const vh = () => (window.matchMedia("(min-height: 1010px)").matches ? "55vh" : "59vh");

    /* ---------- Opening: original timeline as is (default curve power1.out · default duration 0.5s) ---------- */
    const opening = gsap.timeline({
      paused: true,
      onComplete: () => {
        sessionStorage.setItem("tr-opened", "1");
        TR.opened = true;
        TR.lenis?.start();
        TR.showCookie?.();
      },
    });
    opening
      .to(".tr-mv__opening", { opacity: 0, pointerEvents: "none", delay: 0.4 })
      .from(".tr-mv__video", { yPercent: -50, duration: 3.6 })
      .to(".tr-mv__shot, .tr-mv__clip", {
        clipPath: "inset(0% 0% 0% 0%)", ease: "power1.out", duration: 0.8, stagger: 0.5,
        onComplete: () => gsap.to(".tr-mv__shot", { opacity: 0 }),
      }, "<")
      .fromTo(".tr-mv__video", { opacity: 0 }, { opacity: 1, duration: 1.6 }, "<")
      .to(".tr-mv__symbol", { opacity: 1, duration: 1.4 }, "<1.5")
      .to(sp ? ".tr-mv__title.u-sp .main span" : ".tr-mv__title.u-pc .main span", { y: "0%", opacity: 1, duration: 1.2, ease: "power3.out", stagger: 0.066 }, "<0.2")
      .to(sp ? "[data-move='sp']" : "[data-move='pc']", { x: "0%", duration: 1.2, stagger: sp ? 0.3 : 0.6 }, "<")
      .to(".tr-mv__background", { height: "96vh", duration: 1.4 }, "<1.1")
      .to(".tr-mv__under", { opacity: 1, duration: 1.4 }, "<0.4")
      .to(".tr-mv__under-line", { width: "100%", duration: 1, ease: "power2.inOut" }, "<")
      .to(".tr-mv__texts", { opacity: 1, duration: 1.4 }, "<0.2");
    if (!sp) opening.to(header, { opacity: 1, pointerEvents: "auto", duration: 1.4 }, "<");

    /* Header: on large screens it sits 59vh down (beside the video window) during the hero, sticks to the top while passing the hero, and the logo appears in the video section.
       The phone appears in full, head included, from the video Section */
    if (sp) gsap.set(header, { opacity: 0, pointerEvents: "none" });
    else { gsap.set(header, { y: vh() }); gsap.set(logo, { opacity: 0, pointerEvents: "none" }); }

    // The opening runs only on the first opened document — entering from Brand, as in the original, the body (and header row on large screens) is brought in 0→1 from the end state
    const firstTime = first && !TR.opened && !reduced;
    if (firstTime) {
      TR.lenis?.stop();
      opening.play(0);
    } else {
      opening.progress(1);
      TR.enter(box, { withHeader: !sp, first });
    }

    const mm = gsap.matchMedia();
    mm.add({ pc: "(min-width: 768px)", sp: "(max-width: 767px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
      const { pc, motion } = conditions;
      const fadeTarget = pc ? logo : header;
      ScrollTrigger.create({
        trigger: ".tr-video", start: "top top", end: "1px top",
        onEnter: () => gsap.to(fadeTarget, { opacity: 1, pointerEvents: "auto", duration: 0.4 }),
        onLeaveBack: () => gsap.to(fadeTarget, { opacity: 0, pointerEvents: "none", duration: 0.2 }),
      });
      if (pc && motion) {
        gsap.fromTo(header, { y: () => vh() }, { y: "0vh", ease: "none", scrollTrigger: { trigger: ".tr-mv", start: "5px top", end: "bottom top", scrub: true, invalidateOnRefresh: true } });
        /* Over the full-bleed video a white panel grows from 0.5x and covers it */
        gsap.fromTo(".tr-ceremony", { scale: 0.5 }, { scale: 1, ease: "none", scrollTrigger: { trigger: ".tr-video", start: "30% bottom", end: "40% top-=20%", scrub: true } });
        /* The banquet hall photo shrinks to 0.7 and fades while the next one stacks on top (except the last) */
        const imgs = gsap.utils.toArray(".tr-banquet__image .image");
        imgs.slice(0, -1).forEach((img) => {
          gsap.to(img, { scale: 0.7, opacity: 0, ease: "none", scrollTrigger: { trigger: img, start: "top top", end: "+=200%", scrub: true } });
        });
      } else if (pc) gsap.set(header, { y: 0 });
      if (motion) {
        gsap.fromTo(".tr-video__inner", { yPercent: -40 }, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".tr-video", start: "5% bottom", end: "bottom top", scrub: true } });
        const chars = document.querySelectorAll(".tr-beyond__title .tr-ch__in");
        gsap.set(chars, { yPercent: 150, xPercent: 60 });
        gsap.to(chars, { yPercent: 0, xPercent: 0, ease: "circ.out", duration: 0.4, stagger: 0.05, scrollTrigger: { trigger: ".tr-beyond__head", start: "top 94%" } });
      }
    });

    /* ---------- Play circle: follows the mouse lagging at a 0.08 ratio. Press for black full-screen video ---------- */
    const video = box.querySelector(".tr-video");
    const body = box.querySelector(".tr-videobody");
    const cursor = box.querySelector(".tr-play.is-cursor");
    const cur = { x: 0, y: 0 };
    const to = { x: 0, y: 0 };
    const onMove = (e) => { to.x = e.clientX; to.y = e.clientY; };
    const follow = () => {
      cur.x += (to.x - cur.x) * 0.08;
      cur.y += (to.y - cur.y) * 0.08;
      cursor.style.transform = `translate(${cur.x}px,${cur.y}px)`;
    };
    if (!sp && !reduced) {
      addEventListener("mousemove", onMove);
      gsap.ticker.add(follow);
    }
    if (!sp) {
      video.addEventListener("mouseenter", () => gsap.to(".tr-play.is-cursor .tr-play__inner", { opacity: 1, duration: 0.4, overwrite: "auto" }));
      video.addEventListener("mouseleave", () => gsap.to(".tr-play.is-cursor .tr-play__inner", { opacity: 0, duration: 0.2, overwrite: "auto" }));
    }
    // As in the original, fullscreen video resumes at volume 0.5 from where it stopped, not from the start
    const full = body.querySelector("video");
    const openVideo = () => {
      TR.lenis?.stop();
      if (full) { full.volume = 0.5; full.play().catch(() => {}); }
      gsap.to(body, { opacity: 1, pointerEvents: "auto", overwrite: "auto" });
    };
    const closeVideo = () => {
      TR.lenis?.start();
      full?.pause();
      gsap.to(body, { opacity: 0, pointerEvents: "none", overwrite: "auto" });
    };
    (sp ? video.querySelector(".tr-play") : video).addEventListener("click", openVideo);
    body.querySelector(".tr-videobody__close").addEventListener("click", closeVideo);
    body.querySelector(".tr-videobody__filter").addEventListener("click", closeVideo);

    /* ---------- Fixed table of contents: visible only between the first section and the big phrase, and the arrow moves to the current section in 0.4s power2.out ---------- */
    if (!sp) {
      const nav = box.querySelector(".tr-anchors");
      const arrow = nav.querySelector(".tr-anchors__arrow");
      const links = [...nav.querySelectorAll("a")];
      const show = (on) => gsap.to(nav, { opacity: on ? 1 : 0, pointerEvents: on ? "auto" : "none", duration: 0.2, overwrite: "auto" });
      ScrollTrigger.create({ trigger: "[data-anchor='start']", start: "top center", end: "top center", onEnter: () => show(true), onLeaveBack: () => show(false) });
      ScrollTrigger.create({ trigger: "[data-anchor='end']", start: "top center", end: "top center", onEnter: () => show(false), onLeaveBack: () => show(true) });
      const moveArrow = (li) => {
        const top = nav.getBoundingClientRect().top;
        const r = li.getBoundingClientRect();
        const a = arrow.getBoundingClientRect();
        gsap.to(arrow, { top: r.top - top + (r.height - a.height) / 2, duration: reduced ? 0 : 0.4, ease: "power2.out" });
      };
      links.forEach((a) => {
        const target = box.querySelector(a.getAttribute("href"));
        if (!target) return;
        const on = () => { links.forEach((l) => l.classList.remove("is-current")); a.classList.add("is-current"); moveArrow(a.parentElement); };
        ScrollTrigger.create({
          trigger: target, start: "top center", end: "bottom center",
          onEnter: on, onEnterBack: on,
          onLeave: () => a.classList.remove("is-current"), onLeaveBack: () => a.classList.remove("is-current"),
        });
      });
    }
    /* ---------- Video: like the original, hero-window and full-bleed videos play when 10% visible and pause when out of view (stay paused with reduced motion) ---------- */
    const loops = [...box.querySelectorAll(".tr-mv__clip video, .tr-video video")];
    const seen = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !reduced ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: 0.1 });
    loops.forEach((v) => { if (reduced) v.removeAttribute("autoplay"); seen.observe(v); });

    // Anything attached to the window does not vanish with the body, so detach it when paging
    return () => {
      removeEventListener("mousemove", onMove);
      gsap.ticker.remove(follow);
      seen.disconnect();
      full?.pause();
    };
  };
})();
