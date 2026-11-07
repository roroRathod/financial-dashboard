"""USD/INR conversion via Yahoo Finance (no extra deps)."""
import os
from app.services.client import quote

USD_INR_TICKER = "INR=X"


def usd_to_inr(usd: float) -> float:
    q = quote(USD_INR_TICKER)
    rate = q["price"] if q and q["price"] else float(os.getenv("USD_INR_FALLBACK", "83.5"))
    return usd * rate


def inr_to_usd(inr: float) -> float:
    q = quote(USD_INR_TICKER)
    rate = q["price"] if q and q["price"] else float(os.getenv("USD_INR_FALLBACK", "83.5"))
    return inr / rate
