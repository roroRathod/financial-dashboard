from fastmcp import FastMCP
from app.routers import markets, commodities, fx, screener, news

mcp = FastMCP("market-dashboard")


@mcp.tool()
def get_market_summary(region: str = "INDIA"):
    return markets.region_markets(region)


@mcp.tool()
def get_commodity_prices():
    return commodities.list_commodities()


@mcp.tool()
def get_fx_rates():
    return fx.list_fx()


@mcp.tool()
def get_screener():
    return screener.screener()


@mcp.tool()
def get_market_news():
    return news.market_news()


if __name__ == "__main__":
    mcp.run(transport="streamable-http", host="0.0.0.0", port=8001)
