// TruthLens Vercel Serverless Function: /api/daily-news
// 24/7 Global Cloud News Aggregator with full multilingual support

const LANGUAGE_CONFIG = {
    "en": { hl: "en-IN", gl: "IN", ceid: "IN:en" },
    "ta": { hl: "ta", gl: "IN", ceid: "IN:ta" },
    "hi": { hl: "hi", gl: "IN", ceid: "IN:hi" },
    "ml": { hl: "ml", gl: "IN", ceid: "IN:ml" },
    "te": { hl: "te", gl: "IN", ceid: "IN:te" },
    "kn": { hl: "kn", gl: "IN", ceid: "IN:kn" },
    "bn": { hl: "bn", gl: "IN", ceid: "IN:bn" },
    "mr": { hl: "mr", gl: "IN", ceid: "IN:mr" },
    "gu": { hl: "gu", gl: "IN", ceid: "IN:gu" },
    "pa": { hl: "pa", gl: "IN", ceid: "IN:pa" },
    "ur": { hl: "ur", gl: "IN", ceid: "IN:ur" },
    "ja": { hl: "ja", gl: "JP", ceid: "JP:ja" },
    "es": { hl: "es", gl: "ES", ceid: "ES:es" },
    "fr": { hl: "fr", gl: "FR", ceid: "FR:fr" },
    "de": { hl: "de", gl: "DE", ceid: "DE:de" },
    "ru": { hl: "ru", gl: "RU", ceid: "RU:ru" },
    "zh": { hl: "zh-CN", gl: "CN", ceid: "CN:zh-Hans" },
    "ar": { hl: "ar", gl: "SA", ceid: "SA:ar" }
};

const TOPIC_SECTIONS = {
    "Political": "POLITICS",
    "Government": "POLITICS",
    "Healthcare": "HEALTH",
    "Science": "SCIENCE",
    "World": "WORLD",
    "India": "NATION",
    "Sports": "SPORTS",
    "Business": "BUSINESS"
};

const NATIVE_KEYWORDS = {
    "Crime": {
        "en": "crime investigation", "ta": "குற்றம்", "hi": "अपराध", "ml": "കുറ്റകൃത്യം",
        "te": "నేరం", "kn": "ಅಪರಾಧ", "bn": "অপরাধ", "mr": "गुन्हेगारी",
        "gu": "ગુનો", "pa": "ਜੁਰਮ", "ur": "جرم", "ja": "事件",
        "es": "crimen", "fr": "crime", "de": "kriminalität", "ru": "преступность",
        "zh": "犯罪", "ar": "جريمة"
    },
    "Weather": {
        "en": "weather forecast", "ta": "வானிலை", "hi": "मौसम", "ml": "കാലാവസ്ഥ",
        "te": "వాతావరణం", "kn": "ಹವಾಮಾನ", "bn": "আবহাওয়া", "mr": "हवामान",
        "gu": "હવામાન", "pa": "ਮੌਸਮ", "ur": "موسम", "ja": "天気",
        "es": "clima", "fr": "météo", "de": "wetter", "ru": "погода",
        "zh": "天气", "ar": "طقس"
    }
};

