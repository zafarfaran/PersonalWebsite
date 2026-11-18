import type { Module } from '../types'

export const business: Module = {
  id: 'business',
  title: 'Psychology and the business of trading',
  summary:
    'Why people who understand options still lose money with them, and how to run trading like a small business: a written plan, circuit breakers, a routine, honest records, slow scaling and a clear view of costs and of what the studies of day traders found.',
  lessons: [
    {
      id: 'business-losing',
      title: 'How traders really lose',
      summary: 'Loss aversion and the disposition effect: why people cut winners, hold losers and mistake a high win rate for an edge.',
      widget: 'business-disposition',
      text: [
        'Knowing how options work does not stop most people losing money with them. The large studies of day traders (the last teaching lesson of this module has the numbers) find that most lose, and the losses come from a short list of habits. The habits come from how people feel about gains and losses, so they are predictable, and what is predictable can be written into rules.',
        "**Loss aversion**: a loss hurts more than a gain of the same size pleases. In Kahneman and Tversky's experiments the ratio came out at about 2, and later studies find numbers in the same region. In trading it shows up as a refusal to make a loss real: while the position is open, the loss feels as if it might still go away.",
        'The **disposition effect** is what that does to a trade list. Winners are sold early to lock in the good feeling, and losers are held in the hope of getting back to even. Terrance Odean studied 10,000 accounts at a US discount broker (1998) and found gains were realised at about 1.5 times the rate of losses (14.8% against 9.8%), and the winners people sold went on to do better, on average, than the losers they kept.',
        'It leaves a recognisable journal: a high win rate, small average wins and a few large losses. A high win rate proves nothing on its own. On a price that moves at random, a target `a` above the entry and a stop `b` below it win with probability `b ÷ (a + b)`, and the average result is exactly zero before costs. Cutting the target and widening the stop raises the win rate and leaves the edge where it was: at nothing, and below nothing once costs are paid.',
        'Options make holding a loser dearer than with shares. A long option loses time value every day you wait (theta, from the pricing module), so waiting for it to come back costs money even if the stock does come back slowly, and it can expire worthless. A short option that goes against you can lose many times the premium you collected.',
        'The fix is mechanical: decide the exit before the entry, put the stop and target in the order where you can (a bracket order), measure every trade in **R** (the amount you planned to risk on it), and compare your average win with your average loss every week.',
      ],
      rules: [
        'Losses feel about twice as large as equal gains. Expect to want to hold losers.',
        'Disposition effect: selling winners early and holding losers. It shows as a high win rate with large average losses.',
        'Expectancy = win rate × average win − loss rate × average loss. A win rate alone says nothing.',
        'On a random price, a target `a` and a stop `b` win `b ÷ (a + b)` of the time and earn nothing before costs.',
        'Set the exit before the entry, and never widen a stop once you are in the trade.',
        'A losing long option keeps losing time value while you wait for it to recover.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-losing-1',
          ask: 'Your journal for the month: win rate 78%, average win $60, average loss $240. What is the most likely story?',
          options: [
            'A skilled trader: 78% is far above the 50% of a coin',
            'The disposition effect: winners cut quickly, losers held until they are large',
            'Bad luck: the losses will even out over the next month',
            'Commissions: they are making the wins look small',
          ],
          answer: 1,
          why: 'Small wins with a high win rate and losses four times as large is the fingerprint of selling winners early and holding losers. The next question shows that this record loses money even with 78% winners.',
        },
        {
          kind: 'number',
          id: 'business-losing-2',
          ask: 'Same journal: win rate 78%, average win $60, average loss $240. What is the expectancy per trade, in dollars?',
          answer: -6,
          check: '0.78 * 60 - 0.22 * 240',
          hint: 'Win rate × average win − loss rate × average loss. The loss rate is 22%.',
          why: '0.78 × 60 = 46.80 and 0.22 × 240 = 52.80, so each trade loses $6 on average. A 78% win rate can lose money; what matters is the size of the wins against the size of the losses.',
        },
        {
          kind: 'number',
          id: 'business-losing-3',
          ask: 'A stock moves at random, with no drift. You buy it with a target $1 above your entry and a stop $3 below. What share of trades reach the target? Give a percentage, for example 25%.',
          answer: 0.75,
          check: '3 / (1 + 3)',
          hint: 'With a target `a` and a stop `b`, the chance of the target first is `b ÷ (a + b)`.',
          why: 'The stop is three times as far away as the target, so the target is hit first three times out of four: 3 ÷ (1 + 3) = 75%. The win rate comes from where you put the exits, not from skill.',
        },
        {
          kind: 'number',
          id: 'business-losing-4',
          ask: 'You take that setup 100 times, 100 shares each time: target +$1, stop −$3, a 75% win rate, and $2 of costs per round trip. What is the expected total result, in dollars?',
          answer: -200,
          check: '100 * (100 * (0.75 * 1 - 0.25 * 3) - 2)',
          why: 'Per share the expectancy is 0.75 × 1 − 0.25 × 3 = 0. So each trade expects only its cost, −$2, and 100 trades expect −$200. Three wins in four and a steady loss.',
        },
        {
          kind: 'choice',
          id: 'business-losing-5',
          ask: 'You bought a QQQ put for $2.00 with a written plan to sell if it fell to $1.20. It is now $1.10, and you think: "If I sell now the loss becomes real. It could bounce." What is happening, and what does the plan say?',
          options: [
            'Loss aversion: the plan says sell now, as close to $1.10 as you can get',
            'Patience: give the trade room by moving the stop to $0.80',
            'Nothing yet: the loss is not real until you sell, so waiting costs nothing',
            'An opportunity: buy a second put at $1.10 to lower your average price',
          ],
          answer: 0,
          why: 'The loss is already real: the put is worth $1.10 whether you sell it or not. Moving the stop or adding to a loser is the disposition effect at work, and a put keeps losing time value while you wait.',
        },
        {
          kind: 'choice',
          id: 'business-losing-6',
          ask: 'In the figure, set the target to 1 and the stop to 4, with the cost at 0. Then raise the cost to 0.05. What do you see?',
          options: [
            'A win rate near 80%, a line that wanders around zero, and with the cost a line that drifts down',
            'A win rate near 80% and a line that climbs, because most trades win',
            'A win rate near 20%, because the stop is further away than the target',
            'The cost lowers the win rate but leaves the line where it was',
          ],
          answer: 0,
          why: 'With a stop four times as far away, 4 ÷ (1 + 4) = 80% of trades win, and the expectancy is still 0.8 × 1 − 0.2 × 4 = 0. The cost does not touch the win rate; it is taken off every trade, so the line drifts down by 5 cents a trade.',
        },
        {
          kind: 'choice',
          id: 'business-losing-7',
          ask: 'You hold a call that is down 35%, with three days to expiry and out of the money. You decide to wait for it to recover. What happens to its value if the stock stays flat?',
          options: [
            'It stays where it is until the stock moves',
            'It keeps falling as time value decays, and it is worth nothing at expiry if still out of the money',
            'It rises as expiry gets closer',
            'The broker swaps it for shares at the strike',
          ],
          answer: 1,
          why: 'An out-of-the-money option is all time value, and time value decays fastest near expiry. Holding a losing option is not the same as holding a losing share: the clock is against you even when the price is not.',
        },
        {
          kind: 'output',
          id: 'business-losing-8',
          ask: 'A week of trades in dollars. What does this print?',
          code: `trades = [40, 35, -150, 50, 30, -160, 45]
wins = [t for t in trades if t > 0]
print(round(len(wins) / len(trades), 2), sum(trades))`,
          answer: '0.71 -110',
          why: 'Five of seven trades win (0.71), but the wins add up to $200 and the two losses to $310, so the week is −$110. The win rate is the number people quote; the sum is the number that pays.',
        },
        {
          kind: 'bug',
          id: 'business-losing-9',
          ask: 'This should say when to exit. With a $50 stop and a $100 target, it says `stop` on a trade that is up $20.',
          code: `def exit_signal(pnl, stop, target):
    # stop and target are positive dollar amounts
    if pnl >= target:
        return 'target'
    if pnl <= stop:
        return 'stop'
    return None`,
          line: 5,
          fix: '    if pnl <= -stop:',
          why: 'The stop is given as a positive amount, so a loss of that size is `pnl <= -stop`. As written, any result below +$50 counts as stopped out, so small winners are cut. Test exit code with a loss, a small win and a flat result before trusting it with money.',
        },
        {
          kind: 'choice',
          id: 'business-losing-10',
          ask: 'Which of these did Odean find in the trading records of 10,000 accounts at a US discount broker?',
          options: [
            'Investors realised gains at about 1.5 times the rate they realised losses',
            'Investors realised losses faster than gains, to save tax',
            'Investors with more trades earned more',
            'Investors sold winners and losers at the same rate',
          ],
          answer: 0,
          why: 'The proportion of gains realised was 14.8% against 9.8% of losses. The winners sold also went on to beat the losers kept, so the habit cost money as well as feeling good. There was one exception: in December, when selling losers cuts the tax bill, more losses were taken.',
        },
        {
          kind: 'design',
          id: 'business-losing-11',
          ask: 'Write the exit rules that stop you holding losers and cutting winners, for a day trade in SPY options. What do they cover?',
          checklist: [
            { point: 'The stop is decided before entry, as a price on the underlying or on the option', why: 'Decided calmly, it is a rule; decided during the trade, it is a hope.' },
            { point: 'The stop and target go into the order as a bracket where the broker allows it', why: 'An order that is already working does not wait for you to feel ready to lose.' },
            { point: 'A stop is never widened once in the trade; it may only be tightened', why: 'Widening a stop is the disposition effect written as a decision.' },
            { point: 'A time stop: out by a set time if neither level is hit', why: 'A long option loses time value while nothing happens; a flat trade is a slow loss.' },
            { point: 'No adding to a losing position', why: 'Averaging down turns a planned 1R loss into a 2R or 3R one.' },
            { point: 'The weekly review compares average win with average loss, in R', why: 'This is the number that shows the disposition effect, and the win rate hides it.' },
          ],
          why: 'Every item takes a decision away from the moment when loss aversion is strongest. The review closes the loop: if the average loss is creeping past 1R, the rules are being broken.',
        },
      ],
    },
    {
      id: 'business-tilt',
      title: 'Tilt, revenge and overtrading',
      summary: 'What losing does to the next decision, and circuit breakers that take that decision away from you.',
      widget: 'business-tilt',
      text: [
        '**Tilt** is a poker word for playing worse because of how you feel. In trading it follows a run of losses, a loss that felt unfair, or a big win. The decisions you made calmly before the open stop being the ones you make.',
        'It comes in three common forms. **Revenge trading**: a bigger or worse trade to win back today\'s loss. **Overtrading**: trades that are not in the plan, taken because sitting still feels like losing; every extra trade pays the spread and fees. **FOMO** (fear of missing out): chasing a move that has already happened, which puts the entry far from any sensible stop, so either the risk grows or the stop becomes meaningless.',
        'Doubling up to recover is the worst version. Start with one contract and double after each loss: four losses in a row cost 1 + 2 + 4 + 8 = 15 times the first risk. Losing streaks of four are ordinary for any strategy, as the risk module showed.',
        'Willpower is weakest exactly when tilt arrives, so the answer is **circuit breakers**: rules set before the session that make the decision for you. A daily loss limit (for example 3R, or 2% of the account), a maximum number of trades, a stop after a set number of losses in a row, no size increase during the day, a break away from the screen after any loss larger than planned. Where your broker offers loss or position limits on the account, use them, so the rule does not depend on you.',
        'A circuit breaker is not a guarantee. A fast market can jump through a stop, so a day can end past the limit. What it removes is the long tail: the day when one loss becomes ten.',
      ],
      rules: [
        'Tilt is trading worse because of how you feel after losses or big wins. Plan for it rather than hope to avoid it.',
        'Never add size to win back a loss. Doubling through four losses costs 15 units of risk.',
        'Every unplanned trade pays costs and has no edge you have measured.',
        'A chased entry is far from any sensible stop: either the risk grows or the stop means nothing.',
        'Set a daily loss limit, a maximum number of trades and a losses-in-a-row stop before the open, and obey them mechanically.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-tilt-1',
          ask: 'It is 10:05. You have taken two planned trades and lost 1R on each. Your daily loss limit is 3R. You feel a strong urge to "make it back" before lunch. What does a rule-based trader do?',
          options: [
            'Takes the next planned setup at normal size, or steps away for a set break first; never a bigger or unplanned trade',
            'Doubles the size on the next trade, since one win at 2R recovers the morning',
            'Stops trading for the week',
            'Switches to a cheaper, further out-of-the-money option so a small move pays more',
          ],
          answer: 0,
          why: 'Two planned losses are normal and the limit has not been hit, so trading can continue at the same size, on the same setups. The urge is the warning: a break before the next trade is a sensible rule. Bigger size and lottery-ticket options are revenge trading.',
        },
        {
          kind: 'number',
          id: 'business-tilt-2',
          ask: 'You risk $100 per contract and double the number of contracts after every loss, starting at one. How much have you lost after four losses in a row, in dollars?',
          answer: 1500,
          check: '(1 + 2 + 4 + 8) * 100',
          why: '1 + 2 + 4 + 8 = 15 contracts lost, at $100 each: $1,500, fifteen times the first risk. A fifth loss would cost another $1,600. Doubling only "works" until the streak is one longer than the account can pay for.',
        },
        {
          kind: 'number',
          id: 'business-tilt-3',
          ask: 'Your daily loss limit is 2% of a $20,000 account, and each trade risks $100. How many full losing trades can you take before you must stop for the day?',
          answer: 4,
          check: '20000 * 0.02 / 100',
          why: '2% of $20,000 is $400, which is four losses of $100. Writing the limit as a number of losing trades makes it easy to obey in the moment.',
        },
        {
          kind: 'choice',
          id: 'business-tilt-4',
          ask: 'QQQ broke out of its opening range 20 minutes ago and has run a long way. Your setup was the breakout, which you missed. Buying a call now means what?',
          options: [
            'The same trade a little later, with the same risk',
            'A different trade: the logical stop (back inside the range) is now far away, so either the risk per contract is much larger or the stop has no meaning',
            'A safer trade, since the move has proved itself',
            'A cheaper trade, since the option has less time value now',
          ],
          answer: 1,
          why: 'Chasing (FOMO) moves the entry away from the level that defines the stop. Keep the stop where it belongs and you can afford fewer contracts; tighten it to keep the size and it sits in the middle of normal noise. A missed trade is not a loss.',
        },
        {
          kind: 'number',
          id: 'business-tilt-5',
          ask: 'Each round trip costs you $8 in commissions, fees and slippage. You go from 5 trades a day to 25. How much more do you pay in costs over 20 trading days, in dollars?',
          answer: 3200,
          check: '(25 - 5) * 8 * 20',
          why: '20 extra trades a day × $8 × 20 days = $3,200 a month, before asking whether the extra trades had any edge at all. Overtrading is paid for in certain costs and uncertain profits.',
        },
        {
          kind: 'bug',
          id: 'business-tilt-6',
          ask: 'A circuit breaker for the trading app you are writing. With `max_trades = 5` it still allows a sixth trade.',
          code: `def can_trade(day_pnl, trades_today, limit, max_trades):
    if day_pnl <= -limit:
        return False
    if trades_today > max_trades:
        return False
    return True`,
          line: 4,
          fix: '    if trades_today >= max_trades:',
          why: 'After five trades, `trades_today` is 5, and `5 > 5` is false, so a sixth trade is allowed. The limit is reached when the count equals the maximum. Off-by-one errors in a risk rule cost real money; test the rule at exactly the limit.',
        },
        {
          kind: 'output',
          id: 'business-tilt-7',
          ask: 'A rule: stop for the day after three losses in a row. Results in R, in the order the trades came. What does this print?',
          code: `pnl = [-1, 2, -1, -1, -1, 3, 2]
streak, taken = 0, 0
for r in pnl:
    taken += 1
    streak = streak + 1 if r < 0 else 0
    if streak == 3:
        break
print(taken, sum(pnl[:taken]))`,
          answer: '5 -2',
          why: 'The streak resets after the win at trade 2 and reaches three at trade 5, so five trades are taken, for −1 + 2 − 1 − 1 − 1 = −2R. The rule gave up the +5R that came after. That is the price of a circuit breaker on a good day; it is paid back on the days when the streak would have kept going.',
        },
        {
          kind: 'choice',
          id: 'business-tilt-8',
          ask: 'In the figure, choose On tilt with no loss limit and read the worst day. Then set the daily loss limit to 3R. What changes?',
          options: [
            'The worst day shrinks from about −63R to about −10R, and the total is still negative',
            'The total turns positive, because the limit stops the losing days',
            'Nothing: a limit cannot change what the trades do',
            'The worst day becomes exactly −3R',
          ],
          answer: 0,
          why: 'The limit cuts off the catastrophic days, but it is checked between trades, and a doubled position can lose 8R in one go, so days still end well past −3R. The habit itself, worse trades at bigger size, still loses. A loss limit is a seat belt, not a cure.',
        },
        {
          kind: 'choice',
          id: 'business-tilt-9',
          ask: 'Why set the daily loss limit in the morning, rather than decide at 2 pm whether you have lost enough?',
          options: [
            'Because after losses, judgement about risk is at its worst, and the decision has to be made by a calmer you',
            'Because brokers require it',
            'Because markets are less volatile in the morning',
            'There is no difference if you are disciplined',
          ],
          answer: 0,
          why: 'The person deciding at 2 pm after a bad morning is the person tilt is affecting. A rule made in advance, ideally enforced by the platform, takes the choice away from them.',
        },
        {
          kind: 'choice',
          id: 'business-tilt-10',
          ask: 'You made 4R by 10:30, your best morning in months. Which risk now matters most?',
          options: [
            'None: a winning day cannot hurt you',
            'Euphoria: raising size or loosening the setup rules because you feel you cannot miss',
            'Taxes on the gain',
            'That the broker will restrict the account',
          ],
          answer: 1,
          why: 'Tilt follows big wins as well as losses. A rule such as "no size increase during the day" covers both directions. Many traders also protect a good day with a rule such as stopping if half of the gain is given back.',
        },
        {
          kind: 'design',
          id: 'business-tilt-11',
          ask: 'Write the circuit breakers for your own trading day. What do they cover, and how are they enforced?',
          checklist: [
            { point: 'A daily loss limit in dollars and in R, for example 3R', why: 'One number to stop at, decided before any loss.' },
            { point: 'A maximum number of trades per day', why: 'Caps overtrading and the costs that come with it.' },
            { point: 'Stop after a set number of losses in a row', why: 'Streaks are when tilt starts; this catches it early.' },
            { point: 'No size increase during the session, after a win or a loss', why: 'Removes revenge doubling and euphoric oversizing in one rule.' },
            { point: 'A break away from the screen after any loss larger than planned', why: 'An outsized loss means something went wrong; the next decision should not follow it immediately.' },
            { point: 'Enforcement outside your head: broker limits, a checklist, closing the platform', why: 'A rule you have to remember while upset is a rule that will be broken.' },
            { point: 'A record of each time a breaker fired and what the day would have been without it', why: 'The review shows whether the breakers are set at sensible levels.' },
          ],
          why: 'The point of circuit breakers is that they act when your judgement is worst. That only works if they are numbers, set in advance, and as far as possible enforced by something other than willpower.',
        },
      ],
    },
    {
      id: 'business-process',
      title: 'Process over outcome',
      summary: 'Judging a trade by the decision, not the result: good losses, bad wins and why the short run says so little.',
      widget: 'business-luck',
      text: [
        'A single trade is mostly luck. A setup with a real edge can lose five times in a row, and a reckless trade can make money. Judge yourself by the last trade and you will reward the reckless trade and abandon the good setup. Poker players call this **resulting**: judging a decision by how it turned out.',
        'Judge each trade on two separate questions. Was it a good decision: in the plan, a tested setup, the right size, exits set in advance? And how did it turn out? That gives four boxes: a **deserved win**; a **good loss** (right decision, wrong side of the odds: accept it); a **bad win** (rules broken, money made: the most dangerous box, because it teaches the wrong lesson); and a **bad loss**.',
        'Give every trade a process grade at the time, before you know how it ends, and track the share of trades that followed the rules: your **rule adherence**. The P&L of a day or a week says little. The adherence figure says whether you are running the strategy you tested.',
        'Numbers show why. A setup that wins half the time, makes 1.5R on a win and loses 1R on a loss expects 0.5 × 1.5 − 0.5 × 1 = +0.25R a trade. It still loses four in a row about 6% of the time, and after 10 trades it is behind about 17% of the time. Only over many trades does the result start to report on the process.',
        'Results still matter in bulk. If the rules were followed over a large sample and the setup lost, the setup is the problem. Process over outcome is about the single trade and the short run. It is not a reason to ignore the results for ever.',
      ],
      rules: [
        'Judge a trade by the decision, not by the result. Grade it before you know the result.',
        'Good loss: in the plan, sized right, stopped out. Accept it and take the next one.',
        'Bad win: rules broken, money made. Log it as a mistake; it is the trade most likely to be repeated.',
        'Track rule adherence as a number, for example 95% of trades this month.',
        'Over a few trades the result is noise. Over a large sample it is the verdict on the setup.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-process-1',
          ask: 'You took an opening range breakout exactly as written, at the planned size, with the stop in the order. The breakout failed and you lost 1R. How do you file it?',
          options: ['A good loss: the decision was right and the odds went against it', 'A bad trade: it lost money', 'A sign that the setup has stopped working', 'A reason to widen the stop next time'],
          answer: 0,
          why: 'Every setup with an edge has losers. If the decision was in the plan and the loss was the planned size, there is nothing to fix. Changing the rules after one loss is resulting.',
        },
        {
          kind: 'choice',
          id: 'business-process-2',
          ask: 'You took a trade that was not in your plan, at triple size, with no stop, and made $900. Why is this the most dangerous kind of trade?',
          options: [
            'It is not dangerous: it made money',
            'Because it rewards the rule break, so you are more likely to repeat it, and the same behaviour will one day produce a large loss',
            'Because it will be taxed at a higher rate',
            'Because the broker may reverse it',
          ],
          answer: 1,
          why: 'A bad win teaches that breaking rules pays. The behaviour, unplanned trades at triple size without a stop, has a tail that ends accounts. Log it as a rule break, whatever it made.',
        },
        {
          kind: 'number',
          id: 'business-process-3',
          ask: 'A setup wins 40% of the time. What is the chance that the next five trades are all losers? Give a percentage to one decimal place, for example 12.5%.',
          answer: 0.0778,
          tol: 0.002,
          check: '0.6 ** 5',
          why: '0.6 multiplied by itself five times is 0.078, about 7.8%. Over a few hundred trades, five losers in a row will happen several times. A good setup produces this streak; it does not prove the setup is broken.',
        },
        {
          kind: 'number',
          id: 'business-process-4',
          ask: 'That setup wins 40% of the time, makes 2R on a win and loses 1R on a loss. How many R do you expect to make over 50 trades?',
          answer: 10,
          check: '50 * (0.4 * 2 - 0.6 * 1)',
          why: 'The expectancy is 0.4 × 2 − 0.6 × 1 = +0.2R per trade, and 50 trades × 0.2R = 10R. That is the average; any one stretch of 50 trades can land well above or below it.',
        },
        {
          kind: 'number',
          id: 'business-process-5',
          ask: 'With the same setup (40% winners, +2R, −1R), what is the chance of being behind after 20 trades? You are behind with 6 or fewer winners. Give a percentage, for example 12%.',
          answer: 0.25,
          tol: 0.005,
          check: 'sum(math.comb(20, k) * 0.4 ** k * 0.6 ** (20 - k) for k in range(7))',
          hint: 'With W winners the result is 2W − (20 − W) = 3W − 20. Add the binomial probabilities of 0 to 6 winners.',
          why: 'It comes to 25%: one trader in four running this positive setup is down after 20 trades. Judging the setup, or yourself, on 20 trades would throw away a good process a quarter of the time.',
        },
        {
          kind: 'choice',
          id: 'business-process-6',
          ask: 'In the figure, choose Good process and set 20 trades. Then choose Bad process with 20 trades, then 200. What do you see?',
          options: [
            'At 20 trades about a quarter of the good traders are behind and several bad ones are ahead; at 200 nearly every bad trader is behind',
            'Every good trader is ahead at every length, because the setup has an edge',
            'The bad process has the higher win rate, so it is ahead at 200 trades too',
            'At 200 trades the good and bad processes look the same',
          ],
          answer: 0,
          why: 'Ten of forty good traders are behind at 20 trades, and eight bad ones are ahead. By 200 trades the bad process (a 55% win rate with losses larger than wins) has put 39 of 40 behind. A high win rate does not rescue a negative expectancy, and short samples do not separate good from bad.',
        },
        {
          kind: 'output',
          id: 'business-process-7',
          ask: 'Each trade is (result in R, rules followed). What does this print?',
          code: `trades = [(2.0, True), (-1.0, True), (3.0, False),
          (-1.0, True), (-2.5, False), (2.0, True)]
followed = [r for r, ok in trades if ok]
broken = [r for r, ok in trades if not ok]
print(round(len(followed) / len(trades), 2), sum(followed), sum(broken))`,
          answer: '0.67 2.0 0.5',
          why: 'Four of six trades followed the rules (0.67). They made 2.0R; the two rule breaks made 0.5R between them: a 3R bad win and a 2.5R loss, larger than the 1R stop. Adherence of 67% means you were not trading your plan a third of the time.',
        },
        {
          kind: 'bug',
          id: 'business-process-8',
          ask: 'This should return the share of trades that followed the rules. It crashes.',
          code: `def adherence(trades):
    # trades: a list of dicts, each with a key 'followed' (True or False)
    kept = sum(1 for t in trades if t['followed'])
    return kept / len(kept)`,
          line: 4,
          fix: '    return kept / len(trades)',
          why: '`kept` is a number, and `len` of a number raises a TypeError. The share is the count of trades that followed the rules divided by the count of all trades.',
        },
        {
          kind: 'choice',
          id: 'business-process-9',
          ask: 'A week ends −3R. Every trade followed the plan and every loss was 1R. What is the right verdict on the week?',
          options: [
            'A good week of process with a poor result; nothing to change on the strength of one week',
            'A bad week: change the setup before Monday',
            'Proof the market has changed',
            'A reason to trade bigger next week to catch up',
          ],
          answer: 0,
          why: 'With 100% adherence and controlled losses, a −3R week is within what any real setup produces. The setup is judged on its record over a large sample, not on one week. Trading bigger to catch up is revenge trading over a longer timescale.',
        },
        {
          kind: 'choice',
          id: 'business-process-10',
          ask: 'Over 200 trades you followed the rules 97% of the time, and the setup averaged −0.15R a trade after costs. What now?',
          options: [
            'Keep going: process matters more than outcome',
            'The evidence says this setup has no edge as you trade it: stop trading it live and go back to testing',
            'Raise size to make up for the low expectancy',
            'Lower the stop so that the win rate rises',
          ],
          answer: 1,
          why: 'Process over outcome applies to single trades and short runs. Over 200 trades taken as planned, the result is the verdict on the setup. Moving the stop to raise the win rate does not create an edge.',
        },
        {
          kind: 'design',
          id: 'business-process-11',
          ask: 'Design a process scorecard that you fill in for every trade. What is on it, and when do you fill it in?',
          checklist: [
            { point: 'Was the setup in the written plan, and which one (a tag)', why: 'Lets you measure each setup separately and spot unplanned trades.' },
            { point: 'Was the size right for the risk rule', why: 'Size errors turn good decisions into large losses.' },
            { point: 'Were the stop and target set before entry, and kept', why: 'Catches the disposition effect trade by trade.' },
            { point: 'Was it taken within the circuit breakers (loss limit, trade count)', why: 'A trade after the limit is a rule break whatever its result.' },
            { point: 'A grade given at entry, before the result is known', why: 'Grading after the result lets the outcome leak into the judgement.' },
            { point: 'The result in R, kept apart from the grade', why: 'The two together fill the four boxes: deserved win, good loss, bad win, bad loss.' },
          ],
          why: 'The scorecard separates the decision from the result. Over time it gives you an adherence figure and a record of what rule breaks cost, which is where most improvement comes from.',
        },
      ],
    },
    {
      id: 'business-plan',
      title: 'The trading plan',
      summary: 'Markets, setups, sizing, limits and routine, written down before the session, with rules someone else could check.',
      text: [
        'A **trading plan** is a written document that says what you trade, when, how much and when you stop. It exists because decisions made during the session, with money moving, are worse than decisions made the evening before. During the session you follow it. You change it only outside market hours.',
        'A useful plan has six parts. **Markets**: the exact underlyings and options you trade, for example SPY and QQQ options with one to seven days to expiry, and what you will not touch. **Setups**: each written as rules for context, trigger, entry, stop, target and invalidation, as in the day trading module. **Sizing**: the fraction of the account at risk per trade and how that becomes a number of contracts. **Limits**: daily loss limit, maximum trades, maximum open risk across positions. **Routine**: the hours you trade, the preparation before and the review after. **Exceptions**: days you do not trade, such as a Fed decision day if your setups were not tested on them.',
        'Every rule should be **testable**: someone else, reading the plan and the chart, should agree whether a trade broke it. "Buy when momentum is strong" is not a rule. "Buy a call when a 5-minute bar closes above the opening range high with volume above its 20-bar average" is.',
        'Sizing in the plan is arithmetic, from the risk module. With a $20,000 account and 0.5% risk per trade, the budget is $100. A call bought at $3.00 with a stop at $2.20 risks $0.80 × 100 = $80 per contract, so the plan allows 1 contract. Always round down.',
        'Add if-then rules for the moments that go wrong. If I hit the daily loss limit, then I close the platform. If a fill is far worse than expected, then I log it and do not chase. If I break a rule, then the next trade is at half size. Read the plan before every session.',
      ],
      rules: [
        'Write the plan before the session. Change it only outside market hours.',
        'Cover markets, setups, sizing, limits, routine and exceptions.',
        'Each rule must be testable: two people should agree whether a trade broke it.',
        'Contracts = risk budget ÷ risk per contract, rounded down.',
        'Write if-then rules for the moments that go wrong.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-plan-1',
          ask: 'Which of these is a testable rule for a trading plan?',
          options: [
            'Buy calls when the market feels strong',
            'Buy a call when a 5-minute bar closes above the opening range high, after 9:45 ET, with the stop at the opening range low',
            'Only take high-quality setups',
            'Be patient and wait for confirmation',
          ],
          answer: 1,
          why: 'Anyone with the chart can check the close, the time and the level. The others cannot be checked, so they cannot be broken, and a rule that cannot be broken does not constrain anything.',
        },
        {
          kind: 'number',
          id: 'business-plan-2',
          ask: 'Your plan risks 1% of a $15,000 account per trade. You buy a call at $2.40 with a stop at $1.60 on the option. How many contracts does the plan allow? Ignore fees.',
          answer: 1,
          check: 'math.floor(15000 * 0.01 / ((2.40 - 1.60) * 100))',
          why: 'The budget is $150. Each contract risks $0.80 × 100 = $80. 150 ÷ 80 = 1.875, and you round down to 1. Rounding up to 2 would risk $160, more than the plan allows.',
        },
        {
          kind: 'number',
          id: 'business-plan-3',
          ask: 'The plan caps open risk across all positions at 3% of a $15,000 account. What is the most you may have at risk at once, in dollars?',
          answer: 450,
          check: '15000 * 0.03',
          why: '3% of $15,000 is $450: three trades at the 1% budget. A fourth position has to wait until one of the others is closed or its stop moved to breakeven.',
        },
        {
          kind: 'number',
          id: 'business-plan-4',
          ask: 'The plan sets a daily loss limit of 2% of $15,000 and risks $100 per trade. How many full 1R losses is that?',
          answer: 3,
          check: '15000 * 0.02 / 100',
          why: '2% of $15,000 is $300, which is three losses of $100. Stating it as "three losses and I stop" is easier to obey than a percentage.',
        },
        {
          kind: 'output',
          id: 'business-plan-5',
          ask: 'A check of a trade against the plan. What does this print?',
          code: `plan = {'tickers': {'SPY', 'QQQ'}, 'max_risk': 150, 'first_trade': 945}
trade = {'ticker': 'TSLA', 'risk': 150, 'time': 935}
problems = []
if trade['ticker'] not in plan['tickers']:
    problems.append('ticker')
if trade['risk'] > plan['max_risk']:
    problems.append('risk')
if trade['time'] < plan['first_trade']:
    problems.append('time')
print(len(problems), problems)`,
          answer: "2 ['ticker', 'time']",
          why: 'TSLA is not on the list and 9:35 is before the first allowed trade at 9:45. The risk of $150 equals the maximum, which is allowed. A plan written as data can be checked by code before an order is sent.',
        },
        {
          kind: 'bug',
          id: 'business-plan-6',
          ask: 'The sizing function in a plan. It sometimes risks more than the budget.',
          code: `import math

def contracts(account, risk_pct, entry, stop):
    risk_per_contract = (entry - stop) * 100
    budget = account * risk_pct
    return math.ceil(budget / risk_per_contract)`,
          line: 6,
          fix: '    return math.floor(budget / risk_per_contract)',
          why: 'Rounding up turns 1.875 contracts into 2 and risks $160 against a $150 budget. Sizing always rounds down. If the result is 0, the trade is too big for the account and is skipped.',
        },
        {
          kind: 'choice',
          id: 'business-plan-7',
          ask: 'Mid-session you see a pattern that is not in your plan, and it looks excellent. What does the plan tell you to do?',
          options: [
            'Take it at small size, since it looks so good',
            'Do not trade it. Write it down, with a screenshot, to test after the session',
            'Take it at full size, since the plan is a guide, not a rule',
            'Add it to the plan now and take it',
          ],
          answer: 1,
          why: 'An untested pattern has no measured edge, and changing the plan during the session is the decision the plan exists to prevent. Writing it down keeps the idea; testing it on paper or in a backtest decides whether it earns a place.',
        },
        {
          kind: 'choice',
          id: 'business-plan-8',
          ask: 'A plan lists the tickers, two setups with full rules, and a sizing rule of 1% per trade. Which missing part is most dangerous?',
          options: ['A favourite chart colour', 'A daily loss limit and a maximum number of trades', 'The broker\'s phone number', 'A target for the month'],
          answer: 1,
          why: 'Without limits nothing stops a bad day becoming a disaster: 1% per trade is harmless for three trades and ruinous for thirty. A monthly target is worse than useless, because it pushes you to trade when there is nothing to trade.',
        },
        {
          kind: 'choice',
          id: 'business-plan-9',
          ask: 'When should you change the trading plan?',
          options: [
            'Whenever a trade loses',
            'Outside market hours, after a review, one change at a time, written down with the date and reason',
            'During the session, when the market changes character',
            'Never: a plan must stay the same for ever',
          ],
          answer: 1,
          why: 'A plan changed during the session is a plan written by your mood. A plan that never changes cannot learn. The middle way is a scheduled review and a written, single change that you can measure.',
        },
        {
          kind: 'design',
          id: 'business-plan-10',
          ask: 'Write a one-page trading plan for day trading SPY options with a $10,000 account. What sections does it have, and what goes in each?',
          checklist: [
            { point: 'Markets: SPY options only, which expiries, minimum volume or maximum bid-ask spread', why: 'Limits you to liquid contracts and stops you drifting into whatever is moving.' },
            { point: 'Setups: each with context, trigger, entry, stop, target and invalidation as testable rules', why: 'You can only follow, measure and test rules that are written precisely.' },
            { point: 'Sizing: risk per trade as a fraction (for example 0.5% to 1%) and the contracts formula, rounded down', why: 'Turns a feeling about size into arithmetic.' },
            { point: 'Limits: daily loss limit, maximum trades, maximum open risk, losses-in-a-row stop', why: 'The circuit breakers that keep a bad day small.' },
            { point: 'Routine: trading hours, preparation before, journal and review after', why: 'The plan is a process, not only a list of trades.' },
            { point: 'Exceptions: news days and conditions when you do not trade', why: 'Setups tested in normal conditions may not hold on a Fed day or a CPI morning.' },
            { point: 'If-then rules for rule breaks, bad fills and limit hits', why: 'Decides in advance what you do at the moments you will least want to decide.' },
            { point: 'How and when the plan is reviewed and changed', why: 'Keeps changes deliberate, dated and one at a time.' },
          ],
          why: 'A complete plan answers every question the session might ask before it is asked. If you find yourself deciding something during the session, that decision belongs in the plan.',
        },
      ],
    },
    {
      id: 'business-routine',
      title: 'The daily and weekly routine',
      summary: 'Preparation, the session and the review, and how to change one thing at a time so you can tell what helped.',
      text: [
        'A trading day has three parts, and the two that are not trading decide most of the result. **Before** the session: read the plan, check the calendar for scheduled news, mark the levels, write the watchlist and the setups you are looking for, and check yourself: sleep, mood, anything that will pull your attention away. **During**: take only plan trades, log each one as you take it, stop at the limits. **After**: finish the journal before you look at anything else.',
        'The **journal** entry for each trade: date and time, underlying, option (type, strike, expiry), entry and exit prices, contracts, fees, the result in dollars and in R, the setup tag, whether every rule was followed, a screenshot of the chart at entry, and one line on what you were thinking and feeling. Write the reason and the feeling at the time: memory edits both within hours.',
        'Once a week, review in a fixed order: rule adherence and the cost of the rule breaks; results by setup; results by time of day; the largest losses; trades you skipped. Then decide on at most one change.',
        '**Change one thing at a time.** If you change the stop and the entry time together and results improve, you cannot tell which helped, or whether one helped and the other hurt. Write the change down with the date and the reason, and judge it after an agreed number of trades, not after one good or bad day. Test changes to a setup on paper or in a backtest before you trade them.',
        'The routine makes trading a feedback loop: plan, act, record, review, adjust. Without the record there is nothing to review, and without the review the same mistakes repeat.',
      ],
      rules: [
        'Prepare before, follow the plan during, journal after. The journal is finished before anything else.',
        'Record the reason and the feeling at the time of the trade, not from memory later.',
        'Review weekly in a fixed order: adherence, setups, time of day, biggest losses.',
        'Change one thing at a time, write it down, and judge it after an agreed number of trades.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-routine-1',
          ask: 'Last month you moved your stop closer and stopped trading after 11:00. Results improved. What can you conclude about the closer stop?',
          options: [
            'It helped, since results improved',
            'Nothing on its own: the two changes are mixed together, and one may have helped while the other hurt',
            'It hurt, since tighter stops are hit more often',
            'Both changes helped equally',
          ],
          answer: 1,
          why: 'With two changes at once there is no way to separate their effects. The improvement could be all from avoiding the afternoon, with the closer stop making things slightly worse. One change at a time is the only way to learn which rules matter.',
        },
        {
          kind: 'number',
          id: 'business-routine-2',
          ask: 'You agree to judge a change after 30 trades that use it. Your setups give about 6 trades a week. How many weeks before you judge it?',
          answer: 5,
          check: '30 / 6',
          why: '30 ÷ 6 = 5 weeks. Writing the number down before you start stops you dropping a change after one bad day or keeping it after one good one. Even 30 trades is a small sample, so treat the verdict as provisional.',
        },
        {
          kind: 'number',
          id: 'business-routine-3',
          ask: 'This week three trades broke a rule. Their results were −1.5R, −2.0R and +0.5R. Your R is $100. What did the rule breaks cost you, in dollars? Give a negative number for a loss.',
          answer: -300,
          check: '(-1.5 - 2.0 + 0.5) * 100',
          why: 'Together they made −3.0R, which is −$300. Putting a dollar figure on the rule breaks every week is one of the strongest arguments for following the rules.',
        },
        {
          kind: 'choice',
          id: 'business-routine-4',
          ask: 'Which part of the journal must be written at the moment of the trade, not in the evening?',
          options: ['The fees', 'Why you took the trade and how you felt', 'The exit price', 'The setup statistics'],
          answer: 1,
          why: 'Prices and fees are on the broker statement and can be filled in later. The reason and the feeling are only true at the time; by evening, memory has fitted them to the result.',
        },
        {
          kind: 'output',
          id: 'business-routine-5',
          ask: 'Adding up a week of results by setup tag. What does this print?',
          code: `journal = [('orb', 1.2), ('vwap', -1.0), ('orb', -1.0),
           ('vwap', 1.5), ('orb', 0.8)]
totals = {}
for tag, r in journal:
    totals[tag] = totals.get(tag, 0) + r
print({k: round(v, 1) for k, v in totals.items()})`,
          answer: "{'orb': 1.0, 'vwap': 0.5}",
          why: 'orb: 1.2 − 1.0 + 0.8 = 1.0R. vwap: −1.0 + 1.5 = 0.5R. The rounding hides tiny floating-point errors in the sums. Totals by tag are the start of every weekly review.',
        },
        {
          kind: 'bug',
          id: 'business-routine-6',
          ask: 'This should find the setup with the lowest total R for the weekly review. It returns the best one.',
          code: `def worst_setup(totals):
    # totals: a dict of setup -> total R
    worst = None
    for setup, r in totals.items():
        if worst is None or r > totals[worst]:
            worst = setup
    return worst`,
          line: 5,
          fix: '        if worst is None or r < totals[worst]:',
          why: 'With `>` the loop keeps whichever setup is higher, so it returns the best. The worst setup is the one with the smallest total. Run a review function once on numbers you can check by eye.',
        },
        {
          kind: 'choice',
          id: 'business-routine-7',
          ask: 'You suspect you trade worse late in the day. Which part of the routine will show it?',
          options: [
            'The premarket checklist',
            'The weekly review of results by time of day, from the journal',
            'Watching the screen more closely after lunch',
            'Your feeling at the end of each day',
          ],
          answer: 1,
          why: 'A suspicion becomes a fact, or is dropped, when you split the journal by hour and compare the expectancy and the adherence in each part of the day. Feelings at the end of the day mostly reflect the last trade.',
        },
        {
          kind: 'choice',
          id: 'business-routine-8',
          ask: 'Your premarket check: you slept four hours and are distracted by a family problem. What should a routine do with that?',
          options: [
            'Nothing: the market does not care how you feel',
            'Apply a written rule, for example trade half size with a lower loss limit, or do not trade',
            'Trade more to take your mind off it',
            'Skip the journal today to save energy',
          ],
          answer: 1,
          why: 'Your state is part of the system, and a tired or distracted trader breaks rules more often. The decision about what to do on such days belongs in the plan, so it is made once rather than argued every morning.',
        },
        {
          kind: 'choice',
          id: 'business-routine-9',
          ask: 'Which of these is a single, testable change to make after a weekly review?',
          options: [
            'Be more disciplined',
            'From Monday, no new trades after 14:30 ET; review after 30 trades',
            'Use a better stop and a better target',
            'Trade the setups that work',
          ],
          answer: 1,
          why: 'It changes one thing, it is precise enough to check, and it says when it will be judged. The others are wishes, or several changes at once.',
        },
        {
          kind: 'design',
          id: 'business-routine-10',
          ask: 'Write the agenda for your weekly review. What is on it, in what order, and what comes out of it?',
          checklist: [
            { point: 'Rule adherence for the week, and the R and dollar cost of every rule break', why: 'Process first: it is the part you control and the most common leak.' },
            { point: 'Results by setup: count, win rate, average win, average loss, expectancy', why: 'Shows which setups carry the account and which only cost money.' },
            { point: 'Results by time of day and day of week', why: 'Finds patterns in when you trade well and when you do not.' },
            { point: 'The largest losses, each one examined: planned, or a rule break', why: 'Large losses are where the disposition effect and tilt show up.' },
            { point: 'Trades skipped that met the rules', why: 'Hesitation is a rule break too, and it biases the record.' },
            { point: 'The status of the change being tested: trades so far against the number agreed', why: 'Stops you judging a change too early.' },
            { point: 'At most one new change, written with the date, the reason and when it will be judged', why: 'One variable at a time is the only way to know what helped.' },
          ],
          why: 'A fixed agenda turns the review into a habit and stops it drifting into reliving the best and worst trades. Its output is a single, written decision.',
        },
      ],
    },
    {
      id: 'business-scaling',
      title: 'From paper to size',
      summary: 'Paper trading that tells the truth, going live with one contract, and written rules for scaling up slowly and down fast.',
      text: [
        '**Paper trading** means trading a simulated account at real prices with no money at stake. It tests whether you can follow your plan, use the platform and place orders without mistakes. It is the cheapest test there is, and it flatters you twice: simulated fills are often better than real ones (at the mid or the last price, with nobody on the other side), and with nothing at stake, fear and tilt are missing.',
        'Make paper as honest as you can. Assume you buy at the ask and sell at the bid, or add a fixed slippage per contract. Charge the real commissions and fees. Size as you would with real money, not with a paper million.',
        'Go live only on written criteria, for example: at least 50 paper trades of the setup, rule adherence of 90% or better, and positive expectancy after realistic costs. Then start at the smallest size: one contract, often a defined-risk spread rather than a single option. The first live weeks test you more than the setup.',
        'Write scaling rules in both directions. **Up slowly**: one more contract only after, say, another 50 trades at the current size with the rules followed and the account at a new high. **Down fast**: halve the size after a drawdown of 10% from the peak, and go back to paper if rules are broken repeatedly. Size follows the account and the record, never confidence or the wish to make back a loss.',
        'Account rules matter for small accounts. At the time of writing (2026), FINRA has replaced the pattern day trader rule and its $25,000 minimum with new intraday margin standards, in force from June 2026, with brokers allowed to phase them in until October 2027. What applies to your account depends on your broker and your country: check with them before you plan around it.',
      ],
      rules: [
        'Paper trading tests your execution and discipline, not your edge. It flatters fills and removes fear.',
        'Make paper honest: fill at the far side of the spread, charge real fees, use real size.',
        'Go live on written criteria, at one contract and with defined risk.',
        'Scale up slowly, on a record. Scale down fast, on a drawdown.',
        'Size follows the account and the record, never a feeling.',
      ],
      questions: [
        {
          kind: 'choice',
          id: 'business-scaling-1',
          ask: 'Your paper account made 40% in two months. Why is that weaker evidence than it looks?',
          options: [
            'Paper fills are often better than real ones, and with no money at stake the fear and tilt that change real decisions are missing',
            'Paper accounts use delayed prices that are always favourable',
            'Paper trading results are not reported to the tax authorities',
            'It is strong evidence: the prices were real',
          ],
          answer: 0,
          why: 'The prices may be real, but the fills and the feelings are not. Two months is also a short sample. Paper shows you can execute the plan; live trading at one contract shows whether you can do it with money at stake.',
        },
        {
          kind: 'number',
          id: 'business-scaling-2',
          ask: 'On paper you were filled at the mid. Live, you buy $0.05 above the mid and sell $0.05 below it. How much worse is a 3-contract round trip, in dollars?',
          answer: 30,
          check: '(0.05 + 0.05) * 100 * 3',
          why: '$0.10 per share across the round trip × 100 shares × 3 contracts = $30 a trade. For a short-term options trader this is often the whole gap between a paper record and a live one.',
        },
        {
          kind: 'number',
          id: 'business-scaling-3',
          ask: 'Your paper record shows an expectancy of $12 per contract per trade with fills at the mid. Real fills cost an extra $10 per contract per round trip. What expectancy per contract is left, in dollars?',
          answer: 2,
          check: '12 - 10',
          why: '$12 − $10 = $2. Most of the paper edge was the free fills. A thin edge like this can disappear with a slightly wider spread, which is why paper results are re-run with honest fills before going live.',
        },
        {
          kind: 'number',
          id: 'business-scaling-4',
          ask: 'Your account peaked at $12,500 and is now $11,250. What is the drawdown from the peak? Give a percentage, for example 25%.',
          answer: 0.1,
          check: '(12500 - 11250) / 12500',
          why: '$1,250 ÷ $12,500 = 10%. Measured from the peak, not from the starting balance. If your plan says halve the size at a 10% drawdown, this is the day it applies.',
        },
        {
          kind: 'choice',
          id: 'business-scaling-5',
          ask: 'Your plan says: halve the size at a 10% drawdown from the peak. You hit it today, and you feel sure the next week will be good. What do you do?',
          options: [
            'Halve the size from the next trade, as written',
            'Keep full size this week, because confidence is high',
            'Double the size to recover faster',
            'Halve it only if the next trade loses too',
          ],
          answer: 0,
          why: 'The rule was written for exactly this moment. Feeling sure after a drawdown is common and tells you nothing. Smaller size also keeps the next losses smaller while you find out whether something is wrong.',
        },
        {
          kind: 'output',
          id: 'business-scaling-6',
          ask: 'A scaling rule: one contract at the starting balance, and one more for every full $2,000 of profit. What does this print?',
          code: `def size(equity, start, step):
    return 1 + max(0, int((equity - start) // step))

print(size(10000, 10000, 2000), size(13900, 10000, 2000),
      size(8000, 10000, 2000))`,
          answer: '1 2 1',
          why: 'At the start: 1. With $3,900 of profit, only one full step of $2,000 has been made: 2 contracts. Below the start the `max(0, ...)` keeps the size at 1 instead of going to 0 or below. A real plan would also cut size on a drawdown, which this rule does not do.',
        },
        {
          kind: 'bug',
          id: 'business-scaling-7',
          ask: 'A size rule that should halve the size at a 10% drawdown from the peak, and otherwise leave it alone. Size grows fast whenever the account is not in a drawdown.',
          code: `def next_size(size, peak, equity):
    drawdown = (peak - equity) / peak
    if drawdown >= 0.10:
        return max(1, size // 2)
    return size * 2`,
          line: 5,
          fix: '    return size',
          why: 'Outside a drawdown the size should stay the same; scaling up is a separate, slower rule based on a record of trades. As written it doubles every time it is called, which is the opposite of scaling up slowly.',
        },
        {
          kind: 'choice',
          id: 'business-scaling-8',
          ask: 'Which set of criteria is a sound reason to move from paper to live trading?',
          options: [
            'Three winning days in a row on paper',
            'At least 50 paper trades of the setup, 90% or better rule adherence, and positive expectancy after realistic fills and fees',
            'Having read about the setup and feeling ready',
            'A paper account up 100%, whatever the number of trades',
          ],
          answer: 1,
          why: 'It needs enough trades to mean something, proof that you follow the rules, and an edge that survives honest costs. Even then you start at one contract, because live trading adds what paper cannot test.',
        },
        {
          kind: 'choice',
          id: 'business-scaling-9',
          ask: 'At the time of writing (2026), what has happened to the US pattern day trader rule and its $25,000 minimum, and what should you do about it?',
          options: [
            'Nothing has changed; the $25,000 minimum applies to every account',
            'FINRA has replaced it with intraday margin standards in force from June 2026, phased in by brokers until October 2027; check what your broker applies to your account',
            'It was replaced by a $100,000 minimum',
            'Day trading options is no longer allowed in margin accounts',
          ],
          answer: 1,
          why: 'FINRA Regulatory Notice 26-10 replaced the day trading margin rules, including the $25,000 minimum, with intraday margin requirements. Brokers can phase the change in, and may set their own stricter rules, so your broker is the authority for your account.',
        },
        {
          kind: 'design',
          id: 'business-scaling-10',
          ask: 'Write your rules for moving from paper to live trading and then changing size. What do they say?',
          checklist: [
            { point: 'How paper is made honest: fills at the far side of the spread, real fees, real size', why: 'Otherwise the paper record measures the simulator, not the setup.' },
            { point: 'The criteria to go live: number of trades, adherence, expectancy after costs', why: 'Written in advance, they cannot be bent by impatience.' },
            { point: 'Live starts at one contract or one defined-risk spread', why: 'The first live weeks test your behaviour with money at stake; keep them cheap.' },
            { point: 'The rule to add size: a number of trades at the current size, adherence and a new account high', why: 'Scaling up on a record, slowly, protects against scaling up on luck.' },
            { point: 'The rule to cut size: a drawdown from the peak, for example 10%, halves the size', why: 'Scaling down fast keeps a bad stretch from becoming a deep hole.' },
            { point: 'The rule to go back to paper: repeated rule breaks or a larger drawdown', why: 'Gives you a way to stop losing money while you find the problem.' },
          ],
          why: 'Scaling is where many traders who were fine at one contract come apart. Written rules in both directions make the size a consequence of the record rather than of mood.',
        },
      ],
    },
    {
      id: 'business-costs',
      title: 'The costs and the odds',
      summary: 'Trading costs, fixed costs, taxes in outline, record keeping, and what the large studies of day traders found.',
      widget: 'business-costs',
      text: [
        'Trading as a business has a profit and loss account like any other. **Per trade**: commissions, per-contract exchange and regulatory fees, the spread you cross and slippage. **Fixed**: market data, platform or software fees, charting tools, hardware, courses. **On profits**: tax. The gross edge has to pay for all of these before anything is left.',
        'Costs grow with activity. If the gross edge per trade is larger than the cost per trade, more trades earn more; if it is smaller, more trades lose more. Fixed costs are spread over the trades you take, so they weigh most on a small account that trades little.',
        'Tax depends entirely on where you live and on your circumstances. What follows is an outline of the US rules at the time of writing (2026), not advice; check with a tax professional. Gains on positions held one year or less are short-term and taxed as ordinary income. If losses exceed gains, up to $3,000 a year can be set against other income, and the rest is carried forward. The **wash sale** rule disallows a loss if you buy the same or a substantially identical security within 30 days before or after the sale; the loss is added to the cost of the new position rather than lost. Options on broad-based indexes such as SPX are **Section 1256 contracts**: gains count as 60% long-term and 40% short-term whatever the holding period, and positions open at the year end are marked to market. Options on SPY, an ETF, are not. Other countries treat trading in completely different ways.',
        'Keep records as a business would: every trade with its fees, the broker statements, and the yearly tax forms. The journal from the earlier lessons does most of this already.',
        'Be realistic about the odds. Studying Taiwan, where every trade is recorded, Barber, Lee, Liu and Odean found that fewer than 1% of day traders reliably earned positive returns after fees, and in a later paper that 97% of day traders were likely to lose money in future day trading. In Brazil, Chague, De-Losso and Giovannetti followed everyone who began day trading mini index futures from 2013 to 2015 and kept at it for more than 300 days: 97% lost money and only about 1% earned more than the minimum wage. To pay yourself $50,000 a year from a $25,000 account takes 200% a year, every year.',
      ],
      rules: [
        'Per-trade costs, fixed costs and tax all come out of the gross edge.',
        'If the edge per trade is below the cost per trade, trading more loses more.',
        'Tax differs by country and by circumstance. Outline only here; ask a professional.',
        'US, at the time of writing: short-term gains are ordinary income; wash sales defer losses; SPX options get 60/40 treatment and SPY options do not.',
        'Most day traders lose money. Keep your income elsewhere and size for survival.',
      ],
      questions: [
        {
          kind: 'number',
          id: 'business-costs-1',
          ask: 'You buy 2 contracts at the ask of $1.25 (the bid is $1.20) and later sell them at the bid when the quote has not moved. Commission is $0.65 per contract each way and other fees $0.05 per contract each way. What did the round trip cost in total, in dollars?',
          answer: 12.8,
          check: '(0.65 + 0.05) * 2 * 2 + (1.25 - 1.20) * 100 * 2',
          hint: 'Fees: $0.70 × 2 contracts × 2 sides. Spread: $0.05 × 100 shares × 2 contracts.',
          why: 'Fees are $2.80 and the spread is $10.00, so $12.80 is gone before the price has moved. On short-term option trades the spread is usually the largest cost, larger than the commission.',
        },
        {
          kind: 'number',
          id: 'business-costs-2',
          ask: 'Your fixed costs are $150 a month and you take 84 trades a month. Each round trip costs $6. What gross edge per trade, in dollars, do you need to break even? Two decimal places.',
          answer: 7.79,
          tol: 0.01,
          check: '6 + 150 / 84',
          why: 'The fixed cost is $150 ÷ 84 = $1.79 a trade, on top of the $6. Anything below $7.79 a trade on average loses money, however good the trades feel.',
        },
        {
          kind: 'number',
          id: 'business-costs-3',
          ask: 'Your setups make $10 per trade on average before costs, and costs are $6 per trade. What share of the gross edge do the costs take? Give a percentage, for example 25%.',
          answer: 0.6,
          check: '6 / 10',
          why: '$6 of every $10, which is 60%, leaving $4. A small change in the spread or in fills changes the net result a great deal, which is why costs are part of every test.',
        },
        {
          kind: 'choice',
          id: 'business-costs-4',
          ask: 'In the figure, set the gross edge per trade to $6, below the $8 cost. Move trades per day from 1 to 20. What happens?',
          options: [
            'The net for the year falls further with every extra trade a day',
            'The net rises, because more trades means more chances',
            'The net stays the same, because the edge is the same',
            'Only the fixed costs change',
          ],
          answer: 0,
          why: 'Each trade loses $2 on average after costs, so 20 trades a day lose twenty times as much as one. Trading more multiplies whatever the net edge is, including when it is negative.',
        },
        {
          kind: 'number',
          id: 'business-costs-5',
          ask: 'You want to pay yourself $40,000 a year from trading a $20,000 account. What yearly return would that need? Give a percentage, for example 25%.',
          answer: 2,
          check: '40000 / 20000',
          why: '$40,000 ÷ $20,000 = 200% a year, every year, without growing the account. Very few traders earn anything close to that for long. A small account is a place to learn the trade, not a salary.',
        },
        {
          kind: 'number',
          id: 'business-costs-6',
          ask: 'Under the US rules at the time of writing, a single filer has a net capital loss of $10,000 for the year. How much of it can be set against other income that year, in dollars? (An outline of the rules, not advice.)',
          answer: 3000,
          check: 'min(10000, 3000)',
          why: 'Up to $3,000 a year ($1,500 if married filing separately) can be set against other income, and the remaining $7,000 is carried forward to later years. Rules differ by country and change over time.',
        },
        {
          kind: 'number',
          id: 'business-costs-7',
          ask: 'A US trader makes a net gain of $10,000 on SPX options in a year. Under Section 1256, how much of it counts as long-term, in dollars? (An outline of the rules, not advice.)',
          answer: 6000,
          check: '10000 * 0.6',
          why: 'Section 1256 splits gains 60% long-term and 40% short-term whatever the holding period: $6,000 and $4,000. The same trading in SPY options would be all short-term. Whether that matters depends on the rest of your tax position.',
        },
        {
          kind: 'choice',
          id: 'business-costs-8',
          ask: 'You sell AAPL calls at a loss, and two days later buy AAPL calls with the same strike and expiry again. Under the US wash sale rule, what happens to the loss?',
          options: [
            'It is disallowed for now and added to the cost of the new position, so it is deferred rather than lost',
            'It is lost for ever',
            'It counts twice',
            'Nothing: the wash sale rule does not apply to options',
          ],
          answer: 0,
          why: 'Buying substantially identical securities within 30 days before or after a sale at a loss triggers the rule. The loss is added to the cost of the replacement, so it reduces a later gain. Someone who trades the same name every day can end the year with many losses deferred.',
        },
        {
          kind: 'choice',
          id: 'business-costs-9',
          ask: 'Chague, De-Losso and Giovannetti studied everyone in Brazil who started day trading mini index futures from 2013 to 2015 and kept going for more than 300 days. What did they find?',
          options: [
            '97% lost money, and only about 1% earned more than the minimum wage',
            'About half made money, as you would expect from a fair game',
            'Traders who persisted learned and became profitable',
            'Most lost money in the first year and made it back in the second',
          ],
          answer: 0,
          why: 'Persistence did not help: they found no sign that traders improved with experience. The study counted only those who kept at it, which answers the claim that losers are people who gave up too soon.',
        },
        {
          kind: 'choice',
          id: 'business-costs-10',
          ask: 'Barber, Lee, Liu and Odean studied every day trader in Taiwan from 1992 to 2006. What share could predictably and reliably earn positive returns after fees?',
          options: ['Fewer than 1%', 'About 10%', 'About a third', 'About half'],
          answer: 0,
          why: 'Fewer than 1% of the day trader population could reliably profit after fees. A small group of skilled traders does exist, which is why the honest summary is "very few", not "none".',
        },
        {
          kind: 'design',
          id: 'business-costs-11',
          ask: 'Write the yearly budget for your trading as a business. What lines does it have, and what does it tell you?',
          checklist: [
            { point: 'Per-trade costs: commissions, per-contract fees, the spread and slippage, times the expected number of trades', why: 'Usually the largest cost for an active options trader.' },
            { point: 'Fixed costs: data, platform, software, hardware, courses', why: 'They are paid whether or not you trade well.' },
            { point: 'The break-even gross edge per trade', why: 'The one number that says whether the setups can pay for the business.' },
            { point: 'Tax in outline for your country, checked with a professional', why: 'Tax changes the net result and the record keeping you need.' },
            { point: 'Record keeping: journal, broker statements, tax forms, kept for years', why: 'Needed for the tax return and for your own review.' },
            { point: 'A realistic return compared with what you could earn elsewhere, and money you can afford to lose', why: 'The studies say most day traders lose; your living should not depend on the account.' },
          ],
          why: 'A budget makes the gross edge face every cost it has to cover. If the break-even edge is larger than anything your tested setups make, the business does not work at that size or that activity.',
        },
      ],
    },
    {
      id: 'business-lab',
      title: 'Lab: a journal analyser',
      summary: 'From a list of trades to expectancy by setup and time of day, the cost of rule breaks, tilt, the longest losing streak and the drawdown.',
      text: [
        'A journal is only useful if you read it, and reading it by eye favours the trades you remember. This lab builds a small analyser in plain Python that turns a list of trades into the numbers a weekly review needs.',
        'Each trade is a dict: `{\'setup\': \'orb\', \'hour\': 10, \'r\': 1.5, \'followed\': True}`. `r` is the result in R, the amount planned to be risked, so trades of different sizes can be compared. `followed` says whether every rule in the plan was kept.',
        'You will write the expectancy, a grouping by any key (setup or hour), the cost of rule breaks, a check for tilt (do trades taken after a loss do worse?), the longest losing streak and the deepest drawdown in R, and then put them together into one report. The last step is the decision the report is for.',
        'The data in the tests is made up and small enough to check by hand. With your own journal, remember the lesson on process: a split by setup or by hour with ten trades in each part is a hint to watch, not a verdict.',
      ],
      rules: [
        'Measure in R so that trades of different sizes can be added and compared.',
        'Expectancy by setup and by time of day shows where the account is made and lost.',
        'Put a number on the rule breaks: their total R and their count.',
        'Compare trades taken after a loss with the rest: it is how tilt shows in data.',
        'Know your longest losing streak and deepest drawdown in R before they surprise you.',
        'A report ends in one decision, not a list of feelings.',
      ],
      questions: [
        {
          kind: 'write',
          id: 'business-lab-1',
          ask: 'Step 1: expectancy. Return the average R of a list of results. An empty list has an expectancy of 0.0.',
          starter: `def expectancy(rs):
    # rs: a list of results in R, for example [1.5, -1.0, 2.0]
    pass`,
          solution: `def expectancy(rs):
    if not rs:
        return 0.0
    return sum(rs) / len(rs)`,
          tests: `out = expectancy([1.5, -1.0, 2.0, -1.0])
assert out is not None, "the function returns nothing yet"
assert abs(out - 0.375) < 1e-9, f"(1.5 - 1 + 2 - 1) / 4 = 0.375, got {out}"
assert expectancy([]) == 0.0, "an empty list should give 0.0, not an error"
assert abs(expectancy([-1.0, -1.0, 3.0]) - 1 / 3) < 1e-9, "two 1R losses and a 3R win average +0.333R"`,
          why: 'The average result per trade in R is the expectancy: it already contains the win rate and the sizes of wins and losses. Guarding the empty list matters because a group in the next step can be empty.',
        },
        {
          kind: 'write',
          id: 'business-lab-2',
          ask: 'Step 2: grouping. Return a dict from each value of `key` (for example each setup, or each hour) to a tuple `(count, expectancy)`, with the expectancy rounded to 2 decimal places.',
          starter: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def group_expectancy(trades, key):
    # trades: a list of dicts with keys 'setup', 'hour', 'r', 'followed'
    # returns {value: (count, expectancy rounded to 2 places)}
    pass`,
          solution: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def group_expectancy(trades, key):
    groups = {}
    for t in trades:
        groups.setdefault(t[key], []).append(t['r'])
    return {k: (len(rs), round(expectancy(rs), 2)) for k, rs in groups.items()}`,
          tests: `trades = [
    {'setup': 'orb', 'hour': 9, 'r': 1.5, 'followed': True},
    {'setup': 'vwap', 'hour': 11, 'r': -1.0, 'followed': True},
    {'setup': 'orb', 'hour': 10, 'r': -1.0, 'followed': True},
    {'setup': 'orb', 'hour': 9, 'r': 2.0, 'followed': False},
    {'setup': 'vwap', 'hour': 14, 'r': 0.5, 'followed': True},
]
out = group_expectancy(trades, 'setup')
assert out is not None, "the function returns nothing yet"
assert set(out) == {'orb', 'vwap'}, f"one entry per setup, got {set(out)}"
assert out['orb'] == (3, 0.83), f"orb: 3 trades, (1.5 - 1 + 2) / 3 = 0.83, got {out['orb']}"
assert out['vwap'] == (2, -0.25), f"vwap: 2 trades, (-1 + 0.5) / 2 = -0.25, got {out['vwap']}"
by_hour = group_expectancy(trades, 'hour')
assert by_hour[9] == (2, 1.75), f"hour 9: 2 trades averaging 1.75, got {by_hour.get(9)}"
assert len(by_hour) == 4, "four different hours appear in the data"`,
          hint: '`groups.setdefault(value, [])` returns the list for that value, creating it the first time.',
          why: 'One function serves every split: by setup, by hour, by weekday, by anything you record. Keeping the count beside the expectancy is the reminder that a group of three trades says very little.',
        },
        {
          kind: 'output',
          id: 'business-lab-3',
          ask: 'Step 3: hours into parts of the day. The review groups trades into the open, midday and the close. What does this print?',
          code: `def session(hour):
    if hour < 11:
        return 'open'
    if hour < 14:
        return 'midday'
    return 'close'

trades = [(9, 1.5), (10, -1.0), (12, -1.0), (13, -1.0), (15, 2.0), (9, 1.0)]
totals = {}
for hour, r in trades:
    totals[session(hour)] = totals.get(session(hour), 0) + r
print(totals)`,
          answer: "{'open': 1.5, 'midday': -2.0, 'close': 2.0}",
          why: 'Hours 9 and 10 are the open: 1.5 − 1 + 1 = 1.5R. 12 and 13 are midday: −2R. 15 is the close: +2R. A dict keeps the order in which keys were first added. With six trades this is a question to watch, not a rule to adopt.',
        },
        {
          kind: 'write',
          id: 'business-lab-4',
          ask: 'Step 4: rule breaks. Return a tuple `(number of broken trades, total R of broken trades, total R of followed trades)`, the totals rounded to 2 decimal places.',
          starter: `def rule_breaks(trades):
    # trades: a list of dicts with keys 'setup', 'hour', 'r', 'followed'
    pass`,
          solution: `def rule_breaks(trades):
    broken = [t['r'] for t in trades if not t['followed']]
    kept = [t['r'] for t in trades if t['followed']]
    return len(broken), round(sum(broken), 2), round(sum(kept), 2)`,
          tests: `trades = [
    {'setup': 'orb', 'hour': 9, 'r': 1.5, 'followed': True},
    {'setup': 'vwap', 'hour': 11, 'r': -2.5, 'followed': False},
    {'setup': 'orb', 'hour': 10, 'r': -1.0, 'followed': True},
    {'setup': 'none', 'hour': 13, 'r': 0.5, 'followed': False},
    {'setup': 'vwap', 'hour': 14, 'r': 2.0, 'followed': True},
]
out = rule_breaks(trades)
assert out is not None, "the function returns nothing yet"
assert len(out) == 3, "return three things: the count, the R of broken trades, the R of followed trades"
assert out[0] == 2, f"two trades broke a rule, got {out[0]}"
assert out[1] == -2.0, f"the broken trades made -2.5 + 0.5 = -2.0R, got {out[1]}"
assert out[2] == 2.5, f"the followed trades made 1.5 - 1 + 2 = 2.5R, got {out[2]}"
assert rule_breaks(trades[:1]) == (0, 0, 1.5), "with no broken trades the count and their total are 0"`,
          why: 'Here the plan trades made +2.5R and the rule breaks gave back 2R of it. Put in dollars every week, that number is the clearest argument for following the plan.',
        },
        {
          kind: 'write',
          id: 'business-lab-5',
          ask: 'Step 5: the longest losing streak. Return the largest number of losing trades (r below 0) in a row.',
          starter: `def longest_losing_streak(rs):
    # rs: results in R in the order the trades were taken
    pass`,
          solution: `def longest_losing_streak(rs):
    longest = current = 0
    for r in rs:
        current = current + 1 if r < 0 else 0
        longest = max(longest, current)
    return longest`,
          tests: `out = longest_losing_streak([1.0, -1.0, -1.0, 2.0, -1.0, -1.0, -1.0, 0.5])
assert out is not None, "the function returns nothing yet"
assert out == 3, f"the longest run of losses is three, got {out}"
assert longest_losing_streak([]) == 0, "no trades, no streak"
assert longest_losing_streak([1.0, 2.0]) == 0, "no losses gives 0"
assert longest_losing_streak([-1.0, -1.0, -1.0, -1.0]) == 4, "a streak that runs to the end of the list still counts"
assert longest_losing_streak([-1.0, 0.0, -1.0]) == 1, "a flat trade (0R) is not a loss, and it ends the streak"`,
          why: 'Keep a running count that resets on any trade that is not a loss, and remember the largest. Compare it with what the risk module says to expect: a streak longer than your plan allows for is a reason to check your sizing, not to change setups.',
        },
        {
          kind: 'write',
          id: 'business-lab-6',
          ask: 'Step 6: a tilt check. Return a tuple `(expectancy of trades taken right after a loss, expectancy of all other trades)`. The first trade has no trade before it and counts as "other". An empty group has expectancy 0.0.',
          starter: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def tilt_check(rs):
    # rs: results in R in the order the trades were taken
    pass`,
          solution: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def tilt_check(rs):
    after_loss, other = [], []
    for i, r in enumerate(rs):
        if i > 0 and rs[i - 1] < 0:
            after_loss.append(r)
        else:
            other.append(r)
    return expectancy(after_loss), expectancy(other)`,
          tests: `out = tilt_check([1.5, -1.0, -1.0, -1.0, 2.0, -1.0, -2.0, 1.5, 1.5])
assert out is not None, "the function returns nothing yet"
assert len(out) == 2, "return two numbers: after a loss, and the rest"
after, other = out
assert abs(after - (-0.1)) < 1e-9, f"the trades right after a loss are -1, -1, 2, -2 and 1.5, averaging -0.1, got {after}"
assert abs(other - 0.25) < 1e-9, f"the other trades are 1.5, -1, -1 and 1.5, averaging 0.25, got {other}"
assert tilt_check([1.0, 2.0]) == (0.0, 1.5), "with no losses, the after-a-loss group is empty and gives 0.0"
assert tilt_check([-1.0]) == (0.0, -1.0), "the first trade has nothing before it, so it counts as other"`,
          hint: 'Loop with `enumerate` and look at `rs[i - 1]`, but only when `i > 0`.',
          why: 'Here the trades taken straight after a loss average −0.1R and the rest +0.25R. On a real journal with enough trades, a gap like that is tilt showing in the data, and the answer is a rule such as a break after every loss.',
        },
        {
          kind: 'bug',
          id: 'business-lab-7',
          ask: 'Step 7: the deepest drawdown in R, the largest fall of the running total from its previous peak, as a negative number. It always returns 0.',
          code: `def max_drawdown_r(rs):
    equity, peak, worst = 0.0, 0.0, 0.0
    for r in rs:
        equity += r
        peak = max(peak, equity)
        worst = max(worst, equity - peak)
    return worst`,
          line: 6,
          fix: '        worst = min(worst, equity - peak)',
          why: '`equity - peak` is zero at a new high and negative below it, so `max` with a starting 0 always keeps 0. The deepest drawdown is the most negative value, which needs `min`.',
        },
        {
          kind: 'write',
          id: 'business-lab-8',
          ask: "Step 8: the report. Using the helpers in the starter, return a dict with the keys `'trades'` (the count), `'expectancy'` (rounded to 2 places), `'by_setup'` (from `group_expectancy`), `'broken'` (from `rule_breaks`), `'streak'` (the longest losing streak) and `'drawdown'` (the deepest drawdown in R, rounded to 2 places).",
          starter: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def group_expectancy(trades, key):
    groups = {}
    for t in trades:
        groups.setdefault(t[key], []).append(t['r'])
    return {k: (len(rs), round(expectancy(rs), 2)) for k, rs in groups.items()}

def rule_breaks(trades):
    broken = [t['r'] for t in trades if not t['followed']]
    kept = [t['r'] for t in trades if t['followed']]
    return len(broken), round(sum(broken), 2), round(sum(kept), 2)

def longest_losing_streak(rs):
    longest = current = 0
    for r in rs:
        current = current + 1 if r < 0 else 0
        longest = max(longest, current)
    return longest

def max_drawdown_r(rs):
    equity, peak, worst = 0.0, 0.0, 0.0
    for r in rs:
        equity += r
        peak = max(peak, equity)
        worst = min(worst, equity - peak)
    return worst

def report(trades):
    pass`,
          solution: `def expectancy(rs):
    return sum(rs) / len(rs) if rs else 0.0

def group_expectancy(trades, key):
    groups = {}
    for t in trades:
        groups.setdefault(t[key], []).append(t['r'])
    return {k: (len(rs), round(expectancy(rs), 2)) for k, rs in groups.items()}

def rule_breaks(trades):
    broken = [t['r'] for t in trades if not t['followed']]
    kept = [t['r'] for t in trades if t['followed']]
    return len(broken), round(sum(broken), 2), round(sum(kept), 2)

def longest_losing_streak(rs):
    longest = current = 0
    for r in rs:
        current = current + 1 if r < 0 else 0
        longest = max(longest, current)
    return longest

def max_drawdown_r(rs):
    equity, peak, worst = 0.0, 0.0, 0.0
    for r in rs:
        equity += r
        peak = max(peak, equity)
        worst = min(worst, equity - peak)
    return worst

def report(trades):
    rs = [t['r'] for t in trades]
    return {
        'trades': len(trades),
        'expectancy': round(expectancy(rs), 2),
        'by_setup': group_expectancy(trades, 'setup'),
        'broken': rule_breaks(trades),
        'streak': longest_losing_streak(rs),
        'drawdown': round(max_drawdown_r(rs), 2),
    }`,
          tests: `trades = [
    {'setup': 'orb', 'hour': 9, 'r': 2.0, 'followed': True},
    {'setup': 'vwap', 'hour': 11, 'r': -1.0, 'followed': True},
    {'setup': 'orb', 'hour': 10, 'r': -1.0, 'followed': True},
    {'setup': 'none', 'hour': 13, 'r': -2.5, 'followed': False},
    {'setup': 'vwap', 'hour': 14, 'r': 1.5, 'followed': True},
    {'setup': 'orb', 'hour': 9, 'r': 2.0, 'followed': True},
]
out = report(trades)
assert out is not None, "the function returns nothing yet"
assert set(out) == {'trades', 'expectancy', 'by_setup', 'broken', 'streak', 'drawdown'}, f"the keys should be trades, expectancy, by_setup, broken, streak and drawdown, got {sorted(out)}"
assert out['trades'] == 6, "six trades"
assert out['expectancy'] == 0.17, f"the results add to 1.0R over 6 trades: 0.17, got {out['expectancy']}"
assert out['by_setup']['orb'] == (3, 1.0), f"orb: 3 trades averaging 1.0R, got {out['by_setup'].get('orb')}"
assert out['broken'] == (1, -2.5, 3.5), f"one rule break costing 2.5R, and 3.5R from the rest, got {out['broken']}"
assert out['streak'] == 3, f"trades 2, 3 and 4 lost in a row, got {out['streak']}"
assert out['drawdown'] == -4.5, f"from +2R the total fell to -2.5R: a drawdown of -4.5R, got {out['drawdown']}"`,
          why: 'The report is the weekly review in one call. In the test, the plan trades made +3.5R and a single rule break, an unplanned trade at the end of a losing streak, gave back 2.5R and made the deepest drawdown deeper.',
        },
        {
          kind: 'design',
          id: 'business-lab-9',
          ask: 'Step 9: your report for the last 60 trades says: orb (35 trades) +0.30R, vwap (25 trades) −0.05R; 8 rule breaks costing −9R in total; trades after a loss average −0.40R and the rest +0.35R; longest losing streak 6. What do you decide, and what do you not decide?',
          checklist: [
            { point: 'The largest leak is the rule breaks: −9R, more than the vwap setup lost', why: 'Fixing behaviour comes before changing setups, and the cost is now a number.' },
            { point: 'The tilt check points at trades after losses; a rule such as a break or a stop after each loss is the candidate change', why: 'It addresses the biggest measured gap and is a single, testable change.' },
            { point: 'Make one change only, written down with the date and when it will be judged', why: 'Two changes at once cannot be told apart in the next review.' },
            { point: 'Do not drop vwap on 25 trades at −0.05R: the sample is small and the result is close to zero', why: 'Short samples are noise; mark it to watch, or to retest on paper.' },
            { point: 'Check the streak of 6 against the risk plan: is the daily limit and size sized for streaks this long?', why: 'Losing streaks are certain; the plan must survive them.' },
            { point: 'Recompute the numbers with rule breaks removed to see what the plan itself earns', why: 'Separates the edge of the setups from the cost of your behaviour.' },
          ],
          why: 'The report does not tell you what to feel; it tells you where the money went. Here most of it went on behaviour, not on a weak setup, and the decision follows from that: one change, aimed at the rule breaks and the trades after a loss.',
        },
      ],
    },
  ],
}
