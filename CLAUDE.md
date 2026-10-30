# Evocon prototypes: rules for agents

This repo is the published home of Evocon design prototypes. **Every push to `main` goes live** on GitHub Pages within about a minute:

https://kaur-evo.github.io/prototypes/

The repo is **public**. Never push secrets, API keys, customer data or real people's personal data.

## Layout

```
index.html              ← start screen: one row per prototype (dark launcher)
assets/                 ← shared launcher files: launcher.css, evocon-logo.svg, mrevocon.svg
.nojekyll               ← keep it (see below)
<slug>/index.html       ← one folder per prototype; this page is the prototype's shareable URL
<slug>/…                ← the prototype's own files
```

The prototypes today:

| Folder | Prototype | URL |
|---|---|---|
| `operators-teams/` | Operators & Teams | https://kaur-evo.github.io/prototypes/operators-teams/ |
| `tags-reports/` | Tags to Reports | https://kaur-evo.github.io/prototypes/tags-reports/ |

## Adding a prototype

1. **Make a folder** named with a lowercase, hyphenated slug, e.g. `shift-diary/`. Never rename or move a folder that has been shared, because its links will break.
2. **Add the landing page** `<slug>/index.html`. Copy `tags-reports/index.html` and change:
   - the title;
   - the rows: one per surface, each linking to a page inside the folder.
3. **Add one row to the root `index.html`** selector. Newest goes first. The row links to `<slug>/`.
4. **Commit and push to `main`.** Then check that the build finished:
   `gh api repos/kaur-evo/prototypes/pages/builds/latest --jq .status` should read `built`. Open the new URL to confirm.

## Rules that keep the site working

- **Relative paths only.** The site lives under `/prototypes/`, so:
  - a root-absolute path like `/assets/x.css` breaks;
  - `file:///` and `/Users/...` paths break.
- **No build step.** The pages must work as plain static files, both opened from disk and on Pages. External libraries load from a CDN, with a pinned version.
- **Case matters on Pages.** macOS does not care about case, but Pages does. `Logo.svg` and `logo.svg` are different files there, so match the case exactly in links.
- **Keep `.nojekyll`.** Without it, the Pages build runs Jekyll, which silently drops every file and folder whose name starts with `_`.
- **Do not change `assets/` for one prototype.** The launcher style is shared by every landing page.
- **Check before you push.**
  - Open the root `index.html` and the new landing page from disk, and click every row.
  - Run `git status`, so that no stray files go out: Office lock files `~$*.xlsx`, `.DS_Store`, scratch screenshots.
- **Keep files small.** Pages rejects files over 100 MB.

## Prototypes developed in another repo

`tags-reports/` is a published copy. Its source is the git repo `pyscripts-evocon/tags-reports/prototype/`. To update it, copy only the web files from that source:

```
SRC=../tags-reports/prototype
rsync -a --delete --exclude NOTES.md $SRC/shared $SRC/settings $SRC/reports tags-reports/
cp $SRC/index.html tags-reports/about.html
```

Do not overwrite `tags-reports/index.html`: it is the launcher page. Do not copy `docs/`, `tests/` or `CLAUDE.md`.

Use the same pattern for any other prototype that lives elsewhere. Copy its web files into `<slug>/`, and keep the launcher `index.html` as part of this repo.
