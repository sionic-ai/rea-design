// Understanding the work — two-row photo flow, graphs (circle·bar), count-up, ranking bars, speech bubbles, photo fade transitions, question accordion
(() => {
  const still = document.documentElement.classList.contains("ky-still");
  const SVGNS = "http://www.w3.org/2000/svg";

  // ---------- Two photo rows — same Splide 4.1.4 + AutoScroll 0.5.3 as the original (px per frame): front row 1, back row .5 ----------
  const rowOpts = (speed) => ({ type: "loop", autoWidth: true, pagination: false, drag: false, arrows: false, autoScroll: still ? false : { speed, pauseOnHover: false, autoStart: true } });
  const front = document.querySelector("[data-about-front-slider]");
  const back = document.querySelector("[data-about-back-slider]");
  const ext = window.splide?.Extensions;
  if (front) new Splide(front, rowOpts(1)).mount(ext);
  if (back) new Splide(back, rowOpts(0.5)).mount(ext);

  // ---------- Pie chart — slices are solid · dotted · pale pink · white cells, the dashoffset of the white cover circle is cleared over 1s ----------
  // Fills use skin variables — solid accent · accent dots · light accent · light dots · background
  const FILLS = ["var(--kf-accent)", "url(#ky-dots)", "var(--site-accent-pale)", "url(#ky-dots-lt)", "var(--kf-bg)"];
  const defs = `<defs><pattern id="ky-dots" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" style="fill:var(--kf-bg)"/><circle cx="3" cy="3" r="1" style="fill:var(--kf-accent)"/></pattern><pattern id="ky-dots-lt" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" style="fill:var(--site-dot-pale)"/><circle cx="3" cy="3" r=".8" style="fill:var(--site-dot-strong)"/></pattern></defs>`;
  document.querySelectorAll("[data-pie]").forEach((el) => {
    const vals = el.dataset.pie.split(",").map(Number);
    const keys = el.dataset.keys.split(",");
    const sum = vals.reduce((a, b) => a + b, 0);
    let a0 = -Math.PI / 2;
    const R = 100;
    const slices = vals.map((v, i) => {
      const a1 = a0 + (v / sum) * Math.PI * 2;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const p = (a) => `${110 + R * Math.cos(a)} ${110 + R * Math.sin(a)}`;
      const mid = (a0 + a1) / 2;
      const lr = v / sum > 0.3 ? R * 0.45 : R * 0.78;
      const tx = 110 + lr * Math.cos(mid), ty = 110 + lr * Math.sin(mid) + 4;
      const s = `<path d="M110 110L${p(a0)}A${R} ${R} 0 ${large} 1 ${p(a1)}Z" style="fill:${FILLS[i % FILLS.length]};stroke:var(--kf-accent)" stroke-width=".8"/><text x="${tx}" y="${ty}" text-anchor="middle" style="fill:${i === 0 && v / sum > 0.3 ? "var(--kf-on-accent)" : "var(--kf-ink)"}">00.0%</text>`;
      a0 = a1;
      return s;
    }).join("");
    const len = 2 * Math.PI * 55;
    el.innerHTML = `<svg viewBox="0 0 220 220" aria-hidden="true">${defs}${slices}<circle class="ky-pie__cover" cx="110" cy="110" r="55" stroke-width="112" stroke-dasharray="${len}" stroke-dashoffset="0" style="--len:${-len}" transform="rotate(-90 110 110)"/></svg>
      <ul class="ky-pie__keys">${keys.map((k, i) => `<li><i style="background:${FILLS[i % FILLS.length].startsWith("url") ? "var(--kf-bg)" : FILLS[i % FILLS.length]}"></i>${k}</li>`).join("")}</ul>`;
  });

  // ---------- Bar chart — a white cover shrinks in 1s, anchored to the right ----------
  document.querySelectorAll("[data-bars]").forEach((el) => {
    const vals = el.dataset.bars.split(",").map(Number);
    const keys = el.dataset.keys.split(",");
    const max = Math.max(...vals);
    el.innerHTML = vals.map((v, i) => `<div class="ky-bars__row"><span>${keys[i]}</span><div class="ky-bars__bar"><div class="ky-bars__fill ${v / max < 0.3 ? "is-out" : ""}" style="width:${(v / max) * 100}%;background-color:${i === 0 ? "var(--kf-accent)" : "var(--kf-bg)"};${i === 1 ? "background-image:radial-gradient(var(--kf-accent) 1px,transparent 1.2px);background-size:6px 6px;" : ""}"><b style="color:${i === 0 ? "var(--kf-on-accent)" : "var(--kf-ink)"}">000 people</b></div><span class="ky-bars__cover"></span></div></div>`).join("");
  });

  const once = (sel, fn) => document.querySelectorAll(sel).forEach((el) => ScrollTrigger.create({ trigger: el, start: "top center", once: true, onEnter: () => fn(el) }));
  if (still) {
    document.querySelectorAll("[data-graph]").forEach((g) => g.classList.add("is-drawn"));
    document.querySelectorAll("[data-count-to]").forEach((n) => (n.textContent = n.dataset.countTo));
    gsap.set(".ky-rank__li, .ky-rank__body", { opacity: 1 });
    document.querySelectorAll(".ky-rank__li").forEach((li) => (li.style.width = `${matchMedia("(max-width: 1024px)").matches ? li.dataset.sw : li.dataset.w}%`));
  } else {
    once("[data-graph]", (g) => g.classList.add("is-drawn"));
    // Count-up 2s power1.out — the original rounds down to integers
    once("[data-count]", (box) => box.querySelectorAll("[data-count-to]").forEach((n) => {
      const o = { v: 0 };
      gsap.to(o, { v: +n.dataset.countTo, duration: 2, ease: "power1.out", onUpdate: () => (n.textContent = Math.floor(o.v)) });
    }));
    // Ranking bars — widths grow at .2s intervals and the text lights up once fully grown (below 1025px, phone-width values)
    once("[data-rank]", (box) => {
      const sp = matchMedia("(max-width: 1024px)").matches;
      const tl = gsap.timeline();
      tl.to(box.querySelectorAll(".ky-rank__li"), { opacity: 1, width: (i, li) => `${sp ? li.dataset.sw : li.dataset.w}%`, stagger: 0.2 });
      tl.to(box.querySelectorAll(".ky-rank__body"), { opacity: 1 }, ">");
    });
    gsap.set(".ky-balloon", { opacity: 0, y: 30 });
    gsap.to(".ky-balloon", { opacity: 1, y: 0, stagger: { each: 0.1, from: "random" }, scrollTrigger: { trigger: "[data-balloons]", start: "top center" } });
  }

  // ---------- Three-photo fade slideshow — original Splide fade (5s interval · 2s transition · rewind) ----------
  const day = document.querySelector("[data-about-slider]");
  if (day) new Splide(day, { autoplay: true, type: "fade", rewind: true, gap: 20, destroy: false, arrows: false, pagination: false, interval: 5000, speed: 2000 }).mount();

  // ---------- Question accordion — original Accordion: height opens and closes in .3s expo.out (other questions stay as they are) ----------
  document.querySelectorAll(".ky-acc").forEach((d) => {
    const sum = d.querySelector("summary");
    const body = d.querySelector(".ky-acc__content");
    sum.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        d.classList.remove("is-open");
        gsap.to(body, { height: 0, duration: still ? 0 : 0.3, ease: "expo.out", onComplete: () => { d.open = false; gsap.set(body, { clearProps: "height" }); } });
      } else {
        d.open = true;
        d.classList.add("is-open");
        gsap.fromTo(body, { height: 0 }, { height: "auto", duration: still ? 0 : 0.3, ease: "expo.out" });
      }
    });
  });
})();
