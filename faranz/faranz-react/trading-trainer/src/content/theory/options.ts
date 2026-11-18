import type { Block } from '../../types'

/** The full theory for each lesson of the options module, keyed by lesson id. */
export const optionsTheory: Record<string, Block[]> = {
  'options-basics': [
    { h: 'A contract about a price' },
    'An **option** is a contract between two people about the price of something else. That something else is the **underlying**: a share such as AAPL, a fund such as SPY, or an index such as SPX. (A reminder from the markets module: SPY is a fund that tracks the S&P 500 index, and you can buy and sell it like a share.)',
    'Think of a deposit on a house. You pay the owner a small sum now, and in return you may buy the house at an agreed price within three months. If house prices rise, your right is worth a lot. If they fall, you walk away and lose only the deposit. An option works the same way, with a share instead of a house.',

    { h: 'The two kinds' },
    { sub: 'Calls' },
    'A **call** gives the person who owns it the right, but not the duty, to buy the underlying at a fixed price. That fixed price is the **strike**. The right lasts until a date called the **expiry**. A call becomes more valuable when the underlying rises, because the right to buy at a fixed price is worth more when the market price is higher.',
    { sub: 'Puts' },
    'A **put** gives its owner the right to sell the underlying at the strike until expiry. A put becomes more valuable when the underlying falls: the right to sell at 90 is worth a lot when the market price is 70.',
    'Using the right is called **exercising** the option. Only the owner decides whether to exercise. If using the right would lose money, for example buying at 100 something that trades at 95, the owner lets the option expire.',

    { h: 'Buyer and seller' },
    'Every option has two sides. The **buyer** (also called the holder, or long) pays a price and gets the right. That price is the **premium**. The **seller** (the writer, or short) receives the premium and takes on the duty. If a call buyer exercises, the call seller must sell the underlying at the strike. If a put buyer exercises, the put seller must buy it at the strike.',
    'Before costs, the two sides add up to zero. Whatever the buyer makes, the seller loses, and the other way round. Options do not create money; they move it between the two sides.',
    'The direction of your view decides the side. If you expect a fall, a bought put profits and can lose no more than its premium. A sold call also profits from a fall, but if the price rises instead its loss has no limit. The selling lesson covers that in detail.',

    { h: 'The multiplier of 100' },
    'Option prices are quoted **per share**, but one standard US equity option contract covers **100 shares**. This number is the **multiplier**. To turn a quote into dollars, multiply by 100 and by the number of contracts.',
    { code: `premium = 3.10      # quoted per share
contracts = 2
print(round(premium * 100 * contracts, 2))`, out: '620.0' },
    'So a quote of 3.10 means $310 for one contract. Brokers also charge a fee per contract, often well under a dollar, on the way in and again on the way out. Add the fees to the premium to get the cash that leaves your account. The `round` call tidies the tiny errors that decimal numbers pick up inside a computer.',

    { h: 'Naming a contract' },
    'A contract is fully described by four facts: the underlying, the kind (call or put), the strike and the expiry. "SPY 480 put, Friday" is one contract. The premium is its price today. A profit on a bought option you sell later is the change in premium times 100 times the contracts: buy one at 2.00, sell at 2.60, and you made 0.60 × 100 = $60 before fees.',
    { sub: 'What a bought option can lose' },
    'The most a buyer can lose is the premium plus fees, and it happens often: when the price does not move far enough by expiry, the option is worth nothing. An option is a view with a deadline. Before you trade one, you should be able to say what has to happen, by when, and the dollar amount you lose if it does not.',

    { h: 'Mistakes beginners make' },
    {
      list: [
        'Forgetting the multiplier. A premium of 0.80 is $80 per contract, not 80 cents.',
        'Clicking the wrong contract: a put instead of a call, or next month instead of this week. Read all four facts back before you send the order.',
        'Treating a cheap option as low risk. A cheap option is usually one that is unlikely to pay.',
        'Starting with real money. Most retail day traders lose money. Paper trade first, then trade one contract.',
      ],
    },
  ],

  'options-moneyness': [
    { h: 'Two parts of a price' },
    "An option's premium can be split into two parts. One is what the option would pay if you used it this second. The other is everything the market charges on top of that, for the chance that things get better before expiry. Knowing the split tells you what you are really paying for.",

    { h: 'Intrinsic value' },
    '**Intrinsic value** is what exercising right now would be worth. Write S for the price of the underlying and K for the strike.',
    {
      list: [
        'Call: `max(S − K, 0)`. The right to buy at K is worth S − K when the market price S is above K.',
        'Put: `max(K − S, 0)`. The right to sell at K is worth K − S when S is below K.',
      ],
    },
    '`max(a, 0)` means "a, or zero if a is negative". Intrinsic value is never negative, because nobody is forced to exercise a right that would lose money.',
    { sub: 'A worked example' },
    'A stock is at 63. The 60 call has intrinsic value 63 − 60 = 3. The 65 call has none, because buying at 65 what trades at 63 is pointless. The 65 put has intrinsic value 65 − 63 = 2. The 60 put has none.',

    { h: 'Extrinsic value' },
    '**Extrinsic value**, also called **time value**, is the rest: premium minus intrinsic value. If the 60 call above costs 4.10, its intrinsic value is 3 and its extrinsic value is 1.10. That 1.10 pays for the chance of a larger move before expiry.',
    { code: `def split(premium, intrinsic):
    return intrinsic, round(premium - intrinsic, 2)

print(split(4.10, max(63 - 60, 0)))
print(split(0.85, max(63 - 65, 0)))`, out: '(3, 1.1)\n(0, 0.85)' },
    'The second line is the 65 call at 0.85: no intrinsic value, so the whole premium is extrinsic.',
    { sub: 'Where extrinsic value is largest' },
    'For one stock and one expiry, extrinsic value is largest at strikes near the stock price, where nobody knows whether the option will finish worth something. Far from the stock price it is small: deep in the money the option is mostly intrinsic value, and far out of the money it is cheap because it is unlikely to pay. Drawn across strikes it forms a hump. The figure in this lesson shows it.',
    { sub: 'How it changes with time' },
    'As expiry gets closer, extrinsic value shrinks, and at expiry it is zero. On the last day the option is worth exactly its intrinsic value. How fast it shrinks is covered in the pricing module.',

    { h: 'In, at and out of the money' },
    'These three words say where the strike sits against the stock price.',
    {
      list: [
        '**In the money** (ITM): the option has intrinsic value. Calls with strikes below the stock price, puts with strikes above it.',
        '**At the money** (ATM): the strike is at, or very close to, the stock price.',
        '**Out of the money** (OTM): no intrinsic value. Its whole premium is extrinsic.',
      ],
    },
    'A call and a put with the same strike are on opposite sides. With the stock at 63, the 60 call is in the money and the 60 put is out of the money.',

    { h: 'What it means when you buy' },
    'Every cent of extrinsic value you pay will be gone by expiry. If you buy an out-of-the-money option and the stock never reaches the strike, you lose the whole premium. If you buy an in-the-money option, part of what you pay is intrinsic value that you keep as long as the stock stays put.',
    'Compare two calls by what has to happen, not by their price in dollars. A cheap out-of-the-money call needs the stock to travel past the strike and then past the premium on top. A dearer in-the-money call needs less movement but costs more if it goes wrong.',
    { h: 'Mistakes to avoid' },
    {
      list: [
        'Swapping the formulas: the put is K − S, the call is S − K.',
        'Thinking all options are worth zero at expiry. Only the out-of-the-money ones are.',
        'Calling an option cheap because its premium is small, without asking how much of it is time value.',
      ],
    },
  ],

  'options-long': [
    { h: 'The picture at expiry' },
    'At expiry an option is worth exactly its intrinsic value. That makes the outcome of a bought option easy to draw: for every possible stock price on the last day, you know what the option pays. This picture is called a **payoff diagram**. The stock price at expiry goes along the bottom, profit or loss up the side.',

    { h: 'Payoff and profit' },
    'The **payoff** is what the option pays at expiry: `max(S − K, 0)` for a call and `max(K − S, 0)` for a put, with S now the stock price at expiry. The **profit** subtracts what you paid: payoff minus premium, per share. For dollars, multiply by 100 and by the number of contracts.',
    { sub: 'A worked example with a call' },
    'You buy one 80 call for 1.50. At expiry:',
    {
      list: [
        'Stock at 75: the call pays 0. Profit 0 − 1.50 = −1.50 per share, −$150.',
        'Stock at 80: still pays 0. Same loss, −$150.',
        'Stock at 81: pays 1. Profit 1 − 1.50 = −0.50, −$50. In the money, and still a loss.',
        'Stock at 85: pays 5. Profit 3.50, +$350.',
      ],
    },
    { code: `def call_profit(S, K, premium, contracts=1):
    return (max(S - K, 0) - premium) * 100 * contracts

print([call_profit(S, 80, 1.5) for S in (75, 81, 85)])`, out: '[-150.0, -50.0, 350.0]' },
    { sub: 'The hockey stick' },
    'Plot those points and you get a flat line at −$150 up to the strike, then a line rising one dollar of profit per share for every dollar the stock gains. Traders call this shape the **hockey stick**. A long put is the same shape reversed: it rises as the stock falls below the strike and is flat above it.',

    { h: 'Breakeven' },
    'The **breakeven** is the stock price at expiry where profit is exactly zero. For a long call the stock must climb past the strike by the premium: breakeven = strike + premium. For the 80 call at 1.50 it is 81.50. For a long put the stock must fall below the strike by the premium: breakeven = strike − premium. A 60 put bought for 2 breaks even at 58.',
    'Fees and the spread you paid on entry are not in that formula. They push the real breakeven a little further away, so finishing exactly at the breakeven is a small loss.',

    { h: 'The best and the worst case' },
    { sub: 'Maximum loss' },
    'A bought option can never lose more than its premium, because its payoff is never below zero. It loses all of the premium whenever it finishes out of the money. This is the main attraction of buying: the worst case is known in advance.',
    { sub: 'Maximum profit' },
    'A call has no ceiling: the higher the stock goes, the more it pays. A put does have one, because a stock cannot fall below zero. The best case for a put is the stock going to zero, where it pays the full strike. Its maximum profit is (strike − premium) × 100 per contract. A 60 put bought for 2 can make at most 58 × 100 = $5,800.',

    { h: 'Reading a payoff chart' },
    'To tell which position a chart shows, look at three things. Where is the flat part: on the left (a call) or the right (a put)? Is it below zero (you bought) or above (you sold)? Where does the line cross zero? That crossing is the breakeven, and the distance from it to the kink is the premium.',

    { h: 'What it does not show' },
    'The diagram is the picture at expiry only. Before expiry the option still has extrinsic value, so its price sits above the hockey stick. A day trader who sells the same afternoon is paid that day\'s price, not the expiry payoff. The pricing module covers that. The expiry picture is still the map of where the trade can end up if you hold it.',
    {
      list: [
        'Mistake: thinking in the money means profitable. Profit starts at the breakeven.',
        'Mistake: adding the premium instead of subtracting it in code. The buyer pays it.',
        'Mistake: forgetting that the worst case happens often, not rarely.',
      ],
    },
  ],

  'options-short': [
    { h: 'Taking the other side' },
    'Every option bought was sold by someone. **Selling** (or **writing**) an option means you receive the premium now and take on the duty: deliver the shares if a call you sold is exercised, buy them if a put you sold is exercised. A position you have sold is called **short**; one you have bought is **long**.',
    'At expiry the seller owes the buyer the payoff. So the seller\'s profit per share is premium minus payoff:',
    {
      list: [
        'Short call: `premium − max(S − K, 0)`.',
        'Short put: `premium − max(K − S, 0)`.',
      ],
    },

    { h: 'The mirror image' },
    "Draw the seller's profit and you get the buyer's hockey stick turned upside down. The flat part is now at plus the premium: the most a seller can make. It happens whenever the option finishes out of the money. The breakevens are the same as the buyer's, strike + premium for a call and strike − premium for a put, because at that price both sides make zero.",
    'Buyer plus seller always equals zero, before costs. That is a useful check on any code you write: compute both and add them.',
    { sub: 'A worked example' },
    'You sell one 70 put for 1.80. At expiry:',
    {
      list: [
        'Stock at 75: the put expires, you keep 1.80, +$180.',
        'Stock at 68.20: the put pays 1.80, you keep 1.80, profit zero. This is the breakeven.',
        'Stock at 60: you owe 10, kept 1.80, −8.20 per share, −$820.',
      ],
    },
    { code: `def short_put(S, K, premium):
    return round((premium - max(K - S, 0)) * 100, 2)

print([short_put(S, 70, 1.8) for S in (75, 60, 40)])`, out: '[180.0, -820.0, -2820.0]' },
    'Gains stop at the premium. Losses keep growing as the price falls.',

    { h: 'Naked selling' },
    'Selling an option without owning the shares or holding anything that covers it is called **naked**.',
    { sub: 'The naked short call' },
    'Above the strike a short call loses a dollar per share for every dollar the stock rises, and a stock price has no ceiling. So the loss of a naked call has **no limit**. If it is exercised you must deliver shares you do not own, which leaves you short the stock.',
    { sub: 'The naked short put' },
    'A short put loses as the stock falls, but a stock stops at zero. The worst case is (strike − premium) × 100 per contract: large, but finite.',
    'Stops do not protect a short option as well as people hope. A stock can open far from where it closed after overnight news, a **gap**, and a stop order can only fill at prices that actually trade. Brokers allow naked selling only in approved accounts and hold **margin**, money set aside against possible losses, which they can raise when the market moves.',

    { h: 'Covered and cash-secured' },
    { sub: 'Covered call' },
    'A **covered call** is a call sold against 100 shares you already own. If the stock rises past the strike and the call is exercised, you deliver those shares. The call cannot lose more than the shares gain, so there is no open-ended loss. The cost is the upside: whatever the stock does above the strike belongs to the call buyer. Your total is the gain on the shares up to the strike plus the premium. You still carry all the risk of owning the shares if the stock falls.',
    { sub: 'Cash-secured put' },
    'A **cash-secured put** is a put sold while holding enough cash to buy the shares if assigned: the strike × 100 per contract. The cash means you can pay. It does not reduce the loss if the stock falls far below the strike.',

    { h: 'Win rate against loss size' },
    'Selling out-of-the-money options wins often, because most of them expire worthless. Each win is small and each loss can be many times larger. Suppose a seller makes $80 on each of 11 trades and then loses $1,100 once: after 12 trades the total is −$220. How often you win says nothing on its own. The risk module turns this into a single number, the expectancy.',
    {
      list: [
        "Mistake: writing owed − premium for a seller's profit. That is the buyer's profit.",
        'Mistake: trusting a high win rate without pricing the rare loss.',
        'Mistake: selling naked before you can explain, with numbers, how the trade fails.',
      ],
    },
  ],

  'options-chain': [
    { h: 'What a chain is' },
    'An **option chain** is the table a broker shows for one underlying. You first choose an **expiry** from a list of dates. The table then lists every strike for that date, usually in a column down the middle, with the calls on one side and the puts on the other. Each row gives the prices and activity of the call and the put at that strike.',
    'SPY and SPX list expiries on every weekday at the time of writing (2026). Many single stocks have weekly and monthly expiries only. Check what your broker lists; it changes.',

    { h: 'The columns' },
    { sub: 'Bid, ask, mid and last' },
    'These come from the markets module. The **bid** is the highest price someone is offering to pay, so it is what you can sell at now. The **ask** is the lowest price someone will sell at, so it is what you can buy at. The **mid** is halfway: (bid + ask) / 2. **Last** is the price of the most recent trade, which on a quiet strike may be hours old, from a time when the stock was somewhere else. Value a position at the bid, not the last.',
    { sub: 'Volume and open interest' },
    '**Volume** counts the contracts traded so far today. **Open interest** (OI) counts the contracts that exist: opened and not yet closed. It is updated once a day, overnight, so it does not move during the session. Neither tells you which way people are betting. Together they say how active a strike is, and active strikes tend to have tight spreads.',

    { h: 'The spread as a cost' },
    'If you buy at the ask and sell at the bid, you lose the spread even if nothing else moves. Its dollar cost is (ask − bid) × 100 × contracts. To compare strikes with very different prices, measure the spread against the mid: `(ask − bid) / mid`.',
    { sub: 'A worked example' },
    'A call quoted 1.45 by 1.55 has a mid of 1.50 and a spread of 0.10, which is 0.10 / 1.50 ≈ 6.7% of the price. Trading 4 contracts in and out at the bid and ask costs 0.10 × 100 × 4 = $40, before fees.',
    { code: `quotes = {450: (5.10, 5.14), 470: (0.40, 0.55)}
for strike, (bid, ask) in quotes.items():
    mid = (bid + ask) / 2
    print(strike, round((ask - bid) / mid * 100, 1))`, out: '450 0.8\n470 31.6' },
    '`quotes.items()` gives each strike with its pair of prices, and `(bid, ask)` unpacks the pair into two names. Note the brackets in `(bid + ask) / 2`: Python divides before it adds, so without them you get bid + ask / 2, which is not the average.',
    'The cheap strike costs about 32% of its price to cross. Strikes far from the money often look cheap and are the most expensive to trade. A bid of zero is worse still: nobody is offering to buy that option from you at all.',

    { h: 'Moneyness on a chain' },
    'The chain shows the stock price at the top. Strikes below it are in the money for calls and out of the money for puts; strikes above it are the reverse. Many brokers shade the in-the-money side. The intrinsic and extrinsic split from the earlier lesson can be read straight off the chain: intrinsic value from the stock price and the strike, extrinsic value from the mid minus that.',

    { h: 'Choosing a contract' },
    {
      list: [
        'Pick the expiry first, long enough for the idea to play out.',
        'Pick a strike that fits the move you expect and the amount you will risk.',
        'Check the quote: spread as a share of the mid, volume, open interest, a bid above zero.',
        'Work out the cost and the maximum loss in dollars.',
        'Enter with a **limit order**, an order with a price you set, at or near the mid. A market order on an option fills at the far side of the spread, or worse.',
        'Check whether news or data are due before you plan to get out.',
      ],
    },

    { h: 'Mistakes on the chain' },
    {
      list: [
        'Reading P&L off the last price instead of the bid.',
        'Buying a far out-of-the-money strike because the premium is small, without looking at its spread.',
        'Confusing volume (today) with open interest (open contracts).',
        'Using a market order on a thin option.',
      ],
    },
  ],

  'options-exercise': [
    { h: 'Using the right' },
    'Most option positions are closed by selling them in the market. Some are not, and then the contract is settled the way it was written. **Exercise** is the holder telling their broker to use the right: buy at the strike for a call, sell at the strike for a put. **Assignment** is the other half: a seller is chosen to fulfil the duty.',
    { sub: 'Who gets assigned' },
    'In the US every listed option goes through a clearing house, the Options Clearing Corporation (**OCC**). When a holder exercises, the OCC assigns the exercise to a broker with customers short that option, and the broker picks one of them, at random or by another fair method. If you are short an option, you cannot choose when, or whether, you are assigned.',

    { h: 'American and European style' },
    '**American-style** options can be exercised on any trading day up to expiry. Options on US shares and ETFs, SPY among them, are American. **European-style** options can be exercised only at expiry. SPX options, on the S&P 500 index itself, are European, so the seller of an SPX option cannot be assigned early.',
    'European style limits exercise, not trading. You can sell a European option whenever the market is open.',

    { h: 'Shares or cash' },
    { sub: 'Physical settlement' },
    'A SPY option settles in **shares**: exercising one call buys 100 SPY at the strike, exercising one put sells 100. The money involved is the strike × 100 per contract. Exercising two 420 calls means paying 2 × 100 × 420 = $84,000 for 200 shares, whatever SPY trades at.',
    { sub: 'Cash settlement' },
    'An index cannot be delivered, so SPX options settle in **cash**: the intrinsic value at settlement, times 100. A call pays (settlement value − strike) × 100; a put pays (strike − settlement value) × 100; an out-of-the-money one pays nothing.',
    { code: `def settle_put(value, K):
    return round(max(K - value, 0) * 100, 2)

print(settle_put(4950.25, 5000), settle_put(5050.0, 5000))`, out: '4975.0 0' },
    { sub: 'AM and PM settlement' },
    'At the time of writing (2026), the standard monthly SPX options are **AM-settled**: they stop trading the business day before expiry, and the settlement value comes from the opening prices of the index stocks on expiry morning. The SPXW weekly and daily SPX options are **PM-settled**, from the close on expiry day. An AM-settled option can settle far from the previous close, and you cannot trade out in between. Contract terms change: check the exchange specification and your broker.',

    { h: 'What happens at expiry' },
    'The OCC runs a process called **exercise by exception**: at expiry, long options that finish at least $0.01 in the money are exercised unless the holder or broker says otherwise. Brokers can have their own rules, and many will close positions themselves near the close if your account cannot pay for the result.',
    'This turns small mistakes into large positions. A forgotten SPY call a few cents in the money becomes 100 shares per contract on the next trading day. A short put a few cents in the money becomes an obligation to buy 100 shares at the strike. The price can also move after the close, so an option that looked safely out of the money at 4 pm is not certain to stay that way.',

    { h: 'Why early exercise rarely pays' },
    'Exercising captures the intrinsic value and throws away the extrinsic value. Selling the option gets both. With a stock at 64 and a 60 call bid at 4.30, exercising and selling the shares nets 4.00 per share; selling the call nets 4.30. That is why holders seldom exercise early, and why sellers of options with plenty of extrinsic value are seldom assigned early.',
    { sub: 'The dividend exception' },
    'A **dividend** is cash a company pays to its shareholders. To receive it you must own the shares before the **ex-dividend date**. The holder of an in-the-money call may exercise the day before that date to collect the dividend, when the dividend is worth more than the extrinsic value they give up. The seller of that call is then assigned early, delivers the shares, and if they did not own them is short the stock and owes the dividend.',

    { h: 'The day trader\'s rule' },
    'Close every position before the bell. Never let a short option drift into expiry, and never let a long one turn into shares you cannot pay for. Know your broker\'s cut-off times and expiry policy before your first expiry day, not on it.',
  ],

  'options-leverage': [
    { h: 'More exposure per dollar' },
    'A call near the money moves roughly with 100 shares of the stock, yet costs a small fraction of their price. A given amount of money controls far more stock than it could buy outright. This **magnified exposure** works in both directions: gains and losses are both far larger, as a share of what you paid, than on the stock. It also comes with a deadline, which shares do not have.',

    { h: 'Return on the premium' },
    'The **return** on a bought option is its profit divided by the premium paid. Because the premium is small next to the stock price, the return swings much more than the stock\'s.',
    { sub: 'A worked example' },
    'A stock is at 40. The 40 call costs 0.80. Compare $800 in shares with $800 in calls, held to expiry.',
    {
      list: [
        '$800 buys 20 shares, or 10 contracts controlling 1,000 shares.',
        'Stock at 42 (+5%): shares make 20 × 2 = $40, +5%. Calls pay 2 − 0.80 = 1.20 per share on 1,000 shares, +$1,200, +150%.',
        'Stock at 40.50 (+1.25%): shares +$10. Calls pay 0.50 on a cost of 0.80, −37.5%.',
        'Stock at 40 or below: the calls lose 100%. The shares lose only what the stock loses.',
      ],
    },
    { code: `budget, stock, strike, premium = 800, 40, 40, 0.80
shares = budget // stock
contracts = int(budget // (premium * 100))
for end in (38, 40.5, 42):
    print(end, shares * (end - stock), round(contracts * 100 * (max(end - strike, 0) - premium)))`, out: '38 -40 -800\n40.5 10.0 -300\n42 40 1200' },
    '`//` is floor division: it divides and rounds down, so you never buy a fraction of a share or a contract. `int` turns the result into a whole number.',

    { h: 'Right too late' },
    'An option expires. If the stock rises 10% a week after your call expired, you have lost the whole premium. You were right about the direction and wrong about the time. Shares can wait for the move; an option cannot. That is why every option trade needs a view on how far and by when, not only on which way.',
    { sub: 'Small moves the right way' },
    'Between the strike and the breakeven a call pays something, but less than it cost. A move in your favour that is smaller than the premium is still a loss. Many first option trades end exactly like this.',

    { h: 'Notional exposure' },
    '**Notional** exposure is the value of the stock an option position controls: contracts × 100 × the stock price. Ten contracts on a 40 stock control $40,000 of stock, even though they cost $800. Notional tells you how large the position really is. A few percent move on the notional can be more than the whole premium, in either direction.',

    { h: 'Sizing by what you can lose' },
    'Because a bought option can lose 100%, size it by its premium, treated as money you can lose in full. Decide the dollars you accept losing on the trade first. Then the number of contracts is that amount divided by what one contract can lose: the premium × 100, plus the fee to buy and the fee to sell. Round down. If the answer is zero, the trade is too big for your limit.',
    'Professional practice is to risk a small fixed share of the account on each trade, so that a run of losses does not end the account. The risk module covers this in full.',
    { sub: 'Events' },
    'Option prices before events such as earnings already include a large expected move. After the news, they often fall even when the stock moves your way. The volatility module calls this IV crush. Magnified exposure plus an event is the classic way a small account disappears in a day.',

    { h: 'Mistakes with magnified exposure' },
    {
      list: [
        'Comparing an option to shares by the number of contracts instead of the dollars at risk.',
        'Buying many contracts because the premium "is only 0.50".',
        'Judging skill from a few large percentage wins. Look at many trades, after costs.',
      ],
    },
  ],

  'options-lab': [
    { h: 'What the engine does' },
    'A **payoff engine** answers one question: for a given set of option positions, what is the profit or loss at each possible price of the underlying at expiry? Every later module builds on this, from spreads to risk limits. This lab writes it in plain Python, small piece by small piece, with a test for each piece.',

    { h: 'Legs as data' },
    'A position is made of **legs**: one leg per contract type you hold. Keep each leg as a Python dictionary, a set of named values:',
    { code: `leg = {'kind': 'put', 'side': 'long', 'strike': 95, 'premium': 1.2, 'qty': 3}
print(leg['strike'], leg['side'])`, out: '95 long' },
    '`leg[\'strike\']` reads the value stored under the name `strike`. A position is then a list of such dictionaries. Storing the position as data, rather than writing a new function for each strategy, means one engine handles anything.',

    { h: 'From payoff to leg profit' },
    { sub: 'The payoff' },
    'The payoff per share at expiry is the intrinsic value: `max(S − K, 0)` for a call, `max(K − S, 0)` for a put.',
    { sub: 'The sign of a short leg' },
    "A long leg earns payoff minus premium. A short leg earns exactly the opposite, premium minus payoff. One way to write both is to compute the long version and multiply by a **sign**: +1 for long, −1 for short. Then multiply by 100 and by the quantity. A long 95 put bought at 1.20 is worth (5 − 1.20) × 100 = $380 at 90; the short one at the same price is −$380.",

    { h: 'A whole position' },
    'Payoffs add. The profit of a position at a price is the sum of the profits of its legs at that price: in Python, `sum(...)` over the list of legs. Evaluate it at every price on a **grid**, a list of evenly spaced prices such as 0, 1, 2 up to 200, and you have the payoff diagram as a list of numbers.',

    { h: 'Finding breakevens' },
    'A **breakeven** is a price where the profit is zero. On a grid it is usually between two points: the profit is negative at one and positive at the next. Between two neighbouring grid points with no strike in between, the payoff is a straight line, so you can find the crossing exactly.',
    { sub: 'Straight-line interpolation' },
    'Take two prices a and b with profits pa and pb of opposite sign. The profit changes by pb − pa over the distance b − a. To climb from pa to zero it must change by −pa, which is the fraction −pa / (pb − pa) of the way. So the crossing is at `a + (b − a) × (−pa) / (pb − pa)`. Example: profit −30 at 60 and +70 at 61 gives 60 + 1 × 30 / 100 = 60.3.',
    { code: `a, b, pa, pb = 60, 61, -30, 70
print(a + (b - a) * -pa / (pb - pa))`, out: '60.3' },
    'Watch the minus sign: dropping it puts the crossing on the wrong side of a. And when a grid point itself has profit exactly zero, record it once, from that point, and do not also record it from the pair on either side.',

    { h: 'The edges of the grid' },
    'A grid ends somewhere, but prices do not. Below the lowest strike only puts change the profit, and prices stop at zero, so a grid that starts at 0 already contains the worst downside. Above the highest strike only calls change the profit: each long call adds $100 per point the price rises, each short call takes $100 away. Count **net calls**, long call quantity minus short call quantity. If it is positive, profit grows without limit. If it is negative, the loss does. In Python, report that with `None` instead of a number from the grid edge, which would look finite and be wrong.',

    { h: 'Testing the engine' },
    {
      list: [
        'Check each of the four single legs on prices you can work out by hand.',
        'Check that the long and short versions of any leg sum to zero at every price.',
        'Use a grid that starts at 0 and contains every strike.',
        'Remember it is the picture at expiry only. Before expiry options still hold extrinsic value.',
      ],
    },
  ],
}
