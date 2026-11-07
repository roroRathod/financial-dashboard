import os
import re
import json
import logging
from typing import Optional
from fastapi import APIRouter, Query
from pydantic import BaseModel
import feedparser
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

# OpenAI-Compatible Configuration (supports custom base_url, api_key, model)
DEFAULT_CONFIG = {
    "base_url": os.getenv("OPENAI_API_BASE") or os.getenv("LLM_BASE_URL", "https://api.openai.com/v1"),
    "api_key": os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY", ""),
    "model": os.getenv("OPENAI_MODEL") or os.getenv("LLM_MODEL", "auto"),
}

# Clean ticker name map to real corporate query
COMPANY_QUERIES = {
    "HDFCBANK": "HDFC Bank",
    "RELIANCE": "Reliance Industries",
    "TCS": "Tata Consultancy Services",
    "ICICIBANK": "ICICI Bank",
    "INFY": "Infosys",
    "BHARTIARTL": "Bharti Airtel",
    "ITC": "ITC Limited",
    "SBIN": "State Bank of India",
    "LT": "Larsen & Toubro",
    "BAJFINANCE": "Bajaj Finance",
    "HINDUNILVR": "Hindustan Unilever",
    "M&M": "Mahindra & Mahindra",
    "MARUTI": "Maruti Suzuki",
    "TATAMOTORS": "Tata Motors",
    "TMPV": "Tata Motors",
    "NTPC": "NTPC Limited",
    "POWERGRID": "Power Grid Corporation",
    "TATASTEEL": "Tata Steel",
    "TITAN": "Titan Company",
    "ASIANPAINT": "Asian Paints",
    "COALINDIA": "Coal India",
    "ONGC": "ONGC",
    "JSWSTEEL": "JSW Steel",
    "ADANIENT": "Adani Enterprises",
    "ADANIPORTS": "Adani Ports",
    "HINDALCO": "Hindalco Industries",
    "ULTRACEMCO": "UltraTech Cement",
    "NESTLEIND": "Nestle India",
    "WIPRO": "Wipro",
    "BEL": "Bharat Electronics",
    "TRENT": "Trent Limited",
    "TECHM": "Tech Mahindra",
    "GRASIM": "Grasim Industries",
    "CIPLA": "Cipla",
    "SUNPHARMA": "Sun Pharma",
    "DRREDDY": "Dr. Reddy's",
    "BRITANNIA": "Britannia Industries",
    "BPCL": "Bharat Petroleum",
    "IOC": "Indian Oil Corporation",
    "AAPL": "Apple",
    "MSFT": "Microsoft",
    "NVDA": "NVIDIA",
    "AMZN": "Amazon",
    "GOOGL": "Google Alphabet",
    "META": "Meta Platforms",
    "TSLA": "Tesla",
    "TSM": "TSMC Taiwan Semiconductor",
    "AVGO": "Broadcom",
    "AMD": "AMD Advanced Micro Devices",
    "PLTR": "Palantir Technologies",
    "NETWEB": "Netweb Technologies AI",
    "GC=F": "Gold prices commodities",
    "SI=F": "Silver prices commodities",
    "CL=F": "Crude oil WTI prices",
    "BZ=F": "Brent crude oil prices",
    "NG=F": "Natural gas commodities",
    "HG=F": "Copper prices commodities",
    "USD/INR": "USD INR rupee exchange rate",
    "EUR/INR": "EUR INR euro exchange rate",
    "^NSEI": "Nifty 50 stock market",
    "^BSESN": "Sensex stock market",
    "^NSEBANK": "Bank Nifty banking index",
    "^CNXIT": "Nifty IT index",
    "^INDIAVIX": "India VIX volatility index",
}


def _clean_symbol(ticker: str) -> str:
    return (
        ticker.replace(".NS", "")
        .replace(".BO", "")
        .replace(".DE", "")
        .replace(".L", "")
        .replace("^", "")
        .strip()
    )


