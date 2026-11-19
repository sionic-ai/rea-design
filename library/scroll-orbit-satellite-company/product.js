// Product — values exactly as in the original moduleProductControl and modulesMenu
(() => {
  const { desktop, reduce, lenis } = window.ES;

  // Row hover — the photo drops out at .9 scale and transparent in .15s, returns as a new photo in .5s and the indicator swaps too
  document.querySelectorAll(".pd-cat").forEach((sec) => {
    const media = sec.querySelector(".pd-cat__media"), badge = sec.querySelector(".pd-cat__badge"), rows = sec.querySelectorAll(".pd-row");
    let a = null, b = null;
    rows.forEach((row) => {
      row.addEventListener("mouseenter", (e) => {
        a?.kill();
        a = gsap.to(media, { scale: 0.9, opacity: 0, ease: "power2.inOut", duration: 0.15, onComplete: () => { a = gsap.to(media, { scale: 1, opacity: 1, ease: "power2.inOut", duration: 0.5 }); } });
        row.classList.toggle("is-bottom", e.offsetY > row.offsetHeight * 0.5);
        rows.forEach((r) => r.classList.remove("is-active"));
        row.classList.add("is-active");
        b?.kill();
        b = gsap.to(badge, { opacity: 0, ease: "power2.inOut", duration: 0.15, onComplete: () => { b = gsap.to(badge, { opacity: 1, ease: "power2.inOut", duration: 0.5 }); } });
      });
      row.addEventListener("mouseleave", (e) => row.classList.toggle("is-bottom", e.offsetY > row.offsetHeight * 0.5));
    });
    // The photo slot stays pinned to the screen center while passing that category
    if (desktop() && !reduce) {
      const track = sec.querySelector(".pd-cat__track"), fol = sec.querySelector(".pd-cat__follower"), table = sec.querySelector(".pd-cat__table");
      track.style.height = `${Math.max(table.offsetHeight, fol.offsetHeight) + innerHeight * 0.3}px`;
      ScrollTrigger.create({ trigger: track, pin: fol, start: () => `top+=${fol.offsetHeight * 0.5} 50%`, end: () => `bottom-=${fol.offsetHeight * 0.5} 50%` });
    }
  });

  // Category menu — after passing 40% below the list, the name cell folds (.4s) and the header button opens in .7s
  const menu = document.querySelector(".pd-menu"), wrap = menu.querySelector(".pd-menu__wrap"), list = menu.querySelector(".pd-menu__list");
  const toggle = menu.querySelector(".pd-menu__toggle"), names = menu.querySelectorAll(".pd-menu__name");
  let state = "active", tl = null;
  const apply = () => {
    tl?.kill(); tl = gsap.timeline();
    if (state === "collapsed") {
      tl.to(wrap, { height: 0, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.to(names, { opacity: 0, scale: 0.9, ease: "power2.out", duration: 0.3 }, 0);
    } else {
      tl.to(wrap, { height: list.offsetHeight, duration: 0.6, ease: "power2.inOut" }, 0);
      tl.to(names, { opacity: 1, scale: 1, stagger: 0.05, ease: "power2.inOut", duration: 0.3 }, 0);
    }
  };
  const btn = gsap.fromTo(toggle, { height: 0 }, { height: () => toggle.scrollHeight || 36, duration: 0.7, ease: "power2.inOut", paused: true });
  toggle.style.height = "0px";
  toggle.addEventListener("click", () => { state = state === "collapsed" ? "active" : "collapsed"; apply(); });
  names.forEach((n) => n.addEventListener("click", (e) => {
    e.preventDefault();
    const t = document.querySelector(n.getAttribute("href"));
    lenis ? lenis.scrollTo(t, { offset: -0.1 * innerHeight }) : t.scrollIntoView({ behavior: "smooth" });
  }));
  if (desktop()) ScrollTrigger.create({
    trigger: ".pd-track", start: "top -40%", end: "bottom bottom",
    onEnter: () => { btn.timeScale(1).play(); menu.classList.add("is-scrolled"); state = "collapsed"; apply(); },
    onLeaveBack: () => { menu.classList.remove("is-scrolled"); btn.timeScale(4).reverse(); state = "active"; apply(); },
  });
})();
