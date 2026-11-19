// First-page motion — original values: terminal line timetable · stage name changes (1.21/2.12/2.97s), card slot crossing 184→92px, tab curtain .52s, agent dialogue .3/1.1·1.1/1.9·2.2s
(() => {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  const swift = CustomEase.create("ak-swift", "0.2,0,0,1");
  const standard = CustomEase.create("ak-standard", "0.4,0,0.2,1");
  const outQuint = CustomEase.create("ak-out-quint", "0.22,1,0.36,1");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const once = (el, fn, at = 0.5) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold: at });
    io.observe(el);
  };

  // Picture boards wider than the width are shrunk with zoom — the height shrinks too, so nothing is left empty below
  const fits = [];
  const fit = (el, natural) => {
    const p = el.parentElement, cs = getComputedStyle(p);
    const room = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const s = Math.min(1, room / natural);
    el.style.zoom = s < 1 ? s.toFixed(4) : "";
  };
  const watchFit = (el, natural) => {
    fits.push([el, natural]);
    new ResizeObserver(() => fit(el, natural)).observe(el.parentElement);
  };
  $$(".ak-gframe--orgs, .ak-gframe--rbac").forEach((el) => watchFit(el, 422));
  $$(".ak-gframe--idp").forEach((el) => watchFit(el, 392));

  // ── Install → decorate drawing panel ──
  const setupBox = $(".ak-setup .ak-rigbox");
  const dock = $(".ak-rigbox--dock");
  const rig = $(".ak-rig", setupBox);
  const pristine = rig.cloneNode(true);
  watchFit(setupBox, 544);
  watchFit(dock, 544);

  const STEPS = [
    [0, "Exploring a project"],
    [1.21, "Setting up"],
    [2.12, "Inspecting"],
    [2.97, "Setup complete"],
  ];
  const statusText = $("[data-status]", rig), status = $(".ak-rig__status", rig);
  const skel = $(".ak-prev__skel", rig), skelBody = $(".ak-prev__skelbody", rig), hosted = $('[data-layer="hosted"]', rig);
  const lines = $$(".ak-term__lines p", rig);

  if (reduce) {
    gsap.set(skel, { autoAlpha: 0 });
    statusText.textContent = STEPS[3][1];
    status.classList.add("is-done");
  } else {
    // Skeleton body opens from top to bottom (inset bottom 98.5% → 0, .78s). Step names sharpen in .17s from 4px blur when they change
    const reset = () => {
      gsap.set(lines, { opacity: 0, y: 4 });
      gsap.set(hosted, { autoAlpha: 0, filter: "blur(4px)" });
      gsap.set(skel, { autoAlpha: 1, filter: "blur(0px)" });
      gsap.set(skelBody, { clipPath: "inset(0% 0% 98.5% 0%)" });
    };
    let tl = null;
    const run = () => {
      tl = gsap.timeline();
      lines.forEach((p) => tl.to(p, { opacity: 1, y: 0, duration: 0.12, ease: swift }, +p.dataset.at));
      STEPS.forEach(([t, text], i) => tl.call(() => {
        statusText.textContent = text;
        status.classList.toggle("is-done", i === STEPS.length - 1);
        gsap.fromTo(statusText, { filter: "blur(4px)" }, { filter: "blur(0px)", duration: 0.17, ease: outQuint });
      }, null, t));
      tl.to(skelBody, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.78, ease: outQuint }, 1.07)
        .to(skel, { opacity: 0.55, duration: 0.42, ease: "sine.inOut", yoyo: true, repeat: 1 }, 2.12)
        .to(skel, { autoAlpha: 0, filter: "blur(4px)", duration: 0.5, ease: outQuint }, 2.97)
        .to(hosted, { autoAlpha: 1, filter: "blur(0px)", duration: 0.6, ease: outQuint }, 2.97);
    };
    reset();
    once(setupBox, run, 0.35);
    // Like the original, clicking a command chip replays the effect from the start — what was showing fades out in .25s
    $(".ak-cmd")?.addEventListener("click", () => {
      tl?.kill();
      gsap.to($(".ak-spin", rig), { scale: 0.25, duration: 0.3, ease: "power2.out" });
      gsap.to([...lines, hosted, skel, statusText], { opacity: 0, filter: "blur(4px)", duration: 0.3, ease: "power2.out", onComplete: () => {
        gsap.set($(".ak-spin", rig), { scale: 1 });
        gsap.set(statusText, { opacity: 1, filter: "blur(0px)" });
        reset();
        run();
      } });
    });
  }

  // Narrow screen: raise one more panel in the decorating state in the decorating section. Wide screen: keep the install panel pinned and carry it over to the decorating spot
  const mm = gsap.matchMedia();
  mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" }, (ctx) => {
    const { wide } = ctx.conditions;
    if (!wide || reduce) {
      const copy = pristine.cloneNode(true);
      copy.dataset.state = "custom";
      copy.removeAttribute("data-rig");
      $(".ak-prev__skel", copy).remove();
      copy.setAttribute("aria-label", "Illustration of styling a login card by color, corners, brightness, language and typeface");
      dock.append(copy);
      dock.removeAttribute("aria-hidden");
      return () => copy.remove();
    }
    const slot = $(".ak-rig__slot", rig), term = $(".ak-rig__terminal", rig);
    const panels = $$(".ak-rig__panel", rig), groups = $$(".ak-ctl", rig), css = $(".ak-rig__css", rig);
    // The original pins the board and switches to time the moment it passes the middle of the pinned range (not tied to scroll) — it reverses when scrolling back
    const swap = gsap.timeline({ paused: true, defaults: { ease: outQuint } })
      .to(status, { opacity: 0, duration: 0.2, ease: standard }, 0)
      .to(term, { opacity: 0, x: -32, scale: 0.96, duration: 0.35, ease: standard }, 0)
      .fromTo(slot, { left: 184 }, { left: 92, duration: 0.55 }, 0.05)
      .fromTo(panels[0], { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.55 }, 0.12)
      .fromTo(panels[1], { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.55 }, 0.12)
      .fromTo(groups, { scaleY: 0.85, opacity: 0 }, { scaleY: 1, opacity: 1, duration: 0.4, stagger: 0.04 }, 0.2)
      .fromTo(css, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.3 }, 0.35);
    ScrollTrigger.create({
      trigger: setupBox, start: "center center", endTrigger: dock, end: "center center",
      pin: setupBox, pinSpacing: false,
      onUpdate: (st) => {
        const custom = st.progress > 0.5;
        if (custom === (rig.dataset.state === "custom")) return;
        rig.dataset.state = custom ? "custom" : "setup";
        if (custom) swap.play(); else swap.reverse();
      },
    });
    return () => { swap.revert(); delete rig.dataset.state; };
  });

  // Control panel — color, corners, brightness, language, typeface. There are two panels (the install panel and the styling panel on narrow screens), so attach only to the pressed panel.
  const WORDS = {
    en: { title: "Sign in to App Name", email: "Email", ph: "Your email address", go: "Continue", with: "Continue with Provider", no: "No account yet?", start: "Get started" },
    es: { title: "Entrar en App Name", email: "Correo", ph: "Tu correo", go: "Continuar", with: "Seguir con Proveedor", no: "¿Sin cuenta?", start: "Empezar" },
    fr: { title: "Connexion à App Name", email: "E-mail", ph: "Votre adresse e-mail", go: "Continuer", with: "Continuer avec Fournisseur", no: "Pas de compte ?", start: "Commencer" },
    de: { title: "Bei App Name anmelden", email: "E-Mail", ph: "Ihre E-Mail-Adresse", go: "Weiter", with: "Weiter mit Anbieter", no: "Kein Konto?", start: "Loslegen" },
    ja: { title: "App Name sign in", email: "Mail", ph: "Mail address", go: "Next", with: "Provider sign in", no: "No account?", start: "Start" },
  };
  const FONTS = { sans: "var(--kf-font-sans)", display: "var(--kf-font-display)", mono: "var(--kf-font-mono)", italic: "var(--kf-font-sans)" };
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".ak-ctl button");
    if (btn) {
      const r = btn.closest(".ak-rig"), kind = btn.closest(".ak-ctl").dataset.ctl, v = btn.dataset.v;
      $$("button", btn.parentElement).forEach((b) => { const on = b === btn; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", String(on)); });
      if (kind === "brand") r.dataset.brand = v;
      if (kind === "radius") r.style.setProperty("--prev-r", `${v}px`);
      if (kind === "mode") r.classList.toggle("is-dark", v === "dark");
      if (kind === "font") { r.style.setProperty("--prev-font", FONTS[v]); $(".ak-prev", r).style.fontStyle = v === "italic" ? "italic" : ""; }
      if (kind === "lang") $$("[data-i18n]", r).forEach((n) => {
        n.textContent = WORDS[v][n.dataset.i18n];
        n.classList.remove("is-shimmer"); void n.offsetWidth; n.classList.add("is-shimmer");
      });
      return;
    }
    const css = e.target.closest(".ak-rig__css");
    if (css) {
      const on = css.getAttribute("aria-pressed") !== "true";
      css.setAttribute("aria-pressed", String(on));
      css.closest(".ak-rig").classList.toggle("is-css", on);
    }
  });

  // Decorating-method tab — the new curtain opens top to bottom (inset bottom 100%→0) and the old curtain closes from the top, .52s
  $$(".ak-tab").forEach((tab) => tab.addEventListener("click", () => {
    $$(".ak-tab").forEach((t) => { const on = t === tab; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); });
    $$(".ak-rig").forEach((r) => {
      const next = $(`[data-layer="${tab.dataset.tab}"]`, r), cur = $(".ak-prev__layer.is-on", r);
      if (!next || next === cur) return;
      $(".ak-prev__skel", r)?.remove();
      cur?.classList.remove("is-on");
      next.classList.add("is-on");
      cur?.setAttribute("aria-hidden", "true");
      next.removeAttribute("aria-hidden");
      if (reduce) { gsap.set(cur, { clearProps: "all" }); gsap.set(next, { clearProps: "all" }); return; }
      if (cur) gsap.fromTo(cur, { clipPath: "inset(0% 0% 0% 0%)", autoAlpha: 1 }, { clipPath: "inset(100% 0% 0% 0%)", duration: 0.52, ease: outQuint, onComplete: () => gsap.set(cur, { clearProps: "all" }) });
      gsap.fromTo(next, { clipPath: "inset(0% 0% 100% 0%)", autoAlpha: 1, filter: "blur(3px)" }, { clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", duration: 0.52, ease: outQuint });
    });
  }));

  // ── Org switch · role permissions ──
  $$(".ak-switch").forEach((s) => s.addEventListener("click", () => {
    const on = !s.classList.contains("is-on");
    s.classList.toggle("is-on", on);
    s.setAttribute("aria-checked", String(on));
  }));
  const ROLES = [{ name: "Admin", perms: [0, 1, 2, 3] }, { name: "Member", perms: [0, 1] }, { name: "Viewer", perms: [0] }];
  let role = 0;
  const roleBtns = $$(".ak-roles__list button"), permBtns = $$(".ak-perm"), roleTag = $(".ak-perms__role");
  const drawRoles = () => {
    roleBtns.forEach((b, i) => { b.classList.toggle("is-on", i === role); b.querySelector("span").textContent = ROLES[i].perms.length; });
    permBtns.forEach((p, i) => p.setAttribute("aria-checked", String(ROLES[role].perms.includes(i))));
    if (roleTag) roleTag.textContent = ROLES[role].name;
  };
  roleBtns.forEach((b, i) => b.addEventListener("click", () => { role = i; drawRoles(); }));
  permBtns.forEach((p, i) => p.addEventListener("click", () => {
    const list = ROLES[role].perms;
    ROLES[role].perms = list.includes(i) ? list.filter((x) => x !== i) : [...list, i];
    drawRoles();
  }));

  // ── Agent ──
  const chat = $('[data-seq="chat"]');
  const steps = $$("li", chat), reply = $(".ak-chat__reply", chat);
  const SHOW = [0.3, 1.1], DONE = [1.1, 1.9];
  const finishChat = () => {
    gsap.set(steps, { opacity: 1, y: 0 });
    steps.forEach((li) => { gsap.set($$(".ak-chat__wait", li), { opacity: 0 }); gsap.set($$(".ak-chat__ok", li), { opacity: 1 }); });
    gsap.set(reply, { opacity: 1, y: 0 });
  };
  if (reduce) finishChat();
  else once(chat, () => {
    const tl = gsap.timeline();
    steps.forEach((li, i) => {
      tl.fromTo(li, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: swift }, SHOW[i])
        .to($$(".ak-chat__wait", li), { opacity: 0, duration: 0.15, ease: standard }, DONE[i])
        .to($$(".ak-chat__ok", li), { opacity: 1, duration: 0.2, ease: standard }, DONE[i])
        .fromTo($(".ak-chat__dot .ak-chat__ok", li), { scale: 0.6 }, { scale: 1, duration: 0.35, ease: "back.out(1.6)" }, DONE[i]);
    });
    tl.fromTo(reply, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, ease: outQuint }, 2.2);
  });

  const grant = $('[data-seq="grant"]');
  if (!reduce) {
    const rows = $$("li", grant), checks = $$("li.is-on i", grant);
    gsap.set(rows, { opacity: 0, y: 6 });
    gsap.set(checks, { scale: 0.8, opacity: 0 });
    once(grant, () => {
      gsap.to(rows, { opacity: 1, y: 0, duration: 0.4, ease: outQuint, stagger: 0.08 });
      gsap.to(checks, { scale: 1, opacity: 1, duration: 0.4, ease: CustomEase.create("ak-back", "0.34,1.56,0.64,1"), stagger: 0.12, delay: 0.25 });
    });
  }

  document.fonts?.ready.then(() => { fits.forEach(([el, n]) => fit(el, n)); ScrollTrigger.refresh(); });
})();

// Command chip — tap to copy, and the icon turns into a check for 1.2 seconds
(() => {
  document.querySelectorAll(".ak-cmd").forEach((b) => b.addEventListener("click", () => {
    navigator.clipboard?.writeText(b.querySelector("span").textContent).catch(() => {});
    const path = b.querySelector("path");
    const copyD = path.dataset.d || (path.dataset.d = path.getAttribute("d"));
    path.setAttribute("d", "M12.85 4.65a.5.5 0 0 1 0 .7l-6 6a.5.5 0 0 1-.7 0l-3-3a.5.5 0 1 1 .7-.7L6.5 10.29l5.65-5.64a.5.5 0 0 1 .7 0Z");
    clearTimeout(b._t);
    b._t = setTimeout(() => path.setAttribute("d", copyD), 1200);
  }));
})();
