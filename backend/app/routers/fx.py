from fastapi import APIRouter
from app.services.client import quote, history

router = APIRouter()

FX_PAIRS = {
    "USD/INR": "INR=X",
    "EUR/INR": "EURINR=X",
    "GBP/INR": "GBPINR=X",
    "JPY/INR": "JPYINR=X",
    "Dollar Index": "DX-Y.NYB",
    "EUR/USD": "EURUSD=X",
}


@router.get("")
@router.get("/")
async def list_fx():
    result = {}
    for name, ticker in FX_PAIRS.items():
        q = quote(ticker)
        if q:
            result[name] = q
    return {"fx": result, "data": result}


@router.get("/{name}")
async def fx_detail(name: str):
    if name not in FX_PAIRS:
        return {"error": "not found"}
    ticker = FX_PAIRS[name]
    return {"ticker": ticker, "quote": quote(ticker), "history": history(ticker)}
