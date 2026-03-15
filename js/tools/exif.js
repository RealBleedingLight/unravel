// === EXIF / METADATA VIEWER ===
function renderExif(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title"><span class="title-accent">◉</span> EXIF / Metadata</h1>
      <p class="page-subtitle">Extract EXIF, GPS, IPTC and raw file metadata from images</p>
    </div>
    <div class="drop-zone" id="exif-drop">
      <div class="drop-zone-text">
        <strong>Drop an image for metadata extraction</strong>
        JPEG/TIFF recommended for full EXIF data
      </div>
      <input type="file" id="exif-input" accept="image/*" style="display:none">
    </div>
    <div id="exif-workspace" class="hidden">
      <div class="two-col">
        <div class="panel">
          <div class="panel-header"><span class="panel-title">File Info</span></div>
          <div id="exif-file-info"></div>
        </div>
        <div class="panel">
          <div class="panel-header"><span class="panel-title">Image Preview</span></div>
          <div class="canvas-wrap"><img id="exif-preview" style="max-width:100%;max-height:300px"></div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">EXIF Data</span>
          <button class="btn btn-small" id="exif-copy-all">Copy All</button>
        </div>
        <div id="exif-data"></div>
      </div>
      <div class="panel">
        <div class="panel-header"><span class="panel-title">Raw Hex Header (first 512 bytes)</span></div>
        <div class="output-box" id="exif-hex" style="font-size:0.72rem;max-height:200px;overflow:auto"></div>
      </div>
    </div>
  `;

  const drop = container.querySelector('#exif-drop');
  const input = container.querySelector('#exif-input');
  drop.addEventListener('click', () => input.click());
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('dragover'));
  drop.addEventListener('drop', e => { e.preventDefault(); drop.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  input.addEventListener('change', e => { if (e.target.files[0]) loadFile(e.target.files[0]); });

  function loadFile(file) {
    // Preview
    const url = URL.createObjectURL(file);
    container.querySelector('#exif-preview').src = url;

    // File info
    container.querySelector('#exif-file-info').innerHTML = `
      <div class="control-row"><span class="control-label">Name</span><span class="text-accent">${file.name}</span></div>
      <div class="control-row"><span class="control-label">Type</span><span>${file.type || 'unknown'}</span></div>
      <div class="control-row"><span class="control-label">Size</span><span>${(file.size / 1024).toFixed(2)} KB (${file.size} bytes)</span></div>
      <div class="control-row"><span class="control-label">Modified</span><span>${new Date(file.lastModified).toLocaleString()}</span></div>
    `;

    // Read raw bytes for EXIF
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const bytes = new Uint8Array(buffer);
      parseExif(bytes);
      showHexDump(bytes);
    };
    reader.readAsArrayBuffer(file);

    drop.classList.add('hidden');
    container.querySelector('#exif-workspace').classList.remove('hidden');
  }

  function parseExif(bytes) {
    const results = [];

    // Check for JPEG
    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      results.push({ tag: 'Format', value: 'JPEG' });

      // Find APP1 (EXIF) marker
      let offset = 2;
      while (offset < bytes.length - 1) {
        if (bytes[offset] !== 0xFF) break;
        const marker = bytes[offset + 1];
        const size = (bytes[offset + 2] << 8) | bytes[offset + 3];

        if (marker === 0xE1) { // APP1 - EXIF
          const exifHeader = String.fromCharCode(...bytes.slice(offset + 4, offset + 8));
          if (exifHeader === 'Exif') {
            parseExifIFD(bytes, offset + 10, results);
          }
        } else if (marker === 0xFE) { // Comment
          const comment = String.fromCharCode(...bytes.slice(offset + 4, offset + 2 + size));
          results.push({ tag: 'JPEG Comment', value: comment });
        }

        offset += 2 + size;
      }
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      results.push({ tag: 'Format', value: 'PNG' });
      parsePNGChunks(bytes, results);
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
      results.push({ tag: 'Format', value: 'GIF' });
    } else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
      results.push({ tag: 'Format', value: 'BMP' });
    } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
      results.push({ tag: 'Format', value: 'WEBP/RIFF' });
    }

    // Search for any embedded text/URLs
    const textResults = findEmbeddedStrings(bytes);
    if (textResults.length > 0) {
      results.push({ tag: '--- Hidden Strings ---', value: '' });
      textResults.forEach(s => results.push({ tag: `@0x${s.offset.toString(16)}`, value: s.str }));
    }

    displayResults(results);
  }

  function parseExifIFD(bytes, tiffStart, results) {
    // Determine byte order
    const bigEndian = bytes[tiffStart] === 0x4D; // MM
    results.push({ tag: 'Byte Order', value: bigEndian ? 'Big Endian (Motorola)' : 'Little Endian (Intel)' });

    const read16 = (off) => bigEndian ?
      (bytes[tiffStart + off] << 8) | bytes[tiffStart + off + 1] :
      bytes[tiffStart + off] | (bytes[tiffStart + off + 1] << 8);
    const read32 = (off) => bigEndian ?
      (bytes[tiffStart+off]<<24)|(bytes[tiffStart+off+1]<<16)|(bytes[tiffStart+off+2]<<8)|bytes[tiffStart+off+3] :
      bytes[tiffStart+off]|(bytes[tiffStart+off+1]<<8)|(bytes[tiffStart+off+2]<<16)|(bytes[tiffStart+off+3]<<24);

    const ifdOffset = read32(4);
    const numEntries = read16(ifdOffset);

    const tagNames = {
      0x010F: 'Make', 0x0110: 'Model', 0x0112: 'Orientation',
      0x011A: 'XResolution', 0x011B: 'YResolution', 0x0128: 'ResolutionUnit',
      0x0131: 'Software', 0x0132: 'DateTime', 0x013B: 'Artist',
      0x8769: 'ExifIFD', 0x8825: 'GPSIFD',
      0xA000: 'FlashpixVersion', 0xA001: 'ColorSpace',
      0x9000: 'ExifVersion', 0x9003: 'DateTimeOriginal',
      0x9004: 'DateTimeDigitized', 0x920A: 'FocalLength',
      0x829A: 'ExposureTime', 0x829D: 'FNumber',
      0x8827: 'ISO', 0xA420: 'ImageUniqueID',
      0x0100: 'ImageWidth', 0x0101: 'ImageHeight',
      0x010E: 'ImageDescription', 0x8298: 'Copyright'
    };

    for (let i = 0; i < numEntries && i < 100; i++) {
      const entryOff = ifdOffset + 2 + i * 12;
      const tag = read16(entryOff);
      const type = read16(entryOff + 2);
      const count = read32(entryOff + 4);
      const valueOff = entryOff + 8;

      const tagName = tagNames[tag] || `Tag 0x${tag.toString(16).padStart(4,'0')}`;
      let value = '';

      if (type === 2) { // ASCII
        const strOff = count > 4 ? read32(valueOff) : valueOff;
        const strBytes = bytes.slice(tiffStart + strOff, tiffStart + strOff + count - 1);
        value = String.fromCharCode(...strBytes);
      } else if (type === 3) { // SHORT
        value = read16(valueOff).toString();
      } else if (type === 4) { // LONG
        value = read32(valueOff).toString();
      } else if (type === 5) { // RATIONAL
        const ratOff = read32(valueOff);
        const num = read32(ratOff);
        const den = read32(ratOff + 4);
        value = den ? `${num}/${den} (${(num/den).toFixed(4)})` : num.toString();
      } else {
        value = `[type=${type}, count=${count}]`;
      }

      results.push({ tag: tagName, value });
    }
  }

  function parsePNGChunks(bytes, results) {
    let offset = 8; // Skip PNG signature
    while (offset < bytes.length) {
      const len = (bytes[offset]<<24)|(bytes[offset+1]<<16)|(bytes[offset+2]<<8)|bytes[offset+3];
      const type = String.fromCharCode(...bytes.slice(offset+4, offset+8));
      results.push({ tag: `Chunk: ${type}`, value: `${len} bytes` });

      if (type === 'tEXt' || type === 'iTXt') {
        const chunkData = bytes.slice(offset+8, offset+8+len);
        const text = String.fromCharCode(...chunkData);
        results.push({ tag: `  ${type} content`, value: text });
      } else if (type === 'IHDR') {
        const w = (bytes[offset+8]<<24)|(bytes[offset+9]<<16)|(bytes[offset+10]<<8)|bytes[offset+11];
        const h = (bytes[offset+12]<<24)|(bytes[offset+13]<<16)|(bytes[offset+14]<<8)|bytes[offset+15];
        const depth = bytes[offset+16];
        const colorType = bytes[offset+17];
        results.push({ tag: '  Dimensions', value: `${w} × ${h}` });
        results.push({ tag: '  Bit Depth', value: depth.toString() });
        results.push({ tag: '  Color Type', value: ['Grayscale','','RGB','Indexed','Grayscale+Alpha','','RGBA'][colorType] || colorType });
      }

      offset += 12 + len; // 4 len + 4 type + data + 4 CRC
      if (type === 'IEND') break;
    }
  }

  function findEmbeddedStrings(bytes) {
    const results = [];
    let current = '';
    let start = 0;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] >= 32 && bytes[i] <= 126) {
        if (!current) start = i;
        current += String.fromCharCode(bytes[i]);
      } else {
        if (current.length >= 8 && /[a-zA-Z]/.test(current)) {
          // Filter out noise — only keep strings with letters and interesting content
          if (/[a-z]{3,}/i.test(current) || current.includes('http') || current.includes('://')) {
            results.push({ offset: start, str: current });
          }
        }
        current = '';
      }
    }
    return results.slice(0, 50);
  }

  function displayResults(results) {
    const el = container.querySelector('#exif-data');
    el.innerHTML = results.map(r => `
      <div class="control-row" style="border-bottom:1px solid var(--border);padding:6px 0">
        <span class="control-label" style="min-width:160px;color:var(--text-secondary)">${r.tag}</span>
        <span class="font-mono" style="word-break:break-all">${r.value}</span>
      </div>
    `).join('');

    container.querySelector('#exif-copy-all').addEventListener('click', () => {
      const text = results.map(r => `${r.tag}: ${r.value}`).join('\n');
      navigator.clipboard.writeText(text);
    });
  }

  function showHexDump(bytes) {
    let hex = '';
    const limit = Math.min(bytes.length, 512);
    for (let i = 0; i < limit; i += 16) {
      const hexPart = Array.from(bytes.slice(i, i+16)).map(b => b.toString(16).padStart(2,'0')).join(' ');
      const asciiPart = Array.from(bytes.slice(i, i+16)).map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');
      hex += `${i.toString(16).padStart(8,'0')}  ${hexPart.padEnd(48)}  ${asciiPart}\n`;
    }
    container.querySelector('#exif-hex').textContent = hex;
  }
}

Router.register('/toolkit/exif', 'exif', renderExif);
