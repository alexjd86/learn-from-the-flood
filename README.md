# Learn From the Flood PWA — V4.1

V4.1 keeps the proven V3 offline-audio system (`learn-flood-audio-v3`) and updates Section 1 with the published Google Sites commentary and local image files supplied for the tour.

## V4.1 changes
- Section 1 Stops 1–7 use the published Google Sites commentary instead of V4 summaries.
- Section 1 images are local under `images/section1/` rather than Google-hosted image URLs.
- Offline image cache is `learn-flood-images-v4-1`.
- App shell cache is `learn-flood-app-v4-1`.
- Audio cache remains `learn-flood-audio-v3` so existing downloaded audio is preserved.
- Section 2 remains audio-only for now.

## GitHub update
Replace the root files `app.js`, `index.html`, `style.css`, `service-worker.js`, and `README.md`, then upload the entire `images/section1/` folder. Do not replace `audio/`, `icons/`, or `manifest.webmanifest`.

After GitHub Pages redeploys, open the site online and refresh twice. Verify all seven Section 1 stops, then tap **Download all for offline** before testing in Airplane Mode.
