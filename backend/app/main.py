from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from app.routers import markets, commodities, fx, screener, news, ai, investments, ai_ecosystem

app = FastAPI(title="Market Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(markets.router, prefix="/markets", tags=["markets"])
app.include_router(commodities.router, prefix="/commodities", tags=["commodities"])
app.include_router(fx.router, prefix="/fx", tags=["fx"])
app.include_router(screener.router, prefix="/screener", tags=["screener"])
app.include_router(news.router, prefix="/news", tags=["news"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(ai_ecosystem.router, prefix="/ai-ecosystem", tags=["ai-ecosystem"])
app.include_router(investments.router, prefix="/investments", tags=["investments"])


@app.get("/health")
async def health():
    return {"status": "ok"}
