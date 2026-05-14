// server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID   = process.env.CHAT_ID;
const PORT = process.env.PORT || 3000;

// Format message từ TradingView alert
function formatSignalMessage(data) {
  const { pair, action, entry, sl, tp1, tp2, rr, grade, timeframe, note } = data;
  const emoji = action === 'BUY' ? '🟢' : '🔴';

  return `
${emoji} *${action} ${pair}*
━━━━━━━━━━━━━━━
📊 Timeframe: \`${timeframe}\`
🎯 Entry: \`${entry}\`
🛑 SL: \`${sl}\`
💰 TP1: \`${tp1}\`
💰 TP2: \`${tp2 || 'N/A'}\`
📐 R:R: \`${rr}\`
🏆 Grade: *${grade}*
━━━━━━━━━━━━━━━
📝 ${note || ''}
⏰ ${new Date().toISOString()}
  `.trim();
}

// Gửi tin nhắn Telegram
async function sendTelegram(message) {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message,
    parse_mode: 'Markdown'
  });
}

// Endpoint nhận alert từ TradingView
app.post('/webhook', async (req, res) => {
  try {
    const data = req.body;
    console.log('Signal received:', data);

    const message = formatSignalMessage(data);
    await sendTelegram(message);

    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'alive' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));