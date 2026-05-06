//+------------------------------------------------------------------+
//|  XAUJournalEA.mq5                                                |
//|  Auto-journals closed XAUUSD trades to XAU Journal               |
//+------------------------------------------------------------------+
#property copyright "XAU Journal"
#property version   "1.00"
#property strict

//--- User inputs
input string ApiKey     = "";    // Paste your XAU Journal API Key here
input string JournalUrl = "https://your-actual-vercel-url.vercel.app/api/trades";
input bool   DebugMode  = false; // Set true to see logs in Experts tab

//--- Track which tickets already sent
ulong sentTickets[];

//+------------------------------------------------------------------+
int OnInit() {
   if (ApiKey == "") {
      Alert("XAU Journal EA: Please enter your API Key in the EA settings.");
      return INIT_FAILED;
   }
   Print("XAU Journal EA started. Ready to sync trades.");
   ArrayResize(sentTickets, 0);
   return INIT_SUCCEEDED;
}

//+------------------------------------------------------------------+
void OnTradeTransaction(const MqlTradeTransaction& trans,
                        const MqlTradeRequest&     request,
                        const MqlTradeResult&      result) {

   // We only care about deals (closed positions)
   if (trans.type != TRADE_TRANSACTION_DEAL_ADD) return;

   ulong dealTicket = trans.deal;
   if (dealTicket == 0) return;

   // Select the deal from history
   if (!HistoryDealSelect(dealTicket)) return;

   // Only process closing deals (entry OUT = trade closed)
   ENUM_DEAL_ENTRY entryType = (ENUM_DEAL_ENTRY)HistoryDealGetInteger(dealTicket, DEAL_ENTRY);
   if (entryType != DEAL_ENTRY_OUT) return;

   // Check not already sent
   for (int i = 0; i < ArraySize(sentTickets); i++) {
      if (sentTickets[i] == dealTicket) return;
   }

   // Get deal data
   string symbol     = HistoryDealGetString(dealTicket,  DEAL_SYMBOL);
   double lots       = HistoryDealGetDouble(dealTicket,  DEAL_VOLUME);
   double closePrice = HistoryDealGetDouble(dealTicket,  DEAL_PRICE);
   double pnl        = HistoryDealGetDouble(dealTicket,  DEAL_PROFIT);
   double commission = HistoryDealGetDouble(dealTicket,  DEAL_COMMISSION);
   double swap       = HistoryDealGetDouble(dealTicket,  DEAL_SWAP);
   long   dealTime   = HistoryDealGetInteger(dealTicket, DEAL_TIME);
   long   dealType   = HistoryDealGetInteger(dealTicket, DEAL_TYPE);
   long   positionId = HistoryDealGetInteger(dealTicket, DEAL_POSITION_ID);

   // Get the opening deal to find open price & time
   double openPrice = closePrice;
   long   openTime  = dealTime;

   HistorySelectByPosition(positionId);
   int totalDeals = HistoryDealsTotal();
   for (int i = 0; i < totalDeals; i++) {
      ulong ticket = HistoryDealGetTicket(i);
      if ((ENUM_DEAL_ENTRY)HistoryDealGetInteger(ticket, DEAL_ENTRY) == DEAL_ENTRY_IN) {
         openPrice = HistoryDealGetDouble(ticket,  DEAL_PRICE);
         openTime  = HistoryDealGetInteger(ticket, DEAL_TIME);
         break;
      }
   }

   // Get SL/TP from position history
   double stopLoss   = 0;
   double takeProfit = 0;
   if (HistoryOrderSelect(positionId)) {
      stopLoss   = HistoryOrderGetDouble(positionId, ORDER_SL);
      takeProfit = HistoryOrderGetDouble(positionId, ORDER_TP);
   }

   // Build type string
   string tradeType = (dealType == DEAL_TYPE_BUY) ? "BUY" : "SELL";

   // Format timestamps
   string openTimeStr  = TimeToString((datetime)openTime,  TIME_DATE | TIME_SECONDS);
   string closeTimeStr = TimeToString((datetime)dealTime,  TIME_DATE | TIME_SECONDS);

   // Build JSON payload
   string payload = StringFormat(
      "{\"ticket\":\"%d\","
      "\"symbol\":\"%s\","
      "\"type\":\"%s\","
      "\"lots\":%.2f,"
      "\"openPrice\":%.5f,"
      "\"closePrice\":%.5f,"
      "\"stopLoss\":%.5f,"
      "\"takeProfit\":%.5f,"
      "\"pnl\":%.2f,"
      "\"commission\":%.2f,"
      "\"swap\":%.2f,"
      "\"openTime\":\"%s\","
      "\"closeTime\":\"%s\"}",
      dealTicket,
      symbol,
      tradeType,
      lots,
      openPrice,
      closePrice,
      stopLoss,
      takeProfit,
      pnl,
      commission,
      swap,
      openTimeStr,
      closeTimeStr
   );

   if (DebugMode) Print("Sending: ", payload);

   // Send HTTP POST
   string headers = "Content-Type: application/json\r\nx-api-key: " + ApiKey;
   char   post[], response[];
   StringToCharArray(payload, post, 0, StringLen(payload));

   int httpCode = WebRequest(
      "POST",
      JournalUrl,
      headers,
      5000,
      post,
      response,
      headers
   );

   if (httpCode == 200) {
      // Mark as sent
      int size = ArraySize(sentTickets);
      ArrayResize(sentTickets, size + 1);
      sentTickets[size] = dealTicket;
      Print("XAU Journal: Trade synced ✓ Ticket #", dealTicket, " PnL: ", pnl);
   } else {
      Print("XAU Journal: Sync failed. HTTP ", httpCode, " Ticket #", dealTicket);
   }
}
