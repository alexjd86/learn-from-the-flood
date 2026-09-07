const tracks = [
  { section: 1, number: '1.1', title: 'Welcome', file: 'audio/1.1.Welcome.mp3', duration: 57.81 },
  { section: 1, number: '1.2', title: 'Introduction', file: 'audio/1.2.Introduction.mp3', duration: 133.22 },
  { section: 1, number: '1.3', title: 'Modern Tribe', file: 'audio/1.3.ModernTribe.mp3', duration: 43.73 },
  { section: 1, number: '1.4', title: 'Turbulent Times', file: 'audio/1.4.Turbulent-Times.mp3', duration: 448.34 },
  { section: 1, number: '1.5', title: 'Ice Age', file: 'audio/1.5.Ice-Age.mp3', duration: 172.38 },
  { section: 1, number: '1.6', title: 'Stories', file: 'audio/1.6.Stories.mp3', duration: 313.26 },
  { section: 1, number: '1.7', title: 'Extinct Animals', file: 'audio/1.7.Extinct-Animals.mp3', duration: 171.05 },
  { section: 2, number: '2.1', title: 'Every Animal as Food', file: 'audio/2.1.Every-Animal-as-Food.mp3', duration: 91.38 },
  { section: 2, number: '2.2', title: 'Tools', file: 'audio/2.2.Tools.mp3', duration: 146.10 },
  { section: 2, number: '2.3', title: 'Farming', file: 'audio/2.3.Farming.mp3', duration: 115.02 },
  { section: 2, number: '2.4', title: 'Tribal Village', file: 'audio/2.4.Tribal-Village.mp3', duration: 38.43 },
  { section: 2, number: '2.5', title: 'Old World New World', file: 'audio/2.5.Old-World-New-World.mp3', duration: 267.57 },
  { section: 2, number: '2.6', title: 'Abundant Knowledge', file: 'audio/2.6.Abundant-Knowledge.mp3', duration: 376.14 }
];

const audio = document.getElementById('audioPlayer');
const titleEl = document.getElementById('nowPlayingTitle');
const sectionEl = document.getElementById('nowPlayingSection');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const seekBar = document.getElementById('seekBar');
const elapsedEl = document.getElementById('elapsedTime');
const durationEl = document.getElementById('durationTime');
const downloadBtn = document.getElementById('downloadAllBtn');
const offlineStatus = document.getElementById('offlineStatus');
const progressWrap = document.getElementById('downloadProgressWrap');
const progressBar = document.getElementById('downloadProgress');
const progressText = document.getElementById('downloadProgressText');

let currentIndex = 0;
let seeking = false;

function fmt(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function renderTracks() {
  for (const section of [1, 2]) {
    const host = document.getElementById(`section${section}Tracks`);
    tracks.forEach((track, index) => {
      if (track.section !== section) return;
      const card = document.createElement('article');
      card.className = 'track-card';
      card.dataset.index = index;
      card.innerHTML = `
        <div class="track-number">${track.number}</div>
        <div class="track-info">
          <p class="track-title">${track.title}</p>
          <p class="track-duration">${fmt(track.duration)}</p>
        </div>
        <button class="track-play" type="button" aria-label="Play ${track.title}" data-index="${index}">▶</button>`;
      host.appendChild(card);
    });
  }

  document.querySelectorAll('.track-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      if (idx === currentIndex && !audio.paused) audio.pause();
      else {
        if (idx !== currentIndex) loadTrack(idx);
        audio.play().catch(() => {});
      }
    });
  });
}

function loadTrack(index) {
  currentIndex = Math.max(0, Math.min(index, tracks.length - 1));
  const track = tracks[currentIndex];
  audio.src = new URL(track.file, document.baseURI).href;
  audio.load();
  titleEl.textContent = track.title;
  sectionEl.textContent = `Section ${track.section} · Track ${currentIndex + 1} of ${tracks.length}`;
  durationEl.textContent = fmt(track.duration);
  elapsedEl.textContent = '0:00';
  seekBar.value = 0;
  playPauseBtn.setAttribute('aria-label', `Play ${track.title}`);
  updateActiveCard();
}

function updateActiveCard() {
  document.querySelectorAll('.track-card').forEach(card => {
    card.classList.toggle('active', Number(card.dataset.index) === currentIndex);
  });
  document.querySelectorAll('.track-play').forEach(btn => {
    const active = Number(btn.dataset.index) === currentIndex;
    btn.textContent = active && !audio.paused ? '❚❚' : '▶';
    btn.setAttribute('aria-label', `${active && !audio.paused ? 'Pause' : 'Play'} ${tracks[Number(btn.dataset.index)].title}`);
  });
}

