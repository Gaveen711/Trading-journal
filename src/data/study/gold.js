// Study library — Gold & Sessions
// Original educational articles for beginner XAUUSD traders.
// Facts verified against BabyPips, the Chicago Fed, the World Gold Council and CME Group (see per-article sources).

export const articles = [
  {
    slug: "what-moves-the-gold-price",
    title: "What moves the gold price",
    category: "Gold & Sessions",
    level: "Beginner",
    readMinutes: 4,
    updated: "2026-08-16",
    summary:
      "Real yields, the dollar, Fed policy, risk sentiment and central bank buying drive gold. What each does to XAUUSD and how to read the driver of the day.",
    takeaways: [
      "Gold has no yield, so its price tracks the cost of holding it — real yields are the anchor.",
      "A stronger dollar usually pressures XAUUSD; watch DXY for context, not signals.",
      "CPI and nonfarm payrolls at 8:30 am New York time are the biggest scheduled movers.",
      "Central banks bought 1,000+ tonnes a year in 2022-2024, a persistent bid under the market.",
      "One lot of XAUUSD is 100 oz: a $1 move is $100 — size positions for the driver in play.",
    ],
    sections: [
      {
        heading: "Gold pays you nothing, and that is the point",
        paragraphs: [
          "An ounce of gold produces no coupon, no dividend and no rent. That sounds like a flaw, but it is the key to reading the price. Because gold has no cash flow of its own, its price is driven almost entirely by how attractive the alternatives look — and the main alternative is holding dollars in interest-bearing form.",
          "When safe assets like US Treasuries pay well after inflation, parking money in gold has a real cost and the price tends to struggle. When they pay little or nothing after inflation, that cost disappears and gold finds buyers. Every driver in this article is a variation on that trade-off.",
        ],
      },
      {
        heading: "Real yields: the anchor relationship",
        paragraphs: [
          "A real yield is a bond yield with expected inflation taken out. The market's standard proxy is the yield on 10-year Treasury inflation-protected securities (TIPS), published daily and free to look up. If the 10-year nominal yield is 4.2% and expected inflation is 2.4%, the real yield is roughly 1.8%.",
          "Gold has historically moved inversely with that number: rising real yields raise the cost of holding a zero-yield metal, falling real yields lower it. The link loosened after 2022 — heavy official-sector buying kept gold bid even while real yields climbed — but the 10-year real yield is still the first chart to check when gold makes a sharp move you cannot explain.",
        ],
      },
      {
        heading: "The dollar: the denominator effect",
        paragraphs: [
          "XAUUSD is a price quoted in dollars, so the dollar sits in the denominator of every tick. When the dollar strengthens against other major currencies — the dollar index, DXY, is the common gauge — gold becomes more expensive for buyers holding euros, yen or rupees, and demand tends to soften. A weaker dollar works the other way.",
          "The inverse link is a tendency, not a law. On days when the dollar and gold rise together, something else — usually a safe-haven scramble — is doing the driving. Treat DXY as context for your gold chart, not as a signal on its own.",
        ],
      },
      {
        heading: "Fed policy and the data that reprices it",
        paragraphs: [
          "The Federal Reserve sets short-term dollar interest rates and meets eight times a year. Rate expectations feed directly into both real yields and the dollar, which is why gold often moves more on a shift in expectations than on the rate decision itself.",
          "Between meetings, those expectations are repriced by data. The big two for gold are the monthly CPI inflation report and the nonfarm payrolls report, both released at 8:30 am New York time. A hotter-than-expected CPI print can push yields and the dollar up and knock gold $10-20 lower within minutes.",
          "The arithmetic matters at position size. One standard lot of XAUUSD is 100 troy ounces, so a $1.00 move in the gold price is $100 of profit or loss. Long 1.00 lot into a CPI release that drops gold $15, you are down $1,500 before you have finished reading the headline.",
        ],
      },
      {
        heading: "Risk sentiment cuts both ways",
        paragraphs: [
          "Gold's reputation as a safe haven is earned: wars, sanctions and banking scares reliably bring buyers. But the reflex has one important exception. In a genuine liquidity crunch, funds sell whatever they can to raise cash — and gold is one of the most liquid assets they own.",
          "March 2020 is the textbook case: gold fell roughly $250 an ounce in under two weeks while equities crashed, then resumed its rally once the cash squeeze passed. The lesson is that risk-off supports gold, but a margin call does not.",
        ],
      },
      {
        heading: "Central banks: the slow, heavy bid",
        paragraphs: [
          "The least glamorous driver has lately been the most powerful. World Gold Council data shows central banks bought more than 1,000 tonnes of gold in each of 2022, 2023 and 2024 — the 1,082 tonnes added in 2022 was the largest annual total since 1950 — against an average of roughly 470 tonnes a year across 2010-2021.",
          "Most of this buying comes from emerging-market central banks diversifying reserves away from the dollar. It is not price-sensitive and it never shows up as a spike on an intraday chart. It matters because it puts a persistent bid under the market — and it helps explain why gold spent long stretches rising even while real yields did too.",
        ],
      },
      {
        heading: "Track the driver, not just the trade",
        paragraphs: [
          "On any given day, one of these drivers is in charge, and knowing which one changes how you should trade. A real-yield-driven trend grinds; a headline-driven spike retraces. Position sizing that suits one will punish you in the other.",
          "A simple habit makes this concrete: when you enter a gold trade, write down the driver you think is in play. If you keep your trades in a journal like xaujournal, tag each one — CPI day, dollar move, risk-off — and after fifty trades you will know which environments you actually make money in.",
        ],
      },
    ],
    sources: [
      {
        label: "Federal Reserve Bank of Chicago — Chicago Fed Letter: What Drives Gold Prices?",
        url: "https://www.chicagofed.org/publications/chicago-fed-letter/2021/464",
      },
      {
        label: "World Gold Council — Goldhub: Central bank gold reserves research",
        url: "https://www.gold.org/goldhub/research/central-banks",
      },
      {
        label: "Kitco News — Central banks buy more than 1,000 tonnes of gold in 2024 (World Gold Council)",
        url: "https://www.kitco.com/news/article/2025-02-05/central-banks-buy-more-1000-tonnes-gold-2024-third-year-row-world-gold",
      },
    ],
  },
  {
    slug: "gold-trading-sessions-explained",
    title: "The trading day for gold: sessions, overlaps and the hours that matter",
    category: "Gold & Sessions",
    level: "Beginner",
    readMinutes: 4,
    updated: "2026-08-16",
    summary:
      "Gold trades almost 24 hours, but volume clusters in London and New York. Session times in UTC, the overlap, and when XAUUSD actually moves.",
    takeaways: [
      "The market is always open, but liquidity is not — gold volatility follows a daily schedule.",
      "Sessions in UTC (northern summer): Sydney ~21:00-06:00, Tokyo 00:00-09:00, London 07:00-16:00, New York 12:00-21:00.",
      "The London-New York overlap, roughly 12:00-16:00 UTC in summer, carries the day's biggest volume and ranges.",
      "US data releases at 8:30 am New York time are the sharpest scheduled volatility of the gold day.",
      "Avoid the 5 pm New York rollover: Globex pauses, spreads widen and swap is charged.",
    ],
    sections: [
      {
        heading: "A market that never quite sleeps",
        paragraphs: [
          "Spot gold trades continuously from Sunday evening to Friday evening, New York time. Underneath your broker's XAUUSD feed sit two big pools of liquidity: over-the-counter spot dealing centred on London, and COMEX gold futures on CME Globex, which trade almost 23 hours a day with a one-hour pause at 5 pm New York time.",
          "The market being open is not the same as the market being liquid. XAUUSD is tradeable at 3 am, but not equally tradeable at 3 am — and the difference decides your spread, your slippage and how far price can realistically run while you hold.",
        ],
      },
      {
        heading: "The four sessions in UTC",
        paragraphs: [
          "Traders carve the 24-hour day into four named sessions. In UTC, using northern-summer times: Sydney runs roughly 21:00-06:00, Tokyo 00:00-09:00, London 07:00-16:00 and New York 12:00-21:00. Daylight saving shifts London and New York an hour later in winter, so always sanity-check against your platform clock.",
          "The names describe which regional desks are at work, not separate markets. Price is one continuous stream all day; what changes from session to session is who is trading, in what size, and why.",
        ],
      },
      {
        heading: "Asia: quiet screens, busy vaults",
        paragraphs: [
          "During Sydney and Tokyo hours, XAUUSD paper volume is at its thinnest. Spreads run wider, moves are smaller, and a $5 range can take all night. Breakouts born in Asia have a habit of fading when London arrives and real size enters the market.",
          "That does not make Asia irrelevant — China and India are the two largest physical gold consumers, and Asian demand shapes the larger trend. It simply means that demand rarely appears as intraday movement you can trade off a spot chart at 2 am.",
        ],
      },
      {
        heading: "London: where bullion lives",
        paragraphs: [
          "London is the centre of the global bullion market, and the tone of the gold day is usually set at the London open around 07:00-08:00 UTC. Volume steps up, spreads tighten, and the first tradeable trends of the day tend to form in the London morning.",
          "Twice a day the LBMA gold price benchmark is set by auction, at 10:30 am and 3:00 pm London time. These are the prints that refiners, miners and jewellers settle business against, and short bursts of volume often cluster around them.",
        ],
      },
      {
        heading: "New York: data, futures and the overlap",
        paragraphs: [
          "New York adds COMEX futures volume and the US economic calendar. The releases that move gold hardest — CPI and nonfarm payrolls — land at 8:30 am New York time (12:30 UTC in summer, 13:30 in winter) and can move XAUUSD $20 or more inside a few minutes.",
          "From roughly 12:00 to 16:00 UTC in summer, an hour later in winter, London and New York desks are working the same market. This overlap is the most liquid stretch of the gold day: the tightest spreads, the widest ranges and most of the moves worth trading. If you can only watch the screen for a few hours, these are the hours.",
        ],
      },
      {
        heading: "The dead zone and the daily break",
        paragraphs: [
          "Once London goes home around 16:00-17:00 UTC, liquidity thins even though New York remains open. The late US afternoon is where trends stall and charts drift sideways on low volume.",
          "Then comes the daily rollover at 5 pm New York time: Globex pauses for an hour, swap (overnight financing) is charged on open positions, and XAUUSD spreads can briefly widen several-fold. A spread that costs $30 on a 1.00-lot round trip at midday can cost well over $100 around the break. Do not enter or exit there unless you have no choice.",
        ],
      },
      {
        heading: "Let your own data pick your session",
        paragraphs: [
          "None of this obliges you to trade the overlap. Some traders do their best work fading the quiet Asian range; plenty of others blow up chasing New York data spikes. The point is that gold volatility runs on a schedule, not on mystery — and your own results by session are measurable.",
          "If your journal records fill times — xaujournal stamps every MT4/MT5 trade automatically on sync — group a month of results by session. Most gold traders discover their edge lives inside a two-to-four-hour window. Trade that window, and let the rest of the clock pass without you.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: Forex Trading Sessions",
        url: "https://www.babypips.com/learn/forex/forex-trading-sessions",
      },
      {
        label: "BabyPips — School of Pipsology: When Can You Trade Forex: Tokyo Session",
        url: "https://www.babypips.com/learn/forex/can-trade-forex-tokyo-session",
      },
      {
        label: "CME Group — Gold futures (GC) contract specs and trading hours",
        url: "https://www.cmegroup.com/markets/metals/precious/gold.html",
      },
    ],
  },
  {
    slug: "reading-gold-candlestick-charts",
    title: "Reading a candlestick chart on gold",
    category: "Gold & Sessions",
    level: "Beginner",
    readMinutes: 4,
    updated: "2026-08-16",
    summary:
      "How to read OHLC candles on a gold chart, pick a timeframe, and mark support and resistance zones — without drowning the chart in indicators.",
    takeaways: [
      "Every candle is four prices — open, high, low, close. Patterns are just relationships between them.",
      "Bodies show conviction, wicks show rejection; both matter most when they print at a level.",
      "Use one anchor timeframe for direction and one execution timeframe for entries — ignore the rest.",
      "Draw support and resistance as zones, and respect gold's 00 and 50 round numbers.",
      "An hourly gold candle can span $15+; at $100 per $1 per lot, size stops to structure, not hope.",
    ],
    sections: [
      {
        heading: "One candle, four prices",
        paragraphs: [
          "A candlestick compresses everything that happened in one period into four numbers: the open (first traded price), the high, the low and the close (last traded price) — OHLC for short. A one-hour chart draws one candle per hour; a daily chart, one per day.",
          "That is all a chart is: a row of OHLC summaries. Every pattern name you will ever hear — doji, hammer, engulfing — is a description of how those four numbers relate. Learn the four numbers first and the patterns become obvious instead of mystical.",
        ],
      },
      {
        heading: "Bodies and wicks",
        paragraphs: [
          "The thick part of the candle, the body, spans the distance between open and close. Close above open makes the candle bullish (usually drawn green or white); close below open makes it bearish (red or black). The thin lines above and below the body — wicks, also called shadows — mark the high and low that traded outside it.",
          "Bodies show conviction; wicks show rejection. A long body with tiny wicks means price moved one way and stayed there. A long wick means price went somewhere, met opposition and got pushed back — information you will put to work at support and resistance.",
        ],
      },
      {
        heading: "A worked example on XAUUSD",
        paragraphs: [
          "Take a one-hour gold candle that opens at 4,012.50, trades up to 4,024.80, dips to 4,008.20 and closes at 4,021.40. The body is $8.90 and bullish. The upper wick is $3.40 (the high minus the close), the lower wick $4.30 (the open minus the low). Total range: $16.60.",
          "Now attach money to it. One standard lot of XAUUSD is 100 troy ounces, so $1.00 of price movement is $100. That single candle's range is worth $1,660 per lot — which is why a stop-loss that fits inside one hourly gold candle is usually a stop placed by hope rather than by structure.",
        ],
      },
      {
        heading: "Timeframes: pick two, ignore the rest",
        paragraphs: [
          "The timeframe changes only how much time each candle summarises; the market underneath is the same. Higher timeframes — the 4-hour and daily — filter noise and reveal the levels that matter. Lower timeframes show detail but manufacture patterns out of randomness.",
          "A workable structure for a beginner: one anchor timeframe to decide direction and levels (the daily or 4-hour), and one execution timeframe to time entries (the 1-hour or 15-minute). Flipping through six timeframes until one agrees with the trade you already want is not analysis.",
        ],
      },
      {
        heading: "Support and resistance: zones, not lines",
        paragraphs: [
          "Support is an area where falling prices have repeatedly stopped and turned; resistance is the same thing above the market. You find both by looking left: mark the recent swing highs and lows where price clearly reversed, and any level that has been touched more than once.",
          "Draw them as zones a few dollars wide rather than lines to the cent — gold does not respect 4,050.00 exactly; it respects the area around it. Watch for role reversal too: broken resistance tends to act as support on the next visit, and vice versa. On gold, round numbers ending in 00 and 50 attract clustered orders and behave like pre-installed levels.",
        ],
      },
      {
        heading: "Candles at levels: the only combination you need",
        paragraphs: [
          "The useful skill is not reading candles or levels alone but reading them together. A long lower wick printed into a support zone says sellers pushed and were absorbed. A full-bodied close through resistance says the level has probably flipped. The same candle in the middle of nowhere says very little.",
          "This is deliberately not a lesson on indicators. RSI, moving averages and the rest have their uses, but stacking five of them on one chart mostly produces conflicting signals and unearned confidence. Price, levels and session context will carry you further in your first year than any oscillator.",
        ],
      },
      {
        heading: "Close the loop on every chart you trade",
        paragraphs: [
          "Chart reading improves through deliberate review, not screen time alone. For every trade, keep the chart as you saw it at entry — the level you traded against, the candle that triggered you — and set it beside the chart at exit.",
          "That review is what a journal is for: attach an entry screenshot to each trade in xaujournal and note the level you used. Within a few weeks, the gap between levels the market respected and levels you imagined becomes hard to ignore — and that feedback is what actually teaches you to read a chart.",
        ],
      },
    ],
    sources: [
      {
        label: "BabyPips — School of Pipsology: What is a Japanese Candlestick?",
        url: "https://www.babypips.com/learn/forex/what-is-a-japanese-candlestick",
      },
      {
        label: "BabyPips — School of Pipsology: What is Support and Resistance?",
        url: "https://www.babypips.com/learn/forex/support-and-resistance",
      },
      {
        label: "BabyPips — School of Pipsology: Candlesticks with Support and Resistance",
        url: "https://www.babypips.com/learn/forex/candlestick_with_support_and_resistance",
      },
    ],
  },
];
