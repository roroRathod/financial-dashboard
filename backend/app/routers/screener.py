from fastapi import APIRouter, Query
from app.services.client import quote, history
from concurrent.futures import ThreadPoolExecutor

router = APIRouter()

INDEX_CONSTITUENTS = {
    "NIFTY 50": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
        "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "BAJFINANCE.NS",
        "HCLTECH.NS", "KOTAKBANK.NS", "AXISBANK.NS", "SUNPHARMA.NS", "M&M.NS",
        "MARUTI.NS", "NTPC.NS", "TATAMOTORS.NS", "POWERGRID.NS", "TATASTEEL.NS",
        "ASIANPAINT.NS", "TITAN.NS", "COALINDIA.NS", "BAJAJ-AUTO.NS", "ONGC.NS",
        "JSWSTEEL.NS", "ADANIENT.NS", "ADANIPORTS.NS", "HINDALCO.NS", "ULTRACEMCO.NS",
        "NESTLEIND.NS", "WIPRO.NS", "BEL.NS", "TRENT.NS", "TECHM.NS",
        "GRASIM.NS", "EICHERMOT.NS", "CIPLA.NS", "DRREDDY.NS", "BRITANNIA.NS",
        "BPCL.NS", "TATACONSUM.NS", "APOLLOHOSP.NS", "DIVISLAB.NS", "HEROMOTOCO.NS",
        "SHREECEM.NS", "IOC.NS", "HINDUNILVR.NS", "VEDL.NS",
    ],
    "BANK NIFTY": [
        "HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS",
        "INDUSINDBK.NS", "BANKBARODA.NS", "PNB.NS", "AUBANK.NS", "FEDERALBNK.NS",
        "IDFCFIRSTB.NS", "BANDHANBNK.NS",
    ],
    "SENSEX": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
        "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "BAJFINANCE.NS",
        "HCLTECH.NS", "KOTAKBANK.NS", "AXISBANK.NS", "SUNPHARMA.NS", "M&M.NS",
        "MARUTI.NS", "NTPC.NS", "TATAMOTORS.NS", "POWERGRID.NS", "TATASTEEL.NS",
        "ASIANPAINT.NS", "TITAN.NS", "ULTRACEMCO.NS", "NESTLEIND.NS", "WIPRO.NS",
        "TECHM.NS", "HINDUNILVR.NS", "BAJAJFINSV.NS", "INDUSINDBK.NS", "JSWSTEEL.NS",
    ],
    "NIFTY MIDCAP 150": [
        "POLYCAB.NS", "SUZLON.NS", "DIXON.NS", "MAXHEALTH.NS", "CUMMINSIND.NS",
        "PERSISTENT.NS", "COFORGE.NS", "AUROPHARMA.NS", "LUPIN.NS", "FEDERALBNK.NS",
        "ASHOKLEY.NS", "BHEL.NS", "IDFCFIRSTB.NS", "OBEROIRLTY.NS", "VOLTAS.NS",
    ],
    "NASDAQ 100": [
        "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "AVGO",
        "COST", "ASML", "NFLX", "AMD", "PEP", "ADBE", "CSCO", "TMUS",
        "QCOM", "INTC", "TXN", "AMGN",
    ],
    "S&P 500": [
        "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "TSLA",
        "JPM", "V", "UNH", "XOM", "LLY", "MA", "HD", "PG", "JNJ", "COST",
        "ABBV", "BAC",
    ],
    "DOW JONES": [
        "UNH", "GS", "MSFT", "HD", "CAT", "AMGN", "CRM", "V", "MCD", "BA",
        "HON", "TRV", "AAPL", "JPM", "AXP", "JNJ", "IBM", "WMT", "DIS", "CVX",
    ],
    "RUSSELL 2000": [
        "SMCI", "FTAI", "VRT", "SAIA", "SFM", "MEDP", "ENSG", "FIX", "CRVL", "UFPI",
    ],
    "FTSE 100": [
        "AZN.L", "SHEL.L", "HSBA.L", "ULVR.L", "BP.L", "RIO.L", "GSK.L", "DGE.L", "REL.L", "BARC.L",
    ],
    "DAX": [
        "SAP.DE", "SIE.DE", "ALV.DE", "DTE.DE", "AIR.DE", "MBG.DE", "BMW.DE", "BAS.DE", "BAYN.DE", "MUV2.DE",
    ],
    "CAC 40": [
        "MC.PA", "OR.PA", "TTE.PA", "SAN.PA", "AIR.PA", "SU.PA", "RMS.PA", "BNP.PA", "EL.PA", "DG.PA",
    ],
    "NIKKEI 225": [
        "7203.T", "6758.T", "6861.T", "8035.T", "9983.T", "9984.T", "7267.T", "8058.T", "7974.T", "4063.T",
    ],
    "HANG SENG": [
        "0700.HK", "9988.HK", "0941.HK", "0005.HK", "3690.HK", "1299.HK", "2318.HK", "1810.HK",
    ],
    "ASX 200": [
        "BHP.AX", "CBA.AX", "CSL.AX", "NAB.AX", "WBC.AX", "ANZ.AX", "WES.AX", "MQG.AX", "TLS.AX", "WOW.AX",
    ],
    "ALL NSE": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
        "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "BAJFINANCE.NS",
        "HCLTECH.NS", "KOTAKBANK.NS", "AXISBANK.NS", "SUNPHARMA.NS", "M&M.NS",
        "MARUTI.NS", "NTPC.NS", "TATAMOTORS.NS", "POWERGRID.NS", "TATASTEEL.NS",
        "ASIANPAINT.NS", "TITAN.NS", "COALINDIA.NS", "BAJAJ-AUTO.NS", "ONGC.NS",
        "JSWSTEEL.NS", "ADANIENT.NS", "ADANIPORTS.NS", "HINDALCO.NS", "ULTRACEMCO.NS",
        "NESTLEIND.NS", "WIPRO.NS", "BEL.NS", "TRENT.NS", "TECHM.NS",
        "GRASIM.NS", "EICHERMOT.NS", "CIPLA.NS", "DRREDDY.NS", "BRITANNIA.NS",
        "BPCL.NS", "TATACONSUM.NS", "APOLLOHOSP.NS", "DIVISLAB.NS", "HEROMOTOCO.NS",
        "SHREECEM.NS", "IOC.NS", "HINDUNILVR.NS", "VEDL.NS", "INDUSINDBK.NS",
        "BANKBARODA.NS", "PNB.NS", "AUBANK.NS", "FEDERALBNK.NS", "IDFCFIRSTB.NS",
        "BANDHANBNK.NS", "POLYCAB.NS", "SUZLON.NS", "DIXON.NS", "MAXHEALTH.NS",
        "CUMMINSIND.NS", "PERSISTENT.NS", "COFORGE.NS", "AUROPHARMA.NS", "LUPIN.NS",
        "ASHOKLEY.NS", "BHEL.NS", "OBEROIRLTY.NS", "VOLTAS.NS"
    ],
    "F&O": [
        "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS",
        "BHARTIARTL.NS", "ITC.NS", "SBIN.NS", "LT.NS", "BAJFINANCE.NS",
        "KOTAKBANK.NS", "AXISBANK.NS", "MARUTI.NS", "TATAMOTORS.NS", "TATASTEEL.NS",
        "BAJAJ-AUTO.NS", "JSWSTEEL.NS", "ADANIENT.NS", "HINDALCO.NS", "BEL.NS",
        "TRENT.NS", "FEDERALBNK.NS", "BANKBARODA.NS", "PNB.NS", "DIXON.NS"
    ],
}


@router.get("")
@router.get("/")
async def screener(index: str = Query(default="NIFTY 50")):
    # Normalize index lookup
    index_key = index.upper().strip()
    if index_key not in INDEX_CONSTITUENTS:
        # Match partial e.g. "BANK" -> "BANK NIFTY"
        for k in INDEX_CONSTITUENTS:
            if index_key in k or k in index_key:
                index_key = k
                break
        else:
            index_key = "NIFTY 50"

    tickers = INDEX_CONSTITUENTS.get(index_key, INDEX_CONSTITUENTS["NIFTY 50"])
    with ThreadPoolExecutor(max_workers=10) as executor:
        quotes = list(executor.map(quote, tickers))

    results = [q for q in quotes if q]
    results.sort(key=lambda x: abs(x.get("change_pct", 0)), reverse=True)
    return {
        "index": index_key,
        "stocks": results,
        "data": results,
        "count": len(results),
        "source": "yahoo",
    }
