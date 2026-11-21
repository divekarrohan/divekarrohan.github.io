# divekarrohan.github.io

Portfolio site: six projects and a demo card for every concept learned. Built with [Astro](https://astro.build), deployed to GitHub Pages.

## Run locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # fails if any card breaks the schema
```

## Add a concept demo

1. Put the GIF, MP4 or PNG in `public/demos/`.
2. Copy `docs/card-template.md` to `src/content/concepts/<slug>.md` and fill it in.
3. Set `status: live` only when the card has a demo file, at least two metrics and a code link. The build enforces this.

## Update a project

Edit its file in `src/content/projects/`: set `status` and replace `headline` with the real number.

## Deploy (one-time setup)

1. Create a public repo named `divekarrohan.github.io` and push this folder to `main`.
2. In the repo, go to Settings → Pages and set Source to **GitHub Actions**.
3. Every push to `main` then rebuilds and publishes https://divekarrohan.github.io.

## Layout

```
src/content.config.ts      card and project schemas
src/content/concepts/      one Markdown file per demo card
src/content/projects/      the six project slots
src/pages/                 home, projects, concepts, concept detail, log
src/components/            DemoCard, ProjectCard
public/demos/              demo media
.github/workflows/         GitHub Pages deploy
```
