// TruthLens Vercel Serverless Function: /api/auth (Login & Registration)

export default function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, bypass-tunnel-reminder, Bypass-Tunnel-Reminder");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    let body = req.body || {};
    if (typeof body === "string") {
        try { body = JSON.parse(body); } catch (e) {}
    }

    const username = (body.username || "elak24aid").trim();

    return res.status(200).json({
        status: "success",
        access_token: "truthlens_cloud_token_" + Buffer.from(username).toString("base64"),
        token_type: "bearer",
        username: username,
        role: "admin",
        message: "Logged in successfully to TruthLens Cloud"
    });
}
