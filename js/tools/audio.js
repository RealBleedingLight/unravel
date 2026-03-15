// === AUDIO ANALYZER ===
function renderAudio(container) {
  let audioCtx, audioBuffer, sourceNode;
  let isPlaying = false;

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◠</span> Audio Analyzer</h1>
      <p class="page-subtitle">Waveform, spectrogram, reverse, speed control, frequency analysis</p>
    </div>
    <div class="drop-zone" id="audio-drop">
      <div class="drop-zone-text">
        <strong>Drop an audio file here</strong>
        MP3, WAV, OGG, FLAC, M4A
      </div>
      <input type="file" id="audio-input" accept="audio/*" style="display:none">
    </div>
    <div id="audio-workspace" class="hidden">
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Playback</span>
          <span class="text-sm text-muted" id="audio-info"></span>
        </div>
        <div class="audio-controls">
          <button class="btn" id="audio-play">▶ Play</button>
          <button class="btn" id="audio-stop">■ Stop</button>
          <span class="control-label">Speed</span>
          <input type="range" id="audio-speed" min="0.1" max="3" step="0.1" value="1" style="max-width:150px">
          <span class="range-value" id="audio-speed-val">1.0×</span>
          <button class="btn" id="audio-reverse">⇄ Reverse</button>
          <button class="btn btn-accent" id="audio-download">↓ Export WAV</button>
        </div>
        <div class="control-row mt-8">
          <span class="control-label">Trim Start</span>
          <input type="range" id="audio-trim-start" min="0" max="100" value="0" style="flex:1">
          <span class="range-value" id="trim-start-val">0.0s</span>
          <span class="control-label">Trim End</span>
          <input type="range" id="audio-trim-end" min="0" max="100" value="100" style="flex:1">
          <span class="range-value" id="trim-end-val">--</span>
        </div>
      </div>

      <div class="two-col">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Waveform</span></div>
          <div class="waveform-container"><canvas id="waveform-canvas"></canvas></div>
        </div>
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Spectrogram</span></div>
          <div class="spectrogram-container"><canvas id="spectrogram-canvas"></canvas></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header"><span class="panel-title">Frequency Spectrum</span></div>
        <div class="waveform-container" style="height:150px"><canvas id="frequency-canvas"></canvas></div>
      </div>

      <div class="panel">
        <div class="panel-header"><span class="panel-title">Raw Data</span></div>
        <div class="control-row">
          <button class="btn btn-small" id="audio-show-samples">Show Samples (first 500)</button>
          <button class="btn btn-small" id="audio-detect-tones">Detect Tones (DTMF)</button>
        </div>
        <div class="output-box mt-8" id="audio-raw" style="max-height:200px;overflow:auto"></div>
      </div>
    </div>
  `;

  const drop = container.querySelector('#audio-drop');
  const input = container.querySelector('#audio-input');
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); loadAudio(e.dataTransfer.files[0]); });
  input.addEventListener('change', e => { if (e.target.files[0]) loadAudio(e.target.files[0]); });

  function loadAudio(file) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const reader = new FileReader();
    reader.onload = (e) => {
      audioCtx.decodeAudioData(e.target.result, (buffer) => {
        audioBuffer = buffer;
        drop.classList.add('hidden');
        container.querySelector('#audio-workspace').classList.remove('hidden');
        container.querySelector('#audio-info').textContent =
          `${buffer.numberOfChannels}ch | ${buffer.sampleRate}Hz | ${buffer.duration.toFixed(2)}s`;

        const trimEnd = container.querySelector('#audio-trim-end');
        trimEnd.max = 100;
        container.querySelector('#trim-end-val').textContent = buffer.duration.toFixed(1) + 's';

        drawWaveform();
        drawSpectrogram();
        drawFrequency();
      });
    };
    reader.readAsArrayBuffer(file);
  }

  function drawWaveform() {
    const canvas = container.querySelector('#waveform-canvas');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const mid = canvas.height / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = '#1c1f2e';
    ctx.lineWidth = 1;
    for (let y = 0; y < canvas.height; y += 30) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Waveform
    ctx.beginPath();
    ctx.strokeStyle = '#00d4aa';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i++) {
      let min = 1, max = -1;
      for (let j = 0; j < step; j++) {
        const val = data[i * step + j] || 0;
        if (val < min) min = val;
        if (val > max) max = val;
      }
      const y1 = mid + min * mid;
      const y2 = mid + max * mid;
      ctx.moveTo(i, y1);
      ctx.lineTo(i, y2);
    }
    ctx.stroke();

    // Center line
    ctx.strokeStyle = '#2a2f47';
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(canvas.width, mid); ctx.stroke();
  }

  function drawSpectrogram() {
    const canvas = container.querySelector('#spectrogram-canvas');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);

    const fftSize = 1024;
    const hopSize = Math.floor(data.length / canvas.width);
    const freqBins = fftSize / 2;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple DFT-based spectrogram (approximate)
    for (let x = 0; x < canvas.width; x++) {
      const start = x * hopSize;
      const magnitudes = [];

      // Compute magnitudes using a simplified approach
      for (let k = 0; k < Math.min(freqBins, canvas.height); k++) {
        let real = 0, imag = 0;
        const freq = k * 8; // Skip some bins for speed
        for (let n = 0; n < Math.min(fftSize, data.length - start); n++) {
          const angle = -2 * Math.PI * freq * n / fftSize;
          real += (data[start + n] || 0) * Math.cos(angle);
          imag += (data[start + n] || 0) * Math.sin(angle);
        }
        magnitudes.push(Math.sqrt(real * real + imag * imag));
      }

      const maxMag = Math.max(...magnitudes, 0.001);
      for (let y = 0; y < magnitudes.length && y < canvas.height; y++) {
        const intensity = Math.min(1, magnitudes[y] / maxMag * 3);
        const r = Math.floor(intensity * 255);
        const g = Math.floor(intensity * 100);
        const b = Math.floor((1 - intensity) * 100 + intensity * 50);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, canvas.height - y - 1, 1, 1);
      }
    }
  }

  function drawFrequency() {
    const canvas = container.querySelector('#frequency-canvas');
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext('2d');
    const data = audioBuffer.getChannelData(0);

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Compute frequency spectrum of entire signal
    const fftSize = 2048;
    const magnitudes = [];
    for (let k = 0; k < fftSize / 2; k++) {
      let real = 0, imag = 0;
      for (let n = 0; n < Math.min(fftSize, data.length); n++) {
        const angle = -2 * Math.PI * k * n / fftSize;
        real += data[n] * Math.cos(angle);
        imag += data[n] * Math.sin(angle);
      }
      magnitudes.push(Math.sqrt(real * real + imag * imag));
    }

    const maxMag = Math.max(...magnitudes, 0.001);
    const barWidth = canvas.width / magnitudes.length;

    ctx.beginPath();
    ctx.strokeStyle = '#7c6aff';
    ctx.lineWidth = 1;
    for (let i = 0; i < magnitudes.length; i++) {
      const x = i * barWidth;
      const h = (magnitudes[i] / maxMag) * canvas.height * 0.9;
      ctx.moveTo(x, canvas.height);
      ctx.lineTo(x, canvas.height - h);
    }
    ctx.stroke();
  }

  // Playback controls
  container.querySelector('#audio-play').addEventListener('click', () => {
    if (!audioBuffer || isPlaying) return;
    const speed = parseFloat(container.querySelector('#audio-speed').value);
    const trimStart = parseFloat(container.querySelector('#audio-trim-start').value) / 100 * audioBuffer.duration;
    const trimEnd = parseFloat(container.querySelector('#audio-trim-end').value) / 100 * audioBuffer.duration;

    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.playbackRate.value = speed;
    sourceNode.connect(audioCtx.destination);
    sourceNode.start(0, trimStart, trimEnd - trimStart);
    isPlaying = true;
    sourceNode.onended = () => { isPlaying = false; };
  });

  container.querySelector('#audio-stop').addEventListener('click', () => {
    if (sourceNode && isPlaying) {
      sourceNode.stop();
      isPlaying = false;
    }
  });

  container.querySelector('#audio-speed').addEventListener('input', (e) => {
    container.querySelector('#audio-speed-val').textContent = parseFloat(e.target.value).toFixed(1) + '×';
    if (sourceNode && isPlaying) sourceNode.playbackRate.value = parseFloat(e.target.value);
  });

  container.querySelector('#audio-trim-start').addEventListener('input', (e) => {
    if (!audioBuffer) return;
    container.querySelector('#trim-start-val').textContent = (parseFloat(e.target.value) / 100 * audioBuffer.duration).toFixed(1) + 's';
  });

  container.querySelector('#audio-trim-end').addEventListener('input', (e) => {
    if (!audioBuffer) return;
    container.querySelector('#trim-end-val').textContent = (parseFloat(e.target.value) / 100 * audioBuffer.duration).toFixed(1) + 's';
  });

  container.querySelector('#audio-reverse').addEventListener('click', () => {
    if (!audioBuffer) return;
    const reversed = audioCtx.createBuffer(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
    for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
      const src = audioBuffer.getChannelData(ch);
      const dst = reversed.getChannelData(ch);
      for (let i = 0; i < src.length; i++) dst[i] = src[src.length - 1 - i];
    }
    audioBuffer = reversed;
    drawWaveform();
    drawSpectrogram();
    drawFrequency();
  });

  container.querySelector('#audio-download').addEventListener('click', () => {
    if (!audioBuffer) return;
    const trimStart = Math.floor(parseFloat(container.querySelector('#audio-trim-start').value) / 100 * audioBuffer.length);
    const trimEnd = Math.floor(parseFloat(container.querySelector('#audio-trim-end').value) / 100 * audioBuffer.length);
    const length = trimEnd - trimStart;

    const wav = createWAV(audioBuffer, trimStart, length);
    const blob = new Blob([wav], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'processed.wav'; a.click();
  });

  function createWAV(buffer, start, length) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bytesPerSample = 2;
    const dataLength = length * numChannels * bytesPerSample;
    const headerLength = 44;
    const arrayBuffer = new ArrayBuffer(headerLength + dataLength);
    const view = new DataView(arrayBuffer);

    const writeString = (offset, str) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);

    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[start + i] || 0));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    return arrayBuffer;
  }

  container.querySelector('#audio-show-samples').addEventListener('click', () => {
    if (!audioBuffer) return;
    const data = audioBuffer.getChannelData(0);
    let text = `Sample Rate: ${audioBuffer.sampleRate}Hz\nChannels: ${audioBuffer.numberOfChannels}\nSamples: ${data.length}\n\n`;
    for (let i = 0; i < Math.min(500, data.length); i++) {
      text += `[${i}] ${data[i].toFixed(6)}\n`;
    }
    container.querySelector('#audio-raw').textContent = text;
  });

  container.querySelector('#audio-detect-tones').addEventListener('click', () => {
    if (!audioBuffer) return;
    const data = audioBuffer.getChannelData(0);
    const sr = audioBuffer.sampleRate;
    const dtmfFreqs = {
      '697': 'Row 1', '770': 'Row 2', '852': 'Row 3', '941': 'Row 4',
      '1209': 'Col 1', '1336': 'Col 2', '1477': 'Col 3', '1633': 'Col 4'
    };
    const dtmfMap = {
      '697,1209': '1', '697,1336': '2', '697,1477': '3', '697,1633': 'A',
      '770,1209': '4', '770,1336': '5', '770,1477': '6', '770,1633': 'B',
      '852,1209': '7', '852,1336': '8', '852,1477': '9', '852,1633': 'C',
      '941,1209': '*', '941,1336': '0', '941,1477': '#', '941,1633': 'D'
    };

    // Goertzel algorithm for DTMF detection
    const windowSize = Math.floor(sr * 0.04); // 40ms windows
    const detected = [];

    for (let pos = 0; pos + windowSize < data.length; pos += windowSize) {
      const freqResults = {};
      Object.keys(dtmfFreqs).forEach(freq => {
        const f = parseInt(freq);
        const k = 0.5 + (windowSize * f) / sr;
        const w = 2 * Math.PI * k / windowSize;
        const coeff = 2 * Math.cos(w);
        let s0 = 0, s1 = 0, s2 = 0;
        for (let i = 0; i < windowSize; i++) {
          s0 = data[pos + i] + coeff * s1 - s2;
          s2 = s1; s1 = s0;
        }
        freqResults[freq] = s0 * s0 + s1 * s1 - coeff * s0 * s1;
      });

      const threshold = 100;
      const activeFreqs = Object.entries(freqResults)
        .filter(([, mag]) => mag > threshold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([f]) => f);

      if (activeFreqs.length === 2) {
        activeFreqs.sort((a, b) => parseInt(a) - parseInt(b));
        const key = activeFreqs.join(',');
        if (dtmfMap[key]) {
          const time = (pos / sr).toFixed(3);
          detected.push(`${time}s: ${dtmfMap[key]} (${activeFreqs.join('Hz + ')}Hz)`);
        }
      }
    }

    container.querySelector('#audio-raw').textContent =
      detected.length ? `DTMF Tones Detected:\n${detected.join('\n')}` : 'No DTMF tones detected';
  });
}

Router.register('/toolkit/audio', 'audio', renderAudio);
