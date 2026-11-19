// Home page sections: background overlay, Hero news, recommended · news (phone), issue slider, flowing strip, song badge — the carousel uses the same embla 8.6.0 settings as the original.
// The opening remains in the original code but the flag that turns it on is always false, so it does not run on the real site — view it only with ?opening.
(() => {
  const { reduce, kit, plug, Embla } = window.JD;
  const dishes = [
    ["Round · Mapo tofu stone pot · top view", "Signature menu 1"], ["Round · Shrimp fried rice plate · top view", "Signature menu 2"],
    ["Round · crab meat xiaolongbao steamer · from above", "Signature menu 3"], ["Round · signature xiaolongbao steamer · from above", "Signature menu 4"],
    ["Round · oolong tea xiaolongbao (green) in a steamer · from above", "Signature menu 5"], ["Circle · spicy sesame noodle bowl · top view", "Signature menu 6"],
    ["Round · Shrimp chili plate · overhead", "Signature menu 7"],
  ];

  window.JD.view("home", (root) => {
    const $ = (s) => root.querySelector(s);
    const offs = [];
    const apis = [];
    const make = (vp, opts, plugins) => { const api = Embla(vp, opts, reduce ? [] : plugins); apis.push(api); return api; };

    // Opening (preview) — original order: two mists over the video (10s) → big mist at 6.3s (5s) → when the video ends a .6s fade, title blur .5s → header .64s after 1s
    const opening = $(".opening");
    if (window.JD.first && !reduce && new URLSearchParams(location.search).has("opening")) {
      const html = document.documentElement;
      html.classList.add("jd-opening");
      opening.hidden = false;
      html.style.overflow = "hidden";
      opening.querySelectorAll(".yuge").forEach((y) => y.classList.add("js-play"));
      const t1 = setTimeout(() => opening.querySelector(".yuge-all").classList.add("js-play"), 6300);
      const end = () => {
        clearTimeout(t1); clearTimeout(t2);
        html.style.overflow = "";
        scrollTo(0, 0);
        gsap.to(opening, { opacity: 0, duration: 0.6, onComplete: () => (opening.hidden = true) });
        gsap.timeline()
          .fromTo($(".fv__title"), { opacity: 0, y: 10, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", ease: "power1.in", duration: 0.5 }, "+=0.5")
          .call(() => {
            const chrome = document.querySelectorAll(".hd-logo, .hd-gnav, .hd-lang, .hd-burger, .rsv");
            gsap.set(chrome, { opacity: 0, visibility: "hidden" });
            html.classList.remove("jd-opening");
            gsap.to(chrome, { opacity: 1, visibility: "visible", ease: "power1.out", duration: 0.64, clearProps: "opacity,visibility" });
          }, null, "+=1");
      };
      const t2 = setTimeout(end, 10010);
      opening.querySelector(".opening__skip").addEventListener("click", end, { once: true });
      offs.push(() => { clearTimeout(t1); clearTimeout(t2); html.classList.remove("jd-opening"); html.style.overflow = ""; });
    }

    // Hero news — embla { loop } + Autoplay(4s), the bar of the selected cell fills for that duration
    const news = make($(".fv-news .embla__viewport"), { loop: true }, [plug.autoplay()]);
    const bars = [...root.querySelectorAll(".fv-news__bars .bar")];
    const delay = news.plugins()?.autoplay?.options.delay || 4000;
    const fill = () => {
      const k = news.selectedScrollSnap();
      bars.forEach((b, i) => {
        const f = b.querySelector(".fill");
        f.style.animation = "none"; void f.offsetWidth;
        b.classList.toggle("active", i === k);
        if (i === k) f.style.animation = reduce ? "none" : `fillBar ${delay}ms linear forwards`;
        f.style.width = i === k && reduce ? "100%" : "0%";
      });
    };
    news.on("select", fill);
    fill();

    // Recommended · News — embla that runs on phones only { align: start } + Autoplay (paused at first, runs when 10% is visible on screen), ”01 / 03”
    [".rec__row", ".tnews__box"].forEach((sel) => {
      const box = $(sel);
      const api = make(box.querySelector(".embla__viewport"), { align: "start", active: false, breakpoints: { "(max-width: 768px)": { active: true } } }, [plug.autoplay({ playOnInit: false })]);
      offs.push(kit.btns(api, box.querySelector(".embla__button--prev"), box.querySelector(".embla__button--next")));
      kit.count(api, box.querySelector(".embla__selected-snap-display"));
      offs.push(kit.playInView(api, box, 0.1));
    });

    // Signboard menu — embla { duration: 20, loop, align: center } + ClassNames + Autoplay (4s, keeps going on touch · pauses when focus enters)
    // Marks position±n by distance from the chosen cell so CSS draws the arc (-60·-150·-270px)
    const track = $(".arc__track");
    track.innerHTML = dishes.map(([l, n]) => `<div class="embla__slide"><div class="arc__in"><div class="arc__ph"><div class="wf-img" data-label="${l}"></div></div><h3 class="arc__name">${n}</h3><p class="arc__read">Your reading guide here</p><div class="arc__line"></div><p class="arc__desc">Your three-line menu description goes here. Describe the character of the flavor here.</p></div></div>`).join("");
    const arc = make($(".arc .embla__viewport"), { duration: 20, loop: true, align: "center" }, [plug.classNames(), plug.autoplay({ delay: 4000, stopOnInteraction: false, stopOnFocusIn: true })]);
    offs.push(kit.btns(arc, $(".arc .embla__button--prev"), $(".arc .embla__button--next")));
    const place = () => {
      const nodes = arc.slideNodes(), n = nodes.length, k = arc.selectedScrollSnap();
      nodes.forEach((el, i) => {
        el.classList.forEach((c) => c.startsWith("position") && el.classList.remove(c));
        let d = i - k;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        if (Math.abs(d) <= 4) el.classList.add(`position${d < 0 ? `--${-d}` : d}`);
      });
    };
    arc.on("select", place).on("reInit", place);
    place();
    offs.push(kit.playInView(arc, $(".menu-sec"), 0.2));

    // Flowing photo strip — embla { duration: 16500, align: start, loop } + Autoplay(delay 0): keeps dragging very slowly to the next cell without stopping
    make($(".strip .embla__viewport"), { duration: 16500, align: "start", loop: true, draggable: false }, [plug.autoplay({ delay: 0, stopOnInteraction: false, stopOnFocusIn: false })]);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const shadow = $(".bg-video__shadow"), fv = $(".fv"), fvNews = $(".fv-news");
      ScrollTrigger.create({ trigger: fv, start: "top top", end: "bottom top", onUpdate: (s) => (shadow.style.opacity = s.progress.toFixed(3)) });
      ScrollTrigger.create({ trigger: $(".msg"), start: "bottom top", onEnter: () => (shadow.style.opacity = 0), onLeaveBack: () => (shadow.style.opacity = 1) });
      gsap.set(fvNews, { x: 0 });
      ScrollTrigger.create({
        trigger: $("#message"), start: "top bottom-=100",
        onEnter: () => gsap.to(fvNews, { x: "-120%", duration: 0.5, ease: "power2.in" }),
        onLeaveBack: () => gsap.to(fvNews, { x: "0%", duration: 0.5, ease: "power2.out" }),
      });
      ScrollTrigger.create({
        trigger: fv, start: "top top", end: "bottom top",
        onLeave: () => $(".song")?.classList.add("is-active"),
        onLeaveBack: () => $(".song")?.classList.remove("is-active"),
      });
    });
    mm.add("(prefers-reduced-motion: reduce)", () => { $(".song")?.classList.add("is-active"); });
    const closeSong = () => {
      const s = $(".song");
      s.classList.remove("is-active");
      setTimeout(() => s.remove(), 2000);
    };
    $(".song__close").addEventListener("click", closeSong);

    const more = $(".ball__more");
    const toggleAll = () => {
      more.classList.toggle("showAll");
      $(".ball__list").classList.toggle("showAll", more.classList.contains("showAll"));
      more.textContent = more.classList.contains("showAll") ? "Fold" : "View List";
    };
    more.addEventListener("click", toggleAll);

    return () => {
      offs.forEach((f) => f());
      apis.forEach((a) => a.destroy());
      mm.revert();
    };
  });
})();
