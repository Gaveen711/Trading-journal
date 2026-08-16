// Study library — Foundations
// Original educational content written for xaujournal. Sources listed per
// article were used to select topics and verify facts, not as source text.

export const articles = [
  {
    slug: "what-spot-gold-trading-is",
    title: "What spot gold trading is and how a XAUUSD quote works",
    category: "Foundations",
    level: "Beginner",
    readMinutes: 5,
    updated: "2026-08-16",
    summary:
      "Spot gold on a forex platform, explained from zero: what XAUUSD means, how to read the bid and ask, and what actually moves the price.",
    takeaways: [
      "XAU is the code for one troy ounce of gold, so XAUUSD is simply gold priced in US dollars.",
      "Retail platforms trade spot gold on margin — no bars, no delivery, just the price.",
      "You buy at the ask and sell at the bid; the gap between them is the spread, and you pay it on every trade.",
      "Gold trades almost 23 hours a day on weekdays, but liquidity is concentrated in the London and New York sessions.",
    ],
    sections: [
      {
        heading: "Gold is quoted like a currency pair",
        paragraphs: [
          "Forex trading is the exchange of one currency for another: you buy euros with dollars, or yen with pounds, and profit when the exchange rate moves your way. Every pair has a base (the thing you are buying) and a quote currency (the thing you pay with). EURUSD at 1.0850 means one euro costs 1.0850 dollars.",
          "XAUUSD follows the same grammar. XAU is the ISO-style code for one troy ounce of gold, and USD is the currency it is priced in. A quote of 2410.50 means one ounce of gold costs 2,410 dollars and 50 cents. When you go long XAUUSD you are, in effect, holding gold and short dollars; when you go short you are betting the ounce gets cheaper in dollar terms.",
          "This is why gold lives on forex platforms at all. To the trading engine it is just another pair — the same tickets, the same order types, the same margin mechanics you would use on EURUSD.",
        ],
      },
      {
        heading: "Spot, futures and physical are different products",
        paragraphs: [
          "Physical gold is bars and coins: you own metal, you pay for storage and insurance, and selling it takes effort. Futures are exchange-traded contracts (COMEX is the big venue) with fixed sizes and expiry dates — institutional tools with institutional capital requirements.",
          "What you trade on an MT4 or MT5 account is spot gold as a margin product, usually structured as a CFD. There is no delivery and no expiry. The price tracks the underlying spot market tick for tick, and your profit or loss is settled in your account currency the moment you close. Positions held overnight are charged or credited a small swap fee — worth knowing before you hold a trade through several days.",
        ],
      },
      {
        heading: "Reading the quote",
        paragraphs: [
          "Your platform always shows two prices. The bid is what buyers will pay you right now; the ask is what sellers will charge you. If XAUUSD shows 2410.50 / 2410.85, you buy at 2410.85 and sell at 2410.50. The 35-cent gap is the spread — the broker's cut and your first cost on every position.",
          "Notice what that implies: the instant your buy order fills, your position is marked at the bid and shows a small loss. The market has to move 35 cents in your favor just to reach break-even. On quiet London mornings the gold spread might be 15 to 30 cents; around major news it can widen to several dollars for a few seconds.",
        ],
      },
      {
        heading: "What actually moves gold",
        paragraphs: [
          "Gold pays no interest, so its dollar price is driven mostly by the dollar itself and by real yields. A stronger dollar makes each ounce more expensive for everyone else, which tends to push the price down. Rising real interest rates raise the opportunity cost of holding metal and tend to weigh on it too.",
          "The other engine is risk sentiment. Wars, banking scares and inflation surprises push money toward gold as a store of value; calm, risk-hungry markets pull it back out. Central bank buying sits underneath all of this as a slow structural bid. Day to day, the events that matter most are US data releases — CPI, non-farm payrolls, FOMC decisions — because they move both the dollar and rate expectations at once.",
        ],
      },
      {
        heading: "The trading day",
        paragraphs: [
          "Spot gold trades nearly 23 hours a day from Monday to Friday, with a short daily pause around the New York close. Open does not mean active: the Asian session usually drifts in a narrow range, London brings the first real volume, and the London–New York overlap is where the biggest moves and tightest spreads live.",
          "The same breakout setup can behave completely differently at 3am and at 3pm. Session is one of the highest-value fields you can record about a gold trade, and it is exactly the kind of detail memory throws away — one reason traders who log their trades in a journal like xaujournal tag every entry with its session from day one.",
        ],
      },
      {
        heading: "Leverage in one honest paragraph",
        paragraphs: [
          "Margin trading means you post a fraction of the position's value as collateral and the broker extends the rest. That lets a modest account control a meaningful amount of gold, but leverage changes nothing about the market — it only multiplies your exposure to it, in both directions. A $2 move against a position is the same $2 whether you can afford it or not.",
          "Treat leverage as a cash-efficiency tool, not a way to trade bigger. Decide position size from the amount you are willing to lose, which is the subject of the next article.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: What Is Forex?",
        url: "https://www.babypips.com/learn/forex/what-is-forex",
      },
      {
        label: "Investopedia — XAU: gold as a currency",
        url: "https://www.investopedia.com/terms/x/xau.asp",
      },
      {
        label: "TradingView — XAUUSD symbol overview",
        url: "https://www.tradingview.com/symbols/XAUUSD/",
      },
    ],
  },
  {
    slug: "pips-points-lots-gold-position-size",
    title: "Pips, points and lots: sizing a gold position",
    category: "Foundations",
    level: "Beginner",
    readMinutes: 5,
    updated: "2026-08-16",
    summary:
      "How gold moves are measured, what a lot really is on XAUUSD (100 oz, $1 move = $100), and a worked position-size calculation you can reuse.",
    takeaways: [
      "On gold, forget pip debates — measure moves in dollars and cents.",
      "1.00 lot of XAUUSD is 100 troy ounces, so a $1 price move is $100 of profit or loss.",
      "0.10 lot turns a $1 move into $10; 0.01 lot turns it into $1.",
      "Position size = money at risk ÷ (stop distance in dollars × 100). Size comes last, after the stop.",
    ],
    sections: [
      {
        heading: "Why 'pip' is a slippery word on gold",
        paragraphs: [
          "In forex, a pip is a fixed convention: the fourth decimal place on most pairs, the second on yen pairs. It works because every broker quotes those pairs the same way. Gold breaks the convention. XAUUSD is quoted in dollars and cents — 2410.52 — and brokers disagree about what to call a pip there. Some treat $0.10 as one pip, others $0.01, and calculators inherit whichever choice their author made.",
          "The fix is to stop using the word. Gold is priced in a currency you already understand, so measure moves in dollars and cents: gold moved $8 today, my stop is $5 away. Every number that matters — risk, stop distance, targets — becomes unambiguous the moment you do this.",
        ],
      },
      {
        heading: "Points, the unit your platform actually uses",
        paragraphs: [
          "A point (or tick) is the smallest increment your platform quotes, and on almost every MT4 or MT5 gold feed that is $0.01. So $0.10 is 10 points, and a $1 move is 100 points. When a broker's contract specification or an EA setting speaks in points, this is the conversion to keep in your head.",
          "You will still meet 'pips' in chat rooms and signal groups. When someone says gold dropped 50 pips, they almost always mean $5.00 — but check, because the ambiguity is exactly how beginners misplace a stop by a factor of ten.",
        ],
      },
      {
        heading: "Lots and the 100-ounce contract",
        paragraphs: [
          "A lot is a standardized trade size. On nearly all MT4/MT5 brokers, 1.00 lot of XAUUSD is 100 troy ounces of gold. From that single number, everything else follows: if 100 ounces each gain $1, the position gains $100. So a $1 move is worth $100 per 1.00 lot, $10 per 0.10 lot, and $1 per 0.01 lot.",
          "The per-point version of the same fact: one point ($0.01) is worth $1.00 on a full lot, because $0.01 × 100 oz = $1. Most brokers let you trade in steps of 0.01 lots, which means you can scale exposure from one ounce upward. A few quote different contract sizes, so confirm yours once in the platform's contract specification window — right-click the symbol in MT5 and choose Specification.",
        ],
      },
      {
        heading: "A worked example, start to finish",
        paragraphs: [
          "Say your account is $5,000 and you risk 1% per trade — $50. You want to buy gold at 2410 with a stop-loss at 2405, a $5 stop distance. Each 1.00 lot loses $100 per dollar moved, so a full lot would lose $500 at your stop: ten times your budget.",
          "The size that fits is: risk ÷ (stop distance × $100) = 50 ÷ (5 × 100) = 0.10 lot. Now check it forward: 0.10 lot loses $10 per $1 move, times a $5 stop = $50. Exactly your risk. If the same trade had a $2 stop, the formula gives 0.25 lot; a $10 stop gives 0.05 lot. Size breathes with the stop — risk stays constant.",
        ],
      },
      {
        heading: "The order of operations",
        paragraphs: [
          "Beginners tend to pick a lot size first — often whatever they traded last time — and then find room for a stop. That inverts the logic. The stop belongs where the trade idea is wrong: below the swing low, beyond the range boundary. Only once you know that distance can you compute the size that makes the loss affordable.",
          "This is also why doubling size to win back a loss is so corrosive: it changes the one variable that was supposed to be constant. A stable risk per trade is what makes 40 trades comparable to each other instead of 40 unrelated bets.",
        ],
      },
      {
        heading: "Write the numbers down",
        paragraphs: [
          "Sizing discipline is invisible in your account balance until it fails. The only way to see drift — creeping lot sizes, stops placed to fit a desired size rather than the chart — is to record planned risk and actual size on every trade and compare them later. If your journal auto-syncs fills from MT4/MT5 the way xaujournal does, the actual side of that comparison fills itself in, and the gap between plan and execution becomes visible in one glance.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: What Is a Pip in Forex?",
        url: "https://www.babypips.com/learn/forex/pips-and-pipettes",
      },
      {
        label: "BabyPips — School of Pipsology: What Is a Lot in Forex?",
        url: "https://www.babypips.com/learn/forex/lots-leverage-and-profit-and-loss",
      },
      {
        label: "Equiti — How to calculate lot size in gold trading",
        url: "https://www.equiti.com/sc-en/news/trading-ideas/how-to-calculate-lot-size-in-gold-trading/",
      },
    ],
  },
  {
    slug: "order-types-and-execution",
    title: "Order types and execution: market, limit, stop and the exits",
    category: "Foundations",
    level: "Beginner",
    readMinutes: 5,
    updated: "2026-08-16",
    summary:
      "Every order your gold platform offers — market, limit, stop, stop-loss, take-profit — plus what spread and slippage do to your fills.",
    takeaways: [
      "A market order buys now at the ask; pending orders wait for your price.",
      "Limit orders demand a better price than now; stop orders trigger at a worse one to catch momentum.",
      "A stop-loss is a pre-decided exit, not an insult — attach one to every gold trade before you click buy.",
      "Slippage is the gap between the price you asked for and the price you got; on gold it clusters around US news.",
    ],
    sections: [
      {
        heading: "Every order answers two questions",
        paragraphs: [
          "An order tells your broker what to do and when to do it. The what is direction and size: buy or sell, how many lots. The when splits all orders into two families — execute immediately at whatever the market offers (a market order), or wait until price reaches a level I choose (a pending order).",
          "Master those two families plus the two attached exits, and you know every control on an MT4/MT5 ticket. Nothing else on the order screen is essential.",
        ],
      },
      {
        heading: "Market orders: now, at the market's price",
        paragraphs: [
          "A market order fills immediately at the best available price — the ask if you are buying, the bid if you are selling. Its virtue is certainty of entry: you wanted in, you are in. Its cost is certainty of price: in a fast market the fill can differ from the quote you clicked.",
          "On gold this matters more than on major currency pairs, because gold can travel a dollar in the time an order reaches the server. Market orders are the right tool when being in the trade matters more than the last few cents of entry price.",
        ],
      },
      {
        heading: "Limit orders: your price or nothing",
        paragraphs: [
          "A limit order names a price better than the current one. A buy limit sits below the market — you want gold cheaper. A sell limit sits above it — you want to short from higher. If gold trades at 2410 and you place a buy limit at 2402, you are betting on a dip you would be happy to buy.",
          "The trade-off is the mirror image of the market order: you get price certainty but no guarantee of entry. Gold can run $30 without ever touching 2402, and you watch from flat. Traders who buy pullbacks to a level accept that missing some trades is the price of never chasing.",
        ],
      },
      {
        heading: "Stop orders: joining a move already underway",
        paragraphs: [
          "A stop order names a price worse than the current one and triggers when the market reaches it. A buy stop sits above price; a sell stop sits below. With gold at 2410 and resistance at 2415, a buy stop at 2415.50 means: only put me in if the market proves it can break through.",
          "When a stop order triggers, it becomes a market order — so in a violent breakout your fill can be beyond the trigger price. That is expected behavior, not a broker error, and it is the standard cost of trading momentum.",
        ],
      },
      {
        heading: "Stop-loss and take-profit: exits decided in advance",
        paragraphs: [
          "A stop-loss (SL) closes your position automatically at a defined loss; a take-profit (TP) closes it at a defined gain. Both are attached to the position and work while you sleep — which matters on an instrument that trades through the night.",
          "A worked example: you buy 0.50 lot at 2400 with SL 2392 and TP 2416. The stop is $8 away, so the risked amount is 8 × $100 × 0.50 = $400. The target is $16 away, worth $800. That is a 1:2 risk-to-reward trade, and every part of it was decided before entry. Setting the stop at the moment you open the trade — not after it goes wrong — is the single habit that most separates surviving beginners from blown accounts.",
        ],
      },
      {
        heading: "Spread and slippage: the friction layer",
        paragraphs: [
          "Two costs sit between your plan and your fills. The spread is the visible one: buy at the ask, sell at the bid, pay the difference on every round trip. Slippage is the invisible one: the gap between the price you requested and the price the server actually filled. It can be negative or occasionally positive, and it grows when liquidity thins.",
          "On gold, slippage clusters around US data — CPI, non-farm payrolls, FOMC. The quote can jump a dollar or more between ticks, spreads widen tenfold for a few seconds, and both market orders and triggered stops fill wherever liquidity reappears. If you hold positions into scheduled news, size them as if your stop will fill worse than placed, because sometimes it will.",
        ],
      },
      {
        heading: "Compare intention with execution",
        paragraphs: [
          "Execution quality is measurable, but only if you keep the data. Note the price you intended and compare it with the fill your platform reports; the difference, tracked across trades and sessions, tells you when your broker and your tactics are actually costing you money. A journal that syncs real fills from MT4/MT5 makes this comparison automatic — you write down the plan, the sync brings the reality.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: Types of Forex Orders",
        url: "https://www.babypips.com/learn/forex/types-of-orders",
      },
      {
        label: "Investopedia — Stop-loss orders",
        url: "https://www.investopedia.com/terms/s/stop-lossorder.asp",
      },
      {
        label: "Investopedia — Slippage",
        url: "https://www.investopedia.com/terms/s/slippage.asp",
      },
    ],
  },
  {
    slug: "why-keep-a-trading-journal",
    title: "Why traders keep a journal and what to record on every trade",
    category: "Foundations",
    level: "Beginner",
    readMinutes: 5,
    updated: "2026-08-16",
    summary:
      "Memory keeps the wrong trades. A journal keeps them all — here is what to record on each gold trade and how to review it so the data pays you back.",
    takeaways: [
      "Your memory keeps the dramatic trades and discards the average ones — a journal keeps the whole sample.",
      "Record the numbers (entry, exit, size, planned risk) and the reasoning (setup, session, state of mind).",
      "Review weekly in groups, not trade by trade; expectancy per setup is the number to watch.",
      "Reduce friction: if the numbers log themselves, the journal survives.",
      "On gold, session tags are gold — the same setup behaves differently in Asia, London and New York.",
      ],
    sections: [
      {
        heading: "Memory is a bad database",
        paragraphs: [
          "Ask a trader without a journal how last month went and you get a story: the great short after CPI, the stop-hunt that felt personal. What you never get is the middle — the eleven forgettable trades that quietly decided the month's result. Human memory stores what was vivid, not what was frequent, and trading results are made of the frequent.",
          "A journal replaces the story with a record. Not because the story is dishonest, but because it is incomplete in a biased way: it systematically forgets the boring evidence and keeps the dramatic exceptions. Every improvement you will ever make as a trader starts from knowing what you actually did.",
        ],
      },
      {
        heading: "What a journal is actually for",
        paragraphs: [
          "The purpose is not record-keeping for its own sake; it is pattern detection. Thirty logged trades can reveal that your London-session breakouts win 58% of the time while your late New York entries lose money, that your losing days start with an early loss followed by an oversized revenge trade, or that your lot sizes have drifted up 40% without a decision ever being made.",
          "None of these patterns is visible from inside a single trade. They only exist in aggregate, which is why traders who journal talk about their sample the way other people talk about their gut.",
        ],
      },
      {
        heading: "The fields that matter on every trade",
        paragraphs: [
          "Start with the objective core, which your platform already knows: date and time, instrument, direction, lot size, entry price, stop-loss and take-profit, exit price and time, and the resulting profit or loss. Add planned risk in money and in R — if you risked $50 and made $120, that is +2.4R — so trades of different sizes stay comparable.",
          "Then add the context only you can supply: the session (Asia, London, New York), the setup name from your playbook, one or two sentences on why you entered, and a chart screenshot taken at entry. Last, the human layer: how you felt (calm, rushed, tilted) and whether you broke any of your own rules. The uncomfortable fields are reliably the profitable ones to fill in.",
        ],
      },
      {
        heading: "Reviewing: where the payback happens",
        paragraphs: [
          "Logging without reviewing is filing, not journaling. Set a fixed weekly slot and read trades in groups — by setup, by session, by day of week — rather than reliving them one at a time. Single trades are noise; groups are signal.",
          "The number to compute per group is expectancy: (win rate × average win) − (loss rate × average loss). Say 40 logged trades show 45% winners averaging $180 and 55% losers averaging $90: expectancy is 0.45 × 180 − 0.55 × 90 = $31.50 per trade. Positive — and now you can ask better questions, like whether that edge lives in one setup or is spread across all of them. Cut what the data says is bleeding; do more of what it says is working.",
        ],
      },
      {
        heading: "Why gold traders need this more than most",
        paragraphs: [
          "XAUUSD changes personality by session: thin and drifty in Asia, trending out of London, violent around US news. A setup can be genuinely profitable at 9am London and genuinely toxic at 8pm — and without session-tagged records, both truths average into a shrug. Gold's volatility also punishes sizing drift faster than a quiet pair would, so the journal's early-warning role matters more here.",
        ],
      },
      {
        heading: "Make it cheap enough to survive",
        paragraphs: [
          "Most journals die within a month, and the cause is friction: after a losing day, nobody wants to type twelve numbers into a spreadsheet. So design for your future, tired self. Automate what can be automated and spend your typing only on what a machine cannot know — the reason, the setup, the state of mind. This is the problem xaujournal is built around: the MT4/MT5 sync writes the numbers, you write the thinking.",
          "However you keep it — spreadsheet, notebook, app — the rule is the same: log every trade, or the sample lies. A journal with holes in it is a story with better formatting.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: Why You Need a Trading Journal",
        url: "https://www.babypips.com/learn/forex/why-keep-a-trade-journal",
      },
      {
        label: "BabyPips — School of Pipsology: 5 Reasons to Keep a Trading Journal",
        url: "https://www.babypips.com/learn/forex/benefits-of-keeping-a-journal",
      },
      {
        label: "Investopedia — Ten steps to building a winning trading plan",
        url: "https://www.investopedia.com/articles/trading/04/042104.asp",
      },
    ],
  },
];
