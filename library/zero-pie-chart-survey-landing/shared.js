(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sp = () => matchMedia("(max-width: 999px)").matches;
  window.akSite = { reduce, sp };

  // Today’s date in the original format (NOV. 15, 2026)
  const M = ["JAN.", "FEB.", "MAR.", "APR.", "MAY", "JUN.", "JUL.", "AUG.", "SEP.", "OCT.", "NOV.", "DEC."];
  const d = new Date();
  document.querySelectorAll(".ak-date").forEach((n) => { n.textContent = `${M[d.getMonth()]} ${String(d.getDate()).padStart(2, "0")}, ${d.getFullYear()}`; });

  // White curtain — the original lifts in .6s Cubic.inOut when it receives the logo pattern image, and when a same-site link is pressed it covers in .5s Cubic.out and then navigates
  const loading = document.querySelector(".ak-loading");
  if (loading) {
    if (reduce) gsap.set(loading, { opacity: 0 });
    else gsap.to(loading, { opacity: 0, duration: 0.6, ease: "power2.inOut" });
    window.addEventListener("pageshow", (e) => { if (e.persisted) gsap.to(loading, { opacity: 0, duration: 0.5, ease: "power2.out" }); });
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      e.preventDefault();
      if (reduce) { location.href = href; return; }
      gsap.to(loading, { opacity: 1, duration: 0.5, ease: "power2.out", onComplete: () => { location.href = href; } });
    });
  }

  // Same-page anchors scroll with 1s Cubic.inOut — offset by the fixed header height
  document.querySelectorAll("a.ak-smooth").forEach((a) => a.addEventListener("click", (e) => {
    const t = document.querySelector(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    document.dispatchEvent(new CustomEvent("ak:menu", { detail: false }));
    const off = sp() ? 79 : 0;
    if (reduce || !window.ScrollToPlugin) { window.scrollTo(0, t.getBoundingClientRect().top + scrollY - off); return; }
    gsap.to(window, { scrollTo: { y: t, offsetY: off }, duration: 1, ease: "power2.inOut" });
  }));

  // Group shared footer — on phone the company name row is collapsible (.3s ease-out)
  document.querySelectorAll(".ak-gfoot__bar").forEach((bar) => {
    const btn = bar.querySelector(".ak-gfoot__barname button"), list = bar.querySelector(".ak-gfoot__barlinks");
    if (!btn || !list) return;
    btn.addEventListener("click", () => {
      if (!sp()) return;
      const open = !bar.classList.contains("is-open");
      bar.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open);
      list.style.height = open ? list.scrollHeight + "px" : "0px";
    });
  });

  // Parent company page — once the window load finishes, reveal the header band·body (original -displayed)
  const disp = document.querySelectorAll(".ak-disp");
  if (disp.length) {
    const show = () => disp.forEach((d) => d.classList.add("is-displayed"));
    if (document.readyState === "complete") show(); else addEventListener("load", show);
  }

  // Section entrance on the parent company page — when scrolling, as a section’s top edge crosses the line 1/5 up from the screen bottom, it goes from 20px down·transparent over .7s ease (the original measures only on scroll)
  const fades = [...document.querySelectorAll(".ak-fade")];
  if (fades.length) {
    if (reduce) fades.forEach((f) => f.classList.add("is-on"));
    else addEventListener("scroll", () => {
      const line = scrollY + innerHeight - innerHeight / 5;
      fades.forEach((f) => { if (!f.classList.contains("is-on") && f.getBoundingClientRect().top + scrollY < line) f.classList.add("is-on"); });
    }, { passive: true });
  }

  // Parent company header — pressing a menu shows its dropdown panel in .3s, and pressing the same menu or outside the panel closes it (the original is press-based). On phone it is a right drawer
  const ch = document.querySelector(".ak-ch");
  if (ch) {
    let open = null;
    const slid = document.getElementById("ak-drop-q");
    const close = () => {
      if (!open) return;
      open.li.classList.remove("is-current-drop");
      open.drop.classList.remove("is-active");
      slid?.classList.remove("is-slid");
      open = null;
    };
    ch.querySelectorAll("[data-drop]").forEach((li) => {
      const drop = document.getElementById(li.dataset.drop);
      const btn = li.querySelector("a, button");
      if (!drop || !btn) return;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const same = open && open.drop === drop;
        close();
        if (same) return;
        open = { li, drop };
        li.classList.add("is-current-drop");
        drop.classList.add("is-active");
        slid?.classList.add("is-slid");
      });
      drop.addEventListener("click", (e) => e.stopPropagation());
    });
    document.addEventListener("click", close);
    const tog = ch.querySelector(".ak-ch__toggle");
    tog?.addEventListener("click", () => {
      const on = !ch.classList.contains("is-open");
      ch.classList.toggle("is-open", on);
      tog.setAttribute("aria-expanded", on);
    });
  }
})();
