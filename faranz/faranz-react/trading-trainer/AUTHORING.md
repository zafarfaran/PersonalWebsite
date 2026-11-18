# Writing a module for the trading trainer

The course is a list of modules (see `CURRICULUM.md` for all of them and what each one covers). A module is four files:

- `src/content/<module>.ts` exports `const <module>: Module` (types in `src/types.ts`): lessons and questions
- `src/widgets/<module>.tsx` exports `const <module>Widgets: Record<string, ComponentType>`: interactive figures
- `src/content/videos/<module>.ts` exports `const <module>Videos: ModuleVideos`: what to watch (see "Videos" below)
- `src/content/theory/<module>.ts` exports `const <module>Theory`: the long explanation of each lesson (see `THEORY.md`)

All four already exist as empty placeholders and are already registered. **Edit only your four files.** Do not touch
the framework, other modules, package files or git.

This trainer is a copy of the framework of a machine learning course in the sibling folder `../ml-trainer`. Its maths
module is the finished example of the format: read `../ml-trainer/src/content/maths.ts` (at least the first three
lessons and the lab) and `../ml-trainer/src/widgets/maths.tsx` before you write anything, and `src/types.ts` and
`src/components/Plot.tsx` here for the building blocks. Copy the format and the quality, not the subject. Never edit
anything in `../ml-trainer`.

## Who it is for

Someone who writes Python and has never placed a trade. They want to go from zero to day trading options with a
tested plan: understand the market, read price, know exactly what an option position will do, size it, and judge
honestly whether they have an edge. Practical over theoretical. Every lesson should leave them able to *do* something.

The market is US-listed shares, ETFs and options (SPY, QQQ, SPX, large single stocks), prices in dollars, one option
contract on 100 shares. Tickers in examples are real, but **every price, chain and chart is made up** and kept simple.

## Honesty and safety (this subject can cost the learner real money)

- Teach how things work and how to decide. Never tell the learner to buy or sell a particular thing, never promise
  or imply profits, never present a setup as a sure thing. No "this strategy makes money". Say what a setup needs to
  be true, how it fails and how you would test it.
- Be plain about the odds: most retail day traders lose money, costs and slippage eat small edges, a bought option
  can go to zero, a sold naked option can lose far more than the premium collected. Put the risk beside the reward
  every time a strategy is introduced.
- Push the safe path: paper trade first, then the smallest size, defined-risk structures, a fixed fraction of the
  account at risk per trade, a daily loss limit.
- Rules and numbers that change (pattern day trader rule and its minimum equity, margin rules, settlement times,
  contract specifications, trading hours, tax treatment) must be checked with a web search before you state them,
  stated as "at the time of writing" with the year (2026), and the learner told to check with their broker. Tax and
  regulation differ by country: say so, and do not give tax advice.
- Finance facts must be right. Work every number by hand or in Python. If you are not sure, check or leave it out.

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
building on the one before: for example an option payoff engine, Black-Scholes with Greeks from scratch, a position
sizer, a backtest of an opening range breakout on made-up bars. Each `write` step must be self-contained (repeat the helper functions it needs in the `starter`), since
steps are run separately. The lab's `text` says what is being built and why, and its `rules` are the takeaways.

In `text`, `rules`, `ask`, `why`, `hint` and choice options, `` `backticks` `` mark inline code and `**stars**` mark bold.
Nothing else is rendered: no markdown lists, links or LaTeX. Write maths with plain characters (x², √t, Σ, σ, Δ).

Question ids are `<lesson id>-<n>` and must be unique.

## Question kinds (see `src/types.ts`)

| kind | what the learner does | notes |
|---|---|---|
| `choice` | picks one option | 3 or 4 options, one right. Add `code` to ask about code, or `chart` for a line chart (a price series, an equity curve, a payoff line). With `run: true` the right option must be exactly what `code` prints. |
| `output` | types what the code prints | Keep the output short and unambiguous: an int, a shape, a short list. Avoid long floats (round them). |
| `bug` | clicks the wrong line | `line` is 1-based, `fix` is the whole corrected line **with its indentation**. Exactly one line is wrong. |
| `number` | types a number | **Always** add `check`: a Python expression (with `np` and `math` available) that evaluates to the answer. Say the unit and the rounding in `ask` ("in dollars", "to 2 decimal places"). The answer box reads `25%` as 0.25, so either ask for "a percentage, for example 25%" and store 0.25, or ask for a plain number. Set `tol` when rounding matters. |
| `write` | writes a function, run against tests in the browser | Runs in Pyodide: **standard library and NumPy only** (set `numpy: true` if you import it). No scipy, pandas or anything else: for the normal CDF use `0.5 * (1 + math.erf(x / math.sqrt(2)))`. The `starter` must fail the tests, the `solution` must pass. Give every assert a message that tells the learner what is wrong. Start the tests by checking the function returns something. |
| `design` | sketches an answer, then ticks a checklist | 5 to 8 checklist items, each a `point` and a `why`. Use for open questions: plan this trade, review this losing day, write the rules for this setup. |

Use the kinds that fit the lesson. Trading is mostly arithmetic and judgement, so most lessons lean on `number`
(P&L, breakeven, position size, Greeks), `choice` (scenarios, with charts where a curve tells the story) and `design`.
Code is the learner's calculator and testing tool: use `output`, `bug` and `write` for payoff functions, sizing
functions, indicators, statistics and backtests. Aim for each module to have at least 12 `number`, 4 `write`, 4 `bug`,
4 `output` and 4 `design` questions unless the subject really does not allow it.

What makes a good question:

