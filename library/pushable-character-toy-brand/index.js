// Home: over 800px of scroll the pinned character shrinks to .636x and the mirror shadow on the water fades. When the closing text rises to the character’s feet, the character is lifted by the same amount.
// When the two date fields in the search section are filled the button turns on, and if the date exists the button presses and pops back while the pink panel opens and cards pop out .03s apart and drop to the panel over 1s
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fig = document.querySelector(".ms-hero__figure");
  const tail = document.querySelector(".ms-block--center");
  if (fig) gsap.set(fig, { xPercent: -50, yPercent: -50, x: 0, y: 0 });

  const reflect = (p) => {
    gsap.set(fig, { scale: 1 - (1 - 0.636) * p });
    const w = innerWidth;
    const [offset, cut, base] = w <= 480 ? ["-140px", "68%", 0.25] : w <= 768 ? ["-35px", "76%", 0.25] : ["0px", "76%", 0.22];
    const a = base * Math.pow(Math.max(0, 1 - p / 0.75), 1.5);
    if (p >= 0.75 || a <= 0.008) { fig.style.removeProperty("-webkit-box-reflect"); return; }
    fig.style.setProperty("-webkit-box-reflect", `below ${offset} linear-gradient(transparent ${cut}, color-mix(in srgb, var(--kf-ink) ${(a * 100).toFixed(2)}%, transparent) 95%, transparent 98%)`);
  };
  const lift = () => {
    if (!tail) return;
    const foot = innerHeight / 2 - 30 + 175, top = tail.getBoundingClientRect().top;
    fig.style.marginTop = top < foot + 25 ? `-${foot + 25 - top}px` : "0px";
  };
  if (fig) {
    let raf = 0;
    const update = () => { raf = 0; reflect(reduce ? 0 : Math.min(1, Math.max(0, scrollY / 800))); lift(); };
    addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  const dd = document.getElementById("ms-dd"), mm = document.getElementById("ms-mm"), go = document.getElementById("ms-go");
  const err = document.getElementById("ms-error"), stage = document.getElementById("picks"), find = document.getElementById("find");
  if (!dd || !mm || !go) return;
  const digits = (el) => { el.value = el.value.replace(/\D/g, "").slice(0, 2); };
  const ready = () => { go.disabled = !(dd.value.length && mm.value.length); };
  [dd, mm].forEach((el) => el.addEventListener("input", () => { digits(el); ready(); if (el === dd && dd.value.length === 2) mm.focus(); }));
  [dd, mm].forEach((el) => el.addEventListener("keydown", (e) => { if (e.key === "Enter" && !go.disabled) { e.preventDefault(); reveal(); } }));
  const real = (d, m) => m >= 1 && m <= 12 && d >= 1 && d <= new Date(2024, m, 0).getDate();
  function reveal() {
    const d = +dd.value, m = +mm.value;
    if (!real(d, m)) { err.style.opacity = "1"; setTimeout(() => (err.style.opacity = "0"), 2500); return; }
    err.style.opacity = "0";
    gsap.timeline().to(go, { scale: 0.92, duration: 0.08, ease: "power2.in" }).to(go, { scale: 1, duration: 0.2, ease: "back.out(2)" });
    stage.hidden = false;
    find.classList.add("is-collapsed");
    const cards = stage.querySelectorAll(".ms-pick");
    gsap.fromTo(cards, { opacity: 0.4, y: 15, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: reduce ? 0 : 0.35, stagger: reduce ? 0 : 0.03, ease: "back.out(1.5)", delay: 0.05 });
    setTimeout(() => {
      const to = innerWidth <= 768 ? find.getBoundingClientRect().top + scrollY + find.offsetHeight : document.documentElement.scrollHeight - innerHeight;
      const s = { y: scrollY };
      gsap.to(s, { y: to, duration: reduce ? 0 : 1, ease: "power2.inOut", onUpdate: () => scrollTo(0, s.y) });
    }, 60);
  }
  go.addEventListener("click", reveal);
})();
