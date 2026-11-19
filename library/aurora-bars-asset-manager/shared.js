// Shared by every section — language expand·phone drawer, text that rises and clears (js-fade), job posting accordion, smooth anchor·back-to-top scrolling, and the flowing Get in touch (Splide) on the contact board.
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const narrow = () => innerWidth <= 767;

  // ---------- Wide-screen language expand ----------
  const lang = document.querySelector(".tb-nav .tb-lang");
  if (lang) {
    const btn = lang.querySelector(".tb-lang__btn"), pop = lang.querySelector(".tb-pop");
    btn.addEventListener("click", () => {
      const open = !pop.classList.contains("is-open");
      pop.classList.toggle("is-open", open);
      btn.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  }

  // ---------- Phone drawer — the EN·Menu buttons open a navy panel with clip-path in .3s. Pressing the same button again closes it ----------
  const drawer = document.querySelector(".tb-drawer");
  if (drawer) {
    const head = drawer.querySelector(".tb-drawer__head"), pop = drawer.querySelector(".tb-drawer__pop");
    const btns = [...drawer.querySelectorAll("[data-tb-open]")];
    let now = "";
    const show = (key) => {
      now = now === key ? "" : key;
      btns.forEach((b) => { const on = b.dataset.tbOpen === now; b.classList.toggle("is-open", on); b.setAttribute("aria-expanded", String(on)); });
      drawer.querySelectorAll("[data-tb-panel]").forEach((p) => p.classList.toggle("is-open", p.dataset.tbPanel === now));
      head.classList.toggle("is-open", !!now);
      pop.classList.toggle("is-open", !!now);
    };
    btns.forEach((b) => b.addEventListener("click", () => show(b.dataset.tbOpen)));
  }

  // ---------- Text that rises and clears — common has its top edge at the screen bottom (phones: max(100, height × .3) above), first fires once when it touches the screen bottom ----------
  const fades = [...document.querySelectorAll(".tb-fade")];
  const check = () => {
    const vh = innerHeight;
    fades.forEach((el) => {
      if (el.classList.contains("is-active")) return;
      const r = el.getBoundingClientRect();
      const line = el.dataset.tbFade === "common" && narrow() ? vh - Math.max(100, r.height * 0.3) : vh;
      if (r.top <= line) el.classList.add("is-active");
    });
  };
  if (fades.length) {
    check();
    let t = 0;
    addEventListener("scroll", () => { clearTimeout(t); t = setTimeout(check, 16); }, { passive: true });
  }

  // ---------- Job listing accordion — details height at .4s ease-out ----------
  document.querySelectorAll(".tb-acc").forEach((acc) => {
    const summary = acc.querySelector("summary"), body = acc.querySelector(".tb-acc__content");
    if (!summary || !body) return;
    let busy = false;
    body.style.overflow = "hidden";
    body.style.height = acc.open ? "auto" : "0";
    summary.addEventListener("click", (e) => {
      e.preventDefault();
      if (busy) return;
      busy = true;
      if (acc.open) {
        acc.classList.add("is-closing");
        body.style.height = body.scrollHeight + "px";
        requestAnimationFrame(() => { body.style.transition = "height 0.4s ease-out"; body.style.height = "0"; });
        setTimeout(() => { acc.open = false; acc.classList.remove("is-closing"); body.style.transition = ""; busy = false; }, 400);
      } else {
        acc.open = true;
        const end = body.scrollHeight;
        body.style.height = "0";
        requestAnimationFrame(() => { body.style.transition = "height 0.4s ease-out"; body.style.height = end + "px"; });
        setTimeout(() => { body.style.height = "auto"; body.style.transition = ""; busy = false; }, 400);
      }
    });
  });

  // ---------- Anchors smoothly offset by header height (100 wide screen · 80 phone), and the back-to-top button goes to 0 ----------
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (a.classList.contains("tb-top") || id === "#") {
        if (!a.classList.contains("tb-top")) return;
        e.preventDefault();
        scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollTo({ top: target.getBoundingClientRect().top + scrollY - (narrow() ? 80 : 100), behavior: reduce ? "auto" : "smooth" });
    });
  });

  // ---------- Contact panel — stands up the Splide loop and pushes the band 1px every 16ms (2px when hovering the panel). Reverses once past halfway ----------
  const loop = document.querySelector(".tb-cta__loop");
  if (loop && window.Splide) {
    const splide = new Splide(loop, { arrows: false, pagination: false, type: "loop" });
    splide.mount();
    if (!reduce) {
      let speed = 1, pos = 0, timer = 0;
      const run = () => {
        clearInterval(timer);
        timer = setInterval(() => {
          const { track, slides } = splide.Components.Elements;
          if (!track || !slides.length) return;
          pos -= speed;
          track.style.transform = `translateX(${pos}px)`;
          const half = slides[0].offsetWidth * (slides.length / 2);
          if (Math.abs(pos) >= half) pos += half;
        }, 16);
      };
      run();
      const touch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (!touch) {
        document.querySelectorAll("[data-tb-cta]").forEach((el) => {
          el.addEventListener("mouseenter", () => { speed = 2; run(); });
          el.addEventListener("mouseleave", () => { speed = 1; run(); });
        });
      }
    }
  }
})();