def _fetch_related_news(query: str, limit: int = 6):
    try:
        url = f"https://news.google.com/rss/search?q={query.replace(' ', '+')}+stock&hl=en-IN&gl=IN&ceid=IN:en"
        d = feedparser.parse(url)
        items = []
        for e in d.entries[:limit]:
            title = e.get("title", "")
            src = getattr(e, "source", {}).get("title")
            if not src and " - " in title:
                parts = title.rsplit(" - ", 1)
                title = parts[0]
                src = parts[1]
            elif not src:
                src = "Financial News"

            items.append({
                "title": title.strip(),
                "link": e.get("link", ""),
                "published": e.get("published", ""),
                "source": src.strip(),
            })
        return items
    except Exception:
        return []


def _generate_reason_and_swot(name: str, ticker: str, change_pct: float, timeframe: str, news: list):
    """Algorithmic / Heuristic Fallback Engine when LLM is unavailable or fails."""
    is_up = change_pct >= 0
    top_headline = news[0]["title"] if news else f"{name} shows active trading momentum"
    second_headline = news[1]["title"] if len(news) > 1 else "Market participants monitor valuation and liquidity"

    direction_word = (
        "rallying" if change_pct >= 2.0
        else "advancing" if is_up
        else "declining" if change_pct <= -2.0
        else "consolidating"
    )

    reason = (
        f"{name} ({ticker}) is {direction_word} by {change_pct:+.2f}% over the {timeframe} window. "
        f"Primary market catalyst is driven by '{top_headline}'. "
        f"Institutional flow and trading volumes reflect {('accumulative buying interest' if is_up else 'profit-taking and risk repricing')}, "
        f"with traders watching key support/resistance levels alongside broader macro indicators. "
        f"Recent developments highlight: '{second_headline}'."
    )

    swot = {
        "strengths": [
            f"Strong brand franchise and institutional liquidity in {name}",
            "Solid balance sheet and defensive market positioning",
            "Consistent domestic operational cash flow generation",
        ],
        "weaknesses": [
            f"{'Stretched short-term valuation multiples following recent run-up' if is_up else 'Short-term margin compression and cautious guidance'}",
            "Sensitivity to global interest rate cycles and foreign institutional (FII) flows",
        ],
        "opportunities": [
            f"Expansion in high-growth domestic demand and market share gains",
            f"Breakout momentum targeting new technical resistance over {timeframe}",
            "Capital efficiency improvements and digital transformation tailwinds",
        ],
        "threats": [
            "Macro volatility from currency fluctuations and commodity inflation",
            "Heightened sector competition and regulatory compliance hurdles",
            "Uncertainty in broader global central bank interest rate policies",
        ],
    }

    return reason, swot


async def _call_openai_llm(name: str, ticker: str, change_pct: float, timeframe: str, news: list) -> Optional[dict]:
    """Primary Method: Calls OpenAI-compatible chat completions endpoint."""
    api_key = os.getenv("LLM_API_KEY", DEFAULT_CONFIG.get("api_key", "")).strip()
    if not api_key:
        return None

    base_url = os.getenv("LLM_BASE_URL", DEFAULT_CONFIG.get("base_url", "https://api.openai.com/v1")).rstrip("/")
    model = os.getenv("LLM_MODEL", DEFAULT_CONFIG.get("model", "auto")) or "auto"

    news_text = "\n".join([f"- {n.get('title')} ({n.get('source', '')})" for n in news[:5]]) or "No recent breaking news."

    prompt = f"""You are a senior Wall Street & Dalal Street equity research analyst.
Analyze the following asset based on its live market price action and breaking news coverage:

Asset: {name} (Ticker: {ticker})
Return over {timeframe}: {change_pct:+.2f}%
Recent News Headlines:
{news_text}

Provide an institutional, razor-sharp fundamental & technical analysis strictly in valid JSON format.
Your output must be ONLY a valid JSON object without markdown fences, matching this structure:
{{
  "reason_for_move": "1-2 impactful sentences explaining the real catalyst for this price movement citing recent events/earnings/sentiment.",
  "swot": {{
    "strengths": ["Clear strength 1", "Clear strength 2", "Clear strength 3"],
    "weaknesses": ["Clear weakness 1", "Clear weakness 2"],
    "opportunities": ["Growth or technical opportunity 1", "Opportunity 2"],
    "threats": ["Key risk or headwind 1", "Key risk 2"]
  }}
}}"""

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(
                f"{base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a professional financial equity analyst. Return valid JSON only."},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                },
            )
            if resp.status_code != 200:
                logger.warning(f"OpenAI LLM API error {resp.status_code}: {resp.text[:200]}")
                return None

            data = resp.json()
            content = data["choices"][0]["message"]["content"].strip()

            # Clean markdown code blocks if present
            if content.startswith("```"):
                content = re.sub(r"^```(?:json)?\s*", "", content)
                content = re.sub(r"\s*```$", "", content)

            parsed = json.loads(content)
            if "reason_for_move" in parsed and "swot" in parsed:
                return parsed
    except Exception as e:
        logger.warning(f"OpenAI LLM API failed ({e}), falling back to heuristic engine.")
        return None

    return None


