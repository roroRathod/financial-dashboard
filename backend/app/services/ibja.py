import re
import urllib.request
import time
from typing import Dict, Any

_CACHE: Dict[str, Any] = {}
_LAST_FETCH = 0
_CACHE_TTL = 900  # 15 minutes cache

FALLBACK_RATES = {
    "gold_999": 141023,  # per 10g (24K)
    "gold_995": 140458,  # per 10g (99.5% bullion)
    "gold_916": 129177,  # per 10g (22K)
    "gold_750": 105767,  # per 10g (18K)
    "silver_999": 181863,  # per 1kg
}

def _build_rates_payload(g999: int, g995: int, g916: int, g750: int, silver: int, source: str) -> Dict[str, Any]:
    return {
        "source": source,
        "updated_at": time.strftime("%Y-%m-%d %H:%M:%S IST"),
        "gold_999": g999,
        "gold_995": g995,
        "gold_916": g916,
        "gold_750": g750,
        "silver_999": silver,
        "karats": {
            "24K": {
                "karat": "24K",
                "label": "24K (999 Fine)",
                "purity": "99.9% Pure (Bullion & Minted Bars)",
                "price_per_g": round(g999 / 10, 2),
                "price_10g": g999,
                "unit": "₹ / g",
                "sub": f"₹{g999:,} per 10g (24K Pure)",
            },
            "22K": {
                "karat": "22K",
                "label": "22K (916 Jewellery)",
                "purity": "91.6% Hallmark Jewellery Benchmark",
                "price_per_g": round(g916 / 10, 2),
                "price_10g": g916,
                "unit": "₹ / g",
                "sub": f"₹{g916:,} per 10g (22K Hallmark)",
            },
            "18K": {
                "karat": "18K",
                "label": "18K (750 Designer)",
                "purity": "75.0% Diamond & Designer Jewellery",
                "price_per_g": round(g750 / 10, 2),
                "price_10g": g750,
                "unit": "₹ / g",
                "sub": f"₹{g750:,} per 10g (18K Designer)",
            },
        },
    }

def fetch_ibja_rates() -> Dict[str, Any]:
    """
    Fetch official live Indian benchmark spot prices from IBJA (India Bullion and Jewellers Association, Mumbai).
    """
    global _CACHE, _LAST_FETCH
    now = time.time()
    if _CACHE and (now - _LAST_FETCH < _CACHE_TTL):
        return _CACHE

    try:
        req = urllib.request.Request(
            "https://ibjarates.com/",
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
        )
        html = urllib.request.urlopen(req, timeout=8).read().decode("utf-8", errors="ignore")

        gold_pattern = r'data-label=\"Gold 999\">(\d+)</td>\s*<td[^>]*data-label=\"Gold 995\">(\d+)</td>\s*<td[^>]*data-label=\"Gold 916\">(\d+)</td>\s*<td[^>]*data-label=\"Gold 750\">(\d+)</td>'
        gold_match = re.search(gold_pattern, html)

        silver_pattern = r'data-label=\"Silver 999\">(\d+)\s*</td>'
        silver_match = re.search(silver_pattern, html)

        g999 = int(gold_match.group(1)) if gold_match else FALLBACK_RATES["gold_999"]
        g995 = int(gold_match.group(2)) if gold_match else FALLBACK_RATES["gold_995"]
        g916 = int(gold_match.group(3)) if gold_match else FALLBACK_RATES["gold_916"]
        g750 = int(gold_match.group(4)) if gold_match else FALLBACK_RATES["gold_750"]
        silver = int(silver_match.group(1)) if silver_match else FALLBACK_RATES["silver_999"]

        rates = _build_rates_payload(g999, g995, g916, g750, silver, "IBJA Benchmark (Mumbai Zaveri Bazar)")
        _CACHE = rates
        _LAST_FETCH = now
        return _CACHE
    except Exception:
        if _CACHE:
            return _CACHE
        return _build_rates_payload(
            FALLBACK_RATES["gold_999"],
            FALLBACK_RATES["gold_995"],
            FALLBACK_RATES["gold_916"],
            FALLBACK_RATES["gold_750"],
            FALLBACK_RATES["silver_999"],
            "IBJA Benchmark (Fallback)",
        )
