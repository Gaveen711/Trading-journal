// Study library — Risk & Psychology
// Original educational content for beginner XAUUSD traders.

export const articles = [
  {
    slug: 'risk-per-trade-position-sizing-gold',
    title: 'Risk per trade and position sizing: the 1-2% rule on gold',
    category: 'Risk & Psychology',
    level: 'Beginner',
    readMinutes: 4,
    updated: '2026-08-16',
    summary:
      'How to size a gold position from your stop: the 1-2% rule, what a $1 move pays per lot, and a worked $5,000-account example with a $4 stop.',
    takeaways: [
      'Risk per trade is the dollars you lose if your stop fills, not your lot size or margin',
      'Cap that loss at 1-2% of account equity on every trade',
      'On XAUUSD, a $1.00 price move on a 1.00 lot position is $100',
      'Set the stop from the chart first, then solve for lot size — never the reverse',
      'Round lot size down, so actual risk lands under your cap',
    ],
    sections: [
      {
        heading: 'What risk per trade actually means',
        paragraphs: [
          'Risk per trade is one number: the dollars that leave your account if price hits your stop loss. It is not your lot size, not the margin the broker locks up, and not the notional value of the gold you control. Two traders can hold the same 0.10 lots of XAUUSD and carry completely different risk, because one has a stop $3 away and the other has a stop $15 away.',
          'That distinction matters because beginners tend to pick a lot size that feels comfortable and then bolt a stop onto it. The professional order is reversed: the chart decides where the stop goes, and the stop decides how big the position can be.',
        ],
      },
      {
        heading: 'The 1-2% rule',
        paragraphs: [
          'The standard guideline is to risk no more than 1-2% of account equity on any single trade, and most experienced traders sit at the conservative end of that range. On a $5,000 account, 1% is $50 and 2% is $100. That is the most a filled stop should ever cost you.',
          'The rule exists because losses compound against you. Lose 10% and you need about 11% to get back to even; lose 50% and you need 100%. Ten straight losses at 1% each leaves roughly 90% of your account intact and your head clear. Ten straight losses at 10% each leaves about 35% and, usually, a trader who has stopped following any plan at all.',
          'Losing streaks are not a sign of a broken strategy — they are guaranteed to happen at any realistic win rate. Sizing at 1-2% is what makes them survivable.',
        ],
      },
      {
        heading: 'Know your gold numbers',
        paragraphs: [
          'On most MT4 and MT5 brokers, one standard lot of XAUUSD is 100 ounces. That means a $1.00 move in the gold price is worth $100 per 1.00 lot, $10 per 0.10 lot, and $1 per 0.01 lot. These three numbers cover almost every sizing calculation you will ever do.',
          'Ticks are just the smallest increment your feed quotes. Many gold feeds tick in $0.10 steps, so a stop 40 ticks away is a stop $4.00 away. Always convert the stop distance to dollars of price movement before sizing — dollars are what your account is denominated in, ticks are not.',
        ],
      },
      {
        heading: 'Worked example: $5,000 account, $4 stop',
        paragraphs: [
          'Say gold trades at 4,000 and your setup puts the stop at 3,996 — a $4.00 stop distance, or 40 ticks on a 10-cent feed. At 1% risk on a $5,000 account, your budget for this trade is $50.',
          'One full lot losing $4.00 of price costs $400, which is eight times your budget. Divide budget by per-lot risk: $50 ÷ $400 = 0.125 lots. Most brokers step lots in 0.01 increments, so round down to 0.12 lots. If the stop fills, you lose 0.12 × $400 = $48, or 0.96% of the account. Under budget, as intended.',
          'At 2% risk the same arithmetic gives $100 ÷ $400 = 0.25 lots and a $100 loss at the stop. Notice what did not change: the stop stayed at 3,996 in both cases. Only the size moved.',
        ],
      },
      {
        heading: 'The formula, every time',
        paragraphs: [
          'Lot size = (equity × risk %) ÷ (stop distance in dollars × 100). The 100 is the ounces in a standard lot. Run it before every entry — it takes ten seconds and it is the cheapest insurance in trading.',
          'Two rules keep the formula honest. First, always round down, never up. Second, never widen a stop to justify a size you already wanted; if the correct size comes out below your broker minimum of 0.01 lots, the trade is too big for the account and the answer is to skip it.',
        ],
      },
      {
        heading: 'Close the loop in your journal',
        paragraphs: [
          'Planned risk and actual risk drift apart quietly — a skipped calculation here, a manually closed trade there. The fix is to record both: what you intended to risk and what the trade actually cost. When your journal pulls fills straight from MT4 or MT5, that comparison is sitting in your history whether you remembered to write it down or not.',
          'Review it weekly. If your worst loss keeps exceeding your stated risk cap, you do not have a strategy problem — you have a sizing problem, and it is the easier one to fix.',
        ],
      },
    ],
    sources: [
      {
        label: 'BabyPips — School of Pipsology: What is position sizing?',
        url: 'https://www.babypips.com/learn/forex/what-is-position-sizing',
      },
      {
        label: 'BabyPips — School of Pipsology: Calculating your position size',
        url: 'https://www.babypips.com/learn/forex/calculating-your-position-sizes',
      },
      {
        label: 'Investopedia — The 1% rule',
        url: 'https://www.investopedia.com/terms/o/one-percent-rule.asp',
      },
    ],
  },
  {
    slug: 'risk-reward-win-rate-expectancy',
    title: 'Risk-reward, win rate and expectancy: why 40% can be enough',
    category: 'Risk & Psychology',
    level: 'Intermediate',
    readMinutes: 4,
    updated: '2026-08-16',
    summary:
      'Win rate alone cannot tell you if you are profitable. How risk-reward and expectancy combine, with the math that makes a 40% win rate pay.',
    takeaways: [
      'Win rate by itself says nothing about profitability',
      'Measure every trade in R: multiples of the amount you risked at entry',
      'Break-even win rate = risk ÷ (risk + reward) — at 1:2 it is just 33.3%',
      'Expectancy = (win rate × avg win) − (loss rate × avg loss), in R per trade',
      'You need 30-50 logged trades before your own numbers mean anything',
    ],
    sections: [
      {
        heading: 'Two numbers, one verdict',
        paragraphs: [
          'Ask a beginner how their trading is going and they quote a win rate. Ask a professional and they quote an expectancy. The difference is that win rate is half a statistic: a trader who wins 80% of the time can steadily lose money, and a trader who wins 40% of the time can steadily make it.',
          'What settles the question is how much the average win pays relative to how much the average loss costs. That relationship is the risk-reward ratio, and combined with win rate it produces the only number that matters: expectancy, the average result per trade.',
        ],
      },
      {
        heading: 'Thinking in R',
        paragraphs: [
          'R is the amount you risk at entry — the distance from entry to stop, in dollars, at your chosen size. If you risk $50 and the trade wins $100, that is a +2R trade. If the stop fills, it is −1R. Measuring everything in R lets you compare trades taken at different sizes and different prices on equal terms.',
          'A concrete gold example: you buy XAUUSD at 4,000 with a stop at 3,996 and a target at 4,008. You are risking $4 of price to make $8 — a 1:2 risk-reward ratio. At 0.12 lots that is $48 at risk against a $96 target. Every trade you plan can be written this compactly before you take it.',
        ],
      },
      {
        heading: 'The break-even win rate',
        paragraphs: [
          'Every risk-reward ratio implies a minimum win rate just to tread water: break-even win rate = risk ÷ (risk + reward). At 1:1 you must win 50% of the time. At 1:2 you only need 33.3%. At 1:3, 25% is enough.',
          'This is why the ratio you accept at entry matters more than being right. A trader taking clean 1:2 setups has a 6.7-point cushion between a 40% win rate and break-even. A trader taking 1:1 trades at the same win rate is bleeding on every round trip. Same accuracy, opposite outcomes.',
        ],
      },
      {
        heading: 'Expectancy, worked through',
        paragraphs: [
          'Expectancy = (win rate × average win) − (loss rate × average loss). Take a system that wins 40% of the time, with average winners of +2R and average losers of −1R: (0.40 × 2) − (0.60 × 1) = 0.80 − 0.60 = +0.2R per trade.',
          'Put dollars on it. With a $5,000 account risking 1%, R is $50, so +0.2R is $10 of edge per trade on average. Over 100 trades that is 40 wins collecting $4,000, 60 losses costing $3,000, and $1,000 net — from a system that is wrong more often than it is right.',
        ],
      },
      {
        heading: 'How high win rates lose money',
        paragraphs: [
          'The inverse trap is common on gold because the market trends hard: a trader takes profit at +$1 the moment a position turns green, but lets losers run "until it comes back". The result is a 90% win rate of +0.2R scraps punctuated by the occasional −8R disaster, and the expectancy math comes out negative: (0.90 × 0.2) − (0.10 × 8) = −0.62R per trade.',
          'A high win rate built on cutting winners short and stretching losers is not an edge — it is a schedule of small deposits before one large withdrawal. Expectancy exposes it; win rate hides it.',
        ],
      },
      {
        heading: 'Measure yours instead of guessing',
        paragraphs: [
          'None of this math helps until it runs on your actual trades. Backtests and gut feel both flatter; fills do not. As a rule of thumb, you need 30-50 logged trades of one strategy before win rate and average R stabilize enough to act on.',
          'This is the strongest practical argument for journaling every trade, including the embarrassing ones. A journal that syncs your MT4/MT5 history can compute win rate, average win, average loss and expectancy from real fills — and the honest version of those numbers is the one worth improving.',
        ],
      },
    ],
    sources: [
      {
        label: 'BabyPips — Why expectancy matters more than your win ratio',
        url: 'https://www.babypips.com/trading/psychology-why-expectancy-matters-more-than-win-ratio-2026-06-01',
      },
      {
        label: 'BabyPips — Finding a reward-to-risk ratio that works for you',
        url: 'https://www.babypips.com/trading/find-a-risk-ratio-that-works-for-you',
      },
      {
        label: 'Investopedia — Risk/reward ratio',
        url: 'https://www.investopedia.com/terms/r/riskrewardratio.asp',
      },
    ],
  },
  {
    slug: 'trading-psychology-revenge-overtrading-fomo',
    title: 'Trading psychology: revenge trades, overtrading and FOMO',
    category: 'Risk & Psychology',
    level: 'Beginner',
    readMinutes: 5,
    updated: '2026-08-16',
    summary:
      'Revenge trading, overtrading and FOMO follow the same loop. What each looks like on a gold chart, and how a weekly journal review breaks the cycle.',
    takeaways: [
      'Most beginner blowups follow one loop: loss, frustration, impulsive trade, bigger loss',
      'Revenge trading shows up as re-entries within minutes and sudden size jumps',
      'Overtrading pays the spread twenty times a day for a handful of real setups',
      'If you missed the move, the plan is the next setup — not this candle',
      'A journal turns invisible emotional patterns into visible, fixable data',
    ],
    sections: [
      {
        heading: 'The loop that empties accounts',
        paragraphs: [
          'Very few beginner accounts die from one bad strategy. They die from one bad sequence: a normal loss triggers frustration, frustration triggers an unplanned trade, and the unplanned trade is bigger, faster and worse than the one before it. Three laps of that loop can undo a month of discipline.',
          'Revenge trading, overtrading and FOMO are the three most common entrances to the loop. They feel different in the moment, but they share a signature: the trade happens because of how you feel, not because your setup appeared. Gold, with its speed and its habit of running $20 in an afternoon, is an unusually effective trigger for all three.',
        ],
      },
      {
        heading: 'Revenge trading',
        paragraphs: [
          'Revenge trading is trying to force the market to give back a loss — usually the same market, within minutes, at larger size. The internal logic is "gold owes me $80", but the market keeps no accounts and owes nothing. What the revenge trade actually does is replace a planned setup with an emotional coin flip at double stakes.',
          'The telltale signs are mechanical and easy to spot afterwards: a re-entry less than fifteen minutes after a stop-out, in the same direction or spitefully reversed, at a size you did not calculate. If your stop was correctly placed and it filled, that trade was finished. The loss was the cost of doing business, already budgeted by your 1% sizing.',
        ],
      },
      {
        heading: 'Overtrading',
        paragraphs: [
          'Overtrading is taking trades because you are at the desk, not because there is a setup. It is the quietest of the three problems because each individual trade looks harmless. The damage is cumulative: on gold, crossing the spread might cost a few dozen cents of price per round trip, and twenty boredom trades pay that toll twenty times while adding no edge.',
          'A blunt fix works well for beginners: a fixed cap of two or three trades per day, decided before the session. When the cap forces you to choose, you discover most of what you would have taken was filler. Your best month will almost never be your busiest month.',
        ],
      },
      {
        heading: 'FOMO',
        paragraphs: [
          'FOMO — fear of missing out — is entering late because a move is running without you. Gold produces this feeling constantly: a $30 rally is on the screen, everyone on the timeline is posting profits, and waiting feels like losing. So you buy the high of an extended move, with no stop level that makes sense, and become the liquidity for traders who entered at the start.',
          'The repair is a single sentence worth internalizing: a missed trade costs nothing. There is no red number in your account for the rally you watched. If the setup is gone, the plan is the next setup, and on an instrument as active as gold the next one is rarely far away.',
        ],
      },
      {
        heading: 'Rules that hold when you are tilted',
        paragraphs: [
          'Willpower is at its weakest right after a loss, so the rules have to be written while you are calm. Three cover most situations: a daily loss limit of 2% or two consecutive stop-outs, whichever comes first; position size fixed by formula before the session, never adjusted mid-session; and a mandatory walk-away — screens off, timer set — once the daily limit is hit.',
          'The point of these rules is not that they are sophisticated. It is that they are decided in advance by the calm version of you, so the tilted version has nothing left to decide.',
        ],
      },
      {
        heading: 'How the journal breaks the loop',
        paragraphs: [
          'Emotional trading hides in the moment but leaves fingerprints in the data. Time between a stop-out and your next entry collapsing from hours to minutes. Lot size stepping up right after red days. A cluster of losing trades late in the session, long after your plan said to stop. You will not notice any of this live — you will see it instantly in a week of logged trades.',
          'This only works if every trade makes it into the log, and impulsive trades are precisely the ones nobody writes down voluntarily. That is why auto-syncing your journal from MT4/MT5 matters: xaujournal records the revenge trade too, with its timestamp and its size, sitting in Friday\'s review where you cannot argue with it.',
          'Then the review closes the loop. Tag the trades that broke your rules, total what they cost, and compare that number to your actual strategy\'s results. For most beginners the discovery is uncomfortable and freeing in equal measure: the system was fine — the loop was the leak.',
        ],
      },
    ],
    sources: [
      {
        label: 'BabyPips — How can you recover from revenge trading?',
        url: 'https://www.babypips.com/trading/psychology-how-recover-revenge-trading-2025-04-30',
      },
      {
        label: 'BabyPips — One simple trick to avoid overtrading',
        url: 'https://www.babypips.com/trading/psychology-one-simple-trick-to-avoid-overtrading-2026-06-12',
      },
      {
        label: 'Investopedia — Trading psychology',
        url: 'https://www.investopedia.com/terms/t/trading-psychology.asp',
      },
    ],
  },
];
