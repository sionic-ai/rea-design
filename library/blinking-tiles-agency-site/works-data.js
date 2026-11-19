// 22 Work placeholders — photo labels describe the type of photo the original slot shows (subject, light, composition)
window.unWorks = [
  ["B&W portrait in suit, upper body · next to piano · landscape", 1, "Website, reservations", ["web"]],
  ["Two phones in hand showing app screens · on a gray pegboard · from above", 0, "Branding, App, Product development", ["brand", "app"]],
  ["Back view of black T-shirt with big logo · light background · front-facing", 0, "Branding, Communication", ["brand", "comm"]],
  ["Close to an airplane engine · hazy sky tone · landscape", 0, "Website", ["web"]],
  ["Street portrait, half-length · Afternoon natural light · Portrait", 0, "Branding, website", ["brand", "web"]],
  ["Wide shot of coworking space · big windows, natural light · landscape", 1, "Dedicated digital team", ["web", "app"]],
  ["Car sales screen on a laptop · on a pegboard · at an angle", 0, "Website, Online store", ["web", "shop"]],
  ["Scattered mint business cards · From above · Square", 0, "Branding, App", ["brand", "app"]],
  ["Monitor screen on white stand · light gray · front view", 1, "Website", ["web"]],
  ["Mother and child face to face · warm kitchen light · horizontal", 0, "Websites, apps", ["web", "app"]],
  ["Laptop on an orange chair · window light · angled", 0, "Website", ["web"]],
  ["Car front headlights · blue and red lighting · landscape", 1, "Website, Online store", ["web", "shop"]],
  ["Phone with pink screen showing event app · mint background · front view", 0, "Communication, app", ["comm", "app"]],
  ["B&W portrait in workshop · side light · vertical", 0, "Website", ["web"]],
  ["Hand over a pizza · warm overhead light · landscape", 1, "Branding, Communication", ["brand", "comm"]],
  ["Arched shelf interior · bright daytime · portrait", 0, "App", ["app"]],
  ["Person in white dress indoors · floral decor · vertical", 0, "Website, Branding", ["web", "brand"]],
  ["Two people leaning together in outfits · warm beige · portrait", 0, "Branding, digital, product development", ["brand", "shop"]],
  ["Large text on laptop screen · light gray · front view", 0, "Branding, website", ["brand", "web"]],
  ["Scattered orange 3D coins · white background · square", 0, "Branding", ["brand"]],
  ["Neon yellow card · dark green background · from above", 0, "Branding, website", ["brand", "web"]],
  ["Silhouette of a person in smoke · orange light · portrait", 1, "Website", ["web", "comm"]],
].map(([label, video, services, cats], i) => ({
  name: `Project Name ${String(i + 1).padStart(2, "0")}`, label, video: !!video, services, cats,
  excerpt: "Your one line here introducing the work — within two lines.", year: "0000", url: "detail.html",
}));
// Original row-type list (View all) — four columns in one row
window.unRows = [["wide", 1], ["pair-inside", 2], ["pair-outside", 2], ["awards", 1], ["pair-inside", 2], ["wide-right", 1], ["pair-right", 2], ["wide", 1], ["pair-outside", 2], ["wide-right", 1], ["pair-left", 2], ["pair-outside", 2], ["pair-inside", 2], ["wide", 1]];
