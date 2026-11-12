# Opening Trainer

Source for the chess opening trainer served at `/chess/` on faranz.com
(London System and Italian Game for White, Caro-Kann and Sicilian Dragon for
Black, plus a guide to what to play against what: lessons, drills, memory training, practice
matches and play-on against Stockfish).

The website does not build this folder. It serves the built copy in
`../public/chess/`, so rebuild that copy after changing anything here:

```
npm install
npm run dev          # work on it locally
npm test             # checks every opening line is legal and consistent
npm run build:site   # rebuilds ../public/chess
```

Opening content lives in `src/data/` (one file per opening; `side` says which
colour the learner plays). The guide table is in `src/screens/Guide.tsx`.

Full games are saved in the browser (`games` in `src/store.ts`) and can be
reviewed with the engine (`src/screens/Games.tsx`); mistakes found there feed
the mistake drill (`src/screens/Fix.tsx`). The calculation trainer's exercises
are generated in `src/calc.ts`.
