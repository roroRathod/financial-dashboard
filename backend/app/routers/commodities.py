from fastapi import APIRouter
from app.services.client import quote, history
from app.services.converter import USD_INR_TICKER
from app.services.ibja import fetch_ibja_rates

router = APIRouter()

COMMODITIES_CONFIG = {
    "Gold": {
        "ticker": "GC=F",
        "has_ibja": True,
        "calc": lambda usd, rate, ibja: {
            "inr_price": ibja["karats"]["24K"]["price_per_g"],
            "inr_unit": "₹ / g",
            "inr_sub": ibja["karats"]["24K"]["sub"],
            "usd_price": round(usd, 2),
            "usd_unit": "$ / oz",
            "usd_sub": "$ per troy ounce (COMEX Spot)",
            "karats": ibja["karats"],
            "benchmark": "IBJA Benchmark (Mumbai Zaveri Bazar) & MCX",
        },
    },
    "Silver": {
        "ticker": "SI=F",
        "has_ibja": True,
        "calc": lambda usd, rate, ibja: {
            "inr_price": round(ibja["silver_999"] / 1000, 2),
            "inr_unit": "₹ / g",
            "inr_sub": f"₹{ibja['silver_999']:,} per 1kg (IBJA / MCX Silver 999)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / oz",
            "usd_sub": "$ per troy ounce (COMEX Spot)",
            "benchmark": "IBJA Benchmark (Mumbai) & MCX",
        },
    },
    "Crude Oil": {
        "ticker": "CL=F",
        "calc": lambda usd, rate, ibja: {
            "inr_price": round(usd * rate, 2),
            "inr_unit": "₹ / barrel",
            "inr_sub": f"₹{round((usd * rate) / 158.987, 2)} / litre (MCX Domestic Benchmark)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / bbl",
            "usd_sub": "$ per 42-gal barrel (NYMEX WTI)",
            "benchmark": "MCX Crude Oil Contract",
        },
    },
    "Natural Gas": {
        "ticker": "NG=F",
        "calc": lambda usd, rate, ibja: {
            "inr_price": round(usd * rate, 2),
            "inr_unit": "₹ / MMBtu",
            "inr_sub": f"₹{round((usd * rate) / 28.3, 2)} / SCM (MCX Domestic Piped)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / MMBtu",
            "usd_sub": "$ per million BTU (Henry Hub)",
            "benchmark": "MCX Natural Gas Contract",
        },
    },
    "Copper": {
        "ticker": "HG=F",
        "calc": lambda usd, rate, ibja: {
            "inr_price": round((usd / 0.45359237) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": "MCX Benchmark Lot (2,500 kg)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / lb",
            "usd_sub": "$ per pound (COMEX)",
            "benchmark": "MCX Copper Contract",
        },
    },
    "Aluminium": {
        "ticker": "ALI=F",
        "calc": lambda usd, rate, ibja: {
            "inr_price": round((usd / 1000) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": f"₹{round(usd * rate):,} per metric tonne (MCX Lot)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / tonne",
            "usd_sub": "$ per metric tonne (LME)",
            "benchmark": "MCX Aluminium Contract",
        },
    },
    "Zinc": {
        "ticker": "ZINC=F",
        "calc": lambda usd, rate, ibja: {
            "inr_price": round((usd / 1000) * rate, 2),
            "inr_unit": "₹ / kg",
            "inr_sub": f"₹{round(usd * rate):,} per metric tonne (MCX Lot)",
            "usd_price": round(usd, 2),
            "usd_unit": "$ / tonne",
            "usd_sub": "$ per metric tonne (LME)",
            "benchmark": "MCX Zinc Contract",
        },
    },
}


@router.get("")
@router.get("/")
async def list_commodities():
    fx_q = quote(USD_INR_TICKER)
    rate = fx_q["price"] if fx_q and fx_q.get("price") else 93.5
    ibja = fetch_ibja_rates()

    result = {}
    for name, conf in COMMODITIES_CONFIG.items():
        ticker = conf["ticker"]
        q = quote(ticker)
        if not q:
            continue

        raw_usd = q["price"]
        rates = conf["calc"](raw_usd, rate, ibja)

        item = {
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

        if "karats" in rates:
            item["karats"] = rates["karats"]
            item["inr"]["karats"] = rates["karats"]
        if "benchmark" in rates:
            item["benchmark"] = rates["benchmark"]
            item["inr"]["benchmark"] = rates["benchmark"]

        result[name] = item

    return {"commodities": result, "data": result, "ibja": ibja}


@router.get("/{name}")
async def commodity_detail(name: str):
    if name not in COMMODITIES_CONFIG:
        return {"error": "not found"}
    conf = COMMODITIES_CONFIG[name]
    ticker = conf["ticker"]
    fx_q = quote(USD_INR_TICKER)
    rate = fx_q["price"] if fx_q and fx_q.get("price") else 93.5
    ibja = fetch_ibja_rates()
    q = quote(ticker)
    if not q:
        return {"error": "quote unavailable"}
    rates = conf["calc"](q["price"], rate, ibja)
    resp = {
        "name": name,
        "ticker": ticker,
        "inr": rates,
        "usd": rates,
        "periods": q.get("periods", {}),
        "quote": q,
        "history": history(ticker),
    }
    if "karats" in rates:
        resp["karats"] = rates["karats"]
    return resp