function updatePlayButton() {
  const playing = !audio.paused;
  playPauseBtn.innerHTML = playing ? '❚❚ <span>Pause</span>' : '▶ <span>Play</span>';
  playPauseBtn.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${tracks[currentIndex].title}`);
  updateActiveCard();
}

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) audio.play().catch(() => {}); else audio.pause();
});
prevBtn.addEventListener('click', () => {
  const wasPlaying = !audio.paused;
  loadTrack(currentIndex - 1);
  if (wasPlaying) audio.play().catch(() => {});
});
nextBtn.addEventListener('click', () => {
  const wasPlaying = !audio.paused;
  loadTrack(currentIndex + 1);
  if (wasPlaying) audio.play().catch(() => {});
});

audio.addEventListener('error', () => {
  const err = audio.error;
  const code = err ? err.code : 'unknown';
  offlineStatus.textContent = `Audio could not load (error ${code}). Check that the audio folder was uploaded.`;
  console.error('Audio playback error', err, audio.currentSrc);
});

audio.addEventListener('play', updatePlayButton);
audio.addEventListener('pause', updatePlayButton);
audio.addEventListener('ended', () => {
  if (currentIndex < tracks.length - 1) {
    loadTrack(currentIndex + 1);
    audio.play().catch(() => {});
  }
});
audio.addEventListener('timeupdate', () => {
  if (!seeking && audio.duration) seekBar.value = Math.round((audio.currentTime / audio.duration) * 1000);
  elapsedEl.textContent = fmt(audio.currentTime);
  durationEl.textContent = fmt(audio.duration || tracks[currentIndex].duration);
});
seekBar.addEventListener('input', () => {
  seeking = true;
  const dur = audio.duration || tracks[currentIndex].duration;
  elapsedEl.textContent = fmt((seekBar.value / 1000) * dur);
});
seekBar.addEventListener('change', () => {
  const dur = audio.duration || tracks[currentIndex].duration;
  audio.currentTime = (seekBar.value / 1000) * dur;
  seeking = false;
});

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    offlineStatus.textContent = 'Offline mode is not supported in this browser';
    downloadBtn.disabled = true;
    return;
  }
  try {
    await navigator.serviceWorker.register('service-worker.js');
    await navigator.serviceWorker.ready;
    checkOfflineStatus();
  } catch (err) {
    console.error(err);
    offlineStatus.textContent = 'Could not enable offline mode';
  }
}

async function checkOfflineStatus() {
  if (!('caches' in window)) return;
  const cache = await caches.open('learn-flood-audio-v2');
  let found = 0;
  for (const track of tracks) {
    if (await cache.match(new URL(track.file, document.baseURI).href)) found++;
  }
  if (found === tracks.length) {
    offlineStatus.textContent = 'Full tour is ready offline';
    downloadBtn.textContent = 'Downloaded ✓';
  } else if (found > 0) {
    offlineStatus.textContent = `${found} of ${tracks.length} tracks saved`;
  }
}

downloadBtn.addEventListener('click', async () => {
  if (!('caches' in window)) return;
  downloadBtn.disabled = true;
  progressWrap.classList.remove('hidden');
  progressWrap.setAttribute('aria-hidden', 'false');
  progressBar.value = 0;
  progressText.textContent = 'Starting download…';

  try {
    const cache = await caches.open('learn-flood-audio-v2');
    let done = 0;
    for (const track of tracks) {
      const url = new URL(track.file, document.baseURI).href;
      if (!(await cache.match(url))) {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Could not download ${track.title}`);
        await cache.put(url, response.clone());
      }
      done++;
      progressBar.value = done;
      progressText.textContent = `${done} of ${tracks.length} tracks saved`;
    }
    offlineStatus.textContent = 'Full tour is ready offline';
    downloadBtn.textContent = 'Downloaded ✓';
    progressText.textContent = 'Offline download complete';
  } catch (err) {
    console.error(err);
    offlineStatus.textContent = 'Download interrupted — tap again when online';
    progressText.textContent = 'Download stopped before completion';
    downloadBtn.textContent = 'Resume offline download';
  } finally {
    downloadBtn.disabled = false;
  }
});

window.addEventListener('online', checkOfflineStatus);
renderTracks();
loadTrack(0);
registerServiceWorker();
