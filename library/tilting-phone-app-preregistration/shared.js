/* Header · footer · logo graphic. The logo stands in for the original logo — the red ticket shape and dot redrawn as our own shapes */
(() => {
  const sprite = document.createElement("div");
  sprite.hidden = true;
  sprite.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg">
    <symbol id="nt-ticket" viewBox="0 0 36 18"><path style="fill: var(--kf-accent)" d="M0 2h22v4a3 3 0 0 0 0 6v4H0v-4a3 3 0 0 0 0-6Z"/><path style="fill: var(--kf-bg)" d="M6 2h1.5v14H6z" opacity=".6"/><circle cx="30" cy="9" r="4.5" style="fill: var(--kf-ink)"/></symbol>
  </svg>`;
  document.body.prepend(sprite);

  const head = document.querySelector('[data-slot="header"]');
  if (head) {
    head.innerHTML = `<a class="nt-logo" href="#" aria-label="Brand Home"><svg viewBox="0 0 36 18"><use href="#nt-ticket"/></svg><span data-label="Brand wordmark">brand</span></a>
      <nav class="nt-head__nav" aria-label="Section navigation"><a href="#solution">Solution</a><a href="#outline">Outline</a><a href="#future">Future</a><a href="#entry">Registration</a></nav>
      <a class="nt-btn" href="#entry">App pre-registration</a>
      <button class="nt-burger" type="button" aria-label="Menu" data-burger><i></i><i></i></button>`;
    head.addEventListener("click", (e) => {
      if (e.target.closest("[data-burger]")) head.classList.toggle("is-open");
      else if (e.target.closest(".nt-head__nav a")) head.classList.remove("is-open");
    });
  }

  const icon = (d) => `<svg viewBox="0 0 20 20"><path d="${d}"/></svg>`;
  const foot = document.querySelector('[data-slot="footer"]');
  if (foot) {
    foot.innerHTML = `<div class="nt-foot__logo" data-label="Brand wordmark (large) — white table shape between two English words">
        <svg viewBox="0 0 740 120" aria-hidden="true">
          <text x="0" y="96" class="is-on">brand</text>
          <rect x="332" y="14" width="300" height="96" rx="6" fill="currentColor"/>
          <text x="350" y="96" class="is-cut">name</text>
          <path d="M648 14h52a28 28 0 0 1 28 28v40a28 28 0 0 1-28 28h-52Z" fill="currentColor"/>
          <circle cx="686" cy="62" r="22" class="is-cut"/>
        </svg>
      </div>
      <div class="nt-foot__bottom">
        <div class="nt-sns"><p>Socials</p><ul>
          <li><a href="#" aria-label="Short-post channel">${icon("M3 3h4l4 5 4-5h2l-5 7 6 7h-4l-4-5-4 5H2l6-7Z")}</a></li>
          <li><a href="#" aria-label="Photo channel">${icon("M5 2h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm5 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm5-1.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z")}</a></li>
          <li><a href="#" aria-label="Post channel">${icon("M4 2h9l3 3v13H4Zm2 6h8v1.5H6Zm0 3h8v1.5H6Zm0 3h5v1.5H6Z")}</a></li>
        </ul></div>
        <p class="nt-copy">© 2022 COMPANY</p>
      </div>`;
  }
})();
