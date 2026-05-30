// server.js – Deploy as a standalone Node.js server
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// ========== CONFIGURATION ==========
const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN';      // CHANGE
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID';          // CHANGE
const LOG_FILE = path.join(__dirname, 'visitors.json');
// ===================================

// Send message to Telegram
async function sendToTelegram(text) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' })
        });
    } catch(e) { console.error('Telegram error', e); }
}

// Format tracking data into readable message
function formatMessage(data) {
    return `
👤 <b>New Visitor</b>
🆔 ID: ${data.visitorId}
🌐 IP: ${data.ip}
🖥️ Device: ${data.userAgent.substring(0, 80)}
📍 Page: ${data.pageUrl}
🔗 Referrer: ${data.referrer}
💰 Wallet: ${data.walletAddress || '<i>not connected</i>'}
🏷️ ExogatorID: ${data.exogatorId || 'none'}
🕒 Time: ${data.timestamp}
📱 Screen: ${data.screenSize}
    `;
}

// Save to JSON file (for later analysis)
function saveToFile(data) {
    let existing = [];
    if (fs.existsSync(LOG_FILE)) {
        existing = JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
    }
    existing.push(data);
    fs.writeFileSync(LOG_FILE, JSON.stringify(existing, null, 2));
}

// API endpoint
app.post('/api/track', async (req, res) => {
    const data = req.body;
    console.log('Tracking:', data.visitorId, data.walletAddress);
    saveToFile(data);
    const message = formatMessage(data);
    await sendToTelegram(message);
    res.json({ status: 'ok' });
});

// Health check
app.get('/', (req, res) => res.send('Tracking API is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
