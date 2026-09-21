/* Small stored-entry ZIP transport. CSVs remain standard standalone files. */
var CsvZip = (function () {
  const crcTable = Array.from({ length: 256 }, (_, i) => {
    let x = i;
    for (let j = 0; j < 8; j++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1;
    return x >>> 0;
  });
  function crc(a) {
    let c = 0xffffffff;
    for (const b of a) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function make(files) {
    const enc = new TextEncoder(),
      chunks = [],
      central = [];
    let offset = 0,
      size = 0;
    for (const [name, text] of Object.entries(files)) {
      const n = enc.encode(name),
        data = enc.encode(text),
        head = new Uint8Array(30 + n.length),
        v = new DataView(head.buffer),
        checksum = crc(data);
      v.setUint32(0, 0x04034b50, true);
      v.setUint16(4, 20, true);
      v.setUint16(6, 0x800, true);
      v.setUint32(14, checksum, true);
      v.setUint32(18, data.length, true);
      v.setUint32(22, data.length, true);
      v.setUint16(26, n.length, true);
      head.set(n, 30);
      chunks.push(head, data);
      const ch = new Uint8Array(46 + n.length),
        cv = new DataView(ch.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint16(8, 0x800, true);
      cv.setUint32(16, checksum, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, n.length, true);
      cv.setUint32(42, offset, true);
      ch.set(n, 46);
      central.push(ch);
      offset += head.length + data.length;
      size += ch.length;
    }
    const end = new Uint8Array(22),
      ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, central.length, true);
    ev.setUint16(10, central.length, true);
    ev.setUint32(12, size, true);
    ev.setUint32(16, offset, true);
    const result = new Uint8Array(offset + size + 22);
    let at = 0;
    for (const a of [...chunks, ...central, end]) {
      result.set(a, at);
      at += a.length;
    }
    return result;
  }
  function read(bytes) {
    if (bytes.length > 6000000) throw Error("BACKUP_SIZE");
    const files = Object.create(null),
      view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
      dec = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true });
    let pos = 0;
    while (
      pos + 30 <= bytes.length &&
      view.getUint32(pos, true) === 0x04034b50
    ) {
      const flags = view.getUint16(pos + 6, true),
        method = view.getUint16(pos + 8, true),
        size = view.getUint32(pos + 18, true),
        raw = view.getUint32(pos + 22, true),
        nl = view.getUint16(pos + 26, true),
        extra = view.getUint16(pos + 28, true);
      if (method !== 0 || flags & 9 || size !== raw) throw Error("ZIP_FORMAT");
      const start = pos + 30 + nl + extra;
      if (start + size > bytes.length) throw Error("CSV");
      const name = dec.decode(bytes.slice(pos + 30, pos + 30 + nl));
      if (
        !/^[a-z_]+\.csv$/.test(name) ||
        Object.hasOwnProperty.call(files, name)
      )
        throw Error("BACKUP_FILES");
      const data = bytes.slice(start, start + size);
      if (crc(data) !== view.getUint32(pos + 14, true)) throw Error("CSV");
      files[name] = dec.decode(data);
      pos = start + size;
    }
    if (
      !Object.keys(files).length ||
      pos + 4 > bytes.length ||
      view.getUint32(pos, true) !== 0x02014b50
    )
      throw Error("ZIP_FORMAT");
    return files;
  }
  return { make, read };
})();
if (typeof module !== "undefined") module.exports = CsvZip;
