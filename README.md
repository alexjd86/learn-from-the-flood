# Learn From the Flood PWA — v4

This version keeps the working v3 offline audio system and adds Section 1 commentary and images from the published Google Site.

## What changed
- Section 1 stops 1–7 now show phone-friendly written commentary.
- Published Google Sites images are shown on stops that contain images.
- "Download all for offline" now saves all 13 MP3s plus the Section 1 images.
- The reliable v3 Blob-based offline audio playback remains in place.
- Section 2 remains audio-only until its Google Sites pages are mapped.

## Updating GitHub
Replace these files in the repository root:
- `app.js`
- `index.html`
- `style.css`
- `service-worker.js`
- `README.md`

You do not need to re-upload the `audio/` folder or `icons/` folder if they are already present and working.

Commit directly to `main`, wait for GitHub Pages to redeploy, then refresh the live site twice while online.

## Offline test
1. Open the live GitHub Pages site while online.
2. Tap **Download all for offline** and wait for completion.
3. Turn on airplane mode and turn Wi-Fi off.
4. Reopen the tour.
5. Test audio and Section 1 images on several stops.
