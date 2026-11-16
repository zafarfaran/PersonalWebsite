# Writing a module for the ML trainer

The course is a list of modules. A module is one data file and one file of interactive figures:

- `src/content/<module>.ts` exports `const <module>: Module` (types in `src/types.ts`)
- `src/widgets/<module>.tsx` exports `const <module>Widgets: Record<string, ComponentType>`

Both files already exist as empty placeholders and are already registered in `src/content/index.ts` and
`src/widgets/index.ts`. **Edit only your two files.** Do not touch the framework, other modules, package files or git.

The finished example to copy is the maths module: read `src/content/maths.ts` and `src/widgets/maths.tsx` in full
before you write anything, and `src/types.ts` and `src/components/Plot.tsx` for the building blocks.

## Who it is for

Someone who writes Python and wants to become a strong ML engineer: able to build, debug and ship models, and to
talk about them in an interview. Practical over theoretical. Every lesson should leave them able to *do* something.

## A lesson

```ts
{
  id: '<module>-<slug>',          // must start with the module id
  title, summary,                 // summary: one line
  widget: '<module>-<name>',      // optional: a figure from your widgets file
  text: [...],                    // 4 to 6 short paragraphs; a block can be { code: `...` }
  rules: [...],                   // 3 to 6 things to remember, one line each
  questions: [...],               // 9 to 12, of at least three different kinds
}
```

The learner has asked for many exercises that cover everything in the lesson. Every idea and every rule in a lesson's
text should be exercised by at least one question, and the important ones from two angles (for example once by reading
code and once by a decision).

End the module with a **lab** lesson, id `<module>-lab`, title "Lab: …". A lab builds one real thing from scratch in
6 to 9 steps, each step a question (mostly `write`, with an `output`, `bug` or `design` step where it fits), each
building on the one before: for example logistic regression trained by gradient descent, a tiny RAG pipeline, a
drift monitor. Each `write` step must be self-contained (repeat the helper functions it needs in the `starter`), since
steps are run separately. The lab's `text` says what is being built and why, and its `rules` are the takeaways.

In `text`, `rules`, `ask`, `why`, `hint` and choice options, `` `backticks` `` mark inline code and `**stars**` mark bold.
Nothing else is rendered: no markdown lists, links or LaTeX. Write maths with plain characters (x², √n, Σ, ∂L/∂w).

Question ids are `<lesson id>-<n>` and must be unique.

## Question kinds (see `src/types.ts`)

| kind | what the learner does | notes |
|---|---|---|
| `choice` | picks one option | 3 or 4 options, one right. Add `code` to ask about code, or `chart` for a loss curve. With `run: true` the right option must be exactly what `code` prints. |
| `output` | types what the code prints | Keep the output short and unambiguous: an int, a shape, a short list. Avoid long floats (round them). |
| `bug` | clicks the wrong line | `line` is 1-based, `fix` is the whole corrected line **with its indentation**. Exactly one line is wrong. |
| `number` | types a number | Add `check`: a Python expression (with `np` and `math` available) that evaluates to the answer. Set `tol` when rounding matters. |
| `write` | writes a function, run against tests in the browser | Runs in Pyodide: **standard library and NumPy only** (set `numpy: true` if you import it). No torch, pandas or sklearn. The `starter` must fail the tests, the `solution` must pass. Give every assert a message that tells the learner what is wrong. Start the tests by checking the function returns something. |
| `design` | sketches an answer, then ticks a checklist | 5 to 8 checklist items, each a `point` and a `why`. Use for open "how would you build/debug this" questions. |

Use the kinds that fit the lesson. Code-heavy lessons lean on `output`, `bug` and `write`. Judgement lessons lean on
`choice` (with charts where a curve tells the story) and `design`. Aim for each module to have at least 4 `write`,
6 `bug`, 6 `output` and 3 `design` questions unless the subject really does not allow it.

What makes a good question:

- It tests the thing an engineer gets wrong in practice, not a definition. "Which line leaks test data?" beats "What is leakage?".
- Wrong options are the mistakes people really make. No joke options.
- `why` teaches: it says why the right answer is right and, where useful, why the tempting one is wrong. 1 to 3 sentences.
- Numbers in a question are simple enough to do in your head or on paper.
- Code is short (3 to 12 lines), real, and runnable where the kind requires it.

## Checking your work (required)

Code in `output`, `choice`+`run`, `number`+`check` and `write` questions is executed by a script. From `ml-trainer/`:

```
npx tsc --noEmit -p .                         # types
npx vitest run                                # structure of every lesson and question
npx vite-node scripts/dump.ts <module>        # then:
python scripts/verify.py <module>             # runs the code in your questions
```

Python here has numpy, torch, scikit-learn and scipy. **pandas is not installed**: code that uses pandas can only
appear in `bug` questions and in `choice` questions without `run`, so check it by reading it very carefully.

Other people are writing other modules in the same folder at the same time. If `tsc` or `vitest` reports a problem in
a file that is not yours, ignore it. Everything in your own two files must be clean, and `verify.py <module>` must
report `0 wrong`. Fix the content, never the checker. Do not weaken a test to make it pass.

## Figures

A figure is a React component with no props, registered under the name `'<module>-<name>'`. It goes in the "Try it"
card beside the lesson text, about 340px wide on a desktop and full width on a phone.

- Build it from `src/components/Plot.tsx`: `Plot` (axes and scale), `Path`, `Curve`, `Dot`, `Seg`, `Label`, `Slider`,
  `Readout`, `nearest`, `fmt`, `seeded`, `gaussian`. Look at how the maths figures use them. Plain SVG inside the
  `Plot` render function is fine for bars, rectangles and heat maps (use `s.x`, `s.y`, `s.w`, `s.h`).
- Wrap it in `<div className="widget">`. Controls: `Slider`, `<div className="seg">` with buttons (class `on` for the
  chosen one), `<div className="actions">` with `<button className="btn">`. Tables: `<table className="cells">`.
- Colours come from CSS variables through the `color` props (`accent`, `good`, `bad`, `blue`, `muted`, `text`,
  `amber`, `purple`), or `var(--accent)` etc. in raw SVG. Never hard-code a colour.
- End with `<p className="caption">`: two to four sentences that say what to do and what to notice. Tie it to practice.
- Data must be the same on every visit: use `seeded(n)` and `gaussian(...)`, never `Math.random()` at render time.
- A figure must teach one thing by letting the learner change something and see the consequence. A static picture is
  not a figure. Every registered figure must be used by a lesson, and at least one question in that lesson should
  send the learner to the figure ("In the figure, set … What happens?").
- Aim for 3 or 4 figures per module, on the lessons where a picture does the most work. Keep each under about 120 lines.
- TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`). No new dependencies.

## Writing style

Plain, direct English, British spelling, second person. Short sentences. Say the thing; do not announce it.

- No filler, no hype, no "simply", "just", "powerful", "crucial", "delve", "leverage", "robust", "landscape".
- No em dashes. Use a full stop, a comma or a colon.
- No rhetorical questions as headings, no "Let's", no "In this lesson we will".
- Be honest about trade-offs and about what is a rule of thumb.
- Be right. If you are not sure a claim is true, leave it out or check it by running code. Wrong content is worse than missing content.
- In TypeScript strings, prefer double quotes for text that contains an apostrophe, and template literals for code.
  Do not put `${` inside a template literal that holds Python.

## When you finish

Report: the lessons you wrote, the count of questions by kind, the figures, the final output of `verify.py`, and
anything you were unsure about or could not check.
