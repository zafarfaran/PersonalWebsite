# Writing the theory for a module

Every lesson has a short `text` ("In short"), `rules` and questions in `src/content/<module>.ts`. On top of that
each lesson gets a full **theory** section: the same subject explained from the very beginning, under headings.
It lives in `src/content/theory/<module>.ts`, which exports `<module>Theory: Record<lessonId, Block[]>` and is
already registered. Do not touch the framework, other modules, package files or git.

The finished example to copy is `maths-vectors` in `../ml-trainer/src/content/theory/maths.ts` (the machine learning
course this framework was copied from). Read it first, with the matching lesson in
`../ml-trainer/src/content/maths.ts`, so you see how the theory relates to the short text and the questions.
Everything in `AUTHORING.md` under "Honesty and safety" applies to the theory too.

## Who it is for

A complete beginner to markets. They can write basic Python (variables, loops, functions, lists) and remember
school arithmetic. Assume nothing else: no finance vocabulary, no statistics, no experience of a broker or a chart.
Later modules may rely on what earlier modules in the course taught (the order is markets, charts, orderflow, profile,
options, pricing, volatility, strategies, risk, daytrading, backtest, business, then the quant track: quant, qdata,
qseries, qalpha, statarb, portfolio, qoptions, qml, algo, engine, execution, agentic; `CURRICULUM.md` says what each covers), but give a
one-line reminder when you use an earlier idea rather than assuming it stuck.

The reader should be able to read the theory top to bottom, with no other source, and then answer every question
in that lesson. Before you write a lesson's theory, read its `text`, `rules` and **all its questions** in
`src/content/<module>.ts`. Every term, formula, function and idea a question relies on must be explained in the
theory. Do not give away the answers to specific questions: teach the idea with different numbers and examples.

## Blocks (see `Block` in `src/types.ts`)

```ts
{ h: 'A heading' }                 // a main section
{ sub: 'A subheading' }            // a part of a section
'A paragraph with `code` and **bold**.'
{ list: ['A bullet.', 'Another.'] }
{ code: `python here` }            // shown as code, not run
{ code: `python here`, out: `what it prints` }   // shown with its output; the checker runs it
```

Nothing else is rendered: no markdown, links, tables, images or LaTeX. Write maths with plain characters
(x², √t, Σ, σ, Δ, θ) and say in words what each symbol means the first time it appears.

## Shape of a lesson's theory

- Starts with a heading. 5 to 8 headings, at least 2 subheadings (most lessons want 4 or more), 600 to 1,000 words.
- Headings name what the section is about ("The bid and the ask", "Reading an option chain"). Not questions, no
  trailing punctuation, not a fixed template repeated on every lesson.
- A good order: what the thing is in plain words (with an everyday comparison if it truly helps) and why anyone
  needs it; the pieces one at a time, each new word in **bold** where it is defined; a worked example with small
  numbers done step by step by hand; the same thing in code with its output where code helps; how it shows up on a real trading day; the
  mistakes beginners make and what they cost. Fit the order to the subject.
- Define every term before you use it. If you must use a term from another lesson, explain it in a clause.
- Prefer one concrete example carried through the lesson over several unrelated ones.
- Code blocks are short (3 to 10 lines). Give an `out` whenever the code prints something, so the reader sees the
  result and the checker confirms it. Explain the non-obvious lines after the block. Use the standard library and NumPy only.
  Not every lesson needs code: a lesson on order types or on tilt is better served by worked examples in words and
  numbers. Make output deterministic: fix seeds, round floats, avoid long floats.
- Do not repeat the "In short" text word for word. The theory is the long version; overlap in content is expected.
- Be right. If you are not sure a claim is true, check it by running code or leave it out.

## Writing style

Plain, direct English, British spelling, second person. Short sentences. Say the thing; do not announce it.

- No filler or hype. Never use: simply, just, powerful, crucial, delve, robust, landscape.
- No em dashes. Use a full stop, a comma or a colon.
- No "Let's", no "In this lesson we will", no rhetorical questions.
- Be honest about trade-offs and about what is a rule of thumb.
- In TypeScript strings, use double quotes for text that contains an apostrophe, and template literals for code.
  Do not put `${` inside a template literal that holds Python. Escape backslashes in Python code (`\\n`).

## Checking your work (required)

From `trading-trainer/`:

```
npx tsc --noEmit -p .                    # types
npx vite-node scripts/theory.ts <module> # structure, and runs every code block that has an `out`
```

`theory.ts <module>` must end with `0 wrong`. Other people are writing other modules at the same time; ignore
problems in files that are not yours. Fix the content, never the checker.

## When you finish

Report: the lessons covered, the word count range, the final line of `theory.ts <module>`, and anything you were
unsure about or could not check.
