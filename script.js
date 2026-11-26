/* ===== 1. VOS DONNÉES (à remplacer) ===== */
const skills = ["HTML / CSS", "JavaScript", "Git", "Responsive", "Accessibilité"];
const qualities = ["Rigoureux", "Curieux", "Autonome", "Esprit d'équipe"];
const projects = [
  { t: "Projet en cours n°1", d: "Je suis en pleine réalisation et Fin de mon Portfolio Dynamique", p: 70, tags: ["JavaScript", "API"] },
  { t: "Projet en cours n°2", d: "Je suis entrain de coder un jeux de société qui s'appelle MakiSan ", p: 40, tags: ["CSS", "Design"] },
  { t: "Idée en chantier", d: "Je n'ai pas d'idée de 3eme Projet actuelle", p: 15, tags: ["Pixel art"] }
];
const hobbies = [
  { t: "Voyage", d: "J'adore la Montagne et voyager dans ce genre d'endroit" },
  { t: "Jeux Vidéo", d: "J'aime aussi les jeux vidéo comme valorant ou Rocket League" },
  { t: "Sport", d: "Je pratique l'Aviron en club" }
];

/* ===== 2. CONTENU ===== */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const chips = (a) => a.map((x) => `<li>${esc(x)}</li>`).join("");

$("#skills").innerHTML = chips(skills);
$("#qualities").innerHTML = chips(qualities);
$("#projects").innerHTML = projects.map((p) => `
  <article class="card"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p>
    <div class="bar" role="progressbar" aria-label="Avancement" aria-valuenow="${p.p}" aria-valuemin="0" aria-valuemax="100"><i style="width:${p.p}%"></i></div>
    <ul class="chips">${chips(p.tags)}</ul></article>`).join("");
$("#hobbies").innerHTML = hobbies.map((h) => `<li class="card"><h3>${esc(h.t)}</h3><p>${esc(h.d)}</p></li>`).join("");

/* ===== 3. PERSONNAGE PIXEL ART (12 x 15 pixels, dessiné en SVG) ===== */
// Lettres = couleurs du tableau OUT ci-dessous. Chaque ligne est centrée automatiquement.
const SPR = {
  top: ["HHHHHH", "HHHHHHHH", "hssssssh", "sGgGGgGs", "ssssssss", "ssssss", "uuuu",
        "aakttkaa", "akttttka", "lkttttkl", "xppppppx", "pppppp"],
  legA: ["ppp..ppp", "ppp..ppp", "fff..fff"],
  legB: ["pppppp", "pppppp", "ffffff"]
};
const skin = "#f1c9a5", hair = "#e6c35c"; // blond
const OUT = { // une tenue par zone
  bureau:   { H: hair, h: hair, s: skin, g: "#14183a", G: skin, u: "#fff", a: "#fff", l: "#fff", t: "#fff", k: "#fff", x: skin, p: "#2f5bd8", f: "#2b2b2b" },
  atelier:  { H: "#ff9f1c", h: hair, s: skin, g: "#14183a", G: skin, u: "#f4f4f4", a: "#f4f4f4", l: "#f4f4f4", t: "#1f56c4", k: "#1f56c4", x: skin, p: "#1f56c4", f: "#6b4423" },
  montagne: { H: hair, h: hair, s: skin, g: "#8c1020", G: "#e63946", u: skin, a: "#fff", l: skin, t: "#fff", k: "#16161d", x: skin, p: "#8a8f9c", f: "#2b2b2b" }
};

const hero = $("#hero");
const W = 12;
const pad = (r) => { const l = (W - r.length) >> 1; return ".".repeat(l) + r + ".".repeat(W - l - r.length); };
const rects = (rows, y0, pal) => rows.map((r, y) => [...pad(r)].map((c, x) =>
  pal[c] ? `<rect x="${x}" y="${y + y0}" width="1" height="1" fill="${pal[c]}"/>` : "").join("")).join("");

let current;
function setOutfit(name) {
  const first = !current;
  current = name;
  const p = OUT[name];
  hero.innerHTML = `<svg viewBox="0 0 12 15">${rects(SPR.top, 0, p)}<g class="fa">${rects(SPR.legA, 12, p)}</g><g class="fb">${rects(SPR.legB, 12, p)}</g></svg>`;
  if (!first) { hero.classList.add("poof"); setTimeout(() => hero.classList.remove("poof"), 450); }
}

// La tenue change quand une zone atteint le milieu de l'écran
const io = new IntersectionObserver((entries) => entries.forEach((e) => {
  if (e.isIntersecting && e.target.dataset.outfit !== current) setOutfit(e.target.dataset.outfit);
}), { rootMargin: "-50% 0px -50% 0px" });
document.querySelectorAll(".zone").forEach((z) => io.observe(z));
setOutfit("bureau");

/* ===== 4. DÉPLACEMENT AU DÉFILEMENT ===== */
let busy = false, timer;
const maxX = () => innerWidth - hero.offsetWidth;

function place() {
  if (busy) return;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? scrollY / max : 0;
  const a = p * Math.PI * 4; // 2 allers-retours gauche/droite sur toute la page
  hero.style.setProperty("--f", Math.sin(a) < 0 ? -1 : 1);
  hero.style.transform = `translateX(${maxX() * (0.5 - 0.5 * Math.cos(a))}px)`;
  hero.classList.add("walk");
  clearTimeout(timer);
  timer = setTimeout(() => hero.classList.remove("walk"), 160);
}
addEventListener("scroll", place, { passive: true });
addEventListener("resize", place);
place();

/* ===== 5. SAUT SOUS LE BLOC PUIS NAVIGATION (ancre ou href) ===== */
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-jump]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  const href = a.getAttribute("href");
  const go = () => (href.startsWith("#") ? document.querySelector(href).scrollIntoView() : (location.href = href));
  if (reduce.matches || busy) return go();

  busy = true;
  const r = a.getBoundingClientRect();
  const x = Math.min(maxX(), Math.max(0, r.left + r.width / 2 - hero.offsetWidth / 2));
  hero.style.transform = `translateX(${x}px)`; // il se place sous le bloc
  setTimeout(() => { hero.classList.add("jump"); a.classList.add("hit"); }, 250); // saute et tape
  setTimeout(() => { hero.classList.remove("jump"); a.classList.remove("hit"); busy = false; go(); }, 750);
});