import type { Block } from '../../types'

/** The full theory for each lesson of the volatility module, keyed by lesson id. */
export const volatilityTheory: Record<string, Block[]> = {
  'volatility-realised': [
    { h: 'What volatility measures' },
    'Two stocks can end a month at the same price and have lived very different months. One drifted up a few cents a day. The other lurched up and down by several dollars. **Volatility** is the number that tells them apart: it measures how large the moves are, not which way they went.',
    'Options traders care about it more than almost anything else, because an option is a bet on how far a price can travel before expiry. This lesson measures the volatility a stock has already shown. The next lessons turn to the volatility that option prices expect.',
    { sub: 'Size, not direction' },
    'A stock that rises exactly 0.5% every single day for a month has made a strong trend and has zero volatility, because every daily change is the same. A stock that alternates +4% and −4% goes nowhere and is very volatile. Keep trend and volatility apart in your head; they answer different questions.',

    { h: 'From prices to returns' },
    'Volatility is always measured on **returns**, the change from one close to the next as a fraction of the price. Dollar changes will not do: a $1 move is large for a $20 stock and tiny for a $900 one. Returns put every stock on the same scale.',
    { sub: 'Log returns' },
    'Traders usually use the **log return**: `ln(close today ÷ close yesterday)`, where ln is the natural logarithm. For small moves it is almost equal to the percentage change: a rise from 80 to 80.80 is a 1% change and a log return of 0.00995. Log returns have one handy property: they add up across days. Two days of log returns summed give the log return over both days.',

    { h: 'The standard deviation' },
    'The **standard deviation** measures how spread out a list of numbers is around its average. To get it: find the average, subtract it from each number, square those differences, average the squares (this average is the **variance**), and take the square root.',
    'There is one detail that trips people up in code. When the numbers are a sample, such as the last 20 days, you divide the sum of squares by n − 1 instead of n. This is the **sample standard deviation**. In NumPy, `np.std(x)` divides by n and `np.std(x, ddof=1)` divides by n − 1. The `statistics.stdev` function in the standard library uses n − 1.',
    {
      code: `import numpy as np

closes = np.array([80.0, 80.8, 79.6, 80.4, 81.2])
r = np.log(closes[1:] / closes[:-1])
print(np.round(r, 4))
print(round(r.std(ddof=1), 4))`,
      out: `[ 0.01   -0.015   0.01    0.0099]
0.0125`,
    },
    '`closes[1:] / closes[:-1]` divides every close by the one before it, so four ratios come from five closes. The standard deviation of those four returns is about 1.25%: that is the stock\'s daily volatility over this short window.',

    { h: 'Annualising with the square root of time' },
    'Volatility is quoted per year so that every stock and every option can be compared on one scale. The step from daily to yearly rests on one fact: if each day\'s return is independent of the others, variances add. A year of about 252 trading days has 252 times the daily variance, so its standard deviation is √252 times the daily one.',
    { list: ['Annual volatility = daily standard deviation × √252.', 'Daily standard deviation = annual volatility ÷ √252.', 'Over n trading days, the standard deviation is the daily one × √n.'] },
    'Since √252 ≈ 15.87, traders round it to 16, the **rule of 16**. A stock with 48% annual volatility moves about 3% on a typical day; one with 8% annual volatility, about 0.5%. The stock above, at 1.25% a day, has an annual volatility of about 1.25 × 15.87 ≈ 19.8%.',
    { sub: 'Why not multiply by the number of days' },
    'Moves partly cancel: an up day is often followed by a down day. Over 9 days the typical total move is √9 = 3 times a daily move, not 9 times. Multiplying by 252 instead of √252 turns a 1% daily figure into a nonsensical 252% annual one.',

    { h: 'Windows and the one big day' },
    'Realised volatility (also called historical volatility) always comes with a **window**: the number of past days it uses. A 20-day window reacts quickly and is noisy; a 60-day window is steadier and slower. Neither is right. Choose the window that matches the question, for example about 21 trading days when you compare it with a 30-calendar-day option.',
    'Because the returns are squared, one large day weighs far more than many small ones. A 6% day squared is 36 times a 1% day squared. Put one 6% earnings gap into a 20-day window of otherwise 1% days and the realised figure roughly doubles. Twenty trading days later the gap leaves the window and the figure falls back overnight, though nothing happened that day. When a realised number jumps or collapses, look at what entered or left the window.',
    'In the figure for this lesson you can see both effects: the sample never lands exactly on the true volatility, and a single shock lifts a short window much more than a long one.',

    { h: 'Mistakes that cost money' },
    {
      list: [
        'Computing the standard deviation of prices, or of dollar changes, instead of returns. The answer then depends on the share price.',
        'Annualising with 252 instead of √252, or a weekly figure with 52 instead of √52.',
        'Treating a trend as volatility. A steady rise has none.',
        'Reading realised volatility as a forecast. It describes what happened, and the next month may contain an event the last month did not.',
        'Forgetting what is in the window, then being surprised when the number drops the day a big move falls out of it.',
      ],
    },
  ],

  'volatility-implied': [
    { h: 'The one input you cannot look up' },
    'A reminder from the pricing module: an option\'s value in the Black-Scholes model depends on five inputs, the stock price, the strike, the time to expiry, the interest rate and the volatility. Four of them are known the moment you look at the screen. The fifth, how much the stock will move until expiry, is not known to anyone.',
    'So traders run the model backwards. Take the price the market is paying for the option, keep the four known inputs, and search for the volatility that makes the model produce that price. The answer is the **implied volatility**, or **IV**: the volatility implied by the price.',
    { sub: 'Why one price gives one volatility' },
    'An option is worth more when volatility is higher, because a wider range of outcomes makes the big payoffs more likely while the loss is still capped at the premium. **Vega** measures this: how many dollars per share the option\'s price changes for one point (1%) of volatility. Because the price rises steadily as volatility rises, no two volatilities give the same price. Any valid price corresponds to exactly one IV.',

    { h: 'Finding it by bisection' },
    'There is no formula that gives IV directly, so you search. **Bisection** is the simplest search that cannot fail. Start with a bracket that surely contains the answer, say 1% to 300%. Price the option at the middle of the bracket. If the model price is below the market price, the volatility must be higher, so the middle becomes the new bottom. Otherwise it becomes the new top. Each step halves the bracket.',
    {
      code: `width = 3.0
steps = 0
while width > 0.0001:
    width /= 2
    steps += 1
print(steps)`,
      out: '15',
    },
    'After n steps the bracket is the starting width divided by 2ⁿ. To shrink 3.0 below 0.0001 (a hundredth of a volatility point) takes 15 halvings. Fifty or a hundred steps cost nothing on a computer and leave an error far smaller than any quote.',
    { sub: 'Getting the direction right' },
    'The one line that matters is the comparison. Model price too low means you need more volatility: move the bottom up. Swap it and the search runs away from the answer every step and ends at an edge of the bracket. A test that prices an option at a known volatility and solves back for it catches this immediately.',

    { h: 'Prices that have no IV' },
    'At zero volatility the model gives the option its **intrinsic value**, the amount it is in the money (for a call, the stock price minus the strike, or zero). As volatility grows without limit, a call\'s value approaches the stock price itself. So with rates ignored, a call price must lie strictly between `max(S − K, 0)` and `S`.',
    'A quote outside those bounds has no IV, and bisection would quietly return an edge of its bracket. In practice this happens with a stale **last price**: the last trade may be from hours ago, before the stock moved. Take IV from the current bid and ask, usually the **mid**, the average of the two.',

    { h: 'A shortcut for at-the-money options' },
    'For an option whose strike is at the stock price, with rates ignored, the Black-Scholes price is very nearly `0.4 × S × σ × √T`, with T in years. It comes from the shape of the normal curve (0.4 is close to 1 ÷ √(2π)).',
    {
      code: `import math

S, sigma, T = 60, 0.35, 45 / 365
print(round(0.4 * S * sigma * math.sqrt(T), 2))`,
      out: '2.95',
    },
    'Turn it around and you can estimate IV from a price in your head: σ ≈ price ÷ (0.4 × S × √T). It is close at the money and drifts away from the true value as the strike moves away from the stock price.',

    { h: 'Forecast and price tag' },
    { sub: 'The market\'s forecast' },
    'IV is the volatility that buyers and sellers have agreed to pay for. In that sense it is the market\'s forecast of how much the stock will move until expiry, annualised. A 40% IV on a 30-day option does not mean a 40% move in 30 days; it means the option is priced as if the stock\'s annual volatility over those 30 days will be 40%.',
    { sub: 'The price tag' },
    'IV also works as the option\'s price, on a scale that strips out the stock price, the strike and the time. A $0.40 option and an $8 option on different stocks cannot be compared in dollars, but 52% and 28% can. Traders call an option expensive when its IV is high compared with the volatility the stock actually shows, or with its own past IV. A low dollar price is not cheapness: far out-of-the-money and short-dated options cost little because they usually expire worthless.',
    'Every strike and every expiry has its own IV. When people speak of one stock\'s IV they normally mean at-the-money options about 30 days out.',

    { h: 'Mistakes to watch for' },
    {
      list: [
        'Calling an option cheap because its dollar price is low.',
        'Solving for IV from a stale last trade instead of the current mid.',
        'Forgetting that IV moves on its own: with vega 0.08, a 4-point rise in IV adds $0.32 per share, $32 per contract, with the stock unchanged.',
        'Treating IV as a promise. It is a price set by supply and demand, and the stock can move more or less.',
      ],
    },
  ],

  'volatility-expected-move': [
    { h: 'From a percentage to a range in dollars' },
    'An IV of 30% is hard to picture. A statement such as "the options price this $60 stock to stay between $55 and $65 for the next month, most of the time" is easy to use. The **expected move** is that translation: it turns an annual volatility into a price range for a chosen number of days.',
    { sub: 'The formula' },
    'Scale the annual volatility to the time left with the square root of time, as in the realised volatility lesson, then multiply by the stock price: `expected move = S × σ × √(days ÷ 365)`. Option IV is normally quoted on calendar days, so use 365 with calendar days. For trading days, `√(n ÷ 252)` gives almost the same result: 10 calendar days and 7 trading days come out within a few percent of each other.',

    { h: 'A worked example' },
    'A $60 stock, IV 30%, 45 calendar days to expiry. The fraction of a year is 45 ÷ 365 = 0.123. Its square root is 0.351. Multiply: 60 × 0.30 × 0.351 ≈ $6.32. The expected move is about ±$6.32, a range of about $53.68 to $66.32.',
    {
      code: `import math

S, iv = 60, 0.30
for days in (1, 45, 180):
    print(days, round(S * iv * math.sqrt(days / 365), 2))`,
      out: `1 0.94
45 6.32
180 12.64`,
    },
    'Four times as many days (45 to 180) gives twice the move, not four times. Time helps an option buyer less than intuition suggests. For a single trading day you can use `S × σ ÷ √252`, or the rule of 16: S × σ ÷ 16. For the stock above, 60 × 0.30 ÷ 16 ≈ $1.13.',

    { h: 'What one standard deviation means' },
    'The expected move is **one standard deviation**, written 1σ (σ is the Greek letter sigma). If daily returns followed the bell-shaped **normal distribution**, about 68% of outcomes would land within 1σ of today\'s price, about 16% above and 16% below. About 95% would land within 2σ.',
    { sub: 'Computing the chances' },
    'The share of a normal distribution below a point x standard deviations from the middle is `N(x) = 0.5 × (1 + erf(x ÷ √2))`, where erf is `math.erf` in Python. The chance of finishing beyond 2σ on the upside is 1 − N(2).',
    {
      code: `import math

N = lambda x: 0.5 * (1 + math.erf(x / math.sqrt(2)))
print(round(N(1) - N(-1), 3), round(1 - N(2), 4))`,
      out: '0.683 0.0228',
    },
    { sub: 'What it does not mean' },
    'It does not say the stock will move that much: most periods end inside the range, and a third end outside it. It is not a limit either. Real returns have **fat tails**: large moves happen more often than the normal curve says. And it says nothing about direction.',

    { h: 'Reading the move from a straddle' },
    'A **straddle** is a call and a put at the same strike and expiry, bought together. It pays off when the stock moves far in either direction. Its price at the money is a quick read of the market\'s expected move with no formula at all.',
    'Precisely, the at-the-money straddle prices the **average size** of the move, and for a normal distribution the average size is about 0.8 × the 1σ move (the exact factor is √(2/π) ≈ 0.798). So a $5.00 straddle on a stock says the average move is about $5 and the 1σ move about $6.25. Different traders quote one or the other as "the expected move"; know which one you are looking at. The straddle also shows the break-even prices for someone who buys it: the strike plus and minus its cost.',

    { h: 'Using it on a trading day' },
    'For a day trader the expected move is a ruler. If QQQ is at $440 with short-dated IV of 20%, a typical day is about 440 × 0.20 ÷ 15.87 ≈ $5.55. A plan whose target needs $11 is asking for a 2σ day. A stop $1 away sits well inside ordinary noise. Express targets and stops as fractions of the day\'s expected move and you can tell at a glance whether the plan is ordinary or a long shot.',
    'Remember the part of the move already used. If the index has gone 1σ by late morning, more is possible, but you are no longer asking for an ordinary day.',

    { h: 'Common mistakes' },
    {
      list: [
        'Leaving out the square root: multiplying by days ÷ 365 instead of its square root makes short-term moves far too small.',
        'Mixing calendar days with 252, or trading days with 365.',
        'Reading 1σ as the move that will happen, or as the most it can move.',
        'Confusing the straddle price (average move) with the 1σ move, which is about 25% larger.',
      ],
    },
  ],

  'volatility-rank': [
    { h: 'High compared with what' },
    'Different stocks live at different volatilities. A large consumer-goods company might trade at 18% IV in a normal month. A young biotech might trade at 90%. So an IV of 40% says nothing on its own: for the first it would be extraordinary, for the second calm. To judge whether options are rich or cheap, compare a stock\'s IV with that same stock\'s past.',
    'Two standard measures do this, both over the past year (about 252 trading days). They often agree, and when they do not, the disagreement is itself informative.',

    { h: 'IV rank' },
    '**IV rank** says where today\'s IV sits within the past year\'s range, from 0 at the yearly low to 100 at the yearly high: `IV rank = (IV − low) ÷ (high − low) × 100`.',
    { sub: 'A worked example' },
    'Over the past year a stock\'s IV ranged from 24% to 64%, a range 40 points wide. Today it is 34%. That is 10 points above the low, and 10 ÷ 40 = 0.25, so the IV rank is 25. Going the other way, an IV rank of 50 here would be an IV of 24 + 0.5 × 40 = 44%.',

    { h: 'IV percentile' },
    '**IV percentile** counts days instead of measuring distance: the share of the past year\'s readings that were below today\'s IV, times 100. If IV was lower than today on 63 of the past 252 days, the percentile is 25. Count only readings strictly below today\'s; a reading equal to today\'s is not below it.',
    {
      code: `history = [31, 33, 30, 35, 90, 41, 36, 32, 34, 37]
iv = 36
rank = (iv - min(history)) / (max(history) - min(history)) * 100
pct = sum(1 for h in history if h < iv) / len(history) * 100
print(round(rank), round(pct))`,
      out: '10 60',
    },
    '`sum(1 for h in history if h < iv)` counts the readings below today\'s. Six of the ten are below 36, so the percentile is 60. But the single reading of 90 stretches the range to 30 to 90, so 36 sits only a tenth of the way up and the rank is 10.',

    { h: 'When the two disagree' },
    { sub: 'The spike problem' },
    'One violent week, a selloff or a scare, can send a stock\'s IV to a level it touches once a year. For the next twelve months that spike defines the top of the range, and every ordinary reading looks low by rank. The percentile is barely affected, because the spike is only a few days out of 252.',
    'So when rank is low and percentile is high, IV is above most of the year\'s days but far below one extreme. When both are high, IV really is unusual for this stock. Look at a chart of the year\'s IV whenever the two numbers tell different stories.',
    { sub: 'Other sources of error' },
    'Both measures depend on which IV is recorded each day (usually at-the-money, about 30 days out) and on the lookback. Platforms differ, so the same stock can show different values in different places. Use one source consistently.',

    { h: 'From measure to decision' },
    'The usual starting idea is this. When IV is high against its own history, options are priced for large moves, which favours strategies that sell premium with defined risk (covered in the strategies module). When it is low, buying options costs less per point of expected movement.',
    'That is a starting idea, not a rule, for three reasons. IV is often high for a reason: earnings next week, a lawsuit, a falling market. Selling it means taking that risk. High IV can go higher, and the losses from selling options in a spike can wipe out many months of small gains. And low IV can stay low for months while long options decay a little every day.',
    'A sounder use is as one filter in a written rule: for example, consider a defined-risk premium sale only when IV percentile is above some level, no earnings fall inside the expiry, and IV is above realised volatility. Then test the rule on past data, including the sharp selloffs, with costs, and paper trade it before risking money.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Comparing IV across stocks instead of with each stock\'s own history.',
        'Dividing by the high instead of by the range when computing rank.',
        'Counting days above instead of below for the percentile.',
        'Treating a high rank as a signal to sell without asking why IV is high.',
        'Treating a low rank as a reason a long option will pay. Low IV lowers the cost of the bet, not the need for a move.',
      ],
    },
  ],

  'volatility-skew': [
    { h: 'One model, many volatilities' },
    'The Black-Scholes model assumes a stock has one volatility. If that were how the market priced options, every strike of one expiry would show the same IV. It does not. Solve for IV strike by strike and plot the results, with strike along the bottom and IV up the side, and you get a curve. Its shape is the **volatility skew**, and reading it tells you what the market fears.',

    { h: 'The shape for stock indexes' },
    'For the S&P 500 and other indexes, the curve slopes down from left to right. Out-of-the-money **puts** (strikes below the index) trade at higher IV than at-the-money options. Out-of-the-money calls (strikes above) trade at lower IV, often with a slight upturn far out. Because it is lopsided rather than a symmetric U, it is sometimes called a **smirk**.',
    { sub: 'Why puts carry more volatility' },
    {
      list: [
        'Demand for insurance. Funds that own stocks buy index puts as protection and are willing to pay up for it. Sellers ask more to carry that risk.',
        'How markets fall. Indexes tend to drop faster than they rise, and volatility jumps as they fall. A put far below the market pays off more often than a one-volatility model expects, so its price, and its IV, is higher.',
      ],
    },
    { sub: 'Other shapes' },
    'Many single stocks show a flatter, U-shaped **smile**, with both wings above the at-the-money IV. Some can show the reverse of the index shape, with calls richer than puts: a stock with a takeover rumour, or one where traders are piling into calls.',

    { h: 'What skew costs and pays' },
    'Skew changes the price you pay for a strike. Suppose an at-the-money option trades at 19% IV and a put 6% below the market trades at 26%. If the put has a vega of 0.08, its price includes about 7 × 0.08 = $0.56 per share, $56 per contract, more than it would at the at-the-money IV. A buyer pays that for protection against a fall. A seller collects it and takes on the risk of the fast fall it pays for, which can cost many times the premium. The extra IV is not free money; it is the market\'s price for a real risk.',
    {
      code: `chain = {95: 0.27, 100: 0.22, 105: 0.19, 110: 0.18, 115: 0.185}
cheapest = min(chain, key=chain.get)
print(cheapest, round(chain[95] - chain[105], 2))`,
      out: '110 0.08',
    },
    '`min(chain, key=chain.get)` goes through the strikes and compares them by their IV, so it returns the strike with the lowest IV, not the lowest strike. The 95 strike trades 8 points above the 105 strike.',

    { h: 'Term structure' },
    '**Term structure** is IV across expiries rather than across strikes, usually for at-the-money options. In calm markets it slopes up: far expiries trade at higher IV than near ones. This is often called contango.',
    'In a selloff, near-term IV jumps far more than long-term IV, and the curve **inverts**: the front month trades above the later ones. The market is saying it expects the turbulence now and calmer conditions later. A scheduled event does the same thing locally: the expiry that contains a company\'s earnings trades at a higher IV than the expiries around it.',

    { h: 'Forward volatility' },
    'Variance, the square of volatility, adds up over time. The **total variance** to an expiry is σ² × T. The variance to a later expiry includes the variance to an earlier one plus whatever is priced for the days between them. So the volatility priced for the gap, the **forward volatility**, is `σ_fwd = √((σ₂² × T₂ − σ₁² × T₁) ÷ (T₂ − T₁))`. T can be in days or years, as long as both are the same.',
    { sub: 'A worked example' },
    'The 20-day IV is 18% and the 50-day IV is 21%. Total variances: 0.0324 × 20 = 0.648 and 0.0441 × 50 = 2.205. The difference, 2.205 − 0.648 = 1.557, divided by the 30 days between the expiries gives a forward variance of 0.0519, and √0.0519 ≈ 22.8%.',
    {
      code: `import math

iv1, t1, iv2, t2 = 0.18, 20, 0.21, 50
var = (iv2 ** 2 * t2 - iv1 ** 2 * t1) / (t2 - t1)
print(round(math.sqrt(var), 4))`,
      out: '0.2278',
    },
    'Using the IVs instead of their squares gives a wrong answer. If the later total variance were smaller than the earlier one, the forward variance would be negative, which is impossible: the two quotes contradict each other, and a function should report that instead of crashing on a square root.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Quoting one IV for a stock when the strike you trade carries a different one.',
        'Selling the highest-IV puts on the chain as if the extra volatility were free.',
        'Buying a near-term option in an inverted curve without noticing you are paying the stress or event premium.',
        'Adding volatilities across periods instead of variances.',
      ],
    },
  ],

  'volatility-vix': [
    { h: 'A volatility index for the whole market' },
    'The **VIX** is an index calculated and published by Cboe, the exchange group that lists SPX options. It measures the 30-day implied volatility of the S&P 500, computed from the prices of a wide range of SPX options, puts and calls across many strikes, from expiries that bracket 30 days. It is quoted in volatility points: a VIX of 22 means the options price the S&P 500 as if its annualised volatility over the next 30 days will be about 22%.',
    'It is often called the fear gauge because it rises when investors rush to buy protection. A more useful name for a trader is the size gauge: it tells you how big a normal day is expected to be.',

    { h: 'Turning the VIX into moves' },
    'The VIX is an IV like any other, so the expected move formulas apply. One trading day: divide by √252 ≈ 15.87, or by 16 as a rule of thumb. Over its own 30-day horizon: multiply by √(30 ÷ 365).',
    { sub: 'A worked example' },
    'With the VIX at 18 and the S&P 500 at 6,000: daily, 18 ÷ 15.87 ≈ 1.13%, about 68 points. Over 30 days, 18 × √(30/365) ≈ 5.2%, about 310 points.',
    {
      code: `import math

vix, level = 18, 6000
daily = vix / 100 / math.sqrt(252)
print(round(daily * 100, 2), round(level * daily))`,
      out: '1.13 68',
    },
    { sub: 'Measuring a day against the VIX' },
    'The same arithmetic lets you grade a day after the fact. If the S&P 500 at 6,000 moved 150 points on a day when the VIX was 18, that was 150 ÷ 68 ≈ 2.2 standard deviations: a large day, more than the options had priced. A run of such days is a sign that the market is moving more than it was priced for. SPY, the ETF that tracks the S&P 500, moves by the same percentages, so the VIX works for SPY too.',

    { h: 'How it moves with the index' },
    'The VIX tends to rise when stocks fall and to drift down in steady rallies. In a selloff investors buy puts for protection and daily moves get larger; both push IV up. In a calm rally neither happens. The relationship is strong but not fixed: the VIX can rise with the market before a big event, and it can fall during a slow decline.',
    'The VIX does not forecast direction. A high reading says large moves are priced in either direction. Some of the largest up days in the index have come in periods of high VIX, during violent rebounds.',

    { h: 'You cannot buy the index' },
    'The VIX is a calculation, not something that trades. Products that let you bet on it, such as VIX futures, options on VIX futures, and exchange-traded products, are built on **VIX futures**: contracts on where the VIX will be at a future date.',
    { sub: 'Why the products drift' },
    'In calm markets VIX futures usually trade above the index, because the market expects calm periods not to last. A product that holds futures must keep selling the nearest one and buying the next, and each future tends to drift down towards the lower index as it nears expiry. A long holder loses that drift month after month, even if the VIX ends where it started. These are specialised instruments, and holding one is a different trade from reading the VIX.',

    { h: 'Using it in daily preparation' },
    'Before the open, convert the VIX into today\'s expected move in index points and in SPY dollars. Compare it with the ranges of the past few days. Check whether it is rising or falling, and whether a scheduled release (an inflation report, a Fed decision) is on the calendar, because the VIX already prices that jump. Then set stops, targets and size for the day you are in: with the VIX at 12, a 1% move is a big day; with the VIX at 30, it is ordinary.',
    'Use the right gauge for what you trade. The VIX covers the S&P 500. Cboe publishes the **VXN** for the Nasdaq-100, which matters for QQQ. A single stock has its own IV, which can be far from the VIX.',

    { h: 'Mistakes to avoid' },
    {
      list: [
        'Dividing the VIX by 252 instead of √252 when working out a daily move.',
        'Treating a high VIX as a sell signal or a low VIX as a buy signal.',
        'Buying a VIX product to hold for months and expecting it to follow the index.',
        'Using the VIX for a single stock or for the Nasdaq-100.',
      ],
    },
  ],

  'volatility-events': [
    { h: 'Known days of uncertainty' },
    'Most days the news that moves a stock arrives without warning. A few days are known in advance to carry a jump, and options price that jump before it happens. The three you will meet most often:',
    {
      list: [
        '**Earnings**: a company\'s quarterly results, usually released before the open or after the close. The company announces the date.',
        '**Fed decisions**: at the time of writing (2026) the Federal Reserve\'s rate-setting committee holds eight scheduled meetings a year, and its statement comes out at 2:00 p.m. Eastern, followed by a press conference.',
        '**CPI**: the monthly consumer price index, an inflation report from the Bureau of Labor Statistics, released at 8:30 a.m. Eastern, before the stock market opens.',
      ],
    },
    'Dates and times can change. Check them on the company\'s investor page, the Fed\'s calendar and the BLS release schedule, and confirm how your broker handles trading around them.',

    { h: 'Why IV rises and then collapses' },
    'An option that expires after an event must pay off if the event moves the stock a lot. So in the days before, its price includes the expected jump, and when you back IV out of that price it comes out high. The expiry that contains the event trades at a higher IV than the ones before it.',
    'Once the news is out, the uncertainty it carried is gone. The options no longer need to price the jump, and IV falls back to a normal level, often within minutes of the open. This is **IV crush**.',
    { sub: 'Estimating the damage' },
    'The loss from the crush is roughly vega × the change in IV, per share. For a long option a fall in IV is a loss, so the change is IV after − IV before. With vega 0.20 and IV falling from 65 to 30, the estimate is 0.20 × (30 − 65) = −$7.00 per share, −$700 per contract. Vega itself shrinks as IV falls, so treat this as an estimate of size, not an exact figure.',

    { h: 'How a right call becomes a loss' },
    'Take a $50 stock reporting after the close. The 5-day at-the-money straddle (a call and a put at the same strike) is priced at 60% IV. The next morning the stock opens at $52, up 4%, and IV is 28%.',
    {
      code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

def straddle(S, K, T, sigma):
    d1 = (math.log(S / K) + sigma ** 2 / 2 * T) / (sigma * math.sqrt(T))
    call = S * N(d1) - K * N(d1 - sigma * math.sqrt(T))
    return 2 * call - S + K

print(round(straddle(50, 50, 5 / 365, 0.60), 2), round(straddle(52, 50, 4 / 365, 0.28), 2))`,
      out: '2.8 2.13',
    },
    'The model prices the straddle at $2.80 before and $2.13 after: the stock moved $2 in one direction and the position still lost about $0.67 per share, $67 per straddle. The put\'s value fell to almost nothing and the call gained less than the IV that left it. The `2 * call - S + K` line gets the put\'s value from the call through put-call parity, with interest rates ignored.',
    { sub: 'The bar a long option must clear' },
    'The straddle cost 2.80 ÷ 50 = 5.6% of the stock price. That is roughly the move the options priced. A long straddle, or a long call or put, held through the event needs a move larger than that, in the right direction for a single option, to make money. A move smaller than priced loses, even when the direction was right.',

    { h: 'Measuring the implied event move' },
    { sub: 'From the straddle' },
    'The quick read: the price of the at-the-money straddle in the first expiry after the event, divided by the stock price.',
    { sub: 'From the IVs' },
    'A finer read separates the event from ordinary days. Variance adds over time, so the event expiry\'s total variance is the normal variance for its days plus the event\'s own: `event move ≈ √((σ_event² − σ_normal²) × T)`, with T the time to that expiry in years. For an expiry 10 days away at 55% when the stock normally trades at 25%: (0.3025 − 0.0625) × 10/365 = 0.00658, and √0.00658 ≈ 8.1%. If the event expiry\'s IV is not above normal, nothing extra is priced for the event.',
    { sub: 'Against history' },
    'Then compare with how far the stock really moved after past reports. Counting how many of the last eight or twelve reports moved more than today\'s implied move gives a rough feel for whether the options have tended to be rich or cheap. It is a small sample and a tendency at best; the next report can be the one that moves twice as far.',

    { h: 'Index events on a trading day' },
    'CPI comes out at 8:30 a.m. Eastern, before the regular session. An option bought at the previous close carries the CPI premium overnight, and by the time you can sell it at the open, the report is out and the premium has gone. If the open is flat, the option has lost its event premium plus a night of time decay.',
    'On Fed days, options expiring that day keep their IV raised through the morning and usually lose it once the 2:00 p.m. statement is out, even if the index then moves. The jump can go either way, and the first move after the statement is often reversed during the press conference.',

    { h: 'Choosing what to do' },
    'A long option through an event pays only if the move beats what was priced. A short option collects the crush but takes the full gap: a naked short option can lose many times the premium collected, and a stop does not protect you overnight. Defined-risk structures and a size where the worst case fits your risk per trade are the sensible minimum. Very often the right decision is no trade: most of the time the options price the event fairly enough that there is nothing to gain. Paper trade a few reports first to watch the crush happen.',
  ],

  'volatility-lab': [
    { h: 'What you are building' },
    'This lab turns the module into a small toolkit: a handful of plain Python functions that answer the three volatility questions a trader asks before an options trade. How much has this stock been moving? How much are its options pricing? Is that high or low for this stock?',
    'Everything uses the standard library only: `math` for logarithms, square roots and the error function, and `statistics` for the sample standard deviation. Each step is run on its own, so the helper functions a step needs are repeated in its starter code.',

    { h: 'Returns and realised volatility' },
    { sub: 'Log returns' },
    'A list of closes becomes a list of returns, one fewer. Pairing each close with the next one is neatly done with `zip(closes, closes[1:])`: the first list starts at day 0 and the second at day 1, so each pair is (yesterday, today).',
    {
      code: `import math

closes = [40.0, 41.0, 40.2, 40.6]
r = [math.log(b / a) for a, b in zip(closes, closes[1:])]
print([round(x, 4) for x in r], round(sum(r), 4), round(math.log(40.6 / 40.0), 4))`,
      out: '[0.0247, -0.0197, 0.0099] 0.0149 0.0149',
    },
    'The sum of the log returns equals the log return from the first close to the last, which is a quick test that the function is right.',
    { sub: 'A window of returns' },
    'Realised volatility uses only the most recent returns. In Python, `r[-20:]` is the last 20 items of a list. `statistics.stdev` divides by n − 1, the sample standard deviation. Multiply by √252 to annualise.',

    { h: 'The expected move' },
    'With an IV and a number of calendar days the 1σ move is `S × σ × √(days ÷ 365)`, and the range is today\'s price minus and plus that move. A good test is the square-root rule: four times as many days must give exactly twice the move.',

    { h: 'Black-Scholes from scratch' },
    'The pricing module derived the model; here you only need the formula. For a European call, one that can only be exercised at expiry:',
    {
      list: [
        '`d1 = (ln(S ÷ K) + (r + σ² ÷ 2) × T) ÷ (σ × √T)`',
        '`d2 = d1 − σ × √T`',
        '`call = S × N(d1) − K × e^(−rT) × N(d2)`',
      ],
    },
    'Here S is the stock price, K the strike, T the time in years, r the interest rate and σ the volatility, both as decimals. `N` is the cumulative normal distribution, the share of a bell curve below a point, which the standard library does not provide directly but builds from the error function: `N(x) = 0.5 × (1 + math.erf(x ÷ √2))`.',
    {
      code: `import math

def N(x):
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))

