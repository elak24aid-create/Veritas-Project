// TruthLens Vercel Serverless Function: /api/history

let historyRecords = [
    {
        id: 1,
        input_type: "Text",
        content: "The Supreme Court judge says no amount of whatabouttery can justify the exclusion of voters...",
        prediction: "Real",
        probability: 91,
        credibility_score: 9.1,
        reasons: ["High objective reporting structure detected.", "Verified via accredited legal news databases."],
        timestamp: "2026-10-04"
    },
    {
        id: 2,
        input_type: "Text",
        content: "Joseph Vijay is the CM of Tamilnadu",
        prediction: "Fake",
        probability: 95,
        credibility_score: 1.2,
        reasons: ["Official government gazette cross-verification confirms current CM is M. K. Stalin."],
        timestamp: "2026-10-04"
    },
    {
        id: 3,
        input_type: "URL",
        content: "https://www.ajc.com/news/2026/10/bosnia-votes-as-pro-russian-politician-looms-large",
        prediction: "Real",
        probability: 87,
        credibility_score: 8.7,
        reasons: ["URL belongs to accredited journalism network.", "Cross-referenced with live European election wire reports."],
        timestamp: "2026-10-04"
    }
];

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, bypass-tunnel-reminder, Bypass-Tunnel-Reminder");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    if (req.method === "DELETE") {
        historyRecords = [];
        return res.status(200).json({ status: "success", message: "History cleared" });
    }

    if (req.method === "POST") {
        const item = req.body || {};
        item.id = Date.now();
        item.timestamp = new Date().toISOString().slice(0, 10);
        historyRecords.unshift(item);
        return res.status(200).json({ status: "success", data: item });
    }

    return res.status(200).json({
        status: "success",
        count: historyRecords.length,
        data: historyRecords
    });
}
