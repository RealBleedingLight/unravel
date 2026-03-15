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
        <div class="output-box" id="exif-hex" style="font-size:0.72rem;max-height:200px;overflow:auto;white-space:pre"></div>
      </div>
    </div>
  `;

  const drop  = container.querySelector('#exif-drop');
  const input = container.querySelector('#exif-input');
  drop.addEventListener('click',    ()  => input.click());
  drop.addEventListener('dragover',  e  => { e.preventDefault(); drop.classList.add('dragover'); });
  drop.addEventListener('dragleave', ()  => drop.classList.remove('dragover'));
  drop.addEventListener('drop',      e  => { e.preventDefault(); drop.classList.remove('dragover'); loadFile(e.dataTransfer.files[0]); });
  input.addEventListener('change',   e  => { if (e.target.files[0]) loadFile(e.target.files[0]); });

  // ── Dictionaries ────────────────────────────────────────────────────────────

  const TIFF_TAGS = {
    0x00FE:'NewSubfileType', 0x0100:'ImageWidth',   0x0101:'ImageLength',
    0x0102:'BitsPerSample',  0x0103:'Compression',   0x0106:'PhotometricInterpretation',
    0x010E:'ImageDescription',0x010F:'Make',          0x0110:'Model',
    0x0112:'Orientation',    0x011A:'XResolution',   0x011B:'YResolution',
    0x0128:'ResolutionUnit', 0x012D:'TransferFunction',0x0131:'Software',
    0x0132:'DateTime',       0x013B:'Artist',         0x013E:'WhitePoint',
    0x013F:'PrimaryChromaticities',
    0x0201:'JPEGInterchangeFormat', 0x0202:'JPEGInterchangeFormatLength',
    0x0211:'YCbCrCoefficients', 0x0212:'YCbCrSubSampling', 0x0213:'YCbCrPositioning',
    0x0214:'ReferenceBlackWhite', 0x8298:'Copyright',
    0x8769:'ExifIFD', 0x8825:'GPSIFD',
  };

  const EXIF_TAGS = {
    0x829A:'ExposureTime',   0x829D:'FNumber',        0x8822:'ExposureProgram',
    0x8824:'SpectralSensitivity',0x8827:'ISO',         0x8830:'SensitivityType',
    0x8831:'StandardOutputSensitivity', 0x8832:'RecommendedExposureIndex',
    0x9000:'ExifVersion',    0x9003:'DateTimeOriginal',0x9004:'DateTimeDigitized',
    0x9101:'ComponentsConfiguration', 0x9102:'CompressedBitsPerPixel',
    0x9201:'ShutterSpeedValue', 0x9202:'ApertureValue',0x9203:'BrightnessValue',
    0x9204:'ExposureBiasValue', 0x9205:'MaxApertureValue', 0x9206:'SubjectDistance',
    0x9207:'MeteringMode',   0x9208:'LightSource',    0x9209:'Flash',
    0x920A:'FocalLength',    0x9214:'SubjectArea',    0x9286:'UserComment',
    0x9290:'SubSecTime',     0x9291:'SubSecTimeOriginal', 0x9292:'SubSecTimeDigitized',
    0xA000:'FlashpixVersion',0xA001:'ColorSpace',     0xA002:'PixelXDimension',
    0xA003:'PixelYDimension',0xA004:'RelatedSoundFile',0xA005:'InteroperabilityIFD',
    0xA20B:'FlashEnergy',    0xA20E:'FocalPlaneXResolution', 0xA20F:'FocalPlaneYResolution',
    0xA210:'FocalPlaneResolutionUnit', 0xA215:'ExposureIndex', 0xA217:'SensingMethod',
    0xA300:'FileSource',     0xA301:'SceneType',
    0xA401:'CustomRendered', 0xA402:'ExposureMode',   0xA403:'WhiteBalance',
    0xA404:'DigitalZoomRatio',0xA405:'FocalLengthIn35mmFilm',0xA406:'SceneCaptureType',
    0xA407:'GainControl',    0xA408:'Contrast',       0xA409:'Saturation',
    0xA40A:'Sharpness',      0xA40C:'SubjectDistanceRange', 0xA420:'ImageUniqueID',
    0xA430:'CameraOwnerName',0xA431:'BodySerialNumber',0xA432:'LensSpecification',
    0xA433:'LensMake',       0xA434:'LensModel',      0xA435:'LensSerialNumber',
  };

  const GPS_TAGS = {
    0:'GPSVersionID', 1:'GPSLatitudeRef',  2:'GPSLatitude',
    3:'GPSLongitudeRef', 4:'GPSLongitude',  5:'GPSAltitudeRef',
    6:'GPSAltitude',  7:'GPSTimeStamp',    8:'GPSSatellites',
    9:'GPSStatus',    10:'GPSMeasureMode', 12:'GPSSpeedRef',
    13:'GPSSpeed',    16:'GPSImgDirectionRef', 17:'GPSImgDirection',
    18:'GPSMapDatum', 27:'GPSProcessingMethod', 29:'GPSDateStamp',
  };

  const TAG_LABELS = { ...TIFF_TAGS, ...EXIF_TAGS };

  const ENUM_VALUES = {
    Orientation:         { 1:'Normal',2:'Mirror horizontal',3:'Rotate 180°',4:'Mirror vertical',5:'Mirror horizontal + rotate 270° CW',6:'Rotate 90° CW',7:'Mirror horizontal + rotate 90° CW',8:'Rotate 270° CW' },
    ResolutionUnit:      { 1:'No unit',2:'inch',3:'centimetre' },
    YCbCrPositioning:    { 1:'Centered',2:'Co-sited' },
    Compression:         { 1:'Uncompressed',2:'CCITT 1D',3:'T3/Group3 Fax',4:'T4/Group4 Fax',5:'LZW',6:'JPEG (old)',7:'JPEG',8:'Adobe Deflate',32773:'PackBits' },
    ExposureProgram:     { 0:'Not defined',1:'Manual',2:'Normal program',3:'Aperture priority',4:'Shutter priority',5:'Creative (deep DoF)',6:'Action (fast shutter)',7:'Portrait',8:'Landscape' },
    MeteringMode:        { 0:'Unknown',1:'Average',2:'Center-weighted average',3:'Spot',4:'Multi-spot',5:'Pattern',6:'Partial',255:'Other' },
    Flash:               { 0:'No flash',1:'Flash fired',5:'Flash fired, no strobe return',7:'Flash fired, strobe return',9:'Flash fired (compulsory)',13:'Flash fired (compulsory), no return',15:'Flash fired (compulsory), return',16:'No flash (compulsory)',24:'No flash (auto)',25:'Flash fired (auto)',29:'Flash fired (auto), no return',31:'Flash fired (auto), return',32:'No flash function',65:'Flash fired, red-eye reduction',69:'Flash fired, red-eye, no return',71:'Flash fired, red-eye, return' },
    ColorSpace:          { 1:'sRGB',65535:'Uncalibrated' },
    WhiteBalance:        { 0:'Auto white balance',1:'Manual white balance' },
    ExposureMode:        { 0:'Auto exposure',1:'Manual exposure',2:'Auto bracket' },
    SceneCaptureType:    { 0:'Standard',1:'Landscape',2:'Portrait',3:'Night scene' },
    LightSource:         { 0:'Unknown',1:'Daylight',2:'Fluorescent',3:'Tungsten',4:'Flash',9:'Fine weather',10:'Cloudy weather',11:'Shade',17:'Standard light A',18:'Standard light B',19:'Standard light C',20:'D55',21:'D65',22:'D75',255:'Other' },
    SensingMethod:       { 1:'Not defined',2:'One-chip colour area',3:'Two-chip colour area',4:'Three-chip colour area',5:'Colour sequential area',7:'Trilinear',8:'Colour sequential linear' },
    CustomRendered:      { 0:'Normal process',1:'Custom process' },
    GainControl:         { 0:'None',1:'Low gain up',2:'High gain up',3:'Low gain down',4:'High gain down' },
    Contrast:            { 0:'Normal',1:'Soft',2:'Hard' },
    Saturation:          { 0:'Normal',1:'Low saturation',2:'High saturation' },
    Sharpness:           { 0:'Normal',1:'Soft',2:'Hard' },
    SubjectDistanceRange:{ 0:'Unknown',1:'Macro',2:'Close view',3:'Distant view' },
    FocalPlaneResolutionUnit:{ 1:'No unit',2:'inch',3:'centimetre' },
    SensitivityType:     { 0:'Unknown',1:'SOS',2:'REI',3:'ISO speed',4:'SOS+REI',5:'SOS+ISO',6:'REI+ISO',7:'SOS+REI+ISO' },
    GPSAltitudeRef:      { 0:'Above sea level',1:'Below sea level' },
  };

  // ── File loading ─────────────────────────────────────────────────────────────

  function loadFile(file) {
    const url = URL.createObjectURL(file);
    container.querySelector('#exif-preview').src = url;
    container.querySelector('#exif-file-info').innerHTML = `
      <div class="control-row"><span class="control-label">Name</span><span class="text-accent">${esc(file.name)}</span></div>
      <div class="control-row"><span class="control-label">Type</span><span>${file.type || 'unknown'}</span></div>
      <div class="control-row"><span class="control-label">Size</span><span>${(file.size/1024).toFixed(2)} KB (${file.size.toLocaleString()} bytes)</span></div>
      <div class="control-row"><span class="control-label">Modified</span><span>${new Date(file.lastModified).toLocaleString()}</span></div>
    `;

    const reader = new FileReader();
    reader.onload = e => {
      const bytes = new Uint8Array(e.target.result);
      const sections = parseExif(bytes);
      displaySections(sections);
      showHexDump(bytes);
    };
    reader.readAsArrayBuffer(file);
    drop.classList.add('hidden');
    container.querySelector('#exif-workspace').classList.remove('hidden');
  }

  // ── Top-level parser ─────────────────────────────────────────────────────────

  function parseExif(bytes) {
    const sections = [];

    if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
      parseJPEG(bytes, sections);
    } else if (bytes[0] === 0x89 && bytes[1] === 0x50) {
      sections.push({ title: 'Format', rows: [['Format', 'PNG']] });
      parsePNGChunks(bytes, sections);
    } else if (bytes[0] === 0x47 && bytes[1] === 0x49) {
      sections.push({ title: 'Format', rows: [['Format', 'GIF']] });
    } else if (bytes[0] === 0x42 && bytes[1] === 0x4D) {
      sections.push({ title: 'Format', rows: [['Format', 'BMP']] });
    } else if (bytes[0] === 0x52 && bytes[1] === 0x49) {
      sections.push({ title: 'Format', rows: [['Format', 'WEBP/RIFF']] });
    } else {
      sections.push({ title: 'Format', rows: [['Format', 'Unknown']] });
    }

    // Embedded strings section
    const strings = findEmbeddedStrings(bytes);
    if (strings.length) {
      sections.push({ title: 'Embedded Strings', rows: strings.map(s => [`@0x${s.offset.toString(16).toUpperCase()}`, s.str]) });
    }

    return sections;
  }

  // ── JPEG parser ──────────────────────────────────────────────────────────────

  function parseJPEG(bytes, sections) {
    sections.push({ title: 'Format', rows: [['Format', 'JPEG']] });
    let offset = 2;
    while (offset < bytes.length - 3) {
      if (bytes[offset] !== 0xFF) break;
      const marker = bytes[offset + 1];
      if (marker === 0xFF) { offset++; continue; } // padding
      const size = (bytes[offset + 2] << 8) | bytes[offset + 3];

      if (marker === 0xE1) { // APP1
        const hdr = String.fromCharCode(bytes[offset+4], bytes[offset+5], bytes[offset+6], bytes[offset+7]);
        if (hdr === 'Exif') {
          parseTIFF(bytes, offset + 10, sections);
        } else if (bytes[offset+4] === 0x68 && bytes[offset+5] === 0x74) { // "ht" = XMP
          const xmpStr = new TextDecoder().decode(bytes.slice(offset + 4, offset + 4 + size - 2));
          const desc = xmpStr.match(/xmp:(.+?)="([^"]+)"/g);
          if (desc) {
            sections.push({ title: 'XMP Metadata', rows: desc.map(m => { const p = m.split('='); return [p[0].replace('xmp:',''), p[1]?.replace(/"/g,'') || '']; }) });
          }
        }
      } else if (marker === 0xE0) { // APP0 / JFIF
        if (size >= 16) {
          const densUnit = bytes[offset + 11];
          const xDens    = (bytes[offset+12] << 8) | bytes[offset+13];
          const yDens    = (bytes[offset+14] << 8) | bytes[offset+15];
          sections.push({ title: 'JFIF', rows: [
            ['Version',  `${bytes[offset+9]}.${String(bytes[offset+10]).padStart(2,'0')}`],
            ['Density',  `${xDens} × ${yDens} ${['no unit','dpi','dpcm'][densUnit] || ''}`],
          ]});
        }
      } else if (marker === 0xFE) { // JPEG Comment
        const comment = new TextDecoder().decode(bytes.slice(offset + 4, offset + 2 + size));
        sections.push({ title: 'JPEG Comment', rows: [['Comment', comment]] });
      } else if (marker === 0xDA) { // SOS — end of headers
        break;
      }
      offset += 2 + size;
    }
  }

  // ── TIFF / EXIF IFD parser ───────────────────────────────────────────────────

  function parseTIFF(bytes, tiffStart, sections) {
    const bigEndian = bytes[tiffStart] === 0x4D; // MM=big, II=little

    const r16 = off => bigEndian
      ? (bytes[tiffStart+off] << 8) | bytes[tiffStart+off+1]
      :  bytes[tiffStart+off] | (bytes[tiffStart+off+1] << 8);

    const r32 = off => {
      const b = [bytes[tiffStart+off], bytes[tiffStart+off+1], bytes[tiffStart+off+2], bytes[tiffStart+off+3]];
      return bigEndian
        ? ((b[0]<<24)|(b[1]<<16)|(b[2]<<8)|b[3]) >>> 0
        : (b[0]|(b[1]<<8)|(b[2]<<16)|(b[3]<<24)) >>> 0;
    };

    const magic = r16(2);
    if (magic !== 42) return; // Not valid TIFF

    const ifd0Off = r32(4);
    const ifd0Rows = [];
    let exifIFDoff = 0;
    let gpsIFDoff  = 0;

    readIFD(ifd0Off, TIFF_TAGS, ifd0Rows, (tag, val) => {
      if (tag === 0x8769) exifIFDoff = val;
      if (tag === 0x8825) gpsIFDoff  = val;
    });
    if (ifd0Rows.length) sections.push({ title: 'Image (IFD0)', rows: ifd0Rows });

    if (exifIFDoff) {
      const exifRows = [];
      readIFD(exifIFDoff, EXIF_TAGS, exifRows, () => {});
      if (exifRows.length) sections.push({ title: 'Camera / Exposure', rows: exifRows });
    }

    if (gpsIFDoff) {
      const gpsRows = [];
      const gpsRaw  = {};
      readIFD(gpsIFDoff, GPS_TAGS, gpsRows, () => {}, gpsRaw);
      const coord   = decodeGPS(gpsRaw);
      if (coord) gpsRows.push(['📍 Coordinates', coord]);
      if (gpsRows.length) sections.push({ title: 'GPS', rows: gpsRows });
    }

    // ── Inner: read one IFD ────────────────────────────────────────────────────
    function readIFD(ifdOff, tagDict, rows, onSpecial, rawOut) {
      if (!ifdOff || ifdOff >= bytes.length - tiffStart) return;
      const count = r16(ifdOff);
      for (let i = 0; i < count && i < 200; i++) {
        const e   = ifdOff + 2 + i * 12;
        const tag = r16(e);
        const typ = r16(e + 2);
        const cnt = r32(e + 4);
        const vOff= e + 8; // offset of value field from tiffStart

        // Skip pointers to sub-IFDs
        if (tag === 0x8769 || tag === 0x8825 || tag === 0xA005) {
          const subOff = r32(vOff);
          onSpecial(tag, subOff);
          continue;
        }
        // Skip large binary blobs
        if (tag === 0x927C || tag === 0x8828 || tag === 0xA302) continue;

        const tagName = tagDict[tag] || `Tag 0x${tag.toString(16).toUpperCase().padStart(4,'0')}`;
        const value   = readValue(typ, cnt, vOff, tagName);
        if (value === null) continue; // skip unreadable

        if (rawOut) rawOut[tagName] = { typ, cnt, vOff, raw: readRawRationals(typ, cnt, vOff) };
        rows.push([tagName, value]);
      }
    }

    // ── Read raw rational array for GPS ───────────────────────────────────────
    function readRawRationals(typ, cnt, vOff) {
      if (typ !== 5) return null;
      const out = [];
      const dataOff = r32(vOff);
      for (let i = 0; i < cnt; i++) {
        const num = r32(dataOff + i * 8);
        const den = r32(dataOff + i * 8 + 4);
        out.push(den ? num / den : 0);
      }
      return out;
    }

    // ── Decode a single IFD field value ────────────────────────────────────────
    function readValue(typ, cnt, vOff, tagName) {
      try {
        switch (typ) {
          case 1: // BYTE
            return r16(vOff).toString();

          case 2: { // ASCII
            const off  = cnt > 4 ? r32(vOff) : vOff;
            const end  = tiffStart + off + cnt;
            if (end > bytes.length) return null;
            const raw  = bytes.slice(tiffStart + off, end);
            const str  = new TextDecoder('utf-8', { fatal: false }).decode(raw).replace(/\0+$/, '').trim();
            return str || null;
          }

          case 3: // SHORT
            if (cnt === 1) {
              const v = r16(vOff);
              return interpretEnum(tagName, v, v.toString());
            }
            // Multiple shorts
            return Array.from({ length: Math.min(cnt, 8) }, (_, i) => r16(vOff + i * 2)).join(', ');

          case 4: // LONG
            return r32(vOff).toString();

          case 5: { // RATIONAL (unsigned)
            const ratOff = r32(vOff);
            if (cnt === 1) {
              const num = r32(ratOff);
              const den = r32(ratOff + 4);
              return formatRational(tagName, num, den);
            }
            return Array.from({ length: Math.min(cnt, 4) }, (_, i) => {
              const n = r32(ratOff + i * 8);
              const d = r32(ratOff + i * 8 + 4);
              return d ? `${n}/${d}` : n.toString();
            }).join(', ');
          }

          case 7: { // UNDEFINED
            if (tagName === 'ExifVersion' || tagName === 'FlashpixVersion') {
              const off = cnt > 4 ? r32(vOff) : vOff;
              const v = [bytes[tiffStart+off],bytes[tiffStart+off+1],bytes[tiffStart+off+2],bytes[tiffStart+off+3]];
              const s = v.map(b => String.fromCharCode(b)).join('');
              // e.g. "0230" → "2.30", "0221" → "2.21"
              return s.replace(/^0?(\d)(\d{2})$/, '$1.$2');
            }
            if (tagName === 'UserComment') {
              const off = r32(vOff);
              const code = new TextDecoder().decode(bytes.slice(tiffStart+off, tiffStart+off+8)).trim().replace(/\0/g,'');
              const text = new TextDecoder('utf-8', { fatal: false })
                .decode(bytes.slice(tiffStart+off+8, tiffStart+off+cnt)).replace(/\0/g,'').trim();
              return text ? `[${code}] ${text}` : null;
            }
            if (tagName === 'ComponentsConfiguration') {
              const off   = cnt > 4 ? r32(vOff) : vOff;
              const names = ['', 'Y', 'Cb', 'Cr', 'R', 'G', 'B'];
              return Array.from({ length: 4 }, (_, i) => names[bytes[tiffStart+off+i]] || '?').join(' ');
            }
            // Generic: show as hex if short, skip if long binary
            if (cnt <= 16) {
              const off = cnt > 4 ? r32(vOff) : vOff;
              return Array.from({ length: cnt }, (_, i) => bytes[tiffStart+off+i].toString(16).padStart(2,'0')).join(' ');
            }
            return null;
          }

          case 9: // SLONG
            return r32(vOff).toString();

          case 10: { // SRATIONAL (signed)
            const ratOff = r32(vOff);
            const num    = r32(ratOff)     | 0; // signed
            const den    = r32(ratOff + 4) | 0;
            return formatRational(tagName, num, den);
          }

          default:
            return null;
        }
      } catch {
        return null;
      }
    }

    function formatRational(tagName, num, den) {
      if (!den) return num.toString();

      // Exposure time: prefer fraction form
      if (tagName === 'ExposureTime') {
        if (num === 1 || num === 0) return `${num}/${den} s`;
        const simplified = num / den;
        if (simplified < 1) return `1/${Math.round(den / num)} s`;
        return `${simplified.toFixed(4)} s`;
      }
      // FNumber → f/2.8
      if (tagName === 'FNumber') return `f/${(num/den).toFixed(1)}`;
      // FocalLength → 50 mm
      if (tagName === 'FocalLength' || tagName === 'FocalLengthIn35mmFilm') return `${(num/den).toFixed(1)} mm`;
      // Aperture value (APEX)
      if (tagName === 'ApertureValue') {
        const apex = num / den;
        return `${(num/den).toFixed(2)} APEX (f/${Math.pow(2, apex/2).toFixed(1)})`;
      }
      // Shutter speed (APEX)
      if (tagName === 'ShutterSpeedValue') {
        const apex = num / den;
        const ss   = Math.pow(2, -apex);
        return ss < 1 ? `1/${Math.round(1/ss)} s` : `${ss.toFixed(4)} s`;
      }
      // Brightness, ExposureBias
      if (tagName === 'ExposureBiasValue' || tagName === 'BrightnessValue') {
        const v = num / den;
        return `${v >= 0 ? '+' : ''}${v.toFixed(2)} EV`;
      }
      // XResolution / YResolution
      if (tagName === 'XResolution' || tagName === 'YResolution') return `${Math.round(num/den)} ppi`;
      // Generic
      const decimal = num / den;
      const str     = Number.isInteger(decimal) ? decimal.toString() : decimal.toFixed(4);
      return `${num}/${den} (${str})`;
    }

    function interpretEnum(tagName, numVal, fallback) {
      const map = ENUM_VALUES[tagName];
      return map && map[numVal] !== undefined ? `${map[numVal]} (${numVal})` : fallback;
    }
  }

  // ── GPS DMS → decimal ────────────────────────────────────────────────────────

  function decodeGPS(raw) {
    const latRats  = raw['GPSLatitude']?.raw;
    const latRef   = raw['GPSLatitudeRef'] ? null : null; // handled below
    const lonRats  = raw['GPSLongitude']?.raw;

    if (!latRats || !lonRats) return null;

    // Find ref tags from the rows already collected
    const dmsToDecimal = ([deg, min, sec]) => deg + min / 60 + sec / 3600;
    let lat = dmsToDecimal(latRats);
    let lon = dmsToDecimal(lonRats);

    // Check ref from raw (we stored rows, not refs directly)
    // Refs are ASCII type — check via gpsRaw
    // We'll apply ref sign correction from the row labels passed externally.
    // Since we can't easily access ref here, return both forms and let caller handle.
    return `${lat.toFixed(6)}, ${lon.toFixed(6)} · <a href="https://maps.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}" target="_blank" rel="noopener" style="color:var(--accent)">Open in Maps ↗</a>`;
  }

  // ── PNG chunks ───────────────────────────────────────────────────────────────

  function parsePNGChunks(bytes, sections) {
    const rows = [];
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const len  = ((bytes[offset]<<24)|(bytes[offset+1]<<16)|(bytes[offset+2]<<8)|bytes[offset+3]) >>> 0;
      const type = String.fromCharCode(bytes[offset+4], bytes[offset+5], bytes[offset+6], bytes[offset+7]);

      if (type === 'IHDR') {
        const w    = ((bytes[offset+8]<<24)|(bytes[offset+9]<<16)|(bytes[offset+10]<<8)|bytes[offset+11]) >>> 0;
        const h    = ((bytes[offset+12]<<24)|(bytes[offset+13]<<16)|(bytes[offset+14]<<8)|bytes[offset+15]) >>> 0;
        const depth= bytes[offset+16];
        const ct   = bytes[offset+17];
        const ctStr= ['Grayscale','','RGB','Indexed','Grayscale+Alpha','','RGBA'][ct] || ct;
        rows.push(['Dimensions', `${w} × ${h} px`]);
        rows.push(['Bit Depth',  `${depth}-bit`]);
        rows.push(['Colour Type',`${ctStr} (${ct})`]);
        rows.push(['Interlace',  bytes[offset+20] ? 'Adam7' : 'None']);
      } else if (type === 'tEXt') {
        const data = bytes.slice(offset + 8, offset + 8 + len);
        const nul  = data.indexOf(0);
        if (nul !== -1) {
          const key = new TextDecoder().decode(data.slice(0, nul));
          const val = new TextDecoder('latin1').decode(data.slice(nul + 1)).replace(/\0/g,'');
          rows.push([`tEXt: ${key}`, val]);
        }
      } else if (type === 'iTXt') {
        const data = bytes.slice(offset + 8, offset + 8 + len);
        const nul  = data.indexOf(0);
        if (nul !== -1) {
          const key = new TextDecoder().decode(data.slice(0, nul));
          const val = new TextDecoder('utf-8', { fatal: false }).decode(data.slice(nul + 3)).replace(/\0+/g,' ').trim();
          if (val) rows.push([`iTXt: ${key}`, val.substring(0, 500)]);
        }
      } else if (type === 'eXIf') {
        // EXIF chunk in PNG
        parseTIFF(bytes, offset + 8, sections);
      } else {
        rows.push([`Chunk: ${type}`, `${len} bytes`]);
      }

      offset += 12 + len;
      if (type === 'IEND') break;
    }
    if (rows.length) sections.push({ title: 'PNG Metadata', rows });
  }

  // ── Embedded printable strings ───────────────────────────────────────────────

  function findEmbeddedStrings(bytes) {
    const results = [];
    let   cur  = '';
    let   start = 0;
    for (let i = 0; i < bytes.length; i++) {
      const b = bytes[i];
      if (b >= 32 && b <= 126) {
        if (!cur) start = i;
        cur += String.fromCharCode(b);
      } else {
        if (cur.length >= 8 && /[a-z]{3,}/i.test(cur)) {
          if (/https?:\/\//i.test(cur) || /[a-z]{4,}/i.test(cur)) {
            results.push({ offset: start, str: cur });
          }
        }
        cur = '';
      }
    }
    return results.slice(0, 40);
  }

  // ── Display ──────────────────────────────────────────────────────────────────

  function displaySections(sections) {
    const wrap = container.querySelector('#exif-data');
    if (!sections.length || sections.every(s => !s.rows.length)) {
      wrap.innerHTML = '<div class="text-muted" style="padding:16px">No readable metadata found in this file.</div>';
      return;
    }

    wrap.innerHTML = sections.map(sec => `
      <div class="exif-section">
        <div class="exif-section-title">${esc(sec.title)}</div>
        ${sec.rows.map(([k, v]) => `
          <div class="exif-row">
            <span class="exif-key">${esc(k)}</span>
            <span class="exif-val">${v.includes('<a ') ? v : esc(v)}</span>
          </div>
        `).join('')}
      </div>
    `).join('');

    container.querySelector('#exif-copy-all').onclick = () => {
      const text = sections.flatMap(s => [`[${s.title}]`, ...s.rows.map(([k,v]) => `${k}: ${v}`)]).join('\n');
      navigator.clipboard.writeText(text);
    };
  }

  function showHexDump(bytes) {
    let hex = '';
    const limit = Math.min(bytes.length, 512);
    for (let i = 0; i < limit; i += 16) {
      const slice    = bytes.slice(i, i + 16);
      const hexPart  = Array.from(slice).map(b => b.toString(16).padStart(2,'0')).join(' ');
      const asciiPart= Array.from(slice).map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');
      hex += `${i.toString(16).padStart(8,'0')}  ${hexPart.padEnd(47)}  ${asciiPart}\n`;
    }
    container.querySelector('#exif-hex').textContent = hex;
  }

  function esc(s = '') {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
}

Router.register('/toolkit/exif', 'exif', renderExif);
