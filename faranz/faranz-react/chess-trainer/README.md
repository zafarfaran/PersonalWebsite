# Opening Trainer

Source for the chess opening trainer served at `/chess/` on faranz.com
(London System and Italian Game: lessons, drills, memory training, practice
matches and play-on against Stockfish).

The website does not build this folder. It serves the built copy in
`../public/chess/`, so rebuild that copy after changing anything here:

```
npm install
npm run dev          # work on it locally
npm test             # checks every opening line is legal and consistent
npm run build:site   # rebuilds ../public/chess
```

Opening content lives in `src/data/london.ts` and `src/data/italian.ts`.
