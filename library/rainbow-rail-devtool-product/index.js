// First page — hero tabs, integrated Lottie, Why tab + card slider, SDK picker, code copy
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero tabs — original tabs (enter 300ms ease-in, leave 100ms in css), no automatic advance
  const heroTabs = [...document.querySelectorAll(".gb-hero__tab")];
  const heroPanes = [...document.querySelectorAll(".gb-hero__pane")];
  heroTabs.forEach((t, i) => t.addEventListener("click", () => {
    heroTabs.forEach((x, j) => { x.classList.toggle("is-current", i === j); x.setAttribute("aria-selected", String(i === j)); });
    heroPanes.forEach((p, j) => p.classList.toggle("is-active", i === j));
  }));

  // Integration section — Lottie (our shapes) 14.02s loop. Original data-loading=Like lazy, loads and plays when it nears the screen
  const lt = document.querySelector(".gb-int__lottie");
  if (lt && window.lottie && window.gbIntegrationsLottie) {
    let anim = null;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || anim) return;
      anim = lottie.loadAnimation({
        container: lt, renderer: "svg", loop: true, autoplay: !reduce,
        animationData: window.gbIntegrationsLottie,
        rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
      });
      if (reduce) anim.goToAndStop(277, true);
      io.disconnect();
    }, { rootMargin: "200px 0px" });
    io.observe(lt);
  }

  // Why — a swiper per tab (auto width · 20px gap · 700ms · loop · 3s autoplay, pauses on hover), rebuilt 350ms after a tab change
  const whyTabs = [...document.querySelectorAll(".gb-why__tab")];
  const whyPanes = [...document.querySelectorAll(".gb-why__pane")];
  let swipers = [];
  const initSliders = () => {
    swipers.forEach((s) => s && !s.destroyed && s.destroy(true, true));
    swipers = [];
    if (!window.Swiper) return;
    document.querySelectorAll(".gb-why__pane.is-active .swiper").forEach((el) => {
      swipers.push(new Swiper(el, {
        slidesPerView: "auto", spaceBetween: 20, speed: 700, loop: true, centeredSlides: false, watchOverflow: true,
        autoplay: reduce ? false : { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true },
      }));
    });
  };
  whyTabs.forEach((t, i) => t.addEventListener("click", () => {
    whyTabs.forEach((x, j) => { x.classList.toggle("is-current", i === j); x.setAttribute("aria-selected", String(i === j)); });
    whyPanes.forEach((p, j) => p.classList.toggle("is-active", i === j));
    setTimeout(initSliders, 350);
  }));
  initSliders();

  // SDK picker — only the chosen version is shown and the wrapper height adjusts with .35s power2.out
  const select = document.querySelector("[data-gb-stack]");
  const box = document.querySelector(".gb-sdk__infos");
  const infos = [...document.querySelectorAll(".gb-sdk__info")];
  if (select && box && infos.length && window.gsap) {
    let last = null;
    const filter = (value, animate) => {
      let matched = null;
      infos.forEach((el) => {
        const show = el.dataset.stack === value;
        if (show && !matched) matched = el;
        gsap.set(el, { position: show ? "relative" : "absolute", visibility: show ? "visible" : "hidden", opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none", top: 0, left: 0 });
      });
      const h = matched ? matched.offsetHeight : 0;
      animate && !reduce ? gsap.to(box, { height: h, duration: 0.35, ease: "power2.out", overwrite: true }) : gsap.set(box, { height: h });
    };
    filter(select.value, false);
    select.addEventListener("change", () => { if (select.value === last) return; last = select.value; filter(select.value, true); });
    addEventListener("resize", () => filter(select.value, false));
  }

  // Code copy — fades for .4s to show it was pressed
  document.querySelectorAll(".gb-code__copy").forEach((b) => b.addEventListener("click", () => {
    const code = b.parentElement.querySelector("code");
    navigator.clipboard?.writeText(code ? code.innerText : "").catch(() => {});
    b.style.opacity = "0.4";
    setTimeout(() => (b.style.opacity = "1"), 400);
  }));
})();