- It tests the thing a trader gets wrong in practice, not a definition. "You are long this call and the stock is flat for two days: what happened to your P&L?" beats "What is theta?".
- Wrong options are the mistakes people really make. No joke options.
- `why` teaches: it says why the right answer is right and, where useful, why the tempting one is wrong. 1 to 3 sentences.
- Numbers in a question are simple enough to do in your head or on paper.
- Code is short (3 to 12 lines), real, and runnable where the kind requires it.

## Checking your work (required)

Code in `output`, `choice`+`run`, `number`+`check` and `write` questions is executed by a script. From `trading-trainer/`:

```
npx tsc --noEmit -p .                         # types
npx vitest run                                # structure of every lesson and question
npx vite-node scripts/dump.ts <module>        # then:
python scripts/verify.py <module>             # runs the code in your questions
```

Python here has numpy and scipy. Use scipy only to check your own numbers, never in a question: the browser has
only the standard library and NumPy, so keep all question code to those.

Other people are writing other modules in the same folder at the same time. If `tsc` or `vitest` reports a problem in
a file that is not yours, ignore it. Everything in your own two files must be clean, and `verify.py <module>` must
report `0 wrong`. Fix the content, never the checker. Do not weaken a test to make it pass.

## Figures

A figure is a React component with no props, registered under the name `'<module>-<name>'`. It goes in the "Try it"
card beside the lesson text, about 340px wide on a desktop and full width on a phone.

- Build it from `src/components/Plot.tsx`: `Plot` (axes and scale), `Path`, `Curve`, `Dot`, `Seg`, `Label`, `Slider`,
  `Readout`, `nearest`, `fmt`, `seeded`, `gaussian`. Look at how the maths figures in `../ml-trainer/src/widgets/maths.tsx` use them. Plain SVG inside the
  `Plot` render function is fine for bars, rectangles and heat maps (use `s.x`, `s.y`, `s.w`, `s.h`).
- Wrap it in `<div className="widget">`. Controls: `Slider`, `<div className="seg">` with buttons (class `on` for the
  chosen one), `<div className="actions">` with `<button className="btn">`. Tables: `<table className="cells">`.
- Colours come from CSS variables through the `color` props (`accent`, `good`, `bad`, `blue`, `muted`, `text`,
  `amber`, `purple`), or `var(--accent)` etc. in raw SVG. Never hard-code a colour.
- End with `<p className="caption">`: two to four sentences that say what to do and what to notice. Tie it to practice.
- Data must be the same on every visit: use `seeded(n)` and `gaussian(...)`, never `Math.random()` at render time.
- Good figures here: a payoff diagram whose strikes and premium you change, an order book you send orders into, a
  candle chart (rects and lines in raw SVG) with a moving average whose length you change, an option price against
  time or volatility with sliders, an equity curve for a win rate and payoff ratio you set. Prices are made up and
  come from `seeded`.
- A figure must teach one thing by letting the learner change something and see the consequence. A static picture is
  not a figure. Every registered figure must be used by a lesson, and at least one question in that lesson should
  send the learner to the figure ("In the figure, set … What happens?").
- Aim for 3 or 4 figures per module, on the lessons where a picture does the most work. Keep each under about 120 lines.
- TypeScript is strict (`noUnusedLocals`, `noUnusedParameters`). No new dependencies.

## Writing style

Plain, direct English, British spelling, second person. Short sentences. Say the thing; do not announce it.

- No filler, no hype, no "simply", "just", "powerful", "crucial", "delve", "robust", "landscape".
- No em dashes. Use a full stop, a comma or a colon.
- No rhetorical questions as headings, no "Let's", no "In this lesson we will".
- Be honest about trade-offs and about what is a rule of thumb.
- Be right. If you are not sure a claim is true, leave it out or check it by running code. Wrong content is worse than missing content.
- In TypeScript strings, prefer double quotes for text that contains an apostrophe, and template literals for code.
  Do not put `${` inside a template literal that holds Python.

## Videos

`src/content/videos/<module>.ts` (types in `src/content/videos/types.ts`):

```ts
export const <module>Videos: ModuleVideos = {
  lessons: { '<lesson id>': [{ id: '<11-char YouTube id>', title: '...', by: '<channel>' }] },   // 1 or 2 per lesson, for most lessons
  module: [ ... ],        // 1 to 3 longer videos: a full course or a talk that covers the module
  playlists: [{ list: '<playlist id>', title, by, about: 'one line on what it covers', lessons: ['<lesson id>', ...] }],   // 1 to 3
}
```

- Find them with web search. Choose teachers with a reputation for teaching, not selling: for example Khan Academy,
  CME Group, Cboe, the Options Industry Council, tastylive, projectfinance, Option Alpha, Investopedia, MIT
  OpenCourseWare, Patrick Boyle, Ben Felix, The Plain Bagel. No "I made $10k in a day" videos, no teasers for paid
  courses, no signal groups.
- **Never write an id from memory.** For every video fetch
  `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json` with curl (playlists:
  `https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=<id>&format=json`) and copy the title
  and channel it returns. If you cannot confirm an id, leave the video out. A lesson with no video is fine. A wrong
  link is not. More than half of your lessons should have a video, and the module needs at least one playlist.
- Check: `npx vite-node scripts/videos.ts <module>` must report `0 to check`.

## Order of work

1. Read this file, `CURRICULUM.md`, `THEORY.md`, the types and the example.
2. Write the lessons, questions and figures. Run the checks until `verify.py <module>` reports `0 wrong`.
3. Write the videos file and check it.
4. Write the theory (`THEORY.md`) and check it.
5. Run `npx tsc --noEmit -p .` once more and make sure none of the errors are in your files.

## When you finish

Report: the lessons you wrote, the count of questions by kind, the figures, the number of videos, the final lines of
`verify.py`, `videos.ts` and `theory.ts`, and
anything you were unsure about or could not check.
