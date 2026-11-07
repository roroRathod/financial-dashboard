from fastapi import APIRouter
import feedparser

router = APIRouter()

RSS_FEEDS = {
    "Economic Times": "https://economictimes.indiatimes.com/markets/rssfeeds/1977029501.cms",
    "Moneycontrol": "https://www.moneycontrol.com/rss/marketnews.xml",
    "Business Standard": "https://www.business-standard.com/rss/markets-106.rss",
    "Livemint": "https://www.livemint.com/rss/markets",
}


def _parse_feed(name, url):
    try:
        d = feedparser.parse(url)
        items = []
        for e in d.entries[:8]:
            items.append({
                "title": e.get("title", ""),
                "link": e.get("link", ""),
                "published": e.get("published", ""),
                "summary": e.get("summary", "")[:300],
                "source": name,
            })
        return items
    except Exception:
        return []


@router.get("")
@router.get("/")
async def market_news():
    all_news = []
    for name, url in RSS_FEEDS.items():
        all_news.extend(_parse_feed(name, url))
    all_news.sort(key=lambda x: x["published"], reverse=True)
    items = all_news[:20]
    return {"news": items, "data": items}
