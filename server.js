const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/api/track', async (req, res) => {
    const d = req.body;
    console.log('✅ Tracking:', d.visitorId, d.walletAddress || 'no wallet');

    if (!BOT_TOKEN || !CHAT_ID) {
        console.log('❌ Missing TELEGRAM_BOT_TOKEN or CHAT_ID');
        return res.json({ ok: false, error: 'telegram not configured' });
    }

    const msg = `👤 *Visitor*\n🆔 ${d.visitorId}\n🌐 IP: ${d.ip}\n📍 ${d.pageUrl}\n💰 Wallet: ${d.walletAddress || 'not connected'}\n🕒 ${d.timestamp}`;
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const r = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: CHAT_ID, text: msg, parse_mode: 'Markdown' })
        });
        const json = await r.json();
        if (!json.ok) throw new Error(JSON.stringify(json));
        console.log('📨 Telegram sent');
        res.json({ ok: true });
    } catch (err) {
        console.error('Telegram error:', err.message);
        res.json({ ok: false, error: err.message });
    }
});

app.get('/', (req, res) => res.send('Tracking API alive'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
