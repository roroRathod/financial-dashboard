import socket
import os

# Prefer IPv4 DNS lookups to prevent IPv6 routing blackholes on Linux/Raspberry Pi
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4_preferred(host, port, family=0, type=0, proto=0, flags=0):
    try:
        res = orig_getaddrinfo(host, port, family, type, proto, flags)
        return sorted(res, key=lambda x: 0 if x[0] == socket.AF_INET else 1)
    except Exception:
        return orig_getaddrinfo(host, port, family, type, proto, flags)
socket.getaddrinfo = getaddrinfo_ipv4_preferred
socket.setdefaulttimeout(4.0)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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


# Serve built frontend if dist directory exists
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend_dist")
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="static")

