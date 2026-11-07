from fastapi import APIRouter
from app.services.client import quote, history
from app.services.converter import usd_to_inr, USD_INR_TICKER

router = APIRouter()

COMMODITIES_CONFIG = {
    "Gold": {
        "ticker": "GC=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 31.1034768) * rate * 1.09, 2),
            "inr_unit": "₹ / g",
            "inr_sub": f"₹{round((usd / 31.1034768) * rate * 1.09 * 10):,} per 10g",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / oz",
            "usd_sub": "$ per troy ounce",
        },
    },
    "Silver": {
        "ticker": "SI=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 0.0311034768) * rate * 1.09, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": f"₹{round((usd / 31.1034768) * rate * 1.09 * 10):,} per 10g",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / oz",
            "usd_sub": "$ per troy ounce",
        },
    },
    "Copper": {
        "ticker": "HG=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 0.45359237) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": "Domestic industrial rate",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / lb",
            "usd_sub": "$ per pound",
        },
    },
    "Aluminium": {
        "ticker": "ALI=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 1000) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": f"₹{round((usd) * rate):,} per tonne",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / tonne",
            "usd_sub": "$ per metric tonne",
        },
    },
    "Zinc": {
        "ticker": "ZINC=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 1000) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": f"₹{round((usd) * rate):,} per tonne",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / tonne",
            "usd_sub": "$ per metric tonne",
        },
    },
    "Crude Oil WTI": {
        "ticker": "CL=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 42) * rate, 2),
            "inr_unit": "₹ / gallon",
            "inr_sub": f"₹{round((usd / 158.987) * rate, 2)} / litre",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / bbl",
            "usd_sub": "$ per 42-gal barrel",
        },
    },
    "Crude Oil Brent": {
        "ticker": "BZ=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 42) * rate, 2),
            "inr_unit": "₹ / gallon",
            "inr_sub": f"₹{round((usd / 158.987) * rate, 2)} / litre",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / bbl",
            "usd_sub": "$ per 42-gal barrel",
        },
    },
    "Natural Gas": {
        "ticker": "NG=F",
        "calc": lambda usd, rate: {
            "inr_price": round((usd / 12.11) * rate, 2),
            "inr_unit": "₹ / gallon",
            "inr_sub": f"₹{round(usd * rate, 2)} / MMBtu",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / MMBtu",
            "usd_sub": "$ per million BTU",
        },
    },
}


@router.get("")
@router.get("/")
async def list_commodities():
    fx_q = quote(USD_INR_TICKER)
    rate = fx_q["price"] if fx_q and fx_q.get("price") else 93.5

    result = {}
    for name, conf in COMMODITIES_CONFIG.items():
        ticker = conf["ticker"]
        q = quote(ticker)
        if not q:
            continue

        raw_usd = q["price"]
        rates = conf["calc"](raw_usd, rate)

        result[name] = {
            "name": name,
            "ticker": ticker,
            "inr": {
                "price": rates["inr_price"],
                "unit": rates["inr_unit"],
                "sub": rates["inr_sub"],
            },
            "usd": {
                "price": rates["usd_price"],
                "unit": rates["usd_unit"],
                "sub": rates["usd_sub"],
            },
            "change": q["change"],
            "change_pct": q["change_pct"],
            "periods": q.get("periods", {}),
            "changes": q.get("changes", {}),
            "high": q.get("high"),
            "low": q.get("low"),
            "open": q.get("open"),
            "volume": q.get("volume"),
            "history": history(ticker),
        }

    return {"commodities": result, "data": result}


@router.get("/{name}")
async def commodity_detail(name: str):
    if name not in COMMODITIES_CONFIG:
        return {"error": "not found"}
    conf = COMMODITIES_CONFIG[name]
    ticker = conf["ticker"]
    fx_q = quote(USD_INR_TICKER)
    rate = fx_q["price"] if fx_q and fx_q.get("price") else 93.5
    q = quote(ticker)
    if not q:
        return {"error": "quote unavailable"}
    rates = conf["calc"](q["price"], rate)
    return {
        "name": name,
        "ticker": ticker,
        "inr": rates,
        "usd": rates,
        "periods": q.get("periods", {}),
        "quote": q,
        "history": history(ticker),
    }
