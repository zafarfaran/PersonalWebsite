import type { Module } from '../types'

export const volatility: Module = {
  id: 'volatility',
  title: 'Volatility',
  summary:
    'How much a price moves, measured from the past and priced into options for the future: realised and implied volatility, the expected move, IV rank, skew, the VIX and the crush after an event.',
  lessons: [
    {
      id: 'volatility-realised',
      title: 'Realised volatility',
      summary: 'The standard deviation of returns, and how to turn a daily figure into an annual one and back.',
      widget: 'volatility-realised',
      text: [
        "**Volatility** is how much a price moves around, measured as the standard deviation of its returns. It says nothing about direction. A stock that rises exactly 1% every day has zero volatility; one that goes up 3% and down 3% on alternate days has a lot.",
        'Start from returns, never from prices. The daily **log return** is `ln(close today ÷ close yesterday)`, which for small moves is almost the same as the percentage change. **Realised volatility** (also called historical volatility) is the standard deviation of those returns over a window, such as the last 20 trading days.',
        'Volatility is quoted per year. Variance grows in proportion to time, so standard deviation grows with the square root of time. With about 252 trading days a year, `annual = daily × √252` and `daily = annual ÷ √252`. Since √252 ≈ 15.9, traders round it to 16: a stock with 32% annual volatility moves about 2% on a typical day.',
        {
          code: `import numpy as np

closes = np.array([100.0, 101.5, 100.8, 102.0, 101.1])
r = np.log(closes[1:] / closes[:-1])   # daily log returns
daily = r.std(ddof=1)                  # sample standard deviation
annual = daily * np.sqrt(252)          # annualised realised volatility`,
        },
        'Realised volatility looks backwards. It depends on the window you choose, and one large day can dominate it: a 7% gap inside a 20-day window lifts the number for 20 days and then drops out of it, whatever the stock is doing by then. It is the yardstick you hold implied volatility against in the next lesson.',
      ],
      rules: [
        'Volatility is the standard deviation of returns. It measures the size of moves, not their direction.',
        'Use returns (log or percentage), never prices or dollar changes.',
        'Annual = daily × √252. Daily = annual ÷ √252, about annual ÷ 16.',
        'Over n trading days, multiply the daily figure by √n, not by n.',
        'Realised volatility is backward-looking and depends on the window. One big day can dominate it.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-realised-1',
          ask: 'The standard deviation of a stock\'s daily returns over the last month is 1.5%. What is its annualised realised volatility? Give a percentage, for example 25%.',
          answer: 0.2381,
          tol: 0.003,
          check: '0.015 * math.sqrt(252)',
          hint: 'Multiply by the square root of the number of trading days in a year.',
          why: '1.5% × √252 = 1.5% × 15.87 ≈ 23.8%. With the rule of 16 you get 24%, close enough for a quick read.',
        },
        {
          kind: 'number',
          id: 'volatility-realised-2',
          ask: 'A stock has 32% annual volatility. How big is a typical daily move (one standard deviation)? Give a percentage to two decimals, for example 1.25%.',
          answer: 0.0202,
          tol: 0.001,
          check: '0.32 / math.sqrt(252)',
          why: '32% ÷ √252 ≈ 2.02%. Dividing by 16 gives 2%. On a $50 stock that is about $1 on an ordinary day.',
        },
        {
          kind: 'choice',
          id: 'volatility-realised-3',
          ask: 'Stock A rises exactly 1% every day for 20 days. Stock B goes up 2% and down 2% on alternate days. Which has the higher realised volatility?',
          options: ['A, because it moved further in total', 'B, because its daily returns vary and A\'s do not', 'They are the same, because both move every day', 'You cannot tell without the prices'],
          answer: 1,
          why: 'Volatility is the spread of the returns around their average. A\'s returns are all the same, so their standard deviation is zero. B ends close to where it started but has a large spread. Trend and volatility are different things.',
        },
        {
          kind: 'output',
          id: 'volatility-realised-4',
          ask: 'NumPy\'s `std` divides by n unless you pass `ddof=1`. What does this print?',
          code: `import numpy as np

r = np.array([0.01, -0.01, 0.01, -0.01])
print(round(r.std(), 4), round(r.std(ddof=1), 4))`,
          answer: '0.01 0.0115',
          why: 'The mean is 0 and every squared deviation is 0.0001. Divided by 4 that gives a standard deviation of 0.01; divided by 3 (the sample version) it gives √0.000133 ≈ 0.0115. With 20 or more returns the difference is small, but be consistent.',
        },
        {
          kind: 'bug',
          id: 'volatility-realised-5',
          ask: 'This should return annualised realised volatility. On a $500 stock it gives a number five times as large as on a $100 stock that moves by the same percentages.',
          code: `import numpy as np

def realised_vol(closes):
    closes = np.array(closes, dtype=float)
    r = np.diff(closes)
    return r.std(ddof=1) * np.sqrt(252)`,
          line: 5,
          fix: '    r = np.log(closes[1:] / closes[:-1])',
          why: '`np.diff` gives dollar changes, which grow with the price. Volatility is measured on returns, so that stocks at any price can be compared.',
        },
        {
          kind: 'bug',
          id: 'volatility-realised-6',
          ask: 'This turns a daily standard deviation into an annual one. A daily 1% comes out as 252%.',
          code: `import numpy as np

def annualise(daily_sd):
    return daily_sd * 252`,
          line: 4,
          fix: '    return daily_sd * np.sqrt(252)',
          why: 'Variance scales with time; the standard deviation scales with the square root of time. 1% a day is about 15.9% a year, not 252%.',
        },
        {
          kind: 'number',
          id: 'volatility-realised-7',
          ask: 'A stock has 20% annual volatility. How big is a one standard deviation move over one week (5 trading days)? Give a percentage to two decimals.',
          answer: 0.0282,
          tol: 0.001,
          check: '0.20 * math.sqrt(5 / 252)',
          hint: 'Scale by the square root of the fraction of the year.',
          why: '20% × √(5/252) ≈ 2.82%. A common mistake is to divide the annual figure by 52 (0.38%), which treats volatility as if it grew in a straight line with time.',
        },
        {
          kind: 'choice',
          id: 'volatility-realised-8',
          ask: 'A stock fell 9% on one day 15 trading days ago and has been quiet since. Its 20-day realised volatility reads 38%. If it stays quiet, what happens over the next week?',
          options: [
            'The number drops sharply on the day the big move leaves the 20-day window',
            'It stays near 38%, because volatility is persistent',
            'It rises, because quiet days follow big ones',
            'It falls a little each day, in a straight line',
          ],
          answer: 0,
          why: 'Every return in the window counts equally, and the one 9% day supplies most of the variance. Five trading days later it falls out and the figure collapses overnight. Knowing what is inside the window stops you reading a cliff as news.',
        },
        {
          kind: 'choice',
          id: 'volatility-realised-9',
          ask: 'In the figure, set the true volatility to 16% and the window to 20 days, then choose the one −7% day. What happens to the realised volatility, and what happens when you widen the window to 60 days?',
          options: [
            'It jumps far above 16%; with a 60-day window the same day lifts it much less',
            'It barely changes, because one day out of 20 is too few to matter',
            'It jumps, and widening the window makes the jump larger',
            'It falls, because a drop lowers volatility',
          ],
          answer: 0,
          why: 'In the figure it goes from about 17% to about 29% with 20 days, but only to about 21% with 60. A squared 7% return is about 50 times a squared 1% return, so one day can outweigh all the others. Longer windows dilute it and react later.',
        },
        {
          kind: 'write',
          id: 'volatility-realised-10',
          numpy: true,
          ask: 'Write `realised_vol(closes)`: the annualised realised volatility from a list of daily closes, using log returns and the sample standard deviation.',
          starter: `import numpy as np

def realised_vol(closes):
    # closes: a list of daily closing prices, oldest first
    # returns annualised volatility as a decimal (0.20 means 20%)
    pass`,
          solution: `import numpy as np

def realised_vol(closes):
    closes = np.asarray(closes, dtype=float)
    r = np.log(closes[1:] / closes[:-1])
    return r.std(ddof=1) * np.sqrt(252)`,
          tests: `import math
closes = list(100 * np.exp(np.cumsum([0, 0.01, -0.01, 0.01, -0.01])))
out = realised_vol(closes)
assert out is not None, "the function returns nothing yet"
want = 0.01 * math.sqrt(4 / 3) * math.sqrt(252)
assert abs(out - want) < 1e-6, f"returns of +1%, -1%, +1%, -1% give {want:.4f}, got {out}: log returns, ddof=1, times sqrt(252)"
assert abs(realised_vol([5 * c for c in closes]) - want) < 1e-6, "the same moves on a stock five times the price must give the same volatility: use returns, not dollar changes"
steady = [100 * 1.01 ** i for i in range(10)]
assert realised_vol(steady) < 1e-6, "a stock that rises 1% every day has no volatility"`,
          why: 'Log returns, then the sample standard deviation, then √252. Working on returns makes the answer independent of the price level, and a steady trend gives zero.',
        },
        {
          kind: 'design',
          id: 'volatility-realised-11',
          ask: 'You want to compare a stock\'s 30-day implied volatility with how much it has really been moving. Describe how you would measure the realised side.',
          why: 'A realised number is only useful when you know what went into it. Matching the horizon and checking for one-off days keeps the comparison honest.',
          checklist: [
            { point: 'Use daily log (or percentage) returns of closing prices', why: 'Volatility is defined on returns. Prices or dollar changes give a number that depends on the share price.' },
            { point: 'Match the window to the option: about 21 trading days for 30 calendar days', why: 'Comparing a 30-day IV with a one-year realised figure mixes two different periods.' },
            { point: 'Look at a second, longer window for context', why: 'A 20-day figure is noisy. A 60-day one shows whether the recent period is unusual.' },
            { point: 'Annualise with √252', why: 'IV is quoted per year, so the realised figure must be too.' },
            { point: 'Check the window for one-off days such as an earnings gap and note when they drop out', why: 'One large day can double the figure and then vanish from it overnight.' },
            { point: 'Remember that it is backward-looking', why: 'Realised volatility describes the past. The option prices the future, which may include events the past did not.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-implied',
      title: 'Implied volatility',
      summary: 'Running the pricing model backwards to find the volatility the market is paying for.',
      widget: 'volatility-implied',
      text: [
        'Every input to an option price can be looked up except one. The stock price, strike, time to expiry and interest rate are known; future volatility is not. Run the pricing model the other way round: start from the price the market is paying and find the volatility that makes the model give that price. That number is the **implied volatility** (IV).',
        'A reminder from the pricing module: an option is worth more when volatility is higher, and **vega** is how many dollars per share its price changes for one point of volatility. Because the price rises steadily with volatility, each possible price matches exactly one volatility, and you can find it by **bisection**: try the middle of a range, price it, and keep the half where the answer must be.',
        {
          code: `lo, hi = 0.01, 3.0
for _ in range(50):
    mid = (lo + hi) / 2
    if bs_call(S, K, T, r, mid) < market_price:
        lo = mid          # model too cheap: needs more volatility
    else:
        hi = mid
iv = (lo + hi) / 2`,
        },
        'IV is two things at once. It is the market\'s forecast of how much the stock will move until expiry, set by buyers and sellers. And it is the option\'s **price tag**: a $2 option and a $5 option on different strikes or stocks cannot be compared in dollars, but 24% and 31% can. An option is called "expensive" when its IV is high against the volatility the stock has realised or against its own history.',
        'Each strike and expiry has its own IV, so "the IV of SPY" usually means at-the-money options about 30 days out. A price below the option\'s intrinsic value has no IV at all, which points to a stale or wrong quote. For a quick check at the money, with rates ignored: `price ≈ 0.4 × S × σ × √T`.',
      ],
      rules: [
        'IV is the volatility that makes the model price equal the market price.',
        'Price rises with volatility, so one price gives one IV, found by bisection.',
        'Compare options by IV, not by dollar price.',
        'Each strike and expiry has its own IV.',
        'At the money: price ≈ 0.4 × S × σ × √T. A price at or below intrinsic value has no IV.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-implied-1',
          ask: 'A stock is at $100. A 3-month (T = 0.25 years) at-the-money call costs $4.00. Using `price ≈ 0.4 × S × σ × √T`, estimate its IV. Give a percentage.',
          answer: 0.2,
          tol: 0.005,
          check: '4.00 / (0.4 * 100 * math.sqrt(0.25))',
          why: 'σ ≈ 4 ÷ (0.4 × 100 × 0.5) = 0.20. Bisection on the full model gives 20.06%, so the shortcut is close for at-the-money options.',
        },
        {
          kind: 'number',
          id: 'volatility-implied-2',
          ask: 'A stock is at $400 with 25% IV. Roughly what should a 30-day at-the-money call cost, per share? Use `0.4 × S × σ × √(days ÷ 365)` and give dollars to the nearest 10 cents.',
          answer: 11.47,
          tol: 0.1,
          check: '0.4 * 400 * 0.25 * math.sqrt(30 / 365)',
          why: '0.4 × 400 × 0.25 × √(30/365) = 40 × 0.287 ≈ $11.47, or $1,147 per contract. If the quote is far from this, check the strike, the expiry and whether an event is inside it.',
        },
        {
          kind: 'number',
          id: 'volatility-implied-3',
          ask: 'You hold one call with vega 0.12. Without any move in the stock, its IV rises from 25% to 30%. By about how much does the contract\'s value change, in dollars?',
          answer: 60,
          tol: 1,
          check: '0.12 * (30 - 25) * 100',
          why: 'Five points × $0.12 = $0.60 per share, × 100 shares = $60. The option gained value from repricing alone, with no change in the stock.',
        },
        {
          kind: 'choice',
          id: 'volatility-implied-4',
          ask: 'An option on stock X costs $1.20 and trades at 45% IV. An option on stock Y costs $6.50 and trades at 22% IV. Which is priced for the larger moves in its stock?',
          options: ['Y, because it costs more', 'X, because its price assumes more volatility', 'They are priced the same', 'Options on different stocks cannot be compared at all'],
          answer: 1,
          why: 'The dollar price depends on the stock price, the strike and the time. IV strips those out. Whether 45% is "too much" still depends on how much X really moves: compare it with X\'s realised volatility and its IV history.',
        },
        {
          kind: 'output',
          id: 'volatility-implied-5',
          ask: 'Bisection halves the bracket on every step. How many steps does it take to get a bracket narrower than 0.001 (a tenth of a volatility point), starting from 0 to 2?',
          code: `lo, hi = 0.0, 2.0
steps = 0
while hi - lo > 0.001:
    mid = (lo + hi) / 2
    lo = mid          # which half is kept does not change the count
    steps += 1
print(steps)`,
          answer: '11',
          why: 'The width after n steps is 2 ÷ 2ⁿ. 2 ÷ 1024 is a little under 0.002 and 2 ÷ 2048 is under 0.001, so 11 steps. Bisection is slow compared with other methods but it cannot fail when the price is valid.',
        },
        {
          kind: 'bug',
          id: 'volatility-implied-6',
          ask: 'This bisection for implied volatility ends at one edge of its range, 0.01 or 3.0, instead of the answer. Which line is wrong?',
          code: `def implied_vol(price, S, K, T, r):
    lo, hi = 0.01, 3.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if bs_call(S, K, T, r, mid) > price:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2`,
          line: 5,
          fix: '        if bs_call(S, K, T, r, mid) < price:',
          why: 'When the model price at `mid` is below the market price, the volatility must be higher, so the low end moves up. With the test reversed, the search moves away from the answer every time.',
        },
        {
          kind: 'choice',
          id: 'volatility-implied-7',
          ask: 'A stock trades at $100. A call with strike 90 shows a last price of $8.50, and your IV solver returns nonsense. What is the most likely reason?',
          options: [
            'The price is below the $10 intrinsic value, so no volatility produces it: the quote is stale or wrong',
            'The IV is very low, below 1%',
            'The solver needs more steps',
            'Calls in the money have negative IV',
          ],
          answer: 0,
          why: 'Any call is worth at least S − K = $10 here, at every volatility. A last trade from earlier in the day, before the stock rose, often causes this. Use the current bid and ask, not the last trade.',
        },
        {
          kind: 'write',
          id: 'volatility-implied-8',
          ask: 'Before solving for IV, check that one exists. Write `has_iv(price, S, K)` for a call with rates ignored: True only when the price is above intrinsic value and below the stock price.',
          starter: `def has_iv(price, S, K):
    # a call price must be above max(S - K, 0) and below S
    pass`,
          solution: `def has_iv(price, S, K):
    return max(S - K, 0) < price < S`,
          tests: `out = has_iv(2.0, 100, 100)
assert out is not None, "the function returns nothing yet"
assert out is True, "a $2 at-the-money call on a $100 stock has an IV"
assert has_iv(8.5, 100, 90) is False, "a 90 call on a $100 stock is worth at least $10, so $8.50 has no IV"
assert has_iv(10.5, 100, 90) is True, "$10.50 is above the $10 intrinsic value, so it has an IV"
assert has_iv(0.0, 100, 120) is False, "a price of zero has no IV"
assert has_iv(100.0, 100, 50) is False, "a call can never be worth the whole stock price"`,
          why: 'At zero volatility the model gives intrinsic value, and as volatility grows without limit the call approaches the stock price. Any price outside those bounds has no IV, and bisection would return an edge of its range.',
        },
        {
          kind: 'choice',
          id: 'volatility-implied-9',
          ask: 'In the figure, with strike 100, slide the market price from $2.00 to $4.00. What happens to the implied volatility?',
          options: [
            'It rises from about 17.5% to about 35%: near the money the price is close to proportional to volatility',
            'It rises by about 2 points',
            'It falls, because a dearer option needs less volatility',
            'It stays the same, because the strike did not change',
          ],
          answer: 0,
          why: 'For an at-the-money option, price ≈ 0.4 × S × σ × √T, so doubling the price roughly doubles the IV. That is why the shortcut works at the money and why dollar prices hide how much volatility you are paying for.',
        },
        {
          kind: 'choice',
          id: 'volatility-implied-10',
          ask: 'A 30-day option trades at 30% IV. What does that number mean?',
          options: [
            'The market prices the stock as if its annualised volatility until expiry will be 30%',
            'The stock will move 30% before expiry',
            'There is a 30% chance the option ends in the money',
            'The stock moved 30% over the past year',
          ],
          answer: 0,
          why: 'IV is an annual rate. Over 30 days, 30% annual works out to about 30% × √(30/365) ≈ 8.6% for one standard deviation. The next lesson turns IV into that range.',
        },
        {
          kind: 'design',
          id: 'volatility-implied-11',
          ask: 'A friend says a $0.50 call is cheap because it costs less than a dollar. Explain how you would judge whether an option is cheap or expensive.',
          why: 'The dollar price of an option says almost nothing about value. IV against the right yardsticks does, and even then cheap is not the same as profitable.',
          checklist: [
            { point: 'Convert the price to IV', why: 'Low dollar prices usually belong to far out-of-the-money or short-dated options, not cheap ones.' },
            { point: 'Compare the IV with the stock\'s realised volatility over a similar horizon', why: 'An option is rich or cheap compared with how much the stock actually moves.' },
            { point: 'Compare it with the stock\'s own IV history', why: 'IV rank and percentile (later in this module) say whether today is high or low for this stock.' },
            { point: 'Check for an event before expiry', why: 'Earnings inside the expiry make IV high for a reason.' },
            { point: 'Use the mid of the bid and ask, and note the spread', why: 'A wide spread makes the IV uncertain and costs you on entry and exit.' },
            { point: 'Cheap does not mean it will pay', why: 'A low-IV option still needs the stock to move enough, soon enough, and can expire worthless.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-expected-move',
      title: 'The expected move',
      summary: 'Turning IV, or the price of a straddle, into a price range, and what one standard deviation does not mean.',
      widget: 'volatility-move',
      text: [
        'IV turns into a price range. Scale the annual volatility to the time left and multiply by the stock price: `expected move = S × σ × √(days ÷ 365)`. Option IV is usually quoted on calendar days, so use 365 here. For trading days use `√(n ÷ 252)`; the two give nearly the same answer.',
        'SPY at 500 with a 30-day IV of 18%: 500 × 0.18 × √(30/365) ≈ 25.8. The options price SPY to finish within about 474 to 526 in 30 days, in roughly two cases out of three. For one trading day, `S × σ ÷ √252`, about `S × σ ÷ 16`.',
        'That range is **one standard deviation** (1σ). If returns were normal, about 68% of outcomes would land inside it, 16% above and 16% below. Two standard deviations cover about 95%. It does not say the stock will move that much, and it is not a limit: real returns have fat tails, so large moves happen more often than the bell curve says.',
        'The at-the-money **straddle** (a call and a put at the same strike, bought together) gives a read with no formula. Its price is about the average size of the move the market expects, which is about 0.8 × the 1σ move. A $4.00 straddle on a $100 stock prices an average move of about $4 and a 1σ move of about $5.',
        'For a day trader the expected move sets expectations. If SPY\'s expected move today is $5 and your plan needs $12 to reach its target, you are betting on a move of more than two standard deviations, which by this measure happens on only a few days a year.',
      ],
      rules: [
        '1σ expected move = S × σ × √(days ÷ 365), with calendar days.',
        'One trading day: S × σ ÷ √252, about S × σ ÷ 16.',
        '1σ: about 68% inside, 16% above, 16% below, under a normal model. Real tails are fatter.',
        'ATM straddle ≈ average move ≈ 0.8 × the 1σ move.',
        'The move grows with √time: four times as long gives twice the move.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-expected-move-1',
          ask: 'A stock is at $200 with a 30-day IV of 25%. What is the 1σ expected move to expiry, in dollars?',
          answer: 14.33,
          tol: 0.1,
          check: '200 * 0.25 * math.sqrt(30 / 365)',
          why: '200 × 0.25 × √(30/365) = 50 × 0.2867 ≈ $14.33. The options price a range of about 185.67 to 214.33, in roughly two cases out of three.',
        },
        {
          kind: 'number',
          id: 'volatility-expected-move-2',
          ask: 'SPY is at $500 and its short-dated IV is 16%. What is its 1σ move for one trading day, in dollars?',
          answer: 5.04,
          tol: 0.05,
          check: '500 * 0.16 / math.sqrt(252)',
          why: '500 × 0.16 ÷ √252 ≈ $5.04. The rule of 16 gives 500 × 0.01 = $5: a 16% IV means about a 1% day.',
        },
        {
          kind: 'number',
          id: 'volatility-expected-move-3',
          ask: 'A $150 stock\'s at-the-money straddle costs $6.00. Using straddle ≈ 0.8 × the 1σ move, what 1σ move does it imply, in dollars?',
          answer: 7.5,
          tol: 0.1,
          check: '6.00 / 0.8',
          why: '$6.00 ÷ 0.8 = $7.50. The straddle itself, $6, is the average size of the move. Both readings come from the same prices; be clear which one you are quoting.',
        },
        {
          kind: 'number',
          id: 'volatility-expected-move-4',
          ask: 'Under a normal model, what is the chance the stock finishes above its +1σ level? Give a percentage to one decimal.',
          answer: 0.1587,
          tol: 0.005,
          check: '1 - 0.5 * (1 + math.erf(1 / math.sqrt(2)))',
          why: 'About 68.3% lies within ±1σ, so 31.7% lies outside, split evenly: 15.9% above and 15.9% below. A 1σ move is something you should expect about one time in three.',
        },
        {
          kind: 'choice',
          id: 'volatility-expected-move-5',
          ask: 'SPY\'s expected move for the week is ±$10. Which statement is right?',
          options: [
            'SPY will move about $10 this week',
            'The options price roughly a 68% chance of finishing within $10 of today\'s price, so about one week in three should end outside it',
            'SPY cannot move more than $10 this week',
            'There is a 68% chance SPY rises $10',
          ],
          answer: 1,
          why: 'The expected move is a width, not a forecast of size or direction. Most weeks end inside it, a third end outside, and fat tails mean a few end far outside.',
        },
        {
          kind: 'output',
          id: 'volatility-expected-move-6',
          ask: 'What does this print?',
          code: `import math

S, iv = 100, 0.20
for days in (9, 36):
    print(round(S * iv * math.sqrt(days / 365), 2))`,
          answer: '3.14\n6.28',
          why: '100 × 0.2 × √(9/365) ≈ 3.14. Four times as many days gives √4 = 2 times the move: 6.28. Time to expiry helps a long option less than it seems.',
        },
        {
          kind: 'bug',
          id: 'volatility-expected-move-7',
          ask: 'For a $100 stock at 20% IV this gives a one-day expected move of 5 cents. Which line is wrong?',
          code: `import math

def expected_move(S, iv, days):
    return S * iv * (days / 365)`,
          line: 4,
          fix: '    return S * iv * math.sqrt(days / 365)',
          why: 'The move scales with the square root of time. √(1/365) ≈ 0.052, giving about $1.05 for one day, not 0.0027 × 20 = 5 cents.',
        },
        {
          kind: 'write',
          id: 'volatility-expected-move-8',
          ask: 'Write `expected_range(S, iv, days, n_sd=1)`: the low and high prices `n_sd` standard deviations either side of `S`, using calendar days.',
          starter: `import math

def expected_range(S, iv, days, n_sd=1):
    # returns (low, high)
    pass`,
          solution: `import math

def expected_range(S, iv, days, n_sd=1):
    move = n_sd * S * iv * math.sqrt(days / 365)
    return S - move, S + move`,
          tests: `out = expected_range(100, 0.20, 365)
assert out is not None, "the function returns nothing yet"
low, high = out
assert abs(low - 80) < 1e-9 and abs(high - 120) < 1e-9, f"over a full year at 20% the range is 80 to 120, got {out}"
low, high = expected_range(200, 0.25, 30)
assert abs(high - 214.3346) < 0.001, f"200 at 25% for 30 days should reach 214.33, got {high}: use the square root of days / 365"
low, high = expected_range(100, 0.20, 365, n_sd=2)
assert abs(low - 60) < 1e-9 and abs(high - 140) < 1e-9, "two standard deviations over a year at 20% is 60 to 140"`,
          why: 'The move is S × σ × √(days/365), multiplied by the number of standard deviations, and the range is centred on today\'s price. Centring on S ignores drift, which over days or weeks is tiny next to the move.',
        },
        {
          kind: 'choice',
          id: 'volatility-expected-move-9',
          ask: 'In the figure, set IV to 20% and the days to 9, then to 36. What happens to the 1σ move?',
          options: ['It quadruples, from about $3.14 to $12.56', 'It doubles, from about $3.14 to $6.28', 'It stays the same, because IV did not change', 'It halves'],
          answer: 1,
          why: 'Four times the time is √4 = 2 times the move. Doubling IV, on the other hand, doubles the move directly. Try both in the figure.',
        },
        {
          kind: 'number',
          id: 'volatility-expected-move-10',
          ask: 'SPY\'s 1σ expected move today is $5. Your trade only reaches its target if SPY moves $12 in your direction. How many standard deviations is that?',
          answer: 2.4,
          tol: 0.01,
          check: '12 / 5',
          why: '12 ÷ 5 = 2.4σ. Under a normal model, a move that large in one given direction happens well under 1% of days. Fat tails make it more common than that, but a plan that needs it is a long shot.',
        },
        {
          kind: 'design',
          id: 'volatility-expected-move-11',
          ask: 'Before the open you plan an intraday SPY trade with options. Describe how you would use the expected move to set your target and stop.',
          why: 'Targets and stops set in dollars without reference to the day\'s expected move are guesses. Scaling them to the move keeps them realistic.',
          checklist: [
            { point: 'Work out today\'s 1σ move from short-dated IV, the VIX or the 0DTE straddle', why: 'It tells you how big a normal day is today.' },
            { point: 'Express the target and the stop as fractions of that move', why: 'A target beyond 1σ is reached on a minority of days; one at 2σ rarely.' },
            { point: 'Account for the part of the move already made', why: 'If SPY has moved 1σ by midday, more movement is possible but no longer typical.' },
            { point: 'Check the calendar for scheduled news', why: 'Event days have larger moves and the IV already prices them.' },
            { point: 'Remember the option has costs the stock does not', why: 'The spread and time decay must be covered by the move before the trade makes money.' },
            { point: 'Size the trade for the stop, not the hoped-for move', why: 'The range describes the market, not your outcome. Your loss if wrong is what you control.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-rank',
      title: 'High or low: IV rank and IV percentile',
      summary: 'Comparing today\'s IV with the stock\'s own past, and why that is a starting idea and not a rule.',
      text: [
        'An IV of 35% means little on its own. For a large, steady company it is high; for a small biotech it is low. To decide whether options on a stock are cheap or rich today, compare its IV with its own past.',
        '**IV rank** places today\'s IV within the past year\'s range: `(IV − low) ÷ (high − low) × 100`. With a 52-week low of 20, a high of 60 and IV at 30, the rank is 25: a quarter of the way up the range.',
        '**IV percentile** counts days instead: the share of the past year\'s trading days on which IV was below today\'s. The two can disagree. One spike to 80 in a selloff stretches the range, so the rank looks low for months afterwards, while the percentile can still say IV is higher than on most days.',
        {
          code: `history = [22, 24, 21, 25, 80, 30, 26, 23]
iv = 30
rank = (iv - min(history)) / (max(history) - min(history)) * 100   # 15
pct = sum(h < iv for h in history) / len(history) * 100            # 75`,
        },
        'The starting idea: when IV is high against its own history, options are priced for large moves, which favours selling premium with defined risk; when it is low, buying options costs less per point of movement. It is not a rule. IV is often high for a reason, such as earnings next week or a falling market, and can go higher. Low IV can stay low for months. Test any rule built on it before trusting it.',
      ],
      rules: [
        'IV rank = (IV − 52-week low) ÷ (52-week high − low) × 100.',
        'IV percentile = share of the past year\'s days with IV below today\'s.',
        'One spike distorts the rank for a year; the percentile is steadier.',
        'High IV rank is a reason to look, not a signal: find out why IV is high.',
        'Compare a stock\'s IV with its own history and its realised volatility, not with other stocks.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-rank-1',
          ask: 'A stock\'s IV is 30%. Over the past year it ranged from 15% to 45%. What is its IV rank, as a number from 0 to 100?',
          answer: 50,
          tol: 0.5,
          check: '(30 - 15) / (45 - 15) * 100',
          why: '(30 − 15) ÷ (45 − 15) × 100 = 50. Today\'s IV sits halfway up its yearly range.',
        },
        {
          kind: 'number',
          id: 'volatility-rank-2',
          ask: 'Over the last 252 trading days, a stock\'s IV was below today\'s level on 189 days. What is its IV percentile, as a number from 0 to 100?',
          answer: 75,
          tol: 0.5,
          check: '189 / 252 * 100',
          why: '189 ÷ 252 = 0.75, so the percentile is 75: IV has been lower than today on three days out of four.',
        },
        {
          kind: 'output',
          id: 'volatility-rank-3',
          ask: 'What does this print?',
          code: `history = [18, 20, 19, 22, 70, 25, 21, 20]
iv = 24
rank = (iv - min(history)) / (max(history) - min(history)) * 100
pct = sum(h < iv for h in history) / len(history) * 100
print(round(rank), round(pct))`,
          answer: '12 75',
          why: 'The one day at 70 makes the range 18 to 70, so 24 sits only 6 ÷ 52 ≈ 12% of the way up. But 6 of the 8 days were below 24, so the percentile is 75. Same IV, opposite impressions.',
        },
        {
          kind: 'choice',
          id: 'volatility-rank-4',
          ask: 'The chart shows a year of IV for one stock, sampled every couple of weeks. Today (the last point) it is 28. Which describes it?',
          chart: {
            title: 'Implied volatility over a year',
            x: 'sample',
            y: 'IV (%)',
            series: [{ name: 'IV', points: [22, 23, 21, 24, 22, 20, 23, 25, 24, 22, 30, 45, 70, 55, 40, 33, 29, 27, 26, 25, 24, 23, 25, 26, 24, 25, 27, 26, 27, 28], color: 'accent' }],
          },
          options: [
            'IV rank is low (about 16) but IV percentile is high (about 73): IV is above most of the year\'s readings',
            'Both are high, because IV rose from 20',
            'Both are low, because the spike was 70',
            'IV rank is high and IV percentile is low',
          ],
          answer: 0,
          why: 'Rank = (28 − 20) ÷ (70 − 20) × 100 = 16, dragged down by the spike. 22 of the 30 readings are below 28, so the percentile is about 73. A rule that only uses rank would call this IV low.',
        },
        {
          kind: 'choice',
          id: 'volatility-rank-5',
          ask: 'A stock shows IV rank 95. What should you check first?',
          options: [
            'Whether a scheduled event, such as earnings, or news explains the high IV',
            'Nothing: rank 95 means sell options',
            'Whether the stock price is above 100',
            'The IV rank of other stocks',
          ],
          answer: 0,
          why: 'IV is high for a reason more often than not. If earnings are tomorrow, the high IV is the price of the jump the market expects, and selling it means taking that jump.',
        },
        {
          kind: 'bug',
          id: 'volatility-rank-6',
          ask: 'With a low of 20, a high of 60 and IV at 30, this returns 16.7 instead of 25. Which line is wrong?',
          code: `def iv_rank(history, iv):
    low = min(history)
    high = max(history)
    return (iv - low) / high * 100`,
          line: 4,
          fix: '    return (iv - low) / (high - low) * 100',
          why: 'Rank measures position within the range, so divide by its width, high − low. Dividing by the high alone shrinks every rank.',
        },
        {
          kind: 'bug',
          id: 'volatility-rank-7',
          ask: 'This IV percentile gives 90 when IV is at the bottom of its history and 0 at the top. Which line is wrong?',
          code: `def iv_percentile(history, iv):
    below = sum(1 for h in history if h > iv)
    return below / len(history) * 100`,
          line: 2,
          fix: '    below = sum(1 for h in history if h < iv)',
          why: 'The percentile counts the days on which IV was below today\'s. Counting days above gives 100 minus the percentile.',
        },
        {
          kind: 'write',
          id: 'volatility-rank-8',
          ask: 'Write `iv_percentile(history, iv)`: the percentage (0 to 100) of past readings strictly below today\'s IV.',
          starter: `def iv_percentile(history, iv):
    # history: a list of past IV readings   iv: today's IV
    pass`,
          solution: `def iv_percentile(history, iv):
    return sum(1 for h in history if h < iv) / len(history) * 100`,
          tests: `out = iv_percentile([10, 20, 30, 40], 35)
assert out is not None, "the function returns nothing yet"
assert abs(out - 75) < 1e-9, f"3 of 4 readings are below 35, so the answer is 75, got {out}"
assert iv_percentile([10, 20, 30, 40], 5) == 0, "nothing is below 5"
assert iv_percentile([10, 20, 30, 40], 20) == 25, "only readings strictly below count: 10 is below 20, 20 is not"
assert abs(iv_percentile([18, 20, 19, 22, 70, 25, 21, 20], 24) - 75) < 1e-9, "one spike to 70 does not change the percentile much"`,
          why: 'Count the readings below, divide by how many there are, scale to 100. Unlike the rank, one extreme reading moves it by only one count.',
        },
        {
          kind: 'choice',
          id: 'volatility-rank-9',
          ask: 'Stock A has an IV of 40% and stock B an IV of 25%. Which one has the richer options?',
          options: ['A, because 40 is higher than 25', 'B, because lower IV is safer', 'You cannot tell: compare each with its own history and its realised volatility', 'They are equal, because IV is annualised'],
          answer: 2,
          why: 'If A usually trades at 60% and B usually at 15%, A is cheap and B is rich. IV is compared with the same stock\'s past, not across stocks.',
        },
        {
          kind: 'number',
          id: 'volatility-rank-10',
          ask: 'A stock\'s 52-week IV range is 18% to 58%. At what IV, in percent, would its IV rank be 80? Give a number such as 45.',
          answer: 50,
          tol: 0.2,
          check: '18 + 0.8 * (58 - 18)',
          why: '80% of the way from 18 to 58 is 18 + 0.8 × 40 = 50.',
        },
        {
          kind: 'choice',
          id: 'volatility-rank-11',
          ask: 'SPY\'s IV rank is 5. A friend says buying calls now is close to free money because options are cheap. What is wrong with that?',
          options: [
            'Cheap options still lose if the stock does not move enough in time; low IV can stay low, and time decay still costs every day',
            'Nothing: low IV rank means options will rise',
            'Calls cannot be bought when IV rank is low',
            'IV rank does not apply to ETFs',
          ],
          answer: 0,
          why: 'Low IV lowers the cost of the bet; it does not change the need for a move. Most long options in quiet markets expire worth less than they cost.',
        },
        {
          kind: 'design',
          id: 'volatility-rank-12',
          ask: 'Write a rule that uses IV rank or percentile to decide when you would consider a defined-risk premium-selling trade, and say how you would test it before using it.',
          why: 'A volatility filter is a hypothesis. Writing it precisely and testing it is the only way to find out whether it helps.',
          checklist: [
            { point: 'State the measure, the threshold and the lookback (for example IV percentile above 70 over 252 days)', why: 'A vague rule cannot be tested or followed the same way twice.' },
            { point: 'Say how scheduled events are handled', why: 'High IV before earnings is a price for a known risk, not a free premium.' },
            { point: 'Require defined risk and a maximum loss sized to the account', why: 'High IV can go higher; the structure must cap the damage.' },
            { point: 'Add a second check such as IV above realised volatility', why: 'IV that is high for the stock but below what it is realising is not rich.' },
            { point: 'Test across calm periods and sharp selloffs, with costs included', why: 'Premium selling rules often look good until the one period that wipes out the gains.' },
            { point: 'Paper trade it before using real money, then start at the smallest size', why: 'A backtest misses fills, spreads and your own behaviour.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-skew',
      title: 'Skew and term structure',
      summary: 'Why IV differs across strikes and across expiries, and what each shape tells you.',
      text: [
        'The Black-Scholes model assumes one volatility for every strike. The market does not. Plot IV against strike for one expiry and you get a curve. For stock indexes it slopes down: out-of-the-money puts trade at higher IV than at-the-money options, out-of-the-money calls at lower. That slope is the **skew**.',
        'There are two reasons. Investors buy index puts as insurance, and that demand bids them up. And markets tend to fall faster than they rise, with volatility jumping in a selloff, so a put far below the market pays off more often than a normal model expects. Many single stocks show a flatter, U-shaped **smile**, and some, such as takeover targets or heavily traded meme stocks, can have calls priced richer than puts.',
        'The practical effect: compare strikes by IV, not only by price. A put 5% below SPY might trade at 24% IV while the at-the-money option is at 17%. Buy that put and you pay 7 extra points of volatility; sell it and you collect them, along with the crash risk they pay for.',
        '**Term structure** is IV across expiries. Usually far expiries have higher IV than near ones (an upward slope, often called contango). In a selloff, or before a known event, near-term IV jumps above longer-term IV and the curve inverts: the market expects the turbulence to be short-lived or tied to a date.',
        'Variance times time adds up across periods. From a 30-day IV and a 60-day IV you can back out what the market prices for the days in between, the **forward volatility**: `σ_fwd = √((σ₂² × T₂ − σ₁² × T₁) ÷ (T₂ − T₁))`.',
      ],
      rules: [
        'Index skew: out-of-the-money puts carry higher IV than at the money, out-of-the-money calls lower.',
        'Skew comes from demand for protection and from markets that fall fast with volatility rising.',
        'Compare strikes by IV. Buying an out-of-the-money index put means paying the skew.',
        'Normal term structure slopes up; inverted means near-term stress or a scheduled event.',
        'Variance × time adds across periods: use it to find forward volatility.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'volatility-skew-1',
          ask: 'Why do out-of-the-money SPX puts trade at a higher IV than at-the-money options?',
          options: [
            'Investors pay up for crash protection, and the index tends to fall fast with volatility rising',
            'Puts are always worth more than calls',
            'Interest rates push put prices up',
            'The exchange charges higher fees on puts',
          ],
          answer: 0,
          why: 'Demand for insurance and the shape of real index moves both raise the price of downside strikes. A normal model with one volatility underprices those crashes, so the market corrects it through higher IV.',
        },
        {
          kind: 'number',
          id: 'volatility-skew-2',
          ask: 'An out-of-the-money SPY put has vega 0.10 and trades at 24% IV; at-the-money options trade at 17%. How much more, in dollars per contract, are you paying than if the put were priced at the at-the-money IV?',
          answer: 70,
          tol: 1,
          check: '0.10 * (24 - 17) * 100',
          why: '7 points × $0.10 = $0.70 per share, $70 per contract. That is the price of the skew: worth paying only if you value the protection that much.',
        },
        {
          kind: 'choice',
          id: 'volatility-skew-3',
          ask: 'The chart shows IV against strike, from the lowest strike on the left to the highest on the right, for one expiry. What kind of underlying most likely produced it?',
          chart: {
            title: 'IV by strike, one expiry',
            x: 'strike, low to high',
            y: 'IV (%)',
            series: [{ name: 'IV', points: [29, 26, 23.5, 21, 19, 17.5, 16, 15, 14.5, 14.5, 15], color: 'accent' }],
          },
          options: [
            'A stock index such as SPX',
            'A stock with a takeover rumour, where calls are in demand',
            'A market where every strike has the same IV',
            'No real option chain looks like this',
          ],
          answer: 0,
          why: 'High IV at low strikes, falling towards the high strikes with a slight upturn at the end, is the typical index shape. A takeover rumour would lift the high-strike side instead.',
        },
        {
          kind: 'number',
          id: 'volatility-skew-4',
          ask: 'The 30-day IV is 20% and the 60-day IV is 25%. What forward volatility do the options price for days 30 to 60? Give a percentage to one decimal.',
          answer: 0.2915,
          tol: 0.002,
          check: 'math.sqrt((0.25**2 * 60 - 0.20**2 * 30) / (60 - 30))',
          hint: 'Work with variance × days: 0.0625 × 60 and 0.04 × 30.',
          why: 'Total variance to 60 days is 3.75 (in units of variance × days), to 30 days 1.2. The difference, 2.55, spread over 30 days is 0.085, whose square root is 29.2%. Something, perhaps an event, is priced for the second month.',
        },
        {
          kind: 'choice',
          id: 'volatility-skew-5',
          ask: 'This week\'s SPY options trade at 28% IV, next month\'s at 21% and the three-month ones at 20%. What does that term structure say?',
          options: [
            'The market prices heavy movement now and expects it to calm down',
            'The market expects volatility to keep rising for three months',
            'Near-term options are mispriced and certain to fall',
            'Nothing: term structure carries no information',
          ],
          answer: 0,
          why: 'An inverted curve means near-term stress or a dated event. It is a statement of expectation, not a certainty: if the turbulence lasts, the longer expiries will rise too.',
        },
        {
          kind: 'output',
          id: 'volatility-skew-6',
          ask: 'A chain\'s IV by strike. What does this print?',
          code: `chain = {480: 0.24, 490: 0.21, 500: 0.18, 510: 0.16, 520: 0.17}
low = min(chain, key=chain.get)
print(low, round(chain[480] - chain[500], 2))`,
          answer: '510 0.06',
          why: '`min` with `key=chain.get` returns the strike whose IV is lowest: 510 at 16%. The 480 put trades 6 points above the 500 strike: that gap is the skew.',
        },
        {
          kind: 'bug',
          id: 'volatility-skew-7',
          ask: 'This forward volatility gives 54.8% for a 30-day IV of 20% and a 60-day IV of 25%, instead of 29.2%. Which line is wrong?',
          code: `import math

def forward_vol(iv1, t1, iv2, t2):
    var = (iv2 * t2 - iv1 * t1) / (t2 - t1)
    return math.sqrt(var)`,
          line: 4,
          fix: '    var = (iv2 ** 2 * t2 - iv1 ** 2 * t1) / (t2 - t1)',
          why: 'Variance adds across time, volatility does not. Square each IV, weight by its time, subtract, divide by the gap, then take the square root.',
        },
        {
          kind: 'write',
          id: 'volatility-skew-8',
          ask: 'Write `forward_vol(iv1, t1, iv2, t2)`. Return None when the gap is not positive or the forward variance would be negative (the two quotes then contradict each other).',
          starter: `import math

def forward_vol(iv1, t1, iv2, t2):
    # iv1, iv2 as decimals; t1 < t2 in days (or years, as long as both match)
    pass`,
          solution: `import math

def forward_vol(iv1, t1, iv2, t2):
    if t2 <= t1:
        return None
    var = (iv2 ** 2 * t2 - iv1 ** 2 * t1) / (t2 - t1)
    if var < 0:
        return None
    return math.sqrt(var)`,
          tests: `out = forward_vol(0.20, 30, 0.25, 60)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.291548) < 1e-5, f"20% at 30 days and 25% at 60 days give 29.15% forward, got {out}: square the IVs"
assert abs(forward_vol(0.20, 30, 0.20, 60) - 0.20) < 1e-9, "a flat term structure gives the same forward volatility"
assert forward_vol(0.40, 30, 0.20, 60) is None, "total variance cannot fall with time: return None"
assert forward_vol(0.20, 60, 0.25, 30) is None, "the second expiry must be later than the first"`,
          why: 'σ² × T is the total variance to each expiry. The difference is the variance for the gap between them. A negative difference means the quotes are inconsistent, so there is no forward volatility to report.',
        },
        {
          kind: 'choice',
          id: 'volatility-skew-9',
          ask: 'You plan to sell far out-of-the-money SPX puts because their IV is the highest on the chain. What does that high IV pay you to carry?',
          options: [
            'The risk of a fast fall with volatility jumping, which can cost many times the premium',
            'Nothing: higher IV is free extra income',
            'Only the interest rate',
            'The cost of the bid-ask spread',
          ],
          answer: 0,
          why: 'Skew is the market\'s price for crash risk. Selling it earns small amounts most of the time and loses large amounts in the rare crash. If you sell, cap the risk with a spread and size for the bad day.',
        },
        {
          kind: 'number',
          id: 'volatility-skew-10',
          ask: 'The 7-day IV is 40% and the 35-day IV is 30%. What forward volatility is priced for days 7 to 35? Give a percentage to one decimal.',
          answer: 0.2693,
          tol: 0.002,
          check: 'math.sqrt((0.30**2 * 35 - 0.40**2 * 7) / (35 - 7))',
          why: '0.09 × 35 = 3.15 and 0.16 × 7 = 1.12. (3.15 − 1.12) ÷ 28 = 0.0725, √0.0725 ≈ 26.9%. The front week is priced hot; after it, the market expects calmer conditions.',
        },
        {
          kind: 'design',
          id: 'volatility-skew-11',
          ask: 'You want to buy an option on a stock and the IV is not flat across strikes or expiries. Describe how you would take skew and term structure into account when choosing the strike and expiry.',
          why: 'Two options on the same stock can carry very different volatilities. Choosing without looking means paying for things you did not mean to buy.',
          checklist: [
            { point: 'Read the IV of the exact strike and expiry, not one IV for the stock', why: 'The difference between strikes can be several volatility points.' },
            { point: 'Check whether the expiry contains a scheduled event', why: 'An event inside the expiry raises its IV, and that premium is lost after the event.' },
            { point: 'Compare near and far IVs before choosing the expiry', why: 'With an inverted curve the near expiry costs more per unit of time.' },
            { point: 'Know that out-of-the-money index puts include the skew premium', why: 'You pay for crash protection whether you want it or not.' },
            { point: 'Compare each IV with realised volatility', why: 'The yardstick for whether a volatility is high is how much the stock moves.' },
            { point: 'Check liquidity at the chosen strike', why: 'A wide spread can cost more than the IV difference you were trying to save.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-vix',
      title: 'The VIX',
      summary: 'What the VIX measures, how to read it as an expected daily move, and how it moves with the index.',
      text: [
        'The **VIX** is an index published by Cboe that measures the 30-day implied volatility of the S&P 500, calculated from the prices of a wide range of SPX options. It is quoted in volatility points: a VIX of 20 means the options price the index as if its annualised volatility over the next 30 days will be about 20%.',
        'Turn it into moves the same way as any IV. Daily: VIX ÷ √252, about VIX ÷ 16, in percent. A VIX of 16 prices a typical daily S&P 500 move of about 1%; a VIX of 32, about 2%. Over the 30 days it covers: VIX × √(30 ÷ 365).',
        'The VIX usually rises when stocks fall and drifts lower in steady rallies. Selloffs bring hedging demand and larger daily moves; calm rallies bring neither. It does not forecast direction: a high VIX says large moves are priced, either way.',
        'You cannot buy the VIX itself. Products that track it hold VIX futures, which in calm markets usually trade above the index and lose value as they roll towards it, so over weeks they can behave very differently from the index you see quoted. Treat the VIX as a gauge for planning. Other indexes have their own gauges, such as the VXN for the Nasdaq-100, and single stocks have their own IV.',
        'In daily preparation the VIX answers one question: how big is a normal day today? With the VIX at 24, a 1% drop in the S&P 500 is routine; with the VIX at 12 it is a large day. Scale stops, targets and size to the day you are in.',
      ],
      rules: [
        'VIX = 30-day implied volatility of the S&P 500 from SPX options, in annual percent.',
        'Expected daily S&P 500 move ≈ VIX ÷ 16, in percent.',
        'The VIX tends to rise when the index falls.',
        'A high VIX means large moves are priced in either direction. It is not a forecast of direction.',
        'You cannot own the VIX. VIX products follow futures and behave differently over time.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-vix-1',
          ask: 'The VIX is at 24. What daily S&P 500 move does it imply for one standard deviation? Give a percentage to two decimals.',
          answer: 0.0151,
          tol: 0.0005,
          check: '0.24 / math.sqrt(252)',
          why: '24% ÷ √252 ≈ 1.51%. The rule of 16 gives 1.5%. On such a day a 1% move is ordinary.',
        },
        {
          kind: 'number',
          id: 'volatility-vix-2',
          ask: 'The S&P 500 is at 5,000 and the VIX at 24. What is the implied one standard deviation daily move, in index points?',
          answer: 75.6,
          tol: 1,
          check: '5000 * 0.24 / math.sqrt(252)',
          why: '5,000 × 1.51% ≈ 75.6 points. That is the size of a normal day given today\'s prices, and a stop 20 points away would be inside ordinary noise.',
        },
        {
          kind: 'number',
          id: 'volatility-vix-3',
          ask: 'The VIX is at 16. What one standard deviation move does it price for the S&P 500 over the next 30 calendar days? Give a percentage to one decimal.',
          answer: 0.0459,
          tol: 0.001,
          check: '0.16 * math.sqrt(30 / 365)',
          why: '16% × √(30/365) ≈ 4.6%. That is the horizon the VIX is built for.',
        },
        {
          kind: 'choice',
          id: 'volatility-vix-4',
          ask: 'The chart shows the VIX over 15 trading days. What most likely happened to the S&P 500 over the same days?',
          chart: { title: 'VIX', x: 'trading day', y: 'VIX', series: [{ name: 'VIX', points: [13, 13.5, 12.8, 13.2, 14, 15.5, 18, 22, 27, 31, 29, 30, 26, 24, 22], color: 'bad' }] },
          options: [
            'It fell sharply in the middle of the period',
            'It rallied steadily',
            'Nothing: the VIX and the index are unrelated',
            'The VIX rise proves the index will fall next',
          ],
          answer: 0,
          why: 'The VIX more than doubled in a week, which almost always goes with a falling index. It describes what options are pricing now; it does not tell you the next move.',
        },
        {
          kind: 'choice',
          id: 'volatility-vix-5',
          ask: 'The VIX is at 35. Which reading is right?',
          options: [
            'Options price large S&P 500 moves, about 2.2% a day, in either direction',
            'The market will fall tomorrow',
            'The S&P 500 will move 35% this month',
            'It is a good time to buy the index',
          ],
          answer: 0,
          why: '35 ÷ √252 ≈ 2.2% for a typical day. A high VIX often comes after a fall, and rallies in such periods can be violent too. It sets the size of the day, not its direction.',
        },
        {
          kind: 'choice',
          id: 'volatility-vix-6',
          ask: 'A trader buys a product that tracks VIX futures in a calm market and holds it for three months. The VIX index ends the period where it started. What usually happened to the product?',
          options: [
            'It lost value, because the futures it holds usually trade above the index in calm markets and fall towards it as they roll',
            'It ended unchanged, because it tracks the VIX',
            'It gained, because volatility products always rise over time',
            'It doubled, because it is a geared product',
          ],
          answer: 0,
          why: 'The product owns futures, not the index. In calm periods those futures usually cost more than the VIX and drift down towards it, so a long holder loses value even when the VIX goes nowhere.',
        },
        {
          kind: 'output',
          id: 'volatility-vix-7',
          ask: 'What does this print?',
          code: `import math

for vix in (12, 24, 36):
    print(round(vix / math.sqrt(252), 2), end=' ')`,
          answer: '0.76 1.51 2.27',
          why: 'Each VIX level divided by √252 ≈ 15.87 gives the daily move in percent. Doubling the VIX doubles the expected daily move.',
        },
        {
          kind: 'bug',
          id: 'volatility-vix-8',
          ask: 'This should give the expected one-day move of the index in points. With the VIX at 16 and the index at 5,000 it returns about 3 points. Which line is wrong?',
          code: `import math

def daily_points(vix, level):
    daily = vix / 100 / 252
    return level * daily`,
          line: 4,
          fix: '    daily = vix / 100 / math.sqrt(252)',
          why: 'Volatility scales with the square root of time. 16% ÷ √252 ≈ 1.01%, which is about 50 points on 5,000, not 3.',
        },
        {
          kind: 'write',
          id: 'volatility-vix-9',
          ask: 'Write `vix_move(vix, level, days=1)`: the one standard deviation move of the index in points over a number of trading days.',
          starter: `import math

def vix_move(vix, level, days=1):
    # vix in points (20 means 20%), level of the index, days in trading days
    pass`,
          solution: `import math

def vix_move(vix, level, days=1):
    return level * vix / 100 * math.sqrt(days / 252)`,
          tests: `out = vix_move(16, 5000)
assert out is not None, "the function returns nothing yet"
assert abs(out - 50.397) < 0.01, f"VIX 16 on 5,000 gives about 50.4 points a day, got {out}: is the VIX divided by 100?"
assert abs(vix_move(20, 4000, 21) - 230.94) < 0.01, "21 trading days at VIX 20 on 4,000 is about 231 points: use the square root of days / 252"
assert abs(vix_move(32, 5000) - 2 * vix_move(16, 5000)) < 1e-9, "twice the VIX should give twice the move"`,
          why: 'Convert points to a decimal, scale by the square root of the fraction of a year in trading days, multiply by the level. This is the "rule of 16" written out.',
        },
        {
          kind: 'number',
          id: 'volatility-vix-10',
          ask: 'Yesterday SPY was at $500 and moved $9. The VIX was 15. Roughly how many standard deviations was the move? Give one decimal.',
          answer: 1.9,
          tol: 0.05,
          check: '9 / (500 * 0.15 / math.sqrt(252))',
          why: 'A 1σ day at VIX 15 is 500 × 0.15 ÷ 15.87 ≈ $4.72. $9 ÷ $4.72 ≈ 1.9σ: a big but not extraordinary day. Measuring days this way tells you whether the market is behaving as priced.',
        },
        {
          kind: 'design',
          id: 'volatility-vix-11',
          ask: 'Describe how you would use the VIX in your preparation before the open.',
          why: 'The VIX is most useful as a measure of how big today\'s moves are likely to be, which feeds directly into stops, targets and size.',
          checklist: [
            { point: 'Turn it into today\'s expected S&P 500 move in points and in SPY dollars', why: 'A number you can set a stop and a target against.' },
            { point: 'Compare it with recent days\' actual ranges', why: 'If the market has been moving more than the VIX prices, or less, that is worth knowing.' },
            { point: 'Note whether it is rising or falling into the open', why: 'A rising VIX often goes with a weak market and wider ranges.' },
            { point: 'Check the calendar for scheduled releases such as CPI or a Fed decision', why: 'The VIX already prices them; the day will have a jump at a known time.' },
            { point: 'Use the right gauge for what you trade', why: 'The VIX is for the S&P 500. QQQ has the VXN; a single stock has its own IV.' },
            { point: 'Do not read it as a direction signal', why: 'It prices the size of moves, not which way they go.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-events',
      title: 'Events and IV crush',
      summary: 'Earnings, Fed days and CPI: why IV rises into them, collapses after, and why a long option can lose even when you are right.',
      widget: 'volatility-crush',
      text: [
        'Some days are known in advance to be big: a company\'s **earnings** report, a Federal Reserve rate decision, the monthly CPI inflation report. At the time of writing (2026) the Fed holds eight scheduled meetings a year with the statement at 2:00 p.m. Eastern, and the CPI comes out at 8:30 a.m. Eastern, before the open; check dates and times on the Fed and BLS calendars and with your broker. Options that expire after an event price its expected jump, so their IV rises into it.',
        'Once the news is out, that uncertainty is gone and IV falls back, often within minutes: **IV crush**. An option priced at 70% IV before earnings may be priced at 30% the next morning. Its price drops by roughly vega × the fall in IV, whichever way the stock moved.',
        'An example: a $100 stock reports tonight and the 7-day at-the-money straddle costs $7.73 at 70% IV. Tomorrow the stock opens at $104 with IV at 30%. The straddle is worth about $4.63. You were right that it would move and lost $310 per straddle, because the options had priced a move of about 7.7% and 4% was less.',
        'The **implied event move** is what the options price for the event alone. The quick read is the price of the straddle in the first expiry after the event, as a share of the stock price. From IVs: `event move ≈ √((σ_event² − σ_normal²) × T)`, with T the time to that expiry in years. Compare it with how far the stock really moved after past reports; that history is a tendency, not a promise.',
        'A long option through an event needs the move to beat the implied move. A short option collects the crush but carries the report that moves twice as far, and a naked short can lose many times its premium. Defined risk and small size, or no trade at all, are the sensible defaults.',
      ],
      rules: [
        'IV rises into scheduled events and collapses after them: IV crush.',
        'After the event an option loses about vega × the IV drop, whatever the direction.',
        'A long option through an event needs a move larger than the implied move.',
        'Implied move ≈ straddle ÷ stock price, in the first expiry after the event.',
        'Compare implied moves with past moves. Short premium through an event needs defined risk and small size.',
        'Check event dates and times on official calendars (the company, the Fed, the BLS).',
      ],
      questions: [
        {
          kind: 'number',
          id: 'volatility-events-1',
          ask: 'You hold one call with vega 0.15 into earnings. IV falls from 80% to 35% after the report. Estimate the change in the contract\'s value from the IV drop alone, in dollars (negative for a loss).',
          answer: -675,
          tol: 5,
          check: '0.15 * (35 - 80) * 100',
          why: '−45 points × $0.15 = −$6.75 per share, −$675 per contract. Vega changes as IV moves, so this is an estimate, but it shows the size: the stock needs a large move in your favour to make that back.',
        },
        {
          kind: 'number',
          id: 'volatility-events-2',
          ask: 'A $200 stock reports tonight. The at-the-money straddle in the first expiry after the report costs $12. What move does it imply? Give a percentage.',
          answer: 0.06,
          tol: 0.001,
          check: '12 / 200',
          why: '$12 ÷ $200 = 6%. A long straddle needs more than that, a short straddle less, before costs.',
        },
        {
          kind: 'number',
          id: 'volatility-events-3',
          ask: 'The expiry 8 calendar days away contains earnings and trades at 60% IV. The stock normally trades at 30% IV. Using `√((σ_event² − σ_normal²) × T)`, what one standard deviation move is priced for the report? Give a percentage to one decimal.',
          answer: 0.0769,
          tol: 0.002,
          check: 'math.sqrt((0.60**2 - 0.30**2) * 8 / 365)',
          why: '(0.36 − 0.09) × 8/365 = 0.0059, whose square root is 7.7%. All the extra variance in that expiry is put on the one day of the report.',
        },
        {
          kind: 'choice',
          id: 'volatility-events-4',
          ask: 'You buy a call the day before earnings. The company beats, the stock rises 2%, and your call is worth less than you paid. Why?',
          options: [
            'IV collapsed after the report, and the loss from vega was larger than the gain from delta',
            'The broker made an error',
            'Calls lose value when the stock rises',
            'Beating earnings is bad news',
          ],
          answer: 0,
          why: 'The call\'s price carried a large expected move. A 2% rise was smaller than that, so the gain from the move did not cover the IV that left the option overnight.',
        },
        {
          kind: 'choice',
          id: 'volatility-events-5',
          run: true,
          ask: 'The example from the text, worked out in Black-Scholes. What does this print?',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def straddle(S, K, T, sigma):
    d1 = (math.log(S / K) + sigma ** 2 / 2 * T) / (sigma * math.sqrt(T))
    call = S * N(d1) - K * N(d1 - sigma * math.sqrt(T))
    return 2 * call - S + K       # put from put-call parity, no rates

before = straddle(100, 100, 7 / 365, 0.70)
after = straddle(104, 100, 6 / 365, 0.30)
print(round(after - before, 2))`,
          options: ['-3.1', '3.1', '0.0', '-7.73'],
          answer: 0,
          why: 'The straddle costs $7.73 and is worth $4.63 after a 4% move with IV at 30%: a loss of $3.10 per share, $310 per straddle. Being right about the move is not enough; it must be bigger than the price paid for it.',
        },
        {
          kind: 'output',
          id: 'volatility-events-6',
          ask: 'A stock\'s moves after its last eight reports, against today\'s implied move. What does this print?',
          code: `past_moves = [0.031, 0.072, 0.045, 0.028, 0.110, 0.039, 0.052, 0.036]
implied = 0.06
beat = sum(m > implied for m in past_moves)
print(beat, len(past_moves))`,
          answer: '2 8',
          why: 'Only 0.072 and 0.110 beat 6%. On this history the options have usually priced more than was delivered. Eight reports is a small sample, and the two large moves show the risk a seller carries.',
        },
        {
          kind: 'bug',
          id: 'volatility-events-7',
          ask: 'This should estimate the P&L of a long option position from an IV change. For an IV drop from 70 to 30 it reports a profit. Which line is wrong?',
          code: `def crush_pnl(vega, iv_before, iv_after, contracts):
    # vega in dollars per share per point of IV, IVs in points
    change = vega * (iv_before - iv_after)
    return change * 100 * contracts`,
          line: 3,
          fix: '    change = vega * (iv_after - iv_before)',
          why: 'A long option gains when IV rises and loses when it falls, so the change is vega × (after − before). The reversed sign turns every crush into a profit.',
        },
        {
          kind: 'write',
          id: 'volatility-events-8',
          ask: 'Write `implied_event_move(event_iv, normal_iv, days)`: the one standard deviation move priced for the event, as a decimal. Return None when the event expiry\'s IV is not above the normal IV.',
          starter: `import math

def implied_event_move(event_iv, normal_iv, days):
    # IVs as decimals, days = calendar days to the expiry that contains the event
    pass`,
          solution: `import math

def implied_event_move(event_iv, normal_iv, days):
    if event_iv <= normal_iv:
        return None
    return math.sqrt((event_iv ** 2 - normal_iv ** 2) * days / 365)`,
          tests: `out = implied_event_move(0.60, 0.30, 8)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.076927) < 1e-5, f"60% vs 30% over 8 days prices a 7.69% event move, got {out}: subtract the squares, then scale by days / 365"
assert implied_event_move(0.50, 0.50, 8) is None, "no extra IV means no event premium: return None"
assert abs(implied_event_move(0.50, 0.30, 365) - 0.4) < 1e-9, "over a full year 50% vs 30% gives sqrt(0.25 - 0.09) = 0.4"`,
          why: 'Variance adds: the event expiry\'s total variance is the normal variance for every day plus the event\'s own. Subtract, then take the square root.',
        },
        {
          kind: 'choice',
          id: 'volatility-events-9',
          ask: 'In the figure, keep the IV at 70% before and 30% after. How far up must the stock move by the next morning for the straddle to break even?',
          options: ['About 2%', 'About 4%', 'About 7.7%', 'About 15%'],
          answer: 2,
          why: 'The figure shows a break-even of about 7.65%, close to the 7.7% implied move. Now set the IV after to 70% as well: the break-even falls to about 3.3%. The crush is what demands the big move.',
        },
        {
          kind: 'choice',
          id: 'volatility-events-10',
          ask: 'You buy a SPY call at 3:55 p.m., planning to sell it after the CPI report the next morning. CPI comes in as expected and SPY opens flat. What is likely to have happened to the call?',
          options: [
            'It opens lower: the event premium in its IV is gone, along with a night of time decay',
            'It opens higher, because the report removed the risk',
            'It is unchanged, because SPY did not move',
            'It cannot be traded until 10 a.m.',
          ],
          answer: 0,
          why: 'CPI comes out at 8:30 a.m. Eastern, before the open, so the uncertainty you paid for is resolved before you can sell. A flat open means no gain from delta and a loss from vega and theta.',
        },
        {
          kind: 'choice',
          id: 'volatility-events-11',
          ask: 'On a Fed day the statement comes out at 2:00 p.m. Eastern. What usually happens to the IV of SPY options expiring that day?',
          options: [
            'It stays raised through the morning and usually drops once the statement is out',
            'It falls all morning and jumps at 2:00 p.m.',
            'It is the same as on any other day',
            'It always rises after the statement',
          ],
          answer: 0,
          why: 'Until 2:00 p.m. the options carry the premium for the jump. After the statement, and the press conference that follows, the uncertainty is resolved and that premium leaves, even if the index moves.',
        },
        {
          kind: 'design',
          id: 'volatility-events-12',
          ask: 'Plan how you would decide whether to trade a stock\'s earnings report at all, and with what.',
          why: 'Event trades are where long options lose to the crush and short options lose to the gap. A plan that says when not to trade protects the account.',
          checklist: [
            { point: 'Confirm the date and whether the report is before the open or after the close', why: 'It decides which expiry and which session take the jump.' },
            { point: 'Work out the implied move from the straddle or from the IVs', why: 'It is the bar the move must clear for a long option and stay under for a short one.' },
            { point: 'Compare it with the stock\'s moves after past reports', why: 'A history of moves larger or smaller than implied is the only evidence you have, and it is thin.' },
            { point: 'Use defined risk if you sell premium', why: 'One report can gap several times the implied move; a naked short option can lose many times its premium.' },
            { point: 'Size so that the worst case, the full loss of a long or the max loss of a spread, is within your risk per trade', why: 'Stops do not work through an overnight gap.' },
            { point: 'Accept that no trade is a valid decision', why: 'Most of the time the options price the event fairly enough that there is nothing to gain.' },
            { point: 'Paper trade a few reports first', why: 'Seeing the crush happen once teaches more than reading about it.' },
          ],
        },
      ],
    },
    {
      id: 'volatility-lab',
      title: 'Lab: a volatility toolkit',
      summary: 'Realised volatility, the expected move, Black-Scholes, implied volatility by bisection and IV rank, from scratch.',
      text: [
        'This lab builds the volatility tools a trader uses every day, in plain Python with no libraries beyond the standard library: log returns and realised volatility from closing prices, the expected move from an IV, the Black-Scholes call price, implied volatility by bisection, and IV rank and percentile.',
        'Each step is self-contained, so the helper functions it needs are repeated in its starter code. Build each piece, run the tests, then move on. Together they answer the questions you ask before a trade: how much has this stock been moving, how much are the options pricing, and is that high or low for this stock?',
        'The normal distribution\'s cumulative function comes from `math.erf`: `N(x) = 0.5 × (1 + erf(x ÷ √2))`. Black-Scholes for a call is `S × N(d1) − K × e^(−rT) × N(d2)` with `d1 = (ln(S/K) + (r + σ²/2) × T) ÷ (σ√T)` and `d2 = d1 − σ√T`.',
      ],
      rules: [
        'Realised volatility: the sample standard deviation of log returns × √252.',
        'Expected move: S × σ × √(days ÷ 365).',
        'Implied volatility: bisection on the model price, after checking the price is possible.',
        'IV rank uses the range; IV percentile counts days. Report both.',
        'Test every piece on a case you can work out by hand.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'volatility-lab-1',
          ask: 'Step 1: write `log_returns(closes)`: the list of daily log returns `ln(today ÷ yesterday)` from a list of closes.',
          starter: `import math

def log_returns(closes):
    # closes: oldest first; returns one fewer value than closes
    pass`,
          solution: `import math

def log_returns(closes):
    return [math.log(b / a) for a, b in zip(closes, closes[1:])]`,
          tests: `import math
out = log_returns([100, 110, 99])
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, f"3 closes give 2 returns, got {len(out)}"
assert abs(out[0] - math.log(1.1)) < 1e-12, "the first return is ln(110 / 100) = 0.0953"
assert abs(out[1] - math.log(0.9)) < 1e-12, "the second return is ln(99 / 110) = -0.1054: divide today by yesterday"
assert abs(sum(log_returns([100, 120, 90, 100]))) < 1e-12, "log returns add up: a round trip back to 100 sums to 0"`,
          why: 'Pairing each close with the next using `zip(closes, closes[1:])` gives every day-to-day ratio. Log returns add across days, which is why the round trip sums to zero.',
        },
        {
          kind: 'write',
          id: 'volatility-lab-2',
          ask: 'Step 2: write `realised_vol(closes, window=20)`: the annualised realised volatility of the last `window` log returns, using the sample standard deviation.',
          starter: `import math
import statistics

def log_returns(closes):
    return [math.log(b / a) for a, b in zip(closes, closes[1:])]

def realised_vol(closes, window=20):
    # use only the last \`window\` returns
    pass`,
          solution: `import math
import statistics

def log_returns(closes):
    return [math.log(b / a) for a, b in zip(closes, closes[1:])]

def realised_vol(closes, window=20):
    r = log_returns(closes)[-window:]
    return statistics.stdev(r) * math.sqrt(252)`,
          tests: `import math
closes = [100.0]
for i in range(30):
    closes.append(closes[-1] * math.exp(0.01 if i % 2 == 0 else -0.01))
out = realised_vol(closes)
assert out is not None, "the function returns nothing yet"
want = 0.01 * math.sqrt(20 / 19) * math.sqrt(252)
assert abs(out - want) < 1e-9, f"20 returns of +1% and -1% give {want:.4f}, got {out}: sample standard deviation times sqrt(252)"
assert abs(realised_vol([125.0] + closes) - want) < 1e-9, "a big move older than the window must not count"
assert abs(realised_vol(closes, window=10) - 0.01 * math.sqrt(10 / 9) * math.sqrt(252)) < 1e-9, "use the window you are given"`,
          why: '`statistics.stdev` is the sample standard deviation (it divides by n − 1). Slicing with `[-window:]` keeps only the most recent returns, so old shocks drop out exactly when they leave the window.',
        },
        {
          kind: 'write',
          id: 'volatility-lab-3',
          ask: 'Step 3: write `expected_move(S, iv, days)`: return `(low, high)`, one standard deviation either side of `S`, with calendar days.',
          starter: `import math

def expected_move(S, iv, days):
    pass`,
          solution: `import math

def expected_move(S, iv, days):
    m = S * iv * math.sqrt(days / 365)
    return S - m, S + m`,
          tests: `out = expected_move(100, 0.20, 365)
assert out is not None, "the function returns nothing yet"
assert abs(out[0] - 80) < 1e-9 and abs(out[1] - 120) < 1e-9, f"a year at 20% on 100 gives 80 to 120, got {out}"
low, high = expected_move(200, 0.25, 30)
assert abs((high - low) / 2 - 14.3346) < 0.001, f"200 at 25% over 30 days is a move of 14.33, got {(high - low) / 2}"
low, high = expected_move(100, 0.20, 4 * 30)
assert abs((high - low) / 2 - 2 * 100 * 0.20 * math.sqrt(30 / 365)) < 1e-9, "four times the days should give twice the move"`,
          why: 'The 1σ move is S × σ × √(days/365). It grows with the square root of time, which the last test checks.',
        },
        {
          kind: 'write',
          id: 'volatility-lab-4',
          ask: 'Step 4: write `bs_call(S, K, T, r, sigma)`, the Black-Scholes price of a European call, with `N` built from `math.erf`.',
          starter: `import math

def N(x):
    # cumulative normal distribution
    pass

def bs_call(S, K, T, r, sigma):
    # T in years, r and sigma as decimals
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)`,
          tests: `out = bs_call(100, 100, 30 / 365, 0.0, 0.20)
assert out is not None, "the function returns nothing yet"
assert abs(out - 2.28715) < 1e-4, f"a 30-day at-the-money call at 20% should cost 2.2872, got {out}"
assert abs(bs_call(100, 110, 0.5, 0.05, 0.30) - 5.58709) < 1e-4, "the 110 call, 6 months, 5% rate, 30% vol should cost 5.5871"
assert abs(bs_call(150, 100, 0.1, 0.0, 0.10) - 50) < 1e-6, "a deep in-the-money call is worth its intrinsic value"
assert bs_call(100, 100, 0.25, 0.0, 0.40) > bs_call(100, 100, 0.25, 0.0, 0.20), "more volatility must mean a higher price"`,
          why: 'Two lines for d1 and d2, one for the price. The last test is the property bisection relies on in the next step: the price rises with volatility.',
        },
        {
          kind: 'write',
          id: 'volatility-lab-5',
          ask: 'Step 5: write `implied_vol(price, S, K, T, r)` by bisection between 0.0001 and 5. Return None if the price is not above intrinsic value `max(S − K × e^(−rT), 0)` or not below `S`.',
          starter: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)

def implied_vol(price, S, K, T, r):
    pass`,
          solution: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * math.sqrt(T)
    return S * N(d1) - K * math.exp(-r * T) * N(d2)

def implied_vol(price, S, K, T, r):
    if price <= max(S - K * math.exp(-r * T), 0) or price >= S:
        return None
    lo, hi = 0.0001, 5.0
    for _ in range(100):
        mid = (lo + hi) / 2
        if bs_call(S, K, T, r, mid) < price:
            lo = mid
        else:
            hi = mid
    return (lo + hi) / 2`,
          tests: `out = implied_vol(bs_call(100, 110, 0.5, 0.05, 0.30), 100, 110, 0.5, 0.05)
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.30) < 1e-6, f"pricing at 30% and solving back should give 0.30, got {out}"
assert abs(implied_vol(4.00, 100, 100, 0.25, 0.0) - 0.2006) < 0.0001, "a $4 three-month at-the-money call is at about 20.06%"
assert implied_vol(8.50, 100, 90, 0.1, 0.0) is None, "a price below the $10 intrinsic value has no IV"
assert implied_vol(120.0, 100, 100, 0.1, 0.0) is None, "a call cannot cost more than the stock"`,
          why: 'Check the bounds first, because bisection on an impossible price quietly returns one end of its range. A hundred halvings of a range of 5 leave an error far below any quoted precision.',
        },
        {
          kind: 'bug',
          id: 'volatility-lab-6',
          ask: 'Step 6: a colleague\'s pricer gives prices that are too high for long-dated options and too low for options with less than a year. Which line is wrong?',
          code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def bs_call(S, K, T, r, sigma):
    d1 = (math.log(S / K) + (r + sigma ** 2 / 2) * T) / (sigma * math.sqrt(T))
    d2 = d1 - sigma * T
    return S * N(d1) - K * math.exp(-r * T) * N(d2)`,
          line: 8,
          fix: '    d2 = d1 - sigma * math.sqrt(T)',
          why: 'd2 is d1 − σ√T. With σ × T the gap is too small when T < 1 and too large when T > 1, so every IV backed out of this pricer would be wrong too. Test a pricer against a known value before trusting the IVs it produces.',
        },
        {
          kind: 'write',
          id: 'volatility-lab-7',
          ask: 'Step 7: write `iv_rank_percentile(history, iv)`: return `(rank, percentile)`, both from 0 to 100. If the history has no range (high equals low), return a rank of 0.',
          starter: `def iv_rank_percentile(history, iv):
    # rank: position in the range; percentile: share of readings strictly below
    pass`,
          solution: `def iv_rank_percentile(history, iv):
    low, high = min(history), max(history)
    rank = 0 if high == low else (iv - low) / (high - low) * 100
    pct = sum(1 for h in history if h < iv) / len(history) * 100
    return rank, pct`,
          tests: `out = iv_rank_percentile([20, 30, 40, 60], 30)
assert out is not None, "the function returns nothing yet"
rank, pct = out
assert abs(rank - 25) < 1e-9, f"30 in a range of 20 to 60 is a rank of 25, got {rank}"
assert abs(pct - 25) < 1e-9, f"1 of 4 readings is below 30, a percentile of 25, got {pct}"
rank, pct = iv_rank_percentile([18, 20, 19, 22, 70, 25, 21, 20], 24)
assert round(rank) == 12 and pct == 75, f"a spike makes the rank 12 while the percentile is 75, got {rank}, {pct}"
assert iv_rank_percentile([25, 25, 25], 25)[0] == 0, "with no range, return a rank of 0 instead of dividing by zero"`,
          why: 'Reporting both protects you from the spike problem: when rank and percentile disagree, look at the history before acting on either.',
        },
        {
          kind: 'design',
          id: 'volatility-lab-8',
          ask: 'Step 8: you now have the pieces. Design a one-screen daily volatility report for the five tickers you trade, built from these functions.',
          why: 'Tools are only useful if they answer the questions you ask before a trade, every day, in the same way.',
          checklist: [
            { point: 'Realised volatility over 20 and 60 days', why: 'Shows how much the stock has been moving, short and longer term.' },
            { point: 'At-the-money IV for the expiry you trade, from the mid price', why: 'What the options are charging now.' },
            { point: 'IV minus realised, or IV divided by realised', why: 'The simplest measure of whether options are rich or cheap against actual movement.' },
            { point: 'Today\'s 1σ expected move in dollars', why: 'Sets the scale for stops and targets.' },
            { point: 'IV rank and percentile, side by side', why: 'Context against the stock\'s own year, with a check against spikes.' },
            { point: 'Upcoming events inside the expiry', why: 'Explains high IV and warns of a crush.' },
            { point: 'A note that the report describes prices, not what to trade', why: 'It feeds a plan; it is not a signal on its own.' },
          ],
        },
      ],
    },
  ],
}
