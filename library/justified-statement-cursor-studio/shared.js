/* shared by the whole justified-statement-cursor-studio site — six-cell header · phone menu · clock · footer · wordmark band · Lenis.
   The original is Webflow — most hover reactions switch on and off instantly with no curve (display), text uses a 400ms mix (text-scramble), and images stick to the cursor (thumb-to-cursor). */
(() => {
  const SA = (window.SA = window.SA || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const page = document.body.dataset.page || "home";
  SA.reduce = reduce;
  // Scramble settings in one place (original CONFIG.reveal 400ms · 60ms per character · swap every 20ms)
  SA.SCRAMBLE = "duration: .4; life: .06; flicker: .02; lead: blank; chars: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|,.<>/?~";
  const LINKS = [["Home", "index.html", "home"], ["Case study", "works.html", "works"], ["Storage box", "works.html#archive", ""], ["About", "about.html", "about"], ["Contact", "about.html#contact", ""]];
  const nav = document.querySelector('[data-slot="header"]');
  if (nav) {
    nav.classList.add("sa-nav");
    const cur = page === "detail" ? "works" : page;
    // Menu text is shuffled on load only on the first page (original subpage loader 83~100ms, no shuffle)
    nav.innerHTML = LINKS.map(([t, h, k]) => `<a class="sa-nav__item" href="${h}"${k === cur ? ' aria-current="page"' : ""}><span${page === "home" ? ` data-fx="text-scramble" data-fx-text-scramble="on: load; ${SA.SCRAMBLE}"` : ""}>${t}</span></a>`).join("")
      + `<div class="sa-nav__item is-follow" tabindex="0"><span>With the arm</span><div class="sa-nav__drop"><a href="#" class="sa-mono">On channel 1</a><a href="#" class="sa-mono">On channel 2</a></div></div>`;
    const bar = document.createElement("div");
    bar.className = "sa-mbar";
    bar.dataset.slot = "mobile-bar";
    bar.innerHTML = `<a href="index.html">S—A</a><button type="button" aria-expanded="false">[Menu]</button>`;
    const menu = document.createElement("nav");
    menu.className = "sa-mmenu";
    menu.dataset.slot = "mobile-menu";
    // The phone menu uses a Latin-only serif, so English text slots are kept separately
    const MLINKS = ["Home", "Works", "Archive", "About", "Contact"];
    menu.dataset.label = "Your English menu name here";
    menu.innerHTML = LINKS.map(([, h], i) => `<a href="${h}">${MLINKS[i]}</a>`).join("") + `<a href="#">Follow</a>`;
    nav.after(bar, menu);
    const btn = bar.querySelector("button");
    btn.addEventListener("click", () => {
      const open = !menu.classList.contains("is-open");
      menu.classList.toggle("is-open", open);
      btn.textContent = open ? "[Close]" : "[Menu]";
      btn.setAttribute("aria-expanded", open);
      open ? SA.lenis?.stop() : SA.lenis?.start();
    });
  }

  // Clock — the colon blinks every second (original data-time)
  const clocks = document.querySelectorAll("[data-time]");
  if (clocks.length) {
    let colon = true;
    const tick = () => {
      const d = new Date(), t = `${String(d.getHours()).padStart(2, "0")}${colon ? ":" : " "}${String(d.getMinutes()).padStart(2, "0")}`;
      clocks.forEach((c) => (c.textContent = t));
      colon = !colon;
    };
    tick();
    setInterval(tick, 1000);
  }

  // Footer
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.classList.add("sa-foot");
    const set = `<div class="sa-wordmark__set" aria-hidden="true"><span class="is-serif">Signal-A</span><sup>S—A</sup><span class="is-bold">SIGNAL-A</span><sup>S—A</sup><span class="is-mono">SIGNAL-A</span><sup>S—A</sup></div>`;
    const re = (t) => t;
    foot.innerHTML = `<div class="sa-foot__top sa-mono"><a href="#">${re("Channel 1")}</a><span><span>City 1 — City 2</span><a href="#">${re("Privacy policy")}</a></span></div>
      <div class="sa-foot__grid"><a class="sa-bold" href="index.html">S—A Studio</a><nav class="sa-mono"><a href="index.html">${re("Home")}</a><a href="works.html">${re("Case study")}</a><a href="works.html#archive">${re("Storage box")}</a></nav><nav class="sa-mono"><a href="about.html">${re("About")}</a><a href="about.html#contact">${re("Contact")}</a></nav><a class="sa-bold sa-foot__call" href="about.html#contact" data-hover-host><span>Book your consultation here</span><img class="sa-foot__arrow" data-hover-show src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='23' height='13'/%3E" alt="" aria-hidden="true"></a></div>
      <div class="sa-foot__blurb"><p>Your studio intro goes here as one paragraph. An award-winning interface and experience design studio building custom digital products.</p><p>Your paragraph inviting a consultation here. Talk through your next idea together and find out how we can help.</p></div>
      <div class="sa-wordmark" data-slot="wordmark-marquee"><div class="sa-wordmark__track">${set}${set}</div></div>`;
  }

  // Things shown right when hovering (arrow · other scene image) — like the original Webflow IX2, switches inline display without a curve
  // Attach after the section script has drawn the lines
  addEventListener("DOMContentLoaded", () => new Set([...document.querySelectorAll("[data-hover-show]")].map((el) => el.closest("[data-hover-host]")).filter(Boolean)).forEach((host) => {
    const items = [...host.querySelectorAll("[data-hover-show]")];
    items.forEach((el) => el.style.setProperty("display", "none", "important"));
    const hides = [...host.querySelectorAll("[data-hover-hide]")];
    host.addEventListener("pointerenter", () => { items.forEach((el) => el.style.setProperty("display", el.dataset.hoverShow || "block", "important")); hides.forEach((el) => el.style.setProperty("display", "none", "important")); });
    host.addEventListener("pointerleave", () => { items.forEach((el) => el.style.setProperty("display", "none", "important")); hides.forEach((el) => el.style.removeProperty("display")); });
  }));

  // Lenis 1.1.20 — original lerp .12 · wheel 1.2
  if (window.Lenis && !reduce) {
    const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1.2, infinite: false });
    SA.lenis = lenis;
    if (window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add((t) => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0); }
    else { const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
  }
})();
