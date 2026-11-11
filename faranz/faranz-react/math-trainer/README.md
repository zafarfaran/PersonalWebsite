# Mental Math Trainer

Source for the mental math trainer served at `/math/` on faranz.com: one
lesson per arithmetic shortcut, practice with the method alongside, 60-second
sprints and repetition cards for facts worth knowing by heart.

The website does not build this folder. It serves the built copy in
`../public/math/`, so rebuild that copy after changing anything here:

```
npm install
npm run dev          # work on it locally
npm test             # checks every trick's answers and worked steps
npm run build:site   # rebuilds ../public/math
```

Tricks and memory facts live in `src/tricks.ts`. Each trick has a `build`
function that returns the question, the answer and the worked steps; the tests
generate hundreds of problems per trick and check all three.
