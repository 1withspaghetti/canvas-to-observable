# canvas-to-observable
Take a zip export of Canvas LMS submissions ([observable links](https://observablehq.com)) and build them into a static observable site using [Observable Notebook Kit](https://observablehq.github.io/notebook-kit/).

You need:
- [nodejs](https://nodejs.org/en/download) v22.18.0 or later
- [pnpm](https://pnpm.io/installation)

Install libraries:
```sh
pnpm install
```

Usage:
```sh
pnpm run import [file or link to submissions zip]
#example:
pnpm run import submissions.zip
```
(in you see errors such as "Failed to download notebook..." then the student likely didn't make it public or unlisted)

Then, all the notebook html files will be in `docs/`

Build into static site:
```sh
pnpm run build
```
The static site will be located in `dist/`