// Shared by all pages: fills in the header (Routes, wordmark, Socials/Colophon at the very bottom) and the red CTA footer in one place, and
// Sets up text splitting, show-on-view, number counting, and page transitions (the Routes cell width changes at .4s from the previous page’s width).
(() => {
  const ROUTES = [
    ["index.html", "Home", 6],
    ["works.html", "Work", 8],
    ["about.html", "About", 16],
    ["contact.html", "Contact", 8],
  ];
  const here = document.body.dataset.page || "index.html";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Head
  const head = document.querySelector(".rc-head");
  const cols = ROUTES.find((r) => r[0] === here)?.[2] ?? 6;
  const flush = head?.classList.contains("is-flush");
  if (head) {
    const links = ROUTES.map(([href, label]) => `<a class="rc-link${href === here ? " is-active" : ""}" href="${href}"${href === here ? ' aria-current="page"' : ""}>${label}</a>`).join("");
    const socials = ["Social 01", "Social 02", "Social 03", "Social 04"].map((s) => `<a class="rc-link" href="#">${s}</a>`).join("");
    head.innerHTML = `
      <nav class="rc-head__nav" aria-label="Routes"><p class="t-b">Routes</p><div class="rc-routes">${links}</div></nav>
      ${flush ? "" : `<nav class="rc-head__foot" aria-label="Footer">
        <div class="rc-head__nav"><p class="t-b">Socials</p><div class="rc-routes">${socials}</div></div>
        <div class="rc-head__nav"><p class="t-b">Colophon</p><div class="rc-routes"><p>©Studio Name, 0000</p><a class="rc-link" href="#">Website by Name</a></div></div>
      </nav>`}
      <div class="rc-head__logo"><a class="t-b" href="index.html" data-label="Brand English name"><span class="rc-head__full">Studio Name Here<sup>TM</sup></span><span class="rc-head__short">Studio Name<sup>TM</sup></span></a><div class="rc-head__line"></div></div>`;

    // Transition: the original is a single-page app, so on click the old body empties at once and the Routes cell width in the header starts moving to the next page value over .4s.
    // On press, the copy hooks those two right away and opens a new document — the new document continues from the previous cell’s width, with a negative delay equal to the time already elapsed.
    const parts = () => [head, ...head.querySelectorAll(".rc-head__nav, .rc-head__logo")];
    let from = null;
    try { from = JSON.parse(sessionStorage.getItem("rc-nav") || "null"); } catch {}
    sessionStorage.removeItem("rc-nav");
    const gone = from ? Math.max(0, Date.now() - from.at) : 400;
    if (from && !reduce && gone < 400 && (from.cols !== cols || from.flush !== flush)) {
      parts().forEach((n) => (n.style.transition = "none"));
      head.style.setProperty("--nav-cols", from.cols);
      head.classList.toggle("is-flush", !!from.flush);
      head.getBoundingClientRect();
      parts().forEach((n) => { n.style.transition = ""; n.style.transitionDelay = `${-gone}ms`; });
      head.style.setProperty("--nav-cols", cols);
      head.classList.toggle("is-flush", !!flush);
      setTimeout(() => parts().forEach((n) => (n.style.transitionDelay = "")), 450);
    } else head.style.setProperty("--nav-cols", cols);
    // The new body fade (.15s delay then .5s) is also counted from the moment of the press — time spent downloading the document is subtracted so it ends at the same time as the original single-page app
    if (from && !reduce && gone < 650) {
      document.querySelectorAll(".rc-main").forEach((m) => (m.style.animationDelay = `${150 - gone}ms`));
      // The original transition recording (ends at 567~593ms) has no ripple phase — a document entered by transition keeps the ripple at its end state (it runs only on first open)
      document.querySelectorAll(".rc-wave").forEach((w) => (w.style.animation = "none"));
    }
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || a.target || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || /^(#|https?:|mailto:)/.test(a.getAttribute("href"))) return;
      const href = a.getAttribute("href");
      const to = ROUTES.find((r) => r[0] === href);
      if (!to) return;
      e.preventDefault();
      const toFlush = href === "contact.html";
      sessionStorage.setItem("rc-nav", JSON.stringify({ cols, flush: !!flush, at: Date.now() }));
      if (!reduce) {
        head.style.setProperty("--nav-cols", to[2]);
        head.classList.toggle("is-flush", toFlush);
        head.querySelector(".rc-head__foot")?.classList.remove("is-on");
        document.querySelectorAll(".rc-main, .rc-foot").forEach((m) => { m.style.animation = "none"; m.style.opacity = "0"; });
      }
      requestAnimationFrame(() => setTimeout(() => (location.href = href), 0));
    });

    // When the remaining length is at or below the margin, turn on Socials · Colophon
    const foot = head.querySelector(".rc-head__foot");
    if (foot) {
      const check = () => {
        const m = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rc-margins")) || 16;
        foot.classList.toggle("is-on", document.documentElement.scrollHeight - scrollY - innerHeight <= m);
      };
      check();
      addEventListener("scroll", check, { passive: true });
      addEventListener("resize", check);
    }
  }
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  // ── Footer CTA: on hover the border pulse speeds up to double over .45s (cubic ease-out), and returns to normal speed on release
  const cta = document.querySelector(".rc-foot > a");
  if (cta) {
    cta.innerHTML = `<span class="rc-pulse" aria-hidden="true"></span><span class="rc-pulse" aria-hidden="true"></span><span class="rc-pulse" aria-hidden="true"></span><p data-label="One English line leading to Contact">Let's Build Something Together</p>`;
    let state = { rate: 1, raf: 0 };
    const ramp = (to) => {
      if (!matchMedia("(hover: hover)").matches) return;
      cancelAnimationFrame(state.raf);
      const start = state.rate, t0 = performance.now(), next = { rate: start, raf: 0 };
      const step = (now) => {
        const p = Math.min(1, (now - t0) / 450);
        next.rate = start + (to - start) * (1 - (1 - p) ** 3);
        cta.querySelectorAll(".rc-pulse").forEach((s) => s.getAnimations().forEach((a) => a.animationName === "rc-pulse" && a.updatePlaybackRate(next.rate)));
        if (p < 1) next.raf = requestAnimationFrame(step);
      };
      next.raf = requestAnimationFrame(step);
      state = next;
    };
    cta.addEventListener("pointerenter", () => ramp(2));
    cta.addEventListener("pointerleave", () => ramp(1));
  }

  // ── Big title letter split: words stay as chunks, each letter gets --i (from the front), --j (from the back) and --n (letter count including spaces)
  document.querySelectorAll("[data-letters]").forEach((el) => {
    const text = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", text);
    const n = [...text].length;
    let i = 0;
    const ch = (c) => {
      const s = document.createElement("span");
      s.className = "rc-ch";
      s.textContent = c;
      s.style.cssText = `--i:${i};--j:${n - 1 - i};--n:${n}`;
      s.setAttribute("aria-hidden", "true");
      i++;
      return s;
    };
    const frag = document.createDocumentFragment();
    text.split(" ").forEach((w, wi) => {
      if (wi) frag.append(ch(" "));
      const word = document.createElement("span");
      word.className = "rc-word";
      for (const c of w) word.append(ch(c));
      frag.append(word);
    });
    el.replaceChildren(frag);
  });

  // ── Turn on when visible: after scrolling has stopped for two consecutive frames, if the panel’s top edge is within the screen bottom + margin (64·128px) turn on immediately, otherwise .rc-in when it enters
  const inview = (el) => {
    const margin = +(el.dataset.inview || 64);
    let last = scrollY, still = 0;
    const settle = () => {
      if (scrollY === last && ++still >= 2) {
        if (el.getBoundingClientRect().top < innerHeight + margin) return on();
        const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); on(); } }, { rootMargin: `0px 0px ${margin}px 0px`, threshold: 0 });
        io.observe(el);
        return;
      }
      if (scrollY !== last) { still = 0; last = scrollY; }
      requestAnimationFrame(settle);
    };
    const on = () => { el.classList.add("rc-in"); el.dispatchEvent(new Event("rc:in")); };
    requestAnimationFrame(settle);
  };
  document.querySelectorAll("[data-inview]").forEach(inview);

  // ── Number count: only the numbers in the text, from 0 to their value (decimals and commas kept) over 1.5s, starting 1s after the board turns on, cubic ease-out
  document.querySelectorAll("[data-count]").forEach((el) => {
    const value = el.textContent.trim();
    el.setAttribute("aria-label", value);
    const parts = [];
    let at = 0;
    for (const m of value.matchAll(/\d[\d,]*(?:\.\d+)?/g)) {
      if (m.index > at) parts.push(value.slice(at, m.index));
      const dot = m[0].indexOf(".");
      parts.push({ target: +m[0].replace(/,/g, ""), dec: dot < 0 ? 0 : m[0].length - dot - 1, commas: m[0].includes(",") });
      at = m.index + m[0].length;
    }
    if (at < value.length) parts.push(value.slice(at));
    const fmt = (p) => parts.map((x) => {
      if (typeof x === "string") return x;
      const s = x.dec ? (x.target * p).toFixed(x.dec) : String(Math.round(x.target * p));
      if (!x.commas) return s;
      const [a, b] = s.split(".");
      return a.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (b != null ? "." + b : "");
    }).join("");
    el.textContent = fmt(0);
    const box = el.closest("[data-inview]");
    const dur = +(el.dataset.dur || 1500), delay = +(el.dataset.delay || 1000);
    const run = () => {
      if (reduce) { el.textContent = value; return; }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, Math.max(0, now - t0 - delay) / dur);
        el.textContent = fmt(1 - (1 - p) ** 3);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    box ? box.addEventListener("rc:in", run, { once: true }) : run();
  });
})();
