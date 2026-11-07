# roro. Financial Dashboard

> **Institutional-grade, real-time market intelligence cockpit with India at the centre.**  
> Built for serious investors, traders, and macro researchers tracking Indian equities, global indices, commodities in dual currency parity, FX benchmarks, and the AI hardware supercycle.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Dashboard-10b981?style=for-the-badge&logo=github)](https://rororathod.github.io/financial-dashboard/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Uvicorn-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20TS-61DAFB?style=for-the-badge&logo=react)](https://react.dev)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Dashboards & Views](#-dashboards--views)
- [Key Performance Indicators (KPIs) & Metrics](#-key-performance-indicators-kpis--metrics)
- [AI Intelligence Engine (BYOK — Bring Your Own Key)](#-ai-intelligence-engine-byok--bring-your-own-key)
- [Compatible Models Matrix](#-compatible-models-matrix)
- [Local Setup & Development Guide](#-local-setup--development-guide)
- [Docker Deployment](#-docker-deployment)
- [🔮 Future Roadmap & Feature Checklist](#-future-roadmap--feature-checklist)
- [🤝 Contributing](#-contributing)
- [Security Engineering](#-security-engineering)

---

## 🧭 Overview

The **roro. Financial Dashboard** is engineered to eliminate noise and deliver high-density financial data. Unlike retail stock trackers, it integrates domestic Indian indices (NSE & BSE) side-by-side with US bellwethers, global macro drivers, physical commodity markets priced in Indian Rupees (₹) and US Dollars ($), and dedicated tracking of the semiconductor supply chain fueling the AI revolution.

### Core Philosophy:
1. **India-First Global Macro**: Indian market participants need domestic quotes (NIFTY, SENSEX, BANK NIFTY, INDIA VIX) synchronized with global market hours, overnight US flows, and international commodity parities.
2. **Speed & Zero-Token Resilience**: Full institutional synthesis is available with external LLMs, but if disabled or offline, a deterministic **Heuristic Pattern & News Engine** provides instant analysis with **zero external API calls**.
3. **Strict Visual Discipline**: Adheres to the **Unslop design system** — high-contrast typography, strict 4px grid spacing, no garish AI gradients or useless glowing animations, and clean warm light (`#f7f5ef`) / deep slate dark (`#090d16`) themes.

---

## 📊 Dashboards & Views

The platform includes six dedicated modules accessible from the navigation bar:

### 1. Markets Dashboard (`/markets`)
- **Domestic & International Indices**: Real-time quotes and multi-timeframe percentage changes for India (`NIFTY 50`, `SENSEX`, `BANK NIFTY`, `NIFTY IT`, `INDIA VIX`), US (`S&P 500`, `NASDAQ 100`, `DOW JONES`), and Asian markets (`NIKKEI 225`, `HANG SENG`).
- **Interactive Timeframe Engine**: Instant toggle across `1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, and `1Y` performance windows.
- **Foreign Exchange & Spot Macro Benchmarks**: Real-time currency parity tracking (`USD/INR`, `EUR/INR`, `GBP/INR`, `JPY/INR`, `Dollar Index DXY`, `EUR/USD`).
- **Live News Dispatches**: Filtered RSS news wire from verified institutional publications (Livemint, Economic Times, Reuters, Bloomberg).

### 2. AI Silicon & Supercycle Universe (`/ai-ecosystem`)
- **Executive Supercycle Briefing**: Real-time synthesized macro dispatch analyzing data center capex, power bottlenecks, GPU supply, and hyperscaler investments.
- **Dedicated Industry Pillar Tracking**:
  - **Semiconductors & Lithography**: NVIDIA, TSMC, AMD, Broadcom, ASML, Qualcomm, ARM, Micron.
  - **Hyperscalers & Frontier Labs**: Microsoft, Alphabet/Google DeepMind, Amazon AWS, Meta.
  - **AI Enterprise & Software**: Palantir, Snowflake, Oracle, ServiceNow.
  - **Data Center Power, Cooling & Infrastructure**: Vertiv, Eaton, Constellation Energy, Vistra, Schneider Electric.
  - **Server & IT OEMs**: Dixon Technologies, Netweb Technologies, Tata Elxsi, L&T Technology.
- **Dispatches Stream**: Categorized live feed covering Model Releases, Cybersecurity & Vulnerabilities, and Grid Infrastructure Capex.

### 3. Dynamic Heatmap Treemap (`/heatmap`)
- **Two-Tier Squarified Treemap**: Visual representation of index constituents sized proportionally by market capitalization or volume.
- **Color Discipline**: Normalized institutional spectrum (emerald green for gainers, ruby red for losers) with configurable index universes (`NIFTY 50`, `BANK NIFTY`, `S&P 500`, etc.).
- **Live Session Status**: Automatic market schedule badges (Open, Closed, Pre-market) for NSE/BSE and NYSE based on local exchange timezones.

### 4. Institutional Screener Tape (`/screener`)
- Comprehensive market scanner with multi-attribute filtering:
  - **Top Gainers & Losers** across session and macro timeframes.
  - **Volume Shockers**: Equities trading at 2x+ their 20-day moving average volume.
  - **52-Week Highs / Lows Breakouts**: Real-time proximity radar to institutional support and resistance benchmarks.
  - **Sector Breakdown & Point Impact**: Calculates the point contribution of key heavyweights to the headline index move.

### 5. Physical Commodities Hub (`/commodities`)
- **Dual Currency & Unit Conversion**: Real-time physical commodity spot pricing automatically converted using live USD/INR exchange rates and domestic import duties:
  - **Gold**: Priced in both **₹ / gram** (with ₹ per 10g consumer parity) and **$ / troy ounce**.
  - **Silver**: Priced in both **₹ / kg** and **$ / troy ounce**.
  - **Crude Oil (Brent & WTI)**: Priced in **₹ / barrel** and **$ / barrel**.
  - **Natural Gas**: Priced in **₹ / MMBtu** and **$ / MMBtu**.
  - **Copper**: Priced in **₹ / kg** and **$ / lb**.
- **Historical Sparklines**: 30-day mini-charts illustrating volatility and range expansion.

### 6. Portfolio & Watchlist Tracker (`/portfolio`)
- Real-time personal asset tracker storing entries in browser storage.
- Tracks quantity, average buy price, current valuation, unrealized P&L (₹ and %), and session change.
- One-click asset addition using global ticker search.

### 7. Interactive Asset Detail Modal & Candlestick Workspace
- **Candlestick (OHLC) Chart**: High-resolution SVG candlestick chart supporting zoom, pan, and cursor price crosshairs.
- **Chart Markup Engine**: Click-to-draw persistent **Support** and **Resistance** horizontal ray lines with instant price snapping.
- **Pattern Recognition Engine**: Identifies institutional candlestick formations (e.g., *Doji consolidation*, *Bullish Hammer*, *Bearish Engulfing*, *Marubozu trend acceleration*).
- **Fundamental SWOT Matrix**: Structured 4-quadrant fundamental analysis card evaluating **Strengths**, **Weaknesses**, **Opportunities**, and **Threats**.

### 8. World Market Clocks (`WorldClockHeader`)
- Live analog clocks with animated second hands and digital hover flyouts for key financial capitals:
  - **Mumbai (IST - UTC+5:30)**: NSE / BSE session tracker.
  - **New York (ET - UTC-5:00)**: NYSE / NASDAQ session tracker.
  - **London (GMT - UTC+0:00)**: LSE session tracker.
  - **Tokyo (JST - UTC+9:00)**: TSE session tracker.
- Automatic active session indicators (Green dot = Trading Floor Open; Gray dot = Market Closed).

---

## 📈 Key Performance Indicators (KPIs) & Metrics

| Category | KPI / Metric | Description & Calculation |
| :--- | :--- | :--- |
| **Equities & Indices** | `Price & LTP` | Last Traded Price in native currency (INR for NSE/BSE, USD for US). |
| | `Multi-Period Returns` | Normalized percentage performance over `1D`, `1W`, `1M`, `3M`, `6M`, `YTD`, `1Y`. |
| | `Point Impact` | Index weight × percentage change, showing exact point drag or push on NIFTY/SENSEX. |
| | `Volume Multiplier` | Current session volume vs. 20-day moving average volume to detect institutional accumulation. |
| | `52-Week Range` | Current price position relative to 52-week high and 52-week low. |
| **Risk & Volatility** | `India VIX` | NSE Volatility Index measuring 30-day expected market annualized volatility. |
| | `Dollar Index (DXY)` | Relative strength of USD against a basket of 6 major foreign currencies. |
| **Commodities** | `Dual Currency Parity` | Real-time formula mapping international futures (e.g. `GC=F`) + customs duty + `USD/INR` spot rate. |
| | `Physical Unit Conversion` | Automatic mathematical transformation from imperial Troy Ounces/Barrels to metric Grams/Kilograms. |
| **Technical Analysis** | `Pivot Support / Resistance` | Automatically computed pivot levels based on 30-period high/low extremes. |
| | `Candlestick Geometry` | Ratio of upper wick, body size, and lower wick determining session absorption or rejection. |
| **Portfolio** | `Unrealized P&L` | `(Current Price - Average Buy Price) × Quantity` in absolute currency and percentage. |

---

## 🤖 AI Intelligence Engine (BYOK — Bring Your Own Key)

The dashboard features an enterprise-grade AI synthesis pipeline that operates under a **BYOK (Bring Your Own Key)** architecture. No proprietary or closed AI endpoints are hardcoded; you have complete freedom over your inference provider.

### Configuration
In your `backend/.env` file:
```env
OPENAI_API_BASE={your_endpoint_or_ip}
OPENAI_API_KEY={your_api_key}
OPENAI_MODEL={your_model_name}
```

### Master AI Toggle `[✨ AI: ON / OFF]`
Located prominently in the top header, inside the asset detail modal, and in the AI Supercycle tab:

- **When AI is ON**:
  - The backend constructs structured prompts containing live prices, timeframe returns, and parsed financial headlines.
  - Queries your configured BYOK endpoint to generate institutional summaries, reasons for price moves, and fundamental SWOT matrices.
  - Badge displays: `AI LLM (<model>) + Live News Wire`.

- **When AI is OFF (Instant Heuristic Mode)**:
  - **Zero External API Tokens**: Completely skips network calls to external LLM providers.
  - **Instant Execution (<10ms)**: Immediately uses the deterministic **Heuristic Pattern & News Synthesis Engine**.
  - Generates catalyst reasons, identifies candlestick geometry, and constructs fundamental SWOT vectors algorithmically.
  - Badge displays: `Heuristic News Synthesis Engine (Zero API Tokens)`.
  - Your state preference is remembered across sessions via `localStorage`.

---

## 🧩 Compatible Models Matrix

The table below lists compatible models for the BYOK engine, including baseline capability requirements and minimum recommended parameter counts for self-hosted / open-source deployments.

| Provider / Family | Base Requirement (Minimum) | Recommended Tier (Institutional Quality) | Min Parameters | JSON Mode / Schema Adherence |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `gpt-4o-mini` | `gpt-4o`, `o1-mini`, `o3-mini` | N/A (Cloud) | Native JSON Schema / Strict |
| **Anthropic / Claude** | `claude-3-5-haiku` | `claude-3-5-sonnet`, `claude-3-7-sonnet` | N/A (Cloud) | High |
| **Google / Gemini** | `gemini-1.5-flash`, `gemini-2.0-flash` | `gemini-1.5-pro` | N/A (Cloud) | Native Structured Outputs |
| **DeepSeek & East Asian** | `deepseek-chat` (V3) | `deepseek-r1`, `qwen-2.5-72b-instruct`, `glm-4-plus` | ~67B+ MoE | High |
| **Meta Llama (Open-Source)** | `Llama-3.1-8B-Instruct` | `Llama-3.3-70B-Instruct` | **8B min** (70B recommended) | Requires prompt constraint |
| **Alibaba Qwen (Open-Source)**| `Qwen2.5-14B-Instruct` | `Qwen2.5-32B-Instruct`, `Qwen2.5-72B` | **14B min** (32B recommended) | Excellent structured JSON |
| **Mistral (Open-Source)** | `Mistral-7B-Instruct-v0.3` | `Mistral-Small-24B-Instruct`, `Codestral` | **7B min** (24B recommended) | Built-in JSON format support |

> [!TIP]
> **Self-Hosting / Local Inference Recommendation**:  
> For running locally via **Ollama**, **vLLM**, or **LM Studio**, models with at least **14B to 32B parameters** (e.g. `qwen2.5:32b` or `llama3.3:70b-q4_K_M`) produce significantly more reliable SWOT matrices and deeper catalyst explanations than 8B models.

---

## 💻 Local Setup & Development Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/roroRathod/financial-dashboard.git
cd financial-dashboard
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
```

Edit `backend/.env` with your settings:
```env
# Server Configuration
PORT=8000
CACHE_TTL_SECONDS=300

# BYOK AI Configuration
OPENAI_API_BASE={your_endpoint_or_ip}
OPENAI_API_KEY={your_api_key}
OPENAI_MODEL={your_model_name}
```

Start the backend:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The API documentation is accessible at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

You can run the backend as a lightweight Docker container on any machine or server:

```bash
cd backend

# Build Docker image
docker build -t financial-dashboard-backend:latest .

# Run container
docker run -d \
  --name financial-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  financial-dashboard-backend:latest
```

---

## 🔮 Future Roadmap & Feature Checklist

We welcome community collaboration to expand the analytical depth of the dashboard. Below is our upcoming milestone checklist:

- [ ] **Balance Sheet Extraction & AI Health Audit**:
  - Automated retrieval of annual and quarterly financial statements (Total Debt, Cash & Equivalents, Free Cash Flow, Debt-to-Equity, Operating Margins).
  - AI engine synthesizes raw balance sheet metrics alongside breaking company news to explain financial health in plain, institutional English.
- [ ] **Earnings Call & Performance Dissection**:
  - Automated transcript summarization of quarterly earnings calls, guidance revisions, management commentary, and revenue/EBITDA beats & misses contextualized against market reactions.
- [ ] **Context-Augmented Financial Assistant / FAQ Chatbot (AI Feature)**:
  - An embedded, lightweight interactive financial copilot.
  - **Page-Aware Augmentation**: When opened, the assistant automatically knows your active view (e.g., inspecting a specific stock's Candlestick modal, viewing the Screener, or scanning Commodities) so you can ask *"Why is this dipping today?"* or *"Explain this debt ratio"* without manual context copying.
- [ ] **Multi-Factor Trend Analysis & Forward Projections (AI Feature)**:
  - Advanced forward-looking scenario modeling blending balance sheet health, earnings call guidance, technical pivot geometry, and macroeconomic news wire catalysts.
  - Generates probabilistic trend outlooks backed by transparent, step-by-step institutional reasoning.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### ⚠️ Protected Main Branch Notice
> **Important**: Direct pushes to the `main` branch are strictly prohibited. All changes must be submitted via **Fork and Pull Request (PR)** for review and CI verification.

### Submission Steps:
1. **Fork the Project** by clicking the Fork button at the top right of this repository.
2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/financial-dashboard.git
   cd financial-dashboard
   ```
3. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/YourFeatureName
   ```
4. **Commit your Changes**:
   ```bash
   git commit -m "feat: implement Balance Sheet extraction"
   ```
5. **Push to your Branch**:
   ```bash
   git push origin feature/YourFeatureName
   ```
6. **Open a Pull Request**:
   - Go to your fork on GitHub and click **Compare & pull request**.
   - Provide a clear summary of your changes and test coverage.
   - Ensure strictly **zero secrets, credentials, or private host addresses** are committed.

---

## 🔒 Security Engineering

1. **Zero Secret Leakage**:
   - The public GitHub repository contains **strictly zero** API keys, passwords, or personal host addresses.
   - All credentials and environment configuration files (`.env`) are excluded via `.gitignore`.
2. **CORS & Preflight Compliance**:
   - Implements full cross-origin resource sharing headers allowing only your configured frontend origin or local development instances.
3. **Pydantic Validation**:
   - All incoming API requests are strongly typed and sanitized against injection vulnerabilities.

---

## 📜 License

Distributed under the **MIT License**. Free for personal, academic, and non-commercial development.
Market data sourced via public quote endpoints for analytical and educational use.
