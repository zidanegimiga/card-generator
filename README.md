# Card Generator

[![CI](https://github.com/zidanegimiga/card-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/zidanegimiga/card-generator/actions/workflows/ci.yml)

Design branded ID cards in the browser. Pull a company's name, logo, and colours from its website, pick a design and a finish, use your own font file, and download a 1080 × 1712 PNG.

**Live:** [id-card-gnr8tor.netlify.app](https://id-card-gnr8tor.netlify.app/)

<!-- Add a screenshot: save one as docs/preview.png and uncomment the line below. -->
<!-- ![The studio with the Alloy design in a gold finish](docs/preview.png) -->

## Features

- **Brand pull.** Type a site like `linear.app` and the server fetches its name, logo, and theme colour. Everything stays editable afterwards.
- **Brand controls.** Name, website, logo upload, and four colours, each with a colour picker and a hex field. A live WCAG contrast check rates the text against the background.
- **Ten card designs in two groups.**
  - Materials: Alloy (brushed metal), Foil (holographic laminate with an MRZ), Chrome, Carbon (fibre weave), Gingham (woven check), and Press (letterpress).
  - Layouts: Slate, Poster, Transit (a ticket with a barcode), and Blueprint.
- **Nine finishes.** Keep the brand's colours or switch to Silver, Gold, Graphite, Copper, Jade, Cobalt, Bone, or Oxblood. Any finish works with any design.
- **Bring your own font.** Choose from 13 Google Fonts or upload a `.woff2`, `.woff`, `.ttf`, or `.otf` file up to 2 MB. Uploads are checked by their file signature, saved in IndexedDB, and come back after a reload.
- **Member details.** Name, title, membership, a corner label, member since, a photo, and a QR link. Leave the member ID blank and one is generated from the name.
- **PNG export** at 1080 × 1712, with uploaded fonts embedded in the image.
- **Card tilt.** The preview tilts toward the pointer with a soft sheen. It stays still for anyone who has reduced motion turned on.
- **Autosave.** The card is saved in localStorage and checked against the schema when it loads.

## Tech stack

| Area      | Choice                                                        |
| --------- | ------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, React Compiler), React 19, TypeScript |
| Styling   | CSS Modules on shared design tokens, container query units    |
| Motion    | Motion (formerly Framer Motion)                               |
| Data      | Zod 4 schemas as the single source of types                   |
| Server    | Route handler with `node-html-parser` and `ipaddr.js`         |
| Export    | `modern-screenshot`, `qrcode`                                 |
| Testing   | Vitest, React Testing Library, user-event, `fake-indexeddb`   |
| Tooling   | ESLint, Prettier, GitHub Actions, Netlify                     |

## Getting started

You need Node 24 (see `.nvmrc`) and pnpm 10. The pnpm version is pinned in `package.json`, so `corepack enable` sets it up.

```bash
pnpm install
pnpm dev
```

Then open [localhost:3000](http://localhost:3000).

### Scripts

| Command             | What it does                 |
| ------------------- | ---------------------------- |
| `pnpm dev`          | Start the dev server         |
| `pnpm build`        | Production build             |
| `pnpm test`         | Run the test suite once      |
| `pnpm test:watch`   | Run tests on every change    |
| `pnpm typecheck`    | Type-check without emitting  |
| `pnpm lint`         | ESLint                       |
| `pnpm format`       | Format with Prettier         |
| `pnpm format:check` | Check formatting, as CI does |

## Project structure

```
src/
  app/
    api/brand/            Brand pull endpoint
    globals.css           Design tokens, reset, one utility class
  components/
    card/
      id-card/            Card wrapper: palette to CSS variables, picks the face
      faces/              One folder per design, plus a typed registry
      brand-mark/ portrait/ card-field/ qr-code/
    studio/               One folder per studio component
  hooks/                  useCardConfig, useCustomFonts, useMediaQuery
  lib/
    brand-pull/           URL safety, safe fetch, HTML parsing, API client
    card/                 Schema, card view model, finishes, member IDs, MRZ, config store
    color/ export/ fonts/ images/ qr/ studio/
  test/                   Shared test fakes
```

Each component folder holds `name.tsx`, `name.module.css`, `index.ts`, and its test. Logic that doesn't render anything lives in `lib/` as plain functions, which keeps it easy to test.

## How it works

### One schema for everything

The card config is described once with Zod in [`lib/card/schema.ts`](src/lib/card/schema.ts). The TypeScript types are inferred from it. Form fields validate with the same rules through small parsers like `parseMemberField`, and saved cards pass through `parseCardConfig` before the app uses them. New fields get schema defaults, so cards saved by an older version still load.

### Rendering a card

`config` goes into `toCardView`, a pure function that resolves the palette, member ID, initials, and QR target. The result goes to a face component. `IdCard` passes the palette to faces as CSS custom properties, so every face works with every finish without knowing which one is selected. Faces size everything in `cqw` units, so the same markup renders as a picker thumbnail, the 288px preview, and the 1080px export.

The registry is typed `Record<CardStyle, Face>`. Adding a style to the schema without a design for it is a type error.

### Brand pull and SSRF protection

The brand endpoint fetches URLs that users type in, so it guards against server-side request forgery:

- Only `http` and `https` on default ports. No credentials in the URL, and no single-label hosts like `localhost`.
- Every DNS answer must be a public address. Private, loopback, link-local (including cloud metadata at `169.254.169.254`), carrier-grade NAT, and IPv4-mapped IPv6 addresses are refused.
- Redirects are followed by hand, and each hop is checked again.
- Responses have a timeout and size limits. HTML is cut off at 1 MB, since the `<head>` comes first.

Logos come back as data URLs, so the card can render and export them without cross-origin requests.

### Fonts

Uploaded fonts are registered with the `FontFace` API and also written as an `@font-face` rule. The rule is there because the PNG exporter only embeds fonts it can find in stylesheets.

### Saving

[`config-store.ts`](src/lib/card/config-store.ts) is an external store read through `useSyncExternalStore`. The server renders the default card and the client switches to the saved one, with no hydration mismatch. Writes are debounced and flushed when the page is hidden. If images push the save over the storage quota, it saves everything except the images.

## Testing

There are 466 tests across 40 files.

- **Pure logic** is unit tested directly: schemas, contrast maths, colour mixing, MRZ formatting, QR matrices, and SSRF checks.
- **Components** are tested the way a user uses them, with React Testing Library and user-event. Tests find elements by role and label, not by class names.
- **Side effects are injected.** The font store, font registrar, `fetch`, DNS, PNG renderer, and downloader can all be swapped for fakes, so tests stay fast and predictable.
- **Every design is tested against the same checks** with `describe.each`: brand, name, ID, photo or initials, label, and QR. Those checks caught designs that dropped the photo.
- **Server code** runs in Vitest's `node` environment. The real IndexedDB store runs against `fake-indexeddb`.
- **Types are tested** with `expectTypeOf` where a type is part of the contract.

## Deployment

Pushes to `main` deploy to Netlify, which builds Next.js 16 with no extra config. GitHub Actions runs typecheck, lint, the format check, tests, and a production build on every push and pull request.

## Known limitations

- **DNS rebinding.** The brand pull checks DNS before connecting, but the connection resolves again on its own. Pinning the checked IP to the connection would close the gap.
- **Rate limiting.** `/api/brand` has none. It relies on CDN caching of successful lookups.
- **Brand colours.** They come from the site's `theme-color`. Nothing samples colours from the logo yet.
- **Large images** are left out of autosave when they would exceed the storage quota.

## Credits

The idea comes from [keshav-exe/id-cards](https://github.com/keshav-exe/id-cards). This is a separate implementation with its own designs and code.
