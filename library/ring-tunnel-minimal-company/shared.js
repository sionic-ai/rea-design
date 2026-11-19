// Motion shared by all pages: cursor dot (lerp .15), three-dot menu with current-section underline, big heading letters rising, typewriter text (40ms), in-page navigation (1.5s power3.inOut).
// The Hero Enter lock is held by index.js, and when navigating to the menu this sends w:enter to release the lock.
(() => {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- Mouse dot ----------
  const dot = document.querySelector(".w-cursor-dot");
  if (dot) {
    const m = { x: 0, y: 0 };
    const p = { x: 0, y: 0 };
    addEventListener("mousemove", (e) => { m.x = e.clientX; m.y = e.clientY; });
    gsap.ticker.add(() => {
      p.x += (m.x - p.x) * 0.15;
      p.y += (m.y - p.y) * 0.15;
      dot.style.left = `${p.x}px`;
      dot.style.top = `${p.y}px`;
    });
    document.addEventListener("mouseover", (e) => { if (e.target.closest("a, button")) dot.classList.add("is-hover"); });
    document.addEventListener("mouseout", (e) => {
      const t = e.target.closest("a, button");
      if (t && !t.contains(e.relatedTarget)) dot.classList.remove("is-hover");
    });
  }

  // ---------- In-page navigation ----------
  const scrollToTarget = (target, centered) => {
    let y = target === document.documentElement ? 0 : target.getBoundingClientRect().top + scrollY;
    if (centered) y -= (innerHeight - target.offsetHeight) / 2;
    y = Math.max(0, Math.min(y, document.documentElement.scrollHeight - innerHeight));
    gsap.to(window, { scrollTo: { y, autoKill: false }, duration: reduce ? 0 : 1.5, ease: "power3.inOut", overwrite: true });
  };
  window.wSite = { scrollToTarget, sleep, reduce };

  // ---------- Three-dot menu ----------
  const menu = document.querySelector(".w-menu");
  if (menu) {
    const btn = menu.querySelector(".w-menu__btn");
    const items = [...menu.querySelectorAll("li")];
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close Menu" : "Open Menu");
    });
    menu.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        const target = href === "#top" ? document.documentElement : document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        menu.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        dispatchEvent(new CustomEvent("w:enter"));
        // The philosophy section is three screens tall, so it must be centered for the text to be visible
        scrollToTarget(target, href === "#philosophy");
      });
    });
    // Underline while passing the 30% point from the top of the screen
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        items.forEach((li) => li.classList.toggle("is-active", li.querySelector("a").getAttribute("href") === `#${en.target.id}`));
      });
    }, { rootMargin: "-30% 0px -69% 0px" });
    items.forEach((li) => {
      const s = document.querySelector(li.querySelector("a").getAttribute("href"));
      if (s) io.observe(s);
    });
  }

  // ---------- Big title: split into letters in advance, and it rises when crossing the screen’s lower 1/6 line ----------
  const titles = [...document.querySelectorAll("[data-split]")];
  titles.forEach((el) => {
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.innerHTML = [...text].map((c, i) => `<span class="w-char" style="--i:${i}" aria-hidden="true">${c === " " ? "&nbsp;" : c}</span>`).join("");
  });
  const checkTitles = () => {
    titles.forEach((el) => {
      if (el.classList.contains("is-in")) return;
      if (el.getBoundingClientRect().top < innerHeight - innerHeight / 6) el.classList.add("is-in");
    });
  };
  if (reduce) titles.forEach((el) => el.classList.add("is-in"));
  else addEventListener("scroll", checkTitles, { passive: true });

  // ---------- Typing text ----------
  // three.cjs loaded as a plain script overwrites the global Node with its own function Node, so Node.TEXT_NODE is unusable — compare with the number instead
  const TEXT = 3;
  const ELEMENT = 1;
  const flatten = (node) => [...node.childNodes].flatMap((c) =>
    c.nodeName === "BR" ? [{ br: c.cloneNode() }]
      : c.nodeType === TEXT ? [...c.textContent.replace(/\s+/g, " ")].map((ch) => ({ ch }))
      : c.nodeType === ELEMENT ? flatten(c) : []);
  const typers = [...document.querySelectorAll(".w-type")];
  typers.forEach((el) => {
    const base = document.createElement("span");
    base.className = "w-type__base";
    base.innerHTML = el.innerHTML;
    const out = document.createElement("span");
    out.className = "w-type__out";
    out.setAttribute("aria-hidden", "true");
    el.replaceChildren(base, out);
    el._parts = flatten(base);
    el._out = out;
  });
  const type = async (el) => {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";
    const speed = Number(el.dataset.speed) || 40;
    for (const part of el._parts) {
      if (part.br) { el._out.append(part.br.cloneNode()); continue; }
      el._out.append(part.ch);
      await sleep(speed);
    }
  };
  if (reduce) {
    typers.forEach((el) => { el._out.innerHTML = el.querySelector(".w-type__base").innerHTML; });
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        type(en.target);
        obs.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -50px 0px" });
    typers.forEach((el) => io.observe(el));
  }
  window.wSite.flatten = flatten;
})();
