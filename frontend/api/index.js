// TruthLens Vercel Serverless Function: Root Health & Status Check

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, bypass-tunnel-reminder, Bypass-Tunnel-Reminder");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    return res.status(200).json({
        message: "TruthLens API is running",
        app: "TruthLens",
        version: "2.5",
        status: "online",
        cloud: "Vercel Edge Global Network"
    });
}
