// Shared by several pages — inserting the pill nav and footer (the first appearance is a CSS animation in shared.css),
// On a black section a dark pill, Ask window (enter .4s cubic-bezier(.12,.23,.5,1) · leave .4s cubic-bezier(.5,0,.88,.77))
(() => {
  const page = document.body.dataset.page || "home";
  const NAV = [["home", "index.html", "Home"], ["works", "works.html", "Work"], ["about", "about.html", "About"], ["contact", "#contact", "Inquiry"]];

  const nav = document.querySelector("[data-slot='nav']");
  if (nav) {
    nav.classList.add("sc-nav");
    nav.innerHTML = NAV.map(([k, h, l]) => `<a href="${h}"${k === page ? ' aria-current="page"' : ""}>${l}</a>`).join("");
  }
  const ask = document.querySelector("[data-sc-ask]");

  const foot = document.querySelector("[data-slot='footer']");
  if (foot) {
    foot.id = "contact";
    foot.classList.add("sc-foot");
    foot.setAttribute("data-sc-dark", "");
    foot.setAttribute("data-fx", "ascii-noise-field");
    foot.innerHTML = `
      <div class="sc-foot__in">
        <div class="sc-foot__call" data-label="Your closing English line here and your calling English line (serif)">
          <p class="t-serif">A closing footer line goes here.</p>
          <p class="t-serif"><a href="#contact">A call to reach out.</a></p>
          <p class="t-sm sc-foot__copy">© Studio Name</p>
        </div>
        <div class="sc-foot__cols t-body">
          <div><p>Page</p><ul><li><a href="about.html"><span>About</span></a></li><li><a href="works.html"><span>Work</span></a></li><li><a href="news.html"><span>Journal</span></a></li><li><a href="#contact"><span>Inquiry</span></a></li><li><a href="#contact"><span>Menu 5</span></a></li></ul></div>
          <div><p>SNS</p><ul><li><a href="#contact"><span>Social Media</span></a></li><li><a href="#contact"><span>Professional network</span></a></li><li><a href="#contact"><span>X</span></a></li></ul></div>
          <div><p>Legal notice</p><ul><li><a href="#contact"><span>Personal information</span></a></li><li><a href="#contact"><span>Company info</span></a></li></ul></div>
        </div>
      </div>`;
  }

  // Ask window — the original is an AI chat feature, so only the look and open/close
  const win = document.createElement("div");
  win.className = "sc-askwin";
  win.setAttribute("role", "dialog");
  win.setAttribute("aria-modal", "true");
  win.setAttribute("aria-label", "Asking");
  win.innerHTML = `
    <div class="sc-askwin__card">
      <p class="t-sm">Your line asking what to explore here</p>
      <div class="sc-askwin__body"></div>
      <div class="sc-askwin__chips"><span>Question example 1</span><span>Question example 2</span></div>
      <div class="sc-askwin__field"><span>Your question here</span><span aria-hidden="true">→</span></div>
      <p class="sc-askwin__note">One line here noting you are chatting with AI. <a href="#contact">Personal information</a></p>
    </div>
    <button type="button" class="sc-askwin__close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>`;
  document.body.append(win);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const E = (c, f) => (window.CustomEase ? CustomEase.create(`sc-${c}`, c) : f);
  const EASE_IN = E("0.12,0.23,0.5,1", "power2.out"), EASE_OUT = E("0.5,0,0.88,0.77", "power2.in");
  let open = false;
  // On open, the backdrop and panel take .4s, and the example question chips rise from 6px below over .5s linear after .1s (the second chip .08s later — original ask-rise 500ms, 80ms)
  const openWin = () => {
    if (open) return; open = true;
    gsap.set(win, { visibility: "visible" });
    gsap.to(win, { opacity: 1, duration: reduce ? 0 : 0.4, ease: EASE_OUT });
    gsap.fromTo(win.querySelector(".sc-askwin__card"), { y: 20, scale: 0.97 }, { y: 0, scale: 1, duration: reduce ? 0 : 0.4, ease: EASE_IN });
    gsap.fromTo(win.querySelectorAll(".sc-askwin__chips span"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.1, stagger: 0.08, ease: "none" });
    win.querySelector(".sc-askwin__close").focus();
  };
  const closeWin = () => {
    if (!open) return; open = false;
    gsap.to(win, { opacity: 0, duration: reduce ? 0 : 0.4, ease: EASE_OUT, onComplete: () => gsap.set(win, { visibility: "hidden" }) });
    ask?.focus();
  };
  ask?.addEventListener("click", openWin);
  win.querySelector(".sc-askwin__close").addEventListener("click", closeWin);
  win.addEventListener("click", (e) => { if (e.target === win) closeWin(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") closeWin(); });

  // When passing over a black section, nav · Ask turn into dark pills
  const darks = () => [...document.querySelectorAll("[data-sc-dark]")];
  const tone = () => {
    const y = 36;
    const on = darks().some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    nav?.classList.toggle("is-dark", on);
    ask?.classList.toggle("is-dark", on);
  };
  addEventListener("scroll", tone, { passive: true });
  addEventListener("resize", tone);
  tone();

  // Video — muted, looped, paused when off screen
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !reduce ? e.target.play().catch(() => {}) : e.target.pause())));
  document.querySelectorAll("video[data-auto]").forEach((v) => { v.muted = true; io.observe(v); });
})();