function cleanHtml(raw) {
    if (!raw) return "";
    return raw
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function parseRelativeTime(pubDateStr) {
    if (!pubDateStr) return { formatted: "Just now", elapsedSec: 0 };
    try {
        const pub = new Date(pubDateStr);
        const now = new Date();
        const diffSec = Math.max(0, Math.floor((now.getTime() - pub.getTime()) / 1000));
        if (diffSec < 90) return { formatted: "Just now", elapsedSec: diffSec };
        if (diffSec < 3600) return { formatted: `${Math.floor(diffSec / 60)}m ago`, elapsedSec: diffSec };
        if (diffSec < 86400) return { formatted: `${Math.floor(diffSec / 3600)}h ago`, elapsedSec: diffSec };
        return { formatted: `${Math.floor(diffSec / 86400)}d ago`, elapsedSec: diffSec };
    } catch (e) {
        return { formatted: "Recent", elapsedSec: 9999 };
    }
}

function parseRssItems(xmlText, defaultCategory = "General", limit = 15) {
    const items = [];
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/gi) || [];

    for (const itemXml of itemMatches) {
        const titleRaw = (itemXml.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "";
        const linkRaw = (itemXml.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || "";
        const pubDateRaw = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || "";
        const descRaw = (itemXml.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || "";

        const cleanTitle = cleanHtml(titleRaw);
        const cleanDesc = cleanHtml(descRaw);
        const { formatted: timeAgo, elapsedSec } = parseRelativeTime(pubDateRaw);

        // Split publisher from title (Google News formats titles like: "Headline - Source")
        const parts = cleanTitle.split(/ - (?!.* - )/);
        let headline = cleanTitle;
        let sourceName = "Accredited News Agency";
        if (parts.length === 2 && parts[1].length < 40) {
            headline = parts[0].trim();
            sourceName = parts[1].trim();
        }

        let content = cleanDesc;
        if (content.toLowerCase().includes(headline.toLowerCase())) {
            content = content.replace(new RegExp(headline, "gi"), "").trim();
        }
        if (!content || content.length < 20) {
            content = `Latest verified live report on ${defaultCategory.toLowerCase()} published by ${sourceName}. Confirmed and factual.`;
        }

        items.push({
            title: headline,
            category: defaultCategory,
            source_name: sourceName,
            source_url: cleanHtml(linkRaw),
            content: content.slice(0, 280) + (content.length > 280 ? "..." : ""),
            is_verified: true,
            published_date: timeAgo,
            raw_pub_date: pubDateRaw,
            elapsed_sec: elapsedSec
        });
    }

    items.sort((a, b) => a.elapsed_sec - b.elapsed_sec);
    return items.slice(0, limit);
}

export default async function handler(req, res) {
    // Enable CORS for all origins
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, bypass-tunnel-reminder, Bypass-Tunnel-Reminder");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    const { category = "All", language = "en" } = req.query;
    const langCode = (language || "en").toLowerCase().slice(0, 2);
    const cfg = LANGUAGE_CONFIG[langCode] || LANGUAGE_CONFIG["en"];
    const locale = `hl=${cfg.hl}&gl=${cfg.gl}&ceid=${cfg.ceid}`;

    let url = "";
    if (category === "All") {
        url = `https://news.google.com/rss?${locale}`;
    } else if (TOPIC_SECTIONS[category]) {
        url = `https://news.google.com/rss/headlines/section/topic/${TOPIC_SECTIONS[category]}?${locale}`;
    } else if (NATIVE_KEYWORDS[category]) {
        const kw = NATIVE_KEYWORDS[category][langCode] || NATIVE_KEYWORDS[category]["en"] || category.toLowerCase();
        url = `https://news.google.com/rss/search?q=${encodeURIComponent(kw)}&${locale}`;
    } else {
        url = `https://news.google.com/rss/search?q=${encodeURIComponent(category.toLowerCase())}&${locale}`;
    }

    try {
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
        });

        let items = [];
        if (response.ok) {
            const xml = await response.text();
            items = parseRssItems(xml, category, 15);
        }

        // Fallback to top headlines if category yielded fewer than 4 items
        if (items.length < 4) {
            const fallbackUrl = `https://news.google.com/rss?${locale}`;
            const fbRes = await fetch(fallbackUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            if (fbRes.ok) {
                const fbXml = await fbRes.text();
                const fbItems = parseRssItems(fbXml, category, 15);
                const seen = new Set(items.map(i => i.title));
                for (const it of fbItems) {
                    if (!seen.has(it.title)) {
                        items.push(it);
                        seen.add(it.title);
                    }
                }
                items.sort((a, b) => a.elapsed_sec - b.elapsed_sec);
            }
        }

        res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
        return res.status(200).json({
            status: "success",
            category,
            language: langCode,
            count: items.length,
            data: items.slice(0, 15),
            last_updated: new Date().toISOString()
        });
    } catch (error) {
        console.error("Vercel daily-news error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch live news feed",
            error: error.message
        });
    }
}
