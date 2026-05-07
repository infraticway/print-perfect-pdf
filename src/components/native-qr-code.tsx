import { useMemo } from "react";

type NativeQRCodeProps = {
  value: string;
  size?: number;
};

const VERSION = 5;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 108;
const ECC_CODEWORDS = 26;

function gfMul(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z & 0xff;
}

function rsGenerator(degree: number) {
  let result = [1];
  let root = 1;
  for (let i = 0; i < degree; i++) {
    const next = new Array(result.length + 1).fill(0);
    result.forEach((coef, j) => {
      next[j] ^= gfMul(coef, root);
      next[j + 1] ^= coef;
    });
    result = next;
    root = gfMul(root, 0x02);
  }
  return result.slice(0, degree);
}

function rsRemainder(data: number[]) {
  const generator = rsGenerator(ECC_CODEWORDS);
  const result = new Array(ECC_CODEWORDS).fill(0);
  for (const b of data) {
    const factor = b ^ result.shift()!;
    result.push(0);
    for (let i = 0; i < generator.length; i++) result[i] ^= gfMul(generator[i], factor);
  }
  return result;
}

function appendBits(bits: number[], value: number, length: number) {
  for (let i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
}

function makeCodewords(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value)).slice(0, 106);
  const bits: number[] = [];
  appendBits(bits, 0x4, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach((b) => appendBits(bits, b, 8));
  appendBits(bits, 0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8) bits.push(0);

  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0xec; data.length < DATA_CODEWORDS; pad ^= 0xfd) data.push(pad);
  return [...data, ...rsRemainder(data)];
}

function maskBit(mask: number, x: number, y: number) {
  if (mask === 0) return (x + y) % 2 === 0;
  if (mask === 1) return y % 2 === 0;
  if (mask === 2) return x % 3 === 0;
  if (mask === 3) return (x + y) % 3 === 0;
  if (mask === 4) return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
  if (mask === 5) return ((x * y) % 2) + ((x * y) % 3) === 0;
  if (mask === 6) return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
  return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
}

function formatBits(mask: number) {
  const data = (1 << 3) | mask;
  let bits = data << 10;
  for (let i = 14; i >= 10; i--) if (((bits >>> i) & 1) !== 0) bits ^= 0x537 << (i - 10);
  return ((data << 10) | bits) ^ 0x5412;
}

function penalty(modules: boolean[][]) {
  let score = 0;
  for (let y = 0; y < SIZE; y++) {
    let run = 1;
    for (let x = 1; x < SIZE; x++) {
      if (modules[y][x] === modules[y][x - 1]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  for (let x = 0; x < SIZE; x++) {
    let run = 1;
    for (let y = 1; y < SIZE; y++) {
      if (modules[y][x] === modules[y - 1][x]) run++;
      else {
        if (run >= 5) score += run - 2;
        run = 1;
      }
    }
    if (run >= 5) score += run - 2;
  }
  for (let y = 0; y < SIZE - 1; y++) {
    for (let x = 0; x < SIZE - 1; x++) {
      const c = modules[y][x];
      if (c === modules[y][x + 1] && c === modules[y + 1][x] && c === modules[y + 1][x + 1]) score += 3;
    }
  }
  return score;
}

function buildBase() {
  const modules = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const reserved = Array.from({ length: SIZE }, () => new Array<boolean>(SIZE).fill(false));
  const set = (x: number, y: number, dark: boolean) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    modules[y][x] = dark;
    reserved[y][x] = true;
  };
  const finder = (x: number, y: number) => {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const xx = x + dx;
        const yy = y + dy;
        const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        set(xx, yy, dark);
      }
    }
  };
  finder(0, 0);
  finder(SIZE - 7, 0);
  finder(0, SIZE - 7);
  for (let i = 8; i < SIZE - 8; i++) {
    set(i, 6, i % 2 === 0);
    set(6, i, i % 2 === 0);
  }
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) set(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  for (let i = 0; i <= 8; i++) {
    set(8, i, false);
    set(i, 8, false);
  }
  for (let i = SIZE - 8; i < SIZE; i++) {
    set(8, i, false);
    set(i, 8, false);
  }
  set(8, SIZE - 8, true);
  return { modules, reserved };
}

function drawFormat(modules: boolean[][], mask: number) {
  const bits = formatBits(mask);
  const bit = (i: number) => ((bits >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i++) modules[i][8] = bit(i);
  modules[7][8] = bit(6);
  modules[8][8] = bit(7);
  modules[8][7] = bit(8);
  for (let i = 9; i < 15; i++) modules[14 - i][8] = bit(i);
  for (let i = 0; i < 8; i++) modules[8][SIZE - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) modules[SIZE - 15 + i][8] = bit(i);
  modules[SIZE - 8][8] = true;
}

function makeQr(value: string) {
  const codewords = makeCodewords(value);
  const dataBits = codewords.flatMap((b) => Array.from({ length: 8 }, (_, i) => (b >>> (7 - i)) & 1));
  const { modules: base, reserved } = buildBase();
  let best = base;
  let bestPenalty = Infinity;

  for (let mask = 0; mask < 8; mask++) {
    const modules = base.map((row) => row.slice());
    let bitIndex = 0;
    let upward = true;
    for (let x = SIZE - 1; x >= 1; x -= 2) {
      if (x === 6) x--;
      for (let i = 0; i < SIZE; i++) {
        const y = upward ? SIZE - 1 - i : i;
        for (let dx = 0; dx < 2; dx++) {
          const xx = x - dx;
          if (reserved[y][xx]) continue;
          modules[y][xx] = ((dataBits[bitIndex++] ?? 0) === 1) !== maskBit(mask, xx, y);
        }
      }
      upward = !upward;
    }
    drawFormat(modules, mask);
    const score = penalty(modules);
    if (score < bestPenalty) {
      bestPenalty = score;
      best = modules;
    }
  }
  return best;
}

export function NativeQRCode({ value, size = 200 }: NativeQRCodeProps) {
  const modules = useMemo(() => makeQr(value), [value]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${SIZE + 8} ${SIZE + 8}`} role="img" aria-label="QR Code">
      <rect width="100%" height="100%" fill="white" />
      {modules.flatMap((row, y) =>
        row.map((dark, x) => (dark ? <rect key={`${x}-${y}`} x={x + 4} y={y + 4} width="1" height="1" fill="black" /> : null)),
      )}
    </svg>
  );
}