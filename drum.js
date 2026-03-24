const TRACKS = [
  { name: 'Kick',     freq: 60,  type: 'kick'    },
  { name: 'Snare',    freq: 200, type: 'snare'   },
  { name: 'Hi-Hat',   freq: 800, type: 'hihat'   },
  { name: 'Open HH',  freq: 600, type: 'openhat' },
  { name: 'Clap',     freq: 1000,type: 'clap'    },
  { name: 'Tom Hi',   freq: 300, type: 'tom'     },
  { name: 'Tom Lo',   freq: 150, type: 'tom'     },
  { name: 'Rim',      freq: 900, type: 'rim'     },
];

const STEPS = 16;
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// state[track][step] = true/false
const state = TRACKS.map(() => Array(STEPS).fill(false));
let currentStep = 0;
let playing = false;
let intervalId = null;

// ── Audio synthesis ──────────────────────────────────────────────────────────

function playSound(type, freq) {
  const now = ctx.currentTime;

  switch (type) {
    case 'kick': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(1, now + 0.4);
      gain.gain.setValueAtTime(1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now); osc.stop(now + 0.4);
      break;
    }
    case 'snare': {
      const bufSize = ctx.sampleRate * 0.15;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      noise.connect(gain); gain.connect(ctx.destination);
      noise.start(now);

      const osc = ctx.createOscillator();
      const ogain = ctx.createGain();
      osc.frequency.value = freq;
      ogain.gain.setValueAtTime(0.7, now);
      ogain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(ogain); ogain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
      break;
    }
    case 'hihat': {
      const bufSize = ctx.sampleRate * 0.05;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(now);
      break;
    }
    case 'openhat': {
      const bufSize = ctx.sampleRate * 0.3;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
      noise.start(now);
      break;
    }
    case 'clap': {
      [0, 0.01, 0.02].forEach(offset => {
        const bufSize = ctx.sampleRate * 0.1;
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
        noise.connect(gain); gain.connect(ctx.destination);
        noise.start(now + offset);
      });
      break;
    }
    case 'tom':
    case 'rim': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.2);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.2);
      break;
    }
  }
}

// ── UI building ───────────────────────────────────────────────────────────────

const grid = document.getElementById('grid');

TRACKS.forEach((track, t) => {
  const row = document.createElement('div');
  row.className = 'track';

  const label = document.createElement('div');
  label.className = 'track-label';
  label.textContent = track.name;
  row.appendChild(label);

  for (let s = 0; s < STEPS; s++) {
    const pad = document.createElement('button');
    pad.className = 'pad';
    pad.dataset.track = t;
    pad.dataset.step = s;
    pad.addEventListener('click', () => {
      state[t][s] = !state[t][s];
      pad.classList.toggle('active', state[t][s]);
    });
    row.appendChild(pad);
  }

  grid.appendChild(row);
});

// ── Sequencer ─────────────────────────────────────────────────────────────────

function getPads(step) {
  return document.querySelectorAll(`.pad[data-step="${step}"`);
}

function tick() {
  // Remove highlight from previous step
  const prev = (currentStep - 1 + STEPS) % STEPS;
  getPads(prev).forEach(pad => pad.classList.remove('playing'));

  // Highlight current step & play active pads
  getPads(currentStep).forEach((pad, t) => {
    pad.classList.add('playing');
    if (state[t][currentStep]) {
      playSound(TRACKS[t].type, TRACKS[t].freq);
    }
  });

  currentStep = (currentStep + 1) % STEPS;
}

function getBPM() {
  return parseInt(document.getElementById('bpmSlider').value, 10);
}

function startStop() {
  if (ctx.state === 'suspended') ctx.resume();

  playing = !playing;
  const btn = document.getElementById('playBtn');

  if (playing) {
    btn.textContent = 'Stop';
    currentStep = 0;
    intervalId = setInterval(tick, (60 / getBPM() / 4) * 1000); // 16th notes
  } else {
    btn.textContent = 'Play';
    clearInterval(intervalId);
    // Clean up highlights
    document.querySelectorAll('.pad.playing').forEach(p => p.classList.remove('playing'));
    currentStep = 0;
  }
}

// ── Controls ──────────────────────────────────────────────────────────────────

document.getElementById('playBtn').addEventListener('click', startStop);

document.getElementById('bpmSlider').addEventListener('input', () => {
  const bpm = getBPM();
  document.getElementById('bpmDisplay').textContent = bpm;
  if (playing) {
    clearInterval(intervalId);
    intervalId = setInterval(tick, (60 / bpm / 4) * 1000);
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  TRACKS.forEach((_, t) => state[t].fill(false));
  document.querySelectorAll('.pad').forEach(p => p.classList.remove('active'));
});
