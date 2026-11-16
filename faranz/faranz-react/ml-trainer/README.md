# ML Trainer

Source for the machine learning course served at `/ml/` on faranz.com: lessons with a
page to read, a live figure, and questions of six kinds (pick one, read the code, find
the bug, work out a number, write a function that is run against tests in the browser,
and open design questions), with spaced review, and a notebook for notes, drawings and
diagrams.

The website does not build this folder. It serves the built copy in `../public/ml/`,
so rebuild that copy after changing anything here:

```
npm install
npm run dev          # work on it locally
npm test             # structure of every lesson and question
npm run verify       # runs the Python in the questions and checks the stated answers
npm run build:site   # rebuilds ../public/ml
```

`npm run verify` needs Python with numpy, torch, scikit-learn and scipy. Code that
needs a library that is not installed is listed as not checked.

- `src/content/<module>.ts`: the lessons and questions of one module.
- `src/widgets/<module>.tsx`: its interactive figures.
- `AUTHORING.md`: how to write a module, and the house style.
- `src/components/`: the question card (`Quiz.tsx`), chart building blocks (`Plot.tsx`),
  code blocks (`Code.tsx`) and the drawing and diagram page (`Pad.tsx`).
- `src/py.ts`: runs exercises with Pyodide in a worker. Nothing is downloaded until the
  first exercise is run.

Progress, notes and drawings are kept in the browser's local storage.
