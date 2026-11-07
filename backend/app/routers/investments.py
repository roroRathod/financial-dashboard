from fastapi import APIRouter
from pydantic import BaseModel
import json
import os

router = APIRouter()
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "investments.json")


class Investment(BaseModel):
    ticker: str
    name: str
    avg_price: float
    qty: float
    asset_class: str = "equity"


def _load():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE) as f:
        return json.load(f)


def _save(items):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(items, f, indent=2)


@router.get("")
@router.get("/")
async def list_investments():
    return _load()


@router.post("")
@router.post("/")
async def add_investment(inv: Investment):
    items = _load()
    items.append(inv.model_dump())
    _save(items)
    return {"status": "added"}


@router.delete("/{ticker}")
async def remove_investment(ticker: str):
    items = [i for i in _load() if i["ticker"] != ticker]
    _save(items)
    return {"status": "removed"}
