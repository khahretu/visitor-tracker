const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

app.post('/api/track', async (req, res) => {
    const data = req.body;
    console.log('📥 Received:', data.visitorId, data.walletAddress);

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('❌ Telegram env missing');
        return res.json({ status: 'error', reason: 'telegram_not_configured' });
    }

    const message = `👤 Visitor\nID: ${data.visitorId}\nIP: ${data.ip}\nPage: ${data.pageUrl}\nWallet: ${data.walletAddress || 'no'}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message })
        });
        const json = await resp.json();
        if (!json.ok) {
            console.error('❌ Telegram error:', json);
            return res.json({ status: 'error', telegram: json });
        }
        console.log('✅ Telegram sent');
        res.json({ status: 'ok', telegram: 'sent' });
    } catch (err) {
        console.error('❌ Fetch failed:', err);
        res.json({ status: 'error', message: err.message });
    }
});

app.get('/', (req, res) => res.send('OK'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
