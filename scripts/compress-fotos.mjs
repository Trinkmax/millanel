// Comprime todas las fotos de millanel_fotos/ in-place sin pérdida visible
// (mozjpeg q85, máx 1600px). Reduce storage y acelera la carga. Idempotente.
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "millanel_fotos");
const files = readdirSync(DIR).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
let before = 0, after = 0, done = 0, err = 0, skip = 0;

for (const f of files) {
  const p = join(DIR, f);
  try {
    const buf = readFileSync(p);
    before += buf.length;
    const out = await sharp(buf)
      .rotate() // respeta orientación EXIF
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true, progressive: true })
      .toBuffer();
    if (out.length < buf.length) {
      writeFileSync(p, out);
      after += out.length;
    } else {
      after += buf.length;
      skip++;
    }
    done++;
    if (done % 250 === 0) process.stdout.write(`\r${done}/${files.length}`);
  } catch {
    err++;
    after += 0;
  }
}
console.log(
  `\nComprimidas: ${done} · ya óptimas: ${skip} · errores: ${err} · ${(before / 1048576).toFixed(0)} MB → ${(after / 1048576).toFixed(0)} MB (${(100 - (after / before) * 100).toFixed(0)}% menos)`,
);
