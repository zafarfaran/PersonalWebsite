import type { Block } from '../../types'

/** The full theory for each lesson of the markets module, keyed by lesson id. */
export const marketsTheory: Record<string, Block[]> = {
  'markets-instruments': [
    { h: 'What you are buying' },
    'A market is a place where people who want to buy meet people who want to sell. In this course the market is the US stock market and its options, and the things traded there are shares, funds and options on them. Before you can judge a trade you need to know exactly what you would own and how its price turns into money in your account.',
    { sub: 'Shares and tickers' },
    'A **share** (or stock) is a small piece of ownership of one company. Apple has billions of shares; if you own one, you own a tiny slice of Apple. Every listed company has a short code called a **ticker**: AAPL for Apple, NVDA for Nvidia. Brokers, charts and news all use the ticker.',
    'The price of a share is whatever the last buyer and seller agreed. It moves all day as new orders arrive. Nobody sets it; it is the result of trading.',
    { sub: 'Indexes' },
    'An **index** is a number calculated from the prices of a group of stocks, to show how that group is doing. The **S&P 500** follows 500 large US companies. Each company counts in proportion to its total market value (share price times number of shares), so the largest companies move the index most. The **Nasdaq-100** follows 100 of the largest companies listed on the Nasdaq exchange, with a heavy weight in technology.',
    'An index is only a number. You cannot buy it, in the same way you cannot buy a temperature. **SPX** is the ticker for the level of the S&P 500. There are options on SPX, which the options module explains, but no SPX shares.',

    { h: 'ETFs: a basket that trades like a share' },
    'An **ETF**, or exchange-traded fund, is a fund that owns a basket of assets and is itself split into shares that trade on an exchange all day. Buy one share of the fund and you own a slice of everything in the basket.',
    '**SPY** is the oldest and most traded ETF on the S&P 500. Its price sits at roughly one tenth of the index level. The ratio is not exact and drifts a little, because the fund collects dividends from its stocks and pays them out every quarter, and because it charges a small yearly fee. **QQQ** is the main ETF on the Nasdaq-100.',
    'So if the S&P 500 index rises 30 points, SPY rises roughly $3. A trader who watches the index but holds the ETF must translate between the two.',

    { h: 'How a position makes or loses money' },
    'Your **position** is what you hold: a ticker and a quantity. Its dollar profit or loss, written **P&L**, is always the quantity times the change in price.',
    { sub: 'A worked example' },
    'You buy 40 shares at $250.00 and later sell at $253.50. The price change is $3.50, so the P&L is 40 × 3.50 = $140 before costs. The **percent return** is the price change divided by the price you paid: 3.50 ÷ 250 = 0.014, or 1.4%. Always divide by the entry price. Dividing by the exit price gives a slightly different, wrong number.',
    {
      code: `qty, entry, exit = 40, 250.00, 253.50
pnl = qty * (exit - entry)
ret = (exit - entry) / entry
print(round(pnl, 2), round(ret * 100, 2))`,
      out: '140.0 1.4',
    },
    'If the price falls instead, the same formulas give negative numbers. Several positions add up: one winner can cancel one loser, so you watch the total.',

    { h: 'Dollars, not shares' },
    'The number of shares tells you little on its own. 100 shares of a $20 stock is $2,000 of exposure; 100 shares of a $500 ETF is $50,000. A 2% move is $40 on the first and $1,000 on the second. Compare positions by their value in dollars, and think about moves in percent, because a $1 move means very different things at different prices.',

    { h: 'Why day traders stay liquid' },
    'A **liquid** instrument is one you can buy or sell quickly, in size, at a price close to the last trade. Signs of liquidity are high daily volume (the number of shares traded), tight quotes and, for options, many strikes with active trading. SPY and QQQ are among the most liquid instruments in the world.',
    'Liquidity matters most to someone who holds for minutes or hours. Every entry and exit has a cost, covered in the next lessons, and in a thinly traded stock that cost can be larger than the move you hoped to catch. You may also struggle to get out when your plan says so.',
    'There is a second reason. A single company can **gap**, opening far from where it closed, on its own news such as earnings. An index ETF holds hundreds of companies, so one company\'s news moves it much less. This is a statement about risk, not a promise that an ETF is safe: whole markets also fall, sometimes fast.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Treating SPX and SPY as interchangeable without converting the levels.',
        'Choosing a trade by share count instead of dollars at risk.',
        'Measuring a return against the exit price instead of the entry price.',
        'Trading a thin stock because it moves a lot, then losing the move to costs.',
      ],
    },
  ],

  'markets-spread': [
    { h: 'Two prices, not one' },
    'A price on a news website is usually the last trade. When you trade, you meet two prices at once. The **bid** is the highest price any buyer is offering right now. The **ask** (also called the offer) is the lowest price any seller will accept right now. Together they are the **quote**, written bid x ask: 45.10 x 45.12.',
    'Each side also shows a **size**, the quantity wanted at that price. A quote of 45.10 x 45.12 with sizes 300 x 500 means buyers want 300 shares at 45.10 and sellers offer 500 at 45.12. Option sizes are in contracts.',
    'If you want to sell immediately, you sell to the best buyer: at the bid. If you want to buy immediately, you buy from the best seller: at the ask.',

    { h: 'Spread and mid' },
    { sub: 'Definitions' },
    'The **spread** is ask − bid. The **mid** is the halfway point, (bid + ask) ÷ 2. For 45.10 x 45.12 the spread is 0.02 and the mid is 45.11. The mid is not a price anyone has promised to trade at. It is a reference point, and many platforms use it to show the value of your open positions.',
    { sub: 'Crossing the spread' },
    'Buy at the ask and sell at the bid a moment later, with nothing changing, and you lose the spread on every share. This is called **crossing the spread**, and it is the basic cost of wanting to trade now rather than wait. Market makers, who post both sides, earn it; the next lesson explains them.',

    { h: 'Spread as a percentage' },
    'A spread in dollars hides how expensive it is. Divide it by the mid. A stock at 45.10 x 45.12 has a spread of 0.02 ÷ 45.11, about 0.04%. An option quoted 0.80 x 0.90 has a spread of 0.10 ÷ 0.85, about 11.8%.',
    {
      code: `def spread_pct(bid, ask):
    mid = (bid + ask) / 2
    return (ask - bid) / mid

print(round(spread_pct(45.10, 45.12) * 100, 2), round(spread_pct(0.80, 0.90) * 100, 1))`,
      out: '0.04 11.8',
    },
    'Watch the brackets in `(bid + ask) / 2`. Without them, Python divides first and adds after, which gives a wrong mid.',
    { sub: 'Options and the 100 multiplier' },
    'An option price is quoted per share, and one standard US equity option contract covers 100 shares. So an option quoted 0.80 x 0.90 costs $90 per contract to buy at the ask, and a spread of 0.10 costs $10 per contract per round trip. This multiplier of 100 appears in almost every option calculation.',

    { h: 'What your screen shows and what you can get' },
    'Say you bought 3 contracts at 0.70 and the quote is now 0.80 x 0.90. A platform that values at the mid shows (0.85 − 0.70) × 3 × 100 = $45 of profit. If you close immediately, you sell at the bid: (0.80 − 0.70) × 300 = $30. The $15 difference is half the spread on 300 shares, and it is not yours until the market moves.',
    'The **last** price is a third number. It is the price of the most recent trade, which might be old. In a quiet option it can be minutes old and far from the current quote. Decide using the quote.',

    { h: 'Limit orders at the mid' },
    'You do not have to accept the far side. A **limit order** says the worst price you will accept; a buy limit at the mid sits in the market and waits for a seller to meet it. It often fills in liquid options, saving part of the spread. It may also never fill, if the price moves away from you. The order types lesson covers this trade-off in detail.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Reading the last price and expecting to trade at it.',
        'Judging a spread in cents instead of as a percentage of the price.',
        'Forgetting to multiply by 100 for options.',
        'Counting the gain at the mid as money already made.',
        'Treating a crossed quote (bid above ask) as real; it usually means stale data.',
      ],
    },
  ],

  'markets-book': [
    { h: 'The book behind the quote' },
    'The quote shows only the best bid and the best ask. Behind them is the **order book**: a list of every **resting** order, meaning a limit order that is waiting to be filled. Orders are grouped by price into **levels**. On the bid side, levels go down from the best bid; on the ask side, up from the best ask.',
    'The quantity waiting at each level is the **depth**. The best level on each side is the **top of the book**. Many brokers show the book as a ladder, sometimes called level 2 data.',
    { sub: 'A small example' },
    'Imagine a stock whose ask side reads: 200 shares at 25.00, 400 at 25.02, 600 at 25.05. The best ask is 25.00, but only 200 shares are there. Anyone who wants more must pay more.',

    { h: 'Who is in the book' },
    'Some resting orders come from ordinary traders and funds. Much of the size comes from **market makers**: firms that post both a bid and an ask nearly all the time, buying from sellers and selling to buyers. They earn the spread, and they take the risk of holding stock while prices move. They manage that risk by adjusting their quotes.',
    'When the market is calm, competition between market makers keeps spreads tight. When prices move fast, for example on a surprising news release, a quote that stands still is likely to be traded against at a stale price. So market makers widen their quotes or cancel them. The depth you saw a second ago can disappear the moment you need it.',

    { h: 'Taking and making liquidity' },
    'An order that fills at once against resting orders **takes** liquidity: a market order, or a limit order priced through the opposite side. An order that waits in the book **adds** (makes) liquidity: a buy limit below the best ask or a sell limit above the best bid. Some exchanges charge takers a small fee and pay makers a small rebate, which is part of why the book looks the way it does.',

    { h: 'Walking the book' },
    'A market order is matched against the best level first. If it is larger than that level, it moves on to the next one, and the next, until it is filled. This is called **walking the book**. Each extra level is a worse price.',
    { sub: 'Average fill' },
    'Buy 700 shares at market from the book above. You get 200 at 25.00, 400 at 25.02 and the last 100 at 25.05. The total paid is 5,000 + 10,008 + 2,505 = $17,513. The **average fill** is that total divided by the shares: 17,513 ÷ 700 ≈ 25.0186.',
    {
      code: `asks = [(25.00, 200), (25.02, 400), (25.05, 600)]
want, cost, got = 700, 0.0, 0
for price, size in asks:
    take = min(size, want - got)
    cost += take * price
    got += take
    if got == want:
        break
print(got, round(cost, 2), round(cost / got, 4))`,
      out: '700 17513.0 25.0186',
    },
    'The line `take = min(size, want - got)` matters. On the last level you only take what is still needed; taking the whole level would buy more than you asked for.',
    { sub: 'Slippage' },
    '**Slippage** is how much worse your fill was than the price you expected, times the quantity. Expecting 25.00 for all 700 shares would have cost $17,500, so the slippage is $13. For a sale it runs the other way: slippage is what you expected to receive minus what you received. Either way, count it as a positive cost.',
    'For options, remember the multiplier: a slippage of 0.03 per share on 20 contracts is 0.03 × 20 × 100 = $60.',

    { h: 'Liquidity in practice' },
    'Liquidity is the ability to trade the size you want near the current price. A deep book can absorb a large order with almost no slippage; a thin book with the same top-of-book quote cannot. Options are usually much thinner than the stock: it is common to see only a handful of contracts at the best price.',
    'Ways to deal with a thin book: trade fewer contracts, use limit orders so you set the worst price, split a large order into pieces and let the book refill, accept that some may not fill, or choose a more liquid strike, expiry or instrument.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Assuming the quote price applies to any size.',
        'Sending one large market order into a thin option book.',
        'Trusting displayed depth during fast markets and news.',
        'Forgetting the 100 multiplier when counting option slippage.',
      ],
    },
  ],

  'markets-orders': [
    { h: 'An order is an instruction' },
    'An **order** tells your broker what to buy or sell, how much, and under what conditions. The order type decides which risk you take: the risk of a bad price, or the risk of not trading at all. No type removes both.',

    { h: 'Market and limit orders' },
    { sub: 'Market orders' },
    'A **market order** says: fill this now at the best prices available. It almost always fills, but you do not know the price in advance. In a liquid ETF that is usually close to the quote. In a thin option, at the open, or during news, it can walk the book and fill far from what you saw.',
    { sub: 'Limit orders' },
    'A **limit order** sets the worst price you accept. A buy limit at 30.00 fills at 30.00 or lower; a sell limit at 30.00 fills at 30.00 or higher. You control the price but not whether you get filled: if the market never reaches your limit, nothing happens.',
    'A buy limit set above the current ask (or a sell limit below the current bid) is **marketable**: it fills at once at the best available price, which may be better than the limit. Many traders use marketable limits instead of market orders, as a market order with a ceiling.',

    { h: 'Stop orders and stop-limits' },
    'A **stop order** waits in the background. When a trade happens at or through its **stop price**, it is triggered and becomes a market order. Traders use a sell stop below the current price to get out of a long position that goes wrong, and a buy stop above the price to get out of a short.',
    { sub: 'Why stops fill worse than the stop price' },
    'Once triggered, a stop is a market order, so it fills at whatever price comes next. Take a long position from 60.00 with a sell stop at 58.00. If the price drifts down, the stop triggers near 58.00 and fills close to it. If the stock closes at 59.00 and opens the next day at 55.00 after bad news, the first trade below 58.00 is at 55.00. The stop triggers there and fills near 55.00: a loss three times the planned one.',
    { sub: 'Stop-limit orders' },
    'A **stop-limit** has two prices: the stop, which triggers it, and a limit, which it becomes. With stop 58.00 and limit 57.50, a trigger creates a sell limit at 57.50. In a slow fall it fills between 58.00 and 57.50. In the 55.00 gap it fills at nothing, because no buyer will pay 57.50, and you stay in the losing trade. You exchange the risk of a bad price for the risk of no exit.',
    {
      code: `def first_trigger(prices, stop):
    for i, p in enumerate(prices):
        if p <= stop:
            return i, p
    return None

print(first_trigger([60.0, 59.4, 58.3, 57.9, 58.6], 58.0))`,
      out: '(3, 57.9)',
    },
    'A sell stop checks `p <= stop` because it protects a long position and fires on the way down. Notice the trigger price, 57.9, is already below the stop: triggers often happen through the stop, not at it.',

    { h: 'Bracket orders' },
    'A **bracket** submits an entry with two exit orders attached: a limit order at the profit target and a stop at the loss level. They are linked as **one-cancels-other** (OCO): when one fills, the broker cancels the other. A bracket puts the whole plan in the system as soon as you enter.',
    'From a bracket you can read the **reward-to-risk ratio**: the distance to the target divided by the distance to the stop. Entry 60.00, stop 59.25 and target 61.50 give 1.50 ÷ 0.75 = 2. The share count cancels. The risk side is the planned risk; a gap can make the real loss larger.',

    { h: 'Time in force' },
    {
      list: [
        '**DAY**: the order expires at the end of the trading session if it has not filled.',
        '**GTC** (good till cancelled): it stays until filled or cancelled. Brokers cap how long, often a few months. Forgotten GTC orders can fill when you no longer want them.',
        '**IOC** (immediate or cancel): fill whatever is possible now and cancel the rest.',
        '**Extended hours**: outside 9:30 to 16:00 ET, many brokers accept only limit orders, and only when you mark them for the extended session.',
      ],
    },
    'Details differ between brokers, so read your broker\'s order rules before you rely on them.',

    { h: 'Choosing in practice' },
    'For a liquid ETF, a marketable limit for entry and a bracket for exits is a common, simple setup. For options with wide quotes, a limit near the mid, raised in small steps to a price decided in advance, usually beats a market order. Stops on options can trigger on a brief wide quote, so many traders watch the underlying price instead; the risk module covers stops for options.',
    { sub: 'Planning for failure' },
    'Write down what you will do if a stop fills far below its price, if an order does not fill, and if your platform freezes. Have a second way to reach your broker. These events are rare per trade and common over a year of trading.',
  ],

  'markets-day': [
    { h: 'The regular session' },
    'US stock exchanges run their **regular session** from 9:30 to 16:00 Eastern Time (ET), Monday to Friday. They close on certain public holidays and close early, at 13:00, on a few days such as the day after Thanksgiving. The exchanges publish the calendar each year; check it, because an early close moves your last hour.',
    '6.5 hours is 390 minutes. Divided into 5-minute bars, that is 78 bars a day; into half hours, 13.',
    { sub: 'Extended hours' },
    'Many brokers also let you trade in a **premarket** session before 9:30 and an **after-hours** session after 16:00, commonly from 4:00 or 7:00 in the morning and until 20:00, and some brokers now offer overnight trading. Fewer people trade then, so spreads are wider and the book is thinner. Many brokers take only limit orders in these sessions. Rules differ, so read your broker\'s.',
    { sub: 'Option hours' },
    'Most stock options trade only during the regular session, 9:30 to 16:00 ET. Options on SPY, QQQ and some indexes trade until 16:15. At the time of writing (2026), Cboe has started extra trading sessions for some options, so the exact hours depend on the contract and the exchange. Check with your broker. One consequence is common to all: shares can move after the options stop trading.',

    { h: 'The shape of a day' },
    { sub: 'The open' },
    'Overnight, news piles up: earnings, economic data, moves in other markets. At 9:30 all of it is priced in at once. The first half hour usually has the most volume and the widest swings of the day. Option market makers are still adjusting, so option spreads are often wider than they will be an hour later.',
    { sub: 'Midday and the close' },
    'Volume falls through the late morning and is lowest around lunchtime in New York. Prices often drift or chop sideways. In the last hour volume rises again, because funds that must trade at the closing price send their orders into the closing auction. Plotted by time of day, volume makes a U.',
    {
      code: `vol = [25, 15, 11, 9, 8, 7, 7, 8, 9, 10, 12, 16, 23]   # millions per half hour
first, last = sum(vol[:2]), sum(vol[-2:])
print(first, last, round((first + last) / sum(vol) * 100))`,
      out: '40 39 49',
    },
    'In this made-up day, the first and last hours together hold about half the volume. Real days differ, but the shape repeats.',

    { h: 'Scheduled news' },
    'Some of the biggest moves happen at known times. Major US economic reports, such as the consumer price index (CPI, a measure of inflation) and the monthly jobs report, are released at 8:30 ET, before the open. The Federal Reserve announces interest rate decisions at 14:00 ET. Companies report earnings before the open or after the close.',
    'News outside the regular session shows up first in extended-hours trading and then as a **gap**: the next regular session opens far from the previous close. Options that stopped trading at 16:00 cannot be closed in between.',

    { h: 'Orders around the open' },
    'If you send a market order before 9:30 and your broker does not route market orders in the premarket, it may wait and execute at the open, at a price you never saw, during the most volatile minutes of the day. Other brokers reject such orders. Use limit orders around the open so you decide the worst price.',

    { h: 'Time zones' },
    'All exchange times are Eastern Time. Convert them to your own time and write both down. For example, Berlin is usually 6 hours ahead of New York, so the open is at 15:30 there. Countries change their clocks on different dates in spring and autumn, so for a few weeks a year the difference is one hour less, and a plan written in local time would be wrong.',

    { h: 'Cost by time of day' },
    'Because spreads change through the day, the same trade costs different amounts at different times. Say an option is 0.12 wide in the first minutes after the open and 0.05 wide at midday. A round trip of 6 contracts costs 0.12 × 6 × 100 = $72 in spread at the open and $30 at midday. Neither time is right or wrong, but a setup that trades the open must earn the extra cost.',
    { sub: 'Mistakes beginners make' },
    {
      list: [
        'Trading premarket because the price is moving, then finding no buyer at a fair price.',
        'Holding options into an after-close earnings report by accident.',
        'Forgetting an 8:30 report or a 14:00 Fed decision on the day of a trade.',
        'Getting the session boundary wrong in code (9:30 is 570 minutes after midnight, not 540).',
      ],
    },
  ],

  'markets-accounts': [
    { h: 'Two kinds of account' },
    'A brokerage account holds your cash and positions. The two basic kinds differ in one thing: whether you may borrow from the broker.',
    { sub: 'Cash accounts and settlement' },
    'In a **cash account** you pay for everything in full with money you have. When you sell, the trade happens at once but the cash **settles**, meaning it formally changes hands, a little later. At the time of writing (2026), US stock and option trades settle one business day after the trade date, called **T+1**.',
    'You may usually buy with money from a sale that has not settled yet. But if you then sell that new position before the money that paid for it has settled, the broker records a **good faith violation**. Several of these in a year and the broker restricts the account, often to trading only with settled cash for 90 days. Exact policies vary by broker.',
    'Example: you sell shares on Wednesday for $3,000; that cash settles Thursday. On Wednesday you buy another stock with it. Selling the new stock on Thursday after settlement is fine; selling it on Wednesday is a violation.',

    { h: 'Margin accounts' },
    'A **margin account** lets you borrow from the broker, with your positions as security. Your **equity** is the value of your positions minus the loan.',
    { sub: 'Initial and maintenance requirements' },
    'For US stocks, the Federal Reserve\'s Regulation T sets an **initial** requirement of 50%: your equity must cover at least half of a new purchase. With $8,000 of equity you can buy up to $16,000 of stock. FINRA, the US industry regulator, sets a minimum **maintenance** requirement of 25%: after the purchase, your equity must stay above 25% of the position value. Brokers can and often do require more, and FINRA also requires at least $2,000 of equity to borrow at all. Bought options generally cannot be bought on margin: you pay the whole premium.',
    { sub: 'Borrowing multiplies results' },
    'Divide the value of your positions (your **exposure**) by your equity. With $16,000 of stock and $8,000 of equity the ratio is 2, so every move in the stock is doubled in your equity. A 5% fall in the stock is $800, which is 10% of your equity. Gains are doubled too, but so are losses, and you pay interest on the loan. Long and short positions both count towards exposure, so take absolute values when you add them up.',

    { h: 'Margin calls' },
    'If losses push your equity below the maintenance level, you get a **margin call**: deposit money or sell. The broker does not have to wait for you. It may sell your positions at a time and price it chooses.',
    'You can work out in advance where a call would come. With a loan L and a maintenance level m, a call comes when (value − L) ÷ value = m, which gives value = L ÷ (1 − m).',
    {
      code: `loan, m = 8000, 0.25
start = 16000
call_value = loan / (1 - m)
print(round(call_value, 2), round(1 - call_value / start, 3))`,
      out: '10666.67 0.333',
    },
    'Here the stock can fall a third before the call. A stricter 30% house requirement would bring the call sooner. A common error is to divide the loan by m instead of by 1 − m.',

    { h: 'Short selling' },
    '**Short selling** is selling shares you do not own. The broker lends them to you, you sell them, and later you buy the same number back to return them. If the price fell, you keep the difference; if it rose, you pay it. Short 50 shares at 40 and buy back at 46 and you lose 50 × 6 = $300.',
    'The most a short can gain is the whole sale price, if the stock goes to zero. The loss has no ceiling, because a price can keep rising. You also pay a fee to borrow, which is high for hard-to-borrow stocks, and the lender can recall the shares. Short selling needs a margin account.',

    { h: 'The pattern day trader rule and its replacement' },
    'A **day trade** is opening and closing the same position on the same day. For over twenty years FINRA\'s **pattern day trader** rule applied to margin accounts that made four or more day trades in five business days: such accounts had to hold at least $25,000 of equity.',
    'At the time of writing (2026) that rule has been replaced. The SEC approved FINRA\'s new intraday margin standards in April 2026, effective from 4 June 2026, with brokers allowed to phase them in until 20 October 2027. Instead of counting day trades, brokers must make sure an account\'s equity covers its risk during the day. During the phase-in your broker may still apply the old limits, and any broker may set stricter house rules. Rules in other countries are different. Ask your broker which rules apply to your account before planning to day trade.',
    { sub: 'Tax and your own country' },
    'Tax treatment of trading differs by country and by account type. This course does not give tax advice: check with a qualified professional where you live.',
  ],

  'markets-costs': [
    { h: 'Four costs on every trade' },
    'A trade has a gross result, what the price move made you, and a net result, what you keep. The difference is cost. Four things make it up.',
    {
      list: [
        '**Commission**: what the broker charges. Many US brokers charge nothing for stock trades. Options usually carry a fee per contract on each side; at the time of writing $0.65 per contract is common, and this course uses it in examples. Check your own broker.',
        '**Fees**: small exchange, clearing and regulatory charges, a few cents per option contract and a tiny charge on stock sales.',
        '**Spread**: you buy at or near the ask and sell at or near the bid, so a full round trip at market loses the spread.',
        '**Slippage**: the extra lost when the fill is worse than the price you expected, because the order walked the book or the price moved while you clicked.',
      ],
    },

    { h: 'Counting a round trip' },
    'A **round trip** is opening and closing a position. Commission and fees are charged on both sides; the spread is crossed once in total, half going in and half coming out, measured from the mid.',
    { sub: 'A worked example' },
    'Trade 4 option contracts quoted 1.40 x 1.48, with $0.65 commission per contract per side. Commission is 4 × 0.65 × 2 = $5.20. The spread is 0.08, and crossing it on 4 contracts of 100 shares costs 0.08 × 4 × 100 = $32. Before any slippage, the round trip costs $37.20.',
    {
      code: `def round_trip_cost(contracts, commission, spread):
    fees = 2 * contracts * commission
    return round(fees + contracts * spread * 100, 2)

print(round_trip_cost(4, 0.65, 0.08))`,
      out: '37.2',
    },
    'Notice the factor of 2 on commission. Forgetting the closing side is the most common way to understate costs.',

    { h: 'Costs against the edge' },
    'Your **edge** is what a trade is expected to make on average before costs. Compare costs with that number, not with the size of your account. $37 is nothing against a $30,000 account, and it is 37% of a trade that expects to make $100.',
    { sub: 'Cheap options are expensive to trade' },
    'Option costs are per contract, not per dollar invested. A 0.04 spread on a 4.00 option is 1% of the price; the same spread on a 0.40 option is 10%. Commission works the same way: $1.30 per contract round trip is 0.3% of a $400 contract and 3% of a $40 one. Low prices look affordable and carry the highest percentage costs.',

    { h: 'The win rate you need' },
    'Costs change how often you must be right. Suppose your average winning trade makes W before costs, your average losing trade loses L, and every trade costs C. A win nets W − C and a loss costs L + C. If p is the share of trades you win, you break even when p × (W − C) = (1 − p) × (L + C). Solving gives:',
    'breakeven p = (L + C) ÷ (W + L)',
    {
      code: `def breakeven_win_rate(avg_win, avg_loss, cost):
    return (avg_loss + cost) / (avg_win + avg_loss)

print(breakeven_win_rate(150, 100, 0), breakeven_win_rate(150, 100, 20))`,
      out: '0.4 0.48',
    },
    'With wins of $150 and losses of $100, you need 40% winners without costs and 48% with $20 per trade. Small wins and losses make the same cost matter more. The risk module builds on this with expectancy.',

    { h: 'Frequency' },
    'Costs repeat with every trade. Five trades a day at $8 each is $40 a day, and over a year of about 250 trading days, $10,000. Before your trading makes you anything it must cover that.',

    { h: 'Measuring your real costs' },
    'Estimated costs are almost always lower than real ones. Record, for every entry and exit, the bid, ask and mid at the time and the price you got. Your fill minus the mid (for a buy) is what you paid in spread and slippage. Add commission and fees from the broker statement. After 20 trades you will know your real cost per trade, by instrument and by time of day.',
    { sub: 'Paper trading flatters' },
    'Many paper trading platforms fill orders at the mid or the last price, which a real order in a real book often would not get. When you move from paper to real money, compare your paper fills with the quotes at the time and subtract the difference from your paper results. Then judge whether the edge survives.',
  ],

  'markets-lab': [
    { h: 'Why build an order book' },
    'Every lesson in this module comes back to the order book: the quote is its top, a market order walks it, slippage is what walking costs. Building a small one in Python makes those ideas concrete, and the same code can later serve as a simple fill model when you test your own trading rules.',
    'The book in this lab is a toy. It ignores time priority, cancellations and fees, and the last step of the lab asks you to list what a more honest version needs.',

    { h: 'The data structure' },
    'The book is a dictionary with two keys. `"bids"` holds a list of `[price, size]` levels sorted from the highest price down. `"asks"` holds levels sorted from the lowest price up. Sorted this way, the best price on each side is always the first entry, `[0]`.',
    {
      code: `book = {"bids": [[24.98, 300], [24.97, 200]],
        "asks": [[25.00, 100], [25.03, 400]]}
best_bid = book["bids"][0][0]
best_ask = book["asks"][0][0]
print(best_bid, best_ask, round(best_ask - best_bid, 2))`,
      out: '24.98 25.0 0.02',
    },
    'Levels are lists, not tuples, so their size can be changed in place when part of a level is used.',

    { h: 'Adding resting orders' },
    'A buy limit order that does not fill rests on the bid side; a sell limit rests on the ask side. If a level at that price already exists, the new size is added to it. Otherwise a new level is appended and the side is sorted again: bids by descending price, asks by ascending. In Python, `levels.sort(key=lambda lv: -lv[0])` sorts by price from high to low, and `key=lambda lv: lv[0]` from low to high.',
    { sub: 'Reading the quote' },
    'The quote comes from the first level of each side. A side can be empty, for example in a thin option or after hours. A careful function returns `None` for a missing price and for the mid and spread that depend on it, instead of crashing or inventing a number.',

    { h: 'Filling a market order' },
    'A market buy takes from the asks, best first, in a loop: look at the first level, take the smaller of its size and what you still need, record the fill, and then either remove the level (if you took all of it) or reduce its size. Stop when the order is filled or the asks run out.',
    {
      code: `asks = [[25.00, 100], [25.03, 400]]
qty, fills = 250, []
while qty > 0 and asks:
    price, size = asks[0]
    take = min(size, qty)
    fills.append((price, take))
    qty -= take
    if take == size:
        asks.pop(0)
    else:
        asks[0][1] = size - take
print(fills, asks)`,
      out: '[(25.0, 100), (25.03, 150)] [[25.03, 250]]',
    },
    'A market sell is the mirror image and must work on the bids. Mixing up the two sides is an easy bug that makes every trade look free.',
    { sub: 'The fill report' },
    'From the fills you compute the quantity filled, the average price (dollars divided by shares) and the slippage against the price you expected. Use one sign rule for both sides so that slippage can be added up across trades: positive means it cost you. For a buy that is (average − expected) × quantity; for a sell, (expected − average) × quantity. If nothing filled, there is no average price.',

    { h: 'Limit orders that partly fill' },
    'A limit buy is a market buy with a price ceiling. It takes asks only while the best ask is at or below the limit. Whatever is left then rests on the bid side at the limit price, using the add-order function. So one order can produce some fills now and a resting order that may fill later, or never.',

    { h: 'What the toy leaves out' },
    {
      list: [
        'Time priority: at one price, orders fill in the order they arrived, so a new resting order waits behind older ones.',
        'Cancels and changes, which are far more common than fills.',
        'Quotes that fade or move when prices move fast.',
        'Commissions and fees on each fill.',
        'Latency, the delay between deciding and the order reaching the market.',
        'Stop and stop-limit orders, tick sizes and hidden orders.',
      ],
    },
    { sub: 'How to use it' },
    'Test each function on a book small enough to work out by hand, as the lab steps do. When the numbers match your hand calculation, try larger orders and thinner books, and watch the average fill and slippage grow. That is the lesson of the whole module in a few lines of code.',
  ],
}
