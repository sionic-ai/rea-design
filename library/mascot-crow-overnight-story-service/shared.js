/* Motion shared by all pages — Lenis (1.3.26 same as the original, lerp .1) · header state · MENU symbol unfolding · menu drawer · consultation modal · 
   Title letter raise, number/text symbol unscramble, cloud mouse push, newsletter ticker, still crow illustration. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  gsap.registerPlugin(ScrollTrigger);
  const rem = () => parseFloat(getComputedStyle(root).fontSize) || 16;

  // Symbol decode — original cipher: swaps symbols every 0.04s, then after startResolveAt they turn into their real letters one by one from the first
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!#$%/=?*+~^<>";
  const SKIP = new Set([" ", " ", ",", "+", "-", ".", "/", "~", "%"]);
  const glyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  const cipherSplit = (el, text, cls = "cipher") => {
    el.innerHTML = "";
    const live = [];
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = cls;
      s.textContent = ch;
      if (ch === " ") s.style.minWidth = "0.35em";
      else if (!SKIP.has(ch)) live.push({ el: s, to: ch });
      el.append(s);
    }
    return live;
  };
  const lockWidths = (live) => live.forEach(({ el }) => { el.style.width = el.getBoundingClientRect().width + "px"; });
  const cipherTween = (live, { duration = 1.2, startResolveAt = 0.45, interval = 0.04 } = {}) => {
    const st = { p: 0 };
    let last = 0;
    const n = Math.max(1, live.length);
    return gsap.to(st, {
      p: 1, duration, ease: "none",
      onUpdate() {
        const t = st.p * duration, tick = t - last >= interval;
        if (tick) last = t;
        live.forEach(({ el, to }, i) => {
          if (t >= startResolveAt + (i / (n - 1 || 1)) * (duration - startResolveAt)) { if (el.textContent !== to) el.textContent = to; }
          else if (tick) el.textContent = glyph();
        });
      },
      onComplete() { live.forEach(({ el, to }) => { el.textContent = to; }); },
    });
  };

  // Lenis — original settings as-is (autoRaf, lerp .1). Stops when a modal or drawer opens
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
    lenis.on("scroll", ScrollTrigger.update);
  }
  const lock = (on) => {
    root.classList.toggle("is-locked", on);
    if (lenis) on ? lenis.stop() : lenis.start();
  };

  // Header — after the Hero, a phone appears in the logo spot, on dark sections (data-header="dark") below, lime
  const hd = document.querySelector(".hd");
  if (hd) {
    const phoneAt = () => (document.querySelector("[data-header-phone-after]")?.offsetHeight || innerHeight) * 0.5;
    const onScroll = () => hd.classList.toggle("hd--phone", scrollY > phoneAt());
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    document.querySelectorAll('[data-header="dark"]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec, start: () => `top ${hd.offsetHeight / 2}px`, end: () => `bottom ${hd.offsetHeight / 2}px`,
        onToggle: (self) => hd.classList.toggle("hd--dark", self.isActive),
      });
    });
    // MENU letters unscramble from symbols once at the start (on the first page the intro calls it directly)
    const label = hd.querySelector(".hd__menu-label");
    if (label) {
      const live = cipherSplit(label, label.textContent.trim());
      if (!reduce) {
        lockWidths(live);
        window.CFSHeaderCipher = () => cipherTween(live, { duration: 0.8, startResolveAt: 0.3 });
        if (!document.querySelector("[data-intro]")) window.CFSHeaderCipher();
      }
    }
  }

  // Menu drawer
  const drawer = document.querySelector(".drawer");
  const openDrawer = (on) => {
    if (!drawer) return;
    drawer.classList.toggle("is-open", on);
    drawer.setAttribute("aria-hidden", on ? "false" : "true");
    lock(on);
  };
  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", () => openDrawer(true)));
  document.querySelectorAll("[data-menu-close]").forEach((b) => b.addEventListener("click", () => openDrawer(false)));

  // Consultation booking modal — opened by the consult button and the header phone icon
  const modal = document.querySelector(".modal");
  const openModal = (on) => {
    if (!modal) return;
    if (on && drawer?.classList.contains("is-open")) drawer.classList.remove("is-open");
    modal.classList.toggle("is-open", on);
    modal.setAttribute("aria-hidden", on ? "false" : "true");
    lock(on);
  };
  document.addEventListener("click", (e) => {
    // The original popup appears after being drawn once following the click (about 30ms)
    if (e.target.closest("[data-book]")) { e.preventDefault(); setTimeout(() => openModal(true), 30); }
    if (e.target.closest("[data-book-close]")) openModal(false);
  });
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    openModal(false);
    openDrawer(false);
  });
  modal?.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());

  // Static crow illustration
  window.CFSCrow?.fill();

  // Heading letter lift — original Heading: each letter goes from y 20·rotateX -90 to 0 over 0.5s back.out, 0.02s apart, once at 92% of the screen
  const splitChars = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(part)); return; }
            const w = document.createElement("span");
            w.className = "c-word";
            for (const ch of part) {
              const c = document.createElement("span");
              c.className = "c-char";
              c.textContent = ch;
              w.append(c);
            }
            frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n);
      });
    };
    walk(el);
    el.classList.add("is-split");
    return el.querySelectorAll(".c-char");
  };
  const mm = gsap.matchMedia();
  document.querySelectorAll("[data-chars]").forEach((el) => {
    const chars = splitChars(el);
    if (reduce) return;
    const manual = el.dataset.chars === "manual";
    const tw = gsap.from(chars, {
      opacity: 0, y: 20, rotateX: -90, stagger: 0.02, duration: 0.5, ease: "back.out",
      paused: manual,
      ...(manual ? {} : { scrollTrigger: { trigger: el, start: "top 92%", once: true } }),
    });
    if (manual) el.addEventListener("heading:reveal", () => tw.restart(true));
  });

  // Digit symbol resolve — original stats: once when at 85% of the screen, resolving from 1.2s · 0.35
  document.querySelectorAll("[data-scramble]").forEach((el) => {
    const text = el.textContent.trim();
    const live = cipherSplit(el, text, "cipher");
    if (reduce) return;
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => cipherTween(live, { duration: 1.2, startResolveAt: 0.35 }) });
  });

  // Cloud mouse push — original: quickTo x·y 0.6 seconds power3.out, up to 2rem from screen center
  if (!reduce && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-drift]").forEach((el) => {
      const qx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const qy = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      addEventListener("pointermove", (e) => {
        const r = 2 * rem();
        qx(-((e.clientX / innerWidth - 0.5) * 2) * r);
        qy(-((e.clientY / innerHeight - 0.5) * 2) * r);
      });
    });
  }

  // Newsletter ticker — next line every 6 seconds, on change it resolves from symbols over 0.5s at 0.03s intervals
  document.querySelectorAll("[data-ticker]").forEach((box) => {
    const lines = [...box.querySelectorAll("template")].map((t) => t.innerHTML);
    const live = box.querySelector(".ticker__live");
    if (!live || lines.length < 2) return;
    let i = 0;
    const scrambleIn = () => {
      live.innerHTML = lines[i];
      if (reduce) return;
      const parts = [];
      live.querySelectorAll("[data-tk]").forEach((p) => parts.push(...cipherSplit(p, p.textContent, "ticker__char")));
      cipherTween(parts, { duration: 0.5, startResolveAt: 0, interval: 0.03 });
    };
    live.innerHTML = lines[0];
    setInterval(() => { i = (i + 1) % lines.length; scrambleIn(); }, 6000);
  });

  // FAQ accordion — only one open per list, height auto ↔ 0 (.5s power2.inOut — duration measured from the original)
  document.querySelectorAll(".faq__list").forEach((list) => {
    const faqItems = [...list.querySelectorAll(".faq__item")];
    faqItems.forEach((item) => {
      item.querySelector(".faq__q").addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        // Measure the height before changing the open state — after the change, css has already switched to 0/auto and it jumps without a curve
        const from = faqItems.map((it) => it.querySelector(".faq__a").offsetHeight);
        faqItems.forEach((it, i) => {
          const on = it === item && open;
          it.classList.toggle("is-open", on);
          it.querySelector(".faq__q").setAttribute("aria-expanded", on);
          const a = it.querySelector(".faq__a");
          gsap.killTweensOf(a);
          if (reduce) gsap.set(a, { height: on ? "auto" : 0 });
          else gsap.fromTo(a, { height: from[i] }, { height: on ? "auto" : 0, duration: 0.5, ease: "power2.inOut" });
        });
      });
    });
  });

  window.CFS = { lenis, lock, cipherSplit, cipherTween, lockWidths, glyph, rem, reduce, mm };
})();
