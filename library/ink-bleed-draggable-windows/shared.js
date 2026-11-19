// Site-wide — skin switching (light · dark, saved), ink on/off, mail copy note, work window fill, window full screen on phone, video slot
(() => {
  const root = document.documentElement;

  const themeBtn = document.querySelector(".ag-theme");
  const setTheme = (t) => {
    root.dataset.theme = t;
    try { localStorage.setItem("ag-theme", t); } catch (_) {}
    if (themeBtn) themeBtn.textContent = t === "dark" ? "light" : "dark";
  };
  setTheme(root.dataset.theme === "dark" ? "dark" : "light");
  themeBtn?.addEventListener("click", () => setTheme(root.dataset.theme === "dark" ? "light" : "dark"));

  const inkBtn = document.querySelector(".ag-ink");
  const inkText = document.querySelector("[data-fx~='ink-bleed-text']");
  let ink = true;
  inkBtn?.addEventListener("click", () => {
    ink = !ink;
    inkBtn.textContent = ink ? "disable ink" : "enable ink";
    inkBtn.setAttribute("aria-pressed", String(ink));
    inkText?.dispatchEvent(new Event(ink ? "fx:resume" : "fx:pause"));
  });

  // Mail — ”click to copy” 14px to the lower right of the cursor, and on press ”copied!” for 1.5 seconds
  document.querySelectorAll("[data-ag-mail]").forEach((link) => {
    const tip = document.createElement("div");
    tip.className = "ag-tip";
    tip.textContent = "click to copy";
    tip.setAttribute("aria-hidden", "true");
    document.body.appendChild(tip);
    const mail = link.dataset.agMail || link.textContent.trim();
    link.addEventListener("mousemove", (e) => { tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY + 14}px)`; tip.classList.add("is-on"); });
    link.addEventListener("mouseleave", () => tip.classList.remove("is-on"));
    link.addEventListener("click", (e) => {
      e.preventDefault();
      link.textContent = "copied!";
      setTimeout(() => { link.textContent = mail; }, 1500);
      navigator.clipboard?.writeText(mail).catch(() => {});
    });
  });

  // The phone (below 700px) has the window fill the screen, so it is center-based — fix the options before the part attaches
  if (innerWidth < 700) document.querySelectorAll(".ag-win").forEach((w) => {
    w.setAttribute("data-fx-desk-window", (w.getAttribute("data-fx-desk-window") || "").replace(/;\s*ox: [\d.]+;\s*oy: [\d.]+/, "").replace(/cascade: \d+/, "cascade: 0"));
  });
  document.querySelectorAll(".ag-win__full").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    b.closest(".ag-win").classList.toggle("is-full");
  }));

  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) en.target.play?.().catch(() => {}); else en.target.pause?.();
  }), { threshold: 0.01 });
  document.querySelectorAll("video[data-ag-auto]").forEach((v) => { v.muted = true; io.observe(v); });
})();
