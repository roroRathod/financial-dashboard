# roro. Financial Dashboard

A modern, high-performance financial dashboard featuring real-time Indian & global market indices, commodities, currency parity, dynamic heatmap treemaps, technical candlestick charts with AI/heuristic pattern recognition, and live world clocks.

![Dashboard Preview](frontend/public/favicon.ico)

---

## ✨ Features

- **Global Market Coverage**: Real-time quotes and multi-timeframe returns (`1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`) for India (NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, INDIA VIX), US (S&P 500, NASDAQ 100, DOW JONES), and Asian markets.
- **AI Supercycle Tab**: Curated intelligence and tracking across foundational AI pillars (Compute & Silicon, Hyperscalers, AI Software, Energy & Cooling).
- **Two-Tier Heatmap Treemap**: Squarified index visualization grouped by sector and market cap with live market hours status badges.
- **Technical Candlestick (OHLC) Charts**: Interactive SVG candlesticks, interactive Support & Resistance markup lines, and hybrid AI + Heuristic pattern detection (Doji, Hammer, Engulfing, Marubozu).
- **Institutional News & SWOT Synthesis**: Real-time financial RSS aggregation and LLM-powered SWOT analysis with fallback heuristics.
- **World Clocks**: Live analog clock faces for Mumbai (IST), New York (ET), London (GMT), and Tokyo (JST) with interactive hover timecards and market session indicators.
- **Portfolio & Watchlist**: Semantic stock search, automatic price population, and valuation tracking.
- **Unslop Design System**: Strict geometric typography, 4/8/16/24/32px spacing scale, and warm beige off-white (`#f7f5ef`) & deep slate (`#090d16`) theme modes.

---

## 🏗️ Architecture

```
┌───────────────────────────────────────┐
│     Frontend (React + Vite + TS)      │
│     Hosted on GitHub Pages / Static   │
└──────────────────┬────────────────────┘
                   │ HTTPS / Tailscale
                   ▼
┌───────────────────────────────────────┐
│       Backend (FastAPI + Uvicorn)     │
│   - In-Memory TTLCache (60s)          │
│   - Yahoo Finance API Engine          │
│   - OpenAI-Compatible LLM Proxy       │
│   - RSS Feed Aggregator               │
└───────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173).

---

## 🐳 Docker Deployment

### Run with Docker Compose

```bash
docker compose up -d --build
```

---

## 🔒 Security & Privacy

- **Zero Client Key Exposure**: All LLM API keys and private provider endpoints reside strictly server-side in `backend/.env`.
- **Private Tailscale Mesh**: When deployed on private Tailscale networks, the backend is completely invisible to the public internet.
- **Strict Validation**: All endpoints enforce Pydantic type validation to prevent injection vulnerabilities.

---

## 📄 License

MIT License. Free for personal and educational use.