class ConfigUpdateRequest(BaseModel):
    base_url: Optional[str] = None
    api_key: Optional[str] = None
    model: Optional[str] = None


@router.get("/config")
async def get_ai_config():
    """Check current LLM configuration and key status."""
    has_key = bool(DEFAULT_CONFIG.get("api_key", "").strip())
    masked_key = ""
    if has_key:
        k = DEFAULT_CONFIG["api_key"].strip()
        masked_key = f"{k[:3]}...{k[-4:]}" if len(k) > 7 else "***"

    return {
        "base_url": DEFAULT_CONFIG.get("base_url"),
        "model": DEFAULT_CONFIG.get("model"),
        "has_api_key": has_key,
        "masked_api_key": masked_key,
        "mode": "Primary: OpenAI-Compatible LLM | Fallback: Heuristic News Synthesis",
    }


@router.post("/config")
async def update_ai_config(cfg: ConfigUpdateRequest):
    """Dynamically set or update LLM Base URL, API Key, and Model."""
    if cfg.base_url is not None:
        DEFAULT_CONFIG["base_url"] = cfg.base_url.strip()
    if cfg.api_key is not None:
        DEFAULT_CONFIG["api_key"] = cfg.api_key.strip()
    if cfg.model is not None:
        DEFAULT_CONFIG["model"] = cfg.model.strip()

    return {
        "status": "updated",
        "base_url": DEFAULT_CONFIG["base_url"],
        "model": DEFAULT_CONFIG["model"],
        "has_api_key": bool(DEFAULT_CONFIG["api_key"]),
    }


class SummaryRequest(BaseModel):
    asset_class: str
    region: str = "INDIA"
    data: dict = {}
    use_llm: Optional[bool] = True


@router.post("/summary")
async def ai_summary(req: SummaryRequest):
    ticker = req.data.get("ticker", req.asset_class)
    sym = _clean_symbol(ticker)

    # Intelligently construct search query for news RSS
    if sym in COMPANY_QUERIES:
        query = COMPANY_QUERIES[sym]
    elif ticker in COMPANY_QUERIES:
        query = COMPANY_QUERIES[ticker]
    elif req.asset_class and req.asset_class != ticker and req.asset_class != sym:
        query = f"{req.asset_class} stock"
    else:
        query = f"{sym} stock India"

    change_pct = float(req.data.get("change", 0.0) or 0.0)
    timeframe = req.data.get("timeframe", "1D")
    use_llm = req.use_llm if req.use_llm is not None else req.data.get("use_llm", True)

    news = await asyncio.to_thread(_fetch_related_news, query, 6)

    # 1. Try Primary Method: OpenAI-Compatible LLM (only if use_llm is True)
    llm_result = None
    if use_llm:
        llm_result = await _call_openai_llm(req.asset_class, ticker, change_pct, timeframe, news)

    if llm_result:
        reason = llm_result.get("reason_for_move")
        swot = llm_result.get("swot")
        source = f"AI LLM ({DEFAULT_CONFIG.get('model', 'auto')}) + Live News Wire"
        is_llm = True
    else:
        # 2. Fast Fallback: Algorithmic Heuristic News Synthesis (Zero LLM tokens)
        reason, swot = _generate_reason_and_swot(req.asset_class, ticker, change_pct, timeframe, news)
        source = "Heuristic News Synthesis Engine (Zero API Tokens)" if not use_llm else "Live News Synthesis Engine (Algorithmic Fallback)"
        is_llm = False

    return {
        "asset": req.asset_class,
        "ticker": ticker,
        "timeframe": timeframe,
        "reason_for_move": reason,
        "why": reason,
        "what": f"Trading at live price with {change_pct:+.2f}% move over {timeframe}.",
        "news_sources": news,
        "swot": swot,
        "source": source,
        "is_llm": is_llm,
    }


