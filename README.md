# Aerovise — static site

Plain HTML + built Tailwind CSS + vanilla JS. No framework, no build step on the server.
Engines: GSAP + ScrollTrigger, Lenis, Motion (Framer Motion's vanilla engine), hls.js (on demand). All vendored in `assets/js/vendor`.

## Edit
- Content: `index.html`
- Email / WhatsApp / reviews / hero video: top of `assets/js/main.js` (`CONFIG`)
- Styles: `src/input.css` → rebuild CSS (below)
- Work screenshots: `assets/works/<name>.jpg` (1600×840). In `index.html`, set the project's `<img src="assets/works/<name>.jpg">`.

## Rebuild CSS (only after editing `src/input.css` or adding new Tailwind classes)
```
npm install
npm run build
```
`assets/css/styles.css` is committed, so GitHub Pages needs no build.

## Preview locally
```
npm run serve
```

## Deploy on GitHub Pages (PowerShell)
```
cd C:\Sites\aerovise
git init
git add .
git commit -m "Aerovise v5"
git branch -M main
git remote add origin https://github.com/saifalamgir355/aerovise.git
git push -u origin main
```
GitHub → repo → Settings → Pages → Source: `main` / `/ (root)` → Custom domain: `aerovise.tech` → Enforce HTTPS.
`CNAME` and `.nojekyll` are already in the repo.

## DNS (Spaceship)
- `A` `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
- `CNAME` `www` → `saifalamgir355.github.io`
- Delete old Cloudflare records for `aerovise.tech`. If nameservers point to Cloudflare, switch back to Spaceship nameservers.

## Adding a new work (v5.1)

1. Take a homepage screenshot (about 1900 px wide). Save it as `assets/works/<name>.jpg` (1600 px wide, JPG).
2. In `index.html`, copy one `<article class="work ...">` block inside `#work`.
3. Change: `href`, `data-preview`, `data-title`, `b-url` text, `img src`, `data-fallback`, title, chips, description.
4. Update the "Sites live" counter: `data-count="7"` (search for it).
5. Rebuild CSS only if you add new Tailwind classes: `npm install` then `npm run build`.

Current works (7): Alhayat Alsaeeda, S.R Enterprise, Femmorah, Emorah, M/S Alamgir, King's Auto Complex, Sagarika Ship Breaking.
