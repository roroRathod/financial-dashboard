import httpx
from cachetools import TTLCache
from functools import wraps
import os
import datetime

CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", "60"))
_cache = TTLCache(maxsize=2000, ttl=CACHE_TTL)
_client = httpx.Client(
    timeout=10,
    headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    },
)


def cached(key_fn):
    def deco(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            key = key_fn(*args, **kwargs)
            if key in _cache:
                return _cache[key]
            result = fn(*args, **kwargs)
            if result is not None:
                _cache[key] = result
            return result
        return wrapper
    return deco


def _calc_pct(current: float, base: float) -> float:
    if not base or base == 0:
        return 0.0
    return round(((current - base) / base) * 100, 2)


@cached(lambda ticker: f"quote_full:{ticker}")
def quote(ticker: str):
    """
    Fetch 1-year historical data from Yahoo Chart API and compute
    multi-period returns: 1D, 1W, 1M, 3M, 6M, 1Y.
    """
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range=1y&interval=1d"
        r = _client.get(url)
        if r.status_code != 200:
            return None
        data = r.json()
        result = data.get("chart", {}).get("result", [])
        if not result:
            return None

        meta = result[0].get("meta", {})
        price = meta.get("regularMarketPrice")
        if price is None:
            return None
        price = float(price)

        prev = meta.get("chartPreviousClose", price)
        diff_1d = price - prev
        pct_1d = _calc_pct(price, prev)

        indicators = result[0].get("indicators", {}).get("quote", [{}])[0]
        closes = [float(c) for c in indicators.get("close", []) if c is not None]

        # Calculate multi-period returns based on trading day indices
        # 1D: ~1 day
        # 1W: ~5 trading days
        # 1M: ~21 trading days
        # 3M: ~63 trading days
        # 6M: ~126 trading days
        # 1Y: ~252 trading days (or first available)
        n = len(closes)
        c_1d = closes[-2] if n >= 2 else (prev or price)
        c_1w = closes[-6] if n >= 6 else (closes[0] if n > 0 else price)
        c_1m = closes[-22] if n >= 22 else (closes[0] if n > 0 else price)
        c_3m = closes[-64] if n >= 64 else (closes[0] if n > 0 else price)
        c_6m = closes[-127] if n >= 127 else (closes[0] if n > 0 else price)
        c_1y = closes[0] if n > 0 else price

        # YTD calculation: find first close of the current calendar year
        ts = result[0].get("timestamp", [])
        curr_year = datetime.datetime.now().year
        c_ytd = None
        for t, c in zip(ts, indicators.get("close", [])):
            if c is not None:
                dt = datetime.datetime.fromtimestamp(t, datetime.timezone.utc)
                if dt.year == curr_year:
                    c_ytd = float(c)
                    break
        if c_ytd is None:
            c_ytd = c_1y

        periods = {
            "1D": pct_1d,
            "1W": _calc_pct(price, c_1w),
            "1M": _calc_pct(price, c_1m),
            "3M": _calc_pct(price, c_3m),
            "6M": _calc_pct(price, c_6m),
            "YTD": _calc_pct(price, c_ytd),
            "1Y": _calc_pct(price, c_1y),
        }

        changes = {
            "1D": round(diff_1d, 2),
            "1W": round(price - c_1w, 2),
            "1M": round(price - c_1m, 2),
            "3M": round(price - c_3m, 2),
            "6M": round(price - c_6m, 2),
            "YTD": round(price - c_ytd, 2),
            "1Y": round(price - c_1y, 2),
        }

        short_name = meta.get("shortName") or meta.get("longName") or ticker
        long_name = meta.get("longName") or meta.get("shortName") or ticker

        return {
            "ticker": ticker,
            "name": short_name,
            "long_name": long_name,
            "price": round(price, 2),
            "change": round(diff_1d, 2),
            "change_pct": pct_1d,
            "periods": periods,
            "changes": changes,
            "volume": int(meta.get("regularMarketVolume", 0) or 0),
            "currency": meta.get("currency", "USD"),
            "high": round(float(meta.get("regularMarketDayHigh", price) or price), 2),
            "low": round(float(meta.get("regularMarketDayLow", price) or price), 2),
            "open": round(float(meta.get("regularMarketOpen", price) or price), 2),
            "fifty_two_week_high": round(float(meta.get("fiftyTwoWeekHigh", price) or price), 2),
            "fifty_two_week_low": round(float(meta.get("fiftyTwoWeekLow", price) or price), 2),
            "source": "yahoo",
        }
    except Exception:
        return None


@cached(lambda ticker, period="1mo", interval="1d": f"hist:{ticker}:{period}:{interval}")
def history(ticker: str, period: str = "1mo", interval: str = "1d"):
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}?range={period}&interval={interval}"
        r = _client.get(url)
        if r.status_code != 200:
            return []
        data = r.json()
        result = data.get("chart", {}).get("result", [])
        if not result:
            return []
        item = result[0]
        timestamps = item.get("timestamp", [])
        indicators = item.get("indicators", {}).get("quote", [{}])[0]
        opens = indicators.get("open", [])
        highs = indicators.get("high", [])
        lows = indicators.get("low", [])
        closes = indicators.get("close", [])
        volumes = indicators.get("volume", [])
        out = []
        for i, ts in enumerate(timestamps):
            c = closes[i] if i < len(closes) else None
            if c is None:
                continue
            dt = datetime.datetime.fromtimestamp(ts, datetime.timezone.utc).strftime("%Y-%m-%d")
            out.append({
                "date": dt,
                "open": round(float(opens[i] or c), 2),
                "high": round(float(highs[i] or c), 2),
                "low": round(float(lows[i] or c), 2),
                "close": round(float(c), 2),
                "volume": int(volumes[i] or 0),
            })
        return out
    except Exception:
        return []