@router.get("/analyze")
async def ai_analyze(
    ticker: str = Query(...),
    name: str = Query(default=""),
    change_pct: float = Query(default=0.0),
    timeframe: str = Query(default="1D"),
):
    sym = _clean_symbol(ticker)
    display_name = name or sym

    if sym in COMPANY_QUERIES:
        query = COMPANY_QUERIES[sym]
    elif ticker in COMPANY_QUERIES:
        query = COMPANY_QUERIES[ticker]
    elif display_name and display_name != sym:
        query = f"{display_name} stock"
    else:
        query = f"{sym} stock India"

    news = _fetch_related_news(query, limit=6)

    # 1. Try Primary Method: OpenAI-Compatible LLM
    llm_result = await _call_openai_llm(display_name, ticker, change_pct, timeframe, news)

    if llm_result:
        reason = llm_result.get("reason_for_move")
        swot = llm_result.get("swot")
        source = f"AI LLM ({DEFAULT_CONFIG.get('model', 'auto')}) + Live News Wire"
        is_llm = True
    else:
        # 2. Seamless Fallback
        reason, swot = _generate_reason_and_swot(display_name, ticker, change_pct, timeframe, news)
        source = "Live News Synthesis Engine (Algorithmic Fallback)"
        is_llm = False

    return {
        "asset": display_name,
        "ticker": ticker,
        "timeframe": timeframe,
        "reason_for_move": reason,
        "why": reason,
        "news_sources": news,
        "swot": swot,
        "source": source,
        "is_llm": is_llm,
    }


class CandlestickRequest(BaseModel):
    ticker: str
    name: Optional[str] = None
    candles: list = []
    use_llm: Optional[bool] = True