print(N(0), round(N(1.0), 4), round(N(-1.0), 4))`,
      out: '0.5 0.8413 0.1587',
    },
    { sub: 'Testing a pricer' },
    'Check a pricer against values you can reason about: a deep in-the-money call with little time should be worth about its intrinsic value, a call must rise with volatility, and a known textbook value should match to four decimals. A typo such as `σ × T` instead of `σ × √T` in d2 gives prices that look plausible and are wrong, so a known value is the only reliable check.',

    { h: 'Implied volatility by bisection' },
    'With a correct pricer, IV is the bisection from the implied volatility lesson. Two guards come first. If the price is at or below intrinsic value, here `max(S − K × e^(−rT), 0)` because the strike is paid later and is discounted at the interest rate, or at or above the stock price, no volatility produces it and the function should return None. Then search a wide bracket, such as 0.0001 to 5, for a fixed number of steps.',
    'The round trip is the test: price an option at a known volatility, feed the price back in, and the solver should return that volatility to six decimals.',

    { h: 'IV rank and percentile together' },
    'The last function reports both measures from a list of past IV readings. Rank uses the minimum and maximum; percentile counts the readings strictly below today\'s. One edge case needs handling: if every reading in the history is the same, the range is zero and the rank formula would divide by zero, so return a rank of 0 instead.',
    {
      code: `history = [28, 28, 28]
low, high = min(history), max(history)
rank = 0 if high == low else (30 - low) / (high - low) * 100
print(rank)`,
      out: '0',
    },

    { h: 'Putting it together' },
    'A daily report built from these pieces might show, for each ticker you trade, the 20-day and 60-day realised volatility, the at-the-money IV of the expiry you use, the gap between IV and realised, today\'s expected move in dollars, IV rank and percentile side by side, and any event inside the expiry. It describes prices. Deciding what, if anything, to trade is the job of a written plan that the report feeds, tested on paper first.',
  ],
}
