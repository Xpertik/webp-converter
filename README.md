# WebP Converter

Drag-and-drop PNG/JPEG to WebP converter that runs entirely in the browser. No files are uploaded anywhere.

- Encoder: libwebp compiled to WebAssembly ([`@jsquash/webp`](https://github.com/jamsinclair/jSquash)), so output matches `cwebp`.
  - **Con pérdida** (calidad 75 por defecto) = `cwebp -q <quality> -m 6 -sharp_yuv`
  - **Sin pérdida** = `cwebp -lossless`
- Drop files or whole folders; changing the settings re-converts everything.
- Download each image, or all of them as a `.zip` (duplicate names become `name (2).webp`).
- Conversions run in parallel Web Workers, so the page stays responsive with large batches.

No TinyPNG step is needed first: the WebP encoder does its own compression.

## Usage

Requires Node 20+.

```bash
npm install
npm start        # builds and opens http://localhost:5180
```

For development: `npm run dev`. Tests: `npm test`. Type check: `npm run typecheck`.

## Structure

```
src/
  features/conversion/   # encoding, worker pool, queue hook, zip, file helpers
  components/            # presentational UI (drop zone, settings, file rows, toolbar)
  App.tsx                # wires settings, queue and UI together
```

## License

MIT © Xpertik. The bundled libwebp/jSquash encoder is Apache-2.0.
