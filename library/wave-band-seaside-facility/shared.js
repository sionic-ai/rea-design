// Shared by all pages — white curtain loader · menu · smooth # link scrolling · section title letter lift · More ripple · wavy border · card hover · FAQ · video modal · back to top.
// Hooked after window load like the original (loader length is matched to download time).
(() => {
  const START = performance.now();
  const html = document.documentElement;
  const isHome = document.body.dataset.page === "home";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Two waves — only integer harmonics on a 1366×100 sheet so left and right ends join. Big in the middle, calm at both ends
  const wavePath = (rotate) => {
    const W = 1366, H = 100, N = 60, TAU = Math.PI * 2;
    const ys = [];
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const env = 0.3 + 0.7 * (0.5 - 0.5 * Math.cos(TAU * t));
      const big = 20 * Math.sin(TAU * 5 * t + (rotate ? 2.1 : 0.4)) + 8 * Math.sin(TAU * 8 * t + (rotate ? 0.3 : 1.7));
      const small = 3 * Math.sin(TAU * 11 * t + 0.9);
      ys.push(rotate ? 52 + env * big + small : 40 - env * big - small);
    }
    const y = (i) => ys[(i % N + N) % N];
    const s = W / N, f = (n) => n.toFixed(2);
    let d = rotate ? `M0,0L0,${f(y(0))}` : `M0,${H}L0,${f(y(0))}`;
    for (let i = 0; i < N; i++) {
      d += `C${f(i * s + s / 3)},${f(y(i) + (y(i + 1) - y(i - 1)) / 6)},${f((i + 1) * s - s / 3)},${f(y(i + 1) - (y(i + 2) - y(i)) / 6)},${f((i + 1) * s)},${f(y(i + 1))}`;
    }
    return d + (rotate ? `L${W},0Z` : `L${W},${H}Z`);
  };
  const sprite = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  sprite.setAttribute("aria-hidden", "true");
  sprite.style.cssText = "position:absolute;width:0;height:0;overflow:hidden";
  sprite.innerHTML = `<defs><symbol id="tn-wave" viewBox="0 0 1366 100" preserveAspectRatio="none"><path d="${wavePath(false)}"/></symbol><symbol id="tn-wave-rotate" viewBox="0 0 1366 100" preserveAspectRatio="none"><path d="${wavePath(true)}"/></symbol></defs>`;
  document.body.prepend(sprite);
  document.querySelectorAll(".tn-wave").forEach((w) => {
    const id = w.classList.contains("is-rotate") ? "tn-wave-rotate" : "tn-wave";
    w.innerHTML = `<div class="tn-wave__in"><svg viewBox="0 0 1366 100" preserveAspectRatio="none"><use href="#${id}"/></svg><svg viewBox="0 0 1366 100" preserveAspectRatio="none"><use href="#${id}"/></svg></div>`;
  });

  // Lock scroll only on the first visit to the first page (kept in session). The white curtain shows on every page
  const visited = !!sessionStorage.getItem("tn-visit");
  if (isHome && !visited) { sessionStorage.setItem("tn-visit", "visited"); html.classList.add("is-loading"); }

  // Section title — a span per letter (spaces left as is)
  const splitChars = (el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    for (const ch of text) {
      if (/\s/.test(ch)) { el.append(ch); continue; }
      const s = document.createElement("span");
      s.className = "tn-char";
      s.textContent = ch;
      el.append(s);
    }
  };
  const splitTargets = [...document.querySelectorAll("[data-tn-split]")];
  splitTargets.forEach(splitChars);

  const onLoad = () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const mm = gsap.matchMedia();

    // White veil — if loading finishes within 1s, delay by the remainder, otherwise lift after .17s with .8s power1.out
    const loader = document.getElementById("tn-loader");
    if (loader) {
      const t = performance.now() - START;
      gsap.to(loader, {
        opacity: 0, duration: reduce ? 0 : 0.8, delay: reduce ? 0 : t < 1000 ? 1 - t / 1000 : 0.17, ease: "power1.out",
        onComplete: () => { loader.remove(); if (isHome && !visited) html.classList.remove("is-loading"); },
      });
    }

    // Menu — panel 1s (close .5s), MENU↔CLOSE roll vertically by 1em each and swap (.6s), and the two lines gather by 3.5 each and bend to ±14° (.6s)
    const menu = document.getElementById("tn-menu");
    const trigger = document.getElementById("tn-menu-trigger");
    if (menu && trigger) {
      let busy = false;
      const words = document.querySelectorAll(".tn-trigger__word span");
      const lines = trigger.querySelectorAll("line");
      gsap.set(lines, { transformOrigin: "50% 50%" });
      gsap.set(words[0], { y: "1em" });
      const tl = gsap.timeline({ paused: true })
        .to(lines[0], { y: 3.5 }).to(lines[1], { y: -3.5 }, "<")
        .to(lines[0], { rotate: 14 }).to(lines[1], { rotate: -14 }, "<");
      tl.duration(0.6);
      trigger.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        if (html.classList.contains("menu-show")) {
          gsap.to(menu, { opacity: 0, duration: 0.5 });
          gsap.timeline()
            .to(words[1], { y: "0em", duration: 0.6 })
            .to(words[0], { y: "-1em", duration: 0.6, onComplete: () => { gsap.set(words[0], { y: "1em" }); html.classList.remove("menu-show"); busy = false; } }, "<");
          tl.reverse();
        } else {
          html.classList.add("menu-show");
          gsap.to(menu, { opacity: 1, duration: 1, onComplete: () => { busy = false; } });
          gsap.timeline()
            .to(words[0], { y: "0em", duration: 0.6 })
            .to(words[1], { y: "-1em", duration: 0.6, onComplete: () => gsap.set(words[1], { y: "1em" }) }, "<");
          tl.play();
        }
      });
    }

    // # links — move in .4s power3.out offset by the header height, and close the menu if it is open
    const header = document.querySelector(".tn-header");
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        if (html.classList.contains("menu-show")) trigger?.click();
        const href = a.getAttribute("href");
        gsap.to(window, { duration: 0.4, ease: "power3.out", scrollTo: { y: href !== "#" ? href : 0, offsetY: header ? header.clientHeight : 0, autoKill: false } });
      });
    });

    // Card, when the pointer is over the photo or title the whole card gets is-hover
    document.querySelectorAll(".tn-card").forEach((card) => {
      [card.querySelector(".tn-card__fig"), card.querySelector(".tn-card__title a")].filter(Boolean).forEach((el) => {
        el.addEventListener("mouseenter", () => card.classList.add("is-hover"));
        el.addEventListener("mouseleave", () => card.classList.remove("is-hover"));
      });
    });

    // FAQ — first row open, the rest 0, on press to scrollHeight .4s power3.out
    document.querySelectorAll(".tn-faq").forEach((faq) => {
      const items = faq.querySelectorAll("li");
      if (!items.length) return;
      faq.classList.remove("no-js");
      items.forEach((li, i) => {
        const a = li.querySelector(".tn-faq__a"), btn = li.querySelector(".tn-faq__q button");
        let open = i === 0;
        if (open) li.classList.add("is-open"); else a.style.height = "0px";
        btn.addEventListener("click", () => {
          const to = open ? 0 : a.scrollHeight;
          const wasOpen = open;
          open = !open;
          li.classList[wasOpen ? "remove" : "add"]("is-open");
          gsap.to(a, { height: to, duration: 0.4, ease: "power3.out", onComplete: () => { if (!wasOpen) gsap.set(a, { clearProps: "all" }); } });
        });
      });
    });

    // Video modal — when the pointer reaches the play button a triangular ring turns once (1s), pressing gives a black curtain .8s → video 1.2s, closing .5s
    document.querySelectorAll("[data-tn-modal]").forEach((open) => {
      const modal = document.getElementById(open.dataset.tnModal);
      if (!modal) return;
      const video = modal.querySelector(".tn-modal__video");
      const vid = modal.querySelector("video");
      const close = modal.querySelector(".tn-modal__close button");
      const line = open.querySelector(".tn-play-line");
      const block = (e) => e.preventDefault();
      let busy = false;
      gsap.set(video, { opacity: 0 });
      if (line) {
        const dir = Number(open.dataset.tnLine || 92);
        const tl = gsap.timeline({ paused: true, onComplete: () => { tl.pause(); tl.seek(0); gsap.set(line, { strokeDashoffset: 0 }); } })
          .to(line, { strokeDashoffset: dir, duration: 1 });
        open.addEventListener("mouseenter", () => { if (!matchMedia("(pointer:coarse)").matches && tl.progress() === 0) tl.play(); });
      }
      // data-tn-fit — the Hero modal fits the video panel inside the screen at a 560:315 ratio and centers it (on press and when the window size changes)
      const fit = () => {
        if (!modal.hasAttribute("data-tn-fit")) return;
        const xr = Math.trunc((560 / 315) * 1e4) * 1e-4, yr = Math.trunc((315 / 560) * 1e4) * 1e-4;
        let w, h, x = 0, y = 0;
        if (innerWidth / innerHeight > xr) { h = innerHeight; w = xr * h; x = (innerWidth - w) / 2; } else { w = innerWidth; h = yr * w; y = (innerHeight - h) / 2; }
        Object.assign(video.style, { width: `${w}px`, height: `${h}px`, transform: `translate(${x}px,${y}px)` });
      };
      if (modal.hasAttribute("data-tn-fit")) addEventListener("resize", fit);
      open.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        document.addEventListener("touchmove", block, { passive: false });
        document.addEventListener("wheel", block, { passive: false });
        html.classList.add("modal-show");
        fit();
        gsap.timeline().to(modal, { opacity: 1, duration: 0.8 }).add(() => vid?.play()).to(video, { opacity: 1, duration: 1.2, onComplete: () => { busy = false; } });
      });
      close?.addEventListener("click", () => {
        if (busy) return;
        busy = true;
        document.removeEventListener("touchmove", block, { passive: false });
        document.removeEventListener("wheel", block, { passive: false });
        vid?.pause();
        gsap.to(modal, { opacity: 0, onComplete: () => { html.classList.remove("modal-show"); gsap.set(video, { opacity: 0 }); busy = false; } });
      });
    });

    mm.add({ motion: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" }, (ctx) => {
      const { still } = ctx.conditions;

      // Section title letters: start 22% below and transparent, .05s stagger over .8s (once when reaching the 60% line of the screen)
      splitTargets.forEach((el) => {
        const chars = el.querySelectorAll(".tn-char");
        if (still || !chars.length) return;
        gsap.set(chars, { opacity: 0, yPercent: 22 });
        ScrollTrigger.create({ trigger: el, start: "top 60%", once: true, onEnter: () => gsap.to(chars, { opacity: 1, yPercent: 0, stagger: 0.05, duration: 0.8, onComplete: () => gsap.set(chars, { clearProps: "all" }) }) });
      });

      // Rise — data-tn-rise group (children in the same panel with a .15s offset over 1s)
      document.querySelectorAll("[data-tn-rise]").forEach((box) => {
        const kids = box.matches("[data-tn-rise-self]") ? [box] : [...box.querySelectorAll(box.dataset.tnRise || ":scope > *")];
        if (still || !kids.length) return;
        gsap.set(kids, { opacity: 0, yPercent: 22 });
        gsap.to(kids, {
          opacity: 1, yPercent: 0, stagger: 0.15, duration: Number(box.dataset.tnDur || 1), delay: Number(box.dataset.tnDelay ?? 0.6),
          scrollTrigger: { trigger: box, start: box.dataset.tnStart || "top 60%", once: true },
          onComplete: () => gsap.set(kids, { clearProps: "all" }),
        });
      });
    });

    // More — the original hooks the hidden (display:none) button itself as the trigger so its position resolves to 0, and on load every button appears at once and the ripple runs twice
    document.querySelectorAll(".tn-more").forEach((el) => el.classList.add("is-hover"));

    // Waves — duration is width × .008 + 30 seconds, paused when offscreen (started .5s later like the original)
    const waves = gsap.utils.toArray(".tn-wave");
    const setTime = () => { const s = Math.floor(0.008 * innerWidth) + 30; waves.forEach((w) => gsap.set(w, { "--time": `${s}s` })); };
    setTimeout(() => {
      setTime();
      waves.forEach((w) => {
        ScrollTrigger.create({
          trigger: w, start: "top bottom", end: "bottom top",
          onEnter: () => w.classList.remove("is-paused"), onEnterBack: () => w.classList.remove("is-paused"),
          onLeave: () => w.classList.add("is-paused"), onLeaveBack: () => w.classList.add("is-paused"),
        });
      });
    }, 500);
    let rt = 0;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(setTime, 500); });
  };
  if (document.readyState === "complete") onLoad(); else addEventListener("load", onLoad);
})();
