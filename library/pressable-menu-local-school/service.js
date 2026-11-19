// Features page: redraws the people illustrations on the four heart cards (where the original line art was) at the same size and stroke width.
(() => {
  const person = (x, shirt, arm) => `
    <g transform="translate(${x} 0)">
      <path class="a-s-ink ${shirt}" stroke-width="2" d="M-26 146c2-26 12-40 26-40s24 14 26 40z"/>
      <circle class="a-s-ink a-f-skin" cx="0" cy="78" r="22" stroke-width="2"/>
      <path class="a-f-ink" d="M-22 74c0-16 10-24 22-24s22 8 22 24c-6-8-14-11-22-11s-16 3-22 11z"/>
      <circle class="a-f-ink" cx="-8" cy="80" r="2"/><circle class="a-f-ink" cx="8" cy="80" r="2"/>
      <path class="a-s-ink" fill="none" stroke-width="2" stroke-linecap="round" d="M-6 90q6 5 12 0"/>
      <path class="a-s-ink" fill="none" stroke-width="2" stroke-linecap="round" d="${arm}"/>
    </g>`;
  const extras = [
    '<rect class="a-f-surface a-s-ink" x="150" y="40" width="52" height="40" rx="6" stroke-width="2"/><path class="a-s-ink" stroke-width="2" d="M160 52h32M160 62h24"/><path class="a-f-surface a-s-ink" stroke-width="2" d="m166 80 4 10 8-10"/>',
    '<path class="a-s-sky" fill="none" stroke-width="3" stroke-linecap="round" d="M150 50c10-12 24-12 32 0M156 66c6-6 14-6 20 0"/><circle class="a-f-yellow" cx="196" cy="44" r="6"/>',
    '<circle class="a-f-surface a-s-ink" cx="176" cy="60" r="22" stroke-width="2"/><path class="a-s-ink" fill="none" stroke-width="3" stroke-linecap="round" d="m164 48 24 24M188 48l-24 24"/>',
    '<path class="a-f-yellow a-s-ink" stroke-width="2" stroke-linejoin="round" d="m176 34 6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z"/>',
  ];
  const arms = [
    "M20 120c12-10 22-26 30-42",
    "M-20 122c-10-10-18-22-20-34M20 122c10-10 18-22 20-34",
    "M-18 128c12-4 24-4 36 0",
    "M20 120c8-12 12-26 12-40",
  ];
  const shirts = ["a-f-accent", "a-f-sky", "a-f-green", "a-f-orange"];
  document.querySelectorAll("[data-art]").forEach((fig) => {
    const i = +fig.dataset.art % 4;
    fig.innerHTML = `<svg viewBox="0 0 220 146" aria-hidden="true">${person(100, shirts[i], arms[i])}${extras[i]}</svg>`;
  });
})();
