from fastapi import APIRouter
from app.services.client import quote, history, cached

router = APIRouter()

MARKETS = {
    "INDIA": {
        "NIFTY 50": "^NSEI",
        "SENSEX": "^BSESN",
        "BANK NIFTY": "^NSEBANK",
        "NIFTY IT": "^CNXIT",
        "INDIA VIX": "^INDIAVIX",
    },
    "US": {
        "S&P 500": "^GSPC",
        "NASDAQ 100": "^NDX",
        "DOW JONES": "^DJI",
        "RUSSELL 2000": "^RUT",
        "VIX": "^VIX",
    },
    "JAPAN": {
        "NIKKEI 225": "^N225",
        "TOPIX": "^TPX",
    },
    "CHINA": {
        "CSI 300": "000300.SS",
        "SHANGHAI COMP": "000001.SS",
        "HANG SENG": "^HSI",
    },
    "GLOBAL": {
        "FTSE 100": "^FTSE",
        "DAX": "^GDAXI",
        "CAC 40": "^FCHI",
        "ASX 200": "^AXJO",
        "DOLLAR INDEX": "DX-Y.NYB",
    },
}


@router.get("")
@router.get("/")
async def list_markets():
    result = {}
    for region, tickers in MARKETS.items():
        region_quotes = {}
        for name, ticker in tickers.items():
            q = quote(ticker)
            if q:
                region_quotes[name] = q
        result[region] = region_quotes
    return {"regions": list(MARKETS.keys()), "markets": result, "data": result}


@router.get("/history")
async def get_history(ticker: str, period: str = "1mo", interval: str = "1d"):
    return {"ticker": ticker, "history": history(ticker, period=period, interval=interval)}


@router.get("/search")
async def search_markets(q: str = ""):
    if not q or len(q.strip()) < 1:
        return {"results": []}
    query = q.strip()
    try:
        import httpx
        url = f"https://query1.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10&newsCount=0"
        async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
            resp = await client.get(url, timeout=5.0)
            data = resp.json()
            quotes = data.get("quotes", [])
            results = []
            for item in quotes:
                sym = item.get("symbol")
                if not sym:
                    continue
                quote_type = item.get("quoteType", "EQUITY")
                category = "Stock" if quote_type == "EQUITY" else "Index" if quote_type == "INDEX" else "Commodity" if quote_type == "FUTURE" else "Asset"
                results.append({
                    "ticker": sym,
                    "name": item.get("shortname") or item.get("longname") or sym,
                    "exchange": item.get("exchange", ""),
                    "category": category,
                    "type": quote_type,
                })
            return {"results": results, "query": query}
    except Exception as e:
        return {"results": [], "error": str(e)}


@router.get("/{region}")
@router.get("/{region}/")
async def region_markets(region: str):
    region_upper = region.upper()
    if region_upper not in MARKETS:
        return {"error": "unknown region"}
    result = {}
    for name, ticker in MARKETS[region_upper].items():
        q = quote(ticker)
        if q:
            result[name] = q
    return {"region": region_upper, "data": result}


@router.get("/{region}/{name}")
async def market_detail(region: str, name: str):
    if region not in MARKETS or name not in MARKETS[region]:
        return {"error": "not found"}
    ticker = MARKETS[region][name]
    return {"ticker": ticker, "quote": quote(ticker), "history": history(ticker)}