@router.post("/candlestick")
async def analyze_candlestick(req: CandlestickRequest):
    """Detects technical candlestick patterns, support/resistance, and suggests AI analysis."""
    candles = req.candles
    if not candles or len(candles) < 3:
        return {
            "patterns": ["Insufficient candle history for multi-bar pattern confirmation"],
            "sentiment": "Neutral",
            "support": None,
            "resistance": None,
            "analysis": "Awaiting more trading session candles to form validated technical structures.",
            "source": "Heuristic Technical Pattern Engine",
        }

    last = candles[-1]
    prev = candles[-2]
    prev2 = candles[-3] if len(candles) >= 3 else prev

    c_open = float(last.get("open", 0) or 0)
    c_close = float(last.get("close", 0) or 0)
    c_high = float(last.get("high", 0) or 0)
    c_low = float(last.get("low", 0) or 0)

    p_open = float(prev.get("open", 0) or 0)
    p_close = float(prev.get("close", 0) or 0)
    p_high = float(prev.get("high", 0) or 0)
    p_low = float(prev.get("low", 0) or 0)

    # Range and body calculations
    c_range = max(c_high - c_low, 0.0001)
    c_body = abs(c_close - c_open)
    c_upper_wick = c_high - max(c_open, c_close)
    c_lower_wick = min(c_open, c_close) - c_low

    is_bullish = c_close >= c_open
    p_is_bullish = p_close >= p_open

    patterns = []
    sentiment = "Neutral"

    # 1. Doji
    if c_body / c_range <= 0.12:
        if c_lower_wick >= c_range * 0.6:
            patterns.append("Dragonfly Doji (Bullish Rejection of Lows)")
            sentiment = "Bullish Reversal"
        elif c_upper_wick >= c_range * 0.6:
            patterns.append("Gravestone Doji (Bearish Rejection of Highs)")
            sentiment = "Bearish Rejection"
        else:
            patterns.append("Standard Neutral Doji (Equilibrium & Indecision)")
            sentiment = "Consolidating"

    # 2. Hammer / Hanging Man
    elif c_lower_wick >= 2.0 * c_body and c_upper_wick <= 0.25 * c_body:
        if not p_is_bullish:
            patterns.append("Bullish Hammer (Institutional Dip Buying)")
            sentiment = "Bullish Reversal"
        else:
            patterns.append("Hanging Man (Potential Exhaustion)")
            sentiment = "Cautious"

    # 3. Shooting Star / Inverted Hammer
    elif c_upper_wick >= 2.0 * c_body and c_lower_wick <= 0.25 * c_body:
        if p_is_bullish:
            patterns.append("Shooting Star (Bearish Supply Resistance)")
            sentiment = "Bearish Rejection"
        else:
            patterns.append("Inverted Hammer (Attempted Breakout)")
            sentiment = "Constructive"

    # 4. Bullish / Bearish Engulfing
    elif not p_is_bullish and is_bullish and c_close > p_open and c_open < p_close:
        patterns.append("Bullish Engulfing (Buyers Overwhelmed Sellers)")
        sentiment = "Strong Bullish"
    elif p_is_bullish and not is_bullish and c_close < p_open and c_open > p_close:
        patterns.append("Bearish Engulfing (Sellers Overwhelmed Buyers)")
        sentiment = "Strong Bearish"

    # 5. Marubozu (Clean strong expansion bar)
    elif c_body / c_range >= 0.85:
        if is_bullish:
            patterns.append("Bullish Marubozu (Strong Conviction Expansion)")
            sentiment = "Bullish Continuation"
        else:
            patterns.append("Bearish Marubozu (Heavy Distribution Expansion)")
            sentiment = "Bearish Continuation"

    # Lookback support & resistance
    lookback = candles[-20:]
    all_highs = [float(c.get("high", 0) or 0) for c in lookback if c.get("high")]
    all_lows = [float(c.get("low", 0) or 0) for c in lookback if c.get("low")]
    resistance = max(all_highs) if all_highs else c_high
    support = min(all_lows) if all_lows else c_low

    if not patterns:
        patterns.append(
            f"{'Bullish' if is_bullish else 'Bearish'} Session Bar with {c_body / c_range * 100:.0f}% Body Proportion"
        )
        sentiment = "Bullish" if is_bullish else "Bearish"

    # LLM-based technical analysis if configured and enabled
    api_key = DEFAULT_CONFIG.get("api_key", "").strip()
    llm_analysis = None
    use_llm = req.use_llm if req.use_llm is not None else True

    if use_llm and api_key:
        try:
            base_url = DEFAULT_CONFIG.get("base_url", "https://api.openai.com/v1").rstrip("/")
            model = DEFAULT_CONFIG.get("model", "auto") or "auto"
            prompt = f"""You are a CMT (Chartered Market Technician). Analyze this candlestick setup for {req.name or req.ticker}:
Latest Candle: Open={c_open:.2f}, High={c_high:.2f}, Low={c_low:.2f}, Close={c_close:.2f}
Previous Candle: Open={p_open:.2f}, High={p_high:.2f}, Low={p_low:.2f}, Close={p_close:.2f}
Identified Pattern: {', '.join(patterns)}
20-period Resistance: {resistance:.2f}, Support: {support:.2f}

Provide a 2-sentence institutional technical trading summary: key trigger level, confirmation required, and stop/invalidation level. Do not output markdown code fences."""

            async with httpx.AsyncClient(timeout=6.0) as client:
                res = await client.post(
                    f"{base_url}/chat/completions",
                    headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                    },
                )
                if res.status_code == 200:
                    llm_analysis = res.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            llm_analysis = None

    if not llm_analysis:
        direction_phrase = "accumulating on dips near support" if is_bullish else "facing supply overhead near resistance"
        llm_analysis = (
            f"The current price structure exhibits a {patterns[0]}. "
            f"Key support is established at ₹{support:.2f} with overhead test resistance at ₹{resistance:.2f}. "
            f"Traders are {direction_phrase}, watching for candle close confirmation above immediate pivot."
        )

    return {
        "patterns": patterns,
        "sentiment": sentiment,
        "support": round(support, 2),
        "resistance": round(resistance, 2),
        "analysis": llm_analysis,
        "source": "LLM Technical Engine" if use_llm and api_key and llm_analysis else "Heuristic Candlestick Pattern Engine",
    }
